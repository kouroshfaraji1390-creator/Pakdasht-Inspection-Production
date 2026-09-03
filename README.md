# Pakdasht Inspection

سامانه مدیریت و نظارت بازرسی میدانی، با Frontend موبایل‌محور/PWA و Backend واقعی Node.js. نسخه فعلی برای اجرای محلی با SQLite آماده است و برای Production یک مسیر کنترل‌شده برای PostgreSQL، Reverse Proxy/HTTPS و سرویس‌های خارجی فراهم می‌کند.

## وضعیت این نسخه

- PWA: تکمیل‌شده و قابل نصب روی Android Chrome در محیط HTTPS.
- Authentication: Session token در Cookie امن HttpOnly برای same-origin؛ Bearer برای سازگاری API همچنان پذیرفته می‌شود.
- Demo seed: فقط وقتی `DEMO_MODE=true` باشد فعال است؛ در Production به‌صورت پیش‌فرض خاموش است.
- Registration: در Production به‌صورت پیش‌فرض خاموش است و باید با سیاست سازمانی فعال شود.
- Rate limiting، CORS allow-list، محدودیت اندازه body و security headers اضافه شده‌اند.
- Service Worker دیگر API یا پاسخ‌های احراز هویت‌شده را cache نمی‌کند.
- Offline Queue برای track point دارای `missionId` است تا بعد از reload نیز قابل Sync باشد.
- PostgreSQL schema و migration script opt-in در پروژه قرار دارند؛ اجرای migration نیازمند نصب `pg` و یک PostgreSQL managed است.
- خروجی فعلی CSV استاندارد Excel-compatible است؛ `.xlsx` واقعی به یک Excel library نیاز دارد و عمداً بدون dependency غیرقابل‌دسترس fake نشده است.

## اجرا

Node.js 22.5+:

```bash
npm install
npm test
npm run build
npm start
```

سپس: `http://localhost:8787`

### Development demo

با `NODE_ENV=development` و `DEMO_MODE=true`، در صورتی که `DEMO_MANAGER_PASSWORD` و `DEMO_INSPECTOR_PASSWORD` را در Environment تنظیم کنید، حساب‌های `manager.demo` و `inspector.demo` seed می‌شوند. رمزها عمداً داخل Source Code یا UI قرار نگرفته‌اند.

این اطلاعات **برای Production نیستند**.

## Environment Variables

فایل `.env.example` را مبنا قرار دهید. مهم‌ترین موارد:

- `NODE_ENV=production`
- `APP_ORIGIN=https://inspection.example.com`
- `DB_FILE=...` برای SQLite محلی
- `SESSION_TTL_DAYS=7`
- `DEMO_MODE=false`
- `ALLOW_REGISTRATION=false`
- `RATE_LIMIT_WINDOW_MS=60000`
- `RATE_LIMIT_MAX=120`
- `AUTH_RATE_LIMIT_MAX=10`
- `MAX_BODY_BYTES=1000000`
- `TRUST_PROXY=false`؛ فقط وقتی Reverse Proxy مورد اعتماد دارید `true` کنید.

## Production deployment

Backend فعلی HTTP است و باید پشت یک Reverse Proxy/Load Balancer دارای TLS اجرا شود. در Production:

1. PostgreSQL managed بسازید.
2. HTTPS را در Reverse Proxy فعال کنید.
3. `APP_ORIGIN` را دقیقاً برابر Origin عمومی قرار دهید.
4. `DEMO_MODE=false` و `ALLOW_REGISTRATION=false` بگذارید مگر سیاست سازمان خلاف آن باشد.
5. Secretها را در Secret Manager/Environment قرار دهید.
6. ابتدا migration را روی یک محیط staging اجرا و count جدول‌ها را تطبیق دهید.
7. Backup و restore drill انجام دهید.
8. سپس دامنه عمومی را به سرویس وصل کنید.

### PostgreSQL migration

اسکیما در `database/postgresql-schema.sql` است. اسکریپت migration عمداً هنگام startup اجرا نمی‌شود.

```bash
npm install pg
DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require' npm run migrate:postgres
```

قبل از Production، migration را روی staging تست کنید و تعداد رکوردهای SQLite/PostgreSQL را مقایسه کنید.

### SQLite backup

```bash
npm run backup
```

این دستور یک snapshot SQLite با `VACUUM INTO` می‌سازد. برای Production واقعی، backup managed PostgreSQL و تست restore نیز لازم است.

## Authentication

Session token در DB به‌صورت hash ذخیره می‌شود. Login یک Cookie با `HttpOnly`, `SameSite=Lax` و در Production `Secure` ایجاد می‌کند. Frontend دیگر token را در `localStorage` نگه نمی‌دارد.

Forgot Password در این نسخه یک integration point است و تا وقتی Email/SMS provider تنظیم نشده، در Production پاسخ `503` می‌دهد؛ هیچ reset token حساسی در پاسخ API برگردانده نمی‌شود.

## Realtime

به‌جای `EventSource`، Frontend از `fetch()` streaming استفاده می‌کند تا بتواند Authorization را بدون قرار دادن token در URL ارسال کند. این روش با PWA/Browser سازگار است و SSE backend موجود را حفظ می‌کند.

## PWA / Offline

Service Worker فقط App Shell و assetهای static را cache می‌کند. APIهای authenticated cache نمی‌شوند. Navigation در حالت قطع اینترنت به App Shell fallback می‌کند.

IndexedDB برای Queue استفاده می‌شود و track pointها با mission ID ذخیره می‌شوند. بعد از بازگشت اینترنت، Queue با retry محدود و بدون حذف کورکورانه تلاش می‌کند sync شود.

نکته: Offline به معنی «همه قابلیت‌ها بدون اینترنت» نیست. Map tileهای جدید نیازمند اینترنت هستند و عملیات server-authoritative نیز تا زمان اتصال sync نمی‌شوند.

## GPS

GPS با Geolocation API فعال می‌شود و فقط هنگام Mission tracking اجرا می‌شود. مرورگر/سیستم‌عامل ممکن است background tracking را محدود کند. برای مأموریت‌های طولانی و حساس، Native Android/iOS با background location باید جداگانه ارزیابی شود.

## Maps

Map tileها از OpenStreetMap استفاده می‌کنند. برای استفاده سازمانی Production باید policy و ظرفیت Tile Provider بررسی شود؛ اگر بار بالا یا SLA لازم است، Provider مناسب سازمان انتخاب شود. Service Worker tileها را cache نمی‌کند.

## Export

گزارش‌ها در Frontend به CSV با UTF-8 BOM صادر می‌شوند تا Excel به‌صورت مستقیم آن را باز کند. `.xlsx` واقعی در این محیط بدون نصب dependency خارجی تولید نشده است؛ برای Production می‌توان `xlsx` را به Backend اضافه کرد و Export را server-side انجام داد.

## Security

موارد زیر در کد اعمال شده‌اند:

- scrypt password hashing با salt تصادفی
- hash شدن session token در DB
- HttpOnly/SameSite/Secure cookie در Production
- CORS allow-list
- rate limiting حافظه‌ای برای API و Auth
- request body size limit
- JSON parsing امن
- security headers
- organization/role checks در مسیرهای حساس
- عدم cache کردن API توسط Service Worker
- عدم نگهداری session token در localStorage
- validation اولیه مختصات و timestampهای GPS

این موارد جایگزین penetration test، WAF/managed rate limiting، monitoring و review امنیتی مستقل نیستند.
