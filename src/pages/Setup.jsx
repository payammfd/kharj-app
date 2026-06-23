import { useState } from 'react'
import s from './Setup.module.css'

export default function Setup({ user, actions }) {
  const [tab, setTab] = useState('join')
  const [planName, setPlanName] = useState('')
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name?.split(' ')[0]||'')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!displayName.trim()) return setErr('اسمت رو وارد کن')
    if (tab==='join' && !code.trim()) return setErr('کد دعوت رو وارد کن')
    setLoading(true); setErr('')
    try {
      if (tab==='join') await actions.joinPlan(code, displayName)
      else await actions.createPlan(planName, displayName)
    } catch(e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className={s.wrap}>
      <div className={s.glow}/>
      <div className={s.content}>
        <div className={s.userChip}>
          {user?.user_metadata?.avatar_url && <img src={user.user_metadata.avatar_url} alt="" className={s.chipAvatar}/>}
          <span>{user?.email}</span>
        </div>
        <h1 className={s.title}>شروع کن</h1>
        <p className={s.sub}>به پلن موجود بپیوند یا یه پلن جدید بساز</p>
        <div className={s.tabs}>
          <button className={`${s.tab} ${tab==='join'?s.active:''}`} onClick={()=>{setTab('join');setErr('')}}>پیوستن با کد</button>
          <button className={`${s.tab} ${tab==='create'?s.active:''}`} onClick={()=>{setTab('create');setErr('')}}>پلن جدید</button>
        </div>
        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.field}>
            <label className={s.lbl}>اسم نمایشی تو</label>
            <input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="مثلاً: علی"/>
          </div>
          {tab==='join' ? (
            <div className={s.field}>
              <label className={s.lbl}>کد دعوت</label>
              <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())}
                placeholder="مثلاً: 209BCDCF" style={{letterSpacing:'0.25em',textAlign:'center',direction:'ltr'}} autoFocus/>
            </div>
          ) : (
            <div className={s.field}>
              <label className={s.lbl}>اسم پلن</label>
              <input value={planName} onChange={e=>setPlanName(e.target.value)} placeholder="مثلاً: خانه ما"/>
            </div>
          )}
          {err && <p className={s.err}>{err}</p>}
          <button className={s.btn} type="submit" disabled={loading}>
            {loading?'...':tab==='join'?'پیوستن':'ساختن پلن'}
          </button>
        </form>
      </div>
    </div>
  )
}
