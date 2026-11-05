import { useRef } from 'react'
import { useLatest, useLoop, useRunning } from '../../lib/hooks'

const SENSORS = [
  { label: 'Battery', idle: 33.4, on: 39.8 },
  { label: 'SoC', idle: 41.2, on: 58.6 },
]
const W = 300
const H = 28
const X0 = 6
const X1 = 294

const fill = (temp) => Math.min(1, Math.max(0.05, (temp - 20) / 50))
const heat = (temp) => Math.min(100, Math.max(0, ((temp - 34) / 22) * 100))
const color = (temp) => `color-mix(in oklab, var(--accent), var(--warm) ${heat(temp).toFixed(0)}%)`
const label = (temp) => (temp > 50 ? 'hot' : temp > 38 ? 'warm' : 'cool')

function wave(temp, amp, phase) {
  const end = X0 + (X1 - X0) * fill(temp)
  let d = ''
  for (let x = X0; x <= end; x += 3) {
    const y = H / 2 + Math.sin((x / 22) * Math.PI * 2 + phase) * amp
    d += `${x === X0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(2)}`
  }
  return { d, end }
}

// Tempest: Material 3 Expressive style wavy progress bars that heat up while active.
export default function Wave({ active }) {
  const root = useRef(null)
  const paths = useRef([])
  const tracks = useRef([])
  const nums = useRef([])
  const tags = useRef([])
  const sim = useRef({ temps: SENSORS.map((s) => s.idle), amp: 2.6, phase: 0 })
  const running = useRunning(root)
  const on = useLatest(active)

  useLoop((now, dt) => {
    const k = dt / 16.67
    const s = sim.current
    s.amp += ((on.current ? 4.6 : 2.6) - s.amp) * 0.06 * k
    s.phase -= dt * (on.current ? 0.009 : 0.004)
    SENSORS.forEach((sensor, i) => {
      const target = (on.current ? sensor.on : sensor.idle) + Math.sin(now * 0.002 + i) * 0.25
      s.temps[i] += (target - s.temps[i]) * (on.current ? 0.025 : 0.04) * k
      const t = s.temps[i]
      const { d, end } = wave(t, s.amp, s.phase + i * 1.7)
      paths.current[i].setAttribute('d', d)
      paths.current[i].style.stroke = color(t)
      tracks.current[i].setAttribute('x1', Math.min(X1, end + 9).toFixed(1))
      nums.current[i].textContent = t.toFixed(1)
      nums.current[i].style.color = color(t)
      tags.current[i].textContent = label(t)
    })
  }, running)

  return (
    <div ref={root} className="absolute inset-0 flex flex-col justify-center gap-5 px-6 @md:px-10">
      {SENSORS.map((sensor, i) => {
        const initial = wave(sensor.idle, 2.6, i * 1.7)
        return (
          <div key={sensor.label}>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted">
                {sensor.label} · <span ref={(el) => (tags.current[i] = el)}>{label(sensor.idle)}</span>
              </span>
              <span className="font-display text-3xl font-semibold tracking-tight tabular-nums">
                <span ref={(el) => (nums.current[i] = el)} style={{ color: color(sensor.idle) }}>
                  {sensor.idle.toFixed(1)}
                </span>
                <span className="text-xl text-muted">°C</span>
              </span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full overflow-visible" aria-hidden>
              <line
                ref={(el) => (tracks.current[i] = el)}
                x1={initial.end + 9}
                y1={H / 2}
                x2={X1}
                y2={H / 2}
                stroke="var(--line)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              <circle cx={X1} cy={H / 2} r="2.4" fill="var(--muted)" />
              <path
                ref={(el) => (paths.current[i] = el)}
                d={initial.d}
                fill="none"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ stroke: color(sensor.idle) }}
              />
            </svg>
          </div>
        )
      })}
    </div>
  )
}
