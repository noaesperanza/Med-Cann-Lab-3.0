# Evoluções para melhor — Registro identificado e documentado

**Objetivo:** Listar as mudanças que **evoluíram o sistema para melhor**, sem quebrar o que já funcionava (política append-only do `INVARIANTE_MODELO_EXECUCAO_NOA.md`).  
**Última atualização:** 05/02/2026

---

## Princípio

- **Selar** = corrigir ambiguidade ou bug sem mudar o fluxo.
- **Acrescentar** = ampliar cobertura (mais frases, mais contexto) sem substituir a lógica existente.
- **Não redesenhar** = o que está selado (agendamento, avaliação clínica, triggers) permanece; evolução é por acréscimo.

---

## 1. Separação agendar vs agendamento (semântica)

| Item | Descrição |
|------|-----------|
| **O quê** | Distinção clara: **agendar** = ação (marcar consulta) → card no chat; **agendamento(s) / minha agenda** = lugar (aba/calendário) → navegar. |
| **Onde** | Core: heurísticas `isAgendaPlacePhrase`, `isAgendaNavigationOnly`; prompt GPT; `deriveAppCommandsV1` (paciente vs profissional). |
| **Por que melhor** | Elimina confusão: “ver agendamento” ou “me levar para agendamento” não abrem mais o card; abrem a aba. “Quero agendar” abre o card, não navega. |
| **Doc** | `CHAT_PACIENTE_VS_PROFISSIONAL_E_TESTE_ADMIN.md` |

---

## 2. Trigger de agendamento não depender só do GPT

| Item | Descrição |
|------|-----------|
| **O quê** | `metadata.trigger_scheduling` passou a ser derivado também por **palavra-chave e heurísticas** no Core; o widget abre mesmo quando o GPT não emite `[TRIGGER_SCHEDULING]`. |
| **Onde** | Core: `shouldTriggerSchedulingWidget`, `hasScheduleVerb`, `hasConsultIntent`, `hasSlotsIntent`, fallback determinístico. |
| **Por que melhor** | Resiliência: se o modelo “esquecer” a tag, o usuário ainda vê o card. Alinhado ao invariante: “Não pode depender do GPT lembrar uma tag no texto para funcionar.” |
| **Doc** | `INVARIANTE_MODELO_EXECUCAO_NOA.md`, `CORE_EM_ACORDO_COM_O_MODELO.md` |

---

## 3. Expansão dos gatilhos da ação “agendar” (append-only)

| Item | Descrição |
|------|-----------|
| **O quê** | Mais formas de falar passam a abrir o card: “gostaria de marcar/agendar”, “preciso de consulta”, “gostaria de consulta”, “agendar/marcar com dr/médico/doutor/profissional”, “horário com”, “marcar consulta”, “agendar consulta”; confirmações curtas: “quero”, “pode ser”, “por favor”, “claro”, “faca/faça”, “manda aí”, “envia aí”. |
| **Onde** | Core: `hasScheduleVerb`, `hasConsultIntent`, `isShortSchedulingConfirmation` (lista expandida). |
| **Por que melhor** | Usuário não precisa decorar uma frase exata; a intenção é reconhecida de forma mais natural. Sem remover nenhum gatilho antigo. |
| **Doc** | `DIARIO_MESTRE_COMPLETO_05-02-2026.md` § 2.1 |

---

## 4. Regra “mensagem curta” em contexto de agendamento

| Item | Descrição |
|------|-----------|
| **O quê** | Se a mensagem tem **≤ 10 palavras**, a última resposta da Nôa era sobre agendamento, e a mensagem não é de “lugar” nem negativa (não, cancelar) → **abre o card** no chat. |
| **Onde** | Core: `isShortMessageInSchedulingContext` (wordCount, lastWasSchedulingOffer, !isAgendaPlacePhrase, !negativa). |
| **Por que melhor** | Respostas curtas (“sim”, “quero”, “com o Ricardo”) em contexto de agendamento já disparam o widget; não exige nova frase longa. Melhora UX e aderência ao contexto. |
| **Doc** | `DIARIO_MESTRE_COMPLETO_05-02-2026.md` § 2.2 |

---

## 5. Mensagem clara na primeira resposta e na confirmação

| Item | Descrição |
|------|-----------|
| **O quê** | Texto fixo e direto quando o Core decide abrir o card: primeira mensagem (“quero marcar consulta com X”) → “Abrindo aqui no chat para você escolher o horário e confirmar a consulta com o Dr. [nome].”; confirmação curta (“abrir”) → “Abrindo o agendamento aqui no chat para você escolher o horário e confirmar.” |
| **Onde** | Core: sobrescrita de `textForUser` quando `shouldTriggerScheduling` + (hasScheduleVerb/hasConsultIntent ou isShortSchedulingConfirmation). |
| **Por que melhor** | Usuário entende que o card vai abrir **no chat** e não precisa dizer “abrir” por falta de clareza; reduz ambiguidade e suporte. |
| **Doc** | Diário mestre § 2.4 (referência sessão anterior) |

