import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Calendar,
  TrendingUp,
  Heart,
  MessageCircle,
  FileText,
  Share2,
  Shield,
  Clock,
  Stethoscope,
  CheckCircle,
  Star,
  Activity,
  Target,
  BarChart3,
  BookOpen,
  Users,
  ArrowRight,
  Video,
  GraduationCap,
  Brain,
  Zap
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useUserView } from '../contexts/UserViewContext'
import { clinicalReportService, ClinicalReport } from '../lib/clinicalReportService'
import { supabase } from '../lib/supabase'

interface Appointment {
  id: string
  date: string
  time: string
  professional: string
  type: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

interface TherapeuticPlan {
  id: string
  title: string
  progress: number
  medications: Array<{ name: string; dosage: string; frequency: string }>
  nextReview: string
}

const DEFAULT_PROFESSIONAL_EMAILS = ['rrvalenca@gmail.com', 'eduardoscfaveret@gmail.com']

const PatientDashboard: React.FC = () => {
  const { user } = useAuth()
  const { getEffectiveUserType, isAdminViewingAs } = useUserView()
  const navigate = useNavigate()

  // Se admin está visualizando como paciente, mostrar aviso
  const effectiveType = getEffectiveUserType(user?.type)
  const isViewingAsPatient = isAdminViewingAs && effectiveType === 'paciente'

  // Estados
  const [reports, setReports] = useState<ClinicalReport[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [therapeuticPlan, setTherapeuticPlan] = useState<TherapeuticPlan | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agendamento' | 'plano' | 'conteudo'>('dashboard')
  const [chatLoading, setChatLoading] = useState(false)

  // Carregar dados do paciente
  useEffect(() => {
    if (user?.id) {
      loadPatientData()
    }
  }, [user?.id])

  const loadPatientData = async () => {
    try {
      // Carregar relatórios
      const patientReports = await clinicalReportService.getPatientReports(user!.id)
      setReports(patientReports)

      // Carregar agendamentos
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', user!.id)
        .order('appointment_date', { ascending: true })
        .limit(5)

      if (!appointmentsError && appointmentsData) {
        setAppointments(appointmentsData.map((apt: any) => ({
          id: apt.id,
          date: apt.appointment_date,
          time: apt.appointment_time || '09:00',
          professional: apt.professional_name || 'Dr. Eduardo Faveret',
          type: apt.appointment_type || 'Consulta',
          status: apt.status || 'scheduled'
        })))
      }

      // Carregar plano terapêutico do Supabase
      // Buscar relatórios clínicos que podem conter prescrições
      const { data: reportsData } = await supabase
        .from('clinical_reports')
        .select('*')
        .eq('patient_id', user!.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)

      const latestReport = reportsData && reportsData.length > 0 ? reportsData[0] : null

      // Buscar também avaliações clínicas que podem ter prescrições
      const { data: assessmentsData } = await supabase
        .from('clinical_assessments')
        .select('*')
        .eq('patient_id', user!.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)

      const latestAssessment = assessmentsData && assessmentsData.length > 0 ? assessmentsData[0] : null

      // Extrair medicações do relatório ou avaliação
      let medications: Array<{ name: string; dosage: string; frequency: string }> = []
      let progress = 0
      let nextReviewDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      if (latestReport?.content) {
        const content = latestReport.content as any
        // Tentar extrair medicações do conteúdo do relatório
        if (content.plan?.medications) {
          medications = content.plan.medications
        } else if (content.rationalities?.biomedical?.treatment) {
          // Se não houver medicações explícitas, tentar extrair do tratamento biomédico
          const treatment = content.rationalities.biomedical.treatment
          if (typeof treatment === 'string' && treatment.includes('CBD')) {
            // Parse básico - pode ser melhorado
            medications = [
              { name: 'CBD', dosage: '25mg', frequency: '2x ao dia' }
            ]
          }
        }
        // Calcular progresso baseado em quando foi criado
        const daysSinceCreation = Math.floor((Date.now() - new Date(latestReport.created_at).getTime()) / (1000 * 60 * 60 * 24))
        progress = Math.min(100, Math.max(0, (daysSinceCreation / 90) * 100)) // Progresso baseado em 90 dias
      } else if (latestAssessment?.data) {
        const data = latestAssessment.data as any
        if (data.medications) {
          medications = data.medications
        }
        // Calcular progresso
        const daysSinceCreation = Math.floor((Date.now() - new Date(latestAssessment.created_at).getTime()) / (1000 * 60 * 60 * 24))
        progress = Math.min(100, Math.max(0, (daysSinceCreation / 90) * 100))
      }

      // Buscar próximo agendamento para revisão
      const { data: nextAppointmentsData } = await supabase
        .from('appointments')
        .select('appointment_date')
        .eq('patient_id', user!.id)
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true })
        .limit(1)

      const nextAppointment = nextAppointmentsData && nextAppointmentsData.length > 0 ? nextAppointmentsData[0] : null

      if (nextAppointment?.appointment_date) {
        nextReviewDate = new Date(nextAppointment.appointment_date)
      }

      // Se não houver medicações, não definir plano terapêutico
      if (medications.length > 0) {
        setTherapeuticPlan({
          id: latestReport?.id || latestAssessment?.id || '1',
          title: 'Plano Terapêutico - Cannabis Medicinal',
          progress: Math.round(progress),
          medications: medications,
          nextReview: nextReviewDate.toLocaleDateString('pt-BR')
        })
      } else {
        // Sem plano terapêutico ativo
        setTherapeuticPlan(null)
      }

      setLoadingReports(false)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setLoadingReports(false)
    }
  }

