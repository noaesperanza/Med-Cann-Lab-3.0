-- 02_helpers_catalogs_and_transactions.sql
set check_function_bodies = off;

create table if not exists public.role_catalog (
  role text primary key
);

insert into public.role_catalog(role) values
  ('admin'),
  ('professional'),
  ('patient'),
  ('student')
on conflict do nothing;

alter table public.user_profiles
  add constraint fk_user_profiles_role_catalog
  foreign key (role) references public.role_catalog(role)
  deferrable initially immediate;

alter table public.user_profiles
  alter column role set default 'patient';

update public.user_profiles
set role = 'patient'
where role is null;

do database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql begin
  if not exists (select 1 from pg_type where typname = 'appointment_status_enum') then
    create type public.appointment_status_enum as enum (
      'scheduled','confirmed','completed','canceled','no_show','rescheduled'
    );
  end if;
end database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql;

do database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql begin
  if not exists (select 1 from pg_type where typname = 'currency_enum') then
    create type public.currency_enum as enum ('BRL','POINTS');
  end if;
end database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql;

do database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql begin
  if not exists (select 1 from pg_type where typname = 'transaction_kind_enum') then
    create type public.transaction_kind_enum as enum ('PAYMENT','REFUND','POINTS_EARN','POINTS_SPEND');
  end if;
end database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql;

alter table public.transactions
  add column if not exists user_id uuid,
  add column if not exists doctor_id uuid,
  add column if not exists currency public.currency_enum,
  add column if not exists amount numeric(12,2),
  add column if not exists points integer,
  add column if not exists kind public.transaction_kind_enum,
  add column if not exists created_at timestamptz not null default now();

do database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql begin
  if not exists (
    select 1 from pg_constraint where conname = 'transactions_currency_coherence_ck'
  ) then
    alter table public.transactions
      add constraint transactions_currency_coherence_ck check (
        (currency = 'BRL'    and coalesce(amount,0) > 0 and coalesce(points,0) = 0)
        or
        (currency = 'POINTS' and coalesce(points,0) > 0 and coalesce(amount,0) = 0)
      );
  end if;
end database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql
  select role from public.user_profiles where user_id = auth.uid();
database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql;

create or replace function public.get_current_user_email()
returns text
language sql
stable
security definer
set search_path = public, auth
as database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql
  select email from public.user_profiles where user_id = auth.uid();
database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql;

create or replace function public.is_authorized_professional()
returns boolean
language sql
stable
security definer
set search_path = public
as database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql
  select exists (
    select 1 from public.user_profiles
    where user_id = auth.uid()
      and role in ('professional','admin')
  );
database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql;

create or replace function public.is_current_user_patient()
returns boolean
language sql
stable
security definer
set search_path = public
as database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql
  select exists (
    select 1 from public.user_profiles
    where user_id = auth.uid()
      and role = 'patient'
  );
database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql;
