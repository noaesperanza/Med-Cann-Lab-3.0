import React, { useState } from 'react'
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
  Link as LinkIcon
} from 'lucide-react'

const Courses: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadType, setUploadType] = useState<'ebook' | 'youtube'>('ebook')

  const categories = [
    { id: 'all', name: 'Todos os Cursos' },
    { id: 'clinical', name: 'Clínica' },
    { id: 'cannabis', name: 'Cannabis Medicinal' },
    { id: 'interview', name: 'Entrevista Clínica' },
    { id: 'certification', name: 'Certificações' },
    { id: 'community-health', name: 'Saúde Comunitária' }
  ]

  const courses = [
    {
      id: 1,
      title: 'Arte da Entrevista Clínica',
      description: 'Curso completo de 8 horas sobre metodologia AEC e técnicas de entrevista clínica humanizada',
      category: 'interview',
      duration: '8h',
      students: 1247,
      rating: 4.9,
      price: 'R$ 299',
      originalPrice: 'R$ 399',
      level: 'Intermediário',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+QjzwvdGV4dD4KPC9zdmc+',
      instructor: 'Dr. João Silva',
      lessons: 12,
      completed: false,
      progress: 0,
      isLive: false,
      nextClass: null,
      badges: ['AEC', 'Entrevista', 'Humanização']
    },
    {
      id: 2,
      title: 'Pós-Graduação Cannabis Medicinal',
      description: 'Especialização completa de 12 meses com 520 horas em cannabis medicinal e terapêutica',
      category: 'cannabis',
      duration: '520h',
      students: 856,
      rating: 4.8,
      price: 'R$ 2.999',
      originalPrice: 'R$ 3.999',
      level: 'Avançado',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+QjzwvdGV4dD4KPC9zdmc+',
      instructor: 'Dra. Maria Santos',
      lessons: 48,
      completed: false,
      progress: 0,
      isLive: true,
      nextClass: '2025-01-15T14:00:00Z',
      badges: ['Cannabis', 'Pós-Graduação', 'Certificação']
    },
    {
      id: 3,
      title: 'Sistema IMRE Triaxial',
      description: 'Avaliação clínica completa com 28 blocos especializados em nefrologia e medicina interna',
      category: 'clinical',
      duration: '16h',
      students: 634,
      rating: 4.7,
      price: 'R$ 199',
      originalPrice: 'R$ 299',
      level: 'Básico',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+QjzwvdGV4dD4KPC9zdmc+',
      instructor: 'Dr. Carlos Oliveira',
      lessons: 8,
      completed: true,
      progress: 100,
      isLive: false,
      nextClass: null,
      badges: ['IMRE', 'Nefrologia', 'Avaliação']
    },
    {
      id: 4,
      title: 'Metodologia AEC Avançada',
      description: 'Técnicas avançadas de escuta clínica e comunicação terapêutica',
      category: 'clinical',
      duration: '12h',
      students: 423,
      rating: 4.6,
      price: 'R$ 249',
      originalPrice: 'R$ 349',
      level: 'Avançado',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+QjzwvdGV4dD4KPC9zdmc+',
      instructor: 'Dra. Ana Costa',
      lessons: 15,
      completed: false,
      progress: 45,
      isLive: true,
      nextClass: '2025-01-12T10:00:00Z',
      badges: ['AEC', 'Comunicação', 'Terapêutica']
    },
    {
      id: 5,
      title: 'Jardins de Cura - Formação para ACS',
      description: 'Programa de Formação para Agentes Comunitários de Saúde em Prevenção e Cuidado de Dengue',
      category: 'community-health',
      duration: '40h',
      students: 0,
      rating: 0,
      price: 'Gratuito',
      originalPrice: null,
      level: 'Básico a Intermediário',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+QjzwvdGV4dD4KPC9zdmc+',
      instructor: 'Projeto Jardins de Cura',
      lessons: 33,
      completed: false,
      progress: 0,
      isLive: false,
      nextClass: null,
      badges: ['ACS', 'Saúde Comunitária', 'Dengue'],
      href: '/curso-jardins-de-cura'
    }
  ]

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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white mb-2">
            Cursos e Especializações
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Desenvolva suas habilidades médicas com nossos cursos especializados
          </p>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div key={course.id} className="card card-hover overflow-hidden">
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
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white mb-2">
                  {course.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
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
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Star className="w-4 h-4 mr-2 text-yellow-500" />
                    {course.rating} ({course.lessons} aulas)
                  </div>
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
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
