// src/hooks/usePlan.js
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth.jsx'

const PlanContext = createContext(null)

export function PlanProvider({ children }) {
  const { user } = useAuth()
  const [plan, setPlan] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setPlan(null); setLoading(false); return }
    loadPlan()
  }, [user])

  async function loadPlan() {
    setLoading(true)
    // Find user's plan membership
    const { data: membership } = await supabase
      .from('plan_members')
      .select('plan_id, display_name, plans(*)')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    if (membership) {
      setPlan(membership.plans)
      await loadMembers(membership.plan_id)
    }
    setLoading(false)
  }

  async function loadMembers(planId) {
    const { data } = await supabase
      .from('plan_members')
      .select('user_id, display_name, joined_at')
      .eq('plan_id', planId)
    setMembers(data || [])
  }

  async function createPlan(name, displayName) {
    const { data: newPlan, error } = await supabase
      .from('plans')
      .insert({ name, created_by: user.id })
      .select()
      .single()
    if (error) throw error

    await supabase.from('plan_members').insert({
      plan_id: newPlan.id,
      user_id: user.id,
      display_name: displayName
    })
    setPlan(newPlan)
    await loadMembers(newPlan.id)
    return newPlan
  }

  async function joinPlan(inviteCode, displayName) {
    const { data: targetPlan, error } = await supabase
      .from('plans')
      .select()
      .eq('invite_code', inviteCode.toUpperCase())
      .single()
    if (error || !targetPlan) throw new Error('کد دعوت اشتباه است')

    const { error: joinError } = await supabase.from('plan_members').insert({
      plan_id: targetPlan.id,
      user_id: user.id,
      display_name: displayName
    })
    if (joinError) throw new Error('قبلاً عضو این پلن هستی')
    setPlan(targetPlan)
    await loadMembers(targetPlan.id)
    return targetPlan
  }

  return (
    <PlanContext.Provider value={{ plan, members, loading, loadPlan, createPlan, joinPlan }}>
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan() {
  return useContext(PlanContext)
}
