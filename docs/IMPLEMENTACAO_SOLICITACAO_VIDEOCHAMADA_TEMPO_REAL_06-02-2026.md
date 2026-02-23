# ✅ Implementação: Solicitação de Videochamada em Tempo Real

**Data:** 06/02/2026

---

## 🎯 Objetivo

Implementar sistema de solicitação de videochamada em tempo real onde:
1. **Usuário solicita** → Envia notificação para o outro usuário
2. **Outro usuário recebe** → Pode aceitar ou recusar
3. **Quando aceita** → Videochamada inicia automaticamente
4. **Timeout (time decay)** → Se não aceitar em 30 segundos, expira

---

## 📋 Componentes Criados

### 1. Tabela `video_call_requests`

**Arquivo:** `database/scripts/CREATE_VIDEO_CALL_REQUESTS.sql`

**Campos:**
- `request_id`: ID único da solicitação
- `requester_id`: Quem solicitou
- `recipient_id`: Quem recebe
- `call_type`: 'video' ou 'audio'
- `status`: 'pending', 'accepted', 'rejected', 'expired', 'cancelled'
- `expires_at`: Timestamp de expiração (padrão: 30 segundos)
- `metadata`: JSONB com informações adicionais (patientId, roomId)

**RLS:**
- Usuários podem ver solicitações onde são requester ou recipient
- Usuários podem criar solicitações onde são requester
- Usuários podem atualizar (aceitar/recusar) suas solicitações

---

### 2. Service: `videoCallRequestService`

**Arquivo:** `src/services/videoCallRequestService.ts`

**Métodos:**
- `createRequest()`: Criar nova solicitação
- `acceptRequest()`: Aceitar solicitação
- `rejectRequest()`: Recusar solicitação
- `cancelRequest()`: Cancelar solicitação (pelo requester)
- `getPendingRequests()`: Buscar solicitações pendentes
- `subscribeToRequests()`: Inscrever-se em atualizações em tempo real

---

### 3. Hook: `useVideoCallRequests`

**Arquivo:** `src/hooks/useVideoCallRequests.ts`

**Funcionalidades:**
- Gerencia estado de solicitações pendentes
- Carrega solicitações ao montar
- Inscreve-se em atualizações em tempo real via Supabase Realtime
- Limpa solicitações expiradas automaticamente (a cada 5 segundos)

---

### 4. Componente: `VideoCallRequestNotification`

**Arquivo:** `src/components/VideoCallRequestNotification.tsx`

**Funcionalidades:**
- Exibe notificação de solicitação recebida
- Mostra contador regressivo (timeout)
- Botões para aceitar/recusar
- Auto-expira quando timeout chega a zero

---

## 🔄 Fluxo Completo

### Cenário: Admin solicita videochamada com Ricardo

1. **Admin clica em botão de vídeo** no chat
   - `createRequest()` é chamado
   - Solicitação criada no banco com `status: 'pending'`
   - `expires_at` = agora + 30 segundos
   - `pendingCallRequest` é setado com `request_id`

2. **Ricardo recebe notificação em tempo real**
   - Supabase Realtime detecta INSERT na tabela
   - `VideoCallRequestNotification` aparece no canto superior direito
   - Contador regressivo começa (30s → 0s)

3. **Ricardo aceita**
   - `acceptRequest()` atualiza status para 'accepted'
   - Admin recebe atualização via Realtime
   - `VideoCall` abre automaticamente para ambos
   - `pendingCallRequest` é limpo

4. **Ricardo recusa OU timeout**
   - Se recusar: `rejectRequest()` atualiza status
   - Se timeout: status muda para 'expired' automaticamente
   - Admin recebe notificação
   - `pendingCallRequest` é limpo
   - Alert mostra mensagem

---

## ⚙️ Integração no Chat

**Arquivo:** `src/pages/PatientDoctorChat.tsx`

**Mudanças:**
- Botões de vídeo/áudio agora chamam `createRequest()` ao invés de abrir diretamente
- Botões ficam desabilitados enquanto há `pendingCallRequest`
- `VideoCallRequestNotification` renderiza todas as solicitações pendentes
- `VideoCall` abre apenas quando solicitação é aceita

---

## 🧪 Como Testar

### Teste 1: Solicitação → Aceitação
1. Admin abre chat com Ricardo
2. Admin clica em botão de vídeo
3. Ricardo recebe notificação
4. Ricardo aceita
5. Videochamada inicia para ambos

### Teste 2: Solicitação → Recusa
1. Admin solicita videochamada
2. Ricardo recusa
3. Admin recebe alert: "Solicitação recusada"
4. Botão de vídeo fica habilitado novamente

### Teste 3: Timeout
1. Admin solicita videochamada
2. Ricardo não responde
3. Após 30 segundos, solicitação expira
4. Admin recebe alert: "Solicitação expirada"
5. Botão de vídeo fica habilitado novamente

---

## 📊 Estrutura de Dados

```typescript
interface VideoCallRequest {
  id: string
  request_id: string
  requester_id: string
  recipient_id: string
  call_type: 'video' | 'audio'
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled'
  expires_at: string
  accepted_at?: string
  rejected_at?: string
  cancelled_at?: string
  metadata?: {
    patientId?: string
    roomId?: string
  }
  created_at: string
}
```

---

## ✅ Status

- [x] Tabela `video_call_requests` criada
- [x] Service `videoCallRequestService` implementado
- [x] Hook `useVideoCallRequests` criado
- [x] Componente `VideoCallRequestNotification` implementado
- [x] Integração no `PatientDoctorChat` completa
- [x] Realtime subscriptions configuradas
- [x] Timeout automático (30 segundos)
- [x] Limpeza de solicitações expiradas

---

## 🚀 Próximos Passos

1. **Executar SQL:** Rodar `CREATE_VIDEO_CALL_REQUESTS.sql` no Supabase
2. **Testar:** Verificar fluxo completo de solicitação → aceitação
3. **Ajustar timeout:** Se necessário, mudar de 30s para outro valor
4. **Melhorar UX:** Adicionar som de notificação (opcional)

---

**Criado por:** Auto (AI Assistant)  
**Data:** 06/02/2026