  // Função para agendar consulta
  const handleScheduleAppointment = () => {
    setActiveTab('agendamento')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOpenChat = async () => {
    if (!user?.id) return

    if (isViewingAsPatient) {
      navigate('/app/clinica/paciente/chat-profissional?origin=patient-dashboard')
      return
    }

    setChatLoading(true)
    try {
      let targetRoomId: string | undefined

      const { data: existingRooms, error: existingError } = await supabase
        .from('chat_participants')
        .select('room_id, chat_rooms!inner(id, type)')
        .eq('user_id', user.id)
        .eq('chat_rooms.type', 'patient')
        .limit(1)

      if (!existingError && existingRooms?.length) {
        targetRoomId = existingRooms[0].room_id
      } else {
        const { data: newRoom, error: roomError } = await supabase
          .from('chat_rooms')
          .insert({
            name: user.name ? `Canal de cuidado • ${user.name}` : 'Canal do paciente',
            type: 'patient',
            created_by: user.id
          })
          .select('id')
          .single()

        if (roomError || !newRoom) {
          throw roomError ?? new Error('Não foi possível criar o canal do paciente')
        }

        targetRoomId = newRoom.id

        const { data: professionals } = await supabase
          .from('users_compatible')
          .select('id')
          .in('email', DEFAULT_PROFESSIONAL_EMAILS)

        const professionalIds = (professionals ?? [])
          .map(profile => profile.id)
          .filter((id): id is string => Boolean(id))

        const participantsPayload = [
          { room_id: newRoom.id, user_id: user.id, role: 'patient' },
          ...professionalIds.map(proId => ({
            room_id: newRoom.id,
            user_id: proId,
            role: 'professional'
          }))
        ]

        if (participantsPayload.length) {
          await supabase
            .from('chat_participants')
            .upsert(participantsPayload, { onConflict: 'room_id,user_id' })
        }
      }

      const targetUrl = targetRoomId
        ? `/app/clinica/paciente/chat-profissional?origin=patient-dashboard&roomId=${targetRoomId}`
        : '/app/clinica/paciente/chat-profissional?origin=patient-dashboard'

      navigate(targetUrl)
    } catch (error) {
      console.error('Erro ao preparar canal de chat do paciente:', error)
      navigate('/app/clinica/paciente/chat-profissional?origin=patient-dashboard')
    } finally {
      setChatLoading(false)
    }
  }

  // Renderizar Dashboard Principal
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Mensagem de Boas-vindas */}
      <div className="rounded-xl p-6 mb-6" style={{ background: 'rgba(7,22,41,0.82)', border: '1px solid rgba(0,193,106,0.12)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Bem-vindo, {user?.name || 'Paciente'}!</h2>
            <p className="text-slate-400">Seu centro de acompanhamento personalizado para cuidado renal e cannabis medicinal</p>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 bg-slate-700 p-3 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'P'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-white">{user?.name || 'Paciente'}</p>
              <p className="text-sm text-slate-400">Paciente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Agendar Consulta */}
        <button
          onClick={handleScheduleAppointment}
          className="rounded-xl p-4 text-left transition-transform transform hover:scale-[1.01]"
          style={{ background: 'linear-gradient(135deg, #1a365d 0%, #274a78 100%)', boxShadow: '0 10px 24px rgba(26,54,93,0.35)' }}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">📅 Agendar Consulta</h3>
            <p className="text-sm text-white/80">Agende sua consulta com profissionais especializados</p>
          </div>
        </button>

        {/* Chat com Médico */}
        <button
          onClick={handleOpenChat}
          disabled={chatLoading}
          className={`rounded-xl p-4 text-left transition-transform transform hover:scale-[1.01] ${
            chatLoading ? 'opacity-80 cursor-not-allowed' : ''
          }`}
          style={{ background: 'linear-gradient(135deg, #00C16A 0%, #13794f 100%)', boxShadow: '0 10px 24px rgba(0,193,106,0.35)' }}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {chatLoading ? '🔄 Abrindo chat...' : '💬 Chat com Médico'}
            </h3>
            <p className="text-sm text-white/80">Comunicação direta com seu profissional</p>
          </div>
        </button>

        {/* Plano Terapêutico - Card Compacto */}
        <button
          onClick={() => setActiveTab('plano')}
          className="rounded-xl p-4 text-left transition-transform transform hover:scale-[1.01]"
          style={{ background: 'linear-gradient(135deg, #2d5a3d 0%, #1a365d 100%)', boxShadow: '0 10px 24px rgba(45,90,61,0.35)' }}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">💊 Plano Terapêutico</h3>
            <p className="text-sm text-white/80">
              {therapeuticPlan
                ? `Progresso: ${therapeuticPlan.progress}% • ${therapeuticPlan.medications.length} medicações`
                : 'Acesse suas prescrições integrativas'}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
                         <span className="text-xs bg-white/20 px-2 py-1 rounded flex items-center space-x-1">
               <Stethoscope className="w-3 h-3" />
               <span>Biomédica</span>
             </span>
                           <span className="text-xs bg-white/20 px-2 py-1 rounded flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>MTC</span>
              </span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>Ayurvédica</span>
            </span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded flex items-center space-x-1">
              <Target className="w-3 h-3" />
              <span>Homeopática</span>
            </span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded flex items-center space-x-1">
              <Brain className="w-3 h-3" />
              <span>Integrativa</span>
            </span>
          </div>
        </button>
      </div>

      {/* Card de Orientações para Consulta */}
      {appointments.length > 0 && appointments.some(apt => apt.status === 'scheduled') && (
        <div className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-3">📋 Orientações para sua Consulta</h3>
              <div className="space-y-2 text-slate-200">
                <p className="text-sm">Para aproveitar ao máximo sua consulta, reúna os seguintes documentos:</p>
                <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                  <li>Exames laboratoriais recentes (sangue, urina, etc.)</li>
                  <li>Laudos de exames de imagem (ultrassom, tomografia, etc.)</li>
                  <li>Prescrições médicas atuais e anteriores</li>
                  <li>Histórico de medicações e tratamentos</li>
                  <li>Relatórios de outras especialidades</li>
                  <li>Documentos de avaliações anteriores (se houver)</li>
                </ul>
                <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-xs text-blue-300">
                    💡 <strong>Dica:</strong> Você pode fazer upload desses documentos na área de "Meus Relatórios" ou compartilhá-los diretamente no chat com o profissional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}




      {/* Conteúdo Educacional - Preview */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">📚 Conteúdo Educacional</h3>
          <button
            onClick={() => setActiveTab('conteudo')}
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
          >
            <span>Ver mais conteúdo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('conteudo')}
            className="bg-slate-700 rounded-lg p-4 text-left hover:bg-slate-600 transition-colors"
          >
            <Heart className="w-8 h-8 text-green-400 mb-2" />
            <h4 className="text-white font-semibold mb-1">Cannabis Medicinal</h4>
            <p className="text-slate-400 text-xs">Fundamentos e aplicações clínicas</p>
          </button>
          <button
            onClick={() => setActiveTab('conteudo')}
            className="bg-slate-700 rounded-lg p-4 text-left hover:bg-slate-600 transition-colors"
          >
            <div className="w-8 h-8 mb-2 flex items-center justify-center">
              <img
                src="/brain.png"
                alt="MedCannLab Logo"
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4)) brightness(1.1)'
                }}
              />
            </div>
            <h4 className="text-white font-semibold mb-1">Saúde Renal</h4>
            <p className="text-slate-400 text-xs">Fatores tradicionais e não tradicionais</p>
          </button>
          <button
            onClick={() => setActiveTab('conteudo')}
            className="bg-slate-700 rounded-lg p-4 text-left hover:bg-slate-600 transition-colors"
          >
            <Heart className="w-8 h-8 text-red-400 mb-2" />
            <h4 className="text-white font-semibold mb-1">Bem-estar Integral</h4>
            <p className="text-slate-400 text-xs">Abordagem integrativa de saúde</p>
          </button>
        </div>
      </div>
    </div>
  )

  // Renderizar Sistema de Agendamento
  const renderAgendamento = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">📅 Sistema de Agendamento</h2>
        <p className="text-white/90">Agende consultas com profissionais especializados do MedCannLab</p>
      </div>

      {/* Profissionais Disponíveis */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Profissionais Disponíveis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Dr. Eduardo Faveret */}
          <div className="bg-slate-700 rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg">Dr. Eduardo Faveret</h4>
                <p className="text-slate-400 text-sm">Neurologista Pediátrico</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 text-sm">4.9</span>
                </div>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Especialista em Epilepsia e Cannabis Medicinal. Atendimento personalizado com metodologia AEC.
            </p>
            <button
              onClick={() => navigate('/app/clinica/paciente/agendamentos?professional=eduardo-faveret')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Agendar Consulta
            </button>
          </div>

          {/* Dr. Ricardo Valença */}
          <div className="bg-slate-700 rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-lg">Dr. Ricardo Valença</h4>
                <p className="text-slate-400 text-sm">Administrador • Especialista</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 text-sm">5.0</span>
                </div>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-4">
              Coordenador científico. Especialista em Arte da Entrevista Clínica e metodologia IMRE.
            </p>
            <button
              onClick={() => navigate('/app/clinica/paciente/agendamentos?professional=ricardo-valenca')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Agendar Consulta
            </button>
          </div>
        </div>
      </div>

      {/* Minhas Consultas */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Minhas Consultas</h3>
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="rounded-lg p-4" style={{ background: 'rgba(15,36,60,0.68)', border: '1px solid rgba(0,193,106,0.12)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Calendar className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-white font-semibold">{apt.professional}</p>
                      <p className="text-slate-400 text-sm">{new Date(apt.date).toLocaleDateString('pt-BR')} às {apt.time}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    apt.status === 'scheduled' ? 'bg-green-500/20 text-green-400' :
                    apt.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {apt.status === 'scheduled' ? 'Agendada' :
                     apt.status === 'completed' ? 'Concluída' : 'Cancelada'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">Nenhuma consulta agendada</p>
          </div>
        )}
      </div>
    </div>
  )

  // Renderizar Acompanhamento do Plano Terapêutico
  const renderPlanoTerapeutico = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">💊 Acompanhamento do Plano Terapêutico</h2>
        <p className="text-white/90">Monitore seu tratamento e evolução clínica</p>
      </div>

      {therapeuticPlan ? (
        <>
          {/* Progresso Geral */}
          <div className="rounded-xl p-6" style={{ background: 'rgba(7,22,41,0.86)', border: '1px solid rgba(0,193,106,0.16)', boxShadow: '0 16px 32px rgba(2,12,27,0.45)' }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-white">Progresso do Tratamento</h3>
                <p className="text-slate-300 text-sm">{therapeuticPlan.title}</p>
              </div>
              <div className="px-4 py-2 rounded-lg" style={{ background: 'rgba(0,193,106,0.12)', border: '1px solid rgba(0,193,106,0.28)' }}>
                <span className="text-2xl font-bold text-[#00F5A0]">{therapeuticPlan.progress}%</span>
              </div>
            </div>
            <div className="mt-6">
              <div className="w-full h-3 rounded-full" style={{ background: 'rgba(12,34,54,0.75)', border: '1px solid rgba(0,193,106,0.12)' }}>
                <div
                  className="h-3 rounded-full transition-all"
                  style={{ width: `${therapeuticPlan.progress}%`, background: 'linear-gradient(135deg, #00C16A 0%, #00F5A0 100%)' }}
                />
              </div>
            </div>
          </div>

          {/* Medicações */}
          <div className="rounded-xl p-6" style={{ background: 'rgba(7,22,41,0.86)', border: '1px solid rgba(0,193,106,0.16)', boxShadow: '0 16px 32px rgba(2,12,27,0.45)' }}>
            <h3 className="text-xl font-semibold text-white mb-4">Medicações Ativas</h3>
            <div className="space-y-3">
              {therapeuticPlan.medications.map((med, idx) => (
                <div
                  key={idx}
                  className="rounded-lg p-4 flex items-start justify-between"
                  style={{ background: 'rgba(12,34,54,0.75)', border: '1px solid rgba(0,193,106,0.14)' }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,193,106,0.15)' }}>
                      <CheckCircle className="w-5 h-5 text-[#00F5A0]" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{med.name}</p>
                      <p className="text-slate-300 text-sm">{med.dosage}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs uppercase tracking-wide text-slate-400">Frequência</span>
                    <p className="text-white font-medium text-sm mt-1">{med.frequency}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Próximas Ações */}
          <div className="rounded-xl p-6" style={{ background: 'rgba(7,22,41,0.86)', border: '1px solid rgba(0,193,106,0.16)', boxShadow: '0 16px 32px rgba(2,12,27,0.45)' }}>
            <h3 className="text-xl font-semibold text-white mb-4">Próximas Ações</h3>
            <div className="space-y-3">
              <div className="rounded-lg p-4 flex items-center justify-between" style={{ background: 'rgba(12,34,54,0.75)', border: '1px solid rgba(0,193,106,0.14)' }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.18)' }}>
                    <Calendar className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Revisão do Plano Terapêutico</p>
                    <p className="text-slate-300 text-sm">{therapeuticPlan.nextReview}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('agendamento')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-transform transform hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #007BFF 0%, #00C1FF 100%)' }}
                >
                  Agendar Revisão
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-slate-800 rounded-xl p-6 text-center">
                                           <CheckCircle className="w-16 h-16 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">Nenhum plano terapêutico ativo</p>
          <p className="text-slate-500 text-sm">Complete sua avaliação clínica inicial para receber seu plano personalizado</p>
        </div>
      )}
    </div>
  )

  // Renderizar Conteúdo Educacional
  const renderConteudoEducacional = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">📚 Conteúdo Educacional</h2>
        <p className="text-white/90">Aprenda sobre Cannabis Medicinal e Saúde Renal</p>
      </div>

      {/* Cannabis Medicinal */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
                                                   <Heart className="w-8 h-8 text-green-400" />
          <h3 className="text-xl font-semibold text-white">Cannabis Medicinal</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer">
                                                   <Video className="w-6 h-6 text-green-400 mb-2" />
            <h4 className="text-white font-semibold mb-2">Fundamentos da Cannabis Medicinal</h4>
            <p className="text-slate-400 text-sm mb-3">Conceitos básicos, componentes ativos e mecanismos de ação</p>
            <span className="text-green-400 text-xs">Assistir vídeo →</span>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer">
            <BookOpen className="w-6 h-6 text-green-400 mb-2" />
            <h4 className="text-white font-semibold mb-2">Aplicações Clínicas</h4>
            <p className="text-slate-400 text-sm mb-3">Uso clínico em diferentes condições de saúde</p>
            <span className="text-green-400 text-xs">Ler artigo →</span>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer">
            <FileText className="w-6 h-6 text-green-400 mb-2" />
            <h4 className="text-white font-semibold mb-2">Dosagem e Administração</h4>
            <p className="text-slate-400 text-sm mb-3">Protocolos de dosagem e formas de administração</p>
            <span className="text-green-400 text-xs">Ver guia →</span>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer">
            <Users className="w-6 h-6 text-green-400 mb-2" />
            <h4 className="text-white font-semibold mb-2">Casos Clínicos</h4>
            <p className="text-slate-400 text-sm mb-3">Estudos de caso e experiências reais de pacientes</p>
            <span className="text-green-400 text-xs">Explorar →</span>
          </div>
        </div>
      </div>

      {/* Saúde Renal */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 flex items-center justify-center">
            <img
              src="/brain.png"
              alt="MedCannLab Logo"
              className="w-full h-full object-contain"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4)) brightness(1.1)'
              }}
            />
          </div>
          <h3 className="text-xl font-semibold text-white">Saúde Renal - Fatores Tradicionais e Não Tradicionais</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer">
                                                   <CheckCircle className="w-6 h-6 text-blue-400 mb-2" />
            <h4 className="text-white font-semibold mb-2">Fatores Tradicionais</h4>
            <p className="text-slate-400 text-sm mb-3">Pressão arterial, diabetes, função renal, exames laboratoriais</p>
            <span className="text-blue-400 text-xs">Saiba mais →</span>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer">
            <Zap className="w-6 h-6 text-blue-400 mb-2" />
            <h4 className="text-white font-semibold mb-2">Fatores Não Tradicionais</h4>
            <p className="text-slate-400 text-sm mb-3">Estresse, sono, nutrição, atividade física, bem-estar mental</p>
            <span className="text-blue-400 text-xs">Saiba mais →</span>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer">
            <Activity className="w-6 h-6 text-blue-400 mb-2" />
            <h4 className="text-white font-semibold mb-2">Monitoramento Renal</h4>
            <p className="text-slate-400 text-sm mb-3">Como acompanhar e manter a saúde dos rins</p>
            <span className="text-blue-400 text-xs">Ver guia →</span>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer">
            <Heart className="w-6 h-6 text-blue-400 mb-2" />
            <h4 className="text-white font-semibold mb-2">Abordagem Integrativa</h4>
            <p className="text-slate-400 text-sm mb-3">Cuidado holístico para saúde renal completa</p>
            <span className="text-blue-400 text-xs">Explorar →</span>
          </div>
        </div>
      </div>

      {/* Cursos e Recursos */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <GraduationCap className="w-8 h-8 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">Cursos e Recursos Adicionais</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer">
            <Video className="w-6 h-6 text-purple-400 mb-2" />
            <h4 className="text-white font-semibold mb-2">Vídeos Educativos</h4>
            <p className="text-slate-400 text-xs">Biblioteca de vídeos sobre saúde e bem-estar</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer">
            <Video className="w-6 h-6 text-purple-400 mb-2" />
            <h4 className="text-white font-semibold mb-2">Webinars</h4>
            <p className="text-slate-400 text-xs">Sessões ao vivo com especialistas</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer">
            <BookOpen className="w-6 h-6 text-purple-400 mb-2" />
            <h4 className="text-white font-semibold mb-2">Biblioteca Científica</h4>
            <p className="text-slate-400 text-xs">Artigos e pesquisas científicas</p>
          </div>
        </div>
      </div>
    </div>
  )

  const backgroundGradient = 'linear-gradient(135deg, #0A192F 0%, #1a365d 55%, #2d5a3d 100%)'
  const surfaceColor = 'rgba(7, 22, 41, 0.82)'
  const headerGradient = 'linear-gradient(135deg, rgba(10,25,47,0.96) 0%, rgba(26,54,93,0.92) 55%, rgba(45,90,61,0.9) 100%)'

  return (
    <div className="min-h-screen text-white" style={{ background: backgroundGradient }}>
      {/* Aviso de Visualização (Admin) */}
      {isViewingAsPatient && (
        <div className="bg-yellow-600/20 border-b border-yellow-500/50 p-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">👁️</span>
              <p className="text-yellow-200 text-sm">
                <strong>Modo Admin:</strong> Você está visualizando como <strong>Paciente</strong>.
                Todas as funcionalidades estão disponíveis com permissões de administrador.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-6" style={{ background: headerGradient, borderBottom: '1px solid rgba(0,193,106,0.18)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Meu Dashboard de Saúde</h1>
            <p className="text-slate-400">Programa de Cuidado Renal • Cannabis Medicinal</p>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 bg-slate-700 p-3 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'P'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-white">{user?.name || 'Paciente'}</p>
              <p className="text-sm text-slate-400">Paciente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div style={{ background: 'rgba(15, 36, 60, 0.85)', borderBottom: '1px solid rgba(28,64,94,0.6)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'text-[#FFD33D] border-b-2 border-[#FFD33D]'
                  : 'text-[#8FA7BF] hover:text-[#C8D6E5]'
              }`}
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('agendamento')}
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'agendamento'
                  ? 'text-[#FFD33D] border-b-2 border-[#FFD33D]'
                  : 'text-[#8FA7BF] hover:text-[#C8D6E5]'
              }`}
            >
              📅 Agendamento
            </button>
            <button
              onClick={() => setActiveTab('plano')}
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'plano'
                  ? 'text-[#FFD33D] border-b-2 border-[#FFD33D]'
                  : 'text-[#8FA7BF] hover:text-[#C8D6E5]'
              }`}
            >
              💊 Plano Terapêutico
            </button>
            <button
              onClick={() => setActiveTab('conteudo')}
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'conteudo'
                  ? 'text-[#FFD33D] border-b-2 border-[#FFD33D]'
                  : 'text-[#8FA7BF] hover:text-[#C8D6E5]'
              }`}
            >
              📚 Conteúdo Educacional
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'agendamento' && renderAgendamento()}
          {activeTab === 'plano' && renderPlanoTerapeutico()}
          {activeTab === 'conteudo' && renderConteudoEducacional()}
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard
