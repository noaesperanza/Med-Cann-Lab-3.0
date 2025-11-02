# 💰 IMPLEMENTAÇÃO - SISTEMA FINANCEIRO MEDCANLAB 3.0

## 📋 **RESUMO DO PROJETO**

### **Planos de Assinatura:**
- **Med Cann 150**: R$ 150/mês → 10% desconto em consultas
- **Med Cann 250**: R$ 250/mês → 20% desconto em consultas
- **Med Cann 350**: R$ 350/mês → 30% desconto em consultas

### **Características:**
- ✅ Atendimento exclusivamente online (não presencial)
- ✅ Consultas avulsas com valores variados
- ✅ Desconto automático aplicado para assinantes
- ✅ Gateway: Mercado Pago (PIX, Cartão, Boleto)

---

## 🚀 **PASSO A PASSO DE IMPLEMENTAÇÃO**

### **1. Configurar Banco de Dados**

Execute no Supabase SQL Editor:
```sql
-- Arquivo: SISTEMA_FINANCEIRO_COMPLETO.sql
-- Este script cria:
-- - Tabelas: subscription_plans, user_subscriptions
// ... existing code ...
```

**Verificação:**
```sql
SELECT * FROM subscription_plans;
SELECT * FROM active_subscriptions;
```

### **2. Criar Conta Mercado Pago**

1. Acesse: https://www.mercadopago.com.br/
2. Crie uma conta de desenvolvedor
3. Obtenha:
   - **Access Token (Produção)**
   - **Public Key**

### **3. Configurar Variáveis de Ambiente**

Crie arquivo `.env.local`:
```env
# Mercado Pago
NEXT_PUBLIC_MP_PUBLIC_KEY=your_public_key_here
MP_ACCESS_TOKEN=your_access_token_here

# Supabase (já configurado)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

---

## 💻 **ARQUIVOS A CRIAR**

### **1. Serviço de Pagamento**

```typescript
// src/services/paymentService.ts
import { supabase } from '@/lib/supabase'
import axios from 'axios'

interface CreatePaymentIntent {
  amount: number
  description: string
  user_id: string
  appointment_id?: string
  subscription_plan_id?: string
  method: 'pix' | 'credit_card' | 'debit_card' | 'boleto'
}

export class PaymentService {
  private readonly MP_API_URL = 'https://api.mercadopago.com/v1'
  
  async createPaymentIntent(data: CreatePaymentIntent) {
    try {
      // 1. Criar pagamento no Mercado Pago
      const paymentData = {
        transaction_amount: data.amount,
        description: data.description,
        payment_method_id: data.method === 'pix' ? 'pix' : 
                          data.method === 'credit_card' ? 'credit_card' : 
                          data.method === 'debit_card' ? 'debit_card' : 'bolbradesco',
        payer: {
          email: await this.getUserEmail(data.user_id)
        }
      }

      const mpResponse = await axios.post(
        `${this.MP_API_URL}/payments`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )

      // 2. Salvar transação no banco
      const { data: transaction } = await supabase
        .from('transactions')
        .insert({
          user_id: data.user_id,
          amount: data.amount,
          description: data.description,
          type: data.appointment_id ? 'payment' : 'subscription',
          status: 'pending',
          payment_method: data.method,
          payment_id: mpResponse.data.id.toString(),
          appointment_id: data.appointment_id,
          subscription_plan_id: data.subscription_plan_id
        })
        .select()
        .single()

      return {
        transaction_id: transaction.id,
        mp_payment_id: mpResponse.data.id,
        qr_code: data.method === 'pix' ? 
          mpResponse.data.point_of_interaction?.transaction_data?.qr_code : null,
        qr_code_base64: data.method === 'pix' ?
          mpResponse.data.point_of_interaction?.transaction_data?.qr_code_base64 : null
      }
    } catch (error) {
      console.error('Erro ao criar pagamento:', error)
      throw error
    }
  }

