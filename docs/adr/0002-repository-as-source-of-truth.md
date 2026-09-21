# The repository is the source of truth and pull requests are the moderation queue

Contributions are stored as small JSON files in the repository, with photo binaries in Cloudflare R2. The contribute form opens a pull request and merging it publishes the Contribution. There is no database, no admin UI and no custom moderation tool: a pull request gives one moderator a review screen, an audit log, selective approval, and the publish trigger, for free.

## Considered Options

- D1 for approved Contributions, an Access-protected `/admin` route, and a Deploy Hook on approval.
- Repository files plus GitHub pull requests (chosen).

## Consequences

- Partial approval happens before the merge: delete the files you reject, then squash-merge, which keeps `main` at one commit per Contribution.
- The write path needs a fine-grained GitHub token stored as a Pages secret.
- Rejected submissions leave orphaned R2 objects; a cleanup script deletes unreferenced `pending/` keys.
