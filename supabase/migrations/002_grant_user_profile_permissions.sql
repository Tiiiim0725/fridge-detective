-- supabase/migrations/002_grant_user_profile_permissions.sql
-- User Profile Module v0.1 - Grant table-level permissions to authenticated role
-- 解决：permission denied for table profiles [code: 42501]

-- Grant schema usage
grant usage on schema public to authenticated;

-- Grant profiles table permissions
grant select, insert, update, delete
on table public.profiles
to authenticated;

-- Grant user_preferences table permissions
grant select, insert, update, delete
on table public.user_preferences
to authenticated;

-- Grant kitchen_equipment table permissions
grant select, insert, update, delete
on table public.kitchen_equipment
to authenticated;

-- Grant pantry_items table permissions
grant select, insert, update, delete
on table public.pantry_items
to authenticated;
