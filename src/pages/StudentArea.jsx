import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, LogOut, RefreshCw, X, Play, Timer, RotateCcw, MessageCircle, Link2, CheckCircle2, Trophy, Lightbulb, ArrowLeft, Activity, Scale, Flame, UserCheck, FlameKindling, ChevronRight, ChevronLeft, Pause, PlayCircle } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../auth.jsx'
import { loadData, subscribeData } from '../storage'

const DAYS = ['A', 'B', 'C', 'D', 'E']

const COACH_TIPS = [
  "Priorize a execução correta antes de aumentar a carga.",
  "A consistência supera a intensidade ocasional. Faça o seu melhor hoje!",
  "Respire fundo: a fase excêntrica (descida) é onde o músculo mais cresce.",
  "Concentre-se no grupamento muscular que está a trabalhar, evite balançar o corpo.",
  "Hidrate-se bem durante o treino. A performance começa na água!",
  "Mantenha a postura firme e o abdómen contraído em todos os movimentos.",
  "A amplitude de movimento é mais importante do que excesso de peso sem controle.",
  "Respeite o seu tempo de descanso entre as séries para manter a intensidade alta.",
  "Foque na contração máxima no topo de cada repetição.",
  "O descanso faz parte do treino. Recupere-se bem para a próxima série.",
  "Mantenha o foco e elimine as distrações enquanto estiver a treinar.",
  "Lembre-se: cada treino é um passo a mais em direção à sua melhor versão.",
  "Se sentir dor articular aguda, pare e ajuste a postura imediatamente.",
  "Conecte a sua mente ao músculo que está a ser exercitado.",
  "A persistência de hoje é a força de amanhã. Vamos com tudo!",
  "Controle a respiração: expire no esforço e inspire na volta.",
  "Não tenha pressa para terminar; execute cada repetição com intenção.",
  "A disciplina é a ponte entre as suas metas e as suas conquistas.",
  "Beba água regularmente, mesmo que não sinta tanta sede.",
  "Aproveite o processo. Evoluir exige paciência e dedicação diária."
]

function youtubeId(url = '') {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  )
  return match ? match[1] : null
}

