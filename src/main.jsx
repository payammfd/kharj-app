import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// ثبت Service Worker با auto-reload: وقتی نسخه جدید اپ deploy بشه،
// به‌جای اینکه کاربر روی نسخه‌ی کش‌شده‌ی قدیمی گیر کنه، خودکار صفحه ری‌لود میشه.
if (import.meta.env.PROD) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
