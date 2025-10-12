# Next.js + Neon + Drizzle + Clerk + OpenRouter

A Next.js app using **Neon** (Postgres), **Drizzle ORM**, **Clerk** for auth, and **OpenRouter** for AI.

---

## 🚀 Setup

### 1. Clone & Install
```bash
git clone https://github.com/victorbratov/launchpad.git
cd launchpad
npm install
```

2. Create .env.local
```bash
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_BUCKET_URL=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
CRON_SECRET=
```
3. Get Your Keys
Neon: neon.tech → create Postgres → copy connection string → DATABASE_URL
Drizzle: run migrations
```bash
npx drizzle-kit generate && npx drizzle-kit push
```
Clerk: clerk.com → new app → copy publishable key → NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
OpenRouter: openrouter.ai → get API key → set OPENROUTER_API_KEY & OPENROUTER_MODEL
Bucket URL: link to your S3 storage bucket → NEXT_PUBLIC_BUCKET_URL
CRON_SECRET: random secure string for scheduled routes
4. Run Locally
```bash
npm run dev
```
Visit http://localhost:3000
