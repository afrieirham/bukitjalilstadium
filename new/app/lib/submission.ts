export const MAX_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

const PHOTO_KEY_PATTERN = /^pending\/[0-9a-f-]{36}\.(jpg|png)$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface SubmissionDraft {
  section: string;
  photos: string[];
  date: string;
  caption: string;
  row: string;
  seat: string;
  contributorName: string;
  contributorHref: string;
}

export interface ValidatedSubmission {
  section: string;
  photos: string[];
  date: string | null;
  caption: string | null;
  row: string | null;
  seat: string | null;
  contributor: { name: string; href: string | null } | null;
}

export interface ContributionFile {
  path: string;
  contents: string;
}

export const CONTRIBUTIONS_DIR = "new/data/contributions";

function text(value: string, max: number): string | null {
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed.slice(0, max);
}

/**
 * The rules that apply to what the Contributor typed. Separate from the photo
 * rules because the browser can check these before any photo has been uploaded,
 * when there are no object keys yet.
 */
export function validateFields(
  draft: SubmissionDraft,
  knownSections: string[],
): Record<string, string> {
  const errors: Record<string, string> = {};

  const section = draft.section.trim();
  if (section.length === 0) errors.section = "Choose the Section your photos were taken from.";
  else if (!knownSections.includes(section)) errors.section = "That is not a Section on this map.";

  const date = draft.date.trim();
  if (date.length > 0 && !DATE_PATTERN.test(date)) {
    errors.date = "Use a date like 2026-08-29.";
  }

  const href = draft.contributorHref.trim();
  if (href.length > 0) {
    let parsed: URL | null;
    try {
      parsed = new URL(href);
    } catch {
      parsed = null;
    }
    if (!parsed || !["http:", "https:"].includes(parsed.protocol)) {
      errors.contributorHref = "That link does not look like a web address.";
    }
  }

  const caption = draft.caption.trim();
  if (caption.length > 280) errors.caption = "Keep the note under 280 characters.";

  return errors;
}

export function validateSubmission(
  draft: SubmissionDraft,
  knownSections: string[],
): {
  errors: Record<string, string>;
  submission: ValidatedSubmission | null;
} {
  const errors = validateFields(draft, knownSections);

  const photos = draft.photos.filter((photo) => photo.trim().length > 0);
  if (photos.length === 0) errors.photos = "Add at least one photo.";
  else if (photos.length > MAX_PHOTOS) errors.photos = `Add at most ${MAX_PHOTOS} photos.`;
  else if (photos.some((photo) => !PHOTO_KEY_PATTERN.test(photo))) {
    errors.photos = "A photo did not upload correctly. Remove it and try again.";
  }

  if (Object.keys(errors).length > 0) return { errors, submission: null };

  const date = draft.date.trim();
  const href = draft.contributorHref.trim();
  const name = text(draft.contributorName, 60);

  return {
    errors,
    submission: {
      section: draft.section.trim(),
      photos,
      date: date.length > 0 ? date : null,
      caption: text(draft.caption, 280),
      row: text(draft.row, 20),
      seat: text(draft.seat, 20),
      contributor:
        name === null
          ? null
          : { name, href: href.length > 0 ? href : null },
    },
  };
}

export function buildContributionFiles(
  submission: ValidatedSubmission,
  submissionId: string,
): ContributionFile[] {
  return submission.photos.map((photo, index) => ({
    path: `${CONTRIBUTIONS_DIR}/${submissionId}/photo-${index + 1}.json`,
    contents: `${JSON.stringify(
      {
        submissionId,
        section: submission.section,
        photo,
        date: submission.date,
        caption: submission.caption,
        row: submission.row,
        seat: submission.seat,
        contributor: submission.contributor,
      },
      null,
      2,
    )}\n`,
  }));
}
