import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Share2, 
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  Stethoscope,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Mail,
  Printer
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ShareReportModal from '../components/ShareReportModal'

const Reports: React.FC = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [showShareModal, setShowShareModal] = useState(false)

  // Buscar relatórios do Supabase
  useEffect(() => {
    loadReports()
  }, [user])

  const loadReports = async () => {
    try {
      setLoading(true)
      
      // Buscar relatórios clínicos do paciente
      if (user?.type === 'patient') {
        const { data: clinicalReports, error } = await supabase
          .from('clinical_reports')
          .select('*')
          .eq('patient_id', user.id)
          .order('generated_at', { ascending: false })

        if (error) {
          console.error('Erro ao buscar relatórios:', error)
          return
        }

        // Converter relatórios clínicos para formato exibido
        const formattedReports = clinicalReports?.map((report: any) => ({
          id: report.id,
          title: `Relatório ${report.report_type === 'initial_assessment' ? 'Avaliação Clínica Inicial' : report.report_type} - ${report.patient_name}`,
          patientName: report.patient_name,
          patientId: report.patient_id,
          type: report.protocol || 'IMRE',
          date: new Date(report.generated_at || report.created_at).toLocaleDateString('pt-BR'),
          status: report.status === 'shared' ? 'compartilhado' : report.status === 'completed' ? 'concluido' : 'em_andamento',
          size: '2.5 MB',
          pages: 10,
          doctor: report.professional_name || 'IA Residente',
          crm: 'CRM-RJ',
          summary: typeof report.content === 'object' 
            ? (report.content.result || report.content.investigation || 'Relatório clínico completo.')
            : (report.content?.substring(0, 200) || 'Avaliação clínica completa.'),
          keyFindings: typeof report.content === 'object' 
            ? (report.content.recommendations || [])
            : [],
          recommendations: typeof report.content === 'object' 
            ? (report.content.recommendations || [])
            : [],
          nextSteps: [],
          attachments: [],
          clinicalReport: report.content,
          sharedWith: report.shared_with || [],
          sharedAt: report.shared_at,
          canShare: report.status === 'completed' && user?.type === 'patient'
        })) || []

        setReports(formattedReports)
      } else {
        // Para profissionais, buscar avaliações como antes
        const { data: assessments, error } = await supabase
          .from('clinical_assessments')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erro ao buscar relatórios:', error)
          return
        }

        const formattedReports = assessments?.map((assessment) => ({
          id: assessment.id,
          title: `Relatório ${assessment.assessment_type} - ${assessment.data?.name || 'Paciente'}`,
          patientName: assessment.data?.name || 'Paciente',
          patientId: assessment.patient_id,
          type: assessment.assessment_type,
          date: new Date(assessment.created_at).toLocaleDateString('pt-BR'),
          status: assessment.status === 'completed' ? 'concluido' : 'em_andamento',
          size: '2.5 MB',
          pages: 10,
          doctor: 'Dr. Ricardo Valença',
          crm: 'CRM-RJ',
          summary: assessment.clinical_report?.substring(0, 200) || 'Avaliação clínica completa.',
          keyFindings: assessment.data?.complaintList || [],
          recommendations: [],
          nextSteps: [],
          attachments: [],
          clinicalReport: assessment.clinical_report
        })) || []

        setReports(formattedReports)
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
    } finally {
      setLoading(false)
    }
  }

  // Usar apenas dados reais
  const allReports = reports

  const filteredReports = allReports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || report.type === filterType
    const matchesPeriod = filterPeriod === 'all' || true // Implementar filtro de período se necessário
    
    return matchesSearch && matchesType && matchesPeriod
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-500/20 text-green-400'
      case 'em_andamento': return 'bg-yellow-500/20 text-yellow-400'
      case 'pendente': return 'bg-blue-500/20 text-blue-400'
      case 'cancelado': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido': return <CheckCircle className="w-4 h-4" />
      case 'em_andamento': return <Clock className="w-4 h-4" />
      case 'pendente': return <AlertCircle className="w-4 h-4" />
      case 'cancelado': return <AlertCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IMRE': return <Stethoscope className="w-5 h-5 text-blue-400" />
      case 'AEC': return <FileText className="w-5 h-5 text-red-400" />
      case 'Retorno': return <Users className="w-5 h-5 text-green-400" />
      default: return <FileText className="w-5 h-5 text-slate-400" />
    }
  }

  return (
    <div className="space-y-4 md:space-y-8 px-2 md:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">📈 Relatórios</h1>
          <p className="text-slate-300 text-sm md:text-base">Visualize e gerencie os relatórios dos seus pacientes</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors">
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Gerar Relatório</span>
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-slate-800/80 rounded-lg p-4 md:p-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="Buscar por paciente, tipo ou título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 md:pl-10 pr-4 py-2 md:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            />
          </div>

          {/* Filtro de Tipo */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            >
              <option value="all">Todos os Tipos</option>
              <option value="IMRE">IMRE</option>
              <option value="AEC">AEC</option>
              <option value="Retorno">Retorno</option>
            </select>
          </div>

          {/* Filtro de Período */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="flex-1 px-3 md:px-4 py-2 md:py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
            >
              <option value="all">Todos os Períodos</option>
              <option value="today">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="year">Este Ano</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-slate-800/80 rounded-lg p-3 md:p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs md:text-sm">Total de Relatórios</p>
              <p className="text-lg md:text-2xl font-bold text-white">{reports.length}</p>
            </div>
            <FileText className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-slate-800/80 rounded-lg p-3 md:p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs md:text-sm">Concluídos</p>
              <p className="text-lg md:text-2xl font-bold text-white">{reports.filter(r => r.status === 'concluido').length}</p>
            </div>
            <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-slate-800/80 rounded-lg p-3 md:p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs md:text-sm">Em Andamento</p>
              <p className="text-lg md:text-2xl font-bold text-white">{reports.filter(r => r.status === 'em_andamento').length}</p>
            </div>
            <Clock className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-slate-800/80 rounded-lg p-3 md:p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs md:text-sm">Páginas Totais</p>
              <p className="text-lg md:text-2xl font-bold text-white">{reports.reduce((acc, r) => acc + r.pages, 0)}</p>
            </div>
            <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Lista de Relatórios */}
      <div className="space-y-3 md:space-y-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-slate-800/80 rounded-lg p-4 md:p-6 border border-slate-700 hover:bg-slate-800/90 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              {/* Informações Principais */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(report.type)}
                    <span className="text-base md:text-lg font-bold text-white">{report.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(report.status)}
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.replace('_', ' ').charAt(0).toUpperCase() + report.status.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                  <div>
                    <p className="text-slate-400 text-xs md:text-sm">Paciente</p>
                    <p className="text-white font-medium text-sm md:text-base">{report.patientName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs md:text-sm">Data</p>
                    <p className="text-white font-medium text-sm md:text-base">{report.date}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs md:text-sm">Tamanho</p>
                    <p className="text-white font-medium text-sm md:text-base">{report.size}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs md:text-sm">Páginas</p>
                    <p className="text-white font-medium text-sm md:text-base">{report.pages}</p>
                  </div>
                </div>

                {/* Resumo */}
                <div className="mb-4">
                  <p className="text-slate-400 text-xs md:text-sm mb-2">Resumo</p>
                  <p className="text-slate-300 text-xs md:text-sm">{report.summary}</p>
                </div>

                {/* Principais Achados */}
                <div className="mb-4">
                  <p className="text-slate-400 text-xs md:text-sm mb-2">Principais Achados</p>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {report.keyFindings.map((finding: any, index: number) => (
                      <span key={index} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                        {finding}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recomendações */}
                <div className="mb-4">
                  <p className="text-slate-400 text-xs md:text-sm mb-2">Recomendações</p>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {report.recommendations.map((recommendation: any, index: number) => (
                      <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                        {recommendation}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Próximos Passos */}
                <div className="mb-4">
                  <p className="text-slate-400 text-xs md:text-sm mb-2">Próximos Passos</p>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {report.nextSteps.map((step: any, index: number) => (
                      <span key={index} className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                        {step}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Anexos */}
                <div>
                  <p className="text-slate-400 text-xs md:text-sm mb-2">Anexos</p>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {report.attachments.map((attachment: any, index: number) => (
                      <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
                        {attachment}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 lg:ml-6 mt-4 lg:mt-0">
                <div className="flex space-x-1 md:space-x-2">
                  <button className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors" title="Visualizar">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedReport(report)
                      setShowShareModal(true)
                    }}
                    disabled={!report.canShare}
                    className={`p-2 rounded-lg transition-colors ${
                      report.canShare
                        ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/20'
                        : 'text-slate-500 cursor-not-allowed opacity-50'
                    }`}
                    title={report.canShare ? 'Compartilhar com médicos' : 'Relatório já compartilhado ou não disponível'}
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex space-x-1 md:space-x-2">
                  <button className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 rounded-lg transition-colors" title="Imprimir">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors" title="Enviar por Email">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo por Tipo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <div className="bg-slate-800/80 rounded-lg p-4 md:p-6 border border-slate-700">
          <h3 className="text-base md:text-lg font-bold text-white mb-4">📊 Relatórios por Tipo</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm md:text-base">IMRE</span>
              <span className="text-blue-400 font-bold text-sm md:text-base">2 relatórios</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm md:text-base">AEC</span>
              <span className="text-red-400 font-bold text-sm md:text-base">1 relatório</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm md:text-base">Retorno</span>
              <span className="text-green-400 font-bold text-sm md:text-base">1 relatório</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-lg p-4 md:p-6 border border-slate-700">
          <h3 className="text-base md:text-lg font-bold text-white mb-4">📈 Estatísticas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm md:text-base">Taxa de Conclusão</span>
              <span className="text-green-400 font-bold text-sm md:text-base">75%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm md:text-base">Páginas Médias</span>
              <span className="text-blue-400 font-bold text-sm md:text-base">7.5</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm md:text-base">Tamanho Médio</span>
              <span className="text-purple-400 font-bold text-sm md:text-base">2.2 MB</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Compartilhamento */}
      {showShareModal && selectedReport && (
        <ShareReportModal
          reportId={selectedReport.id}
          patientId={selectedReport.patientId}
          reportName={selectedReport.title}
          onClose={() => {
            setShowShareModal(false)
            setSelectedReport(null)
          }}
          onShareSuccess={() => {
            loadReports()
          }}
        />
      )}
    </div>
  )
}

export default Reports
