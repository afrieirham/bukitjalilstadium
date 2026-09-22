export interface PendingObject {
  key: string;
  uploadedAt: Date;
}

export interface OrphanOptions {
  pending: PendingObject[];
  referenced: string[];
  olderThanMs: number;
  now?: number;
}

/**
 * Photos sitting in the pending area that no published Contribution points at,
 * and that have had long enough for a moderator to get to them. A published
 * photo is never an orphan, however old it is, because publishing does not move
 * it: the Contribution simply keeps pointing at the pending key.
 */
export function orphansToDelete({
  pending,
  referenced,
  olderThanMs,
  now = Date.now(),
}: OrphanOptions): string[] {
  const published = new Set(referenced);

  return pending
    .filter(
      (object) =>
        !published.has(object.key) &&
        now - object.uploadedAt.getTime() >= olderThanMs,
    )
    .map((object) => object.key);
}
