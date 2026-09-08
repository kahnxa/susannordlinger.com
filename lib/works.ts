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

export const works: Work[] = [
  {
    slug: "untitled-i",
    title: "Untitled I",
    medium: "oil on canvas",
    dimensions: "—",
    year: "—",
    image: "/works/untitled-i.svg",
    width: 1200,
    height: 1500,
    note: "Placeholder until the Dropbox archive is imported.",
    placeholder: true,
  },
  {
    slug: "untitled-ii",
    title: "Untitled II",
    medium: "oil on canvas",
    dimensions: "—",
    year: "—",
    image: "/works/untitled-ii.svg",
    width: 1500,
    height: 1200,
    note: "Placeholder until the Dropbox archive is imported.",
    placeholder: true,
  },
  {
    slug: "untitled-iii",
    title: "Untitled III",
    medium: "oil on canvas",
    dimensions: "—",
    year: "—",
    image: "/works/untitled-iii.svg",
    width: 1100,
    height: 1400,
    note: "Placeholder until the Dropbox archive is imported.",
    placeholder: true,
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
