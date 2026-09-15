import assert from "node:assert/strict";
import test from "node:test";
import {
  ALLOWED_IMAGE_TYPES,
  buildIntakeEmail,
  MAX_ORIGINAL_BYTES,
  preparePaintingPhoto,
  validateSubmit,
} from "./submit.ts";

const goodPhoto = { type: "image/jpeg", size: 1_200_000 };

test("rejects a submit with no photo", () => {
  const issues = validateSubmit({}, null);
  assert.deepEqual(
    issues.map((issue) => issue.field),
    ["photo"],
  );
  assert.match(issues[0].message, /photo/i);
});

test("accepts a photo-only submission with no other fields", () => {
  assert.deepEqual(validateSubmit({}, goodPhoto), []);
});

test("accepts every allowed image type", () => {
  for (const type of ALLOWED_IMAGE_TYPES) {
    assert.deepEqual(validateSubmit({}, { type, size: 1_000 }), []);
  }
});

test("rejects a disallowed image type", () => {
  for (const type of ["image/gif", "application/pdf", "text/html", ""]) {
    const issues = validateSubmit({}, { type, size: 1_000 });
    assert.deepEqual(
      issues.map((issue) => issue.field),
      ["photo"],
      `expected ${type || "(empty)"} to be rejected`,
    );
    assert.match(issues[0].message, /JPEG, PNG, or WebP/);
  }
});

test("rejects a photo over the size limit but accepts one at the limit", () => {
  const atLimit = validateSubmit({}, { type: "image/jpeg", size: MAX_ORIGINAL_BYTES });
  assert.deepEqual(atLimit, []);

  const overLimit = validateSubmit(
    {},
    { type: "image/jpeg", size: MAX_ORIGINAL_BYTES + 1 },
  );
  assert.deepEqual(
    overLimit.map((issue) => issue.field),
    ["photo"],
  );
  assert.match(overLimit[0].message, /25 MB/);
});

test("name, title, size, and the other detail fields are all optional", () => {
  const issues = validateSubmit(
    { name: "", email: "", phone: "", title: "", medium: "", dimensions: "", year: "", note: "" },
    goodPhoto,
  );
  assert.deepEqual(issues, []);
});

test("flags a malformed email when one is given", () => {
  for (const email of ["not-an-email", "a@b", "a b@c.com", "@example.com"]) {
    const issues = validateSubmit({ email }, goodPhoto);
    assert.deepEqual(
      issues.map((issue) => issue.field),
      ["email"],
      `expected ${email} to be flagged`,
    );
  }
});

test("accepts a well-formed email and ignores surrounding whitespace", () => {
  assert.deepEqual(validateSubmit({ email: "ada@example.com" }, goodPhoto), []);
  assert.deepEqual(validateSubmit({ email: "  ada@example.com  " }, goodPhoto), []);
});

test("whitespace-only email is treated as absent, not malformed", () => {
  assert.deepEqual(validateSubmit({ email: "   " }, goodPhoto), []);
});

test("reports both a bad email and a bad photo together", () => {
  const issues = validateSubmit(
    { email: "not-an-email" },
    { type: "image/gif", size: 1_000 },
  );
  assert.deepEqual(
    issues.map((issue) => issue.field).sort(),
    ["email", "photo"],
  );
});

test("accepts a complete jpeg submission", () => {
  const issues = validateSubmit(
    {
      name: "Ada",
      email: "ada@example.com",
      title: "Harbor Light",
      medium: "oil on canvas",
    },
    goodPhoto,
  );
  assert.equal(issues.length, 0);
});

test("intake email tells Heather to forward the painting", () => {
  const email = buildIntakeEmail({
    name: "Ada Cole",
    email: "ada@example.com",
    title: "Harbor Light",
    medium: "oil on linen",
    dimensions: "24 × 30 in",
    year: "2019",
  });
  assert.match(email.subject, /Harbor Light/);
  assert.match(email.text, /heather|forward|uploaded/i);
  assert.match(email.text, /Ada Cole/);
  assert.match(email.text, /oil on linen/);
});

test("intake email includes every provided field on its own line", () => {
  const email = buildIntakeEmail({
    name: "Ada Cole",
    email: "ada@example.com",
    phone: "555-0100",
    title: "Harbor Light",
    medium: "oil on linen",
    dimensions: "24 × 30 in",
    year: "2019",
    note: "Frame included.",
  });
  const lines = email.text.split("\n");
  assert.ok(lines.includes("From: Ada Cole"));
  assert.ok(lines.includes("Email: ada@example.com"));
  assert.ok(lines.includes("Phone: 555-0100"));
  assert.ok(lines.includes("Title: Harbor Light"));
  assert.ok(lines.includes("Medium: oil on linen"));
  assert.ok(lines.includes("Dimensions: 24 × 30 in"));
  assert.ok(lines.includes("Year: 2019"));
  assert.ok(lines.includes("Note: Frame included."));
});

test("intake email omits blank and whitespace-only fields", () => {
  const email = buildIntakeEmail({
    name: "Ada",
    email: "",
    phone: "   ",
    title: "Harbor Light",
  });
  assert.doesNotMatch(email.text, /Email:/);
  assert.doesNotMatch(email.text, /Phone:/);
  assert.doesNotMatch(email.text, /Medium:/);
  assert.doesNotMatch(email.text, /Dimensions:/);
  assert.doesNotMatch(email.text, /Year:/);
  assert.doesNotMatch(email.text, /Note:/);
});

test("intake email trims whitespace from field values", () => {
  const email = buildIntakeEmail({
    name: "  Ada Cole  ",
    title: "  Harbor Light  ",
  });
  assert.equal(email.subject, "New painting for the website: Harbor Light");
  assert.ok(email.text.split("\n").includes("From: Ada Cole"));
});

test("intake email works with no fields at all and falls back on the subject", () => {
  const email = buildIntakeEmail({});
  assert.equal(email.subject, "New painting for the website");
  assert.match(email.text, /submitted for susannordlinger\.com/);
  assert.doesNotMatch(email.text, /From:|Email:|Title:/);
});

test("preparePaintingPhoto returns the original file when createImageBitmap is unavailable", async () => {
  assert.equal(typeof createImageBitmap, "undefined");
  const file = new File(["fake-bytes"], "painting.png", { type: "image/png" });
  const prepared = await preparePaintingPhoto(file);
  assert.equal(prepared, file);
});
