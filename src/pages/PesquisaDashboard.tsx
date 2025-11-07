import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Heart, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  MessageCircle, 
  Calendar,
  Clock,
  User,
  Star,
  CheckCircle,
  AlertCircle,
  Download,
  Share2,
  Eye,
  Target,
  Award,
  Brain,
  Activity as FlaskConical,
  FileText,
  Users,
  BookOpen,
  GraduationCap,
  Stethoscope,
  Link as Link2,
  Globe,
  MapPin
} from 'lucide-react'

const PesquisaDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [showAllStudies, setShowAllStudies] = useState(false)

  const researchData = [
    {
      id: 1,
      title: 'Eficácia do CBD na Insuficiência Renal',
      description: 'Estudo longitudinal sobre os efeitos do CBD em pacientes com IRC',
      status: 'Em Andamento',
      progress: 65,
      participants: 24,
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 2,
      title: 'Qualidade de Vida e Cannabis Medicinal',
      description: 'Avaliação do impacto na qualidade de vida de pacientes em tratamento',
      status: 'Análise',
      progress: 85,
      participants: 48,
      startDate: '2024-03-01',
      endDate: '2024-11-30',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 3,
      title: 'Arte da Entrevista Clínica - Validação',
      description: 'Validação da metodologia AEC em diferentes contextos clínicos',
      status: 'Concluído',
      progress: 100,
      participants: 120,
      startDate: '2023-09-01',
      endDate: '2024-08-31',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 4,
      title: 'Protocolos de Dosagem Personalizados',
      description: 'Desenvolvimento de protocolos individualizados baseados em dados clínicos',
      status: 'Em Andamento',
      progress: 45,
      participants: 32,
      startDate: '2024-06-01',
      endDate: '2025-05-31',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 5,
      title: 'Impacto da Metodologia IMRE em Resultados',
      description: 'Análise dos resultados clínicos utilizando avaliação triaxial',
      status: 'Análise',
      progress: 75,
      participants: 67,
      startDate: '2024-02-15',
      endDate: '2024-11-30',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 6,
      title: 'Cannabis Medicinal em Pacientes Idosos',
      description: 'Estudo sobre segurança e eficácia em pacientes acima de 65 anos',
      status: 'Concluído',
      progress: 100,
      participants: 89,
      startDate: '2023-03-01',
      endDate: '2024-02-28',
      color: 'from-teal-500 to-cyan-500'
    }
  ]

  // Mostrar apenas estudos ativos inicialmente, ou todos se showAllStudies for true
  const displayedStudies = showAllStudies ? researchData : researchData.filter(study => study.status !== 'Concluído')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Andamento': return 'text-blue-400'
      case 'Análise': return 'text-yellow-400'
      case 'Concluído': return 'text-green-400'
      case 'Pendente': return 'text-slate-400'
      default: return 'text-slate-400'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-blue-500'
    return 'bg-yellow-500'
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden w-full">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-3 md:p-4 lg:p-6 overflow-x-hidden w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-1">
            <button 
              onClick={() => navigate('/app/clinica/profissional/dashboard')}
              className="flex items-center space-x-1 md:space-x-2 text-slate-300 hover:text-white transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline text-sm md:text-base">Voltar</span>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white truncate">🔬 Eixo Pesquisa</h1>
              <p className="text-xs md:text-sm text-slate-400 hidden sm:block">Área de Pesquisa - Estudos e Análises Clínicas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-2 md:p-4 lg:p-6 overflow-x-hidden w-full">
        <div className="max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Destaque MedCann Lab */}
          <div className="rounded-2xl border border-[#00C16A]/20 bg-gradient-to-br from-[#0A192F] via-[#102C45] to-[#1F4B38] p-6 md:p-8 shadow-xl mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center bg-gradient-to-r from-[#00C16A] to-[#1a365d] shadow-lg">
                  <img
                    src="/brain.png"
                    alt="MedCann Lab"
                    className="w-10 h-10 object-contain"
                    style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.35)) brightness(1.2)' }}
                  />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-[#00C16A] mb-2">MedCann Lab</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">Integração Cannabis &amp; Nefrologia</h2>
                  <p className="text-sm md:text-base text-[#C8D6E5] mt-3 max-w-3xl">
                    Pesquisa pioneira conectando ensino, clínica e pesquisa para mapear benefícios terapêuticos da cannabis medicinal,
                    avaliando impactos na função renal com apoio da metodologia AEC.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/app/pesquisa/profissional/cidade-amiga-dos-rins')}
                className="self-start lg:self-center bg-gradient-to-r from-[#00C16A] to-[#1a365d] text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                Explorar Projeto
              </button>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'Protocolos de prescrição AEC',
                  description: 'Fluxos clínicos padronizados pela metodologia de anamnese AEC',
                },
                {
                  title: 'Monitoramento de função renal',
                  description: 'KPIs nefrológicos integrados ao prontuário avaliados em tempo real',
                },
                {
                  title: 'Deep Learning em biomarcadores',
                  description: 'Modelos que correlacionam exames laboratoriais e evolução clínica',
                },
                {
                  title: 'Integração com dispositivos médicos',
                  description: 'Wearables e equipamentos enviando dados contínuos para o LabPec',
                },
              ].map((item) => (
                <div key={item.title} className="bg-[#0F243C]/70 border border-[#00C16A]/10 rounded-lg p-4 flex items-start space-x-3">
                  <CheckCircle className="w-4 h-4 text-[#00C16A] mt-1" />
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-xs text-[#9FB3C6] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conexões entre Cursos e Dados Clínicos */}
          <div className="bg-slate-800 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Link2 className="w-6 h-6 text-purple-400" />
              <span>Integrações e Conexões</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full overflow-x-hidden">
              {/* Arte da Entrevista Clínica + Dados */}
              <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-lg p-4 md:p-6 border border-blue-500/20 overflow-hidden w-full max-w-full">
                <div className="flex items-center space-x-3 mb-4">
                  <BookOpen className="w-8 h-8 text-blue-400" />
                  <div>
                    <h4 className="text-lg font-semibold text-white">Arte da Entrevista Clínica</h4>
                    <p className="text-sm text-gray-400">Metodologia AEC aplicada</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Casos com AEC aplicada:</span>
                    <span className="text-blue-400 font-semibold">89 casos</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Profissionais certificados:</span>
                    <span className="text-blue-400 font-semibold">34</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Dados clínicos correlacionados:</span>
                    <span className="text-blue-400 font-semibold">156</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/app/arte-entrevista-clinica')}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                >
                  Acessar Curso
                </button>
              </div>

              {/* Cannabis Medicinal + Dados */}
              <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 rounded-lg p-6 border border-green-500/20">
                <div className="flex items-center space-x-3 mb-4">
                  <GraduationCap className="w-8 h-8 text-green-400" />
                  <div>
                    <h4 className="text-lg font-semibold text-white">Pós-Graduação Cannabis Medicinal</h4>
                    <p className="text-sm text-gray-400">Dr. Eduardo Faveret</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Pacientes em protocolos:</span>
                    <span className="text-green-400 font-semibold">124</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Alunos aplicando conhecimento:</span>
                    <span className="text-green-400 font-semibold">856</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Estudos baseados no curso:</span>
                    <span className="text-green-400 font-semibold">3 estudos</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/curso-eduardo-faveret')}
                  className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                >
                  Acessar Curso
                </button>
              </div>
            </div>
          </div>

          {/* Research Studies */}
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">🔬 Meus Estudos</h3>
              <button 
                onClick={() => setShowAllStudies(!showAllStudies)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-colors"
              >
                {showAllStudies ? 'Ver Ativos' : `Ver Todos (${researchData.length})`}
              </button>
            </div>

            <div className="space-y-6">
              {displayedStudies.length === 0 ? (
                <div className="text-center py-12">
                  <FlaskConical className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum estudo ativo no momento</p>
                </div>
              ) : (
                displayedStudies.map((study) => (
                <div key={study.id} className="bg-slate-700 rounded-lg p-4 md:p-6 hover:bg-slate-650 transition-colors overflow-hidden w-full max-w-full">
                  <div className="flex items-start justify-between mb-4 gap-2 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                        <h4 className="text-lg font-semibold text-white break-words flex-1 min-w-0">{study.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(study.status)}`}>
                          {study.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-3 break-words">{study.description}</p>
                      
                      <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 mb-4">
                        <span className="whitespace-nowrap">Participantes: {study.participants}</span>
                        <span className="whitespace-nowrap">Início: {study.startDate}</span>
                        <span className="whitespace-nowrap">Fim: {study.endDate}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-400">Progresso</span>
                      <span className="text-white font-medium">{study.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(study.progress)}`}
                        style={{ width: `${study.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
            {!showAllStudies && researchData.filter(study => study.status === 'Concluído').length > 0 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-400 mb-2">
                  {researchData.filter(study => study.status === 'Concluído').length} estudos concluídos não exibidos
                </p>
                <button
                  onClick={() => setShowAllStudies(true)}
                  className="text-pink-400 hover:text-pink-300 text-sm font-medium"
                >
                  Ver estudos concluídos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PesquisaDashboard
