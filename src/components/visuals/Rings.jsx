import { useRef } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { AnimatedNumber } from '../ui'

const RINGS = [
  { r: 58, color: 'var(--accent)', idle: 0.64, on: 0.92 },
  { r: 42, color: 'var(--sky)', idle: 0.46, on: 0.8 },
  { r: 26, color: 'var(--warm)', idle: 0.7, on: 0.95 },
]

const LOGGED = [
  { label: 'Porridge', kcal: 380, via: 'text' },
  { label: 'Flat white', kcal: 120, via: 'voice' },
]
const NEW_ENTRY = { label: 'Banana', kcal: 105, via: 'barcode' }

function ViaIcon({ via }) {
  const common = { className: 'size-3.5 shrink-0 text-accent', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', viewBox: '0 0 24 24', 'aria-hidden': true }
  if (via === 'voice')
    return (
      <svg {...common}>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
      </svg>
    )
  if (via === 'barcode')
    return (
      <svg {...common}>
        <path d="M4 6v12M8 6v12M11 6v12M15 6v12M18 6v12M20 6v12" />
      </svg>
    )
  return (
    <svg {...common}>
      <path d="M4 7V5h16v2M12 5v14M9 19h6" />
    </svg>
  )
}

// Nomi: daily rings fill up and a freshly scanned entry slides into the log.
export default function Rings({ active }) {
  const root = useRef(null)
  const seen = useInView(root, { once: true, margin: '-10%' })
  const entries = active ? [NEW_ENTRY, ...LOGGED] : LOGGED
  const total = 1640 + (active ? NEW_ENTRY.kcal : 0)

  return (
    <div ref={root} className="absolute inset-0 flex items-center justify-center gap-4 px-5 @sm:gap-6 @lg:gap-10">
      <svg viewBox="0 0 140 140" className="size-28 shrink-0 -rotate-90 @sm:size-36 @lg:size-40" aria-hidden>
        {RINGS.map((ring, i) => {
          const c = 2 * Math.PI * ring.r
          const v = seen ? (active ? ring.on : ring.idle) : 0
          return (
            <g key={ring.r}>
              <circle cx="70" cy="70" r={ring.r} fill="none" stroke={ring.color} strokeOpacity="0.16" strokeWidth="12" />
              <circle
                cx="70"
                cy="70"
                r={ring.r}
                fill="none"
                stroke={ring.color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={c * (1 - v)}
                style={{ transition: `stroke-dashoffset 1.4s var(--ease-out-expo) ${i * 0.09}s` }}
              />
            </g>
          )
        })}
      </svg>

      <div className="w-full max-w-60 min-w-0">
        <div className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">Today</div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <AnimatedNumber value={seen ? total : 0} from={0} className="font-display text-3xl font-semibold tracking-tight" />
          <span className="text-sm text-muted">
            <span className="hidden @sm:inline">/ 2,200 </span>kcal
          </span>
        </div>
        <ul className="mt-3 space-y-1.5">
          <AnimatePresence initial={false} mode="popLayout">
            {entries.map((e) => (
              <motion.li
                key={e.label}
                layout
                initial={{ opacity: 0, x: 24, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                className="flex items-center gap-2 rounded-xl bg-surface px-2.5 py-1.5 text-xs shadow-[0_1px_0_var(--line)]"
              >
                <ViaIcon via={e.via} />
                <span className="truncate">{e.label}</span>
                <span className="ml-auto font-mono text-[11px] text-muted">{e.kcal}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  )
}
