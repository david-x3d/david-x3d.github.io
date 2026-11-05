import { useCallback, useEffect, useSyncExternalStore } from 'react'
import {
  commitsPath,
  eventsPath,
  releasesPath,
  repoPath,
  reposPath,
  selectCommits,
  selectEvents,
  selectReleases,
  selectRepo,
  selectRepos,
} from './github-data'

// GitHub data, shared by every component that asks for the same path.
//
// 1. github.json: a snapshot the deploy workflow takes every 30 minutes with its own token.
//    It's on the same server as the site, so it always loads, whatever GitHub's rate limits say.
// 2. The public API, straight from the browser, when the snapshot is more than a few minutes old.
//    GitHub allows 60 of these an hour per IP address; once that's used up the snapshot stays on screen.
// The newest of the two is kept in localStorage, so a returning visitor never starts empty.
const API = 'https://api.github.com'
const STALE_AFTER = 5 * 60_000
const PREFIX = 'gh2:'
const BLOCK_KEY = `${PREFIX}blocked-until`
const EMPTY = { data: null, at: 0, loading: false, error: null }

const entries = new Map()
const listeners = new Map()
const selectors = new Map()
const inflight = new Map()
let polling = false
let snapshot = null

function storage(fn) {
  try {
    return fn(localStorage)
  } catch {
    // Private mode or blocked storage: everything still works for this visit.
  }
}

let blockedUntil = Number(storage((s) => s.getItem(BLOCK_KEY))) || 0

function read(path) {
  let entry = entries.get(path)
  if (!entry) {
    const raw = storage((s) => s.getItem(PREFIX + path))
    entry = raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY
    entries.set(path, entry)
  }
  return entry
}

function write(path, patch) {
  entries.set(path, { ...read(path), ...patch })
  listeners.get(path)?.forEach((fn) => fn())
}

function save(path, data, at) {
  write(path, { data, at, error: null })
  storage((s) => s.setItem(PREFIX + path, JSON.stringify({ data, at })))
}

// Loaded once per visit. Paths it has newer data for replace what's cached.
function loadSnapshot() {
  snapshot ??= fetch(`${import.meta.env.BASE_URL}github.json`, { cache: 'no-cache' })
    .then((res) => (res.ok && res.headers.get('content-type')?.includes('json') ? res.json() : null))
    .then((snap) => {
      if (!snap?.paths) return
      for (const [path, data] of Object.entries(snap.paths)) {
        if (snap.at > read(path).at) save(path, data, snap.at)
      }
    })
    .catch(() => {})
  return snapshot
}

export async function refresh(path, { force = false } = {}) {
  if (!path) return
  await loadSnapshot()
  if (inflight.has(path)) return inflight.get(path)
  if (!force && Date.now() - read(path).at < STALE_AFTER) return
  if (Date.now() < blockedUntil) return

  write(path, { loading: true })
  const select = selectors.get(path) ?? ((d) => d)
  const request = fetch(API + path, { headers: { Accept: 'application/vnd.github+json' } })
    .then(async (res) => {
      if (res.status === 403 || res.status === 429) {
        const reset = Number(res.headers.get('x-ratelimit-reset'))
        blockedUntil = reset ? reset * 1000 : Date.now() + 15 * 60_000
        storage((s) => s.setItem(BLOCK_KEY, String(blockedUntil)))
        throw new Error('rate-limited')
      }
      if (!res.ok) throw new Error(String(res.status))
      save(path, select(await res.json()), Date.now())
    })
    .catch((error) => write(path, { error: error.message }))
    .finally(() => {
      write(path, { loading: false })
      inflight.delete(path)
    })
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

export const useRepos = () => useGitHub(reposPath, selectRepos)
export const useEvents = () => useGitHub(eventsPath, selectEvents)
export const useRepo = (repo) => useGitHub(repo && repoPath(repo), selectRepo)
export const useReleases = (repo) => useGitHub(repo && releasesPath(repo), selectReleases)
export const useCommits = (repo) => useGitHub(repo && commitsPath(repo), selectCommits)
