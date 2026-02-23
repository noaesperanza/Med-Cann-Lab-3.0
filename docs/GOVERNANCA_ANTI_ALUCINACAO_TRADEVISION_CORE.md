# Governança anti‑alucinação — como o TradeVision Core reduz “fala solta”

## Princípio (COS / doutrina)
**O sistema é confiável; o modelo não.**  
O LLM é um “prestador de linguagem”, não uma autoridade. O Core aplica governança e trilha.

---

## O que é “alucinação” aqui
No produto, “alucinação” é qualquer uma destas falhas:
- afirmar fatos clínicos/operacionais sem fonte (ex.: horários, regras, dados do paciente)
- inventar ações executadas (“eu agendei”, “eu abri”, “eu salvei”) sem confirmação do sistema
- criar comandos perigosos (“delete”, “criar paciente”, etc.) sem política/execução determinística

---

## Controles técnicos que reduzem alucinação

### 1) Ancoragem por fonte (dados + documentos)
O chat injeta no contexto:
- dados reais da plataforma (quando aplicável)
- documentos oficiais (RAG / Base de Conhecimento)

E o prompt da Nôa coloca a Base como “soberana”. Resultado: o modelo tende a responder **ancorado**.

### 2) Governança por camadas (COS)
O Core aplica camadas antes do LLM:
- Trauma (restricted mode)
- Metabolismo cognitivo (regulação)
- Políticas (o que pode/não pode)
- Kernel COS (avaliação/decisão)

Isso reduz alucinação porque o modelo opera dentro de um “trilho” comportamental.

### 3) Separação entre fala e ação (não‑execução)
Mesmo que o modelo “diga” algo, o sistema não considera execução real sem:
- execução determinística (Edge/RPC) **ou**
- comando estruturado permitido (UI/read‑only) executado pelo frontend

Na prática:
- texto (`text`) é só linguagem
- ações são campos estruturados/flags (`metadata`, `app_commands`) sob allow‑list

### 4) Fail‑closed para comandos
O executor no frontend ignora qualquer comando fora da lista permitida.  
Isso impede que “uma resposta bonita” vire ação inesperada.

### 5) Rastreabilidade (CEP + decisões)
O Core registra:
- espelhamento de chat (`ai_chat_interactions`)
- decisões (`cognitive_decisions`) quando aplicável
- eventos (`cognitive_events`) para triggers/sugestões/execuções

Isso cria:
- auditoria posterior (o que aconteceu)
- aprendizado governado (ajustar política/regex sem “achismo”)

---

## O que NÃO fazemos (por design)
- não executamos escrita crítica baseado apenas em texto do LLM
- não usamos “palavra secreta no texto” para navegar/agir

---

## Efeito prático
O modelo pode errar na linguagem, mas:
- **não executa** coisas perigosas
- **não define verdade** sem fonte
- o sistema mantém trilha para correção

