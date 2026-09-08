#!/usr/bin/env python3
"""Import painting photos into the site.

Usage:
    python3 scripts/import-works.py <source-dir> [--csv meta.csv] [--max 2000]

Reads every image in <source-dir>, auto-orients it from EXIF, resizes the long
edge down to --max, writes a progressive JPEG into public/works/, and prints a
ready-to-paste `works` array for lib/works.ts.

Optional meta.csv columns: file,title,medium,dimensions,year
Any painting missing a row falls back to "Untitled N" with blank fields.
"""
import csv, os, re, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "works"
EXTS = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".tif", ".tiff", ".webp"}
ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII",
         "XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV"]

def slugify(s, fallback):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return s or fallback

def load(path):
    """Open an image, decoding HEIC through an external tool if Pillow can't."""
    try:
        return ImageOps.exif_transpose(Image.open(path))
    except Exception:
        tmp = Path(tempfile.mkdtemp()) / "x.png"
        for cmd in (["convert", str(path), str(tmp)],
                    ["heif-convert", str(path), str(tmp)],
                    ["ffmpeg", "-y", "-i", str(path), str(tmp)]):
            try:
                subprocess.run(cmd, check=True, capture_output=True)
                return ImageOps.exif_transpose(Image.open(tmp))
            except Exception:
                continue
        raise SystemExit(f"could not decode {path.name} — no working HEIC decoder")

def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    src = Path(sys.argv[1])
    maxpx = int(sys.argv[sys.argv.index("--max") + 1]) if "--max" in sys.argv else 2000
    meta = {}
    if "--csv" in sys.argv:
        with open(sys.argv[sys.argv.index("--csv") + 1], newline="") as f:
            for row in csv.DictReader(f):
                meta[row["file"].strip()] = row

    files = sorted(p for p in src.rglob("*") if p.suffix.lower() in EXTS)
    if not files:
        raise SystemExit(f"no images found in {src}")
    OUT.mkdir(parents=True, exist_ok=True)

    entries = []
    for i, path in enumerate(files, 1):
        row = meta.get(path.name, {})
        title = (row.get("title") or "").strip() or f"Untitled {ROMAN[i-1] if i <= len(ROMAN) else i}"
        slug = slugify(title, f"work-{i:02d}")
        img = load(path)
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        img.thumbnail((maxpx, maxpx), Image.LANCZOS)
        dest = OUT / f"{slug}.jpg"
        img.save(dest, "JPEG", quality=82, optimize=True, progressive=True)
        w, h = img.size
        entries.append({
            "slug": slug, "title": title,
            "medium": (row.get("medium") or "").strip(),
            "dimensions": (row.get("dimensions") or "").strip() or "—",
            "year": (row.get("year") or "").strip() or "—",
            "image": f"/works/{slug}.jpg", "width": w, "height": h,
        })
        print(f"  {path.name}  ->  {dest.name}  ({w}x{h}, {dest.stat().st_size//1024} KB)",
              file=sys.stderr)

    print("\nexport const works: Work[] = [")
    for e in entries:
        print("  {")
        for k in ("slug", "title", "medium", "dimensions", "year", "image"):
            print(f'    {k}: "{e[k]}",')
        print(f'    width: {e["width"]},')
        print(f'    height: {e["height"]},')
        print("  },")
    print("];")

if __name__ == "__main__":
    main()
