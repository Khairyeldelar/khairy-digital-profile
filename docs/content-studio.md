# Content studio workflows

The Admin control room now separates site content into three publishing workflows. All owner saves keep the existing manual and automatic GitHub content synchronization behavior.

| Content type | Card fields | Public interaction | Additional editor controls |
|---|---|---|---|
| Tutorials and information | Cover image and bilingual title | Opens a dedicated article page | Bilingual body, inline image uploads, inline YouTube URLs, placement at the start, middle, or end, and public comments |
| Applications | Cover image and bilingual title | Opens the existing details dialog | Description and a store or download destination URL |
| Videos | Cover image and bilingual title | Opens a dedicated video page | A YouTube destination URL rendered in a responsive player |

## Comments

Visitors can submit a name and comment below a tutorial on the Full-Stack site. The API validates the project id, name, and comment before storing it. The GitHub sync snapshot includes existing comments for viewing on GitHub Pages; submitting new comments requires the Full-Stack deployment because GitHub Pages has no server-side database endpoint.

## GitHub Pages

Saving content with automatic sync enabled creates or updates `content-sync/site-content.json`. The Pages workflow copies this snapshot into the published artifact, allowing the standalone site to show current titles, bodies, external YouTube embeds, accounts, and existing comments after the Pages workflow completes.
