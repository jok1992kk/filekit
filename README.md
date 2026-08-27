# WareSnap

Product photo prep for online sellers — resize, optimize and prepare images for Amazon, Etsy, Shopify and eBay.

See [CLAUDE.md](./CLAUDE.md) for the working rules and [SPEC.md](./SPEC.md) for product data and copy.

## Local development

```bash
npm install
npm run dev
```

Runs on `http://localhost:3300`. Auth and the token ledger run on Supabase (`lib/auth/supabase.ts`) — copy
`.env.example` to `.env.local` and fill in the three `SUPABASE_*` variables from your project's
**Settings → API**, then run `supabase/schema.sql` once in the SQL Editor (see below).

```bash
npm run build      # production build
npm run typecheck   # tsc --noEmit
npm run lint         # eslint
```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → paste `supabase/schema.sql` → Run. Creates `profiles` / `token_ledger`, RLS, the
   signup trigger (25 free tokens) and the `spend_tokens` RPC.
3. **Project Settings → API** → copy the URL and the two keys into `.env.local`.
4. Set up outgoing mail so confirmation and password-reset emails actually deliver — see below.

`lib/auth/local.ts` is the pre-migration, file-backed provider (writes to `.data/waresnap.json`, ephemeral on
Vercel). It's kept only as a reference; `lib/auth/index.ts` wires up `supabaseAuth` and nothing in the app talks
to Supabase directly outside `lib/auth/supabase.ts`.

### Outgoing mail (Resend)

Supabase's built-in mailer is rate-limited to a handful of emails per hour — fine for the SQL Editor test above,
not for real signups. Point it at Resend instead:

1. **Project Settings → Auth → SMTP Settings** → enable Custom SMTP: host `smtp.resend.com`, port `587`, username
   `resend`, password = your Resend API key. Sender: `onboarding@resend.dev` until a domain is verified in Resend
   (Resend only delivers unverified-domain mail to the Resend account's own address — verify a domain to send to
   real users).
2. **Authentication → Email Templates** → point "Confirm signup" and "Reset Password" at this app's own callback
   instead of Supabase's hosted one, so the session lands in the app's cookie the same way sign-in does:
   - Confirm signup → `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=signup`
   - Reset Password → `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery`
3. **Authentication → URL Configuration → Redirect URLs** → add `<site>/auth/callback` for both the local
   (`http://localhost:3300`) and production origin.
4. **Authentication → Providers → Email** → turn "Confirm email" back on (it has to stay off until step 1–3 are
   done, or real signups get a confirmation email that never arrives).

## Deploying to Vercel

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In Vercel: **Add New → Project**, import the repo. Framework preset is detected automatically (Next.js).
3. Add the environment variables below under **Settings → Environment Variables**, then deploy.
4. Once the domain is live, set `NEXT_PUBLIC_SITE_URL` to the production URL and redeploy — it's used for
   canonical links, auth redirects and the OG image.

Or from the CLI, run from the project root:

```bash
npx vercel        # first deploy — links the project and creates a preview
npx vercel --prod # promotes to production
```

### Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Recommended | Absolute origin, no trailing slash (e.g. `https://waresnap.online`). Falls back to `https://waresnap.online` if unset. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | From Project Settings → API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public by design (`NEXT_PUBLIC_*`) — the RLS policies and the `spend_tokens` RPC's revoked execute grant are what keep it safe to ship to the client, not secrecy. |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only — bypasses RLS. Never expose to the client. |
| `RESEND_API_KEY` | Not read by app code | Entered directly into Supabase's SMTP settings (see above), not into this app's env. Kept here only as a record of which key is live. |

See `.env.example` for the full annotated list and `SPEC.md` §11 for the schema this migration implements.

### Notes for the Vercel deploy

- The demo checkout (`/checkout`, "Simulate successful payment") is gated by `NODE_ENV !== "production"` unless
  `NEXT_PUBLIC_DEMO_CHECKOUT=true` is also set — set that variable if you want the demo reachable on a deployed
  preview.
