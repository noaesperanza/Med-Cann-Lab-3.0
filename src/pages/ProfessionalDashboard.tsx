import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
  Users,
  Stethoscope,
  Activity,
  Heart,
  Brain,
  TrendingUp,
  UserPlus,
  Bell,
  Settings,
  Pill,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'
import { supabase } from '../lib/supabase'
import { useDashboardTriggers } from '../contexts/DashboardTriggersContext'
import QuickPrescriptions from '../components/QuickPrescriptions'
import MedicalRecord from '../components/MedicalRecord'
import IntegrativePrescriptions from '../components/IntegrativePrescriptions'
import ClinicalReports from '../components/ClinicalReports'
import ProfessionalScheduling from './ProfessionalScheduling'
import { isAdmin, getAllPatients } from '../lib/adminPermissions'
import { useUserView } from '../hooks/useUserView'
import { IncentivosPanel } from '../components/IncentivosPanel'

interface Patient {
  id: string
  name: string
  age: number
  cpf: string
  phone: string
  lastVisit: string
  email: string
  status: 'active' | 'inactive' | 'pending'
  assessments?: any[]
  condition?: string
  priority?: 'high' | 'medium' | 'low'
}

const ProfessionalDashboard: React.FC = () => {
  const { user } = useAuth()
  const { openChat: openNoaChat, closeChat, isOpen: isNoaOpen, hideGlobalChat, showGlobalChat } = useNoaPlatform()
  const { setDashboardTriggers } = useDashboardTriggers()

  // Gerenciar visibilidade do chat global
  useEffect(() => {
    hideGlobalChat()
    return () => showGlobalChat()
  }, [hideGlobalChat, showGlobalChat])
  const { getEffectiveUserType, isAdminViewingAs } = useUserView()
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)

  const [searchParams, setSearchParams] = useSearchParams()
  const sectionParam = searchParams.get('section') as 'dashboard' | 'prescriptions' | 'clinical-reports' | 'agendamentos' | 'incentivos' | null
  const [activeSection, setActiveSection] = useState<'dashboard' | 'prescriptions' | 'clinical-reports' | 'agendamentos' | 'incentivos'>(sectionParam || 'dashboard')

  // Sync state with URL param
  useEffect(() => {
    if (sectionParam && sectionParam !== activeSection) {
      setActiveSection(sectionParam)
    }
  }, [sectionParam])

  // Sync URL param with state
  const handleSectionChange = (section: 'dashboard' | 'prescriptions' | 'clinical-reports' | 'agendamentos' | 'incentivos') => {
    setActiveSection(section)
    setSearchParams({ section })
  }


  // Header triggers (cards por usabilidade do perfil profissional) + cérebro Nôa
  const proTriggerOptions = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'prescriptions', label: 'Prescrições', icon: Pill },
    { id: 'clinical-reports', label: 'Relatórios', icon: FileText },
    { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
    { id: 'incentivos', label: 'Incentivos', icon: TrendingUp }
  ]
  useEffect(() => {
    setDashboardTriggers({
      options: proTriggerOptions.map(o => ({ id: o.id, label: o.label, icon: o.icon })),
      activeId: activeSection,
      onChange: (id) => handleSectionChange(id as any),
      onBrainClick: () => { if (isNoaOpen) closeChat(); else openNoaChat() }
    })
    return () => setDashboardTriggers(null)
  }, [activeSection, handleSectionChange, openNoaChat, closeChat, isNoaOpen, setDashboardTriggers])


  // Verificar se é admin
  const effectiveType = getEffectiveUserType(user?.type)
  const userIsAdmin = isAdmin(user)

  // Buscar pacientes do banco de dados
  useEffect(() => {
    loadPatients()
  }, [user?.id, effectiveType])

  const loadPatients = async () => {
    try {
      setLoading(true)

      // Se for admin, usar função com permissões administrativas
      if (userIsAdmin) {
        console.log('✅ Admin carregando pacientes com permissões administrativas')
        const allPatients = await getAllPatients(user)

        // Mapear para o tipo Patient local
        const mappedPatients: Patient[] = allPatients.map(p => ({
          ...p,
          status: 'active' as const, // Força status válido
          assessments: p.assessments || []
        }))

        setPatients(mappedPatients)
        setLoading(false)
        return
      }

      // Busca normal para profissionais
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

      assessments?.forEach((assessment: any) => {
        const patientId = assessment.patient_id
        if (!patientsMap.has(patientId)) {
          patientsMap.set(patientId, {
            id: patientId,
            name: assessment.patient_name || `Paciente ${patientId.slice(0, 8)}`,
            age: assessment.patient_age || 0,
            cpf: assessment.patient_cpf || '',
            phone: assessment.patient_phone || '',
            email: '',
            lastVisit: new Date(assessment.created_at).toLocaleDateString('pt-BR'),
            status: 'active' as const,
            condition: assessment.condition || 'Epilepsia',
            priority: assessment.priority || 'medium',
            assessments: []
          })
        }

        const patient = patientsMap.get(patientId)!
        patient.assessments = patient.assessments || []
        patient.assessments.push(assessment)
      })

      setPatients(Array.from(patientsMap.values()))
    } catch (error) {
      console.error('❌ Erro ao carregar pacientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatient(patientId)
    const patient = patients.find(p => p.id === patientId)
    setSelectedPatientData(patient || null)
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.cpf.includes(patientSearch)
  )

  const renderDashboard = () => (
    <div className="space-y-6">
      {!selectedPatient ? (
        <>
          {/* Header Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total de Pacientes</p>
                  <p className="text-3xl font-bold text-blue-900">{patients.length}</p>
                  <p className="text-xs text-blue-600 mt-1">+2 esta semana</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Agendamentos Hoje</p>
                  <p className="text-3xl font-bold text-green-900">8</p>
                  <p className="text-xs text-green-600 mt-1">3 próximos</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div
              onClick={() => setActiveSection('clinical-reports')}
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 shadow-lg border border-orange-200 cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Relatórios Iniciais</p>
                  <p className="text-3xl font-bold text-orange-900">3</p>
                  <p className="text-xs text-orange-600 mt-1">Novos envios</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Pacientes */}
            <div className="lg:col-span-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 shadow-lg border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                <Search className="w-5 h-5 mr-2 text-slate-600" />
                Atendimento Rápido
              </h3>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar paciente para abrir prontuário..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                />
              </div>

              {loading ? (
                <div className="text-center text-slate-500 py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  Carregando...
                </div>
              ) : filteredPatients.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => handlePatientSelect(patient.id)}
                      className="p-4 border border-slate-200 rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-md bg-white transition-all group"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${patient.priority === 'high' ? 'bg-red-500' :
                            patient.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}></div>
                          <div>
                            <p className="font-medium text-slate-900 group-hover:text-blue-700">{patient.name}</p>
                            <p className="text-sm text-slate-500">CPF: {patient.cpf} • {patient.condition}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  {patientSearch ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
                </div>
              )}
            </div>

            {/* KPIs Rápidos & News (Lateral) */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-md border border-slate-200">
                <h3 className="text-md font-semibold text-slate-800 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Eficácia Clínica
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Retenção de Pacientes</span>
                      <span className="font-bold text-slate-900">94%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Adesão ao Tratamento</span>
                      <span className="font-bold text-slate-900">87%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Newsletter Mini */}
              <div className="bg-gradient-to-b from-indigo-50 to-white rounded-xl p-6 shadow-md border border-indigo-100">
                <h3 className="text-md font-semibold text-indigo-900 mb-3 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Destaque Científico
                </h3>
                <div className="space-y-3">
                  <a href="#" className="block group">
                    <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      Eficácia do Canabidiol em Epilepsia Refratária: Estudo Fase 3
                    </p>
                    <span className="text-xs text-slate-500 mt-1 block">Nature Medicine • 2 dias atrás</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Visão Detalhada do Paciente (Prontuário + Prescrição) */
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={() => setSelectedPatient(null)}
              className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {selectedPatientData?.name}
                <span className={`text-xs px-2 py-1 rounded-full border ${selectedPatientData?.status === 'active' ? 'border-green-500 text-green-400' : 'border-slate-500 text-slate-400'
                  }`}>
                  {selectedPatientData?.status === 'active' ? 'Em Acompanhamento' : 'Inativo'}
                </span>
              </h2>
              <p className="text-slate-400 flex items-center gap-2 text-sm">
                <User className="w-3 h-3" /> CPF: {selectedPatientData?.cpf}
                <span className="mx-1">•</span>
                <Phone className="w-3 h-3" /> {selectedPatientData?.phone || 'Sem telefone'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Principal: Prontuário */}
            <div className="lg:col-span-2 space-y-6">
              <MedicalRecord
                patientId={selectedPatient}
                patientData={selectedPatientData || undefined}
              />

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Pill className="w-5 h-5 text-green-600" />
                    Histórico de Prescrições
                  </h3>
                </div>
                <div className="p-0">
                  <IntegrativePrescriptions />
                </div>
              </div>
            </div>

            {/* Coluna Lateral: Ações Rápidas */}
            <div className="space-y-6">
              <QuickPrescriptions className="sticky top-6" />

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Lembretes Clínicos</h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    Revisar função renal em 30 dias.
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                    Renovar receita de controle especial.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen text-white" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a3a 100%)' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Área de Atendimento</h1>
          <p className="text-slate-300">Prontuário Eletrônico • Prescrição • Gestão Clínica</p>
          <div className="mt-2 text-sm text-slate-400">
            Dr(a). <span className="font-semibold text-white">{user?.user_metadata?.name || 'Profissional'}</span>
          </div>
        </div>

        {/* Navegação Topo (Simplificada) */}
        {!selectedPatient && (
          <div className="mb-8">
            <nav className="flex space-x-1 bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/10 w-fit">
              <button
                onClick={() => handleSectionChange('dashboard')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => handleSectionChange('agendamentos')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === 'agendamentos'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                Agendamentos
              </button>
              <button
                onClick={() => handleSectionChange('prescriptions')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === 'prescriptions'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                Todas Prescrições
              </button>
              <button
                onClick={() => handleSectionChange('clinical-reports')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${activeSection === 'clinical-reports'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
              >
                Relatórios
              </button>
            </nav>
          </div>
        )}

        {/* Renderização Condicional */}
        {activeSection === 'dashboard' && renderDashboard()}

        {activeSection === 'agendamentos' && !selectedPatient && (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden text-slate-900 border-none">
            <ProfessionalScheduling />
          </div>
        )}

        {activeSection === 'prescriptions' && !selectedPatient && (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden text-slate-900">
            <div className="p-6 bg-slate-50 border-b border-slate-100 mb-6">
              <h2 className="text-xl font-bold text-slate-800">Central de Prescrições</h2>
              <p className="text-slate-500">Gerencie templates e histórico geral</p>
            </div>
            <div className="p-6 pt-0">
              <IntegrativePrescriptions />
            </div>
          </div>
        )}

        {activeSection === 'clinical-reports' && !selectedPatient && <ClinicalReports />}

        {activeSection === 'incentivos' && !selectedPatient && <IncentivosPanel />}
      </div>

      {/* STANDARD FOOTER NAVIGATION */}


    </div>
  )
}

export default ProfessionalDashboard