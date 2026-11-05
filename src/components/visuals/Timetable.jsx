import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useRunning } from '../../lib/hooks'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const COLORS = {
  Ma: 'var(--accent)',
  En: 'var(--warm)',
  De: 'var(--sky)',
  Ph: 'var(--accent)',
  CS: 'var(--sky)',
  Bio: 'var(--warm)',
  PE: 'var(--muted)',
  His: 'var(--muted)',
  Art: 'var(--warm)',
}
// rows = periods, columns = days
const PLAN = [
  ['Ma', 'De', 'En', 'CS', 'Bio'],
  ['Ma', 'Ph', 'En', 'CS', 'De'],
  ['De', 'His', 'Ma', 'En', 'Ma'],
  ['PE', 'Art', 'Ph', 'Ma', 'His'],
  ['PE', 'Bio', 'CS', 'De', null],
]
const TODAY = 2
const TIMES = ['08:00', '08:50', '09:45', '10:35', '11:40']
const ROOMS = ['A 204', 'B 112', 'A 015', 'Lab 2', 'B 301']

// Material Untis: today's column steps through the lessons, mirrored on a little watch.
export default function Timetable({ active }) {
  const root = useRef(null)
  const running = useRunning(root)
  const [period, setPeriod] = useState(1)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setPeriod((p) => (p + 1) % PLAN.length), active ? 700 : 1900)
    return () => clearInterval(id)
  }, [running, active])

  const subject = PLAN[period][TODAY]

  return (
    <div ref={root} className="absolute inset-0 flex flex-col justify-center px-4 pt-3 pb-3 @md:px-8">
      <div className="grid grid-cols-5 gap-1.5">
        {DAYS.map((d, i) => (
          <div key={d} className={`pb-1 text-center font-mono text-[10px] ${i === TODAY ? 'text-accent' : 'text-muted'}`}>
            {d}
          </div>
        ))}
        {PLAN.flatMap((row, r) =>
          row.map((s, c) => {
            const now = c === TODAY && r === period
            const col = s ? COLORS[s] : 'transparent'
            return (
              <div
                key={`${r}-${c}`}
                className="grid h-[26px] place-items-center rounded-lg font-mono text-[10px] font-medium transition-all duration-500 ease-[var(--ease-out-expo)]"
                style={{
                  background: s
                    ? now
                      ? col
                      : `color-mix(in oklab, ${col} ${c === TODAY ? 26 : 16}%, transparent)`
                    : 'transparent',
                  color: now ? 'var(--bg)' : col,
                  border: s ? 'none' : '1px dashed var(--line)',
                  transform: now ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: now ? `0 6px 16px -6px ${col}` : 'none',
                  zIndex: now ? 1 : 0,
                }}
              >
                {s}
              </div>
            )
          }),
        )}
      </div>

      <div
        className="absolute right-3 bottom-3 grid size-[88px] place-items-center rounded-full border-[5px] border-[color-mix(in_oklab,var(--text)_75%,var(--bg))] bg-ink text-bg shadow-[var(--shadow)] transition-transform duration-500 ease-[var(--ease-out-expo)] @md:right-6"
        style={{ transform: active ? 'scale(1.08) rotate(-6deg)' : 'none' }}
      >
        <div className="text-center leading-none">
          <div className="font-mono text-[8px] tracking-[0.12em] opacity-60">NOW</div>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={period}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className="mt-1"
            >
              <div className="font-display text-lg font-semibold">{subject}</div>
              <div className="mt-0.5 font-mono text-[8px] opacity-70">
                {TIMES[period]} · {ROOMS[period]}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
