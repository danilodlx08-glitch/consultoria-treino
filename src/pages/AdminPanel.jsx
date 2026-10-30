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
  CheckCircle2,
  CopyCheck,
  Link2,
  Pencil,
  Activity,
  Scale,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
  Clock,
  RefreshCw,
  Calculator,
} from 'lucide-react'
import { useAuth } from '../auth.jsx'
import { supabase } from '../services/supabase'
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
  { id: 'library', label: 'Biblioteca' },
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

const emptyEvaluationForm = () => ({
  date: new Date().toLocaleDateString('pt-BR'),
  sex: 'male',
  age: '',
  activityFactor: '1.375',
  weight: '',
  height: '',
  fatPercentage: '',
  leanMass: '',
  tmb: '',
  get: '',
  neck: '',
  chest: '',
  arm: '',
  waist: '',
  hips: '',
  thigh: '',
  calf: '',
})

function formatTimeAgo(dateString) {
  if (!dateString) return 'Nunca atualizada'
  const diffDays = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Atualizada hoje'
  if (diffDays === 1) return 'Atualizada ontem'
  if (diffDays < 30) return `Atualizada há ${diffDays} dias`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths === 1) return 'Atualizada há 1 mês'
  if (diffMonths < 12) return `Atualizada há ${diffMonths} meses`
  return 'Atualizada há mais de 1 ano'
}

