const GRAPHQL_ENDPOINT = 'https://api.github.com/graphql'
const PAGE_SIZE = 100

const graphql = async (token, query, variables = {}) => {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { authorization: `bearer ${token}`, 'content-type': 'application/json', 'user-agent': 'profile-card' },
    body: JSON.stringify({ query, variables })
  })
  const text = await response.text()
  const body = response.headers.get('content-type')?.includes('json') ? JSON.parse(text) : null
  if (!response.ok || !body || body.errors) {
    throw new Error(`GitHub GraphQL failed (${response.status}): ${body?.errors ? JSON.stringify(body.errors) : text.slice(0, 200)}`)
  }
  return body.data
}

const PROFILE_QUERY = `query($login: String!) {
  user(login: $login) {
    createdAt
    followers { totalCount }
    repositories(ownerAffiliations: OWNER) { totalCount }
    repositoriesContributedTo(contributionTypes: [COMMIT, PULL_REQUEST, REPOSITORY]) { totalCount }
  }
}`

const STARS_QUERY = `query($login: String!, $cursor: String) {
  user(login: $login) {
    repositories(ownerAffiliations: OWNER, first: ${PAGE_SIZE}, after: $cursor) {
      nodes { stargazerCount }
      pageInfo { hasNextPage endCursor }
    }
  }
}`

export const yearRanges = (createdAt, now) => {
  const ranges = []
  for (let year = createdAt.getUTCFullYear(); year <= now.getUTCFullYear(); year++) {
    const from = year === createdAt.getUTCFullYear() ? createdAt : new Date(Date.UTC(year, 0, 1))
    const to = year === now.getUTCFullYear() ? now : new Date(Date.UTC(year, 11, 31, 23, 59, 59))
    ranges.push({ year, from: from.toISOString(), to: to.toISOString() })
  }
  return ranges
}

const CONTRIBUTIONS_QUERY = `query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      contributionCalendar { totalContributions }
    }
  }
}`

export const sumContributions = years =>
  years.reduce(
    (totals, year) => ({
      commits: totals.commits + year.totalCommitContributions,
      contributions: totals.contributions + year.contributionCalendar.totalContributions
    }),
    { commits: 0, contributions: 0 }
  )

const fetchStars = async (token, login) => {
  let stars = 0
  let cursor = null
  do {
    const { user } = await graphql(token, STARS_QUERY, { login, cursor })
    stars += user.repositories.nodes.reduce((total, { stargazerCount }) => total + stargazerCount, 0)
    cursor = user.repositories.pageInfo.hasNextPage ? user.repositories.pageInfo.endCursor : null
  } while (cursor)
  return stars
}

const fetchContributions = async (token, login, createdAt, now) => {
  const years = await Promise.all(
    yearRanges(createdAt, now).map(({ from, to }) =>
      graphql(token, CONTRIBUTIONS_QUERY, { login, from, to }).then(({ user }) => user.contributionsCollection))
  )
  return sumContributions(years)
}

export const fetchStats = async ({ token, login, now }) => {
  const { user } = await graphql(token, PROFILE_QUERY, { login })
  const createdAt = new Date(user.createdAt)
  const [stars, contributions] = await Promise.all([
    fetchStars(token, login),
    fetchContributions(token, login, createdAt, now)
  ])
  return {
    createdAt,
    followers: user.followers.totalCount,
    repos: user.repositories.totalCount,
    contributedTo: user.repositoriesContributedTo.totalCount,
    stars,
    ...contributions
  }
}
