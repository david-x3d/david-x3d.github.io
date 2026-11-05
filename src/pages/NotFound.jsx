import { motion } from 'motion/react'
import DotField from '../components/DotField'
import { ArrowLeft } from '../components/icons'
import { EASE } from '../components/ui'
import { Link } from '../lib/router'

export default function NotFound() {
  return (
    <section id="top" className="relative flex min-h-[100svh] items-center overflow-hidden">
      <DotField className="absolute inset-0 h-full w-full" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
        className="relative mx-auto w-full max-w-6xl px-4 sm:px-6"
      >
        <p className="font-mono text-sm text-muted">404</p>
        <h1 className="mt-3 text-[clamp(3.5rem,13vw,9rem)] leading-[0.9] font-semibold tracking-[-0.045em]">
          Nothing <span className="text-accent">here.</span>
        </h1>
        <p className="mt-6 max-w-md text-lg text-muted">That page doesn't exist. Click the dots for a bit, then head back.</p>
        <Link
          to="/"
          className="group mt-9 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-medium text-bg transition-transform active:scale-95"
        >
          <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Home
        </Link>
      </motion.div>
    </section>
  )
}
