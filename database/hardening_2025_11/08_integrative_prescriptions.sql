set check_function_bodies = off;
set search_path = public;

-- region: helper types -------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_type where typname = 'prescription_rationality') then
    create type public.prescription_rationality as enum (
      'biomedical',
      'traditional_chinese',
      'ayurvedic',
      'homeopathic',
      'integrative'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'patient_prescription_status') then
    create type public.patient_prescription_status as enum (
      'draft',
      'active',
      'completed',
      'suspended',
      'cancelled'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'patient_plan_status') then
    create type public.patient_plan_status as enum (
      'draft',
      'active',
      'completed',
      'archived'
    );
  end if;
end;
$$;

-- endregion ------------------------------------------------------------------------------------

-- region: generic trigger ----------------------------------------------------------------------

create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- endregion ------------------------------------------------------------------------------------

-- region: integrative prescription templates ---------------------------------------------------

create table if not exists public.integrative_prescription_templates (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  summary text,
  description text,
  rationality public.prescription_rationality not null,
  category text,
  default_dosage text,
  default_frequency text,
  default_duration text,
  default_instructions text,
  indications text[] default '{}',
  contraindications text[] default '{}',
  monitoring text[] default '{}',
  tags text[] default '{}',
  metadata jsonb default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_integrative_prescription_templates_slug
  on public.integrative_prescription_templates (slug);

create index if not exists idx_integrative_prescription_templates_rationality
  on public.integrative_prescription_templates (rationality);

create index if not exists idx_integrative_prescription_templates_is_active
  on public.integrative_prescription_templates (is_active);

drop trigger if exists trg_integrative_prescription_templates_updated_at
  on public.integrative_prescription_templates;

create trigger trg_integrative_prescription_templates_updated_at
before update on public.integrative_prescription_templates
for each row execute function public.tg_set_updated_at();

alter table public.integrative_prescription_templates enable row level security;

drop policy if exists integrative_prescription_templates_select
  on public.integrative_prescription_templates;

create policy integrative_prescription_templates_select
  on public.integrative_prescription_templates
  for select
  to authenticated
  using (is_active = true or coalesce(public.current_user_role(), 'patient') = 'admin');

drop policy if exists integrative_prescription_templates_manage
  on public.integrative_prescription_templates;

create policy integrative_prescription_templates_manage
  on public.integrative_prescription_templates
  for all
  to authenticated
  using (
    coalesce(public.current_user_role(), 'patient') in ('professional','admin')
    or created_by = auth.uid()
  )
  with check (
    coalesce(public.current_user_role(), 'patient') in ('professional','admin')
    or created_by = auth.uid()
  );

grant select on public.integrative_prescription_templates to authenticated;
grant insert, update on public.integrative_prescription_templates to authenticated;

-- endregion ------------------------------------------------------------------------------------

-- region: patient therapeutic plans ------------------------------------------------------------

create table if not exists public.patient_therapeutic_plans (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  professional_id uuid references auth.users(id) on delete set null,
  title text not null,
  summary text,
  status public.patient_plan_status not null default 'active',
  goals jsonb default '[]'::jsonb,
  notes text,
  metadata jsonb default '{}'::jsonb,
  started_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_therapeutic_plans_patient
  on public.patient_therapeutic_plans (patient_id);

create index if not exists idx_patient_therapeutic_plans_status
  on public.patient_therapeutic_plans (status);

drop trigger if exists trg_patient_therapeutic_plans_updated_at
  on public.patient_therapeutic_plans;

create trigger trg_patient_therapeutic_plans_updated_at
before update on public.patient_therapeutic_plans
for each row execute function public.tg_set_updated_at();

alter table public.patient_therapeutic_plans enable row level security;

drop policy if exists patient_therapeutic_plans_select
  on public.patient_therapeutic_plans;

create policy patient_therapeutic_plans_select
  on public.patient_therapeutic_plans
  for select
  to authenticated
  using (
    patient_id = auth.uid()
    or professional_id = auth.uid()
    or coalesce(public.current_user_role(), 'patient') = 'admin'
  );

drop policy if exists patient_therapeutic_plans_insert
  on public.patient_therapeutic_plans;

create policy patient_therapeutic_plans_insert
  on public.patient_therapeutic_plans
  for insert
  to authenticated
  with check (
    coalesce(public.current_user_role(), 'patient') in ('professional','admin')
  );

drop policy if exists patient_therapeutic_plans_update
  on public.patient_therapeutic_plans;

create policy patient_therapeutic_plans_update
  on public.patient_therapeutic_plans
  for update
  to authenticated
  using (
    professional_id = auth.uid()
    or coalesce(public.current_user_role(), 'patient') = 'admin'
  )
  with check (
    professional_id = auth.uid()
    or coalesce(public.current_user_role(), 'patient') = 'admin'
  );

grant select, insert, update on public.patient_therapeutic_plans to authenticated;

-- endregion ------------------------------------------------------------------------------------

-- region: patient prescriptions ----------------------------------------------------------------

create table if not exists public.patient_prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  professional_id uuid references auth.users(id) on delete set null,
  template_id uuid references public.integrative_prescription_templates(id),
  plan_id uuid references public.patient_therapeutic_plans(id) on delete set null,
  title text not null,
  summary text,
  rationality public.prescription_rationality,
  dosage text,
  frequency text,
  duration text,
  instructions text,
  indications text[] default '{}',
  status public.patient_prescription_status not null default 'active',
  issued_at timestamptz not null default now(),
  starts_at date,
  ends_at date,
  last_reviewed_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_patient_prescriptions_patient
  on public.patient_prescriptions (patient_id);

create index if not exists idx_patient_prescriptions_professional
  on public.patient_prescriptions (professional_id);

create index if not exists idx_patient_prescriptions_plan
  on public.patient_prescriptions (plan_id);

create index if not exists idx_patient_prescriptions_status
  on public.patient_prescriptions (status);

create index if not exists idx_pp_patient_issued_at
  on public.patient_prescriptions (patient_id, issued_at desc);

create index if not exists idx_pp_active_patient
  on public.patient_prescriptions (patient_id)
  where status = 'active';

create index if not exists idx_ptp_patient_status
  on public.patient_therapeutic_plans (patient_id, status);

drop trigger if exists trg_patient_prescriptions_updated_at
  on public.patient_prescriptions;

create trigger trg_patient_prescriptions_updated_at
before update on public.patient_prescriptions
for each row execute function public.tg_set_updated_at();

create or replace function public.tg_pp_defaults()
returns trigger
language plpgsql
as $$
begin
  if new.starts_at is null then
    new.starts_at := (new.issued_at at time zone 'UTC')::date;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_pp_defaults on public.patient_prescriptions;

create trigger trg_pp_defaults
before insert on public.patient_prescriptions
for each row execute function public.tg_pp_defaults();

alter table public.patient_prescriptions enable row level security;

drop policy if exists patient_prescriptions_select
  on public.patient_prescriptions;

create policy patient_prescriptions_select
  on public.patient_prescriptions
  for select
  to authenticated
  using (
    patient_id = auth.uid()
    or professional_id = auth.uid()
    or coalesce(public.current_user_role(), 'patient') = 'admin'
  );

drop policy if exists patient_prescriptions_insert
  on public.patient_prescriptions;

create policy patient_prescriptions_insert
  on public.patient_prescriptions
  for insert
  to authenticated
  with check (
    coalesce(public.current_user_role(), 'patient') in ('professional','admin')
  );

drop policy if exists patient_prescriptions_update
  on public.patient_prescriptions;

create policy patient_prescriptions_update
  on public.patient_prescriptions
  for update
  to authenticated
  using (
    professional_id = auth.uid()
    or coalesce(public.current_user_role(), 'patient') = 'admin'
  )
  with check (
    professional_id = auth.uid()
    or coalesce(public.current_user_role(), 'patient') = 'admin'
  );

grant select, insert, update on public.patient_prescriptions to authenticated;

-- endregion ------------------------------------------------------------------------------------

-- region: views --------------------------------------------------------------------------------

create or replace view public.v_patient_prescriptions as
select
  pp.id,
  pp.patient_id,
  pp.professional_id,
  pp.plan_id,
  pp.template_id,
  pp.title,
  pp.summary,
  pp.rationality,
  pp.dosage,
  pp.frequency,
  pp.duration,
  pp.instructions,
  pp.indications,
  pp.status,
  pp.issued_at,
  pp.starts_at,
  pp.ends_at,
  pp.last_reviewed_at,
  pp.metadata,
  pp.notes,
  pp.created_at,
  pp.updated_at,
  t.name as template_name,
  t.rationality as template_rationality,
  t.category as template_category,
  t.summary as template_summary,
  t.tags as template_tags,
  plan.title as plan_title,
  plan.status as plan_status
from public.patient_prescriptions pp
left join public.integrative_prescription_templates t
  on t.id = pp.template_id
left join public.patient_therapeutic_plans plan
  on plan.id = pp.plan_id;

grant select on public.v_patient_prescriptions to authenticated;

-- endregion ------------------------------------------------------------------------------------

