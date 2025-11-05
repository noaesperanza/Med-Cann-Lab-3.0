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
  Zap,
  Play,
  Video,
  FileText as FileTextIcon,
  Globe,
  MapPin,
  Zap as SparklesIcon
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
          {/* Fórum Destaque */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-xl p-4 md:p-6 lg:p-8 mb-4 md:mb-6 lg:mb-8 cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all overflow-hidden w-full max-w-full"
               onClick={() => navigate('/app/pesquisa/profissional/forum-casos')}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full overflow-x-hidden">
              <div className="flex-1 min-w-0 overflow-x-hidden">
                <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    <MessageCircle className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">💬 Fórum de Conselheiros em IA na Saúde</h2>
                    <p className="text-white/90 text-sm md:text-base lg:text-lg">
                      Discussão colaborativa de casos clínicos, integração de dados dos três eixos e 
                      troca de experiências entre profissionais
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:gap-4 lg:gap-6 text-white/90 text-xs md:text-sm">
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <Users className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span>1,247 participantes ativos</span>
                  </div>
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <MessageCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span>456 casos discutidos</span>
                  </div>
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <Star className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                    <span>Discussões com IA integrada</span>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-auto md:ml-6">
                <button className="w-full md:w-auto bg-white text-purple-600 px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 rounded-lg font-bold text-sm md:text-base lg:text-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2">
                  <span>Acessar Fórum</span>
                  <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
                </button>
              </div>
            </div>
          </div>

          {/* Laboratório de Performance em Entrevista Clínica */}
          <div className="bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-blue-900/40 rounded-xl p-4 md:p-6 lg:p-8 mb-4 md:mb-6 lg:mb-8 border border-purple-500/20">
            <div className="flex flex-col md:flex-row items-start justify-between mb-4 md:mb-6 gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4 mb-3 md:mb-4">
                  <div className="w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <Brain className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">Laboratório de Performance em Entrevista Clínica</h2>
                    <p className="text-purple-200 text-sm md:text-base lg:text-lg">
                      Projetos inovadores que aplicam a metodologia AEC em diferentes contextos, desde pesquisa aplicada até intervenções comunitárias globais. 
                      Integração de Deep Learning e NLP para saúde humanizada.
                    </p>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-lg p-4 md:p-5 lg:p-6 mb-4 md:mb-5 lg:mb-6 border border-purple-500/20">
                  <div className="flex items-center space-x-2 md:space-x-3 mb-3">
                    <SparklesIcon className="w-5 h-5 md:w-6 md:h-6 text-purple-400 flex-shrink-0" />
                    <h3 className="text-lg md:text-xl font-semibold text-white">Logo Nôa Esperança Pesquisa</h3>
                  </div>
                  <div className="space-y-2 text-purple-200">
                    <p><strong className="text-white">Seminário Setembro 2025</strong></p>
                    <p><strong className="text-white">Saúde Espectral</strong></p>
                    <p className="mt-4">
                      Análise de critérios diagnósticos em nefrologia e neurologia, e o uso da cannabis medicinal na prática clínica. 
                      Um olhar expandido pela metodologia da Arte da Entrevista Clínica.
                    </p>
                  </div>
                  <button className="mt-4 flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all">
                    <Download className="w-5 h-5" />
                    <span>📕 Baixar eBook do Seminário</span>
                  </button>
                </div>

                <p className="text-purple-100 mb-6 text-lg leading-relaxed">
                  No LabPEC, a metodologia da Arte da Entrevista Clínica ganha corpo em encontros ao vivo, simulados e analisados com profundidade. 
                  Aqui, a escuta clínica é treinada com rigor e sensibilidade, em situações reais da prática médica.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 lg:gap-6 mb-4 md:mb-5 lg:mb-6 w-full overflow-x-hidden">
                  {/* O que acontece no LabPEC */}
                  <div className="bg-slate-800/50 rounded-lg p-4 md:p-5 lg:p-6 border border-purple-500/20 overflow-hidden w-full max-w-full">
                    <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center space-x-2">
                      <Play className="w-4 h-4 md:w-5 md:h-5 text-purple-400 flex-shrink-0" />
                      <span>🎭 O que acontece no LabPEC?</span>
                    </h3>
                    <ul className="space-y-3 text-purple-100">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-white">Role-playing clínico realista:</strong> consultas encenadas por duplas com base em casos clínicos reais.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-white">Análise triaxial da consulta:</strong> diferentes perspectivas entre entrevistador, paciente e professor.</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-white">Gravação e revisão técnica:</strong> análise em grupo da comunicação clínica e não-verbal.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Por que participar? */}
                  <div className="bg-slate-800/50 rounded-lg p-4 md:p-5 lg:p-6 border border-purple-500/20">
                    <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center space-x-2">
                      <Target className="w-4 h-4 md:w-5 md:h-5 text-purple-400 flex-shrink-0" />
                      <span>🎯 Por que participar?</span>
                    </h3>
                    <ul className="space-y-3 text-purple-100">
                      <li className="flex items-start space-x-2">
                        <Star className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Treinamento intensivo em habilidades comunicacionais</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Star className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Aplicação prática dos conceitos da AEC</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Star className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Feedback direto e individualizado</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Star className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Prática segura, com supervisão ativa</span>
                      </li>
                    </ul>
                  </div>

                  {/* Para quem? */}
                  <div className="bg-slate-800/50 rounded-lg p-4 md:p-5 lg:p-6 border border-purple-500/20">
                    <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center space-x-2">
                      <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-400 flex-shrink-0" />
                      <span>👥 Para quem?</span>
                    </h3>
                    <ul className="space-y-3 text-purple-100">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Estudantes de Medicina e Saúde</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Profissionais em formação continuada</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>Equipes de pesquisa aplicando a metodologia</span>
                      </li>
                    </ul>
                  </div>

                  {/* Como funciona? */}
                  <div className="bg-slate-800/50 rounded-lg p-6 border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-purple-400" />
                      <span>🧭 Como funciona?</span>
                    </h3>
                    <ul className="space-y-3 text-purple-100">
                      <li className="flex items-start space-x-2">
                        <Video className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-white">💻 Aulas ao vivo via Zoom</strong> às 21h</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <FileTextIcon className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-white">🧾 Casos clínicos</strong> alinhados ao tema da aula</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Users className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-white">👩‍⚕️ Dupla de alunos</strong> selecionada na hora</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Clock className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-white">⏱️ Exercícios</strong> com até 3 rodadas por noite</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <BarChart3 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span><strong className="text-white">📊 Análise final</strong> orientada por Dr. Ricardo Valença</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20 text-center">
                  <p className="text-purple-200 text-sm">
                    O LabPEC integra o eixo formativo da plataforma Nôa Esperanza, articulando ensino, clínica e pesquisa.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Projetos de Aplicação AEC */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Target className="w-8 h-8 text-purple-400" />
              <h2 className="text-xl md:text-2xl font-bold text-white">Projetos de Aplicação AEC</h2>
            </div>
            <p className="text-slate-400 mb-6">
              Aplicações da Arte da Entrevista Clínica - Projetos inovadores que aplicam a metodologia AEC em diferentes contextos, 
              desde pesquisa aplicada até intervenções comunitárias globais.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6 w-full overflow-x-hidden">
              {/* Cidade Amiga dos Rins */}
              <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl p-4 md:p-5 lg:p-6 border border-blue-500/20 hover:border-blue-400 hover:shadow-xl transition-all overflow-hidden w-full max-w-full">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Cidade Amiga dos Rins</h3>
                    <p className="text-sm text-blue-300">Saúde Comunitária & Nefrologia</p>
                  </div>
                </div>
                
                <p className="text-blue-100 mb-4 text-sm leading-relaxed">
                  Programa pioneiro de saúde comunitária que integra tecnologia avançada e cuidado humanizado para identificação 
                  de fatores de risco para doença renal crônica e onboarding de profissionais através da metodologia Arte da Entrevista Clínica.
                </p>

                <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-blue-500/20">
                  <h4 className="text-sm font-semibold text-white mb-3">Características Principais</h4>
                  <ul className="space-y-2 text-xs text-blue-100">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>35 anos de nefrologia aplicados ao desenvolvimento urbano</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Abordagem preventiva com IA para fatores de risco</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Onboarding de profissionais de saúde</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>Impacto direto em saúde pública</span>
                    </li>
                  </ul>
                </div>

                <button 
                  onClick={() => navigate('/app/pesquisa/profissional/cidade-amiga-dos-rins')}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Explorar Projeto</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              {/* MedCann Lab */}
              <div className="bg-gradient-to-br from-green-900/40 to-teal-900/40 rounded-xl p-4 md:p-6 border border-green-500/20 hover:border-green-400 hover:shadow-xl transition-all overflow-hidden w-full max-w-full">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-20 h-20 bg-green-500/20 rounded-xl flex items-center justify-center overflow-hidden">
                    <img 
                      src="/brain.png" 
                      alt="MedCann Lab Logo" 
                      className="w-full h-full object-contain"
                      style={{
                        filter: 'drop-shadow(0 0 10px rgba(0, 193, 106, 0.3)) brightness(1.1)'
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">MedCann Lab</h3>
                    <p className="text-sm text-green-300">Integração Cannabis & Nefrologia</p>
                  </div>
                </div>
                
                <p className="text-green-100 mb-4 text-sm leading-relaxed">
                  Pesquisa pioneira da cannabis medicinal aplicada à nefrologia e neurologia, utilizando a metodologia AEC 
                  para identificar benefícios terapêuticos e avaliar impactos na função renal.
                </p>

                <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-green-500/20">
                  <h4 className="text-sm font-semibold text-white mb-3">Características Principais</h4>
                  <ul className="space-y-2 text-xs text-green-100">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Protocolos de prescrição baseados em AEC</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Monitoramento de função renal</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Deep Learning para análise de biomarcadores</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Integração com dispositivos médicos</span>
                    </li>
                  </ul>
                </div>

                <button 
                  onClick={() => navigate('/app/pesquisa/profissional/medcann-lab')}
                  className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Explorar Projeto</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              {/* Jardins de Cura */}
              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-6 border border-purple-500/20 hover:border-purple-400 hover:shadow-xl transition-all">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Jardins de Cura</h3>
                    <p className="text-sm text-purple-300">Saúde Global & Agência Crítica</p>
                  </div>
                </div>
                
                <p className="text-purple-100 mb-4 text-sm leading-relaxed">
                  Projeto de saúde global focado na aplicação da metodologia AEC em comunidades vulneráveis, 
                  promovendo equidade em saúde e desenvolvimento de capacidades locais.
                </p>

                <div className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-purple-500/20">
                  <h4 className="text-sm font-semibold text-white mb-3">Características Principais</h4>
                  <ul className="space-y-2 text-xs text-purple-100">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Formação de agentes comunitários</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Triagem preventiva baseada em AEC</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Indicadores de saúde populacional</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>Parcerias com organizações internacionais</span>
                    </li>
                  </ul>
                </div>

                <button 
                  onClick={() => navigate('/app/pesquisa/profissional/jardins-de-cura')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Explorar Projeto</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          </div>

          {/* Integração dos Três Eixos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 w-full overflow-x-hidden">
            {/* Eixo Clínica */}
            <div className="bg-slate-800 rounded-xl p-4 md:p-6 hover:bg-slate-750 transition-colors cursor-pointer overflow-hidden w-full max-w-full"
                 onClick={() => navigate('/app/clinica/profissional/dashboard')}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">🏥 Eixo Clínica</h3>
                  <p className="text-sm text-gray-400">Dados clínicos</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Pacientes Ativos:</span>
                  <span className="text-white font-semibold">156</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Avaliações AEC:</span>
                  <span className="text-white font-semibold">89</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Protocolos Ativos:</span>
                  <span className="text-white font-semibold">34</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <Link2 className="w-5 h-5 text-blue-400" />
                <p className="text-xs text-gray-400 mt-2">Integrado com cursos e pesquisas</p>
              </div>
            </div>

            {/* Eixo Ensino */}
            <div className="bg-slate-800 rounded-xl p-4 md:p-6 hover:bg-slate-750 transition-colors cursor-pointer overflow-hidden w-full max-w-full"
                 onClick={() => navigate('/app/ensino/profissional/dashboard')}>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">🎓 Eixo Ensino</h3>
                  <p className="text-sm text-gray-400">Cursos e materiais</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Arte da Entrevista:</span>
                  <span className="text-white font-semibold">40h</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Cannabis Medicinal:</span>
                  <span className="text-white font-semibold">360h</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Alunos:</span>
                  <span className="text-white font-semibold">856</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <Link2 className="w-5 h-5 text-green-400" />
                <p className="text-xs text-gray-400 mt-2">Casos clínicos integrados</p>
              </div>
            </div>

            {/* Eixo Pesquisa */}
            <div className="bg-slate-800 rounded-xl p-6 hover:bg-slate-750 transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <FlaskConical className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">🔬 Eixo Pesquisa</h3>
                  <p className="text-sm text-gray-400">Estudos e análises</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Estudos Ativos:</span>
                  <span className="text-white font-semibold">3</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Participantes:</span>
                  <span className="text-white font-semibold">192</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Publicações:</span>
                  <span className="text-white font-semibold">1</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <Link2 className="w-5 h-5 text-purple-400" />
                <p className="text-xs text-gray-400 mt-2">Baseado em dados clínicos reais</p>
              </div>
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 w-full overflow-x-hidden">
            <div className="bg-slate-800 rounded-xl p-4 md:p-6 overflow-hidden w-full max-w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-pink-500/10 rounded-lg">
                  <FlaskConical className="w-6 h-6 text-pink-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">3</h3>
              <p className="text-sm text-slate-400">Estudos Ativos</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">83%</h3>
              <p className="text-sm text-slate-400">Progresso Médio</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">192</h3>
              <p className="text-sm text-slate-400">Participantes</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Award className="w-6 h-6 text-purple-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">1</h3>
              <p className="text-sm text-slate-400">Publicações</p>
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
