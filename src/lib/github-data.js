// Which GitHub API paths the site reads, and how each answer is trimmed before it's stored.
// Shared by the browser (src/lib/github.js) and the build snapshot (scripts/github-snapshot.mjs),
// so both produce exactly the same shape.
import { githubUser, projects } from '../projects.js'

export const repoName = (url) => url.replace(/\/+$/, '').split('/').pop()

export const reposPath = `/users/${githubUser}/repos?per_page=100&sort=pushed`
export const eventsPath = `/users/${githubUser}/events/public?per_page=100`
export const repoPath = (repo) => `/repos/${githubUser}/${repo}`
export const releasesPath = (repo) => `/repos/${githubUser}/${repo}/releases?per_page=100`
export const commitsPath = (repo) => `/repos/${githubUser}/${repo}/commits?per_page=6`

export const selectRepos = (list) =>
  list.map((r) => ({ name: r.name, stars: r.stargazers_count, fork: r.fork, language: r.language, pushed: r.pushed_at }))

// GitHub only keeps the last 30 days of public events.
export const selectEvents = (list) =>
  list.map((e) => ({ type: e.type, at: e.created_at, repo: e.repo.name.split('/').pop(), ref: e.payload?.ref_type }))

export const selectRepo = (r) => ({
  stars: r.stargazers_count,
  forks: r.forks_count,
  issues: r.open_issues_count,
  pushed: r.pushed_at,
  created: r.created_at,
})

export const selectReleases = (list) =>
  list
    .filter((r) => !r.draft)
    .map((r) => ({
      tag: r.tag_name,
      at: r.published_at,
      url: r.html_url,
      prerelease: r.prerelease,
      assets: r.assets.map((a) => ({ name: a.name, size: a.size, downloads: a.download_count, url: a.browser_download_url })),
    }))

export const selectCommits = (list) =>
  list.map((c) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split('\n')[0],
    at: c.commit.author?.date ?? c.commit.committer?.date,
    url: c.html_url,
  }))

// Every path the site can show, with its trim. The snapshot fetches all of them.
export function allPaths() {
  const list = [
    [reposPath, selectRepos],
    [eventsPath, selectEvents],
  ]
  for (const p of projects) {
    if (!p.page) continue
    const repo = repoName(p.github)
    list.push([repoPath(repo), selectRepo], [releasesPath(repo), selectReleases], [commitsPath(repo), selectCommits])
  }
  return list
}
