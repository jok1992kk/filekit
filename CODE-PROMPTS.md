# FileKit — что отправлять в Claude Code

Порядок: одно сообщение = один этап. Между этапами `/clear`.

## Подготовка папки

```
mkdir filekit && cd filekit
mkdir design-ref
```

Положи внутрь:
- `CLAUDE.md` — в корень
- `SPEC.md` — в корень
- `filekit-home.html` — в `design-ref/`
- свои скриншоты-референсы (если есть) — в `design-ref/`

Запусти `claude` из папки `filekit`.

---

## Сообщение 1 — Этап 0+1: скелет и перенос вёрстки

Подставь путь к репозиторию PECRON вместо `<ПУТЬ>`. Если его нет локально — удали пункт 1 целиком.

```
Прочитай CLAUDE.md и SPEC.md. Открой design-ref/filekit-home.html —
это утверждённый дизайн главной страницы. Он не обсуждается и не улучшается,
задача перенести его один в один.

1) Изучи предыдущий проект в <ПУТЬ>: package.json, конфиги, tailwind config,
структуру app/ и components/, utils, .env.example. node_modules и .next не читай.
Создай REUSE.md — что переносим и под какими именами. Версии не апгрейди.

2) Создай в текущей папке Next.js проект (App Router, TypeScript, Tailwind)
на тех же версиях. Перенеси то, что записал в REUSE.md.

3) Вынеси дизайн-токены из design-ref/filekit-home.html (блок :root) в CSS-переменные
в globals.css и подключи их в tailwind theme. Подключи шрифт Inter и lucide-react.

4) Создай lib/brand.ts, lib/tools.ts, lib/plans.ts, lib/token-packs.ts
по данным SPEC.md разделов 1, 3, 4, 5.

5) Разбери HTML на компоненты и собери из них app/page.tsx:
   components/site/Header.tsx
   components/site/Hero.tsx
   components/site/MarketplaceRow.tsx
   components/site/Workflow.tsx
   components/site/ToolsGrid.tsx   — рендерит из lib/tools.ts, иконки lucide
   components/site/Pricing.tsx     — рендерит из lib/plans.ts, тоггл на useState
   components/editor/EditorPreview.tsx — props { mode: "static" | "interactive" },
   пока работает только "static", на Этапе 5 оживёт
   Блок "Stage 1 visual draft" внизу не переноси.

6) Скачай изображения из HTML в public/samples/ (ссылки на images.pexels.com внутри),
замени src на локальные пути, добавь public/samples/CREDITS.md с авторами и ссылками.
Используй next/image, для hero-превью priority.

Правила переноса: те же цвета, размеры шрифтов, отступы, границы, радиусы.
Ничего не «улучшай», не добавляй анимаций, не меняй тексты.
Медиазапросы из HTML переведи в Tailwind-брейкпоинты как есть.

В конце: npm run build без ошибок, dev-сервер, короткий отчёт.
Других страниц не создавай.
```

---

## Сообщение 2 — Этап 2: остальные секции главной

```
Прочитай SPEC.md разделы 6 и 7. Добавь на главную недостающие секции
в том же стиле, что уже есть: Marketplace Pack, Before/After, Token top-up,
FAQ (accordion на useState, без библиотек), Footer.

Marketplace Pack: слева Original, стрелка, справа сетка 2×2 с превью
Amazon / Etsy / Shopify / eBay и подписями размеров. Превью — то же фото
в разных aspect-ratio на белом канвасе, никакой реальной обработки.

Before/After: два товара, ряд Original → Centered → White background → Marketplace ready.

Затем проверь всю страницу на 375 / 768 / 1440 и почини, что разъезжается.
Уже принятые секции не переделывай.
```

---

## Сообщение 3 — Этап 3: авторизация

