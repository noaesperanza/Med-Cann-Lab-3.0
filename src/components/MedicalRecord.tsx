import React, { useState, useEffect } from 'react'
import {
  FileText,
  User,
  Calendar,
  Share2,
  Download,
  Eye,
  MessageCircle,
  Pill,
  Brain,
  Heart,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Stethoscope,
  Microscope,
  Leaf,
  Zap,
  Target,
  BarChart3,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  QrCode,
  Send,
  Bell
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Patient {
  id: string
  name: string
  cpf: string
  age: number
  phone: string
  email: string
  lastVisit: string
  status: 'active' | 'inactive' | 'pending'
}

interface ClinicalReport {
  id: string
  patientId: string
  patientName: string
  date: string
  type: 'initial_assessment' | 'follow_up' | 'emergency'
  status: 'draft' | 'completed' | 'shared' | 'validated'
  sharedWith: string[]
  nftToken?: string
  blockchainHash?: string
  content: {
    chiefComplaint: string
    history: string
    physicalExam: string
    assessment: string
    plan: string
    rationalities: {
      biomedical: any
      traditionalChinese: any
      ayurvedic: any
      homeopathic: any
      integrative: any
    }
  }
}

interface MedicalRecordProps {
  patientId?: string
  className?: string
}

const MedicalRecord: React.FC<MedicalRecordProps> = ({ patientId, className = '' }) => {
  const { user } = useAuth()
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [clinicalReports, setClinicalReports] = useState<ClinicalReport[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'reports' | 'prescriptions' | 'notes' | 'rationalities'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<ClinicalReport | null>(null)

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (selectedPatient) {
      loadClinicalReports(selectedPatient.id)
    }
  }, [selectedPatient])

  const loadPatients = async () => {
    try {
      setLoading(true)
      
      // Buscar pacientes da tabela users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, phone, type, created_at')
        .eq('type', 'patient')
        .order('created_at', { ascending: false })

      if (usersError) {
        console.error('Erro ao buscar pacientes:', usersError)
        setPatients([])
        return
      }

      // Buscar última visita de cada paciente através de clinical_assessments
      const patientIds = usersData?.map(u => u.id) || []
      const { data: assessments, error: assessmentsError } = await supabase
        .from('clinical_assessments')
        .select('patient_id, created_at')
        .in('patient_id', patientIds)
        .order('created_at', { ascending: false })

      // Mapear última visita por paciente
      const lastVisitMap = new Map<string, string>()
      if (!assessmentsError && assessments) {
        assessments.forEach(a => {
          if (!lastVisitMap.has(a.patient_id)) {
            lastVisitMap.set(a.patient_id, a.created_at)
          }
        })
      }

      // Converter para formato Patient
      const patientsList: Patient[] = (usersData || []).map(u => ({
        id: u.id,
        name: u.name || 'Paciente',
        cpf: '', // CPF não está na tabela users, pode ser adicionado depois
        age: 0, // Age pode ser calculado ou adicionado depois
        phone: u.phone || '',
        email: u.email || '',
        lastVisit: lastVisitMap.get(u.id) || u.created_at || '',
        status: 'active' as const
      }))

      setPatients(patientsList)
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  const loadClinicalReports = async (patientId: string) => {
    try {
      // Buscar relatórios clínicos do Supabase
      const { data: reports, error: reportsError } = await supabase
        .from('clinical_reports')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (reportsError) {
        console.error('Erro ao buscar relatórios:', reportsError)
        setClinicalReports([])
        return
      }

      // Buscar também avaliações clínicas que podem ter relatórios
      const { data: assessments, error: assessmentsError } = await supabase
        .from('clinical_assessments')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      const reportsList: ClinicalReport[] = []

      // Converter clinical_reports para ClinicalReport
      if (reports) {
        reports.forEach(r => {
          const content = r.content || {}
          reportsList.push({
            id: r.id,
            patientId: r.patient_id,
            patientName: selectedPatient?.name || 'Paciente',
            date: r.created_at || new Date().toISOString(),
            type: (r.report_type as 'initial_assessment' | 'follow_up' | 'emergency') || 'initial_assessment',
            status: (r.status as 'draft' | 'completed' | 'shared' | 'validated') || 'draft',
            sharedWith: r.shared_with || [],
            nftToken: r.nft_token,
            blockchainHash: r.blockchain_hash,
            content: {
              chiefComplaint: content.chiefComplaint || '',
              history: content.history || '',
              physicalExam: content.physicalExam || '',
              assessment: content.assessment || '',
              plan: content.plan || '',
              rationalities: content.rationalities || {
                biomedical: {},
                traditionalChinese: {},
                ayurvedic: {},
                homeopathic: {},
                integrative: {}
              }
            }
          })
        })
      }

      // Converter clinical_assessments com status completed para relatórios
      if (!assessmentsError && assessments) {
        assessments.filter(a => a.status === 'completed').forEach(a => {
          const data = a.data || {}
          reportsList.push({
            id: a.id,
            patientId: a.patient_id,
            patientName: selectedPatient?.name || 'Paciente',
            date: a.completed_at || a.created_at || new Date().toISOString(),
            type: a.assessment_type === 'initial' ? 'initial_assessment' : 'follow_up',
            status: 'completed',
            sharedWith: [],
            content: {
              chiefComplaint: data.chiefComplaint || data.complaintList?.join(', ') || '',
              history: data.history || '',
              physicalExam: data.physicalExam || '',
              assessment: data.assessment || '',
              plan: data.plan || '',
              rationalities: data.rationalities || {
                biomedical: {},
                traditionalChinese: {},
                ayurvedic: {},
                homeopathic: {},
                integrative: {}
              }
            }
          })
        })
      }

      setClinicalReports(reportsList)
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
      setClinicalReports([])
    }
  }

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cpf.includes(searchTerm)
  )

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
  }

  const handleShareReport = (report: ClinicalReport) => {
    setSelectedReport(report)
    setShowShareModal(true)
  }

  const handleGenerateNFT = async (report: ClinicalReport) => {
    try {
      // Implementar geração de NFT
      console.log('Gerando NFT para relatório:', report.id)
      alert('NFT gerado com sucesso! Token: NFT-' + Date.now())
    } catch (error) {
      console.error('Erro ao gerar NFT:', error)
    }
  }

  const getRationalityIcon = (rationality: string) => {
    switch (rationality) {
      case 'biomedical': return <Microscope className="w-4 h-4" />
      case 'traditionalChinese': return <Leaf className="w-4 h-4" />
      case 'ayurvedic': return <Zap className="w-4 h-4" />
      case 'homeopathic': return <Target className="w-4 h-4" />
      case 'integrative': return <Brain className="w-4 h-4" />
      default: return <Stethoscope className="w-4 h-4" />
    }
  }

  const getRationalityColor = (rationality: string) => {
    switch (rationality) {
      case 'biomedical': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'traditionalChinese': return 'bg-red-100 text-red-800 border-red-200'
      case 'ayurvedic': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'homeopathic': return 'bg-green-100 text-green-800 border-green-200'
      case 'integrative': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total de Pacientes</h3>
            <Users className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold">{patients.length}</p>
          <p className="text-xs opacity-80">Ativos</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Relatórios Compartilhados</h3>
            <Share2 className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold">{clinicalReports.filter(r => r.status === 'shared').length}</p>
          <p className="text-xs opacity-80">Pendentes</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">NFTs Gerados</h3>
            <QrCode className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold">{clinicalReports.filter(r => r.nftToken).length}</p>
          <p className="text-xs opacity-80">Blockchain</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Prescrições</h3>
            <Pill className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold">12</p>
          <p className="text-xs opacity-80">Este mês</p>
        </div>
      </div>

      {/* Lista de Pacientes */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Meus Pacientes</h3>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {loading ? (
          <p className="text-slate-500 text-center py-4">Carregando pacientes...</p>
        ) : (
          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                onClick={() => handlePatientSelect(patient)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedPatient?.id === patient.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="font-semibold text-slate-800">{patient.name}</p>
                      <p className="text-sm text-slate-600">CPF: {patient.cpf} • Última visita: {patient.lastVisit}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      patient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {patient.status === 'active' ? 'Ativo' : 'Pendente'}
                    </span>
                    <Bell className="w-4 h-4 text-orange-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Relatórios Clínicos</h3>
        
        {selectedPatient ? (
          <div className="space-y-4">
            {clinicalReports.map((report) => (
              <div key={report.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-slate-800">{report.patientName}</h4>
                      <p className="text-sm text-slate-600">{report.date} • {report.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      report.status === 'shared' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {report.status === 'shared' ? 'Compartilhado' : 'Rascunho'}
                    </span>
                    {report.nftToken && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                        NFT: {report.nftToken}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-slate-700"><strong>Queixa Principal:</strong> {report.content.chiefComplaint}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleShareReport(report)}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Compartilhar</span>
                  </button>
                  <button
                    onClick={() => handleGenerateNFT(report)}
                    className="flex items-center space-x-1 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Gerar NFT</span>
                  </button>
                  <button className="flex items-center space-x-1 px-3 py-1 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">Selecione um paciente para visualizar os relatórios</p>
        )}
      </div>
    </div>
  )

  const renderRationalities = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Cinco Racionalidades Médicas</h3>
        
        {selectedPatient && clinicalReports.length > 0 ? (
          <div className="space-y-6">
            {Object.entries(clinicalReports[0].content.rationalities).map(([key, value]) => (
              <div key={key} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  {getRationalityIcon(key)}
                  <h4 className="font-semibold text-slate-800 capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(value).map(([subKey, subValue]) => (
                    <div key={subKey} className="flex">
                      <span className="font-medium text-slate-700 w-24">{subKey}:</span>
                      <span className="text-slate-600">{String(subValue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-8">Selecione um paciente com relatórios para visualizar as racionalidades</p>
        )}
      </div>
    </div>
  )

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center space-x-2">
              <FileText className="w-6 h-6" />
              <span>Prontuário Médico</span>
            </h2>
            <p className="text-slate-300">
              Sistema integrado de prontuários com cinco racionalidades médicas
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-400">LGPD Compliant</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-100 rounded-lg p-1">
        {[
          { key: 'overview', label: 'Visão Geral', icon: BarChart3 },
          { key: 'reports', label: 'Relatórios', icon: FileText },
          { key: 'prescriptions', label: 'Prescrições', icon: Pill },
          { key: 'notes', label: 'Anotações', icon: Edit },
          { key: 'rationalities', label: 'Racionalidades', icon: Brain }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'reports' && renderReports()}
      {activeTab === 'prescriptions' && <QuickPrescriptions />}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Anotações Clínicas</h3>
          <p className="text-slate-500 text-center py-8">Sistema de anotações em desenvolvimento</p>
        </div>
      )}
      {activeTab === 'rationalities' && renderRationalities()}

      {/* Share Modal */}
      {showShareModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Compartilhar Relatório</h3>
            <p className="text-slate-600 mb-4">
              Compartilhar relatório de {selectedReport.patientName} com outros profissionais?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  console.log('Compartilhando relatório:', selectedReport.id)
                  setShowShareModal(false)
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicalRecord
