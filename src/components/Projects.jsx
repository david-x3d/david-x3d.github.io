import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useInView } from 'motion/react'
import { projects } from '../projects'
import { repoKey, useGitHubRepos } from '../lib/hooks'
import { pointer } from '../lib/pointer'
import { ArrowUpRight, Star } from './icons'
import { Reveal, RollingNumber } from './ui'
import { followLink } from '../lib/router'
import { visuals, Monogram } from './visuals'

function ProjectCard({ project, stars, index, ref }) {
  const cardRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  // On touch screens there is no hover, so the card in the middle of the screen counts as active.
  const centered = useInView(cardRef, { margin: '-42% 0px -42% 0px' })
  const active = hovered || (!pointer.fine && centered)
  const Visual = visuals[project.visual] ?? Monogram
  // Projects with their own page link there; the rest go straight to GitHub.
  const linkProps = project.slug
    ? { href: `/${project.slug}`, onClick: (e) => followLink(e, `/${project.slug}`) }
    : { href: project.github, target: '_blank', rel: 'noreferrer' }

  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const el = cardRef.current
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`)
    el.style.setProperty('--rx', `${((0.5 - y) * 6).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${((x - 0.5) * (project.featured ? 4 : 8)).toFixed(2)}deg`)
    if (!hovered) setHovered(true)
  }
  const onLeave = () => {
    const el = cardRef.current
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    setHovered(false)
  }

  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.25 } }}
      transition={{
        layout: { type: 'spring', stiffness: 260, damping: 30 },
        default: { duration: 0.8, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] },
      }}
      className={project.featured ? 'md:col-span-2' : ''}
    >
      <a
        ref={cardRef}
        {...linkProps}
        data-active={active}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        className="card group relative flex h-full flex-col rounded-[28px] border border-line bg-surface p-2"
      >
        <div className="card-glow" />
        <div className="card-border" />
        <div
          className={`@container relative h-56 overflow-hidden rounded-[21px] bg-surface-2 md:h-60 ${project.slug ? 'vt-stage' : ''}`}
          style={project.slug ? { '--vt': `stage-${project.slug}` } : undefined}
        >
          <Visual active={active} project={project} />
        </div>
        <div className="relative flex flex-1 flex-col px-4 pt-5 pb-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-2xl font-semibold tracking-tight">{project.name}</h3>
            <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full border border-line text-muted transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-bg group-data-[active=true]:border-accent">
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" />
            </span>
          </div>
          <p className="mt-2 max-w-prose leading-relaxed text-muted">{project.description}</p>
          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-5">
            {project.platforms.map((p) => (
              <span key={p} className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent-strong dark:text-accent">
                {p}
              </span>
            ))}
            {project.tech?.map((t) => (
              <span key={t} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-muted">
                {t}
              </span>
            ))}
            {stars > 0 && (
              <span className="ml-auto flex items-center gap-1 font-mono text-xs text-muted">
                <Star className="size-3.5 text-warm" />
                <RollingNumber value={stars} />
              </span>
            )}
          </div>
        </div>
      </a>
    </motion.li>
  )
}

export default function Projects() {
  const repos = useGitHubRepos()
  const [filter, setFilter] = useState('All')

  const filters = useMemo(() => {
    const counts = new Map([['All', projects.length]])
    for (const p of projects) for (const pl of p.platforms) counts.set(pl, (counts.get(pl) ?? 0) + 1)
    return [...counts]
  }, [])

  const shown = filter === 'All' ? projects : projects.filter((p) => p.platforms.includes(filter))

  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
      <div className="mb-10 flex flex-col gap-8 md:mb-12 md:flex-row md:items-end md:justify-between">
        <Reveal>
          <h2 className="text-5xl font-semibold tracking-[-0.03em] md:text-7xl">Things I've built</h2>
          <p className="mt-4 max-w-md text-muted">
            All open source.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <LayoutGroup id="filters">
            <div role="group" aria-label="Filter projects" className="-mx-1 flex flex-wrap gap-1 rounded-full">
              {filters.map(([name, count]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFilter(name)}
                  aria-pressed={filter === name}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    filter === name ? 'text-bg' : 'text-muted hover:text-ink'
                  }`}
                >
                  {filter === name && (
                    <motion.span
                      layoutId="filter-pill"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">
                    {name} <span className="font-mono text-xs opacity-60">{count}</span>
                  </span>
                </button>
              ))}
            </div>
          </LayoutGroup>
        </Reveal>
      </div>

      <motion.ul layout className="grid grid-flow-dense gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((project, i) => (
            <ProjectCard
              key={project.github}
              project={project}
              index={i}
              stars={repos?.[repoKey(project.github)]?.stars}
            />
          ))}
        </AnimatePresence>
      </motion.ul>
    </section>
  )
}
