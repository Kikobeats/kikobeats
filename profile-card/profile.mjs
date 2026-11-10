import { blankLine, fieldLine, formatNumber, headingLine, sectionLine, splitFieldLine, uptime } from './render.mjs'

export const PROFILE = {
  handle: 'kiko@beats',
  birthDate: new Date(Date.UTC(1992, 3, 29)),
  system: [
    ['Host', 'Murcia, Spain'],
    ['Kernel', 'Founder @ Microlink'],
    ['Shell', 'fish']
  ],
  previously: 'Vercel, IBM Research, Audiense, Rakuten',
  contact: [
    ['Website', 'kikobeats.com'],
    ['Email', 'josefrancisco.verdu@gmail.com'],
    ['LinkedIn', 'kikobeats'],
    ['X', '@kikobeats']
  ],
  services: ['microlink.io', 'unavatar.io']
}

const withRequests = (host, requests) => (requests[host] ? `${host} (${requests[host]} reqs/mo)` : host)

const fields = pairs => pairs.map(([key, value]) => fieldLine(key, value))

export const buildInfoLines = ({ github, site }, now, profile = PROFILE) => [
  headingLine(profile.handle),
  fieldLine('Uptime', uptime(profile.birthDate, now)),
  ...fields(profile.system),
  blankLine(),
  fieldLine('Work.Running', profile.services.map(host => withRequests(host, site.requests)).join(', ')),
  fieldLine('Work.Previously', profile.previously),
  blankLine(),
  sectionLine('Contact'),
  ...fields(profile.contact),
  blankLine(),
  sectionLine('Stats'),
  splitFieldLine(['Repos', `${formatNumber(github.repos)} {Contributed: ${formatNumber(github.contributedTo)}}`], ['Stars', site.stars]),
  splitFieldLine(['Commits', formatNumber(github.commits)], ['Followers', formatNumber(github.followers)]),
  site.xFollowers
    ? splitFieldLine(['npm', `${site.npmDownloads} downloads/mo`], ['X', `${site.xFollowers} followers`])
    : fieldLine('npm', `${site.npmDownloads} downloads/mo`)
]
