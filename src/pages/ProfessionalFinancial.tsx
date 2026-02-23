import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, TrendingDown, FileText, Download, Filter, Users, BarChart3, Target, Lightbulb, AlertCircle, Zap } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Componente para ícone de dinheiro (igual ao usado na Sidebar)
const BanknoteIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="12" x="2" y="6" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
)

// Tipos de assinatura da plataforma
const SUBSCRIPTION_PLANS = [
  { id: 'basic', name: 'MedCann Basic', price: 150, color: 'blue', slots: 20 },
  { id: 'professional', name: 'MedCann Professional', price: 250, color: 'purple', slots: 40 },
  { id: 'premium', name: 'MedCann Premium', price: 350, color: 'gold', slots: 60 }
]

// Consultórios cadastrados
const CLINICS = [
  { id: 'ricardo', name: 'Consultório Dr. Ricardo Valença', slots: 30, color: 'blue' },
  { id: 'eduardo', name: 'Consultório Dr. Eduardo Faveret', slots: 40, color: 'green' }
]

// Análise SWOT em tempo real
const SWOT_CATEGORIES = [
  { id: 'strengths', name: 'Forças', icon: Zap, color: 'green' },
  { id: 'weaknesses', name: 'Fraquezas', icon: AlertCircle, color: 'red' },
  { id: 'opportunities', name: 'Oportunidades', icon: Lightbulb, color: 'blue' },
  { id: 'threats', name: 'Ameaças', icon: Target, color: 'orange' }
]

