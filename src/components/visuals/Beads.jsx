import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { useLatest, useLoop, useRunning } from '../../lib/hooks'
import { pointer } from '../../lib/pointer'
import { palette, useTheme } from '../../lib/theme'

const TAU = Math.PI * 2
const DEFAULT_COUNT = 66
const COLOR_PATTERN = [0, 0, 1, 0, 2, 1, 0, 3]
const SUBSTEPS = 2

// Lay beads out in rows from the bottom of the circle up, so they start without overlapping.
function pack(sim) {
  const { cx, cy, R, r, n } = sim
  let i = 0
  for (let y = cy + R - r; y > cy - R && i < n; y -= r * 1.75) {
    const half = Math.sqrt(Math.max(0, (R - r) ** 2 - (y - cy) ** 2))
    for (let x = cx - half; x <= cx + half && i < n; x += r * 2.02) {
      sim.x[i] = x
      sim.y[i] = y
      sim.vx[i] = 0
      sim.vy[i] = 0
      i++
    }
  }
}

// Bead size shrinks as the count grows, so the tray stays about as full.
const radiusFor = (R, n) => R * 0.085 * Math.sqrt(DEFAULT_COUNT / n)

function makeSim(w, h, dpr, n) {
  const R = Math.min(w, h) / 2 - 20
  return {
    w,
    h,
    dpr,
    n,
    cx: w / 2,
    cy: h / 2,
    R,
    r: radiusFor(R, n),
    x: new Float32Array(n),
    y: new Float32Array(n),
    vx: new Float32Array(n),
    vy: new Float32Array(n),
    px: new Float32Array(n),
    py: new Float32Array(n),
    gx: 0,
    gy: 1,
  }
}

// New count: keep the beads that stay, drop new ones in from the top.
function resize(prev, n) {
  const next = makeSim(prev.w, prev.h, prev.dpr, n)
  next.gx = prev.gx
  next.gy = prev.gy
  for (let i = 0; i < n; i++) {
    if (i < prev.n) {
      next.x[i] = prev.x[i]
      next.y[i] = prev.y[i]
    } else {
      next.x[i] = next.cx + (Math.random() - 0.5) * next.R
      next.y[i] = next.cy - next.R * (0.35 + Math.random() * 0.35)
    }
  }
  return next
}

function step(sim, gx, gy, dt) {
  const { x, y, vx, vy, px, py, cx, cy, R, r, n: N } = sim
  const lim = R - r
  const minD = r * 2
  const minD2 = minD * minD
  const vmax = R * 14
  for (let i = 0; i < N; i++) {
    px[i] = x[i]
    py[i] = y[i]
    vx[i] += gx * dt
    vy[i] += gy * dt
    x[i] += vx[i] * dt
    y[i] += vy[i] * dt
  }
  for (let it = 0; it < 3; it++) {
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = x[j] - x[i]
        const dy = y[j] - y[i]
        const d2 = dx * dx + dy * dy
        if (d2 < minD2 && d2 > 1e-6) {
          const d = Math.sqrt(d2)
          const o = ((minD - d) * 0.5) / d
          x[i] -= dx * o
          y[i] -= dy * o
          x[j] += dx * o
          y[j] += dy * o
        }
      }
    }
    for (let i = 0; i < N; i++) {
      const ex = x[i] - cx
      const ey = y[i] - cy
      const d = Math.sqrt(ex * ex + ey * ey)
      if (d > lim) {
        x[i] = cx + (ex / d) * lim
        y[i] = cy + (ey / d) * lim
      }
    }
  }
  for (let i = 0; i < N; i++) {
    vx[i] = ((x[i] - px[i]) / dt) * 0.996
    vy[i] = ((y[i] - py[i]) / dt) * 0.996
    const v = Math.hypot(vx[i], vy[i])
    if (v > vmax) {
      vx[i] *= vmax / v
      vy[i] *= vmax / v
    }
  }
}

