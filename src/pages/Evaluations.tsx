import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Stethoscope, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  FileText, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
  Download,
  Share2,
  BarChart3,
  Users,
  Heart
} from 'lucide-react'

const Evaluations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  const evaluations = [
    {
      id: 1,
      patientName: 'Maria Silva',
      patientId: 1,
      type: 'IMRE',
      status: 'concluida',
      date: '15/01/2024',
      time: '14:30',
      duration: '45 min',
      doctor: 'Dr. Passos Mir',
      crm: '12345-SP',
      score: 85,
      priority: 'medium',
      notes: 'Avaliação completa realizada com sucesso. Paciente apresentou boa adesão ao tratamento.',
      symptoms: ['Dor de cabeça', 'Pressão alta', 'Cansaço'],
      diagnosis: 'Hipertensão arterial sistêmica',
      recommendations: ['Continuar medicação', 'Reduzir sal', 'Exercícios regulares'],
      nextAppointment: '22/01/2024',
      documents: ['Relatório IMRE', 'Prescrição médica', 'Exames solicitados']
    },
    {
      id: 2,
      patientName: 'João Santos',
      patientId: 2,
      type: 'AEC',
      status: 'em_andamento',
      date: '14/01/2024',
      time: '10:15',
      duration: '30 min',
      doctor: 'Dr. Passos Mir',
      crm: '12345-SP',
      score: null,
      priority: 'high',
      notes: 'Avaliação em andamento. Aguardando resultados de exames laboratoriais.',
      symptoms: ['Sede excessiva', 'Perda de peso', 'Visão turva'],
      diagnosis: 'Diabetes mellitus tipo 2 (suspeita)',
      recommendations: ['Exames laboratoriais', 'Consulta com endocrinologista'],
      nextAppointment: '20/01/2024',
      documents: ['Solicitação de exames', 'Encaminhamento']
    },
    {
      id: 3,
      patientName: 'Ana Costa',
      patientId: 3,
      type: 'Retorno',
      status: 'concluida',
      date: '13/01/2024',
      time: '16:45',
      duration: '35 min',
      doctor: 'Dr. Passos Mir',
      crm: '12345-SP',
      score: 92,
      priority: 'low',
      notes: 'Primeira consulta de retorno. Paciente adaptando-se bem ao tratamento.',
      symptoms: ['Ansiedade leve', 'Insônia ocasional'],
      diagnosis: 'Transtorno de ansiedade generalizada',
      recommendations: ['Continuar terapia', 'Técnicas de relaxamento'],
      nextAppointment: '28/01/2024',
      documents: ['Relatório de retorno', 'Prescrição atualizada']
    },
    {
      id: 4,
      patientName: 'Carlos Lima',
      patientId: 4,
      type: 'IMRE',
      status: 'pendente',
      date: '12/01/2024',
      time: '09:00',
      duration: '60 min',
      doctor: 'Dr. Passos Mir',
      crm: '12345-SP',
      score: null,
      priority: 'high',
      notes: 'Avaliação agendada para paciente oncológico. Preparação especial necessária.',
      symptoms: ['Dor abdominal', 'Perda de apetite', 'Fadiga'],
      diagnosis: 'Câncer de próstata (em tratamento)',
      recommendations: ['Avaliação oncológica', 'Suporte psicológico'],
      nextAppointment: '25/01/2024',
      documents: ['Prontuário oncológico', 'Exames recentes']
    }
  ]

  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = evaluation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || evaluation.status === filterStatus
    const matchesType = filterType === 'all' || evaluation.type === filterType
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-500/20 text-green-400'
      case 'em_andamento': return 'bg-yellow-500/20 text-yellow-400'
      case 'pendente': return 'bg-blue-500/20 text-blue-400'
      case 'cancelada': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida': return <CheckCircle className="w-4 h-4" />
      case 'em_andamento': return <Clock className="w-4 h-4" />
      case 'pendente': return <AlertCircle className="w-4 h-4" />
      case 'cancelada': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400'
      case 'low': return 'bg-green-500/20 text-green-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IMRE': return <Stethoscope className="w-5 h-5 text-blue-400" />
      case 'AEC': return <Heart className="w-5 h-5 text-red-400" />
      case 'Retorno': return <Users className="w-5 h-5 text-green-400" />
      default: return <Stethoscope className="w-5 h-5 text-slate-400" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">📊 Avaliações</h1>
          <p className="text-slate-300">Gerencie e acompanhe as avaliações dos seus pacientes</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            to="/clinical-assessment"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Avaliação</span>
          </Link>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por paciente, tipo ou diagnóstico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro de Status */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="concluida">Concluída</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="pendente">Pendente</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          {/* Filtro de Tipo */}
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Tipos</option>
              <option value="IMRE">IMRE</option>
              <option value="AEC">AEC</option>
              <option value="Retorno">Retorno</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total de Avaliações</p>
              <p className="text-2xl font-bold text-white">{evaluations.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Concluídas</p>
              <p className="text-2xl font-bold text-white">{evaluations.filter(e => e.status === 'concluida').length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Em Andamento</p>
              <p className="text-2xl font-bold text-white">{evaluations.filter(e => e.status === 'em_andamento').length}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Pendentes</p>
              <p className="text-2xl font-bold text-white">{evaluations.filter(e => e.status === 'pendente').length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Lista de Avaliações */}
      <div className="space-y-4">
        {filteredEvaluations.map((evaluation) => (
          <div key={evaluation.id} className="bg-slate-800/80 rounded-lg p-6 border border-slate-700 hover:bg-slate-800/90 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              {/* Informações Principais */}
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(evaluation.type)}
                    <span className="text-lg font-bold text-white">{evaluation.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(evaluation.status)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(evaluation.status)}`}>
                      {evaluation.status.replace('_', ' ').charAt(0).toUpperCase() + evaluation.status.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(evaluation.priority)}`}>
                    {evaluation.priority === 'high' ? 'Alta' : evaluation.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-slate-400 text-sm">Paciente</p>
                    <p className="text-white font-medium">{evaluation.patientName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Data e Hora</p>
                    <p className="text-white font-medium">{evaluation.date} às {evaluation.time}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Duração</p>
                    <p className="text-white font-medium">{evaluation.duration}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Diagnóstico</p>
                    <p className="text-white font-medium">{evaluation.diagnosis}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Próxima Consulta</p>
                    <p className="text-white font-medium">{evaluation.nextAppointment}</p>
                  </div>
                  {evaluation.score && (
                    <div>
                      <p className="text-slate-400 text-sm">Pontuação</p>
                      <p className="text-white font-medium">{evaluation.score}/100</p>
                    </div>
                  )}
                </div>

                {/* Sintomas */}
                <div className="mb-4">
                  <p className="text-slate-400 text-sm mb-2">Sintomas Relatados</p>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.symptoms.map((symptom, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recomendações */}
                <div className="mb-4">
                  <p className="text-slate-400 text-sm mb-2">Recomendações</p>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.recommendations.map((recommendation, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                        {recommendation}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notas */}
                <div className="mb-4">
                  <p className="text-slate-400 text-sm mb-2">Observações</p>
                  <p className="text-slate-300 text-sm">{evaluation.notes}</p>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-col space-y-2 lg:ml-6">
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors" title="Ver Detalhes">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 rounded-lg transition-colors" title="Editar">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-lg transition-colors" title="Relatório">
                    <FileText className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20 rounded-lg transition-colors" title="Compartilhar">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-500/20 rounded-lg transition-colors" title="Download">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors" title="Continuar">
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo por Tipo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">📊 Resumo por Tipo de Avaliação</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">IMRE</span>
              <span className="text-blue-400 font-bold">2 avaliações</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">AEC</span>
              <span className="text-red-400 font-bold">1 avaliação</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Retorno</span>
              <span className="text-green-400 font-bold">1 avaliação</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">📈 Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Taxa de Conclusão</span>
              <span className="text-green-400 font-bold">75%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Tempo Médio</span>
              <span className="text-blue-400 font-bold">42 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Satisfação</span>
              <span className="text-purple-400 font-bold">4.8/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Evaluations
