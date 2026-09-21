// Explicit .ts extension: this module is also loaded directly by Node when the
// tests run, and Node does not resolve extensionless specifiers.
import { sectionOrder } from "./sections.ts";

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

export interface ContributorCredit {
  name: string;
  href: string | null;
  sections: string[];
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

/**
 * A Contributor is identified by their name together with their link, so the
 * same display name with and without a link is not merged into one person.
 */
export function creditedContributors(
  contributions: Contribution[],
): ContributorCredit[] {
  const credits = new Map<string, ContributorCredit>();

  for (const contribution of contributions) {
    const { contributor } = contribution;
    if (!contributor) continue;

    const key = `${contributor.name}\u0000${contributor.href ?? ""}`;
    const credit = credits.get(key) ?? {
      name: contributor.name,
      href: contributor.href ?? null,
      sections: [],
    };

    credit.sections.push(contribution.section);
    credits.set(key, credit);
  }

  return [...credits.values()]
    .map((credit) => ({
      ...credit,
      sections: sectionOrder([...new Set(credit.sections)]),
    }))
    .sort(
      (left, right) =>
        left.name.localeCompare(right.name) ||
        (left.href ?? "").localeCompare(right.href ?? ""),
    );
}
