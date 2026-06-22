export default function MemberAvatar({ member, size = 36 }) {
  const initials = (member?.display_name || '?').charAt(0)
  const colors = [
    'linear-gradient(135deg,#7B6EFF,#4FACFE)',
    'linear-gradient(135deg,#FF6B9D,#FF8E53)',
    'linear-gradient(135deg,#34D39A,#4FACFE)',
    'linear-gradient(135deg,#FFB347,#FF6B6B)',
  ]
  const colorIdx = member?.user_id
    ? member.user_id.charCodeAt(0) % colors.length : 0

  if (member?.avatar_url) return (
    <img src={member.avatar_url} alt={member.display_name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover',
        flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.12)' }} />
  )
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: colors[colorIdx], display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, flexShrink: 0,
      color: '#fff', border: '1.5px solid rgba(255,255,255,0.1)'
    }}>{initials}</div>
  )
}
