-- Backfill profiles for Auth users created before the signup trigger existed.
-- Users without an explicit role remain customers by default.
insert into public.profiles (id, full_name, phone, avatar_url, role, status, created_at)
select
  u.id,
  u.raw_user_meta_data->>'full_name',
  u.raw_user_meta_data->>'phone',
  u.raw_user_meta_data->>'avatar_url',
  case
    when u.raw_user_meta_data->>'role' in ('super_admin', 'admin', 'staff', 'customer')
      then u.raw_user_meta_data->>'role'
    else 'customer'
  end,
  'active',
  coalesce(u.created_at, now())
from auth.users u
where not exists (
  select 1
  from public.profiles p
  where p.id = u.id
);
