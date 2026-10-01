import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ExternalLink,
  LogOut,
  RefreshCw,
  X,
  Play,
  Timer,
  RotateCcw,
  MessageCircle,
  Link2,
  CheckCircle2,
  Trophy,
  Lightbulb,
  ArrowLeft,
  Activity,
  Scale,
  Flame,
  UserCheck,
  FlameKindling,
  ChevronRight,
  ChevronLeft,
  Pause,
  PlayCircle,
  Gauge,
  Save
} from 'lucide-react'

import { useAuth } from '../auth.jsx'
import { supabase } from '../services/supabase'

const DAYS = ['A', 'B', 'C', 'D', 'E']

const SESSION_PREFIX = 'dl_consultoria_student_session_v2'
const HISTORY_PREFIX = 'dl_consultoria_student_history_v2'

const WHATSAPP_NUMBER = '5527996247906'

/* =========================================================
   HELPERS
========================================================= */

function youtubeId(url = '') {
  if (!url) return ''

  try {
    const value = String(url).trim()

    if (value.includes('youtu.be/')) {
      return value.split('youtu.be/')[1]?.split(/[?&]/)[0] || ''
    }

    if (value.includes('youtube.com/watch')) {
      return new URL(value).searchParams.get('v') || ''
    }

    if (value.includes('youtube.com/embed/')) {
      return value.split('youtube.com/embed/')[1]?.split(/[?&]/)[0] || ''
    }

    return ''
  } catch {
    return ''
  }
}

function safeStorageGet(key, fallback = null) {
  try {
    const value = localStorage.getItem(key)

    if (!value) return fallback

    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function safeStorageRemove(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

function getStudentStorageKey(prefix, studentId, day) {
  return `${prefix}_${studentId || 'student'}_${day}`
}

function getExerciseKey(exercise, index = 0) {
  if (exercise?.id !== undefined && exercise?.id !== null) {
    return String(exercise.id)
  }

  const name =
    exercise?.name ||
    exercise?.nome ||
    exercise?.exercise ||
    exercise?.exercicio ||
    `exercise-${index}`

  return `${String(name)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9áéíóúãõç-]/gi, '')}-${index}`
}

function getDateKey(date = new Date()) {
  const d = new Date(date)

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0')
  ].join('-')
}

function formatDate(date) {
  if (!date) return ''

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date))
  } catch {
    return ''
  }
}

