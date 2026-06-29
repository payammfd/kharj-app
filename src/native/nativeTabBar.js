import { Capacitor, registerPlugin } from '@capacitor/core'

// فقط داخل اپ نیتیو (iOS/Android) فعاله؛ توی PWA/مرورگر null می‌مونه و نوار وب استفاده می‌شه.
export const isNativeApp = Capacitor.isNativePlatform()

const NativeTabBar = isNativeApp ? registerPlugin('NativeTabBar') : null

// راه‌اندازی نوار نیتیو: گوش‌دادن به تپِ تب‌ها و دکمه‌ی «ثبت». تابع cleanup برمی‌گردونه.
export function setupNativeTabBar({ onTab, onAdd }) {
  if (!NativeTabBar) return () => {}
  const handles = []
  NativeTabBar.addListener('tabSelected', (e) => onTab?.(e.tab)).then(h => handles.push(h))
  NativeTabBar.addListener('addTapped', () => onAdd?.()).then(h => handles.push(h))
  NativeTabBar.show().catch(err => console.error('[NativeTabBar] show failed:', err))
  return () => {
    try { NativeTabBar.hide() } catch {}
    handles.forEach(h => h.remove?.())
  }
}

// همگام‌سازی تب فعالِ نوار نیتیو با state ری‌اکت
export function setNativeActiveTab(tab) {
  NativeTabBar?.setActive({ tab })
}

// مخفی/نمایش نوار نیتیو (مثلاً موقع باز بودن شیت ثبت تراکنش روی محتوای وب)
export function setNativeTabBarHidden(hidden) {
  if (!NativeTabBar) return
  if (hidden) NativeTabBar.hide()
  else NativeTabBar.show()
}