---

## 6. Front: leitura correta de metadata (trigger_scheduling e professionalId)

| Item | Descrição |
|------|-----------|
| **O quê** | UI passa a considerar `message.metadata.metadata` (resposta do Core) e o hook expõe `trigger_scheduling` e `professionalId` no topo da mensagem para o widget e botões. |
| **Onde** | `NoaConversationalInterface.tsx` (coreMeta, triggerScheduling, professionalIdFromMeta); `useMedCannLabConversation.ts` (metadata no assistantMessage). |
| **Por que melhor** | O card de agendamento abre quando o Core envia `trigger_scheduling: true`, independentemente do aninhamento do metadata; profissional correto (Ricardo/Eduardo) é usado no widget. |
| **Doc** | Diário mestre § 2.4 |

---

## 7. Navegação de “lugar” para paciente e profissional

| Item | Descrição |
|------|-----------|
| **O quê** | “Ver agendamento”, “me levar para agendamento”, “agendamento” (como lugar) geram **navegação** para a aba correta: paciente → `/app/clinica/paciente/agendamentos`; profissional → aba Agendamentos do Terminal. |
| **Onde** | Core: `deriveAppCommandsV1` (regex paciente e profissional); `filterAppCommandsByRole` mantém só o comando do perfil. |
| **Por que melhor** | Consistência: quem pede o **lugar** (calendário) vai para a tela; quem pede a **ação** (agendar) vê o card. Admin “ver como” recebe o comportamento do perfil escolhido. |
| **Doc** | `CHAT_PACIENTE_VS_PROFISSIONAL_E_TESTE_ADMIN.md` |

---

## 8. Remoção de navegação quando o card abre

| Item | Descrição |
|------|-----------|
| **O quê** | Quando `shouldTriggerScheduling` é true, comandos `navigate-section` com target `agendamentos` são **removidos** dos `app_commands` retornados. |
| **Onde** | Core: filtro após `filterAppCommandsByRole`: `app_commands.filter(c => !(navigate-section && target === 'agendamentos'))`. |
| **Por que melhor** | Evita que “abrir” (confirmação curta) gere tanto o card quanto o botão “Abrir: Agenda”; o usuário fica no chat com o widget. |
| **Doc** | Implementação no Core; Diário mestre § 3.2 |

---

## 9. COS documentado como porta do Core

| Item | Descrição |
|------|-----------|
| **O quê** | Papel do COS (Kernel de Doutrina) explicitado no doc mestre: veredito “O sistema pode pensar agora?” antes do GPT; Kill Switch, Trauma, Metabolismo, Read-only, Policy. |
| **Onde** | `DIARIO_MESTRE_COMPLETO_05-02-2026.md` § 6; referências a `cos_engine.ts` e `cos_kernel.ts`. |
| **Por que melhor** | Deixa claro o triângulo **doutrina (COS) + cognição (GPT) + execução (Front)**; evita que o COS seja tratado como “config opcional” em vez de porta de governança. |
| **Doc** | `DIARIO_MESTRE_COMPLETO_05-02-2026.md` |

---

## 10. Documentação unificada (Livro Magno + Diário Mestre)

| Item | Descrição |
|------|-----------|
| **O quê** | `LIVRO_MAGNO_DIARIO_UNIFICADO.md` atualizado (versão 1.0.4, entrada 05/02); `DIARIO_MESTRE_COMPLETO_05-02-2026.md` criado com contexto dos últimos dias, análise do Core, COS e fechamento. |
| **Onde** | `docs/`. |
| **Por que melhor** | Uma única fonte de verdade para “o que mudou e por quê”; facilita onboarding e evita reversões por desconhecimento do contexto. |
| **Doc** | Este arquivo e `DIARIO_MESTRE_COMPLETO_05-02-2026.md` |

---

## Resumo

Todas as evoluções acima são **para melhor** no sentido de:

- **Não quebrar** o que já estava selado (triggers, avaliação clínica, agendamento como modelo).
- **Aumentar resiliência** (fallback por palavra-chave, metadata no front).
- **Melhorar UX** (mais formas de falar, mensagem clara, respostas curtas no contexto certo).
- **Preservar governança** (perfil, COS, app_commands filtrados).

Qualquer nova mudança deve seguir a mesma política: **selar ou acrescentar**, nunca redesenhar o fluxo selado. Referência: `INVARIANTE_MODELO_EXECUCAO_NOA.md`.
