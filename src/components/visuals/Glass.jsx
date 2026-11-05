import { useRef } from 'react'
import { pointer } from '../../lib/pointer'

const ICONS = ['var(--accent)', 'var(--sky)', 'var(--warm)', 'var(--accent-strong)', 'var(--muted)', 'var(--text)']

// KDE Liquid Glass: frosted panels over drifting color. The dock magnifies under the mouse.
export default function Glass({ active }) {
  const dock = useRef(null)
  const icons = useRef([])

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const left = dock.current.getBoundingClientRect().left
    for (const el of icons.current) {
      // offsetLeft ignores transforms, so the magnification doesn't feed back into itself.
      const d = e.clientX - (left + el.offsetLeft + el.offsetWidth / 2)
      const s = 1 + 0.55 * Math.exp(-(d * d) / (2 * 30 * 30))
      el.style.transform = `translateY(${(-(s - 1) * 14).toFixed(1)}px) scale(${s.toFixed(3)})`
    }
  }
  const onLeave = () => {
    for (const el of icons.current) el.style.transform = ''
  }

  const wave = active && !pointer.fine

  return (
    <div className="absolute inset-0 overflow-hidden" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div
        className="blob top-[-20%] left-[-10%] h-[80%] w-[55%] bg-accent"
        style={{ animation: 'blob-a 9s ease-in-out infinite alternate' }}
      />
      <div
        className="blob top-[10%] right-[-15%] h-[85%] w-[50%] bg-sky"
        style={{ animation: 'blob-b 11s ease-in-out infinite alternate' }}
      />
      <div
        className="blob bottom-[-30%] left-[30%] h-[70%] w-[40%] bg-warm"
        style={{ animation: 'blob-c 13s ease-in-out infinite alternate' }}
      />

      <div className="glass glass-sheen absolute top-4 left-1/2 h-[46%] w-[72%] -translate-x-1/2 rounded-2xl p-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-10 rounded-full bg-[color-mix(in_oklab,var(--text)_30%,transparent)]" />
          <span className="ml-auto size-2 rounded-full bg-[color-mix(in_oklab,var(--text)_25%,transparent)]" />
          <span className="size-2 rounded-full bg-[color-mix(in_oklab,var(--text)_25%,transparent)]" />
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="h-2 w-3/4 rounded-full bg-[color-mix(in_oklab,var(--text)_18%,transparent)]" />
          <div className="h-2 w-1/2 rounded-full bg-[color-mix(in_oklab,var(--text)_18%,transparent)]" />
        </div>
      </div>

      <div
        ref={dock}
        className="glass absolute bottom-4 left-1/2 flex -translate-x-1/2 items-end gap-2 rounded-[20px] px-2.5 py-2"
      >
        {ICONS.map((c, i) => (
          <span
            key={c}
            ref={(el) => (icons.current[i] = el)}
            className="block size-8 origin-bottom rounded-[10px] transition-transform duration-150 ease-out"
            style={{
              background: `linear-gradient(160deg, color-mix(in oklab, ${c} 70%, #fff), ${c})`,
              animation: wave ? `dock-wave 1.4s ${i * 0.12}s ease-in-out infinite` : undefined,
            }}
          />
        ))}
      </div>
    </div>
  )
}
