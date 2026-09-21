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

export function sectionNeighbours(
  id: string,
  ids: string[],
): { previous: string; next: string } {
  const level = sectionLevel(id);
  const ring = sectionOrder(
    ids.filter((other) => sectionLevel(other) === level),
  );
  const index = ring.indexOf(id);

  if (index === -1) throw new Error(`Unknown Section: ${id}`);

  return {
    previous: ring[(index - 1 + ring.length) % ring.length],
    next: ring[(index + 1) % ring.length],
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

  return a.level - b.level || a.number - b.number || a.suffix.localeCompare(b.suffix);
}
