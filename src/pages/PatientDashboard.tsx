import React, { useState, useRef, useEffect } from 'react'
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
  Send,
  Mic,
  MicOff
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'
import { clinicalReportService, ClinicalReport } from '../lib/clinicalReportService'

const PatientDashboard: React.FC = () => {
  const { user } = useAuth()
  const { sendInitialMessage } = useNoaPlatform()
  
  // Debug temporário
  console.log('🏥 PatientDashboard - RENDERIZADO! User:', user?.name, 'Type:', user?.type)
  const navigate = useNavigate()
  
  // Estado para relatórios
  const [reports, setReports] = useState<ClinicalReport[]>([])
  const [loadingReports, setLoadingReports] = useState(true)

  // Carregar relatórios do paciente
  useEffect(() => {
    const loadReports = async () => {
      if (user?.id) {
        try {
          const patientReports = await clinicalReportService.getPatientReports(user.id)
          setReports(patientReports)
        } catch (error) {
          console.error('Erro ao carregar relatórios:', error)
        } finally {
          setLoadingReports(false)
        }
      }
    }

    loadReports()
  }, [user?.id])

  // Navigation handlers
  const handleNavigate = (path: string) => {
    navigate(path)
  }

  const handleViewReports = () => {
    navigate('/app/reports')
  }

  // Função para iniciar avaliação clínica inicial com protocolo IMRE
  const handleStartClinicalAssessment = () => {
    const imrePrompt = `Olá Nôa! Sou ${user?.name || 'um paciente'} e gostaria de realizar uma Avaliação Clínica Inicial seguindo o protocolo IMRE (Investigação, Metodologia, Resultado, Evolução) da Arte da Entrevista Clínica aplicada à Cannabis Medicinal. Por favor, inicie o protocolo IMRE para minha avaliação clínica inicial e, ao final, gere um relatório clínico que será salvo no meu dashboard.`
    
    sendInitialMessage(imrePrompt)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard do Paciente</h1>
            <p className="text-slate-400">Programa de Cuidado Renal</p>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3 bg-slate-700 p-3 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'P'}</span>
            </div>
            <div>
              <p className="font-semibold text-white">{user?.name || 'Paciente'}</p>
              <p className="text-sm text-slate-400">Paciente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section - Primeiro */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Meu Dashboard de Saúde</h2>
            <p className="text-white/90 mb-4">
              Bem-vindo à Nôa Esperanza! Aqui você pode acompanhar sua jornada de cuidado personalizado e acessar seus relatórios clínicos.
            </p>
          </div>

          {/* Mensagem Inicial para Avaliação Clínica - Card Clicável */}
          <div 
            onClick={handleStartClinicalAssessment}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 mb-8 border border-blue-500/30 shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
          >
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-3">🚀 Primeira Avaliação Clínica</h2>
                <p className="text-white/90 mb-6 text-lg">
                  Clique aqui para realizar uma avaliação clínica inicial com a IA residente seguindo o protocolo IMRE. Os dados serão organizados e personalizados para você. Esta é a base para todo o seu cuidado personalizado.
                </p>
                <div className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg shadow-lg inline-block">
                  Iniciar Avaliação com IA
                </div>
              </div>
            </div>
          </div>

          {/* Cards em Layout Horizontal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Score Clínico */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Score Clínico</h3>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-slate-400">--/100</div>
                <div className="flex items-center space-x-2 text-slate-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Aguardando avaliação</span>
                </div>
              </div>
            </div>

            {/* Adesão ao Tratamento */}
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-white">Adesão ao Tratamento</h4>
                <CheckCircle className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-3xl font-bold text-slate-400 mb-1">--%</div>
              <p className="text-sm text-slate-400">Aguardando dados</p>
            </div>

            {/* Melhoria dos Sintomas */}
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-white">Melhoria dos Sintomas</h4>
                <Activity className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-3xl font-bold text-slate-400 mb-1">--%</div>
              <p className="text-sm text-slate-400">Aguardando avaliação</p>
            </div>

            {/* Qualidade de Vida */}
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold text-white">Qualidade de Vida</h4>
                <Star className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-3xl font-bold text-slate-400 mb-1">--/100</div>
              <p className="text-sm text-slate-400">Aguardando dados</p>
            </div>

            {/* Agenda */}
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">📅 Minha Agenda</h3>
                <button 
                  onClick={() => navigate('/app/scheduling')}
                  className="text-purple-400 hover:text-purple-300 transition-colors text-xs"
                >
                  Ver agenda completa
                </button>
              </div>
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-400 text-sm mb-1">Nenhuma consulta agendada</p>
                <p className="text-slate-500 text-xs">Complete sua avaliação clínica inicial</p>
              </div>
            </div>

            {/* Relatórios */}
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">📋 Meus Relatórios</h3>
                <button 
                  onClick={handleViewReports}
                  className="text-purple-400 hover:text-purple-300 transition-colors text-xs"
                >
                  Ver todos
                </button>
              </div>
              {loadingReports ? (
                <div className="text-center py-4">
                  <p className="text-slate-400 text-sm">Carregando relatórios...</p>
                </div>
              ) : reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.slice(0, 3).map((report) => (
                    <div key={report.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <h4 className="text-white font-medium text-sm">
                              {report.report_type === 'initial_assessment' 
                                ? 'Avaliação Clínica Inicial' 
                                : report.report_type}
                            </h4>
                            {report.status === 'shared' && (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                                Compartilhado
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-xs mb-2">
                            {new Date(report.generated_at).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-slate-300 text-xs line-clamp-2">
                            {typeof report.content === 'object' 
                              ? (report.content.result || report.content.investigation || 'Relatório clínico completo.')
                              : 'Avaliação clínica completa.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          onClick={() => handleNavigate('/app/reports')}
                          className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Visualizar
                        </button>
                        {report.status === 'completed' && (
                          <button
                            onClick={() => {
                              // Abrir modal de compartilhamento
                              handleNavigate('/app/reports')
                            }}
                            className="flex-1 px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-1"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>Compartilhar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {reports.length > 3 && (
                    <button
                      onClick={handleViewReports}
                      className="w-full px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition-colors"
                    >
                      Ver mais {reports.length - 3} relatório(s)
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FileText className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm mb-1">Nenhum relatório ainda</p>
                  <p className="text-slate-500 text-xs">Complete sua avaliação clínica inicial</p>
                </div>
              )}
            </div>

            {/* Chat com Profissional */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">💬 Chat com Profissional</h3>
              <p className="text-slate-400 text-sm mb-4">Converse diretamente com seu médico</p>
              <button 
                onClick={() => handleNavigate('/app/patient-chat')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors text-sm"
              >
                Iniciar Conversa
              </button>
            </div>

            {/* Planos e Finanças */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">💳 Planos e Finanças</h3>
              <p className="text-slate-400 text-sm mb-4">Gerencie seus planos e pagamentos</p>
              <button 
                onClick={() => navigate('/app/subscription-plans')}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors text-sm"
              >
                Ver Planos
              </button>
            </div>

            {/* Compartilhamento */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🔗 Compartilhamento</h3>
              <p className="text-slate-400 text-sm mb-4">Compartilhe seus dados de forma segura</p>
              <button 
                onClick={() => alert('Funcionalidade de compartilhamento disponível no chat com profissional')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors text-sm"
              >
                Compartilhar Dados
              </button>
            </div>

            {/* Blockchain Info */}
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center space-x-2 text-sm text-slate-400 mb-2">
                <Shield className="w-4 h-4" />
                <span className="text-xs">Dados protegidos por Blockchain</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Última sincronização: Agora</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard
