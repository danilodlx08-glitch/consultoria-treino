import { supabase } from './services/supabase'

const STORAGE_KEY = 'dl_consultoria_v1'
const PENDING_QUEUE_KEY = 'dl_consultoria_pending_queue_v1'
const STUDENT_CACHE_PREFIX = 'dl_student_session_'
const PBKDF2_ITERATIONS = 100000

export const ADMIN_PASSWORD = 'admin17249'
export const WHATSAPP_NUMBER = '5527996247906'

/*
|--------------------------------------------------------------------------
| UTILITÁRIOS E CRIPTOGRAFIA (PBKDF2 COM SALT ALEATÓRIO)
|--------------------------------------------------------------------------
*/

function clone(value) {
  return JSON.parse(JSON.stringify(value))
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

function generateRandomSalt() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function derivePasswordHash(password, saltHex) {
  const cleanPass = String(password || '').trim()
  if (!cleanPass || !saltHex) return ''

  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(cleanPass),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  const saltBytes = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)))

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  const exported = await crypto.subtle.exportKey('raw', derivedKey)
  const hashArray = Array.from(new Uint8Array(exported))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/*
|--------------------------------------------------------------------------
| TREINOS PADRÃO E CONFIGURAÇÃO GLOBAL
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
      'Vídeos explicativos de cada movimento',
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
      dataVersion: 1,
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
          notes: 'Peito para fora. Puxe até o queixo.',
          video: 'https://youtube.com/shorts/d0K1P8SZGeI?si=pURhPdLfeC9x578o',
          muscle: 'Costas',
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
          notes: 'Joelhos alinhados. Desça até 90 graus.',
          video: 'https://youtube.com/shorts/Sh7B_-1-ncc?si=ljiHSJ-nWcq4_QdS',
          muscle: 'Quadriceps',
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
          notes: 'Não arqueie a lombar.',
          video: 'https://youtube.com/shorts/tgOvSxhCNDg?si=7a9REO_FeZFhYIOh',
          muscle: 'Ombros',
        },
      ]),
    },
    E: {
      title: 'Treino E - Full Body / Condicionamento',
      focus: 'Força geral',
      exercises: createDefaultExercises([
        {
          name: 'Levantamento terra rumeno',
          sets: '4',
          reps: '8-10',
          notes: 'Barra raspando as pernas. Quadril para trás.',
          video: 'https://www.youtube.com/watch?v=jEy_czb3RKA',
          muscle: 'Posterior',
        },
      ]),
    },
  },
}

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
    unique.push({ ...clone(exercise), id: createId() })
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

  const validDays = ['A', 'B', 'C', 'D', 'E']
  const requestedDays = Array.isArray(source.activeDays)
    ? source.activeDays
    : Array.isArray(source.active_days)
      ? source.active_days
      : null

  const activeDays = requestedDays
    ? validDays.filter((day) => requestedDays.includes(day))
    : [...validDays]

  return {
    id: source.id || createId(),
    name: source.name || source.nome || 'Aluno',
    code: String(source.code || generateAccessCode()).toUpperCase(),
    password: String(source.password || generatePassword()),
    active: source.active !== false,
    updatedAt: source.updatedAt || source.updated_at || null,
    dataVersion: Number(source.dataVersion || source.data_version || 1),
    activeDays: activeDays.length > 0 ? activeDays : [...validDays],
    workouts,
    evaluations: Array.isArray(source.evaluations) ? source.evaluations : [],
    _writeTimestamp: source._writeTimestamp || '',
  }
}

export function mergeData(parsed) {
  const source = parsed || {}
  const workouts = {
    ...clone(defaultData.workouts),
    ...(source.workouts || {}),
  }

  for (const day of ['A', 'B', 'C', 'D', 'E']) {
    workouts[day] = normalizeWorkout(source.workouts?.[day], defaultData.workouts[day])
  }

  const studentsSource = Array.isArray(source.students)
    ? source.students
    : clone(defaultData.students)

  const exercisesLibrary = Array.isArray(source.exercisesLibrary)
    ? source.exercisesLibrary
    : clone(defaultData.exercisesLibrary)

  return {
    brand: { ...defaultData.brand, ...(source.brand || {}) },
    plan: {
      ...defaultData.plan,
      ...(source.plan || {}),
      includes: Array.isArray(source.plan?.includes)
        ? source.plan.includes
        : clone(defaultData.plan.includes),
    },
    students: studentsSource.map((student) => normalizeStudent(student, workouts)),
    workouts,
    exercisesLibrary,
  }
}

/*
|--------------------------------------------------------------------------
| PERSISTÊNCIA LOCAL (LOCALSTORAGE)
|--------------------------------------------------------------------------
*/

