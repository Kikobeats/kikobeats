# profile-card

Renders the neofetch-style intro card at the top of the profile README: ASCII avatar on the left, profile fields and live stats from GitHub and kikobeats.com on the right, in a dark and a light SVG.

| File | Role |
| --- | --- |
| `avatar.txt` | ASCII avatar, committed. Regenerate with `npm run card:avatar` (needs ImageMagick). |
| `profile.mjs` | Static profile fields and the line layout. Edit this to change what the card says. |
| `github.mjs` | GitHub GraphQL stats: repos, contributed repos, followers, all-time commits. |
| `site.mjs` | Reads stars (across Kikobeats, microlinkhq and other orgs), npm downloads/mo, X followers and reqs/mo per service from the plain-text https://kikobeats.com, so the card and the site always agree. Throws if the page format changes, so the workflow fails instead of drawing wrong numbers. |
| `fixtures/kikobeats.com.txt` | Snapshot of the site used by the parser tests. |
| `render.mjs` | Pure SVG rendering: dot leaders, rules, themes, uptime. |
| `index.mjs` | Entry point. Fetches stats and writes `dark.svg` and `light.svg`. |

```sh
npm test                                  # gate tests, no network
GITHUB_TOKEN=$(gh auth token) npm run card # render both SVGs with live stats
```

`.github/workflows/profile-card.yml` refreshes the SVGs daily at 04:00 UTC and on changes to this directory. It uses the built-in `GITHUB_TOKEN`, which only sees public commits. To count private commits too, add a classic PAT with `read:user` as the `PROFILE_CARD_TOKEN` repository secret and enable "Include private contributions on my profile" in GitHub settings.
