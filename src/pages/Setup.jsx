import { useState } from 'react'
import { usePlan } from '../hooks/usePlan.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import s from './Setup.module.css'

export default function Setup() {
  const { user } = useAuth()
  const { createPlan, joinPlan } = usePlan()
  const [tab, setTab] = useState('join') // default to join - most common case
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.full_name?.split(' ')[0] || ''
  )
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

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
    <div className={s.wrap}>
      <div className={s.content}>

        {/* User info */}
        <div className={s.userBadge}>
          {user?.user_metadata?.avatar_url && (
            <img src={user.user_metadata.avatar_url} alt="" className={s.userAvatar}/>
          )}
          <span className={s.userEmail}>{user?.email}</span>
        </div>

        <h1 className={s.title}>به کدوم پلن وصل شیم؟</h1>
        <p className={s.sub}>اگه پلن داری کدش رو وارد کن، وگرنه یه پلن جدید بساز</p>

        {/* Tabs */}
        <div className={s.tabs}>
          <button
            className={`${s.tab} ${tab==='join'?s.active:''}`}
            onClick={()=>{ setTab('join'); setErr('') }}>
            پیوستن به پلن
          </button>
          <button
            className={`${s.tab} ${tab==='create'?s.active:''}`}
            onClick={()=>{ setTab('create'); setErr('') }}>
            پلن جدید
          </button>
        </div>

        <form onSubmit={tab==='join'?handleJoin:handleCreate} className={s.form}>

          <div className={s.field}>
            <label className={s.lbl}>اسم نمایشی تو</label>
            <input
              value={displayName}
              onChange={e=>setDisplayName(e.target.value)}
              placeholder="مثلاً: علی"
            />
          </div>

          {tab === 'join' ? (
            <div className={s.field}>
              <label className={s.lbl}>کد دعوت پلن</label>
              <input
                value={code}
                onChange={e=>setCode(e.target.value.toUpperCase())}
                placeholder="مثلاً: 209BCDCF"
                style={{letterSpacing:'0.2em', textAlign:'center', direction:'ltr'}}
                autoFocus
              />
              <span className={s.hint}>کد رو از عضو دیگه پلن بگیر</span>
            </div>
          ) : (
            <div className={s.field}>
              <label className={s.lbl}>اسم پلن (اختیاری)</label>
              <input
                value={name}
                onChange={e=>setName(e.target.value)}
                placeholder="مثلاً: خانه ما"
              />
            </div>
          )}

          {err && <p className={s.err}>{err}</p>}

          <button className={s.btn} type="submit" disabled={loading}>
            {loading ? '...' : tab==='join' ? 'پیوستن به پلن' : 'ساخت پلن جدید'}
          </button>
        </form>

      </div>
    </div>
  )
}
