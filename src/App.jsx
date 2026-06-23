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

const Spinner = () => (
  <div style={{
    minHeight:'100dvh', display:'flex', alignItems:'center',
    justifyContent:'center', background:'var(--bg)',
    flexDirection:'column', gap:'20px'
  }}>
    <div style={{
      width:68, height:68, borderRadius:22,
      background:'linear-gradient(135deg,#7B6EFF,#4FACFE)',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:'2.2rem', fontWeight:700, color:'#fff',
      boxShadow:'0 12px 40px rgba(123,110,255,0.4)'
    }}>خ</div>
    <div style={{
      display:'flex', gap:'6px', alignItems:'center'
    }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width:6, height:6, borderRadius:'50%',
          background:'rgba(123,110,255,0.6)',
          animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite`
        }}/>
      ))}
    </div>
    <style>{`@keyframes pulse{0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1)}}`}</style>
  </div>
)

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

  // 4. Multiple plans → Plan selector
  if (allPlans.length > 1 && !plan) return <PlanSelect/>

  // 5. No plan → Setup
  if (!plan) return <Setup/>

  // 6. Main app
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

// Handle OAuth redirect — wait for Supabase to process the hash
function OAuthHandler({ children }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const hash = window.location.hash
    const hasOAuthParams = hash && (
      hash.includes('access_token') ||
      hash.includes('error_description')
    )

    if (hasOAuthParams) {
      // Wait for Supabase to process the token from URL hash
      supabase.auth.onAuthStateChange((event, session) => {
        // Clean URL immediately
        window.history.replaceState(null, '', window.location.pathname)
        setReady(true)
      })
      // Safety timeout
      setTimeout(() => setReady(true), 5000)
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
