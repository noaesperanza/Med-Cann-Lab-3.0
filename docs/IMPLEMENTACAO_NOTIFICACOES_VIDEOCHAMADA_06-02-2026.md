# ✅ Implementação: Sistema de Notificações de Videochamada

**Data:** 06/02/2026

## 📋 Resumo

Sistema completo de agendamento e notificações automáticas para videochamadas, com:
- Agendamento pelo profissional
- Solicitação pelo paciente
- Notificações automáticas (30min, 10min, 1min antes)
- Caixa de mensagens no Sidebar

---

## 🗄️ Banco de Dados

### 1. Tabela `video_call_schedules`

**Arquivo:** `database/scripts/CREATE_VIDEO_CALL_SCHEDULES.sql`

```sql
CREATE TABLE video_call_schedules (
  id UUID PRIMARY KEY,
  session_id TEXT UNIQUE, -- Vinculado quando iniciar
  professional_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  call_type TEXT CHECK (call_type IN ('video', 'audio')),
  status TEXT DEFAULT 'scheduled',
  requested_by TEXT CHECK (requested_by IN ('professional', 'patient')),
  request_message TEXT, -- Mensagem do paciente
  reminder_sent_30min BOOLEAN DEFAULT FALSE,
  reminder_sent_10min BOOLEAN DEFAULT FALSE,
  reminder_sent_1min BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS:**
- Profissional: SELECT, INSERT, UPDATE (próprios agendamentos)
- Paciente: SELECT, INSERT (solicitar), UPDATE (próprios agendamentos)

---

## 🎨 Componentes Frontend

### 1. `VideoCallScheduler`

**Arquivo:** `src/components/VideoCallScheduler.tsx`

**Funcionalidades:**
- Agendamento pelo profissional (com paciente selecionado)
- Solicitação pelo paciente (com profissional selecionado)
- Seleção de data/hora
- Tipo de chamada (vídeo/áudio)
- Mensagem opcional (paciente)

**Fluxo:**
1. Usuário preenche data, hora, tipo
2. Se paciente, pode adicionar mensagem
3. Ao confirmar:
   - Cria registro em `video_call_schedules`
   - Cria notificação para o outro usuário
   - Chama Edge Function para agendar lembretes

---

### 2. `NotificationCenter` (Atualizado)

**Arquivo:** `src/components/NotificationCenter.tsx`

**Melhorias:**
- Adicionado tipo `video_call_scheduled`
- Ícone de vídeo para notificações de videochamada
- Integrado no Sidebar

**Localização:** Sidebar (logo após o header, antes da navegação)

---

### 3. Sidebar (Atualizado)

**Arquivo:** `src/components/Sidebar.tsx`

**Mudanças:**
- Importado `NotificationCenter`
- Adicionado componente no topo do sidebar (quando não colapsado)

---

## ⚙️ Edge Function

### `video-call-reminders`

**Arquivo:** `supabase/functions/video-call-reminders/index.ts`

**Funcionalidade:**
- Recebe `schedule_id` e `scheduled_at`
- Calcula tempos de lembretes (30min, 10min, 1min antes)
- Cria notificações in-app quando chegar a hora
- Marca flags de lembretes enviados

**Nota:** Por enquanto, apenas notificações in-app. Email/WhatsApp será implementado posteriormente.

**Uso:**
```typescript
await supabase.functions.invoke('video-call-reminders', {
  body: {
    schedule_id: data.id,
    scheduled_at: scheduledDateTime.toISOString()
  }
})
```

---

## 🔄 Fluxos de Uso

### Fluxo 1: Profissional Agenda Videochamada

1. Profissional seleciona paciente no dashboard
2. Clica em "Agendar Videochamada"
3. Abre `VideoCallScheduler`:
   - Seleciona data/hora
   - Escolhe tipo (vídeo/áudio)
   - Confirma
4. Sistema:
   - Cria registro em `video_call_schedules`
   - Cria notificação para o paciente
   - Agenda lembretes automáticos
5. Paciente recebe notificação na caixa de mensagens

---

### Fluxo 2: Paciente Solicita Videochamada

1. Paciente acessa dashboard
2. Clica em "Solicitar Videochamada"
3. Seleciona profissional (se houver múltiplos)
4. Abre `VideoCallScheduler`:
   - Seleciona data/hora
   - Escolhe tipo (vídeo/áudio)
   - Adiciona mensagem (opcional)
   - Confirma
5. Sistema:
   - Cria registro em `video_call_schedules` com `requested_by='patient'`
   - Cria notificação para o profissional (com mensagem)
   - Agenda lembretes automáticos
6. Profissional recebe notificação na caixa de mensagens

---

### Fluxo 3: Lembretes Automáticos

1. Edge Function `video-call-reminders` é chamada ao criar agendamento
2. Sistema calcula:
   - 30 minutos antes
   - 10 minutos antes
   - 1 minuto antes
3. Quando chegar a hora (verificado periodicamente):
   - Cria notificação in-app para profissional e paciente
   - Marca flag correspondente (`reminder_sent_30min`, etc.)
4. Usuários veem notificações na caixa de mensagens

---

## 📝 Próximos Passos

### Pendências:

1. **Integração Email/WhatsApp**
   - Adicionar envio de email nos lembretes
   - Integrar WhatsApp Business API (opcional)

2. **Botões nos Dashboards**
   - Adicionar botão "Solicitar Videochamada" no `PatientDashboard`
   - Adicionar botão "Agendar Videochamada" no `RicardoValencaDashboard` e `EduardoFaveretDashboard`

3. **Cron Job para Lembretes**
   - Implementar verificação periódica (pg_cron ou serviço externo)
   - Atualmente, lembretes são enviados apenas quando a Edge Function é chamada

4. **Integração com VideoCall**
   - Ao iniciar videochamada, atualizar status do agendamento para 'completed'
   - Vincular `session_id` ao agendamento

---

## ✅ Status

- [x] Tabela `video_call_schedules` criada
- [x] Componente `VideoCallScheduler` criado
- [x] `NotificationCenter` atualizado
- [x] Sidebar atualizado com caixa de mensagens
- [x] Edge Function `video-call-reminders` criada
- [x] Tipo de notificação `video_call_scheduled` adicionado
- [ ] Botões nos dashboards (pendente)
- [ ] Integração email/WhatsApp (pendente)
- [ ] Cron job para lembretes (pendente)

---

## 🧪 Como Testar

1. **Executar SQL:**
   ```sql
   -- Executar no Supabase SQL Editor
   \i database/scripts/CREATE_VIDEO_CALL_SCHEDULES.sql
   ```

2. **Deploy Edge Function:**
   ```bash
   supabase functions deploy video-call-reminders
   ```

3. **Testar Agendamento:**
   - Login como profissional
   - Selecionar paciente
   - Abrir `VideoCallScheduler`
   - Agendar videochamada
   - Verificar notificação no paciente

4. **Testar Solicitação:**
   - Login como paciente
   - Abrir `VideoCallScheduler`
   - Solicitar videochamada
   - Verificar notificação no profissional

---

**Implementado por:** Auto (AI Assistant)  
**Data:** 06/02/2026
