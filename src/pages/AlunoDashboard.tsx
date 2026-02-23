import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
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
  Menu as Layout,
  Database,
  Lightbulb,
  ArrowRight,
  Flag
} from 'lucide-react'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'
import { useDashboardTriggers } from '../contexts/DashboardTriggersContext'
import type { DashboardTriggerOption } from '../contexts/DashboardTriggersContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import NoaConversationalInterface from '../components/NoaConversationalInterface'
import SlidePlayer from '../components/SlidePlayer'

const FALLBACK_COURSE = {
  id: 'fallback-course-medcannlab',
  title: 'Pós-Graduação em Cannabis Medicinal',
  subtitle: 'Ambiente de Ensino, Clínica e Pesquisa - MedCannLab 3.0',
  description:
    'Programa completo com integração entre ensino, prática clínica supervisionada e pesquisa aplicada à cannabis medicinal.',
  progress: 45,
  status: 'Em Andamento',
  instructor: 'Equipe MedCannLab',
  duration: '60 horas',
  nextClass: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
  color: 'from-green-400 to-green-500',
  logo: '🌿',
  studentsCount: 32,
  modules: [
    {
      id: 'fallback-module-1',
      title: 'Fundamentos da Cannabis Medicinal',
      description: 'História, legislação, componentes químicos e mecanismos de ação.',
      progress: 60,
      status: 'Em Andamento',
      duration: '180 minutos',
      lessons: []
    },
    {
      id: 'fallback-module-2',
      title: 'Protocolos Clínicos Integrativos',
      description: 'Integração com metodologias AEC, IMRE e planos terapêuticos personalizados.',
      progress: 20,
      status: 'Disponível',
      duration: '240 minutos',
      lessons: []
    }
  ]
}

import {
  backgroundGradient,
  headerGradient,
  surfaceStyle,
  secondarySurfaceStyle,
  cardStyle,
  accentGradient,
  secondaryGradient,
  goldenGradient
} from '../constants/designSystem'
const dangerGradient = 'linear-gradient(135deg, #FF5F6D 0%, #FFC371 100%)'

const tabBaseButton =
  'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap'

const getTabButtonStyles = (active: boolean, gradient?: string) => {
  if (gradient) {
    return {
      className: `${tabBaseButton} text-white shadow-md`,
      style: { background: gradient, border: '1px solid rgba(0,0,0,0.05)' }
    }
  }

  return {
    className: `${tabBaseButton} ${active ? 'text-white shadow-lg' : 'text-[#C8D6E5]'}`,
    style: active
      ? { background: accentGradient, border: '1px solid rgba(0,193,106,0.35)' }
      : { background: 'rgba(12, 34, 54, 0.6)', border: '1px solid rgba(0,193,106,0.08)' }
  }
}

// Handler para efeito hover suave verde
const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean) => {
  if (!isActive) {
    e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
    e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
  }
}

const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>, isActive: boolean) => {
  if (!isActive) {
    e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
    e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
  }
}

const handleButtonTouch = (e: React.TouchEvent<HTMLButtonElement>, isActive: boolean) => {
  if (!isActive) {
    e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
    e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
    setTimeout(() => {
      e.currentTarget.style.background = 'rgba(12, 34, 54, 0.6)'
      e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
    }, 150)
  }
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(12,34,54,0.78)',
  border: '1px solid rgba(0,193,106,0.18)',
  color: '#E6F4FF',
  boxShadow: '0 10px 24px rgba(2,12,27,0.35)'
}

type StudentTab = 'dashboard' | 'redes-sociais' | 'noticias' | 'simulacoes' | 'teste' | 'biblioteca' | 'forum' | 'perfil'