// Cascade: beads inside a watch face. Gravity follows the mouse (or the phone's tilt),
// and a click splashes the beads away from it.
// `count` and `colors` (four shades) are optional; the card uses the site palette.
export default function Beads({ active, count = DEFAULT_COUNT, colors }) {
  const canvasRef = useRef(null)
  const sim = useRef(null)
  const local = useRef({ x: 0, y: 0, inside: false })
  const tilt = useRef(null)
  const running = useRunning(canvasRef)
  const reduce = useReducedMotion()
  const theme = useTheme()
  const on = useLatest(active)
  const countRef = useLatest(count)
  const colorsRef = useLatest(colors)

  const draw = () => {
    const s = sim.current
    const canvas = canvasRef.current
    if (!s || !canvas) return
    const ctx = canvas.getContext('2d')
    const { cx, cy, R, r, x, y, dpr, w, h, n: N } = s
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    ctx.beginPath()
    ctx.arc(cx, cy, R + 8, 0, TAU)
    ctx.fillStyle = palette.surface
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = palette.line
    ctx.stroke()
    ctx.beginPath()
    ctx.roundRect(cx + R + 7, cy - 13, 7, 26, 3)
    ctx.fillStyle = palette.line
    ctx.fill()

    const custom = colorsRef.current
    const shades = custom ?? [palette.accent, palette['accent-strong'], palette.sky, palette.warm]
    for (let c = 0; c < shades.length; c++) {
      ctx.beginPath()
      for (let i = 0; i < N; i++) {
        if (COLOR_PATTERN[i % COLOR_PATTERN.length] !== c) continue
        ctx.moveTo(x[i] + r, y[i])
        ctx.arc(x[i], y[i], r, 0, TAU)
      }
      ctx.fillStyle = shades[c]
      ctx.fill()
      if (custom) {
        // Light colours like Pearl need an edge to read on a white tray.
        ctx.lineWidth = 1
        ctx.strokeStyle = 'rgb(0 0 0 / 0.14)'
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 0.45
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    for (let i = 0; i < N; i++) {
      const hx = x[i] - r * 0.32
      const hy = y[i] - r * 0.36
      ctx.moveTo(hx + r * 0.3, hy)
      ctx.arc(hx, hy, r * 0.3, 0, TAU)
    }
    ctx.fill()
    ctx.globalAlpha = 1
  }
  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => {
    const canvas = canvasRef.current
    const build = () => {
      const { width, height } = canvas.getBoundingClientRect()
      if (!width || !height) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      const prev = sim.current
      const next = makeSim(width, height, dpr, countRef.current)
      if (prev && prev.n === next.n && Math.abs(prev.R - next.R) < 1) {
        // Same size, only moved: keep the beads where they are.
        for (let i = 0; i < next.n; i++) {
          next.x[i] = prev.x[i] - prev.cx + next.cx
          next.y[i] = prev.y[i] - prev.cy + next.cy
        }
        next.gx = prev.gx
        next.gy = prev.gy
      } else {
        pack(next)
      }
      sim.current = next
      drawRef.current()
    }
    build()
    const ro = new ResizeObserver(build)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [countRef])

  useEffect(() => {
    if (sim.current && sim.current.n !== count) {
      sim.current = resize(sim.current, count)
      drawRef.current()
    }
  }, [count])

  // Phones without a mouse: use the real tilt, where the browser allows it without a prompt.
  useEffect(() => {
    if (!active || pointer.fine || typeof DeviceOrientationEvent === 'undefined') return
    if (typeof DeviceOrientationEvent.requestPermission === 'function') return
    const onTilt = (e) => {
      if (e.gamma == null || e.beta == null) return
      tilt.current = { x: Math.sin((e.gamma * Math.PI) / 180), y: Math.sin((e.beta * Math.PI) / 180) }
    }
    window.addEventListener('deviceorientation', onTilt)
    return () => {
      window.removeEventListener('deviceorientation', onTilt)
      tilt.current = null
    }
  }, [active])

  useEffect(() => {
    if (reduce) drawRef.current()
  }, [reduce, theme, colors])

  useLoop((now, dt) => {
    const s = sim.current
    if (!s) return
    const G = 2300 * (s.R / 95)
    let tx
    let ty
    const p = local.current
    if (on.current && p.inside && Math.hypot(p.x - s.cx, p.y - s.cy) > 8) {
      const d = Math.hypot(p.x - s.cx, p.y - s.cy)
      tx = (p.x - s.cx) / d
      ty = (p.y - s.cy) / d
    } else if (on.current && tilt.current && Math.hypot(tilt.current.x, tilt.current.y) > 0.12) {
      const d = Math.hypot(tilt.current.x, tilt.current.y)
      tx = tilt.current.x / d
      ty = tilt.current.y / d
    } else {
      const a = Math.PI / 2 + Math.sin(now * (on.current ? 0.0021 : 0.0007)) * (on.current ? 1.5 : 0.9)
      tx = Math.cos(a)
      ty = Math.sin(a)
    }
    const k = Math.min(dt / 16.67, 2)
    s.gx += (tx - s.gx) * 0.12 * k
    s.gy += (ty - s.gy) * 0.12 * k
    const sub = Math.min(dt / 1000, 1 / 30) / SUBSTEPS
    for (let i = 0; i < SUBSTEPS; i++) step(s, s.gx * G, s.gy * G, sub)
    draw()
  }, running)

  const onMove = (e) => {
    const r = canvasRef.current.getBoundingClientRect()
    local.current = { x: e.clientX - r.left, y: e.clientY - r.top, inside: true }
  }

  const onDown = (e) => {
    const s = sim.current
    if (!s) return
    const r = canvasRef.current.getBoundingClientRect()
    const qx = e.clientX - r.left
    const qy = e.clientY - r.top
    const reach = s.R * 0.75
    const kick = s.R * 9
    for (let i = 0; i < s.n; i++) {
      const dx = s.x[i] - qx
      const dy = s.y[i] - qy
      const d = Math.hypot(dx, dy) || 1
      if (d > reach) continue
      const f = (1 - d / reach) * kick
      s.vx[i] += (dx / d) * f
      s.vy[i] += (dy / d) * f
    }
  }

  return (
    <div
      className="absolute inset-0"
      onPointerMove={onMove}
      onPointerDown={onDown}
      onPointerLeave={() => (local.current.inside = false)}
    >
      <canvas ref={canvasRef} aria-hidden className="h-full w-full" />
    </div>
  )
}
