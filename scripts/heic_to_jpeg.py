#!/usr/bin/env python3
"""Convert HEIC/HEIF photos to JPEG without libheif.

A HEIC file is an ISOBMFF container holding HEVC-coded image items. Pillow can't
open one and ImageMagick here has no HEVC codec, but ffmpeg does have an HEVC
decoder -- it just can't read the container. So this script does the container
work itself: it parses the box structure, pulls each coded image item out as a
raw Annex-B HEVC bitstream (prepending the VPS/SPS/PPS from its hvcC property),
hands that to ffmpeg, and reassembles tiled ('grid') images into one picture.

Usage:
    python3 scripts/heic_to_jpeg.py IN.heic [IN2.heic ...] --out-dir DIR
"""
import argparse
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageOps

CONTAINERS = {b"meta", b"iprp", b"ipco", b"iinf", b"moov", b"trak", b"mdia", b"minf", b"stbl"}
FULLBOX = {b"meta"}  # only meta needs its version/flags skipped during path walking


def parse_boxes(data, start=0, end=None):
    """Yield (type, payload_start, payload_end) for boxes in data[start:end]."""
    end = len(data) if end is None else end
    pos = start
    while pos + 8 <= end:
        size = struct.unpack(">I", data[pos:pos + 4])[0]
        btype = data[pos + 4:pos + 8]
        header = 8
        if size == 1:
            size = struct.unpack(">Q", data[pos + 8:pos + 16])[0]
            header = 16
        elif size == 0:
            size = end - pos
        if size < header:
            break
        yield btype, pos + header, pos + size
        pos += size


def find_box(data, path, start=0, end=None):
    """Walk a slash-separated box path, e.g. 'meta/iprp/ipco'."""
    end = len(data) if end is None else end
    want, rest = path[0], path[1:]
    for btype, s, e in parse_boxes(data, start, end):
        if btype == want:
            if btype in FULLBOX:
                s += 4
            return (s, e) if not rest else find_box(data, rest, s, e)
    return None


class Reader:
    def __init__(self, data, pos=0):
        self.d, self.p = data, pos

    def u8(self):
        v = self.d[self.p]; self.p += 1; return v

    def u16(self):
        v = struct.unpack(">H", self.d[self.p:self.p + 2])[0]; self.p += 2; return v

    def u32(self):
        v = struct.unpack(">I", self.d[self.p:self.p + 4])[0]; self.p += 4; return v

    def uint(self, nbytes):
        if nbytes == 0:
            return 0
        v = int.from_bytes(self.d[self.p:self.p + nbytes], "big"); self.p += nbytes; return v


def parse_iloc(data, s, e):
    """item_id -> (construction_method, [(offset, length), ...])"""
    r = Reader(data, s)
    version = r.u8(); r.p += 3  # flags
    b = r.u8()
    offset_size, length_size = b >> 4, b & 0xF
    b = r.u8()
    base_offset_size, index_size = b >> 4, b & 0xF
    count = r.u32() if version == 2 else r.u16()
    items = {}
    for _ in range(count):
        item_id = r.u32() if version == 2 else r.u16()
        method = 0
        if version in (1, 2):
            method = r.u16() & 0xF
        r.u16()  # data_reference_index
        base = r.uint(base_offset_size)
        extents = []
        for _ in range(r.u16()):
            if version in (1, 2) and index_size:
                r.uint(index_size)
            off = r.uint(offset_size)
            ln = r.uint(length_size)
            extents.append((base + off, ln))
        items[item_id] = (method, extents)
        if r.p > e:
            break
    return items


def parse_iinf(data, s, e):
    """item_id -> item_type (b'hvc1', b'grid', ...)"""
    r = Reader(data, s)
    version = r.u8(); r.p += 3
    r.u32() if version >= 1 else r.u16()
    types = {}
    for btype, bs, be in parse_boxes(data, r.p, e):
        if btype != b"infe":
            continue
        rr = Reader(data, bs)
        v = rr.u8(); rr.p += 3
        if v >= 2:
            item_id = rr.u32() if v == 3 else rr.u16()
            rr.u16()  # protection index
            types[item_id] = data[rr.p:rr.p + 4]
    return types


def parse_ipma(data, s, e):
    """item_id -> [property_index, ...] (1-based into ipco)"""
    r = Reader(data, s)
    version = r.u8()
    flags = int.from_bytes(data[r.p:r.p + 3], "big"); r.p += 3
    out = {}
    for _ in range(r.u32()):
        item_id = r.u32() if version >= 1 else r.u16()
        props = []
        for _ in range(r.u8()):
            if flags & 1:
                props.append(r.u16() & 0x7FFF)
            else:
                props.append(r.u8() & 0x7F)
        out[item_id] = props
    return out


def parse_iref(data, s, e):
    """(from_item, ref_type) -> [to_item, ...]"""
    r = Reader(data, s)
    version = r.u8(); r.p += 3
    out = {}
    for btype, bs, be in parse_boxes(data, r.p, e):
        rr = Reader(data, bs)
        frm = rr.u32() if version >= 1 else rr.u16()
        tos = [rr.u32() if version >= 1 else rr.u16() for _ in range(rr.u16())]
        out[(frm, btype)] = tos
    return out


