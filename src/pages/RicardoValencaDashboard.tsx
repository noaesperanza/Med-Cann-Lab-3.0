import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import PatientManagementAdvanced from './PatientManagementAdvanced'
import ProfessionalChatSystem from '../components/ProfessionalChatSystem'
import VideoCall from '../components/VideoCall'
import IntegrativePrescriptions from '../components/IntegrativePrescriptions'
import ClinicalReports from '../components/ClinicalReports'
import { 
  Brain, 
  Users, 
  Calendar, 
  FileText, 
  MessageCircle, 
  BarChart3, 
  Activity, 
  Heart, 
  Stethoscope, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  BookOpen, 
  Settings,
  Video,
  Phone,
  Download,
  Upload,
  Bell,
  User,
  UserPlus,
  GraduationCap
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Patient {
  id: string
  name: string
  age: number
  cpf: string
  phone: string
  lastVisit: string
  status: string
  assessments?: any[]
  condition?: string
  priority?: 'high' | 'medium' | 'low'
}

const RicardoValencaDashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirecionar pacientes para seu dashboard correto
  useEffect(() => {
    if (user?.type === 'patient') {
      console.log('🔄 Paciente detectado no dashboard profissional, redirecionando...')
      navigate('/app/clinica/paciente/dashboard', { replace: true })
    }
  }, [user?.type, navigate])
  const [patientSearch, setPatientSearch] = useState('')
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
  const [isAudioCallOpen, setIsAudioCallOpen] = useState(false)
  const [callType, setCallType] = useState<'video' | 'audio'>('video')
  const [activeSection, setActiveSection] = useState<'dashboard' | 'agendamentos' | 'pacientes' | 'aulas' | 'financeiro' | 'atendimento' | 'avaliacao' | 'biblioteca' | 'perfil' | 'chat-pacientes' | 'chat-profissionais' | 'kpis-admin' | 'newsletter' | 'prescricoes' | 'relatorios-clinicos'>('dashboard')
  
  // KPIs Administrativos Personalizados
  const [kpis, setKpis] = useState({
    administrativos: {
      totalPacientes: 0,
      avaliacoesCompletas: 0,
      protocolosAEC: 0,
      consultoriosAtivos: 0
    },
    semanticos: {
      qualidadeEnsino: 0,
      engajamentoAlunos: 0,
      satisfacaoProfissionais: 0,
      aderenciaMetodologia: 0
    },
    clinicos: {
      pacientesAtivos: 0,
      monitoramento24h: 0,
      casosComplexos: 0,
      melhoraClinica: 0
    }
  })

  // Debug para verificar seção ativa
  console.log('🎯 Seção ativa:', activeSection)

  // Buscar pacientes do banco de dados
  useEffect(() => {
    loadPatients()
    loadKPIs()
  }, [])

  // Carregar KPIs das 3 camadas da plataforma
  const loadKPIs = async () => {
    try {
      // KPIs Administrativos - dados do banco
      const { data: assessments, error } = await supabase
        .from('clinical_assessments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar avaliações:', error)
        return
      }

      const totalPacientes = assessments?.length || 0
      const avaliacoesCompletas = assessments?.filter(a => a.status === 'completed').length || 0
      const protocolosAEC = assessments?.filter(a => a.assessment_type === 'AEC').length || 0
      const consultoriosAtivos = 3 // Dr. Eduardo + Dr. Ricardo + outros

      // KPIs Semânticos - análise de qualidade (simulados baseados nos dados)
      const qualidadeEnsino = Math.min(98, Math.max(85, 90 + (avaliacoesCompletas * 1.5)))
      const engajamentoAlunos = Math.min(95, Math.max(70, 80 + (totalPacientes * 1.2)))
      const satisfacaoProfissionais = Math.min(99, Math.max(85, 92 + (protocolosAEC * 2)))
      const aderenciaMetodologia = Math.min(96, Math.max(80, 88 + (consultoriosAtivos * 3)))

      // KPIs Clínicos - dados de pacientes e monitoramento (simulados)
      const pacientesAtivos = Math.min(50, Math.max(10, Math.floor(totalPacientes * 0.8)))
      const monitoramento24h = pacientesAtivos
      const casosComplexos = Math.max(0, Math.floor(totalPacientes * 0.2))
      const melhoraClinica = Math.max(0, Math.floor(totalPacientes * 0.7))

      setKpis({
        administrativos: {
          totalPacientes,
          avaliacoesCompletas,
          protocolosAEC,
          consultoriosAtivos
        },
        semanticos: {
          qualidadeEnsino: Math.round(qualidadeEnsino),
          engajamentoAlunos: Math.round(engajamentoAlunos),
          satisfacaoProfissionais: Math.round(satisfacaoProfissionais),
          aderenciaMetodologia: Math.round(aderenciaMetodologia)
        },
        clinicos: {
          pacientesAtivos,
          monitoramento24h,
          casosComplexos,
          melhoraClinica
        }
      })

      console.log('📊 KPIs Administrativos carregados:', {
        administrativos: { totalPacientes, avaliacoesCompletas, protocolosAEC, consultoriosAtivos },
        semanticos: { qualidadeEnsino, engajamentoAlunos, satisfacaoProfissionais, aderenciaMetodologia },
        clinicos: { pacientesAtivos, monitoramento24h, casosComplexos, melhoraClinica }
      })

    } catch (error) {
      console.error('❌ Erro ao carregar KPIs:', error)
    }
  }

  const loadPatients = async () => {
    try {
      setLoading(true)
      
      // Buscar avaliações clínicas para obter lista de pacientes
      const { data: assessments, error } = await supabase
        .from('clinical_assessments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar pacientes:', error)
        return
      }

      // Converter avaliações em lista de pacientes únicos
      const uniquePatients = new Map()
      assessments?.forEach(assessment => {
        if (assessment.patient_id && !uniquePatients.has(assessment.patient_id)) {
          uniquePatients.set(assessment.patient_id, {
            id: assessment.patient_id,
            name: assessment.data?.name || 'Paciente',
            age: assessment.data?.age || 30,
            cpf: assessment.data?.cpf || '000.000.000-00',
            phone: assessment.data?.phone || '(00) 00000-0000',
            lastVisit: new Date(assessment.created_at).toLocaleDateString('pt-BR'),
            status: assessment.status === 'completed' ? 'Ativo' : 'Em tratamento',
            assessments: [assessment],
            condition: assessment.data?.complaintList?.[0] || 'Condição não especificada',
            priority: assessment.data?.improvement ? 'low' : 'high'
          })
        }
      })

      setPatients(Array.from(uniquePatients.values()))
    } catch (error) {
      console.error('❌ Erro ao carregar pacientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatient(patientId)
    const patient = patients.find(p => p.id === patientId)
    if (patient) {
      setClinicalNotes(`Notas clínicas para ${patient.name}:\n\n`)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedPatient) return
    
    try {
      // Aqui você pode implementar a lógica para salvar as notas
      console.log('💾 Salvando notas clínicas:', clinicalNotes)
      // Implementar salvamento no banco de dados
    } catch (error) {
      console.error('❌ Erro ao salvar notas:', error)
    }
  }

  const renderDashboard = () => (
    <>
      {/* Navegação por Eixos */}
      <div className="space-y-8 mb-8">
        {/* 🏥 EIXO CLÍNICA */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Stethoscope className="w-6 h-6 mr-2 text-blue-400" />
            <span>🏥 Eixo Clínica</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate('/app/patients')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">👥 Gestão de Pacientes</h3>
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Prontuário eletrônico</p>
            </button>
            
            <button
              onClick={() => navigate('/app/clinica/profissional/agendamentos')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">📅 Agendamentos</h3>
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Agenda completa</p>
            </button>
            
            <button
              onClick={() => setActiveSection('relatorios-clinicos')}
              className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">📊 Relatórios Clínicos</h3>
                <BarChart3 className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Relatórios da IA</p>
            </button>
            
            <button
              onClick={() => navigate('/app/patient-onboarding')}
              className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">📝 Nova Avaliação</h3>
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Avaliação clínica inicial</p>
            </button>
            
            <button
              onClick={() => setActiveSection('atendimento')}
              className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">Atendimento</h3>
                <Stethoscope className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Sala de atendimento</p>
            </button>
            
            <button
              onClick={() => setActiveSection('prescricoes')}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">💊 Prescrições</h3>
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Prescrições integrativas</p>
            </button>
          </div>
        </div>

        {/* OUTROS */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Outros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveSection('financeiro')}
              className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">💰 Gestão Financeira</h3>
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Controle financeiro</p>
            </button>
            
            <button
              onClick={() => navigate('/app/profile')}
              className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">👤 Meu Perfil</h3>
                <User className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Configurações pessoais</p>
            </button>
          </div>
        </div>

        {/* 🔧 FUNCIONALIDADES ADMINISTRATIVAS */}
        {user?.type === 'admin' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Settings className="w-6 h-6 mr-2 text-orange-400" />
              <span>🔧 Funcionalidades Administrativas</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <button className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">👥 Usuários</h3>
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-xs opacity-75 mt-1">Gestão de usuários do sistema</p>
              </button>
              
              <button className="bg-gradient-to-r from-green-500 to-teal-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">🎓 Cursos</h3>
                  <BookOpen className="w-6 h-6" />
                </div>
                <p className="text-xs opacity-75 mt-1">Gestão de cursos e materiais</p>
              </button>
              
              <button className="bg-gradient-to-r from-emerald-500 to-green-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">💰 Financeiro</h3>
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="text-xs opacity-75 mt-1">Controle financeiro e pagamentos</p>
              </button>
              
              <button className="bg-gradient-to-r from-cyan-500 to-blue-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">💬 Chat Global + Moderação</h3>
                  <MessageCircle className="w-6 h-6" />
                </div>
                <p className="text-xs opacity-75 mt-1">Moderação de chats e conversas</p>
              </button>
              
              <button className="bg-gradient-to-r from-orange-500 to-red-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">🏛️ Moderação Fórum</h3>
                  <MessageCircle className="w-6 h-6" />
                </div>
                <p className="text-xs opacity-75 mt-1">Gestão e moderação do fórum</p>
              </button>
              
              <button className="bg-gradient-to-r from-yellow-500 to-orange-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">🏆 Ranking & Gamificação</h3>
                  <Activity className="w-6 h-6" />
                </div>
                <p className="text-xs opacity-75 mt-1">Sistema de pontos e rankings</p>
              </button>
              
              <button className="bg-gradient-to-r from-indigo-500 to-purple-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">📁 Upload</h3>
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs opacity-75 mt-1">Upload de documentos e arquivos</p>
              </button>
              
              <button className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">📊 Analytics</h3>
                  <BarChart3 className="w-6 h-6" />
                </div>
                <p className="text-xs opacity-75 mt-1">Análise de dados e relatórios</p>
              </button>
              
              <button className="bg-gradient-to-r from-red-500 to-pink-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">🫀 Função Renal</h3>
                  <Activity className="w-6 h-6" />
                </div>
                <p className="text-xs opacity-75 mt-1">Monitoramento de função renal</p>
              </button>
              
              <button className="bg-gradient-to-r from-slate-500 to-gray-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">⚙️ Sistema</h3>
                  <Settings className="w-6 h-6" />
                </div>
                <p className="text-xs opacity-75 mt-1">Configurações do sistema</p>
              </button>
              
              <button className="bg-gradient-to-r from-teal-500 to-cyan-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">📚 Biblioteca</h3>
                  <BookOpen className="w-6 h-6" />
                </div>
                <p className="text-xs opacity-75 mt-1">Biblioteca médica e documentos</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/ai-documents')}
                className="bg-gradient-to-r from-violet-500 to-purple-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">🤖 Chat IA Documentos</h3>
                  <Brain className="w-6 h-6" />
                </div>
                <p className="text-xs opacity-75 mt-1">IA para análise de documentos</p>
              </button>
            </div>

            {/* System Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-sm text-slate-400 mb-1">Sistema Online</p>
                <p className="text-2xl font-bold text-green-400">99.9%</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-sm text-slate-400 mb-1">Usuários Ativos</p>
                <p className="text-2xl font-bold text-blue-400">1,234</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-sm text-slate-400 mb-1">Avaliações Hoje</p>
                <p className="text-2xl font-bold text-purple-400">156</p>
              </div>
            </div>

            {/* 👥 PAINEL DE TIPOS DE USUÁRIOS */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-purple-400" />
                <span>👥 Painel de Tipos de Usuários</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Card Paciente */}
                <button
                  onClick={() => navigate('/app/clinica/paciente/dashboard')}
                  className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">👤 Dashboard do Paciente</h3>
                    <User className="w-6 h-6" />
                  </div>
                  <p className="text-xs opacity-75 mt-1">Acessar dashboard do paciente</p>
                </button>

                {/* Card Profissional */}
                <button
                  onClick={() => navigate('/app/clinica/profissional/dashboard')}
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">👨‍⚕️ Dashboard do Profissional</h3>
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <p className="text-xs opacity-75 mt-1">Acessar dashboard do profissional</p>
                </button>

                {/* Card Aluno */}
                <button
                  onClick={() => navigate('/app/ensino/aluno/dashboard')}
                  className="bg-gradient-to-r from-amber-500 to-orange-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">🎓 Dashboard do Aluno</h3>
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <p className="text-xs opacity-75 mt-1">Acessar dashboard do aluno</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo do Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar - Patient List */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
            <div className="p-4 border-b border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="p-4 h-[calc(100vh-300px)] overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-slate-400">Carregando pacientes...</div>
              ) : patients.length === 0 ? (
                <div className="text-center py-8 text-slate-400">Nenhum paciente encontrado.</div>
              ) : (
                <div className="space-y-3">
                  {patients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase())).map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedPatient === patient.id
                          ? 'bg-blue-600 border-blue-400 text-white'
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <h4 className="font-semibold text-lg">{patient.name}</h4>
                      <p className="text-sm opacity-75">Última visita: {patient.lastVisit}</p>
                      <p className="text-xs opacity-60 mt-1">Status: {patient.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {selectedPatient ? (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-2xl font-bold text-white mb-4">Detalhes do Paciente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                <div>
                  <p><span className="font-semibold text-white">Nome:</span> {patients.find(p => p.id === selectedPatient)?.name}</p>
                  <p><span className="font-semibold text-white">Idade:</span> {patients.find(p => p.id === selectedPatient)?.age}</p>
                  <p><span className="font-semibold text-white">CPF:</span> {patients.find(p => p.id === selectedPatient)?.cpf}</p>
                </div>
                <div>
                  <p><span className="font-semibold text-white">Telefone:</span> {patients.find(p => p.id === selectedPatient)?.phone}</p>
                  <p><span className="font-semibold text-white">Condição:</span> {patients.find(p => p.id === selectedPatient)?.condition}</p>
                  <p><span className="font-semibold text-white">Última Visita:</span> {patients.find(p => p.id === selectedPatient)?.lastVisit}</p>
                </div>
              </div>
              <div className="mt-6">
                <h4 className="font-semibold text-white mb-2">Notas Clínicas</h4>
                <textarea
                  className="w-full h-32 p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Adicione notas clínicas aqui..."
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                ></textarea>
                <button
                  onClick={handleSaveNotes}
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
                >
                  Salvar Notas
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 text-center text-slate-400 border border-slate-700/50 h-full flex items-center justify-center">
              Selecione um paciente para ver os detalhes e notas clínicas.
            </div>
          )}
        </div>
      </div>
    </>
  )

  const renderKPIsAdmin = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">📊 KPIs Administrativos</h2>
        <p className="text-slate-300">Monitoramento das 3 camadas da plataforma MedCannLab 3.0</p>
      </div>

      {/* Camada Administrativa */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-blue-400" />
          📊 Camada Administrativa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Total de Pacientes</h4>
            <p className="text-2xl font-bold text-white">{kpis.administrativos.totalPacientes}</p>
            <p className="text-xs text-slate-400">Pacientes no sistema</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Avaliações Completas</h4>
            <p className="text-2xl font-bold text-white">{kpis.administrativos.avaliacoesCompletas}</p>
            <p className="text-xs text-slate-400">Protocolos finalizados</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Protocolos AEC</h4>
            <p className="text-2xl font-bold text-white">{kpis.administrativos.protocolosAEC}</p>
            <p className="text-xs text-slate-400">Metodologia aplicada</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Consultórios Ativos</h4>
            <p className="text-2xl font-bold text-white">{kpis.administrativos.consultoriosAtivos}</p>
            <p className="text-xs text-slate-400">Rede integrada</p>
          </div>
        </div>
      </div>

      {/* Camada Semântica */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Brain className="w-6 h-6 mr-2 text-purple-400" />
          🧠 Camada Semântica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Qualidade do Ensino</h4>
            <p className="text-2xl font-bold text-white">{kpis.semanticos.qualidadeEnsino}%</p>
            <p className="text-xs text-slate-400">Avaliação metodológica</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Engajamento Alunos</h4>
            <p className="text-2xl font-bold text-white">{kpis.semanticos.engajamentoAlunos}%</p>
            <p className="text-xs text-slate-400">Participação ativa</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Satisfação Profissionais</h4>
            <p className="text-2xl font-bold text-white">{kpis.semanticos.satisfacaoProfissionais}%</p>
            <p className="text-xs text-slate-400">Avaliação da experiência</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Aderência Metodologia</h4>
            <p className="text-2xl font-bold text-white">{kpis.semanticos.aderenciaMetodologia}%</p>
            <p className="text-xs text-slate-400">Cumprimento AEC</p>
          </div>
        </div>
      </div>

      {/* Camada Clínica */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-orange-400" />
          🏥 Camada Clínica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Pacientes Ativos</h4>
            <p className="text-2xl font-bold text-white">{kpis.clinicos.pacientesAtivos}</p>
            <p className="text-xs text-slate-400">Em acompanhamento</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Monitoramento 24h</h4>
            <p className="text-2xl font-bold text-white">{kpis.clinicos.monitoramento24h}</p>
            <p className="text-xs text-slate-400">Pacientes monitorados</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Casos Complexos</h4>
            <p className="text-2xl font-bold text-white">{kpis.clinicos.casosComplexos}</p>
            <p className="text-xs text-slate-400">Requerem atenção</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Melhora Clínica</h4>
            <p className="text-2xl font-bold text-white">{kpis.clinicos.melhoraClinica}</p>
            <p className="text-xs text-slate-400">Evolução positiva</p>
          </div>
        </div>
      </div>

      {/* Botão para voltar ao dashboard */}
      <div className="text-center">
        <button
          onClick={() => setActiveSection('dashboard')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          ← Voltar ao Dashboard
        </button>
      </div>
    </div>
  )

  const renderAgendamentos = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-800 to-purple-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <Calendar className="w-6 h-6" />
          <span>📅 Agendamentos</span>
        </h2>
        <p className="text-purple-200">
          Gerencie seus agendamentos e visualize sua agenda completa
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Hoje</p>
              <p className="text-2xl font-bold text-white">8</p>
            </div>
            <Calendar className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Esta Semana</p>
              <p className="text-2xl font-bold text-white">24</p>
            </div>
            <Clock className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Confirmados</p>
              <p className="text-2xl font-bold text-white">18</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Pendentes</p>
              <p className="text-2xl font-bold text-white">6</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Agenda de Hoje */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Calendar className="w-6 h-6 mr-2 text-purple-400" />
          Agenda de Hoje
        </h3>
        <div className="space-y-3">
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">09</span>
              </div>
              <div>
                <h4 className="font-semibold text-white">Maria Santos</h4>
                <p className="text-slate-400 text-sm">Consulta de retorno - Epilepsia</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">09:00</p>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Confirmado</span>
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">14</span>
              </div>
              <div>
                <h4 className="font-semibold text-white">João Silva</h4>
                <p className="text-slate-400 text-sm">Avaliação inicial - TEA</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">14:00</p>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Confirmado</span>
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">16</span>
              </div>
              <div>
                <h4 className="font-semibold text-white">Ana Costa</h4>
                <p className="text-slate-400 text-sm">Consulta de emergência</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">16:30</p>
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">Pendente</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors">
            <Plus className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Novo Agendamento</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors">
            <Calendar className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Ver Agenda Completa</span>
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors">
            <Download className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Exportar Agenda</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderPacientes = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-800 to-green-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <Users className="w-6 h-6" />
          <span>👥 Meus Pacientes</span>
        </h2>
        <p className="text-green-200">
          Gerencie prontuários e acompanhe a evolução dos seus pacientes
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{patients.length}</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Ativos</p>
              <p className="text-2xl font-bold text-white">{patients.filter(p => p.status === 'Ativo').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Em Tratamento</p>
              <p className="text-2xl font-bold text-white">{patients.filter(p => p.status === 'Em tratamento').length}</p>
            </div>
            <Activity className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Novos</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
            <UserPlus className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Users className="w-6 h-6 mr-2 text-green-400" />
            Lista de Pacientes
          </h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigate('/app/patient-management-advanced')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Gestão Avançada
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4 inline mr-2" />
              Novo Paciente
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-8 text-slate-400">Carregando pacientes...</div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8 text-slate-400">Nenhum paciente encontrado.</div>
        ) : (
          <div className="space-y-3">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer"
                onClick={() => setSelectedPatient(patient.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{patient.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-lg">{patient.name}</h4>
                      <p className="text-slate-400 text-sm">Idade: {patient.age} anos • {patient.condition}</p>
                      <p className="text-slate-500 text-xs">Última visita: {patient.lastVisit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      patient.status === 'Ativo' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {patient.status}
                    </span>
                    <p className="text-slate-400 text-sm mt-1">{patient.assessments?.length || 0} avaliações</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderAulas = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-800 to-yellow-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <GraduationCap className="w-6 h-6" />
          <span>🎓 Preparação de Aulas</span>
        </h2>
        <p className="text-yellow-200">
          Prepare e gerencie suas aulas e materiais educacionais
        </p>
      </div>

      {/* Cursos Ativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-yellow-400" />
            Pós-Graduação Cannabis Medicinal
          </h3>
          <div className="space-y-3">
            <div className="bg-slate-700 rounded-lg p-3">
              <h4 className="font-semibold text-white">Módulo 1: Fundamentos</h4>
              <p className="text-slate-400 text-sm">Aula 1 - Introdução à Cannabis Medicinal</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">Próxima aula: 15/01/2024</span>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs transition-colors">
                  Preparar
                </button>
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <h4 className="font-semibold text-white">Módulo 2: Aplicações Clínicas</h4>
              <p className="text-slate-400 text-sm">Aula 3 - Epilepsia e TEA</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">Próxima aula: 22/01/2024</span>
                <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs transition-colors">
                  Preparar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Stethoscope className="w-6 h-6 mr-2 text-blue-400" />
            Arte da Entrevista Clínica (AEC)
          </h3>
          <div className="space-y-3">
            <div className="bg-slate-700 rounded-lg p-3">
              <h4 className="font-semibold text-white">Fundamentos AEC</h4>
              <p className="text-slate-400 text-sm">Técnicas de escuta ativa</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">Próxima aula: 18/01/2024</span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors">
                  Preparar
                </button>
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <h4 className="font-semibold text-white">Protocolo IMRE</h4>
              <p className="text-slate-400 text-sm">Metodologia triaxial</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">Próxima aula: 25/01/2024</span>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors">
                  Preparar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Materiais e Recursos */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Materiais e Recursos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 transition-colors">
            <Upload className="w-6 h-6 mx-auto mb-2 text-white" />
            <span className="font-semibold text-white">Upload de Materiais</span>
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 transition-colors">
            <BookOpen className="w-6 h-6 mx-auto mb-2 text-white" />
            <span className="font-semibold text-white">Biblioteca</span>
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 rounded-lg p-4 transition-colors">
            <BarChart3 className="w-6 h-6 mx-auto mb-2 text-white" />
            <span className="font-semibold text-white">Relatórios</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderFinanceiro = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-800 to-orange-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6" />
          <span>💰 Gestão Financeira</span>
        </h2>
        <p className="text-orange-200">
          Controle financeiro completo da sua prática médica
        </p>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Receita do Mês</p>
              <p className="text-2xl font-bold text-white">R$ 45.890</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Despesas</p>
              <p className="text-2xl font-bold text-white">R$ 12.340</p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Lucro Líquido</p>
              <p className="text-2xl font-bold text-white">R$ 33.550</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Pacientes Ativos</p>
              <p className="text-2xl font-bold text-white">142</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Transações Recentes */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Transações Recentes</h3>
        <div className="space-y-3">
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Consulta - Maria Santos</h4>
                <p className="text-slate-400 text-sm">15/01/2024 - 14:30</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-semibold">+R$ 350,00</p>
              <span className="text-xs text-slate-500">Pago</span>
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Avaliação - João Silva</h4>
                <p className="text-slate-400 text-sm">14/01/2024 - 09:00</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-semibold">+R$ 500,00</p>
              <span className="text-xs text-slate-500">Pago</span>
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Equipamentos</h4>
                <p className="text-slate-400 text-sm">13/01/2024</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-red-400 font-semibold">-R$ 2.500,00</p>
              <span className="text-xs text-slate-500">Despesa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Financeiras */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Ações Financeiras</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Nova Receita</span>
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg transition-colors">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Registrar Despesa</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors">
            <BarChart3 className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Relatórios</span>
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors">
            <Download className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Exportar</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderAtendimento = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-800 to-red-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <Stethoscope className="w-6 h-6" />
          <span>Atendimento</span>
        </h2>
        <p className="text-red-200">
          Sistema de atendimento integrado com metodologia AEC
        </p>
      </div>

      {/* Status do Atendimento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Em Atendimento</p>
              <p className="text-2xl font-bold text-white">2</p>
            </div>
            <Activity className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Aguardando</p>
              <p className="text-2xl font-bold text-white">5</p>
            </div>
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Finalizados</p>
              <p className="text-2xl font-bold text-white">12</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Sala de Atendimento */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Sala de Atendimento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Próximos Atendimentos</h4>
            <div className="space-y-3">
              <div className={`rounded-lg p-3 ${selectedPatient === 'maria-santos' ? 'bg-red-700 border-2 border-red-400' : 'bg-slate-700'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-white">Maria Santos</h5>
                    <p className="text-slate-400 text-sm">Epilepsia - Retorno</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">09:00</p>
                    <button 
                      onClick={() => {
                        // Encontrar o paciente Maria Santos na lista ou criar um ID temporário
                        const mariaPatient = patients.find(p => p.name.includes('Maria')) || patients[0]
                        let patientId: string
                        if (mariaPatient) {
                          patientId = mariaPatient.id
                          setSelectedPatient(patientId)
                        } else {
                          patientId = 'maria-santos'
                          setSelectedPatient(patientId)
                        }
                        // Abrir automaticamente o chat profissional para este paciente
                        navigate(`/app/clinica/paciente/chat-profissional/${patientId}`)
                      }}
                      className={`px-3 py-1 rounded text-xs transition-colors ${
                        selectedPatient === 'maria-santos' || (selectedPatient && patients.find(p => p.id === selectedPatient)?.name.includes('Maria'))
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {selectedPatient === 'maria-santos' || (selectedPatient && patients.find(p => p.id === selectedPatient)?.name.includes('Maria')) ? 'Em Atendimento' : 'Iniciar'}
                    </button>
                  </div>
                </div>
              </div>
              <div className={`rounded-lg p-3 ${selectedPatient === 'joao-silva' ? 'bg-red-700 border-2 border-red-400' : 'bg-slate-700'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-semibold text-white">João Silva</h5>
                    <p className="text-slate-400 text-sm">TEA - Avaliação</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">14:00</p>
                    <button 
                      onClick={() => {
                        // Encontrar o paciente João Silva na lista ou criar um ID temporário
                        const joaoPatient = patients.find(p => p.name.includes('João')) || patients[1]
                        let patientId: string
                        if (joaoPatient) {
                          patientId = joaoPatient.id
                          setSelectedPatient(patientId)
                        } else {
                          patientId = 'joao-silva'
                          setSelectedPatient(patientId)
                        }
                        // Abrir automaticamente o chat profissional para este paciente
                        navigate(`/app/clinica/paciente/chat-profissional/${patientId}`)
                      }}
                      className={`px-3 py-1 rounded text-xs transition-colors ${
                        selectedPatient === 'joao-silva' || (selectedPatient && patients.find(p => p.id === selectedPatient)?.name.includes('João'))
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {selectedPatient === 'joao-silva' || (selectedPatient && patients.find(p => p.id === selectedPatient)?.name.includes('João')) ? 'Em Atendimento' : 'Iniciar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Ferramentas de Atendimento</h4>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => {
                  if (selectedPatient) {
                    setCallType('video')
                    setIsVideoCallOpen(true)
                  } else {
                    alert('Por favor, inicie um atendimento primeiro selecionando um paciente.')
                  }
                }}
                disabled={!selectedPatient}
                className={`rounded-lg p-3 transition-colors ${
                  selectedPatient 
                    ? 'bg-slate-700 hover:bg-slate-600 cursor-pointer' 
                    : 'bg-slate-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <Video className="w-6 h-6 mx-auto mb-2 text-white" />
                <span className="font-semibold text-white text-sm">Video Call</span>
              </button>
              <button 
                onClick={() => {
                  if (selectedPatient) {
                    setCallType('audio')
                    setIsVideoCallOpen(true)
                  } else {
                    alert('Por favor, inicie um atendimento primeiro selecionando um paciente.')
                  }
                }}
                disabled={!selectedPatient}
                className={`rounded-lg p-3 transition-colors ${
                  selectedPatient 
                    ? 'bg-slate-700 hover:bg-slate-600 cursor-pointer' 
                    : 'bg-slate-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <Phone className="w-6 h-6 mx-auto mb-2 text-white" />
                <span className="font-semibold text-white text-sm">Audio Call</span>
              </button>
              <button 
                onClick={() => {
                  if (selectedPatient) {
                    // Navegar para o chat profissional com o paciente selecionado
                    navigate(`/app/clinica/paciente/chat-profissional/${selectedPatient}`)
                  } else {
                    alert('Por favor, inicie um atendimento primeiro selecionando um paciente.')
                  }
                }}
                disabled={!selectedPatient}
                className={`rounded-lg p-3 transition-colors ${
                  selectedPatient 
                    ? 'bg-slate-700 hover:bg-slate-600 cursor-pointer' 
                    : 'bg-slate-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <MessageCircle className="w-6 h-6 mx-auto mb-2 text-white" />
                <span className="font-semibold text-white text-sm">Chat</span>
              </button>
              <button 
                onClick={() => {
                  if (selectedPatient) {
                    navigate(`/app/patients?patientId=${selectedPatient}`)
                  } else {
                    alert('Por favor, inicie um atendimento primeiro selecionando um paciente.')
                  }
                }}
                disabled={!selectedPatient}
                className={`rounded-lg p-3 transition-colors ${
                  selectedPatient 
                    ? 'bg-slate-700 hover:bg-slate-600 cursor-pointer' 
                    : 'bg-slate-800 opacity-50 cursor-not-allowed'
                }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-2 text-white" />
                <span className="font-semibold text-white text-sm">Prontuário</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAvaliacao = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-800 to-pink-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <FileText className="w-6 h-6" />
          <span>📝 Nova Avaliação</span>
        </h2>
        <p className="text-pink-200">
          Sistema de avaliação clínica com metodologia AEC e protocolo IMRE
        </p>
      </div>

      {/* Tipos de Avaliação */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Brain className="w-6 h-6 mr-2 text-blue-400" />
            Protocolo IMRE
          </h3>
          <p className="text-slate-400 mb-4">
            Avaliação clínica inicial usando o método IMRE Triaxial
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full">
            Iniciar Avaliação IMRE
          </button>
        </div>

        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Stethoscope className="w-6 h-6 mr-2 text-green-400" />
            Arte da Entrevista Clínica
          </h3>
          <p className="text-slate-400 mb-4">
            Avaliação usando a metodologia AEC do Dr. Eduardo Faveret
          </p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors w-full">
            Iniciar AEC
          </button>
        </div>

        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Clock className="w-6 h-6 mr-2 text-orange-400" />
            Consulta de Retorno
          </h3>
          <p className="text-slate-400 mb-4">
            Avaliação de acompanhamento e evolução do paciente
          </p>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors w-full">
            Iniciar Retorno
          </button>
        </div>
      </div>

      {/* Avaliações Recentes */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Avaliações Recentes</h3>
        <div className="space-y-3">
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Maria Santos - IMRE</h4>
                <p className="text-slate-400 text-sm">15/01/2024 - 09:00</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Concluída</span>
              <p className="text-slate-400 text-xs mt-1">Relatório gerado</p>
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-white">João Silva - AEC</h4>
                <p className="text-slate-400 text-sm">14/01/2024 - 14:00</p>
              </div>
            </div>
            <div className="text-right">
              <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">Em andamento</span>
              <p className="text-slate-400 text-xs mt-1">Aguardando conclusão</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBiblioteca = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-800 to-teal-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <BookOpen className="w-6 h-6" />
          <span>📚 Biblioteca</span>
        </h2>
        <p className="text-teal-200">
          Biblioteca médica e recursos educacionais
        </p>
      </div>

      {/* Categorias */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Artigos</p>
              <p className="text-2xl font-bold text-white">156</p>
            </div>
            <BookOpen className="w-8 h-8 text-teal-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Protocolos</p>
              <p className="text-2xl font-bold text-white">23</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Vídeos</p>
              <p className="text-2xl font-bold text-white">89</p>
            </div>
            <Video className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Apresentações</p>
              <p className="text-2xl font-bold text-white">45</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Recursos Recentes */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Recursos Recentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Protocolo IMRE - Versão 2.1</h4>
            <p className="text-slate-400 text-sm mb-3">Metodologia triaxial atualizada para avaliações clínicas</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Atualizado em 10/01/2024</span>
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-xs transition-colors">
                Acessar
              </button>
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">AEC - Guia Completo</h4>
            <p className="text-slate-400 text-sm mb-3">Arte da Entrevista Clínica - Dr. Eduardo Faveret</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Atualizado em 08/01/2024</span>
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-xs transition-colors">
                Acessar
              </button>
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Cannabis Medicinal - Evidências</h4>
            <p className="text-slate-400 text-sm mb-3">Revisão sistemática de evidências científicas</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Atualizado em 05/01/2024</span>
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-xs transition-colors">
                Acessar
              </button>
            </div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Epilepsia e TEA - Protocolos</h4>
            <p className="text-slate-400 text-sm mb-3">Protocolos específicos para epilepsia e TEA</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Atualizado em 03/01/2024</span>
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1 rounded text-xs transition-colors">
                Acessar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ações da Biblioteca */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4">Ações da Biblioteca</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-lg transition-colors">
            <Upload className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Upload</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg transition-colors">
            <Search className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Buscar</span>
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg transition-colors">
            <Download className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Download</span>
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg transition-colors">
            <Settings className="w-6 h-6 mx-auto mb-2" />
            <span className="font-semibold">Organizar</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderNewsletter = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-800 to-cyan-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <BookOpen className="w-6 h-6" />
          <span>📰 Newsletter Científico</span>
        </h2>
        <p className="text-cyan-200">
          Artigos e atualizações científicas sobre Cannabis Medicinal e metodologias clínicas
        </p>
      </div>

      {/* Artigos Recentes */}
      <div className="space-y-4">
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h4 className="font-semibold text-white mb-2 text-lg">Cannabis Medicinal em Epilepsia Refratária</h4>
          <p className="text-slate-400 mb-2 text-sm">Novos estudos sobre eficácia do CBD em crianças com síndrome de Dravet mostram redução significativa de convulsões...</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Nature Medicine • Janeiro 2024</span>
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Ler mais
            </button>
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h4 className="font-semibold text-white mb-2 text-lg">Protocolos IMRE em TEA</h4>
          <p className="text-slate-400 mb-2 text-sm">Implementação da metodologia IMRE para avaliação de pacientes com TEA demonstra melhorias na qualidade da entrevista clínica...</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Journal of Autism • Dezembro 2023</span>
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Ler mais
            </button>
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h4 className="font-semibold text-white mb-2 text-lg">Arte da Entrevista Clínica - Metodologia AEC</h4>
          <p className="text-slate-400 mb-2 text-sm">Técnicas avançadas de escuta ativa e comunicação empática na prática clínica com Cannabis Medicinal...</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Medical Education Review • Novembro 2023</span>
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Ler mais
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPrescricoes = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <FileText className="w-6 h-6" />
          <span>💊 Prescrições Integrativas</span>
        </h2>
        <p className="text-emerald-200">
          Sistema de Prescrições Integrativas conforme Diretrizes CFM + Práticas Integrativas
        </p>
      </div>

      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Conforme Diretrizes CFM + Práticas Integrativas</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Assinatura Digital com Certificado ICP Brasil</li>
            <li>• Validação no Portal do ITI</li>
            <li>• Envio por Email e SMS com QR Code</li>
            <li>• Cinco racionalidades médicas integradas</li>
            <li>• Camadas clínicas de leitura dos dados primários</li>
            <li>• NFT e Blockchain para rastreabilidade</li>
          </ul>
        </div>
        <IntegrativePrescriptions />
      </div>
    </div>
  )

  const renderRelatoriosClinicos = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-800 to-amber-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6" />
          <span>📊 Relatórios Clínicos</span>
        </h2>
        <p className="text-amber-200">
          Visualize e gerencie relatórios clínicos gerados pela IA Residente Nôa Esperança
        </p>
      </div>
      <ClinicalReports />
    </div>
  )

  const renderChatPacientes = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-800 to-blue-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
          <Users className="w-6 h-6" />
          <span>Chat com Pacientes</span>
        </h2>
        <p className="text-blue-200">
          Sistema de comunicação integrado ao prontuário médico - Todas as conversas são automaticamente arquivadas no prontuário do paciente
        </p>
      </div>

      {/* Lista de Pacientes para Chat */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Users className="w-6 h-6 mr-2 text-blue-400" />
          Selecionar Paciente para Chat
        </h3>
        
        {loading ? (
          <div className="text-center py-8 text-slate-400">Carregando pacientes...</div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8 text-slate-400">Nenhum paciente encontrado.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatient(patient.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${
                  selectedPatient === patient.id
                    ? 'bg-blue-600 border-blue-400 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{patient.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    patient.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {patient.status}
                  </span>
                </div>
                <p className="text-sm opacity-75">Idade: {patient.age} anos</p>
                <p className="text-sm opacity-75">Última visita: {patient.lastVisit}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs bg-slate-600 px-2 py-1 rounded">
                    {patient.assessments?.length || 0} avaliações
                  </span>
                  <span className="text-xs bg-slate-600 px-2 py-1 rounded">
                    {patient.condition}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat Interface */}
      {selectedPatient && (
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <MessageCircle className="w-6 h-6 mr-2 text-blue-400" />
              Chat com {patients.find(p => p.id === selectedPatient)?.name}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsVideoCallOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                📹 Video Call
              </button>
              <button
                onClick={() => {
                  setCallType('audio')
                  setIsAudioCallOpen(true)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                📞 Audio Call
              </button>
            </div>
          </div>

          {/* Área de Chat */}
          <div className="bg-slate-900 rounded-lg p-4 h-96 overflow-y-auto mb-4">
            <div className="space-y-4">
              {/* Mensagens simuladas */}
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Olá Dr. Ricardo, como está minha evolução?</p>
                  <p className="text-xs opacity-75 mt-1">10:30</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-slate-700 text-white p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Olá! Sua evolução está muito boa. Os dados dos wearables mostram uma redução significativa nos episódios.</p>
                  <p className="text-xs opacity-75 mt-1">10:32</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Que ótimo! Posso continuar com a mesma medicação?</p>
                  <p className="text-xs opacity-75 mt-1">10:35</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-slate-700 text-white p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Sim, mas vamos ajustar a dosagem baseado nos novos dados. Vou enviar uma prescrição atualizada.</p>
                  <p className="text-xs opacity-75 mt-1">10:37</p>
                </div>
              </div>
            </div>
          </div>

          {/* Input de mensagem */}
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
              Enviar
            </button>
          </div>

          {/* Informações do Prontuário */}
          <div className="mt-4 p-4 bg-slate-700 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-2">📋 Prontuário Integrado</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Conversas arquivadas:</p>
                <p className="text-white font-medium">12 conversas</p>
              </div>
              <div>
                <p className="text-slate-400">Relatórios compartilhados:</p>
                <p className="text-white font-medium">{patients.find(p => p.id === selectedPatient)?.assessments?.length || 0} relatórios</p>
              </div>
              <div>
                <p className="text-slate-400">Última atualização:</p>
                <p className="text-white font-medium">Hoje, 10:37</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Renderizar seção ativa */}
        {activeSection === 'dashboard' && renderDashboard()}
        {activeSection === 'kpis-admin' && renderKPIsAdmin()}
        {activeSection === 'chat-profissionais' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-800 to-indigo-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
                <MessageCircle className="w-6 h-6" />
                <span>Chat com Profissionais</span>
              </h2>
              <p className="text-indigo-200">
                Comunicação segura entre consultórios da plataforma MedCannLab
              </p>
            </div>
            <ProfessionalChatSystem />
          </div>
        )}
        {activeSection === 'chat-pacientes' && renderChatPacientes()}
        
        {/* Outras seções */}
        {activeSection === 'agendamentos' && renderAgendamentos()}
        {activeSection === 'pacientes' && renderPacientes()}
        {activeSection === 'aulas' && renderAulas()}
        {activeSection === 'financeiro' && renderFinanceiro()}
        {activeSection === 'atendimento' && renderAtendimento()}
        {activeSection === 'avaliacao' && renderAvaliacao()}
        {activeSection === 'biblioteca' && renderBiblioteca()}
        {activeSection === 'newsletter' && renderNewsletter()}
        {activeSection === 'prescricoes' && renderPrescricoes()}
        {activeSection === 'relatorios-clinicos' && renderRelatoriosClinicos()}
        
        {activeSection === 'perfil' && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">👤 Meu Perfil</h2>
            <p className="text-slate-300">Gestão de perfil em desenvolvimento</p>
          </div>
        )}
      </div>

      {/* Video/Audio Call Component */}
      <VideoCall
        isOpen={isVideoCallOpen}
        onClose={() => setIsVideoCallOpen(false)}
        patientId={selectedPatient || undefined}
        isAudioOnly={callType === 'audio'}
      />
    </div>
  )
}

export default RicardoValencaDashboard
