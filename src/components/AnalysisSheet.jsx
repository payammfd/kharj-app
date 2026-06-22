// src/components/AnalysisSheet.jsx
import { MONTHS, toFa, formatAmount } from '../lib/supabase'
import styles from './Sheet.module.css'

export default function AnalysisSheet({ transactions, month, onClose }) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const totalExpense = expenses.reduce((s, t) => s + t.amount, 0)
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)

  const byCategory = {}
  expenses.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
  })
  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const max = sorted[0]?.[1] || 1

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>تحلیل {MONTHS[month.jm - 1]} {toFa(month.jy)}</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.analysisWrap}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>مجموع درآمد</span>
            <span className={styles.totalAmount}>{formatAmount(totalIncome)}</span>
          </div>

          {sorted.map(([cat, amount]) => (
            <div key={cat} className={styles.statRow}>
              <div className={styles.statLeft}>
                <span className={styles.statName}>{cat}</span>
                <div className={styles.statBar}>
                  <div className={styles.statFill} style={{ width: `${(amount / max) * 100}%` }} />
                </div>
              </div>
              <span className={styles.statAmount}>{formatAmount(amount)}</span>
            </div>
          ))}

          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>جمع کل هزینه</span>
            <span className={styles.totalAmount}>{formatAmount(totalExpense)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
