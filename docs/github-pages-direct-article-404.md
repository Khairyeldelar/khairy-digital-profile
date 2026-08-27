# GitHub Pages direct article route check

On 2026-08-27, direct navigation to both `/article/Can%20You%20Survive` and `/khairy-digital-profile/article/Can%20You%20Survive` on the published GitHub Pages domain returned GitHub Pages' native 404 page. The static deployment needs a `404.html` single-page-application fallback, and public article links must retain the repository base path.
