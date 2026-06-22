import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import { PlanProvider, usePlan } from './hooks/usePlan.jsx'
import { supabase, todayJalali } from './lib/supabase'
import Login from './pages/Login'
import Setup from './pages/Setup'
import PlanSelect from './pages/PlanSelect'
import Dashboard from './pages/Dashboard'
import Cards from './pages/Cards'
import Stats from './pages/Stats'
import PlanPage from './pages/PlanPage'
import ProfilePage from './pages/ProfilePage'
import BottomNav from './components/BottomNav'
import AddTransactionSheet from './components/AddTransactionSheet'

// ── Loading spinner ────────────────────────────────────────────
const Spinner = () => (
  <div style={{
    minHeight:'100dvh', display:'flex', alignItems:'center',
    justifyContent:'center', background:'var(--bg)',
    flexDirection:'column', gap:'16px'
  }}>
    <div style={{
      width:64, height:64, borderRadius:20,
      background:'linear-gradient(135deg,#7B6EFF,#4FACFE)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:'2rem', fontWeight:700, color:'#fff',
      boxShadow:'0 12px 40px rgba(123,110,255,0.35)'
    }}>خ</div>
    <div style={{color:'rgba(255,255,255,0.15)',fontSize:'1.4rem',letterSpacing:'4px'}}>...</div>
  </div>
)

// ── Main app flow ──────────────────────────────────────────────
function AppInner() {
  const { user, loading: authLoading } = useAuth()
  const { allPlans, plan, cards, loading: planLoading } = usePlan()
  const [tab, setTab] = useState('home')
  const [showAddTx, setShowAddTx] = useState(false)
  const [today] = useState(() => todayJalali())

  // 1. Auth loading
  if (authLoading) return <Spinner/>

  // 2. Not logged in → Onboarding
  if (!user) return <Login/>

  // 3. Plan loading
  if (planLoading) return <Spinner/>

  // 4. Has multiple plans → Plan selector
  if (allPlans.length > 1 && !plan) return <PlanSelect/>

  // 5. No plan → Setup (new user or hasn't joined yet)
  if (!plan) return <Setup/>

  // 6. Has plan → Main app
  return (
    <>
      {tab === 'home'    && <Dashboard onNavigate={setTab}/>}
      {tab === 'cards'   && <Cards/>}
      {tab === 'stats'   && <Stats/>}
      {tab === 'plan'    && <PlanPage/>}
      {tab === 'profile' && <ProfilePage/>}
      <BottomNav
        active={tab}
        onNavigate={setTab}
        onAddTx={() => setShowAddTx(true)}
      />
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

// ── OAuth redirect handler ─────────────────────────────────────
function OAuthHandler({ children }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (['SIGNED_IN','SIGNED_OUT','TOKEN_REFRESHED'].includes(event)) {
          window.history.replaceState(null,'',window.location.pathname)
          subscription.unsubscribe()
          setReady(true)
        }
      })
      // Fallback timeout
      setTimeout(() => setReady(true), 4000)
    } else {
      setReady(true)
    }
  }, [])

  if (!ready) return <Spinner/>
  return children
}

// ── Root ───────────────────────────────────────────────────────
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
