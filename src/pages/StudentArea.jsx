import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, LogOut, RefreshCw, X, Play, Timer, RotateCcw, MessageCircle, Link2, CheckCircle2, Trophy, Lightbulb, ArrowLeft, Activity, Scale, Flame, UserCheck, FlameKindling, ChevronRight, ChevronLeft } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../auth.jsx'
import { loadData, subscribeData } from '../storage'

const DAYS = ['A', 'B', 'C', 'D', 'E']

const COACH_TIPS = [
  "Priorize a execução correta antes de aumentar a carga.",
  "A consistência supera a intensidade ocasional. Faça o seu melhor hoje!",
  "Respire fundo: a fase excêntrica (descida) é onde o músculo mais cresce.",
  "Concentre-se no grupamento muscular que está a trabalhar, evite balançar o corpo.",
  "Hidrate-se bem durante o treino. A performance começa na água!"
]

function youtubeId(url = '') {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  )
  return match ? match[1] : null
}

function playBeep(isFinal = false) {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = isFinal ? 'square' : 'sine'
    osc.frequency.setValueAtTime(isFinal ? 880 : 440, audioCtx.currentTime)
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + (isFinal ? 0.6 : 0.2))
  } catch (e) {}
  if (navigator.vibrate) {
    try {
      navigator.vibrate(isFinal ? [300, 150, 300] : 200)
    } catch (e) {}
  }
}

