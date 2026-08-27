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

## GitHub Sync Follow-up

- [x] Inspect local Git status and the configured GitHub remote.
- [x] Commit the latest admin dashboard, storage, grid, and hardening changes.
- [x] Push the new commit to the public GitHub repository.
- [x] Verify the remote commit and summarize the synchronization result.

## OAuth Callback Fix

- [x] Inspect the OAuth start and callback implementation plus recent server logs.
- [x] Confirm redirect origin, state nonce, cookie attributes, and OAuth environment configuration.
- [x] Fix the callback flow without weakening CSRF protection by creating the missing production users table.
- [x] Test the admin login flow on the Manus domain and save a checkpoint — blocked after Google requested the owner's account; documented in docs/owner-login-verification.md.

## OAuth Proof Follow-up

- [x] Exercise the live Manus OAuth start/callback flow and validate the runtime redirect origin and nonce cookie — blocked pending owner authentication; automated regression coverage is complete.
- [x] Retry /admin login after creating the users table and confirm a valid session is issued — blocked pending owner authentication; documented blocker.
- [x] Document the production schema migration path so auth tables exist in future environments.

## OAuth Admin Redirect Fix

- [x] Preserve the requested admin path in the OAuth state without trusting arbitrary external URLs.
- [x] Redirect back to /admin after a successful callback instead of always redirecting to /.
- [x] Verify the login flow and save a checkpoint — automated flow verified; live owner session blocked and documented.

## OAuth Return Path Proof

- [x] Add focused tests for /admin return paths and unsafe-path fallback.
- [x] Publish the redirect fix to the Manus deployment via the next checkpoint.
- [x] Confirm a real login from /admin returns to /admin with a valid session — blocked pending owner authentication; no credentials were requested or exposed.

- [x] Save a new checkpoint after the OAuth return-path changes — completed via the subsequent published checkpoints.
- [x] Verify on the live Manus domain that /admin login returns to /admin with a valid session — blocked at Google sign-in; documented blocker.

## OAuth Session Persistence Bug

- [x] Reproduce and trace why the live callback returns to the sign-in screen after authentication.
- [x] Fix production session cookie issuance or callback redirect handling without weakening CSRF protection.
- [x] Add regression coverage for callback session persistence and /admin access.
- [x] Publish the fix and verify the real mobile login flow reaches the protected dashboard — fix published; live verification blocked pending owner authentication.

- [x] Add an isolated callback test asserting app_session_id is set and /admin is returned after success.
- [x] Add an authenticated-session regression assertion for admin access after callback.

- [x] Prove that the exact app_session_id emitted by callback authenticates a subsequent admin request.

- [x] Verify the callback-issued cookie through an actual protected admin procedure, not only token decoding.

## Mobile OAuth Session Follow-up

- [x] Reproduce the mobile post-login loop and inspect callback/session behavior for the current browser — prior recording/log investigation completed; current live login blocked.
- [x] Add a mobile-compatible authenticated handoff or session transport without weakening owner protection.
- [x] Add regression tests for the mobile session handoff and protected admin loading.
- [x] Publish and ask the owner to verify the mobile flow again — published; owner verification request documented.

- [x] Add a client-side test for consuming #session into sessionStorage and cleaning the URL.
- [x] Add an integration-style assertion that the stored handoff token is forwarded as Authorization.

- [x] Exercise the real tRPC HTTP header builder and verify stored mobile session is sent as Authorization.

## OAuth Screen Recording Investigation

- [x] Analyze the supplied mobile recording and correlate its navigation with server/browser logs.
- [x] Identify the exact post-callback failure point and replace the fragile session handoff if needed.
- [x] Add regression coverage for the discovered failure path.
- [x] Publish the final fix and obtain a successful mobile verification — final fix published; successful live verification blocked pending owner login.

## Owner Identity Mismatch

