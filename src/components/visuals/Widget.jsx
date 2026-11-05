import { AnimatedNumber } from '../ui'

const SEGMENTS = 14

function PixelCloud({ className = '', style }) {
  return (
    <svg viewBox="0 0 16 8" className={className} style={style} shapeRendering="crispEdges" aria-hidden>
      <g fill="#fff">
        <rect x="4" y="0" width="5" height="2" />
        <rect x="2" y="2" width="10" height="2" />
        <rect x="0" y="4" width="16" height="3" />
        <rect x="10" y="1" width="3" height="2" />
      </g>
    </svg>
  )
}

function Bar({ label, value }) {
  const filled = Math.round((value / 100) * SEGMENTS)
  const hot = value >= 80
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-[10px] text-muted">
        <span>{label}</span>
        <span className={hot ? 'text-warm' : 'text-ink'}>
          <AnimatedNumber value={value} duration={0.8} />%
        </span>
      </div>
      <div className="flex gap-[3px]">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span
            key={i}
            className="h-2.5 flex-1 rounded-[2px] transition-colors duration-300"
            style={{
              background: i < filled ? (hot ? 'var(--warm)' : 'var(--accent)') : 'var(--line)',
              transitionDelay: `${i * 30}ms`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

// clawd-usage-android: a home-screen widget with a pixel sky cycling through the day.
export default function Widget({ active }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-6 px-5 [background-image:radial-gradient(var(--dot)_1px,transparent_1.2px)] [background-size:14px_14px]">
      <div
        className="w-[236px] overflow-hidden rounded-[26px] border border-line bg-surface shadow-[var(--shadow)] transition-transform duration-500 ease-[var(--ease-out-expo)]"
        style={{ transform: active ? 'translateY(-4px) scale(1.03)' : 'none' }}
      >
        <div className="pixel-sky relative h-[78px] overflow-hidden [image-rendering:pixelated]">
          {[
            [18, 14, 0],
            [64, 30, 0.8],
            [120, 10, 1.6],
            [176, 24, 0.4],
            [206, 8, 1.2],
          ].map(([x, y, delay]) => (
            <span
              key={x}
              className="absolute size-[3px] bg-white"
              style={{ left: x, top: y, animation: `twinkle 2.4s ${delay}s steps(3) infinite` }}
            />
          ))}
          <svg
            viewBox="0 0 8 8"
            className="absolute top-[8px] left-[22px] size-[22px] [animation:sun-arc_16s_ease-in-out_infinite_alternate]"
            shapeRendering="crispEdges"
            aria-hidden
          >
            <g fill="#ffd36b">
              <rect x="2" y="0" width="4" height="8" />
              <rect x="0" y="2" width="8" height="4" />
              <rect x="1" y="1" width="6" height="6" />
            </g>
          </svg>
          <PixelCloud className="absolute top-[30px] left-0 w-12 opacity-90" style={{ animation: 'cloud-drift 22s linear infinite' }} />
          <PixelCloud
            className="absolute top-[50px] left-0 w-8 opacity-70"
            style={{ animation: 'cloud-drift 30s linear -12s infinite' }}
          />
          <div className="absolute inset-x-0 bottom-0 h-[6px] bg-[color-mix(in_oklab,var(--accent)_70%,#1d3b2a)]" />
        </div>
        <div className="space-y-2.5 px-3.5 pt-3 pb-3.5">
          <Bar label="5-hour limit" value={active ? 78 : 42} />
          <Bar label="Weekly" value={active ? 86 : 67} />
        </div>
      </div>

      <div className="hidden grid-cols-2 gap-3 @md:grid" aria-hidden>
        {['var(--accent)', 'var(--sky)', 'var(--warm)', 'var(--text)'].map((c, i) => (
          <span
            key={c}
            className="size-11 rounded-[14px] transition-transform duration-500 ease-[var(--ease-out-expo)]"
            style={{
              background: `color-mix(in oklab, ${c} 80%, var(--surface))`,
              transform: active ? `translateY(${i % 2 ? -3 : 3}px)` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  )
}
