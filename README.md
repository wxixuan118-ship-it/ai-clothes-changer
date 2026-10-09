# StyleMirror AI

[stylemirrorai.com](https://stylemirrorai.com) — try new hairstyles and outfits on your own photo with AI.

- **AI Hairstyle Changer** (home page, `/`) — upload a selfie, then pick a
  hairstyle photo, describe the cut and color, or choose one of 50 curated
  hairstyles (10 styles × 5). Only the hair changes; face, features, and background stay.
- **AI Clothes Changer** (`/ai-clothes-changer`) — upload a photo, then pick a
  garment photo (top / bottom / dress / full outfit), describe the outfit, or
  choose a curated style.

The tool sits in the hero of each landing page and works before sign-up:
pressing the action button opens an in-page sign-up dialog, and the run
continues with the visitor's photo still selected.

## Features

- Real image editing with Alibaba Cloud Model Studio (Qwen image edit),
  content moderation before any credit is spent (plus the provider's own
  checks), and a watermark on free-plan results.
- Email + password and Google / Facebook sign-in (Better Auth), 10 free credits
  on sign-up.
- Credits: 1 credit per image, failed runs refunded automatically. An
  append-only ledger with idempotency keys keeps balances correct under
  retries and races.
- Stripe subscriptions (Pro / Ultra, monthly credits) and one-time credit
  packs.
- Studio (`/generate`) with both tools, result history, download, and delete.
- Private image storage: S3-compatible object storage (DigitalOcean Spaces,
  AWS S3, …). Objects have no public ACL; `/api/images/*` serves each result
  to its owner only.
- SEO: one landing page per keyword, canonical URLs, FAQ + app JSON-LD,
  sitemap, generated Open Graph image.
- Dark "Atelier" design with a lime accent (see the note at the top of
  [DESIGN.md](DESIGN.md)).

## Stack

Next.js 16 (App Router, Server Actions) · React 19 · TypeScript · Better Auth
· Drizzle ORM + PostgreSQL · Stripe · Tailwind CSS v4 · Resend · Vitest +
Playwright · pnpm.

## Local development

```bash
pnpm install
cp .env.example .env          # set BETTER_AUTH_SECRET; AI_MOCK=true for free local runs
docker compose up -d          # Postgres 17
pnpm db:migrate
pnpm dev
```

With `AI_MOCK=true` the provider echoes the uploaded photo back as the
result (free, no API key). A prompt containing `FAIL` simulates a provider
error so the refund path can be tried in the browser. Production refuses
`AI_MOCK=true`.

Every environment variable is documented in [.env.example](.env.example)
and validated in [src/lib/env.ts](src/lib/env.ts).

## Testing

```bash
pnpm typecheck && pnpm lint
pnpm test        # Vitest — needs Postgres (docker compose up -d)
pnpm test:e2e    # Playwright — boots its own dev server on :3100
```

`pnpm test:e2e` can't run while another `next dev` is running in this
folder (Next.js allows one per project).

## Deployment

The repo ships a [Dockerfile](Dockerfile) (pnpm with the frozen lockfile,
Next.js standalone output, non-root runtime on port 3000). It is used on
[AnySites](https://anysites.app) and works on any Docker host.

- **Build** needs no secrets: during `next build` the env module falls back
  to placeholders.
- **Start** validates the real environment and stops with a named error if a
  variable is missing, then applies pending database migrations
  ([src/instrumentation.ts](src/instrumentation.ts)) before serving traffic.
- **Required in production:** `DATABASE_URL`, `BETTER_AUTH_SECRET`,
  `BETTER_AUTH_URL` (the public origin), and the five Stripe variables.
- **AI model:** `DASHSCOPE_API_KEY` (Alibaba Cloud Model Studio,
  `qwen-image-edit-plus`). Without it the site runs, but both tools answer
  "not switched on yet" and spend nothing. `DASHSCOPE_BASE_URL` must match
  the key's region (default: Singapore/international); `AI_EDIT_MODEL` picks
  the model.
- **Optional:** `S3_*` (private image storage), `RESEND_API_KEY`, Google / Facebook / GitHub OAuth
  keys, `SITE_URL`.
- **Stripe webhook:** `https://<your-domain>/api/stripe/webhook` with the
  events `checkout.session.completed`, `invoice.paid`,
  `customer.subscription.updated`, and `customer.subscription.deleted`.

- **Domain:** the canonical origin is `https://stylemirrorai.com`
  (`siteConfig.url`; override with `SITE_URL`). Canonical tags and the
  sitemap always use it in production. `www` redirects to the apex; the
  platform subdomain redirects too once `SITE_URL` is set (set it, and
  `BETTER_AUTH_URL`, after the domain serves the app). `/api` is never
  redirected.

Environment changes only apply after a redeploy.

## Credits

Built on [ai-saas-starter](https://github.com/nikandr-surkov/ai-saas-starter)
by Nikandr Surkov (MIT). See [LICENSE](LICENSE).
