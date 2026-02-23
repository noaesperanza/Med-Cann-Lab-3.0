# TRADEVISION CORE V2 — DOCUMENTO MASTER

## 1. Visão Geral

O **TradeVision Core V2** é o motor central de inteligência clínica e educacional da plataforma MedCannLab. Ele foi concebido como um **sistema operacional clínico**, responsável por conduzir entrevistas clínicas estruturadas, simulações educacionais para alunos, auditoria de interações com IA e geração segura de relatórios clínicos.

O sistema foi desenhado desde o início com foco em:

* Segurança clínica
* Auditoria e rastreabilidade
* Separação clara de responsabilidades
* Escalabilidade institucional
* Conformidade regulatória (LGPD / boas práticas em saúde)

---

## 2. Objetivos do Sistema

### 2.1 Objetivos Clínicos

* Conduzir entrevistas clínicas iniciais seguindo protocolo estruturado (AEC 001 – Arte da Entrevista Clínica)
* Garantir que a IA **não diagnostique** nem antecipe condutas médicas
* Registrar interações para auditoria e revisão profissional
* Gerar relatórios clínicos apenas ao final do fluxo, de forma controlada

### 2.2 Objetivos Educacionais

* Simular pacientes realistas para treinamento de estudantes
* Adaptar o comportamento da IA conforme o modo (Clínico vs Ensino)
* Permitir nivelamento, provas práticas e simulações

### 2.3 Objetivos Técnicos

* Centralizar lógica crítica em Edge Functions
* Evitar dependência de decisões do frontend
* Garantir persistência segura no banco de dados
* Manter separação entre dados clínicos, educacionais e administrativos

---

## 3. Arquitetura Geral

### 3.1 Componentes Principais

* **Frontend (React / Next / etc.)**

  * Interface conversacional
  * Controle de estado visual
  * Envio de mensagens e ações

* **Edge Function (TradeVision Core)**

  * Motor de decisão
  * Seleção de persona da IA
  * Controle de fluxo clínico
  * Persistência de dados

* **OpenAI API**

  * Geração de respostas conversacionais
  * Extração estruturada de dados (quando aplicável)

* **Supabase**

  * Autenticação
  * Banco de dados
  * Auditoria

---

## 4. Modos de Operação

### 4.1 Modo Clínico

Ativado quando o `intent` do usuário é clínico ou administrativo.

Características:

* IA assume persona **Nôa Esperança**, IA Residente
* Segue rigorosamente o protocolo clínico AEC 001
* Uma pergunta por vez
* Linguagem empática e não técnica
* Sem diagnósticos ou interpretações clínicas

### 4.2 Modo Ensino / Simulação

Ativado quando o `intent` indica:

* TESTE_NIVELAMENTO
* EDUCACIONAL
* SIMULACAO_ALUNO

Ou por gatilho semântico no texto (ex: “simulação”, “prova”).

Características:

* IA interpreta um **paciente simulado**
* Não guia a consulta
* Reage apenas às perguntas do aluno
* Mantém postura resiliente e educativa

---

## 5. Protocolo Clínico (AEC 001)

O fluxo clínico é composto por **10 etapas obrigatórias**, executadas em ordem fixa:

1. Abertura
2. Lista Indiciária
3. Queixa Principal
4. Desenvolvimento da Queixa
5. História Pregressa
6. História Familiar
7. Hábitos de Vida
8. Perguntas Finais
9. Fechamento Consensual
10. Encerramento

Ao final da etapa 10, a IA inclui a tag:

```
[ASSESSMENT_COMPLETED]
```

Essa tag **não grava nada automaticamente**, servindo apenas como marcador semântico.

---

## 6. Controle de Fluxo e Finalização

### 6.1 Princípio Fundamental

> **A IA nunca finaliza nem grava relatórios sozinha.**

A finalização ocorre apenas quando o frontend envia explicitamente:

```json
{
  "action": "finalize_assessment"
}
```

### 6.2 Handler de Finalização (Server-Side)

Ao receber `action: finalize_assessment`, o sistema:

1. Valida os dados recebidos
2. Busca dados do paciente via Supabase Admin
3. Insere o relatório clínico na tabela `clinical_reports`
4. Insere scores (se existirem)
5. Retorna confirmação ao frontend

Esse fluxo **bypassa RLS** usando `SUPABASE_SERVICE_ROLE_KEY`.

---

## 7. Persistência e Auditoria

### 7.1 Registro de Interações

Cada interação é salva na tabela `ai_chat_interactions`, contendo:

* Mensagem do usuário
* Resposta da IA
* Intenção detectada
* Metadados (modelo, tokens, modo, simbologia)

### 7.2 Simbologia de Escuta

* 🔴 Escuta Clínica
* 🔵 Escuta Institucional
* 🎭 Simulação de Paciente

Essa simbologia é usada para auditoria, pesquisa e rastreabilidade.

---

## 8. Papel da IA no Sistema

A IA **não é médica**, **não é paciente** e **não é usuária comum**.

Ela atua como:

* **Ator sistêmico institucional**
* Facilitadora de escuta estruturada
* Instrumento de apoio ao profissional humano

Campo `generated_by` nos relatórios identifica explicitamente quando o conteúdo foi gerado pela IA.

---

## 9. Segurança e Conformidade

Medidas adotadas:

* Nenhum diagnóstico automático
* Nenhuma conduta terapêutica
* Logs completos
* Separação de papéis
* Finalização manual e explícita

O sistema foi desenhado para facilitar conformidade com LGPD e boas práticas em saúde digital.

---

## 10. Estado Atual do Projeto

Status: **Produção Funcional (V2)**

Características:

* Arquitetura estável
* Fluxo clínico controlado
* Simulação educacional integrada
* Auditoria ativa
* **Schema Hardening:** Implementado (UUIDs, Constraints Semânticas, Identidade Apartada).

---

## 11. Conclusão

O TradeVision Core V2 representa a consolidação de um motor clínico-digital maduro, projetado para operar com segurança, clareza e responsabilidade institucional.

---

## 12. Registo de Decisões Arquiteturais (ADR)

> ⚠️ **IMPORTANTE:** A integridade referencial de `ai_assessment_scores` foi relaxada para permitir simulação e ensino. Essa tabela não deve ser usada para decisões clínicas nem auditoria regulatória. Os dados aqui contidos são de natureza educacional e analítica interna.
