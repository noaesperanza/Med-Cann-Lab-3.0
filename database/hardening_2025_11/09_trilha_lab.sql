-- TrilhaLab core schema for portals, trilhas e acompanhamento pedagógico
-- Executar em Supabase (Postgres 15+)

set search_path to public;

-- 1. Portal de entrada (landing atravessável)
create table if not exists public.portal_entries (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null,
  portal_slug text not null,
  user_type text,
  email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

comment on table public.portal_entries is 'Registros do portal de entrada (landing). Cada clique gera um device_id + portal_slug.';
comment on column public.portal_entries.portal_slug is 'Identifica o portal/túnel (ex.: arte-entrevista-clinica, medcannlab).';

create index if not exists portal_entries_created_at_idx on public.portal_entries (created_at desc);
create index if not exists portal_entries_device_idx on public.portal_entries (device_id);

alter table public.portal_entries enable row level security;

create policy "Anon pode registrar entrada no portal"
  on public.portal_entries
  for insert
  to anon, authenticated
  with check (true);

create policy "Service role gerencia portal entries"
  on public.portal_entries
  using (auth.jwt()->>'role' = 'service_role')
  with check (auth.jwt()->>'role' = 'service_role');

-- 2. Programas / trilhas coordenadas
create table if not exists public.trl_programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  coordinator_id uuid not null references auth.users (id) on delete restrict,
  logo_url text,
  description text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create trigger trl_programs_updated_at
  before update on public.trl_programs
  for each row
  execute function public.set_updated_at();

alter table public.trl_programs enable row level security;

create policy "Programas visíveis para anon"
  on public.trl_programs
  for select
  to anon, authenticated
  using (true);

create policy "Coordenador gerencia programa"
  on public.trl_programs
  for all
  using (
    auth.jwt()->>'role' = 'service_role'
    or coordinator_id = auth.uid()
  )
  with check (
    auth.jwt()->>'role' = 'service_role'
    or coordinator_id = auth.uid()
  );

-- 3. Módulos (trilhas)
create table if not exists public.trl_modules (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.trl_programs (id) on delete cascade,
  code text not null,
  title text not null,
  overview text,
  expected_hours integer check (expected_hours is null or expected_hours >= 0),
  sequence integer not null default 1,
  published boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create unique index if not exists trl_modules_program_code_uidx on public.trl_modules (program_id, code);
create unique index if not exists trl_modules_program_sequence_uidx on public.trl_modules (program_id, sequence);

create trigger trl_modules_updated_at
  before update on public.trl_modules
  for each row
  execute function public.set_updated_at();

alter table public.trl_modules enable row level security;

create policy "Módulos visíveis para anon"
  on public.trl_modules
  for select
  to anon, authenticated
  using (true);

create policy "Coordenador gerencia módulos"
  on public.trl_modules
  for all
  using (
    auth.jwt()->>'role' = 'service_role'
    or exists (
      select 1
      from public.trl_programs p
      where p.id = trl_modules.program_id
        and p.coordinator_id = auth.uid()
    )
  )
  with check (
    auth.jwt()->>'role' = 'service_role'
    or exists (
      select 1
      from public.trl_programs p
      where p.id = trl_modules.program_id
        and p.coordinator_id = auth.uid()
    )
  );

-- 4. Lições (aulas, mentorias, avaliações)
create table if not exists public.trl_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.trl_modules (id) on delete cascade,
  title text not null,
  description text,
  format text not null check (format in ('video', 'reading', 'lab', 'avaliacao', 'mentoria', 'podcast')),
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  live_at timestamptz,
  release_at timestamptz,
  order_index integer not null default 1,
  is_required boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists trl_lessons_module_order_idx on public.trl_lessons (module_id, order_index);

create trigger trl_lessons_updated_at
  before update on public.trl_lessons
  for each row
  execute function public.set_updated_at();

alter table public.trl_lessons enable row level security;

create policy "Lições visíveis para anon"
  on public.trl_lessons
  for select
  to anon, authenticated
  using (true);

create policy "Coordenador gerencia lições"
  on public.trl_lessons
  for all
  using (
    auth.jwt()->>'role' = 'service_role'
    or exists (
      select 1
      from public.trl_modules m
      join public.trl_programs p on p.id = m.program_id
      where m.id = trl_lessons.module_id
        and p.coordinator_id = auth.uid()
    )
  )
  with check (
    auth.jwt()->>'role' = 'service_role'
    or exists (
      select 1
      from public.trl_modules m
      join public.trl_programs p on p.id = m.program_id
      where m.id = trl_lessons.module_id
        and p.coordinator_id = auth.uid()
    )
  );

-- 5. Domínios de competência
create table if not exists public.trl_competency_domains (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.trl_programs (id) on delete cascade,
  name text not null,
  dimension text,
  description text,
  color text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create unique index if not exists trl_competency_domains_program_name_uidx on public.trl_competency_domains (program_id, name);

alter table public.trl_competency_domains enable row level security;

create policy "Competências visíveis para anon"
  on public.trl_competency_domains
  for select
  to anon, authenticated
  using (true);

create policy "Coordenador gerencia competências"
  on public.trl_competency_domains
  for all
  using (
    auth.jwt()->>'role' = 'service_role'
    or exists (
      select 1
      from public.trl_programs p
      where p.id = trl_competency_domains.program_id
        and p.coordinator_id = auth.uid()
    )
  )
  with check (
    auth.jwt()->>'role' = 'service_role'
    or exists (
      select 1
      from public.trl_programs p
      where p.id = trl_competency_domains.program_id
        and p.coordinator_id = auth.uid()
    )
  );

-- 6. Ligação módulo ↔ competência
create table if not exists public.trl_module_competencies (
  module_id uuid not null references public.trl_modules (id) on delete cascade,
  competency_id uuid not null references public.trl_competency_domains (id) on delete cascade,
  weight numeric(6,2) not null default 1 constraint trl_module_competencies_weight_check check (weight > 0),
  notes text,
  primary key (module_id, competency_id)
);

create index if not exists trl_module_competencies_competency_idx on public.trl_module_competencies (competency_id);

alter table public.trl_module_competencies enable row level security;

create policy "Módulo-competência visível para anon"
  on public.trl_module_competencies
  for select
  to anon, authenticated
  using (true);

create policy "Coordenador gerencia módulo-competência"
  on public.trl_module_competencies
  for all
  using (
    auth.jwt()->>'role' = 'service_role'
    or exists (
      select 1
      from public.trl_modules m
      join public.trl_programs p on p.id = m.program_id
      where m.id = trl_module_competencies.module_id
        and p.coordinator_id = auth.uid()
    )
  )
  with check (
    auth.jwt()->>'role' = 'service_role'
    or exists (
      select 1
      from public.trl_modules m
      join public.trl_programs p on p.id = m.program_id
      where m.id = trl_module_competencies.module_id
        and p.coordinator_id = auth.uid()
    )
  );

-- 7. Evidências de aprendizagem (tarefas, role-play, avaliações)
create table if not exists public.trl_learning_evidence (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.trl_modules (id) on delete cascade,
  title text not null,
  description text,
  evidence_type text not null check (evidence_type in ('rubrica', 'caso', 'simulacao', 'avaliacao', 'projeto', 'reflexao')),
  due_offset_days integer,
  total_points integer check (total_points is null or total_points >= 0),
  resources jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists trl_learning_evidence_module_idx on public.trl_learning_evidence (module_id);

alter table public.trl_learning_evidence enable row level security;

create policy "Evidências visíveis para anon"
  on public.trl_learning_evidence
  for select
  to anon, authenticated
  using (true);

create policy "Coordenador gerencia evidências"
  on public.trl_learning_evidence
  for all
  using (
    auth.jwt()->>'role' = 'service_role'
    or exists (
      select 1
      from public.trl_modules m
      join public.trl_programs p on p.id = m.program_id
      where m.id = trl_learning_evidence.module_id
        and p.coordinator_id = auth.uid()
    )
  )
  with check (
    auth.jwt()->>'role' = 'service_role'
    or exists (
      select 1
      from public.trl_modules m
      join public.trl_programs p on p.id = m.program_id
      where m.id = trl_learning_evidence.module_id
        and p.coordinator_id = auth.uid()
    )
  );

-- 8. Reflexões dos alunos
create table if not exists public.trl_reflections (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.trl_lessons (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  prompt text not null,
  response text not null,
  visibility text not null default 'private' check (visibility in ('private', 'coordinator', 'public')),
  submitted_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists trl_reflections_user_idx on public.trl_reflections (user_id);
create index if not exists trl_reflections_lesson_idx on public.trl_reflections (lesson_id);

create trigger trl_reflections_updated_at
  before update on public.trl_reflections
  for each row
  execute function public.set_updated_at();

alter table public.trl_reflections enable row level security;

create policy "Autor lê/edita reflexão"
  on public.trl_reflections
  for select using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Autor atualiza reflexão"
  on public.trl_reflections
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Autor remove reflexão"
  on public.trl_reflections
  for delete using (user_id = auth.uid());

create policy "Coordenador visualiza reflexões"
  on public.trl_reflections
  for select
  to authenticated
  using (
    auth.jwt()->>'role' = 'service_role'
    or exists (
      select 1
      from public.trl_lessons l
      join public.trl_modules m on m.id = l.module_id
      join public.trl_programs p on p.id = m.program_id
      where l.id = trl_reflections.lesson_id
        and p.coordinator_id = auth.uid()
    )
  );

-- 9. Eventos de trilha (engajamento, portal, progresso)
create table if not exists public.trl_events (
  id uuid primary key default gen_random_uuid(),
  portal_entry_id uuid references public.portal_entries (id) on delete set null,
  program_id uuid references public.trl_programs (id) on delete set null,
  module_id uuid references public.trl_modules (id) on delete set null,
  lesson_id uuid references public.trl_lessons (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  event_type text not null,
  event_payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists trl_events_program_idx on public.trl_events (program_id, occurred_at desc);
create index if not exists trl_events_user_idx on public.trl_events (user_id, occurred_at desc);
create index if not exists trl_events_portal_idx on public.trl_events (portal_entry_id);

alter table public.trl_events enable row level security;

create policy "Portal registra eventos"
  on public.trl_events
  for insert
  to anon, authenticated
  with check (true);

create policy "Usuário vê seus eventos"
  on public.trl_events
  for select
  to authenticated
  using (
    auth.jwt()->>'role' = 'service_role'
    or user_id = auth.uid()
    or exists (
      select 1
      from public.trl_programs p
      where p.id = trl_events.program_id
        and p.coordinator_id = auth.uid()
    )
  );

create policy "Serviço gerencia eventos"
  on public.trl_events
  for all
  using (auth.jwt()->>'role' = 'service_role')
  with check (auth.jwt()->>'role' = 'service_role');


