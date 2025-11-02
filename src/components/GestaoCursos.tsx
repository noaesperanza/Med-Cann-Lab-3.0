import React, { useState, useEffect } from 'react'
import { 
  BookOpen,
  GraduationCap,
  Users,
  Clock,
  Star,
  Play,
  Edit,
  Trash2,
  Plus,
  Upload,
  Download,
  Eye,
  Settings,
  BarChart3,
  TrendingUp,
  Award,
  FileText,
  Video,
  Image,
  Link
} from 'lucide-react'

interface Curso {
  id: string
  titulo: string
  descricao: string
  duracao: number
  modulos: number
  alunos: number
  avaliacao: number
  status: 'ativo' | 'rascunho' | 'arquivado'
  thumbnail: string
  categoria: string
  nivel: 'iniciante' | 'intermediario' | 'avancado'
  preco: number
  dataCriacao: string
  ultimaAtualizacao: string
}

interface Modulo {
  id: string
  cursoId: string
  titulo: string
  descricao: string
  ordem: number
  duracao: number
  tipo: 'video' | 'texto' | 'quiz' | 'atividade'
  conteudo: string
  recursos: string[]
}

interface GestaoCursosProps {
  className?: string
}

const GestaoCursos: React.FC<GestaoCursosProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<'cursos' | 'modulos' | 'analytics'>('cursos')
  const [cursos, setCursos] = useState<Curso[]>([])
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Dados mockados para cursos de Cannabis Medicinal
  const mockCursos: Curso[] = [
    {
      id: '1',
      titulo: 'Fundamentos da Cannabis Medicinal',
      descricao: 'Curso introdutório sobre os princípios básicos da cannabis medicinal',
      duracao: 40,
      modulos: 8,
      alunos: 45,
      avaliacao: 4.8,
      status: 'ativo',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjOEI1Q0Y2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5GQ008L3RleHQ+PC9zdmc+',
      categoria: 'Cannabis Medicinal',
      nivel: 'iniciante',
      preco: 299,
      dataCriacao: '2024-01-15',
      ultimaAtualizacao: '2024-01-20'
    },
    {
      id: '2',
      titulo: 'Protocolo IMRE na Prática Clínica',
      descricao: 'Aplicação prática do protocolo IMRE em consultas de cannabis medicinal',
      duracao: 60,
      modulos: 12,
      alunos: 32,
      avaliacao: 4.9,
      status: 'ativo',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkY2QjAwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JTVJFPC90ZXh0Pjwvc3ZnPg==',
      categoria: 'Protocolos Clínicos',
      nivel: 'intermediario',
      preco: 499,
      dataCriacao: '2024-01-10',
      ultimaAtualizacao: '2024-01-18'
    },
    {
      id: '3',
      titulo: 'Gestão de Pacientes com Cannabis',
      descricao: 'Estratégias avançadas para acompanhamento e gestão de pacientes',
      duracao: 80,
      modulos: 15,
      alunos: 28,
      avaliacao: 4.7,
      status: 'rascunho',
      thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkY0NDQ0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5HUEM8L3RleHQ+PC9zdmc+',
      categoria: 'Gestão Clínica',
      nivel: 'avancado',
      preco: 699,
      dataCriacao: '2024-01-05',
      ultimaAtualizacao: '2024-01-12'
    }
  ]

  const mockModulos: Modulo[] = [
    {
      id: '1',
      cursoId: '1',
      titulo: 'Introdução à Cannabis Medicinal',
      descricao: 'Conceitos básicos e histórico da cannabis medicinal',
      ordem: 1,
      duracao: 5,
      tipo: 'video',
      conteudo: 'video_intro_cannabis.mp4',
      recursos: ['slides.pdf', 'bibliografia.pdf']
    },
    {
      id: '2',
      cursoId: '1',
      titulo: 'Farmacologia dos Canabinoides',
      descricao: 'Estudo dos principais canabinoides e seus efeitos',
      ordem: 2,
      duracao: 7,
      tipo: 'video',
      conteudo: 'video_farmacologia.mp4',
      recursos: ['tabela_canabinoides.pdf', 'exercicios.pdf']
    },
    {
      id: '3',
      cursoId: '2',
      titulo: 'Protocolo IMRE - Investigação',
      descricao: 'Primeira fase do protocolo: investigação clínica',
      ordem: 1,
      duracao: 8,
      tipo: 'video',
      conteudo: 'video_investigacao.mp4',
      recursos: ['formulario_investigacao.pdf', 'checklist.pdf']
    }
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setCursos(mockCursos)
      setModulos(mockModulos)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-500/20 text-green-400'
      case 'rascunho': return 'bg-yellow-500/20 text-yellow-400'
      case 'arquivado': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo'
      case 'rascunho': return 'Rascunho'
      case 'arquivado': return 'Arquivado'
      default: return status
    }
  }

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'iniciante': return 'bg-green-500/20 text-green-400'
      case 'intermediario': return 'bg-yellow-500/20 text-yellow-400'
      case 'avancado': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video': return <Video className="w-4 h-4" />
      case 'texto': return <FileText className="w-4 h-4" />
      case 'quiz': return <Award className="w-4 h-4" />
      case 'atividade': return <Users className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-700 rounded-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <GraduationCap className="w-6 h-6" />
              <span>Gestão de Cursos</span>
            </h2>
            <p className="text-blue-200">
              Pós-graduação em Cannabis Medicinal - Produção e Gestão de Aulas
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors w-full lg:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Curso</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'cursos', label: 'Cursos', icon: <BookOpen className="w-4 h-4" /> },
            { key: 'modulos', label: 'Módulos', icon: <FileText className="w-4 h-4" /> },
            { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.key 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-700 text-blue-200 hover:bg-blue-600'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'cursos' && (
        <div className="space-y-4">
          {cursos.map((curso) => (
            <div key={curso.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start space-y-4 lg:space-y-0 lg:space-x-4">
                <img 
                  src={curso.thumbnail} 
                  alt={curso.titulo}
                  className="w-full lg:w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
                    <h3 className="text-white text-lg font-semibold truncate">{curso.titulo}</h3>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(curso.status)}`}>
                        {getStatusText(curso.status)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${getNivelColor(curso.nivel)}`}>
                        {curso.nivel}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{curso.descricao}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-white font-semibold">{curso.duracao}h</p>
                      <p className="text-slate-400 text-xs">Duração</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold">{curso.modulos}</p>
                      <p className="text-slate-400 text-xs">Módulos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold">{curso.alunos}</p>
                      <p className="text-slate-400 text-xs">Alunos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold flex items-center justify-center">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" />
                        {curso.avaliacao}
                      </p>
                      <p className="text-slate-400 text-xs">Avaliação</p>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="text-slate-400 text-sm">
                      <p>Criado em: {new Date(curso.dataCriacao).toLocaleDateString('pt-BR')}</p>
                      <p>Última atualização: {new Date(curso.ultimaAtualizacao).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <button className="flex items-center space-x-1 px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-md transition-colors text-sm">
                        <Eye className="w-3 h-3" />
                        <span>Ver</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-md transition-colors text-sm">
                        <Edit className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-md transition-colors text-sm">
                        <Play className="w-3 h-3" />
                        <span>Publicar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'modulos' && (
        <div className="space-y-4">
          {modulos.map((modulo) => (
            <div key={modulo.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-slate-700">
                    {getTipoIcon(modulo.tipo)}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{modulo.titulo}</h4>
                    <p className="text-slate-400 text-sm">{modulo.descricao}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-white font-semibold">{modulo.duracao}min</p>
                    <p className="text-slate-400 text-xs">Duração</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-blue-400 hover:text-blue-300 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-green-400 hover:text-green-300 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-red-400 hover:text-red-300 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Métricas dos Cursos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Total de Cursos</h3>
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-white">{cursos.length}</p>
              <p className="text-green-400 text-sm">+2 este mês</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Total de Alunos</h3>
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">{cursos.reduce((acc, curso) => acc + curso.alunos, 0)}</p>
              <p className="text-green-400 text-sm">+15 este mês</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Avaliação Média</h3>
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                {(cursos.reduce((acc, curso) => acc + curso.avaliacao, 0) / cursos.length).toFixed(1)}
              </p>
              <p className="text-green-400 text-sm">Excelente</p>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold">Receita Total</h3>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-white">
                R$ {cursos.reduce((acc, curso) => acc + (curso.preco * curso.alunos), 0).toLocaleString()}
              </p>
              <p className="text-green-400 text-sm">+8% este mês</p>
            </div>
          </div>

          {/* Performance dos Cursos */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-white font-semibold mb-4">Performance dos Cursos</h3>
            <div className="space-y-3">
              {cursos.map((curso) => (
                <div key={curso.id} className="flex items-center justify-between">
                  <span className="text-slate-300">{curso.titulo}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(curso.alunos / Math.max(...cursos.map(c => c.alunos))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold">{curso.alunos} alunos</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GestaoCursos
