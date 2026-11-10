import { test } from 'node:test'
import assert from 'node:assert/strict'
import { toChar } from './ascii.mjs'
import { sumContributions, yearRanges } from './github.mjs'
import { buildInfoLines } from './profile.mjs'
import {
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

const STATS = {
  createdAt: new Date('2012-08-04T21:52:28Z'),
  followers: 1752,
  repos: 571,
  contributedTo: 89,
  stars: 9869,
  commits: 47699,
  contributions: 71363
}

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

test('renderSvg escapes markup and emits one text node per line', () => {
  const svg = renderSvg({
    asciiLines: ['<&>', 'ab'],
    infoLines: [fieldLine('A&B', '<value>'), blankLine()],
    theme: THEMES.dark
  })
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)
  assert.equal((svg.match(/<text /g) ?? []).length, 4)
  assert.ok(svg.includes('&lt;&amp;&gt;'))
  assert.ok(svg.includes('A&amp;B: '))
  assert.ok(svg.includes(' &lt;value&gt;'))
  assert.ok(!svg.includes('<value>'))
  assert.ok(svg.includes(THEMES.dark.background))
})

test('renderSvg is deterministic', () => {
  const input = { asciiLines: ['x'], infoLines: buildInfoLines(STATS, utc(2026, 11, 10)), theme: THEMES.light }
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

test('sumContributions adds commits and contributions across years', () => {
  const year = (commits, total) => ({ totalCommitContributions: commits, contributionCalendar: { totalContributions: total } })
  assert.deepEqual(sumContributions([year(10, 20), year(5, 7)]), { commits: 15, contributions: 27 })
  assert.deepEqual(sumContributions([]), { commits: 0, contributions: 0 })
})

test('toChar maps white to blank and black to the densest glyph', () => {
  assert.equal(toChar(255), ' ')
  assert.equal(toChar(0), '$')
  assert.notEqual(toChar(128), ' ')
})
