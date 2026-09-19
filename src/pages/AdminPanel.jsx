import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Copy,
  ImagePlus,
  LogOut,
  Plus,
  Trash2,
  UserPlus,
  Search,
  Library,
  X,
  Dumbbell,
  Play,
  CheckCircle2,
  CopyCheck,
  Link2,
} from 'lucide-react'
import { useAuth } from '../auth.jsx'
import {
  cloneWorkouts,
  loadData,
  saveData,
  subscribeData,
  uploadLogo,
  logoSrc,
  createId,
  generateAccessCode,
  generatePassword,
  addExerciseToLibrary,
  updateLibraryExercise,
  removeExerciseFromLibrary,
  addLibraryExerciseToWorkout,
} from '../storage'

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
  muscle: '',
  sets: '',
  reps: '',
  notes: '',
  video: '',
  group: '',
})

const emptyLibraryExercise = () => ({
  name: '',
  muscle: '',
  sets: '3',
  reps: '10-12',
  notes: '',
  video: '',
  group: '',
})

export default function AdminPanel() {
  const { logoutAdmin } = useAuth()
  const navigate = useNavigate()

  const [data, setData] = useState(() => loadData())
  const [tab, setTab] = useState('brand')
  const [day, setDay] = useState('A')
  const [saved, setSaved] = useState('')
  const [logoError, setLogoError] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')

  const [showCopyStudentWorkoutsModal, setShowCopyStudentWorkoutsModal] = useState(false)
  const [sourceStudentIdForCopy, setSourceStudentIdForCopy] = useState('')
  const [studentSearch, setStudentSearch] = useState('')

  const [studentForm, setStudentForm] = useState({
    name: '',
    code: generateAccessCode(),
    password: generatePassword(),
  })

  const [libraryOpen, setLibraryOpen] = useState(false)
  const [librarySearch, setLibrarySearch] = useState('')
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('TODOS')
  const [showNewLibraryExercise, setShowNewLibraryExercise] = useState(false)

  const [libraryForm, setLibraryForm] = useState(emptyLibraryExercise())

  useEffect(() => {
    const stop = subscribeData((next) => {
      setData(next)
      setSelectedStudentId(
        (current) => current || next.students[0]?.id || ''
      )
    })
    return stop
  }, [])

  const selectedStudent = useMemo(
    () =>
      data.students.find((item) => item.id === selectedStudentId) ||
      data.students[0],
    [data.students, selectedStudentId]
  )

  const filteredStudents = useMemo(() => {
    const term = studentSearch.trim().toLowerCase()
    const sorted = [...data.students].sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
    )
    if (!term) return sorted
    return sorted.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.code.toLowerCase().includes(term)
    )
  }, [data.students, studentSearch])

  const studentStats = useMemo(() => {
    const total = data.students.length
    const active = data.students.filter((s) => s.active !== false).length
    return { total, active, inactive: total - active }
  }, [data.students])

  function persist(next) {
    setData(next)
    saveData(next)
    setSaved('Salvo na nuvem. Os alunos recebem a atualização automaticamente.')
    setTimeout(() => setSaved(''), 2200)
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
      setLogoError('A imagem deve ter no máximo 4 MB.')
      return
    }

    try {
      const dataUrl = await fileToDataUrl(file)
      const result = await uploadLogo(dataUrl)
      persist({
        ...data,
        brand: {
          ...(data.brand || {}),
          logo: result.logo,
        },
      })
      setLogoError('')
    } catch {
      setLogoError('Não foi possível carregar a imagem. Tente outro arquivo.')
    }
  }

  async function resetLogo() {
    persist({
      ...data,
      brand: {
        logo: '/logo.png',
      },
    })
    setLogoError('')
  }

  function updatePlan(field, value) {
    persist({
      ...data,
      plan: {
        ...data.plan,
        [field]: value,
      },
    })
  }

  function updateInclude(index, value) {
    const includes = [...(data.plan.includes || [])]
    includes[index] = value
    persist({
      ...data,
      plan: {
        ...data.plan,
        includes,
      },
    })
  }

  function addInclude() {
    persist({
      ...data,
      plan: {
        ...data.plan,
        includes: [...(data.plan.includes || []), 'Novo item'],
      },
    })
  }

  function removeInclude(index) {
    persist({
      ...data,
      plan: {
        ...data.plan,
        includes: (data.plan.includes || []).filter((_, i) => i !== index),
      },
    })
  }

  function studentWorkouts() {
    return selectedStudent?.workouts || cloneWorkouts(data.workouts)
  }

  function persistStudentWorkouts(workouts) {
    if (!selectedStudent) return
    persist({
      ...data,
      students: data.students.map((item) =>
        item.id === selectedStudent.id
          ? {
              ...item,
              workouts,
              updatedAt: new Date().toISOString(),
            }
          : item
      ),
    })
  }

  function updateWorkoutMeta(field, value) {
    const workouts = studentWorkouts()
    persistStudentWorkouts({
      ...workouts,
      [day]: {
        ...workouts[day],
        [field]: value,
      },
    })
  }

  function updateExercise(exerciseId, field, value) {
    const workouts = studentWorkouts()
    const exercises = workouts[day].exercises.map((item) =>
      item.id === exerciseId
        ? {
            ...item,
            [field]: value,
          }
        : item
    )
    persistStudentWorkouts({
      ...workouts,
      [day]: {
        ...workouts[day],
        exercises,
      },
    })
  }

  function addExercise() {
    const workouts = studentWorkouts()
    persistStudentWorkouts({
      ...workouts,
      [day]: {
        ...workouts[day],
        exercises: [...workouts[day].exercises, emptyExercise()],
      },
    })
  }

  function removeExercise(exerciseId) {
    const workouts = studentWorkouts()
    persistStudentWorkouts({
      ...workouts,
      [day]: {
        ...workouts[day],
        exercises: workouts[day].exercises.filter((item) => item.id !== exerciseId),
      },
    })
  }

  function copyWorkoutFromDay(sourceDay) {
    if (sourceDay === day) return
    const workouts = studentWorkouts()
    const sourceWorkout = workouts[sourceDay]

    if (!sourceWorkout || !sourceWorkout.exercises.length) {
      setSaved(`O treino ${sourceDay} está vazio.`)
      setTimeout(() => setSaved(''), 2200)
      return
    }

    const confirmed = window.confirm(
      `Deseja copiar todos os exercícios e dados do Treino ${sourceDay} para o Treino ${day}?`
    )
    if (!confirmed) return

    const clonedExercises = sourceWorkout.exercises.map((ex) => ({
      ...ex,
      id: createId(),
    }))

    persistStudentWorkouts({
      ...workouts,
      [day]: {
        title: sourceWorkout.title,
        focus: sourceWorkout.focus,
        exercises: clonedExercises,
      },
    })

    setSaved(`Treino ${day} atualizado com base no Treino ${sourceDay}!`)
    setTimeout(() => setSaved(''), 2200)
  }

  function executeCopyWorkoutsFromStudent() {
    if (!sourceStudentIdForCopy || !selectedStudent) return
    const sourceStudent = data.students.find((s) => s.id === sourceStudentIdForCopy)
    if (!sourceStudent) return

    const confirmed = window.confirm(
      `Deseja substituir todas as fichas de ${selectedStudent.name} pelas fichas de ${sourceStudent.name}?`
    )
    if (!confirmed) return

    const sourceWorkouts = sourceStudent.workouts || cloneWorkouts(data.workouts)
    const clonedWorkouts = {}

    DAYS.forEach((d) => {
      const dayData = sourceWorkouts[d]
      if (dayData) {
        clonedWorkouts[d] = {
          title: dayData.title || '',
          focus: dayData.focus || '',
          exercises: (dayData.exercises || []).map((ex) => ({
            ...ex,
            id: createId(),
          })),
        }
      }
    })

    persistStudentWorkouts(clonedWorkouts)
    setShowCopyStudentWorkoutsModal(false)
    setSourceStudentIdForCopy('')
    setSaved(`Fichas copiadas de ${sourceStudent.name} com sucesso!`)
    setTimeout(() => setSaved(''), 2200)
  }

  const libraryExercises = data.exercisesLibrary || []

  const availableMuscles = useMemo(() => {
    const muscles = new Set()
    libraryExercises.forEach((item) => {
      if (item.muscle?.trim()) {
        muscles.add(item.muscle.trim().toUpperCase())
      }
    })
    return ['TODOS', ...Array.from(muscles)]
  }, [libraryExercises])

  const filteredLibrary = useMemo(() => {
    const term = librarySearch.trim().toLowerCase()
    return libraryExercises.filter((exercise) => {
      const matchesSearch =
        !term ||
        [exercise.name, exercise.muscle, exercise.notes]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(term)

      const matchesMuscle =
        selectedMuscleFilter === 'TODOS' ||
        exercise.muscle?.trim().toUpperCase() === selectedMuscleFilter

      return matchesSearch && matchesMuscle
    })
  }, [libraryExercises, librarySearch, selectedMuscleFilter])

  function addCurrentExerciseToLibrary(exercise) {
    const next = addExerciseToLibrary(data, {
      name: exercise.name,
      muscle: exercise.muscle || '',
      sets: exercise.sets || '',
      reps: exercise.reps || '',
      notes: exercise.notes || '',
      video: exercise.video || '',
      group: exercise.group || '',
    })
    persist(next)
  }

  function saveNewLibraryExercise(event) {
    event.preventDefault()
    if (!libraryForm.name.trim()) return

    const next = addExerciseToLibrary(data, {
      ...libraryForm,
      name: libraryForm.name.trim(),
    })
    persist(next)
    setLibraryForm(emptyLibraryExercise())
    setShowNewLibraryExercise(false)
  }

  function deleteLibraryExercise(exerciseId) {
    const exercise = libraryExercises.find((item) => item.id === exerciseId)
    if (!exercise) return

    const confirmed = window.confirm(`Excluir "${exercise.name}" da biblioteca?`)
    if (!confirmed) return

    const next = removeExerciseFromLibrary(data, exerciseId)
    persist(next)
  }

  function addFromLibrary(exerciseId) {
    if (!selectedStudent) return
    const next = addLibraryExerciseToWorkout(data, selectedStudent.id, day, exerciseId)
    persist(next)
    setLibraryOpen(false)
  }

  function saveWorkoutExerciseToLibrary(exercise) {
    if (!exercise.name?.trim()) return

    const alreadyExists = libraryExercises.some(
      (item) => item.name.trim().toLowerCase() === exercise.name.trim().toLowerCase()
    )

    if (alreadyExists) {
      setSaved('Esse exercício já está na biblioteca.')
      setTimeout(() => setSaved(''), 2200)
      return
    }

    addCurrentExerciseToLibrary(exercise)
    setSaved('Exercício salvo na biblioteca com sucesso!')
    setTimeout(() => setSaved(''), 2200)
  }

  function addStudent(event) {
    event.preventDefault()
    if (!studentForm.name) return

    const code = (studentForm.code || generateAccessCode()).toUpperCase()
    const password = studentForm.password || generatePassword()

    if (data.students.some((item) => item.code === code)) return

    const nextStudent = {
      id: createId(),
      name: studentForm.name,
      code,
      password,
      active: true,
      updatedAt: new Date().toISOString(),
      workouts: cloneWorkouts(data.workouts),
    }

    persist({
      ...data,
      students: [nextStudent, ...data.students],
    })

    setSelectedStudentId(nextStudent.id)
    setStudentForm({
      name: '',
      code: generateAccessCode(),
      password: generatePassword(),
    })
    setTab('workouts')
  }

  function toggleStudent(id) {
    persist({
      ...data,
      students: data.students.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      ),
    })
  }

  function removeStudent(id) {
    const next = data.students.filter((item) => item.id !== id)
    persist({
      ...data,
      students: next,
    })
    if (selectedStudentId === id) {
      setSelectedStudentId(next[0]?.id || '')
    }
  }

  function copyCredentials(student) {
    const text = `Acesso Danilo Lopes\nCódigo: ${student.code}\nSenha: ${student.password}`
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
      setSaved(`Credenciais de ${student.name} copiadas!`)
      setTimeout(() => setSaved(''), 2200)
    }
  }

  function exit() {
    logoutAdmin()
    navigate('/')
  }

  const currentWorkout = studentWorkouts()[day] || {
    title: '',
    focus: '',
    exercises: [],
  }

  return (
    <div className="min-h-dvh bg-ink-950 text-white">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-ink-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <span className="font-display text-lg tracking-wider text-gold-400">
            DANILO LOPES
          </span>
          <button
            onClick={exit}
            className="rounded-full border border-white/10 p-2 text-zinc-300"
          >
            <LogOut size={16} />
          </button>
        </div>

        <div className="mx-auto grid max-w-md grid-cols-4 gap-2 px-4 pb-3">
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-xl py-2 text-xs font-semibold uppercase tracking-wide ${
                tab === item.id
                  ? 'bg-gold-400 text-ink-950'
                  : 'border border-white/10 bg-ink-800 text-zinc-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-5 pb-24">
        {saved && (
          <p className="mb-4 flex items-center gap-2 rounded-xl bg-gold-400/15 px-3 py-2.5 text-sm font-medium text-gold-300">
            <CheckCircle2 size={16} />
            {saved}
          </p>
        )}

        {tab === 'brand' && (
          <section className="space-y-4">
            <h1 className="font-display text-2xl uppercase">Logomarca</h1>
            <p className="text-sm leading-6 text-zinc-400">
              Envie a logo oficial. Ela é salva e usada na landing, nos logins e no ícone da tela inicial.
            </p>
            <div className="rounded-2xl border border-white/5 bg-ink-800 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-gold-400">Preview atual</p>
              <div className="mt-4 flex items-center justify-center rounded-2xl border border-gold-400/20 bg-ink-950 p-6">
                <img
                  src={logoSrc(data.brand?.logo || '/logo.png')}
                  alt="Logo atual"
                  className="h-28 w-28 rounded-2xl object-cover"
                />
              </div>
            </div>
            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gold-400 px-4 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink-950">
              <ImagePlus size={16} />
              Enviar logo oficial
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
            </label>
            <button
              type="button"
              onClick={resetLogo}
              className="w-full rounded-xl border border-white/10 py-3 text-sm uppercase tracking-wide text-zinc-400"
            >
              Restaurar logo padrão
            </button>
            {logoError && <p className="text-sm text-red-400">{logoError}</p>}
          </section>
        )}

        {tab === 'sales' && (
          <section className="space-y-4">
            <h1 className="font-display text-2xl uppercase">Gestão de Vendas</h1>
            <label className="block text-xs uppercase tracking-[0.18em] text-gold-400">
              Nome do plano
              <input
                value={data.plan.name}
                onChange={(e) => updatePlan('name', e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white"
              />
            </label>
            <label className="block text-xs uppercase tracking-[0.18em] text-gold-400">
              Valor (R$)
              <input
                type="number"
                value={data.plan.price}
                onChange={(e) => updatePlan('price', Number(e.target.value))}
                className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white"
              />
            </label>
            <label className="block text-xs uppercase tracking-[0.18em] text-gold-400">
              Descrição
              <textarea
                value={data.plan.description}
                onChange={(e) => updatePlan('description', e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white"
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
                      className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white"
                    />
                    <button
                      onClick={() => removeInclude(index)}
                      className="rounded-xl border border-white/10 px-3 text-zinc-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addInclude}
                className="mt-3 inline-flex items-center gap-2 text-sm text-gold-300"
              >
                <Plus size={16} />
                Adicionar item
              </button>
            </div>
          </section>
        )}

        {tab === 'workouts' && (
          <section>
            <h1 className="font-display text-2xl uppercase">Fichas individuais</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Cada aluno tem as próprias planilhas A a E. Alterações sincronizam no telemóvel dele.
            </p>
            <label className="mt-4 block text-xs uppercase tracking-[0.18em] text-gold-400">
              Aluno
              <select
                value={selectedStudent?.id || ''}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white"
              >
                {data.students.map((student) => (
                  <option key={student.id} value={student.id} className="bg-ink-900 text-white">
                    {student.name} ({student.code})
                  </option>
                ))}
              </select>
            </label>

            {data.students.length > 1 && (
              <button
                type="button"
                onClick={() => setShowCopyStudentWorkoutsModal(true)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gold-400/30 bg-ink-800 py-2.5 text-xs font-semibold uppercase tracking-wide text-gold-300 hover:bg-gold-400/10 transition"
              >
                <CopyCheck size={15} />
                Copiar ficha completa de outro aluno
              </button>
            )}

            <div className="mt-4 grid grid-cols-5 gap-2">
              {DAYS.map((item) => (
                <button
                  key={item}
                  onClick={() => setDay(item)}
                  className={`rounded-xl py-2 font-display ${
                    day === item
                      ? 'bg-gold-400 text-ink-950 font-bold'
                      : 'border border-white/10 bg-ink-800 text-white'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 shrink-0">
                Copiar de:
              </span>
              {DAYS.filter((d) => d !== day).map((sourceDay) => (
                <button
                  key={sourceDay}
                  type="button"
                  onClick={() => copyWorkoutFromDay(sourceDay)}
                  className="rounded-lg border border-white/10 bg-ink-800 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:border-gold-400/40 hover:text-gold-300 transition shrink-0"
                >
                  Treino {sourceDay}
                </button>
              ))}
            </div>

            <label className="mt-4 block text-xs uppercase tracking-[0.18em] text-gold-400">
              Título
              <input
                value={currentWorkout.title}
                onChange={(e) => updateWorkoutMeta('title', e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white"
              />
            </label>

            <label className="mt-4 block text-xs uppercase tracking-[0.18em] text-gold-400">
              Foco
              <input
                value={currentWorkout.focus}
                onChange={(e) => updateWorkoutMeta('focus', e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white"
              />
            </label>

            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 py-3.5 text-sm font-semibold uppercase tracking-wide text-ink-950 shadow-lg hover:bg-gold-300 transition"
            >
              <Library size={17} />
              Biblioteca de exercícios
            </button>

            <div className="mt-5 space-y-4">
              {(currentWorkout.exercises || []).map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="rounded-2xl border border-white/5 bg-ink-800 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.18em] text-gold-400">
                      Exercício {index + 1}
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => saveWorkoutExerciseToLibrary(exercise)}
                        className="text-gold-300 hover:text-white transition"
                        title="Salvar na biblioteca"
                      >
                        <Library size={16} />
                      </button>
                      <button
                        onClick={() => removeExercise(exercise.id)}
                        className="text-zinc-400 hover:text-red-400 transition"
                        title="Excluir do treino"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <input
                    value={exercise.name}
                    onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                    placeholder="Nome do exercício"
                    className="mb-2 w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white"
                  />

                  <div className="mb-2 flex items-center gap-2">
                    <div className="relative flex-1">
                      <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400" />
                      <input
                        value={exercise.group || ''}
                        onChange={(e) => updateExercise(exercise.id, 'group', e.target.value)}
                        placeholder="Conjugação / Grupo (Ex: Bi-set A, Trí-set)"
                        className="w-full rounded-xl border border-gold-400/30 bg-ink-700 py-2 pl-9 pr-3 text-xs text-gold-300 placeholder:text-zinc-500 outline-none"
                      />
                    </div>
                  </div>

                  <input
                    value={exercise.muscle || ''}
                    onChange={(e) => updateExercise(exercise.id, 'muscle', e.target.value)}
                    placeholder="Grupo muscular (ex: Peito)"
                    className="mb-2 w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white"
                  />

                  <div className="mb-2 grid grid-cols-2 gap-2">
                    <input
                      value={exercise.sets}
                      onChange={(e) => updateExercise(exercise.id, 'sets', e.target.value)}
                      placeholder="Séries"
                      className="rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white"
                    />
                    <input
                      value={exercise.reps}
                      onChange={(e) => updateExercise(exercise.id, 'reps', e.target.value)}
                      placeholder="Repetições"
                      className="rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white"
                    />
                  </div>

                  <textarea
                    value={exercise.notes}
                    onChange={(e) => updateExercise(exercise.id, 'notes', e.target.value)}
                    placeholder="Observações"
                    rows={2}
                    className="mb-2 w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white"
                  />

                  <input
                    value={exercise.video}
                    onChange={(e) => updateExercise(exercise.id, 'video', e.target.value)}
                    placeholder="Cole o link do vídeo (YouTube)"
                    className="w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={addExercise}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gold-400/30 py-3 text-sm font-semibold uppercase tracking-wide text-gold-300 hover:bg-gold-400/10 transition"
            >
              <Plus size={16} />
              Adicionar exercício manualmente
            </button>
          </section>
        )}

        {tab === 'students' && (
          <section>
            <h1 className="font-display text-2xl uppercase">Alunos e acessos</h1>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/5 bg-ink-800 p-3">
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Total cadastrados</p>
                <p className="font-display text-lg text-white">{studentStats.total}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-ink-800 p-3">
                <p className="text-[10px] uppercase tracking-wider text-gold-400">Ativos</p>
                <p className="font-display text-lg text-gold-300">{studentStats.active}</p>
              </div>
            </div>

            <form
              onSubmit={addStudent}
              className="mt-4 space-y-3 rounded-2xl border border-white/5 bg-ink-800 p-4"
            >
              <input
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                placeholder="Nome do aluno"
                className="w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white"
              />
              <input
                value={studentForm.code}
                onChange={(e) => setStudentForm({ ...studentForm, code: e.target.value.toUpperCase() })}
                placeholder="Código único"
                className="w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white"
              />
              <input
                value={studentForm.password}
                onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                placeholder="Senha"
                className="w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2 text-sm text-white"
              />
              <button
                type="button"
                onClick={() =>
                  setStudentForm({
                    ...studentForm,
                    code: generateAccessCode(),
                    password: generatePassword(),
                  })
                }
                className="w-full rounded-xl border border-gold-400/20 py-2 text-xs uppercase tracking-wide text-gold-300"
              >
                Gerar código e senha
              </button>
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 py-3 text-sm font-semibold uppercase tracking-wide text-ink-950"
              >
                <UserPlus size={16} />
                Cadastrar aluno
              </button>
            </form>

            <div className="mt-5 relative">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Pesquisar aluno por nome ou código..."
                className="w-full rounded-xl border border-white/10 bg-ink-800 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-gold-400/40"
              />
            </div>

            <div className="mt-4 space-y-3">
              {filteredStudents.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-ink-800 p-6 text-center">
                  <p className="text-sm text-zinc-400">Nenhum aluno encontrado.</p>
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <article key={student.id} className="rounded-2xl border border-white/5 bg-ink-800 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-display text-xl uppercase">{student.name}</h2>
                        <p className="mt-1 text-sm text-zinc-400">Código: {student.code}</p>
                        <p className="text-sm text-zinc-400">Senha: {student.password}</p>
                      </div>
                      <button onClick={() => removeStudent(student.id)} className="text-zinc-400">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => toggleStudent(student.id)}
                        className={`rounded-lg px-3 py-1 text-xs uppercase tracking-wide ${
                          student.active !== false
                            ? 'bg-gold-400/15 text-gold-300'
                            : 'bg-zinc-700 text-zinc-400'
                        }`}
                      >
                        {student.active !== false ? 'Ativo' : 'Inativo'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStudentId(student.id)
                          setTab('workouts')
                        }}
                        className="rounded-lg bg-ink-700 px-3 py-1 text-xs uppercase tracking-wide text-zinc-200"
                      >
                        Editar treinos
                      </button>
                      <button
                        onClick={() => copyCredentials(student)}
                        className="inline-flex items-center gap-1 rounded-lg bg-ink-700 px-3 py-1 text-xs uppercase tracking-wide text-zinc-200"
                      >
                        <Copy size={12} />
                        Copiar acesso
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}
      </main>

      {showCopyStudentWorkoutsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowCopyStudentWorkoutsModal(false)
            }
          }}
        >
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-ink-900 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold-400">Duplicação</p>
                <h2 className="mt-0.5 font-display text-lg uppercase">Copiar Ficha de Aluno</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCopyStudentWorkoutsModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-zinc-300"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-zinc-400">
              Selecione abaixo o aluno modelo cujas fichas (A a E) você deseja copiar para <strong className="text-white">{selectedStudent?.name}</strong>:
            </p>
            <div className="mt-4 space-y-3">
              <select
                value={sourceStudentIdForCopy}
                onChange={(e) => setSourceStudentIdForCopy(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-ink-800 px-4 py-3 text-sm text-white"
              >
                <option value="" disabled>Selecione o aluno de origem...</option>
                {data.students
                  .filter((s) => s.id !== selectedStudent?.id)
                  .map((student) => (
                    <option key={student.id} value={student.id} className="bg-ink-900 text-white">
                      {student.name} ({student.code})
                    </option>
                  ))}
              </select>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCopyStudentWorkoutsModal(false)}
                  className="rounded-xl border border-white/10 py-3 text-xs uppercase tracking-wide text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!sourceStudentIdForCopy}
                  onClick={executeCopyWorkoutsFromStudent}
                  className="rounded-xl bg-gold-400 py-3 text-xs font-semibold uppercase tracking-wide text-ink-950 disabled:opacity-50"
                >
                  Copiar Fichas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {libraryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-3 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setLibraryOpen(false)
            }
          }}
        >
          <div className="max-h-[92dvh] w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-ink-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-gold-400">Biblioteca</p>
                <h2 className="mt-1 font-display text-xl uppercase">Exercícios</h2>
              </div>
              <button
                type="button"
                onClick={() => setLibraryOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-300"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[calc(92dvh-80px)] overflow-y-auto px-4 py-4">
              <div className="relative">
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Buscar exercício..."
                  className="w-full rounded-xl border border-white/10 bg-ink-800 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-gold-400/40"
                />
              </div>

              {availableMuscles.length > 1 && (
                <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {availableMuscles.map((muscle) => (
                    <button
                      key={muscle}
                      type="button"
                      onClick={() => setSelectedMuscleFilter(muscle)}
                      className={`shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition ${
                        selectedMuscleFilter === muscle
                          ? 'bg-gold-400 text-ink-950'
                          : 'bg-ink-800 border border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {muscle}
                    </button>
                  ))}
                </div>
              )}

              {!showNewLibraryExercise ? (
                <button
                  type="button"
                  onClick={() => setShowNewLibraryExercise(true)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gold-400/30 py-3 text-sm font-semibold uppercase tracking-wide text-gold-300 hover:bg-gold-400/10 transition"
                >
                  <Plus size={16} />
                  Novo exercício na biblioteca
                </button>
              ) : (
                <form
                  onSubmit={saveNewLibraryExercise}
                  className="mt-3 rounded-2xl border border-gold-400/20 bg-ink-800 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.18em] text-gold-400">Novo exercício</p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewLibraryExercise(false)
                        setLibraryForm(emptyLibraryExercise())
                      }}
                      className="text-zinc-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <input
                      value={libraryForm.name}
                      onChange={(e) => setLibraryForm({ ...libraryForm, name: e.target.value })}
                      placeholder="Nome do exercício"
                      className="w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2.5 text-sm text-white"
                    />
                    <input
                      value={libraryForm.group || ''}
                      onChange={(e) => setLibraryForm({ ...libraryForm, group: e.target.value })}
                      placeholder="Conjugação / Grupo (Ex: Bi-set A)"
                      className="w-full rounded-xl border border-gold-400/30 bg-ink-700 px-3 py-2.5 text-xs text-gold-300 placeholder:text-zinc-500"
                    />
                    <input
                      value={libraryForm.muscle}
                      onChange={(e) => setLibraryForm({ ...libraryForm, muscle: e.target.value })}
                      placeholder="Grupo muscular (ex: Peito)"
                      className="w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2.5 text-sm text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={libraryForm.sets}
                        onChange={(e) => setLibraryForm({ ...libraryForm, sets: e.target.value })}
                        placeholder="Séries"
                        className="rounded-xl border border-white/10 bg-ink-700 px-3 py-2.5 text-sm text-white"
                      />
                      <input
                        value={libraryForm.reps}
                        onChange={(e) => setLibraryForm({ ...libraryForm, reps: e.target.value })}
                        placeholder="Repetições"
                        className="rounded-xl border border-white/10 bg-ink-700 px-3 py-2.5 text-sm text-white"
                      />
                    </div>
                    <textarea
                      value={libraryForm.notes}
                      onChange={(e) => setLibraryForm({ ...libraryForm, notes: e.target.value })}
                      placeholder="Observações"
                      rows={2}
                      className="w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2.5 text-sm text-white"
                    />
                    <input
                      value={libraryForm.video}
                      onChange={(e) => setLibraryForm({ ...libraryForm, video: e.target.value })}
                      placeholder="Link do YouTube"
                      className="w-full rounded-xl border border-white/10 bg-ink-700 px-3 py-2.5 text-sm text-white"
                    />
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 py-3 text-sm font-semibold uppercase text-ink-950"
                    >
                      <Plus size={16} />
                      Salvar na biblioteca
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-4 space-y-3">
                {filteredLibrary.length === 0 ? (
                  <div className="rounded-2xl border border-white/5 bg-ink-800 p-6 text-center">
                    <Dumbbell size={28} className="mx-auto text-zinc-600" />
                    <p className="mt-3 text-sm text-zinc-400">Nenhum exercício encontrado.</p>
                  </div>
                ) : (
                  filteredLibrary.map((exercise) => (
                    <article key={exercise.id} className="rounded-2xl border border-white/5 bg-ink-800 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-display text-lg uppercase leading-tight">{exercise.name}</h3>
                          {exercise.group && (
                            <span className="mt-1 inline-block rounded-md bg-gold-400/20 px-2 py-0.5 text-[10px] uppercase font-bold text-gold-300">
                              {exercise.group}
                            </span>
                          )}
                          {exercise.muscle && (
                            <p className="mt-1 text-xs uppercase tracking-wider text-zinc-400">{exercise.muscle}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteLibraryExercise(exercise.id)}
                          className="shrink-0 text-zinc-500 hover:text-red-400 transition"
                          title="Excluir da biblioteca"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-xl bg-ink-700 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Séries</p>
                          <p className="font-display text-lg text-gold-400">{exercise.sets || '-'}</p>
                        </div>
                        <div className="rounded-xl bg-ink-700 px-3 py-2">
                          <p className="text-[10px] uppercase tracking-widest text-zinc-500">Repetições</p>
                          <p className="font-display text-lg text-gold-400">{exercise.reps || '-'}</p>
                        </div>
                      </div>

                      {exercise.notes && (
                        <p className="mt-3 text-xs leading-5 text-zinc-400">{exercise.notes}</p>
                      )}

                    <button
                        type="button"
                        onClick={() => addFromLibrary(exercise.id)}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-950 hover:bg-gold-300 transition"
                      >
                        <Plus size={15} />
                        Adicionar ao treino {day}
                      </button>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
