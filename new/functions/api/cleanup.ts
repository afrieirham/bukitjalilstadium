import {
  orphansToDelete,
  photosUnderReview,
  type PendingObject,
} from "../lib/orphans.ts";
import { json, type PagesContext } from "../lib/types.ts";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_OLDER_THAN_DAYS = 30;
const LIST_PAGE_SIZE = 1000;

/**
 * Deletes photos in the pending area that no published Contribution points at,
 * which is what a rejected Contribution leaves behind.
 *
 * Authenticated with the repository token rather than a secret of its own: it
 * already grants write access to the repository, which is strictly more than
 * this endpoint can do, so a second token would add a thing to rotate without
 * reducing the blast radius.
 *
 * Defaults to a dry run. Pass `{ "apply": true }` to actually delete.
 */
export const onRequestPost = async ({
  request,
  env,
}: PagesContext): Promise<Response> => {
  if (!env.BUCKET) return json({ error: "The photo bucket is not connected yet." }, 503);
  if (!env.GITHUB_TOKEN) return json({ error: "The review queue is not connected yet." }, 503);

  const authorization = request.headers.get("authorization") ?? "";
  if (!constantTimeEqual(authorization, `Bearer ${env.GITHUB_TOKEN}`)) {
    return json({ error: "Not allowed." }, 401);
  }

  const body = (await request.json().catch(() => ({}))) as {
    olderThanDays?: number;
    apply?: boolean;
  };
  const olderThanDays =
    typeof body.olderThanDays === "number" && body.olderThanDays >= 0
      ? body.olderThanDays
      : DEFAULT_OLDER_THAN_DAYS;

  const published = await readPublishedPhotos(request, env);
  if (!published) {
    return json(
      { error: "Could not read the published photo list from this deployment." },
      502,
    );
  }

  const underReview = await readOpenPullRequestPhotos(env);
  if (!underReview) {
    // Without the open pull requests we cannot tell an ignored submission from
    // a rejected one, and guessing would delete someone's pending work.
    return json(
      { error: "Could not read the open pull requests, so nothing was swept." },
      502,
    );
  }

  const pending: PendingObject[] = [];
  let cursor: string | undefined;

  do {
    const page = await env.BUCKET.list({
      prefix: "pending/",
      cursor,
      limit: LIST_PAGE_SIZE,
    });

    for (const object of page.objects) {
      pending.push({ key: object.key, uploadedAt: object.uploaded });
    }

    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  const orphans = orphansToDelete({
    pending,
    referenced: [...published, ...underReview],
    olderThanMs: olderThanDays * DAY_MS,
  });

  if (body.apply === true) {
    for (const key of orphans) await env.BUCKET.delete(key);
  }

  return json({
    applied: body.apply === true,
    olderThanDays,
    pending: pending.length,
    published: published.length,
    underReview: underReview.length,
    orphans,
  });
};

/**
 * Photos an open pull request still points at. A submission nobody has decided
 * on yet must survive the sweep however old it gets, so that a late approval
 * cannot publish a Contribution whose photo has already been deleted.
 */
async function readOpenPullRequestPhotos(
  env: PagesContext["env"],
): Promise<string[] | null> {
  const api = env.GITHUB_API ?? "https://api.github.com";
  const response = await fetch(
    `${api}/repos/${env.GITHUB_REPO}/pulls?state=open&per_page=100`,
    {
      headers: {
        authorization: `Bearer ${env.GITHUB_TOKEN}`,
        accept: "application/vnd.github+json",
        "user-agent": "bukitjalilstadium-cleanup",
      },
    },
  );

  if (!response.ok) return null;

  const pullRequests = (await response.json()) as { body?: string | null }[];
  return photosUnderReview(pullRequests);
}

async function readPublishedPhotos(
  request: Request,
  env: PagesContext["env"],
): Promise<string[] | null> {
  const url = new URL("/referenced-photos.json", request.url);
  // Each deployment has its own manifest; keying by commit keeps a cached copy
  // from a previous deployment out of the answer.
  if (env.CF_PAGES_COMMIT_SHA) url.searchParams.set("v", env.CF_PAGES_COMMIT_SHA);

  const response = await fetch(url, { cf: { cacheTtl: 0 } } as RequestInit);
  if (!response.ok) return null;

  const manifest = (await response.json()) as { photos?: unknown };
  return Array.isArray(manifest.photos)
    ? manifest.photos.filter((photo): photo is string => typeof photo === "string")
    : [];
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return difference === 0;
}
