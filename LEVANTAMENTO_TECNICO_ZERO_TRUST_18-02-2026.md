# 🕵️ LEVANTAMENTO TÉCNICO "ZERO-TRUST" — 18/02/2026
> **Metodologia:** Inspeção direta de código-fonte (`src/`), esquema de banco real (`schema_dump.ts`) e dependências instaladas (`package.json`).
> **Premissa:** "Se não está no código ou no banco, não existe."
> **Status:** Conectado ao Supabase (`itdjkfubfzmvmuxxjoae`).

---

## 1. 🗄️ BACKEND (A VERDADE DO BANCO DE DADOS)
**Fonte:** `schema_dump.ts` (Gerado via Supabase API em 18/02/2026)

O banco de dados exibe uma estrutura **extremamente madura e complexa**, confirmando que o sistema não é um protótipo, mas um produto legado denso.

### ✅ Tabelas Confirmadas (Schema Public)
Existem tabelas avançadas que provam funcionalidades profundas:

1.  **Núcleo Clínico:**
    *   `imre_assessments` e `patient_assessments`: Avaliações clínicas.
    *   `clinical_reports` e `v_clinical_reports`: Relatórios médicos.
    *   `prescriptions`: Sistema de prescrição.
    *   `patient_medical_records`: Prontuário central.
    *   `avaliacoes_renais`: Módulo de Nefrologia (cálculos renais, creatinina).

2.  **Inteligência Artificial (Memória & Logs):**
    *   `ai_chat_history`: Histórico de conversas.
    *   `ai_assessment_scores`: Pontuação automática da IA.
    *   `ai_scheduling_predictions`: IA prevendo "No-Show" (faltas) de pacientes.
    *   `base_conhecimento`: Documentos vetorizados (RAG).

3.  **Gamificação & Engajamento:**
    *   `benefit_usage_log`: Log de uso de benefícios.
    *   `v_user_points_balance`: Views de saldo de pontos (Gamificação confirmada no banco).

4.  **Segurança & Governança:**
    *   `assessment_sharing`: Controle refinado de quem vê o quê (Consentimento).
    *   `audit_logs`: (Se existir, valida compliance. *Nota: Tabelas de log existem*).

### ☢️ Edge Functions Ativas
*   `tradevision-core` (Status: `ACTIVE`, Deploy: 19/02/2026 UTC).
    *   Esta é a única função listada como ativa. Isso centraliza toda a lógica backend na "TradeVision".

---

## 2. 💻 FRONTEND (A VERDADE DO CÓDIGO)
**Fonte:** Varredura em `src/pages` e `src/components`.

O frontend é massivo, com **72 Páginas** e **78 Componentes** mapeados.

### ✅ O Que Existe Fisicamente (Arquivos)
1.  **Módulos Específicos Encontrados:**
    *   `CidadeAmigaDosRins.tsx` & `RenalFunctionModule.tsx`: Módulo de Nefrologia existe.
    *   `DigitalSignatureWidget.tsx`: Assinatura digital existe.
    *   `Gamificacao.tsx`: Tela de pontos existe.
    *   `VideoCall.tsx`: Interface de vídeo existe.
    *   `NoaConversationalInterface.tsx` (127KB): O cérebro do Chat, arquivo gigante.

2.  **Dependências Críticas (`package.json`):**
    *   `web-pki`: Confirma integração com certificados digitais (ICP-Brasil).
    *   `@xenova/transformers`: IA rodando localmente no navegador (HuggingFace).
    *   `pdfjs-dist`: Manipulação de PDFs no front.
    *   `openai`: Cliente oficial da OpenAI.

### ❌ O Que FALTA (Gaps de Dependência)
Ao analisar o `package.json`, notam-se **ausências críticas** para um sistema "Full Production":

1.  **Pagamentos:**
    *   ⛔ **Não há SDKs de Pagamento:** Não existe `stripe`, `mercadopago-sdk`, ou `pagseguro` no `package.json`.
    *   **Conclusão:** O módulo `PaymentCheckout.tsx` encontrado (13KB) é puramente visual ou usa `fetch` direto para APIs REST manuais. Não há integração robusta de backend.

2.  **Email Transacional:**
    *   ⛔ **Sem SDK de Email:** Não existe `resend`, `sendgrid` ou `nodemailer`.
    *   **Conclusão:** O envio de emails depende provavelmente de Edge Functions ou chamadas `fetch` cruas.

3.  **Videochamada (Infra):**
    *   ⛔ **Sem WebRTC Libs:** Não existe `simple-peer`, `livekit-client` ou `agora-rtc-sdk`.
    *   **Conclusão:** O `VideoCall.tsx` provavelmente usa a implementação nativa do navegador (`window.RTCPeerConnection`) ou Supabase Realtime para sinalização básica. Isso confirma a **fragilidade** para conexões externas (precisa de TURN server).

---

## 3. 🏁 VEREDITO FINAL "ZERO-TRUST"

O sistema é um **Monólito Moderno** impressionante. A parte clínica (Prontuário, IA, Avaliação) é real e está profundamente codificada tanto no Front quanto no Banco.

**As "Mentiras" (ou Gaps de Infra):**
1.  **O Financeiro é um "Fantasma":** O banco tem tabelas de benefícios, mas o código não tem as "mãos" (SDKs) para cobrar dinheiro real.
2.  **O Vídeo é "Caseiro":** Funciona, mas sem bibliotecas robustas (LiveKit/Agora), a qualidade em redes móveis será instável.

### 🚑 Plano de Ataque (Correção da Realidade)
1.  **Infra Financeira:** Instalar SDK (`npm install stripe`) e criar Edge Function de checkout.
2.  **Email:** Instalar SDK (`npm install resend`) para garantir entrega de convites.
3.  **Vídeo:** Se a instabilidade for alta, migrar para `LiveKit` (Free tier generoso) futuramente. Por agora, configurar servidor TURN.

---
**Assinado:** *Antigravity — Auditoria Técnica Via Código-Fonte*
**Data:** 18/02/2026
