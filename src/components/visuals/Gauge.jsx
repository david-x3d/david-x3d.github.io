import { useRef } from 'react'
import { useLatest, useLoop, useRunning } from '../../lib/hooks'

const CX = 160
const CY = 132
const R = 92
const ARC = Math.PI * R
const ARC_PATH = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`
const TICKS = Array.from({ length: 21 }, (_, i) => i / 20)
const START = 0.05

function polar(t, r) {
  const a = Math.PI * (1 - t)
  return [CX + Math.cos(a) * r, CY - Math.sin(a) * r]
}

// Flare: speed test gauge. Idles near zero, runs a "download" while active.
export default function Gauge({ active }) {
  const root = useRef(null)
  const needle = useRef(null)
  const arc = useRef(null)
  const mbps = useRef(null)
  const ping = useRef(null)
  const jitter = useRef(null)
  const value = useRef(START)
  const running = useRunning(root)
  const on = useLatest(active)

  useLoop((now, dt) => {
    const k = dt / 16.67
    const wobble = Math.sin(now * 0.011) * 0.6 + Math.sin(now * 0.0047 + 1) * 0.4
    const target = on.current ? 0.78 + wobble * 0.045 : 0.045 + (Math.sin(now * 0.0016) * 0.5 + 0.5) * 0.04
    value.current += (target - value.current) * (on.current ? 0.035 : 0.06) * k
    const v = value.current
    needle.current.setAttribute('transform', `rotate(${(-90 + 180 * v).toFixed(2)} ${CX} ${CY})`)
    arc.current.style.strokeDashoffset = (ARC * (1 - v)).toFixed(1)
    mbps.current.textContent = Math.round(v * 1000)
    ping.current.textContent = Math.round(on.current ? 9 + wobble * 1.5 : 12 + wobble)
    jitter.current.textContent = (on.current ? 1.4 + wobble * 0.4 : 0.8 + wobble * 0.2).toFixed(1)
  }, running)

  return (
    <div ref={root} className="absolute inset-0 grid place-items-center px-3">
      <svg viewBox="0 0 320 200" className="h-full w-full max-w-[460px]" aria-hidden>
        <g className="font-mono" fontSize="9" fill="var(--muted)" letterSpacing="0.08em">
          <text x="18" y="24">PING</text>
          <text x="18" y="42" fill="var(--text)" fontSize="14" letterSpacing="0">
            <tspan ref={ping}>12</tspan>
            <tspan fill="var(--muted)" fontSize="10"> ms</tspan>
          </text>
          <text x="302" y="24" textAnchor="end">JITTER</text>
          <text x="302" y="42" textAnchor="end" fill="var(--text)" fontSize="14" letterSpacing="0">
            <tspan ref={jitter}>0.8</tspan>
            <tspan fill="var(--muted)" fontSize="10"> ms</tspan>
          </text>
        </g>

        <path d={ARC_PATH} fill="none" stroke="var(--line)" strokeWidth="10" strokeLinecap="round" />
        <path
          ref={arc}
          d={ARC_PATH}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={ARC}
          strokeDashoffset={ARC * (1 - START)}
        />
        {TICKS.map((t) => {
          const major = Math.round(t * 20) % 5 === 0
          const [x1, y1] = polar(t, R - 15)
          const [x2, y2] = polar(t, R - (major ? 25 : 20))
          return (
            <line
              key={t}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="var(--muted)"
              strokeOpacity={major ? 0.75 : 0.35}
              strokeWidth={major ? 1.6 : 1}
              strokeLinecap="round"
            />
          )
        })}
        {[
          [0, '0'],
          [0.5, '500'],
          [1, '1000'],
        ].map(([t, label]) => {
          const [x, y] = polar(t, R - 38)
          return (
            <text key={label} x={x} y={y + 3} textAnchor="middle" className="font-mono" fontSize="8.5" fill="var(--muted)">
              {label}
            </text>
          )
        })}

        <g ref={needle} transform={`rotate(${-90 + 180 * START} ${CX} ${CY})`}>
          <path d={`M ${CX - 3.2} ${CY} L ${CX} ${CY - R + 20} L ${CX + 3.2} ${CY} Z`} fill="var(--text)" />
        </g>
        <circle cx={CX} cy={CY} r="7" fill="var(--surface-2)" stroke="var(--text)" strokeWidth="2.5" />

        <text x={CX} y="176" textAnchor="middle" fontSize="30" fontWeight="650" fill="var(--text)" className="font-display">
          <tspan ref={mbps}>50</tspan>
        </text>
        <text x={CX} y="193" textAnchor="middle" className="font-mono" fontSize="8.5" fill="var(--muted)" letterSpacing="0.1em">
          MBPS · {active ? 'DOWNLOAD' : 'READY'}
        </text>
      </svg>
    </div>
  )
}
