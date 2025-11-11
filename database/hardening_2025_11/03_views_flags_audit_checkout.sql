-- 03_views_flags_audit_checkout.sql
set check_function_bodies = off;

create table if not exists public.platform_params (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.platform_params(key, value) values
  ('platform_fee_pct', '{"value":0.10}')
on conflict (key) do nothing;

create or replace function public.set_platform_param(k text, v jsonb)
returns void
language sql
security definer
set search_path = public
as database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql
  insert into public.platform_params(key, value)
  values (k, v)
  on conflict (key) do update
    set value = excluded.value,
        updated_at = now();
database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql;

create table if not exists public.feature_flags (
  flag text primary key,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.feature_flags(flag, enabled) values
  ('points_enabled', false)
on conflict (flag) do nothing;

create table if not exists public.medcannlab_audit_logs (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  user_id uuid,
  action text not null,
  endpoint text,
  payload jsonb,
  ip inet
);

create index if not exists idx_mcl_audit_created on public.medcannlab_audit_logs (created_at desc);
create index if not exists idx_mcl_audit_user    on public.medcannlab_audit_logs (user_id);

do database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql begin
  execute $
    create or replace function public.issue_medcannlab_api_key()
    returns text
    language sql
    security definer
    set search_path = public, vault, auth
    as database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql
      select (select decrypted_secret from vault.decrypted_secrets where name = 'MEDCANNLAB_API_KEY');
    database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql;
  $;
exception when others then
  raise notice 'Vault not available. Skipping issue_medcannlab_api_key().';
end database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql;

create or replace view public.v_user_points_balance as
select
  u.id as user_id,
  coalesce(sum(
    case
      when t.currency = 'POINTS' and t.kind = 'POINTS_EARN'  then t.points
      when t.currency = 'POINTS' and t.kind = 'POINTS_SPEND' then -t.points
      else 0
    end
  ),0) as points_balance
from auth.users u
left join public.transactions t on t.user_id = u.id
group by u.id;

create or replace view public.v_clinical_reports as
select cr.*
from public.clinical_reports cr
where
  cr.patient_id = auth.uid()
  or exists (
    select 1 from public.clinical_assessments ca
    where ca.patient_id = cr.patient_id
      and ca.doctor_id  = auth.uid()
  )
  or exists (
    select 1 from public.private_chats pc
    where pc.patient_id = cr.patient_id
      and pc.doctor_id  = auth.uid()
  )
  or exists (
    select 1 from public.user_profiles up
    where up.user_id = auth.uid()
      and up.role = 'admin'
  );

create or replace view public.v_kpi_basic as
with rpt as (
  select date_trunc('week', created_at) as wk, count(*) as reports
  from public.clinical_reports
  group by 1
),
appt as (
  select date_trunc('week', appointment_date) as wk, count(*) as appts
  from public.appointments
  group by 1
)
select
  coalesce(rpt.wk, appt.wk) as week,
  coalesce(rpt.reports, 0)  as reports_count,
  coalesce(appt.appts, 0)   as appointments_count
from rpt
full join appt on appt.wk = rpt.wk
order by week desc;

create or replace function public.checkout_with_points(
  p_user_id uuid,
  p_doctor_id uuid,
  p_base_price numeric
) returns table (
  base_price numeric,
  points_balance integer,
  max_discount_points integer,
  discount_brl numeric,
  final_price numeric,
  platform_fee numeric
)
language plpgsql
stable
security definer
set search_path = public
as database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql
declare
  points_on boolean;
  fee_pct numeric;
  balance int;
  cap_pct numeric := 0.75;
begin
  select enabled into points_on
  from public.feature_flags
  where flag = 'points_enabled';

  select (value->>'value')::numeric into fee_pct
  from public.platform_params
  where key = 'platform_fee_pct';

  if points_on is distinct from true then
    return query
      select
        p_base_price,
        0,
        0,
        0::numeric,
        p_base_price,
        round(coalesce(fee_pct, 0) * p_base_price, 2);
    return;
  end if;

  select coalesce(points_balance, 0) into balance
  from public.v_user_points_balance
  where user_id = p_user_id;

  return query
  with allowed as (
    select least(balance, floor(p_base_price * cap_pct)::int) as max_pts
  ), calc as (
    select
      p_base_price as base_price,
      balance as points_balance,
      max_pts as max_discount_points,
      max_pts::numeric as discount_brl,
      round(p_base_price - max_pts::numeric, 2) as final_price
    from allowed
  )
  select
    base_price,
    points_balance,
    max_discount_points,
    discount_brl,
    final_price,
    round(coalesce(fee_pct, 0) * final_price, 2) as platform_fee
  from calc;
end;
database\hardening_2025_11\02_helpers_catalogs_and_transactions.sql;

create or replace view public.v_checkout_with_points as
select
  u.user_id,
  u.doctor_id,
  c.base_price,
  c.points_balance,
  c.max_discount_points,
  c.discount_brl,
  c.final_price,
  c.platform_fee
from (
  select distinct on (pc.patient_id)
         pc.patient_id as user_id,
         pc.doctor_id,
         pc.created_at
  from public.private_chats pc
  order by pc.patient_id, pc.created_at desc nulls last
) u
join lateral (
  select * from public.checkout_with_points(u.user_id, u.doctor_id, 300.00)
) c on true;
