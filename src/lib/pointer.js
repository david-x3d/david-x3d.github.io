// One shared pointer for every requestAnimationFrame effect, so each one
// doesn't need its own window listener.
export const pointer = { x: -9999, y: -9999, active: false, fine: false }

if (typeof window !== 'undefined') {
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
  pointer.fine = fine.matches
  fine.addEventListener('change', (e) => (pointer.fine = e.matches))

  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      pointer.active = true
    },
    { passive: true },
  )
  const release = (e) => {
    if (e.pointerType !== 'mouse') pointer.active = false
  }
  window.addEventListener('pointerup', release)
  window.addEventListener('pointercancel', release)
  document.documentElement.addEventListener('mouseleave', () => (pointer.active = false))
  window.addEventListener('blur', () => (pointer.active = false))
}
