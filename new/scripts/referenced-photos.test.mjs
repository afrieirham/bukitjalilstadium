import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  collectReferencedPhotos,
  generateReferencedPhotos,
} from "./generate-referenced-photos.mjs";

function contribution(submissionId, photo) {
  return {
    submissionId,
    section: "104",
    photo,
    date: null,
    caption: null,
    row: null,
    seat: null,
    contributor: null,
  };
}

test("collects every photo a set of Contributions references", () => {
  const photos = collectReferencedPhotos([
    contribution("a", "seats/a.jpg"),
    contribution("b", "pending/b.jpg"),
  ]);

  assert.deepEqual(photos.sort(), ["pending/b.jpg", "seats/a.jpg"]);
});

test("a photo referenced twice is listed once", () => {
  const photos = collectReferencedPhotos([
    contribution("a", "seats/a.jpg"),
    contribution("b", "seats/a.jpg"),
  ]);

  assert.deepEqual(photos, ["seats/a.jpg"]);
});

test("nothing referenced means nothing protected", () => {
  assert.deepEqual(collectReferencedPhotos([]), []);
});

test("writes a manifest from the committed contributions", () => {
  const root = mkdtempSync(path.join(tmpdir(), "referenced-photos-"));
  const dataRoot = path.join(root, "data/contributions");
  const outFile = path.join(root, "build/referenced-photos.json");

  for (const [submissionId, photo] of [
    ["c-one", "pending/one.jpg"],
    ["c-two", "pending/two.jpg"],
  ]) {
    mkdirSync(path.join(dataRoot, submissionId), { recursive: true });
    writeFileSync(
      path.join(dataRoot, submissionId, "photo-1.json"),
      JSON.stringify(contribution(submissionId, photo)),
    );
  }

  const count = generateReferencedPhotos({ dataRoot, outFile });

  assert.equal(count, 2);
  assert.deepEqual(JSON.parse(readFileSync(outFile, "utf8")).photos.sort(), [
    "pending/one.jpg",
    "pending/two.jpg",
  ]);

  rmSync(root, { recursive: true, force: true });
});

test("an empty contributions directory produces an empty manifest", () => {
  const root = mkdtempSync(path.join(tmpdir(), "referenced-photos-"));
  const outFile = path.join(root, "referenced-photos.json");

  const count = generateReferencedPhotos({
    dataRoot: path.join(root, "does-not-exist"),
    outFile,
  });

  assert.equal(count, 0);
  assert.deepEqual(JSON.parse(readFileSync(outFile, "utf8")), { photos: [] });

  rmSync(root, { recursive: true, force: true });
});