```
Прочитай SPEC.md раздел 11. Сделай рабочую авторизацию:

- @supabase/ssr, клиенты client/server/middleware, обновление сессии в middleware;
- страницы /signup, /signin, /forgot-password, /reset-password, /auth/callback,
  /auth/verify-email — карточка по центру, в стиле сайта, максимум простоты;
- SQL-миграция: profiles, token_ledger, RLS, триггер на нового пользователя
  с 25 free tokens, RPC spend_tokens (сначала subscription, потом purchased);
- защита /dashboard, /account, /tokens в middleware;
- .env.example, ключи только через env.

Resend подключается как Custom SMTP на стороне Supabase — свой код отправки
писем не пиши. Вместо этого выпиши в отчёте пошаговую инструкцию:
что нажать в Supabase и Resend, какие DNS-записи добавить.

Проверь цикл: регистрация → письмо → подтверждение → вход → выход → сброс пароля.
```

---

## Сообщение 4 — Этап 4: дашборд, аккаунт, токены

```
Прочитай SPEC.md разделы 4, 9, 10, 12. Сделай:

- /dashboard: приветствие по времени суток, баланс токенов, большая карточка
  Prepare Product Photos с drag & drop, чипы маркетплейсов, Quick Tools (6 штук),
  Recent Files с demo-данными;
- /account по разделу 10;
- /tokens: шесть пакетов, цена за токен, бейджи Most Popular и Best value,
  строка "Purchased tokens never expire";
- lib/billing/ — интерфейс BillingProvider и mock-провайдер;
- /checkout: сводка заказа и кнопка Simulate successful payment
  под флагом NEXT_PUBLIC_DEMO_CHECKOUT, начисляет токены через RPC;
- баланс в шапке приложения, списание через spend_tokens.

Файлы обрабатываются только на клиенте, никуда не загружаются.
```

---

## Сообщение 5 — Этап 5: редактор

```
Прочитай SPEC.md раздел 8. Доведи EditorPreview до mode="interactive"
и подними на /editor (публичный) и /dashboard/editor (с реальным списанием).

Переключение инструментов меняет правую панель и Estimated cost.
Process: 1 секунда прогресс-полоски → превью заменяется mock-результатом
(то же фото в целевом ratio на белом канвасе) → строка "Ready — 2 tokens used",
кнопки Download и Process another.
На публичном /editor вместо скачивания — предложение создать аккаунт.
На мобиле три колонки становятся вкладками Tools / Preview / Settings.
```

---

## Сообщение 6 — Этап 6: остальные страницы

```
Сделай /tools (все 10 из lib/tools.ts) и пять страниц инструментов:
amazon-image-resizer, etsy-image-resizer, shopify-image-optimizer,
image-compressor, background-remover. Один шаблон плюс данные, не пять разных страниц:
короткий заголовок, 2–3 предложения, upload-зона, mock-обработка на компонентах
редактора, блок Related tools.

Также /examples (6 категорий товаров, для каждой Original → Amazon / Etsy / Shopify),
/pricing (та же секция плюс FAQ по биллингу), /terms и /privacy как короткие заглушки.
```

---

## Сообщение 7 — Этап 7: полировка и деплой

```
Метаданные и og для всех страниц из lib/brand.ts, favicon, 404,
состояния loading / error / empty, focus-стили, контраст, alt у всех изображений,
LCP на главной. Проверь, что нигде нет слов AI-powered / Magic / Generate /
Supercharge / Seamless и не осталось заглушек в видимом UI.
Прод-билд, README с инструкцией деплоя на Vercel и списком переменных окружения.
```

---

## Если что-то пойдёт не так

- Ушёл в «иишный» стиль → «перечитай раздел Дизайн-система в CLAUDE.md и design-ref/filekit-home.html, приведи в соответствие».
- Начал переписывать принятую вёрстку → «Этап 1 закрыт, главную не трогай».
- Раздулся контекст → `/clear` и следующее сообщение из этого файла.
- В конце каждого этапа — коммит.
