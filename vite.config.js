import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { persistMiddleware } from './server/persist.js'

function persistPlugin() {
  return {
    name: 'persist-api',
    configureServer(server) {
      server.middlewares.use(persistMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(persistMiddleware())
    },
  }
}

export default defineConfig({
  plugins: [react(), persistPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['.monkeycode-ai.live'],
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['.monkeycode-ai.live'],
  },
})
