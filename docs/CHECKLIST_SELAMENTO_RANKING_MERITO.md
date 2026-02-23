# 🔒 CHECKLIST DE SELAMENTO — SISTEMA DE RANKING, MÉRITO E BENEFÍCIOS

**Status-alvo:** ✅ APROVADO PARA IMPLEMENTAÇÃO
**Escopo:** Médico · Paciente · Parceiros · Financeiro · Ético
**Modelo:** Ranking Percentual + Mérito Sustentado (Anti-Pay-to-Win)

---

## 🧠 CAMADA 1 — PRINCÍPIOS (NÃO NEGOCIÁVEIS)

- [ ] Ranking percentual, não absoluto (Top 5% global)
- [ ] Benefícios vinculados a mérito sustentado, não volume bruto
- [ ] Nenhuma vantagem clínica automática
- [ ] Nenhum benefício depende de prescrição, diagnóstico ou conduta médica
- [ ] Tudo auditável e reversível

**📌 Regra de Ouro:**
> "Benefícios premiam engajamento ético, nunca ato médico."

---

## 🏗️ CAMADA 2 — MODELO DE RANKING

### 2.1 Estrutura do Ranking
- [ ] **Ranking Global:** Recalculado mensalmente.
- [ ] **Base da Pontuação:** Score composto ponderado (não só usuários indicados).
    - Avaliações concluídas (IA) ✔️
    - Comparecimento de pacientes ✔️
    - Retenção dos indicados ✔️
    - Feedback / NPS ✔️
    - Tempo de permanência ✔️

### 2.2 Faixas de Elite (dentro do Top 5%)
- **Elite:** Top 1%
- **Platinum:** 1% – 3%
- **Gold:** 3% – 5%
*📌 Parceiros grandes não têm vantagem estrutural (percentil).*

---

## 🎖️ CAMADA 3 — CONDIÇÃO DE ENTRADA NOS BENEFÍCIOS

- [ ] Permanecer **3 meses consecutivos** no Top 5%.
- [ ] Evento registrado: `RANK_ELIGIBILITY_GRANTED`.
- [ ] Auditoria salva com snapshot do ranking.

---

## 🎁 CAMADA 4 — BENEFÍCIO 1: CONSULTA GRATUITA

### 4.1 Regras
- [ ] **Frequência:** 1 consulta gratuita a cada 6 meses.
- [ ] **Elegibilidade:** Válida para o próprio médico OU familiar de 1º grau.
- [ ] **Restrições:** Não acumulável; Expira se não usada; Não conversível em dinheiro.

### 4.2 Governança
- [ ] Evento: `BENEFIT_GRANTED_CONSULTATION`.
- [ ] Flag de uso único.
- [ ] Log clínico separado (sem interferir em prontuário).

---

## 💸 CAMADA 5 — BENEFÍCIO 2: DESCONTO PROGRESSIVO

### 5.1 Regras Gerais
- [ ] Início no **7º mês consecutivo** no Top 5%.
- [ ] Crescimento mensal condicional à permanência.
- [ ] Teto máximo: **30%**.
- [ ] Desconto nunca cresce fora do ranking.

### 5.2 Tabela de Progressão
| Mês contínuo no Top 5% | Desconto |
| :--- | :--- |
| 7º mês | 5% |
| 8º mês | 10% |
| 9º mês | 15% |
| 10º mês | 20% |
| 11º mês | 25% |
| **12º+ mês** | **30% (cap)** |

### 5.3 Regressão (Proteção do Caixa)
- [ ] Saiu do Top 5% → Desconto congela ou reduz.
- [ ] Evento: `RANK_LOST`.
- [ ] Nunca aumenta sem mérito ativo.

---

## 🛡️ CAMADA 6 — ANTIFRAUDE & ANTI-DOMINÂNCIA

- [ ] Score ponderado (volume ≠ poder absoluto).
- [ ] Peso maior para **qualidade** e **retenção**.
- [ ] Limite de impacto por indicado único.
- [ ] Detecção de comportamento artificial.
- [ ] Auditoria semestral automática.

---

## ⚖️ CAMADA 7 — CONFORMIDADE LEGAL (BRASIL)

- [ ] Benefícios não vinculados a ato médico.
- [ ] Consulta gratuita = benefício institucional, não comissão.
- [ ] Desconto = programa de fidelidade, não kickback.
- [ ] Referral financeiro separado (Two-Track Economy).
- [ ] Alinhado a: LGPD, CFM, CDC, Práticas de HealthTech.

---

## 🧾 CAMADA 8 — EVENTOS & AUDITORIA (COS)

**Eventos Obrigatórios:**
- `RANK_ELIGIBILITY_GRANTED`
- `BENEFIT_GRANTED_CONSULTATION`
- `DISCOUNT_PROGRESS_UPDATED`
- `RANK_MAINTAINED`
- `RANK_LOST`

*Todos devem conter: timestamp, percentil, snapshot de score, versão de regra.*

---

## 🔒 CRITÉRIO FINAL DE SELAMENTO

Pode ser declarado SELADO quando:
- [x] Não favorece poder econômico.
- [x] Recompensa mérito sustentado.
- [x] Protege o paciente.
- [x] Protege o médico.
- [x] Protege o caixa.
- [x] É auditável.
- [x] É explicável ao regulador.

**🟢 STATUS FINAL:**
✅ **IDEIA SELADA**
✅ **PRONTA PARA IMPLEMENTAÇÃO**
✅ **SUSTENTÁVEL, ÉTICA E ESCALÁVEL**
