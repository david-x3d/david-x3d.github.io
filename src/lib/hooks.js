import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { useRepos } from './github'

// Latest value in a ref, for reading inside animation loops without restarting them.
export function useLatest(value) {
  const ref = useRef(value)
  useLayoutEffect(() => {
    ref.current = value
  })
  return ref
}

// requestAnimationFrame loop that only runs while `running` is true.
// The callback gets (now, dt) with dt in milliseconds, capped so a background tab doesn't explode physics.
export function useLoop(callback, running) {
  const cb = useLatest(callback)
  useEffect(() => {
    if (!running) return
    let raf
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min(now - last, 48)
      last = now
      cb.current(now, dt)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [running, cb])
}

// True while the element is near the viewport and the visitor hasn't asked for reduced motion.
export function useRunning(ref, margin = '80px') {
  const inView = useInView(ref, { margin })
  const reduce = useReducedMotion()
  return inView && !reduce
}

// Star counts and more per repo, keyed by lowercase repo name. Null until loaded.
export function useGitHubRepos() {
  const { data } = useRepos()
  return useMemo(() => {
    if (!data) return null
    const byName = {}
    for (const r of data) byName[r.name.toLowerCase()] = r
    return byName
  }, [data])
}

export function repoKey(url) {
  return url.replace(/\/+$/, '').split('/').pop().toLowerCase()
}

// Current time in Germany, refreshed every few seconds.
export function useBerlinTime() {
  const format = () =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' }).format(new Date())
  const [time, setTime] = useState(format)
  useEffect(() => {
    const id = setInterval(() => setTime(format()), 5000)
    return () => clearInterval(id)
  }, [])
  return time
}

// Date.now(), refreshed on an interval, for "3 minutes ago" labels.
export function useNow(interval = 15_000) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const UNITS = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
]

export function timeAgo(date, now = Date.now()) {
  const seconds = (new Date(date).getTime() - now) / 1000
  if (Math.abs(seconds) < 45) return 'just now'
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
  }
  return relative.format(Math.round(seconds / 60), 'minute')
}

// Compact version for big numbers: "5 min", "3 h", "12 d".
export function shortAgo(date, now = Date.now()) {
  const minutes = Math.max(0, (now - new Date(date).getTime()) / 60_000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${Math.round(minutes)} min`
  if (minutes < 48 * 60) return `${Math.round(minutes / 60)} h`
  return `${Math.round(minutes / 1440)} d`
}
