import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { fetchStats } from './github.mjs'
import { buildInfoLines } from './profile.mjs'
import { renderSvg, THEMES } from './render.mjs'

const LOGIN = 'Kikobeats'
const resolve = file => fileURLToPath(new URL(file, import.meta.url))

const token = process.env.GITHUB_TOKEN
if (!token) {
  console.error('GITHUB_TOKEN is required')
  process.exit(1)
}

const now = new Date()
const stats = await fetchStats({ token, login: LOGIN, now })
const asciiLines = readFileSync(resolve('avatar.txt'), 'utf8').trimEnd().split('\n')
const infoLines = buildInfoLines(stats, now)

for (const [name, theme] of Object.entries(THEMES)) {
  writeFileSync(resolve(`${name}.svg`), renderSvg({ asciiLines, infoLines, theme }))
}

console.log(JSON.stringify({ ...stats, createdAt: stats.createdAt.toISOString() }))