const AlunoDashboard: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const { openChat, closeChat, isOpen: isNoaOpen, sendInitialMessage, hideGlobalChat, showGlobalChat } = useNoaPlatform()
  const { setDashboardTriggers } = useDashboardTriggers()

  // Gerenciar visibilidade do chat global
  useEffect(() => {
    hideGlobalChat()
    return () => showGlobalChat()
  }, [hideGlobalChat, showGlobalChat])
  const [activeTab, setActiveTab] = useState<StudentTab>('perfil')
  const [isSlidePlayerOpen, setIsSlidePlayerOpen] = useState(false)
  const [selectedSlideId, setSelectedSlideId] = useState<string | undefined>(undefined)
  const [mainCourse, setMainCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [studentStats, setStudentStats] = useState({
    totalModules: 0,
    completedModules: 0,
    totalLessons: 0,
    completedLessons: 0,
    totalTests: 0,
    completedTests: 0,
    forumPosts: 0,
    libraryAccess: 0,
    daysOnPlatform: 0
  })

  const navItems = useMemo<DashboardTriggerOption[]>(
    () => [
      { id: 'dashboard', label: 'Dashboard', icon: Layout as DashboardTriggerOption['icon'] },
      { id: 'redes-sociais', label: 'Redes Sociais', icon: Share2 as DashboardTriggerOption['icon'] },
      { id: 'noticias', label: 'Notícias', icon: FileText as DashboardTriggerOption['icon'] },
      { id: 'simulacoes', label: 'Simulações', icon: Stethoscope as DashboardTriggerOption['icon'] },
      { id: 'teste', label: 'Teste de Nivelamento', icon: Activity as DashboardTriggerOption['icon'] },
      { id: 'biblioteca', label: 'Biblioteca', icon: BookOpen as DashboardTriggerOption['icon'] },
      { id: 'forum', label: 'Fórum Cann Matrix', icon: MessageCircle as DashboardTriggerOption['icon'] },
      { id: 'perfil', label: 'Meu Perfil', icon: User as DashboardTriggerOption['icon'] }
    ],
    []
  )

  const validTabs = useMemo<StudentTab[]>(
    () => ['dashboard', 'redes-sociais', 'noticias', 'simulacoes', 'teste', 'biblioteca', 'forum', 'perfil'],
    []
  )

  const handleTabChange = (tab: StudentTab) => {
    setActiveTab(tab)
    const nextParams = new URLSearchParams(searchParams)
    if (tab === 'dashboard') {
      nextParams.delete('section')
      setSearchParams(nextParams, { replace: true })
    } else {
      nextParams.set('section', tab)
      setSearchParams(nextParams, { replace: true })
    }
  }

  const handleTabChangeRef = useRef(handleTabChange)
  handleTabChangeRef.current = handleTabChange

  // Header triggers (cards por usabilidade do perfil aluno) + cérebro Nôa (ref evita loop de setState)


  // Header triggers (cards por usabilidade do perfil aluno) + cérebro Nôa (ref evita loop de setState)
  useEffect(() => {
    const options = navItems.map(o => ({ id: o.id, label: o.label, icon: o.icon }))
    setDashboardTriggers({
      options,
      activeId: activeTab,
      onChange: (id) => handleTabChangeRef.current(id as StudentTab),
      onBrainClick: () => { if (isNoaOpen) closeChat(); else openChat() }
    })
    return () => setDashboardTriggers(null)
  }, [activeTab, navItems, openChat, closeChat, isNoaOpen, setDashboardTriggers])

  useEffect(() => {
    const section = searchParams.get('section') as StudentTab | null
    if (section && validTabs.includes(section)) {
      if (section !== activeTab) {
        setActiveTab(section)
      }
    } else if (!section && location.pathname.includes('/app/ensino/aluno/dashboard')) {
      // Se não há section na URL, manter o activeTab atual (que já está como 'perfil' por padrão)
      // Não forçar mudança se já está em uma aba válida
    }
  }, [searchParams, location.pathname])

  // Carregar cursos do Supabase
  useEffect(() => {
    if (user) {
      loadCourses()
    }
  }, [user])

  // Carregar estatísticas quando o curso principal for carregado
  useEffect(() => {
    if (user && mainCourse) {
      loadStudentStats()
    }
  }, [user, mainCourse])

  const loadStudentStats = async () => {
    if (!user) return

    try {
      // Buscar inscrições do aluno
      const { data: enrollments } = await supabase
        .from('course_enrollments')
        .select('*, courses(*, course_modules(*))')
        .eq('user_id', user.id)

      // Calcular estatísticas
      let totalModules = 0
      let completedModules = 0
      let totalLessons = 0
      let completedLessons = 0

      if (enrollments && enrollments.length > 0) {
        enrollments.forEach((enrollment: any) => {
          if (enrollment.courses?.course_modules) {
            totalModules += enrollment.courses.course_modules.length
            // Assumir módulos concluídos baseado no progresso
            if (enrollment.progress >= 100) {
              completedModules += enrollment.courses.course_modules.length
            }
          }
        })
      }

      // Buscar posts no fórum (assumindo que há uma tabela de posts)
      let forumPostsCount = 0
      try {
        const { count } = await (supabase as any)
          .from('forum_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
        forumPostsCount = count || 0
      } catch {
        forumPostsCount = 0
      }

      // Calcular dias na plataforma baseado na primeira inscrição
      const primeiroAcesso = enrollments && enrollments.length > 0
        ? new Date(enrollments.sort((a: any, b: any) =>
          new Date(a.enrolled_at || 0).getTime() - new Date(b.enrolled_at || 0).getTime()
        )[0].enrolled_at || Date.now())
        : new Date()
      const daysOnPlatform = Math.max(0, Math.floor((Date.now() - primeiroAcesso.getTime()) / (1000 * 60 * 60 * 24)))

      setStudentStats({
        totalModules: totalModules || mainCourse?.modules?.length || 0,
        completedModules,
        totalLessons,
        completedLessons,
        totalTests: 0,
        completedTests: 0,
        forumPosts: forumPostsCount || 0,
        libraryAccess: 0,
        daysOnPlatform
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas do aluno:', error)
      // Usar dados do curso principal como fallback
      setStudentStats({
        totalModules: mainCourse?.modules?.length || 0,
        completedModules: 0,
        totalLessons: 0,
        completedLessons: 0,
        totalTests: 0,
        completedTests: 0,
        forumPosts: 0,
        libraryAccess: 0,
        daysOnPlatform: 0
      })
    }
  }

  const loadCourses = async () => {
    if (!user) return

    try {
      // Buscar especificamente o curso "Pós-graduação em Cannabis Medicinal" do Dr. Eduardo Faveret
      // Usar query mais simples para evitar erro 500
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .or('title.ilike.%cannabis%,title.ilike.%eduardo%,instructor.ilike.%eduardo%')
        .limit(1)

      if (coursesError) {
        // Ignorar erros de recursão infinita nas políticas RLS (erro conhecido do Supabase)
        if (coursesError.code !== '42P17' && !coursesError.message?.includes('infinite recursion')) {
          console.error('Erro ao buscar curso:', coursesError)
        }
        setMainCourse(FALLBACK_COURSE)
        setLoading(false)
        return
      }

      const course = courses && courses.length > 0 ? courses[0] : null

      if (!course) {
        console.log('Curso do Dr. Eduardo Faveret não encontrado, aplicando conteúdo padrão')
        setMainCourse(FALLBACK_COURSE)
        setLoading(false)
        return
      }

      // Verificar se o aluno está inscrito, se não estiver, criar a inscrição
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', course.id)
        .maybeSingle()

      let userEnrollment = enrollment

      // Se não estiver inscrito, criar a inscrição
      if (!enrollment && enrollmentError?.code === 'PGRST116') {
        const { data: newEnrollment, error: createError } = await supabase
          .from('course_enrollments')
          .insert({
            user_id: user.id,
            course_id: course.id,
            progress: 0,
            status: 'in_progress',
            enrolled_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('Erro ao criar inscrição:', createError)
        } else {
          userEnrollment = newEnrollment
        }
      } else if (!enrollment) {
        // Tentar criar mesmo se não for erro PGRST116
        const { data: newEnrollment, error: createError } = await supabase
          .from('course_enrollments')
          .insert({
            user_id: user.id,
            course_id: course.id,
            progress: 0,
            status: 'in_progress',
            enrolled_at: new Date().toISOString()
          })
          .select()
          .single()

        if (!createError && newEnrollment) {
          userEnrollment = newEnrollment
        }
      }

      // Buscar módulos do curso
      const { data: modules } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', course.id)
        .order('order_index', { ascending: true })

      // Buscar número de alunos inscritos
      const { count: studentsCount } = await supabase
        .from('course_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id)

      // Determinar instrutor
      const instructor = course.instructor || 'Dr. Eduardo Faveret'

      setMainCourse({
        id: course.id,
        title: course.title || 'Pós-Graduação em Cannabis Medicinal',
        subtitle: 'Ambiente de Ensino, Clínica e Pesquisa - MedCannLab 3.0',
        description: course.description || 'Curso completo de Pós-Graduação em Cannabis Medicinal, integrando os eixos de Ensino, Clínica e Pesquisa da plataforma MedCannLab 3.0.',
        progress: userEnrollment?.progress || 0,
        status: userEnrollment?.status === 'completed' ? 'Concluído' : 'Em Andamento',
        instructor: instructor,
        duration: course.duration_text || `${course.duration || 60} horas`,
        nextClass: course.next_class_date ? new Date(course.next_class_date).toLocaleDateString('pt-BR') : null,
        color: 'from-green-400 to-green-500',
        logo: '🌿',
        studentsCount: studentsCount || 0,
        modules: (modules || []).map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description || '',
          progress: 0, // TODO: Calcular progresso por módulo
          status: 'Disponível',
          duration: `${m.duration || 0} minutos`,
          lessons: [] // TODO: Adicionar lições
        }))
      })
    } catch (error) {
      console.error('Erro ao carregar cursos:', error)
      setMainCourse(FALLBACK_COURSE)
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

  // Renderizar Perfil do Aluno
  const renderPerfil = () => {
    const progressoGeral = mainCourse?.progress || 0
    const totalModulos = studentStats.totalModules || mainCourse?.modules?.length || 0
    const modulosConcluidos = studentStats.completedModules || 0

    return (
      <div className="space-y-6">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Dias na Plataforma */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-9 h-9 text-indigo-300" />
              <span className="text-3xl font-bold text-white">{studentStats.daysOnPlatform}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Dias na Plataforma</h3>
            <p className="text-base text-slate-400">Tempo de uso do sistema</p>
          </div>

          {/* Módulos */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <BookOpen className="w-9 h-9 text-primary-300" />
              <span className="text-3xl font-bold text-white">{totalModulos}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Módulos</h3>
            <div className="space-y-1.5 text-base text-slate-400">
              <div className="flex justify-between">
                <span>Concluídos:</span>
                <span className="text-emerald-400">{modulosConcluidos}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="text-slate-300">{totalModulos}</span>
              </div>
            </div>
          </div>

          {/* Progresso do Curso */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-9 h-9 text-emerald-300" />
              <span className="text-3xl font-bold text-white">{progressoGeral}%</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Progresso Geral</h3>
            <div className="space-y-1.5 text-base text-slate-400">
              <div className="flex justify-between">
                <span>Curso:</span>
                <span className="text-emerald-400">{mainCourse?.title || 'Pós-Graduação'}</span>
              </div>
            </div>
          </div>

          {/* Fórum */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <MessageCircle className="w-9 h-9 text-purple-300" />
              <span className="text-3xl font-bold text-white">{studentStats.forumPosts}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Posts no Fórum</h3>
            <div className="space-y-1.5 text-base text-slate-400">
              <div className="flex justify-between">
                <span>Participações:</span>
                <span className="text-purple-400">{studentStats.forumPosts}</span>
              </div>
            </div>
          </div>

          {/* Biblioteca */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Database className="w-9 h-9 text-sky-300" />
              <span className="text-3xl font-bold text-white">{studentStats.libraryAccess}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-300 mb-2">Biblioteca</h3>
            <div className="space-y-1.5 text-base text-slate-400">
              <div className="flex justify-between">
                <span>Acessos:</span>
                <span className="text-sky-400">{studentStats.libraryAccess}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progresso do Curso */}
        {mainCourse && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Target className="w-6 h-6 text-primary-300" />
                Progresso do Curso
              </h3>
              <span className="text-2xl font-bold text-primary-300">{progressoGeral}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800">
              <div
                className="h-3 rounded-full transition-all bg-gradient-to-r from-primary-500 to-emerald-500"
                style={{ width: `${progressoGeral}%` }}
              />
            </div>
            <p className="text-base text-slate-400 mt-2">{mainCourse.title}</p>
          </div>
        )}

        {/* Analytics de Uso */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
            <BarChart3 className="w-6 h-6 text-primary-300" />
            Analytics de Uso
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Engajamento */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-6 h-6 text-emerald-400" />
                <h4 className="text-base font-semibold text-white">Engajamento</h4>
              </div>
              <div className="space-y-2 text-base">
                <div className="flex justify-between text-slate-300">
                  <span>Módulos concluídos:</span>
                  <span className="font-semibold text-white">{modulosConcluidos}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Progresso geral:</span>
                  <span className="font-semibold text-white">{progressoGeral}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Posts no fórum:</span>
                  <span className="font-semibold text-white">{studentStats.forumPosts}</span>
                </div>
              </div>
            </div>

            {/* Atividade Recente */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                <h4 className="text-base font-semibold text-white">Atividade Recente</h4>
              </div>
              <div className="space-y-2 text-base">
                <div className="flex justify-between text-slate-300">
                  <span>Curso atual:</span>
                  <span className="font-semibold text-white">{mainCourse?.title || 'N/A'}</span>
                </div>
                {mainCourse?.nextClass && (
                  <div className="flex justify-between text-slate-300">
                    <span>Próxima aula:</span>
                    <span className="font-semibold text-white">{mainCourse.nextClass}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300">
                  <span>Status:</span>
                  <span className="font-semibold text-white">{mainCourse?.status || 'Em Andamento'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Ações Rápidas */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            Ações Rápidas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Acessar Curso */}
            <button
              onClick={() => {
                navigate('/app/ensino/profissional/pos-graduacao-cannabis')
              }}
              className="rounded-xl p-4 text-left transition-all"
              style={{ background: 'linear-gradient(135deg, #1a365d 0%, #274a78 100%)', boxShadow: '0 10px 24px rgba(26,54,93,0.35)', border: '1px solid rgba(0,193,106,0.08)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,193,106,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #1a365d 0%, #274a78 100%)'
                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(26,54,93,0.35)'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
              }}
              onTouchEnd={(e) => {
                setTimeout(() => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #1a365d 0%, #274a78 100%)'
                  e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                }, 150)
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Play className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white leading-tight">📚 Acessar Curso</h3>
                  <p className="text-sm text-white/80">Continue seus estudos e módulos</p>
                </div>
              </div>
            </button>

            {/* Chat com Nôa */}
            <button
              onClick={() => openChat()}
              className="rounded-xl p-4 text-left transition-all"
              style={{ background: accentGradient, boxShadow: '0 10px 24px rgba(0,193,106,0.35)', border: '1px solid rgba(0,193,106,0.35)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.95'
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,193,106,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,193,106,0.35)'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.opacity = '0.95'
              }}
              onTouchEnd={(e) => {
                setTimeout(() => {
                  e.currentTarget.style.opacity = '1'
                }, 150)
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white leading-tight">🤖 Chat com Nôa</h3>
                  <p className="text-sm text-white/80">Tire dúvidas e receba suporte</p>
                </div>
              </div>
            </button>

            {/* Fórum */}
            <button
              onClick={() => {
                setActiveTab('forum')
              }}
              className="rounded-xl p-4 text-left transition-all"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)', boxShadow: '0 10px 24px rgba(124,58,237,0.35)', border: '1px solid rgba(0,193,106,0.08)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,193,106,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(124,58,237,0.35)'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
              }}
              onTouchEnd={(e) => {
                setTimeout(() => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                  e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                }, 150)
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white leading-tight">💬 Fórum Cann Matrix</h3>
                  <p className="text-sm text-white/80">Participe de discussões e debates</p>
                </div>
              </div>
            </button>

            {/* Biblioteca */}
            <button
              onClick={() => {
                setActiveTab('biblioteca')
              }}
              className="rounded-xl p-4 text-left transition-all"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)', boxShadow: '0 10px 24px rgba(14,165,233,0.35)', border: '1px solid rgba(0,193,106,0.08)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,193,106,0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)'
                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(14,165,233,0.35)'
              }}
              onTouchStart={(e) => {
                e.currentTarget.style.background = 'rgba(0, 193, 106, 0.08)'
                e.currentTarget.style.borderColor = 'rgba(0,193,106,0.15)'
              }}
              onTouchEnd={(e) => {
                setTimeout(() => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)'
                  e.currentTarget.style.borderColor = 'rgba(0,193,106,0.08)'
                }, 150)
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white leading-tight">📖 Biblioteca</h3>
                  <p className="text-sm text-white/80">Acesse materiais e recursos</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Funcionalidades Utilizadas */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-amber-400" />
            Funcionalidades Utilizadas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border ${modulosConcluidos > 0 ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className={`w-5 h-5 ${modulosConcluidos > 0 ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className={`font-semibold ${modulosConcluidos > 0 ? 'text-emerald-300' : 'text-slate-400'}`}>
                  Módulos
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {modulosConcluidos > 0 ? `${modulosConcluidos} módulo(s) concluído(s)` : 'Ainda não utilizado'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${studentStats.forumPosts > 0 ? 'bg-purple-500/10 border-purple-500/40' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className={`w-5 h-5 ${studentStats.forumPosts > 0 ? 'text-purple-400' : 'text-slate-500'}`} />
                <span className={`font-semibold ${studentStats.forumPosts > 0 ? 'text-purple-300' : 'text-slate-400'}`}>
                  Fórum
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {studentStats.forumPosts > 0 ? `${studentStats.forumPosts} post(s) publicado(s)` : 'Ainda não utilizado'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${studentStats.libraryAccess > 0 ? 'bg-sky-500/10 border-sky-500/40' : 'bg-slate-800/50 border-slate-700'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Database className={`w-5 h-5 ${studentStats.libraryAccess > 0 ? 'text-sky-400' : 'text-slate-500'}`} />
                <span className={`font-semibold ${studentStats.libraryAccess > 0 ? 'text-sky-300' : 'text-slate-400'}`}>
                  Biblioteca
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {studentStats.libraryAccess > 0 ? `${studentStats.libraryAccess} acesso(s) realizado(s)` : 'Ainda não utilizado'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
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
    <div
      className="min-h-screen text-white"
      style={{ background: backgroundGradient }}
      data-page="aluno-dashboard"
    >
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="w-full max-w-full mx-auto overflow-x-hidden space-y-8">
            {/* Dashboard Principal */}
            {activeTab === 'dashboard' && (
              <>
                {/* Welcome Section - Card no estilo da Base de Conhecimento */}
                <div className="rounded-xl p-4 mb-6 relative overflow-hidden" style={{ ...surfaceStyle, border: '1px solid rgba(0,193,106,0.18)' }}>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="p-3 rounded-xl shadow-lg flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: accentGradient, boxShadow: '0 8px 20px rgba(0,193,106,0.32)' }}
                      >
                        {mainCourse.logo || '🌿'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-white mb-0.5 truncate">{mainCourse.title}</h2>
                        <p className="text-sm font-semibold text-[rgba(200,214,229,0.85)] truncate">{mainCourse.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-[rgba(200,214,229,0.85)] mb-3 line-clamp-2">
                      {mainCourse.description}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => {
                          navigate('/app/ensino/profissional/pos-graduacao-cannabis')
                        }}
                        className="text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 text-sm"
                        style={{ background: accentGradient }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.9'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1'
                        }}
                      >
                        <Play className="w-4 h-4" />
                        <span>Acessar Curso</span>
                      </button>
                      <div className="flex items-center gap-3 text-[rgba(200,214,229,0.75)] text-xs flex-wrap">
                        <span>⏱️ {mainCourse.duration}</span>
                        <span>👨‍🏫 {mainCourse.instructor}</span>
                        <span>📚 {mainCourse.modules.length} Módulos</span>
                        {mainCourse.studentsCount && (
                          <span>👥 {mainCourse.studentsCount} Alunos</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>


                <div className="grid grid-cols-1 gap-8 w-full overflow-x-hidden">
                  {/* Courses Section */}
                  <div className="w-full overflow-x-hidden">
                    <div className="rounded-xl p-4 md:p-6 overflow-hidden w-full max-w-full" style={surfaceStyle}>
                      <div className="flex items-center justify-between mb-6 stack-mobile">
                        <h3 className="text-xl font-semibold text-white">Meu Curso Principal</h3>
                        <button
                          onClick={() => navigate('/app/ensino/profissional/pos-graduacao-cannabis')}
                          className="text-white px-4 py-2 rounded-lg font-semibold transition-transform transform hover:scale-[1.02]"
                          style={{ background: accentGradient }}
                        >
                          Ver Detalhes
                        </button>
                      </div>

                      {/* Curso Principal */}
                      <div
                        className="rounded-lg p-4 md:p-6 mb-6 transition-transform transform hover:scale-[1.01] overflow-hidden w-full max-w-full"
                        style={cardStyle}
                      >
                        <div className="flex items-start justify-between mb-4 gap-2 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                              <h4 className="text-lg font-semibold text-white break-words flex-1 min-w-0">{mainCourse.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(mainCourse.status)}`}>
                                {mainCourse.status}
                              </span>
                            </div>
                            <p className="text-sm text-slate-200/80 mb-3 break-words">{mainCourse.description}</p>

                            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-slate-300/80 mb-4">
                              <span className="whitespace-nowrap">Instrutor: {mainCourse.instructor}</span>
                              <span className="whitespace-nowrap">Duração: {mainCourse.duration}</span>
                              <span className="whitespace-nowrap">Próxima aula: {mainCourse.nextClass || 'N/A'}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button className="p-2 rounded-lg transition-colors" style={{ background: 'rgba(12,34,54,0.82)', border: '1px solid rgba(0,193,106,0.18)' }}>
                              <Play className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg transition-colors" style={{ background: 'rgba(12,34,54,0.82)', border: '1px solid rgba(0,193,106,0.18)' }}>
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg transition-colors" style={{ background: 'rgba(12,34,54,0.82)', border: '1px solid rgba(0,193,106,0.18)' }}>
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-200/80">Progresso Geral</span>
                            <span className="text-white font-medium">{mainCourse.progress}%</span>
                          </div>
                          <div className="w-full rounded-full h-2" style={{ background: 'rgba(12,34,54,0.6)' }}>
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
                          <div
                            key={module.id}
                            className="rounded-lg p-4 md:p-5 transition-transform transform hover:scale-[1.01] overflow-hidden w-full max-w-full"
                            style={{ ...cardStyle, border: '1px solid rgba(0,193,106,0.18)' }}
                          >
                            <div className="flex items-start justify-between mb-4 gap-2 flex-wrap">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: accentGradient }}>
                                    {moduleIndex + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h5 className="text-md font-semibold text-white break-words">{module.title}</h5>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(module.status)}`}>
                                      {module.status}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-200/80 mb-3 ml-0 md:ml-11 break-words">{module.description}</p>

                                {/* Aulas do Módulo */}
                                {module.lessons && module.lessons.length > 0 && (
                                  <div className="ml-0 md:ml-11 space-y-2 w-full overflow-x-hidden">
                                    <p className="text-xs text-slate-500 font-medium mb-2 break-words">Aulas deste módulo:</p>
                                    <div className="grid grid-cols-1 gap-2 w-full overflow-x-hidden">
                                      {module.lessons && module.lessons.map((lesson: any, lessonIndex: number) => (
                                        <div
                                          key={lessonIndex}
                                          className="flex items-center space-x-2 text-sm text-slate-200/80 rounded-lg p-2 overflow-hidden w-full max-w-full"
                                          style={{ background: 'rgba(12,34,54,0.72)', border: '1px solid rgba(0,193,106,0.12)' }}
                                        >
                                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#00F5A0' }}></div>
                                          <span className="flex-1 break-words min-w-0">{lesson}</span>
                                          <button
                                            className="p-1 rounded transition-colors flex-shrink-0"
                                            style={{ background: 'rgba(12,34,54,0.82)', border: '1px solid rgba(0,193,106,0.18)' }}
                                          >
                                            <Play className="w-3 h-3" style={{ color: '#00F5A0' }} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-slate-300/80 mt-3 ml-0 md:ml-11">
                                  <span className="whitespace-nowrap">⏱️ Duração: {module.duration}</span>
                                  {module.lessons && <span className="whitespace-nowrap">📚 {module.lessons.length} aulas</span>}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <button
                                  onClick={() => {
                                    navigate('/app/ensino/profissional/pos-graduacao-cannabis', { state: { moduleId: module.id } })
                                  }}
                                  className="p-2 rounded-lg transition-transform transform hover:scale-105 text-white"
                                  style={{ background: accentGradient }}
                                  title="Iniciar Módulo"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-2 ml-11">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-200/80">Progresso do Módulo</span>
                                <span className="text-white font-medium">{module.progress}%</span>
                              </div>
                              <div className="w-full rounded-full h-2" style={{ background: 'rgba(12,34,54,0.6)' }}>
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
                    <div className="rounded-xl p-6 mt-6" style={surfaceStyle}>
                      <h3 className="text-xl font-semibold text-white mb-6">Próximas Aulas</h3>

                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: '#4FE0C1' }} />
                        <p className="text-slate-200/80">Nenhuma aula agendada no momento</p>
                        <p className="text-sm text-slate-300/80 mt-2">As próximas aulas serão anunciadas em breve</p>
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}

            {/* Redes Sociais */}
            {activeTab === 'redes-sociais' && (
              <div className="space-y-6">
                {/* Cards de Redes Sociais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Instagram */}
                  <div className="rounded-xl p-6 transition-transform transform hover:scale-[1.02] cursor-pointer" style={{ ...cardStyle, border: '1px solid rgba(0,193,106,0.18)' }}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)' }}>
                        📷
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Instagram</h3>
                        <p className="text-xs text-slate-300/80">@medcannlab</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200/85 mb-4">
                      Acompanhe casos clínicos, dicas de estudo e novidades da pós-graduação em tempo real.
                    </p>
                    <a
                      href="https://instagram.com/medcannlab"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-transform transform hover:scale-[1.02] w-full"
                      style={{ background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%)' }}
                    >
                      <span>Seguir no Instagram</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* LinkedIn */}
                  <div className="rounded-xl p-6 transition-transform transform hover:scale-[1.02] cursor-pointer" style={{ ...cardStyle, border: '1px solid rgba(0,193,106,0.18)' }}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #0077B5 0%, #00A0DC 100%)' }}>
                        💼
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">LinkedIn</h3>
                        <p className="text-xs text-slate-300/80">MedCannLab</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200/85 mb-4">
                      Conecte-se profissionalmente, participe de discussões e acompanhe artigos científicos.
                    </p>
                    <a
                      href="https://linkedin.com/company/medcannlab"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-transform transform hover:scale-[1.02] w-full"
                      style={{ background: 'linear-gradient(135deg, #0077B5 0%, #00A0DC 100%)' }}
                    >
                      <span>Conectar no LinkedIn</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* YouTube */}
                  <div className="rounded-xl p-6 transition-transform transform hover:scale-[1.02] cursor-pointer" style={{ ...cardStyle, border: '1px solid rgba(0,193,106,0.18)' }}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)' }}>
                        ▶️
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">YouTube</h3>
                        <p className="text-xs text-slate-300/80">Canal MedCannLab</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200/85 mb-4">
                      Assista aulas gravadas, webinars e conteúdo educativo sobre cannabis medicinal.
                    </p>
                    <a
                      href="https://youtube.com/@medcannlab"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-transform transform hover:scale-[1.02] w-full"
                      style={{ background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)' }}
                    >
                      <span>Inscrever-se no Canal</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* WhatsApp */}
                  <div className="rounded-xl p-6 transition-transform transform hover:scale-[1.02] cursor-pointer" style={{ ...cardStyle, border: '1px solid rgba(0,193,106,0.18)' }}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}>
                        💬
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">WhatsApp</h3>
                        <p className="text-xs text-slate-300/80">Grupo de Alunos</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200/85 mb-4">
                      Participe do grupo exclusivo de alunos para tirar dúvidas e compartilhar experiências.
                    </p>
                    <a
                      href="https://wa.me/5521999999999"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-transform transform hover:scale-[1.02] w-full"
                      style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)' }}
                    >
                      <span>Entrar no Grupo</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Telegram */}
                  <div className="rounded-xl p-6 transition-transform transform hover:scale-[1.02] cursor-pointer" style={{ ...cardStyle, border: '1px solid rgba(0,193,106,0.18)' }}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #0088CC 0%, #229ED9 100%)' }}>
                        ✈️
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Telegram</h3>
                        <p className="text-xs text-slate-300/80">Canal de Notícias</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200/85 mb-4">
                      Receba atualizações sobre novos conteúdos, eventos e comunicados importantes.
                    </p>
                    <a
                      href="https://t.me/medcannlab"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-transform transform hover:scale-[1.02] w-full"
                      style={{ background: 'linear-gradient(135deg, #0088CC 0%, #229ED9 100%)' }}
                    >
                      <span>Entrar no Canal</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Twitter/X */}
                  <div className="rounded-xl p-6 transition-transform transform hover:scale-[1.02] cursor-pointer" style={{ ...cardStyle, border: '1px solid rgba(0,193,106,0.18)' }}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #000000 0%, #1DA1F2 100%)' }}>
                        🐦
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Twitter/X</h3>
                        <p className="text-xs text-slate-300/80">@medcannlab</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200/85 mb-4">
                      Acompanhe discussões sobre pesquisa, regulamentação e novidades do setor.
                    </p>
                    <a
                      href="https://twitter.com/medcannlab"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-transform transform hover:scale-[1.02] w-full"
                      style={{ background: 'linear-gradient(135deg, #000000 0%, #1DA1F2 100%)' }}
                    >
                      <span>Seguir no Twitter/X</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Informações Adicionais */}
                <div className="rounded-xl p-6" style={{ ...cardStyle, border: '1px solid rgba(0,193,106,0.18)' }}>
                  <h3 className="text-xl font-semibold text-white mb-4">Comunidade MedCannLab</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">📌 Por que seguir nossas redes sociais?</h4>
                      <ul className="space-y-2 text-sm text-slate-200/85 list-disc list-inside ml-4">
                        <li>Acesso exclusivo a conteúdos educativos e casos clínicos</li>
                        <li>Participação em discussões com profissionais e colegas</li>
                        <li>Notificações sobre novos módulos e atualizações do curso</li>
                        <li>Oportunidades de networking e mentoria</li>
                        <li>Atualizações sobre eventos, webinars e workshops</li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t border-slate-700/50">
                      <h4 className="font-semibold text-white mb-2">💡 Dica</h4>
                      <p className="text-sm text-slate-200/85">
                        Ative as notificações nas redes sociais para não perder nenhuma atualização importante sobre o curso e a comunidade MedCannLab.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notícias */}
            {activeTab === 'noticias' && (
              <div className="space-y-6">

                {/* Filtros de Notícias */}
                <div className="rounded-xl p-4" style={secondarySurfaceStyle}>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ background: accentGradient }}>
                      Todas
                    </button>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium transition-transform transform hover:scale-[1.02]" style={{ background: 'rgba(12,34,54,0.7)', border: '1px solid rgba(0,193,106,0.1)', color: '#C8D6E5' }}>
                      Cannabis Medicinal
                    </button>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium transition-transform transform hover:scale-[1.02]" style={{ background: 'rgba(12,34,54,0.7)', border: '1px solid rgba(0,193,106,0.1)', color: '#C8D6E5' }}>
                      Pesquisa Clínica
                    </button>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium transition-transform transform hover:scale-[1.02]" style={{ background: 'rgba(12,34,54,0.7)', border: '1px solid rgba(0,193,106,0.1)', color: '#C8D6E5' }}>
                      Metodologia AEC
                    </button>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium transition-transform transform hover:scale-[1.02]" style={{ background: 'rgba(12,34,54,0.7)', border: '1px solid rgba(0,193,106,0.1)', color: '#C8D6E5' }}>
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
                    <div
                      key={news.id}
                      className="rounded-xl p-6 transition-transform transform hover:scale-[1.01] cursor-pointer"
                      style={surfaceStyle}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-32 h-24 rounded-lg flex-shrink-0" style={{ background: 'rgba(12,34,54,0.7)', border: '1px solid rgba(0,193,106,0.1)' }}></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: 'rgba(79,224,193,0.18)', color: '#4FE0C1' }}>
                              {news.category}
                            </span>
                            <span className="text-xs text-slate-300/80">{news.date}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">{news.title}</h3>
                          <p className="text-sm text-slate-200/80 mb-3">{news.summary}</p>
                          <button className="text-[#4FE0C1] hover:text-white text-sm font-medium flex items-center space-x-1">
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

                {/* Seleção de Sistema */}
                <div className="rounded-xl p-6 mb-6" style={surfaceStyle}>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: accentGradient }}>
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Simulação de Paciente com IA Residente</h3>
                      <p className="text-slate-200/80">Selecione um sistema para iniciar a simulação</p>
                    </div>
                  </div>

                  <p className="text-slate-200/80 mb-6">
                    A Nôa Esperança irá simular um paciente com alguma questão no sistema selecionado.
                    Você fará a entrevista clínica e, ao final, receberá uma avaliação da sua performance
                    de acordo com os critérios da Arte da Entrevista Clínica.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-200/90 mb-2">
                        Selecione o Sistema para Simulação:
                      </label>
                      <select
                        id="sistema-simulacao"
                        className="w-full px-4 py-3 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        style={inputStyle}
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
                      <label className="block text-sm font-semibold text-slate-200/90 mb-2">
                        Selecione o Tipo de Simulação:
                      </label>
                      <select
                        id="tipo-simulacao"
                        className="w-full px-4 py-3 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        style={inputStyle}
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
                            `Você será o PACIENTE e eu serei o profissional de saúde. ` +
                            `Durante a entrevista clínica, você deve identificar fatores tradicionais (como pressão arterial, diabetes, função renal, exames laboratoriais) ` +
                            `e fatores não tradicionais (como estresse, sono, nutrição, atividade física, bem-estar mental) relacionados à doença renal crônica. ` +
                            `Use a metodologia Arte da Entrevista Clínica para conduzir a entrevista. ` +
                            `Ao final, vou avaliar sua performance de acordo com os critérios da AEC, especialmente sua capacidade de identificar e explorar ambos os tipos de fatores. ` +
                            `Vamos começar?`
                        } else if (tipoSelecionado === 'diagnostico-tea') {
                          mensagemInicial =
                            `Vou iniciar uma simulação focada em ${nomeTipo}. ` +
                            `Você será o PACIENTE e eu serei o profissional de saúde. ` +
                            `Durante a entrevista clínica, você deve aplicar técnicas da metodologia Arte da Entrevista Clínica para identificar sinais e sintomas relacionados ao TEA. ` +
                            `Use abordagem empática e observação cuidadosa dos comportamentos, comunicação e interação social. ` +
                            `Ao final, vou avaliar sua performance de acordo com os critérios da AEC, especialmente sua capacidade de conduzir uma entrevista sensível e completa para diagnóstico de TEA. ` +
                            `Vamos começar?`
                        } else {
                          mensagemInicial =
                            `Vou iniciar uma simulação de paciente com questão no ${nomeSistema}. ` +
                            `Você será o PACIENTE e eu serei o profissional de saúde. ` +
                            `Faça a entrevista clínica usando a metodologia Arte da Entrevista Clínica. ` +
                            `Ao final da entrevista, vou avaliar sua performance de acordo com os critérios da AEC. ` +
                            `Vamos começar?`
                        }

                        openChat()
                        sendInitialMessage(mensagemInicial)
                      }}
                      className="w-full text-white px-6 py-4 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-transform transform hover:scale-105"
                      style={{ background: accentGradient }}
                    >
                      <Stethoscope className="w-6 h-6" />
                      <span>Iniciar Simulação de Paciente</span>
                    </button>
                  </div>

                  <div className="mt-6 p-4 rounded-lg" style={{ ...cardStyle, border: '1px solid rgba(0,193,106,0.18)' }}>
                    <h4 className="font-semibold text-white mb-2 flex items-center space-x-2">
                      <Award className="w-5 h-5 text-yellow-400" />
                      <span>Como Funciona:</span>
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-200/80 list-disc list-inside">
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

            {/* Biblioteca */}
            {activeTab === 'biblioteca' && (
              <div className="space-y-6">

                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <article className="rounded-xl p-6 space-y-3" style={{ ...cardStyle, border: '1px solid rgba(0,193,106,0.18)' }}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ background: secondaryGradient }}>
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Conhecimento da IA Residente</h3>
                        <p className="text-xs text-slate-300/80 uppercase tracking-[0.28em]">Documentos vinculados à IA</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200/85 leading-relaxed">
                      Explore relatórios clínicos, white papers e normas técnicas que alimentam a inteligência residente. Ideal para fundamentar estudos de caso e
                      preparar aulas alinhadas à pós-graduação.
                    </p>
                    <button
                      onClick={() => navigate('/app/library?filter=knowledge-base')}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-transform transform hover:scale-[1.02]"
                      style={{ background: 'linear-gradient(135deg, #1a365d 0%, #274a78 100%)' }}
                    >
                      Ver Documentos Vinculados
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </article>

                  <article className="rounded-xl p-6 space-y-3" style={{ ...cardStyle, border: '1px solid rgba(0,193,106,0.18)' }}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ background: accentGradient }}>
                        <Lightbulb className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Leituras Sugeridas</h3>
                        <p className="text-xs text-slate-300/80 uppercase tracking-[0.28em]">Curadoria por módulo</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200/85 leading-relaxed">
                      Receba recomendações alinhadas ao seu progresso no curso. A IA identifica lacunas e aponta artigos, vídeos e podcasts relevantes para cada módulo.
                    </p>
                    <button
                      onClick={() => {
                        openChat()
                        sendInitialMessage?.('Nôa, pode me indicar leituras sugeridas para o módulo atual da pós-graduação?')
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-transform transform hover:scale-[1.02]"
                      style={{ background: 'linear-gradient(135deg, #00C16A 0%, #13794f 100%)' }}
                    >
                      Pedir Sugestões à IA
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </article>

                  <article className="rounded-xl p-6 space-y-3" style={{ ...cardStyle, border: '1px solid rgba(0,193,106,0.18)' }}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ background: dangerGradient }}>
                        <Download className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Materiais Complementares</h3>
                        <p className="text-xs text-slate-300/80 uppercase tracking-[0.28em]">Planilhas, roteiros e slides</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-200/85 leading-relaxed">
                      Faça download de checklists clínicos, roteiros de entrevista, simulados e slides base que auxiliam nas práticas supervisionadas e atividades de sala invertida.
                    </p>
                    <button
                      onClick={() => navigate('/app/library?filter=downloads')}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-transform transform hover:scale-[1.02]"
                      style={{ background: 'linear-gradient(135deg, #FF5F6D 0%, #FFC371 100%)', color: '#10243D' }}
                    >
                      Acessar Downloads
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </article>
                </section>

                <section className="rounded-xl p-6" style={{ ...cardStyle, border: '1px solid rgba(0,193,106,0.18)' }}>
                  <h3 className="text-xl font-semibold text-white mb-4">Coleções em Destaque</h3>
                  <div className="space-y-4 text-sm text-slate-300/85">
                    <div>
                      <p className="font-semibold text-white">Arte da Entrevista Clínica</p>
                      <p className="mt-1 leading-relaxed">
                        Casos, transcrições comentadas, fichas IMRE e mapas de aprendizagem para cada eixo da metodologia desenvolvida pelo Dr. Ricardo Valença.
                      </p>
                      <button
                        onClick={() => navigate('/app/library?collection=aec')}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-rose-200 hover:text-rose-100 transition-colors"
                      >
                        Ver Coleção AEC
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Cannabis & Função Renal</p>
                      <p className="mt-1 leading-relaxed">
                        Estudos clínicos, revisões sistemáticas e protocolos correlacionados à pesquisa MedCannLab sobre nefrologia e terapia canabinoide.
                      </p>
                      <button
                        onClick={() => navigate('/app/library?collection=medcannlab')}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-200 hover:text-emerald-100 transition-colors"
                      >
                        Explorar Material
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Teste de Nivelamento */}
            {activeTab === 'teste' && (
              <div className="space-y-6">

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

            {/* Fórum Cann Matrix */}
            {activeTab === 'forum' && (
              <div className="space-y-6">
                <div className="rounded-xl p-6 relative min-h-[250px]" style={{ ...surfaceStyle, overflow: 'hidden' }}>
                  {/* Animação Matrix no background */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      opacity: 0.4,
                      zIndex: 1,
                      overflow: 'hidden'
                    }}
                  >
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div
                        key={`matrix-${i}`}
                        style={{
                          position: 'absolute',
                          left: `${(i * 3.5) % 100}%`,
                          top: '-150px',
                          animation: `matrixFall ${3 + (i % 5)}s linear infinite`,
                          animationDelay: `${i * 0.12}s`,
                          color: '#00F5A0',
                          fontFamily: 'monospace',
                          fontSize: '15px',
                          fontWeight: 'bold',
                          textShadow: '0 0 15px rgba(0, 245, 160, 1), 0 0 25px rgba(0, 245, 160, 0.8), 0 0 35px rgba(0, 245, 160, 0.5)',
                          whiteSpace: 'nowrap',
                          letterSpacing: '3px',
                          zIndex: 1
                        }}
                      >
                        MedCannLab
                      </div>
                    ))}
                  </div>

                  {/* Conteúdo — compacto, sem ícone grande */}
                  <div className="relative" style={{ zIndex: 10 }}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-bold text-white mb-1">Fórum Cann Matrix</h2>
                        <p className="text-slate-200/85 text-xs md:text-sm mb-3">
                          Comunidade viva para debates profissionais sobre cannabis medicinal, protocolos clínicos e pesquisa aplicada
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => navigate('/app/chat?context=aluno&moderation=true')}
                            className="px-3 py-1.5 rounded-lg flex items-center space-x-1.5 text-sm transition-colors"
                            style={{ background: accentGradient }}
                          >
                            <Flag className="w-3.5 h-3.5" />
                            <span>Painel de Moderação</span>
                          </button>
                          <div className="px-2.5 py-1.5 rounded-lg flex items-center space-x-1.5" style={{ background: 'rgba(0, 193, 106, 0.2)', border: '1px solid rgba(0, 193, 106, 0.3)' }}>
                            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00F5A0' }}></div>
                            <span className="text-xs font-medium" style={{ color: '#00F5A0' }}>Admin Online</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/app/chat?context=aluno')}
                        className="px-4 py-2 rounded-lg font-semibold text-white text-sm transition-transform transform hover:scale-[1.02] shrink-0"
                        style={{ background: dangerGradient, color: '#10243D' }}
                      >
                        Acessar Fórum
                      </button>
                    </div>
                  </div>

                  {/* CSS para animação Matrix */}
                  <style>{`
                    @keyframes matrixFall {
                      0% {
                        transform: translateY(-250px);
                        opacity: 0;
                      }
                      8% {
                        opacity: 1;
                      }
                      50% {
                        opacity: 1;
                      }
                      92% {
                        opacity: 1;
                      }
                      100% {
                        transform: translateY(700px);
                        opacity: 0;
                      }
                    }
                  `}</style>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl p-6" style={{ ...cardStyle, border: '1px solid rgba(0,193,106,0.18)' }}>
                    <h3 className="text-lg font-semibold text-white mb-2">Canais em Destaque</h3>
                    <ul className="space-y-2 text-sm text-slate-200/85 list-disc list-inside">
                      <li>#casos-clinicos – discussão orientada pelos docentes</li>
                      <li>#metodologia-aec – dúvidas sobre protocolos IMRE</li>
                      <li>#pesquisa-medcannlab – avanços e resultados parciais</li>
                      <li>#mentorias – agenda de plantões e aulas ao vivo</li>
                    </ul>
                  </div>
                  <div className="rounded-xl p-6" style={{ ...cardStyle, border: '1px solid rgba(0,193,106,0.18)' }}>
                    <h3 className="text-lg font-semibold text-white mb-2">Boas Práticas</h3>
                    <ul className="space-y-2 text-sm text-slate-200/85 list-disc list-inside">
                      <li>Traga evidências ou referências sempre que possível.</li>
                      <li>Mantenha confidencialidade dos pacientes.</li>
                      <li>Use marcadores de eixo (ensino/clinica/pesquisa) para organizar conteúdos.</li>
                      <li>Acione a equipe de moderação se notar condutas inadequadas.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Perfil do Aluno */}
            {activeTab === 'perfil' && (
              <div className="space-y-6">
                <div className="rounded-2xl p-8 mb-6" style={{ background: 'rgba(7,22,41,0.82)', border: '1px solid rgba(0,193,106,0.12)' }}>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Área do avatar — mais espaço e destaque */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg ring-2 ring-emerald-400/20">
                        <span className="text-white font-bold text-3xl sm:text-4xl">
                          {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'A'}
                        </span>
                      </div>
                      <p className="font-semibold text-white mt-3 text-lg">{user?.name || 'Aluno'}</p>
                      <p className="text-sm text-emerald-400/90">Estudante</p>
                    </div>
                    <div className="flex-1 text-center sm:text-left min-w-0">
                      <h2 className="text-xl sm:text-2xl font-semibold text-white">Bem-vindo, {user?.name || 'Aluno'}!</h2>
                      <p className="text-slate-400 mt-1">Seu centro de acompanhamento completo como estudante</p>
                    </div>
                  </div>
                </div>
                {renderPerfil()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STANDARD FOOTER NAVIGATION */}


      <NoaConversationalInterface
        userName={user?.name || 'Aluno'}
        userCode={user?.id || 'STUDENT-001'}
        position="bottom-right"
        hideButton={true}
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
