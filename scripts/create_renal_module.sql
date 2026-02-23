-- Renal Function Module Migration
-- Created: 2026-01-09
-- Purpose: Support for "Cidade Amiga dos Rins" project

-- 1. Create table for storing renal exams
create table if not exists public.renal_exams (
    id uuid default gen_random_uuid() primary key,
    patient_id uuid references auth.users(id) not null,
    exam_date date not null default current_date,
    
    -- Clinical Metrics
    creatinine numeric(5,2), -- mg/dL
    urea numeric(5,2),       -- mg/dL
    egfr numeric(5,1),       -- mL/min/1.73m² (Calculated)
    proteinuria numeric(5,2),-- mg/g or similar
    
    -- Classification
    drc_stage text check (drc_stage in ('G1', 'G2', 'G3a', 'G3b', 'G4', 'G5')),
    ai_interpretation text,
    
    -- Metadata
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id)
);

-- 2. Enable RLS
alter table public.renal_exams enable row level security;

-- 3. RLS Policies

-- Drop existing policies to allow updates
drop policy if exists "Professionals can view all renal exams" on public.renal_exams;
drop policy if exists "Professionals can manage renal exams" on public.renal_exams;
drop policy if exists "Patients can view own renal exams" on public.renal_exams;

-- Professionals can read all exams
create policy "Professionals can view all renal exams"
    on public.renal_exams for select
    using ( 
        exists (
            select 1 from public.users
            where id = auth.uid() and type = 'professional'
        )
    );

-- Professionals can insert/update exams
create policy "Professionals can manage renal exams"
    on public.renal_exams for all
    using ( 
        exists (
            select 1 from public.users
            where id = auth.uid() and type = 'professional'
        )
    );

-- Patients can view ONLY their own exams
create policy "Patients can view own renal exams"
    on public.renal_exams for select
    using ( auth.uid() = patient_id );

-- 4. Create Trend View (Simplified for Chart Consumption)
create or replace view v_renal_trend as
select 
    id,
    patient_id,
    exam_date,
    creatinine,
    egfr,
    drc_stage,
    case 
        when egfr >= 90 then 'Normal'
        when egfr >= 60 then 'Alerta'
        else 'Crítico' 
    end as status_color
from public.renal_exams
order by exam_date asc;

-- Grant permissions
grant select, insert, update on public.renal_exams to authenticated;
grant select on public.v_renal_trend to authenticated;
