create table if not exists public.weekly_opt_ins (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  actor_type text not null check (actor_type in ('guest', 'user')),
  actor_id uuid not null,
  selected_slots text[] not null default '{}',
  selected_goals text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (week_start, actor_type, actor_id)
);

create index if not exists weekly_opt_ins_week_start_idx
  on public.weekly_opt_ins (week_start desc);

drop trigger if exists weekly_opt_ins_touch_updated_at on public.weekly_opt_ins;
create trigger weekly_opt_ins_touch_updated_at
before update on public.weekly_opt_ins
for each row execute function public.touch_updated_at();

alter table public.weekly_opt_ins enable row level security;

-- API routes use SUPABASE_SERVICE_ROLE_KEY. No direct client policy is needed:
-- clients only receive aggregate heatmap counts for the current week.
