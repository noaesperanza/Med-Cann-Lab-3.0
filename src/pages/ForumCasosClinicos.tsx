import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  Plus, 
  Search, 
  MessageCircle, 
  Eye, 
  Star,
  Award,
  Clock,
  User,
  Edit,
  Trash2,
  BookOpen,
  Users,
  Heart
} from 'lucide-react'

interface CasePost {
  id: string
  title: string
  content: string
  author: {
    id: string
    name: string
    type: 'professional' | 'patient' | 'admin' | 'student'
    avatar?: string
  }
  category: string
  complexity: 'low' | 'medium' | 'high'
  specialty: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  views: number
  likes: number
  comments: number
  isBookmarked: boolean
  isPinned: boolean
  status: 'open' | 'closed' | 'resolved'
  attachments?: string[]
}

const ForumCasosClinicos: React.FC = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedComplexity, setSelectedComplexity] = useState('all')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [showFilters, setShowFilters] = useState(false)
  const [casePosts, setCasePosts] = useState<CasePost[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCases: 0,
    totalInteractions: 0,
    resolvedCases: 0,
    activeParticipants: 0
  })
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})

  // Carregar dados do fórum do Supabase
  useEffect(() => {
    loadForumData()
  }, [])

  const loadForumData = async () => {
    try {
      setLoading(true)

      // Buscar posts do fórum
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:author_id (
            id,
            name,
            type
          )
        `)
        .order('created_at', { ascending: false })

      if (postsError) {
        console.error('Erro ao buscar posts do fórum:', postsError)
        setCasePosts([])
        setLoading(false)
        return
      }

      // Buscar comentários para contar interações
      const { data: commentsData } = await supabase
        .from('forum_comments')
        .select('post_id, author_id')

      // Buscar likes
      const { data: likesData } = await supabase
        .from('forum_likes')
        .select('post_id')

      // Buscar views
      const { data: viewsData } = await supabase
        .from('forum_views')
        .select('post_id, user_id')

      // Converter posts para CasePost
      const posts: CasePost[] = (postsData || []).map((post: any) => {
        const author = post.author || { id: post.author_id, name: 'Autor', type: 'professional' }
        const comments = commentsData?.filter(c => c.post_id === post.id) || []
        const likes = likesData?.filter(l => l.post_id === post.id) || []
        const views = viewsData?.filter(v => v.post_id === post.id) || []

        // Extrair tags e categoria do conteúdo ou metadata
        const tags = post.tags || []
        const category = post.category || 'cannabis'
        const complexity = post.complexity || 'medium'
        const specialty = post.specialty || 'clinica-medica'
        const status = post.status || 'open'

        return {
          id: post.id,
          title: post.title,
          content: post.content || '',
          author: {
            id: author.id,
            name: author.name || 'Autor',
            type: author.type || 'professional'
          },
          category: category,
          complexity: complexity as 'low' | 'medium' | 'high',
          specialty: specialty,
          tags: tags,
          createdAt: new Date(post.created_at),
          updatedAt: new Date(post.updated_at || post.created_at),
          views: views.length,
          likes: likes.length,
          comments: comments.length,
          isBookmarked: false, // Buscar do Supabase se houver tabela de bookmarks
          isPinned: post.is_pinned || false,
          status: status as 'open' | 'closed' | 'resolved'
        }
      })

      setCasePosts(posts)

      // Calcular estatísticas
      const totalCases = posts.length
      const totalInteractions = (commentsData?.length || 0) + (likesData?.length || 0)
      const resolvedCases = posts.filter(p => p.status === 'resolved').length
      const uniqueParticipants = new Set([
        ...(postsData || []).map((p: any) => p.author_id),
        ...(commentsData || []).map((c: any) => c.author_id)
      ]).size

      setStats({
        totalCases,
        totalInteractions,
        resolvedCases,
        activeParticipants: uniqueParticipants
      })

      // Calcular contagens por categoria
      const counts: Record<string, number> = {}
      posts.forEach(post => {
        counts[post.category] = (counts[post.category] || 0) + 1
      })
      setCategoryCounts(counts)

      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar dados do fórum:', error)
      setCasePosts([])
      setLoading(false)
    }
  }

  const categories = [
    { id: 'all', name: 'Todas as Categorias', count: stats.totalCases },
    { id: 'cannabis', name: 'Cannabis Medicinal', count: categoryCounts['cannabis'] || 0 },
    { id: 'nefrologia', name: 'Nefrologia', count: categoryCounts['nefrologia'] || 0 },
    { id: 'dor-cronica', name: 'Dor Crônica', count: categoryCounts['dor-cronica'] || 0 },
    { id: 'ansiedade', name: 'Ansiedade', count: categoryCounts['ansiedade'] || 0 },
    { id: 'epilepsia', name: 'Epilepsia', count: categoryCounts['epilepsia'] || 0 },
    { id: 'cancer', name: 'Oncologia', count: categoryCounts['cancer'] || 0 }
  ]

  const complexities = [
    { id: 'all', name: 'Todas as Complexidades' },
    { id: 'low', name: 'Baixa' },
    { id: 'medium', name: 'Média' },
    { id: 'high', name: 'Alta' }
  ]

  const specialties = [
    { id: 'all', name: 'Todas as Especialidades' },
    { id: 'clinica-medica', name: 'Clínica Médica' },
    { id: 'nefrologia', name: 'Nefrologia' },
    { id: 'neurologia', name: 'Neurologia' },
    { id: 'oncologia', name: 'Oncologia' },
    { id: 'psiquiatria', name: 'Psiquiatria' },
    { id: 'anestesiologia', name: 'Anestesiologia' }
  ]

  // casePosts agora vem do estado, carregado do Supabase

  const filteredPosts = casePosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    const matchesComplexity = selectedComplexity === 'all' || post.complexity === selectedComplexity
    const matchesSpecialty = selectedSpecialty === 'all' || post.specialty === selectedSpecialty
    return matchesSearch && matchesCategory && matchesComplexity && matchesSpecialty
  })

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'low':
        return 'Baixa'
      case 'medium':
        return 'Média'
      case 'high':
        return 'Alta'
      default:
        return complexity
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
      case 'resolved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberto'
      case 'closed':
        return 'Fechado'
      case 'resolved':
        return 'Resolvido'
      default:
        return status
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora mesmo'
    if (diffInHours < 24) return `${diffInHours}h atrás`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w atrás`
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-xl p-4 md:p-6 lg:p-8 mb-4 md:mb-6 border border-purple-500/50 shadow-xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-3 mb-3 md:mb-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    <BookOpen className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 break-words">
                      🏛️ Fórum de Casos Clínicos
                    </h1>
                    <p className="text-white/90 text-sm md:text-base lg:text-lg break-words">
                      Compartilhe casos, discuta protocolos e aprenda com a comunidade
                    </p>
                  </div>
                </div>
              </div>
              <button className="bg-white text-purple-600 px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 rounded-xl font-bold text-sm md:text-base lg:text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 flex-shrink-0 whitespace-nowrap">
                <Plus className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                <span>Novo Caso</span>
              </button>
            </div>

            {/* Acesso ético e seguro - Tipos de usuários no header */}
            <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-xl p-3 md:p-4 border-2 border-purple-500/30 shadow-lg backdrop-blur-sm overflow-hidden">
              <div className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-3">
                <div className="p-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow-md flex-shrink-0">
                  <Award className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-white">
                  🔒 Acesso ético e seguro
                </h3>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs md:text-sm">
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 md:w-4 md:h-4 text-purple-400 flex-shrink-0" />
                  <span className="text-purple-200"><strong className="text-white">Profissional:</strong> Clínica, Ensino e Pesquisa</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-green-400 flex-shrink-0" />
                  <span className="text-purple-200"><strong className="text-white">Aluno:</strong> Ensino e Pesquisa</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3 md:w-4 md:h-4 text-red-400 flex-shrink-0" />
                  <span className="text-purple-200"><strong className="text-white">Paciente:</strong> Temas exclusivos sobre Ensino, Pesquisa e Saúde</span>
                </div>
              </div>
            </div>
          </div>

          {/* Banner de Avisos e Como Participar */}
          <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-xl p-3 md:p-4 border-2 border-purple-500/30 shadow-lg backdrop-blur-sm overflow-hidden w-full max-w-full mb-4 md:mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-4">
              {/* Como Participar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2 md:mb-3">
                  <div className="p-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-md flex-shrink-0">
                    <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-white">
                    📖 Como Participar
                  </h3>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm text-purple-200">
                  <span>• Escolha um canal ou tema</span>
                  <span>• Respeite o código de conduta</span>
                  <span>• Contribua com conhecimento</span>
                  <span>• Respeite as limitações do seu tipo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="card p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar casos clínicos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-700 text-white placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-slate-100/30 dark:hover:bg-slate-700/50 transition-colors duration-200"
              >
                    <span className="mr-2">🔍</span>
                Filtros
                {showFilters ? <span className="ml-2">▲</span> : <span className="ml-2">▼</span>}
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoria
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-100/50 dark:bg-slate-800/80 text-slate-900 dark:text-white dark:text-slate-900 dark:text-white"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Complexidade
                  </label>
                  <select
                    value={selectedComplexity}
                    onChange={(e) => setSelectedComplexity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-100/50 dark:bg-slate-800/80 text-slate-900 dark:text-white dark:text-slate-900 dark:text-white"
                  >
                    {complexities.map((complexity) => (
                      <option key={complexity.id} value={complexity.id}>
                        {complexity.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Especialidade
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-100/50 dark:bg-slate-800/80 text-slate-900 dark:text-white dark:text-slate-900 dark:text-white"
                  >
                    {specialties.map((specialty) => (
                      <option key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-slate-400">Carregando casos clínicos...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
            <div key={post.id} className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {post.author.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-white">
                        {post.title}
                      </h3>
                      {post.isPinned && (
                        <Star className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <span>{post.author.name}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(post.createdAt)}</span>
                      {post.updatedAt.getTime() !== post.createdAt.getTime() && (
                        <>
                          <span>•</span>
                          <span>editado</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(post.status)}`}>
                    {getStatusLabel(post.status)}
                  </span>
                  <button className="p-1 text-slate-400 hover:text-white">
                      <span>⋯</span>
                  </button>
                </div>
              </div>

              <p className="text-slate-300 mb-4 line-clamp-3">
                {post.content}
              </p>

              {/* Tags and Categories */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(post.complexity)}`}>
                  {getComplexityLabel(post.complexity)}
                </span>
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats and Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>👍</span>
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className={`p-2 rounded-lg transition-colors duration-200 ${
                    post.isBookmarked
                      ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}>
                    <span>🔖</span>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                    <span>📤</span>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
                    <span>🚩</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white dark:text-slate-900 dark:text-white mb-2">
              Nenhum caso encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Tente ajustar os filtros ou criar um novo caso clínico
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6 text-center">
            <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white">{stats.totalCases.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Casos Discutidos</div>
          </div>
          <div className="card p-6 text-center">
            <div className="w-8 h-8 text-green-600 mx-auto mb-2 text-2xl">👍</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white">{stats.totalInteractions.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Interações</div>
          </div>
          <div className="card p-6 text-center">
            <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white">{stats.resolvedCases.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Casos Resolvidos</div>
          </div>
          <div className="card p-6 text-center">
            <div className="w-8 h-8 text-orange-600 mx-auto mb-2 text-2xl">👥</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white">{stats.activeParticipants.toLocaleString()}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Participantes Ativos</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForumCasosClinicos
