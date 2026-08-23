# WareSnap — SPEC.md

Справочник данных и текстов. Читай нужный раздел по мере необходимости, не весь файл целиком.

---

## 1. Бренд

```ts
// lib/brand.ts
export const brand = {
  name: "WareSnap",
  domain: "waresnap.app",          // Домен ещё нужно приобрести и проверить
  tagline: "Every product photo, ready to list.",
  description:
    "Resize, optimize and prepare product photos for Amazon, Etsy, Shopify and eBay.",
};
```

Логотип: текстовый wordmark `WareSnap`, weight 600, tracking -0.03em, слева — марка 22×22 из двух перекрывающихся
скруглённых рамок (зелёная `#15803D` снизу-слева, чёрная `#111111` сверху-справа) с белой точкой-«вспышкой» и галочкой
поверх чёрной рамки — образ «кадр → готовый листинг».

---

## 2. Карта маршрутов

**Публичные**
- `/` — главная
- `/pricing`
- `/tools`
- `/tools/amazon-image-resizer`
- `/tools/etsy-image-resizer`
- `/tools/shopify-image-optimizer`
- `/tools/image-compressor`
- `/tools/background-remover`
- `/examples`
- `/faq` (или якорь на главной — достаточно якоря + отдельной страницы, если дёшево)
- `/terms`, `/privacy` — короткие заглушки-плейсхолдеры
- `/editor` — публичный demo редактора (без входа, но Process просит регистрацию, если не авторизован)

**Auth**
- `/signup`, `/signin`, `/forgot-password`, `/reset-password`, `/auth/callback`, `/auth/verify-email`

**Приватные (middleware-guard)**
- `/dashboard`
- `/dashboard/editor` — тот же редактор, но с реальным списанием токенов
- `/dashboard/history`
- `/account`
- `/tokens` — страница/модалка Get More Tokens
- `/checkout` — mock-чекаут

---

## 3. Десять инструментов

| # | Tool | slug | Иконка (lucide) | Одна строка описания | Стоимость |
|---|---|---|---|---|---|
| 1 | Marketplace Resize | `marketplace-resize` | `Frame` | Exact sizes and ratios for Amazon, Etsy, Shopify and eBay. | 1 token / image |
| 2 | Image Compressor | `image-compressor` | `Minimize2` | Smaller files, same visible quality. | 1 token / image |
| 3 | Image Converter | `image-converter` | `Repeat` | Convert between JPG, PNG, WebP and HEIC. | 1 token / image |
| 4 | Background Remover | `background-remover` | `Scissors` | Cut the product out of any background. | 2 tokens / image |
| 5 | White Background | `white-background` | `Square` | Clean white backdrop that passes listing rules. | 2 tokens / image |
| 6 | Product Centering | `product-centering` | `AlignCenter` | Place the product dead center on the canvas. | 1 token / image |
| 7 | Smart Crop | `smart-crop` | `Crop` | Crop to the ratio your storefront expects. | 1 token / image |
| 8 | Bulk Rename | `bulk-rename` | `Type` | Rename whole batches into clean listing filenames. | 1 token / 10 images |
| 9 | Image Quality Checker | `quality-checker` | `CheckCircle2` | Catch size, ratio and resolution problems before upload. | 1 token / 5 images |
| 10 | Marketplace Pack | `marketplace-pack` | `Layers` | One upload, a ready set for every storefront you sell on. | 3 tokens / image |

Marketplace Pack — премиальная функция, доступна с плана Seller. В сетке инструментов помечается бейджем `Seller+`.

Пример вывода Bulk Rename (показывать в UI): `black-leather-wallet-01.jpg`

**Размеры маркетплейсов для UI** (реальные опубликованные спеки, источники — публичные гайды площадок, 2026):
Amazon 2000×2000 (1:1) · Etsy 2000×1600 (5:4) · Shopify 2048×2048 (1:1) · eBay 1600×1600 (1:1) ·
Walmart 2000×2000 (1:1) · TikTok Shop 1000×1000 (1:1) · Poshmark 1200×1200 (1:1) · Depop 1080×1080 (1:1) ·
Mercari 1200×1500 (4:5)

