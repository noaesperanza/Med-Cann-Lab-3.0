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
  Brain,
  CheckCircle,
  Star,
  Activity,
  Target,
  BarChart3,
  BookOpen,
  Pill,
  Leaf,
  Apple,
  Zap,
  Users,
  ArrowRight,
  PlayCircle,
  Video,
  FileVideo,
  GraduationCap
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'
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

const PatientDashboard: React.FC = () => {
  const { user } = useAuth()
  const { sendInitialMessage } = useNoaPlatform()
  const navigate = useNavigate()
  
  // Estados
  const [reports, setReports] = useState<ClinicalReport[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [therapeuticPlan, setTherapeuticPlan] = useState<TherapeuticPlan | null>(null)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agendamento' | 'plano' | 'conteudo'>('dashboard')

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

      // Carregar plano terapêutico (simulado por enquanto)
      setTherapeuticPlan({
        id: '1',
        title: 'Plano Terapêutico - Cannabis Medicinal',
        progress: 45,
        medications: [
          { name: 'CBD', dosage: '25mg', frequency: '2x ao dia' },
          { name: 'THC', dosage: '5mg', frequency: '1x ao dia' }
        ],
        nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
      })

      setLoadingReports(false)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setLoadingReports(false)
    }
  }

  // Função para iniciar avaliação clínica inicial
  const handleStartClinicalAssessment = () => {
    const imrePrompt = `Olá Nôa! Sou ${user?.name || 'um paciente'} e gostaria de realizar uma Avaliação Clínica Inicial seguindo o protocolo IMRE (Incentivador Mínimo do Relato Espontâneo) da Arte da Entrevista Clínica aplicada à Cannabis Medicinal. Por favor, inicie o protocolo IMRE para minha avaliação clínica inicial e, ao final, gere um relatório clínico que será salvo no meu dashboard.`
    sendInitialMessage(imrePrompt)
  }

  // Função para agendar consulta
  const handleScheduleAppointment = () => {
    navigate('/app/clinica/paciente/agendamentos')
  }

  // Renderizar Dashboard Principal
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Mensagem de Boas-vindas */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Bem-vindo, {user?.name || 'Paciente'}!</h2>
        <p className="text-white/90">
          Seu centro de acompanhamento personalizado para cuidado renal e cannabis medicinal
        </p>
      </div>

      {/* Cards de Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Agendar Consulta */}
        <button
          onClick={handleScheduleAppointment}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
        >
          <Calendar className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">📅 Agendar Consulta</h3>
          <p className="text-sm text-white/80">Agende sua consulta com profissionais especializados</p>
        </button>

        {/* Avaliação Clínica */}
        <button
          onClick={handleStartClinicalAssessment}
          className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
        >
          <Brain className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">🧠 Avaliação Clínica</h3>
          <p className="text-sm text-white/80">Inicie avaliação com protocolo IMRE</p>
        </button>

        {/* Chat com Médico */}
        <button
          onClick={() => navigate('/app/clinica/paciente/chat-profissional')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
        >
          <MessageCircle className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">💬 Chat com Médico</h3>
          <p className="text-sm text-white/80">Comunicação direta com seu profissional</p>
        </button>

        {/* Meus Relatórios */}
        <button
          onClick={() => navigate('/app/clinica/paciente/relatorios')}
          className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
        >
          <FileText className="w-8 h-8 mb-3" />
          <h3 className="text-lg font-semibold mb-2">📋 Meus Relatórios</h3>
          <p className="text-sm text-white/80">Acesse seus relatórios clínicos</p>
        </button>
      </div>

      {/* Próximas Consultas */}
      <div className="bg-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">📅 Próximas Consultas</h3>
          <button
            onClick={handleScheduleAppointment}
            className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
          >
            <span>Agendar nova consulta</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div key={apt.id} className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">{apt.professional}</p>
                    <p className="text-slate-400 text-sm">{new Date(apt.date).toLocaleDateString('pt-BR')} às {apt.time}</p>
                    <p className="text-slate-500 text-xs">{apt.type}</p>
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
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 mb-2">Nenhuma consulta agendada</p>
            <button
              onClick={handleScheduleAppointment}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Agendar sua primeira consulta
            </button>
          </div>
        )}
      </div>

      {/* Plano Terapêutico - Resumo */}
      {therapeuticPlan && (
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">💊 Meu Plano Terapêutico</h3>
            <button
              onClick={() => setActiveTab('plano')}
              className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
            >
              <span>Ver detalhes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-300 text-sm">Progresso do tratamento</span>
              <span className="text-white font-semibold">{therapeuticPlan.progress}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                style={{ width: `${therapeuticPlan.progress}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400 text-sm mb-2">Medicações ativas</p>
              <div className="space-y-2">
                {therapeuticPlan.medications.map((med, idx) => (
                  <div key={idx} className="bg-slate-700 rounded-lg p-3">
                    <p className="text-white font-medium">{med.name}</p>
                    <p className="text-slate-400 text-xs">{med.dosage} • {med.frequency}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Próxima revisão</p>
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-white font-semibold">{therapeuticPlan.nextReview}</p>
                <p className="text-slate-400 text-xs mt-1">Revisão do plano terapêutico</p>
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
          <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer">
            <Leaf className="w-8 h-8 text-green-400 mb-2" />
            <h4 className="text-white font-semibold mb-1">Cannabis Medicinal</h4>
            <p className="text-slate-400 text-xs">Fundamentos e aplicações clínicas</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer">
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
          </div>
          <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer">
            <Heart className="w-8 h-8 text-red-400 mb-2" />
            <h4 className="text-white font-semibold mb-1">Bem-estar Integral</h4>
            <p className="text-slate-400 text-xs">Abordagem integrativa de saúde</p>
          </div>
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
              <div key={apt.id} className="bg-slate-700 rounded-lg p-4">
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
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Progresso do Tratamento</h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">{therapeuticPlan.title}</span>
                <span className="text-white font-semibold">{therapeuticPlan.progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all"
                  style={{ width: `${therapeuticPlan.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Medicações */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Medicações Ativas</h3>
            <div className="space-y-3">
              {therapeuticPlan.medications.map((med, idx) => (
                <div key={idx} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Pill className="w-6 h-6 text-green-400" />
                      <div>
                        <p className="text-white font-semibold">{med.name}</p>
                        <p className="text-slate-400 text-sm">{med.dosage}</p>
                        <p className="text-slate-500 text-xs">{med.frequency}</p>
                      </div>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Próximas Ações */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Próximas Ações</h3>
            <div className="space-y-3">
              <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="text-white font-semibold">Revisão do Plano Terapêutico</p>
                    <p className="text-slate-400 text-sm">{therapeuticPlan.nextReview}</p>
                  </div>
                </div>
                <button className="text-blue-400 hover:text-blue-300 text-sm">Agendar</button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-slate-800 rounded-xl p-6 text-center">
          <Pill className="w-16 h-16 text-slate-500 mx-auto mb-3" />
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
          <Leaf className="w-8 h-8 text-green-400" />
          <h3 className="text-xl font-semibold text-white">Cannabis Medicinal</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer">
            <PlayCircle className="w-6 h-6 text-green-400 mb-2" />
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
            <Apple className="w-6 h-6 text-blue-400 mb-2" />
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
            <FileVideo className="w-6 h-6 text-purple-400 mb-2" />
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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
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
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('agendamento')}
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'agendamento'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              📅 Agendamento
            </button>
            <button
              onClick={() => setActiveTab('plano')}
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'plano'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              💊 Plano Terapêutico
            </button>
            <button
              onClick={() => setActiveTab('conteudo')}
              className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'conteudo'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
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
