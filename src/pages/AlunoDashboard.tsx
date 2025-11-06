import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  GraduationCap, 
  BookOpen, 
  Heart, 
  Brain, 
  MessageCircle, 
  Calendar,
  TrendingUp,
  Clock,
  User,
  Star,
  CheckCircle,
  AlertCircle,
  Play,
  Download,
  Share2,
  Target,
  Award,
  BarChart3,
  Activity,
  Video,
  Stethoscope,
  Zap,
  FileText,
  Plus,
  Upload,
  Edit,
  Trash2,
  Link as ExternalLink,
  Menu as LayoutDashboard,
  Users
} from 'lucide-react'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'
import NoaConversationalInterface from '../components/NoaConversationalInterface'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import SlidePlayer from '../components/SlidePlayer'

const AlunoDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { openChat, sendInitialMessage } = useNoaPlatform()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'redes-sociais' | 'noticias' | 'simulacoes' | 'teste' | 'ferramentas'>('dashboard')
  const [isSlidePlayerOpen, setIsSlidePlayerOpen] = useState(false)
  const [selectedSlideId, setSelectedSlideId] = useState<string | undefined>(undefined)
  const [mainCourse, setMainCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Carregar cursos do Supabase
  useEffect(() => {
    if (user) {
      loadCourses()
    }
  }, [user])

  const loadCourses = async () => {
    if (!user) return

    try {
      // Buscar cursos em que o aluno está inscrito
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses(*)
        `)
        .eq('user_id', user.id)

      if (enrollmentsError) {
        console.error('Erro ao carregar cursos:', enrollmentsError)
        return
      }

      // Buscar módulos dos cursos
      if (enrollments && enrollments.length > 0) {
        const courseIds = enrollments.map((e: any) => e.course_id)
        const { data: modules } = await supabase
          .from('course_modules')
          .select('*')
          .in('course_id', courseIds)
          .order('order_index', { ascending: true })

        // Transformar para o formato esperado
        const firstEnrollment = enrollments[0]
        const course = firstEnrollment.course
        const courseModules = (modules || []).filter((m: any) => m.course_id === course.id)

        setMainCourse({
          id: course.id,
          title: course.title,
          subtitle: 'Curso Online - Plataforma Nôa Esperança',
          description: course.description || '',
          progress: firstEnrollment.progress || 0,
          status: firstEnrollment.status === 'completed' ? 'Concluído' : 'Em Andamento',
          instructor: 'Equipe Nôa Esperança',
          duration: `${course.duration || 0} horas`,
          nextClass: null,
          color: 'from-green-500 to-teal-500',
          logo: '🎯',
          modules: courseModules.map((m: any) => ({
            id: m.id,
            title: m.title,
            description: m.description || '',
            progress: 0, // TODO: Calcular progresso por módulo
            status: 'Disponível',
            duration: `${m.duration || 0} minutos`,
            lessons: [] // TODO: Adicionar lições
          }))
        })
      } else {
        // Se não houver cursos, usar curso padrão (hardcoded como fallback)
        setMainCourse({
          id: 'default',
          title: 'A Arte da Entrevista Clínica',
          subtitle: 'Curso Online - Plataforma Nôa Esperança',
          description: 'Aprenda a metodologia Arte da Entrevista Clínica (AEC) aplicada à prática clínica moderna.',
          progress: 0,
          status: 'Em Andamento',
          instructor: 'Equipe Nôa Esperança',
          duration: '40 horas',
          nextClass: null,
          color: 'from-green-500 to-teal-500',
          logo: '🎯',
          modules: []
        })
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Andamento': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
      case 'Concluído': return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'Disponível': return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'Pendente': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-blue-500'
    return 'bg-yellow-500'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 animate-spin text-green-500" />
          <p className="text-slate-400">Carregando cursos...</p>
        </div>
      </div>
    )
  }

  if (!mainCourse) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <p className="text-slate-400">Nenhum curso encontrado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard do Aluno</h1>
              <p className="text-slate-400">Área de Ensino - {mainCourse.title}</p>
            </div>
          </div>
          
          {/* Student Profile */}
          <div className="flex items-center space-x-3 bg-slate-700 p-3 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white">Aluno</p>
              <p className="text-sm text-slate-400">Pós-Graduação</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' 
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('redes-sociais')}
                className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors ${
                  activeTab === 'redes-sociais' 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white' 
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                <Share2 className="w-5 h-5" />
                <span>Redes Sociais</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('noticias')}
                className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors ${
                  activeTab === 'noticias' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Notícias</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('simulacoes')}
                className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors ${
                  activeTab === 'simulacoes' 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                <Stethoscope className="w-5 h-5" />
                <span>Simulações</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('teste')}
                className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors ${
                  activeTab === 'teste' 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                <Activity className="w-5 h-5" />
                <span>Teste de Nivelamento</span>
              </button>
              
              <button 
                onClick={() => navigate('/app/ensino/aluno/biblioteca', { state: { userType: 'student' } })}
                className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors w-full text-left"
              >
                <BookOpen className="w-5 h-5" />
                <span>Biblioteca</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('ferramentas')}
                className={`flex items-center space-x-3 p-3 rounded-lg w-full text-left transition-colors ${
                  activeTab === 'ferramentas' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Ferramentas Pedagógicas</span>
              </button>
              
              <button 
                onClick={() => navigate('/app/chat')}
                className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors w-full text-left"
              >
                <Users className="w-5 h-5" />
                <span>Fórum de Conselheiros em IA</span>
              </button>
            </nav>

            {/* IA Residente Mentora */}
            <div className="mt-8 p-4 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-lg border border-green-500/30">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">Nôa Esperança</h4>
                  <p className="text-xs text-slate-300">Mentora Individualizada</p>
                </div>
              </div>
              <button
                onClick={() => {
                  openChat()
                  sendInitialMessage('Olá! Sou a Nôa Esperança, sua mentora individualizada. Como posso te ajudar hoje?')
                }}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:from-green-600 hover:to-teal-600 transition-colors text-sm flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Conversar com Nôa</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6 overflow-x-hidden w-full">
          <div className="max-w-6xl mx-auto w-full overflow-x-hidden">
            {/* Dashboard Principal */}
            {activeTab === 'dashboard' && (
              <>
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-600 to-teal-500 rounded-xl p-6 mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-4xl">
                    🎯
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-1">{mainCourse.title}</h2>
                    <p className="text-white/90 text-sm">{mainCourse.subtitle}</p>
                  </div>
                </div>
                <p className="text-white/90 mb-4 text-lg">
                  {mainCourse.description}
                </p>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => {
                      console.log('Botão clicado, navegando para /app/study-area')
                      navigate('/app/study-area')
                    }}
                    className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
                  >
                    <Play className="w-5 h-5" />
                    <span>Continuar Aprendizado</span>
                  </button>
                  <div className="flex items-center space-x-4 text-white/80 text-sm">
                    <span>⏱️ {mainCourse.duration}</span>
                    <span>👨‍🏫 {mainCourse.instructor}</span>
                    <span>📚 {mainCourse.modules.length} Módulos</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Player Section */}
            <div className="bg-slate-800 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Aulas em Vídeo</h3>
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="aspect-video bg-slate-700 rounded-lg overflow-hidden">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/AGC3ZtGSPlY?si=V6fSuQYLxJRBvD-u&autoplay=0&rel=0&modestbranding=1"
                    title="Aulas de Cannabis Medicinal"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="rounded-lg"
                  ></iframe>
                </div>
                <div className="mt-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Pós-Graduação em Cannabis Medicinal</h4>
                  <p className="text-slate-400 text-sm mb-3">
                    Acesse nossa playlist completa de aulas sobre Cannabis Medicinal e Arte da Entrevista Clínica.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-slate-500">
                    <span>📚 Playlist Completa</span>
                    <span>🎓 Certificação Inclusa</span>
                    <span>📱 Acesso Mobile</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 w-full overflow-x-hidden">
              {/* Courses Section */}
              <div className="w-full overflow-x-hidden">
                <div className="bg-slate-800 rounded-xl p-4 md:p-6 overflow-hidden w-full max-w-full">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Meu Curso Principal</h3>
                    <button className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-colors">
                      Ver Detalhes
                    </button>
                  </div>

                  {/* Curso Principal */}
                  <div className="bg-slate-700 rounded-lg p-4 md:p-6 mb-6 hover:bg-slate-650 transition-colors overflow-hidden w-full max-w-full">
                    <div className="flex items-start justify-between mb-4 gap-2 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                          <h4 className="text-lg font-semibold text-white break-words flex-1 min-w-0">{mainCourse.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(mainCourse.status)}`}>
                            {mainCourse.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-3 break-words">{mainCourse.description}</p>
                        
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 mb-4">
                          <span className="whitespace-nowrap">Instrutor: {mainCourse.instructor}</span>
                          <span className="whitespace-nowrap">Duração: {mainCourse.duration}</span>
                          <span className="whitespace-nowrap">Próxima aula: {mainCourse.nextClass || 'N/A'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                          <Play className="w-4 h-4" />
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
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-slate-400">Progresso Geral</span>
                        <span className="text-white font-medium">{mainCourse.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(mainCourse.progress)}`}
                          style={{ width: `${mainCourse.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Módulos do Curso */}
                  <div className="space-y-4 w-full overflow-x-hidden">
                    <h4 className="text-lg font-semibold text-white mb-4 break-words">Módulos do Curso</h4>
                    {mainCourse.modules.map((module: any, moduleIndex: number) => (
                      <div key={module.id} className="bg-slate-700 rounded-lg p-4 md:p-5 hover:bg-slate-650 transition-colors border border-slate-600 overflow-hidden w-full max-w-full">
                        <div className="flex items-start justify-between mb-4 gap-2 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {moduleIndex + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-md font-semibold text-white break-words">{module.title}</h5>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(module.status)}`}>
                                  {module.status}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-3 ml-0 md:ml-11 break-words">{module.description}</p>
                            
                            {/* Aulas do Módulo */}
                            {module.lessons && module.lessons.length > 0 && (
                              <div className="ml-0 md:ml-11 space-y-2 w-full overflow-x-hidden">
                                <p className="text-xs text-slate-500 font-medium mb-2 break-words">Aulas deste módulo:</p>
                                <div className="grid grid-cols-1 gap-2 w-full overflow-x-hidden">
                                  {module.lessons && module.lessons.map((lesson: any, lessonIndex: number) => (
                                    <div key={lessonIndex} className="flex items-center space-x-2 text-sm text-slate-300 bg-slate-800 rounded-lg p-2 hover:bg-slate-750 transition-colors overflow-hidden w-full max-w-full">
                                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0"></div>
                                      <span className="flex-1 break-words min-w-0">{lesson}</span>
                                      <button className="p-1 hover:bg-slate-700 rounded transition-colors flex-shrink-0">
                                        <Play className="w-3 h-3 text-green-400" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 mt-3 ml-0 md:ml-11">
                              <span className="whitespace-nowrap">⏱️ Duração: {module.duration}</span>
                              {module.lessons && <span className="whitespace-nowrap">📚 {module.lessons.length} aulas</span>}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button 
                              onClick={() => {
                                navigate('/app/study-area', { state: { moduleId: module.id } })
                              }}
                              className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg hover:from-green-600 hover:to-teal-600 transition-colors text-white"
                              title="Iniciar Módulo"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-2 ml-11">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-400">Progresso do Módulo</span>
                            <span className="text-white font-medium">{module.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-600 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${getProgressColor(module.progress)}`}
                              style={{ width: `${module.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Classes */}
                <div className="bg-slate-800 rounded-xl p-6 mt-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Próximas Aulas</h3>
                  
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                    <p className="text-slate-400">Nenhuma aula agendada no momento</p>
                    <p className="text-sm text-slate-500 mt-2">As próximas aulas serão anunciadas em breve</p>
                  </div>
                </div>
              </div>

            </div>
              </>
            )}

            {/* Redes Sociais */}
            {activeTab === 'redes-sociais' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl p-6 mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">📱 Ferramentas de Redes Sociais</h2>
                  <p className="text-white/90">
                    Conteúdo educativo formatado para TikTok e Instagram. Aprenda e compartilhe conhecimento de forma moderna.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* TikTok */}
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-pink-500/50 transition-all">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Video className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">TikTok</h3>
                        <p className="text-sm text-slate-400">Conteúdo em formato vertical</p>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-4">
                      Vídeos curtos e envolventes sobre Cannabis Medicinal, Arte da Entrevista Clínica e casos clínicos.
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Vídeos educativos de 15-60 segundos</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Casos clínicos resumidos</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Dicas rápidas de entrevista clínica</span>
                      </div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-colors flex items-center justify-center space-x-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>Acessar Conteúdo TikTok</span>
                    </button>
                  </div>

                  {/* Instagram */}
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Share2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Instagram</h3>
                        <p className="text-sm text-slate-400">Posts e stories educativos</p>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-4">
                      Carrosséis, reels e posts informativos sobre Cannabis Medicinal e metodologia AEC.
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Carrosséis educativos</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Reels informativos</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Stories com quizzes</span>
                      </div>
                    </div>
                    <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center justify-center space-x-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>Acessar Conteúdo Instagram</span>
                    </button>
                  </div>
                </div>

                {/* Dicas de Uso */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-xl font-semibold text-white mb-4">💡 Dicas de Uso</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-700 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">📊 Compartilhe seu Progresso</h4>
                      <p className="text-sm text-slate-300">
                        Compartilhe suas conquistas e aprendizados nas redes sociais usando as hashtags oficiais.
                      </p>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">🎯 Engajamento</h4>
                      <p className="text-sm text-slate-300">
                        Interaja com outros alunos e profissionais através das redes sociais da plataforma.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notícias */}
            {activeTab === 'noticias' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">📰 Notícias e Atualizações</h2>
                  <p className="text-white/90">
                    Fique por dentro das últimas notícias sobre Cannabis Medicinal, pesquisa clínica e metodologia AEC.
                  </p>
                </div>

                {/* Filtros de Notícias */}
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg text-sm font-medium">
                      Todas
                    </button>
                    <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600">
                      Cannabis Medicinal
                    </button>
                    <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600">
                      Pesquisa Clínica
                    </button>
                    <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600">
                      Metodologia AEC
                    </button>
                    <button className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-600">
                      Regulamentação
                    </button>
                  </div>
                </div>

                {/* Lista de Notícias */}
                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      title: 'Novos estudos sobre eficácia da Cannabis Medicinal em pacientes renais',
                      summary: 'Pesquisa recente demonstra resultados promissores no tratamento de pacientes com doença renal crônica.',
                      category: 'Pesquisa Clínica',
                      date: '2025-01-10',
                      image: 'https://via.placeholder.com/400x200'
                    },
                    {
                      id: 2,
                      title: 'Metodologia AEC ganha reconhecimento internacional',
                      summary: 'Arte da Entrevista Clínica é destaque em congresso internacional de medicina integrativa.',
                      category: 'Metodologia AEC',
                      date: '2025-01-08',
                      image: 'https://via.placeholder.com/400x200'
                    },
                    {
                      id: 3,
                      title: 'Atualizações na regulamentação de Cannabis Medicinal no Brasil',
                      summary: 'Anvisa publica novas diretrizes para prescrição e monitoramento de pacientes.',
                      category: 'Regulamentação',
                      date: '2025-01-05',
                      image: 'https://via.placeholder.com/400x200'
                    }
                  ].map((news) => (
                    <div key={news.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/50 transition-all cursor-pointer">
                      <div className="flex items-start space-x-4">
                        <div className="w-32 h-24 bg-slate-700 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                              {news.category}
                            </span>
                            <span className="text-xs text-slate-400">{news.date}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">{news.title}</h3>
                          <p className="text-sm text-slate-300 mb-3">{news.summary}</p>
                          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center space-x-1">
                            <span>Ler mais</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Simulações de Pacientes */}
            {activeTab === 'simulacoes' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">🩺 Simulações de Pacientes</h2>
                  <p className="text-white/90">
                    Pratique entrevistas clínicas com pacientes simulados pela IA residente Nôa Esperança. 
                    Desenvolva suas habilidades de comunicação e avaliação clínica usando a metodologia Arte da Entrevista Clínica.
                  </p>
                </div>

                {/* Seleção de Sistema */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Simulação de Paciente com IA Residente</h3>
                      <p className="text-slate-400">Selecione um sistema para iniciar a simulação</p>
                    </div>
                  </div>
                  
                  <p className="text-slate-300 mb-6">
                    A Nôa Esperança irá simular um paciente com alguma questão no sistema selecionado. 
                    Você fará a entrevista clínica e, ao final, receberá uma avaliação da sua performance 
                    de acordo com os critérios da Arte da Entrevista Clínica.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Selecione o Sistema para Simulação:
                      </label>
                      <select
                        id="sistema-simulacao"
                        className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        defaultValue=""
                      >
                        <option value="" disabled>Selecione um sistema...</option>
                        <option value="respiratorio">🫁 Sistema Respiratório</option>
                        <option value="urinario">💧 Sistema Urinário</option>
                        <option value="cardiovascular">❤️ Sistema Cardiovascular</option>
                        <option value="digestivo">🍽️ Sistema Digestivo</option>
                        <option value="nervoso">🧠 Sistema Nervoso</option>
                        <option value="endocrino">⚖️ Sistema Endócrino</option>
                        <option value="musculoesqueletico">💪 Sistema Músculo-Esquelético</option>
                        <option value="tegumentar">🦠 Sistema Tegumentar (Pele)</option>
                        <option value="reprodutor">👤 Sistema Reprodutor</option>
                        <option value="imunologico">🛡️ Sistema Imunológico</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Selecione o Tipo de Simulação:
                      </label>
                      <select
                        id="tipo-simulacao"
                        className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        defaultValue=""
                      >
                        <option value="" disabled>Selecione um tipo de simulação...</option>
                        <option value="entrevista-geral">🩺 Entrevista Clínica Geral</option>
                        <option value="fatores-renais">🫘 Identificação de Fatores (Tradicionais e Não Tradicionais) - Doença Renal Crônica</option>
                        <option value="diagnostico-tea">🧩 Diagnóstico do Transtorno do Espectro Autista (TEA)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        const selectSistema = document.getElementById('sistema-simulacao') as HTMLSelectElement
                        const selectTipo = document.getElementById('tipo-simulacao') as HTMLSelectElement
                        const sistemaSelecionado = selectSistema?.value
                        const tipoSelecionado = selectTipo?.value
                        
                        if (!sistemaSelecionado) {
                          alert('Por favor, selecione um sistema para iniciar a simulação.')
                          return
                        }

                        if (!tipoSelecionado) {
                          alert('Por favor, selecione um tipo de simulação.')
                          return
                        }

                        const sistemas: Record<string, string> = {
                          'respiratorio': 'Sistema Respiratório',
                          'urinario': 'Sistema Urinário',
                          'cardiovascular': 'Sistema Cardiovascular',
                          'digestivo': 'Sistema Digestivo',
                          'nervoso': 'Sistema Nervoso',
                          'endocrino': 'Sistema Endócrino',
                          'musculoesqueletico': 'Sistema Músculo-Esquelético',
                          'tegumentar': 'Sistema Tegumentar (Pele)',
                          'reprodutor': 'Sistema Reprodutor',
                          'imunologico': 'Sistema Imunológico'
                        }

                        const tipos: Record<string, string> = {
                          'entrevista-geral': 'Entrevista Clínica Geral',
                          'fatores-renais': 'Identificação de Fatores Tradicionais e Não Tradicionais para Doença Renal Crônica',
                          'diagnostico-tea': 'Diagnóstico do Transtorno do Espectro Autista (TEA)'
                        }

                        const nomeSistema = sistemas[sistemaSelecionado] || sistemaSelecionado
                        const nomeTipo = tipos[tipoSelecionado] || tipoSelecionado
                        
                        let mensagemInicial = ''
                        
                        if (tipoSelecionado === 'fatores-renais') {
                          mensagemInicial = 
                            `Vou iniciar uma simulação focada em ${nomeTipo}. ` +
                            `Você será o profissional de saúde e eu serei o paciente. ` +
                            `Durante a entrevista clínica, você deve identificar fatores tradicionais (como pressão arterial, diabetes, função renal, exames laboratoriais) ` +
                            `e fatores não tradicionais (como estresse, sono, nutrição, atividade física, bem-estar mental) relacionados à doença renal crônica. ` +
                            `Use a metodologia Arte da Entrevista Clínica para conduzir a entrevista. ` +
                            `Ao final, vou avaliar sua performance de acordo com os critérios da AEC, especialmente sua capacidade de identificar e explorar ambos os tipos de fatores. ` +
                            `Vamos começar?`
                        } else if (tipoSelecionado === 'diagnostico-tea') {
                          mensagemInicial = 
                            `Vou iniciar uma simulação focada em ${nomeTipo}. ` +
                            `Você será o profissional de saúde e eu serei o paciente (ou responsável, dependendo do caso). ` +
                            `Durante a entrevista clínica, você deve aplicar técnicas da metodologia Arte da Entrevista Clínica para identificar sinais e sintomas relacionados ao TEA. ` +
                            `Use abordagem empática e observação cuidadosa dos comportamentos, comunicação e interação social. ` +
                            `Ao final, vou avaliar sua performance de acordo com os critérios da AEC, especialmente sua capacidade de conduzir uma entrevista sensível e completa para diagnóstico de TEA. ` +
                            `Vamos começar?`
                        } else {
                          mensagemInicial = 
                            `Vou iniciar uma simulação de paciente com questão no ${nomeSistema}. ` +
                            `Você será o profissional de saúde e eu serei o paciente. ` +
                            `Faça a entrevista clínica usando a metodologia Arte da Entrevista Clínica. ` +
                            `Ao final da entrevista, vou avaliar sua performance de acordo com os critérios da AEC. ` +
                            `Vamos começar?`
                        }
                        
                        openChat()
                        sendInitialMessage(mensagemInicial)
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-teal-600 transition-colors flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Stethoscope className="w-6 h-6" />
                      <span>Iniciar Simulação de Paciente</span>
                    </button>
                  </div>

                  <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <h4 className="font-semibold text-white mb-2 flex items-center space-x-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span>Como Funciona:</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
                      <li>Selecione o sistema e o tipo de simulação que deseja praticar</li>
                      <li>A IA residente Nôa Esperança simulará um paciente conforme sua seleção</li>
                      <li>Você fará a entrevista clínica como profissional de saúde</li>
                      <li>A IA responderá como o paciente, seguindo o perfil clínico definido</li>
                      <li>Use as técnicas da metodologia Arte da Entrevista Clínica durante a entrevista</li>
                      <li>Ao final, você receberá uma avaliação detalhada da sua performance</li>
                      <li>A avaliação seguirá os critérios da metodologia Arte da Entrevista Clínica</li>
                      <li>Tipos disponíveis: Entrevista Geral, Fatores Renais (Tradicionais e Não Tradicionais), Diagnóstico de TEA</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Ferramentas Pedagógicas */}
            {activeTab === 'ferramentas' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">📝 Ferramentas Pedagógicas</h2>
                  <p className="text-white/90">
                    Produza relatos de caso, crie aulas a partir de casos clínicos reais, e trabalhe com a IA residente 
                    na produção e análise de slides. Envie suas aulas em PowerPoint e a IA trabalhará com você na edição e publicação.
                  </p>
                </div>

                {/* Cards de Ferramentas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Casos Clínicos</h3>
                        <p className="text-sm text-slate-400">2 disponíveis</p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm mb-4">
                      Acesse casos clínicos reais para criar relatos e aulas.
                    </p>
                    <button
                      onClick={() => {
                        openChat()
                        sendInitialMessage('Vou ajudá-lo a trabalhar com casos clínicos. Você pode criar relatos de caso ou aulas a partir deles. Como posso ajudar?')
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-colors"
                    >
                      Acessar Casos
                    </button>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-green-500/50 transition-all">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Minhas Aulas</h3>
                        <p className="text-sm text-slate-400">0 criadas</p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm mb-4">
                      Gerencie suas aulas criadas a partir de casos clínicos.
                    </p>
                    <button
                      onClick={() => {
                        openChat()
                        sendInitialMessage('Vou ajudá-lo a criar uma nova aula. Podemos começar a partir de um caso clínico ou você pode criar do zero. Como prefere?')
                      }}
                      className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-colors"
                    >
                      Criar Nova Aula
                    </button>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-orange-500/50 transition-all">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Preparação de Slides</h3>
                        <p className="text-sm text-slate-400">Visualizar slides</p>
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm mb-4">
                      Crie e edite slides com a ajuda da IA residente. Visualize seus slides em modo de apresentação.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsSlidePlayerOpen(true)
                          setSelectedSlideId(undefined)
                        }}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>Visualizar Slides</span>
                      </button>
                      <button
                        onClick={() => {
                          openChat()
                          sendInitialMessage('Vou ajudá-lo a criar e editar slides. Você pode enviar um PowerPoint para eu analisar e editar, ou podemos criar slides do zero. Como prefere começar?')
                        }}
                        className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-600 transition-colors"
                      >
                        Criar/Editar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Seção de Preparação de Slides com Upload e Player */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Preparação de Slides</h3>
                      <p className="text-slate-400 text-sm">
                        Envie um PowerPoint ou crie slides do zero. A IA residente trabalhará com você na produção e análise.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setIsSlidePlayerOpen(true)
                          setSelectedSlideId(undefined)
                        }}
                        className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg font-bold hover:from-green-600 hover:to-teal-600 transition-colors flex items-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        Visualizar Slides
                      </button>
                      <button
                        onClick={() => {
                          const fileInput = document.createElement('input')
                          fileInput.type = 'file'
                          fileInput.accept = '.pptx,.ppt'
                          fileInput.onchange = async (e: any) => {
                            const file = e.target.files[0]
                            if (file) {
                              openChat()
                              sendInitialMessage(
                                `Recebi seu arquivo PowerPoint: ${file.name}. ` +
                                `Vou analisar o conteúdo e trabalhar com você para melhorar, editar e preparar os slides para publicação. ` +
                                `Vamos começar a análise?`
                              )
                            }
                          }
                          fileInput.click()
                        }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center gap-2"
                      >
                        <Upload className="w-5 h-5" />
                        Enviar PowerPoint
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-700/50 rounded-lg p-8 border-2 border-dashed border-slate-600 text-center">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                    <h4 className="text-lg font-semibold text-white mb-2">Visualize seus slides criados pela IA</h4>
                    <p className="text-slate-400 mb-6">
                      Clique em "Visualizar Slides" para ver seus slides em modo de apresentação ou crie novos slides com a IA
                    </p>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => {
                          setIsSlidePlayerOpen(true)
                          setSelectedSlideId(undefined)
                        }}
                        className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-teal-600 transition-colors flex items-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        Abrir Player de Slides
                      </button>
                      <button
                        onClick={() => {
                          openChat()
                          sendInitialMessage('Vamos criar seu primeiro slide! Me diga o tema ou assunto que você quer abordar e eu vou ajudá-lo a criar slides profissionais e bem estruturados.')
                        }}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Criar Novo Slide
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <h4 className="font-semibold text-white mb-2 flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <span>Como a IA Residente Ajuda:</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-300 list-disc list-inside">
                      <li>Análise de PowerPoints enviados e sugestões de melhorias</li>
                      <li>Criação de slides profissionais a partir de temas ou casos clínicos</li>
                      <li>Edição e refinamento de conteúdo existente</li>
                      <li>Preparação para publicação nos locais pertinentes da plataforma</li>
                      <li>Integração com casos clínicos e materiais do curso</li>
                      <li>Geração de quizzes e materiais complementares</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Teste de Nivelamento */}
            {activeTab === 'teste' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">📝 Teste de Nivelamento</h2>
                  <p className="text-white/90">
                    Avalie seus conhecimentos sobre Arte da Entrevista Clínica e descubra o melhor ponto de partida no curso.
                  </p>
                </div>

                {/* Informações do Teste */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Sobre o Teste de Nivelamento</h3>
                  <div className="space-y-3 text-slate-300">
                    <p>
                      O teste de nivelamento do curso <strong className="text-white">Arte da Entrevista Clínica</strong> ajuda a identificar:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Seu nível atual de conhecimento sobre entrevista clínica</li>
                      <li>Áreas que precisam de mais atenção</li>
                      <li>O melhor módulo para começar seus estudos</li>
                      <li>Conceitos que você já domina</li>
                    </ul>
                  </div>
                </div>

                {/* Estrutura do Teste */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Estrutura do Teste</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-5 h-5 text-blue-400" />
                        <h4 className="font-semibold text-white">20 Questões</h4>
                      </div>
                      <p className="text-sm text-slate-400">Questões de múltipla escolha</p>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-5 h-5 text-green-400" />
                        <h4 className="font-semibold text-white">30 Minutos</h4>
                      </div>
                      <p className="text-sm text-slate-400">Tempo estimado para conclusão</p>
                    </div>
                    <div className="bg-slate-700 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <h4 className="font-semibold text-white">Certificado</h4>
                      </div>
                      <p className="text-sm text-slate-400">Certificado de nivelamento</p>
                    </div>
                  </div>
                </div>

                {/* Botão de Iniciar Teste */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="text-center">
                    <Activity className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                    <h3 className="text-2xl font-bold text-white mb-2">Pronto para começar?</h3>
                    <p className="text-slate-300 mb-6">
                      O teste é adaptativo e se ajusta ao seu nível de conhecimento. 
                      Não há penalidades por respostas incorretas.
                    </p>
                    <button
                      onClick={() => {
                        openChat()
                        sendInitialMessage('Vou iniciar o teste de nivelamento do curso Arte da Entrevista Clínica. Você está pronto para começar?')
                      }}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-yellow-600 hover:to-orange-600 transition-colors flex items-center justify-center space-x-2 mx-auto"
                    >
                      <Zap className="w-5 h-5" />
                      <span>Iniciar Teste de Nivelamento</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interface Conversacional da Nôa Esperança - Fixa no canto */}
      <NoaConversationalInterface 
        userName={user?.name || 'Aluno'}
        userCode={user?.id || 'STUDENT-001'}
        position="bottom-right"
        hideButton={false}
      />

      {/* Slide Player */}
      <SlidePlayer
        isOpen={isSlidePlayerOpen}
        onClose={() => setIsSlidePlayerOpen(false)}
        initialSlideId={selectedSlideId}
      />
    </div>
  )
}

export default AlunoDashboard
