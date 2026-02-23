# Governança de UUID na IA — Fechando o “i”

**Data:** 09/02/2026  
**Pergunta:** No nosso sistema, a IA tem UUID que pode ser confundido?

**Resposta direta:** A IA em si não “se confunde”; o **sistema** pode induzir confusão de UUID se não separarmos claramente **três domínios de identidade**. Hoje existe risco **semântico** se UUIDs clínicos vazarem para o contexto textual da IA. Com **uma camada de sanitização** antes do RAG, o nível fica adequado para uso clínico sério.

---

## 1. Os 3 tipos de UUID no sistema

| Tipo | Origem | O que é | Uso | Na IA? |
|------|--------|---------|-----|--------|
| **Identidade (Auth)** | auth.users.id | Quem a pessoa é no sistema | Login, JWT, RLS, permissões | Nunca como UUID cru no contexto semântico |
| **Domínio clínico** | public.users.id | Ator clínico (paciente, profissional, admin) | Prontuário, chat, prescrições, vínculos | Pode aparecer indiretamente em relatórios; não deve ir “cru” para a IA |
| **Artefato / conteúdo** | documents.id, clinical_reports.id, etc. | Objetos que a IA lê, resume, correlaciona | RAG, embeddings, análise | Único UUID que a IA trata como objeto primário |

---

## 2. Onde está o risco real

O risco **não** é técnico no modelo de IA; é **semântico e de pipeline**.

**Cenário perigoso (possível hoje):** Um `clinical_report` ou outro texto contém referências como `patient_id: 07d79a5a-...`. Esse texto entra em RAG, embedding ou análise de contexto. A IA não sabe se esse UUID é paciente, profissional, auth user ou artefato. Pode repetir, correlacionar ou responder como se fosse identificador “significativo”. Isso não vaza dado obrigatoriamente, mas **quebra governança semântica** (identificador de pessoa tratado como dado interpretável).

---

## 3. O que já está certo

- Prontuário **não** entra no RAG (Base de Conhecimento só documentos da biblioteca).
- IA **não** escreve direto em tabelas clínicas como fonte primária.
- IA atua sobre documentos intermediários e conhecimento institucional.

Isso elimina a maior parte do risco.

---

## 4. O que falta para “fechar o i”

**Regra de ouro (recomendada):** UUID de **pessoa** nunca deve aparecer como UUID “cru” em contexto de IA.

Em vez disso:

- Usar **aliases** (ex.: PACIENTE_X, PROF_01), ou
- **Hashes não reversíveis**, ou
- **Remover** IDs de pessoa do texto antes de enviar para a IA.

**Estratégia simples (sem refatoração pesada):**

1. **Sanitização de contexto antes do RAG**  
   Antes de enviar texto para a IA: remover padrões UUID (`[0-9a-fA-F-]{36}`) ou mapear para tokens neutros (ex.: `[ID_PACIENTE]`, `[ID_PROFISSIONAL]`).

2. **Contrato explícito no prompt/system**  
   Exemplo: *“Identificadores técnicos (IDs) no contexto não representam pessoas reais; não os use para inferir ou correlacionar identidade.”*

3. **Proibição explícita**  
   A IA nunca deve: inferir identidade a partir de UUID; correlacionar UUIDs entre respostas; repetir UUIDs de pessoa em saída legível.

---

## 5. Resposta honesta final

| Afirmação | Status |
|-----------|--------|
| Hoje há bug crítico de UUID na IA? | Não |
| Existe risco semântico se UUIDs clínicos vazarem para contexto textual? | Sim |
| Com 1 camada de sanitização antes do RAG, nível adequado? | Sim (nível hospitalar sério) |

**Em uma frase:** UUID no sistema é seguro no banco; precisa ser tratado como **“lixo semântico”** (remover ou neutralizar) antes de chegar na IA.

---

## 6. Ações recomendadas (checklist)

- [ ] **Sanitização:** Antes de injetar texto em RAG/contexto da IA, remover ou substituir padrões UUID de pessoa por token neutro.
- [ ] **Prompt/system:** Incluir cláusula de que identificadores técnicos não representam pessoas reais e não devem ser usados para inferir identidade.
- [ ] **Revisão de fontes:** Garantir que relatórios ou documentos que entram no RAG não exponham `patient_id`/`professional_id` em texto livre quando não for estritamente necessário (ou usar alias/hash).
- [ ] **Documentação:** Manter este doc (GOVERNANCA_UUID_IA) como referência para evoluções do pipeline de IA.
