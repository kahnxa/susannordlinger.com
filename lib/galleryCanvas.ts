import type { Work } from "./works";

/** How much a hovered painting grows on the salon wall. */
export const GALLERY_HOVER_SCALE = 1.22;

export function galleryLabel(work: Pick<Work, "title" | "year">) {
  if (work.year && work.year !== "—") {
    return `${work.title}, ${work.year}`;
  }
  return work.title;
}
