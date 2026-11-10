const GRAPHQL_ENDPOINT = 'https://api.github.com/graphql'

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

const COMMITS_QUERY = `query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) { totalCommitContributions }
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

export const sumCommits = years => years.reduce((total, year) => total + year.totalCommitContributions, 0)

const fetchCommits = async (token, login, createdAt, now) => {
  const years = await Promise.all(
    yearRanges(createdAt, now).map(({ from, to }) =>
      graphql(token, COMMITS_QUERY, { login, from, to }).then(({ user }) => user.contributionsCollection))
  )
  return sumCommits(years)
}

export const fetchGithubStats = async ({ token, login, now }) => {
  const { user } = await graphql(token, PROFILE_QUERY, { login })
  return {
    followers: user.followers.totalCount,
    repos: user.repositories.totalCount,
    contributedTo: user.repositoriesContributedTo.totalCount,
    commits: await fetchCommits(token, login, new Date(user.createdAt), now)
  }
}
