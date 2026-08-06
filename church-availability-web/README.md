# Church Availability — Web

Next.js (App Router) web companion to the Expo mobile app. Same Supabase
backend and schema — coordinators or members who prefer a browser can use
this instead of (or alongside) the mobile app.

## Stack
- Next.js 14, App Router, Server Components
- Tailwind CSS
- Supabase (`@supabase/ssr` for cookie-based session handling)
- Deploy target: Vercel

## Setup

1. **Use the same Supabase project as the mobile app** — this app reads the
   same `members` / `services` / `availability` / `assignments` tables and
   RLS policies from `supabase/schema.sql` in the mobile app repo. No new
   schema needed if that project already exists.

2. **Install dependencies**
   ```
   npm install
   ```

3. **Copy `.env.example` to `.env.local`** and fill in the same Supabase URL
   + anon key used by the mobile app.

4. **Run locally**
   ```
   npm run dev
   ```

5. **Deploy to Vercel**
   ```
   vercel
   ```
   Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as
   environment variables in the Vercel project settings.

6. **Auth redirect**: in Supabase Auth settings, add your deployed URL
   (e.g. `https://your-app.vercel.app/auth/callback`) to the allowed
   redirect URLs, alongside the mobile app's `churchavailability://login`
   scheme.

## Pages
- `/login` — magic-link sign-in
- `/dashboard` — member's own availability, toggled per upcoming service
- `/coordinator` — roster grid: every response per service, one-click assign
  (visible to anyone, but only effective for members flagged
  `is_coordinator = true`, per the shared RLS policies)

## Design notes
Palette is moss green / parchment / gold rather than a generic template
look — feel free to adjust `tailwind.config.ts` to match your church's
actual branding.
