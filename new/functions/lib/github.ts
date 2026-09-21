export interface ContributionPullRequest {
  repo: string;
  token: string;
  /** Defaults to the public GitHub API. */
  api?: string;
  baseBranch: string;
  branch: string;
  files: { path: string; contents: string }[];
  title: string;
  body: string;
}

/**
 * Opens one pull request holding every file of a submission, using the
 * repository as the store and the pull request as the moderation queue.
 */
export async function openContributionPullRequest(
  input: ContributionPullRequest,
): Promise<string> {
  const { repo, token } = input;
  const api = `${input.api ?? "https://api.github.com"}/repos/${repo}`;
  const headers = {
    authorization: `Bearer ${token}`,
    accept: "application/vnd.github+json",
    "content-type": "application/json",
    // GitHub rejects requests without one.
    "user-agent": "bukitjalilstadium-contribute",
  };

  const base = await call<{ object: { sha: string } }>(
    `${api}/git/ref/heads/${input.baseBranch}`,
    { headers },
  );

  await call(`${api}/git/refs`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      ref: `refs/heads/${input.branch}`,
      sha: base.object.sha,
    }),
  });

  for (const file of input.files) {
    await call(`${api}/contents/${file.path}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `Add ${file.path.split("/").slice(-2).join("/")}`,
        content: base64(file.contents),
        branch: input.branch,
      }),
    });
  }

  const pull = await call<{ html_url: string }>(`${api}/pulls`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: input.title,
      body: input.body,
      head: input.branch,
      base: input.baseBranch,
    }),
  });

  return pull.html_url;
}

async function call<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub ${response.status} for ${url}: ${detail.slice(0, 200)}`);
  }

  return (await response.json()) as T;
}

function base64(value: string): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(value)));
}
