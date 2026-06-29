import { useState } from 'react'
import s from './Login.module.css'

export default function Login({ actions }) {
  const [mode, setMode] = useState('signin') // signin | signup | otp
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSignup(e) {
    e.preventDefault()
    setError(''); setInfo('')
    if (!form.firstName.trim()) return setError('نام را وارد کنید')
    if (!form.email.trim()) return setError('ایمیل را وارد کنید')
    if (form.password.length < 6) return setError('رمز عبور باید حداقل ۶ کاراکتر باشد')
    setLoading(true)
    try {
      const { needsOtp } = await actions.signUp(form)
      if (needsOtp) {
        setMode('otp')
        setInfo('کد تایید به ایمیل شما ارسال شد')
      }
      // اگه needsOtp false باشه، session ساخته شده و App خودش رد میشه
    } catch (err) {
      setError(translateErr(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleSignin(e) {
    e.preventDefault()
    setError(''); setInfo('')
    if (!form.email.trim()) return setError('ایمیل را وارد کنید')
    if (!form.password) return setError('رمز عبور را وارد کنید')
    setLoading(true)
    try {
      const { needsOtp } = await actions.signInWithPassword(form)
      if (needsOtp) {
        setMode('otp')
        setInfo('ایمیل شما هنوز تایید نشده. کد تایید ارسال شد')
      }
    } catch (err) {
      setError(translateErr(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e) {
    e.preventDefault()
    setError(''); setInfo('')
    if (otp.trim().length < 6) return setError('کد ۶ رقمی را کامل وارد کنید')
    setLoading(true)
    try {
      await actions.verifyOtp({ email: form.email, token: otp })
      // موفق → session ساخته میشه → App خودش رد میشه
    } catch (err) {
      setError(translateErr(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError(''); setInfo('')
    try {
      await actions.resendOtp(form.email)
      setInfo('کد جدید ارسال شد')
    } catch (err) {
      setError(translateErr(err))
    }
  }

  return (
    <div className={s.wrap}>
      <div className={s.glow1}/><div className={s.glow2}/>
      <div className={s.content}>
        <img src="/logo.png" className={s.logo} alt="خرج" />
        <h1 className={s.appName}>خرج</h1>
        <p className={s.tagline}>دفتر هزینه مشترک خانواده</p>

        {error && <div className={s.error}>{error}</div>}
        {info && <div className={s.info}>{info}</div>}

        {mode === 'signin' && (
          <form className={s.form} onSubmit={handleSignin}>
            <input className={s.input} type="email" inputMode="email" autoComplete="email"
              placeholder="ایمیل" value={form.email} onChange={set('email')} dir="ltr"/>
            <input className={s.input} type="password" autoComplete="current-password"
              placeholder="رمز عبور" value={form.password} onChange={set('password')} dir="ltr"/>
            <button className={s.primaryBtn} type="submit" disabled={loading}>
              {loading ? '...' : 'ورود'}
            </button>
            <button type="button" className={s.linkBtn}
              onClick={() => { setMode('signup'); setError(''); setInfo('') }}>
              حساب ندارید؟ ثبت‌نام کنید
            </button>
          </form>
        )}

        {mode === 'signup' && (
          <form className={s.form} onSubmit={handleSignup}>
            <div className={s.row}>
              <input className={s.input} placeholder="نام" value={form.firstName} onChange={set('firstName')}/>
              <input className={s.input} placeholder="نام خانوادگی" value={form.lastName} onChange={set('lastName')}/>
            </div>
            <input className={s.input} type="email" inputMode="email" autoComplete="email"
              placeholder="ایمیل" value={form.email} onChange={set('email')} dir="ltr"/>
            <input className={s.input} type="password" autoComplete="new-password"
              placeholder="رمز عبور (حداقل ۶ کاراکتر)" value={form.password} onChange={set('password')} dir="ltr"/>
            <button className={s.primaryBtn} type="submit" disabled={loading}>
              {loading ? '...' : 'ثبت‌نام'}
            </button>
            <button type="button" className={s.linkBtn}
              onClick={() => { setMode('signin'); setError(''); setInfo('') }}>
              قبلاً ثبت‌نام کرده‌اید؟ ورود
            </button>
          </form>
        )}

        {mode === 'otp' && (
          <form className={s.form} onSubmit={handleVerify}>
            <p className={s.hint}>کد ۶ رقمی ارسال‌شده به <b dir="ltr">{form.email}</b> را وارد کنید</p>
            <input className={s.input} inputMode="numeric" autoComplete="one-time-code"
              placeholder="------" value={otp} maxLength={6}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              dir="ltr" style={{ textAlign: 'center', letterSpacing: '0.4em', fontSize: '1.3rem' }}/>
            <button className={s.primaryBtn} type="submit" disabled={loading}>
              {loading ? '...' : 'تایید'}
            </button>
            <button type="button" className={s.linkBtn} onClick={handleResend}>
              کد را دریافت نکردید؟ ارسال مجدد
            </button>
            <button type="button" className={s.linkBtn}
              onClick={() => { setMode('signin'); setOtp(''); setError(''); setInfo('') }}>
              بازگشت
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function translateErr(err) {
  const m = (err?.message || '').toLowerCase()
  if (m.includes('invalid login') || m.includes('invalid credentials')) return 'ایمیل یا رمز عبور اشتباه است'
  if (m.includes('already registered') || m.includes('already been registered')) return 'این ایمیل قبلاً ثبت شده است'
  if (m.includes('token has expired') || m.includes('invalid') && m.includes('otp')) return 'کد نامعتبر یا منقضی شده است'
  if (m.includes('expired')) return 'کد منقضی شده است، دوباره ارسال کنید'
  if (m.includes('rate limit') || m.includes('too many')) return 'تعداد درخواست‌ها زیاد است، کمی صبر کنید'
  if (m.includes('password') && m.includes('6')) return 'رمز عبور باید حداقل ۶ کاراکتر باشد'
  return err?.message || 'خطایی رخ داد، دوباره تلاش کنید'
}
