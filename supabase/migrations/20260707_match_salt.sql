alter table public.match_queue
  add column if not exists match_salt text;

create index if not exists match_queue_waiting_salt_idx
  on public.match_queue (status, match_salt, is_premium desc, queued_at, last_seen_at)
  where status = 'waiting';