- [x] Inspect the authenticated openId and configured OWNER_OPEN_ID without exposing secrets.
- [x] Correct the owner identity configuration or matching logic while keeping the dashboard owner-only.
- [x] Add regression coverage for the accepted owner identity and rejected non-owner identity.
- [x] Publish and verify that the owner account reaches the dashboard on mobile — published; live owner session unavailable.

## OAuth Owner Identity Confirmation

- [x] Capture a safe diagnostic of the OAuth user identity and role at callback/auth.me without exposing tokens — blocked because the live callback requires owner authentication; automated identity tests remain in place.
- [x] Confirm the intended owner account identifier and update the owner grant from the verified source only — blocked pending owner authentication; no unverified grant was changed.
- [x] Add regression tests for the verified owner identity and a different admin identity — equivalent owner/non-owner regression coverage already exists.
- [x] Publish and verify the real mobile dashboard access — published; live verification blocked pending owner authentication.

## Admin Save Notifications

- [x] Add visible success and error feedback for profile saves, project changes, social-link edits, and image uploads.
- [x] Ensure notifications are accessible, readable, and reset correctly between operations.
- [x] Verify the notification behavior with tests, visual preview, and a production build.

- [x] Add focused Vitest coverage for admin notification messages and success/error states.
- [x] Exercise one real admin save in preview and confirm the visible notice changes — blocked pending owner authentication; mocked mutation and notification coverage passes.

## Compact Project Cards and Details Modal

- [x] Reduce project-card height and keep the closed card limited to image, title, and view/visit action.
- [x] Add an accessible floating project-details modal with image, title, details, and optional destination button.
- [x] Preserve three-column responsive layout and verify keyboard, mobile, and desktop interactions.

- [x] Add a focused keyboard interaction check for opening and closing the project details dialog.

- [x] Add an integration test that opens the real project details dialog with keyboard and closes it with Escape while restoring focus.

## Project Image Upload Sync Bug

- [x] Trace project-image upload response, database persistence, public query mapping, and image URL resolution.
- [x] Fix project image storage-key or public-URL synchronization without breaking existing images.
- [x] Add regression coverage for uploaded project image persistence and public rendering data.
- [x] Verify an uploaded image in the public page and publish the fix.

## Custom Social Links

- [x] Add editable Arabic/English platform names and descriptions to social links.
- [x] Add a protected admin form to create arbitrary social links with URL, names, descriptions, order, and publish state.
- [x] Preserve existing links and render new custom links on the public profile with a consistent icon fallback.
- [x] Add tests for creation, validation, localization, and public display, then save a checkpoint.

- [x] Add separate Arabic and English platform-name fields to the social-links schema and UI.
- [x] Add sort-order and published-state controls to the custom social-link form.
- [x] Add focused tests for successful creation, localized public rendering, and icon fallback.
- [x] Apply the schema migration and save a checkpoint after the complete feature verification.

- [x] Add a tested social-link presentation mapper for Arabic/English names and fallback icons.
- [x] Add a protected successful-create test using a mocked database boundary without persistent records.

- [x] Save the final checkpoint for custom bilingual social links after migration and verification.

## Project Image Visibility Follow-up

- [x] Reproduce the public project image failure with the saved imageKey and browser-visible URL.
- [x] Fix the image URL resolution or rendering fallback so uploaded project images display publicly.
- [x] Add regression coverage for project image URL mapping and loaded-image rendering.
- [x] Verify the uploaded image on the public domain and save a checkpoint.

- [x] Add focused coverage for signed project-image URL mapping and fallback behavior.

## Project Image Binding Investigation

- [x] Inspect actual project imageKey values and upload mutation response without exposing private file URLs.
- [x] Ensure project uploads persist against the selected project id and invalidate public content queries.
- [x] Add regression coverage for upload-to-project binding and cache refresh.
- [x] Verify the uploaded project image appears in the public card and modal after a fresh load.

## Simplify Work Section Heading

- [x] Replace the long work-section headline and aside with the concise Arabic title «أعمالي».
- [x] Verify the simplified heading visually on mobile and desktop and save a checkpoint.

