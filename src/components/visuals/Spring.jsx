import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useRunning } from '../../lib/hooks'
import { ArrowUp } from '../icons'

const MESSAGES = [
  { side: 'user', width: '52%' },
  { side: 'bot', lines: [92, 76, 44] },
  { side: 'user', width: '36%' },
  { side: 'bot', lines: [84, 58] },
]
const PAUSE = 2 // extra steps with everything shown before starting over

// claude-smooth: a chat where every message lands on a spring. Bouncier while active.
export default function Spring({ active }) {
  const root = useRef(null)
  const running = useRunning(root)
  const [step, setStep] = useState(2)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setStep((s) => (s >= MESSAGES.length + PAUSE ? 0 : s + 1)), active ? 650 : 1400)
    return () => clearInterval(id)
  }, [running, active])

  const shown = MESSAGES.slice(0, Math.min(step, MESSAGES.length))
  const typing = MESSAGES[step]?.side === 'bot'
  const spring = { type: 'spring', stiffness: 520, damping: active ? 13 : 22, mass: 0.8 }

  return (
    <div ref={root} className="absolute inset-0 flex flex-col px-5 pt-4 pb-3 @md:px-10">
      <div className="flex flex-1 flex-col gap-2.5 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {shown.map((m, i) =>
            m.side === 'user' ? (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, scale: 0.4, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                transition={spring}
                style={{ width: m.width, originX: 1, originY: 1 }}
                className="ml-auto h-7 shrink-0 rounded-2xl rounded-br-md border border-accent/25 bg-accent-soft"
              />
            ) : (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={spring}
                style={{ originX: 0, originY: 0 }}
                className="shrink-0 space-y-1.5"
              >
                {m.lines.map((w) => (
                  <div key={w} className="h-2 rounded-full bg-[color-mix(in_oklab,var(--text)_16%,transparent)]" style={{ width: `${w}%` }} />
                ))}
              </motion.div>
            ),
          )}
          {typing && (
            <motion.div
              key="typing"
              layout
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.15 } }}
              transition={spring}
              className="flex shrink-0 gap-1 py-1"
            >
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-1.5 rounded-full bg-muted" style={{ animation: `typing 1s ${d * 0.15}s infinite` }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-2 flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-line bg-surface pr-1.5 pl-3.5">
        <span className="text-xs text-muted">Reply</span>
        <span className="h-4 w-px bg-ink [animation:caret_1s_steps(1)_infinite]" />
        <motion.span
          animate={{ scale: active ? [1, 1.15, 1] : 1 }}
          transition={{ duration: 0.6, repeat: active ? Infinity : 0, repeatDelay: 0.3 }}
          className="ml-auto grid size-7 place-items-center rounded-xl bg-accent"
        >
          <ArrowUp className="size-3.5 text-bg" />
        </motion.span>
      </div>
    </div>
  )
}
