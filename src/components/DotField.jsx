import { useEffect, useRef } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { pointer } from '../lib/pointer'
import { palette, useTheme } from '../lib/theme'
import { useLoop } from '../lib/hooks'

const TAU = Math.PI * 2
const RADIUS = 150 // how far the pointer pushes dots
const RIPPLE_LIFE = 1800
const STRIDE = 7 // homeX, homeY, offsetX, offsetY, velX, velY, glow

// Grid of dots behind the hero. The pointer pushes them away like a soft magnet,
// clicks send out a shockwave, and a slow light drifts across so it moves on phones too.
export default function DotField({ className = '' }) {
  const canvasRef = useRef(null)
  const field = useRef({ dots: null, count: 0, w: 0, h: 0, dpr: 1, ripples: [] })
  const inView = useInView(canvasRef, { margin: '100px' })
  const reduce = useReducedMotion()
  const theme = useTheme()

  const draw = (now, dt) => {
    const f = field.current
    const canvas = canvasRef.current
    if (!f.dots || !canvas) return
    const ctx = canvas.getContext('2d')
    const { dots, count, w, h, dpr } = f
    const k = Math.min(dt / 16.67, 3)

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const rect = canvas.getBoundingClientRect()
    const px = pointer.x - rect.left
    const py = pointer.y - rect.top
    const hasPointer = pointer.active && px > -RADIUS && px < w + RADIUS && py > -RADIUS && py < h + RADIUS

    const lx = w * (0.62 + 0.3 * Math.sin(now * 0.00019))
    const ly = h * (0.4 + 0.26 * Math.sin(now * 0.00029 + 1.3))

    f.ripples = f.ripples.filter((r) => now - r.t < RIPPLE_LIFE)
    const ripples = f.ripples
    const damp = Math.pow(0.84, k)
    const buckets = [[], [], [], [], []]

    ctx.beginPath()
    for (let n = 0, i = 0; n < count; n++, i += STRIDE) {
      const hx = dots[i]
      const hy = dots[i + 1]
      let dx = dots[i + 2]
      let dy = dots[i + 3]
      let vx = dots[i + 4]
      let vy = dots[i + 5]
      let fx = 0
      let fy = 0
      let glow = 0

      if (hasPointer) {
        const ex = hx + dx - px
        const ey = hy + dy - py
        const d2 = ex * ex + ey * ey
        if (d2 < RADIUS * RADIUS) {
          const d = Math.sqrt(d2) || 1
          const q = 1 - d / RADIUS
          const s = q * q * 28
          fx += (ex / d) * s
          fy += (ey / d) * s
          glow = q
        }
      }

      for (let r = 0; r < ripples.length; r++) {
        const rip = ripples[r]
        const age = now - rip.t
        const ex = hx - rip.x
        const ey = hy - rip.y
        const d = Math.sqrt(ex * ex + ey * ey) || 1
        const off = Math.abs(d - age * 0.75)
        if (off < 70) {
          const s = (1 - off / 70) * (1 - age / RIPPLE_LIFE)
          fx += (ex / d) * s * 38
          fy += (ey / d) * s * 38
          if (s > glow) glow = s
        }
      }

      const ax = hx - lx
      const ay = hy - ly
      const ambient = Math.max(0, 1 - Math.sqrt(ax * ax + ay * ay) / 340) * 0.42
      const target = Math.max(glow, ambient)

      vx = (vx + (fx - dx) * 0.08 * k) * damp
      vy = (vy + (fy - dy) * 0.08 * k) * damp
      dx += vx * k
      dy += vy * k
      let g = dots[i + 6]
      g += (target - g) * (target > g ? 0.3 : 0.05) * k

      dots[i + 2] = dx
      dots[i + 3] = dy
      dots[i + 4] = vx
      dots[i + 5] = vy
      dots[i + 6] = g

      const wave = 0.5 + 0.5 * Math.sin(hx * 0.011 + hy * 0.017 - now * 0.0011)
      const rad = 0.8 + wave * 0.55 + g * 1.7
      const x = hx + dx
      const y = hy + dy
      if (g < 0.06) {
        ctx.moveTo(x + rad, y)
        ctx.arc(x, y, rad, 0, TAU)
      } else {
        buckets[Math.min(4, (g * 5) | 0)].push(x, y, rad)
      }
    }
    ctx.fillStyle = palette.dot
    ctx.fill()

    ctx.fillStyle = palette.accent
    for (let b = 0; b < buckets.length; b++) {
      const list = buckets[b]
      if (!list.length) continue
      ctx.globalAlpha = 0.3 + b * 0.175
      ctx.beginPath()
      for (let j = 0; j < list.length; j += 3) {
        ctx.moveTo(list[j] + list[j + 2], list[j + 1])
        ctx.arc(list[j], list[j + 1], list[j + 2], 0, TAU)
      }
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  const drawRef = useRef(draw)
  drawRef.current = draw

  useEffect(() => {
    const canvas = canvasRef.current
    const f = field.current

    const build = () => {
      const { width, height } = canvas.getBoundingClientRect()
      if (!width || !height) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      const gap = width < 640 ? 22 : 28
      const cols = Math.floor(width / gap) + 2
      const rows = Math.floor(height / gap) + 2
      const ox = (width - (cols - 1) * gap) / 2
      const oy = (height - (rows - 1) * gap) / 2
      const dots = new Float32Array(cols * rows * STRIDE)
      let i = 0
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots[i] = ox + c * gap
          dots[i + 1] = oy + r * gap
          i += STRIDE
        }
      }
      Object.assign(f, { dots, count: cols * rows, w: width, h: height, dpr })
      drawRef.current(performance.now(), 16)
    }

    build()
    const ro = new ResizeObserver(build)
    ro.observe(canvas)

    const host = canvas.parentElement
    const onDown = (e) => {
      const r = canvas.getBoundingClientRect()
      f.ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() })
      if (f.ripples.length > 5) f.ripples.shift()
    }
    host.addEventListener('pointerdown', onDown)
    return () => {
      ro.disconnect()
      host.removeEventListener('pointerdown', onDown)
    }
  }, [])

  // With reduced motion there is no loop, so repaint once when the theme changes.
  useEffect(() => {
    if (reduce) drawRef.current(performance.now(), 16)
  }, [reduce, theme])

  useLoop(draw, inView && !reduce)

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none ${className}`} />
}
