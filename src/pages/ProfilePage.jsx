import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import MemberAvatar from '../components/MemberAvatar'
import ImageCropper from '../components/ImageCropper'
import s from './ProfilePage.module.css'

export default function ProfilePage({ user, plan, members, actions }) {
  const myMember = members.find(m=>m.user_id===user?.id)
  const [displayName, setDisplayName] = useState(myMember?.display_name||'')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef()
  // تغییر رمز عبور
  const [pw1, setPw1] = useState('')
  const [pw2, setPw2] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [cropFile, setCropFile] = useState(null)
  const [avatarErr, setAvatarErr] = useState('')

  async function handleSave(){
    setLoading(true)
    try {
      await supabase.from('plan_members').update({display_name:displayName.trim()}).eq('plan_id',plan.id).eq('user_id',user.id)
      await supabase.auth.updateUser({data:{full_name:displayName.trim()}})
      setSaved(true); setTimeout(()=>setSaved(false),2000)
    }catch(e){console.error(e)}finally{setLoading(false)}
  }

  async function handleChangePassword(){
    setPwErr(''); setPwMsg('')
    if(pw1.length<6) return setPwErr('رمز باید حداقل ۶ کاراکتر باشد')
    if(pw1!==pw2) return setPwErr('رمزها یکسان نیستند')
    setPwLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 })
      if(error) throw error
      setPw1(''); setPw2('')
      setPwMsg('رمز عبور تغییر کرد ✓'); setTimeout(()=>setPwMsg(''),2500)
    }catch(e){
      setPwErr(e.message?.toLowerCase().includes('same') ? 'رمز جدید با رمز فعلی یکیه' : (e.message||'خطا در تغییر رمز'))
    }finally{setPwLoading(false)}
  }

  function pickAvatar(e){
    const file=e.target.files?.[0]
    e.target.value=''
    if(file){ setAvatarErr(''); setCropFile(file) }
  }

  async function uploadCropped(blob){
    setLoading(true); setAvatarErr('')
    try {
      const path=`avatars/${user.id}.jpg`
      const { error:upErr }=await supabase.storage.from('avatars')
        .upload(path,blob,{upsert:true,contentType:'image/jpeg'})
      if(upErr) throw upErr
      const {data}=supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.auth.updateUser({data:{avatar_url:data.publicUrl+'?t='+Date.now()}})
      await actions.reloadMembers?.()   // تا عکس بلافاصله تو UI به‌روز شه
      setCropFile(null)
    }catch(e){
      console.error(e)
      setAvatarErr('آپلود عکس ناموفق بود، دوباره تلاش کن')
    }finally{setLoading(false)}
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
        <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={pickAvatar}/>
        <p className={s.avatarHint}>برای تغییر عکس کلیک کن</p>
        {avatarErr&&<p className={s.avatarErr}>{avatarErr}</p>}
      </div>
      <div className={s.fields}>
        <div className={s.field}><label className={s.lbl}>اسم نمایشی</label><input value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="اسمت"/></div>
        <div className={s.field}><label className={s.lbl}>ایمیل</label><input value={user?.email||''} disabled style={{opacity:0.5}}/></div>
      </div>
      <button className={s.saveBtn} onClick={handleSave} disabled={loading}>{loading?'...':saved?'✓ ذخیره شد':'ذخیره'}</button>

      <div className={s.section}>
        <div className={s.sectionTitle}>تغییر رمز عبور</div>
        {pwErr&&<div className={s.msgErr}>{pwErr}</div>}
        {pwMsg&&<div className={s.msgOk}>{pwMsg}</div>}
        <div className={s.fields}>
          <div className={s.field}><label className={s.lbl}>رمز جدید</label><input type="password" value={pw1} onChange={e=>setPw1(e.target.value)} placeholder="حداقل ۶ کاراکتر" dir="ltr"/></div>
          <div className={s.field}><label className={s.lbl}>تکرار رمز جدید</label><input type="password" value={pw2} onChange={e=>setPw2(e.target.value)} placeholder="دوباره وارد کن" dir="ltr"/></div>
        </div>
        <button className={s.pwBtn} onClick={handleChangePassword} disabled={pwLoading||!pw1||!pw2}>{pwLoading?'...':'تغییر رمز'}</button>
      </div>

      <button className={s.signOutBtn} onClick={actions.signOut}>خروج از حساب</button>
      {cropFile&&<ImageCropper file={cropFile} onCancel={()=>setCropFile(null)} onConfirm={uploadCropped}/>}
    </div>
  )
}
