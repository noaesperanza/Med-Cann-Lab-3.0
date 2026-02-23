# 🚀 Guia de Deploy das Edge Functions de Videochamada

**Data:** 06/02/2026

## ⚠️ IMPORTANTE: São 2 Funções SEPARADAS

Existem **2 Edge Functions diferentes**, cada uma em sua própria pasta:

1. **`video-call-request-notification`** - Notificações em tempo real
2. **`video-call-reminders`** - Lembretes automáticos

---

## 📁 Estrutura das Pastas

```
supabase/functions/
├── video-call-request-notification/
│   └── index.ts  ← TypeScript (NÃO SQL!)
└── video-call-reminders/
    └── index.ts  ← TypeScript (NÃO SQL!)
```

---

## ❌ ERRO COMUM

**NÃO COLE SQL DENTRO DOS ARQUIVOS `.ts`!**

- ❌ **ERRADO:** Colar conteúdo de `CREATE_VIDEO_CALL_REQUESTS.sql` dentro de `index.ts`
- ✅ **CORRETO:** Cada função já tem seu próprio `index.ts` com código TypeScript

---

## 🚀 Como Fazer Deploy

### Opção 1: Via Supabase CLI

```bash
# Deploy da função de notificação em tempo real
supabase functions deploy video-call-request-notification

# Deploy da função de lembretes
supabase functions deploy video-call-reminders
```

### Opção 2: Via Supabase Dashboard

1. Acesse **Supabase Dashboard** → **Edge Functions**
2. Para cada função:
   - Clique em **"New Function"** ou selecione a função existente
   - **NÃO cole SQL!** Use o arquivo `index.ts` que já está no repositório
   - Clique em **"Deploy"**

---

## 📋 Checklist de Deploy

### 1. `video-call-request-notification` (TEMPO REAL)
- [ ] Verificar que `supabase/functions/video-call-request-notification/index.ts` existe
- [ ] Verificar que o arquivo contém código TypeScript (não SQL)
- [ ] Fazer deploy via CLI ou Dashboard
- [ ] Testar chamando a função

### 2. `video-call-reminders` (AGENDAMENTO)
- [ ] Verificar que `supabase/functions/video-call-reminders/index.ts` existe
- [ ] Verificar que o arquivo contém código TypeScript (não SQL)
- [ ] Fazer deploy via CLI ou Dashboard
- [ ] Configurar cron job (opcional, para lembretes automáticos)

---

## 🔍 Verificar se os Arquivos Estão Corretos

### ✅ Arquivo Correto (TypeScript)
```typescript
// Edge Function: Notificação de Solicitação de Videochamada
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// ... código TypeScript
```

### ❌ Arquivo Errado (SQL)
```sql
-- Tabela para solicitações de videochamada em tempo real
CREATE TABLE IF NOT EXISTS public.video_call_requests (
  -- ... código SQL
```

**Se você ver "CREATE TABLE" ou "-- Tabela" no arquivo `.ts`, está ERRADO!**

---

## 🛠️ Se Você Colou SQL por Engano

1. **Restaure o arquivo correto do repositório:**
   ```bash
   git checkout supabase/functions/video-call-request-notification/index.ts
   git checkout supabase/functions/video-call-reminders/index.ts
   ```

2. **Ou copie o conteúdo correto:**
   - `video-call-request-notification/index.ts` → Código TypeScript para notificações
   - `video-call-reminders/index.ts` → Código TypeScript para lembretes

---

## 📝 Resumo

| Função | Propósito | Quando Usar | Arquivo |
|--------|-----------|-------------|---------|
| `video-call-request-notification` | Notificação imediata | Quando alguém clica em "Video/Audio Call" | `supabase/functions/video-call-request-notification/index.ts` |
| `video-call-reminders` | Lembretes automáticos | 30min, 10min, 1min antes da chamada | `supabase/functions/video-call-reminders/index.ts` |

**Ambas são TypeScript (.ts), NÃO SQL!**
