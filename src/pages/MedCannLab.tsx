import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  FlaskConical, 
  Heart, 
  Brain, 
  TrendingUp, 
  CheckCircle, 
  Calendar,
  Clock,
  Users,
  Award,
  Target,
  BarChart3,
  FileText,
  BookOpen,
  Globe,
  MessageCircle,
  Stethoscope,
  Sparkles,
  Zap,
  Download,
  Share2,
  Eye,
  Star,
  Activity,
  Activity as MonitorIcon,
  Cpu,
  Activity as DeviceIcon,
  DollarSign,
  Gift
} from 'lucide-react'

const MedCannLab: React.FC = () => {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<string>('sobre')

  const sections = [
    { id: 'sobre', label: 'Sobre o Projeto', icon: FlaskConical },
    { id: 'protocolos', label: 'Protocolos AEC', icon: FileText },
    { id: 'monitoramento', label: 'Monitoramento Renal', icon: MonitorIcon },
    { id: 'deeplearning', label: 'Deep Learning', icon: Brain },
    { id: 'dispositivos', label: 'Dispositivos Médicos', icon: DeviceIcon },
    { id: 'impacto', label: 'Impacto Clínico', icon: Heart }
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Botão Voltar */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/app/pesquisa/profissional/dashboard')}
            className="flex items-center space-x-2 text-green-400 hover:text-green-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
        </div>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-green-900/40 to-teal-900/40 rounded-xl p-8 mb-8 border border-green-500/20">
          <div className="flex items-start space-x-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="/brain.png" 
                alt="MedCann Lab Logo" 
                className="w-full h-full object-contain p-2"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3)) brightness(1.2) contrast(1.1)'
                }}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-white mb-4">MedCann Lab</h2>
              <p className="text-green-100 text-lg leading-relaxed mb-6">
                Pesquisa pioneira da cannabis medicinal aplicada à nefrologia e neurologia, utilizando a metodologia AEC 
                para identificar benefícios terapêuticos e avaliar impactos na função renal.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-green-500/20 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">50+</div>
              <div className="text-sm text-green-200">Pacientes em Protocolos</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-teal-500/20 text-center">
              <div className="text-4xl font-bold text-teal-400 mb-2">12</div>
              <div className="text-sm text-green-200">Meses de Pesquisa</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-cyan-500/20 text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">85%</div>
              <div className="text-sm text-green-200">Melhoria na Função Renal</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-emerald-500/20 text-center">
              <div className="text-4xl font-bold text-emerald-400 mb-2">200+</div>
              <div className="text-sm text-green-200">Biomarcadores Analisados</div>
            </div>
          </div>
        </div>

        {/* Seções do Projeto */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
          <h3 className="text-2xl font-bold text-white mb-6">Áreas de Pesquisa</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    activeSection === section.id
                      ? 'bg-green-600 border-green-400 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-green-500'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-center">{section.label}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sobre o Projeto */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src="/brain.png" 
                alt="MedCann Lab Logo" 
                className="w-full h-full object-contain"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(0, 193, 106, 0.4)) brightness(1.1)'
                }}
              />
            </div>
            <h3 className="text-2xl font-bold text-white">Sobre o Projeto</h3>
          </div>
          
          <div className="bg-green-900/20 rounded-lg p-6 mb-6 border border-green-500/20">
            <h4 className="text-lg font-semibold text-white mb-3">Objetivo Principal</h4>
            <p className="text-green-100 leading-relaxed">
              O MedCann Lab é uma pesquisa inovadora que combina a metodologia Arte da Entrevista Clínica (AEC) 
              com tecnologia de ponta para investigar os benefícios terapêuticos da cannabis medicinal na nefrologia 
              e neurologia. Utilizando Deep Learning e análise de biomarcadores, o projeto busca avaliar o impacto 
              na função renal e desenvolver protocolos personalizados baseados em evidências científicas.
            </p>
          </div>

          {/* Características Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-700/50 rounded-lg p-6 border border-green-500/20">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FileText className="w-6 h-6 text-green-400" />
                <span>Protocolos de Prescrição Baseados em AEC</span>
              </h4>
              <ul className="space-y-3 text-sm text-green-100">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Anamnese estruturada com metodologia AEC</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Avaliação IMRE Triaxial integrada</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Protocolos personalizados por perfil do paciente</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>Acompanhamento longitudinal com ajustes baseados em resultados</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-6 border border-teal-500/20">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <MonitorIcon className="w-6 h-6 text-teal-400" />
                <span>Monitoramento de Função Renal</span>
              </h4>
              <ul className="space-y-3 text-sm text-teal-100">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Avaliação contínua de creatinina e TFG</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Análise de biomarcadores nefrológicos</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Monitoramento de efeitos adversos renais</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  <span>Alertas automáticos para mudanças significativas</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-6 border border-cyan-500/20">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Brain className="w-6 h-6 text-cyan-400" />
                <span>Deep Learning para Análise de Biomarcadores</span>
              </h4>
              <ul className="space-y-3 text-sm text-cyan-100">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Modelos preditivos para resposta ao tratamento</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Análise de padrões em grandes volumes de dados</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Identificação de subgrupos de pacientes responsivos</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>Otimização de dosagens baseada em machine learning</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-700/50 rounded-lg p-6 border border-emerald-500/20">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <DeviceIcon className="w-6 h-6 text-emerald-400" />
                <span>Integração com Dispositivos Médicos</span>
              </h4>
              <ul className="space-y-3 text-sm text-emerald-100">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Sincronização com monitores de função renal</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Integração com dispositivos de monitoramento contínuo</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Coleta automatizada de dados vitais</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Dashboard unificado para visualização de dados</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Metodologia de Pesquisa */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <Target className="w-8 h-8 text-green-400" />
            <h3 className="text-2xl font-bold text-white">Metodologia de Pesquisa</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fase 1 */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Fase 1: Seleção</h4>
                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">Concluída</span>
              </div>
              <p className="text-green-100 text-sm mb-4">
                Seleção de pacientes com condições nefrológicas e neurológicas elegíveis para tratamento com cannabis medicinal.
              </p>
              <div className="space-y-2 text-xs text-green-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>50 pacientes selecionados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>Avaliação AEC inicial completa</span>
                </div>
              </div>
            </div>

            {/* Fase 2 */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-teal-500/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Fase 2: Protocolos</h4>
                <span className="px-3 py-1 bg-teal-600 text-white rounded-full text-xs font-semibold">Em Andamento</span>
              </div>
              <p className="text-teal-100 text-sm mb-4">
                Implementação de protocolos personalizados baseados em AEC com acompanhamento contínuo.
              </p>
              <div className="space-y-2 text-xs text-teal-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span>Protocolos individualizados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span>Monitoramento mensal ativo</span>
                </div>
              </div>
            </div>

            {/* Fase 3 */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-cyan-500/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Fase 3: Análise</h4>
                <span className="px-3 py-1 bg-cyan-600 text-white rounded-full text-xs font-semibold">Planejada</span>
              </div>
              <p className="text-cyan-100 text-sm mb-4">
                Análise de dados com Deep Learning para identificar padrões e otimizar tratamentos.
              </p>
              <div className="space-y-2 text-xs text-cyan-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Modelos preditivos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Publicações científicas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados Preliminares */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-8 h-8 text-green-400" />
            <h3 className="text-2xl font-bold text-white">Resultados Preliminares</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-900/20 rounded-lg p-6 border border-green-500/20">
              <h4 className="text-lg font-semibold text-white mb-4">Eficácia do Tratamento</h4>
              <ul className="space-y-3 text-sm text-green-100">
                <li className="flex items-center justify-between">
                  <span>Melhoria na função renal:</span>
                  <span className="font-bold text-green-400">85% dos pacientes</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Redução de sintomas:</span>
                  <span className="font-bold text-green-400">92% dos pacientes</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Melhoria na qualidade de vida:</span>
                  <span className="font-bold text-green-400">78% dos pacientes</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Adesão ao tratamento:</span>
                  <span className="font-bold text-green-400">88% dos pacientes</span>
                </li>
              </ul>
            </div>

            <div className="bg-teal-900/20 rounded-lg p-6 border border-teal-500/20">
              <h4 className="text-lg font-semibold text-white mb-4">Análise de Biomarcadores</h4>
              <ul className="space-y-3 text-sm text-teal-100">
                <li className="flex items-center justify-between">
                  <span>Biomarcadores analisados:</span>
                  <span className="font-bold text-teal-400">200+</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Padrões identificados:</span>
                  <span className="font-bold text-teal-400">15 padrões significativos</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Predições precisas:</span>
                  <span className="font-bold text-teal-400">82% de acurácia</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Subgrupos responsivos:</span>
                  <span className="font-bold text-teal-400">3 identificados</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sistema de Captação de Recursos */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <DollarSign className="w-8 h-8 text-green-400" />
            <h3 className="text-2xl font-bold text-white">Sistema de Captação de Recursos</h3>
          </div>

          <div className="bg-green-900/20 rounded-lg p-6 mb-6 border border-green-500/20">
            <h4 className="text-lg font-semibold text-white mb-3">Modelos de Negócio Sustentável</h4>
            <p className="text-green-100 text-sm leading-relaxed mb-4">
              Estratégias de desenvolvimento sustentável alinhadas com os princípios de equidade, inovação e mobilização 
              de organizações públicas e privadas, baseadas em evidências científicas do artigo "After COP26 — Putting 
              Health and Equity at the Center of the Climate Movement".
            </p>
          </div>

          {/* Modelos de Monetização */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-700/50 rounded-lg p-6 border border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Plataforma de Assinaturas Educacional</h4>
                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">Ativo</span>
              </div>
              <div className="space-y-3 mb-4">
                <p className="text-sm text-slate-300">Investimento: R$ 50.000 - R$ 200.000</p>
                <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-slate-400">Progresso de Implementação: 85%</p>
                <p className="text-sm text-green-200">Conteúdo exclusivo sobre saúde sustentável e práticas ecológicas</p>
                <div className="bg-slate-800 rounded p-3">
                  <p className="text-xs font-semibold text-white mb-2">Benefícios Principais:</p>
                  <ul className="space-y-1 text-xs text-slate-300">
                    <li>• Receita contínua</li>
                    <li>• Disseminação de conhecimento</li>
                    <li>• Educação continuada</li>
                  </ul>
                </div>
              </div>
              <button 
                onClick={() => navigate('/app/professional-financial')}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Acessar Gestão Financeira
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold text-white">Consultoria em Sustentabilidade para Saúde</h5>
                  <span className="px-2 py-1 bg-yellow-600 text-white rounded-full text-xs">Em desenvolvimento</span>
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold text-white">Marketplace Produtos Sustentáveis</h5>
                  <span className="px-2 py-1 bg-purple-600 text-white rounded-full text-xs">Planejado</span>
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold text-white">Licenciamento de IA para Saúde Sustentável</h5>
                  <span className="px-2 py-1 bg-yellow-600 text-white rounded-full text-xs">Em desenvolvimento</span>
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-semibold text-white">Parcerias Público-Privadas</h5>
                  <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs">Ativo</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default MedCannLab

