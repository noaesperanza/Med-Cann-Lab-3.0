# ✅ CHECKLIST: Deploy Completo - Todas as Correções

**Data:** 06/02/2026  
**Use este checklist para garantir que tudo foi feito**

---

## 📋 SCRIPTS SQL (Execute no Supabase SQL Editor)

- [ ] **1. RPC para notificações**
  - Arquivo: `database/scripts/CREATE_RPC_CREATE_VIDEO_CALL_NOTIFICATION.sql`
  - O que faz: Cria função RPC para bypass RLS
  - Tempo: 1-2 minutos

- [ ] **2. Política RLS única**
  - Arquivo: `database/scripts/FIX_RLS_NOTIFICATIONS_FINAL.sql`
  - O que faz: Remove políticas conflitantes, cria política única
  - Tempo: 1-2 minutos

- [ ] **3. Refresh schema cache**
  - Arquivo: `database/scripts/FORCE_REFRESH_POSTGREST_CACHE.sql`
  - O que faz: Força PostgREST a reconhecer coluna `metadata`
  - Tempo: 1-2 minutos

---

## 🚀 EDGE FUNCTIONS (Deploy)

- [ ] **1. video-call-request-notification**
  - Arquivo: `supabase/functions/video-call-request-notification/index.ts`
  - Comando: `npx supabase functions deploy video-call-request-notification --project-ref itdjkfubfzmuxxjoae`
  - Ou via Dashboard
  - Tempo: 2-3 minutos

- [ ] **2. tradevision-core**
  - Arquivo: `supabase/functions/tradevision-core/index.ts`
  - Comando: `npx supabase functions deploy tradevision-core --project-ref itdjkfubfzmuxxjoae`
  - Ou via Dashboard
  - Tempo: 2-3 minutos

---

## ⏰ AGUARDAR

- [ ] **Schema cache atualizar**
  - Aguardar 2-5 minutos após executar `FORCE_REFRESH_POSTGREST_CACHE.sql`
  - Fallback funciona mesmo sem metadata

---

## 🧪 TESTES

- [ ] **1. CORS**
  - Abrir DevTools → Network
  - Tentar criar solicitação de videochamada
  - Verificar OPTIONS retorna 204 ✅

- [ ] **2. RLS**
  - Tentar criar solicitação de videochamada
  - Verificar logs: "Notificação criada via RPC" ✅

- [ ] **3. Metadata**
  - Aguardar 2-5 minutos
  - Tentar criar solicitação de videochamada
  - Verificar logs: "com metadata" ✅

- [ ] **4. TradeVision**
  - Enviar mensagem no chat
  - Verificar que não há erro "aiResponse is not defined" ✅

---

## 📊 STATUS

**Total de itens:** 8  
**Tempo total estimado:** 15-25 minutos

---

**Documento criado por:** Sistema de Checklist  
**Data:** 06/02/2026
