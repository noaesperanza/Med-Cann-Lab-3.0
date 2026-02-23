import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  Calendar,
  User,
  ArrowLeft,
  Brain,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  BarChart3,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Printer
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { clinicalReportService, type ClinicalReport } from '../lib/clinicalReportService'
import ClinicalReports from '../components/ClinicalReports'

// =====================================================
// REPORTS PAGE — Conectado ao clinicalReportService
// Plano de Ação Item #1 — Auditoria Master 360°
// =====================================================

type ViewMode = 'list' | 'analytics' | 'component'
type FilterStatus = 'all' | 'draft' | 'completed' | 'reviewed'
type FilterType = 'all' | 'initial_assessment' | 'follow_up' | 'emergency'

const Reports: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // State
  const [reports, setReports] = useState<ClinicalReport[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selectedReport, setSelectedReport] = useState<ClinicalReport | null>(null)
  const [aiReportsCount, setAiReportsCount] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Redirecionar pacientes para seu dashboard
  useEffect(() => {
    if (user?.type === 'paciente') {
      navigate('/app/clinica/paciente/dashboard')
    }
  }, [user, navigate])

  // Carregar relatórios
  useEffect(() => {
    loadReports()
  }, [])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterStatus, filterType])

  const loadReports = async () => {
    setLoading(true)
    try {
      const [allReports, aiCount] = await Promise.all([
        clinicalReportService.getAllReports(),
        clinicalReportService.getAIReportsCount()
      ])
      setReports(allReports)
      setAiReportsCount(aiCount)
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadReports()
    setRefreshing(false)
  }

  // Filtros
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      // Busca por texto
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesName = report.patient_name?.toLowerCase().includes(search)
        const matchesId = report.id?.toLowerCase().includes(search)
        const matchesContent = report.content?.investigation?.toLowerCase().includes(search)
          || report.content?.result?.toLowerCase().includes(search)
        if (!matchesName && !matchesId && !matchesContent) return false
      }

      // Filtro por status
      if (filterStatus !== 'all' && report.status !== filterStatus) return false

      // Filtro por tipo
      if (filterType !== 'all' && report.report_type !== filterType) return false

      return true
    })
  }, [reports, searchTerm, filterStatus, filterType])

  // Pagination Logic
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredReports.slice(start, start + itemsPerPage)
  }, [filteredReports, currentPage, itemsPerPage])

  // Analytics calculados
  const analytics = useMemo(() => {
    const total = reports.length
    const completed = reports.filter(r => r.status === 'completed').length
    const reviewed = reports.filter(r => r.status === 'reviewed').length
    const drafts = reports.filter(r => r.status === 'draft').length
    const aiGenerated = reports.filter(r => r.generated_by === 'ai_resident').length
    const avgClinicalScore = reports.length > 0
      ? Math.round(reports.reduce((acc, r) => acc + (r.content?.scores?.clinical_score || 0), 0) / reports.length)
      : 0
    const avgAdherence = reports.length > 0
      ? Math.round(reports.reduce((acc, r) => acc + (r.content?.scores?.treatment_adherence || 0), 0) / reports.length)
      : 0

    // Relatórios por mês (últimos 6 meses)
    const monthlyData: { month: string; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const monthName = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      const count = reports.filter(r => r.generated_at?.startsWith(monthKey)).length
      monthlyData.push({ month: monthName, count })
    }

    return { total, completed, reviewed, drafts, aiGenerated, avgClinicalScore, avgAdherence, monthlyData }
  }, [reports])

  // Helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Concluído', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle }
      case 'reviewed':
        return { label: 'Revisado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Eye }
      case 'draft':
        return { label: 'Rascunho', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock }
      default:
        return { label: status, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: AlertCircle }
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'initial_assessment':
        return { label: 'Avaliação Inicial', color: 'text-purple-400' }
      case 'follow_up':
        return { label: 'Acompanhamento', color: 'text-cyan-400' }
      case 'emergency':
        return { label: 'Emergência', color: 'text-red-400' }
      default:
        return { label: type, color: 'text-slate-400' }
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    } catch { return dateStr }
  }

  // Score bar visual
  const ScoreBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )

  if (user?.type === 'paciente') return null

  // Loading
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Carregando relatórios clínicos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-2 md:px-0">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-emerald-400" />
            Relatórios Clínicos
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {reports.length} relatório{reports.length !== 1 ? 's' : ''} • {aiReportsCount} gerado{aiReportsCount !== 1 ? 's' : ''} por IA
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-800/60 rounded-lg border border-slate-700/50 p-0.5">
            {([
              { mode: 'list' as ViewMode, icon: FileText, label: 'Lista' },
              { mode: 'analytics' as ViewMode, icon: BarChart3, label: 'Analytics' },
              { mode: 'component' as ViewMode, icon: Stethoscope, label: 'Clínico' }
            ]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === mode
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: analytics.total, icon: FileText, color: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-400' },
          { label: 'Concluídos', value: analytics.completed, icon: CheckCircle, color: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-400' },
          { label: 'Gerados por IA', value: analytics.aiGenerated, icon: Brain, color: 'from-purple-500/20 to-purple-600/10', iconColor: 'text-purple-400' },
          { label: 'Score Médio', value: `${analytics.avgClinicalScore}%`, icon: TrendingUp, color: 'from-amber-500/20 to-amber-600/10', iconColor: 'text-amber-400' }
        ].map(({ label, value, icon: Icon, color, iconColor }) => (
          <div
            key={label}
            className={`bg-gradient-to-br ${color} backdrop-blur-sm border border-slate-700/30 rounded-xl p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${iconColor}`} />
              <span className="text-xl font-bold text-white">{value}</span>
            </div>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* ── CONTENT BY VIEW MODE ── */}
      {viewMode === 'component' ? (
        /* Modo Componente: usa o ClinicalReports existente */
        <ClinicalReports className="w-full" />
      ) : viewMode === 'analytics' ? (
        /* Modo Analytics */
        <div className="space-y-6">
          {/* Gráfico de barras simples */}
          <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              Relatórios por Mês
            </h3>
            <div className="flex items-end justify-between gap-2 h-40">
              {analytics.monthlyData.map(({ month, count }) => {
                const maxCount = Math.max(...analytics.monthlyData.map(m => m.count), 1)
                const height = (count / maxCount) * 100
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-emerald-400 font-medium">{count}</span>
                    <div className="w-full bg-slate-700/30 rounded-t-lg relative" style={{ height: '120px' }}>
                      <div
                        className="absolute bottom-0 w-full rounded-t-lg transition-all duration-700"
                        style={{
                          height: `${height}%`,
                          background: 'linear-gradient(180deg, rgba(16,185,129,0.6) 0%, rgba(16,185,129,0.2) 100%)',
                          border: '1px solid rgba(16,185,129,0.3)',
                          borderBottom: 'none'
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 capitalize">{month}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Scores médios */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-4">Scores Médios Globais</h3>
              <div className="space-y-3">
                <ScoreBar label="Score Clínico" value={analytics.avgClinicalScore} color="bg-emerald-500" />
                <ScoreBar label="Adesão ao Tratamento" value={analytics.avgAdherence} color="bg-blue-500" />
              </div>
            </div>
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6">
              <h3 className="text-base font-semibold text-white mb-4">Distribuição por Status</h3>
              <div className="space-y-2">
                {[
                  { label: 'Concluídos', count: analytics.completed, color: 'bg-emerald-500' },
                  { label: 'Revisados', count: analytics.reviewed, color: 'bg-blue-500' },
                  { label: 'Rascunhos', count: analytics.drafts, color: 'bg-amber-500' }
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span className="text-sm text-slate-300">{label}</span>
                    </div>
                    <span className="text-sm font-medium text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Modo Lista */
        <div className="space-y-4">
          {/* Barra de busca e filtros */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por paciente, ID ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/60 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-300 text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="all">Todos status</option>
                <option value="completed">Concluídos</option>
                <option value="reviewed">Revisados</option>
                <option value="draft">Rascunhos</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-300 text-sm px-3 py-2 focus:outline-none focus:border-emerald-500/50"
              >
                <option value="all">Todos tipos</option>
                <option value="initial_assessment">Avaliação Inicial</option>
                <option value="follow_up">Acompanhamento</option>
                <option value="emergency">Emergência</option>
              </select>
            </div>
          </div>

          {/* Lista de relatórios */}
          {filteredReports.length === 0 ? (
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-12 text-center">
              <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-300 mb-2">
                {reports.length === 0 ? 'Nenhum relatório encontrado' : 'Nenhum resultado para os filtros aplicados'}
              </h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                {reports.length === 0
                  ? 'Relatórios clínicos serão gerados automaticamente pela IA Nôa durante avaliações clínicas, ou criados manualmente pelo profissional.'
                  : 'Tente ajustar os filtros de busca para encontrar o relatório desejado.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedReports.map((report) => {
                const statusBadge = getStatusBadge(report.status)
                const typeBadge = getTypeBadge(report.report_type)
                const StatusIcon = statusBadge.icon

                return (
                  <div
                    key={report.id}
                    className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-4 md:p-5 hover:border-emerald-500/30 transition-all cursor-pointer group"
                    onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                  >
                    {/* Linha principal */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-white font-semibold text-sm truncate">
                              {report.patient_name || 'Paciente'}
                            </h3>
                            <span className={`text-xs ${typeBadge.color}`}>
                              {typeBadge.label}
                            </span>
                          </div>
                          <p className="text-slate-500 text-xs mt-0.5">
                            {formatDate(report.generated_at)} • {report.generated_by === 'ai_resident' ? '🤖 IA Nôa' : '👨‍⚕️ Profissional'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full border ${statusBadge.color} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${selectedReport?.id === report.id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* Detalhes expandidos */}
                    {selectedReport?.id === report.id && (
                      <div className="mt-4 pt-4 border-t border-slate-700/30 space-y-4 animate-in fade-in duration-200">
                        {/* Conteúdo IMRE */}
                        <div className="grid md:grid-cols-2 gap-3">
                          {[
                            { label: 'Investigação', value: report.content?.investigation, icon: '🔍' },
                            { label: 'Metodologia', value: report.content?.methodology, icon: '🧪' },
                            { label: 'Resultado', value: report.content?.result, icon: '📊' },
                            { label: 'Evolução', value: report.content?.evolution, icon: '📈' }
                          ].map(({ label, value, icon }) => (
                            <div key={label} className="bg-slate-900/50 rounded-lg p-3">
                              <h4 className="text-xs font-medium text-slate-400 mb-1">{icon} {label}</h4>
                              <p className="text-sm text-slate-200 line-clamp-3">{value || '—'}</p>
                            </div>
                          ))}
                        </div>

                        {/* Scores */}
                        {report.content?.scores && (
                          <div className="bg-slate-900/50 rounded-lg p-4">
                            <h4 className="text-xs font-medium text-slate-400 mb-3">📊 Scores Clínicos</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <ScoreBar label="Score Clínico" value={report.content.scores.clinical_score || 0} color="bg-emerald-500" />
                              <ScoreBar label="Adesão" value={report.content.scores.treatment_adherence || 0} color="bg-blue-500" />
                              <ScoreBar label="Melhora Sintomas" value={report.content.scores.symptom_improvement || 0} color="bg-purple-500" />
                              <ScoreBar label="Qualidade de Vida" value={report.content.scores.quality_of_life || 0} color="bg-amber-500" />
                            </div>
                          </div>
                        )}

                        {/* Recomendações */}
                        {report.content?.recommendations?.length > 0 && (
                          <div className="bg-slate-900/50 rounded-lg p-4">
                            <h4 className="text-xs font-medium text-slate-400 mb-2">💡 Recomendações</h4>
                            <ul className="space-y-1">
                              {report.content.recommendations.map((rec: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                  <span className="text-emerald-400 mt-0.5">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Ações */}
                        <div className="flex items-center gap-2 pt-2">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs hover:bg-emerald-500/20 transition-colors">
                            <Download className="w-3.5 h-3.5" />
                            Exportar PDF
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 text-xs hover:bg-blue-500/20 transition-colors">
                            <Printer className="w-3.5 h-3.5" />
                            Imprimir
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 text-xs hover:bg-purple-500/20 transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                            Revisar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Controles de Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-700/30">
                  <p className="text-xs text-slate-500">
                    Mostrando <span className="text-slate-300">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="text-slate-300">{Math.min(currentPage * itemsPerPage, filteredReports.length)}</span> de <span className="text-slate-300">{filteredReports.length}</span> relatórios
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${currentPage === page
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
                            }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Reports
