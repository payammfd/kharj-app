// src/components/ShareSheet.jsx
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import styles from './Sheet.module.css'

export default function ShareSheet({ plan, members, onClose }) {
  const { user, signOut } = useAuth()
  const [copied, setCopied] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(plan?.invite_code || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheet}>
        <div className={styles.handle} />
        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>اشتراک‌گذاری</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Invite Code */}
          <div className={styles.shareCard}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              کد دعوت پلن <strong style={{ color: 'var(--text-primary)' }}>{plan?.name}</strong>
            </p>
            <div className={styles.codeWrap}>
              <span className={styles.inviteCode}>{plan?.invite_code}</span>
              <button className={styles.copyBtn} onClick={copyCode}>
                {copied ? '✓ کپی شد' : 'کپی'}
              </button>
            </div>
            <p className={styles.shareNote}>
              این کد رو به همسرت بده تا بعد از ورود با Apple، با وارد کردن این کد به پلن بپیونده.
            </p>
          </div>

          {/* Members */}
          {members.length > 0 && (
            <div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                اعضا ({members.length})
              </p>
              <div className={styles.memberList}>
                {members.map(m => (
                  <div key={m.user_id} className={styles.memberRow}>
                    <div className={styles.memberAvatar}>
                      {(m.display_name || '؟').charAt(0)}
                    </div>
                    <span className={styles.memberName}>{m.display_name || 'کاربر'}</span>
                    {m.user_id === user?.id && (
                      <span className={styles.youBadge}>شما</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sign out */}
          <button
            onClick={signOut}
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              fontSize: '0.88rem',
              fontFamily: 'var(--font)',
              marginTop: '4px'
            }}
          >
            خروج از حساب
          </button>
        </div>
      </div>
    </div>
  )
}
