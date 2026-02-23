-- 01_user_profiles_bootstrap.sql
set check_function_bodies = off;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_profiles_email on public.user_profiles (lower(email));
create index if not exists idx_user_profiles_role  on public.user_profiles (role);

create or replace function public.tg_user_profiles_updated_at()
returns trigger
language plpgsql
as database\hardening_2025_11
begin
  new.updated_at := now();
  return new;
end;
database\hardening_2025_11;

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.tg_user_profiles_updated_at();

create or replace function public.get_auth_email(u_id uuid)
returns text
language sql
stable
security definer
set search_path = public, auth
as database\hardening_2025_11
  select email from auth.users where id = u_id;
database\hardening_2025_11;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as database\hardening_2025_11
begin
  insert into public.user_profiles (user_id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    coalesce(new.raw_user_meta_data->>'role', null)
  )
  on conflict (user_id) do nothing;
  return new;
end;
database\hardening_2025_11;

drop trigger if exists trg_handle_new_auth_user on auth.users;
create trigger trg_handle_new_auth_user
after insert on auth.users
for each row execute function public.handle_new_auth_user();

insert into public.user_profiles (user_id, email, full_name, role)
select u.id,
       u.email,
       u.raw_user_meta_data->>'full_name',
       u.raw_user_meta_data->>'role'
from auth.users u
left join public.user_profiles p on p.user_id = u.id
where p.user_id is null;

update public.user_profiles p
set email = public.get_auth_email(p.user_id)
where p.email is distinct from public.get_auth_email(p.user_id);
