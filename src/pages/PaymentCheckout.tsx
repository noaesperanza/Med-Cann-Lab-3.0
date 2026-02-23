import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { QrCode, CreditCard, Barcode, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface Plan {
  id: string
  name: string
  monthly_price: number
  setup_fee?: number // Taxa de Adesão
  consultation_discount: number
}


export function PaymentCheckout() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const planId = searchParams.get('plan')

  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'boleto'>('pix')
  const [qrCode, setQrCode] = useState<string>('')
  const [qrCodeValue, setQrCodeValue] = useState<string>('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadPlan()
  }, [planId])

  const loadPlan = async () => {
    try {
      let data = null

      if (planId) {
        const response = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('id', planId)
          .single()
        data = response.data
      }

      if (data) {
        setPlan(data)
      } else {
        // Fallback para plano mockado
        const mockPlans: Record<string, Plan> = {
          'mock-1': {
            id: 'mock-1',
            name: 'Plano Acesso - Básico',
            monthly_price: 60.00,
            setup_fee: 79.99,
            consultation_discount: 10
          },
          'mock-2': {
            id: 'mock-2',
            name: 'Plano Acesso - Premium',
            monthly_price: 60.00,
            setup_fee: 79.99,
            consultation_discount: 20
          },
          'mock-3': {
            id: 'mock-3',
            name: 'Plano Acesso - Familiar',
            monthly_price: 159.90,
            setup_fee: 99.90,
            consultation_discount: 30
          }
        }
        setPlan(planId ? mockPlans[planId] : mockPlans['mock-2'])
      }
    } catch (error) {
      console.error('Erro ao carregar plano:', error)
    } finally {
      setLoading(false)
    }
  }

  const generatePixQRCode = () => {
    // QR Code mockado (em produção, virá da API do Mercado Pago)
    const qrCodeData = {
      pixString: `00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-426655440000${plan?.monthly_price}00${plan?.name}`,
      qrCodeBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    }

    setQrCodeValue(qrCodeData.pixString)
    setQrCode(qrCodeData.qrCodeBase64)
  }

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

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeValue)
      alert('Código PIX copiado!')
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400">Plano não encontrado</p>
          <button
            onClick={() => navigate('/app/subscription-plans')}
            className="mt-4 text-blue-500 hover:underline"
          >
            Voltar para planos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, rgba(10,25,47,0.98) 0%, rgba(15,35,55,0.95) 50%, rgba(10,40,35,0.92) 100%)' }}>
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Finalizar Pagamento
          </h1>
          <p className="text-gray-300">
            Conclua sua assinatura
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Resumo da Compra */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Resumo do Pedido</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-300">
                <span>Plano:</span>
                <span className="font-semibold text-white">{plan.name}</span>
              </div>

              <div className="flex justify-between text-gray-300">
                <span>Desconto em consultas:</span>
                <span className="font-semibold text-green-400">{plan.consultation_discount}%</span>
              </div>

              <div className="flex justify-between text-gray-300">
                <span>Mensalidade:</span>
                <span className="font-semibold text-white">R$ {plan.monthly_price.toFixed(2)}</span>
              </div>

              {plan.setup_fee && (
                <div className="flex justify-between text-gray-300">
                  <span>Taxa de Adesão (Única):</span>
                  <span className="font-semibold text-amber-400">R$ {plan.setup_fee.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-slate-700 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-white">Total Hoje:</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-emerald-400">
                      R$ {((plan.setup_fee || 0) + (0)).toFixed(2)}
                      {/* O usuário paga Adesão agora. A mensalidade é recorrente (30 dias). 
                          Se quiser cobrar a primeira mensalidade JUNTO, somar. 
                          Geralmente Adesão cobra a entrada. Vamos somar Setup + 1ª Mensalidade ou só Setup? 
                          User disse "inscricao 70... mensal 55". Geralmente cobra TUDO na entrada ou SÓ inscrição.
                          Vou somar Setup Fee + 0 (Considerando que Adesão cobre o Mês 1 ou cobrar separado).
                          DECISÃO: Cobrar ADESÃO agora. Mensalidade em 30 dias.
                          Mas para simplificar e garantir caixa: Total = Setup Fee.
                      */}
                    </span>
                    <p className="text-xs text-gray-400">cobrança única imediata</p>
                  </div>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-sm text-gray-400">Recorrência mensal (30 dias): </span>
                  <span className="text-sm font-semibold text-white">R$ {plan.monthly_price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Informações adicionais */}
            <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
              <p className="text-sm text-gray-300">
                ✓ Cancelamento a qualquer momento
              </p>
              <p className="text-sm text-gray-300">
                ✓ Sem taxas de cancelamento
              </p>
              <p className="text-sm text-gray-300">
                ✓ Acesso imediato após pagamento
              </p>
            </div>
          </div>

          {/* Método de Pagamento */}
          <div className="space-y-6">
            {/* Seleção de Método */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">
                Método de Pagamento
              </h2>

              <div className="space-y-3">
                {/* PIX */}
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`w-full p-4 rounded-lg flex items-center gap-3 transition-all ${paymentMethod === 'pix'
                    ? 'bg-emerald-600 border-2 border-emerald-500'
                    : 'bg-slate-700 border-2 border-slate-600 hover:border-emerald-500'
                    }`}
                >
                  <QrCode size={24} className="text-white" />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-white">PIX</p>
                    <p className="text-xs text-gray-300">Aprovação imediata</p>
                  </div>
                  {paymentMethod === 'pix' && (
                    <div className="w-5 h-5 rounded-full bg-white"></div>
                  )}
                </button>

                {/* Cartão */}
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-4 rounded-lg flex items-center gap-3 transition-all ${paymentMethod === 'card'
                    ? 'bg-emerald-600 border-2 border-emerald-500'
                    : 'bg-slate-700 border-2 border-slate-600 hover:border-emerald-500'
                    }`}
                >
                  <CreditCard size={24} className="text-white" />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-white">Cartão de Crédito</p>
                    <p className="text-xs text-gray-300">Em até 12x sem juros</p>
                  </div>
                  {paymentMethod === 'card' && (
                    <div className="w-5 h-5 rounded-full bg-white"></div>
                  )}
                </button>

                {/* Boleto */}
                <button
                  onClick={() => setPaymentMethod('boleto')}
                  className={`w-full p-4 rounded-lg flex items-center gap-3 transition-all ${paymentMethod === 'boleto'
                    ? 'bg-emerald-600 border-2 border-emerald-500'
                    : 'bg-slate-700 border-2 border-slate-600 hover:border-emerald-500'
                    }`}
                >
                  <Barcode size={24} className="text-white" />
                  <div className="text-left flex-1">
                    <p className="font-semibold text-white">Boleto Bancário</p>
                    <p className="text-xs text-gray-300">Aprovação em 3 dias úteis</p>
                  </div>
                  {paymentMethod === 'boleto' && (
                    <div className="w-5 h-5 rounded-full bg-white"></div>
                  )}
                </button>
              </div>
            </div>

            {/* QR Code PIX */}
            {paymentMethod === 'pix' && qrCode && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">
                  Escaneie o QR Code
                </h3>

                <div className="bg-white p-4 rounded-lg mb-4 flex justify-center">
                  <img src={qrCode} alt="QR Code PIX" className="w-64 h-64" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-300">
                    Ou copie o código PIX:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={qrCodeValue}
                      readOnly
                      className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-mono"
                    />
                    <button
                      onClick={handleCopyPix}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-xs text-yellow-400 text-center">
                    ⏱️ Este código expira em 30 minutos
                  </p>
                </div>
              </div>
            )}

            {/* Botão de Pagamento */}
            <button
              onClick={handlePayment}
              disabled={processing || (paymentMethod === 'pix' && Boolean(qrCode))}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2"
            >
              {processing && <Loader2 className="animate-spin" size={20} />}
              {processing
                ? 'Processando...'
                : (qrCode ? 'QR Code Gerado' : 'Confirmar Pagamento')
              }
            </button>

            <button
              onClick={() => navigate('/app/subscription-plans')}
              className="w-full text-gray-400 hover:text-white text-sm"
            >
              ← Voltar para planos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
