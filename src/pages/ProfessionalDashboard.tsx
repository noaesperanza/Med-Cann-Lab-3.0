import React, { useState, useEffect } from 'react'
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
  Settings
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import QuickPrescriptions from '../components/QuickPrescriptions'
import MedicalRecord from '../components/MedicalRecord'
import IntegrativePrescriptions from '../components/IntegrativePrescriptions'
import ClinicalReports from '../components/ClinicalReports'

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

const ProfessionalDashboard: React.FC = () => {
  const { user } = useAuth()
  const { getEffectiveUserType, isAdminViewingAs } = useUserView()
  const [patientSearch, setPatientSearch] = useState('')
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'dashboard' | 'kpis' | 'newsletter' | 'prescriptions' | 'clinical-reports'>('dashboard')

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
        const allPatients = await getAllPatients(user!.id, effectiveType)
        setPatients(allPatients)
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
      
      assessments?.forEach(assessment => {
        const patientId = assessment.patient_id
        if (!patientsMap.has(patientId)) {
          patientsMap.set(patientId, {
            id: patientId,
            name: assessment.patient_name || `Paciente ${patientId.slice(0, 8)}`,
            age: assessment.patient_age || 0,
            cpf: assessment.patient_cpf || '',
            phone: assessment.patient_phone || '',
            lastVisit: new Date(assessment.created_at).toLocaleDateString('pt-BR'),
            status: assessment.status || 'Aguardando',
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
    if (patient) {
      setClinicalNotes(patient.assessments?.[0]?.clinical_notes || '')
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedPatient || !clinicalNotes.trim()) return

    try {
      const assessmentData = {
        patient_id: selectedPatient,
        doctor_id: user?.id,
        clinical_notes: clinicalNotes,
        status: 'completed',
        assessment_type: 'follow_up'
      }

      const { error } = await supabase
        .from('clinical_assessments')
        .insert(assessmentData)

      if (error) {
        console.error('❌ Erro ao salvar notas:', error)
        return
      }

      console.log('✅ Notas clínicas salvas com sucesso')
      loadPatients() // Recarregar dados
    } catch (error) {
      console.error('❌ Erro ao salvar notas:', error)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.cpf.includes(patientSearch)
  )

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPIs Principais */}
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
              <p className="text-sm font-medium text-orange-700">Relatórios da Avaliação Clínica Inicial</p>
              <p className="text-3xl font-bold text-orange-900">3</p>
              <p className="text-xs text-orange-600 mt-1">Compartilhados pelos pacientes</p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Busca de Pacientes */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Search className="w-5 h-5 mr-2 text-slate-600" />
          Buscar Paciente
        </h3>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Digite nome ou CPF do paciente..."
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
          />
        </div>
        
        {loading ? (
          <div className="text-center text-slate-500 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            Carregando pacientes...
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => handlePatientSelect(patient.id)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedPatient === patient.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      patient.priority === 'high' ? 'bg-red-500' :
                      patient.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-slate-900">{patient.name}</p>
                      <p className="text-sm text-slate-500">CPF: {patient.cpf} • {patient.condition}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Última consulta: {patient.lastVisit}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      patient.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {patient.status}
                    </span>
                  </div>
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

      {/* Notas Clínicas */}
      {selectedPatient && (
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 shadow-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-slate-600" />
            Notas Clínicas
          </h3>
          <textarea
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            placeholder="Digite suas observações clínicas..."
            className="w-full h-32 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white shadow-sm"
          />
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => setSelectedPatient(null)}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors bg-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveNotes}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Salvar Notas
            </button>
          </div>
        </div>
      )}
    </div>
  )

  const renderKPIs = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-slate-600" />
          KPIs Clínicos - Neurologia Pediátrica
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Epilepsia Controlada</span>
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">78%</p>
            <p className="text-xs text-green-600">+5% vs mês anterior</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">TEA Respondedores</span>
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">65%</p>
            <p className="text-xs text-green-600">+3% vs mês anterior</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Satisfação Familiar</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">92%</p>
            <p className="text-xs text-green-600">+2% vs mês anterior</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNewsletter = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-slate-600" />
          Newsletter Científica
        </h3>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-2">Cannabis Medicinal em Epilepsia Refratária</h4>
            <p className="text-sm text-slate-600 mb-2">Novos estudos sobre eficácia do CBD em crianças com síndrome de Dravet...</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Nature Medicine • Janeiro 2024</span>
              <button className="text-blue-600 text-sm hover:text-blue-800">Ler mais</button>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-2">Protocolos IMRE em TEA</h4>
            <p className="text-sm text-slate-600 mb-2">Implementação da metodologia IMRE para avaliação de pacientes com TEA...</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Journal of Autism • Dezembro 2023</span>
              <button className="text-blue-600 text-sm hover:text-blue-800">Ler mais</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPrescriptions = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-slate-600" />
          Sistema de Prescrições Integrativas - CFM
        </h3>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Área de Atendimento</h1>
          <p className="text-slate-600">Prontuário Eletrônico - Atendimento ao Paciente</p>
          <div className="mt-2 text-sm text-slate-500">
            Conectado como <span className="font-semibold">{user?.user_metadata?.name || 'Usuário'}</span>
          </div>
        </div>

        {/* Navegação */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-lg border border-slate-200">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveSection('kpis')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'kpis'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              KPIs Tempo Real
            </button>
            <button
              onClick={() => setActiveSection('newsletter')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'newsletter'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Newsletter Científico
            </button>
            <button
              onClick={() => setActiveSection('prescriptions')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'prescriptions'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Prescrições
            </button>
            <button
              onClick={() => setActiveSection('clinical-reports')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === 'clinical-reports'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Relatórios Clínicos
            </button>
          </nav>
        </div>

        {/* Conteúdo */}
        {activeSection === 'dashboard' && renderDashboard()}
        {activeSection === 'kpis' && renderKPIs()}
        {activeSection === 'newsletter' && renderNewsletter()}
        {activeSection === 'prescriptions' && renderPrescriptions()}
        {activeSection === 'clinical-reports' && <ClinicalReports />}
      </div>
    </div>
  )
}

export default ProfessionalDashboard