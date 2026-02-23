-- Create: noa_pending_actions (pending confirmation state)
-- Purpose: store short-lived pending actions for stateless Core (Edge Function)
-- Contract: append-only addition; does not modify existing tables/flows.

create table if not exists public.noa_pending_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  status text not null default 'pending' check (status in ('pending', 'consumed', 'cancelled', 'expired')),
  candidates jsonb not null default '[]'::jsonb,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists noa_pending_actions_user_id_created_at_idx
  on public.noa_pending_actions (user_id, created_at desc);

create index if not exists noa_pending_actions_user_id_expires_at_idx
  on public.noa_pending_actions (user_id, expires_at);

alter table public.noa_pending_actions enable row level security;

-- Owner can read their own pending actions (needed for UI debugging or future clients).
create policy "noa_pending_actions_select_own"
  on public.noa_pending_actions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Owner can create their own pending action (normally Core uses service role, but keep consistent).
create policy "noa_pending_actions_insert_own"
  on public.noa_pending_actions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Owner can update status for their own pending action (cancel, consume).
create policy "noa_pending_actions_update_own"
  on public.noa_pending_actions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

