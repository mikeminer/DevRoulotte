alter table public.match_logs
  add column if not exists connected_at timestamptz;

create index if not exists match_logs_connected_idx
  on public.match_logs (connected_at desc)
  where connected_at is not null;