def hvcc_to_annexb(hvcc):
    """Return (parameter_set_bytes, nal_length_size) from an hvcC property."""
    length_size = (hvcc[21] & 0x3) + 1
    r = Reader(hvcc, 22)
    out = b""
    for _ in range(r.u8()):
        r.u8()  # array_completeness | NAL unit type
        for _ in range(r.u16()):
            n = r.u16()
            out += b"\x00\x00\x00\x01" + hvcc[r.p:r.p + n]
            r.p += n
    return out, length_size


def item_bytes(data, iloc_entry, idat):
    method, extents = iloc_entry
    src = idat if method == 1 else data
    return b"".join(src[o:o + n] for o, n in extents)


def decode_item(data, item_id, iloc, idat, props_for_item, ipco_props, workdir, index):
    hvcc = None
    for i in props_for_item.get(item_id, []):
        if 1 <= i <= len(ipco_props) and ipco_props[i - 1][0] == b"hvcC":
            hvcc = ipco_props[i - 1][1]
    if hvcc is None:
        raise SystemExit(f"item {item_id}: no hvcC property found")
    params, length_size = hvcc_to_annexb(hvcc)

    payload = item_bytes(data, iloc[item_id], idat)
    stream, p = params, 0
    while p + length_size <= len(payload):
        n = int.from_bytes(payload[p:p + length_size], "big")
        p += length_size
        stream += b"\x00\x00\x00\x01" + payload[p:p + n]
        p += n

    raw = workdir / f"tile{index:03d}.hevc"
    png = workdir / f"tile{index:03d}.png"
    raw.write_bytes(stream)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "hevc", "-i", str(raw), str(png)],
                   check=True, capture_output=True)
    return Image.open(png).copy()


def convert(path, out_dir, quality=92):
    data = Path(path).read_bytes()

    meta = find_box(data, [b"meta"])
    if not meta:
        raise SystemExit(f"{path}: no meta box -- not a HEIF file")
    ms, me = meta

    pitm = find_box(data, [b"pitm"], ms, me)
    primary = struct.unpack(">H", data[pitm[0] + 4:pitm[0] + 6])[0] if pitm else None

    iloc = parse_iloc(*(( data,) + find_box(data, [b"iloc"], ms, me)))
    types = parse_iinf(*((data,) + find_box(data, [b"iinf"], ms, me)))
    ipma_box = find_box(data, [b"iprp", b"ipma"], ms, me)
    ipma = parse_ipma(data, *ipma_box)
    ipco_box = find_box(data, [b"iprp", b"ipco"], ms, me)
    ipco_props = [(t, data[s:e]) for t, s, e in parse_boxes(data, *ipco_box)]
    iref_box = find_box(data, [b"iref"], ms, me)
    iref = parse_iref(data, *iref_box) if iref_box else {}
    idat_box = find_box(data, [b"idat"], ms, me)
    idat = data[idat_box[0]:idat_box[1]] if idat_box else b""

    with tempfile.TemporaryDirectory() as td:
        work = Path(td)
        if types.get(primary) == b"grid":
            g = item_bytes(data, iloc[primary], idat)
            rows, cols = g[2] + 1, g[3] + 1
            wide = bool(g[1] & 1)
            if wide:
                out_w, out_h = struct.unpack(">II", g[4:12])
            else:
                out_w, out_h = struct.unpack(">HH", g[4:8])
            tiles = iref.get((primary, b"dimg"), [])
            if len(tiles) != rows * cols:
                raise SystemExit(f"{path}: grid says {rows}x{cols} but {len(tiles)} tiles listed")
            imgs = [decode_item(data, t, iloc, idat, ipma, ipco_props, work, i)
                    for i, t in enumerate(tiles)]
            tw, th = imgs[0].size
            canvas = Image.new("RGB", (cols * tw, rows * th))
            for i, im in enumerate(imgs):
                canvas.paste(im, ((i % cols) * tw, (i // cols) * th))
            img = canvas.crop((0, 0, out_w, out_h))
            detail = f"{rows}x{cols} grid of {tw}x{th} tiles"
        else:
            img = decode_item(data, primary, iloc, idat, ipma, ipco_props, work, 0)
            detail = "single item"

    # HEIF records rotation in an irot property, not in EXIF: angle is
    # (value & 3) * 90 degrees counter-clockwise.
    for i in ipma.get(primary, []):
        if 1 <= i <= len(ipco_props) and ipco_props[i - 1][0] == b"irot":
            angle = (ipco_props[i - 1][1][0] & 0x3) * 90
            if angle:
                img = img.rotate(angle, expand=True)
                detail += f", rotated {angle} deg"

    img = ImageOps.exif_transpose(img).convert("RGB")
    dest = Path(out_dir) / (Path(path).stem + ".jpg")
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)
    print(f"{Path(path).name}  ->  {dest.name}  ({img.width}x{img.height}, {detail})")
    return dest


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("files", nargs="+")
    ap.add_argument("--out-dir", default=".")
    ap.add_argument("--quality", type=int, default=92)
    a = ap.parse_args()
    for f in a.files:
        convert(f, a.out_dir, a.quality)