export function ProfessionalFinancial() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month')
  const [loading, setLoading] = useState(true)
  const [selectedSubscription, setSelectedSubscription] = useState('professional')
  const [selectedClinic, setSelectedClinic] = useState('all')
  const [simulatorMode, setSimulatorMode] = useState(false)
  const [swotFilter, setSwotFilter] = useState<string>('all')
  const [targetConsultations, setTargetConsultations] = useState(100)

  const [financialData, setFinancialData] = useState({
    revenue: 0,
    expenses: 0,
    platformFee: 0,
    netIncome: 0,
    growthRate: 0,
    totalConsultations: 0,
    totalSubscriptions: 0,
    averageTicket: 0,
    activePatients: 0
  })
  const [transactions, setTransactions] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [simulation, setSimulation] = useState<any>(null)

  useEffect(() => {
    if (user) {
      loadFinancialData()
    }
  }, [user, period])

  useEffect(() => {
    if (simulatorMode) {
      calculateSimulation()
    }
  }, [selectedSubscription, selectedClinic, targetConsultations, period, simulatorMode])

  const loadFinancialData = async () => {
    try {
      setLoading(true)

      const now = new Date()
      let startDate: Date

      switch (period) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3)
          startDate = new Date(now.getFullYear(), quarter * 3, 1)
          break
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1)
          break
      }

      const { data: transactionsData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .eq('doctor_id', user?.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (transError) {
        console.warn('⚠️ Erro ao buscar transações (tabela pode não existir ou sem acesso):', transError.message)
        // Continua com dados vazios em caso de erro
      }

      const { data: subscriptionsData, error: subsError } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', user?.id)
        .eq('status', 'active')

      if (subsError) {
        console.warn('⚠️ Erro ao buscar assinaturas (tabela pode não existir ou sem acesso):', subsError.message)
        // Continua com dados vazios em caso de erro
      }

      const { data: appointmentsData, error: apptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user?.id)
        .gte('appointment_date', startDate.toISOString())

      if (apptError) console.error('Erro ao buscar agendamentos:', apptError)

      const revenue = transactionsData?.reduce((sum, t) =>
        t.type === 'consultation' ? sum + parseFloat(String(t.amount ?? 0)) : sum, 0) || 0

      const platformFee = revenue * 0.1
      const expenses = transactionsData?.reduce((sum, t) =>
        t.type === 'fee' ? sum + parseFloat(String(t.amount ?? 0)) : sum, 0) || 0

      const netIncome = revenue - platformFee - expenses

      const totalConsultations = appointmentsData?.length || 0
      const averageTicket = totalConsultations > 0 ? revenue / totalConsultations : 0

      const totalSubscriptions = subscriptionsData?.length || 0
      const subscriptionRevenue = subscriptionsData?.reduce((sum, sub) =>
        sum + (parseFloat(String((sub as any).subscription_plans?.price || 0))), 0) || 0

      const growthRate = 12.5

      setFinancialData({
        revenue: revenue + subscriptionRevenue,
        expenses,
        platformFee,
        netIncome,
        growthRate,
        totalConsultations,
        totalSubscriptions,
        averageTicket,
        activePatients: appointmentsData?.length || 0
      })

      setTransactions(transactionsData || [])
      setSubscriptions(subscriptionsData || [])

    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSimulation = () => {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === selectedSubscription)
    const clinic = selectedClinic !== 'all' ? CLINICS.find(c => c.id === selectedClinic) : null

    // Calcular capacidade baseada no plano e consultório
    const maxSlots = clinic ? clinic.slots : plan?.slots || 40
    const subscriptionRevenue = plan?.price || 250
    const consultationsPerMonth = Math.min(targetConsultations, maxSlots)
    const consultationRevenue = consultationsPerMonth * (subscriptionRevenue / plan!.slots)
    const totalRevenue = subscriptionRevenue + consultationRevenue

    // Cálculos financeiros
    const platformFee = totalRevenue * 0.1
    const operationalExpenses = totalRevenue * 0.15 // 15% de custos operacionais
    const netIncome = totalRevenue - platformFee - operationalExpenses

    // ROI e métricas
    const roi = ((netIncome / (subscriptionRevenue + operationalExpenses)) * 100).toFixed(1)
    const growthRate = ((consultationsPerMonth / 30) - 1) * 100

    // Calcular projeção anual
    const annualRevenue = totalRevenue * 12
    const annualNetIncome = netIncome * 12
    const breakEvenPoint = Math.ceil((subscriptionRevenue + operationalExpenses) / (consultationRevenue / consultationsPerMonth))

    setSimulation({
      plan,
      clinic,
      maxSlots,
      subscriptionRevenue,
      consultationsPerMonth,
      consultationRevenue,
      totalRevenue,
      platformFee,
      operationalExpenses,
      netIncome,
      roi,
      growthRate: parseFloat(growthRate.toFixed(2)),
      annualRevenue,
      annualNetIncome,
      breakEvenPoint,
      utilizationRate: ((consultationsPerMonth / maxSlots) * 100).toFixed(1)
    })
  }

  const getPeriodLabel = () => {
    switch (period) {
      case 'month': return 'Este Mês'
      case 'quarter': return 'Este Trimestre'
      case 'year': return 'Este Ano'
    }
  }

  const getSwotCategoryColor = (category: string) => {
    const cat = SWOT_CATEGORIES.find(c => c.id === category)
    return cat?.color || 'gray'
  }

  const getInvestmentRecommendation = () => {
    if (!simulation) return null

    const utilization = parseFloat(simulation.utilizationRate)
    const roi = parseFloat(simulation.roi)

    // Se há um filtro SWOT ativo, mostrar apenas recomendações dessa categoria
    if (swotFilter !== 'all') {
      if (swotFilter === 'strengths' && utilization > 80 && roi > 50) {
        return {
          type: 'strengths',
          title: 'Excelente Oportunidade de Expansão',
          message: 'Sua capacidade está quase esgotada. Considere expandir para mais consultórios ou aumentar a capacidade.',
          action: 'Investir em Expansão'
        }
      }
      if (swotFilter === 'weaknesses' && utilization < 40) {
        return {
          type: 'weaknesses',
          title: 'Capacidade Ociosa Detectada',
          message: 'Você está usando menos de 40% da capacidade. Considere marketing para atrair mais pacientes.',
          action: 'Investir em Marketing'
        }
      }
      if (swotFilter === 'opportunities' && roi > 30) {
        return {
          type: 'opportunities',
          title: 'ROI Positivo - Crescer com Segurança',
          message: 'Seu retorno sobre investimento está excelente. Pode investir em melhorias.',
          action: 'Investir em Tecnologia'
        }
      }
      if (swotFilter === 'threats' && roi <= 30) {
        return {
          type: 'threats',
          title: 'Atenção à Rentabilidade',
          message: 'Seu ROI está abaixo do ideal. Otimize custos antes de expandir.',
          action: 'Otimizar Custos'
        }
      }
      // Se o filtro está ativo mas não corresponde à situação atual
      return {
        type: swotFilter,
        title: `Sem ${SWOT_CATEGORIES.find(c => c.id === swotFilter)?.name} Detectadas`,
        message: `A análise atual não apresenta elementos de ${SWOT_CATEGORIES.find(c => c.id === swotFilter)?.name.toLowerCase()} no cenário simulado.`,
        action: 'Ajustar Parâmetros'
      }
    }

    // Sem filtro ativo - mostrar recomendações completas
    if (utilization > 80 && roi > 50) {
      return {
        type: 'strengths',
        title: 'Excelente Oportunidade de Expansão',
        message: 'Sua capacidade está quase esgotada. Considere expandir para mais consultórios ou aumentar a capacidade.',
        action: 'Investir em Expansão'
      }
    } else if (utilization < 40) {
      return {
        type: 'weaknesses',
        title: 'Capacidade Ociosa Detectada',
        message: 'Você está usando menos de 40% da capacidade. Considere marketing para atrair mais pacientes.',
        action: 'Investir em Marketing'
      }
    } else if (roi > 30) {
      return {
        type: 'opportunities',
        title: 'ROI Positivo - Crescer com Segurança',
        message: 'Seu retorno sobre investimento está excelente. Pode investir em melhorias.',
        action: 'Investir em Tecnologia'
      }
    } else {
      return {
        type: 'threats',
        title: 'Atenção à Rentabilidade',
        message: 'Seu ROI está abaixo do ideal. Otimize custos antes de expandir.',
        action: 'Otimizar Custos'
      }
    }
  }

  const getSwotInsights = () => {
    if (!simulation) return []

    const utilization = parseFloat(simulation.utilizationRate)
    const roi = parseFloat(simulation.roi)
    const insights = []

    if (swotFilter === 'all' || swotFilter === 'strengths') {
      if (utilization > 80) {
        insights.push({
          category: 'strengths',
          icon: Zap,
          title: 'Alta Utilização de Capacidade',
          description: `${utilization}% da capacidade está sendo utilizada. Bom sinal de demanda.`,
          color: 'green'
        })
      }
      if (roi > 50) {
        insights.push({
          category: 'strengths',
          icon: TrendingUp,
          title: 'ROI Excepcional',
          description: `ROI de ${simulation.roi}% indica investimento muito rentável.`,
          color: 'green'
        })
      }
    }

    if (swotFilter === 'all' || swotFilter === 'weaknesses') {
      if (utilization < 40) {
        insights.push({
          category: 'weaknesses',
          icon: AlertCircle,
          title: 'Baixa Utilização',
          description: `Apenas ${utilization}% da capacidade utilizada. Investir em captação.`,
          color: 'red'
        })
      }
      if (roi < 20) {
        insights.push({
          category: 'weaknesses',
          icon: TrendingDown,
          title: 'ROI Baixo',
          description: `ROI de ${simulation.roi}% indica necessidade de otimização.`,
          color: 'red'
        })
      }
    }

    if (swotFilter === 'all' || swotFilter === 'opportunities') {
      if (simulation.netIncome > 5000) {
        insights.push({
          category: 'opportunities',
          icon: Lightbulb,
          title: 'Boa Geração de Caixa',
          description: `Lucro líquido de R$ ${simulation.netIncome.toFixed(2)} permite investimentos.`,
          color: 'blue'
        })
      }
      if (simulation.utilizationRate > 60 && simulation.utilizationRate < 80) {
        insights.push({
          category: 'opportunities',
          icon: Target,
          title: 'Crescimento Sustentável',
          description: `${utilization}% de utilização - espaço para crescimento controlado.`,
          color: 'blue'
        })
      }
    }

    if (swotFilter === 'all' || swotFilter === 'threats') {
      if (simulation.platformFee > simulation.netIncome * 0.2) {
        insights.push({
          category: 'threats',
          icon: AlertCircle,
          title: 'Taxas Elevadas',
          description: `Comissões representam mais de 20% do lucro líquido.`,
          color: 'orange'
        })
      }
      if (simulation.breakEvenPoint > simulation.maxSlots * 0.8) {
        insights.push({
          category: 'threats',
          icon: TrendingDown,
          title: 'Break-Even Arriscado',
          description: `Precisa de ${simulation.breakEvenPoint} consultas para cobrir custos.`,
          color: 'orange'
        })
      }
    }

    return insights
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, rgba(10,25,47,0.98) 0%, rgba(15,35,55,0.95) 50%, rgba(10,40,35,0.92) 100%)' }}>
        <div className="flex items-center justify-center h-96">
          <div className="text-white text-xl">Carregando dados financeiros...</div>
        </div>
      </div>
    )
  }

  const recommendation = getInvestmentRecommendation()

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(135deg, rgba(10,25,47,0.98) 0%, rgba(15,35,55,0.95) 50%, rgba(10,40,35,0.92) 100%)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              💰 Simulador Financeiro e Investimentos
            </h1>
            <p className="text-gray-300">
              Gestão financeira avançada com análise SWOT em tempo real • {getPeriodLabel()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSimulatorMode(!simulatorMode)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all text-white"
              style={{ background: simulatorMode ? 'rgba(139,92,246,0.8)' : 'linear-gradient(135deg, #00c16a 0%, #00a85a 100%)' }}
            >
              <BarChart3 size={20} />
              {simulatorMode ? 'Ver Dados Reais' : 'Ativar Simulador'}
            </button>

            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold">
              <Download size={20} />
              Exportar Relatório
            </button>
          </div>
        </div>

        {/* Simulator Controls */}
        {simulatorMode && (
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-500/20 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">🎯 Simulador de Investimento</h3>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Seleção de Assinatura */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Plano de Assinatura
                </label>
                <select
                  value={selectedSubscription}
                  onChange={(e) => setSelectedSubscription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                >
                  {SUBSCRIPTION_PLANS.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - R$ {plan.price}/mês
                    </option>
                  ))}
                </select>
              </div>

              {/* Seleção de Consultório */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Consultório
                </label>
                <select
                  value={selectedClinic}
                  onChange={(e) => setSelectedClinic(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="all">Todos os Consultórios</option>
                  {CLINICS.map(clinic => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Meta de Consultas */}
              <div>
                <label className="block text-gray-300 text-sm font-semibold mb-2">
                  Meta de Consultas/Mês
                </label>
                <input
                  type="number"
                  value={targetConsultations}
                  onChange={(e) => setTargetConsultations(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  min="0"
                  max={selectedClinic !== 'all' ? CLINICS.find(c => c.id === selectedClinic)?.slots || 60 : 100}
                />
              </div>
            </div>

            {/* SWOT Filter */}
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-3">
                Análise SWOT
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSwotFilter('all')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${swotFilter === 'all'
                    ? 'text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  style={swotFilter === 'all' ? { background: 'linear-gradient(135deg, #00c16a 0%, #00a85a 100%)' } : {}}
                >
                  Todas
                </button>
                {SWOT_CATEGORIES.map(cat => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSwotFilter(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${swotFilter === cat.id
                        ? 'text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                        }`}
                      style={swotFilter === cat.id ? { background: 'linear-gradient(135deg, #00c16a 0%, #00a85a 100%)' } : {}}
                    >
                      <Icon size={18} />
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}



        {/* Investment Recommendation */}
        {
          recommendation && simulatorMode && (
            <>
              <div className={`bg-gradient-to-r from-${recommendation.type === 'strengths' ? 'green' : recommendation.type === 'weaknesses' ? 'red' : recommendation.type === 'opportunities' ? 'blue' : 'orange'}-900/30 to-slate-900/30 border border-${recommendation.type === 'strengths' ? 'green' : recommendation.type === 'weaknesses' ? 'red' : recommendation.type === 'opportunities' ? 'blue' : 'orange'}-500/30 rounded-xl p-6 mb-8`}>
                <div className="flex items-start gap-4">
                  <Target className="text-white" size={32} />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{recommendation.title}</h3>
                    <p className="text-gray-300 mb-4">{recommendation.message}</p>
                    <button
                      onClick={() => {
                        // Função para executar ação
                        alert(`Executando: ${recommendation.action}`)
                      }}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
                    >
                      {recommendation.action}
                    </button>
                  </div>
                </div>
              </div>

              {/* SWOT Insights */}
              {getSwotInsights().length > 0 && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">
                    {swotFilter === 'all' ? '🔍 Análise SWOT Completa' : `🔍 Filtro: ${SWOT_CATEGORIES.find(c => c.id === swotFilter)?.name}`}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {getSwotInsights().map((insight, index) => {
                      const Icon = insight.icon
                      return (
                        <div key={index} className={`bg-${insight.color}-900/20 border border-${insight.color}-500/30 rounded-lg p-4`}>
                          <div className="flex items-start gap-3">
                            <Icon className={`text-${insight.color}-400 mt-1`} size={24} />
                            <div>
                              <h4 className="text-white font-semibold mb-1">{insight.title}</h4>
                              <p className="text-gray-300 text-sm">{insight.description}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          )
        }

        {/* Period Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${period === 'month'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
          >
            Este Mês
          </button>
          <button
            onClick={() => setPeriod('quarter')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${period === 'quarter'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
          >
            Trimestre
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${period === 'year'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
          >
            Ano
          </button>
        </div>

        {/* Main Financial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-green-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-400" size={24} />
              </div>
              <span className="text-green-400 text-sm font-semibold">
                {financialData.growthRate > 0 ? '+' : ''}{financialData.growthRate}%
              </span>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Receita Total</h3>
            <p className="text-3xl font-bold text-white">
              R$ {simulatorMode && simulation ? simulation.totalRevenue.toFixed(2) : financialData.revenue.toFixed(2)}
            </p>
            {simulatorMode && simulation && (
              <p className="text-xs text-purple-400 mt-2">
                Projeção Simulada
              </p>
            )}
          </div>

          {/* Platform Fee */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-orange-500 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <BanknoteIcon className="text-orange-400" size={24} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Comissão da Plataforma</h3>
            <p className="text-3xl font-bold text-white">
              R$ {simulatorMode && simulation ? simulation.platformFee.toFixed(2) : financialData.platformFee.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-2">10% sobre receita</p>
          </div>

          {/* ROI (simulador) */}
          {simulatorMode && simulation && (
            <div className="bg-slate-800 rounded-xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Target className="text-purple-400" size={24} />
                </div>
              </div>
              <h3 className="text-gray-400 text-sm mb-2">ROI Projetado</h3>
              <p className="text-3xl font-bold text-purple-400">{simulation.roi}%</p>
              <p className="text-xs text-gray-400 mt-2">Retorno sobre investimento</p>
            </div>
          )}

          {/* Net Income */}
          <div className="bg-slate-800 rounded-xl p-6 border border-green-500/30 hover:border-green-400 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-400" size={24} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm mb-2">Lucro Líquido</h3>
            <p className="text-3xl font-bold text-green-400">
              R$ {simulatorMode && simulation ? simulation.netIncome.toFixed(2) : financialData.netIncome.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-2">Disponível para saque</p>
          </div>
        </div>

        {/* Simulation Details */}
        {
          simulatorMode && simulation && (
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-gray-400 text-sm mb-2">Capacidade Máxima</h3>
                <p className="text-3xl font-bold text-white">{simulation.maxSlots}</p>
                <p className="text-xs text-gray-400 mt-2">Consultas/mês</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-gray-400 text-sm mb-2">Taxa de Utilização</h3>
                <p className="text-3xl font-bold text-white">{simulation.utilizationRate}%</p>
                <p className="text-xs text-gray-400 mt-2">Capacidade em uso</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-gray-400 text-sm mb-2">Break-Even Point</h3>
                <p className="text-3xl font-bold text-white">{simulation.breakEvenPoint}</p>
                <p className="text-xs text-gray-400 mt-2">Consultas necessárias</p>
              </div>
            </div>
          )
        }

        {/* Sustentabilidade & Modelo de Negócio */}
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">🌱 Modelo de Negócio Sustentável - Nôa Esperanza</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Monetização Sustentável */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-green-500/20">
              <h3 className="text-xl font-bold text-green-400 mb-4">💰 Receitas Sustentáveis</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <h4 className="text-white font-semibold">Assinaturas Educacionais</h4>
                    <p className="text-gray-400 text-sm">Conteúdo exclusivo sobre saúde sustentável e práticas ecológicas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <h4 className="text-white font-semibold">Consultoria em Sustentabilidade</h4>
                    <p className="text-gray-400 text-sm">Serviços para reduzir pegada de carbono no setor de saúde</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <h4 className="text-white font-semibold">Marketplace Sustentável</h4>
                    <p className="text-gray-400 text-sm">Plataforma para produtos e serviços ecológicos</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 text-xl">✓</span>
                  <div>
                    <h4 className="text-white font-semibold">Licenciamento de IA</h4>
                    <p className="text-gray-400 text-sm">Tecnologia Nôa Esperanza para instituições parceiras</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Impacto e Equidade */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-blue-500/20">
              <h3 className="text-xl font-bold text-blue-400 mb-4">🤝 Impacto Social e Equidade</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Lightbulb className="text-blue-400 mt-1" size={20} />
                  <div>
                    <h4 className="text-white font-semibold">Programas Educacionais</h4>
                    <p className="text-gray-400 text-sm">Workshops e capacitação em práticas sustentáveis</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="text-blue-400 mt-1" size={20} />
                  <div>
                    <h4 className="text-white font-semibold">Plataforma Comunitária</h4>
                    <p className="text-gray-400 text-sm">Fóruns de discussão e troca de conhecimento</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Target className="text-blue-400 mt-1" size={20} />
                  <div>
                    <h4 className="text-white font-semibold">Iniciativas de Saúde Comunitária</h4>
                    <p className="text-gray-400 text-sm">Programas focados em equidade e acessibilidade</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="text-blue-400 mt-1" size={20} />
                  <div>
                    <h4 className="text-white font-semibold">Parcerias Público-Privadas</h4>
                    <p className="text-gray-400 text-sm">Colaboração com governos e organizações</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas de Impacto */}
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-800 rounded-lg p-4 border border-green-500/20">
              <h4 className="text-gray-400 text-sm mb-2">Receita Recorrente</h4>
              <p className="text-2xl font-bold text-green-400">
                {subscriptions.reduce((sum, s) => sum + parseFloat(String((s as any).subscription_plans?.price || 0)), 0).toFixed(0)}%
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-blue-500/20">
              <h4 className="text-gray-400 text-sm mb-2">Parcerias Ativas</h4>
              <p className="text-2xl font-bold text-blue-400">12+</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-purple-500/20">
              <h4 className="text-gray-400 text-sm mb-2">Redução de Carbono</h4>
              <p className="text-2xl font-bold text-purple-400">-23%</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 border border-orange-500/20">
              <h4 className="text-gray-400 text-sm mb-2">Impacto Social</h4>
              <p className="text-2xl font-bold text-orange-400">850+</p>
              <p className="text-xs text-gray-500 mt-1">pessoas impactadas</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-6 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold mb-1">Expanda seu Impacto Sustentável</h3>
                <p className="text-gray-300 text-sm">Integre estratégias de monetização sustentável com impacto social positivo</p>
              </div>
              <button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap">
                Saiba Mais
              </button>
            </div>
          </div>
        </div>

        {/* Info Box - Modelo Escalável */}
        <div className="mt-6 bg-gradient-to-r from-blue-500/10 to-green-500/10 border border-blue-500/20 rounded-xl p-6">
          <h3 className="text-blue-400 font-semibold mb-2">💡 Visão Estratégica: Marketplace Médico Sustentável</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <p className="mb-2"><strong>Receitas Diversificadas:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Assinaturas mensais (R$150-350)</li>
                <li>Consultas virtuais e presenciais</li>
                <li>Licenciamento de IA Nôa Esperanza</li>
                <li>Consultoria em sustentabilidade</li>
              </ul>
            </div>
            <div>
              <p className="mb-2"><strong>Impacto Mensurável:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-gray-400">
                <li>Redução de deslocamentos (telemedicina)</li>
                <li>Acesso democratizado à saúde de qualidade</li>
                <li>Educação continuada em práticas ecológicas</li>
                <li>Parcerias público-privadas escaláveis</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-500/20">
            <p className="text-gray-300 text-sm">
              <strong>Escalabilidade:</strong> O modelo combina receita recorrente (assinaturas), receita transacional (consultas)
              e receita de impacto (licenciamento). Quanto mais profissionais, pacientes e parceiros na plataforma, maior é o
              impacto positivo no sistema de saúde e no meio ambiente. <strong>Nôa Esperanza</strong> é o diferencial competitivo
              que conecta todos os atores deste ecossistema sustentável.
            </p>
          </div>
        </div>
      </div>
    </div>

  )
}

