import { discord, githubUser } from '../projects'

export default function Footer() {
  return (
    <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 pt-8 pb-8 text-sm text-muted sm:px-8">
      <span>© {new Date().getFullYear()} davidx3d</span>
      <div className="flex items-center gap-5">
        <a href={`https://github.com/${githubUser}`} target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">
          GitHub
        </a>
        <a href={`https://discord.com/users/${discord.id}`} target="_blank" rel="noreferrer" className="transition-colors hover:text-ink">
          Discord
        </a>
        <a href="#top" className="transition-colors hover:text-ink">
          Back to top ↑
        </a>
      </div>
    </footer>
  )
}
