export type Work = {
  slug: string;
  title: string;
  medium: string;
  dimensions: string;
  year: string;
  image: string;
  width: number;
  height: number;
  note?: string;
  placeholder?: boolean;
};

/** Titles were assigned from the photographs. Replace with Susan's names when known. */
export const titlesAreWorkingTitles = true;

export const works: Work[] = [
  {
    slug: "reading-on-the-lawn",
    title: "Reading on the Lawn",
    medium: "oil on canvas",
    dimensions: "—",
    year: "1991",
    image: "/works/reading-on-the-lawn.jpg",
    width: 722,
    height: 1088,
  },
  {
    slug: "green-room-with-two-children",
    title: "Green Room with Two Children",
    medium: "oil on canvas",
    dimensions: "—",
    year: "—",
    image: "/works/green-room-with-two-children.jpg",
    width: 2000,
    height: 1456,
  },
  {
    slug: "woman-in-the-blue-chair",
    title: "Woman in the Blue Chair",
    medium: "oil on canvas",
    dimensions: "—",
    year: "—",
    image: "/works/woman-in-the-blue-chair.jpg",
    width: 766,
    height: 1026,
  },
  {
    slug: "yellow-field",
    title: "Yellow Field",
    medium: "oil on canvas",
    dimensions: "—",
    year: "—",
    image: "/works/yellow-field.jpg",
    width: 1774,
    height: 1772,
  },
  {
    slug: "red-house-two-pines",
    title: "Red House Two Pines",
    medium: "oil on canvas",
    dimensions: "—",
    year: "—",
    image: "/works/red-house-two-pines.jpg",
    width: 1763,
    height: 1782,
  },
  {
    slug: "boathouse-with-white-dog",
    title: "Boathouse with White Dog",
    medium: "oil on canvas",
    dimensions: "—",
    year: "—",
    image: "/works/boathouse-with-white-dog.jpg",
    width: 900,
    height: 871,
  },
  {
    slug: "barn-above-the-falls",
    title: "Barn Above the Falls",
    medium: "oil on canvas",
    dimensions: "—",
    year: "—",
    image: "/works/barn-above-the-falls.jpg",
    width: 1593,
    height: 1972,
  },
  {
    slug: "ludington-dunes",
    title: "Ludington Dunes",
    medium: "oil on canvas",
    dimensions: "—",
    year: "1997",
    image: "/works/ludington-dunes.jpg",
    width: 794,
    height: 990,
  },
  {
    slug: "roses-and-reclining-figure",
    title: "Roses and Reclining Figure",
    medium: "oil on canvas",
    dimensions: "—",
    year: "—",
    image: "/works/roses-and-reclining-figure.jpg",
    width: 572,
    height: 302,
    note: "Two canvases in one photograph — not yet split.",
  },
  {
    slug: "bait-and-tackle",
    title: "Bait and Tackle",
    medium: "oil on canvas",
    dimensions: "—",
    year: "—",
    image: "/works/bait-and-tackle.jpg",
    width: 996,
    height: 788,
  },
  {
    slug: "pink-house-on-the-point",
    title: "Pink House on the Point",
    medium: "oil on canvas",
    dimensions: "—",
    year: "—",
    image: "/works/pink-house-on-the-point.jpg",
    width: 534,
    height: 359,
  },
  {
    slug: "under-the-maple",
    title: "Under the Maple",
    medium: "oil on canvas",
    dimensions: "—",
    year: "1995",
    image: "/works/under-the-maple.jpg",
    width: 824,
    height: 954,
  },
  {
    slug: "crossing-the-red-field",
    title: "Crossing the Red Field",
    medium: "oil on canvas",
    dimensions: "—",
    year: "—",
    image: "/works/crossing-the-red-field.jpg",
    width: 1958,
    height: 1604,
  },
  {
    slug: "the-workshop",
    title: "The Workshop",
    medium: "oil on canvas",
    dimensions: "—",
    year: "—",
    image: "/works/the-workshop.jpg",
    width: 506,
    height: 360,
  },
  {
    slug: "still-life-with-pears-and-red-chair",
    title: "Still Life with Pears and Red Chair",
    medium: "oil on canvas",
    dimensions: "—",
    year: "—",
    image: "/works/still-life-with-pears-and-red-chair.jpg",
    width: 768,
    height: 596,
  },
];

export function getWork(slug: string) {
  return works.find((work) => work.slug === slug);
}

export function getAdjacentWorks(slug: string) {
  const index = works.findIndex((work) => work.slug === slug);
  if (index < 0) return { prev: null, next: null };
  return {
    prev: works[index - 1] ?? null,
    next: works[index + 1] ?? null,
  };
}

export function workCaption(work: Work) {
  return [work.medium, work.dimensions, work.year]
    .filter((part) => part && part !== "—")
    .join("  ·  ");
}
