import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useUserView } from '../contexts/UserViewContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { normalizeUserType } from '../lib/userTypes'
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
import { getAllPatients, isAdmin } from '../lib/adminPermissions'

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
  const { isAdminViewingAs, viewAsType, setViewAsType, getEffectiveUserType } = useUserView()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Detectar eixo atual da URL
  const getCurrentEixo = (): 'clinica' | 'ensino' | 'pesquisa' | null => {
    if (location.pathname.includes('/clinica/')) return 'clinica'
    if (location.pathname.includes('/ensino/')) return 'ensino'
    if (location.pathname.includes('/pesquisa/')) return 'pesquisa'
    return null
  }
  
  const currentEixo = getCurrentEixo()
  const effectiveType = getEffectiveUserType(user?.type)
  
  // Reagir a mudanças no viewAsType e eixo para renderizar conteúdo dinâmico
  useEffect(() => {
    if (!user || normalizeUserType(user.type) !== 'admin') return
    
    // Se admin está visualizando como outro tipo, redirecionar para o dashboard apropriado
    if (viewAsType && currentEixo) {
      console.log('🔄 Admin mudou tipo visual:', viewAsType, 'no eixo:', currentEixo)
      
      let targetRoute = ''
      
      if (viewAsType === 'paciente') {
        // Paciente só existe no eixo clínica
        targetRoute = '/app/clinica/paciente/dashboard'
      } else if (viewAsType === 'profissional') {
        // Profissional pode estar em qualquer eixo
        targetRoute = `/app/${currentEixo}/profissional/dashboard`
      } else if (viewAsType === 'aluno') {
        // Aluno pode estar em ensino ou pesquisa
        const alunoEixo = currentEixo === 'pesquisa' ? 'pesquisa' : 'ensino'
        targetRoute = `/app/${alunoEixo}/aluno/dashboard`
      }
      
      // Só navegar se a rota atual for diferente da rota alvo
      if (targetRoute && location.pathname !== targetRoute) {
        console.log('🎯 Redirecionando para:', targetRoute)
        navigate(targetRoute, { replace: false })
      }
    } else if (!viewAsType && currentEixo && location.pathname.includes('/ricardo-valenca-dashboard')) {
      // Se não há viewAsType e estamos no dashboard admin, garantir que está na rota correta
      console.log('✅ Sem viewAsType, mantendo dashboard admin')
    }
  }, [viewAsType, currentEixo, user, navigate, location.pathname])

  // Redirecionar pacientes reais para seu dashboard correto (mas não se admin está visualizando como outro tipo)
  useEffect(() => {
    // Não redirecionar se admin está visualizando como outro tipo
    if (isAdminViewingAs || !user || normalizeUserType(user.type) === 'admin') {
      return
    }
    
    const userType = normalizeUserType(user.type)
    if (userType === 'paciente') {
      console.log('🔄 Paciente detectado no dashboard profissional, redirecionando...')
      navigate('/app/clinica/paciente/dashboard', { replace: true })
    }
  }, [user?.type, navigate, isAdminViewingAs])
  const [patientSearch, setPatientSearch] = useState('')
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
  const [isAudioCallOpen, setIsAudioCallOpen] = useState(false)
  const [callType, setCallType] = useState<'video' | 'audio'>('video')
  const [activeSection, setActiveSection] = useState<'dashboard' | 'agendamentos' | 'pacientes' | 'aulas' | 'financeiro' | 'atendimento' | 'avaliacao' | 'biblioteca' | 'perfil' | 'chat-pacientes' | 'chat-profissionais' | 'kpis-admin' | 'newsletter' | 'prescricoes' | 'relatorios-clinicos' | 'admin-usuarios' | 'admin-upload' | 'admin-renal'>('dashboard')
  const [showProfessionalModal, setShowProfessionalModal] = useState(false)
  
  // KPIs Administrativos Personalizados
  const [kpis, setKpis] = useState({
    administrativos: {
      totalPacientes: 0,
      avaliacoesCompletas: 0,
      protocolosAEC: 0,
      protocolosIMRE: 0,
      respondedoresTEZ: 0,
      consultoriosAtivos: 0
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

      // Buscar pacientes únicos
      const patientIds = [...new Set((assessments || []).map((a: any) => a.patient_id))]
      const totalPacientesReal = patientIds.length
      const avaliacoesCompletasReal = assessments?.filter(a => a.status === 'completed').length || 0
      const protocolosAECReal = assessments?.filter(a => a.assessment_type === 'AEC').length || 0
      const protocolosIMREReal = assessments?.filter(a => a.assessment_type === 'IMRE').length || 0
      const respondedoresTEZReal = assessments?.filter(a => a.data?.improvement === true).length || 0

      // Se houver poucos dados reais (menos de 3 pacientes), usar dados mockados para demonstração
      // Isso permite testar a interface mesmo com poucos dados no banco
      const useMockData = totalPacientesReal < 3

      const totalPacientes = useMockData ? 24 : totalPacientesReal
      const avaliacoesCompletas = useMockData ? 18 : avaliacoesCompletasReal
      const protocolosAEC = useMockData ? 15 : protocolosAECReal
      const protocolosIMRE = useMockData ? 15 : protocolosIMREReal
      // TEZ = Tratamento de Epilepsia com Cannabis/Zonas (protocolo específico para epilepsia refratária)
      // Respondedores TEZ são pacientes que tiveram melhora significativa (>50% redução de crises)
      const respondedoresTEZ = useMockData ? 12 : respondedoresTEZReal
      const consultoriosAtivos = 3 // Dr. Eduardo + Dr. Ricardo + outros

      // KPIs Semânticos - buscar da tabela clinical_kpis ou calcular baseado em dados reais
      const { data: semanticKPIs } = await supabase
        .from('clinical_kpis')
        .select('*')
        .in('category', ['comportamental', 'cognitivo', 'social'])

      // Buscar KPIs específicos ou calcular baseado em dados reais
      let qualidadeEscuta = 0
      let engajamentoPaciente = 0
      let satisfacaoClinica = 0
      let aderenciaTratamento = 0

      if (semanticKPIs && semanticKPIs.length > 0) {
        // Buscar KPIs específicos por nome
        const qualidadeKPI = semanticKPIs.find(k => k.name?.toLowerCase().includes('qualidade') || k.name?.toLowerCase().includes('escuta'))
        const engajamentoKPI = semanticKPIs.find(k => k.name?.toLowerCase().includes('engajamento'))
        const satisfacaoKPI = semanticKPIs.find(k => k.name?.toLowerCase().includes('satisfação') || k.name?.toLowerCase().includes('satisfacao'))
        const aderenciaKPI = semanticKPIs.find(k => k.name?.toLowerCase().includes('aderência') || k.name?.toLowerCase().includes('aderencia'))

        qualidadeEscuta = qualidadeKPI?.current_value || 0
        engajamentoPaciente = engajamentoKPI?.current_value || 0
        satisfacaoClinica = satisfacaoKPI?.current_value || 0
        aderenciaTratamento = aderenciaKPI?.current_value || 0
      }

      // Se não houver KPIs específicos, usar dados mockados para demonstração quando houver poucos dados reais
      if (qualidadeEscuta === 0 && engajamentoPaciente === 0 && satisfacaoClinica === 0 && aderenciaTratamento === 0) {
        if (useMockData) {
          // Dados mockados para demonstração/teste
          qualidadeEscuta = 87
          engajamentoPaciente = 76
          satisfacaoClinica = 91
          aderenciaTratamento = 80
        } else {
          // Sem dados reais e sem necessidade de mock - deixar zerado
          qualidadeEscuta = 0
          engajamentoPaciente = 0
          satisfacaoClinica = 0
          aderenciaTratamento = 0
        }
      }

      // KPIs Clínicos - dados reais de wearables e eventos de epilepsia
      const { data: wearableDevices } = await supabase
        .from('wearable_devices')
        .select('id, patient_id, connection_status')
        .eq('connection_status', 'connected')

      const { data: epilepsyEvents } = await supabase
        .from('epilepsy_events')
        .select('id, patient_id, severity')
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 30 dias

      const wearablesAtivosReal = wearableDevices?.length || 0
      const monitoramento24hReal = wearablesAtivosReal // Dispositivos conectados = monitoramento 24h
      const episodiosEpilepsiaReal = epilepsyEvents?.length || 0
      
      // Calcular melhora de sintomas baseado em eventos de severidade menor
      const eventosLeves = epilepsyEvents?.filter(e => e.severity === 'leve').length || 0
      const eventosSeveros = epilepsyEvents?.filter(e => e.severity === 'severa').length || 0
      const melhoraSintomasReal = episodiosEpilepsiaReal > 0
        ? Math.round((eventosLeves / episodiosEpilepsiaReal) * 100)
        : 0

      // Dados mockados para demonstração quando houver poucos dados reais
      const wearablesAtivos = useMockData ? 12 : wearablesAtivosReal
      const monitoramento24h = useMockData ? 12 : monitoramento24hReal
      const episodiosEpilepsia = useMockData ? 8 : episodiosEpilepsiaReal
      const melhoraSintomas = useMockData ? 75 : melhoraSintomasReal

      setKpis({
        administrativos: {
          totalPacientes,
          avaliacoesCompletas,
          protocolosAEC,
          protocolosIMRE,
          respondedoresTEZ,
          consultoriosAtivos
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

      console.log('📊 KPIs das 3 Camadas carregados:', {
        administrativos: { totalPacientes, avaliacoesCompletas, protocolosAEC, protocolosIMRE, respondedoresTEZ, consultoriosAtivos },
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
      
      // Se for admin, usar função com permissões administrativas
      if (user && isAdmin(user)) {
        console.log('✅ Admin carregando pacientes com permissões administrativas')
        const allPatients = await getAllPatients(user.id, user.type || 'admin')
        setPatients(allPatients)
        setLoading(false)
        return
      }
      
      // Buscar avaliações clínicas para obter lista de pacientes (usuários normais)
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
      <div className="space-y-4 md:space-y-6 lg:space-y-8 mb-4 md:mb-6 lg:mb-8">
        {/* 🔧 FUNCIONALIDADES ADMINISTRATIVAS - PRIMEIRO PARA ADMIN */}
        {normalizeUserType(user?.type) === 'admin' && (
          <div className="w-full overflow-x-hidden">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center break-words">
              <Settings className="w-5 h-5 md:w-6 md:h-6 mr-2 text-orange-400 flex-shrink-0" />
              <span>🔧 Funcionalidades Administrativas</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6 w-full overflow-x-hidden">
              <button 
                onClick={() => setActiveSection('admin-usuarios')}
                className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">👥 Usuários</h3>
                  <Users className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Gestão de usuários do sistema</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/courses')}
                className="bg-gradient-to-r from-green-500 to-teal-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">🎓 Cursos</h3>
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Gestão de cursos e materiais</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/professional-financial')}
                className="bg-gradient-to-r from-emerald-500 to-green-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">💰 Financeiro</h3>
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Controle financeiro e pagamentos</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/chat')}
                className="bg-gradient-to-r from-cyan-500 to-blue-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">💬 Chat Global + Moderação</h3>
                  <MessageCircle className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Moderação de chats e conversas</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/forum')}
                className="bg-gradient-to-r from-orange-500 to-red-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">🏛️ Moderação Fórum</h3>
                  <MessageCircle className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Gestão e moderação do fórum</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/gamificacao')}
                className="bg-gradient-to-r from-yellow-500 to-orange-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">🏆 Ranking & Gamificação</h3>
                  <Activity className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Sistema de pontos e rankings</p>
              </button>
              
              <button 
                onClick={() => setActiveSection('admin-upload')}
                className="bg-gradient-to-r from-indigo-500 to-purple-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">📁 Upload</h3>
                  <Upload className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Upload de documentos e arquivos</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/knowledge-analytics')}
                className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">📊 Analytics</h3>
                  <BarChart3 className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Análise de dados e relatórios</p>
              </button>
              
              <button 
                onClick={() => setActiveSection('admin-renal')}
                className="bg-gradient-to-r from-red-500 to-pink-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">🫀 Função Renal</h3>
                  <Activity className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Monitoramento de função renal</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/admin-settings')}
                className="bg-gradient-to-r from-slate-500 to-gray-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">⚙️ Sistema</h3>
                  <Settings className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Configurações do sistema</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/library')}
                className="bg-gradient-to-r from-teal-500 to-cyan-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left overflow-hidden cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">📚 Biblioteca</h3>
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">Biblioteca médica e documentos</p>
              </button>
              
              <button 
                onClick={() => navigate('/app/ai-documents')}
                className="bg-gradient-to-r from-violet-500 to-purple-400 rounded-xl p-4 md:p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left cursor-pointer overflow-hidden"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <h3 className="text-xs md:text-sm font-medium opacity-90 break-words flex-1 min-w-0">🤖 Chat IA Documentos</h3>
                  <Brain className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                </div>
                <p className="text-xs opacity-75 mt-1 break-words">IA para análise de documentos</p>
              </button>
            </div>

            {/* 🌍 CIDADE AMIGA DOS RINS - DR. RICARDO VALENÇA */}
            <div className="bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 rounded-xl p-6 border-2 border-blue-500/50 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">🌍 Cidade Amiga dos Rins</h2>
                    <p className="text-sm text-slate-300">Coordenador: Dr. Ricardo Valença - Interconexão com Pós-graduação Cannabis (Função Renal)</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/app/pesquisa/profissional/cidade-amiga-dos-rins')}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
                >
                  Acessar Projeto
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-blue-400 mb-2">🔗 Interconexão</h3>
                  <p className="text-xs text-slate-300">Cidade Amiga dos Rins ↔ Pós-graduação Cannabis Medicinal (Função Renal)</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-cyan-400 mb-2">🎯 Objetivo</h3>
                  <p className="text-xs text-slate-300">Pesquisa pioneira da cannabis medicinal aplicada à nefrologia</p>
                </div>
              </div>
            </div>

            {/* 🎭 ARTE DA ENTREVISTA CLÍNICA - DR. RICARDO VALENÇA */}
            <div className="bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 rounded-xl p-6 border-2 border-green-500/50 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">🎭 Arte da Entrevista Clínica</h2>
                    <p className="text-sm text-slate-300">Coordenador e Professor: Dr. Ricardo Valença - Espinha Dorsal da Plataforma - Interconexão com Pós-graduação Cannabis (Anamnese)</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/app/ensino/profissional/arte-entrevista-clinica')}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
                >
                  Acessar AEC
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-green-400 mb-2">🔗 Interconexão</h3>
                  <p className="text-xs text-slate-300">Arte da Entrevista Clínica ↔ Pós-graduação Cannabis Medicinal (Anamnese)</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="text-sm font-semibold text-emerald-400 mb-2">🎯 Metodologia</h3>
                  <p className="text-xs text-slate-300">Metodologia AEC - Espinha Dorsal que conecta todos os eixos</p>
                </div>
              </div>
            </div>

            {/* 📊 TRÊS CAMADAS DE KPIs - VISUALIZAÇÃO SEPARADA */}
            <div className="space-y-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-blue-400" />
                <span>📊 Três Camadas de KPIs</span>
              </h2>
              
              {/* Camada Administrativa */}
              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border-2 border-green-500/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-green-400" />
                  <span>📊 Camada Administrativa</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Total de Pacientes</h4>
                    <p className="text-2xl font-bold text-white">{kpis.administrativos.totalPacientes}</p>
                    <p className="text-xs text-slate-400 mt-1">Pacientes no sistema</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Avaliações Completas</h4>
                    <p className="text-2xl font-bold text-white">{kpis.administrativos.avaliacoesCompletas}</p>
                    <p className="text-xs text-slate-400 mt-1">Protocolos finalizados</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Protocolos AEC</h4>
                    <p className="text-2xl font-bold text-white">{kpis.administrativos.protocolosAEC}</p>
                    <p className="text-xs text-slate-400 mt-1">Metodologia aplicada</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Consultórios Ativos</h4>
                    <p className="text-2xl font-bold text-white">{kpis.administrativos.consultoriosAtivos}</p>
                    <p className="text-xs text-slate-400 mt-1">Rede integrada</p>
                  </div>
                </div>
              </div>

              {/* Camada Semântica */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border-2 border-purple-500/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-400" />
                  <span>🧠 Camada Semântica</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Qualidade da Escuta</h4>
                    <p className="text-2xl font-bold text-white">{kpis.semanticos.qualidadeEscuta}%</p>
                    <p className="text-xs text-slate-400 mt-1">Análise semântica</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Engajamento</h4>
                    <p className="text-2xl font-bold text-white">{kpis.semanticos.engajamentoPaciente}%</p>
                    <p className="text-xs text-slate-400 mt-1">Participação ativa</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Satisfação Clínica</h4>
                    <p className="text-2xl font-bold text-white">{kpis.semanticos.satisfacaoClinica}%</p>
                    <p className="text-xs text-slate-400 mt-1">Avaliação da experiência</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Aderência ao Tratamento</h4>
                    <p className="text-2xl font-bold text-white">{kpis.semanticos.aderenciaTratamento}%</p>
                    <p className="text-xs text-slate-400 mt-1">Compliance</p>
                  </div>
                </div>
              </div>

              {/* Camada Clínica */}
              <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border-2 border-blue-500/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-400" />
                  <span>🏥 Camada Clínica</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Wearables Ativos</h4>
                    <p className="text-2xl font-bold text-white">{kpis.clinicos.wearablesAtivos}</p>
                    <p className="text-xs text-slate-400 mt-1">Monitoramento 24h</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Monitoramento 24h</h4>
                    <p className="text-2xl font-bold text-white">{kpis.clinicos.monitoramento24h}</p>
                    <p className="text-xs text-slate-400 mt-1">Pacientes monitorados</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Episódios Epilepsia</h4>
                    <p className="text-2xl font-bold text-white">{kpis.clinicos.episodiosEpilepsia}</p>
                    <p className="text-xs text-slate-400 mt-1">Registrados hoje</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Melhora de Sintomas</h4>
                    <p className="text-2xl font-bold text-white">{kpis.clinicos.melhoraSintomas}</p>
                    <p className="text-xs text-slate-400 mt-1">Pacientes melhorando</p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6 lg:mb-8">
              <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 border border-slate-700">
                <p className="text-xs md:text-sm text-slate-400 mb-1">Sistema Online</p>
                <p className="text-xl md:text-2xl font-bold text-green-400">99.9%</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 border border-slate-700">
                <p className="text-xs md:text-sm text-slate-400 mb-1">Usuários Ativos</p>
                <p className="text-xl md:text-2xl font-bold text-blue-400">1,234</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 border border-slate-700">
                <p className="text-xs md:text-sm text-slate-400 mb-1">Avaliações Hoje</p>
                <p className="text-xl md:text-2xl font-bold text-purple-400">156</p>
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
                  onClick={() => {
                    // Se admin, definir tipo visual como paciente
                    if (normalizeUserType(user?.type) === 'admin') {
                      setViewAsType('paciente')
                    }
                    // Navegar para dashboard de paciente no eixo clínica
                    navigate('/app/clinica/paciente/dashboard')
                  }}
                  className={`bg-gradient-to-r from-pink-500 to-rose-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left ${
                    effectiveType === 'paciente' ? 'ring-4 ring-yellow-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">👤 Dashboard do Paciente</h3>
                    <User className="w-6 h-6" />
                  </div>
                  <p className="text-xs opacity-75 mt-1">
                    {effectiveType === 'paciente' && isAdminViewingAs && '👁️ Visualizando como '}
                    Acessar dashboard do paciente
                  </p>
                </button>

                {/* Card Profissional */}
                <button
                  onClick={() => {
                    const userTypeNormalized = normalizeUserType(user?.type)
                    if (userTypeNormalized === 'admin') {
                      // Se admin, mostrar modal para escolher consultório ou profissional genérico
                      setShowProfessionalModal(true)
                    } else {
                      // Se não admin, navegar diretamente para o dashboard profissional do eixo atual
                      const eixo = currentEixo || 'clinica'
                      navigate(`/app/${eixo}/profissional/dashboard`)
                    }
                  }}
                  className={`bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left ${
                    effectiveType === 'profissional' ? 'ring-4 ring-yellow-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">👨‍⚕️ Dashboard do Profissional</h3>
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <p className="text-xs opacity-75 mt-1">
                    {effectiveType === 'profissional' && isAdminViewingAs && '👁️ Visualizando como '}
                    {normalizeUserType(user?.type) === 'admin' 
                      ? 'Acessar dashboards de profissionais e consultórios'
                      : `Acessar dashboard profissional (${currentEixo || 'clínica'})`
                    }
                  </p>
                </button>

                {/* Card Aluno */}
                <button
                  onClick={() => {
                    // Se admin, definir tipo visual como aluno
                    if (normalizeUserType(user?.type) === 'admin') {
                      setViewAsType('aluno')
                    }
                    // Navegar para dashboard de aluno no eixo ensino ou pesquisa
                    const eixo = currentEixo === 'pesquisa' ? 'pesquisa' : 'ensino'
                    navigate(`/app/${eixo}/aluno/dashboard`)
                  }}
                  className={`bg-gradient-to-r from-amber-500 to-orange-400 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left ${
                    effectiveType === 'aluno' ? 'ring-4 ring-yellow-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium opacity-90">🎓 Dashboard do Aluno</h3>
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <p className="text-xs opacity-75 mt-1">
                    {effectiveType === 'aluno' && isAdminViewingAs && '👁️ Visualizando como '}
                    Acessar dashboard do aluno (ensino/pesquisa)
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo do Dashboard - Apenas para Admin quando necessário */}
      {normalizeUserType(user?.type) === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
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
      )}
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
            <h4 className="text-sm font-medium text-slate-300 mb-2">Qualidade da Escuta</h4>
            <p className="text-2xl font-bold text-white">{kpis.semanticos.qualidadeEscuta}%</p>
            <p className="text-xs text-slate-400">Análise semântica</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Engajamento</h4>
            <p className="text-2xl font-bold text-white">{kpis.semanticos.engajamentoPaciente}%</p>
            <p className="text-xs text-slate-400">Participação ativa</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Satisfação Clínica</h4>
            <p className="text-2xl font-bold text-white">{kpis.semanticos.satisfacaoClinica}%</p>
            <p className="text-xs text-slate-400">Avaliação da experiência</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Aderência ao Tratamento</h4>
            <p className="text-2xl font-bold text-white">{kpis.semanticos.aderenciaTratamento}%</p>
            <p className="text-xs text-slate-400">Compliance</p>
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
            <p className="text-xs text-slate-400">Monitoramento 24h</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Monitoramento 24h</h4>
            <p className="text-2xl font-bold text-white">{kpis.clinicos.monitoramento24h}</p>
            <p className="text-xs text-slate-400">Pacientes monitorados</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Episódios Epilepsia</h4>
            <p className="text-2xl font-bold text-white">{kpis.clinicos.episodiosEpilepsia}</p>
            <p className="text-xs text-slate-400">Registrados hoje</p>
          </div>
          <div className="bg-slate-600 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Melhora de Sintomas</h4>
            <p className="text-2xl font-bold text-white">{kpis.clinicos.melhoraSintomas}</p>
            <p className="text-xs text-slate-400">Pacientes melhorando</p>
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

  // Funções de renderização para seções administrativas
  const renderAdminUsuarios = (): React.ReactNode => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-800 to-cyan-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
            <Users className="w-6 h-6" />
            <span>👥 Gestão de Usuários</span>
          </h2>
          <p className="text-slate-200">Gerencie todos os usuários do sistema, suas permissões e configurações</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-300 text-center py-8">
            Área de desenvolvimento: Gestão completa de usuários será implementada aqui.
            <br />
            <span className="text-sm text-slate-400">Funcionalidades: Listagem, criação, edição, exclusão, permissões, tipos de usuário, etc.</span>
          </p>
        </div>
      </div>
    )
  }

  const renderAdminUpload = (): React.ReactNode => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-800 to-purple-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
            <Upload className="w-6 h-6" />
            <span>📁 Upload de Documentos</span>
          </h2>
          <p className="text-slate-200">Faça upload e gerencie documentos e arquivos do sistema</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-300 text-center py-8">
            Área de desenvolvimento: Sistema de upload de documentos será implementado aqui.
            <br />
            <span className="text-sm text-slate-400">Funcionalidades: Upload, organização, categorização, busca, compartilhamento, etc.</span>
          </p>
        </div>
      </div>
    )
  }

  const renderAdminRenal = (): React.ReactNode => {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-800 to-pink-700 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
            <Activity className="w-6 h-6" />
            <span>🫀 Monitoramento de Função Renal</span>
          </h2>
          <p className="text-slate-200">Monitore e analise dados de função renal dos pacientes</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <p className="text-slate-300 text-center py-8">
            Área de desenvolvimento: Sistema de monitoramento de função renal será implementado aqui.
            <br />
            <span className="text-sm text-slate-400">Funcionalidades: Gráficos, relatórios, alertas, histórico, comparações, etc.</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden w-full">
      <div className="max-w-7xl mx-auto px-2 md:px-4 lg:px-6 py-4 md:py-6 lg:py-8 w-full overflow-x-hidden">
        {/* Renderizar seção ativa */}
        {activeSection === 'dashboard' && renderDashboard()}
        {activeSection === 'kpis-admin' && renderKPIsAdmin()}
        {activeSection === 'admin-usuarios' && renderAdminUsuarios()}
        {activeSection === 'admin-upload' && renderAdminUpload()}
        {activeSection === 'admin-renal' && renderAdminRenal()}
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

        {/* Modal de Seleção de Dashboard Profissional */}
        {showProfessionalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Stethoscope className="w-6 h-6 mr-2 text-blue-400" />
                    <span>👨‍⚕️ Dashboards de Profissionais e Consultórios</span>
                  </h2>
                  <button
                    onClick={() => setShowProfessionalModal(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>
                <p className="text-slate-400 mt-2">Selecione um dashboard profissional ou consultório para acessar</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Consultório Dr. Ricardo Valença */}
                  <button
                    onClick={() => {
                      // Não definir viewAsType para consultórios específicos
                      setViewAsType(null)
                      navigate('/app/ricardo-valenca-dashboard')
                      setShowProfessionalModal(false)
                    }}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold">🏥 Consultório Dr. Ricardo Valença</h3>
                      <Stethoscope className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-sm opacity-90 mb-2">Dashboard administrativo completo</p>
                    <p className="text-xs opacity-75">Gestão de pacientes, agendamentos, relatórios e ferramentas administrativas</p>
                  </button>

                  {/* Consultório Dr. Eduardo Faveret */}
                  <button
                    onClick={() => {
                      // Não definir viewAsType para consultórios específicos
                      setViewAsType(null)
                      navigate('/app/clinica/profissional/dashboard-eduardo')
                      setShowProfessionalModal(false)
                    }}
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold">🏥 Consultório Dr. Eduardo Faveret</h3>
                      <Stethoscope className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-sm opacity-90 mb-2">Dashboard profissional clínico</p>
                    <p className="text-xs opacity-75">Gestão de pacientes, agendamentos e relatórios clínicos</p>
                  </button>

                  {/* Dashboard Profissional Genérico */}
                  <button
                    onClick={() => {
                      // Definir tipo visual como profissional para usar em todos os eixos
                      setViewAsType('profissional')
                      const eixo = currentEixo || 'clinica'
                      navigate(`/app/${eixo}/profissional/dashboard`)
                      setShowProfessionalModal(false)
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl p-6 text-white hover:shadow-lg hover:scale-105 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold">👨‍⚕️ Dashboard Profissional Genérico</h3>
                      <User className="w-8 h-8 opacity-80" />
                    </div>
                    <p className="text-sm opacity-90 mb-2">Dashboard padrão para profissionais</p>
                    <p className="text-xs opacity-75">
                      Acesso às funcionalidades padrão do eixo {currentEixo || 'clínica'}
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
