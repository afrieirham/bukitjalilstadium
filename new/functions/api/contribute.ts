import { sections } from "../../app/components/widget/seat-plan-data.ts";
import { photoUrl } from "../../app/lib/site.ts";
import {
  buildContributionFiles,
  validateSubmission,
  type SubmissionDraft,
  type ValidatedSubmission,
} from "../../app/lib/submission.ts";
import { openContributionPullRequest } from "../lib/github.ts";
import { withinRateLimit } from "../lib/rate-limit.ts";
import {
  json,
  missingConfiguration,
  type PagesContext,
} from "../lib/types.ts";
import { verifyTurnstile } from "../lib/turnstile.ts";

const SUBMISSIONS_PER_HOUR = 5;
const sectionIds = sections.map((section) => section.id);

export const onRequestPost = async ({
  request,
  env,
}: PagesContext): Promise<Response> => {
  const unconfigured = missingConfiguration(env);
  if (unconfigured) return json({ error: unconfigured }, 503);
  if (!env.GITHUB_TOKEN || !env.GITHUB_REPO) {
    return json({ error: "The review queue is not connected yet." }, 503);
  }

  const source = request.headers.get("cf-connecting-ip") ?? "unknown";

  if (
    !(await withinRateLimit(env.RATE_LIMIT, `submit:${source}`, {
      limit: SUBMISSIONS_PER_HOUR,
      windowSeconds: 3600,
    }))
  ) {
    return json({ error: "Too many submissions from here. Try again later." }, 429);
  }

  const payload = (await request.json()) as Record<string, unknown>;
  const token = typeof payload.turnstileToken === "string" ? payload.turnstileToken : "";

  if (!(await verifyTurnstile(env.TURNSTILE_SECRET, token, source))) {
    return json(
      { error: "We could not confirm you are human. Reload the page and try again." },
      403,
    );
  }

  const draft: SubmissionDraft = {
    section: string(payload.section),
    photos: array(payload.photos),
    date: string(payload.date),
    caption: string(payload.caption),
    row: string(payload.row),
    seat: string(payload.seat),
    contributorName: string(payload.contributorName),
    contributorHref: string(payload.contributorHref),
  };

  const { errors, submission } = validateSubmission(draft, sectionIds);
  if (!submission) return json({ errors }, 422);

  // Only keys this site uploaded may be submitted, so a submission cannot
  // point the review queue at an arbitrary object.
  for (const key of submission.photos) {
    if (!(await env.BUCKET.head(key))) {
      return json(
        { errors: { photos: "A photo did not upload correctly. Remove it and try again." } },
        422,
      );
    }
  }

  const submissionId = `c-${crypto.randomUUID().slice(0, 8)}`;

  try {
    const prUrl = await openContributionPullRequest({
      repo: env.GITHUB_REPO,
      token: env.GITHUB_TOKEN,
      api: env.GITHUB_API,
      baseBranch: "main",
      branch: `contribution/${submissionId}`,
      files: buildContributionFiles(submission, submissionId),
      title: `Contribution: Section ${submission.section}`,
      body: pullRequestBody(submission, submissionId),
    });

    return json({ prUrl });
  } catch (error) {
    console.error("contribute: could not open the pull request", error);
    return json(
      { error: "We could not file your contribution for review. Please try again." },
      502,
    );
  }
};

function pullRequestBody(
  submission: ValidatedSubmission,
  submissionId: string,
): string {
  const photos = submission.photos
    .map((key, index) => `${index + 1}. ${photoUrl(key)}`)
    .join("\n");

  const details = [
    submission.date ? `- Date: ${submission.date}` : null,
    submission.row ? `- Row: ${submission.row}` : null,
    submission.seat ? `- Seat: ${submission.seat}` : null,
    submission.contributor
      ? `- Contributor: ${submission.contributor.name}${
          submission.contributor.href ? ` (${submission.contributor.href})` : ""
        }`
      : "- Contributor: anonymous",
  ]
    .filter(Boolean)
    .join("\n");

  return [
    `Contribution \`${submissionId}\` for **Section ${submission.section}**, ${submission.photos.length} photo(s).`,
    "",
    "Preview before merging (these links are public but unguessable):",
    photos,
    "",
    details,
    submission.caption ? `\n> ${submission.caption}` : "",
    "",
    "Delete a photo's file to reject it, then squash-merge to publish the rest.",
  ].join("\n");
}

function string(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function array(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}
