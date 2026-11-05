import { createElement, useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

// A tiny history router. Page changes run inside a view transition, so a project card can
// grow into its page, and each history entry remembers where it was scrolled to.
const listeners = new Set()
const emit = () => listeners.forEach((fn) => fn())

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function usePath() {
  return useSyncExternalStore(subscribe, () => location.pathname, () => '/')
}

function scrollAfterRender(hash, top) {
  const target = hash && document.getElementById(decodeURIComponent(hash.slice(1)))
  if (target) target.scrollIntoView({ behavior: 'instant' })
  else window.scrollTo({ top: top ?? 0, behavior: 'instant' })
}

function transition(update) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduce) {
    flushSync(update)
    return
  }
  const root = document.documentElement
  root.dataset.nav = ''
  const t = document.startViewTransition(() => flushSync(update))
  t.finished.finally(() => delete root.dataset.nav)
}

export function navigate(to) {
  const url = new URL(to, location.href)
  if (url.origin !== location.origin) {
    location.href = url.href
    return
  }
  if (url.pathname === location.pathname) {
    const target = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)))
    if (target) target.scrollIntoView({ behavior: 'smooth' })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  history.replaceState({ ...history.state, scroll: window.scrollY }, '')
  transition(() => {
    history.pushState({ scroll: 0 }, '', url.pathname + url.hash)
    emit()
    scrollAfterRender(url.hash)
  })
}

// onClick for any <a> that points inside the site. Leaves new-tab clicks alone.
export function followLink(e, to) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const url = new URL(to, location.href)
  // Same page with a hash: the browser's own smooth anchor scroll is fine.
  if (url.pathname === location.pathname && url.hash) return
  e.preventDefault()
  navigate(to)
}

export function Link({ to, onClick, ...props }) {
  return createElement('a', {
    href: to,
    onClick: (e) => {
      onClick?.(e)
      followLink(e, to)
    },
    ...props,
  })
}

if (typeof window !== 'undefined') {
  history.scrollRestoration = 'manual'
  window.addEventListener('popstate', (e) => {
    transition(() => {
      emit()
      scrollAfterRender(e.state?.scroll == null ? location.hash : '', e.state?.scroll)
    })
  })
  // Remember the position across reloads too, since restoration is manual now.
  window.addEventListener('pagehide', () => history.replaceState({ ...history.state, scroll: window.scrollY }, ''))
  // Wait two frames so React has rendered the page before scrolling into it.
  const saved = history.state?.scroll
  if (saved || location.hash) {
    requestAnimationFrame(() => requestAnimationFrame(() => scrollAfterRender(saved ? '' : location.hash, saved)))
  }
}
