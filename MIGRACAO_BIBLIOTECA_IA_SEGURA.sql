-- =====================================================
-- MIGRAÇÃO: Biblioteca + IA Residente (VERSÃO SEGURA)
-- Baseado na avaliação de segurança e privacidade
-- =====================================================

begin;

-- 1) Colunas principais (idempotentes)
alter table public.documents
  add column if not exists downloads integer not null default 0,
  add column if not exists "isLinkedToAI" boolean not null default false,
  add column if not exists "aiRelevance" numeric(3,2) not null default 0.0,
  add column if not exists category text,
  add column if not exists summary text,
  add column if not exists tags text[] default array[]::text[],
  add column if not exists keywords text[] default array[]::text[],
  add column if not exists target_audience text[] default array[]::text[],
  add column if not exists author text,
  add column if not exists file_url text,
  add column if not exists file_type text,
  add column if not exists file_size bigint; -- bigint para arquivos grandes

-- 1.1) Constraint de faixa para aiRelevance (0..1)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'documents_ai_relevance_range_ck'
  ) then
    alter table public.documents
      add constraint documents_ai_relevance_range_ck
      check ("aiRelevance" >= 0 and "aiRelevance" <= 1);
  end if;
end$$;

-- 2) Dados legados nulos → defaults coerentes
update public.documents set "isLinkedToAI" = false where "isLinkedToAI" is null;
update public.documents set downloads = 0 where downloads is null;

-- 3) Indexação para performance
-- 3.1) Arrays e filtros
create index if not exists documents_tags_gin_idx     on public.documents using gin (tags);
create index if not exists documents_keywords_gin_idx on public.documents using gin (keywords);
create index if not exists documents_islinked_idx     on public.documents ("isLinkedToAI");
create index if not exists documents_downloads_idx    on public.documents (downloads);
create index if not exists documents_category_idx    on public.documents (category) where category is not null;
create index if not exists documents_airelevance_idx on public.documents ("aiRelevance") where "aiRelevance" > 0;

-- 3.2) Full-text search (OPCIONAL - descomente se precisar)
-- Adiciona coluna tsvector para busca avançada em português
-- alter table public.documents
--   add column if not exists search_tsv tsvector;
-- 
-- update public.documents
-- set search_tsv =
--       setweight(to_tsvector('portuguese', coalesce(title,'')),   'A') ||
--       setweight(to_tsvector('portuguese', coalesce(summary,'')), 'B') ||
--       setweight(to_tsvector('portuguese', coalesce(author,'')),  'C') ||
--       setweight(to_tsvector('portuguese', coalesce(array_to_string(tags,' '),'')),     'C') ||
--       setweight(to_tsvector('portuguese', coalesce(array_to_string(keywords,' '),'')), 'C');
-- 
-- create index if not exists documents_search_tsv_idx on public.documents using gin (search_tsv);
-- 
-- -- Trigger para manter o tsvector atualizado
-- create or replace function public.documents_tsv_refresh()
-- returns trigger language plpgsql as $$
-- begin
--   new.search_tsv :=
--       setweight(to_tsvector('portuguese', coalesce(new.title,'')),   'A') ||
--       setweight(to_tsvector('portuguese', coalesce(new.summary,'')), 'B') ||
--       setweight(to_tsvector('portuguese', coalesce(new.author,'')),  'C') ||
--       setweight(to_tsvector('portuguese', coalesce(array_to_string(new.tags,' '),'')),     'C') ||
--       setweight(to_tsvector('portuguese', coalesce(array_to_string(new.keywords,' '),'')), 'C');
--   return new;
-- end$$;
-- 
-- drop trigger if exists documents_tsv_refresh_tr on public.documents;
-- create trigger documents_tsv_refresh_tr
-- before insert or update of title, summary, author, tags, keywords
-- on public.documents
-- for each row execute function public.documents_tsv_refresh();

-- 4) Função SEGURA para incremento de downloads
-- Versão melhorada com validação de autenticação
create or replace function public.increment_document_download(p_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_document_exists boolean;
begin
  -- Verificar se usuário está autenticado
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Acesso negado: usuário não autenticado';
  end if;

  -- Verificar se documento existe
  select exists(select 1 from public.documents where id = p_id) into v_document_exists;
  if not v_document_exists then
    raise exception 'Documento não encontrado: %', p_id;
  end if;

  -- Incrementar downloads (com limite de segurança opcional)
  update public.documents
     set downloads = coalesce(downloads, 0) + 1
   where id = p_id;
  
  -- Opcional: Registrar download em tabela de auditoria (se existir)
  -- insert into document_downloads_audit (document_id, user_id, downloaded_at)
  -- values (p_id, v_user_id, now());
end;
$$;

-- Comentário na função
comment on function public.increment_document_download(uuid) is 
'Incrementa contador de downloads de um documento de forma segura. Requer autenticação.';

-- 5) RLS (exemplos - descomente apenas se tiver políticas compatíveis)
-- ATENÇÃO: Só habilite RLS se já tiver políticas adequadas configuradas
-- Se não tiver, pode bloquear acesso à biblioteca!
-- 
-- alter table public.documents enable row level security;
-- 
-- -- Política de leitura (todos autenticados podem ler)
-- create policy documents_read_authenticated on public.documents 
--   for select 
--   to authenticated 
--   using (true);
-- 
-- -- Política de atualização (apenas donos podem atualizar)
-- -- Ajuste conforme sua lógica de ownership
-- create policy documents_update_owner on public.documents 
--   for update 
--   to authenticated 
--   using (auth.uid() = uploaded_by) 
--   with check (auth.uid() = uploaded_by);

commit;

-- 6) Reload de schema do PostgREST (após migrações)
notify pgrst, 'reload schema';

-- 7) Relatório rápido
select
  'Status Final da Migração' as verificacao,
  count(*)                                   as total_documentos,
  count(*) filter (where "isLinkedToAI")     as vinculados_ia,
  count(*) filter (where downloads is not null) as com_contador_downloads,
  count(*) filter (where file_url is not null)  as com_url_arquivo,
  count(*) filter (where array_length(tags,1)     > 0) as com_tags,
  count(*) filter (where array_length(keywords,1) > 0) as com_keywords,
  round(avg("aiRelevance")::numeric, 2) as relevancia_media
from public.documents;

