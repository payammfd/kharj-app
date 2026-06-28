import { useState } from 'react'
import { fmtAmount, BANKS } from '../lib/supabase'
import BankCard from '../components/BankCard'
import AddCardSheet from '../components/AddCardSheet'
import TransferSheet from '../components/TransferSheet'
import s from './Cards.module.css'

export default function Cards({ plan, cards, actions }) {
  const [showAdd, setShowAdd] = useState(false)
  const [editCard, setEditCard] = useState(null)
  const [showTransfer, setShowTransfer] = useState(false)
  const [selected, setSelected] = useState(null)
  const totalBalance = cards.reduce((sum,c)=>sum+(c.balance||0),0)

  return (
    <div className={s.page}>
      <div className={s.glow}/>
      <header className={s.hdr}>
        <h1 className={s.title}>کارت‌های بانکی</h1>
        <div className={s.hdrActions}>
          {cards.length>1&&<button className={s.transferBtn} onClick={()=>setShowTransfer(true)}>⇄ جابجایی</button>}
          <button className={s.addBtn} onClick={()=>setShowAdd(true)}>+ افزودن</button>
        </div>
      </header>
      <div className={s.totalBox}>
        <div className={s.totalLbl}>موجودی کل</div>
        <div className={s.totalVal}>{fmtAmount(totalBalance)}</div>
        <div className={s.totalSub}>{cards.length} کارت ثبت‌شده</div>
      </div>
      <div className={s.list}>
        {cards.length===0?(
          <button className={s.emptyCard} onClick={()=>setShowAdd(true)}>
            <span style={{fontSize:'28px'}}>+</span>
            <span>اولین کارت بانکی رو اضافه کن</span>
          </button>
        ):cards.map(card=>(
          <div key={card.id}>
            <BankCard card={card} active={selected===card.id} onClick={()=>setSelected(selected===card.id?null:card.id)}/>
            {selected===card.id&&(
              <div className={s.cardActions}>
                <div className={s.cardDetail}><span className={s.detailLbl}>بانک</span><span className={s.detailVal}>{BANKS[card.color_class]?.label||card.bank_name}</span></div>
                {card.card_holder&&<div className={s.cardDetail}><span className={s.detailLbl}>صاحب کارت</span><span className={s.detailVal}>{card.card_holder}</span></div>}
                <div className={s.cardDetail}><span className={s.detailLbl}>موجودی</span><span className={s.detailVal} style={{color:'#34D39A'}}>{fmtAmount(card.balance||0)}</span></div>
                <div className={s.cardBtnRow}>
                  <button className={s.editCardBtn} onClick={()=>{setEditCard(card);setSelected(null)}}>ویرایش</button>
                  <button className={s.deleteCardBtn} onClick={()=>{actions.deleteCard(card.id);setSelected(null)}}>حذف کارت</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {showAdd&&<AddCardSheet actions={actions} onClose={()=>setShowAdd(false)} onAdded={()=>{setShowAdd(false);actions.reloadCards()}}/>}
      {editCard&&<AddCardSheet actions={actions} editCard={editCard} onClose={()=>setEditCard(null)} onAdded={()=>{setEditCard(null);actions.reloadCards()}}/>}
      {showTransfer&&<TransferSheet cards={cards} actions={actions} onClose={()=>setShowTransfer(false)} onDone={()=>setShowTransfer(false)}/>}
    </div>
  )
}
