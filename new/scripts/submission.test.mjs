import assert from "node:assert/strict";
import test from "node:test";

import {
  buildContributionFiles,
  validateSubmission,
} from "../app/lib/submission.ts";

const KEY_A = "pending/11111111-1111-4111-8111-111111111111.jpg";
const KEY_B = "pending/22222222-2222-4222-8222-222222222222.png";

function draft(overrides = {}) {
  return {
    section: "201A/B",
    photos: [KEY_A],
    date: "",
    caption: "",
    row: "",
    seat: "",
    contributorName: "",
    contributorHref: "",
    ...overrides,
  };
}

const SECTIONS = ["101", "131A", "201A/B", "318A/B", "334"];

function errorsFor(overrides) {
  return validateSubmission(draft(overrides), SECTIONS).errors;
}

test("accepts a submission with only the required fields", () => {
  const { errors, submission } = validateSubmission(draft(), SECTIONS);

  assert.deepEqual(errors, {});
  assert.deepEqual(submission, {
    section: "201A/B",
    photos: [KEY_A],
    date: null,
    caption: null,
    row: null,
    seat: null,
    contributor: null,
  });
});

test("requires a Section that exists on the map", () => {
  assert.match(errorsFor({ section: "" }).section, /Choose the Section/);
  assert.match(errorsFor({ section: "not a section" }).section, /not a Section/);
  assert.match(errorsFor({ section: "999" }).section, /not a Section/);
});

test("accepts every shape of Section id the map uses", () => {
  for (const section of ["101", "131A", "201A/B", "318A/B", "334"]) {
    assert.deepEqual(errorsFor({ section }).section, undefined, section);
  }
});

test("requires between one and six photos", () => {
  assert.match(errorsFor({ photos: [] }).photos, /at least one/);
  assert.match(
    errorsFor({ photos: [KEY_A, KEY_B, KEY_A, KEY_B, KEY_A, KEY_B, KEY_A] }).photos,
    /at most 6/,
  );
});

test("rejects a photo key that did not come from an upload", () => {
  assert.match(errorsFor({ photos: ["../../etc/passwd"] }).photos, /did not upload/);
  assert.match(errorsFor({ photos: ["seats/C-104-1.jpg"] }).photos, /did not upload/);
});

test("rejects a date that is not a plain calendar date", () => {
  assert.match(errorsFor({ date: "29/08/2026" }).date, /Use a date/);
  assert.deepEqual(errorsFor({ date: "2026-08-29" }).date, undefined);
});

test("rejects a contributor link that is not a web address", () => {
  assert.match(errorsFor({ contributorHref: "javascript:alert(1)" }).contributorHref, /web address/);
  assert.match(errorsFor({ contributorHref: "not a url" }).contributorHref, /web address/);
  assert.deepEqual(
    errorsFor({ contributorHref: "https://example.com/me" }).contributorHref,
    undefined,
  );
});

test("keeps the optional details when they are given", () => {
  const { submission } = validateSubmission(
    draft({
      date: "2026-08-29",
      caption: "  Side stage view  ",
      row: "12",
      seat: "8",
      contributorName: "  Emily Yeo ",
      contributorHref: "https://example.com/me",
    }),
    SECTIONS,
  );

  assert.deepEqual(submission, {
    section: "201A/B",
    photos: [KEY_A],
    date: "2026-08-29",
    caption: "Side stage view",
    row: "12",
    seat: "8",
    contributor: { name: "Emily Yeo", href: "https://example.com/me" },
  });
});

test("a blank contributor becomes nobody rather than an empty person", () => {
  const { submission } = validateSubmission(draft({ contributorName: "   " }), SECTIONS);

  assert.equal(submission?.contributor, null);
});

test("reports every problem at once", () => {
  const errors = errorsFor({ section: "", photos: [], date: "nope" });

  assert.deepEqual(Object.keys(errors).sort(), ["date", "photos", "section"]);
});

test("writes one contribution file per photo, in order", () => {
  const { submission } = validateSubmission(draft({ photos: [KEY_A, KEY_B] }), SECTIONS);
  const files = buildContributionFiles(submission, "c-abc123");

  assert.deepEqual(
    files.map((file) => file.path),
    [
      "new/data/contributions/c-abc123/photo-1.json",
      "new/data/contributions/c-abc123/photo-2.json",
    ],
  );

  assert.deepEqual(JSON.parse(files[0].contents), {
    submissionId: "c-abc123",
    section: "201A/B",
    photo: KEY_A,
    date: null,
    caption: null,
    row: null,
    seat: null,
    contributor: null,
  });
});

test("field checks ignore photos so the browser can run them before upload", async () => {
  const { validateFields } = await import("../app/lib/submission.ts");

  assert.deepEqual(validateFields(draft({ photos: [] }), SECTIONS), {});
  assert.match(validateFields(draft({ photos: [], date: "nope" }), SECTIONS).date, /Use a date/);
});
