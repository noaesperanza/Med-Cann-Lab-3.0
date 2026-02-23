# 💰 RELATÓRIO DETALHADO - SISTEMA DE PAGAMENTO
## MedCannLab 3.0

---

## 1. STATUS GERAL

### Arquivos Analisados:
- `src/pages/PaymentCheckout.tsx`
- `src/pages/SubscriptionPlans.tsx` (não lido completamente)
- `src/hooks/useFinancialData.ts` (não lido completamente)

### Status: ⚠️ ESTRUTURA EXISTE, MAS NÃO FUNCIONAL

---

## 2. ANÁLISE POR EIXO

### 2.1 Eixo Clínica

**Status:** ❌ NÃO IMPLEMENTADO

#### Problemas:
- ⚠️ Não há diferenciação de pagamento por eixo
- ⚠️ Não há planos específicos para consultas clínicas
- ⚠️ Não há integração com agendamentos do eixo clínica

#### Necessidades:
- [ ] Planos de assinatura para pacientes (Med Cann 150, 250, 350)
- [ ] Pagamento de consultas avulsas
- [ ] Desconto automático para assinantes
- [ ] Integração com agendamentos

---

### 2.2 Eixo Ensino

**Status:** ❌ NÃO IMPLEMENTADO

#### Problemas:
- ⚠️ Não há sistema de pagamento para cursos
- ⚠️ Não há planos de assinatura para alunos
- ⚠️ Não há integração com matrículas

#### Necessidades:
- [ ] Pagamento de cursos individuais
- [ ] Planos de assinatura para alunos
- [ ] Descontos para múltiplos cursos
- [ ] Integração com sistema de matrículas

---

### 2.3 Eixo Pesquisa

**Status:** ❌ NÃO IMPLEMENTADO

#### Problemas:
- ⚠️ Não há sistema de pagamento para pesquisa
- ⚠️ Não há financiamento de projetos
- ⚠️ Não há integração com fórum de casos

#### Necessidades:
- [ ] Pagamento de participação em projetos
- [ ] Financiamento de pesquisas
- [ ] Integração com fórum de casos clínicos

---

## 3. ANÁLISE DO COMPONENTE PaymentCheckout.tsx

### Funcionalidades Implementadas:
- ✅ Interface de checkout
- ✅ Seleção de método de pagamento (PIX, Cartão, Boleto)
- ✅ Geração de QR Code PIX (mockado)
- ✅ Busca de planos do Supabase

### Problemas Encontrados:

**1. QR Code Mockado:**
```typescript
// Linha 74-83: generatePixQRCode gera QR Code mockado
const generatePixQRCode = () => {
  // QR Code mockado (em produção, virá da API do Mercado Pago)
  const qrCodeData = {
    pixString: `00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000${plan?.monthly_price}00${plan?.name}`,
    qrCodeBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  }
  
  setQrCodeValue(qrCodeData.pixString)
  setQrCode(qrCodeData.qrCodeBase64)
}
```

**Problemas:**
- ❌ QR Code é completamente mockado
- ❌ Não há integração com Mercado Pago
- ❌ Não há processamento real de pagamento

**2. Processamento de Pagamento:**
```typescript
// Linha 85-97: handlePayment apenas simula
const handlePayment = async () => {
  setProcessing(true)
  
  // Simular processamento
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Gerar QR Code mockado
  if (paymentMethod === 'pix') {
    generatePixQRCode()
  }
  
  setProcessing(false)
}
```

**Problemas:**
- ❌ Não cria pagamento no Mercado Pago
- ❌ Não verifica status de pagamento
- ❌ Não atualiza transação no Supabase

---

## 4. INTEGRAÇÃO COM MERCADO PAGO

### Status: ❌ NÃO IMPLEMENTADO

#### Necessidades:
1. **Configuração:**
   - [ ] Criar conta Mercado Pago
   - [ ] Obter Access Token e Public Key
   - [ ] Configurar variáveis de ambiente

2. **Implementação:**
   - [ ] Criar `src/services/paymentService.ts`
   - [ ] Implementar `createPaymentIntent`
   - [ ] Implementar `verifyPaymentStatus`
   - [ ] Implementar webhooks

