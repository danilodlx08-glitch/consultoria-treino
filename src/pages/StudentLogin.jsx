
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, KeyRound } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../auth.jsx'

export default function StudentLogin() {
  const { loginStudent } = useAuth()
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (loading) return

    if (!code.trim() || !password.trim()) {
      setError('Informe o código e a senha.')
      return
    }

    try {
      setLoading(true)

      console.log('[LOGIN ALUNO] Iniciando autenticação...')

      const ok = await loginStudent(code.trim(), password)

      console.log('[LOGIN ALUNO] Resultado:', ok)

      if (!ok) {
        setError('Código ou senha inválidos.')
        return
      }

      navigate('/aluno/treinos')
    } catch (err) {
      console.error('[LOGIN ALUNO] Erro na tela de login:', err)

      setError(
        err?.message || 'Não foi possível entrar. Verifique sua conexão e tente novamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-ink-950 px-4 py-8">
      <div className="mx-auto max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400">
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <Logo className="h-14 w-14" showText />

        <h1 className="mt-8 font-display text-3xl uppercase">
          Área do Aluno
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Entre com o código e a senha enviados pelo personal.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <label className="block text-xs uppercase tracking-[0.18em] text-gold-400">
            Código

            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white"
              placeholder="ALUNO01"
              autoCapitalize="characters"
              autoComplete="username"
              disabled={loading}
            />
          </label>

          <label className="block text-xs uppercase tracking-[0.18em] text-gold-400">
            Senha

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white"
              placeholder="********"
              autoComplete="current-password"
              disabled={loading}
            />
          </label>

          {error && (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 px-4 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink-950 disabled:opacity-50"
          >
            <KeyRound size={16} />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
