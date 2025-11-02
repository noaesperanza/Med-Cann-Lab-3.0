import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface RealtimeData {
  // Dados do paciente
  patientStats: {
    totalConsultations: number
    pendingEvaluations: number
    availableReports: number
    nextAppointment: string
  }
  
  // Dados do profissional
  professionalStats: {
    activePatients: number
    todayEvaluations: number
    pendingReports: number
    completedCourses: number
  }
  
  // Dados do admin
  adminStats: {
    totalUsers: number
    activeUsers: number
    totalCourses: number
    systemHealth: 'healthy' | 'warning' | 'critical'
  }
  
  // Notificações em tempo real
  notifications: Array<{
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    timestamp: Date
    read: boolean
  }>
}

interface RealtimeContextType {
  data: RealtimeData
  updatePatientStats: (stats: Partial<RealtimeData['patientStats']>) => void
  updateProfessionalStats: (stats: Partial<RealtimeData['professionalStats']>) => void
  updateAdminStats: (stats: Partial<RealtimeData['adminStats']>) => void
  addNotification: (notification: Omit<RealtimeData['notifications'][0], 'id' | 'timestamp'>) => void
  markNotificationAsRead: (id: string) => void
  clearNotifications: () => void
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export const useRealtime = () => {
  const context = useContext(RealtimeContext)
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider')
  }
  return context
}

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authContext = useAuth()
  const user = authContext?.user || null
  const [data, setData] = useState<RealtimeData>({
    patientStats: {
      totalConsultations: 0,
      pendingEvaluations: 0,
      availableReports: 0,
      nextAppointment: ''
    },
    professionalStats: {
      activePatients: 0,
      todayEvaluations: 0,
      pendingReports: 0,
      completedCourses: 0
    },
    adminStats: {
      totalUsers: 0,
      activeUsers: 0,
      totalCourses: 0,
      systemHealth: 'healthy'
    },
    notifications: []
  })

  // Carregar dados reais do Supabase
  useEffect(() => {
    if (user) {
      loadRealtimeData()
    }
  }, [user])

  const loadRealtimeData = async () => {
    if (!user) return

    try {
      // Carregar dados baseado no tipo de usuário
      if (user.type === 'patient') {
        await loadPatientStats()
      } else if (user.type === 'professional') {
        await loadProfessionalStats()
      } else if (user.type === 'admin') {
        await loadAdminStats()
      }

      // Carregar notificações
      await loadNotifications()
    } catch (error) {
      console.error('Erro ao carregar dados em tempo real:', error)
    }
  }

  const loadPatientStats = async () => {
    try {
      // Buscar consultas do paciente
      const { data: consultations } = await supabase
        .from('clinical_assessments')
        .select('*')
        .eq('patient_id', user?.id)

      // Buscar avaliações pendentes
      const { data: evaluations } = await supabase
        .from('clinical_assessments')
        .select('*')
        .eq('patient_id', user?.id)
        .eq('status', 'in_progress')

      // Buscar relatórios disponíveis
      const { data: reports } = await supabase
        .from('documents')
        .select('*')
        .eq('uploaded_by', user?.id)

      setData(prev => ({
        ...prev,
        patientStats: {
          totalConsultations: consultations?.length || 0,
          pendingEvaluations: evaluations?.length || 0,
          availableReports: reports?.length || 0,
          nextAppointment: 'Próxima consulta não agendada'
        }
      }))
    } catch (error) {
      console.error('Erro ao carregar estatísticas do paciente:', error)
    }
  }

  const loadProfessionalStats = async () => {
    try {
      // Buscar pacientes ativos
      const { data: patients } = await supabase
        .from('private_chats')
        .select('*')
        .eq('doctor_id', user?.id)
        .eq('is_active', true)

      // Buscar avaliações de hoje
      const today = new Date().toISOString().split('T')[0]
      const { data: todayEvaluations } = await supabase
        .from('clinical_assessments')
        .select('*')
        .eq('doctor_id', user?.id)
        .gte('created_at', today)

      // Buscar relatórios pendentes
      const { data: pendingReports } = await supabase
        .from('clinical_assessments')
        .select('*')
        .eq('doctor_id', user?.id)
        .eq('status', 'in_progress')

      // Buscar cursos completados
      const { data: completedCourses } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', user?.id)
        .not('completed_at', 'is', null)

      setData(prev => ({
        ...prev,
        professionalStats: {
          activePatients: patients?.length || 0,
          todayEvaluations: todayEvaluations?.length || 0,
          pendingReports: pendingReports?.length || 0,
          completedCourses: completedCourses?.length || 0
        }
      }))
    } catch (error) {
      console.error('Erro ao carregar estatísticas do profissional:', error)
    }
  }

  const loadAdminStats = async () => {
    try {
      // Usar dados mockados temporariamente até as tabelas estarem prontas
      setData(prev => ({
        ...prev,
        adminStats: {
          totalUsers: 0, // Será preenchido quando as tabelas estiverem prontas
          activeUsers: 0,
          totalCourses: 0,
          systemHealth: 'healthy'
        }
      }))
    } catch (error) {
      console.error('Erro ao carregar estatísticas do admin:', error)
    }
  }

  const loadNotifications = async () => {
    try {
      // Usar notificações mockadas temporariamente até a tabela estar pronta
      setData(prev => ({
        ...prev,
        notifications: []
      }))
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    }
  }

  const updatePatientStats = (stats: Partial<RealtimeData['patientStats']>) => {
    setData(prev => ({
      ...prev,
      patientStats: { ...prev.patientStats, ...stats }
    }))
  }

  const updateProfessionalStats = (stats: Partial<RealtimeData['professionalStats']>) => {
    setData(prev => ({
      ...prev,
      professionalStats: { ...prev.professionalStats, ...stats }
    }))
  }

  const updateAdminStats = (stats: Partial<RealtimeData['adminStats']>) => {
    setData(prev => ({
      ...prev,
      adminStats: { ...prev.adminStats, ...stats }
    }))
  }

  const addNotification = async (notification: Omit<RealtimeData['notifications'][0], 'id' | 'timestamp'>) => {
    try {
      // Adicionar notificação localmente temporariamente
      const newNotification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date()
      }

      setData(prev => ({
        ...prev,
        notifications: [newNotification, ...prev.notifications]
      }))
    } catch (error) {
      console.error('Erro ao adicionar notificação:', error)
    }
  }

  const markNotificationAsRead = async (id: string) => {
    try {
      // Marcar como lida localmente
      setData(prev => ({
        ...prev,
        notifications: prev.notifications.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      }))
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  const clearNotifications = async () => {
    try {
      // Limpar notificações localmente
      setData(prev => ({
        ...prev,
        notifications: []
      }))
    } catch (error) {
      console.error('Erro ao limpar notificações:', error)
    }
  }

  return (
    <RealtimeContext.Provider value={{
      data,
      updatePatientStats,
      updateProfessionalStats,
      updateAdminStats,
      addNotification,
      markNotificationAsRead,
      clearNotifications
    }}>
      {children}
    </RealtimeContext.Provider>
  )
}