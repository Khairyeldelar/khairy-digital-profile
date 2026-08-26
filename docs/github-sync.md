# GitHub content sync

The owner-only Admin control room includes a **Sync with GitHub** button. It uses the server-side GitHub REST API to write the current profile, projects, bilingual article bodies, categories, and social links to `content-sync/site-content.json` on the `main` branch of `Khairyeldelar/khairy-digital-profile`.

The server reads `GITHUB_TOKEN` from managed project secrets. The token must be a fine-grained token scoped only to this repository with **Contents: Read and write** permission. It is never sent to the browser, included in the exported snapshot, or written to project files. The repository is fixed by the server default and can be overridden only by a validated `GITHUB_REPOSITORY` environment value.

The first sync creates the file; later syncs read its GitHub blob SHA and update it with a new commit. Each request is protected by the existing designated-owner procedure. The button synchronizes editable site content, not arbitrary source-code changes; source-code updates remain synchronized through the repository workflow and checkpoints.
