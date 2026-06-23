import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import MemberAvatar from '../components/MemberAvatar'
import s from './ProfilePage.module.css'

export default function ProfilePage({ user, plan, members, actions }) {
  const myMember = members.find(m=>m.user_id===user?.id)
  const [displayName, setDisplayName] = useState(myMember?.display_name||'')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()

  async function handleSave(){
    setLoading(true)
    try {
      await supabase.from('plan_members').update({display_name:displayName.trim()}).eq('plan_id',plan.id).eq('user_id',user.id)
      await supabase.auth.updateUser({data:{full_name:displayName.trim()}})
      setSaved(true); setTimeout(()=>setSaved(false),2000)
    }catch(e){console.error(e)}finally{setLoading(false)}
  }

  async function handleAvatar(e){
    const file=e.target.files?.[0];if(!file)return
    setLoading(true)
    try {
      const ext=file.name.split('.').pop(),path=`avatars/${user.id}.${ext}`
      await supabase.storage.from('avatars').upload(path,file,{upsert:true})
      const {data}=supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.auth.updateUser({data:{avatar_url:data.publicUrl+'?t='+Date.now()}})
    }catch(e){console.error(e)}finally{setLoading(false)}
  }

  return (
    <div className={s.page}>
      <div className={s.glow}/>
      <header className={s.hdr}><h1 className={s.title}>پروفایل</h1></header>
      <div className={s.avatarSec}>
        <div className={s.avatarWrap} onClick={()=>fileRef.current?.click()}>
          <MemberAvatar member={myMember} size={90}/>
          <div className={s.avatarOverlay}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatar}/>
        <p className={s.avatarHint}>برای تغییر عکس کلیک کن</p>
      </div>
      <div className={s.fields}>
        <div className={s.field}><label className={s.lbl}>اسم نمایشی</label><input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="اسمت"/></div>
        <div className={s.field}><label className={s.lbl}>ایمیل</label><input value={user?.email||''} disabled style={{opacity:0.5}}/></div>
      </div>
      <button className={s.saveBtn} onClick={handleSave} disabled={loading}>{loading?'...':saved?'✓ ذخیره شد':'ذخیره'}</button>
      <button className={s.signOutBtn} onClick={actions.signOut}>خروج از حساب</button>
    </div>
  )
}
