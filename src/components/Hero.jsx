import { motion } from 'motion/react'
import DotField from './DotField'
import ProximityText from './ProximityText'
import { ArrowDown, GitHubIcon } from './icons'
import { EASE, Magnetic } from './ui'
import { useBerlinTime } from '../lib/hooks'
import { githubUser } from '../projects'

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 1, ease: EASE },
})

export default function Hero() {
  const time = useBerlinTime()

  return (
    <section id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <DotField className="absolute inset-0 h-full w-full [mask-image:linear-gradient(to_bottom,#000_50%,transparent_96%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pt-28 pb-8 sm:px-6 md:pb-14">
        <div className="my-auto md:mt-auto md:mb-0">
          <motion.p {...fadeUp(0.05)} className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted md:mb-8 md:text-base">
            <span>Hobby developer</span>
            <span className="text-line">/</span>
            <span>Germany, {time}</span>
          </motion.p>

          <ProximityText text="davidx3d" accentFrom={5} className="text-[clamp(4.2rem,24vw,16rem)]" />

          <motion.p
            {...fadeUp(0.55)}
            className="mt-6 max-w-xl text-xl leading-snug text-ink/80 text-balance md:mt-8 md:text-2xl"
          >
            I build Android apps in Kotlin and Jetpack Compose.
          </motion.p>

          <motion.div {...fadeUp(0.7)} className="mt-9 flex flex-wrap items-center gap-3">
            <Magnetic>
              <a
                href="#projects"
                className="group flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-medium text-bg transition-transform active:scale-95"
              >
                See my projects
                <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href={`https://github.com/${githubUser}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 rounded-full border border-line bg-surface/60 px-6 py-3.5 font-medium backdrop-blur transition-[border-color,transform] hover:border-accent/50 active:scale-95"
              >
                <GitHubIcon className="size-[18px]" />
                GitHub
              </a>
            </Magnetic>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
