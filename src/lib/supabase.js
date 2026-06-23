import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
    storageKey: 'kharj-auth',
    flowType: 'pkce',  // ← PKCE instead of implicit
  }
})

export function toJalali(gy, gm, gd) {
  var g_y=gy-1600,g_m=gm-1,g_d=gd-1
  var g_day_no=365*g_y+Math.floor((g_y+3)/4)-Math.floor((g_y+99)/100)+Math.floor((g_y+399)/400)
  var g_dim=[31,28,31,30,31,30,31,31,30,31,30,31]
  for(var i=0;i<g_m;++i)g_day_no+=g_dim[i]
  if(g_m>1&&((g_y%4===0&&g_y%100!==0)||(g_y%400===0)))g_day_no++
  g_day_no+=g_d
  var j_day_no=g_day_no-79
  var j_np=Math.floor(j_day_no/12053);j_day_no=j_day_no%12053
  var jy=979+33*j_np+4*Math.floor(j_day_no/1461);j_day_no=j_day_no%1461
  if(j_day_no>=366){jy+=Math.floor((j_day_no-1)/365);j_day_no=(j_day_no-1)%365}
  var j_dim=[31,31,31,31,31,31,30,30,30,30,30,29],jm
  for(var i=0;i<11&&j_day_no>=j_dim[i];++i)j_day_no-=j_dim[i]
  jm=i+1;var jd=j_day_no+1
  return[jy,jm,jd]
}
export function jalaliMonthDays(jy,jm){
  if(jm<=6)return 31;if(jm<=11)return 30
  var r=jy%33;return[1,5,9,13,17,22,26,30].indexOf(r)>=0?30:29
}
export const MONTHS=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند']
export function toFa(n){return String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d])}
export function todayJalali(){const n=new Date();return toJalali(n.getFullYear(),n.getMonth()+1,n.getDate())}
export function fmtAmount(n){
  if(!n&&n!==0)return '۰ تومان'
  return toFa(n.toLocaleString('fa-IR'))+' تومان'
}
export const BANKS={
  melat:  {label:'ملت',    gradient:'linear-gradient(135deg,#1a0533,#3d1278,#6B21A8)',text:'MELAT'},
  melli:  {label:'ملی',    gradient:'linear-gradient(135deg,#003d1a,#006B2E,#00A550)',text:'MELLI'},
  saderat:{label:'صادرات', gradient:'linear-gradient(135deg,#1a0000,#8B0000,#CC0000)',text:'SADERAT'},
  tejarat:{label:'تجارت',  gradient:'linear-gradient(135deg,#002244,#003580,#0052B4)',text:'TEJARAT'},
  parsian:{label:'پارسیان',gradient:'linear-gradient(135deg,#001a33,#004080,#0070CC)',text:'PARSIAN'},
  refah:  {label:'رفاه',   gradient:'linear-gradient(135deg,#0a2a00,#1a5c00,#2E8B00)',text:'REFAH'},
  ayandeh:{label:'آینده',  gradient:'linear-gradient(135deg,#1a1500,#4a3a00,#8B6914)',text:'AYANDEH'},
  default:{label:'سایر',   gradient:'linear-gradient(135deg,#1a1a3e,#2d2d6e,#4B4BA8)',text:'BANK'},
}
