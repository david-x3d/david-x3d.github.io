import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useRunning } from '../../lib/hooks'
import { AnimatedNumber } from '../ui'
import { Shield } from '../icons'

const QUERIES = [
  ['api.github.com', false],
  ['ads.pixelserve.net', true],
  ['fonts.gstatic.com', false],
  ['metrics.appsdk.io', true],
  ['time.android.com', false],
  ['track.clickfeed.co', true],
  ['api.open-meteo.com', false],
  ['banner.adloop.cc', true],
  ['cdn.jsdelivr.net', false],
  ['crash.reportkit.io', true],
  ['dns.controld.com', false],
  ['beacon.statsly.net', true],
]
const ROWS = 5

// adns-controld: a live DNS log where trackers get blocked as they come in.
export default function Dns({ active }) {
  const root = useRef(null)
  const running = useRunning(root)
  const [state, setState] = useState({ n: ROWS, blocked: 1284 })

  useEffect(() => {
    if (!running) return
    const id = setInterval(
      () =>
        setState((s) => ({
          n: s.n + 1,
          blocked: s.blocked + (QUERIES[s.n % QUERIES.length][1] ? 1 : 0),
        })),
      active ? 450 : 1500,
    )
    return () => clearInterval(id)
  }, [running, active])

  const rows = Array.from({ length: ROWS }, (_, i) => state.n - 1 - i)

  return (
    <div ref={root} className="absolute inset-0 flex flex-col px-4 pt-4 @md:px-8">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface px-3 py-2.5 shadow-[0_1px_0_var(--line)]">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Shield className="size-4 text-accent" />
          Private DNS
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-[10px] text-muted">
            <AnimatedNumber value={state.blocked} duration={0.4} /> blocked
          </span>
          <span className="flex h-[18px] w-8 items-center rounded-full bg-accent p-0.5">
            <span className="ml-auto block size-3.5 rounded-full bg-bg" />
          </span>
        </div>
      </div>
      <ul className="relative mt-2 flex-1 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((n) => {
            const [domain, blocked] = QUERIES[n % QUERIES.length]
            return (
              <motion.li
                key={n}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="flex items-center justify-between gap-3 border-b border-line py-2 font-mono text-[11px]"
              >
                <span className={`truncate ${blocked ? 'text-muted line-through decoration-accent/70' : ''}`}>{domain}</span>
                {blocked ? (
                  <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-accent">blocked</span>
                ) : (
                  <span className="shrink-0 px-2 text-muted">ok</span>
                )}
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </div>
  )
}
