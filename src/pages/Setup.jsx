// src/pages/Setup.jsx
import { useState } from 'react'
import { usePlan } from '../hooks/usePlan.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import styles from './Setup.module.css'

export default function Setup() {
  const { user } = useAuth()
  const { createPlan, joinPlan } = usePlan()
  const [tab, setTab] = useState('create') // 'create' | 'join'
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const defaultName = user?.user_metadata?.full_name?.split(' ')[0] || ''

  async function handleCreate(e) {
    e.preventDefault()
    if (!displayName.trim()) return setErr('اسمت رو وارد کن')
    setLoading(true); setErr('')
    try { await createPlan(name || 'خانه ما', displayName) }
    catch(e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!code.trim() || !displayName.trim()) return setErr('همه فیلدها رو پر کن')
    setLoading(true); setErr('')
    try { await joinPlan(code, displayName) }
    catch(e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.content}>
        <h1 className={styles.title}>راه‌اندازی</h1>
        <p className={styles.sub}>یه پلن مشترک بساز یا به پلن همسرت بپیوند</p>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab==='create'?styles.active:''}`} onClick={()=>setTab('create')}>
            پلن جدید
          </button>
          <button className={`${styles.tab} ${tab==='join'?styles.active:''}`} onClick={()=>setTab('join')}>
            پیوستن
          </button>
        </div>

        <form onSubmit={tab==='create'?handleCreate:handleJoin} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>اسمت چیه؟</label>
            <input
              value={displayName}
              onChange={e=>setDisplayName(e.target.value)}
              placeholder={defaultName || 'مثلاً: علی'}
            />
          </div>

          {tab === 'create' ? (
            <div className={styles.field}>
              <label className={styles.label}>اسم پلن (اختیاری)</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="خانه ما" />
            </div>
          ) : (
            <div className={styles.field}>
              <label className={styles.label}>کد دعوت</label>
              <input
                value={code}
                onChange={e=>setCode(e.target.value.toUpperCase())}
                placeholder="XXXXXXXX"
                style={{letterSpacing:'0.2em', textAlign:'center'}}
              />
            </div>
          )}

          {err && <p className={styles.err}>{err}</p>}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? '...' : tab==='create' ? 'ساخت پلن' : 'پیوستن به پلن'}
          </button>
        </form>
      </div>
    </div>
  )
}
