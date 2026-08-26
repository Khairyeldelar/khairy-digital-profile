# Render deployment notes

This repository contains a Full-Stack Express/tRPC application. GitHub Pages cannot run the server or the managed `/manus-storage` proxy, so Render is the appropriate external-hosting target for the server build.

## Deployment

1. Create a Render Blueprint from this repository and select `render.yaml`.
2. Provide the required production values listed in the Blueprint. Never commit `.env` files or secret values.
3. Use the build command `corepack enable && pnpm install --frozen-lockfile && pnpm build` and the start command `pnpm start`.
4. Set the OAuth callback URL for the Render service before testing sign-in.

## Storage requirement

The current profile portrait and cover use Manus-managed `/manus-storage/...` paths. Those paths are available in the Full-Stack Manus deployment, but an external Render service needs an external S3-compatible bucket or another public media host. Before using Render as the production host, replace the two managed paths with public object URLs and configure the server-side storage credentials if uploads will be supported.

## Current status

The Render service definition is prepared and the Full-Stack project builds and passes tests locally. Actual external deployment still requires a connected Render account and production credentials for database, OAuth, and external file storage.
