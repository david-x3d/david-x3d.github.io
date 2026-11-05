import { AnimatePresence, motion } from 'motion/react'
import { useBerlinTime } from '../../lib/hooks'

function UsageBar({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-[10px]">
        <span className="text-muted">{label}</span>
        <span className="font-mono">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-line">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  )
}

// plasma-clawd-usage: a Plasma desktop; the tray widget opens its popup while active.
export default function Panel({ active }) {
  const time = useBerlinTime()
  const c = 2 * Math.PI * 9

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          'radial-gradient(120% 90% at 15% 0%, color-mix(in oklab, var(--accent) 30%, transparent), transparent 60%), radial-gradient(90% 90% at 95% 20%, color-mix(in oklab, var(--sky) 28%, transparent), transparent 60%)',
      }}
    >
      <div
        className="absolute top-5 left-5 h-[54%] w-[56%] overflow-hidden rounded-xl border border-line bg-surface/85 shadow-[var(--shadow)] transition-transform duration-500 ease-[var(--ease-out-expo)]"
        style={{ transform: active ? 'translate(-4px, -4px)' : 'none' }}
      >
        <div className="flex h-6 items-center justify-end gap-1.5 border-b border-line px-2">
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-line" />
          <span className="size-2 rounded-full bg-[color-mix(in_oklab,var(--warm)_70%,var(--line))]" />
        </div>
        <div className="space-y-1.5 p-3">
          <div className="h-2 w-3/4 rounded-full bg-line" />
          <div className="h-2 w-1/2 rounded-full bg-line" />
          <div className="h-2 w-2/3 rounded-full bg-line" />
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            style={{ originX: 0.85, originY: 1 }}
            className="absolute right-3 bottom-12 w-48 space-y-2.5 rounded-2xl border border-line bg-surface p-3 shadow-[var(--shadow)]"
          >
            <div className="text-xs font-semibold">Plan usage</div>
            <UsageBar label="Session" value={38} />
            <UsageBar label="This week" value={61} />
            <div className="font-mono text-[9px] text-muted">Resets in 2 h 14 min</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 flex h-10 items-center gap-1.5 border-t border-line bg-[color-mix(in_oklab,var(--surface)_82%,transparent)] px-2.5 backdrop-blur-md">
        <span className="grid size-6 place-items-center rounded-md bg-accent">
          <span className="size-2 rounded-full bg-bg" />
        </span>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`size-6 rounded-md border border-line ${i === 0 ? 'bg-surface-2' : ''}`} />
        ))}
        <span className="flex-1" />
        <span className={`grid size-7 place-items-center rounded-md transition-colors ${active ? 'bg-accent-soft' : ''}`}>
          <svg viewBox="0 0 24 24" className="size-5 -rotate-90" aria-hidden>
            <circle cx="12" cy="12" r="9" fill="none" stroke="var(--line)" strokeWidth="3" />
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={c}
              style={{ strokeDashoffset: 40, animation: 'ring-breathe 4s ease-in-out infinite' }}
            />
          </svg>
        </span>
        <span className="px-1 font-mono text-[11px]">{time}</span>
      </div>
    </div>
  )
}
