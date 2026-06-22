import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { PlanProvider, usePlan } from './hooks/usePlan.jsx'
import { supabase, todayJalali } from './lib/supabase'
import Login from './pages/Login'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'
import Cards from './pages/Cards'
import Stats from './pages/Stats'
import PlanPage from './pages/PlanPage'
import ProfilePage from './pages/ProfilePage'
import BottomNav from './components/BottomNav'
import AddTransactionSheet from './components/AddTransactionSheet'

const Spinner = () => (
  <div style={{
    minHeight: '100dvh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--bg)',
    flexDirection: 'column', gap: '16px'
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: 18,
      background: 'linear-gradient(135deg,#7B6EFF,#4FACFE)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1.8rem', fontWeight: 700
    }}>خ</div>
    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '1.2rem' }}>⋯</div>
  </div>
)

function AppInner() {
  const { user, loading: authLoading } = useAuth()
  const { plan, cards, loading: planLoading } = usePlan()
  const [tab, setTab] = useState('home')
  const [showAddTx, setShowAddTx] = useState(false)
  const [today] = useState(() => todayJalali())

  // Show spinner while auth is loading
  if (authLoading) return <Spinner/>

  // Not logged in
  if (!user) return <Login/>

  // Auth done but plan still loading - show spinner briefly
  if (planLoading) return <Spinner/>

  // Logged in but no plan
  if (!plan) return <Setup/>

  return (
    <>
      {tab === 'home'    && <Dashboard onNavigate={setTab}/>}
      {tab === 'cards'   && <Cards/>}
      {tab === 'stats'   && <Stats/>}
      {tab === 'plan'    && <PlanPage/>}
      {tab === 'profile' && <ProfilePage/>}
      <BottomNav active={tab} onNavigate={setTab} onAddTx={() => setShowAddTx(true)}/>
      {showAddTx && (
        <AddTransactionSheet
          plan={plan} user={user} today={today} cards={cards}
          onClose={() => setShowAddTx(false)}
          onAdded={() => setShowAddTx(false)}
        />
      )}
    </>
  )
}

function OAuthHandler({ children }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'].includes(event)) {
          window.history.replaceState(null, '', window.location.pathname)
          subscription.unsubscribe()
          setReady(true)
        }
      })
      setTimeout(() => setReady(true), 4000)
    } else {
      setReady(true)
    }
  }, [])

  if (!ready) return <Spinner/>
  return children
}

export default function App() {
  return (
    <OAuthHandler>
      <AuthProvider>
        <PlanProvider>
          <AppInner/>
        </PlanProvider>
      </AuthProvider>
    </OAuthHandler>
  )
}
