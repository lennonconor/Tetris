-- Global leaderboard schema for Supabase

create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 20),
  score integer not null check (score >= 0 and score <= 10000000),
  created_at timestamptz not null default now()
);

create index if not exists leaderboard_entries_score_created_idx
  on public.leaderboard_entries (score desc, created_at asc);

-- Tracks submissions for simple IP-based rate limiting in the edge function.
create table if not exists public.leaderboard_rate_limits (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists leaderboard_rate_limits_ip_created_idx
  on public.leaderboard_rate_limits (ip_hash, created_at desc);

alter table public.leaderboard_entries enable row level security;
alter table public.leaderboard_rate_limits enable row level security;

-- Public reads are allowed.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'leaderboard_entries'
      and policyname = 'leaderboard_entries_select_public'
  ) then
    create policy leaderboard_entries_select_public
      on public.leaderboard_entries
      for select
      to anon, authenticated
      using (true);
  end if;
end
$$;

-- No anon insert/update/delete policies are created intentionally.
-- Writes should go through the edge function using service-role credentials.
