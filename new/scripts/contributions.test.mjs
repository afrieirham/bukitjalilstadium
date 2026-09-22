import assert from "node:assert/strict";
import test from "node:test";

import {
  collectReferencedPhotos,
  creditedContributors,
  photosBySection,
  populatedSections,
} from "../app/lib/contributions.ts";

function contribution(submissionId, section) {
  return {
    submissionId,
    section,
    photo: `seats/${submissionId}.jpg`,
    date: null,
    caption: null,
    row: null,
    seat: null,
    contributor: null,
  };
}

test("groups photos under the Section they were taken from", () => {
  const grouped = photosBySection([
    contribution("a", "104"),
    contribution("b", "101"),
    contribution("c", "104"),
  ]);

  assert.deepEqual([...grouped.keys()].sort(), ["101", "104"]);
  assert.equal(grouped.get("104")?.length, 2);
  assert.equal(grouped.get("101")?.length, 1);
});

test("a Section with no photos is simply absent, not present and empty", () => {
  const grouped = photosBySection([contribution("a", "104")]);

  assert.equal(grouped.has("999"), false);
  assert.deepEqual(grouped.get("999") ?? [], []);
});

test("populated Sections are the ones with at least one photo", () => {
  const populated = populatedSections([
    contribution("a", "104"),
    contribution("b", "104"),
    contribution("c", "301A/B"),
  ]);

  assert.deepEqual([...populated].sort(), ["104", "301A/B"]);
  assert.equal(populated.has("101"), false);
});

function credited(submissionId, section, name, href = null) {
  return {
    ...contribution(submissionId, section),
    contributor: { name, href },
  };
}

test("a Contributor with several Contributions is listed once", () => {
  const credits = creditedContributors([
    credited("a", "105", "Emily Yeo"),
    credited("b", "104", "Emily Yeo"),
  ]);

  assert.equal(credits.length, 1);
  assert.deepEqual(credits[0], {
    name: "Emily Yeo",
    href: null,
    sections: ["104", "105"],
  });
});

test("a Contributor keeps a link when they gave one", () => {
  const credits = creditedContributors([
    credited("a", "104", "@violetzero_94", "https://www.tiktok.com/@violetzero_94"),
    credited("b", "116", "Anon"),
  ]);
  const hrefs = Object.fromEntries(credits.map((credit) => [credit.name, credit.href]));

  assert.equal(hrefs["@violetzero_94"], "https://www.tiktok.com/@violetzero_94");
  assert.equal(hrefs.Anon, null);
});

test("Contributors are ordered by name and list Sections in map order", () => {
  const credits = creditedContributors([
    credited("a", "303", "Zed"),
    credited("b", "301A/B", "Ana"),
    credited("c", "104", "Zed"),
  ]);

  assert.deepEqual(
    credits.map((credit) => [credit.name, credit.sections]),
    [
      ["Ana", ["301A/B"]],
      ["Zed", ["104", "303"]],
    ],
  );
});

test("photos with no credited person add nobody", () => {
  const credits = creditedContributors([
    contribution("a", "104"),
    contribution("b", "105"),
  ]);

  assert.deepEqual(credits, []);
});

test("the same name with and without a link stays distinct", () => {
  const credits = creditedContributors([
    credited("a", "104", "Anon"),
    credited("b", "105", "Anon", "https://example.com/anon"),
  ]);

  assert.equal(credits.length, 2);
});

test("collects every photo a set of Contributions references", () => {
  const photos = collectReferencedPhotos([
    contribution("a", "104"),
    contribution("b", "104"),
    contribution("c", "301A/B"),
  ]);

  assert.deepEqual(photos.sort(), [
    "seats/a.jpg",
    "seats/b.jpg",
    "seats/c.jpg",
  ]);
});

test("a duplicate reference is listed once", () => {
  const first = contribution("a", "104");
  const photos = collectReferencedPhotos([first, { ...first }]);

  assert.deepEqual(photos, ["seats/a.jpg"]);
});

test("nothing referenced means nothing protected", () => {
  assert.deepEqual(collectReferencedPhotos([]), []);
});
