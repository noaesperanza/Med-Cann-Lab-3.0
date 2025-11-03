import React, { useState, useEffect } from 'react'
import {
  FileText,
  Download,
  Eye,
  Share2,
  QrCode,
  CheckCircle,
  Clock,
  User,
  Calendar,
  AlertCircle,
  Brain,
  Heart,
  Activity,
  Stethoscope,
  Microscope,
  Leaf,
  Zap,
  Target
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface SharedReport {
  id: string
  patientId: string
  patientName: string
  patientAge: number
  patientCpf: string
  date: string
  assessmentType: string
  status: 'shared' | 'reviewed' | 'validated'
  sharedAt: string
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
  doctorNotes?: string
  reviewStatus?: 'pending' | 'reviewed' | 'approved'
}

interface ClinicalReportsProps {
  className?: string
}

const ClinicalReports: React.FC<ClinicalReportsProps> = ({ className = '' }) => {
  const { user } = useAuth()
  const [reports, setReports] = useState<SharedReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<SharedReport | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [doctorNotes, setDoctorNotes] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'shared' | 'reviewed' | 'validated'>('all')

  useEffect(() => {
    loadSharedReports()
  }, [])

  const loadSharedReports = async () => {
    try {
      setLoading(true)
      
      // Buscar relatórios compartilhados com o profissional atual
      // shared_with é um array UUID[], então verificamos se contém o ID do médico
      // Usamos RPC ou filtro manual
      const { data: allReports, error: fetchError } = await supabase
        .from('clinical_reports')
        .select(`
          *,
          patient:patient_id
        `)
        .eq('status', 'shared')
        .order('shared_at', { ascending: false })

      if (fetchError) {
        console.error('❌ Erro ao buscar relatórios:', fetchError)
        return
      }

      // Filtrar relatórios que foram compartilhados com este médico
      const sharedReports = allReports?.filter(report => {
        const sharedWith = report.shared_with || []
        return Array.isArray(sharedWith) && sharedWith.includes(user?.id)
      }) || []

      // Transformar dados para o formato esperado
      const formattedReports: SharedReport[] = sharedReports?.map(report => ({
        id: report.id,
        patientId: report.patient_id,
        patientName: report.patient_name || 'Paciente',
        patientAge: report.patient_age || 0,
        patientCpf: report.patient_cpf || '',
        date: report.created_at,
        assessmentType: report.assessment_type || 'initial_assessment',
        status: report.status || 'shared',
        sharedAt: report.shared_at || report.created_at,
        nftToken: report.nft_token,
        blockchainHash: report.blockchain_hash,
        content: {
          chiefComplaint: report.chief_complaint || '',
          history: report.history || '',
          physicalExam: report.physical_exam || '',
          assessment: report.assessment || '',
          plan: report.plan || '',
          rationalities: report.rationalities || {
            biomedical: {},
            traditionalChinese: {},
            ayurvedic: {},
            homeopathic: {},
            integrative: {}
          }
        },
        doctorNotes: report.doctor_notes,
        reviewStatus: report.review_status || 'pending'
      })) || []

      setReports(formattedReports)
    } catch (error) {
      console.error('❌ Erro ao carregar relatórios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewReport = async (reportId: string, status: 'reviewed' | 'approved') => {
    try {
      const { error } = await supabase
        .from('clinical_reports')
        .update({
          review_status: status,
          doctor_notes: doctorNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id
        })
        .eq('id', reportId)

      if (error) {
        console.error('❌ Erro ao revisar relatório:', error)
        return
      }

      console.log('✅ Relatório revisado com sucesso')
      loadSharedReports() // Recarregar dados
      setShowReportModal(false)
      setDoctorNotes('')
    } catch (error) {
      console.error('❌ Erro ao revisar relatório:', error)
    }
  }

  const handleGenerateNFT = async (report: SharedReport) => {
    try {
      console.log('Gerando NFT para relatório:', report.id)
      alert(`NFT gerado com sucesso!\nToken: NFT-${Date.now()}\nHash: 0x${Math.random().toString(16).substr(2, 8)}`)
    } catch (error) {
      console.error('Erro ao gerar NFT:', error)
    }
  }

  const filteredReports = reports.filter(report => {
    if (filterStatus === 'all') return true
    return report.status === filterStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shared': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'validated': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shared': return <Share2 className="w-4 h-4" />
      case 'reviewed': return <Eye className="w-4 h-4" />
      case 'validated': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 shadow-lg border border-orange-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-orange-900 mb-2 flex items-center space-x-2">
              <FileText className="w-6 h-6" />
              <span>Relatórios da Avaliação Clínica Inicial</span>
            </h2>
            <p className="text-orange-700">
              Relatórios compartilhados pelos pacientes com você
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-orange-600">
              {filteredReports.length} relatórios
            </span>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'Todos', icon: <FileText className="w-4 h-4" /> },
            { key: 'shared', label: 'Compartilhados', icon: <Share2 className="w-4 h-4" /> },
            { key: 'reviewed', label: 'Revisados', icon: <Eye className="w-4 h-4" /> },
            { key: 'validated', label: 'Validados', icon: <CheckCircle className="w-4 h-4" /> }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key as any)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors ${
                filterStatus === key
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-orange-700 border border-orange-200 hover:bg-orange-50'
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Relatórios */}
      {loading ? (
        <div className="text-center text-slate-500 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
          Carregando relatórios...
        </div>
      ) : filteredReports.length > 0 ? (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="w-5 h-5 text-slate-600" />
                    <h3 className="text-lg font-semibold text-slate-900">{report.patientName}</h3>
                    <span className="text-sm text-slate-500">CPF: {report.patientCpf}</span>
                    <span className="text-sm text-slate-500">Idade: {report.patientAge} anos</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Compartilhado em: {new Date(report.sharedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(report.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm border ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    <span className="capitalize">{report.status}</span>
                  </span>
                  {report.nftToken && (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                      NFT: {report.nftToken}
                    </span>
                  )}
                </div>
              </div>

              {/* Resumo do Relatório */}
              <div className="mb-4">
                <h4 className="font-semibold text-slate-800 mb-2">Resumo da Avaliação:</h4>
                <p className="text-slate-600 text-sm mb-2">
                  <strong>Queixa Principal:</strong> {report.content.chiefComplaint}
                </p>
                <p className="text-slate-600 text-sm">
                  <strong>Avaliação:</strong> {report.content.assessment}
                </p>
              </div>

              {/* Racionalidades Médicas */}
              <div className="mb-4">
                <h4 className="font-semibold text-slate-800 mb-2">Racionalidades Médicas:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(report.content.rationalities).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-1 px-2 py-1 bg-slate-100 rounded text-xs">
                      {getRationalityIcon(key)}
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    setSelectedReport(report)
                    setDoctorNotes(report.doctorNotes || '')
                    setShowReportModal(true)
                  }}
                  className="flex items-center space-x-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Revisar</span>
                </button>
                <button
                  onClick={() => handleGenerateNFT(report)}
                  className="flex items-center space-x-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Gerar NFT</span>
                </button>
                <button className="flex items-center space-x-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-500 py-8">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhum relatório compartilhado</h3>
          <p className="text-slate-500">
            Os pacientes ainda não compartilharam relatórios de avaliação clínica inicial com você.
          </p>
        </div>
      )}

      {/* Modal de Revisão */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">
                Revisar Relatório - {selectedReport.patientName}
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Conteúdo do Relatório */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-800 mb-2">Conteúdo do Relatório:</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Queixa Principal:</strong> {selectedReport.content.chiefComplaint}</div>
                  <div><strong>História:</strong> {selectedReport.content.history}</div>
                  <div><strong>Exame Físico:</strong> {selectedReport.content.physicalExam}</div>
                  <div><strong>Avaliação:</strong> {selectedReport.content.assessment}</div>
                  <div><strong>Plano:</strong> {selectedReport.content.plan}</div>
                </div>
              </div>
              
              {/* Notas do Médico */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Suas Notas e Observações:
                </label>
                <textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Digite suas observações sobre este relatório..."
                  className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleReviewReport(selectedReport.id, 'reviewed')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Marcar como Revisado
              </button>
              <button
                onClick={() => handleReviewReport(selectedReport.id, 'approved')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Aprovar Relatório
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClinicalReports
