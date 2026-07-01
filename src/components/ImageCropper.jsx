import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import s from './ImageCropper.module.css'

// برشِ مربعیِ عکس قبل از آپلود. کاربر با درگ جابجا می‌کنه و با اسلایدر زوم می‌کنه.
// خروجی یک Blob مربعی (JPEG) با ابعاد output×output است.
export default function ImageCropper({ file, output = 512, onCancel, onConfirm }) {
  const [src, setSrc] = useState('')
  const [img, setImg] = useState(null)   // { nw, nh, el }
  const [vp, setVp] = useState(0)        // اندازه‌ی مربعِ نمایش (px)
  const [scale, setScale] = useState(1)  // زومِ کاربر ≥ 1
  const [off, setOff] = useState({ x: 0, y: 0 })
  const [busy, setBusy] = useState(false)
  const vpRef = useRef(null)
  const drag = useRef(null)

  // لود عکس
  useEffect(() => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setSrc(url)
    const el = new Image()
    el.onload = () => setImg({ nw: el.naturalWidth, nh: el.naturalHeight, el })
    el.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  // اندازه‌گیریِ مربعِ نمایش
  useLayoutEffect(() => {
    if (vpRef.current) setVp(vpRef.current.clientWidth)
  }, [src])

  // هندسه‌ی فعلی بر اساس زوم و اندازه‌ی نمایش
  function geom() {
    if (!img || !vp) return null
    const base = Math.max(vp / img.nw, vp / img.nh) // پوششِ کامل
    const eff = base * scale
    const dw = img.nw * eff
    const dh = img.nh * eff
    return { eff, dw, dh, maxX: Math.max(0, (dw - vp) / 2), maxY: Math.max(0, (dh - vp) / 2) }
  }

  function clampOff(o, g) {
    return { x: Math.max(-g.maxX, Math.min(g.maxX, o.x)), y: Math.max(-g.maxY, Math.min(g.maxY, o.y)) }
  }

  const g = geom()
  const view = g ? clampOff(off, g) : off

  function onScaleChange(v) {
    const ns = parseFloat(v)
    setScale(ns)
    const base = Math.max(vp / img.nw, vp / img.nh)
    const eff = base * ns
    const dw = img.nw * eff, dh = img.nh * eff
    const ng = { maxX: Math.max(0, (dw - vp) / 2), maxY: Math.max(0, (dh - vp) / 2) }
    setOff(o => clampOff(o, ng))
  }

  function onPointerDown(e) {
    if (!g) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = { px: e.clientX, py: e.clientY, ox: view.x, oy: view.y }
  }
  function onPointerMove(e) {
    if (!drag.current || !g) return
    const nx = drag.current.ox + (e.clientX - drag.current.px)
    const ny = drag.current.oy + (e.clientY - drag.current.py)
    setOff(clampOff({ x: nx, y: ny }, g))
  }
  function onPointerUp() { drag.current = null }

  async function confirm() {
    if (!g || busy) return
    setBusy(true)
    try {
      // مختصاتِ گوشه‌ی بالا-چپِ کادر در فضای طبیعیِ عکس
      const sx = (g.dw / 2 - view.x - vp / 2) / g.eff
      const sy = (g.dh / 2 - view.y - vp / 2) / g.eff
      const sSize = vp / g.eff
      const canvas = document.createElement('canvas')
      canvas.width = output; canvas.height = output
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img.el, sx, sy, sSize, sSize, 0, 0, output, output)
      const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.9))
      await onConfirm(blob)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={s.overlay}>
      <div className={s.sheet}>
        <div className={s.head}>
          <button className={s.cancel} onClick={onCancel} disabled={busy}>انصراف</button>
          <span className={s.title}>برش عکس</span>
          <button className={s.done} onClick={confirm} disabled={busy || !g}>{busy ? '...' : 'تأیید'}</button>
        </div>

        <div
          className={s.viewport}
          ref={vpRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {src && g && (
            <img
              src={src}
              alt=""
              draggable={false}
              className={s.cropImg}
              style={{
                width: g.dw + 'px',
                height: g.dh + 'px',
                left: (vp / 2 + view.x - g.dw / 2) + 'px',
                top: (vp / 2 + view.y - g.dh / 2) + 'px',
              }}
            />
          )}
          <div className={s.frame} />
        </div>

        <div className={s.zoomRow}>
          <span className={s.zoomIcon}>−</span>
          <input
            type="range" min="1" max="4" step="0.01" value={scale}
            onChange={e => onScaleChange(e.target.value)} className={s.zoom}
          />
          <span className={s.zoomIcon}>+</span>
        </div>
        <p className={s.hint}>برای جابجایی بکش و با اسلایدر زوم کن</p>
      </div>
    </div>
  )
}
