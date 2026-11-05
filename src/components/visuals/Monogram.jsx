// Fallback for projects without a custom visual.
export default function Monogram({ active, project }) {
  return (
    <div className="absolute inset-0 grid place-items-center [background-image:radial-gradient(var(--dot)_1px,transparent_1.2px)] [background-size:16px_16px]">
      <span
        className="font-display text-8xl font-bold tracking-[-0.06em] text-accent transition-transform duration-700 ease-[var(--ease-out-expo)]"
        style={{ transform: active ? 'scale(1.12) rotate(-4deg)' : 'none' }}
      >
        {project.name.slice(0, 2)}
      </span>
    </div>
  )
}
