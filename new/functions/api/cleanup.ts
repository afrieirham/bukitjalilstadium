import {
  parsePullRequests,
  stalePullRequests,
  sweepDecisions,
  type PendingObject,
  type RawPullRequest,
  type SweepReason,
} from "../lib/sweep.ts";
import { json, type PagesContext } from "../lib/types.ts";

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_OLDER_THAN_DAYS = 30;
const DEFAULT_STALE_AFTER_DAYS = 14;
const LIST_PAGE_SIZE = 1000;
const PULL_PAGE_SIZE = 100;
const MAX_PULL_PAGES = 10;

/**
 * Decides the fate of every photo in the pending area from the pull requests
 * that own them, then deletes the rejected ones.
 *
 * The pull request is the decision. Open means undecided, so the photos are
 * kept however long they have waited. Closed without merging means rejected.
 * Merged means keep whatever the Contribution publishes and drop the rest. Only
 * a photo no pull request knows about falls back to age, since that is an
 * upload nobody ever submitted.
 *
 * Authenticated with the repository token rather than a secret of its own: it
 * already grants repository write, which is strictly more than this endpoint
 * can do, so a second token would be another thing to rotate without reducing
 * the blast radius.
 *
 * Defaults to a dry run. Pass `{ "apply": true }` to actually delete.
 */
export const onRequestPost = async ({
  request,
  env,
}: PagesContext): Promise<Response> => {
  if (!env.BUCKET) return json({ error: "The photo bucket is not connected yet." }, 503);
  if (!env.GITHUB_TOKEN) return json({ error: "The review queue is not connected yet." }, 503);
  if (!env.GITHUB_REPO) return json({ error: "The repository is not configured yet." }, 503);

  const authorization = request.headers.get("authorization") ?? "";
  if (!constantTimeEqual(authorization, `Bearer ${env.GITHUB_TOKEN}`)) {
    return json({ error: "Not allowed." }, 401);
  }

  const body = (await request.json().catch(() => ({}))) as {
    olderThanDays?: number;
    staleAfterDays?: number;
    apply?: boolean;
  };
  const olderThanDays = positiveOr(body.olderThanDays, DEFAULT_OLDER_THAN_DAYS);
  const staleAfterDays = positiveOr(body.staleAfterDays, DEFAULT_STALE_AFTER_DAYS);

  const published = await readPublishedPhotos(request, env);
  if (!published) {
    return json(
      { error: "Could not read the published photo list from this deployment." },
      502,
    );
  }

  const pullRequests = await readPullRequests(env);
  if (!pullRequests) {
    // Without the pull requests there is no way to tell an ignored submission
    // from a rejected one, and guessing deletes someone's pending work.
    return json(
      { error: "Could not read the pull requests, so nothing was swept." },
      502,
    );
  }

  const reviews = parsePullRequests(pullRequests);
  const pending = await listPendingPhotos(env);

  const decisions = sweepDecisions({
    pending,
    reviews,
    published,
    olderThanMs: olderThanDays * DAY_MS,
  });
  const deleting = decisions.filter((decision) => decision.delete).map((decision) => decision.key);

  if (body.apply === true) {
    for (const key of deleting) await env.BUCKET.delete(key);
  }

  return json({
    applied: body.apply === true,
    olderThanDays,
    pending: pending.length,
    published: published.length,
    contributions: reviews.length,
    counts: tally(decisions.map((decision) => decision.reason)),
    deleting,
    waiting: stalePullRequests(reviews, staleAfterDays * DAY_MS),
  });
};

async function listPendingPhotos(env: PagesContext["env"]): Promise<PendingObject[]> {
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

  return pending;
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

async function readPullRequests(
  env: PagesContext["env"],
): Promise<RawPullRequest[] | null> {
  const api = env.GITHUB_API ?? "https://api.github.com";
  const headers = {
    authorization: `Bearer ${env.GITHUB_TOKEN}`,
    accept: "application/vnd.github+json",
    "user-agent": "bukitjalilstadium-cleanup",
  };

  const pullRequests: RawPullRequest[] = [];

  for (let page = 1; page <= MAX_PULL_PAGES; page += 1) {
    const response = await fetch(
      `${api}/repos/${env.GITHUB_REPO}/pulls?state=all&per_page=${PULL_PAGE_SIZE}&page=${page}`,
      { headers },
    );
    if (!response.ok) return null;

    const batch = (await response.json()) as RawPullRequest[];
    if (!Array.isArray(batch)) return null;

    pullRequests.push(...batch);
    if (batch.length < PULL_PAGE_SIZE) break;
  }

  return pullRequests;
}

function tally(reasons: SweepReason[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const reason of reasons) counts[reason] = (counts[reason] ?? 0) + 1;

  return counts;
}

function positiveOr(value: unknown, fallback: number): number {
  return typeof value === "number" && value >= 0 ? value : fallback;
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return difference === 0;
}
