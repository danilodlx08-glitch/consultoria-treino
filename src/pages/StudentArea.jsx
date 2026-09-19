import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, LogOut, RefreshCw, X, Play, Timer, RotateCcw, MessageCircle, Link2 } from 'lucide-react'
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
  const [day, setDay] = useState('A')
  const [syncedAt, setSyncedAt] = useState('')
  const [selectedVideo, setSelectedVideo] = useState(null)

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

  const workout = workouts[day] || {
    title: 'Treino',
    focus: '',
    exercises: [],
  }

  // Ordena os exercícios para que os que pertencem ao mesmo grupo (Bi-set/Conjugado) fiquem juntos
  const sortedExercises = useMemo(() => {
    const exercises = [...(workout.exercises || [])]
    exercises.sort((a, b) => {
      const gA = (a.group || '').trim().toLowerCase()
      const gB = (b.group || '').trim().toLowerCase()
      if (gA && gB) return gA.localeCompare(gB)
      if (gA) return -1
      if (gB) return 1
      return 0
    })
    return exercises
  }, [workout.exercises])

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

  function sendWhatsAppFeedback() {
    const studentName = current?.name || student?.name || 'Aluno'
    const workoutTitle = workout.title || `Treino ${day}`
    
    const exercisesList = (sortedExercises || [])
      .map((ex, idx) => {
        const groupTag = ex.group ? ` [${ex.group}]` : ''
        return `*${idx + 1}. ${ex.name}*${groupTag} (Séries: ${ex.sets}, Reps: ${ex.reps})\nCarga: `
      })
      .join('\n\n')

    const message = encodeURIComponent(
      `Olá Danilo! Aqui são as cargas e feedback do *${studentName}* referentes ao *${workoutTitle}* (${day}):\n\n${exercisesList}\n\nObservações / Dúvidas:`
    )

    const phone = '5527996247906'
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank', 'noopener,noreferrer')
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setSelectedVideo(null)
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
    <div className="min-h-dvh bg-ink-950 pb-36 text-white">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-ink-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <Logo className="h-10 w-10" showText />
          <button
            onClick={exit}
            className="rounded-full border border-white/10 p-2 text-zinc-300 transition hover:border-gold-400/30 hover:text-gold-400"
            aria-label="Sair"
          >
            <LogOut size={16} />
          </button>
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

        <div className="sticky top-[57px] z-20 border-b border-white/5 bg-ink-950/95 px-4 py-2.5 backdrop-blur">
          <div className="mx-auto grid max-w-md grid-cols-5 gap-2">
            {DAYS.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setDay(item)
                  setActiveRestMenu(null)
                }}
                className={`rounded-xl py-2 font-display text-lg transition shadow-sm ${
                  day === item
                    ? 'bg-gold-400 text-ink-950 font-bold shadow-gold/20'
                    : 'border border-white/10 bg-ink-800 text-zinc-300 hover:border-gold-400/30'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-5 safe-bottom">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold-400">
          {workout.focus}
        </p>
        <h1 className="mt-1 font-display text-2xl uppercase">
          {workout.title}
        </h1>

        <button
          type="button"
          onClick={sendWhatsAppFeedback}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 py-3.5 text-xs font-bold uppercase tracking-wider text-emerald-400 transition hover:bg-emerald-600/30 shadow-lg"
        >
          <MessageCircle size={18} />
          Enviar cargas e feedback no WhatsApp
        </button>

        <div className="mt-5 space-y-3">
          {(sortedExercises || []).map((exercise, index) => {
            const videoId = youtubeId(exercise.video)
            const isMenuOpen = activeRestMenu === exercise.id

            return (
              <article
                key={exercise.id || `${day}-${index}`}
                className={`rounded-2xl border bg-ink-800 p-4 relative ${
                  exercise.group ? 'border-gold-400/50 shadow-lg shadow-gold-400/5' : 'border-white/5'
                }`}
              >
                {/* ETIQUETA DE BI-SET / CONJUGADO */}
                {exercise.group && (
                  <div className="mb-2.5 flex items-center gap-1.5 text-gold-400">
                    <div className="flex items-center gap-1 rounded-md bg-gold-400/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border border-gold-400/30">
                      <Link2 size={13} />
                      {exercise.group}
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                      Exercício {index + 1}
                    </p>
                    <h2 className="mt-1 font-display text-xl uppercase leading-tight">
                      {exercise.name}
                    </h2>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-ink-700 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">Séries</p>
                    <p className="font-display text-lg text-gold-400">{exercise.sets}</p>
                  </div>
                  <div className="rounded-xl bg-ink-700 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">Repetições</p>
                    <p className="font-display text-lg text-gold-400">{exercise.reps}</p>
                  </div>
                </div>

                {exercise.notes && (
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{exercise.notes}</p>
                )}

                <div className="mt-4 relative">
                  {!isMenuOpen ? (
                    <button
                      type="button"
                      onClick={() => setActiveRestMenu(exercise.id)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gold-400/20 bg-ink-700 py-2.5 text-xs font-semibold uppercase tracking-wider text-gold-300 hover:border-gold-400/50 transition"
                    >
                      <Timer size={14} />
                      Escolher Descanso
                    </button>
                  ) : (
                    <div className="rounded-xl border border-gold-400/40 bg-ink-900 p-3 shadow-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-400">
                          Selecione o tempo de descanso:
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveRestMenu(null)}
                          className="text-zinc-400 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[30, 45, 60, 90].map((sec) => (
                          <button
                            key={sec}
                            type="button"
                            onClick={() => startTimer(sec)}
                            className="rounded-lg border border-gold-400/30 bg-ink-800 py-2 text-xs font-bold text-gold-300 hover:bg-gold-400 hover:text-ink-950 transition"
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {exercise.video && (
                  <button
                    type="button"
                    onClick={() => openVideo(exercise)}
                    className="group mt-3 block w-full overflow-hidden rounded-xl border border-gold-400/20 bg-ink-700 text-left transition hover:border-gold-400/50"
                  >
                    {videoId ? (
                      <div className="relative">
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                          alt={`Vídeo demonstrativo de ${exercise.name}`}
                          className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-black/25 transition group-hover:bg-black/40" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-400 text-ink-950 shadow-lg transition duration-200 group-hover:scale-110">
                            <Play size={24} fill="currentColor" className="ml-1" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between px-3 py-3">
                        <span className="flex items-center gap-2 text-sm text-gold-300">
                          <ExternalLink size={16} />
                          Ver vídeo do movimento
                        </span>
                        <ExternalLink size={14} />
                      </div>
                    )}

                    {videoId && (
                      <div className="flex items-center justify-between px-3 py-3">
                        <span className="text-sm font-medium text-gold-300">Assistir demonstração</span>
                        <Play size={15} fill="currentColor" />
                      </div>
                    )}
                  </button>
                )}
              </article>
            )
          })}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gold-400/20 bg-ink-950/95 p-3 backdrop-blur shadow-2xl">
        <div className="mx-auto max-w-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer size={18} className="text-gold-400 animate-pulse" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-zinc-400">Descanso entre séries</p>
                <p className="font-display text-xl text-gold-400">
                  {timerActive ? `${timerSeconds}s` : timerSeconds === 0 && !timerActive ? 'Pronto' : `${timerSeconds}s`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {timerActive ? (
                <button
                  onClick={stopTimer}
                  className="rounded-xl bg-red-500/25 px-4 py-2 text-xs font-bold uppercase text-red-300 border border-red-500/30 transition hover:bg-red-500/40"
                >
                  Parar
                </button>
              ) : (
                <button
                  onClick={() => startTimer(initialTime)}
                  className="inline-flex items-center gap-1 rounded-xl bg-gold-400 px-3 py-2 text-xs font-bold uppercase text-ink-950 transition hover:bg-gold-300"
                >
                  <RotateCcw size={12} /> Repetir ({initialTime}s)
                </button>
              )}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {[30, 45, 60, 90].map((sec) => (
              <button
                key={sec}
                onClick={() => startTimer(sec)}
                className={`rounded-lg py-1.5 text-xs font-semibold transition ${
                  initialTime === sec && timerActive
                    ? 'bg-gold-400 text-ink-950 font-bold'
                    : 'border border-white/10 bg-ink-900 text-zinc-300 hover:border-gold-400/40 hover:text-gold-400'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>
      </div>

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
    </div>
  )
}
