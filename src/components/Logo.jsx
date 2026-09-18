import { useBrand } from '../brand.jsx'

export default function Logo({ className = 'h-12 w-12', showText = false }) {
  const { logo } = useBrand()

  // Fallback seguro caso a logo não esteja cadastrada
  const fallbackLogo = '/logo.png'

  return (
    <div className="flex items-center gap-3">
      <img
        src={logo && logo.trim() !== '' ? logo : fallbackLogo}
        alt="Danilo Lopes"
        className={`${className} rounded-xl object-cover bg-ink-800`}
        onError={(e) => {
          // Se der erro ao carregar a imagem salva, exibe a padrão para não sumir
          e.currentTarget.src = fallbackLogo
        }}
      />
      {showText && (
        <div className="leading-tight">
          <p className="font-display text-lg uppercase tracking-[0.18em] text-gold-400">Danilo Lopes</p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-400">Consultoria de Treino</p>
        </div>
      )}
    </div>
  )
}
