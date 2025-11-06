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
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

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
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'cursos' | 'modulos' | 'analytics'>('cursos')
  const [cursos, setCursos] = useState<Curso[]>([])
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [selectedCurso, setSelectedCurso] = useState<Curso | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Buscar cursos do Supabase
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (coursesError) {
        console.error('Erro ao carregar cursos:', coursesError)
        throw coursesError
      }

      // Buscar módulos do Supabase
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .order('order_index', { ascending: true })

      if (modulesError) {
        console.error('Erro ao carregar módulos:', modulesError)
        throw modulesError
      }

      // Buscar inscrições para calcular número de alunos por curso
      const { data: enrollmentsData } = await supabase
        .from('course_enrollments')
        .select('course_id')

      // Contar alunos por curso
      const alunosPorCurso: { [key: string]: number } = {}
      enrollmentsData?.forEach((enrollment: any) => {
        alunosPorCurso[enrollment.course_id] = (alunosPorCurso[enrollment.course_id] || 0) + 1
      })

      // Transformar cursos do Supabase para o formato esperado
      const formattedCursos: Curso[] = (coursesData || []).map((course: any) => {
        const modulosDoCurso = (modulesData || []).filter((m: any) => m.course_id === course.id)
        return {
          id: course.id,
          titulo: course.title,
          descricao: course.description || '',
          duracao: course.duration || 0,
          modulos: modulosDoCurso.length,
          alunos: alunosPorCurso[course.id] || 0,
          avaliacao: 0, // TODO: Calcular a partir de avaliações reais
          status: course.is_published ? 'ativo' : 'rascunho' as 'ativo' | 'rascunho' | 'arquivado',
          thumbnail: '', // TODO: Adicionar campo thumbnail no Supabase
          categoria: course.category || '',
          nivel: course.difficulty || 'iniciante' as 'iniciante' | 'intermediario' | 'avancado',
          preco: 0, // TODO: Adicionar campo preco no Supabase
          dataCriacao: new Date(course.created_at).toISOString().split('T')[0],
          ultimaAtualizacao: course.updated_at ? new Date(course.updated_at).toISOString().split('T')[0] : new Date(course.created_at).toISOString().split('T')[0]
        }
      })

      // Transformar módulos do Supabase para o formato esperado
      const formattedModulos: Modulo[] = (modulesData || []).map((module: any) => ({
        id: module.id,
        cursoId: module.course_id,
        titulo: module.title,
        descricao: module.description || '',
        ordem: module.order_index,
        duracao: module.duration || 0,
        tipo: (module.content_type || 'video') as 'video' | 'texto' | 'quiz' | 'atividade',
        conteudo: module.content_url || module.content || '',
        recursos: [] // TODO: Adicionar campo recursos no Supabase
      }))

      setCursos(formattedCursos)
      setModulos(formattedModulos)
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
