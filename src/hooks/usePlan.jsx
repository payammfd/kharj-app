import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth.jsx'

const PlanContext = createContext(null)

export function PlanProvider({ children }) {
  const { user } = useAuth()
  const [plan, setPlan] = useState(null)
  const [members, setMembers] = useState([])
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setPlan(null); setMembers([]); setCards([]); setLoading(false); return }
    loadPlan()
  }, [user])

  async function loadPlan() {
    setLoading(true)
    const { data: membership } = await supabase
      .from('plan_members').select('plan_id, display_name, plans(*)')
      .eq('user_id', user.id).limit(1).maybeSingle()
    if (membership) {
      setPlan(membership.plans)
      await Promise.all([loadMembers(membership.plan_id), loadCards(membership.plan_id)])
    }
    setLoading(false)
  }

  async function loadMembers(planId) {
    const { data } = await supabase.from('plan_members_with_avatar')
      .select('user_id, display_name, avatar_url, joined_at').eq('plan_id', planId)
    setMembers(data || [])
  }

  async function loadCards(planId) {
    const { data } = await supabase.from('bank_cards')
      .select('*').eq('plan_id', planId).order('created_at')
    setCards(data || [])
  }

  async function createPlan(name, displayName) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('لطفاً دوباره وارد شوید')
    const { data: newPlan, error } = await supabase.from('plans')
      .insert({ name: name || 'خانه ما', created_by: session.user.id }).select().single()
    if (error) throw error
    await supabase.from('plan_members').insert({ plan_id: newPlan.id, user_id: session.user.id, display_name: displayName })
    setPlan(newPlan)
    await loadMembers(newPlan.id)
    return newPlan
  }

  async function joinPlan(inviteCode, displayName) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('لطفاً دوباره وارد شوید')
    const { data: targetPlan } = await supabase.from('plans')
      .select().eq('invite_code', inviteCode.toUpperCase().trim()).maybeSingle()
    if (!targetPlan) throw new Error('کد دعوت اشتباه است')
    const { error } = await supabase.from('plan_members')
      .insert({ plan_id: targetPlan.id, user_id: session.user.id, display_name: displayName })
    if (error) throw new Error('قبلاً عضو این پلن هستی')
    setPlan(targetPlan)
    await loadMembers(targetPlan.id)
    return targetPlan
  }

  async function updatePlan(updates) {
    const { data, error } = await supabase.from('plans').update(updates).eq('id', plan.id).select().single()
    if (error) throw error
    setPlan(data)
    return data
  }

  async function addCard(cardData) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('لطفاً دوباره وارد شوید')
    const { data, error } = await supabase.from('bank_cards')
      .insert({ ...cardData, plan_id: plan.id, user_id: session.user.id }).select().single()
    if (error) throw error
    setCards(prev => [...prev, data])
    return data
  }

  async function deleteCard(cardId) {
    await supabase.from('bank_cards').delete().eq('id', cardId)
    setCards(prev => prev.filter(c => c.id !== cardId))
  }

  return (
    <PlanContext.Provider value={{ plan, members, cards, loading, loadPlan, loadCards, createPlan, joinPlan, updatePlan, addCard, deleteCard }}>
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() { return useContext(PlanContext) }
