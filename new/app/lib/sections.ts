export type SectionLevel = 1 | 2 | 3;

interface ParsedSection {
  level: SectionLevel;
  number: number;
  suffix: string;
}

export function sectionLevel(id: string): SectionLevel {
  return parseSection(id).level;
}

export function sectionOrder(ids: string[]): string[] {
  return [...ids].sort(compareSections);
}

/**
 * Moves one Level up or down, keeping the Section's number and suffix where it
 * can. A number that does not exist on the target Level (for example 231A) lands
 * on the nearest number there, so a keyboard jump never dead-ends.
 */
export function sectionLevelShift(
  id: string,
  ids: string[],
  direction: -1 | 1,
): string | null {
  const target = sectionLevel(id) + direction;
  if (target < 1 || target > 3) return null;

  const onTarget = sectionOrder(
    ids.filter((other) => sectionLevel(other) === target),
  );
  if (onTarget.length === 0) return null;

  const { number, suffix } = parseSection(id);
  const exact = onTarget.find((other) => {
    const parsed = parseSection(other);
    return parsed.number === number && parsed.suffix === suffix;
  });
  if (exact) return exact;

  return onTarget.reduce((closest, other) =>
    Math.abs(parseSection(other).number - number) <
    Math.abs(parseSection(closest).number - number)
      ? other
      : closest,
  );
}

/**
 * Resolves what someone typed into a Section lookup. Punctuation and case are
 * ignored, so "201a/b", "201A-B" and "201ab" all find "201A/B".
 */
export function findSectionByQuery(
  query: string,
  ids: string[],
): string | null {
  const needle = normalise(query);
  if (!needle) return null;

  return (
    ids.find((id) => normalise(id) === needle) ??
    ids.find((id) => normalise(id).startsWith(needle)) ??
    null
  );
}

function normalise(value: string): string {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, "");
}

/**
 * The Sections either side of this one around its Level's ring. The ring runs
 * in ascending number order, and `left` follows it while `right` runs against
 * it — the same sides the legacy site's left/right links used, so the arrows
 * point the way they always have.
 */
export function sectionNeighbours(
  id: string,
  ids: string[],
): { left: string; right: string } {
  const level = sectionLevel(id);
  const ring = sectionOrder(
    ids.filter((other) => sectionLevel(other) === level),
  );
  const index = ring.indexOf(id);

  if (index === -1) throw new Error(`Unknown Section: ${id}`);

  return {
    left: ring[(index + 1) % ring.length],
    right: ring[(index - 1 + ring.length) % ring.length],
  };
}

function parseSection(id: string): ParsedSection {
  const match = /^(\d)(\d{2})(.*)$/.exec(id);

  if (!match) throw new Error(`Unrecognised Section id: ${id}`);

  return {
    level: Number(match[1]) as SectionLevel,
    number: Number(match[2]),
    suffix: match[3],
  };
}

function compareSections(left: string, right: string): number {
  const a = parseSection(left);
  const b = parseSection(right);

  return (
    a.level - b.level || a.number - b.number || a.suffix.localeCompare(b.suffix)
  );
}
