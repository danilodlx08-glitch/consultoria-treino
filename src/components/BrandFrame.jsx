export default function BrandFrame({ children, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-gold-400/20 bg-ink-800/80 ${className}`}>
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px gold-line" />
      {children}
    </div>
  )
}
