# The Toxic Tower — Deployment Guide

## Prerequisites
- Node.js 20+
- Supabase account (free tier works)
- Vercel account (free tier works)
- GitHub account (to connect Vercel)

---

## Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name it `toxic-tower`, choose a region close to your users, set a strong DB password
3. Once created, go to **SQL Editor** and run the entire contents of:
   `supabase/migrations/001_initial_schema.sql`
4. Then run the Storage bucket SQL (at the bottom of that file, in the comments):
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('media', 'media', TRUE);

   CREATE POLICY "Public read media"
     ON storage.objects FOR SELECT USING (bucket_id = 'media');

   CREATE POLICY "Service role can manage media"
     ON storage.objects FOR ALL USING (auth.role() = 'service_role');
   ```
5. Go to **Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep this secret!

---

## Step 2: Local Development

```bash
# In the website folder:
cp .env.local.example .env.local
# Fill in your Supabase credentials and set:
#   ADMIN_PASSWORD=something-strong
#   ADMIN_JWT_SECRET=at-least-32-random-chars

npm run dev
# Open http://localhost:3000
# Admin panel: http://localhost:3000/admin
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 3: Deploy to Vercel

### Option A: GitHub (recommended)

1. Push this `website/` folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import that repo
3. Set **Root Directory** to `.` (the website folder root)
4. Add all environment variables from `.env.local.example` in the Vercel dashboard
5. Deploy — Vercel auto-detects Next.js

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel
# Follow prompts, then set env vars:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ADMIN_PASSWORD
vercel env add ADMIN_JWT_SECRET
vercel env add NEXT_PUBLIC_SITE_URL
vercel --prod
```

---

## Step 4: Post-Deploy

1. Visit your Vercel URL (e.g. `https://toxic-tower.vercel.app`)
2. Navigate to `/admin/login` and log in with your `ADMIN_PASSWORD`
3. Update `NEXT_PUBLIC_SITE_URL` in Vercel env vars to your actual URL
4. Redeploy once after setting the site URL for correct SEO metadata

---

## Step 5: Add a Custom Domain (optional)

1. In Vercel → Settings → Domains → Add your domain
2. Update your DNS records as instructed
3. Update `NEXT_PUBLIC_SITE_URL` to the custom domain

---

## Admin Workflow

| Task | URL |
|------|-----|
| Dashboard | `/admin` |
| Write article | `/admin/articles/new` |
| Edit rankings | `/admin/rankings?pos=OVERALL` |
| Upload images | `/admin/media` |
| View changelog | `/admin/updates` |

### Ranking workflow
1. Go to `/admin/rankings`
2. Pick a position tab
3. Drag players to reorder, adjust tiers with ↑/↓
4. Add players from the pool or create new ones
5. Enter an optional change summary
6. Click **Save Rankings** — this creates a version snapshot and publishes live

### Export rankings
- CSV: `/api/export?format=csv&pos=OVERALL`
- JSON: `/api/export?format=json&pos=QB`
- Underdog: `/api/export?format=underdog&pos=RB`

---

## Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-only) |
| `ADMIN_PASSWORD` | ✅ | Password to log into /admin |
| `ADMIN_JWT_SECRET` | ✅ | Secret for signing admin session JWTs (32+ chars) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Full URL of your site (for SEO/OG/sitemap) |
