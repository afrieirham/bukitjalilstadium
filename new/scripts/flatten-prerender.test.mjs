import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { flattenPrerender } from "./flatten-prerender.mjs";

function fixture(tree) {
  const root = mkdtempSync(path.join(tmpdir(), "flatten-prerender-"));
  for (const [relative, contents] of Object.entries(tree)) {
    const file = path.join(root, relative);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, contents);
  }
  return root;
}

function read(root, relative) {
  return readFileSync(path.join(root, relative), "utf8");
}

test("keeps the home page and flattens every routed directory", () => {
  const root = fixture({
    "index.html": "<home>",
    "201A-B/index.html": "<section>",
    "201A-B.data": "{}",
    "404/index.html": "<not found>",
    "assets/app.js": "console.log(1)",
  });

  flattenPrerender(root);

  assert.equal(read(root, "index.html"), "<home>");
  assert.equal(read(root, "201A-B.html"), "<section>");
  assert.equal(read(root, "404.html"), "<not found>");
  assert.equal(read(root, "201A-B.data"), "{}");
  assert.equal(read(root, "assets/app.js"), "console.log(1)");
  assert.equal(existsSync(path.join(root, "201A-B")), false);
  assert.equal(existsSync(path.join(root, "404")), false);

  rmSync(root, { recursive: true, force: true });
});

test("keeps a parent directory that still holds a flattened nested route", () => {
  const root = fixture({
    "index.html": "<home>",
    "blog/index.html": "<blog>",
    "blog/post/index.html": "<post>",
  });

  flattenPrerender(root);

  assert.equal(read(root, "blog.html"), "<blog>");
  assert.equal(read(root, "blog/post.html"), "<post>");
  assert.equal(existsSync(path.join(root, "blog/index.html")), false);
  assert.equal(existsSync(path.join(root, "blog/post")), false);

  rmSync(root, { recursive: true, force: true });
});