Список площадок живёт в `lib/brand.ts` → `marketplaces` (единственный источник, из него строятся
marquee-строка на главной, Marketplace Pack и расчёт размеров). «Большая четвёрка» (Amazon/Etsy/Shopify/eBay)
остаётся именованной в hero/FAQ-копирайте как самые узнаваемые; остальные 5 показываются через
marquee и Marketplace Pack, не перечисляются поимённо в каждом предложении.

---

## 4. Токены

- Баланс = `subscription tokens` + `purchased tokens`, в UI показываем суммой, в `/account` — раздельно.
- Списание: **сначала subscription, затем purchased.**
- Subscription-токены обновляются каждый биллинговый месяц. Purchased — **never expire.**
- Новый аккаунт при регистрации получает **25 free tokens** (строка на pricing: *Every account starts with 25 free tokens.*).
- Везде, где есть действие, показываем стоимость до нажатия: `Estimated cost — 2 tokens`.
- Если токенов не хватает: неагрессивный inline-блок `You need 12 more tokens` + кнопка `Buy Tokens`.

### Пакеты токенов

| Tokens | Price | $/token | Бейдж |
|---|---|---|---|
| 100 | $4.99 | 0.050 | |
| 250 | $9.99 | 0.040 | |
| 500 | $17.99 | 0.036 | |
| 1,000 | $33.99 | 0.034 | **Most Popular** |
| 2,500 | $79.99 | 0.032 | Best value |
| 5,000 | $149.99 | 0.030 | |

Под таблицей: **Purchased tokens never expire.**
Выгоду показывать подписью `$0.030 per token` + для крупных пакетов `Save 40%` относительно пакета 100.

---

## 5. Тарифы

Тоггл Monthly / Yearly. При Yearly показывать `2 months free` и месячный эквивалент.

**Starter** — $5.99/mo · $45.99/yr · CTA `Start with Starter`
- 100 monthly tokens
- All 10 tools
- Up to 20 images per batch
- Amazon, Etsy, Shopify and eBay presets
- Standard processing
- 7-day file history

**Seller** — $12.99/mo · $99.99/yr · бейдж **Most Popular** · CTA `Choose Seller`
- 350 monthly tokens
- Everything in Starter
- Up to 100 images per batch
- Marketplace Pack
- Saved presets
- Bulk rename
- 30-day file history
- Faster processing

**Pro** — $24.99/mo · $189.99/yr · CTA `Go Pro`
- 1,000 monthly tokens
- Everything in Seller
- Up to 500 images per batch
- Unlimited saved presets
- Larger bulk processing
- 90-day file history
- Priority processing

Под карточками одной строкой: *Cancel anytime. Extra tokens available on every plan.*

---

## 6. Главная страница — структура и копирайт

Порядок секций (и всё, больше ничего не добавлять):

**Header** (sticky, высота 64px, нижняя граница 1px, фон белый)
`WareSnap` · Tools · Pricing · Examples · FAQ · — · `Sign In` (текст) · `Get Started` (primary)
Мобильный: бургер → простой sheet-меню.

**Hero**
- H1: `Product photos ready for every marketplace.`
- Sub: `Resize, optimize and prepare your product images for Amazon, Etsy, Shopify and eBay — without doing the same work over and over.`
- CTA: `Prepare Your Photos` (primary) · `See How It Works` (ghost, скроллит к Workflow)
- Микро-строка под кнопками: `25 free tokens to start. No card required.`
- Визуал: **реальный UI редактора** в аккуратной рамке окна (точки-светофор, светлая полоска адресной строки), не иллюстрация. Компонент `EditorPreview` в режиме `static`.

**Marketplace row**
Заголовок мелким капсом: `BUILT FOR WHERE YOU SELL` · бесконечная CSS-marquee из всех площадок
`lib/brand.ts` (серые wordmark-и), пауза по hover и при `prefers-reduced-motion`.

**Trust strip** — тонкая полоса на surface-фоне сразу под marketplace row: 3 честных факта о
продукте (не про выдуманных клиентов) — количество площадок, количество инструментов, `25 free tokens`.
Число площадок и инструментов читаются из `lib/brand.ts`/`lib/tools.ts`, не захардкожены.

