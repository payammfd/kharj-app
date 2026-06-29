import { useState, useEffect } from 'react'
import { supabase, toFa, fmtAmount } from '../lib/supabase'
import MemberAvatar from './MemberAvatar'
import s from './Notifications.module.css'

function relTime(iso) {
  const d = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - d)
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'همین الان'
  if (m < 60) return `${toFa(m)} دقیقه پیش`
  const h = Math.floor(m / 60)
  if (h < 24) return `${toFa(h)} ساعت پیش`
  const day = Math.floor(h / 24)
  if (day < 30) return `${toFa(day)} روز پیش`
  return `${toFa(Math.floor(day / 30))} ماه پیش`
}

export default function Notifications({ plan, members, onClose }) {
  const [items, setItems] = useState(null)

  useEffect(() => {
    supabase.from('transactions').select('*').eq('plan_id', plan.id)
      .order('created_at', { ascending: false }).limit(40)
      .then(({ data }) => setItems(data || []))
  }, [plan])

  const getMember = uid => members.find(m => m.user_id === uid)

  return (
    <div className={s.overlay}>
      <header className={s.hdr}>
        <button className={s.back} onClick={onClose} aria-label="بستن">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <h2 className={s.title}>اعلان‌ها</h2>
      </header>

      <div className={s.list}>
        {items === null ? (
          <div className={s.empty}><div className={s.emptyIcon}>⋯</div></div>
        ) : items.length === 0 ? (
          <div className={s.empty}><p>هنوز فعالیتی نیست</p></div>
        ) : items.map(t => {
          const member = getMember(t.user_id)
          const isExp = t.type === 'expense'
          return (
            <div key={t.id} className={s.row}>
              <MemberAvatar member={member} size={38} />
              <div className={s.info}>
                <div className={s.line}>
                  <b>{member?.display_name || 'یک عضو'}</b> {isExp ? 'یک هزینه ثبت کرد' : 'یک درآمد ثبت کرد'}
                </div>
                <div className={s.sub}>{t.description} · {isExp ? t.category : 'درآمد'}</div>
                <div className={s.time}>{relTime(t.created_at)}</div>
              </div>
              <div className={s.amt} style={{ color: isExp ? '#FF6B6B' : '#34D39A' }}>
                {isExp ? '−' : '+'}&#x200F;{fmtAmount(t.amount)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
