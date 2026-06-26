import { BANKS, fmtAmount, toFa } from '../lib/supabase'
import styles from './BankCard.module.css'

export default function BankCard({ card, active = false, onClick }) {
  const bank = BANKS[card.color_class] || BANKS.default
  const maskedNum = card.card_number
    ? card.card_number.replace(/\s/g,'').replace(/^(\d{4})\d{8}(\d{4})$/, '$1  ****  ****  $2')
    : '**** **** **** ****'

  return (
    <div
      className={`${styles.card} ${active ? styles.active : ''}`}
      style={{ background: bank.gradient }}
      onClick={onClick}
    >
      <div className={styles.top}>
        <div className={styles.chip} />
        {bank.logo
          ? <div className={styles.logoBadge}><img src={bank.logo} alt={bank.label} className={styles.logoImg} loading="lazy"/></div>
          : <div className={styles.bankName}>{bank.text}</div>}
      </div>
      <div className={styles.number}>{maskedNum}</div>
      <div className={styles.bottom}>
        <div>
          <div className={styles.balLabel}>موجودی</div>
          <div className={styles.balValue}>{fmtAmount(card.balance || 0)}</div>
        </div>
        <div style={{textAlign:'left'}}>
          {card.expiry && <>
            <div className={styles.expLabel}>انقضا</div>
            <div className={styles.expValue}>{card.expiry}</div>
          </>}
        </div>
      </div>
      {card.card_holder && (
        <div className={styles.holder}>{card.card_holder.toUpperCase()}</div>
      )}
    </div>
  )
}
