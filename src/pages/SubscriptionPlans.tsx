import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
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
      
      // Fallback para dados mockados caso a API falhe
      setPlans([
        {
          id: 'mock-1',
          name: 'Med Cann 150',
          description: 'Plano básico com desconto de 10% nas consultas exclusivamente online',
          monthly_price: 150.00,
          consultation_discount: 10,
          features: [
            'Desconto de 10% em consultas online',
            'Acesso à biblioteca de documentos',
            'Suporte via chat',
            'Avaliação IMRE inicial'
          ]
        },
        {
          id: 'mock-2',
          name: 'Med Cann 250',
          description: 'Plano intermediário com desconto de 20% nas consultas exclusivamente online',
          monthly_price: 250.00,
          consultation_discount: 20,
          features: [
            'Desconto de 20% em consultas online',
            'Tudo do plano anterior',
            'Consultas prioritárias',
            'Relatórios detalhados',
            'Acesso a cursos online'
          ]
        },
        {
          id: 'mock-3',
          name: 'Med Cann 350',
          description: 'Plano premium com desconto de 30% nas consultas exclusivamente online',
          monthly_price: 350.00,
          consultation_discount: 30,
          features: [
            'Desconto de 30% em consultas online',
            'Tudo dos planos anteriores',
            'Suporte prioritário 24/7',
            'Consultas ilimitadas',
            'Acesso completo à plataforma',
            'Reembolsos garantidos'
          ]
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPlan = (planId: string) => {
    navigate(`/app/checkout?plan=${planId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Carregando planos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Escolha seu Plano
          </h1>
          <p className="text-gray-300 text-lg">
            Descontos em consultas exclusivamente online
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`bg-slate-800 rounded-xl p-8 border-2 transition-all hover:scale-105 ${
                index === 1
                  ? 'border-blue-500 border-4 shadow-xl shadow-blue-500/20'
                  : 'border-slate-700 hover:border-blue-500'
              }`}
            >
              {/* Badge para plano intermediário */}
              {index === 1 && (
                <div className="text-center mb-4">
                  <span className="bg-blue-500 text-white text-sm font-bold px-4 py-1 rounded-full">
                    MAIS POPULAR
                  </span>
                </div>
              )}

              {/* Nome do Plano */}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 mb-6 text-sm">{plan.description}</p>

              {/* Preço */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">
                    R$ {plan.monthly_price.toFixed(2)}
                  </span>
                  <span className="text-gray-400">/mês</span>
                </div>
              </div>

              {/* Desconto */}
              <div className="mb-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-lg font-semibold text-green-400 text-center">
                  {plan.consultation_discount}% OFF em consultas
                </p>
              </div>

              {/* Benefícios */}
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="text-green-400 mt-0.5 flex-shrink-0" size={20} />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Botão */}
              <button
                onClick={() => handleSelectPlan(plan.id)}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  index === 1
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                Assinar Agora
              </button>
            </div>
          ))}
        </div>

        {/* Informação adicional */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            Todos os planos incluem atendimento exclusivamente online. Os descontos se aplicam apenas em consultas via plataforma.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Cancelamento a qualquer momento. Sem taxas de cancelamento.
          </p>
        </div>
      </div>
    </div>
  )
}