**Workflow** — три шага, крупные номера `01 / 02 / 03`, минимум текста:
- 01 `Upload your product photos`
- 02 `Choose where you're selling`
- 03 `Download ready-to-list images`

**Tools** — сетка 10 карточек (desktop 5×2 или 4×3, mobile 2×5). Иконка 20px, название, одна строка. Кликабельны → `/tools/...` где есть страница, иначе `/tools`.
Заголовок секции: `Ten tools. One workflow.`

**Marketplace Pack** — крупная секция:
- H2: `One upload. Every storefront.`
- Текст (динамический, вставляет `marketplaces.length`): `Stop resizing and exporting the same product photos one marketplace at a time — WareSnap cuts a set for all 9.`
- Визуал: слева `Original`, стрелка, справа сетка (3×3 на десктопе, 2 кол. на планшете, 1 на мобиле) с превью **всех** площадок из `lib/brand.ts` и подписями размеров.

**Before / After** — 3 реальных товара (кошелёк, косметика, кольцо), ряд: `Original` → `Centered` → `White background` → `Marketplace ready`. Подписи мелкие, серые. На мобиле — горизонтальный скролл.

**Testimonials** — 3 карточки «отзывов», H2 `What sellers say.` Плейсхолдер-контент: реальных клиентов
у продукта пока нет (pre-launch), но по прямому запросу владельца продукта оформлены так, будто отзывы
уже настоящие — инициалы в кружке вместо фото (не стоковые лица чужих людей), имя + роль, короткая
цитата без придуманных точных цифр/процентов. Данные — `lib/testimonials.ts`, единственное место,
куда владелец подставит реальные тексты позже.

**Pricing** — три карты, тоггл Monthly/Yearly, средняя выделена рамкой accent-цвета и бейджем.

**Token top-up**
- H2: `Need more processing?`
- Текст: `Your plan doesn't have to limit your busy months. Buy extra tokens anytime — they never expire.`
- CTA: `View Token Packs`

**FAQ** — accordion, 8 вопросов (раздел 7).

**Footer** — 3 колонки + копирайт:
Product: Tools · Pricing · Examples · FAQ
Company: Terms · Privacy
Account: Sign In · Create Account
`© 2026 WareSnap. All rights reserved.`

---

## 7. FAQ (финальные тексты)

1. **What are tokens?** — Tokens are used when you process product images. Different tools use different amounts depending on the work involved.
2. **Do purchased tokens expire?** — No. Extra token packs never expire. Your plan's monthly tokens are used first.
3. **What happens to my monthly tokens?** — Your plan's included tokens refresh at the start of every billing month.
4. **Can I use WareSnap for Amazon and Etsy?** — Yes. WareSnap prepares images for Amazon, Etsy, Shopify, eBay and other marketplaces from a single upload.
5. **Can I cancel anytime?** — Yes. Your plan stays active until the end of the billing period.
6. **Do I need design experience?** — No. Pick your marketplace and WareSnap handles sizes, ratios and formats.
7. **Does WareSnap generate product images?** — No. WareSnap is built to prepare and optimize the photos you already have.
8. **What image formats are supported?** — JPG, PNG, WebP and HEIC.

---

## 8. Editor (demo)

Три колонки, никакого Photoshop.

- **Левая (200px):** список 10 инструментов, активный подсвечен accent-фоном `#F0FDF4` + левой полоской.
- **Центр:** превью изображения на нейтральном фоне `#FAFAFA`, сверху имя файла и размеры, снизу — миниатюры загруженных фото (для demo — 3 sample-изображения).
- **Правая (280px):** настройки активного инструмента + `Estimated cost — N tokens` + кнопка `Process Image`.

Пример правой панели для Marketplace Resize:
`Marketplace` (Amazon / Etsy / Shopify / eBay) → `Format` (JPG / PNG / WebP) → `Output` (2000 × 2000, читается из выбора) → `Estimated cost: 2 tokens` → `Process Image`.

