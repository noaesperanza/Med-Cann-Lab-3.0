# 🚨 URGENTE: Criar Tabela `video_call_requests`

**Data:** 06/02/2026  
**Erro:** `Could not find the table 'public.video_call_requests' in the schema cache`

---

## ❌ Problema

A tabela `video_call_requests` **não existe** no banco de dados Supabase, causando erros 404 em todas as requisições de videochamada.

**Erro no console:**
```
❌ Erro ao criar solicitação de videochamada: {
  code: 'PGRST205',
  message: "Could not find the table 'public.video_call_requests' in the schema cache"
}
```

---

## ✅ Solução

**Execute o script SQL no Supabase:**

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Cole o conteúdo completo de: `database/scripts/CREATE_VIDEO_CALL_REQUESTS.sql`
4. Clique em **Run**

---

## 📋 O que o script cria

- ✅ Tabela `video_call_requests` com:
  - `id` (UUID)
  - `request_id` (TEXT, único)
  - `requester_id` (UUID, referência a `auth.users`)
  - `recipient_id` (UUID, referência a `auth.users`)
  - `call_type` ('video' | 'audio')
  - `status` ('pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled')
  - `expires_at` (TIMESTAMPTZ)
  - `metadata` (JSONB)
  - `created_at`, `accepted_at`, `rejected_at`, `cancelled_at`

- ✅ Índices para performance
- ✅ RLS (Row Level Security) habilitado
- ✅ Políticas RLS para usuários verem/criarem/atualizarem suas próprias solicitações
- ✅ Função `expire_video_call_requests()` para expirar solicitações automaticamente

---

## 🔍 Verificação

Após executar o script, verifique:

```sql
-- Verificar se a tabela existe
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'video_call_requests';

-- Verificar políticas RLS
SELECT * FROM pg_policies 
WHERE tablename = 'video_call_requests';
```

---

## 📝 Nota

O script é **idempotente** (pode ser executado múltiplas vezes sem problemas):
- Usa `CREATE TABLE IF NOT EXISTS`
- Usa `DROP POLICY IF EXISTS` antes de criar políticas
- Usa `CREATE INDEX IF NOT EXISTS`

---

**Criado por:** Auto (AI Assistant)  
**Data:** 06/02/2026
