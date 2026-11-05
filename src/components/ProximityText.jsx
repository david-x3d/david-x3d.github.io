import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { pointer } from '../lib/pointer'
import { useLoop } from '../lib/hooks'

// Big type that reacts to the cursor: letters near it get heavier and wider (variable font axes).
// Without a mouse, a slow wave runs through the weights instead.
// Letters from `accentFrom` on are drawn in the accent color.
export default function ProximityText({ text, accentFrom = Infinity, delay = 0.12, className = '' }) {
  const wrap = useRef(null)
  const letters = useRef([])
  const weights = useRef([...text].map(() => 560))
  const inView = useInView(wrap)
  const reduce = useReducedMotion()

  useLoop(
    (now, dt) => {
      const k = Math.min(dt / 16.67, 3)
      const els = letters.current
      const useMouse = pointer.active && pointer.fine
      const targets = []
      for (let i = 0; i < els.length; i++) {
        if (useMouse) {
          const r = els[i].getBoundingClientRect()
          const d = Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2))
          const t = Math.max(0, 1 - d / 420)
          targets.push(330 + 470 * t * t * (3 - 2 * t))
        } else {
          targets.push(520 + 230 * Math.sin(now * 0.0017 - i * 0.55))
        }
      }
      for (let i = 0; i < els.length; i++) {
        const w = (weights.current[i] += (targets[i] - weights.current[i]) * 0.14 * k)
        const wdth = 78 + ((w - 300) / 500) * 22
        els[i].style.fontVariationSettings = `"wght" ${w.toFixed(1)}, "wdth" ${wdth.toFixed(1)}`
      }
    },
    inView && !reduce,
  )

  return (
    <h1
      ref={wrap}
      aria-label={text}
      className={`-ml-[0.04em] font-display leading-[0.86] tracking-[-0.045em] whitespace-nowrap select-none ${className}`}
    >
      {[...text].map((c, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.06em] align-bottom">
          <motion.span
            ref={(el) => (letters.current[i] = el)}
            initial={{ y: '105%' }}
            animate={{ y: 0 }}
            transition={{ delay: delay + i * 0.055, type: 'spring', stiffness: 170, damping: 19 }}
            className={`inline-block ${i >= accentFrom ? 'text-accent' : 'text-ink'}`}
            style={{ fontVariationSettings: '"wght" 560, "wdth" 90' }}
          >
            {c}
          </motion.span>
        </span>
      ))}
    </h1>
  )
}