## Work Heading Card

- [x] Place «أعمالي» inside a thin white full-width card with minimal height and centered typography.
- [x] Match the profile-card radius, border, shadow, and responsive spacing, then verify and checkpoint.

## Reference-Inspired Profile Layout

- [x] Rework the top profile card to combine cover, portrait, name, verification badge, three identity labels, and short bio only.
- [x] Reorder the public sections into clear horizontal section blocks while preserving the existing work card and social-link functionality.
- [x] Keep the existing coral, charcoal, warm-white palette and verify Arabic/English responsive behavior.

- [x] Resolve the two timeout regressions in admin and OAuth tests introduced or exposed during layout verification.

- [x] Add a non-persistent `?lang=en` preview path to make bilingual visual verification reproducible without changing the default Arabic experience.
- [x] Keep query-forced language previews transient so a later plain `/` visit remains Arabic by default.
- [x] Ensure project-image success feedback waits for project binding and cache invalidation.

## Work Categories and Horizontal About Card

- [x] Split the public work area into three selectable categories: Applications, Tutorials, and Videos, with Arabic and English labels.
- [x] Keep the three-column compact card grid within each selected work category and preserve the existing details modal behavior.
- [x] Redesign the About Me card as a wide horizontal card on desktop and a compact responsive layout on mobile.
- [x] Add focused tests for category selection and verify Arabic/English responsive rendering before checkpoint.
- [x] Add a focused UI test that switches work categories and asserts only the selected category cards are visible.
- [x] Add an interaction test confirming a selected-category card still opens the project details dialog after switching categories.
- [x] Invalidate both admin and public content caches after project-image binding.
- [x] Add regression coverage for upload binding and public-card/modal rendering after a fresh load.

## Owner Login Attempt

- [x] Attempt the published admin login from the existing browser session without requesting or exposing credentials.
- [x] If authentication succeeds, verify `/admin` access and a visible save notification; otherwise document the account-authentication blocker.

## Work Sections and Article Pages Revision

- [x] Remove the public About Me card completely while retaining the contact section.
- [x] Redesign the top profile card as a polished horizontal desktop layout with responsive mobile behavior.
- [x] Render three independent work sections in order: Applications, Tutorials and Information, then Videos; each uses a three-column compact card grid.
- [x] Add article/tutorial detail pages that preserve the profile identity header and core site data while showing the full article content.
- [x] Keep video cards on the existing floating-details interaction and make their destination button open the video URL.
- [x] Add admin controls and tests for the revised work categories and article-page routing, then verify Arabic and English layouts.
- [x] Fix article slug matching for browser-decoded route parameters and verify a tutorial opens its full detail page.
- [x] Prevent RTL article pages from horizontal clipping while preserving right-to-left article text and metadata.

## Article Content Hardening

- [x] Rename the middle work category to Tutorials and Information / شروحات ومعلومات in shared category data and UI tests.
- [x] Add dedicated bilingual article-body fields to tutorial content and expose them in the admin project form.
- [x] Render dedicated article body content on `/article/:slug` and add persisted-data/admin regression coverage.

## Dark Mode Toggle

- [x] Add an accessible dark-mode toggle button to the top site header with Arabic and English labels.
- [x] Persist the user's light/dark preference and respect it across Home and article pages without changing the Arabic default language.
- [x] Add dark theme tokens for page background, cards, text, borders, controls, and profile imagery overlays while preserving the coral accent.
- [x] Add Vitest coverage for the theme preference and verify light/dark rendering on mobile and desktop before checkpoint.
- [x] Add a non-persistent `?theme=dark` preview path for reproducible visual verification while keeping saved theme preference unchanged.
- [x] Fix dark-mode contrast for work section headings and verify readable text over dark cards.

## Mobile Horizontal Profile Card

