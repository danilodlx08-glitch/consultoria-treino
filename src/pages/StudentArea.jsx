import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LogOut,
  Dumbbell,
  Activity,
  CheckCircle2,
  ChevronRight,
  Scale,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../auth.jsx'
import {
  fetchSingleStudentData,
} from '../storage'

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

export default function StudentArea() {
  const { studentSession, logoutStudent, updateStudentSession } = useAuth()
  const navigate = useNavigate()

  const [day, setDay] = useState('A')
  const [loading, setLoading] = useState(false)
  const [syncMessage, setSyncMessage] = useState('')
  const [activeTab, setActiveTab] = useState('workouts') // 'workouts' | 'evaluations' | 'profile'
  const [selectedEvaluationIndex, setSelectedEvaluationIndex] = useState(0)

  // Estado para exibir o aviso de atualização pendente sinalizada pelo login
  const [updateAvailable, setUpdateAvailable] = useState(false)

  const student = studentSession?.student

  // Seleciona os dias ativos permitidos para o aluno (ex: de A até C, ou A até E)
  const availableDays = useMemo(() => {
    if (!student) return DAYS
    const reqDays = student.activeDays || student.active_days
    if (Array.isArray(reqDays) && reqDays.length > 0) {
      return DAYS.filter((d) => reqDays.includes(d))
    }
    return DAYS
  }, [student])

  useEffect(() => {
    if (availableDays.length > 0 && !availableDays.includes(day)) {
      setDay(availableDays[0])
    }
  }, [availableDays, day])

  // Identifica se o login já sinalizou que há uma nova versão remota disponível
  useEffect(() => {
    if (student?._hasRemoteUpdate) {
      setUpdateAvailable(true)
    }
  }, [student?._hasRemoteUpdate])

  // Função disparada quando o aluno clica em "Atualizar agora"
  async function handleApplyUpdate() {
    if (!student?.id || !student?.code) return
    try {
      setLoading(true)
      // Baixa os dados novos do Supabase e atualiza o cache e a sessão
      const freshData = await fetchSingleStudentData(student.id, student.code)
      if (freshData) {
        updateStudentSession({
          ...studentSession,
          student: freshData,
        })
        setUpdateAvailable(false)
        setSyncMessage('Treinos atualizados com sucesso!')
        setTimeout(() => setSyncMessage(''), 3000)
      }
    } catch (err) {
      console.error('Erro ao baixar nova versão:', err)
      setSyncMessage('Erro ao baixar atualizações. Verifique sua conexão.')
      setTimeout(() => setSyncMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  if (!student) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-950 p-4 text-white">
        <p className="mb-4 text-sm text-zinc-400">Sessão não encontrada ou expirada.</p>
        <button
          onClick={() => navigate('/aluno')}
          className="rounded-xl bg-gold-400 px-5 py-3 text-xs font-bold uppercase text-ink-950"
        >
          Fazer Login Novamente
        </button>
      </div>
    )
  }

  const workouts = student.workouts || {}
  const currentWorkout = workouts[day] || { title: `Treino ${day}`, focus: '', exercises: [] }
  const evaluations = Array.isArray(student.evaluations) ? student.evaluations : []
  const latestEvaluation = evaluations[evaluations.length - 1] || null
  const viewingEvaluation = evaluations[selectedEvaluationIndex] || latestEvaluation

  function handleLogout() {
    logoutStudent()
    navigate('/aluno')
  }

  return (
    <div className="min-h-dvh bg-ink-950 text-white pb-24">
      {/* Topo / Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-ink-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/20 border border-gold-400/30 text-gold-400 font-display font-bold text-lg">
              {student.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gold-400 font-bold">Área do Aluno</p>
              <h1 className="font-display text-lg uppercase tracking-wide truncate max-w-[180px]">
                {student.name}
              </h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full border border-white/10 p-2.5 text-zinc-300 hover:text-gold-400 transition"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>

        {/* Abas de Navegação do Aluno */}
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2 px-4 pb-3.5">
          <button
            onClick={() => setActiveTab('workouts')}
            className={`rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'workouts'
                ? 'bg-gold-400 text-ink-950 shadow-md'
                : 'border border-white/10 bg-ink-800 text-zinc-300 hover:border-gold-400/40'
            }`}
          >
            Treinos
          </button>
          <button
            onClick={() => setActiveTab('evaluations')}
            className={`rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'evaluations'
                ? 'bg-gold-400 text-ink-950 shadow-md'
                : 'border border-white/10 bg-ink-800 text-zinc-300 hover:border-gold-400/40'
            }`}
          >
            Avaliações ({evaluations.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'profile'
                ? 'bg-gold-400 text-ink-950 shadow-md'
                : 'border border-white/10 bg-ink-800 text-zinc-300 hover:border-gold-400/40'
            }`}
          >
            Meu Perfil
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-5 space-y-4">
        {syncMessage && (
          <p className="flex items-center gap-2 rounded-xl bg-gold-400/20 px-3.5 py-3 text-xs font-semibold text-gold-300 border border-gold-400/30 animate-fadeIn">
            <CheckCircle2 size={16} />
            {syncMessage}
          </p>
        )}

        {/* Banner de Atualização Disponível (Acionado via _hasRemoteUpdate) */}
        {updateAvailable && (
          <div className="flex flex-col gap-2.5 rounded-2xl border border-gold-400/50 bg-gold-400/15 p-4 text-white shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-gold-400 shrink-0" />
              <p className="text-xs font-bold uppercase tracking-wider text-gold-300">
                Nova planilha disponível!
              </p>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              O professor Danilo enviou novos ajustes e fichas de treino para você.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setUpdateAvailable(false)}
                className="rounded-xl border border-white/15 py-2.5 text-xs font-bold uppercase text-zinc-300 hover:bg-white/5 transition"
              >
                Prosseguir sem atualizar
              </button>
              <button
                onClick={handleApplyUpdate}
                disabled={loading}
                className="rounded-xl bg-gold-400 py-2.5 text-xs font-bold uppercase text-ink-950 font-bold hover:bg-gold-300 transition shadow disabled:opacity-50"
              >
                {loading ? 'Baixando...' : 'Atualizar agora'}
              </button>
            </div>
          </div>
        )}

        {/* ABA DE TREINOS */}
        {activeTab === 'workouts' && (
          <section className="space-y-4">
            {/* Seletor de Dias Ativos (A, B, C, D, E) */}
            <div
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${availableDays.length}, minmax(0, 1fr))` }}
            >
              {availableDays.map((item) => (
                <button
                  key={item}
                  onClick={() => setDay(item)}
                  className={`rounded-xl py-3 font-display text-lg transition ${
                    day === item
                      ? 'bg-gold-400 text-ink-950 font-bold shadow-md scale-105'
                      : 'border border-white/15 bg-ink-800 text-white hover:border-gold-400/40'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Cabeçalho do Treino Atual */}
            <div className="rounded-2xl border border-white/10 bg-ink-900 p-4.5 space-y-1 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-gold-400 font-bold">
                  Treino {day}
                </span>
                {currentWorkout.focus && (
                  <span className="rounded-md bg-gold-400/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold-300 border border-gold-400/30">
                    {currentWorkout.focus}
                  </span>
                )}
              </div>
              <h2 className="font-display text-xl uppercase text-white">
                {currentWorkout.title || `Ficha de Treino ${day}`}
              </h2>
            </div>

            {/* Lista de Exercícios */}
            <div className="space-y-3">
              {(!currentWorkout.exercises || currentWorkout.exercises.length === 0) ? (
                <div className="rounded-2xl border border-white/10 bg-ink-900 p-8 text-center">
                  <Dumbbell size={32} className="mx-auto text-zinc-600 mb-2" />
                  <p className="text-sm text-zinc-400">Nenhum exercício cadastrado para este treino.</p>
                </div>
              ) : (
                currentWorkout.exercises.map((exercise, index) => {
                  const hasGroup = Boolean(exercise.group?.trim())
                  return (
                    <div
                      key={exercise.id || index}
                      className={`rounded-2xl border bg-ink-900 p-4.5 space-y-3 transition ${
                        hasGroup ? 'border-gold-400/50 shadow-lg shadow-gold-400/5' : 'border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gold-400/20 text-xs font-bold text-gold-400 border border-gold-400/30">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <h3 className="font-display text-base uppercase text-white leading-snug">
                              {exercise.name || 'Exercício'}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                              {exercise.muscle && (
                                <span className="text-[11px] uppercase tracking-wider text-gold-400 font-semibold">
                                  {exercise.muscle}
                                </span>
                              )}
                              {hasGroup && (
                                <span className="rounded bg-gold-400/20 px-2 py-0.5 text-[10px] uppercase font-bold text-gold-300 border border-gold-400/30">
                                  {exercise.group}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Séries e Repetições */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="rounded-xl border border-white/10 bg-ink-800 p-2.5 text-center">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Séries</p>
                          <p className="font-display text-lg text-white mt-0.5">{exercise.sets || '-'}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-ink-800 p-2.5 text-center">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Repetições</p>
                          <p className="font-display text-lg text-white mt-0.5">{exercise.reps || '-'}</p>
                        </div>
                      </div>

                      {exercise.notes && (
                        <div className="rounded-xl bg-ink-800/60 p-3 border border-white/5 text-xs text-zinc-300 leading-relaxed">
                          <span className="font-bold text-gold-400 uppercase tracking-wider block mb-0.5 text-[10px]">
                            Observações do Professor:
                          </span>
                          {exercise.notes}
                        </div>
                      )}

                      {exercise.video && (
                        <a
                          href={exercise.video}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-xl bg-gold-400/10 border border-gold-400/30 py-3 text-xs font-bold uppercase tracking-wider text-gold-300 hover:bg-gold-400/20 transition"
                        >
                          Ver Vídeo Demonstrativo
                          <ChevronRight size={14} />
                        </a>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </section>
        )}

        {/* ABA DE AVALIAÇÕES */}
        {activeTab === 'evaluations' && (
          <section className="space-y-4">
            <h2 className="font-display text-2xl uppercase">Avaliações Físicas</h2>
            {evaluations.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-ink-900 p-8 text-center space-y-2">
                <Activity size={32} className="mx-auto text-zinc-600" />
                <p className="text-sm text-zinc-400">Nenhuma avaliação física registrada pelo professor ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Seletor de Avaliações Anteriores */}
                {evaluations.length > 1 && (
                  <div className="rounded-2xl border border-white/10 bg-ink-900 p-3.5 space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gold-400">
                      Histórico de Avaliações
                    </label>
                    <select
                      value={selectedEvaluationIndex}
                      onChange={(e) => setSelectedEvaluationIndex(Number(e.target.value))}
                      className="w-full rounded-xl border border-white/15 bg-ink-800 px-3.5 py-2.5 text-sm text-white outline-none"
                    >
                      {evaluations.map((ev, i) => (
                        <option key={i} value={i}>
                          Avaliação de {ev.date} {i === evaluations.length - 1 ? '(Mais recente)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {viewingEvaluation && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="rounded-2xl border border-gold-400/30 bg-ink-900 p-5 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-gold-400 font-bold">Data da Avaliação</p>
                          <p className="font-display text-lg text-white">{viewingEvaluation.date}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/20 text-gold-400 border border-gold-400/30">
                          <Scale size={20} />
                        </div>
                      </div>

                      {/* Cards de Métricas Principais */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/10 bg-ink-800 p-3.5">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Peso Corporal</p>
                          <p className="font-display text-xl text-white mt-0.5">{viewingEvaluation.weight} <span className="text-xs text-zinc-400">kg</span></p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-ink-800 p-3.5">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">% de Gordura</p>
                          <p className="font-display text-xl text-gold-300 mt-0.5">{viewingEvaluation.fatPercentage}%</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-ink-800 p-3.5">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Massa Magra</p>
                          <p className="font-display text-xl text-white mt-0.5">{viewingEvaluation.leanMass} <span className="text-xs text-zinc-400">kg</span></p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-ink-800 p-3.5">
                          <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Gasto Energético (GET)</p>
                          <p className="font-display text-xl text-gold-300 mt-0.5">{viewingEvaluation.get} <span className="text-xs text-zinc-400">kcal</span></p>
                        </div>
                      </div>

                      {/* Circunferências */}
                      {viewingEvaluation.circumferences && (
                        <div className="pt-2">
                          <p className="text-xs uppercase font-bold tracking-wider text-gold-400 mb-2.5">Circunferências (cm)</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Object.entries(viewingEvaluation.circumferences).map(([key, val]) => (
                              <div key={key} className="rounded-lg border border-white/5 bg-ink-800 px-3 py-2 flex items-center justify-between">
                                <span className="text-xs uppercase text-zinc-400 font-medium">{key}</span>
                                <span className="text-sm font-bold text-white">{val || '-'} cm</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ABA DE PERFIL */}
        {activeTab === 'profile' && (
          <section className="space-y-4">
            <h2 className="font-display text-2xl uppercase">Meu Perfil</h2>
            <div className="rounded-2xl border border-white/10 bg-ink-900 p-5 space-y-4">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-400/20 text-gold-400 font-display text-2xl font-bold border border-gold-400/30">
                  {student.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display text-xl uppercase text-white">{student.name}</h3>
                  <p className="text-xs text-zinc-400">Código de Acesso: <span className="text-gold-400 font-bold">{student.code}</span></p>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-ink-800 p-3.5">
                  <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Status da Conta</span>
                  <span className="rounded-md bg-gold-400/20 px-2.5 py-1 text-[10px] font-bold uppercase text-gold-300 border border-gold-400/30">
                    Ativo
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-white/5 bg-ink-800 p-3.5">
                  <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">Planilhas Disponíveis</span>
                  <span className="text-sm font-bold text-white uppercase">{availableDays.join(', ')}</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
