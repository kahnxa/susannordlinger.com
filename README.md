# Susan Nordlinger

Public gallery for Susan Nordlinger's paintings. Each work is shown in the Format-style painting layout: large image, then title, medium, size, and year.

## Submit a painting

The **Submit** page emails photographs to `heather@lvpo.com`. Heather forwards them so they can be added to the gallery.

The first submission asks Heather to confirm FormSubmit in her inbox. After that, new paintings arrive as ordinary emails with the photo attached.

## Add a painting to the site

1. Put the image in `public/works/`.
2. Add an entry to `lib/works.ts` (`title`, `medium`, `dimensions`, `year`, `image`).
3. Remove the `placeholder: true` sample works once real paintings are in.

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
