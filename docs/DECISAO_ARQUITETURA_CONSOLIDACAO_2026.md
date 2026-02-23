# Decisão de arquitetura — Consolidação 2026

**Tipo:** Documento de decisão selada (arquiteto de produto + sistema)  
**Data:** 05/02/2026  
**Escopo:** Caminho correto para prosseguir sem quebrar o que funciona e sem aumentar entropia.  
**Princípio-mestre:** Não redesenhar. Consolidar. Selar.

---

## ⛔ Proteção absoluta: Core e trigger

- **Core (tradevision-core):** a lógica foi difícil de montar. Não refatorar, não fragmentar, não “limpar” por conta da consolidação. Toda mudança deste ciclo é **só no front** (rotas na UI, Sidebar, docs). O Core já devolve paths canônicos; nós só alinhamos o app a eles.
- **Trigger é a fonte de verdade.** Contratos de trigger e `app_commands` ficam intocados. Nenhuma decisão de rotas altera o comportamento do Core.
- **Admin:** pode continuar vendo e usando rotas em construção. A canonização não bloqueia visibilidade nem uso por admin; rotas ainda em criação seguem acessíveis.

---

## 1. Leitura honesta do projeto (o que ele é de verdade)

O MedCannLab **não é:**

- Um simples app médico  
- Um chat com IA  
- Um LMS comum  
- Um SaaS tradicional CRUD  

O MedCannLab **é:**

- **Uma plataforma cognitiva orientada a decisão**, com três eixos (Clínica, Ensino, Pesquisa) orquestrados por um Core de governança.

**O que diferencia:**

- IA não manda → ela **propõe**.  
- Ação só ocorre via **sistema** (UI, Edge, RPC).  
- Regras clínicas, éticas e operacionais **antecedem** o GPT.  
- O sistema tem **memória institucional**, não só estado de usuário.

Isso coloca o projeto num nível acima da maioria dos apps “AI-first” atuais.

---

## 2. Arquitetura atual — diagnóstico claro

### Pontos estruturalmente sólidos (manter e proteger)

| Pilar | Regra |
|-------|--------|
| **Core + COS** | Concentrar toda cognição ativa em uma Edge Function (tradevision-core). COS antes do GPT (kill switch, trauma, metabolismo). Append-only + selamento = governança real. **Nunca fragmentar em múltiplas functions “por conveniência”.** |
| **Separação “fala ≠ ação”** | GPT não executa. UI interpreta `app_commands`. Allow-list por perfil. Modelo escala, audita e protege juridicamente. |
| **Arquitetura por eixos** | Clínica / Ensino / Pesquisa: correto conceitualmente; permite expansão sem reescrever; combina com RBAC + RLS. O problema não é o conceito, é a **implementação histórica das rotas** (já diagnosticada). |

### Onde o sistema está “bom, mas perigoso”

| Área | Risco | Efeito |
|------|--------|--------|
| **Rotas** | Entropia acumulada: canônicas + legadas + Sidebar legado + docs canônicos + Core canônico. | Não quebra o app; quebra **suporte, onboarding, treinamento, analytics** e clareza da equipe. É **dívida cognitiva**, não bug. |
| **Telas mock vs reais** | Ex.: agenda do paciente (uma tela mock, uma real). | Mesmo “escondido”, mina confiança interna, cria ambiguidade de verdade e abre decisões erradas depois. |
| **Admin como exceção implícita** | Admin tem dashboard próprio mas em `userTypes` ainda herda lógica de profissional. | Cheiro arquitetural: “funciona até alguém reutilizar sem saber.” |

---

## 3. Visão para prosseguir (sem refatoração traumática)

- **Não redesenhar.**  
- **Consolidar.**  
- **Selar.**  
- Nada de “refatorar tudo”; o sistema já é grande demais para isso.

---

## 4. Direções claras de evolução (práticas)

| # | Direção | Ação |
|---|---------|------|
| **1** | **Canonização oficial de rotas** | Artefato único: *DECISÃO SELADA — ROTAS CANÔNICAS v1*. Regras: `/app/eixo/tipo/acao` = verdade; rotas legadas = apenas `<Navigate replace />`; Sidebar, Core, docs → só canônico. Reduz entropia sem quebrar nada. |
| **2** | **Remover “realidades paralelas”** | Uma tela de agendamentos do paciente = única verdade; a outra vira redirect ou é removida. Mesma lógica para chats/dashboards duplicados. |
| **3** | **Selar o papel do Admin** | Admin não é profissional/paciente/aluno; é **operador sistêmico**. Default route = `/app/admin`; lógica explícita; sem herança implícita em `userTypes`. |
| **4** | **Evoluir a NOA sem inflar UI** | NOA mais orquestradora, menos “falante”; mais comandos, menos texto. Abrir fluxo, montar contexto, guiar decisão — não “explicar demais”. Alinhado a regra &lt;10 palavras e triggers claros. |
| **5** | **Documentação como contrato** | Documentação vira **referência viva** e **base de decisão**, não apenas histórico. Tudo que for decidido: ou entra no documento selado, ou não entra no sistema. |

---

## 5. Conclusão

- O projeto já passou do estágio experimental; está em **fase de consolidação e profissionalização**.  
- O maior risco não é técnico; é **entropia conceitual silenciosa**.  
- Os pontos de entropia já estão identificados (rotas, telas duplicadas, Admin implícito).  
- **Princípio:** O projeto tem alma arquitetural; o próximo ciclo é **protegê-la enquanto cresce**.

---

**Próximos artefatos (já criados):**  
- **Decisão selada de rotas:** `DECISAO_SELADA_ROTAS_CANONICAS_V1.md` — contrato único para rotas canônicas, redirects e única verdade (agenda paciente, Admin).  
- **Roadmap 90 dias:** `ROADMAP_CONSOLIDACAO_90_DIAS.md` — fases 1–4 (selagem, uma verdade por tela, legadas como redirects, doc como contrato) sem refatoração agressiva.

**Referências:**  
- Auditoria técnica e rotas: `AUDITORIA_USABILIDADE_ROTAS_E_FLUXOS.md`  
- Invariantes e modelo de execução: `INVARIANTE_MODELO_EXECUCAO_NOA.md`  
- Evoluções append-only: `EVOLUCOES_PARA_MELHOR.md`
