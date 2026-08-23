# REUSE.md — что переносим из предыдущего проекта

## Какой проект взят за основу

`CODE-PROMPTS.md` предлагал взять **PECRON** (`../pecron`). Он существует локально, но это
**чистая статика**: `index.html` + `assets/`, без `package.json`, без Tailwind-конфига, без `app/`.
Переносить в Next.js-проект оттуда нечего.

Поэтому источником переиспользования взят **`../peelo`** (последний Next.js-проект, 13.08.2026) —
у него ровно тот стек, что описан в `CLAUDE.md`: Next 15 App Router + TS + Tailwind v4 +
Supabase (`@supabase/ssr`) + Resend + shadcn/ui точечно + lucide-react + Vercel.

`../argent` (Next 15, Tailwind v4) и `../reverie` (Next 14, Tailwind v3, Clerk) не подошли:
argent беднее по инфраструктуре, reverie — другое поколение стека и другой auth.

---

## Версии (зафиксированы по `peelo/package-lock.json`, **не апгрейдим**)

| Пакет | Версия |
|---|---|
| next | 15.5.22 |
| react / react-dom | 19.1.0 |
| tailwindcss / @tailwindcss/postcss | 4.3.3 (`^4`) |
| typescript | 5.9.3 (`^5`) |
| lucide-react | 1.31.0 (`^1.28.0`) |
| clsx | 2.1.1 |
| tailwind-merge | 3.6.0 |
| eslint | 9.39.5 (`^9`) |
| eslint-config-next / @next/eslint-plugin-next | 15.5.22 |
| @eslint/eslintrc | `^3` |
| eslint-plugin-react-hooks | `^5.2.0` |
| @types/node | `^20` |
| @types/react / @types/react-dom | `^19` |

Пакетный менеджер — **npm** (в peelo лежит `package-lock.json`).

На Этапе 0+1 ставим только то, что реально нужно главной. Отложено до своих этапов:
`@supabase/ssr`, `@supabase/supabase-js`, `resend`, `zod`, `@radix-ui/*`, `class-variance-authority`,
`react-hook-form`, `sonner`, `sharp`. Версии для них берём из таблицы peelo, когда дойдём.

**Не переносим намеренно:** `framer-motion` (в `CLAUDE.md` анимационные библиотеки запрещены),
`@whop/sdk` и `@fal-ai/client` (чужая предметная область), `react-email`/`emails/`
(письма делает Supabase Auth через Resend SMTP), скрипты `scripts/*` из peelo.

---

## Файлы и конфиги — 1:1

| Из peelo | В filekit | Что меняется |
|---|---|---|
| `tsconfig.json` | `tsconfig.json` | без изменений (алиас `@/*` → `./*`) |
| `postcss.config.mjs` | `postcss.config.mjs` | без изменений |
| `eslint.config.mjs` | `eslint.config.mjs` | без изменений |
| `components.json` | `components.json` | `baseColor: neutral`, `iconLibrary: lucide` — оставляем как есть |
| `.gitignore` | `.gitignore` | без изменений |
| `next.config.ts` | `next.config.ts` | тот же паттерн security-заголовков + CSP; комментарии переписаны под FileKit |
| `.env.example` | `.env.example` | структура и стиль комментариев те же, ключи — из `SPEC.md` §11 |

## Код

| Из peelo | В filekit | Комментарий |
|---|---|---|
| `lib/utils.ts` → `cn()` | `lib/utils.ts` → `cn()` | переносим `cn()` на `clsx` + `tailwind-merge`. `extendTailwindMerge` с именованной шкалой шрифтов **не нужен**: у FileKit нет `text-h1`-подобных имён, размеры — арбитрарные (`text-[14.5px]`). Берём обычный `twMerge`. |
| `lib/utils.ts` → `formatUsd` | `lib/utils.ts` → `formatUsd` | пригодится в pricing / token packs |
| `lib/site.ts` | `lib/brand.ts` | переименован по `CLAUDE.md`; поля из `SPEC.md` §1 |
| `components/site/section.tsx` → `Container`, `Section` | `components/site/Section.tsx` → `Container`, `Section` | те же примитивы, размеры взяты из `design-ref` (`max-w-[1200px] px-6`, `py-[88px]`) |
| `components/ui/button.tsx` | `components/ui/Button.tsx` | **без `class-variance-authority`** — у нас всего 2 варианта × 2 размера, обходимся `cn()` и объектом-картой. Стили — из `.btn` в `design-ref`. |
| `app/layout.tsx` | `app/layout.tsx` | тот же паттерн: `next/font/google` в переменную, `metadata` из brand-файла, skip-link, `<main id="main">` |
| `app/globals.css` | `app/globals.css` | тот же подход Tailwind v4: `@import "tailwindcss"` + `@theme` + `@layer base`. Токены — из `:root` в `design-ref/filekit-home.html` |
| `lib/supabase/*`, `middleware.ts`, `lib/env.ts` | — | переносим на Этапе 3 как есть |
| `lib/pricing.ts` | `lib/plans.ts` + `lib/token-packs.ts` | подход «тарифы данными, не в JSX» тот же, данные — из `SPEC.md` §4–5 |

## Соглашения

- Алиас импорта `@/*`, как в peelo.
- Tailwind v4 **CSS-first**: конфига `tailwind.config.ts` нет, тема живёт в `@theme` в `app/globals.css`.
- Порядок импортов как в peelo: внешние → `@/components` → `@/lib` → стили.
- Комментарии в коде — английские (`CLAUDE.md`).
- **Именование файлов:** peelo использует kebab-case (`header.tsx`), но в задании явно заданы
  PascalCase-пути (`components/site/Header.tsx`). Следуем заданию — PascalCase для компонентов,
  kebab-case для `lib/*`.

## Деплой

Паттерн peelo: Vercel, переменные окружения через дашборд, `.env.example` в репозитории,
`.env*` в `.gitignore`. README с инструкцией — на Этапе 7.