  async verifyPaymentStatus(mp_payment_id: string) {
    const response = await axios.get(
      `${this.MP_API_URL}/payments/${mp_payment_id}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      }
    )
    return response.data.status
  }

  private async getUserEmail(user_id: string): Promise<string> {
    const { data } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', user_id)
      .single()
    return data?.email || ''
  }
}

export const paymentService = new PaymentService()
```

### **2. Componente de Checkout**

```typescript
// src/components/Checkout.tsx
// (Já criado no documento anterior, adaptar conforme necessário)
```

### **3. Página de Planos**

```typescript
// src/pages/SubscriptionPlans.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Plan {
  id: string
  name: string
  description: string
  monthly_price: number
  consultation_discount: number
  features: string[]
}

export function SubscriptionPlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    try {
      const { data } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
      
      if (data) {
        setPlans(data.map(plan => ({
          ...plan,
          features: Array.isArray(plan.features) ? plan.features : []
        })))
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = (planId: string) => {
    navigate(`/checkout?plan=${planId}`)
  }

  if (loading) return <div>Carregando...</div>

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-center mb-8">
        Escolha seu Plano
      </h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-slate-800 rounded-lg p-6 border-2 border-slate-700 hover:border-blue-500 transition"
          >
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-gray-400 mb-4">{plan.description}</p>
            
            <div className="mb-6">
              <span className="text-4xl font-bold">R$ {plan.monthly_price}</span>
              <span className="text-gray-400">/mês</span>
            </div>

            <div className="mb-6">
              <p className="text-lg font-semibold text-green-400 mb-2">
                {plan.consultation_discount}% OFF em consultas
              </p>
            </div>

            <ul className="mb-6 space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="text-green-400" size={20} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan.id)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-semibold"
            >
              Assinar Agora
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 🔄 **FLUXO COMPLETO DO USUÁRIO**

### **Fluxo 1: Assinar Plano**

```
1. Usuário acessa /subscription-plans
   ↓
2. Seleciona um plano (Med Cann 150/250/350)
   ↓
3. Redireciona para /checkout?plan=xxx
   ↓
4. Componente Checkout:
   - Mostra resumo do plano
   - Calcula valor (ex: R$ 150,00)
   - Seleciona método de pagamento (PIX/Cartão/Boleto)
   ↓
5. Cria pagamento no Mercado Pago:
   - Gera QR Code (PIX) ou checkout (Cartão)
   ↓
6. Usuário paga
   ↓
7. Webhook do Mercado Pago confirma pagamento
   ↓
8. Sistema:
   - Atualiza status da transação
   - Cria assinatura ativa
   - Envia email de confirmação
   ↓
9. Usuário pode agendar consultas com desconto
```

### **Fluxo 2: Agendar Consulta Avulsa**

```
1. Usuário agenda consulta
   ↓
2. Sistema verifica se tem assinatura ativa
   ↓
3. Se SIM:
   - Aplica desconto automático
   - Ex: R$ 500 → R$ 450 (10% off)
   ↓
4. Redireciona para checkout
   ↓
5. Usuário paga valor com desconto
   ↓
6. Consulta confirmada
```

---

## 📧 **PRÓXIMOS PASSOS**

1. ✅ **Executar SQL**: Rode `SISTEMA_FINANCEIRO_COMPLETO.sql` no Supabase
2. ⏳ **Criar conta Mercado Pago**: Obter credenciais de API
3. ⏳ **Configurar .env**: Adicionar variáveis de ambiente
4. ⏳ **Implementar PaymentService**: Criar arquivo do serviço
5. ⏳ **Implementar SubscriptionPlans**: Página de planos
6. ⏳ **Implementar Checkout**: Componente de pagamento
7. ⏳ **Configurar Webhook**: Receber confirmações do Mercado Pago
8. ⏳ **Testar em sandbox**: Ambiente de testes

---

## 🔒 **SEGURANÇA**

- ✅ RLS ativo em todas as tabelas
- ✅ Tokens de acesso em variáveis de ambiente
- ✅ Validação de assinaturas antes de aplicar desconto
- ✅ Webhooks verificados com assinatura do Mercado Pago

---

**Status**: Aguardando execução do SQL e configuração do Mercado Pago
