const GITHUB_README_COLUMN_WIDTH = 847
const FONT_SIZE = 14
const CHAR_WIDTH = FONT_SIZE * 0.62
const LINE_HEIGHT = 20
const PADDING = 24
const INFO_WIDTH = Math.floor((GITHUB_README_COLUMN_WIDTH - PADDING * 2) / CHAR_WIDTH)
const RULE = '─'

export const THEMES = {
  dark: { background: '#161b22', border: '#30363d', text: '#c9d1d9', key: '#ffa657', value: '#a5d6ff', dots: '#616e7f' },
  light: { background: '#f6f8fa', border: '#d0d7de', text: '#24292f', key: '#953800', value: '#0a3069', dots: '#c2cfde' }
}

const escapeXml = text =>
  text.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char])

export const formatNumber = value => new Intl.NumberFormat('en-US').format(value)

const daysInMonth = (year, monthIndex) => new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()

const plural = (count, unit) => `${count} ${unit}${count === 1 ? '' : 's'}`

const MS_PER_DAY = 86_400_000

const toCalendarDay = date => Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())

const addMonthsClamped = (date, months) => {
  const year = date.getUTCFullYear() + Math.floor((date.getUTCMonth() + months) / 12)
  const monthIndex = (date.getUTCMonth() + months) % 12
  return Date.UTC(year, monthIndex, Math.min(date.getUTCDate(), daysInMonth(year, monthIndex)))
}

export const uptime = (from, to) => {
  const end = toCalendarDay(to)
  let totalMonths = (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + to.getUTCMonth() - from.getUTCMonth()
  if (addMonthsClamped(from, totalMonths) > end) totalMonths -= 1
  const days = Math.round((end - addMonthsClamped(from, totalMonths)) / MS_PER_DAY)
  return [plural(Math.floor(totalMonths / 12), 'year'), plural(totalMonths % 12, 'month'), plural(days, 'day')].join(', ')
}

const segment = (text, role) => ({ text, role })

const dottedPair = (key, value, width) => {
  const label = `${key}: `
  const dotCount = Math.max(1, width - label.length - value.length - 1)
  return [segment(label, 'key'), segment('.'.repeat(dotCount), 'dots'), segment(` ${value}`, 'value')]
}

export const fieldLine = (key, value, width = INFO_WIDTH) => [segment('. ', 'dots'), ...dottedPair(key, value, width - 2)]

export const splitFieldLine = ([leftKey, leftValue], [rightKey, rightValue], width = INFO_WIDTH) => {
  const separator = ' | '
  const leftWidth = Math.floor((width - 2 - separator.length) * 0.6)
  const rightWidth = width - 2 - separator.length - leftWidth
  return [
    segment('. ', 'dots'),
    ...dottedPair(leftKey, leftValue, leftWidth),
    segment(separator, 'text'),
    ...dottedPair(rightKey, rightValue, rightWidth)
  ]
}

export const headingLine = (title, width = INFO_WIDTH) => {
  const prefix = `${title} `
  return [segment(prefix, 'text'), segment(RULE.repeat(width - prefix.length), 'text')]
}

export const sectionLine = (title, width = INFO_WIDTH) => {
  const prefix = `- ${title} `
  return [segment(prefix, 'text'), segment(RULE.repeat(width - prefix.length), 'text')]
}

export const blankLine = () => [segment('.', 'dots')]

export const lineLength = segments => segments.reduce((total, { text }) => total + [...text].length, 0)

const renderSegments = segments =>
  segments.map(({ text, role }) => `<tspan class="${role}">${escapeXml(text)}</tspan>`).join('')

const BASELINE_INSET = 5

const renderStyle = theme => `
    text { font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace; font-size: ${FONT_SIZE}px; white-space: pre; }
    .text { fill: ${theme.text}; }
    .key { fill: ${theme.key}; }
    .value { fill: ${theme.value}; }
    .dots { fill: ${theme.dots}; }`

export const renderSvg = ({ infoLines, theme }) => {
  const width = Math.ceil(PADDING * 2 + INFO_WIDTH * CHAR_WIDTH)
  const height = PADDING * 2 + infoLines.length * LINE_HEIGHT
  const baseline = row => PADDING + (row + 1) * LINE_HEIGHT - BASELINE_INSET
  const nodes = infoLines.map((segments, row) =>
    `<text x="${PADDING}" y="${baseline(row)}">${renderSegments(segments)}</text>`)

  return `<svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>${renderStyle(theme)}
  </style>
  <rect width="${width}" height="${height}" rx="12" fill="${theme.background}" stroke="${theme.border}"/>
  ${nodes.join('\n  ')}
</svg>
`
}

export { INFO_WIDTH, FONT_SIZE, GITHUB_README_COLUMN_WIDTH }
