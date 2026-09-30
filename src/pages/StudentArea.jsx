import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, LogOut, RefreshCw, X, Play, Timer, RotateCcw, MessageCircle, Link2, CheckCircle2, Trophy, Lightbulb, ArrowLeft } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../auth.jsx'
import { loadData, subscribeData } from '../storage'

const DAYS = ['A', 'B', 'C', 'D', 'E']

function youtubeId(url = '') {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  )
  return match ? match[1] : null
}

export default function StudentArea() {
  const { student, logoutStudent } = useAuth()
  const navigate = useNavigate()

  const [data, setData] = useState(() => loadData())
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState(null)
  const [syncedAt, setSyncedAt] = useState('')
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [selectedObs, setSelectedObs] = useState(null)

  const [completedExercises, setCompletedExercises] = useState([])

  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [initialTime, setInitialTime] = useState(60)
  const [activeRestMenu, setActiveRestMenu] = useState(null)

  const current = useMemo(() => {
    return (
      data.students.find(
        (item) => item.id === student?.id || item.code === student?.code
      ) || data.students[0]
    )
  }, [data, student])

  const workouts = current?.workouts || data.workouts

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

  useEffect(() => {
    let interval = null
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((sec) => sec - 1)
      }, 1000)
    } else if (timerSeconds === 0 && timerActive) {
      setTimerActive(false)
    }
    return () => clearInterval(interval)
  }, [timerActive, timerSeconds])

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
            {selectedWorkoutDay && (
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

        <div className="mx-auto max-w-md px-4 pb-3">
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
      </header>

      <main className="mx-auto max-w-md px-4 py-5 safe-bottom">
        {!selectedWorkoutDay ? (
          /* TELA 1: LISTA DE CARDS DE TREINOS COM LETRA GRANDE À ESQUERDA (ESTILO ESBOÇO) */
          <div className="space-y-4">
            <div className="mb-2">
              <p className="text-[12px] uppercase tracking-[0.2em] text-gold-400 font-bold">
                Sua Rotina
              </p>
              <h1 className="mt-1 font-display text-2xl uppercase">
                Escolha o Treino
              </h1>
            </div>

            <div className="space-y-3.5">
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
                    {/* LETRA GRANDE À ESQUERDA (EXACTAMENTE COMO NO ESBOÇO) */}
                    <div className="flex shrink-0 flex-col items-center justify-center h-16 w-16 rounded-xl bg-ink-900 border-2 border-gold-400/40 text-gold-400 font-display text-2xl font-extrabold shadow-inner group-hover:bg-gold-400 group-hover:text-ink-950 transition-all duration-300">
                      <span className="text-[9px] uppercase tracking-widest font-bold opacity-80 leading-none mb-0.5">Treino</span>
                      {dayKey}
                    </div>

                    {/* TÍTULO DO TREINO À DIREITA COM ESPAÇO AMPLO */}
                    <div className="flex-1 min-w-0">
                      <h2 className="font-display text-xl uppercase text-white tracking-wide group-hover:text-gold-300 transition-colors leading-snug">
                        {wData?.title || `Treino ${dayKey}`}
                      </h2>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* TELA 2: EXIBIÇÃO DOS EXERCÍCIOS DO TREINO ESCOLHIDO */
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

            <button
              type="button"
              onClick={sendWhatsAppFeedback}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 py-3.5 text-xs font-bold uppercase tracking-wider text-emerald-400 transition hover:bg-emerald-600/30 shadow-lg"
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
                    {/* NOME DO EXERCÍCIO NO TOPO */}
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

                    {/* VÍDEO ALTO À ESQUERDA + (SÉRIES/REPETIÇÕES E OBSERVAÇÕES) À DIREITA */}
                    <div className="flex items-stretch gap-3.5 mb-3.5">
                      {/* VÍDEO MAIOR E MAIS RETANGULAR/VERTICAL */}
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

                      {/* COLUNA DIREITA: SÉRIES/REPETIÇÕES ACIMA E OBSERVAÇÕES ABAIXO */}
                      <div className="flex-1 min-w-0 flex flex-col gap-2.5">
                        {/* SÉRIES E REPETIÇÕES LADO A LADO */}
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

                        {/* OBSERVAÇÕES CLICÁVEIS PARA ABRIR O MODAL */}
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

                    {/* BOTÕES DE DESCANSO E FEITO LADO A LADO NA BASE */}
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
                                {sec} segundos
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

      {/* RODAPÉ FIXO INTELIGENTE (SÓ APARECE DENTRO DO TREINO) */}
      {selectedWorkoutDay && (
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
                        {timerActive ? `${timerSeconds} segundos` : timerSeconds === 0 && !timerActive ? 'Pronto' : `${timerSeconds} segundos`}
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
                        <RotateCcw size={14} /> Repetir ({initialTime} segundos)
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
                      {sec} segundos
                    </button>
                  ))}
                </div>
              </>
            )}
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
