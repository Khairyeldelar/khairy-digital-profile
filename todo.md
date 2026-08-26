# Language Toggle Update

- [x] Add a persistent Arabic/English language toggle in the header and mobile navigation.
- [x] Translate all visible profile, work, profile-links, about, contact, footer, and navigation copy.
- [x] Apply `lang` and `dir` changes on the document root when switching languages.
- [x] Add complete RTL layout rules without breaking icons, horizontal work scrolling, or bottom navigation.
- [x] Verify desktop and mobile rendering in both languages.
- [x] Run TypeScript/build checks and save a checkpoint.

## Attached Image Update

- [x] Upload the attached portrait and cover image to the project asset storage.
- [x] Replace the profile portrait source with the attached portrait.
- [x] Add the attached cover as the profile card visual while preserving readable content.
- [x] Verify the new composition on desktop and mobile and save a checkpoint.

## GitHub Upload

- [x] Inspect the current Git repository state and remotes.
- [x] Create or select a GitHub repository for the project.
- [x] Commit and push the latest stable project version.
- [x] Verify the remote repository and explain the Manus badge limitation.

## Independent GitHub Pages Release

- [x] Copy the user-provided portrait and cover into the repository public assets.
- [x] Replace Manus storage URLs with repository-relative asset URLs.
- [x] Add GitHub Pages-compatible Vite base configuration and deployment workflow.
- [x] Create a public GitHub repository and push the independent release.
- [x] Verify the GitHub Pages deployment URL and confirm the Manus preview badge is not part of the independent build.

## Public GitHub Pages Release

- [x] Change the GitHub repository visibility from private to public with user approval.
- [x] Re-run the Pages workflow after the visibility change.
- [x] Verify the public Pages URL and confirm the standalone build uses local assets only.

## Full-Stack File Storage Upgrade

- [x] Upgrade the static project to web-db-user with backend and file storage scaffolding.
- [x] Read the generated storage integration guidance and map the image assets.
- [x] Upload or re-upload the portrait and cover through the managed File Storage flow.
- [x] Replace large repository-local media references with managed storage paths.
- [x] Verify the profile image and cover in the Full-Stack preview, then save a checkpoint.

## External Full-Stack Hosting

- [ ] Add Render-compatible service configuration for the Express Full-Stack app.
- [ ] Commit and push the latest Full-Stack/storage version to the public GitHub repository.
- [ ] Configure required production environment variables and storage/database dependencies.
- [ ] Deploy the service on Render or pause for account authorization if required.
- [ ] Verify the external URL and confirm the app loads without the Manus preview badge.

## GitHub-Only Hosting Decision

- [ ] Remove Render deployment configuration and documentation.
- [ ] Push the clean Full-Stack source to the public GitHub repository.
- [ ] Verify the repository contains the latest source and no Render deployment path is active.
