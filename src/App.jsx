import { useState, useEffect, useCallback } from 'react'
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
  <div style={{minHeight:'100dvh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',flexDirection:'column',gap:'20px'}}>
    <div style={{width:68,height:68,borderRadius:22,background:'linear-gradient(135deg,#7B6EFF,#4FACFE)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.2rem',fontWeight:700,color:'#fff',boxShadow:'0 12px 40px rgba(123,110,255,0.4)'}}>خ</div>
    <div style={{display:'flex',gap:'6px'}}>
      {[0,1,2].map(i=>(
        <div key={i} style={{width:6,height:6,borderRadius:'50%',background:'rgba(123,110,255,0.5)',animation:`p 1.2s ease ${i*0.2}s infinite`}}/>
      ))}
    </div>
    <style>{`@keyframes p{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
  </div>
)

export default function App() {
  const [state, setState] = useState({
    status: 'loading',
    user: null, allPlans: [], plan: null,
    members: [], cards: [], today: todayJalali(),
  })
  const [tab, setTab] = useState('home')
  const [showAddTx, setShowAddTx] = useState(false)

  async function loadMembers(planId) {
    const { data } = await supabase
      .from('plan_members_with_avatar')
      .select('user_id, display_name, avatar_url, joined_at')
      .eq('plan_id', planId)
    return data || []
  }

  async function loadCards(planId) {
    const { data } = await supabase
      .from('bank_cards').select('*').eq('plan_id', planId).order('created_at')
    return data || []
  }

  const loadPlans = useCallback(async (session) => {
    if (!session?.user) {
      setState(s => ({...s, status:'loggedout', user:null, allPlans:[], plan:null}))
      return
    }
    try {
      const { data, error } = await supabase
        .from('plan_members')
        .select('plan_id, plans(*)')
        .eq('user_id', session.user.id)
      if (error) throw error
      const plans = (data||[]).map(m=>m.plans).filter(Boolean)
      if (plans.length === 0) {
        setState(s => ({...s, status:'noplan', user:session.user, allPlans:[], plan:null}))
      } else if (plans.length === 1) {
        const [members, cards] = await Promise.all([loadMembers(plans[0].id), loadCards(plans[0].id)])
        setState(s => ({...s, status:'ready', user:session.user, allPlans:plans, plan:plans[0], members, cards}))
      } else {
        setState(s => ({...s, status:'multiplan', user:session.user, allPlans:plans, plan:null}))
      }
    } catch(e) {
      console.error('loadPlans error:', e)
      setState(s => ({...s, status:'noplan', user:session.user}))
    }
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[auth]', event, session?.user?.email)

        // با PKCE، code در query param هست - بعد از exchange، URL رو پاک کن
        if (window.location.search?.includes('code=')) {
          window.history.replaceState(null, '', window.location.pathname)
        }

        if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
          setState(s => ({...s, status:'loggedout', user:null, allPlans:[], plan:null}))
          return
        }

        if (session?.user) {
          await loadPlans(session)
        } else if (event === 'INITIAL_SESSION') {
          // No session on startup
          setState(s => ({...s, status:'loggedout'}))
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [loadPlans])

  const actions = {
    signInWithGoogle: async () => {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://kharj-app.pages.dev/',
          queryParams: { prompt: 'select_account' }
        }
      })
    },
    signOut: async () => { await supabase.auth.signOut() },
    selectPlan: async (p) => {
      const [members, cards] = await Promise.all([loadMembers(p.id), loadCards(p.id)])
      setState(s => ({...s, status:'ready', plan:p, members, cards}))
    },
    createPlan: async (name, displayName) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('لطفاً دوباره وارد شوید')
      const { data: newPlan, error } = await supabase.from('plans')
        .insert({name:name||'خانه ما', created_by:session.user.id}).select().single()
      if (error) throw error
      await supabase.from('plan_members').insert({plan_id:newPlan.id, user_id:session.user.id, display_name:displayName})
      const [members, cards] = await Promise.all([loadMembers(newPlan.id), loadCards(newPlan.id)])
      setState(s => ({...s, status:'ready', allPlans:[...s.allPlans,newPlan], plan:newPlan, members, cards}))
    },
    joinPlan: async (inviteCode, displayName) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('لطفاً دوباره وارد شوید')
      const { data: targetPlan } = await supabase.from('plans').select()
        .eq('invite_code', inviteCode.toUpperCase().trim()).maybeSingle()
      if (!targetPlan) throw new Error('کد دعوت اشتباه است')
      const { data: existing } = await supabase.from('plan_members').select('id')
        .eq('plan_id', targetPlan.id).eq('user_id', session.user.id).maybeSingle()
      if (!existing) {
        const { error } = await supabase.from('plan_members')
          .insert({plan_id:targetPlan.id, user_id:session.user.id, display_name:displayName})
        if (error) throw error
      }
      const [members, cards] = await Promise.all([loadMembers(targetPlan.id), loadCards(targetPlan.id)])
      setState(s => ({...s, status:'ready',
        allPlans:[...s.allPlans.filter(p=>p.id!==targetPlan.id), targetPlan],
        plan:targetPlan, members, cards}))
    },
    updatePlan: async (updates) => {
      const { data, error } = await supabase.from('plans')
        .update(updates).eq('id', state.plan.id).select().single()
      if (error) throw error
      setState(s => ({...s, plan:data, allPlans:s.allPlans.map(p=>p.id===data.id?data:p)}))
      return data
    },
    addCard: async (cardData) => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('لطفاً دوباره وارد شوید')
      const { data, error } = await supabase.from('bank_cards')
        .insert({...cardData, plan_id:state.plan.id, user_id:session.user.id}).select().single()
      if (error) throw error
      setState(s => ({...s, cards:[...s.cards,data]}))
      return data
    },
    deleteCard: async (cardId) => {
      await supabase.from('bank_cards').delete().eq('id',cardId)
      setState(s => ({...s, cards:s.cards.filter(c=>c.id!==cardId)}))
    },
    reloadCards: async () => {
      if (!state.plan) return
      const cards = await loadCards(state.plan.id)
      setState(s => ({...s, cards}))
    },
    reloadMembers: async () => {
      if (!state.plan) return
      const members = await loadMembers(state.plan.id)
      setState(s => ({...s, members}))
    },
  }

  const { status, user, allPlans, plan, members, cards, today } = state

  if (status === 'loading')   return <Spinner/>
  if (status === 'loggedout') return <Login actions={actions}/>
  if (status === 'noplan')    return <Setup user={user} actions={actions}/>
  if (status === 'multiplan') return <PlanSelect user={user} allPlans={allPlans} actions={actions}/>

  return (
    <>
      {tab==='home'    && <Dashboard user={user} plan={plan} members={members} cards={cards} today={today} actions={actions} onNavigate={setTab}/>}
      {tab==='cards'   && <Cards plan={plan} cards={cards} actions={actions}/>}
      {tab==='stats'   && <Stats plan={plan}/>}
      {tab==='plan'    && <PlanPage user={user} plan={plan} members={members} actions={actions}/>}
      {tab==='profile' && <ProfilePage user={user} plan={plan} members={members} actions={actions}/>}
      <BottomNav active={tab} onNavigate={setTab} onAddTx={()=>setShowAddTx(true)}/>
      {showAddTx && (
        <AddTransactionSheet plan={plan} user={user} today={today} cards={cards}
          onClose={()=>setShowAddTx(false)} onAdded={()=>setShowAddTx(false)}/>
      )}
    </>
  )
}
