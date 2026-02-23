# 🧠 MODELO REAL — CHAT COMO HUB (COM TRIGGER INVISÍVEL)

Sem abstração extra. Sem teoria. Só o fluxo real.

---

## AXIOMA INSTITUCIONAL (SELADO)

**Se não for assim, não existe app.**

O aplicativo **é** este modelo: usuário fala → chat envia ao Core → GPT responde com texto + trigger invisível → Core governa por perfil → front remove o trigger da tala e executa a ação. O trigger é contrato; a ação só existe por causa dele. Sem esse fluxo, não há aplicativo.

---

## Fluxo (do usuário ao que ele vê)

```
┌──────────────────────────┐
│          USUÁRIO         │
└────────────┬─────────────┘
             │
             │  "abre o terminal pra mim"
             │
             ▼
┌──────────────────────────┐
│        CHAT (UI)         │
│  - captura mensagem      │
│  - envia pro Core        │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│          CORE            │
│ (tradevision-core)       │
│                          │
│ - monta contexto         │
│ - envia prompt ao GPT    │
│ - NÃO decide UI          │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│           GPT            │
│  DECISÃO SEMÂNTICA       │
│                          │
│ Texto humano:            │
│ "Claro. Vou abrir o      │
│ terminal para você."     │
│                          │
│ Trigger (invisível):     │
│ [OPEN_TERMINAL]          │
│ scope=trading            │
│ mode=read_only           │
│ [/OPEN_TERMINAL]         │
└────────────┬─────────────┘
             │
             │  (texto + trigger)
             ▼
┌──────────────────────────┐
│          CORE            │
│  GOVERNANÇA POR PERFIL   │
│                          │
│ - usuário = profissional │
│ - terminal permitido     │
│ - mantém trigger         │
│                          │
│ (se não pudesse:         │
│  trocaria por EVENT_DENY)│
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│      FRONTEND (noa)      │
│                          │
│ 1. Recebe resposta       │
│ 2. REMOVE o trigger do   │
│    texto exibido         │
│ 3. Converte trigger em   │
│    metadata.events[]     │
│    (ou app_commands)     │
│                          │
│ events:                  │
│ - type: OPEN_TERMINAL    │
│   scope: trading         │
│   mode: read_only        │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│      EVENT DISPATCHER    │
│                          │
│ - abre terminal          │
│ - seta modo read_only    │
│ - loga evento            │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│        CHAT (UI)         │
│  O USUÁRIO VÊ:           │
│                          │
│ "Claro. Vou abrir o      │
│ terminal para você."     │
│                          │
│ + CARD:                  │
│ 🖥️ Terminal aberto       │
│ (modo leitura)           │
└──────────────────────────┘
```

---

## 🔥 O PONTO MAIS IMPORTANTE (SELADO)

- **O usuário NUNCA vê o trigger** (a tag ou o bloco estruturado).
- **Todo o sistema respeita o trigger como verdade absoluta.**
- **O texto é conversa. O trigger é contrato. A ação só existe por causa dele.**

---

## VERDADE ABSOLUTA: quem gera o trigger?

- **SIM:** é o usuário que resolve encerrar, pedir horários, abrir agenda, etc. — ele dá os **sinais humanos**.
- **MAS:** o trigger **não nasce do usuário**.

O que acontece de verdade:

1. O usuário **expressa intenção** (“ok”, “finalizar”, “quero ver horários”, “abre a agenda”, “quais documentos”, etc.).
2. O **GPT interpreta semanticamente** que a intenção corresponde a um ciclo/ação.
3. O **GPT decide**: “o processo acabou” / “é agendamento” / “é navegação para agenda” / “é lista de documentos”.
4. O **GPT emite** a tag (`[ASSESSMENT_COMPLETED]`, `[TRIGGER_SCHEDULING]`, `[NAVIGATE_AGENDA]`, `[DOCUMENT_LIST]`, etc.).

- **O usuário nunca gera trigger.** Ele só fornece sinais humanos.
- **O trigger é um ato cognitivo do GPT.**

### Por que isso é o padrão-ouro

Separação de responsabilidades:

| Camada   | Papel |
|----------|--------|
| **Usuário** | Linguagem humana, ambígua (sinais). |
| **GPT**     | Cognição + decisão semântica (emite o trigger). |
| **Core**    | Governança + materialização (converte trigger em app_commands/metadata; não infere da fala). |
| **Front**   | Execução visual (remove tag da tela, executa ação). |

**Avaliação clínica** e **agendamento** são os dois modelos selados. **Todo o resto** (abrir abas, terminal, navegação, documentos) usa **exatamente a mesma lógica**. Não tem mistério: o que muda é só o **nome do trigger** e as **palavras-chave** no prompt. Um fluxo, vários triggers.

---

## 🧩 Comparação direta (pra fixar)

| Feature            | Trigger (conceito)     |
|--------------------|------------------------|
| Avaliação clínica  | `[ASSESSMENT_COMPLETED]` |
| Agendamento       | `[TRIGGER_SCHEDULING]`   |
| Terminal          | `[OPEN_TERMINAL]` / comando navegação |
| Documento         | `[DOCUMENT_OPEN]` / comando abrir doc |
| Navegação         | `[NAVIGATE]` / comando rota/seção |

➡️ **Mesmo desenho. Mesmo fluxo. Mesma regra.**

---

## Mapeamento no código atual (MedCannLab / Nôa)

No sistema hoje, o **mesmo modelo** aparece assim:

| Feature            | Onde está o “trigger” invisível | O que o usuário vê |
|--------------------|----------------------------------|---------------------|
| **Avaliação clínica** | Tag **`[ASSESSMENT_COMPLETED]`** no texto do GPT → front remove e vira card. | Texto da Nôa + card “Avaliação Concluída”. |
| **Agendamento**       | Tag **`[TRIGGER_SCHEDULING]`** no texto ou **`metadata.trigger_scheduling`** → front remove tag e mostra widget. | Texto da Nôa + calendário no chat. |
| **Terminal / Navegação / Documento** | **`app_commands`** (Core deriva da fala, filtra por perfil) → front não exibe; executa como evento. Opcional **`[TRIGGER_ACTION]`** no texto (só sinal de “tem ação”; front remove). | Texto da Nôa + navegação ou modal/aba (sem o usuário ver o comando). |

Ou seja: às vezes o “trigger” é **tag no texto** (avaliação, agendamento); às vezes é **app_commands** (terminal, documento, navegação). Em ambos os casos: **trigger invisível → governança no Core → front só mostra texto e executa a ação.** O desenho do documento acima é o modelo real; a tabela é como ele se materializa no código.

**Checklist de conformidade do Core:** `docs/CORE_EM_ACORDO_COM_O_MODELO.md`
