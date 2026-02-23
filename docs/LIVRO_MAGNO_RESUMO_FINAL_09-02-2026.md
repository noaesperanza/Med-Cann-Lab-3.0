# Livro Magno — Resumo Final para o Dr. Ricardo Valença

**Data:** 09/02/2026  
**Objetivo:** Um único documento com tudo que foi feito, estado atual e o que falta. Cada item em poucas palavras para leitura rápida.

---

## Linha do tempo (7 dias — o que montamos)

Cada dia abaixo traz: **dificuldades** encontradas, **como foi feito** (técnico) e uma reflexão **filosófica ou educativa** em 3–4 frases.

---

**03/02 — Triggers e invariantes (fala ≠ ação)**  
A dificuldade era o modelo às vezes “esquecer” o token de agendamento ou misturar cancelamento com abertura de card. Decidiu-se que o trigger passaria a ser **derivado por palavra-chave** no código (regex e heurísticas), não pela memória do LLM. Foi criada a “lei curta” no INVARIANTE_MODELO_EXECUCAO_NOA: não redesenhar, só acrescentar; execução sempre determinística. Ensina que em sistemas clínicos a **ação** deve depender de regras explícitas, não de interpretação livre da IA.

**04/02 — Git, selagem e evolução append-only**  
O risco era versionar pastas pessoais ou quebrar o repositório remoto. Inicializou-se um git **isolado** no projeto e .gitignore para secrets; main e master alinhados com push forçado. Em paralelo, o trigger foi selado como **contrato institucional** (PROTOCOLO_APP_COMMANDS_V2): prioridade de canais e evolução só por acréscimo. Filosofia: o que vira “lei” no sistema (token, protocolo) deve ficar documentado e imutável no nome, para não divergir entre Core e front.

**05/02 — Cobertura de linguagem e confirmações curtas**  
O paciente nem sempre fala “quero agendar” de forma longa; respostas como “quero” ou “pode ser” em contexto de agendamento precisavam abrir o card. Ampliaram-se os gatilhos (“gostaria de marcar”, “preciso de consulta”, etc.) e entrou a **regra &lt;10 palavras**: em contexto de agendamento, mensagens curtas não negativas abrem o widget. Registrou-se no DIARIO_MESTRE e em EVOLUCOES_PARA_MELHOR o princípio: evoluir para melhor **selando** o que já funciona e **acrescentando** cobertura, sem redesenhar o fluxo.

**06/02 (1) — Paciente em foco e prontuário unificado**  
Unir Evolução e Analytics com o Prontuário no mesmo lugar exigiu duas sub-abas e carregamento condicional (reports, appointments, prescriptions). Surgiu o bug “Cannot access 'patients' before initialization” porque estado era usado em useEffect antes de ser declarado; corrigiu-se a ordem das declarações. Escala global do app foi levada a 85% para padronizar a experiência em todos os perfis. Reflexão: a **unificação da vista** do paciente (evolução + prontuário) reduz cliques e alinha a interface ao fluxo mental do profissional.

**06/02 (2) — Header único e loops React**  
Dois headers diferentes geravam inconsistência e o cérebro Nôa não aparecia igual em todos os dashboards. Unificou-se um único header com triggers por perfil (setDashboardTriggers) e o ícone do cérebro sempre no centro. A dificuldade técnica foi o **loop “Maximum update depth exceeded”** em AlunoDashboard e EnsinoDashboard: o useEffect que chamava setDashboardTriggers tinha o callback nas dependências e re-executava sem parar. Solução: **useRef** para o handler, tirando a função do array de dependências. Ensino: em React, efeitos que atualizam contexto/estado global precisam de referências estáveis para não se retroalimentar.

**07/02 — WebRTC real e videochamada sem 406**  
Fazer áudio e vídeo entre dois dispositivos exigiu sinalização (offer/answer/ICE) via Supabase Realtime e o hook useWebRTCRoom. O problema de **406** ao aceitar/recusar vinha do `.single()` quando o update afetava 0 linhas; trocou-se por `.maybeSingle()`. CORS foi contornado criando notificação por RPC/insert no front em vez de chamar Edge no browser. Filosofia técnica: telemedicina precisa de **canais determinísticos** (quem inicia, quem aceita, sala única) e fallbacks quando a nuvem falha; a UX (viva-voz, câmera durante áudio) segue o princípio de não prender o usuário.

