import { useState, useEffect, useRef } from 'react'
import { supabase, MONTHS, toFa, fmtAmount } from '../lib/supabase'
import MemberAvatar from './MemberAvatar'
import s from './SearchTransactions.module.css'

const CAT_COLORS = {
  'اینترنت':{bg:'rgba(123,110,255,0.15)',c:'#A89DFF'},
  'آب، برق، گاز':{bg:'rgba(52,211,154,0.15)',c:'#34D39A'},
  'خوراک':{bg:'rgba(239,159,39,0.15)',c:'#EF9F27'},
  'حمل و نقل':{bg:'rgba(168,157,255,0.15)',c:'#C4BCFF'},
  'سلامت':{bg:'rgba(255,107,107,0.15)',c:'#FF9090'},
  'پوشاک':{bg:'rgba(255,107,157,0.15)',c:'#FF85B4'},
  'تفریح':{bg:'rgba(255,142,83,0.15)',c:'#FF9A6C'},
  'آموزش':{bg:'rgba(79,172,254,0.15)',c:'#6BBFFF'},
  'سایر':{bg:'rgba(144,144,160,0.15)',c:'#9090A0'},
  'درآمد':{bg:'rgba(52,211,154,0.15)',c:'#34D39A'},
}

export default function SearchTransactions({ plan, members, onClose }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    const query = q.trim()
    if (!query) { setResults([]); setLoading(false); return }
    setLoading(true)
    // پاک‌سازی کاراکترهایی که فیلترِ PostgREST را خراب می‌کنند
    const safe = query.replace(/[,%()*]/g, ' ').trim()
    const t = setTimeout(async () => {
      const { data } = await supabase.from('transactions').select('*')
        .eq('plan_id', plan.id)
        .or(`description.ilike.%${safe}%,category.ilike.%${safe}%`)
        .order('jy', { ascending: false })
        .order('jm', { ascending: false })
        .order('jd', { ascending: false })
        .limit(80)
      setResults(data || [])
      setLoading(false)
    }, 250)
    return () => clearTimeout(t)
  }, [q, plan])

  const getMember = uid => members.find(m => m.user_id === uid)
  const total = results.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0)

  return (
    <div className={s.overlay}>
      <header className={s.hdr}>
        <button className={s.back} onClick={onClose} aria-label="بستن">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className={s.searchBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4" strokeLinecap="round"/></svg>
          <input ref={inputRef} className={s.input} value={q} onChange={e => setQ(e.target.value)}
            placeholder="جستجو در خرج‌ها…" enterKeyHint="search" />
          {q && <button className={s.clear} onClick={() => setQ('')} aria-label="پاک کردن">✕</button>}
        </div>
      </header>

      {q.trim() && !loading && (
        <div className={s.summary}>
          {results.length === 0
            ? 'نتیجه‌ای پیدا نشد'
            : `${toFa(results.length)} نتیجه · جمع هزینه ${fmtAmount(total)}`}
        </div>
      )}

      <div className={s.list}>
        {!q.trim() ? (
          <div className={s.empty}>
            <div className={s.emptyIcon}>🔍</div>
            <p>اسم خرج یا دسته‌بندی رو بنویس</p>
            <span>مثلاً «رستوران»، «خوراک» یا «اینترنت»</span>
          </div>
        ) : loading ? (
          <div className={s.empty}><div className={s.emptyIcon}>⋯</div></div>
        ) : results.length === 0 ? (
          <div className={s.empty}><div className={s.emptyIcon}>○</div><p>چیزی پیدا نشد</p></div>
        ) : results.map(t => {
          const col = CAT_COLORS[t.type === 'income' ? 'درآمد' : t.category] || CAT_COLORS['سایر']
          const member = getMember(t.user_id)
          return (
            <div key={t.id} className={s.row}>
              <MemberAvatar member={member} size={36} />
              <div className={s.info}>
                <span className={s.badge} style={{ background: col.bg, color: col.c }}>{t.type === 'income' ? 'درآمد' : t.category}</span>
                <div className={s.desc}>{t.description}</div>
                <div className={s.sub}>{toFa(t.jd)} {MONTHS[t.jm - 1]} {toFa(t.jy)} · {member?.display_name || '؟'}</div>
              </div>
              <div className={s.amt} style={{ color: t.type === 'expense' ? '#FF6B6B' : '#34D39A' }}>
                {t.type === 'expense' ? '−' : '+'}&#x200F;{fmtAmount(t.amount)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
