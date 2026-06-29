import { MONTHS, toFa, fmtAmount, jalaliMonthDays } from './supabase'

const CAT_EMOJI = {
  'خوراک':'🛒','حمل و نقل':'🚗','آب، برق، گاز':'💡','اینترنت':'📶',
  'سلامت':'💊','پوشاک':'👕','تفریح':'🎮','آموزش':'📚','سایر':'📌','درآمد':'💰'
}

const GR = {
  cover:    'linear-gradient(165deg,#7B6EFF 0%,#4FACFE 100%)',
  overview: 'linear-gradient(165deg,#3B2F8F 0%,#4FACFE 100%)',
  cat:      'linear-gradient(165deg,#6D28D9 0%,#B66EFF 100%)',
  down:     'linear-gradient(165deg,#0F766E 0%,#34D39A 100%)',
  up:       'linear-gradient(165deg,#9A3412 0%,#FF8E53 100%)',
  noSpend:  'linear-gradient(165deg,#0E7490 0%,#34D39A 100%)',
  heavy:    'linear-gradient(165deg,#9F1239 0%,#FB7185 100%)',
  biggest:  'linear-gradient(165deg,#4338CA 0%,#7B6EFF 100%)',
  winPos:   'linear-gradient(165deg,#047857 0%,#34D39A 100%)',
  winNeg:   'linear-gradient(165deg,#9A3412 0%,#F59E0B 100%)',
}
const GREEN = '#A8F5CE', RED = '#FFB3B3', GOLD = '#FFE08A', DIM = 'rgba(255,255,255,0.72)'

// از تراکنش‌های ماه (و ماه قبل برای مقایسه) یک سری اسلاید داستانی می‌سازد.
export function buildStory(cur, prev, jy, jm, today) {
  const monthName = MONTHS[jm - 1]
  const exp = cur.filter(t => t.type === 'expense')
  const income = cur.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = exp.reduce((s, t) => s + t.amount, 0)
  const net = income - expense

  // ماهِ خالی → بدون داستان
  if (cur.length === 0) return []

  // دسته‌بندی هزینه‌ها
  const byCat = {}
  exp.forEach(t => { byCat[t.category] = (byCat[t.category] || 0) + t.amount })
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1])
  const topCat = cats[0]

  // مقایسه با ماه قبل
  const prevExpense = prev.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const changePct = prevExpense > 0 ? Math.round((expense - prevExpense) / prevExpense * 100) : null

  // روزها
  const isCurMonth = jy === today[0] && jm === today[1]
  const totalDays = isCurMonth ? today[2] : jalaliMonthDays(jy, jm)
  const spentDays = new Set(exp.map(t => t.jd))
  let noSpendCount = 0
  for (let d = 1; d <= totalDays; d++) if (!spentDays.has(d)) noSpendCount++

  const dayExp = {}
  exp.forEach(t => { dayExp[t.jd] = (dayExp[t.jd] || 0) + t.amount })
  const heaviest = Object.entries(dayExp).sort((a, b) => b[1] - a[1])[0] // [jd, amt]
  const biggestTx = exp.slice().sort((a, b) => b.amount - a.amount)[0]

  const slides = []

  // 1) جلد
  slides.push({ bg: GR.cover, emoji: '📖', lines: [
    { t: 'داستان مالی', s: 'lg' },
    { t: `${monthName} ${toFa(jy)}`, s: 'md', c: 'rgba(255,255,255,0.85)' },
  ], hint: 'بزن بریم →' })

  // 2) مرور درآمد/هزینه
  slides.push({ bg: GR.overview, emoji: '✨', lines: [
    { t: `${monthName} اینطوری گذشت`, s: 'md', c: DIM },
    { t: `+${fmtAmount(income)}`, s: 'num', c: GREEN },
    { t: 'درآمد داشتی', s: 'sm', c: DIM },
    { t: `−${fmtAmount(expense)}`, s: 'num', c: RED },
    { t: 'خرج کردی', s: 'sm', c: DIM },
  ] })

  // 3) پرخرج‌ترین دسته
  if (topCat && expense > 0) {
    const pct = Math.round(topCat[1] / expense * 100)
    slides.push({ bg: GR.cat, emoji: CAT_EMOJI[topCat[0]] || '📌', lines: [
      { t: 'بیشترین هزینه‌ات برای', s: 'md', c: DIM },
      { t: `«${topCat[0]}»`, s: 'lg' },
      { t: fmtAmount(topCat[1]), s: 'num', c: GOLD },
      { t: `${toFa(pct)}٪ از کل خرجت`, s: 'sm', c: DIM },
    ] })
  }

  // 4) مقایسه با ماه قبل
  if (changePct !== null) {
    const down = changePct <= 0
    slides.push({ bg: down ? GR.down : GR.up, emoji: down ? '👏' : '😅', lines: [
      { t: 'نسبت به ماه قبل', s: 'md', c: DIM },
      { t: `${toFa(Math.abs(changePct))}٪ ${down ? 'کمتر' : 'بیشتر'}`, s: 'num', c: down ? GREEN : RED },
      { t: 'خرج کردی', s: 'md' },
    ] })
  }

  // 5) روزِ مالی (بی‌خرج یا سنگین‌ترین)
  if (noSpendCount > 0) {
    slides.push({ bg: GR.noSpend, emoji: '😄', lines: [
      { t: 'بهترین خبر', s: 'md', c: DIM },
      { t: `${toFa(noSpendCount)} روز`, s: 'num', c: GREEN },
      { t: 'هیچ خرجی ثبت نکردی!', s: 'md' },
    ] })
  } else if (heaviest) {
    slides.push({ bg: GR.heavy, emoji: '💸', lines: [
      { t: 'سنگین‌ترین روزت', s: 'md', c: DIM },
      { t: `${toFa(+heaviest[0])} ${monthName}`, s: 'lg' },
      { t: fmtAmount(heaviest[1]), s: 'num', c: RED },
    ] })
  }

  // 6) بزرگ‌ترین خرجِ تکی
  if (biggestTx) {
    slides.push({ bg: GR.biggest, emoji: '🧾', lines: [
      { t: 'بزرگ‌ترین خرجت', s: 'md', c: DIM },
      { t: biggestTx.description, s: 'lg' },
      { t: fmtAmount(biggestTx.amount), s: 'num', c: RED },
    ] })
  }

  // 7) جمع‌بندی
  const pos = net >= 0
  slides.push({ bg: pos ? GR.winPos : GR.winNeg, emoji: pos ? '🎉' : '🫣', lines: [
    { t: pos ? 'این ماه پس‌انداز کردی' : 'این ماه بیشتر از درآمدت خرج شد', s: 'md' },
    { t: fmtAmount(Math.abs(net)), s: 'num', c: pos ? GREEN : RED },
    { t: 'تا ماه بعد! 👋', s: 'md', c: DIM },
  ] })

  return slides
}
