# GitHub content sync

The owner-only Admin control room includes a **Sync with GitHub** button. It uses the server-side GitHub REST API to write the current profile, projects, bilingual article bodies, categories, and social links to `content-sync/site-content.json` on the `main` branch of `Khairyeldelar/khairy-digital-profile`.

The server reads `GITHUB_TOKEN` from managed project secrets. The token must be a fine-grained token scoped only to this repository with **Contents: Read and write** permission. It is never sent to the browser, included in the exported snapshot, or written to project files. The repository is fixed by the server default and can be overridden only by a validated `GITHUB_REPOSITORY` environment value.

The first sync creates the file; later syncs read its GitHub blob SHA and update it with a new commit. Each request is protected by the existing designated-owner procedure. The button synchronizes editable site content, not arbitrary source-code changes; source-code updates remain synchronized through the repository workflow and checkpoints.

## GitHub Pages content delivery

The GitHub Pages workflow copies `content-sync/site-content.json` into the published artifact. The standalone frontend loads this snapshot from its repository subpath, so changes saved from the Admin control room appear on the GitHub Pages website after the corresponding GitHub Pages workflow finishes. The Full-Stack Manus deployment continues to read the same content directly from its database.

## Automatic sync after save

The owner can enable **Automatic GitHub sync** from the Admin control room. When enabled, each successful profile, project, or social-link save starts one server-side sync immediately after the database write completes. Project-image uploads use the same path after the image key is linked to the project.

The setting is stored in the protected `site_settings` table and defaults to disabled. Turning it off stops future automatic commits but does not remove existing commits or affect the manual **Sync with GitHub** button. If GitHub is unavailable, the content save remains successful and the dashboard displays a separate warning so the owner can retry manually.
