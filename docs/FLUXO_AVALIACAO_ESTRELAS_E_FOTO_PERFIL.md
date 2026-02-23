# Fluxo: Alterar Foto, Estrelas/Ranking e Card de Avaliação da Conversa

## 1. Alterar foto (perfil)

### O que você pediu
- Na página **Meu Perfil**, ter uma opção clara **"Alterar foto"** para trocar a foto do avatar (hoje só aparece a inicial).

### Como fica
- No card **Informações Pessoais**, logo abaixo ou ao lado do avatar:
  - Botão ou link **"Alterar foto"**.
  - Ao clicar: abre seletor de arquivo (imagem).
  - A imagem é enviada para o **Supabase Storage** (bucket de avatares de usuário).
  - A URL da foto é salva nos metadados do usuário (ex.: `user_metadata.avatar_url`) e, se existir, na tabela `user_profiles.avatar_url`.
- O avatar na página de perfil, no dashboard e no header passa a exibir essa foto quando existir; caso contrário, continua a inicial.

### Implementação (resumo)
- Bucket: usar um bucket dedicado a fotos de perfil (ex.: `user-avatars`) ou um subpath no bucket existente (ex.: `profiles/{user_id}`).
- Atualizar `auth.users` (metadata) e, se houver coluna `avatar_url` em `user_profiles`, manter sincronizado.
- Na UI: input `type="file" accept="image/*"` + upload via Supabase Storage + atualização de perfil.

---

## 2. Estrelas que refletem o cálculo do ranking (a cada 50 consultas / 50 avaliações)

### O que você pediu
- Ver **estrelas** (0 a 5) que reflitam o **cálculo do rank**.
- Rank baseado em: **a cada 50 consultas** ou **50 avaliações completas** no app.
- Quando **pacientes avaliam de 0 a 5 estrelas**, isso deve estar **correlacionado com o sistema** (paciente → profissional/atendimento).

### Como funciona (regras)
1. **Quem avalia:** o **paciente** avalia a **consulta/conversa** (ex.: atendimento com profissional ou com a Nôa).
2. **Onde guardar:** cada avaliação é um registro ligado a:
   - paciente (quem avaliou),
   - profissional ou contexto (quem foi avaliado; no caso da Nôa, “conversa com a IA”),
   - nota de 0 a 5 estrelas,
   - opcional: data, tipo (consulta presencial, chat, avaliação clínica, etc.).
3. **Cálculo do ranking do profissional (ou do “serviço”)**
   - Agregar as avaliações (média, quantidade).
   - **Atualização do rank:** a cada **50 consultas** ou **50 avaliações completas**, o sistema recalcula o rank (ex.: posição entre profissionais ou pontuação).
   - As **estrelas** mostradas no perfil/dashboard são a **média** das notas (0–5) recebidas nesse conjunto (ou nas últimas N avaliações).
4. **Correlação paciente ↔ sistema**
   - Cada avaliação fica vinculada ao paciente e ao profissional/contexto.
   - Relatórios e métricas podem mostrar: “quantas avaliações”, “média de estrelas”, “evolução ao longo do tempo”.

