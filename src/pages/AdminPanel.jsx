import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Users, Dumbbell, Palette, DollarSign, Plus, Trash2, Edit2, Save, X, Check } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../auth.jsx'
import { useBrand } from '../brand.jsx'
import { fetchData, saveData } from '../storage'

export default function AdminPanel() {
  const { logoutAdmin } = useAuth()
  const { brand, updateBrand } = useBrand()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('treinos')
  const [data, setData] = useState({ students: [], workouts: {} })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Estados locais para edição rápida (Marca)
  const [brandForm, setBrandForm] = useState(brand)

  useEffect(() => {
    loadAppData()
  }, [])

  async function loadAppData() {
    try {
      const res = await fetchData()
      setData(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    logoutAdmin()
    navigate('/personal')
  }

  async function handleSaveBrand(e) {
    e.preventDefault()
    updateBrand(brandForm)
    setMessage('Marca atualizada com sucesso!')
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) {
    data
    return (
      <div className="flex min-h-dvh items-center justify-center bg-ink-950 text-white">
        <p className="text-sm tracking-widest uppercase text-gold-400">A carregar painel...</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-ink-950 text-white">
      {/* Header do Painel Admin */}
      <header className="border-b border-white/10 bg-ink-900 px-4 py-4 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <div>
              <h1 className="font-display text-lg tracking-wider">PAINEL DO PERSONAL</h1>
              <p className="text-xs text-zinc-400">Gestão completa da consultoria</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-400 hover:bg-red-500/20"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>

        {/* Abas de Navegação do Painel */}
        <div className="mx-auto mt-6 flex max-w-7xl gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('treinos')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'treinos' ? 'bg-gold-400 text-ink-950' : 'bg-ink-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Dumbbell size={16} />
            Gerir Treinos
          </button>
          <button
            onClick={() => setActiveTab('alunos')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'alunos' ? 'bg-gold-400 text-ink-950' : 'bg-ink-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Users size={16} />
            Alunos ({data.students?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('marca')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              activeTab === 'marca' ? 'bg-gold-400 text-ink-950' : 'bg-ink-800 text-zinc-400 hover:text-white'
            }`}
          >
            <Palette size={16} />
            Identidade Visual
          </button>
        </div>
      </header>

      {/* Conteúdo Principal das Abas */}
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {message && (
          <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400 flex items-center gap-2">
            <Check size={18} />
            {message}
          </div>
        )}

        {/* ABA: TREINOS */}
        {activeTab === 'treinos' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-ink-900 p-6">
              <h2 className="font-display text-xl uppercase text-gold-400">Gestão de Treinos e Fichas</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Aqui podes consultar os alunos e configurar os blocos de treino por letra (A, B, C, D, E).
              </p>
              
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.students?.map((student) => (
                  <div key={student.id} className="rounded-xl border border-white/10 bg-ink-800 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{student.name}</span>
                      <span className="rounded bg-gold-400/10 px-2 py-0.5 text-xs font-mono text-gold-400">
                        {student.code}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-zinc-400">ID: {student.id}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA: ALUNOS */}
        {activeTab === 'alunos' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-ink-900 p-6">
              <h2 className="font-display text-xl uppercase text-gold-400">Alunos Cadastrados</h2>
              <p className="mt-1 text-sm text-zinc-400">Lista geral de utilizadores com acesso à plataforma.</p>
              
              <div className="mt-6 divide-y divide-white/10">
                {data.students?.map((student) => (
                  <div key={student.id} className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium text-white">{student.name}</p>
                      <p className="text-xs text-zinc-400">Código de Acesso: <span className="text-gold-400 font-mono">{student.code}</span></p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                      Ativo
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA: MARCA */}
        {activeTab === 'marca' && (
          <div className="max-w-xl rounded-2xl border border-white/10 bg-ink-900 p-6">
            <h2 className="font-display text-xl uppercase text-gold-400">Identidade Visual da Consultoria</h2>
            <p className="mt-1 text-sm text-zinc-400">Altere o nome e detalhes da marca exibidos na aplicação.</p>

            <form onSubmit={handleSaveBrand} className="mt-6 space-y-4">
              <label className="block text-xs uppercase tracking-wider text-zinc-400">
                Nome do Personal / Marca
                <input
                  type="text"
                  value={brandForm.name || ''}
                  onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white"
                />
              </label>

              <label className="block text-xs uppercase tracking-wider text-zinc-400">
                Subtítulo / Slogan
                <input
                  type="text"
                  value={brandForm.subtitle || ''}
                  onChange={(e) => setBrandForm({ ...brandForm, subtitle: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white"
                />
              </label>

              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gold-400 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-ink-950"
              >
                <Save size={16} />
                Guardar Alterações
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
