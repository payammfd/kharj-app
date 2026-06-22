// src/pages/Dashboard.jsx
import { useState, useEffect, useCallback } from 'react'
import { supabase, MONTHS, toFa, todayJalali, formatAmount, jalaliMonthDays } from '../lib/supabase'
import { usePlan } from '../hooks/usePlan.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import AddSheet from '../components/AddSheet'
import AnalysisSheet from '../components/AnalysisSheet'
import ShareSheet from '../components/ShareSheet'
import styles from './Dashboard.module.css'

const CATEGORY_COLORS = {
  'اینترنت':      { bg: '#1A2340', text: '#7EB3FF' },
  'آب، برق، گاز': { bg: '#1A3028', text: '#52C98A' },
  'خوراک':        { bg: '#2D2415', text: '#E8A84A' },
  'حمل و نقل':    { bg: '#221A38', text: '#A992FF' },
  'سلامت':        { bg: '#2D1A1A', text: '#FF8080' },
  'پوشاک':        { bg: '#2D1A26', text: '#FF85B4' },
  'تفریح':        { bg: '#2D1F17', text: '#FF9A6C' },
  'آموزش':        { bg: '#1A2633', text: '#6BBFFF' },
  'سایر':         { bg: '#222228', text: '#9090A0' },
  'درآمد':        { bg: '#1A2D26', text: '#34C78A' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const { plan, members } = usePlan()
  const [today] = useState(() => todayJalali())
  const [viewMonth, setViewMonth] = useState(() => ({ jy: today[0], jm: today[1] }))
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const loadTransactions = useCallback(async () => {
    if (!plan) return
    setLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('plan_id', plan.id)
      .eq('jy', viewMonth.jy)
      .eq('jm', viewMonth.jm)
      .order('jd', { ascending: false })
      .order('created_at', { ascending: false })
    setTransactions(data || [])
    setLoading(false)
  }, [plan, viewMonth])

  useEffect(() => { loadTransactions() }, [loadTransactions])

  const totalIncome = transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)
  const totalExpense = transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)
  const balance = totalIncome - totalExpense

  function prevMonth() {
    setViewMonth(prev => {
      if (prev.jm === 1) return { jy: prev.jy - 1, jm: 12 }
      return { jy: prev.jy, jm: prev.jm - 1 }
    })
  }
  function nextMonth() {
    const isCurrentMonth = viewMonth.jy === today[0] && viewMonth.jm === today[1]
    if (isCurrentMonth) return
    setViewMonth(prev => {
      if (prev.jm === 12) return { jy: prev.jy + 1, jm: 1 }
      return { jy: prev.jy, jm: prev.jm + 1 }
    })
  }

  const isCurrentMonth = viewMonth.jy === today[0] && viewMonth.jm === today[1]

  async function deleteTransaction(id) {
    await supabase.from('transactions').delete().eq('id', id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  function getMemberName(userId) {
    const m = members.find(m => m.user_id === userId)
    return m?.display_name || '؟'
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.iconBtn} onClick={()=>setShowShare(true)} title="دعوت">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
          </svg>
        </button>
        <span className={styles.planName}>{plan?.name || 'خرج'}</span>
        <button className={styles.iconBtn} onClick={()=>setShowAnalysis(true)} title="تحلیل">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 20V10M12 20V4M6 20v-6"/>
          </svg>
        </button>
      </header>

      {/* Month Navigator */}
      <div className={styles.monthNav}>
        <button className={styles.navBtn} onClick={nextMonth} disabled={isCurrentMonth}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        <div className={styles.monthInfo}>
          <span className={styles.monthName}>{MONTHS[viewMonth.jm-1]}</span>
          <span className={styles.yearLabel}>{toFa(viewMonth.jy)}</span>
        </div>
        <button className={styles.navBtn} onClick={prevMonth}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>

      {/* Summary Cards */}
      <div className={styles.summary}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>درآمد</span>
          <span className={`${styles.cardValue} ${styles.green}`}>{formatAmount(totalIncome)}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>هزینه</span>
          <span className={`${styles.cardValue} ${styles.red}`}>{formatAmount(totalExpense)}</span>
        </div>
        <div className={`${styles.card} ${styles.balanceCard}`}>
          <span className={styles.cardLabel}>مانده</span>
          <span className={`${styles.cardValue} ${balance >= 0 ? styles.green : styles.red}`}>
            {formatAmount(Math.abs(balance))}
          </span>
        </div>
      </div>

      {/* Transactions */}
      <div className={styles.listWrap}>
        {loading ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>⋯</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>○</span>
            <p>هنوز تراکنشی ثبت نشده</p>
          </div>
        ) : (
          <div className={styles.list}>
            {transactions.map(t => {
              const colors = CATEGORY_COLORS[t.type==='income'?'درآمد':t.category] || CATEGORY_COLORS['سایر']
              const isOwn = t.user_id === user?.id
              return (
                <div key={t.id} className={styles.row}>
                  <div className={styles.rowRight}>
                    <span className={styles.catBadge} style={{background:colors.bg,color:colors.text}}>
                      {t.type==='income' ? 'درآمد' : t.category}
                    </span>
                    <div className={styles.rowMeta}>
                      <span className={styles.rowDesc}>{t.description}</span>
                      <span className={styles.rowSub}>
                        {toFa(t.jd)} {MONTHS[t.jm-1]} · {getMemberName(t.user_id)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.rowLeft}>
                    <span className={`${styles.amount} ${t.type==='expense'?styles.red:styles.green}`}>
                      {t.type==='expense'?'−':'+'}
                      {toFa((t.amount/1000).toLocaleString())}
                      <span className={styles.unit}>K</span>
                    </span>
                    {isOwn && (
                      <button className={styles.delBtn} onClick={()=>deleteTransaction(t.id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button className={styles.fab} onClick={()=>setShowAdd(true)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </button>

      {/* Sheets */}
      {showAdd && (
        <AddSheet
          plan={plan}
          user={user}
          today={today}
          onClose={()=>setShowAdd(false)}
          onAdded={()=>{ setShowAdd(false); loadTransactions() }}
        />
      )}
      {showAnalysis && (
        <AnalysisSheet
          transactions={transactions}
          month={viewMonth}
          onClose={()=>setShowAnalysis(false)}
        />
      )}
      {showShare && (
        <ShareSheet
          plan={plan}
          members={members}
          onClose={()=>setShowShare(false)}
        />
      )}
    </div>
  )
}
