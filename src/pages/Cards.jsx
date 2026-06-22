import { useState } from 'react'
import { fmtAmount, BANKS } from '../lib/supabase'
import { usePlan } from '../hooks/usePlan.jsx'
import BankCard from '../components/BankCard'
import AddCardSheet from '../components/AddCardSheet'
import s from './Cards.module.css'

export default function Cards() {
  const { cards, plan, loadCards, deleteCard } = usePlan()
  const [showAdd, setShowAdd] = useState(false)
  const [selected, setSelected] = useState(null)

  const totalBalance = cards.reduce((sum, c) => sum + (c.balance || 0), 0)

  return (
    <div className={s.page}>
      <div className={s.glow}/>
      <header className={s.hdr}>
        <h1 className={s.title}>کارت‌های بانکی</h1>
        <button className={s.addBtn} onClick={()=>setShowAdd(true)}>+ افزودن</button>
      </header>

      <div className={s.totalBox}>
        <div className={s.totalLbl}>موجودی کل</div>
        <div className={s.totalVal}>{fmtAmount(totalBalance)}</div>
        <div className={s.totalSub}>{cards.length} کارت ثبت‌شده</div>
      </div>

      <div className={s.list}>
        {cards.length === 0 ? (
          <button className={s.emptyCard} onClick={()=>setShowAdd(true)}>
            <span style={{fontSize:'28px'}}>+</span>
            <span>اولین کارت بانکی رو اضافه کن</span>
          </button>
        ) : cards.map((card, i) => (
          <div key={card.id}>
            <BankCard card={card} active={selected===card.id} onClick={()=>setSelected(selected===card.id?null:card.id)}/>
            {selected===card.id && (
              <div className={s.cardActions}>
                <div className={s.cardDetail}>
                  <span className={s.detailLbl}>بانک</span>
                  <span className={s.detailVal}>{BANKS[card.color_class]?.label || card.bank_name}</span>
                </div>
                {card.card_holder && (
                  <div className={s.cardDetail}>
                    <span className={s.detailLbl}>صاحب کارت</span>
                    <span className={s.detailVal}>{card.card_holder}</span>
                  </div>
                )}
                <div className={s.cardDetail}>
                  <span className={s.detailLbl}>موجودی</span>
                  <span className={s.detailVal} style={{color:'#34D39A'}}>{fmtAmount(card.balance||0)}</span>
                </div>
                <button className={s.deleteCardBtn} onClick={()=>{ deleteCard(card.id); setSelected(null) }}>
                  حذف کارت
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showAdd && <AddCardSheet onClose={()=>setShowAdd(false)} onAdded={()=>{setShowAdd(false);loadCards(plan.id)}}/>}
    </div>
  )
}
