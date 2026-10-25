import { supabase } from './services/supabase'

const STORAGE_KEY = 'dl_consultoria_v1'
const CONFIG_ID = 'global'
const SYNC_INTERVAL = 30000

export const ADMIN_PASSWORD = 'admin17249'
export const WHATSAPP_NUMBER = '5527996247906'

/*
|--------------------------------------------------------------------------
| UTILITÁRIOS
|--------------------------------------------------------------------------
*/

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function fingerprint(value) {
  return JSON.stringify(value)
}

function createDefaultExercises(list) {
  return list.map((item, index) => ({
    id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    ...item,
  }))
}

export function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function generateAccessCode() {
  return `DL${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export function generatePassword() {
  return Math.random().toString(36).slice(2, 8)
}

export function cloneWorkouts(source) {
  return clone(source || defaultData.workouts)
}

/*
|--------------------------------------------------------------------------
| TREINOS PADRÃO
|--------------------------------------------------------------------------
*/

const defaultData = {
  brand: {
    logo: '',
  },

  plan: {
    name: 'Plano Único',
    price: 200,
    description:
      'Consultoria individual de treino online com periodização, ajustes mensais e acompanhamento direto com Danilo Lopes.',
    includes: [
      'Planilhas personalizadas de A a E',
      'Ajustes conforme evolução',
      'Videos explicativos de cada movimento',
      'Suporte direto via WhatsApp',
    ],
  },

  students: [
    {
      id: 'demo-aluno',
      name: 'Aluno Demo',
      code: 'ALUNO01',
      password: 'treino123',
      active: true,
      updatedAt: null,
      evaluations: [],
    },
  ],

  workouts: {
    A: {
      title: 'Treino A - Peito e Triceps',
      focus: 'Empurrar / Superior',
      exercises: createDefaultExercises([
        {
          name: 'Supino reto com barra',
          sets: '4',
          reps: '8-10',
          notes: 'Controle a descida. Pause de 1s no peito.',
          video: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
          muscle: 'Peito',
        },
        {
          name: 'Supino inclinado com halteres',
          sets: '3',
          reps: '10-12',
          notes: 'Cotovelos a 45 graus. Amplitude completa.',
          video: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
          muscle: 'Peito',
        },
        {
          name: 'Crossover no cabo',
          sets: '3',
          reps: '12-15',
          notes: 'Aperte o peito no final do movimento.',
          video: 'https://www.youtube.com/watch?v=taNxNMFGJa4',
          muscle: 'Peito',
        },
        {
          name: 'Triceps testa',
          sets: '3',
          reps: '10-12',
          notes: 'Cotovelos fixos. Nao abrir demais.',
          video: 'https://www.youtube.com/watch?v=IrVOh1eiyA4',
          muscle: 'Triceps',
        },
        {
          name: 'Triceps corda',
          sets: '3',
          reps: '12-15',
          notes: 'Abra a corda no final da extensao.',
          video: 'https://www.youtube.com/watch?v=vB5OHsJ3EME',
          muscle: 'Triceps',
        },
      ]),
    },

    B: {
      title: 'Treino B - Costas e Biceps',
      focus: 'Puxar / Superior',
      exercises: createDefaultExercises([
        {
          name: 'Barra fixa ou puxada frontal',
          sets: '4',
          reps: '8-10',
          notes: 'Peito para fora. Puxe ate o queixo.',
          video: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
          muscle: 'Costas',
        },
        {
          name: 'Remada curvada',
          sets: '4',
          reps: '8-10',
          notes: 'Coluna neutra. Puxe para o umbigo.',
          video: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ',
          muscle: 'Costas',
        },
        {
          name: 'Remada baixa no cabo',
          sets: '3',
          reps: '10-12',
          notes: 'Escapulas juntas no final.',
          video: 'https://www.youtube.com/watch?v=GZbfZ033f74',
          muscle: 'Costas',
        },
        {
          name: 'Rosca direta',
          sets: '3',
          reps: '10-12',
          notes: 'Sem balanco. Cotovelos colados.',
          video: 'https://www.youtube.com/watch?v=ykJmrN5iC10',
          muscle: 'Biceps',
        },
        {
          name: 'Rosca martelo',
          sets: '3',
          reps: '12',
          notes: 'Punho neutro o tempo todo.',
          video: 'https://www.youtube.com/watch?v=zC3nLlEvin4',
          muscle: 'Biceps',
        },
      ]),
    },

    C: {
      title: 'Treino C - Pernas',
      focus: 'Inferiores',
      exercises: createDefaultExercises([
        {
          name: 'Agachamento livre',
          sets: '4',
          reps: '8-10',
          notes: 'Joelhos alinhados. Desca ate 90 graus.',
          video: 'https://www.youtube.com/watch?v=ultWZbVzH4Y',
          muscle: 'Quadriceps',
        },
        {
          name: 'Leg press 45',
          sets: '4',
          reps: '10-12',
          notes: 'Nao trave os joelhos no topo.',
          video: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
          muscle: 'Quadriceps',
        },
        {
          name: 'Cadeira extensora',
          sets: '3',
          reps: '12-15',
          notes: 'Pause de 1s no topo.',
          video: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
          muscle: 'Quadriceps',
        },
        {
          name: 'Mesa flexora',
          sets: '3',
          reps: '12-15',
          notes: 'Quadril colado no banco.',
          video: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
          muscle: 'Posterior',
        },
        {
          name: 'Panturrilha em pe',
          sets: '4',
          reps: '15-20',
          notes: 'Amplitude maxima. Alongue embaixo.',
          video: 'https://www.youtube.com/watch?v=-M4-G8p8fmc',
          muscle: 'Panturrilha',
        },
      ]),
    },

    D: {
      title: 'Treino D - Ombros e Core',
      focus: 'Deltoides / Abdome',
      exercises: createDefaultExercises([
        {
          name: 'Desenvolvimento com halteres',
          sets: '4',
          reps: '8-10',
          notes: 'Nao arqueie a lombar.',
          video: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
          muscle: 'Ombros',
        },
        {
          name: 'Elevacao lateral',
          sets: '3',
          reps: '12-15',
          notes: 'Mindinho para cima. Sem trapesio.',
          video: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
          muscle: 'Ombros',
        },
        {
          name: 'Elevacao frontal',
          sets: '3',
          reps: '12',
          notes: 'Ate a linha dos ombros.',
          video: 'https://www.youtube.com/watch?v=-t7fuZ0KhDA',
          muscle: 'Ombros',
        },
        {
          name: 'Face pull',
          sets: '3',
          reps: '15',
          notes: 'Puxe em direcao a face. Rotacao externa.',
          video: 'https://www.youtube.com/watch?v=rep-bN3h4FQ',
          muscle: 'Ombros',
        },
        {
          name: 'Prancha',
          sets: '3',
          reps: '40-60s',
          notes: 'Quadril alinhado. Respiracao constante.',
          video: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
          muscle: 'Abdomen',
        },
      ]),
    },

    E: {
      title: 'Treino E - Full Body / Condicionamento',
      focus: 'Forca geral',
      exercises: createDefaultExercises([
        {
          name: 'Levantamento terra rumeno',
          sets: '4',
          reps: '8-10',
          notes: 'Barra raspando as pernas. Quadril para tras.',
          video: 'https://www.youtube.com/watch?v=jEy_czb3RKA',
          muscle: 'Posterior',
        },
        {
          name: 'Afundo caminhando',
          sets: '3',
          reps: '10/lado',
          notes: 'Passo medio. Joelho nao ultrapassa o pe.',
          video: 'https://www.youtube.com/watch?v=D7KaRcUTQeE',
          muscle: 'Gluteos',
        },
        {
          name: 'Flexao de bracos',
          sets: '3',
          reps: 'max',
          notes: 'Corpo alinhado. Peito proximo ao chao.',
          video: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
          muscle: 'Peito',
        },
        {
          name: 'Remada unilateral',
          sets: '3',
          reps: '10/lado',
          notes: 'Nao gire o tronco.',
          video: 'https://www.youtube.com/watch?v=pYcpY20QaE8',
          muscle: 'Costas',
        },
        {
          name: 'Abdominal infra',
          sets: '3',
          reps: '12-15',
          notes: 'Lombar colada. Suba controlado.',
          video: 'https://www.youtube.com/watch?v=5ER5Of4M69I',
          muscle: 'Abdomen',
        },
      ]),
    },
  },
}

/*
|--------------------------------------------------------------------------
| BIBLIOTECA DE EXERCÍCIOS
|--------------------------------------------------------------------------
*/

function buildInitialLibrary() {
  const exercises = Object.values(defaultData.workouts).flatMap(
    (workout) => workout.exercises || []
  )

  const unique = []
  const names = new Set()

  for (const exercise of exercises) {
    const key = String(exercise.name || '').trim().toLowerCase()

    if (!key || names.has(key)) continue

    names.add(key)

    unique.push({
      ...clone(exercise),
      id: createId(),
    })
  }

  return unique
}

defaultData.exercisesLibrary = buildInitialLibrary()

/*
|--------------------------------------------------------------------------
| NORMALIZAÇÃO
|--------------------------------------------------------------------------
*/

function normalizeWorkout(workout, fallback = {}) {
  const source = workout || {}

  return {
    ...fallback,
    ...source,
    title: source.title ?? fallback.title ?? '',
    focus: source.focus ?? fallback.focus ?? '',
    exercises: Array.isArray(source.exercises)
      ? source.exercises
      : Array.isArray(fallback.exercises)
        ? clone(fallback.exercises)
        : [],
  }
}

function normalizeStudent(student, templateWorkouts) {
  const source = student || {}
  const sourceWorkouts = source.workouts || {}

  const workouts = {}

  for (const day of ['A', 'B', 'C', 'D', 'E']) {
    workouts[day] = normalizeWorkout(
      sourceWorkouts[day],
      templateWorkouts[day]
    )
  }

  for (const [day, workout] of Object.entries(sourceWorkouts)) {
    if (!workouts[day]) {
      workouts[day] = normalizeWorkout(workout)
    }
  }

  return {
    id: source.id || createId(),
    name: source.name || source.nome || 'Aluno',
    code: String(
      source.code || generateAccessCode()
    ).toUpperCase(),
    password: String(source.password || generatePassword()),
    active: source.active !== false,
    updatedAt: source.updatedAt || source.updated_at || null,
    workouts,
    evaluations: Array.isArray(source.evaluations)
      ? source.evaluations
      : [],
  }
}

/*
|--------------------------------------------------------------------------
| MESCLAGEM DOS DADOS
|--------------------------------------------------------------------------
*/

export function mergeData(parsed) {
  const source = parsed || {}

  const workouts = {
    ...clone(defaultData.workouts),
    ...(source.workouts || {}),
  }

  for (const day of ['A', 'B', 'C', 'D', 'E']) {
    workouts[day] = normalizeWorkout(
      source.workouts?.[day],
      defaultData.workouts[day]
    )
  }

  const studentsSource = Array.isArray(source.students)
    ? source.students
    : clone(defaultData.students)

  const exercisesLibrary = Array.isArray(source.exercisesLibrary)
    ? source.exercisesLibrary
    : clone(defaultData.exercisesLibrary)

  return {
    brand: {
      ...defaultData.brand,
      ...(source.brand || {}),
    },

    plan: {
      ...defaultData.plan,
      ...(source.plan || {}),
      includes: Array.isArray(source.plan?.includes)
        ? source.plan.includes
        : clone(defaultData.plan.includes),
    },

    students: studentsSource.map((student) =>
      normalizeStudent(student, workouts)
    ),

    workouts,

    exercisesLibrary,
  }
}

/*
|--------------------------------------------------------------------------
| LOCAL STORAGE
|--------------------------------------------------------------------------
*/

export function loadData() {
  try {
    if (typeof localStorage === 'undefined') {
      return clone(defaultData)
    }

    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return clone(defaultData)
    }

    return mergeData(JSON.parse(raw))
  } catch (error) {
    console.error('Erro ao carregar os dados locais:', error)
    return clone(defaultData)
  }
}

function saveLocalData(data) {
  try {
    if (typeof localStorage === 'undefined') return true

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch (error) {
    console.error('Erro ao salvar os dados localmente:', error)
    return false
  }
}

/*
|--------------------------------------------------------------------------
| CONVERSÃO PARA O SUPABASE
|--------------------------------------------------------------------------
*/

function studentToRow(student) {
  return {
    id: student.id,
    nome: student.name,
    code: student.code,
    password: student.password,
    active: student.active !== false,
    workouts: student.workouts || {},
    evaluations: Array.isArray(student.evaluations)
      ? student.evaluations
      : [],
  }
}

function rowToStudent(row, templateWorkouts) {
  return normalizeStudent(
    {
      id: row.id,
      name: row.nome || row.name || 'Aluno',
      code: row.code,
      password: row.password,
      active: row.active,
      workouts: row.workouts,
      evaluations: row.evaluations,
      updatedAt:
        row.updatedAt ||
        row.updated_at ||
        row.updated_at_client ||
        null,
    },
    templateWorkouts
  )
}

/*
|--------------------------------------------------------------------------
| CONTROLE DA SINCRONIZAÇÃO
|--------------------------------------------------------------------------
|
| pendingStudentWrites guarda as últimas versões locais que ainda precisam
| ser confirmadas no Supabase.
|
| pendingStudentDeletes impede que alunos excluídos reapareçam durante
| uma atualização automática.
|
*/

const persistedStudents = new Map()
const remoteStudentIds = new Set()
const pendingStudentWrites = new Map()
const pendingStudentDeletes = new Set()

let studentsBaselineReady = false

let persistedLibraryFingerprint = null
let libraryBaselineReady = false
let pendingLibrary = null

let saveQueue = Promise.resolve()
let saveInProgress = false

function getStudentFingerprint(student) {
  return fingerprint(studentToRow(student))
}

function getRowFingerprint(row) {
  return fingerprint({
    id: row.id,
    nome: row.nome,
    code: row.code,
    password: row.password,
    active: row.active !== false,
    workouts: row.workouts || {},
    evaluations: row.evaluations || [],
  })
}

function enqueueSave(operation) {
  saveQueue = saveQueue
    .catch((error) => {
      console.error('Erro anterior na fila de salvamento:', error)
    })
    .then(operation)

  return saveQueue
}

/*
|--------------------------------------------------------------------------
| BUSCAR DADOS REMOTOS
|--------------------------------------------------------------------------
*/

export async function fetchData() {
  const localData = loadData()

  try {
    const {
      data: alunosData,
      error: alunosError,
    } = await supabase
      .from('alunos')
      .select('*')

    if (alunosError) {
      throw alunosError
    }

    const rows = Array.isArray(alunosData) ? alunosData : []

    // Atualiza a fotografia remota sem descartar alterações pendentes.
    persistedStudents.clear()
    remoteStudentIds.clear()

    for (const row of rows) {
      if (!row?.id) continue

      remoteStudentIds.add(row.id)
      persistedStudents.set(row.id, getRowFingerprint(row))
    }

    studentsBaselineReady = true

    const remoteStudents = new Map()

    for (const row of rows) {
      if (!row?.id || pendingStudentDeletes.has(row.id)) continue

      remoteStudents.set(
        row.id,
        rowToStudent(row, localData.workouts)
      )
    }

    // Sobrepõe a versão local pendente à versão remota.
    for (const [studentId, pendingStudent] of pendingStudentWrites) {
      if (pendingStudentDeletes.has(studentId)) continue

      remoteStudents.set(
        studentId,
        normalizeStudent(pendingStudent, localData.workouts)
      )
    }

    // Mantém os alunos locais se o Supabase ainda estiver vazio.
    if (rows.length === 0 && remoteStudents.size === 0) {
      for (const student of localData.students) {
        if (pendingStudentDeletes.has(student.id)) continue

        remoteStudents.set(
          student.id,
          normalizeStudent(student, localData.workouts)
        )
      }
    }

    const {
      data: configData,
      error: configError,
    } = await supabase
      .from('config')
      .select('*')
      .eq('id', CONFIG_ID)
      .maybeSingle()

    let exercisesLibrary = localData.exercisesLibrary

    if (configError) {
      console.error('Erro ao buscar a biblioteca de exercícios:', configError)
    } else if (
      configData &&
      Array.isArray(configData.exercisesLibrary)
    ) {
      persistedLibraryFingerprint = fingerprint(
        configData.exercisesLibrary
      )

      libraryBaselineReady = true

      // Não substitui alterações que ainda aguardam gravação.
      exercisesLibrary = pendingLibrary
        ? clone(pendingLibrary)
        : configData.exercisesLibrary
    } else {
      // Se ainda não existe configuração remota, mantém a biblioteca local.
      if (!libraryBaselineReady && !pendingLibrary) {
        pendingLibrary = clone(localData.exercisesLibrary)
      }

      if (pendingLibrary) {
        exercisesLibrary = clone(pendingLibrary)
      }
    }

    return mergeData({
      ...localData,
      students: Array.from(remoteStudents.values()),
      exercisesLibrary,
    })
  } catch (error) {
    console.error('Erro ao buscar dados no Supabase:', error)

    // Uma falha de rede não deve apagar o estado local.
    return mergeData({
      ...localData,
      students: localData.students.filter(
        (student) => !pendingStudentDeletes.has(student.id)
      ),
      exercisesLibrary: pendingLibrary || localData.exercisesLibrary,
    })
  }
}

/*
|--------------------------------------------------------------------------
| SALVAR DADOS
|--------------------------------------------------------------------------
*/

export async function saveData(data) {
  let snapshot

  try {
    snapshot = clone(data)
  } catch (error) {
    console.error('Erro ao preparar os dados para salvar:', error)

    return {
      success: false,
      localSaved: false,
      error,
    }
  }

  const localSaved = saveLocalData(snapshot)

  // Registra as versões mais recentes imediatamente, antes de iniciar
  // a fila remota. Assim, a atualização automática pode preservá-las.
  if (Array.isArray(snapshot.students)) {
    const snapshotIds = new Set()

    for (const student of snapshot.students) {
      if (!student?.id) continue

      snapshotIds.add(student.id)

      if (pendingStudentDeletes.has(student.id)) {
        pendingStudentDeletes.delete(student.id)
      }

      pendingStudentWrites.set(
        student.id,
        normalizeStudent(student, snapshot.workouts || defaultData.workouts)
      )
    }

    // Detecta exclusões apenas de IDs conhecidos como existentes no remoto.
    for (const remoteId of remoteStudentIds) {
      if (!snapshotIds.has(remoteId)) {
        pendingStudentWrites.delete(remoteId)
        pendingStudentDeletes.add(remoteId)
      }
    }
  }

  if (Array.isArray(snapshot.exercisesLibrary)) {
    const nextLibraryFingerprint = fingerprint(snapshot.exercisesLibrary)

    if (
      !libraryBaselineReady ||
      nextLibraryFingerprint !== persistedLibraryFingerprint
    ) {
      pendingLibrary = clone(snapshot.exercisesLibrary)
    }
  }

  return enqueueSave(async () => {
    saveInProgress = true

    let remoteSuccess = true
    const errors = []

    try {
      /*
       * EXCLUSÕES
       *
       * Exclui apenas IDs previamente conhecidos no banco.
       * Se a exclusão falhar, o ID permanece pendente para nova tentativa.
       */
      for (const studentId of Array.from(pendingStudentDeletes)) {
        const { error } = await supabase
          .from('alunos')
          .delete()
          .eq('id', studentId)

        if (error) {
          remoteSuccess = false
          errors.push(error)
          console.error(`Erro ao excluir o aluno ${studentId}:`, error)
          continue
        }

        pendingStudentDeletes.delete(studentId)
        pendingStudentWrites.delete(studentId)
        persistedStudents.delete(studentId)
        remoteStudentIds.delete(studentId)
      }

      /*
       * ALUNOS
       *
       * A fila consulta o estado pendente mais recente de cada aluno,
       * evitando salvar uma cópia antiga quando houve edição durante a fila.
       */
      for (const [studentId, student] of Array.from(
        pendingStudentWrites.entries()
      )) {
        if (pendingStudentDeletes.has(studentId)) continue

        const row = studentToRow(student)
        const currentFingerprint = fingerprint(row)
        const previousFingerprint = persistedStudents.get(studentId)

        if (
          studentsBaselineReady &&
          previousFingerprint === currentFingerprint
        ) {
          const latestPending = pendingStudentWrites.get(studentId)

          if (
            latestPending &&
            getStudentFingerprint(latestPending) === currentFingerprint
          ) {
            pendingStudentWrites.delete(studentId)
          }

          continue
        }

        const { error } = await supabase
          .from('alunos')
          .upsert(row, { onConflict: 'id' })

        if (error) {
          remoteSuccess = false
          errors.push(error)
          console.error(`Erro ao salvar o aluno ${student.name}:`, error)
          continue
        }

        persistedStudents.set(studentId, currentFingerprint)
        remoteStudentIds.add(studentId)
        studentsBaselineReady = true

        const latestPending = pendingStudentWrites.get(studentId)

        // Só remove a pendência se ninguém tiver editado o aluno novamente.
        if (
          latestPending &&
          getStudentFingerprint(latestPending) === currentFingerprint
        ) {
          pendingStudentWrites.delete(studentId)
        }
      }

      /*
       * BIBLIOTECA DE EXERCÍCIOS
       */
      if (pendingLibrary) {
        const librarySnapshot = clone(pendingLibrary)
        const librarySnapshotFingerprint = fingerprint(librarySnapshot)

        if (
          !libraryBaselineReady ||
          librarySnapshotFingerprint !== persistedLibraryFingerprint
        ) {
          const { error } = await supabase
            .from('config')
            .upsert(
              {
                id: CONFIG_ID,
                exercisesLibrary: librarySnapshot,
              },
              { onConflict: 'id' }
            )

          if (error) {
            remoteSuccess = false
            errors.push(error)
            console.error(
              'Erro ao salvar a biblioteca de exercícios:',
              error
            )
          } else {
            persistedLibraryFingerprint = librarySnapshotFingerprint
            libraryBaselineReady = true

            // Não apaga uma alteração mais recente feita durante o salvamento.
            if (
              pendingLibrary &&
              fingerprint(pendingLibrary) === librarySnapshotFingerprint
            ) {
              pendingLibrary = null
            }
          }
        } else {
          pendingLibrary = null
        }
      }

      return {
        success: localSaved && remoteSuccess,
        localSaved,
        remoteSaved: remoteSuccess,
        pending:
          pendingStudentWrites.size > 0 ||
          pendingStudentDeletes.size > 0 ||
          pendingLibrary !== null,
        errors,
      }
    } catch (error) {
      console.error('Erro inesperado durante o salvamento:', error)

      return {
        success: false,
        localSaved,
        remoteSaved: false,
        pending: true,
        errors: [...errors, error],
      }
    } finally {
      saveInProgress = false
    }
  })
}

/*
|--------------------------------------------------------------------------
| FUNÇÕES DA BIBLIOTECA DE EXERCÍCIOS
|--------------------------------------------------------------------------
*/

export function createLibraryExercise(exercise) {
  return {
    id: createId(),
    name: exercise?.name || 'Novo exercício',
    muscle: exercise?.muscle || '',
    sets: exercise?.sets || '3',
    reps: exercise?.reps || '10-12',
    notes: exercise?.notes || '',
    video: exercise?.video || '',
    group: exercise?.group || '',
  }
}

export function addExerciseToLibrary(data, exercise) {
  const next = clone(data)

  if (!Array.isArray(next.exercisesLibrary)) {
    next.exercisesLibrary = []
  }

  next.exercisesLibrary.push(createLibraryExercise(exercise))

  return next
}

export function updateLibraryExercise(data, exerciseId, changes) {
  const next = clone(data)

  next.exercisesLibrary = (next.exercisesLibrary || []).map((exercise) =>
    exercise.id === exerciseId
      ? {
          ...exercise,
          ...changes,
        }
      : exercise
  )

  return next
}

export function removeLibraryExercise(data, exerciseId) {
  const next = clone(data)

  next.exercisesLibrary = (next.exercisesLibrary || []).filter(
    (exercise) => exercise.id !== exerciseId
  )

  return next
}

export const removeExerciseFromLibrary = removeLibraryExercise

/*
|--------------------------------------------------------------------------
| ADICIONAR EXERCÍCIO DA BIBLIOTECA AO TREINO DO ALUNO
|--------------------------------------------------------------------------
*/

export function addLibraryExerciseToWorkout(
  data,
  studentId,
  day,
  exerciseId
) {
  const next = clone(data)

  const student = (next.students || []).find(
    (item) => item.id === studentId
  )

  if (!student) return next

  const libraryExercise = (next.exercisesLibrary || []).find(
    (item) => item.id === exerciseId
  )

  if (!libraryExercise) return next

  if (!student.workouts) {
    student.workouts = clone(next.workouts || defaultData.workouts)
  }

  if (!student.workouts[day]) {
    student.workouts[day] = {
      title: `Treino ${day}`,
      focus: '',
      exercises: [],
    }
  }

  if (!Array.isArray(student.workouts[day].exercises)) {
    student.workouts[day].exercises = []
  }

  student.workouts[day].exercises.push({
    ...clone(libraryExercise),
    id: createId(),
  })

  student.updatedAt = new Date().toISOString()

  return next
}

/*
|--------------------------------------------------------------------------
| LOGOMARCA
|--------------------------------------------------------------------------
|
| Mantém o comportamento anterior: a logo é armazenada como data URL
| no armazenamento local. Não depende de uma tabela ou bucket novo.
|
*/

export async function uploadLogo(dataUrl) {
  return {
    logo: dataUrl,
  }
}

export function logoSrc(path) {
  if (!path) return ''

  if (
    typeof path === 'string' &&
    (path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('data:'))
  ) {
    return path
  }

  return path
}

/*
|--------------------------------------------------------------------------
| ATUALIZAÇÃO AUTOMÁTICA
|--------------------------------------------------------------------------
*/

export function subscribeData(onChange) {
  let closed = false
  let inFlight = false

  const tick = async () => {
    if (closed || inFlight) return

    if (
      typeof document !== 'undefined' &&
      document.hidden
    ) {
      return
    }

    inFlight = true

    try {
      const data = await fetchData()

      if (!closed && typeof onChange === 'function') {
        onChange(data)
      }
    } catch (error) {
      console.error('Erro ao atualizar os dados:', error)
    } finally {
      inFlight = false
    }
  }

  void tick()

  const interval =
    typeof setInterval === 'function'
      ? setInterval(() => {
          void tick()
        }, SYNC_INTERVAL)
      : null

  const handleVisibilityChange = () => {
    if (
      typeof document !== 'undefined' &&
      !document.hidden
    ) {
      void tick()
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    )
  }

  return () => {
    closed = true

    if (interval !== null) {
      clearInterval(interval)
    }

    if (typeof document !== 'undefined') {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      )
    }
  }
}

/*
|--------------------------------------------------------------------------
| FORMATAÇÃO E WHATSAPP
|--------------------------------------------------------------------------
*/

export function formatBRL(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function whatsappLink(plan) {
  const safePlan = plan || defaultData.plan

  const message =
    `Ola Danilo! Quero garantir minha vaga na consultoria de treino online ` +
    `(${safePlan.name} - ${formatBRL(safePlan.price)}).`

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
