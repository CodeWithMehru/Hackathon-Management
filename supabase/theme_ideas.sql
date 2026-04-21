create extension if not exists "pgcrypto";

create table if not exists public."Theme_Ideas" (
  id uuid primary key default gen_random_uuid(),
  theme_name text not null,
  theme_meaning text not null,
  idea_title text not null,
  description text not null,
  tech_stack text not null,
  is_taken boolean not null default false
);

alter table public."Theme_Ideas" enable row level security;

drop policy if exists "theme_ideas_public_read" on public."Theme_Ideas";
create policy "theme_ideas_public_read"
  on public."Theme_Ideas"
  for select
  to anon, authenticated
  using (true);

drop policy if exists "theme_ideas_authenticated_insert" on public."Theme_Ideas";
create policy "theme_ideas_authenticated_insert"
  on public."Theme_Ideas"
  for insert
  to authenticated
  with check (true);

drop policy if exists "theme_ideas_public_update" on public."Theme_Ideas";
create policy "theme_ideas_public_update"
  on public."Theme_Ideas"
  for update
  to anon, authenticated
  using (true)
  with check (true);

