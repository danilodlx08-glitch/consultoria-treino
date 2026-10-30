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
          video: 'https://youtube.com/shorts/S7P7TbZs4vo?si=vbhshFmpd88DC0Xg',
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
          video: 'https://youtube.com/shorts/iRXkEuu5G5Y?si=pxtZ6CBlBaSEeCTD',
          muscle: 'Peito',
        },
        {
          name: 'Triceps testa',
          sets: '3',
          reps: '10-12',
          notes: 'Cotovelos fixos. Nao abrir demais.',
          video: 'https://youtube.com/shorts/m4GA95QkoZA?si=dpmaB6ue-7fCJD3t',
          muscle: 'Triceps',
        },
        {
          name: 'Triceps corda',
          sets: '3',
          reps: '12-15',
          notes: 'Abra a corda no final da extensao.',
          video: 'https://youtube.com/shorts/TSnCG5GJYXo?si=69J19-l_WzJha4Ts',
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
          video: 'https://youtube.com/shorts/d0K1P8SZGeI?si=pURhPdLfeC9x578o',
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
          video: 'https://youtube.com/shorts/gPIULo6iOck?si=IhMcUxQ2LRBhnicv',
          muscle: 'Costas',
        },
        {
          name: 'Rosca direta',
          sets: '3',
          reps: '10-12',
          notes: 'Sem balanco. Cotovelos colados.',
          video: 'https://youtube.com/shorts/-fxBy87Yyps?si=qadpMjtbf2GFy_Fu',
          muscle: 'Biceps',
        },
        {
          name: 'Rosca martelo',
          sets: '3',
          reps: '12',
          notes: 'Punho neutro o tempo todo.',
          video: 'https://youtube.com/shorts/NoPnz8h9HL8?si=C7l6y5n7j2OHHHHJ',
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
          video: 'https://youtube.com/shorts/Sh7B_-1-ncc?si=ljiHSJ-nWcq4_QdS',
          muscle: 'Quadriceps',
        },
        {
          name: 'Leg press 45',
          sets: '4',
          reps: '10-12',
          notes: 'Nao trave os joelhos no topo.',
          video: 'https://youtube.com/shorts/V5jpx0mntn4?si=_eZprK_QoZ73Rmz-',
          muscle: 'Quadriceps',
        },
        {
          name: 'Cadeira extensora',
          sets: '3',
          reps: '12-15',
          notes: 'Pause de 1s no topo.',
          video: 'https://youtube.com/shorts/YGW_oBWnWnc?si=_qnBbW4GjZz5C2by',
          muscle: 'Quadriceps',
        },
        {
          name: 'Mesa flexora',
          sets: '3',
          reps: '12-15',
          notes: 'Quadril colado no banco.',
          video: 'https://youtube.com/shorts/vsMMMXU-VrQ?si=XdIlcXIZ7k_UgSx5',
          muscle: 'Posterior',
        },
        {
          name: 'Panturrilha em pe',
          sets: '4',
          reps: '15-20',
          notes: 'Amplitude maxima. Alongue embaixo.',
          video: 'https://youtube.com/shorts/tMA4WagIxY4?si=Eqkk7UhsJFlTcvun',
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
          video: 'https://youtube.com/shorts/tgOvSxhCNDg?si=7a9REO_FeZFhYIOh',
          muscle: 'Ombros',
        },
        {
          name: 'Elevacao lateral',
          sets: '3',
          reps: '12-15',
          notes: 'Mindinho para cima. Sem trapesio.',
          video: 'https://youtube.com/shorts/eZKQqPTDfSM?si=sLzhM4jKJy6MIVQ7',
          muscle: 'Ombros',
        },
        {
          name: 'Elevacao frontal',
          sets: '3',
          reps: '12',
          notes: 'Ate a linha dos ombros.',
          video: 'https://youtube.com/shorts/aTzdEisR8lc?si=J2Faaamz_yCjOOBA',
          muscle: 'Ombros',
        },
        {
          name: 'Face pull',
          sets: '3',
          reps: '15',
          notes: 'Puxe em direcao a face. Rotacao externa.',
          video: 'https://youtube.com/shorts/JBVQCXHSjc8?si=v7auuljk8QLj_YDR',
          muscle: 'Ombros',
        },
        {
          name: 'Prancha',
          sets: '3',
          reps: '40-60s',
          notes: 'Quadril alinhado. Respiracao constante.',
          video: 'https://youtube.com/shorts/Abz8TaeGe6o?si=QxftcAkkH2L_SJFZ',
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

  // Mapeia os vídeos do fallback (template padrão) pelo nome exato do exercício
  const fallbackVideosMap = new Map()
  if (Array.isArray(fallback.exercises)) {
    fallback.exercises.forEach((ex) => {
      if (ex && ex.name && ex.video) {
        const cleanName = String(ex.name).trim().toLowerCase()
        fallbackVideosMap.set(cleanName, ex.video)
      }
    })
  }

  const exercises = Array.isArray(source.exercises) && source.exercises.length > 0
    ? source.exercises.map((ex) => {
        const cleanName = String(ex.name || '').trim().toLowerCase()
        const updatedVideo = fallbackVideosMap.get(cleanName)
        return {
          ...ex,
          // Atualiza apenas o vídeo se encontrar o mesmo exercício pelo nome no template padrão
          video: updatedVideo || ex.video,
        }
      })
    : Array.isArray(fallback.exercises)
      ? clone(fallback.exercises)
      : []

  return {
    ...fallback,
    ...source,
    title: source.title ?? fallback.title ?? '',
    focus: source.focus ?? fallback.focus ?? '',
    exercises,
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

    localStorage.setItem(STORAGE_KEY, JSON.stringify
