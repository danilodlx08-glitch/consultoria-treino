import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data')
const DATA_FILE = path.join(DATA_DIR, 'store.json')

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

export function writeStore(data) {
  ensureDir()
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2))
}

export function persistMiddleware() {
  return async (req, res, next) => {
    const url = req.url?.split('?')[0]
    if (url !== '/api/data') return next()

    res.setHeader('Content-Type', 'application/json')

    if (req.method === 'GET') {
      const stored = readStore()
      res.end(JSON.stringify(stored || { empty: true }))
      return
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      let raw = ''
      req.on('data', (chunk) => {
        raw += chunk
      })
      req.on('end', () => {
        try {
          const parsed = JSON.parse(raw || '{}')
          writeStore(parsed)
          res.end(JSON.stringify({ ok: true }))
        } catch {
          res.statusCode = 400
          res.end(JSON.stringify({ ok: false }))
        }
      })
      return
    }

    res.statusCode = 405
    res.end(JSON.stringify({ ok: false }))
  }
}
