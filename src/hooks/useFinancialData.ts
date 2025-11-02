import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface FinancialStats {
  monthlyRevenue: number
  monthlyExpenses: number
  netProfit: number
  activeSubscriptions: number
  revenueGrowth: number
  expenseGrowth: number
  profitGrowth: number
}

export interface RevenuePeriod {
  period: string
  revenue: number
}

export interface PaymentMethod {
  method: string
  percentage: number
  amount: number
}

export interface RecentTransaction {
  id: string
  date: string
  client: string
  amount: number
  status: 'Pago' | 'Pendente' | 'Cancelado'
  method: string
}

export const useFinancialData = () => {
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [revenueHistory, setRevenueHistory] = useState<RevenuePeriod[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFinancialData()
  }, [])

  const loadFinancialData = async () => {
    try {
      setLoading(true)
      
      await Promise.all([
        loadFinancialStats(),
        loadRevenueHistory(),
        loadPaymentMethods(),
        loadRecentTransactions()
      ])
      
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFinancialStats = async () => {
    try {
      const currentMonth = new Date()
      currentMonth.setDate(1)
      
      // Buscar receitas do mês atual
      const { data: revenueData } = await supabase
        .from('transactions')
        .select('amount, type, created_at')
        .eq('type', 'revenue')
        .gte('created_at', currentMonth.toISOString())
        .eq('status', 'completed')
      
      // Buscar despesas do mês atual
      const { data: expenseData } = await supabase
        .from('transactions')
        .select('amount, type, created_at')
        .eq('type', 'expense')
        .gte('created_at', currentMonth.toISOString())
        .eq('status', 'completed')
      
      // Buscar assinaturas ativas
      const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
      
      const monthlyRevenue = revenueData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0
      const monthlyExpenses = expenseData?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0
      const netProfit = monthlyRevenue - monthlyExpenses
      
      // Calcular crescimento (comparar com mês anterior)
      const lastMonth = new Date()
      lastMonth.setMonth(lastMonth.getMonth() - 1)
      lastMonth.setDate(1)
      
      const { data: lastMonthRevenue } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'revenue')
        .gte('created_at', lastMonth.toISOString())
        .lt('created_at', currentMonth.toISOString())
        .eq('status', 'completed')
      
      const { data: lastMonthExpenses } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'expense')
        .gte('created_at', lastMonth.toISOString())
        .lt('created_at', currentMonth.toISOString())
        .eq('status', 'completed')
      
      const lastMonthRevenueTotal = lastMonthRevenue?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0
      const lastMonthExpensesTotal = lastMonthExpenses?.reduce((sum, transaction) => sum + transaction.amount, 0) || 0
      const lastMonthProfit = lastMonthRevenueTotal - lastMonthExpensesTotal
      
      const revenueGrowth = lastMonthRevenueTotal > 0 ? ((monthlyRevenue - lastMonthRevenueTotal) / lastMonthRevenueTotal) * 100 : 0
      const expenseGrowth = lastMonthExpensesTotal > 0 ? ((monthlyExpenses - lastMonthExpensesTotal) / lastMonthExpensesTotal) * 100 : 0
      const profitGrowth = lastMonthProfit > 0 ? ((netProfit - lastMonthProfit) / lastMonthProfit) * 100 : 0
      
      setStats({
        monthlyRevenue,
        monthlyExpenses,
        netProfit,
        activeSubscriptions: activeSubscriptions || 0,
        revenueGrowth,
        expenseGrowth,
        profitGrowth
      })
      
    } catch (error) {
      console.error('Erro ao carregar estatísticas financeiras:', error)
      // Valores padrão em caso de erro
      setStats({
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        netProfit: 0,
        activeSubscriptions: 0,
        revenueGrowth: 0,
        expenseGrowth: 0,
        profitGrowth: 0
      })
    }
  }

  const loadRevenueHistory = async () => {
    try {
      const { data: revenueData } = await supabase
        .from('transactions')
        .select('amount, created_at')
        .eq('type', 'revenue')
        .eq('status', 'completed')
        .order('created_at', { ascending: true })
      
      if (revenueData && revenueData.length > 0) {
        // Agrupar por mês
        const monthlyData = revenueData.reduce((acc, transaction) => {
          const date = new Date(transaction.created_at)
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          
          if (!acc[monthKey]) {
            acc[monthKey] = 0
          }
          acc[monthKey] += transaction.amount
          
          return acc
        }, {} as Record<string, number>)
        
        const history = Object.entries(monthlyData)
          .map(([period, revenue]) => ({
            period: new Date(period + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
            revenue
          }))
          .slice(-6) // Últimos 6 meses
        
        setRevenueHistory(history)
      } else {
        // Dados padrão
        setRevenueHistory([
          { period: 'Out 2023', revenue: 35640 },
          { period: 'Nov 2023', revenue: 38920 },
          { period: 'Dez 2023', revenue: 40180 },
          { period: 'Jan 2024', revenue: 45230 }
        ])
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de receita:', error)
      setRevenueHistory([])
    }
  }

  const loadPaymentMethods = async () => {
    try {
      const { data: paymentData } = await supabase
        .from('transactions')
        .select('amount, payment_method')
        .eq('status', 'completed')
      
      if (paymentData && paymentData.length > 0) {
        const totalAmount = paymentData.reduce((sum, transaction) => sum + transaction.amount, 0)
        
        const methods = paymentData.reduce((acc, transaction) => {
          const method = transaction.payment_method || 'Outros'
          if (!acc[method]) {
            acc[method] = { amount: 0, count: 0 }
          }
          acc[method].amount += transaction.amount
          acc[method].count += 1
          return acc
        }, {} as Record<string, { amount: number; count: number }>)
        
        const paymentMethods = Object.entries(methods).map(([method, data]) => ({
          method,
          percentage: (data.amount / totalAmount) * 100,
          amount: data.amount
        }))
        
        setPaymentMethods(paymentMethods)
      } else {
        // Dados padrão
        setPaymentMethods([
          { method: 'Cartão de Crédito', percentage: 65, amount: 29400 },
          { method: 'PIX', percentage: 25, amount: 11300 },
          { method: 'Boleto', percentage: 8, amount: 3620 },
          { method: 'Outros', percentage: 2, amount: 910 }
        ])
      }
    } catch (error) {
      console.error('Erro ao carregar métodos de pagamento:', error)
      setPaymentMethods([])
    }
  }

  const loadRecentTransactions = async () => {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('id, amount, created_at, status, payment_method, client_name')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (transactions && transactions.length > 0) {
        const recentTransactions = transactions.map(transaction => ({
          id: transaction.id,
          date: new Date(transaction.created_at).toLocaleDateString('pt-BR'),
          client: transaction.client_name || 'Cliente',
          amount: transaction.amount,
          status: (transaction.status === 'completed' ? 'Pago' : 
                  transaction.status === 'pending' ? 'Pendente' : 'Cancelado') as 'Pago' | 'Pendente' | 'Cancelado',
          method: transaction.payment_method || 'N/A'
        }))
        
        setRecentTransactions(recentTransactions)
      } else {
        // Dados padrão
        setRecentTransactions([
          {
            id: '1',
            date: '15/01/2024',
            client: 'Dr. João Silva',
            amount: 299.00,
            status: 'Pago',
            method: 'Cartão'
          },
          {
            id: '2',
            date: '14/01/2024',
            client: 'Maria Santos',
            amount: 199.00,
            status: 'Pago',
            method: 'PIX'
          },
          {
            id: '3',
            date: '13/01/2024',
            client: 'Carlos Oliveira',
            amount: 149.00,
            status: 'Pendente',
            method: 'Boleto'
          }
        ])
      }
    } catch (error) {
      console.error('Erro ao carregar transações recentes:', error)
      setRecentTransactions([])
    }
  }

  return {
    stats,
    revenueHistory,
    paymentMethods,
    recentTransactions,
    loading,
    refetch: loadFinancialData
  }
}
