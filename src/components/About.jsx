import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'motion/react'
import { EASE, Reveal, RollingNumber } from './ui'
import { useEvents, useRepos } from '../lib/github'
import { timeAgo, useNow } from '../lib/hooks'
import { pointer } from '../lib/pointer'
import { Link } from '../lib/router'
import { projects } from '../projects'

// Words wrapped in *stars* are highlighted.
const TEXT =
  "I'm David, a hobby developer from Germany. I mostly build *Android apps* in Kotlin and Jetpack Compose, usually because I wanted them myself: a food diary, a speed test, a thermometer for my phone's battery. The rest is smaller stuff for *Wear OS*, KDE Plasma and the browser."

// `match` is checked against each project's tech and platforms to show where a tool was used.
const TOOLBOX = [
  { name: 'Kotlin', match: ['Kotlin'] },
  { name: 'Jetpack Compose', match: ['Jetpack Compose'] },
  { name: 'Material 3 Expressive', match: ['M3 Expressive', 'Material 3', 'Material You'] },
  { name: 'Wear OS', match: ['Wear OS'] },
  { name: 'Coroutines', match: ['Coroutines'] },
  { name: 'KernelSU modules', match: [] },
  { name: 'JavaScript', match: ['JavaScript', 'WebExtension'] },
  { name: 'QML & KDE Plasma', match: ['QML', 'KDE Plasma', 'Plasma 6'] },
]

const SEGMENT_COLORS = ['var(--accent)', 'var(--sky)', 'var(--warm)', 'var(--accent-strong)']

function Word({ children, progress, range, accent }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  const y = useTransform(progress, range, [6, 0])
  return (
    <motion.span style={{ opacity, y }} className={`inline-block ${accent ? 'text-accent' : ''}`}>
      {children}
    </motion.span>
  )
}

// Paragraph that "reads itself" as you scroll: each word lights up in turn.
function ScrollText({ text }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] })
  const tokens = []
  text.split(/(\*[^*]+\*)/).forEach((part) => {
    const accent = part.startsWith('*')
    // Punctuation right after a highlight ("*Wear OS*,") sticks to it without a space.
    const glued = !accent && tokens.length > 0 && part !== '' && !part.startsWith(' ')
    part
      .replace(/\*/g, '')
      .split(' ')
      .filter(Boolean)
      .forEach((w, i) => tokens.push({ w, accent, glue: glued && i === 0 }))
  })

  return (
    <p ref={ref} className="text-[1.65rem] leading-[1.25] font-medium tracking-tight text-balance sm:text-4xl md:text-[2.75rem]">
      {tokens.map((t, i) => {
        const start = i / tokens.length
        return (
          <span key={i}>
            {i > 0 && !t.glue && ' '}
            <Word progress={scrollYProgress} range={[start, start + 1 / tokens.length]} accent={t.accent}>
              {t.w}
            </Word>
          </span>
        )
      })}
    </p>
  )
}

// A counter that rolls up when it scrolls into view, and rolls again whenever GitHub reports a new value.
// A small "+1" floats up when a number grows while you're looking at it.
function Stat({ value, label, children }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  const shown = inView && value != null ? value : 0
  const last = useRef(null)
  const [delta, setDelta] = useState(null)
  useEffect(() => {
    if (!inView || value == null) return
    if (last.current != null && value !== last.current) setDelta({ n: value - last.current, key: Date.now() })
    last.current = value
  }, [inView, value])

  return (
    <div ref={ref} className="relative border-t border-line pt-4">
      <div className="relative font-display text-5xl leading-[1.1] font-semibold tracking-tight">
        <RollingNumber value={shown} />
        <AnimatePresence>
          {delta && (
            <motion.span
              key={delta.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: [0, 1, 1, 0], y: -18 }}
              transition={{ duration: 2.2, ease: EASE, times: [0, 0.15, 0.7, 1] }}
              onAnimationComplete={() => setDelta(null)}
              className="absolute top-0 ml-2 font-mono text-sm font-medium text-accent"
            >
              {delta.n > 0 ? `+${delta.n}` : delta.n}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-1 text-sm text-muted">{label}</div>
      {children}
    </div>
  )
}

// The most used language, worked out from the repos. Hover a slice of the bar to look at another one.
function LanguageStat({ repos }) {
  const [hover, setHover] = useState(null)
  const langs = useMemo(() => {
    if (!repos) return null
    const counts = new Map()
    for (const r of repos) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1)
    return [...counts].sort((a, b) => b[1] - a[1])
  }, [repos])

  const total = langs?.reduce((sum, [, n]) => sum + n, 0) ?? 0
  const [name, count] = (langs && (langs[hover] ?? langs[0])) || ['Kotlin', null]

  return (
    <div className="border-t border-line pt-4">
      <div className="relative h-[1.1em] overflow-hidden font-display text-5xl leading-[1.1] font-semibold tracking-tight">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={name}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="absolute inset-0 whitespace-nowrap"
          >
            {name}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="mt-1 text-sm text-muted">
        {hover == null ? 'most used language' : 'language'}
        {count != null && (
          <span className="font-mono text-xs">
            {' '}
            · {count} of {total} repos
          </span>
        )}
      </div>
      {langs && (
        <div className="mt-3 flex h-2 gap-[3px]" onPointerLeave={() => setHover(null)} role="list" aria-label="Languages by repo count">
          {langs.map(([lang, n], i) => (
            <motion.button
              key={lang}
              type="button"
              role="listitem"
              aria-label={`${lang}: ${n} repos`}
              onPointerEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => setHover(i)}
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.06, duration: 0.8, ease: EASE }}
              style={{
                flexGrow: n,
                background: SEGMENT_COLORS[i] ?? 'color-mix(in oklab, var(--muted) 45%, transparent)',
                opacity: hover == null || hover === i ? 1 : 0.3,
              }}
              className="h-full min-w-1 origin-left rounded-full transition-[opacity,transform] duration-300 hover:scale-y-150"
            />
          ))}
        </div>
      )}
    </div>
  )
}

