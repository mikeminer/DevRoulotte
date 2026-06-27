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

alter table public.webrtc_signals enable row level security;
