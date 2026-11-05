import { useSyncExternalStore } from 'react'

// Colors canvas effects need. Kept in sync with the CSS variables on every theme switch,
// so a canvas can repaint in the same frame the page changes theme.
const KEYS = ['accent', 'accent-strong', 'sky', 'warm', 'text', 'muted', 'dot', 'line', 'surface', 'surface-2']
export const palette = {}
const listeners = new Set()

export function readPalette() {
  const styles = getComputedStyle(document.documentElement)
  for (const key of KEYS) palette[key] = styles.getPropertyValue(`--${key}`).trim()
}

export function getTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // Private mode or blocked storage: the switch still works for this visit.
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0a0f10' : '#f2f6f5')
  readPalette()
  listeners.forEach((fn) => fn())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme, () => 'dark')
}
