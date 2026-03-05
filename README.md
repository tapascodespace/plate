# Plate

Hyper-local home-cook marketplace built with Next.js App Router, TypeScript, Prisma, and Tailwind CSS.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

3. Start dev server:

```bash
npm run dev
```

## Environment

Create `.env` with:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="replace-me"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Current architecture

- Frontend: Next.js 16 App Router + Tailwind 4
- Data: Prisma + SQLite (local development)
- Auth: JWT cookie auth via API routes
- State: Zustand cart store
- Payments: Stripe Checkout + Stripe Webhook
- Supabase migration scaffold: `src/lib/supabase/*` + `supabase/schema.sql`
- Hybrid data adapter for onboarding/buildings: `src/lib/data/onboarding.ts`

## Supabase migration mode

- Current auth remains app-managed JWT cookies.
- Onboarding/building APIs now use a Supabase-first adapter with Prisma fallback.
- When `SUPABASE_SERVICE_ROLE_KEY` is present, onboarding/building data is mirrored into Supabase tables (`app_profiles`, `app_buildings`).

## Implemented core routes

- Auth: `/login`, `/register`
- Browse: `/explore`, `/cook/[id]`
- Orders: `/cart`, `/orders`, `/cook/orders`
- Cook tools: `/cook/dashboard`, `/cook/menu`, `/cook/profile`
- APIs: `/api/auth/*`, `/api/dishes*`, `/api/cooks*`, `/api/orders*`, `/api/reviews`, `/api/cook/*`
- Payments APIs: `/api/payments/checkout`, `/api/payments/webhook`

## Stripe local webhook

```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

## Build check

```bash
npm run build
```

Project currently compiles successfully with production build.
