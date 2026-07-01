-- Security hardening from KOS-2026-0630-001.
-- Apply in Supabase SQL Editor or with `supabase db push`.

create or replace function public.protect_profile_admin_fields()
returns trigger
language plpgsql
as $$
begin
  if new.is_admin is distinct from old.is_admin
    and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'is_admin cannot be changed by client';
  end if;

  if new.is_shadow_banned is distinct from old.is_shadow_banned
    and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'is_shadow_banned cannot be changed by client';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_admin_fields on public.profiles;
create trigger profiles_protect_admin_fields
before update on public.profiles
for each row execute function public.protect_profile_admin_fields();

create or replace function public.sanitize_auth_user_metadata()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.raw_user_meta_data = coalesce(new.raw_user_meta_data, '{}'::jsonb)
    - 'is_admin'
    - 'is_shadow_banned'
    - 'role'
    - 'roles'
    - 'permissions'
    - 'app_metadata';

  return new;
end;
$$;

drop trigger if exists auth_users_sanitize_user_metadata on auth.users;
create trigger auth_users_sanitize_user_metadata
before insert or update of raw_user_meta_data on auth.users
for each row execute function public.sanitize_auth_user_metadata();

update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
  - 'is_admin'
  - 'is_shadow_banned'
  - 'role'
  - 'roles'
  - 'permissions'
  - 'app_metadata'
where coalesce(raw_user_meta_data, '{}'::jsonb) ?| array[
  'is_admin',
  'is_shadow_banned',
  'role',
  'roles',
  'permissions',
  'app_metadata'
];
