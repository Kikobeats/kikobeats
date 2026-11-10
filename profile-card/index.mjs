import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { fetchGithubStats } from './github.mjs'
import { buildInfoLines } from './profile.mjs'
import { renderSvg, THEMES } from './render.mjs'
import { fetchSiteNumbers } from './site.mjs'

const LOGIN = 'Kikobeats'
const resolve = file => fileURLToPath(new URL(file, import.meta.url))

const token = process.env.GITHUB_TOKEN
if (!token) {
  console.error('GITHUB_TOKEN is required')
  process.exit(1)
}

const now = new Date()
const [github, site] = await Promise.all([fetchGithubStats({ token, login: LOGIN, now }), fetchSiteNumbers()])
const infoLines = buildInfoLines({ github, site }, now)

for (const [name, theme] of Object.entries(THEMES)) {
  writeFileSync(resolve(`${name}.svg`), renderSvg({ infoLines, theme }))
}

console.log(JSON.stringify({ github, site }))
