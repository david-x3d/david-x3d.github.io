import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { getTheme, setTheme, useTheme } from '../lib/theme'
import { Logo, Moon, Sun } from './icons'
import { EASE } from './ui'
import { Link, usePath } from '../lib/router'

const LINKS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
]

function useActiveSection(ids, path) {
  const [active, setActive] = useState(null)
  useEffect(() => {
    setActive(null)
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    for (const id of ['top', ...ids]) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [ids, path])
  return active
}

function ThemeToggle() {
  const theme = useTheme()

  const toggle = (e) => {
    const next = getTheme() === 'dark' ? 'light' : 'dark'
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduce) return setTheme(next)

    const r = e.currentTarget.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const transition = document.startViewTransition(() => flushSync(() => setTheme(next)))
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full text-ink transition-colors hover:bg-accent-soft"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 18, rotate: -90, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -18, rotate: 90, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="grid place-items-center"
        >
          {theme === 'dark' ? <Moon className="size-[18px]" /> : <Sun className="size-[19px]" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

const SECTION_IDS = LINKS.map((l) => l.id)

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const path = usePath()
  const home = path === '/'
  const active = useActiveSection(SECTION_IDS, path)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 32, restDelta: 0.001 })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.div style={{ scaleX: progress }} className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent" />
      <motion.header
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.9, ease: EASE }}
        className="vt-header fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4"
      >
        <nav
          className={`mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-full border px-1.5 py-1.5 transition-[background-color,border-color,box-shadow] duration-500 ${
            scrolled ? 'border-line bg-bg/75 shadow-[var(--shadow)] backdrop-blur-xl' : 'border-transparent'
          }`}
        >
          <Link to="/#top" className="flex items-center gap-2.5 rounded-full py-1 pr-3 pl-1 font-semibold tracking-tight">
            <Logo className="size-8" />
            <span className="hidden sm:inline">davidx3d</span>
            <span className="sr-only sm:hidden">davidx3d, back to top</span>
          </Link>
          <ul className="flex items-center">
            {LINKS.map((link) => (
              <li key={link.id}>
                <Link
                  to={home ? `#${link.id}` : `/#${link.id}`}
                  className={`relative block rounded-full px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
                    active === link.id ? 'text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  {active === link.id && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-accent-soft"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </nav>
      </motion.header>
    </>
  )
}
