# Triggers e palavras que geram ações

Referência do que o usuário pode **dizer** para disparar ações (navegação, documento no chat, agendamento, etc.). O Core usa **contexto da frase** (incluindo frases longas) e o GPT emite a tag correspondente; fallback por palavra-chave quando o GPT não emite.

---

## 1. Como funciona

- **Fala do usuário** → GPT decide → **GPT emite trigger semântico** → Core governa → **app_commands** gerados a partir do trigger.
- Frases longas: o GPT recebe a mensagem inteira e deve identificar a intenção principal; mesmo que a frase seja longa, emite a tag correta.
- **Documento**: usuário pode dizer "abrir documento X", "ver o protocolo de cannabis", "quero ler o manual" → lista ou **abertura direta no chat** quando há um único resultado.

---

## 2. Palavras/frases que disparam ações (por domínio)

### Agendamento

| O usuário pode dizer (exemplos) | Trigger | Ação |
|---------------------------------|--------|------|
| quero agendar, marcar consulta, ver horários, horários disponíveis, disponibilidade do Dr. Ricardo, quero ver horários disponíveis para agendar | `[TRIGGER_SCHEDULING]` | Widget de agendamento no chat |

### Navegação (profissional)

| O usuário pode dizer | Trigger | Ação |
|----------------------|--------|------|
| terminal de atendimento, abrir atendimento, área de atendimento, me leve ao terminal | `[NAVIGATE_TERMINAL]` | Ir para atendimento |
| abrir agenda, minha agenda, agenda clínica, ver agenda, área de agendamento | `[NAVIGATE_AGENDA]` | Ir para agenda |
| pacientes, abrir pacientes, lista de pacientes, gestão de pacientes | `[NAVIGATE_PACIENTES]` | Ir para pacientes |
| relatórios, relatório clínico, abrir relatórios | `[NAVIGATE_RELATORIOS]` | Ir para relatórios |
| chat profissionais, abrir chat profissionais, suporte profissional | `[NAVIGATE_CHAT_PRO]` | Ir para chat profissionais |
| prescrever, nova prescrição, prescrição rápida | `[NAVIGATE_PRESCRICAO]` | Ir para prescrição |
| biblioteca, abrir biblioteca, base de conhecimento, acessar biblioteca | `[NAVIGATE_BIBLIOTECA]` | Ir para biblioteca |
| função renal, abrir função renal | `[NAVIGATE_FUNCAO_RENAL]` | Ir para função renal |

### Navegação (paciente)

| O usuário pode dizer | Trigger | Ação |
|----------------------|--------|------|
| meus agendamentos, minhas consultas, consultas agendadas, ver agendamentos | `[NAVIGATE_MEUS_AGENDAMENTOS]` | Ir para meus agendamentos |
| ver como paciente, módulo paciente, dashboard paciente | `[NAVIGATE_MODULO_PACIENTE]` | Módulo paciente |

### Documentos (lista ou abrir no chat)

| O usuário pode dizer | Trigger | Ação |
|----------------------|--------|------|
| quais documentos, listar documentos, que documentos você vê, me mostre os documentos, que documentos tem, tem algum documento | `[DOCUMENT_LIST]` | Lista no chat + pending; usuário diz "1" para abrir |
| abrir documento [nome/tema], ver documento X, mostrar o protocolo, ler o manual, consultar diretriz, quero ver o documento de cannabis, abrir documento tal | `[DOCUMENT_LIST]` | Busca; se **1 resultado** → abre **direto no chat**; senão lista → usuário escolhe "1" → abre no chat |

O **documento sempre abre no chat** (show-document-inline); o usuário lê no próprio chat.

### Outros (profissional)

| O usuário pode dizer | Trigger | Ação |
|----------------------|--------|------|
| mostrar prescrição, ver prescrição, mostrar protocolo | `[SHOW_PRESCRIPTION]` | Mostrar prescrição (no dashboard) |
| pacientes ativos, filtrar pacientes ativos, listar pacientes ativos | `[FILTER_PATIENTS_ACTIVE]` | Filtrar pacientes ativos |

### Avaliação clínica

| O usuário pode dizer | Trigger | Ação |
|----------------------|--------|------|
| (conclusão do passo 10 da AEC pelo GPT) | `[ASSESSMENT_COMPLETED]` | Card "Avaliação Concluída" + relatório |

---

## 3. O que falta (triggers / interações)

| Pedido do usuário | Status | O que falta |
|-------------------|--------|-------------|
| **Abrir avaliação clínica do paciente [nome]** | Falta | Trigger tipo `[OPEN_CLINICAL_REPORT]` ou buscar em `clinical_reports` por paciente e devolver `show-report-inline` (ou reutilizar show-document-inline com payload de relatório). Requer: Core consultar `clinical_reports`, comando no front para abrir relatório no chat. |
| Abrir documento por nome exato em frase longa | OK | GPT emite `[DOCUMENT_LIST]`; Core usa a mensagem como termo de busca; 1 resultado → abre no chat. |
| Frase longa com intenção de documento/agenda/navegação | OK | Prompt instrui o GPT a usar o contexto da frase inteira e emitir a tag correspondente. |

---

## 4. Resumo por perfil

- **Paciente**: agendamento, avaliação clínica, meus agendamentos, biblioteca, lista de documentos, **abrir documento no chat**.
- **Aluno**: ensino/simulação, biblioteca, documentos, **abrir documento no chat**.
- **Profissional**: tudo acima + terminal, agenda, pacientes, relatórios, chat pro, prescrição, função renal, prescrição/filtro pacientes.
- **Admin**: todos os comandos.

Cada trigger é filtrado por perfil no Core (`filterAppCommandsByRole`); o usuário só recebe comandos que pode executar.
