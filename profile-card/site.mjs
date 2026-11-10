const SITE_URL = 'https://kikobeats.com/'
const ANSI_ESCAPE = /\x1b\[[0-9;]*m/g

const METRICS = {
  stars: /github\.com\/kikobeats\s+(\S+)\s+★/i,
  xFollowers: /x\.com\/kikobeats\s+(\S+)\s+followers/i,
  npmDownloads: /npm\.im\/~kikobeats\s+(\S+)\s+downloads\/mo/i
}

const REQUESTS_PER_HOST = /https:\/\/([^\s/]+)\/?\s+(\S+)\s+reqs\/mo/g

export const parseSiteNumbers = raw => {
  const text = raw.replace(ANSI_ESCAPE, '')
  const numbers = {}
  for (const [name, pattern] of Object.entries(METRICS)) {
    const match = text.match(pattern)
    if (!match) throw new Error(`${SITE_URL} is missing the ${name} metric`)
    numbers[name] = match[1]
  }
  numbers.requests = Object.fromEntries([...text.matchAll(REQUESTS_PER_HOST)].map(([, host, value]) => [host, value]))
  return numbers
}

export const fetchSiteNumbers = async () => {
  const response = await fetch(SITE_URL, { headers: { 'user-agent': 'curl/8', accept: 'text/plain' } })
  if (!response.ok) throw new Error(`${SITE_URL} answered ${response.status}`)
  return parseSiteNumbers(await response.text())
}
