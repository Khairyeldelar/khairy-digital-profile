# GitHub Pages direct article route check

On 2026-08-27, direct navigation to both `/article/Can%20You%20Survive` and `/khairy-digital-profile/article/Can%20You%20Survive` on the published GitHub Pages domain returned GitHub Pages' native 404 page. The static deployment needs a `404.html` single-page-application fallback, and public article links must retain the repository base path.

After publishing the fallback, the correct repository-prefixed URL loaded the document shell instead of GitHub's native 404 page but showed a blank application view. This requires client-side error inspection before the direct-route fix can be confirmed.

The fallback restored the correct URL in the browser address bar (`/khairy-digital-profile/article/Can%20You%20Survive`) and loaded the current app shell, but the React root contained only the notifications element after load. No browser-console error was emitted. This indicates the path restoration mechanism is active but the route needs a more reliable static-hosting routing strategy.

The project modal now generates a repository-prefixed article link, but its rendered URL contains a duplicate separator (`/khairy-digital-profile//article/...`). This must be normalized before final verification because it can prevent the static route from matching correctly.