function notifyLocalChange(data) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('dl:local-data-changed', { detail: data })
  )
}

export function loadData() {
  try {
    if (typeof localStorage === 'undefined') return clone(defaultData)
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return clone(defaultData)
    return mergeData(JSON.parse(raw))
  } catch (error) {
    console.error('Erro ao carregar os dados locais:', error)
    return clone(defaultData)
  }
}

export function saveLocalData(data) {
  try {
    if (typeof localStorage === 'undefined') return false
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    notifyLocalChange(data)
    return true
  } catch (error) {
    console.error('Erro ao salvar dados localmente:', error)
    return false
  }
}

/*
|--------------------------------------------------------------------------
| CONVERSÃO PARA SUPABASE
|--------------------------------------------------------------------------
*/

function studentToRow(student) {
  return {
    id: student.id,
    nome: student.name,
    code: student.code,
    password: student.password,
    active: student.active !== false,
    active_days: Array.isArray(student.activeDays) ? student.activeDays : ['A', 'B', 'C', 'D', 'E'],
    workouts: student.workouts || {},
    evaluations: Array.isArray(student.evaluations) ? student.evaluations : [],
    data_version: Number(student.dataVersion || 1),
    updated_at: new Date().toISOString(),
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
      activeDays: row.active_days || row.activeDays,
      workouts: row.workouts,
      evaluations: row.evaluations,
      dataVersion: row.data_version || 1,
      updatedAt: row.updated_at || null,
    },
    templateWorkouts
  )
}

/*
|--------------------------------------------------------------------------
| CACHE INDIVIDUAL E AUTENTICAÇÃO
|--------------------------------------------------------------------------
*/

export function getLocalStudentCache(code) {
  try {
    const cleanCode = String(code || '').trim().toUpperCase()
    const cachedKey = `${STUDENT_CACHE_PREFIX}${cleanCode}`
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(cachedKey) : null
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

function purgeStudentCacheById(studentId) {
  if (typeof localStorage === 'undefined' || !studentId) return
  try {
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STUDENT_CACHE_PREFIX)) {
        try {
          const cached = JSON.parse(localStorage.getItem(key))
          if (cached && cached.id === studentId) {
            keysToRemove.push(key)
          }
        } catch (_) {}
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))
  } catch (e) {
    console.error('Erro ao purgar cache por ID:', e)
  }
}

export async function saveStudentCache(code, studentData, rawPassword = '') {
  try {
    if (typeof localStorage === 'undefined' || !code) return false
    const cleanCode = String(code || '').trim().toUpperCase()
    const sanitized = normalizeStudent(studentData, defaultData.workouts)
    delete sanitized._writeTimestamp

    purgeStudentCacheById(sanitized.id)

    const passToHash = rawPassword || sanitized.password
    if (passToHash) {
      const salt = generateRandomSalt()
      sanitized.passwordSalt = salt
      sanitized.passwordHash = await derivePasswordHash(passToHash, salt)
    }

    delete sanitized.password
    localStorage.setItem(`${STUDENT_CACHE_PREFIX}${cleanCode}`, JSON.stringify(sanitized))
    return true
  } catch (e) {
    console.error('Erro ao guardar cache do aluno:', e)
    return false
  }
}

