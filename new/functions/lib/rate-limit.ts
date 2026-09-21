export interface CounterStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

export interface RateLimitOptions {
  limit: number;
  windowSeconds: number;
  now?: number;
}

/**
 * A coarse fixed-window counter. Counters live in a shared store because each
 * request may run in a different isolate, and the store is eventually
 * consistent, so the limit is a speed bump rather than an exact quota. The bot
 * challenge is what keeps automated submissions out; this keeps a determined
 * human from filling the queue.
 */
export async function withinRateLimit(
  store: CounterStore,
  source: string,
  { limit, windowSeconds, now = Date.now() }: RateLimitOptions,
): Promise<boolean> {
  const window = Math.floor(now / (windowSeconds * 1000));
  const key = `rate:${source}:${window}`;
  const used = Number((await store.get(key)) ?? "0");

  if (used >= limit) return false;

  await store.put(key, String(used + 1), {
    expirationTtl: windowSeconds * 2,
  });

  return true;
}