// Utilitário para gerar bips sonoros e vibração no navegador (sem dependências externas)
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
  } catch (e) {
    // Ignora se o browser bloquear áudio sem interação prévia
  }
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

  // Cronômetro Geral da Sessão
  const [sessionSeconds, setSessionSeconds] = useState(0)
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionPaused, setSessionPaused] = useState(false)
  const [showFinishedScreen, setShowFinishedScreen] = useState(false)

  // Dica do professor do dia (fixa por sessão/carregamento)
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

  // Temporizador de Descanso com avisos sonoros
  useEffect(() => {
    let interval = null
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((sec) => {
          if (sec === 10) {
            playBeep(false)
          }
          if (sec <= 1) {
            playBeep(true)
            setTimerActive(false)
            return 0
          }
          return sec - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive, timerSeconds])

  // Cronômetro Geral da Sessão
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
    setActiveRestMenu(null)
  }

  function stopTimer() {
    setTimerActive(false)
    setTimerSeconds(0)
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

    const phone = '5527996247906'
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer')
  }

  function sendRealtimeDoubt() {
    const studentName = current?.name || student?.name || 'Aluno'
    const message = encodeURIComponent(
      `Olá Danilo! Estou treinando aqui e gostaria de tirar uma dúvida ou sugerir alguma mudança. Está disponível? (${studentName})`
    )
    const phone = '5527996247906'
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setSelectedVideo(null)
        setSelectedObs(null)
        setActiveRestMenu(null)
        setIsEvaluationOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

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
    setSelectedVideo({
      id: videoId,
      name: exercise.name,
    })
  }

  function closeVideo() {
    setSelectedVideo(null)
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
              aria-label="Sair"
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
          /* TELA 1: HOME COM AVALIAÇÃO + DICA DO PROFESSOR + LISTA DE TREINOS */
          <div className="space-y-4">
            
            {/* CARD DE AVALIAÇÃO FÍSICA & COMPOSIÇÃO CORPORAL */}
            <div 
              onClick={() => setIsEvaluationOpen(true)}
              className="group relative w-full overflow-hidden rounded-2xl border border-gold-400/40 bg-gradient-to-br from-ink-900 to-ink-800 p-5 text-left transition-all duration-300 hover:border-gold-400 hover:shadow-xl hover:shadow-gold-400/10 cursor-pointer shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-400/20 text-gold-400 border border-gold-400/30">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gold-400">
                      Avaliação Física
                    </p>
                    <h2 className="font-display text-lg uppercase text-white tracking-wide">
                      Composição Corporal
                    </h2>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-gold-400 bg-gold-400/10 px-2.5 py-1 rounded-full border border-gold-400/30 group-hover:bg-gold-400 group-hover:text-ink-950 transition">
                  {latestEvaluation ? 'Ver Detalhes →' : 'Aguardando →'}
                </span>
              </div>

              {latestEvaluation ? (
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-white/10">
                  <div className="rounded-xl bg-ink-950/60 p-2 text-center border border-white/5">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-400">Peso</p>
                    <p className="font-display text-base text-gold-400 font-bold">{latestEvaluation.weight} kg</p>
                  </div>
                  <div className="rounded-xl bg-ink-950/60 p-2 text-center border border-white/5">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-400">% Gordura</p>
                    <p className="font-display text-base text-gold-400 font-bold">{latestEvaluation.fatPercentage}%</p>
                  </div>
                  <div className="rounded-xl bg-ink-950/60 p-2 text-center border border-white/5">
                    <p className="text-[9px] uppercase tracking-wider text-zinc-400">Gasto Diário</p>
                    <p className="font-display text-base text-gold-400 font-bold">{latestEvaluation.get} kcal</p>
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-white/10 text-center py-2">
                  <p className="text-xs text-zinc-400">Nenhuma avaliação cadastrada pelo professor ainda.</p>
                </div>
              )}
            </div>

            {/* CARD DE DICA DO PROFESSOR (DINÂMICO) */}
            <div className="rounded-2xl border border-gold-400/30 bg-ink-900/80 p-4 shadow-md flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-400/20 text-gold-400 border border-gold-400/30 mt-0.5">
                <Lightbulb size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-gold-400">Dica do Professor</p>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed italic">"{dailyTip}"</p>
              </div>
            </div>

            {/* TÍTULO DA ROTINA DE TREINOS */}
            <div className="pt-2">
              <p className="text-[12px] uppercase tracking-[0.2em] text-gold-400 font-bold">
                Sua Rotina
              </p>
              <h1 className="mt-1 font-display text-2xl uppercase">
                Escolha o Treino
              </h1>
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
          /* TELA 2: LISTA DE EXERCÍCIOS DO TREINO ESCOLHIDO + BOTÃO INICIAR MODO TREINO */
          <div>
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

            <div className="mt-3.5 h-2.5 w-full overflow-hidden rounded-full bg-ink-800 border border-white/5">
              <div
                className="h-full bg-gold-400 transition-all duration-300 shadow-sm shadow-gold-400/50"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* BOTÃO PARA INICIAR O MODO TREINO IMERSIVO */}
            <button
              type="button"
              onClick={startWorkoutSession}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-400 py-4 text-sm font-extrabold uppercase tracking-wider text-ink-950 transition hover:from-gold-400 hover:to-gold-300 shadow-xl shadow-gold-400/20 active:scale-[0.99]"
            >
              <FlameKindling size={20} />
              🔥 Iniciar Modo Treino Imersivo
            </button>

            <button
              type="button"
              onClick={sendWhatsAppFeedback}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 py-3.5 text-xs font-bold uppercase tracking-wider text-emerald-400 transition hover:bg-emerald-600/30 shadow-lg"
            >
              <MessageCircle size={18} />
              Enviar cargas e feedback no WhatsApp
            </button>

            <div className="mt-5 space-y-4">
              {(sortedExercises || []).map((exercise, index) => {
                const videoId = youtubeId(exercise.video)
                const isMenuOpen = activeRestMenu === exercise.id
                const isDone = completedExercises.includes(exercise.id)

                return (
                  <article
                    key={exercise.id || `${currentDay}-${index}`}
                    className={`rounded-2xl border p-4 relative transition-all duration-200 ${
                      isDone
                        ? 'bg-ink-900/40 border-emerald-500/30 opacity-60'
                        : exercise.group
                        ? 'bg-ink-800 border-gold-400/50 shadow-lg shadow-gold-400/5'
                        : 'bg-ink-800 border-white/10'
                    }`}
                  >
                    <div className="mb-3.5">
                      {exercise.group && (
                        <div className="mb-2 flex items-center gap-1.5 text-gold-400">
                          <div className="flex items-center gap-1 rounded-md bg-gold-400/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider border border-gold-400/30">
                            <Link2 size={14} />
                            {exercise.group}
                          </div>
                        </div>
                      )}
                      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400 font-semibold">
                        Exercício {index + 1}
                      </p>
                      <h2 className={`mt-1 font-display text-2xl uppercase leading-tight ${isDone ? 'line-through text-zinc-400' : 'text-white font-extrabold tracking-wide'}`}>
                        {exercise.name}
                      </h2>
                    </div>

                    <div className="flex items-stretch gap-3.5 mb-3.5">
                      <div className="w-32 shrink-0 flex flex-col">
                        {exercise.video ? (
                          <button
                            type="button"
                            onClick={() => openVideo(exercise)}
                            className="group relative h-full min-h-[148px] w-full overflow-hidden rounded-xl border-2 border-gold-400/40 bg-ink-700 text-left transition hover:border-gold-400 flex items-center justify-center shadow-md"
                          >
                            {videoId ? (
                              <>
                                <img
                                  src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                                  alt={exercise.name}
                                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 transition group-hover:bg-black/50" />
                                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gold-400 text-ink-950 shadow-lg">
                                  <Play size={24} fill="currentColor" className="ml-0.5" />
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-2 text-gold-300 text-center">
                                <ExternalLink size={20} className="mb-1" />
                                <span className="text-[11px] uppercase font-bold">Vídeo</span>
                              </div>
                            )}
                          </button>
                        ) : (
                          <div className="flex h-full min-h-[148px] w-full items-center justify-center rounded-xl border border-white/10 bg-ink-900/50 text-zinc-600">
                            <Play size={24} className="opacity-20" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="rounded-xl bg-ink-700 p-2.5 text-center border border-white/5 flex flex-col justify-center">
                            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Séries</p>
                            <p className="font-display text-xl text-gold-400 font-extrabold mt-0.5">{exercise.sets}</p>
                          </div>
                          <div className="rounded-xl bg-ink-700 p-2.5 text-center border border-white/5 flex flex-col justify-center">
                            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Repetições</p>
                            <p className="font-display text-xl text-gold-400 font-extrabold mt-0.5">{exercise.reps}</p>
                          </div>
                        </div>

                        {exercise.notes ? (
                          <div 
                            onClick={() => setSelectedObs({ title: exercise.name, notes: exercise.notes })}
                            className="flex items-start gap-1.5 rounded-xl bg-gold-400/10 border border-gold-400/25 p-2.5 text-[11px] leading-snug text-zinc-200 flex-1 cursor-pointer transition hover:bg-gold-400/20 hover:border-gold-400/50 active:scale-[0.99]"
                            title="Toque para ler a observação completa"
                          >
                            <Lightbulb size={14} className="text-gold-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-3">{exercise.notes}</span>
                          </div>
                        ) : (
                          <div className="flex-1 rounded-xl border border-dashed border-white/5 bg-ink-900/20 p-2 flex items-center justify-center text-[10px] text-zinc-600 uppercase tracking-wider">
                            Sem observações
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative pt-2 border-t border-white/10">
                      {!isMenuOpen ? (
                        <div className="grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setActiveRestMenu(exercise.id)}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-gold-400/30 bg-ink-700 py-3 text-xs font-bold uppercase tracking-wider text-gold-300 hover:border-gold-400/60 transition shadow-sm"
                          >
                            <Timer size={16} />
                            Descanso
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleCompleteExercise(exercise.id)}
                            className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-xs font-bold uppercase tracking-wider transition shadow-sm ${
                              isDone
                                ? 'bg-emerald-500 text-ink-950 shadow-md shadow-emerald-500/20 font-extrabold'
                                : 'border border-white/15 bg-ink-700 text-zinc-200 hover:border-gold-400/50 hover:text-gold-300'
                            }`}
                          >
                            <CheckCircle2 size={16} />
                            {isDone ? 'Concluído' : 'Marcar'}
                          </button>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-gold-400/40 bg-ink-900 p-3 shadow-xl">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gold-400">
                              Selecione o tempo de descanso:
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveRestMenu(null)}
                              className="text-zinc-400 hover:text-white"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[30, 45, 60, 90].map((sec) => (
                              <button
                                key={sec}
                                type="button"
                                onClick={() => startTimer(sec)}
                                className="rounded-lg border border-gold-400/30 bg-ink-800 py-2.5 text-xs font-bold text-gold-300 hover:bg-gold-400 hover:text-ink-950 transition"
                              >
                                {sec}s
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        ) : showFinishedScreen ? (
          /* TELA DE PARABÉNS / CONCLUSÃO DE TREINO */
          <div className="py-8 text-center space-y-6 animate-fade-in">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-gold-400 to-gold-600 text-ink-950 shadow-2xl shadow-gold-400/30">
              <Trophy size={48} />
            </div>

            <div>
              <p className="text-xs uppercase font-bold tracking-widest text-gold-400">Missão Cumprida</p>
              <h2 className="font-display text-3xl uppercase tracking-wide mt-1">Treino Concluído!</h2>
              <p className="text-sm text-zinc-300 mt-2">Você completou {completedCount} de {totalExercises} exercícios com sucesso.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-ink-900 p-5 max-w-xs mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 uppercase tracking-wider">Tempo Total:</span>
                <span className="font-display text-xl text-gold-400 font-bold">{formatSessionTime(sessionSeconds)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-xs text-zinc-400 uppercase tracking-wider">Aproveitamento:</span>
                <span className="font-display text-xl text-emerald-400 font-bold">{progressPercent}%</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={sendWhatsAppFeedback}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-xs font-bold uppercase tracking-wider text-ink-950 transition hover:bg-emerald-500 shadow-xl"
              >
                <MessageCircle size={18} fill="currentColor" />
                Enviar Feedback e Cargas ao Professor
              </button>

              <button
                type="button"
                onClick={() => {
                  setInWorkoutMode(false)
                  setShowFinishedScreen(false)
                }}
                className="w-full rounded-2xl border border-white/20 bg-ink-800 py-3.5 text-xs font-bold uppercase tracking-wider text-zinc-300 transition hover:bg-ink-700"
              >
                Voltar aos Treinos
              </button>
            </div>
          </div>
        ) : (
          /* MODO TREINO IMERSIVO (EXIBIÇÃO PASSO A PASSO DO EXERCÍCIO ATUAL) */
          <div className="space-y-4 animate-fade-in">
            {/* CABEÇALHO DO MODO TREINO COM CRONÓMETRO GERAL */}
            <div className="flex items-center justify-between rounded-2xl bg-ink-900 border border-gold-400/40 p-3.5">
              <div className="flex items-center gap-2">
                <Timer size={18} className="text-gold-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">Tempo:</span>
                <span className="font-display text-lg text-gold-400 font-bold">{formatSessionTime(sessionSeconds)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSessionPaused(!sessionPaused)}
                  className="rounded-lg border border-white/10 bg-ink-800 px-2.5 py-1.5 text-[11px] font-bold text-zinc-300 hover:text-white"
                >
                  {sessionPaused ? 'Continuar' : 'Pausar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInWorkoutMode(false)
                  }}
                  className="rounded-lg border border-red-500/30 bg-red-500/20 px-2.5 py-1.5 text-[11px] font-bold text-red-300"
                >
                  Sair
                </button>
              </div>
            </div>

            {/* BARRA DE PROGRESSO DO MODO TREINO */}
            <div className="flex items-center justify-between text-xs font-bold text-zinc-400 px-1">
              <span>Exercício {workoutActiveIndex + 1} de {totalExercises}</span>
              <span className="text-gold-400">{Math.round(((workoutActiveIndex + 1) / totalExercises) * 100)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-800 border border-white/5">
              <div
                className="h-full bg-gold-400 transition-all duration-300"
                style={{ width: `${((workoutActiveIndex + 1) / totalExercises) * 100}%` }}
              />
            </div>

            {/* CARTÃO DO EXERCÍCIO ATUAL */}
            {(() => {
              const exercise = sortedExercises[workoutActiveIndex]
              if (!exercise) return null
              const videoId = youtubeId(exercise.video)
              const isDone = completedExercises.includes(exercise.id)

              return (
                <div className="rounded-2xl border border-gold-400/50 bg-ink-900 p-5 shadow-2xl space-y-4">
                  <div>
                    {exercise.group && (
                      <div className="mb-2 inline-flex items-center gap-1 rounded-md bg-gold-400/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-gold-400 border border-gold-400/30">
                        <Link2 size={13} />
                        {exercise.group}
                      </div>
                    )}
                    <h2 className="font-display text-2xl uppercase tracking-wide text-white">
                      {exercise.name}
                    </h2>
                  </div>

                  {/* VÍDEO DE DEMONSTRAÇÃO */}
                  {exercise.video && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gold-400/30 bg-black">
                      {videoId ? (
                        <button
                          type="button"
                          onClick={() => openVideo(exercise)}
                          className="group relative h-full w-full flex items-center justify-center"
                        >
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                            alt={exercise.name}
                            className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/40" />
                          <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-gold-400 text-ink-950 shadow-xl">
                            <Play size={28} fill="currentColor" className="ml-1" />
                          </div>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openVideo(exercise)}
                          className="h-full w-full flex items-center justify-center text-gold-400 text-xs uppercase font-bold"
                        >
                          <ExternalLink size={20} className="mr-2" /> Assistir Vídeo
                        </button>
                      )}
                    </div>
                  )}

                  {/* SÉRIES E REPETIÇÕES */}
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

                  {/* ORIENTAÇÕES / DICAS */}
                  {exercise.notes && (
                    <div className="rounded-xl bg-gold-400/10 border border-gold-400/25 p-3 text-xs leading-relaxed text-zinc-200">
                      <div className="flex items-center gap-1.5 text-gold-400 font-bold uppercase text-[10px] tracking-wider mb-1">
                        <Lightbulb size={14} /> Foco / Execução
                      </div>
                      <p>{exercise.notes}</p>
                    </div>
                  )}

                  {/* BOTÃO DE MARCAR CONCLUÍDO */}
                  <button
                    type="button"
                    onClick={() => toggleCompleteExercise(exercise.id)}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-extrabold uppercase tracking-wider transition ${
                      isDone
                        ? 'bg-emerald-500 text-ink-950 shadow-lg shadow-emerald-500/20'
                        : 'border border-gold-400/40 bg-ink-800 text-gold-300 hover:bg-gold-400 hover:text-ink-950'
                    }`}
                  >
                    <CheckCircle2 size={18} />
                    {isDone ? 'Exercício Concluído ✓' : 'Marcar como Concluído'}
                  </button>

                  {/* NAVEGAÇÃO ENTRE EXERCÍCIOS */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <button
                      type="button"
                      disabled={workoutActiveIndex === 0}
                      onClick={() => setWorkoutActiveIndex((prev) => Math.max(0, prev - 1))}
                      className="flex items-center gap-1 rounded-xl border border-white/10 bg-ink-800 px-4 py-2.5 text-xs font-bold text-zinc-300 disabled:opacity-30 hover:border-gold-400/40 transition"
                    >
                      <ChevronLeft size={16} /> Anterior
                    </button>

                    {workoutActiveIndex < totalExercises - 1 ? (
                      <button
                        type="button"
                        onClick={() => setWorkoutActiveIndex((prev) => Math.min(totalExercises - 1, prev + 1))}
                        className="flex items-center gap-1 rounded-xl bg-gold-400 px-5 py-2.5 text-xs font-bold uppercase text-ink-950 hover:bg-gold-300 transition shadow-md"
                      >
                        Próximo Exercício <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowFinishedScreen(true)}
                        className="flex items-center gap-1 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-extrabold uppercase text-ink-950 hover:bg-emerald-400 transition shadow-md animate-pulse"
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

      {/* BOTÃO FLUTUANTE DO WHATSAPP */}
      <div className="fixed bottom-36 right-4 z-45 flex items-center">
        <button
          onClick={sendRealtimeDoubt}
          className="group flex items-center gap-2.5 rounded-full bg-emerald-500 text-ink-950 p-3.5 shadow-xl shadow-emerald-500/30 border border-emerald-400 transition-all duration-300 hover:scale-105 hover:bg-emerald-400"
          aria-label="Deixe sua dúvida ou mudanças no WhatsApp"
          title="Deixe sua dúvida ou mudanças"
        >
          <MessageCircle size={22} fill="currentColor" className="text-ink-950 animate-pulse" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap font-display text-xs font-bold uppercase tracking-wider transition-all duration-300 group-hover:max-w-xs group-hover:pr-1">
            Deixe sua dúvida
          </span>
        </button>
      </div>

      {/* RODAPÉ FIXO INTELIGENTE COM CRONÓMETRO DE DESCANSO */}
      {selectedWorkoutDay && !inWorkoutMode && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-gold-400/40 bg-ink-950/95 p-5 backdrop-blur shadow-2xl">
          <div className="mx-auto max-w-md">
            {isWorkoutCompleted ? (
              <div className="flex items-center gap-4 animate-fade-in py-1">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-ink-950 shadow-xl shadow-gold-400/30">
                  <Trophy size={32} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl uppercase tracking-wider text-gold-300">Missão Cumprida!</p>
                  <p className="text-xs text-zinc-200">Treino finalizado com sucesso total. Parabéns pelo foco!</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400/15 border border-gold-400/40 text-gold-400">
                      <Timer size={24} className="animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-zinc-400">Descanso entre séries</p>
                      <p className="font-display text-2xl text-gold-400 font-bold tracking-wide">
                        {timerActive ? `${timerSeconds}s` : timerSeconds === 0 && !timerActive ? 'Pronto' : `${timerSeconds}s`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {timerActive ? (
                      <button
                        onClick={stopTimer}
                        className="rounded-xl bg-red-500/25 px-5 py-3 text-xs font-bold uppercase text-red-300 border border-red-500/30 transition hover:bg-red-500/40"
                      >
                        Parar
                      </button>
                    ) : (
                      <button
                        onClick={() => startTimer(initialTime)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gold-400 px-4 py-3 text-xs font-bold uppercase text-ink-950 transition hover:bg-gold-300 shadow-lg shadow-gold-400/20"
                      >
                        <RotateCcw size={14} /> Repetir ({initialTime}s)
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2">
                  {[30, 45, 60, 90].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => startTimer(sec)}
                      className={`rounded-xl py-2 text-xs font-bold transition shadow-sm ${
                        initialTime === sec && timerActive
                          ? 'bg-gold-400 text-ink-950 font-bold shadow-gold/20'
                          : 'border border-white/10 bg-ink-900 text-zinc-300 hover:border-gold-400/40 hover:text-gold-400'
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE AVALIAÇÃO FÍSICA COMPLETA */}
      {isEvaluationOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsEvaluationOpen(false)
            }
          }}
        >
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border border-gold-400/40 bg-ink-900 p-6 shadow-2xl animate-fade-in text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/20 text-gold-400 border border-gold-400/30">
                  <Activity size={22} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gold-400 font-bold">Danilo Lopes Consultoria</p>
                  <h3 className="font-display text-xl uppercase tracking-wide">Avaliação Física</h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEvaluationOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-300 hover:text-gold-400 hover:border-gold-400/40 transition"
              >
                <X size={18} />
              </button>
            </div>

            {latestEvaluation ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between bg-ink-950/60 p-3 rounded-xl border border-white/5">
                  <span className="text-xs text-zinc-400 font-medium">Data da Avaliação:</span>
                  <span className="text-xs font-bold text-gold-400">{latestEvaluation.date}</span>
                </div>

                <div>
                  <p className="text-xs uppercase font-bold tracking-widest text-gold-400 mb-2.5 flex items-center gap-1.5">
                    <Scale size={14} /> Composição Corporal
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl bg-ink-800 p-3 border border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400">Peso Total</p>
                      <p className="font-display text-lg text-white font-bold">{latestEvaluation.weight} kg</p>
                    </div>
                    <div className="rounded-xl bg-ink-800 p-3 border border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400">Altura</p>
                      <p className="font-display text-lg text-white font-bold">{latestEvaluation.height} m</p>
                    </div>
                    <div className="rounded-xl bg-ink-800 p-3 border border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400">% de Gordura (%BF)</p>
                      <p className="font-display text-lg text-gold-400 font-bold">{latestEvaluation.fatPercentage}%</p>
                    </div>
                    <div className="rounded-xl bg-ink-800 p-3 border border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400">Massa Magra</p>
                      <p className="font-display text-lg text-emerald-400 font-bold">{latestEvaluation.leanMass} kg</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase font-bold tracking-widest text-gold-400 mb-2.5 flex items-center gap-1.5">
                    <Flame size={14} /> Metabolismo & Calorias
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-xl bg-ink-800 p-3 border border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400">Taxa Metabólica Basal (TMB)</p>
                      <p className="font-display text-base text-white font-bold">{latestEvaluation.tmb} kcal</p>
                    </div>
                    <div className="rounded-xl bg-ink-800 p-3 border border-white/5">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400">Gasto Energético Total (GET)</p>
                      <p className="font-display text-base text-gold-400 font-bold">{latestEvaluation.get} kcal</p>
                    </div>
                  </div>
                </div>

                {latestEvaluation.circumferences && (
                  <div>
                    <p className="text-xs uppercase font-bold tracking-widest text-gold-400 mb-2.5 flex items-center gap-1.5">
                      <UserCheck size={14} /> Circunferências (cm)
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-ink-800 p-2.5 border border-white/5">
                        <p className="text-[9px] uppercase tracking-wider text-zinc-400">Tórax</p>
                        <p className="font-display text-sm text-white font-bold mt-0.5">{latestEvaluation.circumferences.chest} cm</p>
                      </div>
                      <div className="rounded-xl bg-ink-800 p-2.5 border border-white/5">
                        <p className="text-[9px] uppercase tracking-wider text-zinc-400">Braço</p>
                        <p className="font-display text-sm text-white font-bold mt-0.5">{latestEvaluation.circumferences.arm} cm</p>
                      </div>
                      <div className="rounded-xl bg-ink-800 p-2.5 border border-white/5">
                        <p className="text-[9px] uppercase tracking-wider text-zinc-400">Cintura</p>
                        <p className="font-display text-sm text-white font-bold mt-0.5">{latestEvaluation.circumferences.waist} cm</p>
                      </div>
                      <div className="rounded-xl bg-ink-800 p-2.5 border border-white/5">
                        <p className="text-[9px] uppercase tracking-wider text-zinc-400">Quadril</p>
                        <p className="font-display text-sm text-white font-bold mt-0.5">{latestEvaluation.circumferences.hips} cm</p>
                      </div>
                      <div className="rounded-xl bg-ink-800 p-2.5 border border-white/5">
                        <p className="text-[9px] uppercase tracking-wider text-zinc-400">Coxa</p>
                        <p className="font-display text-sm text-white font-bold mt-0.5">{latestEvaluation.circumferences.thigh} cm</p>
                      </div>
                      <div className="rounded-xl bg-ink-800 p-2.5 border border-white/5">
                        <p className="text-[9px] uppercase tracking-wider text-zinc-400">Panturrilha</p>
                        <p className="font-display text-sm text-white font-bold mt-0.5">{latestEvaluation.circumferences.calf} cm</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <Activity size={40} className="mx-auto text-gold-400/40 animate-pulse" />
                <p className="text-sm font-medium text-zinc-300">Nenhuma avaliação física cadastrada.</p>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                  Assim que o professor registrar sua avaliação pela área administrativa, os dados de composição corporal aparecerão aqui.
                </p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsEvaluationOpen(false)}
                className="w-full rounded-xl bg-gold-400 py-3 text-xs font-bold uppercase text-ink-950 transition hover:bg-gold-300 shadow-lg"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE VÍDEO */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeVideo()
            }
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="min-w-0 pr-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gold-400">Demonstração</p>
                <h3 className="mt-1 truncate font-display text-lg uppercase text-white">{selectedVideo.name}</h3>
              </div>
              <button
                type="button"
                onClick={closeVideo}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-zinc-300 transition hover:border-gold-400/40 hover:text-gold-400"
                aria-label="Fechar vídeo"
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1&rel=0`}
                title={selectedVideo.name}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-xs text-zinc-500">Assista à execução correta do movimento.</p>
              <button
                type="button"
                onClick={closeVideo}
                className="rounded-xl bg-gold-400 px-4 py-2 text-xs font-semibold uppercase text-ink-950 transition hover:bg-gold-300"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE OBSERVAÇÕES */}
      {selectedObs && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedObs(null)
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-gold-400/40 bg-ink-900 p-5 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb size={18} className="text-gold-400" />
                <h3 className="font-display text-lg uppercase tracking-wide text-gold-400">{selectedObs.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedObs(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-zinc-300 hover:text-gold-400 hover:border-gold-400/40 transition"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <p className="text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap">{selectedObs.notes}</p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedObs(null)}
                className="w-full rounded-xl bg-gold-400 py-3 text-xs font-bold uppercase text-ink-950 transition hover:bg-gold-300 shadow-lg"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
