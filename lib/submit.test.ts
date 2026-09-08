import assert from "node:assert/strict";
import test from "node:test";
import { buildIntakeEmail, validateSubmit } from "./submit.ts";

test("rejects a submit with no photo or title", () => {
  const issues = validateSubmit(
    { name: "Ada", email: "ada@example.com", title: "" },
    null,
  );
  assert.deepEqual(
    issues.map((issue) => issue.field).sort(),
    ["photo", "title"],
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
    { type: "image/jpeg", size: 1_200_000 },
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
