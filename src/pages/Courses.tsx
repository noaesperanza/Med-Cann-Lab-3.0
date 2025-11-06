import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  BookOpen, 
  Clock, 
  Users, 
  Award, 
  CheckCircle,
  Star,
  Upload,
  Plus,
  FileText,
  Video,
  Link as LinkIcon,
  Loader2
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Course {
  id: string
  title: string
  description: string
  category: string
  duration: string
  students: number
  rating: number
  price: string
  originalPrice: string | null
  level: string
  image?: string
  instructor: string
  lessons: number
  completed: boolean
  progress: number
  isLive: boolean
  nextClass: string | null
  badges: string[]
  href?: string
}

const Courses: React.FC = () => {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadType, setUploadType] = useState<'ebook' | 'youtube'>('ebook')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const categories = [
    { id: 'all', name: 'Todos os Cursos' },
    { id: 'clinical', name: 'Clínica' },
    { id: 'cannabis', name: 'Cannabis Medicinal' },
    { id: 'interview', name: 'Entrevista Clínica' },
    { id: 'certification', name: 'Certificações' },
    { id: 'community-health', name: 'Saúde Comunitária' }
  ]

  // Carregar cursos do Supabase
  useEffect(() => {
    loadCourses()
  }, [user])

  const loadCourses = async () => {
    try {
      setLoading(true)

      // Buscar cursos publicados
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (coursesError) {
        console.error('Erro ao buscar cursos:', coursesError)
        setCourses([])
        setLoading(false)
        return
      }

      if (!coursesData || coursesData.length === 0) {
        setCourses([])
        setLoading(false)
        return
      }

      // Para cada curso, buscar dados adicionais
      const coursesWithStats = await Promise.all(
        coursesData.map(async (course) => {
          // Contar alunos inscritos
          const { count: studentsCount } = await supabase
            .from('course_enrollments')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)

          // Contar módulos/aulas
          const { count: lessonsCount } = await supabase
            .from('course_modules')
            .select('*', { count: 'exact', head: true })
            .eq('course_id', course.id)

          // Buscar avaliações (ratings) - se a tabela existir
          let avgRating = 0
          try {
            const { data: ratingsData } = await supabase
              .from('course_ratings')
              .select('rating')
              .eq('course_id', course.id)

            if (ratingsData && ratingsData.length > 0) {
              avgRating = ratingsData.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingsData.length
            }
          } catch (error) {
            // Tabela course_ratings pode não existir ainda
            console.log('Tabela course_ratings não encontrada, usando rating padrão')
          }

          // Buscar progresso do usuário atual (se logado)
          let userProgress = 0
          let userCompleted = false
          if (user) {
            const { data: enrollmentData } = await supabase
              .from('course_enrollments')
              .select('progress, completed')
              .eq('course_id', course.id)
              .eq('user_id', user.id)
              .single()

            if (enrollmentData) {
              userProgress = enrollmentData.progress || 0
              userCompleted = enrollmentData.completed || false
            }
          }

          // Determinar categoria baseado no título/descrição
          const titleLower = course.title?.toLowerCase() || ''
          const descLower = course.description?.toLowerCase() || ''
          let category = 'all'
          if (titleLower.includes('aec') || titleLower.includes('entrevista') || descLower.includes('entrevista')) {
            category = 'interview'
          } else if (titleLower.includes('cannabis') || descLower.includes('cannabis')) {
            category = 'cannabis'
          } else if (titleLower.includes('imre') || descLower.includes('imre') || descLower.includes('nefrologia')) {
            category = 'clinical'
          } else if (titleLower.includes('acs') || titleLower.includes('jardins') || descLower.includes('comunitária')) {
            category = 'community-health'
          } else if (titleLower.includes('certificação') || titleLower.includes('pós-graduação')) {
            category = 'certification'
          }

          // Determinar badges baseado no título/descrição
          const badges: string[] = []
          if (titleLower.includes('aec')) badges.push('AEC')
          if (titleLower.includes('entrevista')) badges.push('Entrevista')
          if (titleLower.includes('cannabis')) badges.push('Cannabis')
          if (titleLower.includes('pós-graduação')) badges.push('Pós-Graduação')
          if (titleLower.includes('imre')) badges.push('IMRE')
          if (titleLower.includes('nefrologia')) badges.push('Nefrologia')
          if (titleLower.includes('acs')) badges.push('ACS')
          if (titleLower.includes('comunitária')) badges.push('Saúde Comunitária')
          if (titleLower.includes('dengue')) badges.push('Dengue')
          if (titleLower.includes('humanização')) badges.push('Humanização')
          if (titleLower.includes('comunicação')) badges.push('Comunicação')
          if (titleLower.includes('terapêutica')) badges.push('Terapêutica')
          if (titleLower.includes('certificação')) badges.push('Certificação')
          if (titleLower.includes('avaliação')) badges.push('Avaliação')

          // Formatar preço
          const price = course.price ? `R$ ${parseFloat(course.price).toFixed(2).replace('.', ',')}` : 'Gratuito'
          const originalPrice = course.original_price ? `R$ ${parseFloat(course.original_price).toFixed(2).replace('.', ',')}` : null

          // Verificar se há próxima aula (is_live)
          const isLive = course.is_live || false
          const nextClass = course.next_class_date || null

          // Determinar nível
          const level = course.level || 'Intermediário'

          return {
            id: course.id,
            title: course.title || 'Curso sem título',
            description: course.description || '',
            category,
            duration: course.duration || '0h',
            students: studentsCount || 0,
            rating: Math.round(avgRating * 10) / 10, // Arredondar para 1 casa decimal
            price,
            originalPrice,
            level,
            instructor: course.instructor || 'Instrutor',
            lessons: lessonsCount || 0,
            completed: userCompleted,
            progress: userProgress,
            isLive,
            nextClass,
            badges: badges.length > 0 ? badges : ['Curso'],
            href: course.slug ? `/course/${course.slug}` : `/course/${course.id}`
          } as Course
        })
      )

      setCourses(coursesWithStats)
    } catch (error) {
      console.error('Erro ao carregar cursos:', error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(course => course.category === selectedCategory)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen overflow-x-hidden w-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Carregando cursos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden w-full">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 w-full overflow-x-hidden">
        {/* Header */}
        <div className="mb-4 md:mb-6 lg:mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Cursos e Especializações
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            Desenvolva suas habilidades médicas com nossos cursos especializados
          </p>
        </div>

        {/* Categories */}
        <div className="mb-4 md:mb-6 lg:mb-8">
          <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-2 md:px-3 lg:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-slate-900 dark:text-white'
                    : 'bg-slate-100/50 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 hover:bg-slate-100/30 dark:hover:bg-slate-700/50 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          {/* Upload Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Conteúdo</span>
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 w-full overflow-x-hidden">
          {filteredCourses.map((course) => (
            <div key={course.id} className="card card-hover overflow-hidden w-full max-w-full">
              {/* Course Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20">
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-primary-600 dark:text-primary-400" />
                </div>
                {course.isLive && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-red-500 text-slate-900 dark:text-white px-2 py-1 rounded-full text-xs font-medium">
                      AO VIVO
                    </span>
                  </div>
                )}
                {course.completed && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                )}
              </div>

              {/* Course Content */}
              <div className="p-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {course.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 text-xs rounded-full"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Title and Description */}
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 break-words">
                  {course.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 break-words">
                  {course.description}
                </p>

                {/* Course Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4 mr-2" />
                    {course.duration}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-2" />
                    {course.students.toLocaleString()} alunos
                  </div>
                  {course.rating > 0 && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      {course.rating.toFixed(1)} ({course.lessons} aulas)
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Award className="w-4 h-4 mr-2" />
                    {course.level}
                  </div>
                </div>

                {/* Progress Bar */}
                {course.progress > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <span>Progresso</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Next Class */}
                {course.nextClass && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center text-sm text-blue-800 dark:text-blue-200">
                      <span className="mr-2">📅</span>
                      Próxima aula: {formatDate(course.nextClass)}
                    </div>
                  </div>
                )}

                {/* Price and Actions */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white">
                      {course.price}
                    </span>
                    {course.originalPrice && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">
                        {course.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {course.completed ? (
                    <button className="w-full bg-green-600 hover:bg-green-700 text-slate-900 dark:text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center">
                      <span className="mr-2">⬇️</span>
                      Baixar Certificado
                    </button>
                  ) : course.progress > 0 ? (
                    <Link
                      to={(course as any).href || `/course/${course.id}`}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-slate-900 dark:text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <span className="mr-2">▶️</span>
                      Continuar Curso
                    </Link>
                  ) : (
                    <Link
                      to={(course as any).href || `/course/${course.id}`}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-slate-900 dark:text-white py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <span className="mr-2">▶️</span>
                      Começar Curso
                    </Link>
                  )}
                  
                  <button className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-slate-100/30 dark:hover:bg-slate-700/50 py-2 px-4 rounded-lg transition-colors duration-200">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white dark:text-slate-900 dark:text-white mb-2">
              Nenhum curso encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Tente selecionar uma categoria diferente
            </p>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
            <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Adicionar Conteúdo ao Curso</h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Upload Type Selection */}
                <div className="mb-6">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setUploadType('ebook')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                        uploadType === 'ebook'
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>E-book</span>
                    </button>
                    <button
                      onClick={() => setUploadType('youtube')}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                        uploadType === 'youtube'
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>Vídeo YouTube</span>
                    </button>
                  </div>
                </div>

                {/* E-book Upload */}
                {uploadType === 'ebook' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Selecione o E-book
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.epub,.mobi"
                        className="block w-full text-sm text-slate-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary-50 file:text-primary-700
                          hover:file:bg-primary-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Título do E-book
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Guia Completo de Cannabis Medicinal"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Descrição
                      </label>
                      <textarea
                        placeholder="Descrição do conteúdo do e-book"
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Categoria
                      </label>
                      <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                        <option>Clínica</option>
                        <option>Cannabis Medicinal</option>
                        <option>Entrevista Clínica</option>
                        <option>Certificações</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* YouTube Upload */}
                {uploadType === 'youtube' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        URL do YouTube
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Título do Vídeo
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Aula 1 - Introdução à Cannabis Medicinal"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Descrição
                      </label>
                      <textarea
                        placeholder="Descrição do conteúdo do vídeo"
                        rows={3}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Duração (minutos)
                        </label>
                        <input
                          type="number"
                          placeholder="120"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Categoria
                        </label>
                        <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white">
                          <option>Aula</option>
                          <option>Palestra</option>
                          <option>Demonstração</option>
                          <option>Entrevista</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200">
                    {uploadType === 'ebook' ? '📚 Enviar E-book' : '🎥 Adicionar Vídeo'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Courses