3. **Integração:**
   - [ ] Conectar `PaymentCheckout.tsx` ao serviço
   - [ ] Salvar transações no Supabase
   - [ ] Atualizar status de assinaturas
   - [ ] Enviar notificações

---

## 5. DIFERENCIAÇÃO POR EIXO

### Problema Atual:
- ⚠️ Não há diferenciação de pagamento por eixo
- ⚠️ Todos os pagamentos são tratados igualmente
- ⚠️ Não há planos específicos por eixo

### Solução Proposta:

```typescript
// Adicionar campo 'axis' aos planos
interface SubscriptionPlan {
  id: string
  name: string
  monthly_price: number
  consultation_discount: number
  axis: 'clinica' | 'ensino' | 'pesquisa' | 'all' // Novo campo
  features: string[]
}

// Filtrar planos por eixo
const loadPlansByAxis = async (axis: string) => {
  const { data } = await supabase
    .from('subscription_plans')
    .select('*')
    .or(`axis.eq.${axis},axis.eq.all`)
    .eq('is_active', true)
  
  return data
}

// Aplicar desconto baseado no eixo
const calculateDiscount = (plan: SubscriptionPlan, appointmentPrice: number, axis: string) => {
  if (plan.axis === axis || plan.axis === 'all') {
    return appointmentPrice * (plan.consultation_discount / 100)
  }
  return 0
}
```

---

## 6. FLUXO DE PAGAMENTO PROPOSTO

### Para Consultas (Eixo Clínica):
```
1. Paciente agenda consulta
   ↓
2. Sistema verifica se tem assinatura ativa
   ↓
3a. Se tem assinatura:
    - Aplica desconto automático
    - Valor final = Valor original - Desconto
   ↓
3b. Se não tem assinatura:
    - Valor final = Valor original
   ↓
4. Redireciona para checkout
   ↓
5. Usuário escolhe método de pagamento
   ↓
6. Sistema cria pagamento no Mercado Pago
   ↓
7. Usuário paga
   ↓
8. Webhook confirma pagamento
   ↓
9. Sistema atualiza status do agendamento
   ↓
10. Notifica paciente e profissional
```

### Para Cursos (Eixo Ensino):
```
1. Aluno se inscreve em curso
   ↓
2. Sistema verifica preço do curso
   ↓
3. Redireciona para checkout
   ↓
4. Usuário paga
   ↓
5. Sistema ativa matrícula
   ↓
6. Aluno tem acesso ao curso
```

### Para Pesquisa (Eixo Pesquisa):
```
1. Profissional/Aluno participa de projeto
   ↓
2. Sistema verifica se há taxa de participação
   ↓
3. Se houver, redireciona para checkout
   ↓
4. Usuário paga
   ↓
5. Sistema ativa participação
```

---

## 📊 RESUMO DE CORREÇÕES NECESSÁRIAS

### Integração Mercado Pago:
1. [ ] Criar `src/services/paymentService.ts`
2. [ ] Implementar `createPaymentIntent`
3. [ ] Implementar `verifyPaymentStatus`
4. [ ] Configurar webhooks
5. [ ] Conectar `PaymentCheckout.tsx` ao serviço

### Diferenciação por Eixo:
1. [ ] Adicionar campo `axis` aos planos
2. [ ] Criar planos específicos por eixo
3. [ ] Implementar cálculo de desconto por eixo
4. [ ] Integrar com agendamentos por eixo

### Integração com Outros Sistemas:
1. [ ] Integrar com agendamentos
2. [ ] Integrar com matrículas
3. [ ] Integrar com projetos de pesquisa
4. [ ] Adicionar notificações

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Criar conta Mercado Pago
- [ ] Obter credenciais (Access Token, Public Key)
- [ ] Configurar variáveis de ambiente
- [ ] Criar `src/services/paymentService.ts`
- [ ] Implementar criação de pagamento
- [ ] Implementar verificação de status
- [ ] Configurar webhooks
- [ ] Adicionar campo `axis` aos planos
- [ ] Criar planos por eixo
- [ ] Integrar com agendamentos
- [ ] Integrar com matrículas
- [ ] Testar fluxo completo

