# PLANO DE MIGRAÇÃO E POTENCIALIZAÇÃO: TRADEVISION & MEDCANNLAB

Este documento responde às dúvidas estratégicas sobre a arquitetura da IA, persistência de dados e o futuro "selado" do sistema.

## 1. A IA JÁ Salva Contextos? (Status Atual)

**RESPOSTA: SIM.**
O código atual (`NoaResidentAI.ts`) já está integrado ao Supabase.

*   **O que ela faz HOJE:**
    *   Cada pergunta e resposta é gravada na tabela `patient_medical_records`.
    *   Ela salva o **contexto clínico** (passo da avaliação, dados do paciente).
    *   Ela consulta o histórico recente para manter a conversa fluida.

*   **O que ela AINDA NÃO faz (O "Pulo do Gato"):**
    *   **Limpeza Automática (Garbage Collection):** Ela grava *tudo*. Não há um robô que passa "limpando" conversas inúteis (ex: "bom dia") e deixando apenas o sumo médico. Isso será a função do **ACDSS** (Governance Engine).

---

## 2. A Visão Poderosa (Integração Total)

Você perguntou se "são coisas separadas". **Não**. Elas são órgãos do mesmo corpo:

1.  **O Cérebro (TradeVision/AI):** Processa a conversa, entende o problema e sugere soluções.
2.  **A Memória (Supabase):** Guarda o que foi decidido nas tabelas.
3.  **O Auditor (ACDSS - Dashboard):** Olha para a Memória e diz: *"O Dr. Pedro está prescrevendo muito CBD isolado, talvez fosse bom sugerir Full Spectrum na próxima interação."*

**Onde está o Poder?**
O poder surge quando o **ACDSS** (que hoje está vazio/placeholder) for ligado para ler os dados que a **IA** já está salvando.
*   **Exemplo:** A IA atende 10 pacientes com você. O ACDSS analisa e te mostra: *"Sua taxa de sucesso em dor crônica aumentou 20% quando a IA sugeriu a dosagem X."*

---

## 3. Roteiro para "Selar" (Produção Real)

Hoje, a IA depende do arquivo `proxy-server.js` rodando no seu computador pessoal.

**Para tornar o sistema um produto independente (SaaS):**

### Passo 1: Migração para Edge Functions (O "Cérebro na Nuvem")
*   Pegar a lógica do `proxy-server.js`.
*   Colocar dentro do Supabase (Edge Functions).
*   **Benefício:** A IA funciona 24/7, desvinculada do seu notebook.

### Passo 2: Ativar o ACDSS (O "Auditor")
*   Criar as queries SQL que preenchem o Dashboard Admin.
*   Conectar o Dashboard à tabela `patient_medical_records`.

### Passo 3: Limpeza Inteligente
*   Criar um script (Database CRON Job) que roda toda noite:
    *   *Lê:* Histórico bruto.
    *   *Resume:* Transforma em fatos clínicos.
    *   *Apaga:* O texto bruto para economizar espaço e manter apenas o essencial.

---

## 4. Conclusão

A arquitetura está correta. O "corpo" (código) já tem os órgãos (IA + Banco) conectados. O próximo passo é dar "autonomia" (Nuvem) e "consciência" (ACDSS lendo os dados).
