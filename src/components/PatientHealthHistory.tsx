import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  FileText, 
  MessageCircle, 
  Calendar, 
  Activity,
  Heart,
  Brain,
  Clock,
  ChevronRight,
  AlertCircle
} from 'lucide-react'

interface PatientHealthHistoryProps {
  patientId: string
}

interface HealthEvent {
  id: string
  type: 'assessment' | 'chat' | 'report' | 'prescription'
  title: string
  date: string
  description?: string
  professional?: string
}

const PatientHealthHistory: React.FC<PatientHealthHistoryProps> = ({ patientId }) => {
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHealthHistory()
  }, [patientId])

  const loadHealthHistory = async () => {
    try {
      setLoading(true)
      const events: HealthEvent[] = []

      // Buscar avaliações clínicas
      try {
        const { data: assessments, error: assessmentsError } = await supabase
          .from('clinical_assessments')
          .select('id, assessment_type, created_at, doctor_id, clinical_report')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })
          .limit(5)

        if (assessmentsError) {
          console.error('Erro ao buscar avaliações clínicas:', assessmentsError)
        } else if (assessments) {
          assessments.forEach((assessment: any) => {
            events.push({
              id: assessment.id,
              type: 'assessment',
              title: `Avaliação ${assessment.assessment_type || 'Clínica'}`,
              date: assessment.created_at,
              description: assessment.clinical_report?.substring(0, 100) || '',
              professional: 'IA Residente'
            })
          })
        }
      } catch (error) {
        console.error('Erro ao carregar avaliações:', error)
      }

      // Buscar interações de chat
      try {
        const { data: chats, error: chatsError } = await supabase
          .from('private_chats')
          .select('id, doctor_id, created_at')
          .eq('patient_id', patientId)

        if (chatsError) {
          console.error('Erro ao buscar chats:', chatsError)
        } else if (chats && chats.length > 0) {
          const chatIds = chats.map(c => c.id)
          const { data: messages, error: messagesError } = await supabase
            .from('private_messages')
            .select('id, chat_id, content, created_at, sender_id')
            .in('chat_id', chatIds)
            .order('created_at', { ascending: false })
            .limit(10)

          if (messagesError) {
            console.error('Erro ao buscar mensagens:', messagesError)
          } else if (messages) {
            // Agrupar mensagens por data
            const messagesByDate = messages.reduce((acc: any, msg: any) => {
              const date = new Date(msg.created_at).toLocaleDateString('pt-BR')
              if (!acc[date]) acc[date] = []
              acc[date].push(msg)
              return acc
            }, {})

            Object.entries(messagesByDate).forEach(([date, msgs]: [string, any]) => {
              events.push({
                id: `chat-${date}`,
                type: 'chat',
                title: `Conversa com profissional`,
                date: msgs[0].created_at,
                description: `${msgs.length} mensagem${msgs.length > 1 ? 'ns' : ''}`
              })
            })
          }
        }
      } catch (error) {
        console.error('Erro ao carregar chats:', error)
      }

      // Buscar relatórios clínicos
      try {
        const { data: reports, error: reportsError } = await supabase
          .from('clinical_reports')
          .select('id, report_type, generated_at, professional_name')
          .eq('patient_id', patientId)
          .order('generated_at', { ascending: false })
          .limit(5)

        if (reportsError) {
          console.error('Erro ao buscar relatórios:', reportsError)
        } else if (reports) {
          reports.forEach((report: any) => {
            events.push({
              id: report.id,
              type: 'report',
              title: `Relatório ${report.report_type === 'initial_assessment' ? 'Avaliação Inicial' : report.report_type}`,
              date: report.generated_at,
              professional: report.professional_name || 'IA Residente'
            })
          })
        }
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error)
      }

      // Ordenar por data (mais recente primeiro)
      events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setHealthEvents(events.slice(0, 10))
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'assessment':
        return <Brain className="w-4 h-4 text-purple-400" />
      case 'chat':
        return <MessageCircle className="w-4 h-4 text-blue-400" />
      case 'report':
        return <FileText className="w-4 h-4 text-green-400" />
      case 'prescription':
        return <Activity className="w-4 h-4 text-orange-400" />
      default:
        return <Clock className="w-4 h-4 text-slate-400" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ontem'
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    }
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
        <h3 className="text-base font-semibold text-white mb-1 flex items-center space-x-2">
          <Heart className="w-4 h-4 text-blue-400" />
          <span>Histórico de Saúde</span>
        </h3>
        <p className="text-xs text-slate-400">Últimas interações e informações clínicas</p>
      </div>

      {/* Lista de Eventos */}
      <div className="bg-slate-800/80 rounded-lg border border-slate-700 max-h-[calc(100vh-350px)] overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-400 text-sm mt-2">Carregando histórico...</p>
          </div>
        ) : healthEvents.length === 0 ? (
          <div className="p-6 text-center">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Nenhum histórico ainda</p>
            <p className="text-slate-500 text-xs mt-1">Suas interações aparecerão aqui</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {healthEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer border border-slate-700/50"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-700/50 rounded-lg flex-shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{event.title}</p>
                    {event.description && (
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{event.description}</p>
                    )}
                    {event.professional && (
                      <p className="text-blue-400 text-xs mt-1">por {event.professional}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-500 text-xs">{formatDate(event.date)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informação sobre Integração */}
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
        <div className="flex items-start space-x-2">
          <Brain className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-xs font-medium mb-1">IA Residente Dedicada</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Todas as suas interações são utilizadas pela IA Residente para personalizar seu atendimento e gerar contexto clínico adequado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientHealthHistory

