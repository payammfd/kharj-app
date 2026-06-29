import { useState, useEffect, useCallback } from 'react'
import { supabase, MONTHS, toFa, fmtAmount } from '../lib/supabase'
import BankCard from '../components/BankCard'
import MemberAvatar from '../components/MemberAvatar'
import AddTransactionSheet from '../components/AddTransactionSheet'
import AddCardSheet from '../components/AddCardSheet'
import { BellIcon, SearchIcon, SortIcon, HomeIcon } from '../lib/icons'
import s from './Dashboard.module.css'

const SORTS = [
  { id: 'date-desc',   label: 'جدیدترین' },
  { id: 'date-asc',    label: 'قدیمی‌ترین' },
  { id: 'amount-desc', label: 'گران‌ترین' },
  { id: 'amount-asc',  label: 'ارزان‌ترین' },
]

const CAT_COLORS = {
  'اینترنت':{'bg':'rgba(123,110,255,0.15)','c':'#A89DFF'},
  'آب، برق، گاز':{'bg':'rgba(52,211,154,0.15)','c':'#34D39A'},
  'خوراک':{'bg':'rgba(239,159,39,0.15)','c':'#EF9F27'},
  'حمل و نقل':{'bg':'rgba(168,157,255,0.15)','c':'#C4BCFF'},
  'سلامت':{'bg':'rgba(255,107,107,0.15)','c':'#FF9090'},
  'پوشاک':{'bg':'rgba(255,107,157,0.15)','c':'#FF85B4'},
  'تفریح':{'bg':'rgba(255,142,83,0.15)','c':'#FF9A6C'},
  'آموزش':{'bg':'rgba(79,172,254,0.15)','c':'#6BBFFF'},
  'سایر':{'bg':'rgba(144,144,160,0.15)','c':'#9090A0'},
  'درآمد':{'bg':'rgba(52,211,154,0.15)','c':'#34D39A'},
}

