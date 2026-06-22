import { useState } from 'react'
import { supabase, MONTHS, toFa, jalaliMonthDays, BANKS } from '../lib/supabase'
import BottomSheet from './BottomSheet'
import styles from './Forms.module.css'

const CATS = ['خوراک','حمل و نقل','آب، برق، گاز','اینترنت','سلامت','پوشاک','تفریح','آموزش','سایر']
const CAT_ICONS = {'خوراک':'🛒','حمل و نقل':'🚗','آب، برق، گاز':'💡','اینترنت':'📶','سلامت':'💊','پوشاک':'👕','تفریح':'🎮','آموزش':'📚','سایر':'📌'}

export default function AddTransactionSheet({ plan, user, today, cards, onClose, onAdded }) {
  const [type, setType] = useState('expense')
  const [desc, setDesc] = useState('')
  const [amount, setAmount] = useState('')
  const [cat, setCat] = useState('خوراک')
  const [cardId, setCardId] = useState('')
  const [jy, setJy] = useState(today[0])
  const [jm, setJm] = useState(today[1])
  const [jd, setJd] = useState(today[2])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const days = jm <= 6 ? 31 : jm <= 11 ? 30 : 29

  async function handleSubmit(e) {
    e.preventDefault()
    const num = parseInt(amount.replace(/[^0-9]/g,''))
    if (!desc.trim() || !num || num <= 0) return setErr('مبلغ و توضیح رو وارد کن')
    setLoading(true); setErr('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setErr('لطفاً دوباره وارد شوید'); setLoading(false); return }
    const { error } = await supabase.from('transactions').insert({
      plan_id: plan.id, user_id: session.user.id,
      jy, jm, jd, description: desc.trim(), amount: num,
      type, category: type === 'income' ? 'درآمد' : cat,
      card_id: cardId || null
    })
    if (error) { setErr(error.message); setLoading(false); return }
    onAdded()
  }

  return (
    <BottomSheet title="تراکنش جدید" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
        {/* Type */}
        <div className={styles.typeRow}>
          <button type="button" className={`${styles.typeBtn} ${type==='expense'?styles.expense:''}`}
            onClick={()=>setType('expense')}>− هزینه</button>
          <button type="button" className={`${styles.typeBtn} ${type==='income'?styles.income:''}`}
            onClick={()=>setType('income')}>+ درآمد</button>
        </div>

        <div className={styles.field}>
          <label className={styles.lbl}>توضیح</label>
          <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="مثلاً: خرید سوپرمارکت" />
        </div>

        <div className={styles.field}>
          <label className={styles.lbl}>مبلغ (تومان)</label>
          <input type="number" inputMode="numeric" value={amount}
            onChange={e=>setAmount(e.target.value)} placeholder="مثلاً: 250000" />
        </div>

        {type === 'expense' && (
          <div className={styles.field}>
            <label className={styles.lbl}>دسته‌بندی</label>
            <div className={styles.catGrid}>
              {CATS.map(c => (
                <button key={c} type="button"
                  className={`${styles.catBtn} ${cat===c?styles.catActive:''}`}
                  onClick={()=>setCat(c)}>
                  {CAT_ICONS[c]} {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {cards.length > 0 && (
          <div className={styles.field}>
            <label className={styles.lbl}>کارت بانکی (اختیاری)</label>
            <select value={cardId} onChange={e=>setCardId(e.target.value)} style={{background:'var(--bg-el)',color:'var(--text)'}}>
              <option value="">بدون کارت</option>
              {cards.map(c => (
                <option key={c.id} value={c.id}>
                  {BANKS[c.color_class]?.label || 'بانک'} — {c.card_number?.slice(-4)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.field}>
          <label className={styles.lbl}>تاریخ</label>
          <div className={styles.dateRow}>
            <select value={jy} onChange={e=>setJy(parseInt(e.target.value))} style={{background:'var(--bg-el)',color:'var(--text)'}}>
              <option value={1405}>{toFa(1405)}</option>
            </select>
            <select value={jm} onChange={e=>{setJm(parseInt(e.target.value));setJd(1)}} style={{background:'var(--bg-el)',color:'var(--text)'}}>
              {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
            </select>
            <select value={jd} onChange={e=>setJd(parseInt(e.target.value))} style={{background:'var(--bg-el)',color:'var(--text)'}}>
              {Array.from({length:days},(_,i)=>i+1).map(d=><option key={d} value={d}>{toFa(d)}</option>)}
            </select>
          </div>
        </div>

        {err && <p style={{color:'var(--red)',fontSize:'0.82rem',textAlign:'center'}}>{err}</p>}
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading?'...':'ثبت تراکنش'}
        </button>
      </form>
    </BottomSheet>
  )
}
