const STORAGE_KEY = 'dl_consultoria_v1'

export const ADMIN_PASSWORD = 'admin17249'
export const WHATSAPP_NUMBER = '5527996247906'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

const defaultExercises = (list) =>
  list.map((item, index) => ({ id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`, ...item }))

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

export function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const defaultData = {
  brand: {
    logo: '/api/logo',
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
        },
        {
          name: 'Supino inclinado com halteres',
          sets: '3',
          reps: '10-12',
          notes: 'Cotovelos a 45 graus. Amplitude completa.',
          video: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
        },
        {
          name: 'Crossover no cabo',
          sets: '3',
          reps: '12-15',
          notes: 'Aperte o peito no final do movimento.',
          video: 'https://www.youtube.com/watch?v=taNxNMFGJa4',
        },
        {
          name: 'Triceps testa',
          sets: '3',
          reps: '10-12',
          notes: 'Cotovelos fixos. Nao abrir demais.',
          video: 'https://www.youtube.com/watch?v=IrVOh1eiyA4',
        },
        {
          name: 'Triceps corda',
          sets: '3',
          reps: '12-15',
          notes: 'Abra a corda no final da extensao.',
          video: 'https://www.youtube.com/watch?v=vB5OHsJ3EME',
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
        },
        {
          name: 'Remada curvada',
          sets: '4',
          reps: '8-10',
          notes: 'Coluna neutra. Puxe para o umbigo.',
          video: 'https://www.youtube.com/watch?v=FWJR5Ve8bnQ',
        },
        {
          name: 'Remada baixa no cabo',
          sets: '3',
          reps: '10-12',
          notes: 'Escapulas juntas no final.',
          video: 'https://www.youtube.com/watch?v=GZbfZ033f74',
        },
        {
          name: 'Rosca direta',
          sets: '3',
          reps: '10-12',
          notes: 'Sem balanco. Cotovelos colados.',
          video: 'https://www.youtube.com/watch?v=ykJmrN5iC10',
        },
        {
          name: 'Rosca martelo',
          sets: '3',
          reps: '12',
          notes: 'Punho neutro o tempo todo.',
          video: 'https://www.youtube.com/watch?v=zC3nLlEvin4',
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
        },
        {
          name: 'Leg press 45',
          sets: '4',
          reps: '10-12',
          notes: 'Nao trave os joelhos no topo.',
          video: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ',
        },
        {
          name: 'Cadeira extensora',
          sets: '3',
          reps: '12-15',
          notes: 'Pause de 1s no topo.',
          video: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
        },
        {
          name: 'Mesa flexora',
          sets: '3',
          reps: '12-15',
          notes: 'Quadril colado no banco.',
          video: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs',
        },
        {
          name: 'Panturrilha em pe',
          sets: '4',
          reps: '15-20',
          notes: 'Amplitude maxima. Alongue embaixo.',
          video: 'https://www.youtube.com/watch?v=-M4-G8p8fmc',
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
        },
        {
          name: 'Elevacao lateral',
          sets: '3',
          reps: '12-15',
          notes: 'Mindinho para cima. Sem trapézio.',
          video: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
        },
        {
          name: 'Elevacao frontal',
          sets: '3',
          reps: '12',
          notes: 'Ate a linha dos ombros.',
          video: 'https://www.youtube.com/watch?v=-t7fuZ0KhDA',
        },
        {
          name: 'Face pull',
          sets: '3',
          reps: '15',
          notes: 'Puxe em direcao a face. Rotacao externa.',
          video: 'https://www.youtube.com/watch?v=rep-bN3h4FQ',
        },
        {
          name: 'Prancha',
          sets: '3',
          reps: '40-60s',
          notes: 'Quadril alinhado. Respiracao constante.',
          video: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
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
        },
        {
          name: 'Afundo caminhando',
          sets: '3',
          reps: '10/lado',
          notes: 'Passo medio. Joelho nao ultrapassa o pe.',
          video: 'https://www.youtube.com/watch?v=D7KaRcUTQeE',
        },
        {
          name: 'Flexao de bracos',
          sets: '3',
          reps: 'max',
          notes: 'Corpo alinhado. Peito proximo ao chao.',
          video: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
        },
        {
          name: 'Remada unilateral',
          sets: '3',
          reps: '10/lado',
          notes: 'Nao gire o tronco.',
          video: 'https://www.youtube.com/watch?v=pYcpY20QaE8',
        },
        {
          name: 'Abdominal infra',
          sets: '3',
          reps: '12-15',
          notes: 'Lombar colada. Suba controlado.',
          video: 'https://www.youtube.com/watch?v=5ER5Of4M69I',
        },
      ]),
    },
  },
}

function normalizeStudent(student, templateWorkouts) {
  const workouts = student?.workouts
    ? { ...clone(templateWorkouts), ...clone(student.workouts) }
    : clone(templateWorkouts)
  return {
    id: student?.id || createId(),
    name: student?.name || 'Aluno',
    code: String(student?.code || generateAccessCode()).toUpperCase(),
    password: student?.password || generatePassword(),
    active: student?.active !== false,
    updatedAt: student?.updatedAt || null,
    workouts,
  }
}

export function mergeData(parsed) {
  const workouts = { ...clone(defaultData.workouts), ...(parsed?.workouts || {}) }
  const studentsSource = Array.isArray(parsed?.students) ? parsed.students : clone(defaultData.students)
  return {
    brand: { ...defaultData.brand, ...(parsed?.brand || {}) },
    plan: { ...defaultData.plan, ...(parsed?.plan || {}) },
    students: studentsSource.map((student) => normalizeStudent(student, workouts)),
    workouts,
  }
}

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return clone(defaultData)
    return mergeData(JSON.parse(raw))
  } catch {
    return clone(defaultData)
  }
}

export async function fetchData() {
  try {
    const res = await fetch('/api/data')
    if (res.ok) {
      const parsed = await res.json()
      if (parsed && !parsed.empty) {
        const merged = mergeData(parsed)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        return merged
      }
    }
  } catch {
    // fallback local
  }
  return loadData()
}

export async function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  try {
    await fetch('/api/data', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch {
    // keep local copy
  }
}

export async function uploadLogo(dataUrl) {
  const res = await fetch('/api/logo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl }),
  })
  if (!res.ok) throw new Error('upload_failed')
  return res.json()
}

export function logoSrc(path) {
  const value = path && !String(path).startsWith('data:') ? path : '/api/logo'
  if (value.startsWith('http')) return value
  return `${window.location.origin}${value.startsWith('/') ? value : `/${value}`}`
}

export function subscribeData(onChange) {
  let closed = false
  let source
  const tick = async () => {
    if (closed) return
    const data = await fetchData()
    onChange(data)
  }
  try {
    source = new EventSource('/api/stream')
    source.onmessage = () => {
      tick()
    }
  } catch {
    source = null
  }
  const interval = setInterval(tick, 4000)
  tick()
  return () => {
    closed = true
    clearInterval(interval)
    if (source) source.close()
  }
}

export function formatBRL(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function whatsappLink(plan) {
  const message = `Ola Danilo! Quero garantir minha vaga na consultoria de treino online (${plan.name} - ${formatBRL(plan.price)}).`
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