### Onde aparece na interface
- **Perfil do profissional** (e onde hoje está o ranking):
  - Manter o **número do ranking** (ex.: #42).
  - Ao lado (ou abaixo), mostrar as **estrelas** (ex.: ★★★★☆ 4,2) correspondentes à média das avaliações que entram nesse cálculo.
- **Carteira / bloco de ranking**
  - Mesma lógica: número do rank + estrelas.
- **Dashboard**
  - Se já existe um bloco de “ranking” ou “desempenho”, incluir lá também o número de rank + estrelas.

### Implementação (resumo)
- Tabela (ex.: `consultation_ratings` ou `conversation_ratings`):
  - `id`, `patient_id` (quem avaliou), `professional_id` ou `context` (ex.: 'noa'), `rating` (1–5), `created_at`, opcional `consultation_id` ou `conversation_id`.
- Função ou job que:
  - Conta consultas/avaliações completas.
  - A cada 50, recalcula rank e média de estrelas.
- Front: buscar média de estrelas e posição de rank e exibir no perfil e na carteira.

---

## 3. Card de aviso para avaliar a conversa ao ir para o dashboard

### O que você pediu
- Ao **final da avaliação clínica** existe um **card no chat** ativado por um trigger até o usuário clicar **OK**.
- Quando o sistema **redireciona para a página do dashboard**, o usuário **“cai direto”** no dashboard sem ser perguntado sobre a conversa.
- Você quer um **card de aviso** perguntando: **“Avalie a conversa: quantas estrelas?”** (0–5).

### Fluxo atual (resumido)
1. Paciente termina a avaliação clínica no chat (Nôa).
2. Backend marca `assessmentCompleted: true`.
3. No chat aparece o **card** “Avaliação Concluída” com botão **“Ver Relatório Clínico”**.
4. Ao clicar, o app navega para `/app/clinica/paciente/dashboard?section=analytics` e **fecha o chat**.
5. Não há nenhuma pergunta de avaliação (estrelas) nesse caminho.

### Fluxo desejado (duas opções)

**Opção A – Avaliar no chat, antes de ir**
1. Ao clicar em **“Ver Relatório Clínico”**, **não** navegar imediatamente.
2. Mostrar um **card/modal** no próprio chat:  
   **“Antes de ir ao relatório: como foi sua experiência? Avalie a conversa com a Nôa: [1] [2] [3] [4] [5] estrelas.”**
3. Usuário escolhe as estrelas e clica em **“Enviar e ver relatório”** (ou só “OK”).
4. Sistema grava a avaliação (paciente, contexto Nôa, nota, data).
5. Depois disso, navega para `dashboard?section=analytics` e fecha o chat.

**Opção B – Avaliar no dashboard, ao chegar**
1. Ao clicar em **“Ver Relatório Clínico”**, navegar para  
   `dashboard?section=analytics&rate_conversation=1`.
2. Na página do **dashboard do paciente**, se existir `rate_conversation=1` na URL:
   - Mostrar no topo um **card de aviso** (banner/card fixo):  
     **“Você acabou de concluir uma avaliação com a Nôa. Como foi? Avalie a conversa: [1] [2] [3] [4] [5] estrelas.”**
   - Usuário escolhe e clica em **“Enviar”** (ou “Enviar e fechar”).
   - Sistema grava a avaliação e remove o parâmetro da URL (ou esconde o card).
   - O restante do dashboard segue normal (relatório, analytics, etc.).

Recomendação: **Opção A** mantém o contexto “conversa” no chat; **Opção B** evita mudar o fluxo do chat e coloca a pergunta na primeira tela que o usuário vê ao voltar. Ambas podem usar a **mesma tabela** e a mesma lógica de “avaliação da conversa”.

### Implementação (resumo)
- **Opção A:** no componente do chat que renderiza o botão “Ver Relatório Clínico”, ao clicar:
  - Abrir modal/card com 1–5 estrelas.
  - Ao confirmar: chamar API/ Supabase para inserir em `conversation_ratings` (ou equivalente), depois `navigate(...)` e fechar chat.
- **Opção B:** no `PatientDashboard`, ao montar a página:
  - Ler `location.search` (ex.: `rate_conversation=1`).
  - Se presente e ainda não tiver avaliação para essa “conversa/avaliação” recente, mostrar o card de estrelas no topo.
  - Ao enviar: gravar avaliação, remover `rate_conversation` da URL (replaceState) e esconder o card.

---

## 4. Resumo técnico

| Item | Onde | Ação |
|------|------|------|
| **Alterar foto** | Página Meu Perfil | Botão “Alterar foto” → upload para Storage → salvar URL em user_metadata e/ou user_profiles. Exibir foto no avatar em todo o app. |
| **Estrelas no rank** | Perfil, Carteira, Dashboard | Tabela de avaliações (paciente, profissional/contexto, 1–5). Cálculo de média e rank a cada 50 consultas/avaliações. UI: mostrar ★★★★☆ + número #rank. |
| **Correlação paciente** | Banco + relatórios | Cada avaliação vinculada a patient_id e professional_id/context. |
| **Card avaliar conversa** | Chat (Opção A) ou Dashboard (Opção B) | Modal/card “Avalie a conversa: 1–5 estrelas” antes de ir ao relatório (A) ou card no topo do dashboard quando `?rate_conversation=1` (B). Gravar em conversation_ratings e então seguir fluxo normal. |

Este documento serve como especificação para implementação e alinhamento com o que você descreveu.
