import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  totalAppointments: number
  completedAppointments: number
  pendingAppointments: number
}

export interface UserRanking {
  id: string
  name: string
  type: 'patient' | 'professional' | 'student' | 'admin'
  points: number
  level: number
  achievements: string[]
  activity: 'Muito Ativo' | 'Ativo' | 'Inativo'
}

export interface Achievement {
  id: string
  name: string
  description: string
  points: number
  icon: string
  unlocked: number
  total: number
}

export const useDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [userRanking, setUserRanking] = useState<UserRanking[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Carregar estatísticas básicas
      await Promise.all([
        loadStats(),
        loadUserRanking(),
        loadAchievements()
      ])
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      // Contar usuários totais via tabela users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Contar usuários ativos (últimos 30 dias)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())

      // Calcular receita (se houver tabela de transações)
      let totalRevenue = 0
      let monthlyRevenue = 0
      
      try {
        const { data: revenueData, error: revenueError } = await supabase
          .from('transactions')
          .select('amount, created_at')
          .eq('status', 'completed')
        
        if (revenueError) {
          console.warn('⚠️ Erro ao buscar transações (tabela pode não existir ou sem acesso):', revenueError.message)
          totalRevenue = 0
          monthlyRevenue = 0
        } else if (revenueData && revenueData.length > 0) {
          totalRevenue = revenueData.reduce((sum, transaction) => sum + (transaction.amount || 0), 0)
          
          const currentMonth = new Date()
          currentMonth.setDate(1)
          monthlyRevenue = revenueData
            .filter(transaction => new Date(transaction.created_at ?? '') >= currentMonth)
            .reduce((sum, transaction) => sum + (transaction.amount || 0), 0)
        } else {
          totalRevenue = 0
          monthlyRevenue = 0
        }
      } catch (error) {
        console.warn('⚠️ Erro ao processar transações:', error)
        totalRevenue = 0
        monthlyRevenue = 0
      }

      // Contar agendamentos
      let totalAppointments = 0
      let completedAppointments = 0
      let pendingAppointments = 0
      
      try {
        const { count: total } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
        
        const { count: completed } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
        
        const { count: pending } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
        
        totalAppointments = total || 0
        completedAppointments = completed || 0
        pendingAppointments = pending || 0
      } catch (error) {
        console.log('Tabela de agendamentos não encontrada, usando valores padrão')
        totalAppointments = 0
        completedAppointments = 0
        pendingAppointments = 0
      }

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalRevenue,
        monthlyRevenue,
        totalAppointments,
        completedAppointments,
        pendingAppointments
      })
      
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      // Valores padrão em caso de erro
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalAppointments: 0,
        completedAppointments: 0,
        pendingAppointments: 0
      })
    }
  }

  const loadUserRanking = async () => {
    try {
      // Buscar usuários com pontos (se houver tabela de gamificação)
      const { data: usersData } = await supabase
        .from('user_profiles')
        .select('*')
        .order('points', { ascending: false })
        .limit(10)
      
      if (usersData && usersData.length > 0) {
        const ranking = usersData.map((user, index) => ({
          id: user.id,
          name: user.name || user.email?.split('@')[0] || 'Usuário',
          type: (user as any).user_type || 'patient',
          points: (user as any).points || 0,
          level: Math.floor(((user as any).points || 0) / 100) + 1,
          achievements: (user as any).achievements || [],
          activity: ((user as any).last_activity && new Date((user as any).last_activity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ? 'Muito Ativo' as const : 'Ativo' as const
        }))
        
        setUserRanking(ranking)
      } else {
        // Fallback: usar dados básicos dos usuários autenticados
        const { data: authUsers } = await supabase.auth.admin.listUsers()
        
        if (authUsers?.users) {
          const ranking = authUsers.users.slice(0, 10).map((user, index) => ({
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
            type: user.user_metadata?.user_type || 'patient',
            points: Math.floor(Math.random() * 1000) + 100, // Pontos aleatórios para demonstração
            level: Math.floor(Math.random() * 10) + 1,
            achievements: ['Primeiro Login'],
            activity: 'Ativo' as const
          }))
          
          setUserRanking(ranking)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar ranking de usuários:', error)
      setUserRanking([])
    }
  }

  const loadAchievements = async () => {
    try {
      // Buscar conquistas (se houver tabela de conquistas)
      const { data: achievementsData } = await (supabase as any)
        .from('badges')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (achievementsData && achievementsData.length > 0) {
        setAchievements(achievementsData.map((a: any) => ({ ...a, name: a.name || '', description: a.description || '', points: a.points || 0, icon: a.icon || '🏆', unlocked: a.unlocked || 0, total: a.total || 0 })) as Achievement[])
      } else {
        // Conquistas padrão
        const defaultAchievements: Achievement[] = [
          {
            id: '1',
            name: 'Primeiro Post',
            description: 'Faça seu primeiro post no fórum',
            points: 50,
            icon: '📝',
            unlocked: 0,
            total: 0
          },
          {
            id: '2',
            name: 'Especialista',
            description: 'Responda 100 perguntas',
            points: 500,
            icon: '🎓',
            unlocked: 0,
            total: 0
          },
          {
            id: '3',
            name: 'Mentor',
            description: 'Ajude 50 usuários',
            points: 1000,
            icon: '👨‍🏫',
            unlocked: 0,
            total: 0
          },
          {
            id: '4',
            name: 'Pesquisador',
            description: 'Compartilhe 25 artigos',
            points: 750,
            icon: '🔬',
            unlocked: 0,
            total: 0
          },
          {
            id: '5',
            name: 'Colaborador',
            description: 'Participe de 10 debates',
            points: 300,
            icon: '🤝',
            unlocked: 0,
            total: 0
          }
        ]
        
        setAchievements(defaultAchievements)
      }
    } catch (error) {
      console.error('Erro ao carregar conquistas:', error)
      setAchievements([])
    }
  }

  return {
    stats,
    userRanking,
    achievements,
    loading,
    refetch: loadDashboardData
  }
}
