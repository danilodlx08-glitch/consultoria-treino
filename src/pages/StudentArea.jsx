import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, LogOut, RefreshCw } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import { useAuth } from '../auth.jsx'
import { loadData, subscribeData } from '../storage'

const DAYS = ['A', 'B', 'C', 'D', 'E']

function youtubeId(url = '') {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/)
  return match ? match[1] : null
}

export default function StudentArea() {
  const { student, logoutStudent } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(() => loadData())
  const [day, setDay] = useState('A')
  const [syncedAt, setSyncedAt] = useState('')

  const current = useMemo(() => {
    return (
      data.students.find((item) => item.id === student?.id || item.code === student?.code) ||
      data.students[0]
    )
  }, [data, student])

  const workouts = current?.workouts || data.workouts
  const workout = workouts[day] || { title: 'Treino', focus: '', exercises: [] }

  useEffect(() => {
    const stop = subscribeData((next) => {
      setData(next)
      setSyncedAt(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    })
    return stop
  }, [])

  function exit() {
    logoutStudent()
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
        <div className="mx-auto max-w-md px-4 pb-3">
          <p className="text-xs text-zinc-500">Ola, {current?.name || student?.name || 'aluno'}</p>
          {syncedAt && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-gold-400/80">
              <RefreshCw size={10} />
              Atualizado as {syncedAt}
            </p>
          )}
          <div className="mt-3 grid grid-cols-5 gap-2">
            {DAYS.map((item) => (
              <button
                key={item}
                onClick={() => setDay(item)}
                className={`rounded-xl py-2 font-display text-lg ${
                  day === item ? 'bg-gold-400 text-ink-950' : 'border border-white/10 bg-ink-800 text-zinc-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-5 safe-bottom">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold-400">{workout.focus}</p>
        <h1 className="mt-1 font-display text-2xl uppercase">{workout.title}</h1>
        <div className="mt-5 space-y-3">
          {(workout.exercises || []).map((exercise, index) => {
            const videoId = youtubeId(exercise.video)
            return (
              <article key={exercise.id || `${day}-${index}`} className="rounded-2xl border border-white/5 bg-ink-800 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-gold-400">Exercicio {index + 1}</p>
                    <h2 className="mt-1 font-display text-xl uppercase leading-tight">{exercise.name}</h2>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-ink-700 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">Series</p>
                    <p className="font-display text-lg text-gold-400">{exercise.sets}</p>
                  </div>
                  <div className="rounded-xl bg-ink-700 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">Repeticoes</p>
                    <p className="font-display text-lg text-gold-400">{exercise.reps}</p>
                  </div>
                </div>
                {exercise.notes && <p className="mt-3 text-sm leading-6 text-zinc-400">{exercise.notes}</p>}
                {exercise.video && (
                  <a
                    href={exercise.video}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex items-center justify-between rounded-xl border border-gold-400/20 bg-ink-700 px-3 py-2 text-sm text-gold-300"
                  >
                    <span className="flex items-center gap-2">
                      {videoId ? (
                        <img
                          src={`https://img.youtube.com/vi/${videoId}/default.jpg`}
                          alt=""
                          className="h-8 w-12 rounded object-cover"
                        />
                      ) : null}
                      Ver video do movimento
                    </span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </article>
            )
          })}
        </div>
      </main>
    </div>
  )
}