**09/02 — Governança, RLS, prontuário e doc único**  
O erro de FK em chat_participants (user_id não em auth.users) mostrava dessincronia entre public.users e auth; os fluxos SQL passaram a usar só usuários que existem em auth.users. PostgreSQL não tem MIN(uuid); usou-se (array_agg(room_id))[1] no FLUXO_3. Confirmou-se que prontuários **nunca** entram na Base de Conhecimento (só documentos da biblioteca) e registrou-se no código e no check-list (6.4). Unificou-se o dashboard profissional (Ricardo e Eduardo para o mesmo /clinica/profissional/dashboard). Reflexão: **governança** é documentar as regras (uma RPC para chat, RLS por perfil, separação prontuário vs base de conhecimento) e ter scripts que validam o comportamento antes do release.

---

## Estado atual (resumo)

- **Auth e rotas:** Login admin/profissional/paciente; “Visualizar Como”; profissional e paciente redirecionados para um único dashboard por tipo (clinica/profissional/dashboard para qualquer profissional).
- **Chat:** Uma RPC canônica (create_chat_room_for_patient_uuid); idempotência; front não usa mais jsonb com nome.
- **Videochamada:** Solicitar/aceitar/recusar; WebRTC real; sem 406 (maybeSingle); notificação via RPC quando Edge falha.
- **Prontuário:** PatientsManagement com evoluções, reports, prescriptions; RLS com is_professional_patient_link; prontuários nunca na Base de Conhecimento (só documentos da biblioteca).
- **Banco:** 12 tabelas críticas com RLS ativo; scripts de fix (patient_medical_records, chat_participants FK) e fluxos manuais/3 falhas em SQL; baseline admin do RLS audit registrado (31 appointments, 98 chat_rooms, 1320 patient_medical_records, etc.).
- **Documentação:** PLANO_REAL_DO_PRODUTO, CHECKLIST_GO_NO_GO_RELEASE, PROXIMOS_PASSOS, RLS_AUDIT_SANITY_QUERIES, FLUXO_3 e FLUXO_MANUAL; governança no knowledgeBaseIntegration (prontuários não entram na base de conhecimento).

---

## O que falta fazer (próximos passos — em ordem)

1. **RLS audit 3 perfis:** Rodar Bloco 2 do RLS_AUDIT com profissional e paciente (no app, com JWT). Esperado: admin ≥ profissional ≥ paciente. Marcar 6.1 no Go/No-Go.
2. **Go/No-Go Seção 1:** Testar login admin/profissional/paciente; navegar rotas; “Visualizar Como”; listas com nomes sem erro. Marcar cada [ ] da seção 1.
3. **Go/No-Go Seção 2:** Um happy path completo (8 passos) na UI: agendamento → chat → mensagem → video → avaliação → relatório → prescrição → prontuário. Script FLUXO_MANUAL já valida o banco; falta validar na tela.
4. **Go/No-Go Seção 3:** Três falhas: chat duplicado (1 sala); video recusada/expirada (UI não presa); RLS 403 com mensagem clara.
5. **Video em produção:** Realtime em video_call_requests; timeout 30 s; gravação/consentimento se fora do MVP deixar para depois.
6. **Prescrição/assinatura:** Confirmar criação e listagem; rastreio de quem emitiu; Edge digital-signature sem CORS/401 ou tratado na UI.
7. **Release:** Backup/restore; tag de rollback; veredito final no CHECKLIST_GO_NO_GO_RELEASE (Go + data/responsável/ambiente).

---

## Referências rápidas

- **Check-list release:** `docs/CHECKLIST_GO_NO_GO_RELEASE.md`  
- **Próximos passos detalhados:** `docs/PROXIMOS_PASSOS_FECHAMENTO_09-02-2026.md`  
- **RLS audit (Bloco 2):** `database/scripts/RLS_AUDIT_SANITY_QUERIES_2026-02-09.sql`  
- **Fluxo manual 8 passos:** `database/scripts/FLUXO_MANUAL_COMPLETO_VIA_SQL_2026-02-09.sql`  
- **Fluxo 3 falhas:** `database/scripts/FLUXO_3_TRES_FALHAS_VIA_SQL_2026-02-09.sql`  
- **Diário unificado completo:** `docs/LIVRO_MAGNO_DIARIO_UNIFICADO.md`

---

*Documento único para o Dr. Ricardo: estado do projeto em 09/02/2026 e roteiro até o release.*
