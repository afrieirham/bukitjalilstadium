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

It is a dry run unless you pass `{"apply": true}`. It only deletes a photo when **both** are true:

- no published Contribution points at it, and
- no **open pull request** points at it,

and it is older than the threshold. So a photo is safe however long you take: publishing never moves a photo out of the pending area, and an undecided submission keeps its photos for as long as its pull request is open. Closing a pull request is what makes its photos sweepable.

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
