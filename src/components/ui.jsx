import { useEffect, useRef, useState } from 'react'
import { animate, motion, useSpring } from 'motion/react'
import { useLatest } from '../lib/hooks'

export const EASE = [0.16, 1, 0.3, 1]

// Fades and lifts its children in the first time they scroll into view.
export function Reveal({ children, delay = 0, y = 28, className = '' }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

// Pulls its child towards the mouse while hovered and springs back on leave.
export function Magnetic({ children, strength = 0.3, className = '' }) {
  const ref = useRef(null)
  const x = useSpring(0, { stiffness: 260, damping: 18, mass: 0.5 })
  const y = useSpring(0, { stiffness: 260, damping: 18, mass: 0.5 })

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div ref={ref} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset} className={`inline-block ${className}`}>
      {children}
    </motion.div>
  )
}

const defaultFormat = (v) => Math.round(v).toLocaleString('en-US')

// Counts smoothly from the previous value to the new one.
// The text is written straight to the DOM so React never fights the tween.
export function AnimatedNumber({ value, from, format = defaultFormat, duration = 1.1, className = '' }) {
  const ref = useRef(null)
  const prev = useRef(from ?? value)
  const [initial] = useState(() => format(from ?? value))
  const fmt = useLatest(format)

  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        prev.current = v
        if (ref.current) ref.current.textContent = fmt.current(v)
      },
    })
    return () => controls.stop()
  }, [value, duration, fmt])

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {initial}
    </span>
  )
}

function Digit({ digit, delay }) {
  return (
    <span className="relative inline-block overflow-hidden">
      <span className="invisible">0</span>
      <motion.span
        className="digit-strip absolute inset-x-0 top-0 text-center"
        initial={{ y: '0%' }}
        animate={{ y: `${-digit * 10}%` }}
        transition={{ type: 'spring', stiffness: 70, damping: 16, mass: 1, delay }}
      />
    </span>
  )
}

// Odometer: each digit is a strip of 0 to 9 (drawn in CSS, see .digit-strip) that springs into place.
// When a live value changes, only the digits that changed roll.
export function RollingNumber({ value, className = '' }) {
  const text = Math.round(value).toLocaleString('en-US')
  const chars = [...text]
  return (
    <span className={`inline-flex tabular-nums ${className}`}>
      <span aria-hidden className="inline-flex">
        {chars.map((c, i) => {
          // Keyed from the right, so a new leading digit doesn't make the others jump.
          const pos = chars.length - i
          return /\d/.test(c) ? <Digit key={pos} digit={+c} delay={pos * 0.05} /> : <span key={`s${pos}`}>{c}</span>
        })}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  )
}

// Surface with the project-card light: a glow and a lit border that follow the cursor.
export function GlowCard({ as: Tag = 'div', active, className = '', children, onPointerMove, onPointerLeave, ...props }) {
  const ref = useRef(null)
  const [hovered, setHovered] = useState(false)
  const onMove = (e) => {
    onPointerMove?.(e)
    if (e.pointerType !== 'mouse') return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`)
    ref.current.style.setProperty('--my', `${e.clientY - r.top}px`)
    if (!hovered) setHovered(true)
  }
  const onLeave = (e) => {
    onPointerLeave?.(e)
    setHovered(false)
  }
  return (
    <Tag
      ref={ref}
      data-active={active ?? hovered}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`card relative rounded-[28px] border border-line bg-surface ${className}`}
      {...props}
    >
      <div className="card-glow" />
      <div className="card-border" />
      {children}
    </Tag>
  )
}
