// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ── Jalali helpers ─────────────────────────────────────────────
export function toJalali(gy, gm, gd) {
  const g_d_no = [0,31,59,90,120,151,181,212,243,273,304,334]
  let g_y = gy-1600, g_m = gm-1, g_d = gd-1
  let g_day_no = 365*g_y + Math.floor((g_y+3)/4) - Math.floor((g_y+99)/100) + Math.floor((g_y+399)/400)
  for (let i=0;i<g_m;i++) g_day_no += g_d_no[i]
  if (g_m>1 && ((g_y%4===0 && g_y%100!==0)||(g_y%400===0))) g_day_no++
  g_day_no += g_d
  let j_day_no = g_day_no - 79
  let j_np = Math.floor(j_day_no/12053); j_day_no %= 12053
  let jy = 979 + 33*j_np + 4*Math.floor(j_day_no/1461)
  j_day_no %= 1461
  if (j_day_no >= 366) { jy += Math.floor((j_day_no-1)/365); j_day_no = (j_day_no-1)%365 }
  const j_d_no = [0,31,62,93,124,155,186,216,246,276,306,336]
  let i=0; for (;i<11 && j_day_no>=j_d_no[i+1];i++);
  return [jy, i+1, j_day_no - j_d_no[i] + 1]
}

export function jalaliMonthDays(jy, jm) {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  const leaps = [1,5,9,13,17,22,26,30]
  return leaps.indexOf(((jy-(jy>0?474:473))%2820+474+38)%2820%474) >= 0 ? 30 : 29
}

export const MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند']

export function toFa(n) {
  return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d])
}

export function todayJalali() {
  const n = new Date()
  return toJalali(n.getFullYear(), n.getMonth()+1, n.getDate())
}

export function formatAmount(n) {
  return toFa(n.toLocaleString()) + ' تومان'
}