export default function StudentArea() {
  const { student, logoutStudent } = useAuth()
  const navigate = useNavigate()

  const [data, setData] = useState(() => loadData())
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState(null)
  const [syncedAt, setSyncedAt] = useState('')
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [selectedObs, setSelectedObs] = useState(null)
  const [isEvaluationOpen, setIsEvaluationOpen] = useState(false)

  const [completedExercises, setCompletedExercises] = useState([])

  // Estados dos cronómetros e Modo Treino
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [initialTime, setInitialTime] = useState(60)
  const [activeRestMenu, setActiveRestMenu] = useState(null)

  const [inWorkoutMode, setInWorkoutMode] = useState(false)
  const [workoutActiveIndex, setWorkoutActiveIndex] = useState(0)

  // Cronómetro Geral da Sessão
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionPaused, setSessionPaused] = useState(false)
  const [showFinishedScreen, setShowFinishedScreen] = useState(false)

  const dailyTip = useMemo(() => {
    const index = Math.floor(Math.random() * COACH_TIPS.length)
    return COACH_TIPS[index]
  }, [])

  const current = useMemo(() => {
    return (
      data.students.find(
        (item) => item.id === student?.id || item.code === student?.code
      ) || data.students[0]
    )
  }, [data, student])

  const workouts = current?.workouts || data.workouts
  const evaluations = current?.evaluations || []
  const latestEvaluation = evaluations.length > 0 ? evaluations[evaluations.length - 1] : null

  const currentDay = selectedWorkoutDay || 'A'
  const workout = workouts[currentDay] || {
    title: 'Treino',
    focus: '',
    exercises: [],
  }

  const sortedExercises = useMemo(() => {
    const original = workout.exercises || []
    const groupedMap = new Map()
    const ungrouped = []

    original.forEach((ex) => {
      const groupKey = (ex.group || '').trim()
      if (groupKey) {
        if (!groupedMap.has(groupKey)) {
          groupedMap.set(groupKey, [])
        }
        groupedMap.get(groupKey).push(ex)
      } else {
        ungrouped.push(ex)
      }
    })

    const result = []
    groupedMap.forEach((exercisesInGroup) => {
      result.push(...exercisesInGroup)
    })
    result.push(...ungrouped)

    return result
  }, [workout.exercises])

  const totalExercises = sortedExercises.length
  const completedCount = sortedExercises.filter((ex) => completedExercises.includes(ex.id)).length
  const progressPercent = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0
  const isWorkoutCompleted = totalExercises > 0 && completedCount === totalExercises

  useEffect(() => {
    const stop = subscribeData((next) => {
      setData(next)
      setSyncedAt(
        new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      )
    })
    return stop
  }, [])

  // Temporizador de Descanso com sumiço automático ao zerar
  useEffect(() => {
    let interval = null
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((sec) => {
          if (sec === 10) playBeep(false)
          if (sec <= 1) {
            playBeep(true)
            setTimerActive(false)
            setActiveRestMenu(null)
            return 0
          }
          return sec - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive, timerSeconds])

  // Cronómetro Geral da Sessão
  useEffect(() => {
    let interval = null
    if (sessionActive && !sessionPaused && !showFinishedScreen) {
      interval = setInterval(() => {
        setSessionSeconds((sec) => sec + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [sessionActive, sessionPaused, showFinishedScreen])

  function startTimer(seconds) {
    setInitialTime(seconds)
    setTimerSeconds(seconds)
    setTimerActive(true)
    setActiveRestMenu('running')
  }

  function stopTimer() {
    setTimerActive(false)
    setTimerSeconds(0)
    setActiveRestMenu(null)
  }

  function toggleCompleteExercise(exerciseId) {
    setCompletedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    )
  }

  function startWorkoutSession() {
    setInWorkoutMode(true)
    setWorkoutActiveIndex(0)
    setSessionSeconds(0)
    setSessionActive(true)
    setSessionPaused(false)
    setShowFinishedScreen(false)
    setActiveRestMenu(null)
  }

  function formatSessionTime(totalSecs) {
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  function sendWhatsAppFeedback() {
    const studentName = current?.name || student?.name || 'Aluno'
    const workoutTitle = workout.title || `Treino ${currentDay}`
    const exercisesList = (sortedExercises || [])
      .map((ex, idx) => {
        const groupTag = ex.group ? ` [${ex.group}]` : ''
        return `*${idx + 1}. ${ex.name}*${groupTag} (Séries: ${ex.sets}, Repetições: ${ex.reps})\nCarga: `
      })
      .join('\n\n')

    const message = encodeURIComponent(
      `Olá Danilo! Aqui estão as cargas e o feedback de *${studentName}* referentes ao *${workoutTitle}* (${currentDay}):\n\n${exercisesList}\n\nObservações / Dúvidas:`
    )
    window.open(`https://wa.me/5527996247906?text=${message}`, '_blank', 'noopener,noreferrer')
  }

  function sendRealtimeDoubt() {
    const studentName = current?.name || student?.name || 'Aluno'
    const message = encodeURIComponent(
      `Olá Danilo! Estou treinando aqui e gostaria de tirar uma dúvida. (${studentName})`
    )
    window.open(`https://wa.me/5527996247906?text=${message}`, '_blank', 'noopener,noreferrer')
  }

  function exit() {
    logoutStudent()
    navigate('/')
  }

  function openVideo(exercise) {
    const videoId = youtubeId(exercise.video)
    if (!videoId) {
      window.open(exercise.video, '_blank', 'noopener,noreferrer')
      return
    }
    setSelectedVideo({ id: videoId, name: exercise.name })
  }

  return (
    <div className="min-h-dvh bg-ink-950 pb-48 text-white relative">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Logo className="h-10 w-10" showText />
          <div className="flex items-center gap-2">
            {selectedWorkoutDay && !inWorkoutMode && (
              <button
                onClick={() => {
                  setSelectedWorkoutDay(null)
                  setActiveRestMenu(null)
                }}
                className="flex items-center gap-1.5 rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1.5 text-xs font-bold text-gold-400 transition hover:bg-gold-400/20"
              >
                <ArrowLeft size={14} />
                <span>Treinos</span>
              </button>
            )}
            <button
              onClick={exit}
              className="rounded-full border border-white/10 p-2 text-zinc-300 transition hover:border-gold-400/30 hover:text-gold-400"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-md px-4 pb-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500">
              Olá, {current?.name || student?.name || 'aluno'}
            </p>
            {syncedAt && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-gold-400/80">
                <RefreshCw size={10} />
                Atualizado às {syncedAt}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-5 safe-bottom">
        {!selectedWorkoutDay ? (
          /* SELEÇÃO DOS BLOCOS DE TREINOS (A, B, C, D, E) */
          <div className="space-y-4">
            <div 
              onClick={() => setIsEvaluationOpen(true)}
              className="group relative w-full overflow-hidden rounded-2xl border border-gold-400/40 bg-gradient-to-br from-ink-900 to-ink-800 p-5 text-left transition-all duration-300 hover:border-gold-400 cursor-pointer shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-400/20 text-gold-400 border border-gold-400/30">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gold-400">Avaliação Física</p>
                    <h2 className="font-display text-lg uppercase text-white tracking-wide">Composição Corporal</h2>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-gold-400 bg-gold-400/10 px-2.5 py-1 rounded-full border border-gold-400/30">
                  {latestEvaluation ? 'Ver Detalhes →' : 'Aguardando →'}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[12px] uppercase tracking-[0.2em] text-gold-400 font-bold">Sua Rotina</p>
              <h1 className="mt-1 font-display text-2xl uppercase">Escolha o Treino</h1>
            </div>

            <div className="space-y-3.5 pt-2">
              {DAYS.map((dayKey) => {
                const wData = workouts[dayKey]
                return (
                  <button
                    key={dayKey}
                    onClick={() => {
                      setSelectedWorkoutDay(dayKey)
                      setActiveRestMenu(null)
                    }}
                    className="group relative w-full overflow-hidden rounded-2xl border border-white/10 bg-ink-800 p-4 text-left transition-all duration-300 hover:border-gold-400 hover:bg-ink-700/80 shadow-lg flex items-center gap-4"
                  >
                    <div className="flex shrink-0 flex-col items-center justify-center h-16 w-16 rounded-xl bg-ink-900 border-2 border-gold-400/40 text-gold-400 font-display text-2xl font-extrabold shadow-inner group-hover:bg-gold-400 group-hover:text-ink-950 transition-all duration-300">
                      <span className="text-[9px] uppercase tracking-widest font-bold opacity-80 leading-none mb-0.5">Treino</span>
                      {dayKey}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-xl uppercase text-white tracking-wide group-hover:text-gold-300 transition-colors leading-snug">
                        {wData?.title || `Treino ${dayKey}`}
                      </h2>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {wData?.exercises?.length || 0} exercícios • Foco principal
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : !inWorkoutMode ? (
          <div>
            {/* VISTA DA LISTA DE EXERCÍCIOS DO TREINO ESCOLHIDO */}
            <div className="flex items-center justify-between">
              <p className="text-[12px] uppercase tracking-[0.2em] text-gold-400 font-bold">
                {workout.focus || `Treino ${currentDay}`}
              </p>
              <span className="text-xs font-bold text-zinc-400">
                {completedCount} de {totalExercises} concluídos
              </span>
            </div>
            <h1 className="mt-1 font-display text-2xl uppercase">
              {workout.title} ({currentDay})
            </h1>

            <button
              type="button"
              onClick={startWorkoutSession}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-400 py-4 text-sm font-extrabold uppercase tracking-wider text-ink-950 transition shadow-xl"
            >
              <FlameKindling size={20} />
              🔥 Iniciar Modo Treino Imersivo
            </button>
          </div>
        ) : showFinishedScreen ? (
          <div className="py-8 text-center space-y-6">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-gold-400 to-gold-600 text-ink-950 shadow-2xl">
              <Trophy size={48} />
            </div>
            <h2 className="font-display text-3xl uppercase tracking-wide">Treino Concluído!</h2>
            <button
              type="button"
              onClick={() => {
                setInWorkoutMode(false)
                setShowFinishedScreen(false)
              }}
              className="w-full rounded-2xl border border-white/20 bg-ink-800 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-300"
            >
              Voltar aos Treinos
            </button>
          </div>
        ) : (
          /* MODO TREINO IMERSIVO */
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between rounded-2xl bg-ink-900 border border-gold-400/40 p-3.5">
              <div className="flex items-center gap-2">
                <Timer size={18} className="text-gold-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">TEMPO:</span>
                <span className="font-display text-lg text-gold-400 font-bold">{formatSessionTime(sessionSeconds)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSessionPaused(!sessionPaused)}
                  className="rounded-lg border border-white/10 bg-ink-800 px-2.5 py-1.5 text-[11px] font-bold text-zinc-300"
                >
                  {sessionPaused ? 'Continuar' : 'Pausar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInWorkoutMode(false)
                    stopTimer()
                  }}
                  className="rounded-lg border border-red-500/30 bg-red-500/20 px-2.5 py-1.5 text-[11px] font-bold text-red-300"
                >
                  Sair
                </button>
              </div>
            </div>

            {(() => {
              const exercise = sortedExercises[workoutActiveIndex]
              if (!exercise) return null
              const videoId = youtubeId(exercise.video)
              const isDone = completedExercises.includes(exercise.id)

              return (
                <div className="rounded-2xl border border-gold-400/50 bg-ink-900 p-5 shadow-2xl space-y-4">
                  <h2 className="font-display text-2xl uppercase tracking-wide text-white">
                    {exercise.name}
                  </h2>

                  {exercise.video && videoId && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gold-400/30 bg-black">
                      <button
                        type="button"
                        onClick={() => openVideo(exercise)}
                        className="relative h-full w-full flex items-center justify-center"
                      >
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                          alt={exercise.name}
                          className="absolute inset-0 h-full w-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-gold-400 text-ink-950">
                          <Play size={28} fill="currentColor" className="ml-1" />
                        </div>
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-ink-800 p-3 text-center border border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Séries</p>
                      <p className="font-display text-2xl text-gold-400 font-extrabold mt-0.5">{exercise.sets}</p>
                    </div>
                    <div className="rounded-xl bg-ink-800 p-3 text-center border border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Repetições</p>
                      <p className="font-display text-2xl text-gold-400 font-extrabold mt-0.5">{exercise.reps}</p>
                    </div>
                  </div>

                  {exercise.notes && (
                    <div className="rounded-xl bg-gold-400/10 border border-gold-400/25 p-3 text-xs leading-relaxed text-zinc-200">
                      <div className="flex items-center gap-1.5 text-gold-400 font-bold uppercase text-[10px] tracking-wider mb-1">
                        <Lightbulb size={14} /> Foco / Execução
                      </div>
                      <p>{exercise.notes}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleCompleteExercise(exercise.id)}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-extrabold uppercase tracking-wider transition ${
                      isDone
                        ? 'bg-emerald-500 text-ink-950'
                        : 'border border-gold-400/40 bg-ink-800 text-gold-300'
                    }`}
                  >
                    <CheckCircle2 size={18} />
                    {isDone ? 'Exercício Concluído ✓' : 'Marcar como Concluído'}
                  </button>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <button
                      type="button"
                      disabled={workoutActiveIndex === 0}
                      onClick={() => setWorkoutActiveIndex((prev) => Math.max(0, prev - 1))}
                      className="flex items-center gap-1 rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5 text-xs font-bold text-zinc-300 disabled:opacity-30"
                    >
                      <ChevronLeft size={16} /> Anterior
                    </button>

                    {workoutActiveIndex < totalExercises - 1 ? (
                      <button
                        type="button"
                        onClick={() => setWorkoutActiveIndex((prev) => Math.min(totalExercises - 1, prev + 1))}
                        className="flex items-center gap-1 rounded-xl bg-gold-400 px-5 py-2.5 text-xs font-bold uppercase text-ink-950"
                      >
                        Próximo Exercício <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowFinishedScreen(true)}
                        className="flex items-center gap-1 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-extrabold uppercase text-ink-950"
                      >
                        Finalizar Treino <Trophy size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </main>

      {/* BLOCOS FLUTUANTES EMPILHADOS NO CANTO INFERIOR DIREITO */}
      <div className="fixed bottom-36 right-4 z-45 flex flex-col items-end gap-3">
        {/* 1. Botão Flutuante de Descanso (Dourado) */}
        <div className="group/rest relative flex items-center">
          <button
            onClick={() => startTimer(initialTime)}
            className="group flex items-center gap-2.5 rounded-full bg-gold-400 text-ink-950 p-3.5 shadow-xl shadow-gold-400/20 border border-gold-300 transition-all duration-300 hover:scale-105 hover:bg-gold-300"
            aria-label="Iniciar descanso entre séries"
            title="Iniciar descanso"
          >
            <Timer size={22} className="text-ink-950 animate-pulse shrink-0" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap font-display text-xs font-bold uppercase tracking-wider transition-all duration-300 group-hover/rest:max-w-xs group-hover/rest:pr-1">
              Descanso ({timerActive ? `${timerSeconds}s` : `${initialTime}s`})
            </span>
          </button>
        </div>

        {/* 2. Botão Flutuante de Mensagem / Dúvida (Verde) */}
        <div className="group/chat relative flex items-center">
          <button
            onClick={sendRealtimeDoubt}
            className="group flex items-center gap-2.5 rounded-full bg-emerald-500 text-ink-950 p-3.5 shadow-xl shadow-emerald-500/30 border border-emerald-400 transition-all duration-300 hover:scale-105 hover:bg-emerald-400"
            aria-label="Deixe sua dúvida ou mudanças no WhatsApp"
            title="Deixe sua dúvida ou mudanças"
          >
            <MessageCircle size={22} fill="currentColor" className="text-ink-950 animate-pulse shrink-0" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap font-display text-xs font-bold uppercase tracking-wider transition-all duration-300 group-hover/chat:max-w-xs group-hover/chat:pr-1">
              Deixe sua dúvida
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