Поведение Process: 1 секунда loading (прогресс-полоска, не спиннер-глоу) → превью меняется на mock-результат (тот же файл в целевом ratio на белом канвасе) → success-строка `Ready — 2 tokens used` + кнопки `Download` (скачивает исходник) и `Process another`.
Неавторизованный пользователь: после результата — мягкий блок `Create a free account to download` → `/signup`.

---

## 9. Dashboard

Header приложения: `WareSnap` · Dashboard · Tools · History · Pricing · — · `287 tokens` (пилюля, кликабельна → /tokens) · avatar-меню (Account, Billing, Sign out).

Контент:
1. Приветствие: `Good morning, {first name}` (по времени суток), под ним: `{N} tokens available` + кнопка `Buy Tokens`.
2. **Главная карточка `Prepare Product Photos`** — крупная зона drag & drop (граница dashed 1px, радиус 12), текст `Drop product photos here or browse`, под ней ряд чипов Amazon / Etsy / Shopify / eBay и кнопка `Continue` → `/dashboard/editor`.
3. **Quick Tools** — 6 карточек: Marketplace Resize, Background Remover, White Background, Image Compressor, Smart Crop, Marketplace Pack.
4. **Recent Files** — таблица mock-истории: thumbnail, имя файла, marketplace, дата, статус `Ready`, действие `Download`. 5–6 строк demo-данных.

## 10. Account

`/account`: Email · Current Plan · Billing Cycle · Renews on · Monthly Tokens (осталось/всего) · Purchased Tokens.
Кнопки: `Manage Plan` → `/pricing`, `Buy Tokens` → `/tokens`, `Sign Out`.
Блок `Purchase history` — таблица-плейсхолдер с 2–3 demo-строками и пояснением `Billing history will appear here.`

---

## 11. Данные и Supabase

Минимальная схема, RLS «только свои строки»:

```sql
profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  plan text not null default 'free',          -- free | starter | seller | pro
  billing_cycle text default 'monthly',
  tokens_subscription int not null default 25,
  tokens_purchased int not null default 0,
  created_at timestamptz default now()
)

token_ledger (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade,
  delta int not null,                          -- отрицательное = списание
  reason text not null,                        -- signup_bonus | tool_run | pack_purchase
  tool text,
  created_at timestamptz default now()
)
```

- Триггер на `auth.users` insert → создаёт `profiles` с 25 free tokens + запись в ledger.
- RPC `spend_tokens(cost int, reason text, tool text)` — атомарно списывает сначала из `tokens_subscription`, затем из `tokens_purchased`; возвращает новый баланс или ошибку `insufficient_tokens`.
- Всё остальное (файлы, история) — mock на фронте, в БД не хранить.

**Auth:** `@supabase/ssr`, клиенты `lib/supabase/client.ts` / `server.ts` / `middleware.ts`. Email + password, подтверждение email включено.
**Resend:** подключается как Custom SMTP в Supabase Auth (Project Settings → Auth → SMTP). Свой код отправки писем не пишем.
Шаблоны писем в Supabase поправить под бренд: confirm signup, reset password.

**.env.example:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=
```

---

## 12. Оплата (mock)

```ts
// lib/billing/types.ts
export interface BillingProvider {
  startPlanCheckout(planId: PlanId, cycle: "monthly" | "yearly"): Promise<void>;
  startPackCheckout(packId: PackId): Promise<void>;
  openPortal(): Promise<void>;
}
```
`mock.ts` — переход на `/checkout?type=plan&id=seller&cycle=yearly`.
Страница `/checkout`: сводка заказа, цена, строка `Payment provider not connected yet`, кнопка `Simulate successful payment` (видна только при `NODE_ENV !== "production"` или под флагом `NEXT_PUBLIC_DEMO_CHECKOUT=true`) — начисляет токены/меняет план через RPC, чтобы demo было живым.
UI кнопок Subscribe / Upgrade / Buy Tokens пишем сразу «боевым» — при подключении Stripe меняется только реализация провайдера.

---

## 13. Чего НЕ делаем в v1

Реальная обработка изображений, AI-генерация, любые marketplace API, настоящий биллинг и подписки,
сложный бэкенд, команды, админка, публичный API, мобильное приложение, расширение для браузера, dark mode, блог, i18n.
