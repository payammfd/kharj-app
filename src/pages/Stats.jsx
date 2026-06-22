import { useState, useEffect } from 'react'
import { supabase, MONTHS, toFa, todayJalali, fmtAmount } from '../lib/supabase'
import { usePlan } from '../hooks/usePlan.jsx'
import s from './Stats.module.css'

const CAT_COLORS_HEX = {
  'خوراک':'#EF9F27','حمل و نقل':'#A89DFF','آب، برق، گاز':'#34D39A',
  'اینترنت':'#7B6EFF','سلامت':'#FF8080','پوشاک':'#FF85B4',
  'تفریح':'#FF9A6C','آموزش':'#6BBFFF','سایر':'#9090A0','درآمد':'#34D39A'
}

export default function Stats() {
  const { plan } = usePlan()
  const [today] = useState(() => todayJalali())
  const [vm, setVm] = useState(() => ({ jy: today[0], jm: today[1] }))
  const [txs, setTxs] = useState([])
  const [view, setView] = useState('donut') // donut | bar | list

  useEffect(() => {
    if (!plan) return
    supabase.from('transactions').select('*')
      .eq('plan_id', plan.id).eq('jy', vm.jy).eq('jm', vm.jm)
      .then(({ data }) => setTxs(data || []))
  }, [plan, vm])

  const expenses = txs.filter(t=>t.type==='expense')
  const income = txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)
  const totalExp = expenses.reduce((s,t)=>s+t.amount,0)

  const byCategory = {}
  expenses.forEach(t => { byCategory[t.category]=(byCategory[t.category]||0)+t.amount })
  const sorted = Object.entries(byCategory).sort((a,b)=>b[1]-a[1])
  const max = sorted[0]?.[1] || 1

  // Donut segments
  function buildDonut() {
    const r = 70, cx = 90, cy = 90, stroke = 28
    const circ = 2 * Math.PI * r
    let offset = 0
    return sorted.map(([cat, amt]) => {
      const pct = amt / totalExp
      const dash = pct * circ
      const seg = { cat, amt, pct, dash, offset, color: CAT_COLORS_HEX[cat]||'#9090A0' }
      offset += dash
      return seg
    })
  }
  const segments = buildDonut()

  const isMin = vm.jy===1405 && vm.jm===1
  const isCur = vm.jy===today[0] && vm.jm===today[1]
  function prevMonth(){if(isMin)return;setVm(p=>p.jm===1?{jy:p.jy-1,jm:12}:{jy:p.jy,jm:p.jm-1})}
  function nextMonth(){if(isCur)return;setVm(p=>p.jm===12?{jy:p.jy+1,jm:1}:{jy:p.jy,jm:p.jm+1})}

  return (
    <div className={s.page}>
      <div className={s.glow}/>
      <header className={s.hdr}>
        <h1 className={s.title}>آمار</h1>
      </header>

      <div className={s.monthNav}>
        <button className={s.navBtn} onClick={nextMonth} disabled={isCur}>‹</button>
        <div className={s.monthInfo}>
          <div className={s.monthName}>{MONTHS[vm.jm-1]}</div>
          <div className={s.monthYear}>{toFa(vm.jy)}</div>
        </div>
        <button className={s.navBtn} onClick={prevMonth} disabled={isMin}>›</button>
      </div>

      {/* Total */}
      <div className={s.totals}>
        <div className={s.totalCard} style={{borderColor:'rgba(52,211,154,0.2)'}}>
          <div className={s.totalLbl}>درآمد</div>
          <div className={s.totalVal} style={{color:'#34D39A'}}>+{fmtAmount(income)}</div>
        </div>
        <div className={s.totalCard} style={{borderColor:'rgba(255,107,107,0.2)'}}>
          <div className={s.totalLbl}>هزینه</div>
          <div className={s.totalVal} style={{color:'#FF6B6B'}}>−{fmtAmount(totalExp)}</div>
        </div>
      </div>

      {/* View toggle */}
      <div className={s.viewToggle}>
        {[['donut','نمودار دایره‌ای'],['bar','نمودار میله‌ای'],['list','جدول']].map(([v,l])=>(
          <button key={v} className={`${s.viewBtn} ${view===v?s.viewActive:''}`} onClick={()=>setView(v)}>{l}</button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className={s.empty}><div style={{fontSize:'2rem',opacity:0.3}}>○</div><p>داده‌ای برای نمایش نیست</p></div>
      ) : view === 'donut' ? (
        <div className={s.donutWrap}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="28"/>
            {segments.map((seg,i) => (
              <circle key={i} cx="90" cy="90" r="70" fill="none"
                stroke={seg.color} strokeWidth="28"
                strokeDasharray={`${seg.dash} ${2*Math.PI*70 - seg.dash}`}
                strokeDashoffset={-seg.offset}
                transform="rotate(-90 90 90)"
                strokeLinecap="round"
                style={{transition:'stroke-dasharray 0.5s ease'}}/>
            ))}
            <text x="90" y="85" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="Vazirmatn">هزینه کل</text>
            <text x="90" y="102" textAnchor="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="Vazirmatn">
              {toFa(Math.round(totalExp/1000000*10)/10)} M
            </text>
          </svg>
          <div className={s.legend}>
            {segments.map(seg => (
              <div key={seg.cat} className={s.legendItem}>
                <div className={s.legendDot} style={{background:seg.color}}/>
                <span className={s.legendCat}>{seg.cat}</span>
                <span className={s.legendPct}>{toFa(Math.round(seg.pct*100))}٪</span>
                <span className={s.legendAmt}>{fmtAmount(seg.amt)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : view === 'bar' ? (
        <div className={s.barList}>
          {sorted.map(([cat, amt]) => (
            <div key={cat} className={s.barItem}>
              <div className={s.barHeader}>
                <span className={s.barCat}>{cat}</span>
                <span className={s.barAmt}>{fmtAmount(amt)}</span>
              </div>
              <div className={s.barTrack}>
                <div className={s.barFill}
                  style={{width:`${(amt/max)*100}%`, background: CAT_COLORS_HEX[cat]||'#9090A0'}}/>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={s.tableWrap}>
          {sorted.map(([cat, amt]) => (
            <div key={cat} className={s.tableRow}>
              <div className={s.tableDot} style={{background:CAT_COLORS_HEX[cat]||'#9090A0'}}/>
              <span className={s.tableCat}>{cat}</span>
              <span className={s.tablePct}>{toFa(Math.round((amt/totalExp)*100))}٪</span>
              <span className={s.tableAmt}>{fmtAmount(amt)}</span>
            </div>
          ))}
          <div className={s.tableTotal}>
            <span>جمع کل</span>
            <span>{fmtAmount(totalExp)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
