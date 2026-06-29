import s from './Onboarding.module.css'

export default function Onboarding({ onStart }) {
  return (
    <div className={s.wrap}>
      <div className={s.glow1}/><div className={s.glow2}/>

      <div className={s.hero}>
        <img src="/logo.png" className={s.logo} alt="خرج" />
        <h1 className={s.name}>خرج</h1>
        <p className={s.slogan}>خرج‌های خانواده،<br/>ساده و شفاف</p>
      </div>

      <button className={s.cta} onClick={onStart}>شروع کنیم</button>
    </div>
  )
}
