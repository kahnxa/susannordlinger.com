# Susan Nordlinger

Public gallery for Susan Nordlinger's paintings. The homepage hangs every painting on one salon wall; hover a work to enlarge it and show its title underneath. Open a painting for the full image, medium, size, and year.

## Submit a painting

The **Submit** page emails photographs to `heather@lvpo.com`. Heather forwards them so they can be added to the gallery.

The first submission asks Heather to confirm FormSubmit in her inbox. After that, new paintings arrive as ordinary emails with the photo attached.

## Add a painting

1. Put the image in `public/works/`.
2. Add an entry to `lib/works.ts` (`title`, `medium`, `dimensions`, `year`, `image`).
3. Or run `python3 scripts/import-works.py <source-dir>` to resize and print a `works` array.

HEIC files that Pillow cannot open can be decoded with `scripts/heic_to_jpeg.py`.

## Still outstanding

- Four Dropbox files never arrived (50 KB, 1.07 MB, 1.03 MB, 282 KB).
- `roses-and-reclining-figure` is two canvases in one photograph.
- Every title in `lib/works.ts` is a working title, not Susan's.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test
npm run build
```
