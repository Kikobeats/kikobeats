import { blankLine, fieldLine, formatNumber, headingLine, sectionLine, splitFieldLine, uptime } from './render.mjs'

export const PROFILE = {
  handle: 'kiko@beats',
  fields: [
    ['OS', 'macOS'],
    ['Shell', 'fish'],
    ['Host', 'microlink.io'],
    ['Kernel', 'Node.js'],
    ['Location', 'Murcia, Spain'],
    ['Previously', 'Vercel, IBM']
  ],
  languages: [
    ['Languages.Programming', 'JavaScript, TypeScript, Shell'],
    ['Languages.Real', 'Spanish, English']
  ],
  projects: [
    ['Projects.Running', 'microlink.io, unavatar.io'],
    ['Projects.OpenSource', 'metascraper, browserless, keyvhq']
  ],
  contact: [
    ['Website', 'kikobeats.com'],
    ['GitHub', 'Kikobeats'],
    ['X', '@Kikobeats']
  ]
}

export const buildInfoLines = (stats, now, profile = PROFILE) => [
  headingLine(profile.handle),
  fieldLine('Uptime', uptime(stats.createdAt, now)),
  ...profile.fields.map(([key, value]) => fieldLine(key, value)),
  blankLine(),
  ...profile.languages.map(([key, value]) => fieldLine(key, value)),
  blankLine(),
  ...profile.projects.map(([key, value]) => fieldLine(key, value)),
  blankLine(),
  sectionLine('Contact'),
  ...profile.contact.map(([key, value]) => fieldLine(key, value)),
  blankLine(),
  sectionLine('GitHub Stats'),
  splitFieldLine(['Repos', `${formatNumber(stats.repos)} {Contributed: ${formatNumber(stats.contributedTo)}}`], ['Stars', formatNumber(stats.stars)]),
  splitFieldLine(['Commits', formatNumber(stats.commits)], ['Followers', formatNumber(stats.followers)]),
  fieldLine('Contributions', formatNumber(stats.contributions))
]