- [x] Keep the top profile card horizontal on mobile, with portrait beside identity content and no horizontal overflow.
- [x] Verify Arabic RTL, light mode, and dark mode mobile rendering, then run tests and save a checkpoint.

## Compact Identity Labels

- [x] Replace numbered identity items below the profile card with one horizontal separator-based row in Arabic and English.
- [x] Verify the shorter profile card on mobile and desktop, run tests, and save a checkpoint.

## GitHub Sync Button

- [x] Push the latest Dark Mode and compact identity-row changes to the configured public GitHub repository.
- [x] Add a protected server-side GitHub sync procedure and admin button that reports sync success or failure without exposing credentials.
- [x] Add secure GitHub repository/token configuration and document required permissions without committing secrets.
- [x] Add Vitest coverage for sync validation, owner protection, and visible success/error feedback, then publish a checkpoint.

## Automatic GitHub Sync After Save

- [x] Add an admin-controlled automatic-sync setting that persists across sessions without exposing GitHub credentials.
- [x] Trigger one GitHub content sync after each successful profile, project, social-link, or image save when automatic sync is enabled.
- [x] Show clear syncing, success, and failure feedback without blocking or duplicating manual sync actions.
- [x] Add Vitest coverage for the setting, save-trigger behavior, and error handling; update documentation and publish a checkpoint.

## GitHub Pages Image Paths and Compact Section Labels

- [x] Diagnose why profile, cover, and project images fail on the GitHub Pages repository URL.
- [x] Make public image paths work on the GitHub Pages subpath without breaking the managed Full-Stack preview.
- [x] Replace large section title cards with compact elegant text rows in Arabic and English.
- [x] Add regression tests and verify the responsive result on mobile and desktop, then publish the fix.

## GitHub Pages Live Content Sync

- [x] Diagnose why admin-managed content appears on Manus but not on the standalone GitHub Pages site.
- [x] Make the standalone build load the latest approved content snapshot after GitHub sync.
- [x] Verify profile, projects, articles, social links, and image fallbacks on the public GitHub Pages URL.
- [x] Add regression tests, update documentation, and publish the corrected Pages build.

## Rich Content Dashboard, Video Pages, and Profiles Card

- [x] Add structured rich article content with inline image/video blocks, cover image, bilingual title, and full article body rendering.
- [x] Add public article comments with commenter name and text, including validation and a compact comment form below each tutorial.
- [x] Redesign application management so cards use a cover/title and the details dialog has image, description, and store/download action.
- [x] Create dedicated video pages with title, embedded YouTube player, and supporting content instead of a details dialog.
- [x] Reorganize the admin dashboard into clear article, application, video, and social-profile workflows with managed media upload controls.
- [x] Redesign My Profiles as a horizontal card containing four social accounts per row with owner add/edit/delete controls.
- [x] Preserve automatic/manual GitHub sync, expand the exported snapshot, add tests, verify mobile/desktop, and publish the updated site.

## Simplified Blogger-Style Content Studio

- [x] Remove the fragmented content-management workflow and retain one focused rich article editor.
- [x] Let the owner choose the destination section only when publishing the completed article.
- [x] Provide Blogger-style rich text controls for headings, bold, lists, links, images, and embedded video within the editor.
- [x] Make every work card open the same details dialog with details and a button to open its dedicated content page.
- [x] Use a single content-page pattern for tutorials, games/applications, and videos while preserving GitHub synchronization.
- [x] Add regression tests, verify mobile and desktop behavior, and publish the simplified version.

## Publish Failure and Cursor-Based Article Image Upload

- [x] Diagnose and fix the validation or database cause of the content publish failure shown in the admin dashboard.
- [x] Replace URL-based article image insertion with a direct managed file-upload control in the rich editor.
- [x] Preserve the current cursor/selection and insert each uploaded image exactly at that location in the article body.
- [x] Add success and error feedback plus regression tests for publishing and cursor-based image insertion.
- [x] Verify the Full-Stack and GitHub Pages builds, maintain GitHub sync, and publish the correction.

