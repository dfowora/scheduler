-- Multi-tenant migration for church-availability-web (v1).
-- Safe to run once in Supabase → SQL Editor against your existing project.
-- Your current data becomes a team named "My Church Team" (slug: main) —
-- rename it afterward with: update teams set name = '...' where slug = 'main';

-- 1. Teams table
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

alter table teams enable row level security;

-- Team creation is open (no login required) so anyone with the app link
-- can start a new team. Reads limited to authenticated users so team
-- names aren't publicly browsable.
drop policy if exists "anyone can create a team" on teams;
create policy "anyone can create a team" on teams
  for insert with check (true);

drop policy if exists "authenticated can read teams" on teams;
create policy "authenticated can read teams" on teams
  for select using (auth.role() = 'authenticated');

-- 2. Backfill: create a default team for your existing data
insert into teams (name, slug)
values ('My Church Team', 'main')
on conflict (slug) do nothing;

-- 3. Add team_id to members and services (nullable first, to backfill)
alter table members add column if not exists team_id uuid references teams(id);
alter table services add column if not exists team_id uuid references teams(id);

update members set team_id = (select id from teams where slug = 'main') where team_id is null;
update services set team_id = (select id from teams where slug = 'main') where team_id is null;

alter table members alter column team_id set not null;
alter table services alter column team_id set not null;

-- 4. Members: now one row per (person, team), not one row per person —
--    someone can belong to multiple teams.
alter table members drop constraint if exists members_auth_user_id_key;
alter table members add constraint members_auth_user_id_team_id_key unique (auth_user_id, team_id);

-- 5. Drop the old single-tenant signup trigger. Member creation now
--    happens in /t/[teamSlug]/auth/callback, since only that route knows
--    which team someone is signing into.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 6. Replace all RLS policies with team-scoped versions
drop policy if exists "members readable by all authenticated" on members;
drop policy if exists "members update own row" on members;
drop policy if exists "member creates own row" on members;

create policy "members read within own team" on members
  for select using (
    exists (
      select 1 from members m2
      where m2.auth_user_id = auth.uid() and m2.team_id = members.team_id
    )
  );
create policy "members insert own row" on members
  for insert with check (auth_user_id = auth.uid());
create policy "members update own row" on members
  for update using (auth_user_id = auth.uid());

drop policy if exists "services readable by all authenticated" on services;
drop policy if exists "coordinators manage services" on services;

create policy "services read within own team" on services
  for select using (
    exists (
      select 1 from members m
      where m.auth_user_id = auth.uid() and m.team_id = services.team_id
    )
  );
create policy "coordinators manage services" on services
  for all using (
    exists (
      select 1 from members m
      where m.auth_user_id = auth.uid() and m.team_id = services.team_id and m.is_coordinator
    )
  );

drop policy if exists "availability readable by all authenticated" on availability;
drop policy if exists "members write own availability" on availability;
drop policy if exists "members update own availability" on availability;

create policy "availability read within own team" on availability
  for select using (
    exists (
      select 1 from services s
      join members m on m.team_id = s.team_id
      where s.id = availability.service_id and m.auth_user_id = auth.uid()
    )
  );
create policy "members write own availability" on availability
  for insert with check (
    member_id in (select id from members where auth_user_id = auth.uid())
  );
create policy "members update own availability" on availability
  for update using (
    member_id in (select id from members where auth_user_id = auth.uid())
  );

drop policy if exists "assignments readable by all authenticated" on assignments;
drop policy if exists "coordinators manage assignments" on assignments;

create policy "assignments read within own team" on assignments
  for select using (
    exists (
      select 1 from services s
      join members m on m.team_id = s.team_id
      where s.id = assignments.service_id and m.auth_user_id = auth.uid()
    )
  );
create policy "coordinators manage assignments" on assignments
  for all using (
    exists (
      select 1 from services s
      join members m on m.team_id = s.team_id
      where s.id = assignments.service_id and m.auth_user_id = auth.uid() and m.is_coordinator
    )
  );
