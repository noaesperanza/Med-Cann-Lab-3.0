import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Video, Phone, X, Check, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface VideoCallSchedule {
  id: string
  professional_id: string
  patient_id: string
  scheduled_at: string
  call_type: 'video' | 'audio'
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'missed'
  requested_by: 'professional' | 'patient'
  request_message?: string
  professional_name?: string
  patient_name?: string
}

interface VideoCallSchedulerProps {
  patientId?: string
  professionalId?: string
  onScheduleCreated?: () => void
  onClose?: () => void
}

const VideoCallScheduler: React.FC<VideoCallSchedulerProps> = ({
  patientId,
  professionalId,
  onScheduleCreated,
  onClose
}) => {
  const { user } = useAuth()
  const [scheduledAt, setScheduledAt] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [callType, setCallType] = useState<'video' | 'audio'>('video')
  const [requestMessage, setRequestMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPatient = user?.type === 'paciente'
  const isProfessional = user?.type === 'profissional' || user?.type === 'admin'

  // Carregar paciente/profissional selecionado
  useEffect(() => {
    // Se for paciente solicitando, não precisa de patientId
    // Se for profissional marcando, precisa de patientId
  }, [patientId, professionalId])

  const handleSchedule = async () => {
    if (!user?.id) {
      setError('Usuário não autenticado')
      return
    }

    if (!scheduledAt || !scheduledTime) {
      setError('Selecione data e hora')
      return
    }

    // Combinar data e hora
    const scheduledDateTime = new Date(`${scheduledAt}T${scheduledTime}`)
    
    // Validar que a data é futura
    if (scheduledDateTime <= new Date()) {
      setError('A data e hora devem ser futuras')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const scheduleData: any = {
        scheduled_at: scheduledDateTime.toISOString(),
        call_type: callType,
        requested_by: isPatient ? 'patient' : 'professional',
        status: 'scheduled'
      }

      if (isPatient) {
        // Paciente solicitando: precisa do professionalId
        if (!professionalId) {
          setError('Selecione um profissional')
          return
        }
        scheduleData.patient_id = user.id
        scheduleData.professional_id = professionalId
        scheduleData.request_message = requestMessage || 'Solicitação de videochamada'
      } else {
        // Profissional marcando: precisa do patientId
        if (!patientId) {
          setError('Selecione um paciente')
          return
        }
        scheduleData.professional_id = user.id
        scheduleData.patient_id = patientId
      }

      const { data, error: insertError } = await (supabase as any)
        .from('video_call_schedules')
        .insert(scheduleData)
        .select()
        .single()

      if (insertError) throw insertError

      // Criar notificação para o outro usuário
      const notificationData = {
        user_id: isPatient ? professionalId : patientId,
        type: 'video_call_scheduled',
        title: isPatient 
          ? 'Solicitação de Videochamada' 
          : 'Videochamada Agendada',
        message: isPatient
          ? `Paciente ${user.name || user.email} solicitou uma ${callType === 'video' ? 'videochamada' : 'chamada de áudio'} para ${format(scheduledDateTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}${requestMessage ? `\n\nMensagem: ${requestMessage}` : ''}`
          : `Dr(a). ${user.name || user.email} agendou uma ${callType === 'video' ? 'videochamada' : 'chamada de áudio'} para ${format(scheduledDateTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
        is_read: false,
        metadata: {
          schedule_id: data.id,
          scheduled_at: scheduledDateTime.toISOString(),
          call_type: callType
        }
      }

      await supabase.from('notifications').insert(notificationData as any)

      // Chamar Edge Function para agendar lembretes
      await supabase.functions.invoke('video-call-reminders', {
        body: {
          schedule_id: data.id,
          scheduled_at: scheduledDateTime.toISOString()
        }
      })

      onScheduleCreated?.()
      onClose?.()
    } catch (err: any) {
      console.error('Erro ao agendar videochamada:', err)
      setError(err.message || 'Erro ao agendar videochamada')
    } finally {
      setLoading(false)
    }
  }

  // Data mínima: hoje
  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            {isPatient ? 'Solicitar Videochamada' : 'Agendar Videochamada'}
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Data */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Data
            </label>
            <input
              type="date"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={minDate}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Hora */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Hora
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tipo de chamada */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tipo de Chamada
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setCallType('video')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                  callType === 'video'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Video className="w-5 h-5" />
                <span>Vídeo</span>
              </button>
              <button
                onClick={() => setCallType('audio')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                  callType === 'audio'
                    ? 'bg-green-500/20 border-green-500 text-green-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Phone className="w-5 h-5" />
                <span>Áudio</span>
              </button>
            </div>
          </div>

          {/* Mensagem (apenas para paciente) */}
          {isPatient && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Mensagem (opcional)
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Descreva o motivo da solicitação..."
                rows={3}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleSchedule}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Agendando...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isPatient ? 'Solicitar' : 'Agendar'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoCallScheduler
