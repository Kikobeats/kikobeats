import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { sumCommits, yearRanges } from './github.mjs'
import { buildInfoLines } from './profile.mjs'
import { parseSiteNumbers } from './site.mjs'
import {
  FONT_SIZE,
  GITHUB_README_COLUMN_WIDTH,
  INFO_WIDTH,
  THEMES,
  blankLine,
  fieldLine,
  formatNumber,
  headingLine,
  lineLength,
  renderSvg,
  sectionLine,
  splitFieldLine,
  uptime
} from './render.mjs'

const utc = (year, month, day) => new Date(Date.UTC(year, month - 1, day))

const SITE_FIXTURE = readFileSync(new URL('fixtures/kikobeats.com.txt', import.meta.url), 'utf8')

const STATS = {
  github: { followers: 1752, repos: 571, contributedTo: 89, commits: 47699 },
  site: parseSiteNumbers(SITE_FIXTURE)
}

const cardText = lines => lines.map(line => line.map(({ text }) => text).join(''))

test('uptime counts whole years, months and days', () => {
  assert.equal(uptime(utc(2012, 8, 4), utc(2026, 11, 10)), '14 years, 3 months, 6 days')
  assert.equal(uptime(utc(2012, 8, 4), utc(2013, 8, 4)), '1 year, 0 months, 0 days')
  assert.equal(uptime(utc(2012, 8, 4), utc(2012, 9, 5)), '0 years, 1 month, 1 day')
})

test('uptime borrows days from the previous month', () => {
  assert.equal(uptime(utc(2012, 8, 31), utc(2012, 10, 1)), '0 years, 1 month, 1 day')
  assert.equal(uptime(utc(2023, 1, 31), utc(2024, 3, 1)), '1 year, 1 month, 1 day')
})

test('uptime borrows across the new year boundary', () => {
  assert.equal(uptime(utc(2012, 12, 20), utc(2013, 1, 5)), '0 years, 0 months, 16 days')
  assert.equal(uptime(utc(2012, 8, 4), utc(2027, 1, 3)), '14 years, 4 months, 30 days')
})

test('formatNumber groups thousands', () => {
  assert.equal(formatNumber(47699), '47,699')
  assert.equal(formatNumber(0), '0')
})

test('every info line has the same width so columns align', () => {
  const lines = buildInfoLines(STATS, utc(2026, 11, 10)).filter(line => line.length > 1)
  for (const line of lines) assert.equal(lineLength(line), INFO_WIDTH, line.map(({ text }) => text).join(''))
})

test('uptime on the card counts from the birth date, not the GitHub signup', () => {
  const [, uptimeLine] = buildInfoLines(STATS, utc(2026, 11, 10))
  assert.equal(uptimeLine.at(-1).text, ' 34 years, 6 months, 12 days')
})

test('field lines pad with dots and end with the value', () => {
  const line = fieldLine('OS', 'macOS')
  const text = line.map(({ text }) => text).join('')
  assert.equal(lineLength(line), INFO_WIDTH)
  assert.match(text, /^\. OS: \.+ macOS$/)
})

test('field lines keep at least one dot when the value is too long', () => {
  const [, , dots] = fieldLine('Key', 'x'.repeat(INFO_WIDTH))
  assert.deepEqual(dots, { text: '.', role: 'dots' })
})

test('split field lines hold two pairs within the width', () => {
  const line = splitFieldLine(['Commits', '47,699'], ['Followers', '1,752'])
  const text = line.map(({ text }) => text).join('')
  assert.equal(lineLength(line), INFO_WIDTH)
  assert.match(text, /^\. Commits: \.+ 47,699 \| Followers: \.+ 1,752$/)
})

test('headings fill the width with a rule', () => {
  assert.equal(lineLength(headingLine('kiko@beats')), INFO_WIDTH)
  assert.equal(lineLength(sectionLine('Contact')), INFO_WIDTH)
})

test('card fills the README column without scaling text past GitHub body size', () => {
  const svg = renderSvg({ infoLines: [blankLine()], theme: THEMES.dark })
  const width = Number(svg.match(/ width="(\d+)"/)[1])
  const renderedFontSize = FONT_SIZE * (GITHUB_README_COLUMN_WIDTH / width)
  assert.ok(width <= GITHUB_README_COLUMN_WIDTH, `card ${width}px is wider than the column`)
  assert.ok(renderedFontSize < 16, `text renders at ${renderedFontSize.toFixed(1)}px, GitHub body text is 16px`)
  assert.ok(renderedFontSize <= FONT_SIZE * 1.02, `card is stretched ${(renderedFontSize / FONT_SIZE).toFixed(2)}x`)
})

test('renderSvg escapes markup and emits one text node per line', () => {
  const svg = renderSvg({
    infoLines: [fieldLine('A&B', '<value>'), blankLine()],
    theme: THEMES.dark
  })
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
  assert.equal((svg.match(/<text /g) ?? []).length, 2)
  assert.ok(svg.includes('A&amp;B: '))
  assert.ok(svg.includes(' &lt;value&gt;'))
  assert.ok(!svg.includes('<value>'))
  assert.ok(svg.includes(THEMES.dark.background))
})

test('renderSvg is deterministic', () => {
  const input = { infoLines: buildInfoLines(STATS, utc(2026, 11, 10)), theme: THEMES.light }
  assert.equal(renderSvg(input), renderSvg(input))
})

test('yearRanges covers every year from signup to now without gaps', () => {
  const ranges = yearRanges(new Date('2012-08-04T21:52:28Z'), new Date('2026-11-10T12:00:00Z'))
  assert.equal(ranges.length, 15)
  assert.deepEqual(ranges[0], { year: 2012, from: '2012-08-04T21:52:28.000Z', to: '2012-12-31T23:59:59.000Z' })
  assert.deepEqual(ranges.at(-1), { year: 2026, from: '2026-01-01T00:00:00.000Z', to: '2026-11-10T12:00:00.000Z' })
  ranges.forEach(({ year }, index) => assert.equal(year, 2012 + index))
})

test('yearRanges returns a single range for a same-year signup', () => {
  const ranges = yearRanges(new Date('2026-03-01T00:00:00Z'), new Date('2026-11-10T00:00:00Z'))
  assert.deepEqual(ranges, [{ year: 2026, from: '2026-03-01T00:00:00.000Z', to: '2026-11-10T00:00:00.000Z' }])
})

test('sumCommits adds public commits and private contributions across years', () => {
  const year = (commits, restricted) => ({ totalCommitContributions: commits, restrictedContributionsCount: restricted })
  assert.equal(sumCommits([year(10, 3), year(5, 0)]), 18)
  assert.equal(sumCommits([]), 0)
})

test('parseSiteNumbers reads the headline metrics from the ANSI text page', () => {
  assert.deepEqual(parseSiteNumbers(SITE_FIXTURE), {
    stars: '18,155',
    npmDownloads: '115M',
    xFollowers: '4,157',
    requests: { 'microlink.io': '140M', 'unavatar.io': '229M' }
  })
})

test('parseSiteNumbers fails loudly when the page format changes', () => {
  assert.throws(() => parseSiteNumbers('Kiko Beats'), /missing the stars metric/)
})

test('host is where Kiko lives', () => {
  const text = cardText(buildInfoLines(STATS, utc(2026, 11, 10)))
  assert.ok(text.some(line => /^\. Host: \.+ Murcia, Spain$/.test(line)))
  assert.ok(!text.some(line => line.includes('Location:')))
})

test('the card has no languages or founded lines', () => {
  const text = cardText(buildInfoLines(STATS, utc(2026, 11, 10))).join('\n')
  assert.ok(!text.includes('Languages.'))
  assert.ok(!text.includes('Work.Founded'))
})

test('the running line still fits when request counts reach billions', () => {
  const site = { ...STATS.site, requests: { 'microlink.io': '9.9B', 'unavatar.io': '9.9B' } }
  const line = buildInfoLines({ ...STATS, site }, utc(2026, 11, 10)).find(line => line[1]?.text === 'Work.Running: ')
  assert.equal(lineLength(line), INFO_WIDTH)
  assert.ok(line[2].text.length >= 2)
})

test('sports replaces the shell line', () => {
  const text = cardText(buildInfoLines(STATS, utc(2026, 11, 10)))
  assert.ok(text.some(line => /^\. Sports: \.+ Basketball, Windsurfing, Crossfit$/.test(line)))
  assert.ok(!text.some(line => line.includes('Shell:')))
})

test('gaming is its own section before contact', () => {
  const text = cardText(buildInfoLines(STATS, utc(2026, 11, 10)))
  const heading = text.findIndex(line => line.startsWith('- Gaming '))
  assert.ok(heading > 0)
  assert.match(text[heading + 1], /^\. Playing: \.+ Claude$/)
  assert.match(text[heading + 2], /^\. Played: \.+ Counter Strike, Apex Legends, PUBG$/)
  assert.match(text[heading + 3], /^\. Favorite: \.+ FFVII, Dark Souls$/)
  assert.ok(heading < text.findIndex(line => line.startsWith('- Contact ')))
})

test('kernel is the job title', () => {
  const text = cardText(buildInfoLines(STATS, utc(2026, 11, 10)))
  assert.ok(text.some(line => /^\. Kernel: \.+ Founder @ Microlink$/.test(line)))
})

test('the card shows site metrics next to GitHub stats', () => {
  const text = cardText(buildInfoLines(STATS, utc(2026, 11, 10)))
  assert.ok(text.some(line => /Stars: \.+ 18,155$/.test(line)))
  assert.ok(text.some(line => /npm: \.+ 115M downloads\/mo \| X: \.+ 4,157 followers$/.test(line)))
  assert.ok(text.some(line => /^\. Work\.Running: \.+ microlink\.io \(140M reqs\/mo\), unavatar\.io \(229M reqs\/mo\)$/.test(line)))
  assert.ok(!text.some(line => line.includes('Requests.')))
})

test('parseSiteNumbers treats X followers and requests as optional, like the site does', () => {
  const page = [
    '  https://github.com/kikobeats            18,185 ★',
    '  https://x.com/kikobeats',
    '  https://npm.im/~kikobeats               133M downloads/mo',
    '  https://linkedin.com/in/kikobeats',
    '  https://microlink.io',
    '    Oct 25  Free API key, 25 requests per day'
  ].join('\n')
  assert.deepEqual(parseSiteNumbers(page), { stars: '18,185', npmDownloads: '133M', xFollowers: null, requests: {} })
})

test('the card drops X followers and request counts the site has no number for', () => {
  const site = { ...STATS.site, xFollowers: null, requests: { 'microlink.io': '140M' } }
  const lines = buildInfoLines({ ...STATS, site }, utc(2026, 11, 10))
  const text = cardText(lines)
  assert.ok(text.some(line => /^\. npm: \.+ 115M downloads\/mo$/.test(line)))
  assert.ok(!text.some(line => line.includes('followers') && line.includes('X:')))
  assert.ok(text.some(line => /^\. Work\.Running: \.+ microlink\.io \(140M reqs\/mo\), unavatar\.io$/.test(line)))
  for (const line of lines.filter(line => line.length > 1)) assert.equal(lineLength(line), INFO_WIDTH)
})

test('the card is only the info column, sized to fit it', () => {
  const infoLines = buildInfoLines(STATS, utc(2026, 11, 10))
  const svg = renderSvg({ infoLines, theme: THEMES.dark })
  assert.ok(!svg.includes('ascii'))
  assert.equal((svg.match(/<text /g) ?? []).length, infoLines.length)
  assert.match(svg, new RegExp(`height="${48 + infoLines.length * 20}"`))
})
