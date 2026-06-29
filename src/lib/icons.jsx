// آیکون‌های خطیِ مینیمال (به‌جای ایموجی) — سبک Lucide
function svg(children, { size = 24, color = 'currentColor', sw = 1.8 } = {}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  )
}

export const BellIcon = (p) => svg(<>
  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
</>, p)

export const SearchIcon = (p) => svg(<>
  <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
</>, p)

export const SortIcon = (p) => svg(<>
  <path d="M3 6h11" /><path d="M3 12h7" /><path d="M3 18h4" />
  <path d="M18 6v13" /><path d="m15 16 3 3 3-3" />
</>, p)

export const HomeIcon = (p) => svg(<>
  <path d="M3 9.5 12 3l9 6.5" />
  <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
</>, p)

// آیکونِ هر دسته‌بندی
const CAT = {
  'خوراک': <><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2 2h2l2.6 12.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 1.95-1.57L22 7H5" /></>,
  'حمل و نقل': <><path d="M19 17h2l.6-2.5a6 6 0 0 0-.4-4.4l-1.1-2.2A2 2 0 0 0 18.3 7H5.7a2 2 0 0 0-1.8 1.1L2.8 10.3a6 6 0 0 0-.4 4.4L3 17h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" /></>,
  'آب، برق، گاز': <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  'اینترنت': <><path d="M5 13a10 10 0 0 1 14 0" /><path d="M8.5 16.5a5 5 0 0 1 7 0" /><path d="M2 8.8a15 15 0 0 1 20 0" /><path d="M12 20h.01" /></>,
  'سلامت': <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />,
  'پوشاک': <path d="M20.4 3.5 16 2a4 4 0 0 1-8 0L3.6 3.5a2 2 0 0 0-1.3 2.2l.6 3.5a1 1 0 0 0 1 .8H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.1a1 1 0 0 0 1-.8l.6-3.5a2 2 0 0 0-1.3-2.2z" />,
  'تفریح': <><line x1="6" y1="12" x2="10" y2="12" /><line x1="8" y1="10" x2="8" y2="14" /><line x1="15" y1="13" x2="15.01" y2="13" /><line x1="18" y1="11" x2="18.01" y2="11" /><rect x="2" y="6" width="20" height="12" rx="2" /></>,
  'آموزش': <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
  'سایر': <><path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" /><circle cx="7.5" cy="7.5" r="1.5" /></>,
  'درآمد': <><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></>,
}

export function CategoryIcon({ cat, ...p }) {
  return svg(CAT[cat] || CAT['سایر'], p)
}
