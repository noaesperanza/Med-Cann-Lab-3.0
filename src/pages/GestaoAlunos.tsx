import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import {
  ArrowLeft,
  Users,
  GraduationCap,
  BookOpen,
  Search,
  CheckCircle,
  Clock,
  TrendingUp,
  User,
  Mail,
  Phone,
  Eye,
  MessageCircle,
  Award,
  Target,
  Activity,
  Calendar
} from 'lucide-react'

interface Student {
  id: string
  name: string
  email: string
  phone?: string
  course: 'arte-entrevista' | 'cannabis-medicinal'
  courseName: string
  progress: number
  completedModules: number
  totalModules: number
  lastAccess: string
  status: 'active' | 'inactive' | 'completed'
  enrolledAt: string
  avatar?: string
}

const GestaoAlunos: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedCourse, setSelectedCourse] = useState<'all' | 'arte-entrevista' | 'cannabis-medicinal'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - será substituído por dados reais do Supabase
  const mockStudents: Student[] = [
    {
      id: '1',
      name: 'Ana Costa',
      email: 'ana.costa@example.com',
      phone: '(21) 99999-9999',
      course: 'cannabis-medicinal',
      courseName: 'Pós-Graduação Cannabis Medicinal',
      progress: 75,
      completedModules: 6,
      totalModules: 8,
      lastAccess: '2025-01-15',
      status: 'active',
      enrolledAt: '2024-03-01'
    },
    {
      id: '2',
      name: 'Carlos Lima',
      email: 'carlos.lima@example.com',
      phone: '(11) 98888-8888',
      course: 'arte-entrevista',
      courseName: 'Arte da Entrevista Clínica',
      progress: 90,
      completedModules: 4,
      totalModules: 5,
      lastAccess: '2025-01-14',
      status: 'active',
      enrolledAt: '2024-02-15'
    },
    {
      id: '3',
      name: 'Maria Santos',
      email: 'maria.santos@example.com',
      phone: '(11) 97777-7777',
      course: 'cannabis-medicinal',
      courseName: 'Pós-Graduação Cannabis Medicinal',
      progress: 45,
      completedModules: 3,
      totalModules: 8,
      lastAccess: '2025-01-10',
      status: 'active',
      enrolledAt: '2024-05-10'
    },
    {
      id: '4',
      name: 'João Silva',
      email: 'joao.silva@example.com',
      phone: '(21) 96666-6666',
      course: 'arte-entrevista',
      courseName: 'Arte da Entrevista Clínica',
      progress: 100,
      completedModules: 5,
      totalModules: 5,
      lastAccess: '2025-01-12',
      status: 'completed',
      enrolledAt: '2023-12-01'
    },
    {
      id: '5',
      name: 'Fernanda Oliveira',
      email: 'fernanda.oliveira@example.com',
      phone: '(11) 95555-5555',
      course: 'cannabis-medicinal',
      courseName: 'Pós-Graduação Cannabis Medicinal',
      progress: 25,
      completedModules: 2,
      totalModules: 8,
      lastAccess: '2024-12-20',
      status: 'inactive',
      enrolledAt: '2024-08-01'
    },
    {
      id: '6',
      name: 'Roberto Alves',
      email: 'roberto.alves@example.com',
      phone: '(21) 94444-4444',
      course: 'arte-entrevista',
      courseName: 'Arte da Entrevista Clínica',
      progress: 60,
      completedModules: 3,
      totalModules: 5,
      lastAccess: '2025-01-13',
      status: 'active',
      enrolledAt: '2024-04-15'
    }
  ]

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      // TODO: Carregar alunos reais do Supabase
      // Por enquanto usando dados mockados
      setStudents(mockStudents)
    } catch (error) {
      console.error('Erro ao carregar alunos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'completed': return 'bg-blue-500'
      case 'inactive': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'completed': return 'Concluído'
      case 'inactive': return 'Inativo'
      default: return 'Desconhecido'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-blue-500'
    if (progress >= 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const filteredStudents = students.filter(student => {
    const matchesCourse = selectedCourse === 'all' || student.course === selectedCourse
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCourse && matchesSearch
  })

  const studentsByCourse = {
    'arte-entrevista': students.filter(s => s.course === 'arte-entrevista'),
    'cannabis-medicinal': students.filter(s => s.course === 'cannabis-medicinal')
  }

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    completed: students.filter(s => s.status === 'completed').length,
    inactive: students.filter(s => s.status === 'inactive').length,
    arteEntrevista: studentsByCourse['arte-entrevista'].length,
    cannabisMedicinal: studentsByCourse['cannabis-medicinal'].length,
    avgProgress: students.length > 0 
      ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)
      : 0
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/app/ensino/profissional/dashboard')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">👥 Gestão de Alunos</h1>
              <p className="text-slate-400">Acompanhe o desenvolvimento dos alunos por curso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.total}</h3>
              <p className="text-sm text-slate-400">Total de Alunos</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.active}</h3>
              <p className="text-sm text-slate-400">Alunos Ativos</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Award className="w-6 h-6 text-blue-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.completed}</h3>
              <p className="text-sm text-slate-400">Concluídos</p>
            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.avgProgress}%</h3>
              <p className="text-sm text-slate-400">Progresso Médio</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-800 rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Course Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-2">Filtrar por Curso</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCourse('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCourse === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setSelectedCourse('arte-entrevista')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCourse === 'arte-entrevista'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Arte da Entrevista Clínica
                  </button>
                  <button
                    onClick={() => setSelectedCourse('cannabis-medicinal')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCourse === 'cannabis-medicinal'
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Cannabis Medicinal
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-2">Buscar Aluno</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nome ou email..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="bg-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {selectedCourse === 'all' 
                  ? 'Todos os Alunos' 
                  : selectedCourse === 'arte-entrevista'
                  ? 'Alunos - Arte da Entrevista Clínica'
                  : 'Alunos - Pós-Graduação Cannabis Medicinal'
                }
              </h2>
              <span className="text-sm text-slate-400">{filteredStudents.length} aluno(s)</span>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Carregando alunos...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">Nenhum aluno encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredStudents.map((student) => (
                  <div key={student.id} className="bg-slate-700 rounded-lg p-6 hover:bg-slate-650 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Avatar */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          student.course === 'arte-entrevista' 
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                            : 'bg-gradient-to-r from-green-500 to-teal-500'
                        }`}>
                          {student.avatar || student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>

                        {/* Student Info */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{student.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)} text-white`}>
                              {getStatusText(student.status)}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-slate-400 mb-3">
                            <div className="flex items-center space-x-1">
                              <Mail className="w-4 h-4" />
                              <span>{student.email}</span>
                            </div>
                            {student.phone && (
                              <div className="flex items-center space-x-1">
                                <Phone className="w-4 h-4" />
                                <span>{student.phone}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-slate-300">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="w-4 h-4" />
                              <span>{student.courseName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>Último acesso: {new Date(student.lastAccess).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>Inscrito em: {new Date(student.enrolledAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors" title="Ver detalhes">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors" title="Contatar">
                          <MessageCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-300">Progresso no Curso</span>
                          <span className="text-white font-medium">{student.progress}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-slate-300">
                            {student.completedModules}/{student.totalModules} módulos concluídos
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(student.progress)}`}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GestaoAlunos

