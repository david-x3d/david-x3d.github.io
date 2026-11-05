import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { githubUser } from '../projects'

// Live data from the public GitHub API, shared by every component that asks for the same path.
// The last good answer is kept in localStorage, so a returning visitor sees real numbers right away,
// and it is refreshed in the background every few minutes while the tab is open.
// Without a token GitHub allows 60 requests an hour per visitor; this stays far below that.
const API = 'https://api.github.com'
const STALE_AFTER = 4 * 60_000
const PREFIX = 'gh1:'
const EMPTY = { data: null, at: 0, loading: false, error: null }

const entries = new Map()
const listeners = new Map()
const selectors = new Map()
const inflight = new Map()
let blockedUntil = 0
let polling = false

function read(path) {
  let entry = entries.get(path)
  if (!entry) {
    entry = EMPTY
    try {
      const raw = localStorage.getItem(PREFIX + path)
      if (raw) entry = { ...EMPTY, ...JSON.parse(raw) }
    } catch {
      // Blocked storage: start empty.
    }
    entries.set(path, entry)
  }
  return entry
}

function write(path, patch) {
  entries.set(path, { ...read(path), ...patch })
  listeners.get(path)?.forEach((fn) => fn())
}

export function refresh(path, { force = false } = {}) {
  if (!path || inflight.has(path)) return inflight.get(path)
  const entry = read(path)
  if (!force && Date.now() - entry.at < STALE_AFTER) return
  if (Date.now() < blockedUntil) return

  write(path, { loading: true })
  const select = selectors.get(path) ?? ((d) => d)
  const request = fetch(API + path, { headers: { Accept: 'application/vnd.github+json' }, cache: 'no-cache' })
    .then(async (res) => {
      if (res.status === 403 || res.status === 429) {
        const reset = Number(res.headers.get('x-ratelimit-reset'))
        blockedUntil = reset ? reset * 1000 : Date.now() + 10 * 60_000
        throw new Error('rate-limited')
      }
      if (!res.ok) throw new Error(String(res.status))
      const data = select(await res.json())
      const at = Date.now()
      write(path, { data, at, loading: false, error: null })
      try {
        localStorage.setItem(PREFIX + path, JSON.stringify({ data, at }))
      } catch {
        // Full or blocked storage: the live value still shows for this visit.
      }
    })
    .catch((error) => write(path, { loading: false, error: error.message }))
    .finally(() => inflight.delete(path))
  inflight.set(path, request)
  return request
}

// One timer for everything: every minute, refresh whatever is on screen and has gone stale.
function startPolling() {
  if (polling) return
  polling = true
  const tick = () => {
    if (document.visibilityState !== 'visible') return
    for (const [path, set] of listeners) if (set.size) refresh(path)
  }
  setInterval(tick, 60_000)
  document.addEventListener('visibilitychange', tick)
}

// `select` trims the response before it is stored. Use one select per path.
export function useGitHub(path, select) {
  if (path && select && !selectors.has(path)) selectors.set(path, select)
  const subscribe = useCallback(
    (fn) => {
      if (!path) return () => {}
      startPolling()
      if (!listeners.has(path)) listeners.set(path, new Set())
      const set = listeners.get(path)
      set.add(fn)
      return () => set.delete(fn)
    },
    [path],
  )
  const entry = useSyncExternalStore(
    subscribe,
    () => (path ? read(path) : EMPTY),
    () => EMPTY,
  )
  useEffect(() => {
    refresh(path)
  }, [path])
  return entry
}

export const reposPath = `/users/${githubUser}/repos?per_page=100&sort=pushed`
export const eventsPath = `/users/${githubUser}/events/public?per_page=100`

export function useRepos() {
  return useGitHub(reposPath, (list) =>
    list.map((r) => ({
      name: r.name,
      stars: r.stargazers_count,
      fork: r.fork,
      language: r.language,
      pushed: r.pushed_at,
    })),
  )
}

// GitHub only keeps the last 30 days of public events.
export function useEvents() {
  return useGitHub(eventsPath, (list) =>
    list.map((e) => ({ type: e.type, at: e.created_at, repo: e.repo.name.split('/').pop(), ref: e.payload?.ref_type })),
  )
}

export function useRepo(repo) {
  return useGitHub(repo && `/repos/${githubUser}/${repo}`, (r) => ({
    stars: r.stargazers_count,
    forks: r.forks_count,
    issues: r.open_issues_count,
    pushed: r.pushed_at,
    created: r.created_at,
  }))
}

export function useReleases(repo) {
  return useGitHub(repo && `/repos/${githubUser}/${repo}/releases?per_page=100`, (list) =>
    list
      .filter((r) => !r.draft)
      .map((r) => ({
        tag: r.tag_name,
        at: r.published_at,
        url: r.html_url,
        prerelease: r.prerelease,
        assets: r.assets.map((a) => ({ name: a.name, size: a.size, downloads: a.download_count, url: a.browser_download_url })),
      })),
  )
}

export function useCommits(repo) {
  return useGitHub(repo && `/repos/${githubUser}/${repo}/commits?per_page=6`, (list) =>
    list.map((c) => ({
      sha: c.sha.slice(0, 7),
      message: c.commit.message.split('\n')[0],
      at: c.commit.author?.date ?? c.commit.committer?.date,
      url: c.html_url,
    })),
  )
}
