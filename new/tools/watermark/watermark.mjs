/**
 * Publish-time watermarking for new Contribution photos (ADR 0005).
 *
 * Runs in CI, after a Contribution is merged, against the photos that push
 * added or changed. Each photo is copied into the private originals bucket,
 * then downloaded from R2, composited with the tiled wordmark, and written back
 * to the same key with a marker in its object metadata — so the URL and the
 * Contribution JSON do not change, a pristine master survives, and a re-run is
 * a no-op. Legacy `seats/*` photos are never touched; the plan module filters
 * them out.
 *
 * Usage: node watermark.mjs <file-list>   (one changed JSON path per line)
 *
 * Required environment: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
 * R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_ORIGINALS_BUCKET.
 */

import { readFileSync } from "node:fs";

import {
  CopyObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import sharp from "sharp";

import {
  photoKeysFromContributions,
  planWatermarks,
  WATERMARKED_METADATA_KEY,
  WATERMARKED_METADATA_VALUE,
  watermarkSvg,
} from "../../scripts/watermark-plan.mjs";

const JPEG_QUALITY = 90;
const IMMUTABLE = "public, max-age=31536000, immutable";

const fileList = process.argv[2] ?? process.env.CHANGED_FILES ?? "";
const changedFiles = readFileList(fileList);

if (changedFiles.length === 0) {
  console.log("watermark: no Contribution files changed, nothing to do");
  process.exit(0);
}

const contributions = changedFiles
  .map(parseJson)
  .filter((contribution) => contribution !== null);

const candidates = photoKeysFromContributions(contributions);
if (candidates.length === 0) {
  console.log("watermark: no new pending photos to watermark");
  process.exit(0);
}

const env = requireEnv();
const client = new S3Client({
  region: "auto",
  endpoint: `https://${env.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.accessKeyId,
    secretAccessKey: env.secretAccessKey,
  },
});

const alreadyDone = [];
for (const key of candidates) {
  if (await isWatermarked(key)) alreadyDone.push(key);
}

const todo = planWatermarks({ contributions, watermarked: alreadyDone });

if (alreadyDone.length > 0) {
  console.log(
    `watermark: ${alreadyDone.length} photo(s) already watermarked, skipped`,
  );
}

if (todo.length === 0) {
  console.log("watermark: nothing new to watermark");
  process.exit(0);
}

let failed = 0;
for (const key of todo) {
  try {
    await watermark(key);
    console.log(`watermark: ${key}`);
  } catch (error) {
    failed += 1;
    console.error(`watermark: failed on ${key}:`, error);
  }
}

console.log(`watermark: ${todo.length - failed}/${todo.length} done`);
if (failed > 0) process.exitCode = 1;

async function watermark(key) {
  // Archive the pristine copy first. If this fails, the photo is left untouched
  // rather than overwritten, so the original is never lost.
  await archive(key);

  const object = await client.send(
    new GetObjectCommand({ Bucket: env.bucket, Key: key }),
  );
  const bytes = Buffer.from(await object.Body.transformToByteArray());

  const image = sharp(bytes);
  const { width, height } = await image.metadata();

  const overlay = Buffer.from(watermarkSvg(width, height));
  const png = key.endsWith(".png");

  const output = await image
    .composite([{ input: overlay, top: 0, left: 0 }])
    .toFormat(png ? "png" : "jpeg", png ? {} : { quality: JPEG_QUALITY })
    .toBuffer();

  await client.send(
    new PutObjectCommand({
      Bucket: env.bucket,
      Key: key,
      Body: output,
      ContentType: png ? "image/png" : "image/jpeg",
      CacheControl: IMMUTABLE,
      Metadata: { [WATERMARKED_METADATA_KEY]: WATERMARKED_METADATA_VALUE },
    }),
  );
}

/**
 * Copies the unwatermarked object into the private originals bucket under the
 * same key, so a pristine master survives the in-place overwrite. R2 has no
 * object versioning, so this is how the original is kept. Skips the copy if the
 * master is already there, which keeps a re-run cheap.
 */
async function archive(key) {
  try {
    await client.send(
      new HeadObjectCommand({ Bucket: env.originalsBucket, Key: key }),
    );
    return;
  } catch (error) {
    if (error?.$metadata?.httpStatusCode !== 404) throw error;
  }

  await client.send(
    new CopyObjectCommand({
      Bucket: env.originalsBucket,
      Key: key,
      CopySource: `${env.bucket}/${key}`,
    }),
  );
}

async function isWatermarked(key) {
  try {
    const head = await client.send(
      new HeadObjectCommand({ Bucket: env.bucket, Key: key }),
    );
    return (
      head.Metadata?.[WATERMARKED_METADATA_KEY] === WATERMARKED_METADATA_VALUE
    );
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404) return false;
    throw error;
  }
}

function readFileList(path) {
  if (!path) return [];
  try {
    return readFileSync(path, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function parseJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    console.warn(`watermark: skipping ${path}: ${error.message}`);
    return null;
  }
}

function requireEnv() {
  const names = [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET",
    "R2_ORIGINALS_BUCKET",
  ];
  const missing = names.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    console.error(`watermark: missing ${missing.join(", ")}`);
    process.exit(1);
  }

  return {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET,
    originalsBucket: process.env.R2_ORIGINALS_BUCKET,
  };
}
