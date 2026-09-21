import assert from "node:assert/strict";
import test from "node:test";

import {
  detectImageFormat,
  stripLocationMetadata,
} from "../functions/lib/images.ts";

function bytes(...parts) {
  return Uint8Array.from(parts.flat());
}

function contains(haystack, needle) {
  outer: for (let i = 0; i <= haystack.length - needle.length; i += 1) {
    for (let j = 0; j < needle.length; j += 1) {
      if (haystack[i + j] !== needle[j]) continue outer;
    }
    return true;
  }
  return false;
}

const SOI = [0xff, 0xd8];
const EOI = [0xff, 0xd9];

function jpegApp0() {
  return [0xff, 0xe0, 0x00, 0x04, 0x00, 0x00];
}

function jpegApp1() {
  return [0xff, 0xe1, 0x00, 0x06, 0x45, 0x58, 0x49, 0x46];
}

function jpegScan() {
  return [0xff, 0xda, 0x00, 0x02, 0x01, 0x02, 0x03];
}

function pngSignature() {
  return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
}

function pngChunk(type, data) {
  const length = data.length;
  return [
    (length >>> 24) & 255,
    (length >>> 16) & 255,
    (length >>> 8) & 255,
    length & 255,
    ...[...type].map((character) => character.charCodeAt(0)),
    ...data,
    0,
    0,
    0,
    0,
  ];
}

test("recognises the formats we accept and nothing else", () => {
  assert.equal(detectImageFormat(bytes(SOI, EOI)), "jpeg");
  assert.equal(detectImageFormat(bytes(pngSignature())), "png");
  assert.equal(detectImageFormat(new TextEncoder().encode("<html>")), null);
  assert.equal(
    detectImageFormat(bytes([0xff, 0xd8])),
    null,
    "a lone start-of-image marker is a truncated file, not a JPEG",
  );
  assert.equal(detectImageFormat(bytes([0x89, 0x50])), null);
});

test("drops the JPEG segment that carries location data", () => {
  const original = bytes(SOI, jpegApp0(), jpegApp1(), jpegScan(), EOI);
  const stripped = stripLocationMetadata(original, "jpeg");

  assert.equal(contains(stripped, jpegApp1()), false);
  assert.equal(contains(stripped, jpegApp0()), true);
  assert.equal(contains(stripped, jpegScan()), true);
  assert.deepEqual([...stripped.subarray(0, 2)], SOI);
  assert.deepEqual([...stripped.subarray(-2)], EOI);
  assert.equal(stripped.length, original.length - jpegApp1().length);
});

test("leaves an already-clean JPEG alone", () => {
  const original = bytes(SOI, jpegApp0(), jpegScan(), EOI);

  assert.deepEqual([...stripLocationMetadata(original, "jpeg")], [...original]);
});

test("drops the PNG chunk that carries location data but keeps the rest", () => {
  const ihdr = pngChunk("IHDR", [1, 2, 3, 4]);
  const exif = pngChunk("eXIf", [9, 9, 9]);
  const text = pngChunk("tEXt", [65, 66]);
  const iend = pngChunk("IEND", []);
  const original = bytes(pngSignature(), ihdr, exif, text, iend);
  const stripped = stripLocationMetadata(original, "png");

  assert.equal(contains(stripped, exif), false);
  assert.equal(contains(stripped, ihdr), true);
  assert.equal(contains(stripped, text), true);
  assert.equal(contains(stripped, iend), true);
  assert.equal(stripped.length, original.length - exif.length);
});

test("keeps the PNG signature intact", () => {
  const original = bytes(pngSignature(), pngChunk("IHDR", [1]), pngChunk("IEND", []));
  const stripped = stripLocationMetadata(original, "png");

  assert.deepEqual([...stripped.subarray(0, 8)], pngSignature());
});
