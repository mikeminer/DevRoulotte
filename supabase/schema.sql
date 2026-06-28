-- DevRoulotte MVP schema
-- Run in Supabase SQL Editor after creating the project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  language text default 'it',
  country text default 'IT',
  age_confirmed_at timestamptz,
  rules_accepted_at timestamptz,
  is_shadow_banned boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null check (actor_type in ('guest', 'user')),
  actor_id uuid not null,
  paypal_subscription_id text unique,
  paypal_plan_id text,
  status text not null default 'none' check (
    status in (
      'none',
      'approval_pending',
      'active',
      'cancelled',
      'expired',
      'suspended'
    )
  ),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  raw_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_actor_idx
  on public.subscriptions (actor_type, actor_id, status);

create table if not exists public.bans (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null check (actor_type in ('guest', 'user')),
  actor_id uuid not null,
  reason text not null,
  shadow boolean not null default false,
  active boolean not null default true,
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bans_actor_idx
  on public.bans (actor_type, actor_id, active, expires_at);

create table if not exists public.match_logs (
  id uuid primary key default gen_random_uuid(),
  channel_name text not null,
  actor_a_type text not null check (actor_a_type in ('guest', 'user')),
  actor_a_id uuid not null,
  actor_b_type text not null check (actor_b_type in ('guest', 'user')),
  actor_b_id uuid not null,
  status text not null default 'active' check (status in ('active', 'ended', 'failed')),
  ended_reason text,
  plan_snapshot text not null default 'free',
  started_at timestamptz not null default now(),
  connected_at timestamptz,
  ended_at timestamptz
);

alter table public.match_logs
  add column if not exists connected_at timestamptz;

create index if not exists match_logs_actor_a_idx
  on public.match_logs (actor_a_type, actor_a_id, started_at desc);

create index if not exists match_logs_actor_b_idx
  on public.match_logs (actor_b_type, actor_b_id, started_at desc);

create index if not exists match_logs_connected_idx
  on public.match_logs (connected_at desc)
  where connected_at is not null;

create table if not exists public.match_queue (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null check (actor_type in ('guest', 'user')),
  actor_id uuid not null,
  display_name text,
  is_premium boolean not null default false,
  language text default 'it',
  country text default 'IT',
  preferred_language text default 'any',
  preferred_country text default 'any',
  status text not null default 'waiting' check (status in ('waiting', 'matched')),
  match_id uuid references public.match_logs(id) on delete set null,
  channel_name text,
  role text check (role in ('caller', 'callee')),
  peer_actor_type text check (peer_actor_type in ('guest', 'user')),
  peer_actor_id uuid,
  queued_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (actor_type, actor_id)
);

create index if not exists match_queue_waiting_idx
  on public.match_queue (status, is_premium desc, queued_at, last_seen_at);

create table if not exists public.webrtc_signals (
  id bigserial primary key,
  match_id uuid not null references public.match_logs(id) on delete cascade,
  sender_actor_type text not null check (sender_actor_type in ('guest', 'user')),
  sender_actor_id uuid not null,
  sender_client_id text not null,
  kind text not null check (kind in ('offer', 'answer', 'candidate', 'control')),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists webrtc_signals_match_idx
  on public.webrtc_signals (match_id, id);

create index if not exists webrtc_signals_created_idx
  on public.webrtc_signals (created_at);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_actor_type text not null check (reporter_actor_type in ('guest', 'user')),
  reporter_actor_id uuid not null,
  reported_actor_type text not null check (reported_actor_type in ('guest', 'user')),
  reported_actor_id uuid not null,
  match_id uuid references public.match_logs(id) on delete set null,
  reason text not null check (reason in ('nudity', 'spam', 'threats', 'minor', 'illegal', 'other')),
  details text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

create index if not exists reports_reported_idx
  on public.reports (reported_actor_type, reported_actor_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create or replace function public.protect_profile_admin_fields()
returns trigger
language plpgsql
as $$
begin
  if new.is_admin is distinct from old.is_admin
    and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'is_admin cannot be changed by client';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_admin_fields on public.profiles;
create trigger profiles_protect_admin_fields
before update on public.profiles
for each row execute function public.protect_profile_admin_fields();

drop trigger if exists subscriptions_touch_updated_at on public.subscriptions;
create trigger subscriptions_touch_updated_at
before update on public.subscriptions
for each row execute function public.touch_updated_at();

drop trigger if exists bans_touch_updated_at on public.bans;
create trigger bans_touch_updated_at
before update on public.bans
for each row execute function public.touch_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace function public.auto_shadowban_after_reports()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  report_count integer;
begin
  select count(*)
    into report_count
  from public.reports
  where reported_actor_type = new.reported_actor_type
    and reported_actor_id = new.reported_actor_id
    and created_at >= now() - interval '24 hours';

  if report_count >= 3 then
    insert into public.bans (
      actor_type,
      actor_id,
      reason,
      shadow,
      active,
      expires_at
    )
    select
      new.reported_actor_type,
      new.reported_actor_id,
      'Auto-shadowban: troppi report nelle ultime 24 ore',
      true,
      true,
      now() + interval '24 hours'
    where not exists (
      select 1
      from public.bans
      where actor_type = new.reported_actor_type
        and actor_id = new.reported_actor_id
        and active = true
        and coalesce(expires_at, now() + interval '1 year') > now()
    );
  end if;

  return new;
end;
$$;

drop trigger if exists reports_auto_shadowban on public.reports;
create trigger reports_auto_shadowban
after insert on public.reports
for each row execute function public.auto_shadowban_after_reports();

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.bans enable row level security;
alter table public.match_logs enable row level security;
alter table public.match_queue enable row level security;
alter table public.webrtc_signals enable row level security;
alter table public.reports enable row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "Profiles are editable by owner" on public.profiles;
create policy "Profiles are editable by owner"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Subscriptions are readable by owner" on public.subscriptions;
create policy "Subscriptions are readable by owner"
on public.subscriptions for select
to authenticated
using (actor_type = 'user' and actor_id = auth.uid());

drop policy if exists "Authenticated users can report" on public.reports;
create policy "Authenticated users can report"
on public.reports for insert
to authenticated
with check (
  reporter_actor_type = 'user'
  and reporter_actor_id = auth.uid()
);

-- API routes use SUPABASE_SERVICE_ROLE_KEY and bypass RLS for guest sessions,
-- matchmaking, admin moderation, and PayPal webhooks.
