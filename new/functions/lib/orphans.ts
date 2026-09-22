export interface PendingObject {
  key: string;
  uploadedAt: Date;
}

export interface OrphanOptions {
  pending: PendingObject[];
  /**
   * Photos that must survive the sweep: those a published Contribution points
   * at, plus those an open pull request still points at.
   */
  referenced: string[];
  olderThanMs: number;
  now?: number;
}

/**
 * Photos sitting in the pending area that nothing points at, and that have had
 * long enough for a moderator to get to them.
 *
 * A photo is only an orphan once no published Contribution and no open pull
 * request refers to it. Publishing does not move a photo, so an approved one
 * keeps its pending key and stays protected by the published list; an ignored
 * one stays protected for as long as its pull request is open.
 */
export function orphansToDelete({
  pending,
  referenced,
  olderThanMs,
  now = Date.now(),
}: OrphanOptions): string[] {
  const protectedPhotos = new Set(referenced);

  return pending
    .filter(
      (object) =>
        !protectedPhotos.has(object.key) &&
        now - object.uploadedAt.getTime() >= olderThanMs,
    )
    .map((object) => object.key);
}

/**
 * The photos an open pull request still refers to. The submission's pull
 * request body lists them as preview links, so one listing of the open pull
 * requests is enough to know what is still awaiting a decision.
 */
export function photosUnderReview(
  pullRequests: { body?: string | null }[],
): string[] {
  const keys = new Set<string>();

  for (const pullRequest of pullRequests) {
    // Built per call: a shared global regex would carry lastIndex between uses.
    const pattern = /pending\/[0-9a-f-]{36}\.(?:jpg|png)/g;
    for (const match of (pullRequest.body ?? "").matchAll(pattern)) {
      keys.add(match[0]);
    }
  }

  return [...keys];
}
