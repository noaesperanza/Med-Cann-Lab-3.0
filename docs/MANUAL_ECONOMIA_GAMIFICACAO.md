# 💰 Manual da Economia TradeVision: Pontos, Cashback e Referral

**Data de Criação:** 02/02/2026
**Status:** Definição da Lógica Econômica

Este documento esclarece a separação contábil entre o sistema de **Engajamento (Pontos/XP)** e o sistema de **Comercial (Referral/Comissão)**, garantindo que o cálculo de "Fim de Mês" seja exato e auditável.

---

## 1. O Conceito de "Two-Track Economy" (Via Dupla)

O sistema opera com duas moedas distintas que correm em paralelo. Elas não se misturam na origem, mas podem convergir no bolso do usuário.

### 🛤️ Via 1: Engajamento (Pontos / XP)
*   **O que é:** Recompensa por **comportamento** e **uso** da plataforma.
*   **Unidade:** `integer` (Pontos inteiros).
*   **Objetivo:** Retenção e Fidelidade.
*   **Origem:** Ações do usuário (Completar Avaliação, Postar no Fórum, Assistir Aula).
*   **Exemplo Prático (O que implementamos hoje):**
    *   Ao terminar a avaliação clínica -> Ganha **50 Pontos**.
    *   *Nota:* Isso ainda NÃO é dinheiro. É um "score".

### 🛤️ Via 2: Referral (Comissão de Venda)
*   **O que é:** Recompensa financeira por **trazer receita** (novos assinantes).
*   **Unidade:** `decimal` (R$ / BRL).
*   **Objetivo:** Crescimento Viral.
*   **Origem:** Transações financeiras de indicados (O indicado pagou a mensalidade).
*   **Regra de Ouro:** "Cashback de Referral só existe se houver PAGAMENTO em dinheiro na outra ponta."

---

## 2. A Matemática do "Fim do Mês"

Como transformamos tudo isso em Pix/Desconto para o usuário no final do mês?

### A. Cálculo dos Pontos (Conversão)
Os 50 pontos que configuramos hoje entram no **Cálculo de Conversão**.
*   **Fórmula:** `Saldo de Pontos * Taxa de Conversão = Cashback de Engajamento`
*   **Exemplo:**
    *   Taxa Atual (Hipotética): 1000 Pontos = R$ 10,00.
    *   Usuário fez 1 Avaliação (50pts) + 10 dias de ofensiva (100pts) = 150 Pontos.
    *   **Valor Gerado:** R$ 1,50.

### B. Cálculo do Referral (Comissão Direta)
Este cálculo é gatilhado pelo **faturamento**, não pelo uso.
*   **Fórmula:** `Valor Pago pelo Indicado * % Nível = Comissão`
*   **Níveis:**
    *   Nível 1 (Direto): **10%**
    *   Nível 2 (Indireto): **4%**
*   **Exemplo:**
    *   Você indicou a Dra. Ana.
    *   Dra. Ana pagou R$ 199,00 de assinatura.
    *   **Sua Comissão:** R$ 19,90 (na hora).

---

## 3. Resumo da Implementação Técnica

| Recurso | Onde está no código? | Como funciona? |
| :--- | :--- | :--- |
| **Dar Pontos** | `increment_user_points` (RPC) | Chamado automaticamente quando a IA finaliza a avaliação (Code: `index.ts`). |
| **Rastrear Indicação** | Colunas `invited_by` | Armazenadas na tabela `users`. Define "quem é o pai" do usuário. |
| **Calcular Comissão** | *A fazer (Trigger de Pagamento)* | Um script futuro que ouvirá a tabela `transactions`. Quando entrar dinheiro, ele calcula os 10% e cria uma transação de saída para o padrinho. |

## 4. Conclusão para o Livro Magno

Sim, o sistema está configurado para **separar** as coisas corretamente:
1.  O código atual garantirá que o usuário acumule o "Capital Social" (Pontos) por usar a ferramenta (Avaliações).
2.  O sistema de Referral (`invited_by`) garantirá o rastreio do "Capital Financeiro".

**Não há risco de "quebra" ou mistura indevida.** Os pontos não viram dinheiro automaticamente sem uma regra de conversão, protegendo o caixa da empresa.
