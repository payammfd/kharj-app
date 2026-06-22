# راهنمای راه‌اندازی اپ خرج

## ساختار پروژه
```
kharj-app/
├── src/
│   ├── components/   (AddSheet, AnalysisSheet, ShareSheet)
│   ├── hooks/        (useAuth, usePlan)
│   ├── lib/          (supabase.js + Jalali utils)
│   ├── pages/        (Login, Setup, Dashboard)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── vercel.json
└── supabase-schema.sql
```

---

## مرحله ۱ — Supabase

1. برو به [supabase.com](https://supabase.com) و پروژه جدید بساز
2. از منوی چپ برو **SQL Editor**
3. محتوای `supabase-schema.sql` رو کپی و اجرا کن
4. از **Settings → API** دو مقدار رو بردار:
   - `Project URL`
   - `anon public` key

### فعال‌سازی Sign in with Apple در Supabase
1. برو به **Authentication → Providers → Apple**
2. برای این کار نیاز داری به یه **Apple Developer Account** (99 دلار/سال)
3. در Apple Developer:
   - یه **App ID** بساز با قابلیت Sign in with Apple
   - یه **Service ID** بساز (این میشه Client ID در Supabase)
   - یه **Private Key** دانلود کن
4. این مقادیر رو در Supabase وارد کن:
   - Services ID (Client ID)
   - Key ID
   - Team ID (از Apple Developer account)
   - Private Key (محتوای فایل .p8)
5. **Redirect URL** از Supabase رو در Apple Developer اضافه کن

---

## مرحله ۲ — راه‌اندازی لوکال

```bash
cd kharj-app
npm install

# فایل .env بساز
cp .env.example .env
# مقادیر Supabase رو وارد کن
```

محتوای `.env`:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

```bash
npm run dev
# اپ روی http://localhost:5173 بالا میاد
```

---

## مرحله ۳ — دیپلوی روی Vercel

1. کد رو روی GitHub push کن
2. برو به [vercel.com](https://vercel.com) → **New Project** → repo رو import کن
3. در **Environment Variables** اضافه کن:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. دکمه **Deploy** رو بزن

Vercel یه URL مثل `kharj-app.vercel.app` بهت میده.

---

## مرحله ۴ — اضافه کردن URL به Supabase

در Supabase برو **Authentication → URL Configuration**:
- **Site URL:** `https://kharj-app.vercel.app`
- **Redirect URLs:** `https://kharj-app.vercel.app`

---

## نحوه استفاده مشترک

1. **تو** اپ رو باز کن، با Apple وارد شو، پلن جدید بساز
2. کد دعوت ۸ رقمی رو از آیکون Share در بالا ببین
3. **همسرت** اپ رو باز کنه، با Apple وارد بشه، بزنه "پیوستن" و کد رو وارد کنه
4. از این به بعد هر دو تراکنش‌های همدیگه رو می‌بینین

---

## امکانات اپ

- ✅ PWA — قابل نصب روی iPhone/Android
- ✅ Sign in with Apple
- ✅ پلن مشترک خانوادگی
- ✅ تقویم شمسی کامل
- ✅ دسته‌بندی هزینه‌ها
- ✅ تحلیل ماهانه
- ✅ حذف تراکنش (فقط تراکنش‌های خودت)
- ✅ دارک مود
- ✅ فونت Vazirmatn

---

## نکات مهم

- Sign in with Apple نیاز به **Apple Developer Account** داره (99$/year)
- اگه فعلاً Apple Developer Account نداری، در Supabase می‌تونی **Google** رو هم فعال کنی تا موقتاً با Google تست کنی
- برای PWA کامل (Install روی iPhone)، باید از **HTTPS** سرو بشه (Vercel این کار رو می‌کنه)