export default function Dashboard({ user, plan, members, cards, today, actions, onNavigate, onOpenSearch, onOpenNotif, txRefresh }) {
  const [vm, setVm] = useState({ jy: today[0], jm: today[1] })
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCard, setActiveCard] = useState(0)
  const [showAddTx, setShowAddTx] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)
  const [editTx, setEditTx] = useState(null)
  const [sortBy, setSortBy] = useState('date-desc')
  const [sortOpen, setSortOpen] = useState(false)
  const [hasNotif, setHasNotif] = useState(false)

  // وجودِ تراکنشِ جدیدِ دیده‌نشده برای نقطه‌ی روی زنگ
  useEffect(() => {
    if (!plan) return
    supabase.from('transactions').select('created_at').eq('plan_id', plan.id)
      .order('created_at', { ascending: false }).limit(1)
      .then(({ data }) => {
        const latest = data?.[0]?.created_at
        const seen = localStorage.getItem('kharj-notif-seen')
        setHasNotif(!!latest && (!seen || latest > seen))
      })
  }, [plan, txRefresh])

  function openNotif() {
    localStorage.setItem('kharj-notif-seen', new Date().toISOString())
    setHasNotif(false)
    onOpenNotif()
  }

  const loadTxs = useCallback(async () => {
    if (!plan) return
    setLoading(true)
    const { data } = await supabase.from('transactions').select('*')
      .eq('plan_id', plan.id).eq('jy', vm.jy).eq('jm', vm.jm)
      .order('jd',{ascending:false}).order('created_at',{ascending:false})
    setTxs(data||[])
    setLoading(false)
  }, [plan, vm])

  useEffect(()=>{ loadTxs() },[loadTxs, txRefresh])

  const income = txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)
  const expense = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)
  const balance = income - expense

  const sortedTxs = [...txs].sort((a,b)=>{
    if(sortBy==='date-asc')    return a.jd-b.jd || (a.created_at>b.created_at?1:-1)
    if(sortBy==='amount-desc') return b.amount-a.amount
    if(sortBy==='amount-asc')  return a.amount-b.amount
    return b.jd-a.jd || (a.created_at<b.created_at?1:-1) // date-desc
  })
  const sortLabel = SORTS.find(o=>o.id===sortBy)?.label

  const MIN_JY=1405, MIN_JM=1
  const isMin = vm.jy===MIN_JY && vm.jm===MIN_JM
  const isCur = vm.jy===today[0] && vm.jm===today[1]

  function prevMonth(){if(isMin)return;setVm(p=>p.jm===1?{jy:p.jy-1,jm:12}:{jy:p.jy,jm:p.jm-1})}
  function nextMonth(){if(isCur)return;setVm(p=>p.jm===12?{jy:p.jy+1,jm:1}:{jy:p.jy,jm:p.jm+1})}
  function getMember(uid){return members.find(m=>m.user_id===uid)}
  function getMyMember(){return getMember(user?.id)}

  async function deleteTx(id){
    await supabase.from('transactions').delete().eq('id',id)
    setTxs(prev=>prev.filter(t=>t.id!==id))
  }

  const myMember = getMyMember()

  return (
    <div className={s.page}>
      <div className={s.glow1}/><div className={s.glow2}/>
      <header className={s.hdr}>
        <div className={s.hdrSide}>
          <button className={s.meAvatar} onClick={()=>onNavigate('profile')} aria-label="پروفایل">
            <MemberAvatar member={myMember} size={38}/>
          </button>
          <button className={s.iconBtn} onClick={openNotif} aria-label="اعلان‌ها">
            <BellIcon size={22}/>
            {hasNotif && <span className={s.notifDot}/>}
          </button>
        </div>

        <button className={s.planCenter} onClick={()=>onNavigate('plan')}>
          <div className={s.planName}>{plan?.name}</div>
          <div className={s.planSub}>{toFa(members.length)} عضو</div>
        </button>

        <div className={`${s.hdrSide} ${s.hdrSideEnd}`}>
          <button className={s.iconBtn} onClick={onOpenSearch} aria-label="جستجو">
            <SearchIcon size={22}/>
          </button>
        </div>
      </header>

      <div className={s.balanceSec}>
        <div className={s.balLabel}>مانده ماه</div>
        <div className={s.balAmount}>{fmtAmount(Math.abs(balance))}</div>
        <div className={s.balRow}>
          <div>
            <div className={s.balStatVal} style={{color:'#34D39A'}}>+{fmtAmount(income)}</div>
            <div className={s.balStatLbl}>درآمد {MONTHS[vm.jm-1]}</div>
          </div>
          <div className={s.balDivider}/>
          <div>
            <div className={s.balStatVal} style={{color:'#FF6B6B'}}>−{fmtAmount(expense)}</div>
            <div className={s.balStatLbl}>هزینه {MONTHS[vm.jm-1]}</div>
          </div>
        </div>
      </div>

      <div className={s.cardsSec}>
        <div className={s.secHeader}>
          <span className={s.secTitle}>کارت‌های بانکی</span>
          <button className={s.secAction} onClick={()=>setShowAddCard(true)}>+ افزودن</button>
        </div>
        {cards.length===0?(
          <button className={s.emptyCard} onClick={()=>setShowAddCard(true)}>
            <span style={{fontSize:'24px'}}>+</span><span>افزودن کارت بانکی</span>
          </button>
        ):(
          <>
            <div className={s.cardSlider}>
              {cards.map((c,i)=>(
                <div key={c.id} style={{display:i===activeCard?'block':'none'}}>
                  <BankCard card={c} active/>
                </div>
              ))}
            </div>
            {cards.length>1&&(
              <div className={s.dots}>
                {cards.map((_,i)=>(
                  <div key={i} className={`${s.dot} ${i===activeCard?s.dotOn:''}`} onClick={()=>setActiveCard(i)}/>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className={s.monthNav}>
        <button className={s.navBtn} onClick={nextMonth} disabled={isCur}>‹</button>
        <div className={s.monthInfo}>
          <div className={s.monthName}>{MONTHS[vm.jm-1]}</div>
          <div className={s.monthYear}>{toFa(vm.jy)}</div>
        </div>
        <button className={s.navBtn} onClick={prevMonth} disabled={isMin}>›</button>
      </div>

      <div className={s.summary}>
        <div className={s.sumCard}><div className={s.sumLbl}>درآمد</div><div className={s.sumVal} style={{color:'#34D39A'}}>{fmtAmount(income)}</div></div>
        <div className={s.sumCard}><div className={s.sumLbl}>هزینه</div><div className={s.sumVal} style={{color:'#FF6B6B'}}>{fmtAmount(expense)}</div></div>
        <div className={s.sumCard} style={{gridColumn:'1/-1',background:'rgba(123,110,255,0.08)',borderColor:'rgba(123,110,255,0.2)'}}>
          <div className={s.sumLbl}>مانده</div>
          <div className={s.sumVal} style={{color:'#A89DFF',fontSize:'15px'}}>{fmtAmount(Math.abs(balance))}</div>
        </div>
      </div>

      <div className={s.txHdr}>
        <span className={s.txTitle}>تراکنش‌ها</span>
        {txs.length>0&&(
          <div className={s.txActionsHdr}>
            <div className={s.sortWrap}>
              <button className={s.sortBtn} onClick={()=>setSortOpen(o=>!o)}>
                <SortIcon size={16}/><span>{sortLabel}</span>
              </button>
              {sortOpen&&(
                <>
                  <div className={s.sortBackdrop} onClick={()=>setSortOpen(false)}/>
                  <div className={s.sortMenu}>
                    {SORTS.map(o=>(
                      <button key={o.id}
                        className={`${s.sortOpt} ${sortBy===o.id?s.sortOptActive:''}`}
                        onClick={()=>{setSortBy(o.id);setSortOpen(false)}}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button className={s.txStats} onClick={()=>onNavigate('stats')}>آمار ←</button>
          </div>
        )}
      </div>

      <div className={s.txList}>
        {loading?(<div className={s.empty}><div className={s.emptyIcon}>⋯</div></div>)
        :txs.length===0?(<div className={s.empty}><div className={s.emptyIcon}>○</div><p>هنوز تراکنشی ثبت نشده</p></div>)
        :sortedTxs.map(t=>{
          const col=CAT_COLORS[t.type==='income'?'درآمد':t.category]||CAT_COLORS['سایر']
          const member=getMember(t.user_id)
          return(
            <div key={t.id} className={s.txRow}>
              <MemberAvatar member={member} size={36}/>
              <div className={s.txInfo}>
                <span className={s.catBadge} style={{background:col.bg,color:col.c}}>{t.type==='income'?'درآمد':t.category}</span>
                <div className={s.txDesc}>{t.description}</div>
                <div className={s.txSub}>{toFa(t.jd)} {MONTHS[t.jm-1]} · {member?.display_name||'؟'}</div>
              </div>
              <div className={s.txRight}>
                <div className={s.txAmt} style={{color:t.type==='expense'?'#FF6B6B':'#34D39A'}}>
                  {t.type==='expense'?'−':'+'}&#x200F;{fmtAmount(t.amount)}
                </div>
                {t.user_id===user?.id&&(
                  <div className={s.txActions}>
                    <button className={s.editBtn} onClick={()=>setEditTx(t)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
                    </button>
                    <button className={s.delBtn} onClick={()=>deleteTx(t.id)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showAddTx&&<AddTransactionSheet plan={plan} user={user} today={today} cards={cards} onClose={()=>setShowAddTx(false)} onAdded={()=>{setShowAddTx(false);loadTxs()}}/>}
      {editTx&&<AddTransactionSheet plan={plan} user={user} today={today} cards={cards} editTx={editTx} onClose={()=>setEditTx(null)} onAdded={()=>{setEditTx(null);loadTxs()}}/>}
      {showAddCard&&<AddCardSheet actions={actions} onClose={()=>setShowAddCard(false)} onAdded={()=>{setShowAddCard(false);actions.reloadCards()}}/>}
    </div>
  )
}
