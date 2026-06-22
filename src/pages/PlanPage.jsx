import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { usePlan } from '../hooks/usePlan.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import MemberAvatar from '../components/MemberAvatar'
import s from './PlanPage.module.css'

export default function PlanPage() {
  const { user, signOut } = useAuth()
  const { plan, members, updatePlan } = usePlan()
  const [name, setName] = useState(plan?.name || '')
  const [avatarUrl, setAvatarUrl] = useState(plan?.avatar_url || '')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const fileRef = useRef()

  async function handleSave() {
    setLoading(true)
    try {
      await updatePlan({ name: name.trim() || plan.name, avatar_url: avatarUrl || null })
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function handleAvatar(e) {
    const file = e.target.files?.[0]; if (!file) return
    setLoading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `plans/${plan.id}.${ext}`
      await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = data.publicUrl + '?t=' + Date.now()
      setAvatarUrl(url)
    } catch(e) { console.error(e) }
    finally { setLoading(false) }
  }

  function copyCode() {
    navigator.clipboard.writeText(plan?.invite_code || '')
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={s.page}>
      <div className={s.glow}/>
      <header className={s.hdr}>
        <h1 className={s.title}>پلن</h1>
      </header>

      <div className={s.avatarSec}>
        <div className={s.avatarWrap} onClick={() => fileRef.current?.click()}>
          {avatarUrl
            ? <img src={avatarUrl} alt="" className={s.avatarImg}/>
            : <span style={{fontSize:'40px'}}>🏠</span>
          }
          <div className={s.avatarOverlay}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatar}/>
        <p className={s.avatarHint}>برای تغییر عکس پلن کلیک کن</p>
      </div>

      <div className={s.fields}>
        <div className={s.field}>
          <label className={s.lbl}>اسم پلن</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="اسم پلن رو وارد کن"/>
        </div>
      </div>

      <button className={s.saveBtn} onClick={handleSave} disabled={loading}>
        {loading?'...':saved?'✓ ذخیره شد':'ذخیره تغییرات'}
      </button>

      {/* Invite Code */}
      <div className={s.section}>
        <div className={s.sectionTitle}>کد دعوت</div>
        <div className={s.inviteBox}>
          <div className={s.inviteLbl}>این کد رو به اعضای جدید بده</div>
          <div className={s.inviteCode}>{plan?.invite_code}</div>
          <button className={s.copyBtn} onClick={copyCode}>{copied?'✓ کپی شد':'کپی کد ←'}</button>
        </div>
      </div>

      {/* Members */}
      <div className={s.section}>
        <div className={s.sectionTitle}>اعضا ({members.length})</div>
        <div className={s.memberList}>
          {members.map(m => (
            <div key={m.user_id} className={s.memberRow}>
              <MemberAvatar member={m} size={40}/>
              <div className={s.memberInfo}>
                <div className={s.memberName}>{m.display_name}</div>
                <div className={s.memberDate}>
                  {m.user_id === user?.id ? 'شما' : 'عضو'}
                </div>
              </div>
              {m.user_id === user?.id && <div className={s.youBadge}>شما</div>}
            </div>
          ))}
        </div>
      </div>

      <button className={s.signOutBtn} onClick={signOut}>خروج از حساب</button>
    </div>
  )
}
