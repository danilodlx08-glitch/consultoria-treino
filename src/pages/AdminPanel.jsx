import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ImagePlus, LogOut, Plus, Trash2 } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../auth.jsx'
import { useBrand } from '../brand.jsx'
import { createId, fetchData, loadData, saveData } from '../storage'

const DAYS = ['A', 'B', 'C', 'D', 'E']
const TABS = [
  { id: 'brand', label: 'Marca' },
  { id: 'sales', label: 'Vendas' },
  { id: 'workouts', label: 'Treinos' },
  { id: 'students', label: 'Alunos' },
]

const emptyExercise = () => ({
  id: createId(),
  name: '',
  sets: '',
  reps: '',
  notes: '',
  video: '',
})

export default function AdminPanel() {
  const { logoutAdmin } = useAuth()
  const { refresh } = useBrand()
  const navigate = useNavigate()
  const [data, setData] = useState(() => loadData())
  const [tab, setTab] = useState('brand')
  const [day, setDay] = useState('A')
  const [saved, setSaved] = useState('')
  const [logoError, setLogoError] = useState('')
  const [studentForm, setStudentForm] = useState({ name: '', code: '', password: '' })

  useEffect(() => {
    fetchData().then(setData)
  }, [])

  function persist(next) {
    setData(next)
    saveData(next)
    setSaved('Alteracoes salvas para todos os alunos.')
    setTimeout(() => setSaved(''), 1800)
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Falha ao ler o arquivo'))
      reader.readAsDataURL(file)
    })
  }

  async function handleLogoFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setLogoError('Envie um arquivo de imagem (PNG, JPG, WEBP ou SVG).')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setLogoError('A imagem deve ter no maximo 4 MB.')
      return
    }
    try {
      const logo = await fileToDataUrl(file)
      persist({ ...data, brand: { ...(data.brand || {}), logo } })
      await refresh()
      setLogoError('')
    } catch {
      setLogoError('Nao foi possivel carregar a imagem. Tente outro arquivo.')
    }
  }

  async function resetLogo() {
    persist({ ...data, brand: { logo: '/logo.svg' } })
    await refresh()
    setLogoError('')
  }

  function updatePlan(field, value) {
    persist({ ...data, plan: { ...data.plan, [field]: value } })
  }

  function updateInclude(index, value) {
    const includes = [...(data.plan.includes || [])]
    includes[index] = value
    persist({ ...data, plan: { ...data.plan, includes } })
  }

  function addInclude() {
    persist({ ...data, plan: { ...data.plan, includes: [...(data.plan.includes || []), 'Novo item'] } })
  }

  function removeInclude(index) {
    persist({
      ...data,
      plan: { ...data.plan, includes: (data.plan.includes || []).filter((_, i) => i !== index) },
    })
  }

  function updateWorkoutMeta(field, value) {
    persist({
      ...data,
      workouts: { ...data.workouts, [day]: { ...data.workouts[day], [field]: value } },
    })
  }

  function updateExercise(exerciseId, field, value) {
    const exercises = data.workouts[day].exercises.map((item) =>
      item.id === exerciseId ? { ...item, [field]: value } : item
    )
    persist({ ...data, workouts: { ...data.workouts, [day]: { ...data.workouts[day], exercises } } })
  }

  function addExercise() {
    persist({
      ...data,
      workouts: {
        ...data.workouts,
        [day]: { ...data.workouts[day], exercises: [...data.workouts[day].exercises, emptyExercise()] },
      },
    })
  }

  function removeExercise(exerciseId) {
    persist({
      ...data,
      workouts: {
        ...data.workouts,
        [day]: {
          ...data.workouts[day],
          exercises: data.workouts[day].exercises.filter((item) => item.id !== exerciseId),
        },
      },
    })
  }

  function addStudent(event) {
    event.preventDefault()
    if (!studentForm.name || !studentForm.code || !studentForm.password) return
    persist({
      ...data,
      students: [{ id: createId(), ...studentForm, active: true }, ...data.students],
    })
    setStudentForm({ name: '', code: '', password: '' })
  }

  function toggleStudent(id) {
    persist({
      ...data,
      students: data.students.map((item) => (item.id === id ? { ...item, active: !item.active } : item)),
    })
  }

  function removeStudent(id) {
    persist({ ...data, students: data.students.filter((item) => item.id !== id) })
  }

  function exit() {
    logoutAdmin()
    navigate('/')
  }

  return (
    <div className="min-h-dvh bg-ink-950">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-ink-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Logo className="h-10 w-10" showText />
          <button onClick={exit} className="rounded-full border border-white/10 p-2 text-zinc-300">
            <LogOut size={16} />
          </button>
        </div>
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2 px-4 pb-3">
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-xl py-2 text-xs font-semibold uppercase tracking-wide ${
                tab === item.id ? 'bg-gold-400 text-ink-950' : 'border border-white/10 bg-ink-800 text-zinc-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-5 safe-bottom">
        {saved && <p className="mb-4 rounded-xl bg-gold-400/10 px-3 py-2 text-sm text-gold-300">{saved}</p>}

        {tab === 'brand' && (
          <section className="space-y-4">
            <h1 className="font-display text-2xl uppercase">Logomarca</h1>
            <p className="text-sm leading-6 text-zinc-400">
              O chat nao recebe arquivos. Envie a logo aqui, direto da galeria do celular. A imagem aparece na landing, no login e nas areas restritas.
            </p>
            <div className="rounded-2xl border border-white/5 bg-ink-800 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gold-400">Preview atual</p>
              <div className="mt-4 flex items-center justify-center rounded-2xl border border-gold-400/20 bg-ink-950 p-6">
                <img
                  src={data.brand?.logo || '/logo.svg'}
                  alt="Logo atual"
                  className="h-28 w-28 rounded-2xl object-cover"
                />
              </div>
            </div>
            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gold-400 px-4 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink-950">
              <ImagePlus size={16} />
              Enviar logo
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
            </label>
            <button
              type="button"
              onClick={resetLogo}
              className="w-full rounded-xl border border-white/10 py-3 text-sm uppercase tracking-wide text-zinc-400"
            >
              Restaurar logo padrao
            </button>
            {logoError && <p className="text-sm text-red-400">{logoError}</p>}
          </section>
        )}

        {tab === 'sales' && (
          <section className="space-y-4">
            <h1 className="font-display text-2xl uppercase">Gestao de Vendas</h1>
            <label className="block text-xs uppercase tracking-[0.18em] text-gold-400">
              Nome do plano
              <input
                value={data.plan.name}
                onChange={(e) => updatePlan('name', e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm"
              />
            </label>
            <label className="block text-xs uppercase tracking-[0.18em] text-gold-400">
              Valor (R$)
              <input
                type="number"
                value={data.plan.price}
                onChange={(e) => updatePlan('price', Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm"
              />
            </label>
            <label className="block text-xs uppercase tracking-[0.18em] text-gold-400">
              Descricao
              <textarea
                value={data.plan.description}
                onChange={(e) => updatePlan('description', e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm"
              />
            </label>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gold-400">Itens inclusos</p>
              <div className="mt-2 space-y-2">
                {(data.plan.includes || []).map((item, index) => (
                  <div key={`${index}-${item}`} className="flex gap-2">
                    <input
                      value={item}
                      onChange={(e) => updateInclude(index, e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm"
                    />
                    <button onClick={() => removeInclude(index)} className="rounded-xl border border-white/10 px-3 text-zinc-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addInclude} className="mt-3 inline-flex items-center gap-2 text-sm text-gold-300">
                <Plus size={16} />
                Adicionar item
              </button>
            </div>
          </section>
        )}

        {tab === 'workouts' && (
          <section>
            <h1 className="font-display text-2xl uppercase">Fichas de Treino</h1>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {DAYS.map((item) => (
                <button
                  key={item}
                  onClick={() => setDay(item)}
                  className={`rounded-xl py-2 font-display ${
                    day === item ? 'bg-gold-400 text-ink-950' : 'border border-white/10 bg-ink-800'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-xs uppercase tracking-[0.18em] text-gold-400">
              Titulo
              <input
                value={data.workouts[day].title}
                onChange={(e) => updateWorkoutMeta('title', e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm"
              />
            </label>
            <label className="mt-4 block text-xs uppercase tracking-[0.18em] text-gold-400">
              Foco
              <input
                value={data.workouts[day].focus}
                onChange={(e) => updateWorkoutMeta('focus', e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm"
              />
            </label>
            <div className="mt-5 space-y-4">
              {data.workouts[day].exercises.map((exercise, index) => (
                <div key={exercise.id} className="rounded-2xl border border-white/5 bg-ink-800 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.18em] text-gold-400">Exercicio {index + 1}</p>
                    <button onClick={() => removeExercise(exercise.id)} className="text-zinc-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input
                    value={exercise.name}
                    onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                    placeholder="Nome do exercicio"
                    className="mb-2 w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm"
                  />
                  <div className="mb-2 grid grid-cols-2 gap-2">
                    <input
                      value={exercise.sets}
                      onChange={(e) => updateExercise(exercise.id, 'sets', e.target.value)}
                      placeholder="Series"
                      className="rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm"
                    />
                    <input
                      value={exercise.reps}
                      onChange={(e) => updateExercise(exercise.id, 'reps', e.target.value)}
                      placeholder="Repeticoes"
                      className="rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm"
                    />
                  </div>
                  <textarea
                    value={exercise.notes}
                    onChange={(e) => updateExercise(exercise.id, 'notes', e.target.value)}
                    placeholder="Observacoes"
                    rows={2}
                    className="mb-2 w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm"
                  />
                  <input
                    value={exercise.video}
                    onChange={(e) => updateExercise(exercise.id, 'video', e.target.value)}
                    placeholder="Cole o link do video"
                    className="w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={addExercise}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gold-400/30 py-3 text-sm font-semibold uppercase tracking-wide text-gold-300"
            >
              <Plus size={16} />
              Adicionar exercicio
            </button>
          </section>
        )}

        {tab === 'students' && (
          <section>
            <h1 className="font-display text-2xl uppercase">Alunos e Senhas</h1>
            <form onSubmit={addStudent} className="mt-4 space-y-3 rounded-2xl border border-white/5 bg-ink-800 p-4">
              <input
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                placeholder="Nome do aluno"
                className="w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm"
              />
              <input
                value={studentForm.code}
                onChange={(e) => setStudentForm({ ...studentForm, code: e.target.value.toUpperCase() })}
                placeholder="Codigo de acesso"
                className="w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm"
              />
              <input
                value={studentForm.password}
                onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                placeholder="Senha"
                className="w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 py-3 text-sm font-semibold uppercase tracking-wide text-ink-950"
              >
                <Plus size={16} />
                Cadastrar aluno
              </button>
            </form>
            <div className="mt-4 space-y-3">
              {data.students.map((student) => (
                <article key={student.id} className="rounded-2xl border border-white/5 bg-ink-800 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-xl uppercase">{student.name}</h2>
                      <p className="mt-1 text-sm text-zinc-400">Codigo: {student.code}</p>
                      <p className="text-sm text-zinc-400">Senha: {student.password}</p>
                    </div>
                    <button onClick={() => removeStudent(student.id)} className="text-zinc-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => toggleStudent(student.id)}
                    className={`mt-3 rounded-lg px-3 py-1 text-xs uppercase tracking-wide ${
                      student.active !== false ? 'bg-gold-400/15 text-gold-300' : 'bg-zinc-700 text-zinc-400'
                    }`}
                  >
                    {student.active !== false ? 'Ativo' : 'Inativo'}
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
