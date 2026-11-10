import { blankLine, fieldLine, formatNumber, headingLine, sectionLine, splitFieldLine, uptime } from './render.mjs'

export const PROFILE = {
  handle: 'kiko@beats',
  birthDate: new Date(Date.UTC(1992, 3, 29)),
  system: [
    ['Host', 'microlink.io'],
    ['Kernel', 'Node.js'],
    ['Shell', 'fish'],
    ['Location', 'Murcia, Spain']
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

const requestsOf = (site, host) => {
  const value = site.requests[host]
  if (!value) throw new Error(`kikobeats.com has no reqs/mo for ${host}`)
  return value
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
  splitFieldLine(['npm', `${site.npmDownloads} downloads/mo`], ['X', `${site.xFollowers} followers`]),
  ...fields(profile.services.map(host => [`Requests.${host}`, `${requestsOf(site, host)} reqs/mo`]))
]
