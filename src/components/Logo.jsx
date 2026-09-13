import { useBrand } from '../brand.jsx'

export default function Logo({ className = 'h-12 w-12', showText = false }) {
  const { logo } = useBrand()

  return (
    <div className="flex items-center gap-3">
      <img src={logo || '/logo.svg'} alt="Danilo Lopes" className={`${className} rounded-xl object-cover bg-ink-800`} />
      {showText && (
        <div className="leading-tight">
          <p className="font-display text-lg uppercase tracking-[0.18em] text-gold-400">Danilo Lopes</p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-400">Consultoria de Treino</p>
        </div>
      )}
    </div>
  )
}
