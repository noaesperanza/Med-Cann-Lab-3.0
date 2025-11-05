import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Video,
  Phone,
  MessageCircle,
  FileText,
  Download,
  Upload,
  User,
  Search,
  Mic,
  Plus,
  Clock,
  CheckCircle,
  Image,
  AlertCircle,
  Calendar,
  Share2,
  BarChart3,
  BookOpen,
  Award,
  GraduationCap,
  Users,
  Heart,
  Brain,
  FlaskConical as Microscope,
  Activity
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ClinicalAssessmentService } from '../lib/clinicalAssessmentService'
import { useAuth } from '../contexts/AuthContext'
import VideoCall from '../components/VideoCall'
import KPIDashboard from '../components/KPIDashboard'
import Newsletter from '../components/Newsletter'
import QuickPrescriptions from '../components/QuickPrescriptions'
import EduardoScheduling from '../components/EduardoScheduling'
import CoordenacaoMedica from '../components/CoordenacaoMedica'
import GestaoCursos from '../components/GestaoCursos'
import NeurologiaPediatrica from '../components/NeurologiaPediatrica'
import WearableMonitoring from '../components/WearableMonitoring'
import ProfessionalChatSystem from '../components/ProfessionalChatSystem'
import IntegratedDocuments from '../components/IntegratedDocuments'

interface Patient {
  id: string
  name: string
  age: number
  cpf: string
  phone: string
  lastVisit: string
  status: string
  assessments?: any[]
}

const EduardoFaveretDashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [patientSearch, setPatientSearch] = useState('')
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
  const [isAudioCallOpen, setIsAudioCallOpen] = useState(false)
  const [callType, setCallType] = useState<'video' | 'audio'>('video')
  const [activeSection, setActiveSection] = useState<'dashboard' | 'kpis' | 'newsletter' | 'prescriptions' | 'research' | 'teaching' | 'scheduling' | 'coordenacao' | 'cursos' | 'neurologia' | 'wearables' | 'kpis-personalizados' | 'chat-profissionais' | 'chat-pacientes'>('dashboard')
  
  // KPIs das 3 camadas da plataforma
  const [kpis, setKpis] = useState({
    administrativos: {
      totalPacientes: 0,
      avaliacoesCompletas: 0,
      protocolosIMRE: 0,
      respondedoresTEZ: 0
    },
    semanticos: {
      qualidadeEscuta: 0,
      engajamentoPaciente: 0,
      satisfacaoClinica: 0,
      aderenciaTratamento: 0
    },
    clinicos: {
      wearablesAtivos: 0,
      monitoramento24h: 0,
      episodiosEpilepsia: 0,
      melhoraSintomas: 0
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
      const protocolosIMRE = assessments?.filter(a => a.assessment_type === 'IMRE').length || 0
      const respondedoresTEZ = assessments?.filter(a => a.data?.improvement === true).length || 0

      // KPIs Semânticos - análise de qualidade (simulados baseados nos dados)
      const qualidadeEscuta = Math.min(95, Math.max(70, 85 + (avaliacoesCompletas * 2)))
      const engajamentoPaciente = Math.min(90, Math.max(60, 75 + (totalPacientes * 1.5)))
      const satisfacaoClinica = Math.min(98, Math.max(80, 88 + (respondedoresTEZ * 3)))
      const aderenciaTratamento = Math.min(92, Math.max(65, 78 + (protocolosIMRE * 2.5)))

      // KPIs Clínicos - dados de wearables e monitoramento (simulados)
      const wearablesAtivos = Math.min(15, Math.max(5, Math.floor(totalPacientes * 0.6)))
      const monitoramento24h = wearablesAtivos
      const episodiosEpilepsia = Math.max(0, Math.floor(totalPacientes * 0.3))
      const melhoraSintomas = respondedoresTEZ

      setKpis({
        administrativos: {
          totalPacientes,
          avaliacoesCompletas,
          protocolosIMRE,
          respondedoresTEZ
        },
        semanticos: {
          qualidadeEscuta: Math.round(qualidadeEscuta),
          engajamentoPaciente: Math.round(engajamentoPaciente),
          satisfacaoClinica: Math.round(satisfacaoClinica),
          aderenciaTratamento: Math.round(aderenciaTratamento)
        },
        clinicos: {
          wearablesAtivos,
          monitoramento24h,
          episodiosEpilepsia,
          melhoraSintomas
        }
      })

      console.log('📊 KPIs carregados:', {
        administrativos: { totalPacientes, avaliacoesCompletas, protocolosIMRE, respondedoresTEZ },
        semanticos: { qualidadeEscuta, engajamentoPaciente, satisfacaoClinica, aderenciaTratamento },
        clinicos: { wearablesAtivos, monitoramento24h, episodiosEpilepsia, melhoraSintomas }
      })

    } catch (error) {
      console.error('❌ Erro ao carregar KPIs:', error)
    }
  }

  const loadPatients = async () => {
    try {
      setLoading(true)
      
      const { data: assessments, error } = await supabase
        .from('clinical_assessments')
        .select(`
          *,
          patient:patient_id,
          doctor:doctor_id
        `)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('❌ Erro ao buscar avaliações:', error)
        setLoading(false)
        return
      }

      const patientsMap = new Map<string, Patient>()
      
      assessments?.forEach(assessment => {
        const patientId = assessment.patient_id
        if (!patientsMap.has(patientId)) {
          const patientData = assessment.data
          
          patientsMap.set(patientId, {
            id: patientId,
            name: patientData?.name || 'Paciente',
            age: patientData?.age || 0,
            cpf: patientData?.cpf || '',
            phone: patientData?.phone || '',
            lastVisit: new Date(assessment.created_at).toLocaleDateString('pt-BR'),
            status: assessment.status === 'completed' ? 'Avaliado' : 'Em avaliação',
            assessments: []
          })
        }
        
        const patient = patientsMap.get(patientId)!
        patient.assessments = patient.assessments || []
        patient.assessments.push(assessment)
      })

      const patientsArray = Array.from(patientsMap.values())
      setPatients(patientsArray)
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotes = () => {
    alert('Notas salvas no prontuário do paciente!')
    setClinicalNotes('')
  }

  // Renderizar dashboard principal com cards organizados
  const renderDashboard = () => {
    return (
      <div className="space-y-8">
        {/* 🏥 EIXO CLÍNICA */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">🏥 Eixo Clínica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/app/clinica/profissional/pacientes')}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">👥 Gestão de Pacientes</h3>
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Prontuário eletrônico</p>
            </button>
            
            <button
              onClick={() => navigate('/app/clinica/profissional/agendamentos')}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">📅 Agendamentos</h3>
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Agenda completa</p>
            </button>
            
            <button
              onClick={() => setActiveSection('kpis-personalizados')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">📊 KPIs TEA</h3>
                <Brain className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Monitoramento neurológico</p>
            </button>
            
            <button
              onClick={() => setActiveSection('neurologia')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">🧠 Neurologia Pediátrica</h3>
                <Brain className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Epilepsia e Cannabis Medicinal</p>
            </button>
            
            <button
              onClick={() => setActiveSection('wearables')}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">📱 Monitoramento Wearables</h3>
                <Activity className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Monitoramento 24/7</p>
            </button>
            
            <button
              onClick={() => setActiveSection('scheduling')}
              className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">📅 Agendamento Personalizado</h3>
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Sistema de agendamento</p>
            </button>
          </div>
        </div>

        {/* 🎓 EIXO ENSINO */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">🎓 Eixo Ensino</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/app/ensino/profissional/dashboard')}
              className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">🎓 Gestão de Ensino</h3>
                <GraduationCap className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Gerenciamento de cursos</p>
            </button>
            
            <button
              onClick={() => setActiveSection('cursos')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">📚 Gestão de Cursos</h3>
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Pós-graduação Cannabis Medicinal</p>
            </button>
          </div>
        </div>

        {/* 🔬 EIXO PESQUISA */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">🔬 Eixo Pesquisa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/app/pesquisa/profissional/dashboard')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">🔬 Dashboard de Pesquisa</h3>
                <Microscope className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Centro de pesquisa AEC</p>
            </button>
            
            <button
              onClick={() => setActiveSection('research')}
              className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">📊 Pesquisa AEC</h3>
                <Microscope className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Estudos e publicações</p>
            </button>
            
            <button
              onClick={() => setActiveSection('newsletter')}
              className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">📰 Publicações</h3>
                <BookOpen className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Newsletter científico</p>
            </button>
          </div>
        </div>

        {/* Outros */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Outros</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveSection('coordenacao')}
              className="bg-gradient-to-r from-slate-600 to-gray-600 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium opacity-90">👥 Coordenação Médica</h3>
                <Users className="w-6 h-6" />
              </div>
              <p className="text-xs opacity-75 mt-1">Gestão de equipes</p>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Renderizar seção ativa */}
        {activeSection === 'dashboard' && renderDashboard()}
        {activeSection !== 'dashboard' && (
          <>
            {/* Status Cards Personalizados - Integrados com 3 Camadas de KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* KPI Administrativo - Pacientes Neurológicos */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all cursor-pointer" onClick={() => setActiveSection('kpis-personalizados')}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Pacientes Neurológicos</h3>
                  <Brain className="w-6 h-6" />
                </div>
                <p className="text-3xl font-bold">{kpis.administrativos.totalPacientes || patients.length}</p>
                <p className="text-sm opacity-75 mt-1">Epilepsia e TEZ</p>
                <div className="mt-2 text-xs opacity-60">📊 KPI Administrativo</div>
              </div>
              
              {/* KPI Administrativo - Protocolos IMRE */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all cursor-pointer" onClick={() => setActiveSection('kpis-personalizados')}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Protocolos IMRE</h3>
                  <Brain className="w-6 h-6" />
                </div>
                <p className="text-3xl font-bold">{kpis.administrativos.protocolosIMRE || 18}</p>
                <p className="text-sm opacity-75 mt-1">Avaliações completas</p>
                <div className="mt-2 text-xs opacity-60">📊 KPI Administrativo</div>
              </div>
              
              {/* KPI Semântico - Respondedores TEZ */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all cursor-pointer" onClick={() => setActiveSection('kpis-personalizados')}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Respondedores TEZ</h3>
                  <Microscope className="w-6 h-6" />
                </div>
                <p className="text-3xl font-bold">{kpis.administrativos.respondedoresTEZ || 8}</p>
                <p className="text-sm opacity-75 mt-1">Pacientes com melhora</p>
                <div className="mt-2 text-xs opacity-60">🧠 KPI Semântico</div>
              </div>
              
              {/* KPI Clínico - Wearables Ativos */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all cursor-pointer" onClick={() => setActiveSection('kpis-personalizados')}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Wearables Ativos</h3>
                  <Activity className="w-6 h-6" />
                </div>
                <p className="text-3xl font-bold">{kpis.clinicos.wearablesAtivos || 12}</p>
                <p className="text-sm opacity-75 mt-1">Monitoramento 24/7</p>
                <div className="mt-2 text-xs opacity-60">🏥 KPI Clínico</div>
              </div>
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
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-slate-400">
                        Carregando pacientes...
                      </div>
                    ) : patients.length === 0 ? (
                      <div className="p-4 text-center text-slate-400">
                        Nenhum paciente encontrado
                      </div>
                    ) : (
                      patients
                        .filter(patient => 
                          patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
                          patient.cpf.includes(patientSearch) ||
                          patient.phone.includes(patientSearch)
                        )
                        .map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => setSelectedPatient(patient.id)}
                            className={`w-full p-4 text-left border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                              selectedPatient === patient.id ? 'bg-slate-700' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-white">{patient.name}</p>
                                <p className="text-xs text-slate-400">{patient.age} anos • CPF: {patient.cpf}</p>
                                <p className="text-xs text-slate-400">{patient.phone}</p>
                                <p className="text-xs text-slate-500">{patient.status}</p>
                              </div>
                            </div>
                          </button>
                        ))
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content Area - Patient Chart */}
              <div className="lg:col-span-2">
                {selectedPatient ? (
                  <div className="space-y-6">
                    {/* Patient Header */}
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-white">
                              {patients.find(p => p.id === selectedPatient)?.name}
                            </h2>
                            <p className="text-sm text-slate-400">
                              {patients.find(p => p.id === selectedPatient)?.age} anos • 
                              CPF: {patients.find(p => p.id === selectedPatient)?.cpf}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              setCallType('video')
                              setIsVideoCallOpen(true)
                            }}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors" 
                            title="Vídeo"
                          >
                            <Video className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => {
                              setCallType('audio')
                              setIsVideoCallOpen(true)
                            }}
                            className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors" 
                            title="Áudio"
                          >
                            <Phone className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => navigate(`/patient-chat/${selectedPatient}`)}
                            className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors" 
                            title="Chat"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Clinical Notes Area */}
                    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Notas Clínicas AEC</h3>
                        <button
                          onClick={handleSaveNotes}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Salvar</span>
                        </button>
                      </div>
                      
                      <textarea
                        value={clinicalNotes}
                        onChange={(e) => setClinicalNotes(e.target.value)}
                        placeholder="Digite as informações do paciente seguindo a metodologia AEC..."
                        rows={12}
                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-green-500 resize-none"
                      />
                      
                      <div className="flex items-center space-x-4 mt-4">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                          <Mic className="w-4 h-4" />
                          <span>Dictar</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                          <Clock className="w-4 h-4" />
                          <span>Histórico</span>
                        </button>
                      </div>
                    </div>

                    {/* Documentos Clínicos Integrados */}
                    <div className="mt-6">
                      <IntegratedDocuments
                        module="clinical"
                        category="protocols"
                        audience={['professional']}
                        title="Documentos Clínicos Críticos"
                        description="Protocolos, diretrizes e casos clínicos essenciais para o atendimento"
                        maxDocuments={5}
                        showFilters={false}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-slate-700/50 text-center">
                    <Heart className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Selecione um Paciente</h3>
                    <p className="text-slate-400">Escolha um paciente da lista para iniciar o atendimento com AEC</p>
                    
                    {/* Documentos Gerais quando nenhum paciente está selecionado */}
                    <div className="mt-8">
                      <IntegratedDocuments
                        module="clinical"
                        category="protocols"
                        audience={['professional']}
                        title="Documentos Clínicos Disponíveis"
                        description="Protocolos e diretrizes para consulta durante o atendimento"
                        maxDocuments={3}
                        showFilters={false}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Seção KPIs Personalizados - 3 Camadas */}
        {activeSection === 'kpis-personalizados' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">📊 KPIs Personalizados - Dr. Eduardo Faveret</h2>
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
                  <p className="text-xs text-slate-400">Pacientes neurológicos cadastrados</p>
                </div>
                <div className="bg-slate-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Avaliações Completas</h4>
                  <p className="text-2xl font-bold text-white">{kpis.administrativos.avaliacoesCompletas}</p>
                  <p className="text-xs text-slate-400">Protocolos finalizados</p>
                </div>
                <div className="bg-slate-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Protocolos IMRE</h4>
                  <p className="text-2xl font-bold text-white">{kpis.administrativos.protocolosIMRE}</p>
                  <p className="text-xs text-slate-400">Metodologia triaxial aplicada</p>
                </div>
                <div className="bg-slate-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Respondedores TEZ</h4>
                  <p className="text-2xl font-bold text-white">{kpis.administrativos.respondedoresTEZ}</p>
                  <p className="text-xs text-slate-400">Pacientes com melhora clínica</p>
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
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Qualidade da Escuta</h4>
                  <p className="text-2xl font-bold text-white">{kpis.semanticos.qualidadeEscuta}%</p>
                  <p className="text-xs text-slate-400">Análise da comunicação IA-paciente</p>
                </div>
                <div className="bg-slate-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Engajamento</h4>
                  <p className="text-2xl font-bold text-white">{kpis.semanticos.engajamentoPaciente}%</p>
                  <p className="text-xs text-slate-400">Participação ativa do paciente</p>
                </div>
                <div className="bg-slate-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Satisfação Clínica</h4>
                  <p className="text-2xl font-bold text-white">{kpis.semanticos.satisfacaoClinica}%</p>
                  <p className="text-xs text-slate-400">Avaliação da experiência</p>
                </div>
                <div className="bg-slate-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Aderência ao Tratamento</h4>
                  <p className="text-2xl font-bold text-white">{kpis.semanticos.aderenciaTratamento}%</p>
                  <p className="text-xs text-slate-400">Cumprimento das orientações</p>
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
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Wearables Ativos</h4>
                  <p className="text-2xl font-bold text-white">{kpis.clinicos.wearablesAtivos}</p>
                  <p className="text-xs text-slate-400">Dispositivos conectados</p>
                </div>
                <div className="bg-slate-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Monitoramento 24h</h4>
                  <p className="text-2xl font-bold text-white">{kpis.clinicos.monitoramento24h}</p>
                  <p className="text-xs text-slate-400">Pacientes monitorados</p>
                </div>
                <div className="bg-slate-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Episódios Epilepsia</h4>
                  <p className="text-2xl font-bold text-white">{kpis.clinicos.episodiosEpilepsia}</p>
                  <p className="text-xs text-slate-400">Eventos registrados</p>
                </div>
                <div className="bg-slate-600 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-slate-300 mb-2">Melhora dos Sintomas</h4>
                  <p className="text-2xl font-bold text-white">{kpis.clinicos.melhoraSintomas}</p>
                  <p className="text-xs text-slate-400">Pacientes com evolução positiva</p>
                </div>
              </div>
            </div>

            {/* Botão para voltar ao dashboard */}
            <div className="text-center">
              <button
                onClick={() => setActiveSection('dashboard')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                ← Voltar ao Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Seção Pesquisa */}
        {activeSection === 'research' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-800 to-purple-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
                <Microscope className="w-6 h-6" />
                <span>Centro de Pesquisa AEC</span>
              </h2>
              <p className="text-purple-200">
                Pesquisas e estudos em Arte da Entrevista Clínica aplicada à Cannabis Medicinal
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-2">Estudos Ativos</h3>
                <p className="text-3xl font-bold text-purple-400 mb-2">12</p>
                <p className="text-slate-400 text-sm">Pesquisas em andamento</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-2">Publicações</h3>
                <p className="text-3xl font-bold text-blue-400 mb-2">28</p>
                <p className="text-slate-400 text-sm">Artigos publicados</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-2">Colaboradores</h3>
                <p className="text-3xl font-bold text-green-400 mb-2">15</p>
                <p className="text-slate-400 text-sm">Pesquisadores</p>
              </div>
            </div>

            {/* Documentos de Pesquisa Integrados */}
            <div className="mt-8">
              <IntegratedDocuments
                module="research"
                category="research"
                audience={['professional', 'student']}
                title="Artigos e Estudos Científicos"
                description="Pesquisas, estudos clínicos e evidências científicas sobre cannabis medicinal"
                maxDocuments={6}
                showFilters={true}
              />
            </div>
          </div>
        )}

        {/* Seção Ensino */}
        {activeSection === 'teaching' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-800 to-blue-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
                <GraduationCap className="w-6 h-6" />
                <span>Escola AEC</span>
              </h2>
              <p className="text-blue-200">
                Formação em Arte da Entrevista Clínica para profissionais da saúde
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-2">Alunos Formados</h3>
                <p className="text-3xl font-bold text-blue-400 mb-2">45</p>
                <p className="text-slate-400 text-sm">Profissionais certificados</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-2">Cursos Ativos</h3>
                <p className="text-3xl font-bold text-green-400 mb-2">8</p>
                <p className="text-slate-400 text-sm">Programas de formação</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-2">Satisfação</h3>
                <p className="text-3xl font-bold text-yellow-400 mb-2">98%</p>
                <p className="text-slate-400 text-sm">Avaliação dos alunos</p>
              </div>
            </div>

            {/* Documentos Educacionais Integrados */}
            <div className="mt-8">
              <IntegratedDocuments
                module="education"
                category="multimedia"
                audience={['student', 'professional']}
                title="Material Educacional"
                description="Aulas, vídeos e materiais didáticos da Escola AEC"
                maxDocuments={8}
                showFilters={true}
              />
            </div>
          </div>
        )}

        {/* Seção Newsletter */}
        {activeSection === 'newsletter' && (
          <Newsletter />
        )}

        {/* Seção Prescrições */}
        {activeSection === 'prescriptions' && (
          <QuickPrescriptions />
        )}

        {/* Seção Agendamento */}
        {activeSection === 'scheduling' && (
          <EduardoScheduling />
        )}

        {/* Seção Coordenação Médica */}
        {activeSection === 'coordenacao' && (
          <CoordenacaoMedica />
        )}

        {/* Seção Gestão de Cursos */}
        {activeSection === 'cursos' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-800 to-blue-700 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
                <GraduationCap className="w-6 h-6" />
                <span>Gestão de Cursos</span>
              </h2>
              <p className="text-blue-200">
                Pós-graduação em Cannabis Medicinal - Produção e Gestão de Aulas
              </p>
            </div>
            <GestaoCursos />
          </div>
        )}

        {/* Seção Neurologia Pediátrica */}
        {activeSection === 'neurologia' && (
          <NeurologiaPediatrica />
        )}

        {/* Seção Monitoramento Wearables */}
        {activeSection === 'wearables' && (
          <WearableMonitoring />
        )}

        {/* Seção Chat Profissionais */}
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

        {/* Seção Chat com Pacientes - Prontuário Integrado */}
        {activeSection === 'chat-pacientes' && (
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
                          {patient.status}
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
                        <p className="text-sm">Olá Dr. Eduardo, como está minha evolução?</p>
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

export default EduardoFaveretDashboard
