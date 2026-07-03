create table if not exists public.chat_presence (
  actor_type text not null check (actor_type in ('guest', 'user')),
  actor_id uuid not null,
  client_id uuid not null,
  user_agent_hash text,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (actor_type, actor_id, client_id)
);

create index if not exists chat_presence_last_seen_idx
  on public.chat_presence (last_seen_at desc);

alter table public.chat_presence enable row level security;
