import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BadgeCheck,
  Dumbbell,
  Lock,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from 'lucide-react'
import Logo from '../components/Logo.jsx'
import BrandFrame from '../components/BrandFrame.jsx'
import { formatBRL, loadData, subscribeData, whatsappLink } from '../storage'

const benefits = [
  { icon: Dumbbell, title: 'Treino A a E', text: 'Planilha completa, objetiva e pronta para usar na academia.' },
  { icon: PlayCircle, title: 'Vídeos de cada movimento', text: 'Consulte a execução correta em segundos, direto do telemóvel.' },
  { icon: Smartphone, title: 'Feito para o telemóvel', text: 'Interface rápida para consultar séries e repetições entre as séries.' },
  { icon: ShieldCheck, title: 'Acompanhamento real', text: 'Ajustes e suporte direto com o personal via WhatsApp.' },
]

export default function LandingPage() {
  const [plan, setPlan] = useState(() => loadData().plan)

  useEffect(() => {
    const stop = subscribeData((data) => setPlan(data.plan))
    return stop
  }, [])

  return (
    <div className="min-h-dvh bg-ink-950 text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(212,175,55,0.12),_transparent_42%)]" />
      <header className="sticky top-0 z-20 border-b border-white/5 bg-ink-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Logo className="h-11 w-11" showText />
        </div>
      </header>

      <main className="relative mx-auto max-w-md px-4 pb-28 pt-8">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-gold-300">
          <Sparkles size={12} />
          Consultoria online
        </p>
        <h1 className="font-display text-4xl uppercase leading-[0.95] tracking-wide">
          Treino com método.
          <span className="block text-gold-400">Resultado com constância.</span>
        </h1>
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Consultoria de treino online com acompanhamento individual. Visual limpo, foco em musculação e acesso rápido às fichas na academia.
        </p>

        <BrandFrame className="mt-8 p-5">
          <div className="flex items-start gap-4">
            <Logo className="h-16 w-16" />
            <div>
              <p className="font-display text-2xl uppercase tracking-wide text-white">Danilo Lopes</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gold-400">Personal Trainer</p>
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-300">
                <BadgeCheck size={16} className="text-gold-400" />
                CREF 17249 G-ES
              </p>
            </div>
          </div>
        </BrandFrame>

        <section className="mt-8">
          <BrandFrame className="p-5 shadow-gold">
            <p className="text-[11px] uppercase tracking-[0.24em] text-gold-400">Plano Único</p>
            <h2 className="mt-2 font-display text-3xl uppercase text-white">{plan.name}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{plan.description}</p>
            <p className="mt-5 font-display text-5xl text-gold-400">{formatBRL(plan.price)}</p>
            <ul className="mt-5 space-y-2">
              {(plan.includes || []).map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold-400" />
                  {item}
                </li>
              ))}
            </ul>
            <a
              href={whatsappLink(plan)}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 px-4 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink-950"
            >
              <MessageCircle size={18} />
              Garantir Minha Vaga
            </a>
          </BrandFrame>
        </section>

        <section className="mt-8 grid gap-3">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-white/5 bg-ink-800/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-gold-400">
                <Icon size={18} />
                <h3 className="font-display text-lg uppercase">{title}</h3>
              </div>
              <p className="text-sm leading-6 text-zinc-400">{text}</p>
            </div>
          ))}
        </section>

        <div className="mt-8 flex flex-col items-center justify-center w-full max-w-sm mx-auto gap-3">
          <Link
            to="/aluno"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 px-4 py-4 text-sm font-bold uppercase tracking-wide text-ink-950 shadow-lg hover:bg-gold-300 transition-all"
          >
            <Lock size={16} />
            Login do Aluno
          </Link>
          <Link
            to="/personal"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold-400/30 bg-ink-800 px-4 py-3 text-xs font-medium uppercase tracking-wide text-zinc-300 hover:bg-gold-500/10 transition-all"
          >
            Painel do Personal
          </Link>
        </div>
      </main>
    </div>
  )
}
