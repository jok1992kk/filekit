# WareSnap

Product photo prep for online sellers — resize, optimize and prepare images for Amazon, Etsy, Shopify and eBay.

See [CLAUDE.md](./CLAUDE.md) for the working rules and [SPEC.md](./SPEC.md) for product data and copy.

## Local development

```bash
npm install
npm run dev
```

Runs on `http://localhost:3300`. No environment variables are required — auth and the token ledger run on the
local, file-backed provider (`lib/auth/local.ts`), which stores everything in `.data/waresnap.json` (gitignored).

```bash
npm run build      # production build
npm run typecheck   # tsc --noEmit
npm run lint         # eslint
```

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
| `NEXT_PUBLIC_SITE_URL` | Recommended | Absolute origin, no trailing slash (e.g. `https://waresnap.app`). Falls back to `https://waresnap.app` if unset. |
| `NEXT_PUBLIC_SUPABASE_URL` | Only if swapping to Supabase auth | Not used by the current local auth provider. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Only if swapping to Supabase auth | Same as above. |
| `SUPABASE_SERVICE_ROLE_KEY` | Only if swapping to Supabase auth | Server-only — never expose to the client. |
| `RESEND_API_KEY` | Only if swapping to Supabase auth | Confirmation/reset email relays through Supabase Auth's SMTP settings, not this key directly. |

The local auth provider (current default) needs none of the Supabase/Resend variables — sign-up, sign-in and the
token ledger all work out of the box. See `.env.example` for the full annotated list and `SPEC.md` §11 for the
migration path to Supabase.

### Notes for the Vercel deploy

- The local auth store writes to `/tmp` on Vercel (its filesystem is read-only outside of `/tmp` — see
  `lib/auth/store.ts`), which is writable but ephemeral: an account created on one serverless instance resets on
  the next cold start. Sign-up and sign-in work for demoing the UI; they are not a substitute for a real database
  in production. Wiring up Supabase (SPEC.md §11) removes this limitation.
- The demo checkout (`/checkout`, "Simulate successful payment") is gated by `NODE_ENV !== "production"` unless
  `NEXT_PUBLIC_DEMO_CHECKOUT=true` is also set — set that variable if you want the demo reachable on a deployed
  preview.
