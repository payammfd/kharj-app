// src/components/AddSheet.jsx
import { useState } from 'react'
import { supabase, MONTHS, toFa, jalaliMonthDays } from '../lib/supabase'
import styles from './Sheet.module.css'

const CATEGORIES = ['خوراک','حمل و نقل','آب، برق، گاز','اینترنت','سلامت','پوشاک','تفریح','آموزش','سایر']

export default function AddSheet({ plan, user, today, onClose, onAdded }) {
  const [type, setType] = useState('expense')
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState('خوراک')
  const [jy, setJy] = useState(today[0])
  const [jm, setJm] = useState(today[1])
  const [jd, setJd] = useState(today[2])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  function handleMonthChange(newJm) {
    setJm(newJm)
    const maxDay = jalaliMonthDays(jy, newJm)
    if (jd > maxDay) setJd(maxDay)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const num = parseInt(amount.replace(/,/g, ''))
    if (!desc.trim() || !num || num <= 0) return setErr('مبلغ و توضیح رو وارد کن')
    setLoading(true); setErr('')
    const { error } = await supabase.from('transactions').insert({
      plan_id: plan.id,
      user_id: user.id,
      jy, jm, jd,
      description: desc.trim(),
      amount: num,
      type,
      category: type === 'income' ? 'درآمد' : cat
    })
    if (error) { setErr(error.message); setLoading(false); return }
    onAdded()
  }

  const days = jalaliMonthDays(jy, jm)

  return (
    <div className={styles.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>تراکنش جدید</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Type Toggle */}
          <div className={styles.typeToggle}>
            <button type="button"
              className={`${styles.typeBtn} ${type==='expense'?styles.typeActive:''}`}
              style={type==='expense'?{background:'var(--red-soft)',color:'var(--red)'}:{}}
              onClick={()=>setType('expense')}>هزینه</button>
            <button type="button"
              className={`${styles.typeBtn} ${type==='income'?styles.typeActive:''}`}
              style={type==='income'?{background:'var(--green-soft)',color:'var(--green)'}:{}}
              onClick={()=>setType('income')}>درآمد</button>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>توضیح</label>
            <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="مثلاً: خرید سوپرمارکت" />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>مبلغ (تومان)</label>
            <input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={e=>setAmount(e.target.value)}
              placeholder="مثلاً: 250000"
            />
          </div>

          {type === 'expense' && (
            <div className={styles.field}>
              <label className={styles.label}>دسته‌بندی</label>
              <div className={styles.catGrid}>
                {CATEGORIES.map(c => (
                  <button key={c} type="button"
                    className={`${styles.catChip} ${cat===c?styles.catActive:''}`}
                    onClick={()=>setCat(c)}>{c}</button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>تاریخ</label>
            <div className={styles.dateRow}>
              <select value={jy} onChange={e=>setJy(parseInt(e.target.value))}>
                {[today[0]-1, today[0]].map(y=>(
                  <option key={y} value={y}>{toFa(y)}</option>
                ))}
              </select>
              <select value={jm} onChange={e=>handleMonthChange(parseInt(e.target.value))}>
                {MONTHS.map((m,i)=>(
                  <option key={i} value={i+1}>{m}</option>
                ))}
              </select>
              <select value={jd} onChange={e=>setJd(parseInt(e.target.value))}>
                {Array.from({length:days},(_,i)=>i+1).map(d=>(
                  <option key={d} value={d}>{toFa(d)}</option>
                ))}
              </select>
            </div>
          </div>

          {err && <p className={styles.err}>{err}</p>}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? '...' : 'ثبت'}
          </button>
        </form>
      </div>
    </div>
  )
}