const EVENT_NAMES = {
  PushEvent: ['push', 'pushes'],
  ReleaseEvent: ['release', 'releases'],
  CreateEvent: ['new branch or repo', 'new branches or repos'],
  PullRequestEvent: ['pull request', 'pull requests'],
  IssuesEvent: ['issue', 'issues'],
  IssueCommentEvent: ['comment', 'comments'],
  WatchEvent: ['star given', 'stars given'],
  ForkEvent: ['fork', 'forks'],
}
const DAYS = 30
const ROWS = 7
const dayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

function startOfDay(t) {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

// The last 30 days of public GitHub activity as a dot matrix: one column per day.
function Activity({ events }) {
  const [active, setActive] = useState(null)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  const days = useMemo(() => {
    const today = startOfDay(Date.now())
    const list = Array.from({ length: DAYS }, (_, i) => ({ t: today - (DAYS - 1 - i) * 86_400_000, total: 0, kinds: {} }))
    // A full page of 100 may not reach back 30 days; days before the oldest event are unknown.
    const cutoff = events && events.length >= 100 ? startOfDay(events[events.length - 1].at) : -Infinity
    for (const e of events ?? []) {
      const i = Math.round((startOfDay(e.at) - list[0].t) / 86_400_000)
      if (i < 0 || i >= DAYS) continue
      list[i].total++
      list[i].kinds[e.type] = (list[i].kinds[e.type] ?? 0) + 1
    }
    for (const d of list) d.unknown = d.t < cutoff
    return list
  }, [events])

  const max = Math.max(1, ...days.map((d) => d.total))
  const total = days.reduce((sum, d) => sum + d.total, 0)
  const shown = active != null ? days[active] : null

  const describe = (d) => {
    if (d.unknown) return 'Not loaded'
    if (!d.total) return 'Nothing public'
    return Object.entries(d.kinds)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, n]) => `${n} ${(EVENT_NAMES[type] ?? ['other', 'other'])[n === 1 ? 0 : 1]}`)
      .join(' · ')
  }

  return (
    <div ref={ref} className="mt-14">
      <div className="mb-4 flex items-baseline justify-between gap-4 text-sm">
        <p className="text-muted">Last 30 days on GitHub</p>
        <p className="min-h-5 text-right font-mono text-xs text-muted">
          {shown ? (
            <>
              <span className="text-ink">{dayFormat.format(shown.t)}</span> · {describe(shown)}
            </>
          ) : (
            events && (
              <>
                <span className="text-ink">{total}</span> public events
              </>
            )
          )}
        </p>
      </div>
      <div
        className="grid touch-pan-y grid-cols-[repeat(30,minmax(0,1fr))] gap-[3px] sm:gap-1"
        onPointerLeave={() => setActive(null)}
        role="img"
        aria-label={`${total} public GitHub events in the last 30 days`}
      >
        {days.map((d, i) => {
          const lit = d.total ? Math.max(1, Math.round(ROWS * Math.sqrt(d.total / max))) : 0
          const isActive = active === i
          return (
            <div
              key={d.t}
              onPointerEnter={() => setActive(i)}
              onPointerDown={() => setActive(i)}
              className={`flex cursor-default flex-col-reverse items-center gap-[3px] rounded-full py-1 transition-colors sm:gap-1 ${
                isActive ? 'bg-accent-soft' : ''
              }`}
            >
              {Array.from({ length: ROWS }, (_, row) => {
                const on = row < lit
                return (
                  <span
                    key={row}
                    className="aspect-square w-full max-w-2 rounded-full transition-[transform,background-color,opacity] duration-500 ease-[var(--ease-out-expo)]"
                    style={{
                      background: on ? 'var(--accent)' : d.unknown ? 'transparent' : 'var(--dot)',
                      opacity: on ? 0.45 + (0.55 * (row + 1)) / lit : 1,
                      transform: inView ? `scale(${isActive && on ? 1.25 : 1})` : 'scale(0)',
                      transitionDelay: inView && active == null ? `${i * 18 + row * 30}ms` : '0ms',
                    }}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-muted">
        <span>{dayFormat.format(days[0].t)}</span>
        <span>Today</span>
      </div>
    </div>
  )
}

function Toolbox() {
  const [hover, setHover] = useState(null)
  const usedIn = useMemo(
    () =>
      Object.fromEntries(
        TOOLBOX.map((tool) => [
          tool.name,
          projects.filter((p) => [...(p.tech ?? []), ...p.platforms].some((t) => tool.match.includes(t))),
        ]),
      ),
    [],
  )
  const list = hover ? usedIn[hover] : null

  return (
    <div onPointerLeave={() => setHover(null)}>
      <p className="mb-4 text-sm text-muted">What I work with</p>
      <ul className="flex flex-wrap gap-2">
        {TOOLBOX.map(({ name }, i) => {
          const n = usedIn[name].length
          return (
            <motion.li
              key={name}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.045, type: 'spring', stiffness: 300, damping: 20 }}
              whileHover={{ y: -3 }}
              drag={pointer.fine}
              dragSnapToOrigin
              dragElastic={0.5}
              whileDrag={{ scale: 1.06, rotate: -3, zIndex: 10 }}
              onPointerEnter={() => setHover(name)}
              onFocus={() => setHover(name)}
              tabIndex={0}
              className={`flex cursor-grab items-center gap-2 rounded-full border bg-surface px-4 py-2 text-[15px] transition-colors select-none active:cursor-grabbing ${
                hover === name ? 'border-accent/50 text-accent' : 'border-line'
              }`}
            >
              {name}
              {n > 0 && (
                <span
                  className={`font-mono text-[11px] transition-colors ${hover === name ? 'text-accent' : 'text-muted'}`}
                  aria-label={`used in ${n} projects`}
                >
                  {n}
                </span>
              )}
            </motion.li>
          )
        })}
      </ul>
      <div className="mt-4 min-h-6 text-sm">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={hover ?? 'none'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="text-muted"
          >
            {hover && list.length === 0 && 'Nothing public on this page yet.'}
            {hover &&
              list.length > 0 &&
              list.map((p, i) => (
                <span key={p.name}>
                  {i > 0 && ', '}
                  {p.slug ? (
                    <Link to={`/${p.slug}`} className="text-ink underline decoration-accent/40 underline-offset-4 hover:decoration-accent">
                      {p.name}
                    </Link>
                  ) : (
                    <span className="text-ink">{p.name}</span>
                  )}
                </span>
              ))}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function About() {
  const repos = useRepos()
  const events = useEvents()
  const now = useNow(30_000)
  const own = repos.data ? repos.data.filter((r) => !r.fork) : null
  const stars = own ? own.reduce((sum, r) => sum + r.stars, 0) : null
  const latest = own?.reduce((a, b) => (new Date(b.pushed) > new Date(a.pushed) ? b : a), own[0])
  const topStarred = own?.reduce((a, b) => (b.stars > a.stars ? b : a), own[0])

  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-28 sm:px-6 md:py-40">
      <div className="grid gap-14 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-1">
            <Reveal delay={0.05}>
              <Stat value={own ? own.length : projects.length} label="open source projects">
                {latest && (
                  <p className="mt-2 font-mono text-[11px] text-muted">
                    last push {timeAgo(latest.pushed, now)}
                  </p>
                )}
              </Stat>
            </Reveal>
            {stars != null && (
              <Reveal delay={0.1}>
                <Stat value={stars} label="stars on GitHub">
                  {topStarred?.stars > 0 && (
                    <p className="mt-2 truncate font-mono text-[11px] text-muted">
                      most on {topStarred.name} ({topStarred.stars})
                    </p>
                  )}
                </Stat>
              </Reveal>
            )}
            <Reveal delay={0.15} className="col-span-2 md:col-span-1">
              <LanguageStat repos={own} />
            </Reveal>
          </div>
        </div>

        <div className="md:col-span-8">
          <ScrollText text={TEXT} />
          <Reveal className="mt-12">
            <Toolbox />
          </Reveal>
          <Reveal>
            <Activity events={events.data} />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
