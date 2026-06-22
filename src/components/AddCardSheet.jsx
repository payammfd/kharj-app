import { useState } from 'react'
import { BANKS } from '../lib/supabase'
import { usePlan } from '../hooks/usePlan.jsx'
import BottomSheet from './BottomSheet'
import styles from './Forms.module.css'

export default function AddCardSheet({ onClose, onAdded }) {
  const { addCard } = usePlan()
  const [bank, setBank] = useState('melat')
  const [num, setNum] = useState('')
  const [holder, setHolder] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [balance, setBalance] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  function fmtNum(val) {
    let v = val.replace(/\D/g,'').substring(0,16)
    return v.replace(/(.{4})/g,'$1  ').trim()
  }
  function fmtExp(val) {
    let v = val.replace(/\D/g,'')
    if (v.length >= 2) v = v.substring(0,2) + '/' + v.substring(2,4)
    return v
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const cleanNum = num.replace(/\s/g,'')
    if (cleanNum.length < 16) return setErr('شماره کارت ۱۶ رقم باشه')
    setLoading(true); setErr('')
    try {
      await addCard({
        bank_name: BANKS[bank]?.label || 'بانک',
        card_number: cleanNum,
        card_holder: holder.trim(),
        expiry: expiry,
        balance: parseInt(balance) || 0,
        color_class: bank,
      })
      onAdded()
    } catch(e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BottomSheet title="افزودن کارت بانکی" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        <div className={styles.bankGrid}>
          {Object.entries(BANKS).map(([key, b]) => (
            <div key={key}
              className={`${styles.bankOpt} ${bank===key?styles.sel:''}`}
              onClick={()=>setBank(key)}>
              <div className={styles.bankDot} style={{background:b.gradient.match(/,([^,]+)$/)?.[1]?.trim()||'#555'}}/>
              {b.label}
            </div>
          ))}
        </div>

        <div className={styles.field}>
          <label className={styles.lbl}>شماره کارت</label>
          <input className={styles.inpLtr} type="text" value={num}
            onChange={e=>setNum(fmtNum(e.target.value))} placeholder="xxxx  xxxx  xxxx  xxxx" maxLength={22}/>
        </div>

        <div className={styles.inpRow2}>
          <div className={styles.field}>
            <label className={styles.lbl}>تاریخ انقضا</label>
            <input className={styles.inpLtr} type="text" value={expiry}
              onChange={e=>setExpiry(fmtExp(e.target.value))} placeholder="MM/YY" maxLength={5}/>
          </div>
          <div className={styles.field}>
            <label className={styles.lbl}>CVV2</label>
            <input className={styles.inpLtr} type="password" value={cvv}
              onChange={e=>setCvv(e.target.value)} placeholder="•••" maxLength={4}/>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.lbl}>نام صاحب کارت</label>
          <input className={styles.inpLtr} type="text" value={holder}
            onChange={e=>setHolder(e.target.value)} placeholder="FIRST LAST"/>
        </div>

        <div className={styles.field}>
          <label className={styles.lbl}>موجودی فعلی (تومان)</label>
          <input type="number" value={balance} onChange={e=>setBalance(e.target.value)} placeholder="مثلاً 18500000"/>
        </div>

        {err && <p style={{color:'var(--red)',fontSize:'0.82rem',textAlign:'center'}}>{err}</p>}
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading?'...':'افزودن کارت'}
        </button>
      </form>
    </BottomSheet>
  )
}
