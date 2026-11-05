import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Footer from './Footer'
import { ArrowUpRight, Check, Copy, DiscordIcon, GitHubIcon } from './icons'
import { EASE, Magnetic } from './ui'
import { discord, githubUser } from '../projects'

const HEADLINE = ['Say', 'hello.']

// Discord profile links only open for people who share a server, so the username is one click to copy.
function DiscordButton() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(discord.username)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // No clipboard access: the username is visible on the button anyway.
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-line bg-bg/60 p-1 backdrop-blur">
      <a
        href={`https://discord.com/users/${discord.id}`}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center gap-3 rounded-full py-2.5 pr-4 pl-5 text-lg font-medium whitespace-nowrap transition-colors hover:text-accent md:text-xl"
      >
        <DiscordIcon className="size-5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-rotate-12" />
        {discord.username}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Username copied' : 'Copy Discord username'}
        className="relative grid size-11 place-items-center rounded-full bg-surface-2 text-muted transition-colors hover:bg-accent hover:text-bg"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={copied ? 'check' : 'copy'}
            initial={{ scale: 0.4, opacity: 0, rotate: -30 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.4, opacity: 0, rotate: 30 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
            className="grid place-items-center"
          >
            {copied ? <Check className="size-[18px]" /> : <Copy className="size-[18px]" />}
          </motion.span>
        </AnimatePresence>
        <AnimatePresence>
          {copied && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="pointer-events-none absolute -top-9 rounded-full bg-ink px-3 py-1 font-mono text-[11px] whitespace-nowrap text-bg"
            >
              Copied
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  )
}

export default function Contact() {
  const box = useRef(null)

  // A dot grid that only shows up around the cursor.
  const onMove = (e) => {
    const r = box.current.getBoundingClientRect()
    box.current.style.setProperty('--mx', `${e.clientX - r.left}px`)
    box.current.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <>
      <section id="contact" className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 md:pt-24">
        <div
          ref={box}
          onPointerMove={onMove}
          className="relative overflow-hidden rounded-[36px] border border-line bg-surface px-6 py-16 sm:px-10 md:px-16 md:py-24"
        >
          <div className="dot-reveal pointer-events-none absolute inset-0" />
          <div className="pointer-events-none absolute -right-24 -bottom-24 size-80 rounded-full bg-accent opacity-20 blur-3xl" />

          <div className="relative">
              <h2 className="text-[clamp(3.5rem,13vw,9rem)] leading-[0.9] font-semibold tracking-[-0.045em]">
              {HEADLINE.map((word, i) => (
                <span key={word} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <motion.span
                    className={`inline-block ${i === 1 ? 'text-accent' : ''}`}
                    initial={{ y: '105%', rotate: 4 }}
                    whileInView={{ y: 0, rotate: 0 }}
                    viewport={{ once: true, margin: '-15%' }}
                    transition={{ duration: 1, delay: i * 0.1, ease: EASE }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15%' }}
              transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
              className="mt-6 max-w-lg text-lg leading-relaxed text-muted md:text-xl"
            >
              Got a question about one of my apps, an idea or a bug? Open an issue on the project on GitHub, or message me
              on Discord.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-15%' }}
              transition={{ duration: 0.9, delay: 0.35, ease: EASE }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Magnetic strength={0.25}>
                <a
                  href={`https://github.com/${githubUser}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-6 text-lg font-medium whitespace-nowrap text-bg transition-transform active:scale-95 md:text-xl"
                >
                  <GitHubIcon className="size-5" />
                  <span>
                    <span className="hidden sm:inline">github.com/</span>
                    {githubUser}
                  </span>
                  <span className="grid size-11 place-items-center rounded-full bg-accent text-bg transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45">
                    <ArrowUpRight className="size-5" />
                  </span>
                </a>
              </Magnetic>
              <Magnetic strength={0.15}>
                <DiscordButton />
              </Magnetic>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
