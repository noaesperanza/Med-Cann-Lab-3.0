import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
  Crown, Calendar, Award, TrendingUp, Users, Gift,
  CreditCard, Clock, Star, ArrowRight, Loader2,
  Percent, Coins, Share2, CheckCircle2, AlertCircle, Shield
} from 'lucide-react'
import { format, differenceInDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface SubscriptionData {
  id: string
  plan_name: string
  monthly_price: number
  consultation_discount: number
  status: string
  started_at: string
  expires_at: string
  next_billing_at: string
  auto_renew: boolean
  is_active: boolean
}

interface ProfileData {
  points: number
  level: number
  achievements: string[]
}

interface RankingData {
  position: number | null
  tier: string
  percentile: number
}

interface ReferralData {
  code: string
  total_referrals: number
  active_referrals: number
  total_bonus: number
}

interface TransactionData {
  id: string
  amount: number
  description: string
  type: string
  status: string
  created_at: string
  discount_applied: number | null
}

// Regras de cashback e desconto conforme normas brasileiras (CDC)
const CASHBACK_RATE = 0.087 // 8.7%
const XP_DISCOUNT_TIERS = [
  { minXp: 0, maxXp: 499, discount: 0, label: 'Iniciante' },
  { minXp: 500, maxXp: 1499, discount: 5, label: 'Bronze' },
  { minXp: 1500, maxXp: 3999, discount: 10, label: 'Prata' },
  { minXp: 4000, maxXp: 7999, discount: 15, label: 'Ouro' },
  { minXp: 8000, maxXp: Infinity, discount: 20, label: 'Diamante' },
]

function getXpTier(xp: number) {
  return XP_DISCOUNT_TIERS.find(t => xp >= t.minXp && xp <= t.maxXp) || XP_DISCOUNT_TIERS[0]
}

function getNextTier(xp: number) {
  const currentIdx = XP_DISCOUNT_TIERS.findIndex(t => xp >= t.minXp && xp <= t.maxXp)
  return currentIdx < XP_DISCOUNT_TIERS.length - 1 ? XP_DISCOUNT_TIERS[currentIdx + 1] : null
}

export default function PatientFinancialDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [ranking, setRanking] = useState<RankingData>({ position: null, tier: 'STANDARD', percentile: 1 })
  const [referral, setReferral] = useState<ReferralData>({ code: '', total_referrals: 0, active_referrals: 0, total_bonus: 0 })
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [cashbackAccumulated, setCashbackAccumulated] = useState(0)
  const [isPaid, setIsPaid] = useState(false)

  // Admins são automaticamente VIP/exempt
  const isAdmin = user?.type === 'admin' || (user as any)?.role === 'admin' || (user as any)?.role === 'master'

  useEffect(() => {
    if (user?.id) {
      if (isAdmin) setIsPaid(true)
      loadAll()
    }
  }, [user?.id])

  const loadAll = async () => {
    setLoading(true)
    await Promise.all([
      loadSubscription(),
      loadProfile(),
      loadRanking(),
      loadReferral(),
      loadTransactions(),
    ])
    setLoading(false)
  }

  const loadSubscription = async () => {
    try {
      // Verificar assinatura ativa
      const { data: sub } = await supabase
        .from('active_subscriptions')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .maybeSingle()

      if (sub) {
        setSubscription(sub)
        setIsPaid(true)
        return
      }

      // Verificar user_subscriptions
      const { data: userSub } = await supabase
        .from('user_subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .maybeSingle()

      if (userSub) {
        setSubscription({
          id: userSub.id,
          plan_name: userSub.subscription_plans?.name || 'Premium',
          monthly_price: userSub.subscription_plans?.monthly_price || 60,
          consultation_discount: userSub.subscription_plans?.consultation_discount || 20,
          status: userSub.status,
          started_at: userSub.started_at,
          expires_at: userSub.expires_at,
          next_billing_at: userSub.next_billing_at,
          auto_renew: userSub.auto_renew,
          is_active: true,
        })
        setIsPaid(true)
        return
      }

      // Verificar payment_status na tabela users
      const { data: userData } = await supabase
        .from('users')
        .select('payment_status, payment_amount')
        .eq('id', user!.id)
        .maybeSingle()

      if (userData?.payment_status === 'paid' || userData?.payment_status === 'vip') {
        setIsPaid(true)
      }
    } catch (err) {
      console.warn('Erro ao carregar assinatura:', err)
    }
  }

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('points, level, achievements')
        .eq('user_id', user!.id)
        .maybeSingle()
      if (data) setProfile(data)
    } catch (err) {
      console.warn('Erro ao carregar perfil:', err)
    }
  }

  const loadRanking = async () => {
    try {
      const { data } = await supabase
        .from('ranking_history')
        .select('global_rank_position, tier_label, percentile')
        .eq('user_id', user!.id)
        .order('reference_month', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) {
        setRanking({
          position: data.global_rank_position,
          tier: data.tier_label || 'STANDARD',
          percentile: data.percentile || 1,
        })
      }
    } catch (err) {
      console.warn('Erro ao carregar ranking:', err)
    }
  }

  const loadReferral = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('referral_code')
        .eq('id', user!.id)
        .maybeSingle()

      // Contar referidos
      const { count: totalRefs } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('invited_by', user!.id)

      // Somar bônus
      const { data: bonuses } = await supabase
        .from('referral_bonus_cycles')
        .select('bonus_value')
        .eq('doctor_id', user!.id)

      const totalBonus = bonuses?.reduce((acc, b) => acc + (b.bonus_value || 0), 0) || 0

      setReferral({
        code: userData?.referral_code || '',
        total_referrals: totalRefs || 0,
        active_referrals: totalRefs || 0,
        total_bonus: totalBonus,
      })
    } catch (err) {
      console.warn('Erro ao carregar referral:', err)
    }
  }

  const loadTransactions = async () => {
    try {
      const { data } = await supabase
        .from('transactions')
        .select('id, amount, description, type, status, created_at, discount_applied')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setTransactions(data)
        // Calcular cashback acumulado (8.7% sobre pagamentos completed)
        const totalPaid = data
          .filter(t => t.status === 'completed' || t.status === 'paid')
          .reduce((acc, t) => acc + Math.abs(t.amount || 0), 0)
        setCashbackAccumulated(totalPaid * CASHBACK_RATE)
      }
    } catch (err) {
      console.warn('Erro ao carregar transações:', err)
    }
  }

  const copyReferralCode = async () => {
    if (referral.code) {
      await navigator.clipboard.writeText(referral.code)
      alert('Código de indicação copiado!')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-400" />
      </div>
    )
  }

  // Se não é pago, redirecionar para checkout
  if (!isPaid && !subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, rgba(10,25,47,0.98) 0%, rgba(15,35,55,0.95) 50%, rgba(10,40,35,0.92) 100%)' }}>
        <div className="bg-slate-800/80 rounded-2xl p-8 max-w-md text-center border border-slate-700">
          <Shield className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Área Exclusiva</h2>
          <p className="text-slate-300 mb-6">
            Esta área é exclusiva para assinantes. Assine um plano para acessar sua gestão financeira completa.
          </p>
          <button
            onClick={() => navigate('/app/subscription-plans')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors"
          >
            Ver Planos Disponíveis
          </button>
        </div>
      </div>
    )
  }

  const xp = profile?.points || 0
  const currentTier = getXpTier(xp)
  const nextTier = getNextTier(xp)
  const xpProgress = nextTier ? ((xp - currentTier.minXp) / (nextTier.minXp - currentTier.minXp)) * 100 : 100
  const totalDiscount = (subscription?.consultation_discount || 0) + currentTier.discount
  const daysUntilExpiry = subscription?.expires_at
    ? differenceInDays(parseISO(subscription.expires_at), new Date())
    : null

  const cardStyle = {
    background: 'linear-gradient(145deg, rgba(15,25,45,0.9), rgba(10,30,40,0.85))',
    borderColor: 'rgba(16,185,129,0.15)',
  }

  return (
    <div className="min-h-screen py-6 px-4 md:px-6" style={{ background: 'linear-gradient(135deg, rgba(10,25,47,0.98) 0%, rgba(15,35,55,0.95) 50%, rgba(10,40,35,0.92) 100%)' }}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
              <Crown className="w-8 h-8 text-amber-400" />
              Gestão Financeira
            </h1>
            <p className="text-slate-400 mt-1">
              Acompanhe seu plano, pontos, descontos e benefícios
            </p>
          </div>
          {subscription && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-300">
                {subscription.plan_name || 'Plano Ativo'}
              </span>
            </div>
          )}
        </div>

        {/* Cards Resumo - 4 cols */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Plano e Expiração */}
          <div className="rounded-2xl p-5 border" style={cardStyle}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Plano</span>
            </div>
            <p className="text-lg font-bold text-white mb-1">
              {subscription?.plan_name || 'Premium'}
            </p>
            {daysUntilExpiry !== null && (
              <p className={`text-xs font-medium ${daysUntilExpiry > 15 ? 'text-emerald-400' : daysUntilExpiry > 5 ? 'text-amber-400' : 'text-red-400'}`}>
                {daysUntilExpiry > 0 ? `Expira em ${daysUntilExpiry} dias` : 'Expirado'}
              </p>
            )}
            {subscription?.next_billing_at && (
              <p className="text-[10px] text-slate-500 mt-1">
                Próx. cobrança: {format(parseISO(subscription.next_billing_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            )}
          </div>

          {/* XP e Ranking */}
          <div className="rounded-2xl p-5 border" style={cardStyle}>
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">XP & Ranking</span>
            </div>
            <p className="text-lg font-bold text-white mb-1">
              {xp.toLocaleString('pt-BR')} XP
            </p>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                currentTier.label === 'Diamante' ? 'bg-purple-500/20 text-purple-300' :
                currentTier.label === 'Ouro' ? 'bg-amber-500/20 text-amber-300' :
                currentTier.label === 'Prata' ? 'bg-slate-400/20 text-slate-300' :
                currentTier.label === 'Bronze' ? 'bg-orange-500/20 text-orange-300' :
                'bg-slate-600/20 text-slate-400'
              }`}>
                {currentTier.label}
              </span>
              {ranking.position && (
                <span className="text-xs text-slate-400">#{ranking.position}</span>
              )}
            </div>
          </div>

          {/* Desconto Total */}
          <div className="rounded-2xl p-5 border" style={cardStyle}>
            <div className="flex items-center gap-2 mb-3">
              <Percent className="w-5 h-5 text-emerald-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Desconto</span>
            </div>
            <p className="text-lg font-bold text-emerald-400 mb-1">
              {totalDiscount}% OFF
            </p>
            <p className="text-[10px] text-slate-500">
              Plano ({subscription?.consultation_discount || 0}%) + XP ({currentTier.discount}%)
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              nas próximas consultas
            </p>
          </div>

          {/* Cashback */}
          <div className="rounded-2xl p-5 border" style={cardStyle}>
            <div className="flex items-center gap-2 mb-3">
              <Coins className="w-5 h-5 text-green-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Cashback</span>
            </div>
            <p className="text-lg font-bold text-green-400 mb-1">
              R$ {cashbackAccumulated.toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-500">
              {(CASHBACK_RATE * 100).toFixed(1)}% acumulado
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              sobre pagamentos realizados
            </p>
          </div>
        </div>

        {/* Barra de Progresso XP */}
        <div className="rounded-2xl p-5 border" style={cardStyle}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-semibold text-white">Progresso de Desconto por XP</span>
            </div>
            {nextTier && (
              <span className="text-xs text-slate-400">
                Próximo nível: {nextTier.label} ({nextTier.discount}% desc.) — faltam {(nextTier.minXp - xp).toLocaleString('pt-BR')} XP
              </span>
            )}
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 mb-3">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(xpProgress, 100)}%`,
                background: 'linear-gradient(90deg, #10b981, #34d399)',
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            {XP_DISCOUNT_TIERS.map((tier) => (
              <span key={tier.label} className={xp >= tier.minXp ? 'text-emerald-400 font-semibold' : ''}>
                {tier.label} ({tier.discount}%)
              </span>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Sistema de Indicação */}
          <div className="rounded-2xl p-5 border" style={cardStyle}>
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-semibold text-white">Sistema de Indicação</span>
            </div>

            {referral.code ? (
              <>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 bg-slate-700/50 px-4 py-2.5 rounded-lg border border-slate-600">
                    <p className="text-[10px] text-slate-400 mb-0.5">Seu código de indicação</p>
                    <p className="text-sm font-mono font-bold text-white">{referral.code}</p>
                  </div>
                  <button
                    onClick={copyReferralCode}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg font-semibold transition-colors"
                  >
                    Copiar
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                    <p className="text-lg font-bold text-white">{referral.total_referrals}</p>
                    <p className="text-[10px] text-slate-400">Indicados</p>
                  </div>
                  <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                    <p className="text-lg font-bold text-emerald-400">{referral.active_referrals}</p>
                    <p className="text-[10px] text-slate-400">Ativos</p>
                  </div>
                  <div className="text-center p-3 bg-slate-700/30 rounded-xl">
                    <p className="text-lg font-bold text-green-400">R$ {referral.total_bonus.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400">Bônus</p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 mt-3">
                  * Conforme Art. 39 do CDC, os bônus são creditados após confirmação do pagamento do indicado.
                </p>
              </>
            ) : (
              <div className="text-center py-6">
                <Gift className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Código de indicação será gerado automaticamente.</p>
              </div>
            )}
          </div>

          {/* Detalhes do Plano */}
          <div className="rounded-2xl p-5 border" style={cardStyle}>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-semibold text-white">Detalhes da Assinatura</span>
            </div>

            {subscription ? (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Plano</span>
                  <span className="text-white font-semibold">{subscription.plan_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mensalidade</span>
                  <span className="text-white font-semibold">R$ {subscription.monthly_price?.toFixed(2) || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Status</span>
                  <span className={`font-semibold ${subscription.status === 'active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {subscription.status === 'active' ? 'Ativo' : subscription.status}
                  </span>
                </div>
                {subscription.started_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Início</span>
                    <span className="text-white">{format(parseISO(subscription.started_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                )}
                {subscription.expires_at && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Expira em</span>
                    <span className={`font-semibold ${daysUntilExpiry && daysUntilExpiry > 15 ? 'text-white' : 'text-amber-400'}`}>
                      {format(parseISO(subscription.expires_at), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Renovação Automática</span>
                  <span className={subscription.auto_renew ? 'text-emerald-400' : 'text-slate-400'}>
                    {subscription.auto_renew ? 'Sim' : 'Não'}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700">
                  <p className="text-[10px] text-slate-500">
                    Conforme Art. 49 do CDC, você pode cancelar sua assinatura em até 7 dias após contratação sem custos. 
                    Após este período, o cancelamento será efetivado ao final do ciclo vigente.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Status: Pago/VIP</p>
                <p className="text-xs text-slate-500 mt-1">Dados detalhados de assinatura não disponíveis.</p>
              </div>
            )}
          </div>
        </div>

        {/* Histórico de Transações */}
        <div className="rounded-2xl p-5 border" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-semibold text-white">Histórico Financeiro</span>
            </div>
            <span className="text-xs text-slate-500">{transactions.length} transações</span>
          </div>

          {transactions.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      tx.type === 'bonus' ? 'bg-green-500/20' :
                      tx.type === 'refund' ? 'bg-red-500/20' :
                      'bg-emerald-500/20'
                    }`}>
                      {tx.type === 'bonus' ? <Gift className="w-4 h-4 text-green-400" /> :
                       tx.type === 'refund' ? <ArrowRight className="w-4 h-4 text-red-400 rotate-180" /> :
                       <CreditCard className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div>
                      <p className="text-sm text-white">{tx.description}</p>
                      <p className="text-[10px] text-slate-500">
                        {format(parseISO(tx.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${
                      tx.type === 'bonus' ? 'text-green-400' :
                      tx.type === 'refund' ? 'text-red-400' :
                      'text-white'
                    }`}>
                      {tx.type === 'bonus' ? '+' : tx.type === 'refund' ? '-' : ''}R$ {Math.abs(tx.amount).toFixed(2)}
                    </p>
                    {tx.discount_applied && tx.discount_applied > 0 && (
                      <p className="text-[10px] text-emerald-400">-R$ {tx.discount_applied.toFixed(2)} desc.</p>
                    )}
                    <span className={`text-[10px] ${
                      tx.status === 'completed' || tx.status === 'paid' ? 'text-emerald-400' :
                      tx.status === 'pending' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {tx.status === 'completed' || tx.status === 'paid' ? 'Pago' :
                       tx.status === 'pending' ? 'Pendente' : tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Nenhuma transação registrada ainda.</p>
            </div>
          )}
        </div>

        {/* Avisos legais */}
        <div className="rounded-2xl p-4 border border-slate-700/50 bg-slate-800/30">
          <p className="text-[10px] text-slate-500 leading-relaxed">
            <strong className="text-slate-400">Informações legais:</strong> Os valores apresentados estão em conformidade com o 
            Código de Defesa do Consumidor (Lei nº 8.078/90). O cashback é calculado sobre o valor efetivamente pago e pode ser 
            utilizado conforme as regras do programa. Os descontos por XP são cumulativos com o desconto do plano, limitados ao 
            máximo previsto nas condições de uso. LGPD: seus dados financeiros são tratados conforme a Lei nº 13.709/18. 
            Para dúvidas ou cancelamentos, entre em contato pelo Chat com Seu Médico ou suporte@medcannlab.com.br.
          </p>
        </div>
      </div>
    </div>
  )
}
