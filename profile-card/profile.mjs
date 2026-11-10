import { blankLine, fieldLine, formatNumber, headingLine, sectionLine, splitFieldLine, uptime } from './render.mjs'

export const PROFILE = {
  handle: 'kiko@beats',
  birthDate: new Date(Date.UTC(1992, 3, 29)),
  system: [
    ['Host', 'Murcia, Spain'],
    ['Kernel', 'Founder @ Microlink'],
    ['Shell', 'fish']
  ],
  languages: [
    ['Languages.Programming', 'JavaScript, TypeScript, Shell'],
    ['Languages.Real', 'Spanish, English']
  ],
  work: [
    ['Work.Running', 'microlink.io, unavatar.io'],
    ['Work.Founded', 'Tesla Hunt'],
    ['Work.Previously', 'Vercel, IBM Research, Audiense, Rakuten']
  ],
  contact: [
    ['Website', 'kikobeats.com'],
    ['Email', 'josefrancisco.verdu@gmail.com'],
    ['LinkedIn', 'kikobeats'],
    ['X', '@kikobeats']
  ],
  services: ['microlink.io', 'unavatar.io']
}

const fields = pairs => pairs.map(([key, value]) => fieldLine(key, value))

export const buildInfoLines = ({ github, site }, now, profile = PROFILE) => [
  headingLine(profile.handle),
  fieldLine('Uptime', uptime(profile.birthDate, now)),
  ...fields(profile.system),
  blankLine(),
  ...fields(profile.languages),
  blankLine(),
  ...fields(profile.work),
  blankLine(),
  sectionLine('Contact'),
  ...fields(profile.contact),
  blankLine(),
  sectionLine('Stats'),
  splitFieldLine(['Repos', `${formatNumber(github.repos)} {Contributed: ${formatNumber(github.contributedTo)}}`], ['Stars', site.stars]),
  splitFieldLine(['Commits', formatNumber(github.commits)], ['Followers', formatNumber(github.followers)]),
  site.xFollowers
    ? splitFieldLine(['npm', `${site.npmDownloads} downloads/mo`], ['X', `${site.xFollowers} followers`])
    : fieldLine('npm', `${site.npmDownloads} downloads/mo`),
  ...fields(profile.services.filter(host => site.requests[host]).map(host => [`Requests.${host}`, `${site.requests[host]} reqs/mo`]))
]