export async function checkStudentVersion(code, password) {
  const cleanCode = String(code || '').trim().toUpperCase()
  const cleanPass = String(password || '').trim()

  if (!cleanCode || !cleanPass) {
    throw new Error('Informe o código e a senha de acesso.')
  }

  const localCache = getLocalStudentCache(cleanCode)

  if (!navigator.onLine) {
    if (localCache && localCache.passwordHash && localCache.passwordSalt) {
      const inputHash = await derivePasswordHash(cleanPass, localCache.passwordSalt)
      if (localCache.passwordHash !== inputHash) {
        throw new Error('Senha incorreta. Verifique os seus dados.')
      }
      return { status: 'OFFLINE_CACHE', student: localCache }
    }
    throw new Error('Você está sem internet e não possui dados salvos ou credenciais válidas neste dispositivo.')
  }

  try {
    const { data: row, error } = await supabase
      .from('alunos')
      .select('id, password, active, data_version')
      .eq('code', cleanCode)
      .maybeSingle()

    if (error) throw new Error('NETWORK_ERROR')
    if (!row) throw new Error('AUTH_INVALID_CODE')
    if (row.password !== cleanPass) throw new Error('AUTH_INVALID_PASSWORD')
    if (row.active === false) throw new Error('AUTH_INACTIVE')

    return processVersionCheckResult(row.id, row.data_version, localCache, cleanCode, cleanPass)
  } catch (err) {
    if (err.message === 'AUTH_INVALID_CODE') {
      throw new Error('Código de acesso inválido ou aluno não encontrado.')
    }
    if (err.message === 'AUTH_INVALID_PASSWORD') {
      throw new Error('Senha incorreta. Verifique os seus dados.')
    }
    if (err.message === 'AUTH_INACTIVE') {
      throw new Error('Este acesso encontra-se desativado. Contacte o professor.')
    }

    const isNetworkError =
      err.message === 'NETWORK_ERROR' ||
      err.name === 'TypeError' ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('NetworkError')

    if (isNetworkError && localCache && localCache.passwordHash && localCache.passwordSalt) {
      const inputHash = await derivePasswordHash(cleanPass, localCache.passwordSalt)
      if (localCache.passwordHash !== inputHash) {
        throw new Error('Senha incorreta. Verifique os seus dados.')
      }
      return { status: 'OFFLINE_CACHE', student: localCache }
    }

    throw err
  }
}

async function processVersionCheckResult(studentId, remoteVersionVal, localCache, cleanCode, cleanPass) {
  const remoteVersion = Number(remoteVersionVal || 1)
  const localVersion = Number(localCache?.dataVersion || 0)

  if (localCache && (!localCache.passwordHash || !localCache.passwordSalt)) {
    await saveStudentCache(cleanCode, localCache, cleanPass)
  }

  if (!localCache) {
    return { status: 'FIRST_ACCESS', studentId, remoteVersion }
  }

  if (localVersion >= remoteVersion) {
    return { status: 'UP_TO_DATE', studentId, localCache, remoteVersion }
  } else {
    return { status: 'UPDATE_AVAILABLE', studentId, localCache, remoteVersion }
  }
}

export async function fetchSingleStudentData(studentId, code) {
  const cleanCode = String(code || '').trim().toUpperCase()
  const { data: row, error } = await supabase
    .from('alunos')
    .select('*')
    .eq('id', studentId)
    .single()

  if (error || !row) {
    throw new Error('Erro ao baixar atualizações do aluno.')
  }

  if (row.id !== studentId || String(row.code).trim().toUpperCase() !== cleanCode) {
    throw new Error('Erro de validação de identidade do aluno.')
  }

  if (row.active === false) {
    throw new Error('Este acesso encontra-se desativado.')
  }

  const baseWorkouts = clone(defaultData.workouts)
  const student = rowToStudent(row, baseWorkouts)
  
  await saveStudentCache(code, student, student.password)
  return student
}

/*
|--------------------------------------------------------------------------
| CONTROLE DE SALVAMENTO E PUBLICAÇÃO
|--------------------------------------------------------------------------
*/

let pendingStudentWrites = new Map()
let pendingStudentDeletes = new Set()
let globalConfigDirty = false
let globalConfigTimestamp = ''
let saveQueue = Promise.resolve()

function loadPendingQueue() {
  if (typeof localStorage === 'undefined') return
  try {
    const raw = localStorage.getItem(PENDING_QUEUE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (parsed.writes) {
      pendingStudentWrites = new Map(parsed.writes)
    }
    if (parsed.deletes) {
      pendingStudentDeletes = new Set(parsed.deletes)
    }
    if (parsed.globalConfigDirty) {
      globalConfigDirty = parsed.globalConfigDirty
      globalConfigTimestamp = parsed.globalConfigTimestamp || createId()
    }
  } catch (e) {
    console.error('Erro ao carregar fila pendente:', e)
  }
}

function persistPendingQueue() {
  if (typeof localStorage === 'undefined') return
  try {
    const payload = {
      writes: Array.from(pendingStudentWrites.entries()),
      deletes: Array.from(pendingStudentDeletes),
      globalConfigDirty,
      globalConfigTimestamp,
    }
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(payload))
  } catch (e) {
    console.error('Erro ao persistir fila pendente:', e)
  }
}

