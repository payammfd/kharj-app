import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// جلوگیری از زوم روی موبایل (iOS Safari مقدار user-scalable=no توی meta رو نادیده می‌گیره)
// ۱) جلوگیری از pinch-zoom با دو انگشت
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1) e.preventDefault()
}, { passive: false })
// ۲) جلوگیری از zoom با double-tap
let lastTouchEnd = 0
document.addEventListener('touchend', (e) => {
  const now = Date.now()
  if (now - lastTouchEnd <= 300) e.preventDefault()
  lastTouchEnd = now
}, { passive: false })
// ۳) جلوگیری از gesture-zoom مخصوص Safari
for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(ev, (e) => e.preventDefault())
}

// ثبت Service Worker با auto-reload: وقتی نسخه جدید اپ deploy بشه،
// به‌جای اینکه کاربر روی نسخه‌ی کش‌شده‌ی قدیمی گیر کنه، خودکار صفحه ری‌لود میشه.
// داخل اپ نیتیو (Capacitor) SW رو ثبت نمی‌کنیم؛ چون فایل‌ها لوکال bundle شدن
// و SW فقط باعث کش اضافی و رفتار ناخواسته توی WKWebView می‌شه.
const isNativeApp = !!(window.Capacitor && window.Capacitor.isNativePlatform?.())
if (import.meta.env.PROD && !isNativeApp) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
