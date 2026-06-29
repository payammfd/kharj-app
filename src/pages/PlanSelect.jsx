import { HomeIcon } from '../lib/icons'
import s from './PlanSelect.module.css'

export default function PlanSelect({ user, allPlans, actions }) {
  return (
    <div className={s.wrap}>
      <div className={s.glow}/>
      <div className={s.content}>
        <img src="/logo.png" className={s.logo} alt="خرج" />
        <h1 className={s.title}>کدوم پلن؟</h1>
        <p className={s.sub}>چند پلن داری، یکی رو انتخاب کن</p>
        <div className={s.list}>
          {allPlans.map(p => (
            <button key={p.id} className={s.planCard} onClick={()=>actions.selectPlan(p)}>
              <div className={s.planAvatar}>
                {p.avatar_url?<img src={p.avatar_url} alt="" className={s.planImg}/>:<HomeIcon size={22} color="rgba(255,255,255,0.6)"/>}
              </div>
              <div className={s.planInfo}>
                <div className={s.planName}>{p.name}</div>
                <div className={s.planCode}>{p.invite_code}</div>
              </div>
              <div className={s.arrow}>›</div>
            </button>
          ))}
        </div>
        <p className={s.email}>{user?.email}</p>
      </div>
    </div>
  )
}
