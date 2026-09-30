Const STORAGE_KEY = 'dl_consultoria_v1'

export const ADMIN_PASSWORD = 'admin17249'
export const WHATSAPP_NUMBER = '5527996247906'

import { supabase } from './services/supabase'

function clone(value) {
  Return JSON.parse(JSON.stringify(value))
}

Const defaultExercises = (list) =>
  List.map((item, index) => ({
    Id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    ...item,
  }))

export function createId() {
  Return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function cloneWorkouts(source) {
  Return clone(source || defaultData.workouts)
}

export function generateAccessCode() {
  Const token = Math.random().toString(36).slice(2, 6).toUpperCase()
  Return `DL${token}`
}

export function generatePassword() {
  Return Math.random().toString(36).slice(2, 8)
}

/*
|--------------------------------------------------------------------------
| TREINOS PADRÃO
|--------------------------------------------------------------------------
*/

Const defaultData = {
  Brand: {
    Logo: '',
  },

  Plan: {
    Name: 'Plano Único',
    Price: 200,
    Description:
      'Consultoria individual de treino online com periodização, ajustes mensais e acompanhamento direto com Danilo Lopes.',
    Includes: [
      'Planilhas personalizadas de A a E',
      'Ajustes conforme evolução',
      'Videos explicativos de cada movimento',
      'Suporte direto via WhatsApp',
    ],
  },

  Students: [
    {
      Id: 'demo-aluno',
      Name: 'Aluno Demo',
      Code: 'ALUNO01',
      Password: 'treino123',
      Active: true,
      Evaluations: [],
    },
  ],

  Workouts: {
    A: {
      Title: 'Treino A - Peito e Triceps',
      Focus: 'Empurrar / Superior',
      Exercises: defaultExercises([
        {
          Name: 'Supino reto com barra',
          Sets: '4',
          Reps: '8-10',
          Notes: 'Controle a descida. Pause de 1s no peito.',
          Video: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
          Muscle: 'Peito',
        },
        {
          Name: 'Supino inclinado com halteres',
          Sets: '3',
          Reps: '10-12',
          Notes: 'Cotovelos a 45 graus. Amplitude completa.',
          Video: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
          Muscle: 'Peito',
        },
        {
          Name: 'Crossover no cabo',
          Sets: '3',
          Reps: '12-15',
          Notes: 'Aperte o peito no final do movimento.',
          Video: 'https://www.youtube.com/watch?v=taNxNMFGJa4',
          Muscle: 'Peito',
        },
        {
          Name: 'Triceps testa',
          Sets: '3',
          Reps: '10-12',
          Notes: 'Cotovelos fixos. Nao abrir demais.',
          Video: 'https://www.youtube.com/watch?v=IrVOh1eiyA4',
          Muscle: 'Triceps',
        },
        {
          Name: 'Triceps corda',
          Sets: '3',
          Reps: '12-15',
          Notes: 'Abra a corda no final da extensao.',
          Video: 'https://www.youtube.com/watch?v=vB5OHsJ3EME',
          Muscle: 'Triceps',
        },
      ]),
    },

    B: {
      Title: 'Treino B - Costas e Biceps',
      Focus: 'Puxar / Superior',
      Exercises: defaultExercises([
        {
          Name: 'Barra fixa ou puxada frontal',
          Sets: '4',
          Reps: '8-10',
          Notes: 'Peito para fora. Puxe ate o queixo.',
          Video: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
          Muscle: 'Costas',
        },
        {
          Name: 'Remada curvada',
          Sets: '4',
          Reps: '8-10',
          Notes: 'Coluna neutra. Puxe para o umbigo.',
          Video: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ',
          Muscle: 'Costas',
        },
        {
          Name: 'Remada baixa no cabo',
          Sets: '3',
          Reps: '10-12',
          Notes: 'Escapulas juntas no final.',
          Video: 'https://www.youtube.com/watch?v=GZbfZ033f74',
          Muscle: 'Costas',
        },
        {
          Name: 'Rosca direta',
          Sets: '3',
          Reps: '10-12',
          Notes: 'Sem balanco. Cotovelos colados.',
          Video: 'https://www.youtube.com/watch?v=ykJmrN5iC10',
          Muscle: 'Biceps',
        },
        {
          Name: 'Rosca martelo',
          Sets: '3',
          Reps: '12',
          Notes: 'Punho neutro o tempo todo.',
          Video: 'https://www.youtube.com/watch?v=zC3nLlEvin4',
          Muscle: 'Biceps',
        },
      ]),
    },

    C: {
      Title: 'Treino C - Pernas',
      Focus: 'Inferiores',
      Exercises: defaultExercises([
        {
          Name: 'Agachamento livre',
          Sets: '4',
          Reps: '8-10',
          Notes: 'Joelhos alinhados. Desca ate 90 graus.',
          Video: 'https://www.youtube.com/watch?v=ultWZbVzH4Y',
          Muscle: 'Quadriceps',
        },
        {
          Name: 'Leg press 45',
          Sets: '4',
          Reps: '10-12',
          Notes: 'Nao trave os joelhos no topo.',
          Video: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
          Muscle: 'Quadriceps',
        },
        {
          Name: 'Cadeira extensora',
          Sets: '3',
          Reps: '12-15',
          Notes: 'Pause de 1s no topo.',
          Video: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
          Muscle: 'Quadriceps',
        },
        {
          Name: 'Mesa flexora',
          Sets: '3',
          Reps: '12-15',
          Notes: 'Quadril colado no banco.',
          Video: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
          Muscle: 'Posterior',
        },
        {
          Name: 'Panturrilha em pe',
          Sets: '4',
          Reps: '15-20',
          Notes: 'Amplitude maxima. Alongue embaixo.',
          Video: 'https://www.youtube.com/watch?v=-M4-G8p8fmc',
          Muscle: 'Panturrilha',
        },
      ]),
    },

    D: {
      Title: 'Treino D - Ombros e Core',
      Focus: 'Deltoides / Abdome',
      Exercises: defaultExercises([
        {
          Name: 'Desenvolvimento com halteres',
          Sets: '4',
          Reps: '8-10',
          Notes: 'Nao arqueie a lombar.',
          Video: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
          Muscle: 'Ombros',
        },
        {
          Name: 'Elevacao lateral',
          Sets: '3',
          Reps: '12-15',
          Notes: 'Mindinho para cima. Sem trapesio.',
          Video: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
          Muscle: 'Ombros',
        },
        {
          Name: 'Elevacao frontal',
          Sets: '3',
          Reps: '12',
          Notes: 'Ate a linha dos ombros.',
          Video: 'https://www.youtube.com/watch?v=-t7fuZ0KhDA',
          Muscle: 'Ombros',
        },
        {
          Name: 'Face pull',
          Sets: '3',
          Reps: '15',
          Notes: 'Puxe em direcao a face. Rotacao externa.',
          Video: 'https://www.youtube.com/watch?v=rep-bN3h4FQ',
          Muscle: 'Ombros',
        },
        {
          Name: 'Prancha',
          Sets: '3',
          Reps: '40-60s',
          Notes: 'Quadril alinhado. Respiracao constante.',
          Video: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
          Muscle: 'Abdomen',
        },
      ]),
    },

    E: {
      Title: 'Treino E - Full Body / Condicionamento',
      Focus: 'Forca geral',
      Exercises: defaultExercises([
        {
          Name: 'Levantamento terra rumeno',
          Sets: '4',
          Reps: '8-10',
          Notes: 'Barra raspando as pernas. Quadril para tras.',
          Video: 'https://www.youtube.com/watch?v=jEy_czb3RKA',
          Muscle: 'Posterior',
        },
        {
          Name: 'Afundo caminhando',
          Sets: '3',
          Reps: '10/lado',
          Notes: 'Passo medio. Joelho nao ultrapassa o pe.',
          Video: 'https://www.youtube.com/watch?v=D7KaRcUTQeE',
          Muscle: 'Gluteos',
        },
        {
          Name: 'Flexao de bracos',
          Sets: '3',
          Reps: 'max',
          Notes: 'Corpo alinhado. Peito proximo ao chao.',
          Video: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
          Muscle: 'Peito',
        },
        {
          Name: 'Remada unilateral',
          Sets: '3',
          Reps: '10/lado',
          Notes: 'Nao gire o tronco.',
          Video: 'https://www.youtube.com/watch?v=pYcpY20QaE8',
          Muscle: 'Costas',
        },
        {
          Name: 'Abdominal infra',
          Sets: '3',
          Reps: '12-15',
          Notes: 'Lombar colada. Suba controlado.',
          Video: 'https://www.youtube.com/watch?v=5ER5Of4M69I',
          Muscle: 'Abdomen',
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

Function buildInitialLibrary() {
  Const exercises = Object.values(defaultData.workouts).flatMap(
    (workout) => workout.exercises || []
  )

  Const unique = []
  Const names = new Set()

  For (const exercise of exercises) {
    Const key = String(exercise.name || '').trim().toLowerCase()

    If (!key || names.has(key)) continue

    Names.add(key)

    Unique.push({
      ...clone(exercise),
      Id: createId(),
    })
  }

  Return unique
}

DefaultData.exercisesLibrary = buildInitialLibrary()

/*
|--------------------------------------------------------------------------
| NORMALIZAÇÃO DOS ALUNOS
|--------------------------------------------------------------------------
*/

Function normalizeStudent(student, templateWorkouts) {
  Const workouts = student?.workouts
    ? {
        ...clone(templateWorkouts),
        ...clone(student.workouts),
      }
    : clone(templateWorkouts)

  Return {
    Id: student?.id || createId(),
    Name: student?.name || 'Aluno',
    Code: String(
      Student?.code || generateAccessCode()
    ).toUpperCase(),
    Password: student?.password || generatePassword(),
    Active: student?.active !== false,
    UpdatedAt: student?.updatedAt || null,
    Workouts,
    Evaluations: Array.isArray(student?.evaluations) ? student.evaluations : [],
  }
}

/*
|--------------------------------------------------------------------------
| MERGE DOS DADOS
|--------------------------------------------------------------------------
*/

export function mergeData(parsed) {
  Const workouts = {
    ...clone(defaultData.workouts),
    ...(parsed?.workouts || {}),
  }

  Const studentsSource = Array.isArray(parsed?.students)
    ? Parsed.students
    : clone(defaultData.students)

  Const exercisesLibrary = Array.isArray(parsed?.exercisesLibrary)
    ? Parsed.exercisesLibrary
    : clone(defaultData.exercisesLibrary)

  Return {
    Brand: {
      ...defaultData.brand,
      ...(parsed?.brand || {}),
    },

    Plan: {
      ...defaultData.plan,
      ...(parsed?.plan || {}),
    },

    Students: studentsSource.map((student) =>
      NormalizeStudent(student, workouts)
    ),

    Workouts,

    ExercisesLibrary,
  }
}

/*
|--------------------------------------------------------------------------
| LOCAL STORAGE
|--------------------------------------------------------------------------
*/

export function loadData() {
  Try {
    Const raw = localStorage.getItem(STORAGE_KEY)

    If (!raw) {
      Return clone(defaultData)
    }

    Return mergeData(JSON.parse(raw))
  } catch {
    Return clone(defaultData)
  }
}

/*
|--------------------------------------------------------------------------
| SUPABASE
|--------------------------------------------------------------------------
*/

export async function fetchData() {
  Try {
    Const current = loadData()

    // 1. Busca os alunos
    Const { data: alunosData, error: alunosError } = await supabase
      .from('alunos')
      .select('*')

    If (!alunosError && alunosData && alunosData.length > 0) {
      Current.students = alunosData.map((aluno) => ({
        Id: aluno.id,
        Name: aluno.nome,
        Code: aluno.code || generateAccessCode(),
        Password: aluno.password || generatePassword(),
        Active: aluno.active !== false,
        Evaluations: Array.isArray(aluno.evaluations) ? aluno.evaluations : [], // <--- Garante leitura das avaliações do Supabase
        Workouts: aluno.workouts
          ? {
              ...clone(current.workouts),
              ...aluno.workouts,
            }
          : clone(current.workouts),
      }))
    }

    // 2. Busca a biblioteca de exercícios na tabela 'config' do Supabase
    Const { data: configData, error: configError } = await supabase
      .from('config')
      .select('*')
      .eq('id', 'global')
      .single()

    If (!configError && configData && configData.exercisesLibrary) {
      Current.exercisesLibrary = configData.exercisesLibrary
    }

    Return current
  } catch {
    // fallback para localStorage caso falhe
  }

  Return loadData()
}

/*
|--------------------------------------------------------------------------
| SALVAR
|--------------------------------------------------------------------------
*/

export async function saveData(data) {
  LocalStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  )

  Try {
    If (data && Array.isArray(data.students)) {
      For (const aluno of data.students) {
        Wait supabase.from('alunos').upsert({
          Id: aluno.id,
          Nome: aluno.name,
          Code: aluno.code,
          Password: aluno.password,
          Active: aluno.active !== false,
          Workouts: aluno.workouts,
          Evaluations: aluno.evaluations || [], // <--- Garante gravação das avaliações no Supabase
        })
      }
    }

    // Salva também a biblioteca de exercícios na tabela 'config' do Supabase
    If (data && Array.isArray(data.exercisesLibrary)) {
      Wait supabase.from('config').upsert({
        Id: 'global',
        ExercisesLibrary: data.exercisesLibrary,
      })
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
  Return {
    Id: createId(),
    Name: exercise.name || 'Novo exercício',
    Muscle: exercise.muscle || '',
    Sets: exercise.sets || '3',
    Reps: exercise.reps || '10-12',
    Notes: exercise.notes || '',
    Video: exercise.video || '',
    Group: exercise.group || '',
  }
}

export function addExerciseToLibrary(data, exercise) {
  Const next = clone(data)

  If (!Array.isArray(next.exercisesLibrary)) {
    Next.exercisesLibrary = []
  }

  Const newExercise = createLibraryExercise(exercise)

  Next.exercisesLibrary.push(newExercise)

  Return next
}

export function updateLibraryExercise(data, exerciseId, changes) {
  Const next = clone(data)

  Next.exercisesLibrary = (
    Next.exercisesLibrary || []
  ).map((exercise) =>
    Exercise.id === exerciseId
      ? {
          ...exercise,
          ...changes,
        }
      : exercise
  )

  Return next
}

export function removeLibraryExercise(data, exerciseId) {
  Const next = clone(data)

  Next.exercisesLibrary = (
    Next.exercisesLibrary || []
  ).filter((exercise) => exercise.id !== exerciseId)

  Return next
}

export const removeExerciseFromLibrary = removeLibraryExercise

/*
|--------------------------------------------------------------------------
| ADICIONAR EXERCÍCIO DA BIBLIOTECA AO ALUNO
|--------------------------------------------------------------------------
*/

export function addLibraryExerciseToWorkout(
  Data,
  StudentId,
  Day,
  ExerciseId
) {
  Const next = clone(data)

  Const student = next.students.find(
    (item) => item.id === studentId
  )

  If (!student) return next

  Const libraryExercise = (
    Next.exercisesLibrary || []
  ).find((item) => item.id === exerciseId)

  If (!libraryExercise) return next

  If (!student.workouts) {
    Student.workouts = clone(next.workouts)
  }

  If (!student.workouts[day]) {
    Student.workouts[day] = {
      Title: `Treino ${day}`,
      Focus: '',
      Exercises: [],
    }
  }

  If (!Array.isArray(student.workouts[day].exercises)) {
    Student.workouts[day].exercises = []
  }

  Const copiedExercise = {
    ...clone(libraryExercise),
    Id: createId(),
  }

  Student.workouts[day].exercises.push(copiedExercise)

  Student.updatedAt = new Date().toISOString()

  Return next
}

/*
|--------------------------------------------------------------------------
| OUTRAS FUNÇÕES
|--------------------------------------------------------------------------
*/

export async function uploadLogo(dataUrl) {
  Return {
    Logo: dataUrl,
  }
}

export function logoSrc(path) {
  If (!path) return ''

  If (
    Path.startsWith('http') ||
    Path.startsWith('data:')
  ) {
    Return path
  }

  Return path
}

export function subscribeData(onChange) {
  Let closed = false

  Const tick = async () => {
    If (closed) return

    Const data = await fetchData()

    OnChange(data)
  }

  Const interval = setInterval(tick, 3000)

  Tick()

  Return () => {
    Closed = true
    clearInterval(interval)
  }
}

export function formatBRL(value) {
  Return Number(value || 0).toLocaleString(
    'pt-BR',
    {
      Style: 'currency',
      Currency: 'BRL',
    }
  )
}

export function whatsappLink(plan) {
  Const message =
    `Ola Danilo! Quero garantir minha vaga na consultoria de treino online ` +
    `(${plan.name} - ${formatBRL(plan.price)}).`

  Return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
