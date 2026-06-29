import { useState, useEffect } from 'react'
import { supabase, MONTHS, toFa } from '../lib/supabase'
import { buildStory } from '../lib/story'
import s from './FinancialStory.module.css'

const DURATION = 6000 // مدت هر اسلاید (ms)

export default function FinancialStory({ plan, jy, jm, today, onClose }) {
  const [slides, setSlides] = useState(null) // null=loading, []=empty
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    let cancel = false
    const pj = jm === 1 ? { jy: jy - 1, jm: 12 } : { jy, jm: jm - 1 }
    Promise.all([
      supabase.from('transactions').select('*').eq('plan_id', plan.id).eq('jy', jy).eq('jm', jm),
      supabase.from('transactions').select('*').eq('plan_id', plan.id).eq('jy', pj.jy).eq('jm', pj.jm),
    ]).then(([{ data: cur }, { data: prev }]) => {
      if (cancel) return
      setSlides(buildStory(cur || [], prev || [], jy, jm, today))
    })
    return () => { cancel = true }
  }, [plan, jy, jm, today])

  // پیشروی خودکار
  useEffect(() => {
    if (!slides || !slides.length || paused) return
    const t = setTimeout(() => {
      setIdx(i => (i < slides.length - 1 ? i + 1 : (onClose(), i)))
    }, DURATION)
    return () => clearTimeout(t)
  }, [idx, slides, paused, onClose])

  if (slides === null) {
    return <div className={s.overlay}><div className={s.spinner}>…</div></div>
  }

  if (slides.length === 0) {
    return (
      <div className={s.overlay} style={{ background: 'linear-gradient(165deg,#3B2F8F,#4FACFE)' }}>
        <button className={s.close} onClick={onClose} aria-label="بستن">✕</button>
        <div className={s.slide}>
          <div className={s.emoji}>🗓️</div>
          <div className={s.lg}>این ماه هنوز داده‌ای نداری</div>
          <div className={s.md} style={{ color: 'rgba(255,255,255,0.75)' }}>
            {MONTHS[jm - 1]} {toFa(jy)} — چند تا تراکنش ثبت کن تا داستانش ساخته شه
          </div>
        </div>
        <button className={s.cta} onClick={onClose}>باشه</button>
      </div>
    )
  }

  const slide = slides[idx]
  const goNext = () => setIdx(i => (i < slides.length - 1 ? i + 1 : (onClose(), i)))
  const goPrev = () => setIdx(i => Math.max(0, i - 1))

  return (
    <div className={s.overlay} style={{ background: slide.bg }}>
      {/* نوارهای پیشرفت بالا */}
      <div className={s.bars}>
        {slides.map((_, i) => (
          <div key={i} className={s.barTrack}>
            <div
              className={s.barFill}
              style={
                i < idx ? { width: '100%' }
                : i === idx ? { animation: paused ? 'none' : `kharjStoryBar ${DURATION}ms linear forwards` }
                : { width: '0%' }
              }
            />
          </div>
        ))}
      </div>

      <button className={s.close} onClick={onClose} aria-label="بستن">✕</button>

      {/* محتوای اسلاید (با key دوباره انیمیت می‌شه) */}
      <div className={s.slide} key={idx}>
        {slide.emoji && <div className={s.emoji}>{slide.emoji}</div>}
        {slide.lines.map((ln, i) => (
          <div key={i} className={s[ln.s] || s.md} style={ln.c ? { color: ln.c } : undefined}>
            {ln.t}
          </div>
        ))}
        {slide.hint && <div className={s.hint}>{slide.hint}</div>}
      </div>

      {/* نواحی لمسی: راست=بعدی، چپ=قبلی. نگه‌داشتن=مکث */}
      <div
        className={s.tapPrev}
        onClick={goPrev}
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
      />
      <div
        className={s.tapNext}
        onClick={goNext}
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
      />
    </div>
  )
}
