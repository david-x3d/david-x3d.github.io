const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function GitHubIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden {...props}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

export function ArrowUpRight(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  )
}

export function ArrowDown(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  )
}

export function ArrowUp(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={2.4} {...props}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  )
}

export function Sun(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </svg>
  )
}

export function Moon(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
    </svg>
  )
}

export function Star(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" />
    </svg>
  )
}

export function Shield(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.2 7.5 9.5 4.4-1.3 7.5-4.9 7.5-9.5V6z" />
      <path d="m8.8 12 2.2 2.2 4.4-4.4" />
    </svg>
  )
}

export function Logo(props) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden {...props}>
      <rect width="64" height="64" rx="18" fill="var(--text)" />
      <circle cx="28" cy="37" r="11" fill="none" stroke="var(--bg)" strokeWidth="7" />
      <rect x="38" y="13" width="7" height="35" rx="3.5" fill="var(--accent)" />
    </svg>
  )
}

export function ArrowLeft(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  )
}

export function ArrowRight(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function Download(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
    </svg>
  )
}

export function Refresh(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <path d="M20 11.5A8 8 0 1 1 17.7 6M20 4v4.5h-4.5" />
    </svg>
  )
}

export function Copy(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} {...props}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
      <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </svg>
  )
}

export function Check(props) {
  return (
    <svg viewBox="0 0 24 24" {...base} strokeWidth={2.2} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  )
}

export function DiscordIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.1.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
    </svg>
  )
}
