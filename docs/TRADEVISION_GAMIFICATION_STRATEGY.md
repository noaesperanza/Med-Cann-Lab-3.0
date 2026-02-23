# TradeVision Core - Estratégia, Gamificação e Incentivos

## 1️⃣ Pontos fortes que já estão no fluxo

### Regras de agendamento claras
- **Horário comercial** para consultas regulares.
- **Fora do expediente**, apenas urgências.
- **Cooldown** aplicado para consultas de urgência.
- **Visibilidade completa** para médicos.

### Hierarquia escalável
- Distribuição eficiente de pacientes, mesmo com muitos médicos.
- Base para ranking e prioridade de encaminhamento.

### Avaliação clínica integrada
- Avaliação salva no perfil do paciente.
- Vinculada ao agendamento, eliminando redundâncias.
- Facilita predição de risco de no-show e priorização.

### Gamificação
- **Pontos por interações**:
    - Pacientes: cliques/novas abas → **0,3 pt**
    - Profissionais/alunos: conexão → **5 pt**
- **Cada ponto = R$0,10** → incentiva engajamento.

---

## 2️⃣ Próximos passos estruturados

1.  Definir regras e hierarquia de médicos.
2.  Criar agenda dinâmica com horários livres e urgência.
3.  Integrar chat Noa para agendamento automático.
4.  Adicionar histórico do paciente.
5.  Implementar notificações e comunicação.
6.  Testar escalabilidade com múltiplos cenários.

---

## 3️⃣ Sugestões de melhorias

### Gamificação avançada
- **Diferenciar tipos de pontos**: interações clínicas vs exploratórias.
- **Recompensas extras** para engajamento contínuo (ex.: finalizar avaliação = bônus x2).
- **Dashboard de pontos** visível para pacientes e profissionais.

### Feedback em tempo real
- Mostrar pop-up ao ganhar pontos → reforço positivo.
- Ex.: *"Você ganhou 0,3 pt (R$0,03) por explorar a aba Avaliações!"*

### Integração do ranking médico na gamificação
- Médicos que respondem rápido ou completam agendas de urgência ganham pontos.
- Ex.: 1 ponto extra por consulta de urgência atendida no cooldown mínimo.

### Histórico clínico enriquecido
- Marcar interações gamificadas com histórico → análises de engajamento vs risco de no-show.
- Sugestões automáticas de follow-up para pacientes com baixo engajamento.

### Ajuste da experiência de agendamento
- **WIDGET de agendamento** reconhece gamificação → incentiva completar avaliação antes do agendamento.
- Notificações push quando horários livres surgirem.

### Controle e monitoramento
- Relatórios automáticos de pontos acumulados e créditos → auditoria e compliance.
- Possibilidade de promoções internas ou incentivos extras de forma segura.

---

## 4️⃣ Estrutura de Pontos, Cashback e Referral

### Regras Básicas

| Item | Descrição |
| :--- | :--- |
| **Valor entrada no app** | R$79,99 (pagamento único) |
| **Mensalidade** | R$60 fixo |
| **Cashback máximo** | 10% do valor gasto → R$8,70 garantido |
| **Referral Profissional** | 10% do valor pago pelo paciente indicado |
| **Referral Paciente** | 4% do valor pago pelo paciente indicado |
| **Decaimento de reativação** | 1º mês: -35%, 2º mês: -50%, depois ciclo normal |
| **Ciclo de avaliação** | Semanal, mensal, interação de gamificação |

### Cashback por Tipo de Interação

| Tipo de Interação | Pontos / Valor | Observações |
| :--- | :--- | :--- |
| **Paciente**: clique em nova aba / interação exploratória | 0,3 pt → R$0,03 | Base gamificação básica |
| **Profissional/Aluno**: conexão / interação ativa | 5 pt → R$0,50 | Ex.: marcar consulta, participar de simulação |
| **Finalização de avaliação clínica** | Bônus x2 → 0,6 pt → R$0,06 | Paciente ou aluno |
| **Consulta marcada / realizada** | 5 pt → R$0,50 | Profissional que marcou ou atendeu |
| **Interações semanais** | 1 ponto extra | Ciclo de engajamento semanal |

> **Nota**: cashback máximo de cada usuário não pode ultrapassar R$8,70/mês.

### Referral (Indicações)

| Tipo de Usuário | Percentual | Observações |
| :--- | :--- | :--- |
| **Profissional indica paciente** | 10% | Sobre valor pago pelo paciente indicado |
| **Paciente indica paciente** | 4% | Sobre valor pago pelo paciente indicado |
| **Reativação no 1º mês** | -35% do cashback/referral | Decaimento de engajamento |
| **Reativação no 2º mês** | -50% do cashback/referral | Decaimento maior |
| **Ciclo normal após 2 meses** | Sem decaimento | Retorno ao cálculo normal |

### Gamificação & Interações Semanais

| Interação | Pontos | Cashback estimado | Observações |
| :--- | :--- | :--- | :--- |
| Avaliação clínica concluída | 2x padrão → 0,6 pt | R$0,06 | Paciente ou aluno |
| Simulação de paciente | 5 pt | R$0,50 | Aluno |
| Marcação de consulta | 5 pt | R$0,50 | Profissional |
| Consulta realizada | 5 pt | R$0,50 | Profissional |
| Interação exploratória app | 0,3 pt | R$0,03 | Paciente |
| **Pontos semanais acumulados** | - | **Máx R$8,70** | Limite de cashback |

*Pontos extras podem ser adicionados para ranking médico ou urgências atendidas.*

---

## Fórmulas de Cálculo

### Cashback mensal usuário:
$$
\text{Cashback} = \min(\text{pontos acumulados} \times 0,1\text{R\$}, 8,70)
$$

### Referral:
- **Referral Profissional** = $10\% \times (\text{entrada} + \text{mensalidade do paciente indicado})$
- **Referral Paciente** = $4\% \times (\text{entrada} + \text{mensalidade do paciente indicado})$

### Decaimento de reativação:
- **1º mês** = $\text{Cashback original} \times (1 - 0,35)$
- **2º mês** = $\text{Cashback original} \times (1 - 0,50)$
- **Ciclo normal**: após 2 meses → sem decaimento.

---

## Estrutura de Tabela Consolidada para Implementação

| Usuário | Tipo | Interação | Pontos | Valor R$ | Cashback Mensal | Referral | Observações |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Paciente | Cliques/Aba | Exploração | 0,3 | 0,03 | Limite 8,7 | 4% | Gamificação básica |
| Aluno | Simulação | Roleplay | 5 | 0,50 | Limite 8,7 | 0 | Ensino |
| Profissional | Marcação consulta | Admin | 5 | 0,50 | Limite 8,7 | 10% | Ranking médico |
| Paciente | Avaliação | Clínico | 0,6 | 0,06 | Limite 8,7 | 4% | Avaliação completa |
| Reativação | Paciente/Prof | Qualquer | - | - | -35% / -50% | - | Decaimento |
| Entrada App | Paciente | Pagamento | - | 79,99 | - | - | 1x inicial |
| Mensalidade | Paciente | Pagamento | - | 60 | - | - | Ciclo fixo |
