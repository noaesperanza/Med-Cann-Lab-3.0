import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Heart, 
  TrendingUp, 
  CheckCircle, 
  Calendar,
  Clock,
  DollarSign,
  CreditCard,
  Wallet,
  Gift,
  Award,
  Target,
  BarChart3,
  FileText,
  BookOpen,
  Globe,
  MessageCircle,
  FlaskConical,
  Sparkles,
  Zap,
  Download,
  Share2,
  Eye,
  Star,
  Activity,
  Bell,
  AlertCircle
} from 'lucide-react'

const CidadeAmigaDosRins: React.FC = () => {
  const navigate = useNavigate()
  const [activePillar, setActivePillar] = useState<string>('introducao')

  const pillars = [
    { id: 'introducao', label: 'Introdução', icon: Sparkles },
    { id: 'fundamentacao', label: 'Fundamentação Clínica', icon: Heart },
    { id: 'inovacao', label: 'Inovação Tecnológica', icon: Zap },
    { id: 'seguranca', label: 'Segurança e Governança', icon: CheckCircle },
    { id: 'integracao', label: 'Integrações em Pesquisa', icon: FlaskConical },
    { id: 'impacto', label: 'Impacto em Saúde Pública', icon: Globe }
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 via-cyan-900 to-blue-900 border-b border-blue-500/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-4">
            <button 
              onClick={() => navigate('/app/pesquisa/profissional/dashboard')}
              className="flex items-center space-x-2 text-blue-200 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <div className="h-6 w-px bg-blue-400/50" />
            <div>
              <h1 className="text-2xl font-bold text-white">Primeira Aplicação Social da AEC</h1>
              <p className="text-blue-200">Cidade Amiga dos Rins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl p-8 mb-8 border border-blue-500/20">
          <div className="flex items-start space-x-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-4xl font-bold text-white mb-4">Cidade Amiga dos Rins</h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-6">
                Programa pioneiro de saúde comunitária que integra tecnologia avançada e cuidado humanizado para identificação 
                de fatores de risco para doença renal crônica e onboarding de profissionais através da metodologia Arte da Entrevista Clínica.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-blue-500/20 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">15+</div>
              <div className="text-sm text-blue-200">Cidades Participantes</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-blue-500/20 text-center">
              <div className="text-4xl font-bold text-cyan-400 mb-2">200+</div>
              <div className="text-sm text-blue-200">Profissionais Treinados</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-blue-500/20 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">5.000+</div>
              <div className="text-sm text-blue-200">Pacientes Avaliados</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-blue-500/20 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">95%</div>
              <div className="text-sm text-blue-200">Fatores de Risco Identificados</div>
            </div>
          </div>
        </div>

        {/* Pilares do Programa */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
          <h3 className="text-2xl font-bold text-white mb-6">Pilares do Programa</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon
              return (
                <button
                  key={pillar.id}
                  onClick={() => setActivePillar(pillar.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    activePillar === pillar.id
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-blue-500'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-xs font-semibold text-center">{pillar.label}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Introdução */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <Sparkles className="w-8 h-8 text-blue-400" />
            <h3 className="text-2xl font-bold text-white">Introdução</h3>
          </div>
          
          <div className="bg-blue-900/20 rounded-lg p-6 mb-6 border border-blue-500/20">
            <h4 className="text-lg font-semibold text-white mb-3">Componente Principal</h4>
            <p className="text-blue-100 leading-relaxed">
              35 anos de nefrologia aplicados ao desenvolvimento de cidades sustentáveis para a saúde renal. 
              A metodologia AEC integrada com Inteligência Artificial permite uma abordagem preventiva inovadora 
              para identificação precoce de fatores de risco para doença renal crônica em populações urbanas.
            </p>
          </div>

          {/* Cronograma de Implementação */}
          <div className="mt-8">
            <h4 className="text-xl font-semibold text-white mb-6">Cronograma de Implementação</h4>
            <div className="space-y-4">
              {/* Validação Clínica */}
              <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="text-lg font-semibold text-white">Validação Clínica</h5>
                    <p className="text-sm text-blue-300">Em andamento • 12 meses</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">75%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <p className="text-sm text-blue-200">Desenvolvimento e validação da IA para análise preditiva</p>
              </div>

              {/* Piloto Regional */}
              <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="text-lg font-semibold text-white">Piloto Regional</h5>
                    <p className="text-sm text-yellow-300">Iniciando • 6 meses</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-xs font-semibold">30%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
                <p className="text-sm text-blue-200">Implementação em cidades piloto selecionadas</p>
              </div>

              {/* Expansão */}
              <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="text-lg font-semibold text-white">Expansão</h5>
                    <p className="text-sm text-purple-300">Planejado • 18 meses</p>
                  </div>
                  <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold">10%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
                <p className="text-sm text-blue-200">Escalabilidade regional e publicações científicas</p>
              </div>

              {/* Nacional */}
              <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h5 className="text-lg font-semibold text-white">Nacional</h5>
                    <p className="text-sm text-slate-400">Futuro • 24 meses</p>
                  </div>
                  <span className="px-3 py-1 bg-slate-600 text-white rounded-full text-xs font-semibold">0%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2 mb-2">
                  <div className="bg-slate-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-sm text-blue-200">Modelo replicável para todo o Brasil</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sistemas Ativos */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-8 h-8 text-green-400" />
            <h3 className="text-2xl font-bold text-white">Sistemas Ativos</h3>
          </div>
          
          <p className="text-slate-300 mb-6">
            Sistema Financeiro & Agendamento - Plataforma completa para gestão financeira e agendamento de consultas, 
            integrando múltiplas formas de pagamento e agenda inteligente.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Sistema Financeiro */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-green-500/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Sistema Financeiro</h4>
                <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold">Ativo</span>
              </div>
              
              <div className="space-y-4 mb-4">
                <div>
                  <h5 className="text-sm font-semibold text-green-300 mb-2">Pagamentos Integrados</h5>
                  <p className="text-xs text-slate-300 mb-3">Sistema completo de pagamentos com múltiplas opções</p>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Cartões de crédito e débito</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Pix instantâneo</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Boleto bancário</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Escute-se Points</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Parcelamento em até 12x</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h5 className="text-sm font-semibold text-green-300 mb-2">Gestão Financeira</h5>
                  <p className="text-xs text-slate-300 mb-3">Controle completo das finanças da plataforma</p>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Dashboard financeiro em tempo real</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Relatórios de receita</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Controle de assinaturas</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Gestão de reembolsos</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Análise de métricas financeiras</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Sistema Agendamento */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Sistema Agendamento</h4>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold">Ativo</span>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Ativo com agenda do Dr. Ricardo Valença disponível
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                Agendar Consulta
              </button>
            </div>
          </div>

          {/* Programa Amores */}
          <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-lg p-6 border border-purple-500/20 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Programa Amores</h4>
              <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-semibold">Em desenvolvimento</span>
            </div>
            <p className="text-purple-100 text-sm mb-4">
              Sistema de pontos e benefícios para fidelização
            </p>
            <ul className="space-y-2 text-xs text-purple-200">
              <li className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-purple-400" />
                <span>Pontos por atividades na plataforma</span>
              </li>
              <li className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-purple-400" />
                <span>Cashback em consultas</span>
              </li>
              <li className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-purple-400" />
                <span>Benefícios exclusivos</span>
              </li>
              <li className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-purple-400" />
                <span>Troca por serviços</span>
              </li>
              <li className="flex items-center space-x-2">
                <Gift className="w-4 h-4 text-purple-400" />
                <span>Programa de indicação</span>
              </li>
            </ul>
          </div>

          {/* Métodos de Pagamento */}
          <div className="bg-slate-700/50 rounded-lg p-6 border border-slate-600">
            <h4 className="text-lg font-semibold text-white mb-4">Métodos de Pagamento Disponíveis</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-600">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <div className="text-xs text-slate-300">Cartão de Crédito</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-600">
                <Zap className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <div className="text-xs text-slate-300">Pix</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-600">
                <FileText className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <div className="text-xs text-slate-300">Boleto</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-600">
                <Star className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <div className="text-xs text-slate-300">Escute-se Points</div>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 text-center border border-slate-600">
                <Wallet className="w-8 h-8 mx-auto mb-2 text-cyan-400" />
                <div className="text-xs text-slate-300">Outros</div>
              </div>
            </div>
            <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Testar Sistema de Pagamento
            </button>
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
              <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                Investir neste Modelo
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

          {/* Assinaturas */}
          <div className="mt-8">
            <h4 className="text-xl font-semibold text-white mb-6">Assinaturas Sopro Saúde Renal</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Renal Individual */}
              <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl p-6 border border-blue-500/20">
                <h5 className="text-xl font-semibold text-white mb-2">Renal Individual</h5>
                <div className="text-3xl font-bold text-blue-400 mb-4">R$ 100/mês</div>
                <p className="text-blue-100 text-sm mb-4">Cuidado renal personalizado para você</p>
                <ul className="space-y-3 mb-6 text-sm text-blue-200">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Acesso direto ao WhatsApp do Dr. Ricardo</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Escuta personalizada para você</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Desconto de 50% nas consultas mensais ou bimensais</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>24h diárias de acesso à Nôa Esperanza</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Monitoramento renal individualizado</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>Avaliação de risco para DRC com Nôa Esperanza</span>
                  </li>
                </ul>
                <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                  Assinar Renal Individual
                </button>
              </div>

              {/* Renal Família */}
              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-6 border-2 border-purple-500/40 relative">
                <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Mais Popular
                </div>
                <h5 className="text-xl font-semibold text-white mb-2">Renal Família</h5>
                <div className="text-3xl font-bold text-purple-400 mb-4">R$ 200/mês</div>
                <p className="text-purple-100 text-sm mb-4">Proteção renal para toda a família</p>
                <ul className="space-y-3 mb-6 text-sm text-purple-200">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Contato contínuo com Dr. Ricardo</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Escuta personalizada para toda a família</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Acesso direto ao WhatsApp</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Desconto de 50% nas consultas para toda família</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>24h diárias de acesso à Nôa Esperanza</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Programa de benefícios Amores</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                    <span>Plano de monitoramento familiar</span>
                  </li>
                </ul>
                <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                  Assinar Renal Família
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Implementação das Atividades */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8 border border-slate-700">
          <div className="flex items-center space-x-3 mb-6">
            <Activity className="w-8 h-8 text-cyan-400" />
            <h3 className="text-2xl font-bold text-white">Implementação das Atividades Alinhadas com Sustentabilidade</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Programas Educacionais */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-cyan-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="w-6 h-6 text-cyan-400" />
                <h4 className="text-lg font-semibold text-white">Programas Educacionais</h4>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Treinamento em práticas sustentáveis e equidade na saúde
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Workshops presenciais</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Seminários online</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Cursos especializados</span>
                </li>
              </ul>
            </div>

            {/* Plataforma Interação Comunitária */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-cyan-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <MessageCircle className="w-6 h-6 text-cyan-400" />
                <h4 className="text-lg font-semibold text-white">Plataforma Interação Comunitária</h4>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Discussão e troca sobre saúde e sustentabilidade
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Fóruns de discussão</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Sessões Q&A</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Grupos temáticos</span>
                </li>
              </ul>
            </div>

            {/* Pesquisa Colaborativa */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-cyan-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <FlaskConical className="w-6 h-6 text-cyan-400" />
                <h4 className="text-lg font-semibold text-white">Pesquisa Colaborativa</h4>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Colaboração entre instituições de pesquisa e ONGs
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Conferências</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Grupos de trabalho</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Publicações conjuntas</span>
                </li>
              </ul>
            </div>

            {/* Ferramentas Monitoramento */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-cyan-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
                <h4 className="text-lg font-semibold text-white">Ferramentas Monitoramento</h4>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Ferramentas digitais para práticas sustentáveis
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Aplicativos móveis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Sistemas software</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Dashboards</span>
                </li>
              </ul>
            </div>

            {/* Saúde Comunitária */}
            <div className="bg-slate-700/50 rounded-lg p-6 border border-cyan-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="w-6 h-6 text-cyan-400" />
                <h4 className="text-lg font-semibold text-white">Saúde Comunitária</h4>
              </div>
              <p className="text-slate-300 text-sm mb-4">
                Programas com foco em equidade e sustentabilidade
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Organizações locais</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Serviços acessíveis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  <span>Iniciativas populares</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-900/40 via-cyan-900/40 to-blue-900/40 rounded-xl p-8 border border-blue-500/20">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-2">Parcerias Institucionais</h3>
            <p className="text-blue-200 text-lg mb-6">
              Modelo de negócio sustentável baseado nos princípios do artigo "After COP26", 
              promovendo saúde, equidade e sustentabilidade através de parcerias estratégicas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-4 rounded-lg font-bold transition-colors">
              Investir na Plataforma
            </button>
            <button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-6 py-4 rounded-lg font-bold transition-colors">
              Aderir a um Plano
            </button>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-lg font-bold transition-colors">
              Agendar Apresentação
            </button>
          </div>
          <div className="mt-6 text-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold hover:bg-blue-50 transition-colors">
              Agendar Consulta • Avaliação Clínica Inicial
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CidadeAmigaDosRins

