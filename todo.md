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

- [x] Add Render-compatible service configuration for the Express Full-Stack app — cancelled by user in favor of GitHub-only.
- [x] Commit and push the latest Full-Stack/storage version to the public GitHub repository.
- [x] Configure required production environment variables and storage/database dependencies — not applicable to GitHub-only source hosting.
- [x] Deploy the service on Render or pause for account authorization if required — cancelled by user.
- [x] Verify the external URL and confirm the app loads without the Manus preview badge — not applicable because external hosting was cancelled.

## GitHub-Only Hosting Decision

- [x] Remove Render deployment configuration and documentation.
- [x] Push the clean Full-Stack source to the public GitHub repository.
- [x] Verify the repository contains the latest source and no Render deployment path is active.

## GitHub Pages Publish Request

- [x] Verify the Pages workflow and repository visibility after the Full-Stack upgrade.
- [x] Prepare a Pages-compatible static build without changing the Full-Stack source of record.
- [x] Run the GitHub Pages workflow and verify the public URL.
- [x] Confirm the published result and explain the Full-Stack versus static-hosting distinction.

## GitHub Pages 404 Fix

- [x] Configure the client router base for the repository subpath.
- [x] Rebuild and redeploy GitHub Pages.
- [x] Verify the fixed public project URL loads the home page on mobile and desktop after redeploy.

## Work Grid and Admin Dashboard

- [x] Design the content model for profile settings, projects, and social links.
- [x] Add database tables and migration SQL for editable site content.
- [x] Add protected owner-only tRPC procedures for reading and updating content.
- [x] Build the admin dashboard using the existing DashboardLayout component.
- [x] Replace the horizontal work strip with a compact responsive three-column grid.
- [x] Add managed image upload handling for profile and project assets.
- [x] Add Vitest coverage and verify public/admin access flows.

- [x] Keep the work section at exactly three compact columns on narrow mobile screens, with readable touch targets and no horizontal scroll.

## Admin and Mobile Grid Hardening

- [x] Restrict admin procedures and the /admin UI to the designated OWNER_OPEN_ID.
- [x] Add managed project-image upload controls and persist project image keys.
- [x] Add tests for owner access, public content loading, and content mutations.
- [x] Refine mobile three-column labels and tap targets while confirming no horizontal overflow.

## Final Hardening Follow-up

- [x] Gate the Admin UI explicitly by OWNER_OPEN_ID and render forbidden errors before loading states.
- [x] Add a successful owner mutation test without creating persistent test records.
- [x] Increase the mobile project action hit area and verify document width does not overflow.

## Final Verification Addendum

- [x] Expose a safe owner identity signal to the client and gate the admin route explicitly.
- [x] Add a runtime mobile overflow check and verify the public page stays within the viewport width.
