# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Static prerendering (no server at runtime)
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

The app builds to a static site. No server runs at runtime.

```bash
npm run build
```

The build prerenders every route, then flattens each route directory to its
sibling `.html` file so that `/201A-B` stays the canonical slashless URL.
Deploy the `build/client` directory.

On Cloudflare Pages, set the root directory to this app, the build command to
`npm ci && npm run build`, and the build output directory to `build/client`.
Merging a Contribution pull request triggers a rebuild.

## Moderating Contributions

Each Contribution arrives as a pull request holding one JSON file per photo.

- **Publish all of it**: squash-merge the pull request. The merge triggers a rebuild, and the photos appear on their Section page and in the contributors list.
- **Publish some of it**: delete the files for the photos you do not want, then squash-merge. Deleting a file rejects that photo.
- **Reject all of it**: close the pull request without merging.

The merge is the audit trail: the accepted files are the record of what was published, and the pull request keeps the rejected ones. GitHub's pull request notifications are the alert that something is waiting for review.

Rejected photos stay in the bucket until they are swept up:

```bash
curl -sS -X POST https://bukitjalilstadium-1ms.pages.dev/api/cleanup \
  -H "authorization: Bearer $GITHUB_TOKEN" \
  -H "content-type: application/json" \
  -d '{"olderThanDays": 30}'
```

It is a dry run unless you pass `{"apply": true}`. The pull request is the decision:

| The submission's pull request | Its photos |
| --- | --- |
| **Open** | kept, however long they have waited |
| **Closed without merging** | deleted — that is a rejection |
| **Merged** | the ones the Contribution publishes are kept; the ones you removed from the pull request are deleted |

A photo that no pull request knows about — someone uploaded and never submitted — is the only case decided by age, and that is what `olderThanDays` is for (default 30).

Because an open pull request protects its photos indefinitely, nothing is ever deleted out from under a submission you have not decided on. The trade-off is moderation debt, so the response also lists submissions that have been waiting longer than `staleAfterDays` (default 14), for you to triage. It reports them; it never acts on them.

## Analytics

Two trackers, both non-blocking, and neither reports from a preview deployment.

- **Cloudflare Web Analytics** is enabled on the Pages project rather than in code, and Cloudflare injects its beacon. It only reports the production domain, so previews stay out of it.
- **Umami** is self-hosted, and `Analytics` in the root layout loads it after hydration on the live host only. It is added by script rather than rendered into the markup because the same prerendered HTML is served by preview deployments, where it should not report.

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
