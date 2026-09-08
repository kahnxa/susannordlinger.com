import assert from "node:assert/strict";
import test from "node:test";
import { GALLERY_HOVER_SCALE, galleryLabel } from "./galleryCanvas.ts";

test("hover scale enlarges a painting without swallowing the wall", () => {
  assert.equal(GALLERY_HOVER_SCALE, 1.22);
  assert.ok(GALLERY_HOVER_SCALE > 1);
  assert.ok(GALLERY_HOVER_SCALE < 1.5);
});

test("label is the title, with year when known", () => {
  assert.equal(
    galleryLabel({ title: "Reading on the Lawn", year: "1991" }),
    "Reading on the Lawn, 1991",
  );
  assert.equal(
    galleryLabel({ title: "Yellow Field", year: "—" }),
    "Yellow Field",
  );
});