loadPendingQueue()

export async function fetchData() {
  const localData = loadData()
  try {
    const { data: alunosData, error: alunosError } = await supabase.from('alunos').select('*')
    if (alunosError) throw alunosError

    const rows = Array.isArray(alunosData) ? alunosData : []
    const remoteStudents = new Map()

    for (const row of rows) {
      if (!row?.id) continue
      if (pendingStudentDeletes.has(row.id)) continue

      if (pendingStudentWrites.has(row.id)) {
        remoteStudents.set(row.id, pendingStudentWrites.get(row.id))
        continue
      }

      remoteStudents.set(row.id, rowToStudent(row, localData.workouts))
    }

    for (const [id, student] of pendingStudentWrites.entries()) {
      if (!rows.some(r => r.id === id)) {
        remoteStudents.set(id, student)
      }
    }

    let globalConfig = {
      brand: localData.brand,
      plan: localData.plan,
      exercisesLibrary: localData.exercisesLibrary,
    }

    if (!globalConfigDirty) {
      const { data: configRow, error: configError } = await supabase
        .from('config')
        .select('*')
        .eq('id', 'global')
        .maybeSingle()

      if (!configError && configRow) {
        globalConfig = {
          brand: configRow.brand || localData.brand,
          plan: configRow.plan || localData.plan,
          exercisesLibrary: configRow.exercises_library || localData.exercisesLibrary,
        }
      }
    }

    const result = mergeData({
      ...localData,
      ...globalConfig,
      students: Array.from(remoteStudents.values()),
    })

    saveLocalData(result)
    return result
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    return localData
  }
}

export function saveData(data) {
  try {
    const snapshot = clone(data)
    const successLocal = saveLocalData(snapshot)
    if (!successLocal) {
      return { success: false, localSaved: false, error: new Error('Falha ao escrever no armazenamento local.') }
    }
    return { success: true, localSaved: true, pending: true }
  } catch (error) {
    console.error('Erro ao salvar dados localmente:', error)
    return { success: false, localSaved: false, error }
  }
}

export function markStudentAsPending(student) {
  if (!student?.id) return
  pendingStudentDeletes.delete(student.id)
  
  const normalized = normalizeStudent(student, defaultData.workouts)
  normalized._writeTimestamp = createId()
  pendingStudentWrites.set(student.id, normalized)
  persistPendingQueue()
}

export function removeStudentRecord(id, studentCode = '') {
  pendingStudentWrites.delete(id)
  pendingStudentDeletes.add(id)
  persistPendingQueue()
  purgeStudentCacheById(id)

  const cleanCode = String(studentCode || '').trim().toUpperCase()

  if (cleanCode && typeof localStorage !== 'undefined') {
    localStorage.removeItem(`${STUDENT_CACHE_PREFIX}${cleanCode}`)
  }
}

