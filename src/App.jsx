// src/App.jsx
import { AuthProvider, useAuth } from './hooks/useAuth'
import { PlanProvider, usePlan } from './hooks/usePlan'
import Login from './pages/Login'
import Setup from './pages/Setup'
import Dashboard from './pages/Dashboard'

function AppInner() {
  const { user, loading: authLoading } = useAuth()
  const { plan, loading: planLoading } = usePlan()

  if (authLoading || planLoading) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-tertiary)', fontSize: '1.5rem'
      }}>
        ⋯
      </div>
    )
  }

  if (!user) return <Login />
  if (!plan) return <Setup />
  return <Dashboard />
}

export default function App() {
  return (
    <AuthProvider>
      <PlanProvider>
        <AppInner />
      </PlanProvider>
    </AuthProvider>
  )
}
