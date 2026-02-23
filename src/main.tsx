import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './lib/i18n' // Import i18n configuration
import './styles/mobile-responsive.css'

// Desregistrar qualquer service worker existente que possa estar causando problemas
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then((success) => {
        if (success) {
          console.log('✅ Service Worker desregistrado com sucesso')
        }
      }).catch((error) => {
        console.warn('⚠️ Erro ao desregistrar Service Worker:', error)
      })
    }
  }).catch((error) => {
    console.warn('⚠️ Erro ao obter registros de Service Worker:', error)
  })

  // Limpar cache do service worker
  if ('caches' in window) {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName)
        })
      )
    }).then(() => {
      console.log('✅ Cache limpo com sucesso')
    }).catch((error) => {
      console.warn('⚠️ Erro ao limpar cache:', error)
    })
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