export async function publishData() {
  saveQueue = saveQueue.then(async () => {
    const errors = []

    try {
      const currentDeletes = Array.from(pendingStudentDeletes)
      const currentWrites = new Map()
      for (const [id, student] of pendingStudentWrites.entries()) {
        currentWrites.set(id, clone(student))
      }
      
      const syncGlobalSnapshot = globalConfigDirty
      const syncGlobalTimestamp = globalConfigTimestamp
      const localCurrentSnapshot = loadData()

      // 1. Processar exclusões pendentes
      for (const studentId of currentDeletes) {
        const { error } = await supabase.from('alunos').delete().eq('id', studentId)
        if (error) {
          errors.push(error)
        } else {
          pendingStudentDeletes.delete(studentId)
          persistPendingQueue()
        }
      }

      // 2. Processar gravações de alunos
      for (const [studentId, student] of currentWrites.entries()) {
        if (pendingStudentDeletes.has(studentId)) continue

        const nextVersion = (Number(student.dataVersion) || 1) + 1
        const payloadStudent = { ...student, dataVersion: nextVersion }
        delete payloadStudent._writeTimestamp
        const row = studentToRow(payloadStudent)

        const { error } = await supabase.from('alunos').upsert(row, { onConflict: 'id' })
        
        if (error) {
          errors.push(error)
          console.error(`Erro ao publicar aluno ${student.name}:`, error)
        } else {
          const publishedStudentObject = normalizeStudent(payloadStudent, defaultData.workouts)
          
          const latestInQueue = pendingStudentWrites.get(studentId)

          if (latestInQueue?._writeTimestamp === student._writeTimestamp) {
            pendingStudentWrites.delete(studentId)

            // Atualiza a versão no armazenamento principal local.
            const currentData = loadData()
            const updatedStudents = currentData.students.map((item) =>
              item.id === studentId
                ? { ...item, dataVersion: nextVersion }
                : item
            )

            saveLocalData({
              ...currentData,
              students: updatedStudents,
            })

            persistPendingQueue()

            await saveStudentCache(
              publishedStudentObject.code,
              publishedStudentObject,
              publishedStudentObject.password
            )
          } else {
            // Existe uma edição mais recente na fila. Atualiza somente a versão preservando a edição pendente.
            const latestStudent = pendingStudentWrites.get(studentId)
            if (latestStudent) {
              latestStudent.dataVersion = nextVersion
              pendingStudentWrites.set(studentId, latestStudent)
              persistPendingQueue()
            }
          }
        }
      }

      // 3. Publicar configurações globais usando o snapshot estático
      if (syncGlobalSnapshot) {
        const configPayload = {
          id: 'global',
          brand: localCurrentSnapshot.brand,
          plan: localCurrentSnapshot.plan,
          exercises_library: localCurrentSnapshot.exercisesLibrary,
          updated_at: new Date().toISOString(),
        }

        const { error: configError } = await supabase.from('config').upsert(configPayload, { onConflict: 'id' })
        if (configError) {
          errors.push(configError)
          console.error('Erro ao publicar configurações globais:', configError)
        } else {
          if (globalConfigTimestamp === syncGlobalTimestamp) {
            globalConfigDirty = false
            persistPendingQueue()
          }
        }
      }

      const success = errors.length === 0
      return {
        success,
        message: success
          ? 'Todas as alterações foram publicadas com sucesso!'
          : 'Houve um problema ao publicar algumas alterações.',
        errors,
      }
    } catch (error) {
      console.error('Erro inesperado na publicação:', error)
      return { success: false, message: error.message, errors: [error] }
    }
  })

  return saveQueue
}

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

export function markGlobalConfigDirty() {
  globalConfigDirty = true
  globalConfigTimestamp = createId()
  persistPendingQueue()
}

export function addExerciseToLibrary(data, exercise) {
  const next = clone(data)
  if (!Array.isArray(next.exercisesLibrary)) next.exercisesLibrary = []
  next.exercisesLibrary.push(createLibraryExercise(exercise))
  markGlobalConfigDirty()
  return next
}

export function updateLibraryExercise(data, exerciseId, changes) {
  const next = clone(data)
  next.exercisesLibrary = (next.exercisesLibrary || []).map((exercise) =>
    exercise.id === exerciseId ? { ...exercise, ...changes } : exercise
  )
  markGlobalConfigDirty()
  return next
}

export function removeExerciseFromLibrary(data, exerciseId) {
  const next = clone(data)
  next.exercisesLibrary = (next.exercisesLibrary || []).filter((e) => e.id !== exerciseId)
  markGlobalConfigDirty()
  return next
}

export function addLibraryExerciseToWorkout(data, studentId, day, exerciseId) {
  const next = clone(data)
  const student = (next.students || []).find((s) => s.id === studentId)
  if (!student) return next
  const libraryExercise = (next.exercisesLibrary || []).find((item) => item.id === exerciseId)
  if (!libraryExercise) return next

  if (!student.workouts) student.workouts = clone(defaultData.workouts)
  if (!student.workouts[day]) {
    student.workouts[day] = { title: `Treino ${day}`, focus: '', exercises: [] }
  }

  student.workouts[day].exercises.push({ ...clone(libraryExercise), id: createId() })
  student.updatedAt = new Date().toISOString()
  
  markStudentAsPending(student)
  return next
}

export async function uploadLogo(dataUrl) {
  markGlobalConfigDirty()
  return { logo: dataUrl }
}

export function logoSrc(path) {
  if (!path) return ''
  return path
}

export function subscribeData(onChange) {
  if (typeof window === 'undefined') return () => {}
  const handleLocalChange = (event) => {
    if (typeof onChange === 'function') onChange(event.detail || loadData())
  }
  window.addEventListener('dl:local-data-changed', handleLocalChange)
  return () => window.removeEventListener('dl:local-data-changed', handleLocalChange)
}
