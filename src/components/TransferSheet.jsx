import { useState } from 'react'
import { BANKS, fmtAmount } from '../lib/supabase'
import BottomSheet from './BottomSheet'
import styles from './Forms.module.css'

function cardLabel(c) {
  const bank = BANKS[c.color_class]?.label || c.bank_name || 'بانک'
  const last4 = c.card_number ? c.card_number.replace(/\s/g, '').slice(-4) : ''
  return last4 ? `${bank} — ${last4}` : bank
}

export default function TransferSheet({ cards, actions, onClose, onDone }) {
  const [fromId, setFromId] = useState(cards[0]?.id || '')
  const [toId, setToId] = useState(cards[1]?.id || '')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const fromCard = cards.find(c => c.id === fromId)

  function changeFrom(id) {
    setFromId(id)
    if (id === toId) setToId(cards.find(c => c.id !== id)?.id || '')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const num = parseInt(amount.replace(/[^0-9]/g, ''))
    setErr('')
    if (fromId === toId) return setErr('دو کارت متفاوت انتخاب کن')
    if (!num || num <= 0) return setErr('مبلغ معتبر وارد کن')
    setLoading(true)
    try {
      await actions.transferBetweenCards(fromId, toId, num)
      onDone()
    } catch (e) { setErr(e.message); setLoading(false) }
  }

  return (
    <BottomSheet title="جابجایی بین کارت‌ها" onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className={styles.field}>
          <label className={styles.lbl}>از کارت</label>
          <select value={fromId} onChange={e => changeFrom(e.target.value)} style={{ background: 'var(--bg-el)', color: 'var(--text)' }}>
            {cards.map(c => <option key={c.id} value={c.id}>{cardLabel(c)}</option>)}
          </select>
          {fromCard && <span style={{ fontSize: '0.75rem', color: 'var(--text-3)', paddingRight: '2px' }}>موجودی: {fmtAmount(fromCard.balance || 0)}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.lbl}>به کارت</label>
          <select value={toId} onChange={e => setToId(e.target.value)} style={{ background: 'var(--bg-el)', color: 'var(--text)' }}>
            {cards.filter(c => c.id !== fromId).map(c => <option key={c.id} value={c.id}>{cardLabel(c)}</option>)}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.lbl}>مبلغ (تومان)</label>
          <input type="number" inputMode="numeric" value={amount}
            onChange={e => setAmount(e.target.value)} placeholder="مثلاً: 500000" />
        </div>

        {err && <p style={{ color: 'var(--red)', fontSize: '0.82rem', textAlign: 'center' }}>{err}</p>}
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? '...' : 'انتقال وجه'}
        </button>
      </form>
    </BottomSheet>
  )
}
