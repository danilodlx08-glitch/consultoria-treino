const STORAGE_KEY = 'dl_consultoria_v1'

export const ADMIN_PASSWORD = 'admin17249'
export const WHATSAPP_NUMBER = '5527996247906'

import { supabase } from './services/supabase'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

const defaultExercises = (list) =>
  list.map((item, index) => ({
    id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    ...item,
  }))

export function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function cloneWorkouts(source) {
  return clone(source || defaultData.workouts)
}

export function generateAccessCode() {
  const token = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `DL${token}`
}

export function generatePassword() {
  return Math.random().toString(36).slice(2, 8)
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
    name: 'Plano Unico',
    price: 200,
    description:
      'Consultoria individual de treino online com periodizacao, ajustes semanais e acompanhamento direto com Danilo Lopes.',
    includes: [
      'Planilha personalizada de A a E',
      'Ajustes conforme evolucao',
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
    },
  ],

  workouts: {
    A: {
      title: 'Treino A - Peito e Triceps',
      focus: 'Empurrar / Superior',
      exercises: defaultExercises([
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
      exercises: defaultExercises([
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
      exercises: defaultExercises([
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
      exercises: defaultExercises([
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
      exercises: defaultExercises([
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
|
| A biblioteca é criada automaticamente a partir dos exercícios
| existentes nos treinos padrão.
|
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
| NORMALIZAÇÃO DOS ALUNOS
|--------------------------------------------------------------------------
*/

function normalizeStudent(student, templateWorkouts) {
  const workouts = student?.workouts
    ? {
        ...clone(templateWorkouts),
        ...clone(student.workouts),
      }
    : clone(templateWorkouts)

  return {
    id: student?.id || createId(),
    name: student?.name || 'Aluno',
    code: String(
      student?.code || generateAccessCode()
    ).toUpperCase(),
    password: student?.password || generatePassword(),
    active: student?.active !== false,
    updatedAt: student?.updatedAt || null,
    workouts,
  }
}

/*
|--------------------------------------------------------------------------
| MERGE DOS DADOS
|--------------------------------------------------------------------------
*/

export function mergeData(parsed) {
  const workouts = {
    ...clone(defaultData.workouts),
    ...(parsed?.workouts || {}),
  }

  const studentsSource = Array.isArray(parsed?.students)
    ? parsed.students
    : clone(defaultData.students)

  const exercisesLibrary = Array.isArray(parsed?.exercisesLibrary)
    ? parsed.exercisesLibrary
    : clone(defaultData.exercisesLibrary)

  return {
    brand: {
      ...defaultData.brand,
      ...(parsed?.brand || {}),
    },

    plan: {
      ...defaultData.plan,
      ...(parsed?.plan || {}),
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
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return clone(defaultData)
    }

    return mergeData(JSON.parse(raw))
  } catch {
    return clone(defaultData)
  }
}

/*
|--------------------------------------------------------------------------
| SUPABASE
|--------------------------------------------------------------------------
*/

export async function fetchData() {
  try {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')

    if (!error && data && data.length > 0) {
      const current = loadData()

      current.students = data.map((aluno) => ({
        id: aluno.id,
        name: aluno.nome,
        code: aluno.code || generateAccessCode(),
        password: aluno.password || generatePassword(),
        active: aluno.active !== false,

        workouts: aluno.workouts
          ? {
              ...clone(current.workouts),
              ...aluno.workouts,
            }
          : clone(current.workouts),
      }))

      return current
    }
  } catch {
    // fallback para localStorage
  }

  return loadData()
}

/*
|--------------------------------------------------------------------------
| SALVAR
|--------------------------------------------------------------------------
*/

export async function saveData(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  )

  try {
    if (data && Array.isArray(data.students)) {
      for (const aluno of data.students) {
        await supabase.from('alunos').upsert({
          id: aluno.id,
          nome: aluno.name,
          code: aluno.code,
          password: aluno.password,
          active: aluno.active !== false,
          workouts: aluno.workouts,
        })
      }
    }
  } catch {
    // mantém cópia local se Supabase falhar
  }
}

/*
|--------------------------------------------------------------------------
| FUNÇÕES DA BIBLIOTECA
|--------------------------------------------------------------------------
*/

export function createLibraryExercise(exercise) {
  return {
    id: createId(),
    name: exercise.name || 'Novo exercício',
    muscle: exercise.muscle || '',
    sets: exercise.sets || '3',
    reps: exercise.reps || '10-12',
    notes: exercise.notes || '',
    video: exercise.video || '',
  }
}

export function addExerciseToLibrary(data, exercise) {
  const next = clone(data)

  if (!Array.isArray(next.exercisesLibrary)) {
    next.exercisesLibrary = []
  }

  const newExercise = createLibraryExercise(exercise)

  next.exercisesLibrary.push(newExercise)

  return next
}

export function updateLibraryExercise(data, exerciseId, changes) {
  const next = clone(data)

  next.exercisesLibrary = (
    next.exercisesLibrary || []
  ).map((exercise) =>
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

  next.exercisesLibrary = (
    next.exercisesLibrary || []
  ).filter((exercise) => exercise.id !== exerciseId)

  return next
}

/*
|--------------------------------------------------------------------------
| ADICIONAR EXERCÍCIO DA BIBLIOTECA AO ALUNO
|--------------------------------------------------------------------------
|
| IMPORTANTE:
| É criada uma cópia do exercício.
| Alterar o exercício do aluno NÃO altera a biblioteca.
|
*/

export function addLibraryExerciseToWorkout(
  data,
  studentId,
  day,
  exerciseId
) {
  const next = clone(data)

  const student = next.students.find(
    (item) => item.id === studentId
  )

  if (!student) return next

  const libraryExercise = (
    next.exercisesLibrary || []
  ).find((item) => item.id === exerciseId)

  if (!libraryExercise) return next

  if (!student.workouts) {
    student.workouts = clone(next.workouts)
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

  const copiedExercise = {
    ...clone(libraryExercise),
    id: createId(),
  }

  student.workouts[day].exercises.push(copiedExercise)

  student.updatedAt = new Date().toISOString()

  return next
}

/*
|--------------------------------------------------------------------------
| OUTRAS FUNÇÕES
|--------------------------------------------------------------------------
*/

export async function uploadLogo(dataUrl) {
  return {
    logo: dataUrl,
  }
}

export function logoSrc(path) {
  if (!path) return ''

  if (
    path.startsWith('http') ||
    path.startsWith('data:')
  ) {
    return path
  }

  return path
}

export function subscribeData(onChange) {
  let closed = false

  const tick = async () => {
    if (closed) return

    const data = await fetchData()

    onChange(data)
  }

  const interval = setInterval(tick, 3000)

  tick()

  return () => {
    closed = true
    clearInterval(interval)
  }
}

export function formatBRL(value) {
  return Number(value || 0).toLocaleString(
    'pt-BR',
    {
      style: 'currency',
      currency: 'BRL',
    }
  )
}

export function whatsappLink(plan) {
  const message =
    `Ola Danilo! Quero garantir minha vaga na consultoria de treino online ` +
    `(${plan.name} - ${formatBRL(plan.price)}).`

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
