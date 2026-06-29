import { useRef, useState, useLayoutEffect } from 'react'
import s from './BottomNav.module.css'

const TABS = [
  { id: 'home',    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'cards',   icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { id: 'add',     icon: 'M12 4v16m8-8H4' },
  { id: 'stats',   icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
]

export default function BottomNav({ active, onNavigate, onAddTx }) {
  const navRef = useRef(null)
  const btnRefs = useRef({})
  const [bubble, setBubble] = useState(null)

  // حبابِ تبِ فعال را با اندازه‌گیری موقعیتِ دکمه جا‌به‌جا می‌کنیم (RTL هم خودکار درست می‌شود)
  useLayoutEffect(() => {
    const nav = navRef.current
    const el = btnRefs.current[active]
    if (!nav || !el) { setBubble(null); return }
    const n = nav.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    setBubble({ x: r.left - n.left, y: r.top - n.top, w: r.width, h: r.height })
  }, [active])

  return (
    <nav className={s.nav} ref={navRef}>
      {bubble && (
        <div className={s.bubble}
          style={{ transform: `translate(${bubble.x}px, ${bubble.y}px)`, width: bubble.w, height: bubble.h }} />
      )}
      {TABS.map(tab => {
        const isAdd = tab.id === 'add'
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            ref={el => { btnRefs.current[tab.id] = el }}
            className={`${s.item} ${isAdd ? s.addItem : ''}`}
            onClick={() => isAdd ? onAddTx() : onNavigate(tab.id)}
            aria-label={tab.id}
          >
            <svg width={isAdd ? 22 : 23} height={isAdd ? 22 : 23} viewBox="0 0 24 24" fill="none"
              stroke={isAdd ? '#fff' : isActive ? '#A89DFF' : 'rgba(255,255,255,0.45)'}
              strokeWidth={isAdd ? 2.5 : 1.9}>
              <path d={tab.icon} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )
      })}
    </nav>
  )
}
