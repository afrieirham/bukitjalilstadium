import assert from "node:assert/strict";
import test from "node:test";

import { withinRateLimit } from "../functions/lib/rate-limit.ts";

function fakeStore(initial = {}) {
  const values = new Map(Object.entries(initial));
  const expiries = [];

  return {
    values,
    expiries,
    async get(key) {
      return values.get(key) ?? null;
    },
    async put(key, value, options) {
      values.set(key, value);
      expiries.push(options?.expirationTtl);
    },
  };
}

const options = { limit: 3, windowSeconds: 3600 };

test("allows up to the limit and then refuses", async () => {
  const store = fakeStore();

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    assert.equal(await withinRateLimit(store, "1.2.3.4", options), true, `attempt ${attempt}`);
  }
  assert.equal(await withinRateLimit(store, "1.2.3.4", options), false);
});

test("counts each source separately", async () => {
  const store = fakeStore();

  await withinRateLimit(store, "1.2.3.4", options);
  await withinRateLimit(store, "1.2.3.4", options);
  await withinRateLimit(store, "1.2.3.4", options);

  assert.equal(await withinRateLimit(store, "1.2.3.4", options), false);
  assert.equal(await withinRateLimit(store, "5.6.7.8", options), true);
});

test("starts again in the next window", async () => {
  const store = fakeStore();
  const start = 1_700_000_000_000;

  assert.equal(await withinRateLimit(store, "1.2.3.4", { ...options, now: start }), true);
  assert.equal(await withinRateLimit(store, "1.2.3.4", { ...options, now: start }), true);
  assert.equal(await withinRateLimit(store, "1.2.3.4", { ...options, now: start }), true);
  assert.equal(await withinRateLimit(store, "1.2.3.4", { ...options, now: start }), false);
  assert.equal(
    await withinRateLimit(store, "1.2.3.4", { ...options, now: start + 3_600_000 }),
    true,
  );
});

test("lets counters expire rather than holding them forever", async () => {
  const store = fakeStore();

  await withinRateLimit(store, "1.2.3.4", options);

  assert.deepEqual(store.expiries, [7200]);
});
