set search_path = public;

drop policy if exists chat_participants_select on public.chat_participants;
create policy chat_participants_select on public.chat_participants
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or coalesce(public.current_user_role(), 'patient') = 'admin'
  );

drop policy if exists chat_participants_insert on public.chat_participants;
create policy chat_participants_insert on public.chat_participants
  for insert
  to authenticated
  with check (
    auth.uid() = chat_participants.user_id
    or coalesce(public.current_user_role(), 'patient') = 'admin'
    or exists (
      select 1
      from public.chat_rooms r
      where r.id = chat_participants.room_id
        and r.created_by = auth.uid()
    )
  );

drop policy if exists chat_participants_update on public.chat_participants;
create policy chat_participants_update on public.chat_participants
  for update
  to authenticated
  using (
    user_id = auth.uid()
    or coalesce(public.current_user_role(), 'patient') = 'admin'
  )
  with check (true);

drop policy if exists chat_participants_delete on public.chat_participants;
create policy chat_participants_delete on public.chat_participants
  for delete
  to authenticated
  using (
    user_id = auth.uid()
    or coalesce(public.current_user_role(), 'patient') = 'admin'
    or exists (
      select 1
      from public.chat_rooms r
      where r.id = chat_participants.room_id
        and r.created_by = auth.uid()
    )
  );
