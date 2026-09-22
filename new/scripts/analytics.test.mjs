import assert from "node:assert/strict";
import test from "node:test";

import { shouldLoadAnalytics } from "../app/lib/analytics.ts";

test("loads on the live site", () => {
  assert.equal(shouldLoadAnalytics("bukitjalilstadium.com"), true);
  assert.equal(shouldLoadAnalytics("www.bukitjalilstadium.com"), true);
});

test("stays out of the preview deployments", () => {
  assert.equal(
    shouldLoadAnalytics("feat-analytics.bukitjalilstadium-1ms.pages.dev"),
    false,
  );
  assert.equal(shouldLoadAnalytics("bukitjalilstadium-1ms.pages.dev"), false);
});

test("stays out of local development", () => {
  assert.equal(shouldLoadAnalytics("localhost"), false);
  assert.equal(shouldLoadAnalytics("127.0.0.1"), false);
  assert.equal(shouldLoadAnalytics(""), false);
});

test("a lookalike host is not the live site", () => {
  assert.equal(shouldLoadAnalytics("bukitjalilstadium.com.evil.test"), false);
  assert.equal(shouldLoadAnalytics("notbukitjalilstadium.com"), false);
});
