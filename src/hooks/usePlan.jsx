import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth.jsx'

const PlanContext = createContext(null)

export function PlanProvider({ children }) {
  const { user } = useAuth()
  const [allPlans, setAllPlans] = useState([])
  const [plan, setPlan] = useState(null)
  const [members, setMembers] = useState([])
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setAllPlans([]); setPlan(null)
      setMembers([]); setCards([])
      setLoading(false)
      return
    }
    loadAllPlans()
  }, [user?.id]) // only re-run when user ID changes

  async function loadAllPlans() {
    setLoading(true)
    try {
      // Force a fresh token by calling getSession
      // If it fails, refreshSession to ensure token is valid
      let { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        const refreshed = await supabase.auth.refreshSession()
        session = refreshed.data.session
      }
      
      if (!session?.access_token) {
        setLoading(false)
        return
      }

      // Explicitly pass the token via Authorization header
      const { data, error } = await supabase
        .from('plan_members')
        .select('plan_id, display_name, plans(*)')
        .eq('user_id', session.user.id)

      if (error) throw error

      const plans = (data || []).map(m => m.plans).filter(Boolean)
      setAllPlans(plans)

      if (plans.length === 1) {
        await selectPlan(plans[0])
      } else {
        setPlan(null)
      }
    } catch(e) {
      console.error('loadAllPlans:', e)
    } finally {
      setLoading(false)
    }
  }

  async function selectPlan(p) {
    setPlan(p)
    await Promise.all([loadMembers(p.id), loadCards(p.id)])
  }

  async function loadMembers(planId) {
    const { data } = await supabase
      .from('plan_members_with_avatar')
      .select('user_id, display_name, avatar_url, joined_at')
      .eq('plan_id', planId)
    setMembers(data || [])
  }

  async function loadCards(planId) {
    const { data } = await supabase
      .from('bank_cards').select('*')
      .eq('plan_id', planId).order('created_at')
    setCards(data || [])
  }

  async function createPlan(name, displayName) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('لطفاً دوباره وارد شوید')
    const { data: newPlan, error } = await supabase
      .from('plans')
      .insert({ name: name || 'خانه ما', created_by: session.user.id })
      .select().single()
    if (error) throw error
    await supabase.from('plan_members').insert({
      plan_id: newPlan.id, user_id: session.user.id, display_name: displayName
    })
    setAllPlans(prev => [...prev, newPlan])
    await selectPlan(newPlan)
    return newPlan
  }

  async function joinPlan(inviteCode, displayName) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('لطفاً دوباره وارد شوید')

    const { data: targetPlan } = await supabase
      .from('plans').select()
      .eq('invite_code', inviteCode.toUpperCase().trim())
      .maybeSingle()
    if (!targetPlan) throw new Error('کد دعوت اشتباه است')

    const { data: existing } = await supabase
      .from('plan_members').select('id')
      .eq('plan_id', targetPlan.id).eq('user_id', session.user.id)
      .maybeSingle()

    if (!existing) {
      const { error } = await supabase.from('plan_members').insert({
        plan_id: targetPlan.id, user_id: session.user.id, display_name: displayName
      })
      if (error) throw error
    }

    setAllPlans(prev => prev.find(p => p.id === targetPlan.id) ? prev : [...prev, targetPlan])
    await selectPlan(targetPlan)
    return targetPlan
  }

  async function updatePlan(updates) {
    const { data, error } = await supabase
      .from('plans').update(updates).eq('id', plan.id).select().single()
    if (error) throw error
    setPlan(data)
    setAllPlans(prev => prev.map(p => p.id === data.id ? data : p))
    return data
  }

  async function addCard(cardData) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('لطفاً دوباره وارد شوید')
    const { data, error } = await supabase.from('bank_cards')
      .insert({ ...cardData, plan_id: plan.id, user_id: session.user.id })
      .select().single()
    if (error) throw error
    setCards(prev => [...prev, data])
    return data
  }

  async function deleteCard(cardId) {
    await supabase.from('bank_cards').delete().eq('id', cardId)
    setCards(prev => prev.filter(c => c.id !== cardId))
  }

  return (
    <PlanContext.Provider value={{
      allPlans, plan, members, cards, loading,
      loadAllPlans, selectPlan, loadMembers, loadCards,
      createPlan, joinPlan, updatePlan, addCard, deleteCard
    }}>
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() { return useContext(PlanContext) }