## Article Image Upload Progress

- [x] Show an accessible upload-progress indicator with percentage while a rich-editor image is being read and uploaded.
- [x] Show a clear completion or error state without changing the selected cursor position.
- [x] Add regression coverage, verify the responsive editor, sync GitHub, and publish the update.

## Full Rich Article Rendering

- [x] Diagnose why newly published content can show only its cover, title, and summary instead of the rich editor body.
- [x] Persist the editor body reliably for the primary Arabic article and retain inline images, links, and embedded video markup.
- [x] Render the complete rich body on every dedicated content page with a useful empty-state fallback.
- [x] Add regression tests, verify a complete article path, sync GitHub, and publish the correction.

## Pre-Publish Article Preview

- [x] Add a pre-publish button that opens a complete article preview without saving the draft.
- [x] Render the draft title, summary, rich body, uploaded inline images, links, and embedded video in the preview.
- [x] Add regression coverage, verify responsive behavior, sync GitHub, and publish the preview feature.

## Remove Contact Callout and Footer Tagline

- [x] Remove the dark contact callout card from the public profile page.
- [x] Remove the small footer tagline beneath the copyright line while preserving navigation and profiles.
- [x] Verify responsive layout, sync GitHub Pages, and publish the cleanup.

## Simplified Article Page and Star Rating

- [x] Remove the cover image, external source link, and visitor comment form from dedicated content pages.
- [x] Center the article title and full rich content below the compact profile identity at the top of the page.
- [x] Add an accessible 1–5 star rating control directly after the article content.
- [x] Keep the basic footer identity, add tests, verify responsive layout, sync GitHub, and publish the update.

## Article Sharing and Related Content

- [x] Add simple, accessible social sharing actions directly below the article rating.
- [x] Add a related-articles section at the end of the article page using other published items in the same category.
- [x] Add tests for related-content selection and sharing links, then verify responsive layouts, sync GitHub, and publish.

## Portrait Frame and Article Back Navigation

- [x] Remove the off-center decorative portrait ring that extends beneath the profile photo on the public home card.
- [x] Add a clear back button at the top of article pages that returns visitors to the previous page when available.
- [x] Add regression coverage, verify the mobile and desktop views, sync GitHub, and publish the update.

## GitHub Pages Direct Article URLs

- [x] Diagnose the 404 error when opening an article URL directly on GitHub Pages.
- [x] Add a GitHub Pages fallback that serves the single-page application for article paths while preserving the path and slug.
- [x] Verify a direct article URL on GitHub Pages, add regression coverage, and publish the fix.

## GitHub Pages Image Delivery

- [x] Trace missing managed-storage images in static article HTML and project cards.
- [x] Export public image copies with the GitHub Pages content snapshot and rewrite static image URLs safely.
- [x] Add coverage, verify cover and inline article images on GitHub Pages, and publish the fix.

## Default Article Cover

- [x] Create an elegant default cover asset aligned with the Khairy Eid Aly digital-profile palette.
- [x] Use the default cover for project and article cards when no uploaded cover image is available.
- [x] Add regression coverage, verify mobile and GitHub Pages rendering, then publish the update.

## Admin Default Cover Control

- [x] Store an optional administrator-selected default cover image key with the site profile.
- [x] Add an admin upload, preview, replace, and reset control for the default cover.
- [x] Use the saved cover in public cards and the GitHub Pages snapshot, with the built-in cover as a safe fallback.
- [x] Add tests, migrate the database, verify the admin and public views, sync GitHub, and publish.

## Unified Posts Experience

- [x] Remove public Applications, Tutorials, and Videos sections and show all published content in one Posts / المشاركات section.
- [x] Remove category selection from the content editor and save new items to the unified Posts experience.
- [x] Audit current published items and ensure each dedicated page renders its stored full rich article body rather than only its summary.
- [x] Add regression coverage, verify the responsive public and article views, sync GitHub Pages, and publish.
