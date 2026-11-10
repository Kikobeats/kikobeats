# profile-card

Renders the neofetch-style intro card at the top of the profile README: profile fields and live stats from GitHub and kikobeats.com, in a dark and a light SVG.

| File | Role |
| --- | --- |
| `profile.mjs` | Static profile fields and the line layout. Edit this to change what the card says. |
| `github.mjs` | GitHub GraphQL stats: repos, contributed repos, followers, and Commits: every commit GitHub credits since signup plus its private contributions count (work in repos the token cannot read, which GitHub does not split by type). |
| `site.mjs` | Reads stars (across Kikobeats, microlinkhq and other orgs), npm downloads/mo, X followers and reqs/mo per service from the plain-text https://kikobeats.com, so the card and the site always agree. Stars and npm are required: the run fails if they are missing. X followers and reqs/mo are optional on the site too, so their lines are left out when the site has no number. |
| `fixtures/kikobeats.com.txt` | Snapshot of the site used by the parser tests. |
| `render.mjs` | Pure SVG rendering: dot leaders, rules, themes, uptime. |
| `index.mjs` | Entry point. Fetches stats and writes `dark.svg` and `light.svg`. |

```sh
npm test                                  # gate tests, no network
GITHUB_TOKEN=$(gh auth token) npm run card # render both SVGs with live stats
```

`.github/workflows/profile-card.yml` refreshes the SVGs daily at 04:00 UTC and on changes to this directory. It uses the built-in `GITHUB_TOKEN`. Commits a token cannot read count as private contributions instead, so the total stays the same as long as "Include private contributions on my profile" is on in GitHub settings.