function formatSessionTime(totalSeconds = 0) {
  const seconds = Math.max(0, Number(totalSeconds) || 0)

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(secs).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(
    2,
    '0'
  )}`
}

function playBeep() {
  try {
    const AudioContext =
      window.AudioContext || window.webkitAudioContext

    if (!AudioContext) return

    const context = new AudioContext()
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = 880

    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(
      0.18,
      context.currentTime + 0.01
    )
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + 0.35
    )

    oscillator.connect(gain)
    gain.connect(context.destination)

    oscillator.start()
    oscillator.stop(context.currentTime + 0.35)

    setTimeout(() => {
      try {
        context.close()
      } catch {
        // ignore
      }
    }, 500)
  } catch {
    // ignore
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function StudentArea() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  /* =======================================================
     DATA
  ======================================================= */

  const [data, setData] = useState({
    students: [],
    workouts: [],
    exercises: [],
    evaluations: []
  })

  const [syncedAt, setSyncedAt] = useState(null)

  /* =======================================================
     WORKOUT
  ======================================================= */

  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState('A')

  const [currentSession, setCurrentSession] = useState(null)

  const [inWorkoutMode, setInWorkoutMode] = useState(false)
  const [workoutActiveIndex, setWorkoutActiveIndex] = useState(0)

  const [showFinishedScreen, setShowFinishedScreen] = useState(false)

  const [sessionActive, setSessionActive] = useState(false)
  const [sessionPaused, setSessionPaused] = useState(false)

  const [timerSeconds, setTimerSeconds] = useState(0)

  const [selectedVideo, setSelectedVideo] = useState(null)
  const [selectedObs, setSelectedObs] = useState(null)

  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false)

  const [showHistory, setShowHistory] = useState(false)

  /* =======================================================
     REST TIMER
  ======================================================= */

  const [activeRestMenu, setActiveRestMenu] = useState(false)
  const [initialTime, setInitialTime] = useState(60)

  /* =======================================================
     FEEDBACK / CARGA / RPE
  ======================================================= */

  const [editingFeedback, setEditingFeedback] = useState(null)
  const [tempLoad, setTempLoad] = useState('')
  const [tempRpe, setTempRpe] = useState('')

  /* =======================================================
     AUTHENTICATED STUDENT
  ======================================================= */

  const current = useMemo(() => {
    if (!user?.id) return null

    return (
      data.students?.find(
        student =>
          String(student.id) === String(user.id) ||
          String(student.user_id) === String(user.id)
      ) || null
    )
  }, [data.students, user?.id])

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        /*
         * Mantém a estrutura compatível com o serviço já utilizado
         * pelo projeto.
         */
        const { data: students } = await supabase
          .from('students')
          .select('*')

        const { data: workouts } = await supabase
          .from('workouts')
          .select('*')

        const { data: exercises } = await supabase
          .from('exercises')
          .select('*')

        const { data: evaluations } = await supabase
          .from('evaluations')
          .select('*')

        if (!mounted) return

        setData({
          students: students || [],
          workouts: workouts || [],
          exercises: exercises || [],
          evaluations: evaluations || []
        })

        setSyncedAt(new Date())
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [])

  /* =======================================================
     WORKOUT DATA
  ======================================================= */

  const workout = useMemo(() => {
    if (!current) return null

    const studentId = current.id || current.user_id

    const candidates = data.workouts || []

    return (
      candidates.find(item => {
        const itemStudentId =
          item.student_id ||
          item.studentId ||
          item.user_id

        const itemDay =
          item.day ||
          item.workout_day ||
          item.workoutDay

        return (
          String(itemStudentId) === String(studentId) &&
          String(itemDay).toUpperCase() ===
            selectedWorkoutDay
        )
      }) || null
    )
  }, [
    current,
    data.workouts,
    selectedWorkoutDay
  ])

  /* =======================================================
     EXERCISES
  ======================================================= */

  const workoutExercises = useMemo(() => {
    if (!workout) return []

    const workoutId = workout.id

    const exercises = (data.exercises || []).filter(
      exercise => {
        const exerciseWorkoutId =
          exercise.workout_id ||
          exercise.workoutId

        return (
          String(exerciseWorkoutId) ===
          String(workoutId)
        )
      }
    )

    return exercises
  }, [data.exercises, workout])

  /*
   * Mantém a lógica de agrupamento utilizada no projeto.
   * Exercícios com grupo são agrupados; os demais entram
   * posteriormente.
   */
  const sortedExercises = useMemo(() => {
    const exercises = [...workoutExercises]

    if (!exercises.length) return []

    const grouped = []
    const ungrouped = []

    exercises.forEach((exercise, index) => {
      const group =
        exercise.group ||
        exercise.grupo ||
        exercise.exercise_group ||
        exercise.exerciseGroup

      if (group) {
        grouped.push({
          ...exercise,
          __originalIndex: index
        })
      } else {
        ungrouped.push({
          ...exercise,
          __originalIndex: index
        })
      }
    })

    grouped.sort((a, b) => {
      const groupA = String(
        a.group ||
          a.grupo ||
          a.exercise_group ||
          a.exerciseGroup
      )

      const groupB = String(
        b.group ||
          b.grupo ||
          b.exercise_group ||
          b.exerciseGroup
      )

      return groupA.localeCompare(groupB, 'pt-BR')
    })

    return [...grouped, ...ungrouped]
  }, [workoutExercises])

  const totalExercises = sortedExercises.length

  /* =======================================================
     SESSION STORAGE KEY
  ======================================================= */

  const studentStorageId = current?.id || current?.user_id

  const sessionStorageKey = useMemo(() => {
    return getStudentStorageKey(
      SESSION_PREFIX,
      studentStorageId,
      selectedWorkoutDay
    )
  }, [studentStorageId, selectedWorkoutDay])

  const historyStorageKey = useMemo(() => {
    return getStudentStorageKey(
      HISTORY_PREFIX,
      studentStorageId,
      selectedWorkoutDay
    )
  }, [studentStorageId, selectedWorkoutDay])

  /* =======================================================
     CREATE NEW SESSION
  ======================================================= */

  function createSession() {
    const newSession = {
      id: `${selectedWorkoutDay}-${Date.now()}`,
      day: selectedWorkoutDay,
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      completed: [],
      loads: {},
      rpe: {},
      activeIndex: 0,
      status: 'active'
    }

    setCurrentSession(newSession)
    setWorkoutActiveIndex(0)
    setShowFinishedScreen(false)

    safeStorageSet(sessionStorageKey, newSession)
  }

  /* =======================================================
     LOAD / RESUME SESSION
  ======================================================= */

  useEffect(() => {
    if (!studentStorageId) return

    if (!sortedExercises.length) {
      setCurrentSession(null)
      return
    }

    const savedSession = safeStorageGet(
      sessionStorageKey,
      null
    )

    if (
      savedSession &&
      savedSession.status === 'active'
    ) {
      /*
       * Garante que exercícios removidos do treino não
       * permaneçam marcados como concluídos.
       */
      const validKeys = new Set(
        sortedExercises.map((exercise, index) =>
          getExerciseKey(exercise, index)
        )
      )

      const completed = Array.isArray(
        savedSession.completed
      )
        ? savedSession.completed.filter(key =>
            validKeys.has(String(key))
          )
        : []

      const activeIndex = Math.min(
        Math.max(
          Number(savedSession.activeIndex) || 0,
          0
        ),
        Math.max(sortedExercises.length - 1, 0)
      )

      const normalizedSession = {
        ...savedSession,
        day: selectedWorkoutDay,
        completed,
        loads: savedSession.loads || {},
        rpe: savedSession.rpe || {},
        elapsedSeconds:
          Number(savedSession.elapsedSeconds) || 0,
        activeIndex,
        status: 'active'
      }

      setCurrentSession(normalizedSession)
      setWorkoutActiveIndex(activeIndex)
      setShowFinishedScreen(false)
    } else {
      createSession()
    }
  }, [
    studentStorageId,
    selectedWorkoutDay,
    sessionStorageKey,
    sortedExercises.length
  ])

  /* =======================================================
     SESSION PERSISTENCE
  ======================================================= */

  useEffect(() => {
    if (!currentSession) return

    safeStorageSet(
      sessionStorageKey,
      currentSession
    )
  }, [
    currentSession,
    sessionStorageKey
  ])

  /* =======================================================
     SESSION TIMER
  ======================================================= */

  useEffect(() => {
    if (!sessionActive || sessionPaused) return

    const interval = setInterval(() => {
      setCurrentSession(prev => {
        if (!prev) return prev

        return {
          ...prev,
          elapsedSeconds:
            (Number(prev.elapsedSeconds) || 0) + 1
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionActive, sessionPaused])

  /* =======================================================
     REST TIMER
  ======================================================= */

  useEffect(() => {
    if (timerSeconds <= 0) return

    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          playBeep()
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerSeconds])

  /* =======================================================
     CURRENT EXERCISE
  ======================================================= */

  const activeExercise =
    sortedExercises[workoutActiveIndex] || null

  const sessionSeconds =
    Number(currentSession?.elapsedSeconds) || 0

  const completedCount =
    currentSession?.completed?.length || 0

  const progressPercentage =
    totalExercises > 0
      ? Math.round(
          (completedCount / totalExercises) * 100
        )
      : 0

  /* =======================================================
     EXERCISE COMPLETION
  ======================================================= */

  function isExerciseCompleted(exercise, index) {
    if (!currentSession) return false

    const key = getExerciseKey(exercise, index)

    return currentSession.completed?.includes(key)
  }

  function toggleCompleteExercise(exercise, index) {
    if (!currentSession) return

    const key = getExerciseKey(exercise, index)

    setCurrentSession(prev => {
      if (!prev) return prev

      const completed = Array.isArray(prev.completed)
        ? [...prev.completed]
        : []

      const position = completed.indexOf(key)

      if (position >= 0) {
        completed.splice(position, 1)
      } else {
        completed.push(key)
      }

      return {
        ...prev,
        completed
      }
    })
  }

  /* =======================================================
     FEEDBACK EDITOR
  ======================================================= */

  function openFeedbackEditor(exercise, index) {
    if (!currentSession) return

    const key = getExerciseKey(exercise, index)

    setEditingFeedback({
      exercise,
      index,
      key
    })

    setTempLoad(
      currentSession.loads?.[key] ?? ''
    )

    setTempRpe(
      currentSession.rpe?.[key] ?? ''
    )
  }

  function saveFeedbackEditor() {
    if (!editingFeedback) return

    const { key } = editingFeedback

    setCurrentSession(prev => {
      if (!prev) return prev

      return {
        ...prev,
        loads: {
          ...(prev.loads || {}),
          [key]: tempLoad
        },
        rpe: {
          ...(prev.rpe || {}),
          [key]: tempRpe
        }
      }
    })

    setEditingFeedback(null)
    setTempLoad('')
    setTempRpe('')
  }

  /* =======================================================
     REST TIMER
  ======================================================= */

  function startRest(seconds) {
    const value = Number(seconds) || 60

    setInitialTime(value)
    setTimerSeconds(value)
    setActiveRestMenu(false)
  }

  function stopRest() {
    setTimerSeconds(0)
  }

  /* =======================================================
     WORKOUT MODE
  ======================================================= */

  function enterWorkoutMode() {
    if (!sortedExercises.length) return

    const safeIndex = Math.min(
      Math.max(workoutActiveIndex, 0),
      sortedExercises.length - 1
    )

    setWorkoutActiveIndex(safeIndex)
    setSessionActive(true)
    setSessionPaused(false)
    setInWorkoutMode(true)
    setShowFinishedScreen(false)
  }

  function exitWorkoutMode() {
    setSessionActive(false)
    setSessionPaused(false)
    setInWorkoutMode(false)
  }

  function togglePauseSession() {
    setSessionPaused(prev => !prev)
  }

  /* =======================================================
     NAVIGATION
  ======================================================= */

  function goToPreviousExercise() {
    setWorkoutActiveIndex(prev =>
      Math.max(0, prev - 1)
    )
  }

  function goToNextExercise() {
    setWorkoutActiveIndex(prev =>
      Math.min(
        Math.max(sortedExercises.length - 1, 0),
        prev + 1
      )
    )
  }

  function selectExercise(index) {
    if (
      index < 0 ||
      index >= sortedExercises.length
    ) {
      return
    }

    setWorkoutActiveIndex(index)
  }

  /* =======================================================
     FINISH VALIDATION
  ======================================================= */

  function canFinishWorkout() {
    if (!totalExercises) return false

    return completedCount === totalExercises
  }

  /* =======================================================
     HISTORY
  ======================================================= */

  const history = useMemo(() => {
    if (!studentStorageId) return []

    return safeStorageGet(
      historyStorageKey,
      []
    )
  }, [
    studentStorageId,
    historyStorageKey,
    showHistory,
    showFinishedScreen
  ])

  function saveSessionToHistory() {
    if (!currentSession) return

    const entry = {
      id: `history-${Date.now()}`,
      sessionId: currentSession.id,
      day: selectedWorkoutDay,
      workoutTitle:
        workout?.title ||
        workout?.name ||
        `Treino ${selectedWorkoutDay}`,
      date: new Date().toISOString(),
      startedAt: currentSession.startedAt,
      duration:
        Number(currentSession.elapsedSeconds) || 0,
      completedCount: totalExercises,
      totalExercises,
      loads: currentSession.loads || {},
      rpe: currentSession.rpe || {}
    }

    const previousHistory = safeStorageGet(
      historyStorageKey,
      []
    )

    const nextHistory = [
      entry,
      ...(Array.isArray(previousHistory)
        ? previousHistory
        : [])
    ].slice(0, 50)

    safeStorageSet(
      historyStorageKey,
      nextHistory
    )

    return entry
  }

  /* =======================================================
     FINISH WORKOUT
  ======================================================= */

  function finishWorkout() {
    if (!canFinishWorkout()) return
    if (!currentSession) return

    saveSessionToHistory()

    const finishedSession = {
      ...currentSession,
      status: 'completed'
    }

    setCurrentSession(finishedSession)

    /*
     * A sessão ativa é removida.
     *
     * Isso é o que faz o próximo treino A, por exemplo,
     * começar novamente em 0/N.
     */
    safeStorageRemove(sessionStorageKey)

    setSessionActive(false)
    setSessionPaused(false)
    setInWorkoutMode(false)
    setShowFinishedScreen(true)
  }

  /* =======================================================
     NEW SESSION
  ======================================================= */

  function startNewSession() {
    const hasProgress =
      currentSession &&
      (
        (currentSession.completed?.length || 0) > 0 ||
        (Number(currentSession.elapsedSeconds) || 0) > 0
      )

    if (
      hasProgress &&
      !window.confirm(
        'Deseja realmente iniciar uma nova sessão? O progresso atual deste treino será perdido.'
      )
    ) {
      return
    }

    safeStorageRemove(sessionStorageKey)

    createSession()

    setWorkoutActiveIndex(0)
    setInWorkoutMode(false)
    setShowFinishedScreen(false)
    setSessionActive(false)
    setSessionPaused(false)
  }

  /* =======================================================
     BACK TO WORKOUTS
  ======================================================= */

  function backToWorkouts() {
    setSessionActive(false)
    setSessionPaused(false)
    setInWorkoutMode(false)
    setShowFinishedScreen(false)

    setSelectedWorkoutDay(null)
  }

  /* =======================================================
     SELECT WORKOUT DAY
  ======================================================= */

  function selectWorkoutDay(day) {
    if (!DAYS.includes(day)) return

    setShowFinishedScreen(false)
    setInWorkoutMode(false)
    setSessionActive(false)
    setSessionPaused(false)
    setSelectedWorkoutDay(day)
  }

  /* =======================================================
     WHATSAPP FEEDBACK
  ======================================================= */

  function sendWhatsAppFeedback() {
    if (!currentSession) return

    const exerciseLines = sortedExercises
      .map((exercise, index) => {
        const key = getExerciseKey(exercise, index)

        const name =
          exercise?.name ||
          exercise?.nome ||
          exercise?.exercise ||
          exercise?.exercicio ||
          `Exercício ${index + 1}`

        const load =
          currentSession.loads?.[key] || 'Não informado'

        const rpe =
          currentSession.rpe?.[key] || 'Não informado'

        const completed =
          currentSession.completed?.includes(key)

        return [
          `${index + 1}. ${name}`,
          `Carga: ${load}`,
          `RPE: ${rpe}`,
          `Status: ${
            completed ? 'Concluído' : 'Não concluído'
          }`
        ].join('\n')
      })
      .join('\n\n')

    const message = [
      `Olá, Danilo! 👋`,
      ``,
      `Envio meu feedback do Treino ${selectedWorkoutDay}.`,
      ``,
      `Tempo de treino: ${formatSessionTime(
        sessionSeconds
      )}`,
      `Progresso: ${completedCount}/${totalExercises}`,
      ``,
      exerciseLines
    ].join('\n')

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`

    window.open(url, '_blank', 'noopener,noreferrer')
  }

  /* =======================================================
     DAILY TIP
  ======================================================= */

  const dailyTip = useMemo(() => {
    const tips = [
      'Controle o movimento e priorize a execução antes de aumentar a carga.',
      'A última repetição deve ser difícil, mas sem comprometer a técnica.',
      'Mantenha constância: bons resultados vêm da soma dos treinos.',
      'Respeite o intervalo de descanso para conseguir entregar qualidade nas séries.',
      'Registre suas cargas. Acompanhar a evolução ajuda a orientar a progressão.',
      'Respire de forma controlada durante todo o movimento.',
      'Não tenha pressa para aumentar a carga. Primeiro domine a execução.'
    ]

    const date = getDateKey()
    let hash = 0

    for (let i = 0; i < date.length; i++) {
      hash =
        (hash << 5) - hash + date.charCodeAt(i)
      hash |= 0
    }

    return tips[Math.abs(hash) % tips.length]
  }, [])

  /* =======================================================
     LATEST EVALUATION
  ======================================================= */

  const latestEvaluation = useMemo(() => {
    if (!current) return null

    const studentId = current.id || current.user_id

    const evaluations = (data.evaluations || [])
      .filter(item => {
        const itemStudentId =
          item.student_id ||
          item.studentId ||
          item.user_id

        return (
          String(itemStudentId) ===
          String(studentId)
        )
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.date ||
            a.evaluation_date ||
            a.created_at ||
            0
        )

        const dateB = new Date(
          b.date ||
            b.evaluation_date ||
            b.created_at ||
            0
        )

        return dateB - dateA
      })

    return evaluations[0] || null
  }, [current, data.evaluations])

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao sair:', error)
    }

    navigate('/login')
  }

  /* =======================================================
     CURRENT LOAD / RPE
  ======================================================= */

  const activeExerciseKey = activeExercise
    ? getExerciseKey(
        activeExercise,
        workoutActiveIndex
      )
    : null

  const activeLoad =
    activeExerciseKey &&
    currentSession?.loads?.[activeExerciseKey]

  const activeRpe =
    activeExerciseKey &&
    currentSession?.rpe?.[activeExerciseKey]

  const activeIsDone =
    activeExercise
      ? isExerciseCompleted(
          activeExercise,
          workoutActiveIndex
        )
      : false

  /* =======================================================
     SAFETY
  ======================================================= */

  if (!user) {
    return (
      <div className="min-h-screen bg-ink-950 text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-3 animate-spin" />
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  const studentName =
    current?.name ||
    current?.nome ||
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    'Aluno'

  const firstName = studentName
    .split(' ')[0]
    .trim()

  const workoutTitle =
    workout?.title ||
    workout?.name ||
    `Treino ${selectedWorkoutDay}`

  /*
   * A Parte 2 começa aqui:
   *
   * - JSX principal
   * - cabeçalho
   * - avaliação
   * - cards A/B/C/D/E
   * - progresso
   * - exercícios
   * - CARGA / RPE
   * - OBS
   * - CONCLUIR
   * - navegação
   * - modo imersivo
   * - cronômetro
   * - histórico
   * - modal CARGA/RPE
   * - modal avaliação
   * - modal vídeo
   * - modal observação
   */return (
    <div className="min-h-screen bg-ink-950 text-white">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-950/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-400/30 bg-black">
              {current?.logo ? (
                <img
                  src={current.logo}
                  alt="Logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <FlameKindling className="h-6 w-6 text-amber-400" />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs text-white/50">
                Danilo Lopes
              </p>

              <h1 className="truncate font-display text-base font-semibold sm:text-lg">
                Consultoria de Treino
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {syncedAt && (
              <div className="hidden text-right sm:block">
                <p className="text-[10px] uppercase tracking-wider text-white/40">
                  Sincronizado
                </p>
                <p className="text-xs text-white/60">
                  {syncedAt.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-300"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:pb-10">
        {/* ===================================================
            GREETING
        ==================================================== */}
        <section className="mb-6">
          <div className="relative overflow-hidden rounded-3xl border border-amber-400/15 bg-gradient-to-br from-amber-400/10 via-white/[0.03] to-transparent p-5 sm:p-7">
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />

            <div className="relative">
              <div className="mb-2 flex items-center gap-2 text-amber-400">
                <Flame className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                  Seu treino
                </span>
              </div>

              <h2 className="font-display text-2xl font-bold sm:text-3xl">
                Olá, {firstName}! 👋
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
                Bora manter a consistência e evoluir um pouco mais hoje.
                Execute com qualidade, registre suas cargas e acompanhe
                sua evolução.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                  <span className="block text-[10px] uppercase tracking-wider text-white/40">
                    Treino atual
                  </span>
                  <span className="text-sm font-semibold">
                    {workoutTitle}
                  </span>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                  <span className="block text-[10px] uppercase tracking-wider text-white/40">
                    Progresso
                  </span>
                  <span className="text-sm font-semibold text-amber-400">
                    {completedCount}/{totalExercises}
                  </span>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                  <span className="block text-[10px] uppercase tracking-wider text-white/40">
                    Tempo
                  </span>
                  <span className="text-sm font-semibold">
                    {formatSessionTime(sessionSeconds)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            DAILY TIP
        ==================================================== */}
        <section className="mb-6">
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400/10">
              <Lightbulb className="h-4 w-4 text-amber-400" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Dica do dia
              </p>

              <p className="mt-1 text-sm leading-relaxed text-white/65">
                {dailyTip}
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================
            PHYSICAL EVALUATION
        ==================================================== */}
        <section className="mb-6">
          <button
            type="button"
            onClick={() => setIsEvaluationOpen(true)}
            className="group w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-amber-400/20 hover:bg-white/[0.05]"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10">
                  <Activity className="h-5 w-5 text-amber-400" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-white/40">
                    Acompanhamento
                  </p>

                  <h3 className="font-semibold">
                    Avaliação física
                  </h3>

                  <p className="mt-0.5 text-xs text-white/45">
                    {latestEvaluation
                      ? `Última avaliação: ${formatDate(
                          latestEvaluation.date ||
                            latestEvaluation.evaluation_date ||
                            latestEvaluation.created_at
                        )}`
                      : 'Confira seus dados de avaliação'}
                  </p>
                </div>
              </div>

              <ChevronRight className="h-5 w-5 text-white/30 transition group-hover:translate-x-1 group-hover:text-amber-400" />
            </div>
          </button>
        </section>

        {/* ===================================================
            WORKOUT DAY SELECTOR
        ==================================================== */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/40">
                Programação
              </p>

              <h2 className="font-display text-xl font-bold">
                Escolha seu treino
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/65 transition hover:border-amber-400/20 hover:text-amber-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Histórico
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {DAYS.map(day => {
              const active = selectedWorkoutDay === day

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectWorkoutDay(day)}
                  className={`relative overflow-hidden rounded-2xl border px-2 py-4 transition ${
                    active
                      ? 'border-amber-400/40 bg-amber-400/10 text-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.08)]'
                      : 'border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <span className="block text-[10px] uppercase tracking-widest opacity-60">
                    Treino
                  </span>

                  <span className="mt-1 block text-2xl font-bold">
                    {day}
                  </span>

                  {active && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-400" />
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* ===================================================
            WORKOUT SUMMARY
        ==================================================== */}
        <section className="mb-6">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-amber-400/10 px-2 py-1 text-xs font-bold text-amber-400">
                      TREINO {selectedWorkoutDay}
                    </span>

                    {currentSession?.completed?.length > 0 && (
                      <span className="rounded-lg bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-300">
                        Em andamento
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 font-display text-2xl font-bold">
                    {workoutTitle}
                  </h2>

                  <p className="mt-1 text-sm text-white/45">
                    {totalExercises}{' '}
                    {totalExercises === 1
                      ? 'exercício'
                      : 'exercícios'}{' '}
                    programados
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={enterWorkoutMode}
                    disabled={!totalExercises}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                  >
                    <PlayCircle className="h-4 w-4" />
                    {completedCount > 0
                      ? 'Continuar treino'
                      : 'Iniciar treino'}
                  </button>

                  <button
                    type="button"
                    onClick={startNewSession}
                    className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white/65 transition hover:border-white/20 hover:text-white"
                    title="Nova sessão"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-white/40">
                    Progresso do treino
                  </span>

                  <span className="font-semibold text-amber-400">
                    {progressPercentage}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{
                      width: `${progressPercentage}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            EXERCISE LIST
        ==================================================== */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/40">
                Exercícios
              </p>

              <h2 className="font-display text-xl font-bold">
                Seu treino de hoje
              </h2>
            </div>

            <span className="text-xs text-white/35">
              {completedCount}/{totalExercises}
            </span>
          </div>

          {!totalExercises ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <Activity className="mx-auto mb-3 h-8 w-8 text-white/20" />

              <p className="font-medium text-white/60">
                Nenhum exercício encontrado.
              </p>

              <p className="mt-1 text-xs text-white/35">
                Seu treino ainda não foi configurado.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedExercises.map((exercise, index) => {
                const key = getExerciseKey(
                  exercise,
                  index
                )

                const done =
                  currentSession?.completed?.includes(
                    key
                  )

                const load =
                  currentSession?.loads?.[key]

                const rpe =
                  currentSession?.rpe?.[key]

                const videoUrl =
                  exercise.video_url ||
                  exercise.videoUrl ||
                  exercise.youtube ||
                  exercise.youtube_url ||
                  exercise.video

                const videoId = youtubeId(videoUrl)

                const name =
                  exercise.name ||
                  exercise.nome ||
                  exercise.exercise ||
                  exercise.exercicio ||
                  `Exercício ${index + 1}`

                const sets =
                  exercise.sets ||
                  exercise.series ||
                  exercise.serie ||
                  '-'

                const reps =
                  exercise.reps ||
                  exercise.repetitions ||
                  exercise.repeticoes ||
                  '-'

                const obs =
                  exercise.obs ||
                  exercise.observation ||
                  exercise.observacao ||
                  exercise.notes ||
                  exercise.notas ||
                  ''

                return (
                  <article
                    key={key}
                    className={`overflow-hidden rounded-2xl border transition ${
                      done
                        ? 'border-emerald-400/20 bg-emerald-400/[0.04]'
                        : 'border-white/10 bg-white/[0.03] hover:border-white/15'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex gap-4">
                        {/* Number */}
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                            done
                              ? 'bg-emerald-400/10 text-emerald-300'
                              : 'bg-white/5 text-white/45'
                          }`}
                        >
                          {done ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            index + 1
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="font-semibold leading-tight">
                                {name}
                              </h3>

                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="rounded-lg bg-white/5 px-2 py-1 text-[11px] text-white/55">
                                  {sets} séries
                                </span>

                                <span className="rounded-lg bg-white/5 px-2 py-1 text-[11px] text-white/55">
                                  {reps} repetições
                                </span>

                                {load && (
                                  <span className="rounded-lg bg-amber-400/10 px-2 py-1 text-[11px] text-amber-300">
                                    {load}
                                  </span>
                                )}

                                {rpe && (
                                  <span className="rounded-lg bg-purple-400/10 px-2 py-1 text-[11px] text-purple-300">
                                    RPE {rpe}
                                  </span>
                                )}
                              </div>
                            </div>

                            {videoId && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedVideo({
                                    id: videoId,
                                    name
                                  })
                                }
                                className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/65 transition hover:border-amber-400/20 hover:text-amber-400"
                              >
                                <Play className="h-3.5 w-3.5" />
                                Vídeo
                              </button>
                            )}
                          </div>

                          {/* Exercise details */}
                          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <button
                              type="button"
                              onClick={() =>
                                openFeedbackEditor(
                                  exercise,
                                  index
                                )
                              }
                              className="rounded-xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-amber-400/20"
                            >
                              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/35">
                                <Gauge className="h-3 w-3" />
                                Carga
                              </span>

                              <span className="mt-1 block truncate text-xs font-semibold text-white/70">
                                {load ||
                                  'Adicionar carga'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openFeedbackEditor(
                                  exercise,
                                  index
                                )
                              }
                              className="rounded-xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-purple-400/20"
                            >
                              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/35">
                                <Activity className="h-3 w-3" />
                                RPE
                              </span>

                              <span className="mt-1 block text-xs font-semibold text-white/70">
                                {rpe ||
                                  'Adicionar RPE'}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedObs({
                                  title: name,
                                  text:
                                    obs ||
                                    'Nenhuma observação cadastrada para este exercício.'
                                })
                              }
                              className="rounded-xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-white/20"
                            >
                              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/35">
                                <Lightbulb className="h-3 w-3" />
                                Obs
                              </span>

                              <span className="mt-1 block text-xs font-semibold text-white/70">
                                Ver orientação
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                toggleCompleteExercise(
                                  exercise,
                                  index
                                )
                              }
                              className={`rounded-xl border p-3 text-left transition ${
                                done
                                  ? 'border-emerald-400/20 bg-emerald-400/10'
                                  : 'border-white/10 bg-black/20 hover:border-emerald-400/20'
                              }`}
                            >
                              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/35">
                                <CheckCircle2 className="h-3 w-3" />
                                Status
                              </span>

                              <span
                                className={`mt-1 block text-xs font-semibold ${
                                  done
                                    ? 'text-emerald-300'
                                    : 'text-white/70'
                                }`}
                              >
                                {done
                                  ? 'Concluído'
                                  : 'Concluir'}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* ===================================================
            HISTORY BUTTON / WHATSAPP
        ==================================================== */}
        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-semibold text-white/70 transition hover:border-amber-400/20 hover:text-amber-400"
          >
            <Trophy className="h-4 w-4" />
            Ver histórico do Treino {selectedWorkoutDay}
          </button>

          <button
            type="button"
            onClick={sendWhatsAppFeedback}
            className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-4 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/15"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar feedback ao professor
          </button>
        </section>
      </main>

      {/* =====================================================
          FLOATING WHATSAPP
      ====================================================== */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-950/40 transition hover:scale-105 sm:bottom-6 sm:right-6"
        title="Falar com Danilo"
      >
        <MessageCircle className="h-6 w-6" />
      </a>

      {/* =====================================================
          REST TIMER
      ====================================================== */}
      {timerSeconds > 0 && (
        <div className="fixed bottom-5 left-5 z-40 w-64 overflow-hidden rounded-2xl border border-white/10 bg-ink-900/95 p-4 shadow-2xl backdrop-blur-xl sm:bottom-6 sm:left-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Descanso
              </span>
            </div>

            <button
              type="button"
              onClick={stopRest}
              className="text-white/35 transition hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 text-center font-display text-3xl font-bold text-amber-400">
            {formatSessionTime(timerSeconds)}
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-1000"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    (timerSeconds / initialTime) * 100
                  )
                )}%`
              }}
            />
          </div>
        </div>
      )}

      {/* =====================================================
          REST MENU
      ====================================================== */}
      {inWorkoutMode && (
        <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2">
          <div className="relative">
            {activeRestMenu && (
              <div className="absolute bottom-14 left-1/2 w-44 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-ink-900 p-2 shadow-2xl">
                {[30, 45, 60, 90].map(seconds => (
                  <button
                    key={seconds}
                    type="button"
                    onClick={() => startRest(seconds)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/5 hover:text-white"
                  >
                    <span>{seconds}s</span>
                    <Timer className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                setActiveRestMenu(prev => !prev)
              }
              className="flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-ink-900 px-4 text-sm font-semibold shadow-2xl"
            >
              <Timer className="h-4 w-4 text-amber-400" />
              Descanso
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          IMMERSIVE WORKOUT MODE
      ====================================================== */}
      {inWorkoutMode && activeExercise && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink-950">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
            <button
              type="button"
              onClick={exitWorkoutMode}
              className="flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Sair
            </button>

            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                Treino {selectedWorkoutDay}
              </p>

              <p className="font-display text-sm font-bold">
                {workoutActiveIndex + 1}/{totalExercises}
              </p>
            </div>

            <button
              type="button"
              onClick={togglePauseSession}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5"
              title={
                sessionPaused
                  ? 'Continuar'
                  : 'Pausar'
              }
            >
              {sessionPaused ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Progress */}
          <div className="h-1 bg-white/5">
            <div
              className="h-full bg-amber-400 transition-all"
              style={{
                width: `${
                  ((workoutActiveIndex + 1) /
                    totalExercises) *
                  100
                }%`
              }}
            />
          </div>

          {/* Main */}
          <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-8">
            <div className="mx-auto w-full max-w-3xl">
              <div className="mb-6 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-400">
                  Exercício {workoutActiveIndex + 1}
                </p>

                <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
                  {activeExercise.name ||
                    activeExercise.nome ||
                    activeExercise.exercise ||
                    activeExercise.exercicio ||
                    `Exercício ${
                      workoutActiveIndex + 1
                    }`}
                </h2>

                <div className="mt-4 flex justify-center gap-2">
                  <span className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/60">
                    {activeExercise.sets ||
                      activeExercise.series ||
                      '-'}{' '}
                    séries
                  </span>

                  <span className="rounded-xl bg-white/5 px-3 py-2 text-sm text-white/60">
                    {activeExercise.reps ||
                      activeExercise.repetitions ||
                      activeExercise.repeticoes ||
                      '-'}{' '}
                    repetições
                  </span>
                </div>
              </div>

              {/* Video */}
              {youtubeId(
                activeExercise.video_url ||
                  activeExercise.videoUrl ||
                  activeExercise.youtube ||
                  activeExercise.youtube_url ||
                  activeExercise.video
              ) && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedVideo({
                      id: youtubeId(
                        activeExercise.video_url ||
                          activeExercise.videoUrl ||
                          activeExercise.youtube ||
                          activeExercise.youtube_url ||
                          activeExercise.video
                      ),
                      name:
                        activeExercise.name ||
                        activeExercise.nome ||
                        activeExercise.exercise ||
                        activeExercise.exercicio ||
                        'Exercício'
                    })
                  }
                  className="group relative mb-5 aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-black"
                >
                  <img
                    src={`https://img.youtube.com/vi/${youtubeId(
                      activeExercise.video_url ||
                        activeExercise.videoUrl ||
                        activeExercise.youtube ||
                        activeExercise.youtube_url ||
                        activeExercise.video
                    )}/hqdefault.jpg`}
                    alt=""
                    className="h-full w-full object-cover opacity-60 transition group-hover:opacity-75"
                  />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 text-black shadow-2xl transition group-hover:scale-110">
                      <Play className="ml-1 h-7 w-7 fill-current" />
                    </div>
                  </div>
                </button>
              )}

              {/* Load / RPE */}
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    openFeedbackEditor(
                      activeExercise,
                      workoutActiveIndex
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-amber-400/20"
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40">
                    <Gauge className="h-4 w-4" />
                    Carga
                  </div>

                  <p className="mt-2 text-lg font-bold text-amber-400">
                    {activeLoad ||
                      'Adicionar carga'}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openFeedbackEditor(
                      activeExercise,
                      workoutActiveIndex
                    )
                  }
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-left transition hover:border-purple-400/20"
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40">
                    <Activity className="h-4 w-4" />
                    RPE
                  </div>

                  <p className="mt-2 text-lg font-bold text-purple-300">
                    {activeRpe
                      ? `RPE ${activeRpe}`
                      : 'Adicionar RPE'}
                  </p>
                </button>
              </div>

              {/* Observation */}
              <button
                type="button"
                onClick={() =>
                  setSelectedObs({
                    title:
                      activeExercise.name ||
                      activeExercise.nome ||
                      activeExercise.exercise ||
                      activeExercise.exercicio ||
                      'Orientação',
                    text:
                      activeExercise.obs ||
                      activeExercise.observation ||
                      activeExercise.observacao ||
                      activeExercise.notes ||
                      activeExercise.notas ||
                      'Nenhuma observação cadastrada para este exercício.'
                  })
                }
                className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-left"
              >
                <Lightbulb className="h-5 w-5 shrink-0 text-amber-400" />

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                    Observação
                  </p>

                  <p className="mt-1 truncate text-sm text-white/65">
                    Ver orientação do exercício
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 text-white/25" />
              </button>

              {/* Complete */}
              <button
                type="button"
                onClick={() =>
                  toggleCompleteExercise(
                    activeExercise,
                    workoutActiveIndex
                  )
                }
                className={`mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-bold transition ${
                  activeIsDone
                    ? 'bg-emerald-400 text-black'
                    : 'bg-amber-400 text-black hover:bg-amber-300'
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />

                {activeIsDone
                  ? 'Exercício concluído'
                  : 'Concluir exercício'}
              </button>
            </div>
          </div>

          {/* Mini navigation */}
          <div className="border-t border-white/10 bg-ink-950/95 px-4 py-3">
            <div className="mx-auto flex max-w-3xl items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousExercise}
                disabled={workoutActiveIndex === 0}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 disabled:opacity-20"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex flex-1 gap-1.5 overflow-x-auto">
                {sortedExercises.map(
                  (exercise, index) => {
                    const done =
                      isExerciseCompleted(
                        exercise,
                        index
                      )

                    return (
                      <button
                        key={getExerciseKey(
                          exercise,
                          index
                        )}
                        type="button"
                        onClick={() =>
                          selectExercise(index)
                        }
                        className={`h-2 min-w-8 flex-1 rounded-full transition ${
                          index ===
                          workoutActiveIndex
                            ? 'bg-amber-400'
                            : done
                            ? 'bg-emerald-400/70'
                            : 'bg-white/10'
                        }`}
                        title={`Exercício ${
                          index + 1
                        }`}
                      />
                    )
                  }
                )}
              </div>

              {workoutActiveIndex <
              totalExercises - 1 ? (
                <button
                  type="button"
                  onClick={goToNextExercise}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canFinishWorkout()}
                  onClick={finishWorkout}
                  className={`flex h-11 shrink-0 items-center justify-center rounded-xl px-4 text-xs font-bold transition ${
                    canFinishWorkout()
                      ? 'bg-amber-400 text-black hover:bg-amber-300'
                      : 'border border-white/10 bg-white/5 text-white/25'
                  }`}
                >
                  {canFinishWorkout()
                    ? 'Finalizar'
                    : 'Conclua todos'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FINISHED SCREEN
      ====================================================== */}
      {showFinishedScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950 px-5">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-amber-400/10">
              <Trophy className="h-12 w-12 text-amber-400" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              Treino concluído
            </p>

            <h2 className="mt-2 font-display text-3xl font-bold">
              Mandou bem, {firstName}!
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-white/50">
              Você concluiu todos os exercícios do Treino{' '}
              {selectedWorkoutDay}. Esse treino foi salvo no
              seu histórico.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[10px] uppercase tracking-wider text-white/35">
                  Exercícios
                </p>

                <p className="mt-1 text-2xl font-bold text-amber-400">
                  {totalExercises}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[10px] uppercase tracking-wider text-white/35">
                  Tempo
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {formatSessionTime(
                    sessionSeconds
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowFinishedScreen(false)
                  setShowHistory(true)
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold"
              >
                <Trophy className="h-4 w-4 text-amber-400" />
                Ver histórico
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowFinishedScreen(false)
                  setInWorkoutMode(false)
                  setSelectedWorkoutDay(null)
                }}
                className="w-full rounded-2xl bg-amber-400 px-5 py-4 text-sm font-bold text-black transition hover:bg-amber-300"
              >
                Voltar aos treinos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          HISTORY MODAL
      ====================================================== */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-5">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-ink-950 shadow-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-400">
                  Histórico
                </p>

                <h2 className="font-display text-xl font-bold">
                  Treino {selectedWorkoutDay}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              {!history.length ? (
                <div className="py-12 text-center">
                  <Trophy className="mx-auto h-10 w-10 text-white/15" />

                  <p className="mt-4 font-semibold text-white/60">
                    Nenhum treino finalizado ainda.
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    Quando você concluir o treino, ele
                    aparecerá aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map(entry => (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">
                            {entry.workoutTitle ||
                              `Treino ${entry.day}`}
                          </p>

                          <p className="mt-1 text-xs text-white/40">
                            {formatDate(entry.date)}
                          </p>
                        </div>

                        <span className="rounded-lg bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                          Concluído
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-black/20 p-3">
                          <span className="block text-[10px] uppercase tracking-wider text-white/30">
                            Exercícios
                          </span>

                          <span className="mt-1 block font-bold">
                            {entry.completedCount}/
                            {entry.totalExercises}
                          </span>
                        </div>

                        <div className="rounded-xl bg-black/20 p-3">
                          <span className="block text-[10px] uppercase tracking-wider text-white/30">
                            Tempo
                          </span>

                          <span className="mt-1 block font-bold">
                            {formatSessionTime(
                              entry.duration
                            )}
                          </span>
                        </div>

                        <div className="rounded-xl bg-black/20 p-3">
                          <span className="block text-[10px] uppercase tracking-wider text-white/30">
                            Cargas
                          </span>

                          <span className="mt-1 block font-bold">
                            {
                              Object.keys(
                                entry.loads || {}
                              ).filter(
                                key =>
                                  entry.loads[key]
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CARGA / RPE MODAL
      ====================================================== */}
      {editingFeedback && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-5">
          <div className="w-full max-w-md rounded-t-3xl border border-white/10 bg-ink-950 p-5 shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-400">
                  Registro do exercício
                </p>

                <h2 className="mt-1 font-display text-xl font-bold">
                  {editingFeedback.exercise?.name ||
                    editingFeedback.exercise?.nome ||
                    editingFeedback.exercise?.exercise ||
                    editingFeedback.exercise?.exercicio ||
                    'Exercício'}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setEditingFeedback(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/40">
                Carga utilizada
              </label>

              <input
                type="text"
                value={tempLoad}
                onChange={event =>
                  setTempLoad(event.target.value)
                }
                placeholder="Ex.: 60 kg"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-amber-400/40"
              />
            </div>

            <div className="mt-5">
              <label className="mb-3 block text-xs font-semibold uppercase tracking-wider text-white/40">
                RPE
              </label>

              <div className="grid grid-cols-5 gap-2">
                {[6, 7, 8, 9, 10].map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setTempRpe(String(value))
                    }
                    className={`rounded-xl py-3 text-sm font-bold transition ${
                      String(tempRpe) ===
                      String(value)
                        ? 'bg-amber-400 text-black'
                        : 'border border-white/10 bg-white/5 text-white/55 hover:border-white/20'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>

              <p className="mt-2 text-xs text-white/30">
                6 = relativamente confortável • 10 =
                esforço máximo
              </p>
            </div>

            <button
              type="button"
              onClick={saveFeedbackEditor}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 px-5 py-4 text-sm font-bold text-black transition hover:bg-amber-300"
            >
              <Save className="h-4 w-4" />
              Salvar registro
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          EVALUATION MODAL
      ====================================================== */}
      {isEvaluationOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-5">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-ink-950 shadow-2xl sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-400">
                  Acompanhamento
                </p>

                <h2 className="font-display text-xl font-bold">
                  Avaliação física
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsEvaluationOpen(false)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              {!latestEvaluation ? (
                <div className="py-12 text-center">
                  <Activity className="mx-auto h-10 w-10 text-white/15" />

                  <p className="mt-4 font-semibold text-white/60">
                    Nenhuma avaliação encontrada.
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.05] p-4">
                    <div className="flex items-center gap-3">
                      <Scale className="h-5 w-5 text-amber-400" />

                      <div>
                        <p className="text-xs text-white/40">
                          Avaliação realizada em
                        </p>

                        <p className="font-semibold">
                          {formatDate(
                            latestEvaluation.date ||
                              latestEvaluation.evaluation_date ||
                              latestEvaluation.created_at
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      [
                        'Peso',
                        latestEvaluation.weight,
                        'kg'
                      ],
                      [
                        'Altura',
                        latestEvaluation.height,
                        'cm'
                      ],
                      [
                        '% Gordura',
                        latestEvaluation.fatPercentage ??
                          latestEvaluation.fat_percentage,
                        '%'
                      ],
                      [
                        'Massa magra',
                        latestEvaluation.leanMass ??
                          latestEvaluation.lean_mass,
                        'kg'
                      ],
                      [
                        'TMB',
                        latestEvaluation.tmb,
                        'kcal'
                      ],
                      [
                        'GET',
                        latestEvaluation.get,
                        'kcal'
                      ]
                    ].map(([label, value, unit]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <p className="text-[10px] uppercase tracking-wider text-white/35">
                          {label}
                        </p>

                        <p className="mt-1 text-lg font-bold">
                          {value ??
                            '--'}{' '}
                          {value !== undefined &&
                          value !== null &&
                          value !== ''
                            ? unit
                            : ''}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                      Circunferências
                    </p>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {[
                        [
                          'Peitoral',
                          latestEvaluation.chest
                        ],
                        [
                          'Braço',
                          latestEvaluation.arm
                        ],
                        [
                          'Cintura',
                          latestEvaluation.waist
                        ],
                        [
                          'Quadril',
                          latestEvaluation.hips ??
                            latestEvaluation.hip
                        ],
                        [
                          'Coxa',
                          latestEvaluation.thigh
                        ],
                        [
                          'Panturrilha',
                          latestEvaluation.calf
                        ]
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-xl bg-white/[0.03] p-3"
                        >
                          <p className="text-[10px] uppercase tracking-wider text-white/30">
                            {label}
                          </p>

                          <p className="mt-1 font-semibold">
                            {value ??
                              '--'}{' '}
                            {value !== undefined &&
                            value !== null &&
                            value !== ''
                              ? 'cm'
                              : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          VIDEO MODAL
      ====================================================== */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-ink-950 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-amber-400">
                  Execução
                </p>

                <h2 className="truncate font-display font-bold">
                  {selectedVideo.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedVideo(null)
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="aspect-video bg-black">
              <iframe
                title={selectedVideo.name}
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
                className="h-full w-full"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          OBSERVATION MODAL
      ====================================================== */}
      {selectedObs && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-5">
          <div className="w-full max-w-md rounded-t-3xl border border-white/10 bg-ink-950 p-5 shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10">
                  <Lightbulb className="h-5 w-5 text-amber-400" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-white/35">
                    Observação
                  </p>

                  <h2 className="mt-1 font-display text-lg font-bold">
                    {selectedObs.title}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedObs(null)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-white/65">
                {selectedObs.text}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedObs(null)}
              className="mt-4 w-full rounded-2xl bg-white/5 px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
