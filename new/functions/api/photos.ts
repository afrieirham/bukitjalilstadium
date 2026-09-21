import { MAX_PHOTO_BYTES } from "../../app/lib/submission.ts";
import { detectImageFormat, stripLocationMetadata } from "../lib/images.ts";
import { withinRateLimit } from "../lib/rate-limit.ts";
import {
  json,
  missingConfiguration,
  type PagesContext,
} from "../lib/types.ts";
import { verifyTurnstile } from "../lib/turnstile.ts";

const UPLOADS_PER_HOUR = 20;

export const onRequestPost = async ({
  request,
  env,
}: PagesContext): Promise<Response> => {
  const unconfigured = missingConfiguration(env);
  if (unconfigured) return json({ error: unconfigured }, 503);

  const source = request.headers.get("cf-connecting-ip") ?? "unknown";

  if (
    !(await withinRateLimit(env.RATE_LIMIT, `upload:${source}`, {
      limit: UPLOADS_PER_HOUR,
      windowSeconds: 3600,
    }))
  ) {
    return json({ error: "Too many uploads from here. Try again later." }, 429);
  }

  const form = await request.formData();
  const token = String(form.get("turnstileToken") ?? "");

  // Verified before anything is written, so a failed challenge costs no storage.
  if (!(await verifyTurnstile(env.TURNSTILE_SECRET, token, source))) {
    return json(
      { error: "We could not confirm you are human. Reload the page and try again." },
      403,
    );
  }

  const photo = form.get("photo");
  if (!(photo instanceof File)) return json({ error: "No photo arrived." }, 400);
  if (photo.size === 0) return json({ error: "That photo is empty." }, 400);
  if (photo.size > MAX_PHOTO_BYTES) {
    return json({ error: "Photos must be under 10 MB each." }, 413);
  }

  const bytes = new Uint8Array(await photo.arrayBuffer());
  const format = detectImageFormat(bytes);
  if (!format) {
    return json({ error: "Photos must be JPEG or PNG images." }, 415);
  }

  const key = `pending/${crypto.randomUUID()}.${format === "jpeg" ? "jpg" : "png"}`;
  await env.BUCKET.put(key, stripLocationMetadata(bytes, format), {
    httpMetadata: {
      contentType: format === "jpeg" ? "image/jpeg" : "image/png",
    },
  });

  return json({ key });
};