export default function AdminPanel() {
  const { logoutAdmin } = useAuth()
  const navigate = useNavigate()

  const [data, setData] = useState(() => loadData())
  const [tab, setTab] = useState('brand')
  const [day, setDay] = useState('A')
  const [saved, setSaved] = useState('')
  const [logoError, setLogoError] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')

  const [expandedExercises, setExpandedExercises] = useState({})
  const [showCopyStudentWorkoutsModal, setShowCopyStudentWorkoutsModal] = useState(false)
  const [sourceStudentIdForCopy, setSourceStudentIdForCopy] = useState('')
  const [studentSearch, setStudentSearch] = useState('')

  const [editingStudentCredsId, setEditingStudentCredsId] = useState(null)
  const [editStudentForm, setEditStudentForm] = useState({ code: '', password: '' })

  const [replacingExerciseId, setReplacingExerciseId] = useState(null)
  const [replaceModalOpen, setReplaceModalOpen] = useState(false)

  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [evaluatingStudent, setEvaluatingStudent] = useState(null)
  const [evaluationForm, setEvaluationForm] = useState(emptyEvaluationForm())

  const [studentForm, setStudentForm] = useState({
    name: '',
    code: generateAccessCode(),
    password: generatePassword(),
  })

  const [libraryOpen, setLibraryOpen] = useState(false)
  const [librarySearch, setLibrarySearch] = useState('')
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState('TODOS')
  const [showNewLibraryExercise, setShowNewLibraryExercise] = useState(false)
  const [editingLibraryId, setEditingLibraryId] = useState(null)
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
    setSaved('Salvo na nuvem com sucesso!')
    setTimeout(() => setSaved(''), 2200)
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Falha ao ler o ficheiro'))
      reader.readAsDataURL(file)
    })
  }

  async function handleLogoFile(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setLogoError('Envie um ficheiro de imagem (PNG, JPG, WEBP ou SVG).')
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
      setLogoError('Não foi possível carregar a imagem. Tente outro ficheiro.')
    }
  }

  async function resetLogo() {
    persist({
      ...data,
      brand: { logo: '/logo.png' },
    })
    setLogoError('')
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
        ? { ...item, [field]: value }
        : item
    )
    persistStudentWorkouts({
      ...workouts,
      [day]: { ...workouts[day], exercises },
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

  function moveExercise(index, direction) {
    const workouts = studentWorkouts()
    const exercises = [...workouts[day].exercises]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= exercises.length) return

    const temp = exercises[index]
    exercises[index] = exercises[targetIndex]
    exercises[targetIndex] = temp

    persistStudentWorkouts({
      ...workouts,
      [day]: { ...workouts[day], exercises },
    })
  }

  function replaceExerciseWithLibrary(libraryExerciseId) {
    if (!replacingExerciseId || !selectedStudent) return
    const libEx = (data.exercisesLibrary || []).find((e) => e.id === libraryExerciseId)
    if (!libEx) return

    const workouts = studentWorkouts()
    const exercises = workouts[day].exercises.map((item) => {
      if (item.id === replacingExerciseId) {
        return {
          ...item,
          libraryId: libEx.id,
          name: libEx.name,
          muscle: libEx.muscle || '',
          sets: libEx.sets || item.sets || '3',
          reps: libEx.reps || item.reps || '10-12',
          notes: libEx.notes || item.notes || '',
          video: libEx.video || item.video || '',
          group: libEx.group || item.group || '',
        }
      }
      return item
    })

    persistStudentWorkouts({
      ...workouts,
      [day]: { ...workouts[day], exercises },
    })

    setReplaceModalOpen(false)
    setReplacingExerciseId(null)
    setSaved('Exercício substituído com sucesso na mesma posição!')
    setTimeout(() => setSaved(''), 2200)
  }

  function toggleExerciseExpand(id) {
    setExpandedExercises((prev) => ({
      ...prev,
      [id]: prev[id] === false ? true : false,
    }))
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

    const confirmed = window.confirm(`Deseja copiar todos os exercícios do Treino ${sourceDay} para o Treino ${day}?`)
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

  // --- Função de Cálculo Automático da Avaliação Física ---
  function calculateMetrics() {
    const weight = parseFloat(evaluationForm.weight)
    let height = parseFloat(evaluationForm.height)
    const age = parseInt(evaluationForm.age, 10)
    const isMale = evaluationForm.sex === 'male'
    const actFactor = parseFloat(evaluationForm.activityFactor) || 1.375

    if (!weight || !height) {
      alert('Preencha ao menos o Peso e a Altura para calcular.')
      return
    }

    // Se altura for fornecida em metros (ex: 1.75), converte para cm
    const heightCm = height < 3 ? height * 100 : height

    // 1. TMB - Mifflin-St Jeor Formula
    let tmbVal = 0
    if (age) {
      if (isMale) {
        tmbVal = 10 * weight + 6.25 * heightCm - 5 * age + 5
      } else {
        tmbVal = 10 * weight + 6.25 * heightCm - 5 * age - 161
      }
    } else {
      // Fallback sem idade
      tmbVal = isMale ? 24 * weight : 22 * weight
    }

    // 2. GET
    const getVal = tmbVal * actFactor

    // 3. Percentual de Gordura (%BF)
    let fatVal = parseFloat(evaluationForm.fatPercentage)
    const waist = parseFloat(evaluationForm.waist)
    const neck = parseFloat(evaluationForm.neck)
    const hips = parseFloat(evaluationForm.hips)

    // US Navy Body Fat Formula (se circunferência da cintura e pescoço/quadril forem preenchidas)
    if (waist && neck) {
      if (isMale && waist > neck) {
        fatVal = 86.010 * Math.log10(waist - neck) - 70.041 * Math.log10(heightCm) + 36.76
      } else if (!isMale && hips && (waist + hips) > neck) {
        fatVal = 163.205 * Math.log10(waist + hips - neck) - 97.684 * Math.log10(heightCm) - 78.387
      }
    }

    // Fallback por IMC e idade/sexo caso não tenha circunferências necessárias
    if (!fatVal || isNaN(fatVal) || fatVal <= 0) {
      const heightM = heightCm / 100
      const bmi = weight / (heightM * heightM)
      const userAge = age || 25
      const sexVal = isMale ? 1 : 0
      fatVal = (1.20 * bmi) + (0.23 * userAge) - (10.8 * sexVal) - 5.4
    }

    fatVal = Math.max(3, Math.min(60, fatVal))

    // 4. Massa Magra (kg)
    const leanMassVal = weight * (1 - fatVal / 100)

    setEvaluationForm((prev) => ({
      ...prev,
      tmb: Math.round(tmbVal).toString(),
      get: Math.round(getVal).toString(),
      fatPercentage: fatVal.toFixed(1),
      leanMass: leanMassVal.toFixed(1),
    }))
  }

  function handleSaveEvaluation(e) {
    e.preventDefault()
    if (!evaluatingStudent) return

    const newEvaluation = {
      date: evaluationForm.date || new Date().toLocaleDateString('pt-BR'),
      weight: Number(evaluationForm.weight) || 0,
      height: Number(evaluationForm.height) || 0,
      fatPercentage: Number(evaluationForm.fatPercentage) || 0,
      leanMass: Number(evaluationForm.leanMass) || 0,
      tmb: Number(evaluationForm.tmb) || 0,
      get: Number(evaluationForm.get) || 0,
      circumferences: {
        neck: Number(evaluationForm.neck) || 0,
        chest: Number(evaluationForm.chest) || 0,
        arm: Number(evaluationForm.arm) || 0,
        waist: Number(evaluationForm.waist) || 0,
        hips: Number(evaluationForm.hips) || 0,
        thigh: Number(evaluationForm.thigh) || 0,
        calf: Number(evaluationForm.calf) || 0,
      },
    }

    const updatedStudents = data.students.map((student) => {
      if (student.id === evaluatingStudent.id) {
        return {
          ...student,
          evaluations: [...(student.evaluations || []), newEvaluation],
          updatedAt: new Date().toISOString(),
        }
      }
      return student
    })

    persist({ ...data, students: updatedStudents })
    setShowEvaluationModal(false)
    setEvaluatingStudent(null)
    setEvaluationForm(emptyEvaluationForm())
    setSaved('Avaliação física salva com sucesso!')
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

  function propagateLibraryExerciseUpdate(currentState, updatedExercise, originalExerciseName) {
    const updatedStudents = currentState.students.map((student) => {
      if (!student.workouts) return student

      let studentUpdated = false
      const nextWorkouts = { ...student.workouts }

      DAYS.forEach((d) => {
        if (nextWorkouts[d] && nextWorkouts[d].exercises) {
          const newExercises = nextWorkouts[d].exercises.map((ex) => {
            const isMatch =
              (ex.libraryId && ex.libraryId === updatedExercise.id) ||
              (ex.name && originalExerciseName && ex.name.trim().toLowerCase() === originalExerciseName.trim().toLowerCase())

            if (isMatch) {
              studentUpdated = true
              return {
                ...ex,
                libraryId: updatedExercise.id,
                name: updatedExercise.name,
                muscle: updatedExercise.muscle || ex.muscle,
                notes: updatedExercise.notes || ex.notes,
                video: updatedExercise.video,
                group: updatedExercise.group || ex.group,
              }
            }
            return ex
          })

          if (studentUpdated) {
            nextWorkouts[d] = {
              ...nextWorkouts[d],
              exercises: newExercises,
            }
          }
        }
      })

      if (studentUpdated) {
        return {
          ...student,
          workouts: nextWorkouts,
          updatedAt: new Date().toISOString(),
        }
      }

      return student
    })

    return updatedStudents
  }

  function saveNewLibraryExercise(event) {
    event.preventDefault()
    if (!libraryForm.name.trim()) return

    if (editingLibraryId) {
      const originalLibItem = (data.exercisesLibrary || []).find((e) => e.id === editingLibraryId)
      const originalName = originalLibItem ? originalLibItem.name : ''

      const updatedLibExercise = {
        id: editingLibraryId,
        ...libraryForm,
        name: libraryForm.name.trim(),
      }

      const nextBase = updateLibraryExercise(data, editingLibraryId, updatedLibExercise)
      const updatedStudents = propagateLibraryExerciseUpdate(
        nextBase,
        updatedLibExercise,
        originalName
      )

      persist({
        ...nextBase,
        students: updatedStudents,
      })
      setSaved('Exercício atualizado na biblioteca e em todos os alunos!')
    } else {
      const next = addExerciseToLibrary(data, {
        ...libraryForm,
        name: libraryForm.name.trim(),
      })
      persist(next)
      setSaved('Novo exercício salvo na biblioteca!')
    }

    setLibraryForm(emptyLibraryExercise())
    setShowNewLibraryExercise(false)
    setEditingLibraryId(null)
    setTimeout(() => setSaved(''), 2500)
  }

  function startEditingLibrary(exercise) {
    setEditingLibraryId(exercise.id)
    setLibraryForm({
      name: exercise.name || '',
      muscle: exercise.muscle || '',
      sets: exercise.sets || '',
      reps: exercise.reps || '',
      notes: exercise.notes || '',
      video: exercise.video || '',
      group: exercise.group || '',
    })
    setShowNewLibraryExercise(true)
  }

  function deleteLibraryExercise(exerciseId) {
    const exercise = libraryExercises.find((item) => item.id === exerciseId)
    if (!exercise) return
    const confirmed = window.confirm(`Excluir "${exercise.name}" da biblioteca?`)
    if (!confirmed) return
    const next = removeExerciseFromLibrary(data, exerciseId)
    persist(next)
  }

  function addFromLibraryToCurrentStudent(exerciseId) {
    if (!selectedStudent) return
    const next = addLibraryExerciseToWorkout(data, selectedStudent.id, day, exerciseId)
    persist(next)
    setSaved('Exercício adicionado ao treino do aluno!')
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
      evaluations: [],
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

  function saveStudentCredentials(studentId) {
    const newCode = editStudentForm.code.trim().toUpperCase()
    const newPass = editStudentForm.password.trim()
    if (!newCode || !newPass) return

    const updatedStudents = data.students.map((st) =>
      st.id === studentId
        ? { ...st, code: newCode, password: newPass, updatedAt: new Date().toISOString() }
        : st
    )

    persist({ ...data, students: updatedStudents })
    setEditingStudentCredsId(null)
    setSaved('Credenciais do aluno atualizadas!')
    setTimeout(() => setSaved(''), 2200)
  }

  function toggleStudent(id) {
    persist({
      ...data,
      students: data.students.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      ),
    })
  }

  async function removeStudent(id) {
    const confirmed = window.confirm('Deseja realmente excluir este aluno?')
    if (!confirmed) return

    const { error } = await supabase.from('alunos').delete().eq('id', id)
    if (error) {
      console.error('Erro ao excluir aluno no Supabase:', error)
      alert('Erro ao excluir aluno na base de dados.')
      return
    }

    const next = data.students.filter((item) => item.id !== id)
    persist({ ...data, students: next })

    if (selectedStudentId === id) {
      setSelectedStudentId(next[0]?.id || '')
    }
    setSaved('Aluno excluído com sucesso!')
    setTimeout(() => setSaved(''), 2200)
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
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3.5">
          <span className="font-display text-xl tracking-wider text-gold-400 font-bold">
            DANILO LOPES
          </span>
          <button
            onClick={exit}
            className="rounded-full border border-white/10 p-2.5 text-zinc-200 hover:text-gold-400 transition"
          >
            <LogOut size={18} />
          </button>
        </div>

        <div className="mx-auto grid max-w-md grid-cols-4 gap-2 px-4 pb-3.5">
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition ${
                tab === item.id
                  ? 'bg-gold-400 text-ink-950 shadow-md'
                  : 'border border-white/10 bg-ink-800 text-zinc-200 hover:border-gold-400/40'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-6 pb-28">
        {saved && (
          <p className="mb-4 flex items-center gap-2 rounded-xl bg-gold-400/20 px-3.5 py-3 text-sm font-semibold text-gold-300 border border-gold-400/30">
            <CheckCircle2 size={18} />
            {saved}
          </p>
        )}

        {tab === 'brand' && (
          <section className="space-y-4">
            <h1 className="font-display text-3xl uppercase">Logomarca</h1>
            <p className="text-base leading-relaxed text-zinc-300">
              Envie a logo oficial. Ela é salva e usada na landing, nos logins e no ícone da tela inicial.
            </p>
            <div className="rounded-2xl border border-white/10 bg-ink-800 p-4.5">
              <p className="text-xs uppercase tracking-[0.18em] text-gold-400 font-bold">Preview atual</p>
              <div className="mt-4 flex items-center justify-center rounded-2xl border border-gold-400/20 bg-ink-950 p-6">
                <img
                  src={logoSrc(data.brand?.logo || '/logo.png')}
                  alt="Logo atual"
                  className="h-32 w-32 rounded-2xl object-cover"
                />
              </div>
            </div>
            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gold-400 px-4 py-4 text-sm font-bold uppercase tracking-wide text-ink-950 shadow-md hover:bg-gold-300 transition">
              <ImagePlus size={18} />
              Enviar logo oficial
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoFile} />
            </label>
            <button
              type="button"
              onClick={resetLogo}
              className="w-full rounded-xl border border-white/15 py-3.5 text-sm font-semibold uppercase tracking-wide text-zinc-300 hover:bg-white/5 transition"
            >
              Restaurar logo padrão
            </button>
            {logoError && <p className="text-sm font-semibold text-red-400">{logoError}</p>}
          </section>
        )}

        {tab === 'library' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl uppercase">Biblioteca</h1>
                <p className="text-xs text-zinc-300">Gerencie todos os exercícios cadastrados.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingLibraryId(null)
                  setLibraryForm(emptyLibraryExercise())
                  setShowNewLibraryExercise(!showNewLibraryExercise)
                }}
                className="flex items-center gap-1.5 rounded-xl bg-gold-400 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wide text-ink-950 shadow-md hover:bg-gold-300 transition"
              >
                <Plus size={16} />
                Novo
              </button>
            </div>

            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                placeholder="Pesquisar exercício..."
                className="w-full rounded-xl border border-white/15 bg-ink-800 py-3.5 pl-11 pr-3.5 text-base text-white outline-none focus:border-gold-400/50"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {availableMuscles.map((muscle) => (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => setSelectedMuscleFilter(muscle)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition shrink-0 ${
                    selectedMuscleFilter === muscle
                      ? 'bg-gold-400 text-ink-950 shadow'
                      : 'border border-white/10 bg-ink-800 text-zinc-300 hover:border-gold-400/40'
                  }`}
                >
                  {muscle}
                </button>
              ))}
            </div>

            {showNewLibraryExercise && (
              <form onSubmit={saveNewLibraryExercise} className="rounded-2xl border border-gold-400/40 bg-ink-800 p-4.5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-gold-400 font-bold">
                    {editingLibraryId ? 'Editar exercício' : 'Novo exercício'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewLibraryExercise(false)
                      setEditingLibraryId(null)
                    }}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
                <input
                  value={libraryForm.name}
                  onChange={(e) => setLibraryForm({ ...libraryForm, name: e.target.value })}
                  placeholder="Nome do exercício"
                  className="w-full rounded-xl border border-white/15 bg-ink-700 px-3.5 py-3 text-sm text-white outline-none focus:border-gold-400/50"
                  required
                />
                <input
                  value={libraryForm.muscle}
                  onChange={(e) => setLibraryForm({ ...libraryForm, muscle: e.target.value })}
                  placeholder="Grupo muscular (Ex: Peito)"
                  className="w-full rounded-xl border border-white/15 bg-ink-700 px-3.5 py-3 text-sm text-white outline-none focus:border-gold-400/50"
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    value={libraryForm.sets}
                    onChange={(e) => setLibraryForm({ ...libraryForm, sets: e.target.value })}
                    placeholder="Séries padrão"
                    className="rounded-xl border border-white/15 bg-ink-700 px-3.5 py-3 text-sm text-white outline-none"
                  />
                  <input
                    value={libraryForm.reps}
                    onChange={(e) => setLibraryForm({ ...libraryForm, reps: e.target.value })}
                    placeholder="Reps padrão"
                    className="rounded-xl border border-white/15 bg-ink-700 px-3.5 py-3 text-sm text-white outline-none"
                  />
                </div>
                <textarea
                  value={libraryForm.notes}
                  onChange={(e) => setLibraryForm({ ...libraryForm, notes: e.target.value })}
                  placeholder="Observações padrão"
                  rows={2}
                  className="w-full rounded-xl border border-white/15 bg-ink-700 px-3.5 py-3 text-sm text-white outline-none"
                />
                <input
                  value={libraryForm.video}
                  onChange={(e) => setLibraryForm({ ...libraryForm, video: e.target.value })}
                  placeholder="Link do vídeo (YouTube)"
                  className="w-full rounded-xl border border-white/15 bg-ink-700 px-3.5 py-3 text-sm text-white outline-none"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gold-400 py-3.5 text-xs font-bold uppercase tracking-wide text-ink-950 shadow-md hover:bg-gold-300 transition"
                >
                  {editingLibraryId ? 'Salvar alterações' : 'Adicionar à biblioteca'}
                </button>
              </form>
            )}

            <div className="space-y-3 pt-2">
              {filteredLibrary.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-ink-800 p-6 text-center">
                  <p className="text-sm text-zinc-400">Nenhum exercício encontrado na biblioteca.</p>
                </div>
              ) : (
                filteredLibrary.map((exercise) => (
                  <div key={exercise.id} className="rounded-2xl border border-white/10 bg-ink-800 p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-display text-base uppercase text-white">{exercise.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {exercise.muscle && (
                            <span className="text-xs text-gold-400 font-semibold uppercase">{exercise.muscle}</span>
                          )}
                          {exercise.sets && exercise.reps && (
                            <span className="text-xs text-zinc-400">({exercise.sets}x{exercise.reps})</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEditingLibrary(exercise)}
                          className="rounded-xl border border-white/15 p-2 text-zinc-300 hover:text-gold-400 transition"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteLibraryExercise(exercise.id)}
                          className="rounded-xl border border-white/15 p-2 text-zinc-300 hover:text-red-400 transition"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    {selectedStudent && (
                      <button
                        type="button"
                        onClick={() => addFromLibraryToCurrentStudent(exercise.id)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400/10 border border-gold-400/30 py-2.5 text-xs font-bold uppercase tracking-wider text-gold-300 hover:bg-gold-400/20 transition"
                      >
                        <Plus size={16} />
                        Enviar para o treino atual de {selectedStudent.name} ({day})
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {tab === 'workouts' && (
          <section className="flex flex-col h-[calc(100vh-140px)] overflow-hidden">
            <div className="shrink-0 bg-ink-950 pb-3 z-10 space-y-3 border-b border-white/10">
              <div>
                <h1 className="font-display text-2xl uppercase">Fichas individuais</h1>
                <p className="text-xs text-zinc-300">Cada aluno tem as próprias planilhas A a E.</p>
              </div>

              <select
                value={selectedStudent?.id || ''}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-ink-800 px-4 py-3 text-sm text-white outline-none focus:border-gold-400/50"
              >
                {data.students.map((student) => (
                  <option key={student.id} value={student.id} className="bg-ink-900 text-white">
                    {student.name} ({student.code})
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-5 gap-2">
                {DAYS.map((item) => (
                  <button
                    key={item}
                    onClick={() => setDay(item)}
                    className={`rounded-xl py-2 font-display text-lg transition ${
                      day === item
                        ? 'bg-gold-400 text-ink-950 font-bold shadow-md'
                        : 'border border-white/15 bg-ink-800 text-white hover:border-gold-400/40'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold shrink-0">
                  Copiar de:
                </span>
                {DAYS.filter((d) => d !== day).map((sourceDay) => (
                  <button
                    key={sourceDay}
                    type="button"
                    onClick={() => copyWorkoutFromDay(sourceDay)}
                    className="rounded-lg border border-white/15 bg-ink-800 px-2.5 py-1 text-xs font-bold text-zinc-200 hover:border-gold-400/40 hover:text-gold-300 transition shrink-0"
                  >
                    Treino {sourceDay}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  value={currentWorkout.title}
                  onChange={(e) => updateWorkoutMeta('title', e.target.value)}
                  placeholder="Título (Ex: Empurrar)"
                  className="rounded-xl border border-white/15 bg-ink-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-gold-400/50"
                />
                <input
                  value={currentWorkout.focus}
                  onChange={(e) => updateWorkoutMeta('focus', e.target.value)}
                  placeholder="Foco (Ex: Superior)"
                  className="rounded-xl border border-white/15 bg-ink-800 px-3.5 py-2.5 text-sm text-white outline-none focus:border-gold-400/50"
                />
              </div>

              <button
                type="button"
                onClick={() => setLibraryOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-400 py-3.5 text-sm font-bold uppercase tracking-wide text-ink-950 shadow-lg hover:bg-gold-300 transition"
              >
                <Library size={18} />
                Selecionar da biblioteca rápida
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pt-4 pb-20">
              {(currentWorkout.exercises || []).map((exercise, index, arr) => {
                const isExpanded = expandedExercises[exercise.id] !== false
                const hasGroup = Boolean(exercise.group?.trim())

                return (
                  <div
                    key={exercise.id}
                    className={`rounded-2xl border bg-ink-800 p-4 transition-all ${
                      hasGroup ? 'border-gold-400/60 shadow-lg shadow-gold-400/5' : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gold-400/20 text-xs font-bold text-gold-400 border border-gold-400/30">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1 cursor-pointer" onClick={() => toggleExerciseExpand(exercise.id)}>
                          <p className="font-display text-base uppercase truncate text-white">
                            {exercise.name || 'Exercício sem nome'}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {exercise.muscle && (
                              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
                                {exercise.muscle}
                              </span>
                            )}
                            {hasGroup && (
                              <span className="rounded bg-gold-400/20 px-1.5 py-0.5 text-[10px] uppercase font-bold text-gold-300 border border-gold-400/30">
                                {exercise.group}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setReplacingExerciseId(exercise.id)
                            setReplaceModalOpen(true)
                          }}
                          className="p-1.5 text-gold-400 hover:text-gold-300 transition"
                          title="Substituir por outro da biblioteca"
                        >
                          <RefreshCw size={16} />
                        </button>
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => moveExercise(index, 'up')}
                            className="p-1.5 text-zinc-400 hover:text-gold-300 transition"
                            title="Mover para cima"
                          >
                            <ArrowUp size={16} />
                          </button>
                        )}
                        {index < arr.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveExercise(index, 'down')}
                            className="p-1.5 text-zinc-400 hover:text-gold-300 transition"
                            title="Mover para baixo"
                          >
                            <ArrowDown size={16} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (!exercise.name?.trim()) return
                            addCurrentExerciseToLibrary(exercise)
                            setSaved('Exercício salvo na biblioteca!')
                            setTimeout(() => setSaved(''), 2200)
                          }}
                          className="p-1.5 text-gold-300 hover:text-white transition"
                          title="Salvar na biblioteca"
                        >
                          <Library size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeExercise(exercise.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 transition"
                          title="Excluir do treino
