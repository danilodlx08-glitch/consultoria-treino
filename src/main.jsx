
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Bloqueia o gesto de pinça em dispositivos móveis
function disableMobileZoom() {
  if (!window.matchMedia('(pointer: coarse)').matches) return

  const preventPinchZoom = (event) => {
    if (event.touches && event.touches.length > 1) {
      event.preventDefault()
    }
  }

  document.addEventListener('touchmove', preventPinchZoom, {
    passive: false,
  })

  document.addEventListener(
    'gesturestart',
    (event) => event.preventDefault(),
    { passive: false }
  )
}

// Ativa o controle antes de iniciar a aplicação
disableMobileZoom()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
