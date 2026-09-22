export type SweepReason =
  | "published"
  | "under-review"
  | "rejected"
  | "rejected-photo"
  | "awaiting-deploy"
  | "abandoned"
  | "recent";

export interface PendingObject {
  key: string;
  uploadedAt: Date;
}

export interface PullRequestReview {
  branch: string;
  open: boolean;
  merged: boolean;
  photos: string[];
  openedAt: Date;
}

export interface SweepDecision {
  key: string;
  reason: SweepReason;
  delete: boolean;
}

export interface SweepInput {
  pending: PendingObject[];
  reviews: PullRequestReview[];
  published: string[];
  olderThanMs: number;
  now?: number;
}

/** A submission's branch, which is how a Contribution pull request is told
 * apart from ordinary development pull requests. */
const SUBMISSION_BRANCH = /^contribution\//;

/**
 * A merged Contribution is only known to be published once the rebuild that
 * includes it has deployed and regenerated the manifest. This grace stops a
 * sweep run in that window from deleting a photo that was just approved.
 */
export const MERGED_GRACE_MS = 24 * 60 * 60 * 1000;

export interface RawPullRequest {
  head?: { ref?: string } | null;
  state?: string | null;
  merged_at?: string | null;
  created_at?: string | null;
  body?: string | null;
}

/**
 * Keeps only the Contribution pull requests, and reads the photos each one is
 * still holding from the preview links in its body. Those links list every
 * photo that was submitted, including ones since deleted from the branch, which
 * is exactly the set needed to tell an approved photo from a rejected one.
 */
export function parsePullRequests(raw: RawPullRequest[]): PullRequestReview[] {
  const pattern = /pending\/[0-9a-f-]{36}\.(?:jpg|png)/g;

  return raw
    .filter(
      (pull): pull is RawPullRequest & { head: { ref: string } } =>
        typeof pull?.head?.ref === "string" &&
        SUBMISSION_BRANCH.test(pull.head.ref),
    )
    .map((pull) => ({
      branch: pull.head.ref,
      open: pull.state === "open",
      merged: Boolean(pull.merged_at),
      photos: [...new Set(pull.body?.match(pattern) ?? [])],
      openedAt: new Date(pull.created_at ?? 0),
    }));
}

/**
 * What to do with every photo sitting in the pending area.
 *
 * The pull request is the decision: open means undecided and therefore kept
 * however long it takes, closed unmerged means rejected, and merged means keep
 * whatever the Contribution now publishes. Only a photo no pull request knows
 * about falls back to age, because that is an upload nobody ever submitted.
 */
export function sweepDecisions({
  pending,
  reviews,
  published,
  olderThanMs,
  now = Date.now(),
}: SweepInput): SweepDecision[] {
  const publishedKeys = new Set(published);
  const reviewByPhoto = new Map<string, PullRequestReview>();

  for (const review of reviews) {
    for (const photo of review.photos) reviewByPhoto.set(photo, review);
  }

  return pending.map((object) => {
    const review = reviewByPhoto.get(object.key);
    const age = now - object.uploadedAt.getTime();

    if (!review) {
      const expired = age >= olderThanMs;
      return {
        key: object.key,
        reason: expired ? "abandoned" : "recent",
        delete: expired,
      };
    }

    if (review.open) {
      return { key: object.key, reason: "under-review", delete: false };
    }

    if (!review.merged) {
      return { key: object.key, reason: "rejected", delete: true };
    }

    if (publishedKeys.has(object.key)) {
      return { key: object.key, reason: "published", delete: false };
    }

    const settled = age >= MERGED_GRACE_MS;
    return {
      key: object.key,
      reason: settled ? "rejected-photo" : "awaiting-deploy",
      delete: settled,
    };
  });
}

/** Submission pull requests that have been waiting longer than a threshold,
 * reported so the queue can be triaged. Nothing is done to them. */
export function stalePullRequests(
  reviews: PullRequestReview[],
  waitingMs: number,
  now = Date.now(),
): { branch: string; waitingDays: number }[] {
  return reviews
    .filter((review) => review.open && now - review.openedAt.getTime() >= waitingMs)
    .map((review) => ({
      branch: review.branch,
      waitingDays: Math.floor((now - review.openedAt.getTime()) / (24 * 60 * 60 * 1000)),
    }));
}
