export interface Contributor {
  name: string;
  href: string | null;
}

export interface Contribution {
  submissionId: string;
  section: string;
  photo: string;
  date: string | null;
  caption: string | null;
  row: string | null;
  seat: string | null;
  contributor: Contributor | null;
}

export function sectionSlug(section: string): string {
  return section.replaceAll("/", "-");
}

export function sectionPhotos(
  contributions: Contribution[],
  section: string,
): Contribution[] {
  return contributions.filter((item) => item.section === section);
}

export function photosBySection(
  contributions: Contribution[],
): Map<string, Contribution[]> {
  const grouped = new Map<string, Contribution[]>();

  for (const contribution of contributions) {
    const photos = grouped.get(contribution.section) ?? [];
    photos.push(contribution);
    grouped.set(contribution.section, photos);
  }

  return grouped;
}

export function populatedSections(
  contributions: Contribution[],
): Set<string> {
  return new Set(contributions.map((item) => item.section));
}
