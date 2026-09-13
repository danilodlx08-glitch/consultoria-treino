import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const DATA_DIR = path.join(ROOT, 'data')
const DATA_FILE = path.join(DATA_DIR, 'store.json')
const LOGO_FILE = path.join(DATA_DIR, 'logo')
const DEFAULT_LOGO = path.join(ROOT, 'public', 'logo.svg')
const MIME_EXT = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
}

const clients = new Set()

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function readStore() {
  try {
    if (!fs.existsSync(DATA_FILE)) return null
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  } catch {
    return null
  }
}

function persistLogoFromDataUrl(dataUrl) {
  const match = String(dataUrl || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) return null
  const mime = match[1]
  const ext = MIME_EXT[mime]
  if (!ext) return null
  ensureDir()
  const buffer = Buffer.from(match[2], 'base64')
  const dest = LOGO_FILE + ext
  fs.writeFileSync(dest, buffer)
  fs.writeFileSync(LOGO_FILE, buffer)
  const version = Date.now()
  fs.writeFileSync(logoMetaPath(), JSON.stringify({ mime, version, ext }))
  return `/api/logo?v=${version}`
}

export function writeStore(data) {
  ensureDir()
  const clean = JSON.parse(JSON.stringify(data || {}))
  if (clean.brand?.logo && String(clean.brand.logo).startsWith('data:')) {
    const logoPath = persistLogoFromDataUrl(clean.brand.logo)
    clean.brand = { ...clean.brand, logo: logoPath || '/api/logo' }
  } else if (clean.brand) {
    const meta = readLogoMeta()
    clean.brand.logo = `/api/logo?v=${meta.version || 1}`
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(clean, null, 2))
  broadcast()
}

function logoMetaPath() {
  return path.join(DATA_DIR, 'logo-meta.json')
}

function readLogoMeta() {
  try {
    return JSON.parse(fs.readFileSync(logoMetaPath(), 'utf8'))
  } catch {
    return { mime: 'image/svg+xml', version: 1 }
  }
}

function findLogoFile() {
  if (fs.existsSync(LOGO_FILE)) return LOGO_FILE
  const meta = readLogoMeta()
  const ext = MIME_EXT[meta.mime]
  if (ext && fs.existsSync(LOGO_FILE + ext)) return LOGO_FILE + ext
  if (fs.existsSync(DATA_DIR)) {
    const match = fs.readdirSync(DATA_DIR).find((name) => name.startsWith('logo.') || name === 'logo')
    if (match) return path.join(DATA_DIR, match)
  }
  return DEFAULT_LOGO
}

function broadcast() {
  const payload = `data: ${JSON.stringify({ t: Date.now() })}\n\n`
  for (const res of clients) {
    try {
      res.write(payload)
    } catch {
      clients.delete(res)
    }
  }
}

function collectBody(req, limit = 8 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        reject(new Error('payload_too_large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

function serveLogo(res) {
  const file = findLogoFile()
  const meta = readLogoMeta()
  const mime =
    file.endsWith('.png')
      ? 'image/png'
      : file.endsWith('.jpg') || file.endsWith('.jpeg')
        ? 'image/jpeg'
        : file.endsWith('.webp')
          ? 'image/webp'
          : file.endsWith('.gif')
            ? 'image/gif'
            : meta.mime || 'image/svg+xml'
  res.statusCode = 200
  res.setHeader('Content-Type', mime)
  res.setHeader('Cache-Control', 'public, max-age=60')
  res.setHeader('Access-Control-Allow-Origin', '*')
  fs.createReadStream(file).pipe(res)
}

function serveManifest(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host = req.headers['x-forwarded-host'] || req.headers.host
  const origin = `${proto}://${host}`
  const version = readLogoMeta().version || 1
  const icon = `${origin}/api/logo?v=${version}`
  sendJson(res, 200, {
    name: 'Danilo Lopes Consultoria',
    short_name: 'Danilo Lopes',
    description: 'Consultoria de treino online',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0c0c0c',
    theme_color: '#0c0c0c',
    icons: [
      { src: icon, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: icon, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  })
}

async function handleLogoUpload(req, res) {
  try {
    const raw = await collectBody(req)
    const parsed = JSON.parse(raw.toString('utf8') || '{}')
    const dataUrl = String(parsed.dataUrl || '')
    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
    if (!match) {
      sendJson(res, 400, { ok: false, error: 'invalid_image' })
      return
    }
    const mime = match[1]
    const ext = MIME_EXT[mime]
    if (!ext) {
      sendJson(res, 400, { ok: false, error: 'unsupported_type' })
      return
    }
    ensureDir()
    const buffer = Buffer.from(match[2], 'base64')
    if (buffer.length > 4 * 1024 * 1024) {
      sendJson(res, 400, { ok: false, error: 'too_large' })
      return
    }
    for (const name of fs.readdirSync(DATA_DIR)) {
      if (name === 'logo' || name.startsWith('logo.')) {
        fs.writeFileSync(path.join(DATA_DIR, name), buffer)
      }
    }
    const dest = LOGO_FILE + ext
    fs.writeFileSync(dest, buffer)
    if (dest !== LOGO_FILE) {
      try {
        fs.copyFileSync(dest, LOGO_FILE)
      } catch {
        // ignore
      }
    }
    const version = Date.now()
    fs.writeFileSync(logoMetaPath(), JSON.stringify({ mime, version, ext }))
    const stored = readStore() || {}
    writeStore({
      ...stored,
      brand: { ...(stored.brand || {}), logo: `/api/logo?v=${version}` },
    })
    sendJson(res, 200, { ok: true, logo: `/api/logo?v=${version}` })
  } catch {
    sendJson(res, 400, { ok: false })
  }
}

export function persistMiddleware() {
  return async (req, res, next) => {
    const url = req.url?.split('?')[0]

    if (url === '/api/health') {
      sendJson(res, 200, { ok: true })
      return
    }

    if (url === '/manifest.webmanifest' || url === '/api/manifest.webmanifest') {
      serveManifest(req, res)
      return
    }

    if (url === '/api/logo' || url === '/apple-touch-icon.png' || url === '/favicon.ico') {
      if (req.method === 'GET' || req.method === 'HEAD') {
        if (req.method === 'HEAD') {
          const file = findLogoFile()
          const meta = readLogoMeta()
          res.statusCode = 200
          res.setHeader('Content-Type', meta.mime || 'image/svg+xml')
          res.setHeader('Cache-Control', 'public, max-age=60')
          res.end()
          return
        }
        serveLogo(res)
        return
      }
      if (url === '/api/logo' && (req.method === 'POST' || req.method === 'PUT')) {
        await handleLogoUpload(req, res)
        return
      }
    }

    if (url === '/api/stream') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      })
      res.write('retry: 3000\n\n')
      clients.add(res)
      req.on('close', () => clients.delete(res))
      return
    }

    if (url !== '/api/data') return next()

    if (req.method === 'GET') {
      const stored = readStore()
      sendJson(res, 200, stored || { empty: true })
      return
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      try {
        const raw = await collectBody(req)
        const parsed = JSON.parse(raw.toString('utf8') || '{}')
        writeStore(parsed)
        sendJson(res, 200, { ok: true })
      } catch {
        sendJson(res, 400, { ok: false })
      }
      return
    }

    sendJson(res, 405, { ok: false })
  }
}
