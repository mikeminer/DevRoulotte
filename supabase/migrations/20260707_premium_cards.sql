create table if not exists public.premium_cards (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  headline text not null default '',
  bio text not null default '',
  website_url text not null default '',
  github_url text not null default '',
  linkedin_url text not null default '',
  x_url text not null default '',
  product_url text not null default '',
  contact_email text not null default '',
  preferred_contact text not null default '',
  stack text not null default '',
  looking_for text not null default '',
  building text not null default '',
  cta_label text not null default '',
  cta_url text not null default '',
  share_in_calls boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists premium_cards_visible_idx
  on public.premium_cards (share_in_calls, updated_at desc)
  where share_in_calls = true;

drop trigger if exists premium_cards_touch_updated_at on public.premium_cards;
create trigger premium_cards_touch_updated_at
before update on public.premium_cards
for each row execute function public.touch_updated_at();

alter table public.premium_cards enable row level security;

drop policy if exists "Premium cards are readable by owner" on public.premium_cards;
create policy "Premium cards are readable by owner"
on public.premium_cards for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Premium cards are insertable by owner" on public.premium_cards;
create policy "Premium cards are insertable by owner"
on public.premium_cards for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Premium cards are editable by owner" on public.premium_cards;
create policy "Premium cards are editable by owner"
on public.premium_cards for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
