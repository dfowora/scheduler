# Church Availability — Web (multi-tenant)

Supports many teams from one deployment. Each team gets its own URL under
`/t/<team-slug>/...` — no code changes needed to add a new team, and no
manual Supabase edits either, apart from the very first coordinator
bootstrap logic below.

## What changed from the single-team version
- New `teams` table (`id`, `name`, `slug`)
- `members` and `services` now carry a `team_id` — a person can belong to
  multiple teams (one `members` row per team), each with their own
  `is_coordinator` flag
- `/new-team` — open, no login required — creates a team and sends you to
  its login page
- **Whoever signs in first on a brand-new team automatically becomes its
  coordinator.** No manual `is_coordinator` flip needed for new teams.
- Every route is now under `/t/[teamSlug]/...`:
  - `/t/<slug>/login`
  - `/t/<slug>/auth/callback`
  - `/t/<slug>/dashboard`
  - `/t/<slug>/coordinator`
- RLS policies now check team membership on every table, so one team can
  never see another team's names, services, or assignments

## Setup — upgrading your existing project

1. Run `supabase/migration-multitenant.sql` in Supabase → SQL Editor. It:
   - Creates the `teams` table
   - Wraps your existing data into a team named "My Church Team"
     (slug: `main`) — rename it with:
     ```sql
     update teams set name = 'Your Real Name' where slug = 'main';
     ```
   - Adds `team_id` to `members`/`services` and backfills it
   - Drops the old single-tenant trigger and RLS policies, replaces them
     with team-scoped ones

2. Your existing team's link becomes:
   ```
   https://your-app.vercel.app/t/main/login
   ```
   (or whatever slug you renamed it to)

3. `npm install` — picks up `jspdf`/`jspdf-autotable` if you didn't
   already have them.

4. Push to your repo, let Vercel redeploy.

## Setup — brand new project (no existing data)

Run `supabase/schema.sql` (original tables) followed by
`supabase/migration-multitenant.sql` — the migration script works fine
against a fresh schema too, it just backfills nothing since there's
nothing to backfill.

## Adding a new team going forward
Anyone visits `/new-team`, names it, and is sent to
`/t/<generated-slug>/login`. Whoever signs in there first becomes that
team's coordinator automatically. Share that team's `/t/<slug>/login` link
with the rest of that team.

## Note on `/new-team` being open
Creating a team requires no login by design, so anyone with your deployed
URL can spin one up. That's intentional for easy onboarding of new teams,
but means the number of teams isn't gated. If that becomes unwanted, the
fix is adding a shared invite code check before allowing team creation.
