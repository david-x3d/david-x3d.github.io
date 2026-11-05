import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import DotField from '../components/DotField'
import Footer from '../components/Footer'
import ProximityText from '../components/ProximityText'
import { ArrowLeft, ArrowRight, Check, Copy, Download, GitHubIcon, Shield } from '../components/icons'
import { EASE, GlowCard, Magnetic, Reveal, RollingNumber } from '../components/ui'
import { visuals, Monogram } from '../components/visuals'
import { useCommits, useReleases, useRepo } from '../lib/github'
import { shortAgo, timeAgo, useNow } from '../lib/hooks'
import { repoName as repoOf } from '../lib/github-data'
import { pointer } from '../lib/pointer'
import { Link } from '../lib/router'
import { projects } from '../projects'

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 1, ease: EASE },
})

const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })

function formatSize(bytes) {
  return bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`
}

// Assets people download, not checksums and update manifests.
const isFile = (a) => !/\.(sha256|txt|json|xml|crx)$/i.test(a.name)

function latestRelease(list) {
  const r = list?.find((r) => !r.prerelease) ?? list?.[0]
  return r && { ...r, assets: r.assets.filter(isFile) }
}

function CodeBlock({ label, code }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // No clipboard access: the text can still be selected by hand.
    }
  }
  return (
    <div>
      <p className="mb-2 text-sm text-muted">{label}</p>
      <div className="group/code relative rounded-2xl border border-line bg-bg/60">
        <pre className="overflow-x-auto p-4 pr-14 font-mono text-[12.5px] leading-relaxed">
          {code.split('\n').map((line) => (
            <span key={line} className="block">
              <span className="text-accent select-none">$ </span>
              {line}
            </span>
          ))}
        </pre>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Copied' : `Copy: ${label}`}
          className="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-surface-2 text-muted transition-colors hover:bg-accent hover:text-bg"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={copied ? 'check' : 'copy'}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 26 }}
              className="grid place-items-center"
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </div>
  )
}

// A large screenshot in a desktop window or browser frame. It leans a little towards the cursor.
function Preview({ preview }) {
  const ref = useRef(null)
  const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 20 })
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = ref.current.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 5)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 4)
  }
  const reset = () => {
    rx.set(0)
    ry.set(0)
  }
  const browser = preview.frame === 'browser'

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        initial={{ opacity: 0, y: 60, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-10%' }}
        transition={{ duration: 1.1, ease: EASE }}
        className="[perspective:1600px]"
      >
        <motion.figure
          style={{ rotateX: rx, rotateY: ry }}
          className="overflow-hidden rounded-[22px] border border-line bg-surface shadow-[var(--shadow)]"
        >
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-muted/30" />
              <span className="size-2.5 rounded-full bg-muted/30" />
              <span className="size-2.5 rounded-full bg-muted/30" />
            </span>
            {browser && (
              <span className="mx-auto rounded-full bg-surface-2 px-4 py-1 font-mono text-[11px] text-muted">claude.ai</span>
            )}
            {browser && <span className="w-[42px]" />}
          </div>
          <img src={preview.src} alt={preview.alt} className={`block w-full ${browser ? 'bg-[#f5f4ef]' : ''}`} loading="lazy" />
        </motion.figure>
      </motion.div>
    </section>
  )
}

// The project's card animation, big. Same glow as the cards; Cascade gets colour and count controls.
// With a mouse it plays on hover; on touch screens it plays while centered and a tap toggles it.
function Stage({ project }) {
  const ref = useRef(null)
  const [hovered, setHovered] = useState(false)
  const [tapped, setTapped] = useState(false)
  const centered = useInView(ref, { margin: '-30% 0px -30% 0px' })
  const Visual = visuals[project.visual] ?? Monogram
  const { playground } = project.page
  const names = playground ? Object.keys(playground.colors) : []
  const [color, setColor] = useState(names[0])
  const [count, setCount] = useState(playground?.count[2])
  const beads = project.visual === 'beads'
  const active = beads || hovered || (!pointer.fine && centered !== tapped)

  return (
    <GlowCard
      active={hovered}
      className="p-2"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div
        ref={ref}
        onClick={() => !pointer.fine && setTapped((t) => !t)}
        className="vt-stage @container relative h-[340px] overflow-hidden rounded-[21px] bg-surface-2 sm:h-[400px] md:h-[440px]"
        style={{ '--vt': `stage-${project.slug}` }}
      >
        <div className="absolute inset-0">
          <Visual
            active={active}
            project={project}
            count={count}
            colors={playground?.colors[color]}
          />
        </div>
      </div>

      {playground && (
        <div className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-3 pt-4 pb-2">
          <div role="radiogroup" aria-label="Bead colour" className="flex items-center gap-2">
            {names.map((name) => (
              <button
                key={name}
                type="button"
                role="radio"
                aria-checked={color === name}
                aria-label={name}
                title={name}
                onClick={() => setColor(name)}
                className="relative grid size-8 place-items-center rounded-full"
              >
                {color === name && (
                  <motion.span
                    layoutId="swatch-ring"
                    className="absolute inset-0 rounded-full border-2 border-ink"
                    transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                  />
                )}
                <span
                  className="size-5 rounded-full shadow-[inset_0_-2px_4px_rgb(0_0_0/0.25),inset_0_2px_3px_rgb(255_255_255/0.6)]"
                  style={{ background: playground.colors[name][0] }}
                />
              </button>
            ))}
            <span className="ml-1 font-mono text-[11px] text-muted">{color}</span>
          </div>
          <label className="flex min-w-48 flex-1 items-center gap-3 font-mono text-[11px] text-muted sm:max-w-64">
            <span className="w-20 shrink-0 whitespace-nowrap text-ink tabular-nums">{count} beads</span>
            <input
              type="range"
              min={playground.count[0]}
              max={playground.count[1]}
              value={count}
              onChange={(e) => setCount(+e.target.value)}
              className="h-1 w-full cursor-pointer accent-[var(--accent)]"
            />
          </label>
        </div>
      )}
    </GlowCard>
  )
}

function LiveStat({ value, label, suffix, children }) {
  return (
    <div className="border-t border-line pt-4">
      <div className="font-display text-4xl leading-[1.1] font-semibold tracking-tight md:text-5xl">
        {children ?? (value == null ? <span className="text-muted/40">–</span> : <RollingNumber value={value} />)}
        {suffix}
      </div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  )
}

function Hero({ project, repo, releases }) {
  const now = useNow(30_000)
  const latest = latestRelease(releases)
  const hasFiles = releases?.some((r) => r.assets.length)
  const downloads = releases?.reduce((sum, r) => sum + r.assets.reduce((s, a) => s + a.downloads, 0), 0)
  // One page holds 100 releases; past that, both numbers are a floor.
  const more = releases?.length >= 100 ? '+' : ''
  const cta = latest?.assets.length
    ? { href: latest.url, label: `Get ${latest.tag}`, external: true }
    : project.page.install
      ? { href: '#install', label: 'Install' }
      : { href: `${project.github}/releases`, label: 'Releases', external: true }

  return (
    <section id="top" className="relative overflow-hidden">
      <DotField className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,#000_30%,transparent_85%)]" />
      <div className="relative mx-auto max-w-6xl px-4 pt-28 pb-16 sm:px-6 md:pt-36 md:pb-24">
        <motion.div {...fadeUp(0)}>
          <Link to="/#projects" className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
            <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
            All projects
          </Link>
        </motion.div>

        <div className="mt-10 grid gap-12 md:mt-14 md:grid-cols-12 md:items-center md:gap-10">
          <div className="md:col-span-6 lg:col-span-7">
            <motion.div {...fadeUp(0.05)} className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted">
              {project.platforms.map((p) => (
                <span key={p} className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-strong dark:text-accent">
                  {p}
                </span>
              ))}
              {repo?.created && <span className="ml-1">since {monthYear.format(new Date(repo.created))}</span>}
            </motion.div>
            <ProximityText text={project.name} className="text-[clamp(4rem,15vw,9.5rem)]" />
            <motion.p {...fadeUp(0.45)} className="mt-6 max-w-xl text-2xl leading-snug font-medium text-balance md:text-3xl">
              {project.page.tagline}
            </motion.p>
            <motion.p {...fadeUp(0.55)} className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
              {project.page.intro}
            </motion.p>
            <motion.div {...fadeUp(0.65)} className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href={cta.href}
                  {...(cta.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className="group flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-medium text-bg transition-transform active:scale-95"
                >
                  <Download className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                  {cta.label}
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 rounded-full border border-line bg-surface/60 px-6 py-3.5 font-medium backdrop-blur transition-[border-color,transform] hover:border-accent/50 active:scale-95"
                >
                  <GitHubIcon className="size-[18px]" />
                  Source
                </a>
              </Magnetic>
            </motion.div>
          </div>

          <motion.div {...fadeUp(0.3)} className="md:col-span-6 lg:col-span-5">
            <Stage project={project} />
          </motion.div>
        </div>

        <motion.div {...fadeUp(0.8)} className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 md:mt-20 md:grid-cols-4">
          <LiveStat value={repo?.stars} label="stars" />
          {hasFiles || !releases ? (
            <LiveStat value={downloads} suffix={more} label="downloads" />
          ) : (
            <LiveStat value={repo?.forks} label="forks" />
          )}
          {releases?.length || !releases ? (
            <LiveStat value={releases?.length} suffix={more} label="releases" />
          ) : (
            <LiveStat value={repo?.issues} label="open issues" />
          )}
          <LiveStat label="since the last push">
            {repo?.pushed ? (
              <span title={new Date(repo.pushed).toLocaleString('en-GB')}>{shortAgo(repo.pushed, now)}</span>
            ) : (
              <span className="text-muted/40">–</span>
            )}
          </LiveStat>
        </motion.div>
      </div>
    </section>
  )
}

// One screenshot crossfading into the next, inside the frame it was taken on.
function Screen({ feature, duration, className, fit }) {
  const [ratio, setRatio] = useState(0)
  const reduce = useReducedMotion()
  // A screenshot much taller than the phone scrolls slowly to show its bottom.
  const tall = fit === 'scroll' && ratio > 2.3 ? 1 - 2.167 / ratio : 0
  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.img
        key={feature.screen}
        src={feature.screen}
        alt={feature.title}
        onLoad={(e) => setRatio(e.currentTarget.naturalHeight / e.currentTarget.naturalWidth)}
        initial={{ opacity: 0, scale: 1.06, filter: 'blur(6px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: tall && !reduce ? ['0%', '0%', `${-tall * 100}%`] : '0%' }}
        exit={{ opacity: 0, scale: 0.97, filter: 'blur(6px)' }}
        transition={{
          default: { duration: 0.6, ease: EASE },
          y: { duration: duration / 1000, times: [0, 0.25, 1], ease: 'easeInOut' },
        }}
        className={className}
        draggable={false}
      />
    </AnimatePresence>
  )
}

const SHELL = 'border-[#0b1112] bg-[#0b1112] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.45),0_0_0_1px_var(--line)] dark:border-[#1b2527]'

// Phone, watch or bare image, tilting a little towards the cursor.
function Device({ feature, duration, height }) {
  const ref = useRef(null)
  const rx = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 })
  const ry = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 })
  const frame = feature.frame ?? 'phone'

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const r = ref.current.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 14)
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 10)
  }
  const reset = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`relative flex items-center justify-center [perspective:1200px] ${height}`}
    >
      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--dot)_1px,transparent_1.2px)] [background-size:18px_18px] [mask-image:radial-gradient(closest-side,#000,transparent)]" />
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={frame}
          style={{ rotateX: rx, rotateY: ry }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="relative"
        >
          {frame === 'phone' && (
            <div className={`relative aspect-[9/19.5] w-[230px] rounded-[2.6rem] border-[7px] sm:w-[270px] ${SHELL}`}>
              <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] bg-surface-2">
                <Screen feature={feature} duration={duration} fit="scroll" className="absolute inset-x-0 top-0 w-full" />
              </div>
              <span className="pointer-events-none absolute inset-0 rounded-[2.1rem] bg-[linear-gradient(115deg,rgb(255_255_255/0.12),transparent_35%)]" />
            </div>
          )}
          {frame === 'watch' && (
            <div className="relative">
              <span className={`absolute top-1/2 -right-2.5 h-12 w-3 -translate-y-1/2 rounded-r-md ${SHELL}`} />
              <div className={`relative size-[240px] overflow-hidden rounded-full border-[12px] sm:size-[280px] ${SHELL}`}>
                <Screen feature={feature} duration={duration} className="absolute inset-0 size-full object-cover" />
              </div>
            </div>
          )}
          {frame === 'plain' && (
            <div className="relative grid w-[min(440px,82vw)] place-items-center">
              <Screen
                feature={feature}
                duration={duration}
                className="max-h-[400px] w-full rounded-[18px] object-contain drop-shadow-[0_24px_40px_rgb(0_0_0/0.3)]"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const FEATURE_TIME = 6500

// Feature list next to a device. It moves on by itself while in view; hovering pauses it.
function FeatureShowcase({ features }) {
  const ref = useRef(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const inView = useInView(ref, { margin: '-25% 0px -25% 0px' })
  const reduce = useReducedMotion()
  const running = inView && !paused && !reduce
  const next = () => setActive((a) => (a + 1) % features.length)

  return (
    <div ref={ref} className="grid items-center gap-10 md:grid-cols-12 md:gap-10">
      <div className="md:order-2 md:col-span-5">
        <Device
          feature={features[active]}
          duration={FEATURE_TIME}
          height={features.some((f) => (f.frame ?? 'phone') === 'phone') ? 'h-[540px] sm:h-[620px]' : 'h-[340px] sm:h-[460px]'}
        />
      </div>
      <ol className="md:col-span-7" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
        {features.map((f, i) => {
          const on = i === active
          return (
            <li key={f.title} className="border-t border-line last:border-b">
              <button
                type="button"
                onClick={() => setActive(i)}
                onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
                aria-expanded={on}
                className="group relative w-full py-5 text-left"
              >
                <span className="flex items-baseline gap-4">
                  <span className={`font-mono text-xs transition-colors ${on ? 'text-accent' : 'text-muted'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`text-xl font-semibold tracking-tight transition-colors duration-300 md:text-2xl ${
                      on ? 'text-ink' : 'text-muted group-hover:text-ink'
                    }`}
                  >
                    {f.title}
                  </span>
                </span>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.span
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="block overflow-hidden"
                    >
                      <span className="block max-w-lg pt-2 pl-9 leading-relaxed text-muted">{f.text}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
                {on && !reduce && (
                  <span className="absolute inset-x-0 -bottom-px h-px overflow-hidden">
                    <span
                      key={active}
                      onAnimationEnd={next}
                      className="block h-full origin-left bg-accent [animation:feature-progress_linear_forwards]"
                      style={{ animationDuration: `${FEATURE_TIME}ms`, animationPlayState: running ? 'running' : 'paused' }}
                    />
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function FeatureGrid({ features }) {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f, i) => (
        <motion.li
          key={f.title}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -8% 0px' }}
          transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: EASE }}
        >
          <GlowCard className="group h-full p-7">
            <span className="relative font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="relative mt-8 text-xl font-semibold tracking-tight transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1">
              {f.title}
            </h3>
            <p className="relative mt-2 leading-relaxed text-muted">{f.text}</p>
          </GlowCard>
        </motion.li>
      ))}
    </ol>
  )
}

