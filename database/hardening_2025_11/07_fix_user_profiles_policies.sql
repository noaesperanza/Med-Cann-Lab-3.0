set search_path = public, auth;

create or replace function public.get_chat_user_profiles(p_user_ids uuid[])
returns table (user_id uuid, name text, email text)
language sql
security definer
stable
as $$
  select
    p.user_id,
    p.name,
    p.email
  from public.user_profiles p
  where p.user_id = any(p_user_ids)
    and exists (
      select 1
      from public.chat_participants cp_self
      where cp_self.user_id = auth.uid()
        and cp_self.room_id in (
          select cp.room_id
          from public.chat_participants cp
          where cp.user_id = p.user_id
        )
    );
$$;
