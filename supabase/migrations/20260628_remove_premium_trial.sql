-- Remove the legacy Premium trial state from DevRoulotte subscriptions.
-- PayPal plans created after this migration must not include a TRIAL billing cycle.

update public.subscriptions
set
  status = 'approval_pending',
  updated_at = now()
where status = 'trialing';

alter table public.subscriptions
  drop column if exists trial_ends_at;

alter table public.subscriptions
  drop constraint if exists subscriptions_status_check;

alter table public.subscriptions
  add constraint subscriptions_status_check
  check (
    status in (
      'none',
      'approval_pending',
      'active',
      'cancelled',
      'expired',
      'suspended'
    )
  );