// A word that flips through a list, like the app's "Today" in every language it speaks.
function Cycle({ words }) {
  const [i, setI] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!inView || reduce) return
    const id = setInterval(() => setI((n) => (n + 1) % words.length), 1400)
    return () => clearInterval(id)
  }, [inView, reduce, words.length])

  return (
    <span ref={ref} className="relative inline-flex h-[1.4em] overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={words[i]}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="inline-block"
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function Spec({ spec, index }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  return (
    <Reveal delay={index * 0.06}>
      <div ref={ref} className="group border-t border-line pt-5">
        <div className="font-display text-5xl leading-[1.1] font-semibold tracking-tight transition-[font-variation-settings,color] duration-500 group-hover:text-accent group-hover:[font-variation-settings:'wght'_760] md:text-6xl">
          {typeof spec.value === 'number' ? <RollingNumber value={inView ? spec.value : 0} /> : spec.value}
          {spec.suffix && <span className="text-[0.55em] text-muted">{spec.suffix}</span>}
        </div>
        <div className="mt-1 text-sm font-medium">{spec.label}</div>
        {spec.cycle && (
          <div className="mt-3 font-mono text-xs text-accent">
            <Cycle words={spec.cycle} />
          </div>
        )}
        <p className="mt-2 max-w-60 text-sm leading-relaxed text-muted">{spec.note}</p>
      </div>
    </Reveal>
  )
}

function Skeleton({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-2xl bg-surface-2" style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </div>
  )
}

function Unavailable({ project }) {
  return (
    <p className="text-sm text-muted">
      GitHub didn't answer just now.{' '}
      <a href={project.github} target="_blank" rel="noreferrer" className="text-ink underline decoration-accent/40 underline-offset-4">
        See it on GitHub
      </a>
    </p>
  )
}

function Releases({ project, releases }) {
  const now = useNow(30_000)
  const list = releases.data
  const latest = latestRelease(list)
  const { install } = project.page

  return (
    <GlowCard className="flex h-full flex-col p-6 md:p-8">
      <div className="relative flex items-baseline justify-between gap-4">
        <h3 className="text-sm text-muted">{latest || !install ? 'Latest release' : 'Install'}</h3>
        {latest && <span className="font-mono text-[11px] text-muted">{timeAgo(latest.at, now)}</span>}
      </div>
      {latest ? (
        <>
          <a
            href={latest.url}
            target="_blank"
            rel="noreferrer"
            className="relative mt-2 inline-block font-display text-5xl font-semibold tracking-tight transition-colors hover:text-accent"
          >
            {latest.tag}
          </a>
          {!latest.assets.length && <p className="relative mt-2 text-sm text-muted">Source only, no files attached.</p>}
          <ul className="relative mt-6 space-y-2">
            {latest.assets.map((a) => (
              <li key={a.name}>
                <a
                  href={a.url}
                  className="group flex items-center gap-3 rounded-2xl border border-line bg-bg/50 px-4 py-3 transition-colors hover:border-accent/50"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-bg">
                    <Download className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[13px]">{a.name}</span>
                    <span className="block font-mono text-[11px] text-muted">
                      {formatSize(a.size)} · {a.downloads.toLocaleString('en-US')} downloads
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </>
      ) : list && !list.length ? (
        <p className="relative mt-2 text-sm text-muted">{install ? 'No releases. It installs from source:' : 'No releases yet.'}</p>
      ) : releases.error ? (
        <div className="relative mt-4">
          <Unavailable project={project} />
        </div>
      ) : (
        <div className="relative mt-4">
          <Skeleton rows={2} />
        </div>
      )}

      {install && (
        <div className="relative mt-6 space-y-4">
          {install.map((step) => (
            <CodeBlock key={step.label} label={step.label} code={step.code} />
          ))}
        </div>
      )}

      <dl className="relative mt-8 grid gap-x-6 gap-y-2 border-t border-line pt-5 text-sm sm:grid-cols-[auto_1fr]">
        {project.page.requirements?.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-muted">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
        {project.page.license && (
          <div className="contents">
            <dt className="text-muted">License</dt>
            <dd>{project.page.license}</dd>
          </div>
        )}
      </dl>
      {project.page.note && (
        <p className="relative mt-6 flex gap-3 rounded-2xl bg-accent-soft p-4 text-sm leading-relaxed">
          <Shield className="mt-0.5 size-4 shrink-0 text-accent" />
          {project.page.note}
        </p>
      )}
    </GlowCard>
  )
}

function Commits({ project, commits }) {
  const now = useNow(30_000)
  const list = commits.data

  return (
    <div className="flex h-full flex-col px-1 py-2 md:px-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-sm text-muted">Recent commits</h3>
        <a href={`${project.github}/commits`} target="_blank" rel="noreferrer" className="font-mono text-[11px] text-muted hover:text-ink">
          all →
        </a>
      </div>
      {list ? (
        <ol className="relative mt-6 border-l border-line">
          {list.map((c, i) => (
            <motion.li
              key={c.sha}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.6, ease: EASE }}
              className="group relative pb-6 pl-6 last:pb-0"
            >
              <span
                className={`absolute top-1.5 -left-[5px] size-[9px] rounded-full border-2 border-bg transition-transform duration-300 group-hover:scale-150 ${
                  i === 0 ? 'bg-accent' : 'bg-muted/50 group-hover:bg-accent'
                }`}
              />
              <a href={c.url} target="_blank" rel="noreferrer" className="block">
                <span className="line-clamp-2 leading-snug transition-colors group-hover:text-accent">{c.message}</span>
                <span className="mt-1 block font-mono text-[11px] text-muted">
                  {c.sha} · {timeAgo(c.at, now)}
                </span>
              </a>
            </motion.li>
          ))}
        </ol>
      ) : commits.error ? (
        <div className="mt-6">
          <Unavailable project={project} />
        </div>
      ) : (
        <div className="mt-6">
          <Skeleton rows={4} />
        </div>
      )}
    </div>
  )
}

function NextProject({ project }) {
  const featured = projects.filter((p) => p.slug)
  const next = featured[(featured.indexOf(project) + 1) % featured.length]
  if (next === project) return null
  return (
    <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
      <Link
        to={`/${next.slug}`}
        className="group relative block overflow-hidden rounded-[36px] border border-line bg-surface px-6 py-12 sm:px-10 md:px-16 md:py-16"
      >
        <span className="text-sm text-muted">Next project</span>
        <span className="mt-2 flex items-center justify-between gap-6">
          <span className="text-[clamp(3rem,11vw,7.5rem)] leading-[0.95] font-semibold tracking-[-0.045em] transition-[color,transform] duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-3 group-hover:text-accent">
            {next.name}
          </span>
          <span className="grid size-14 shrink-0 place-items-center rounded-full border border-line transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:border-accent group-hover:bg-accent group-hover:text-bg md:size-20">
            <ArrowRight className="size-6 transition-transform duration-500 group-hover:translate-x-1 md:size-7" />
          </span>
        </span>
        <span className="mt-4 block max-w-lg text-muted">{next.description}</span>
        <span className="pointer-events-none absolute -right-20 -bottom-24 size-72 rounded-full bg-accent opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-20" />
      </Link>
    </section>
  )
}

export default function ProjectPage({ project }) {
  const repoName = repoOf(project.github)
  const repo = useRepo(repoName)
  const releases = useReleases(repoName)
  const commits = useCommits(repoName)
  const { features, specs } = project.page
  const hasScreens = features?.some((f) => f.screen)

  useEffect(() => {
    const before = document.title
    document.title = `${project.name} · davidx3d`
    return () => {
      document.title = before
    }
  }, [project.name])

  return (
    <>
      <Hero project={project} repo={repo.data} releases={releases.data} />
      {project.page.preview && <Preview preview={project.page.preview} />}

      {features && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
          <Reveal className="mb-10 md:mb-14">
            <h2 className="text-5xl font-semibold tracking-[-0.03em] md:text-7xl">What it does</h2>
          </Reveal>
          {hasScreens ? <FeatureShowcase features={features} /> : <FeatureGrid features={features} />}
        </section>
      )}

      {specs && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
            {specs.map((spec, i) => (
              <Spec key={spec.label} spec={spec} index={i} />
            ))}
          </div>
        </section>
      )}

      <section id="install" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal className="mb-10">
          <h2 className="text-5xl font-semibold tracking-[-0.03em] md:text-7xl">Install & changes</h2>
        </Reveal>
        <div className="grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <Releases project={project} releases={releases} />
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-5">
            <Commits project={project} commits={commits} />
          </Reveal>
        </div>
      </section>

      <NextProject project={project} />
      <Footer />
    </>
  )
}
