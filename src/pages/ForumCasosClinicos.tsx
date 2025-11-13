import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { NoaResidentAI } from '../lib/noaResidentAI'
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
  Heart,
  Upload,
  FileText,
  X,
  Send,
  Brain,
  Stethoscope,
  Zap,
  Target,
  CheckCircle,
  Loader2,
  GraduationCap
} from 'lucide-react'

// Tipos para racionalidades médicas
type Rationality = 'biomedical' | 'traditional_chinese' | 'ayurvedic' | 'homeopathic' | 'integrative'

const RATIONALITY_OPTIONS: Array<{
  key: Rationality
  label: string
  icon: React.ReactNode
  color: string
}> = [
  { key: 'biomedical', label: 'Biomédica', icon: <Heart className="w-4 h-4" />, color: 'text-blue-500' },
  { key: 'traditional_chinese', label: 'MTC', icon: <Stethoscope className="w-4 h-4" />, color: 'text-red-500' },
  { key: 'ayurvedic', label: 'Ayurvédica', icon: <Zap className="w-4 h-4" />, color: 'text-yellow-500' },
  { key: 'homeopathic', label: 'Homeopática', icon: <Target className="w-4 h-4" />, color: 'text-purple-500' },
  { key: 'integrative', label: 'Integrativa', icon: <Brain className="w-4 h-4" />, color: 'text-green-500' }
]

const RATIONALITY_LABEL: Record<Rationality, string> = {
  biomedical: 'Biomédica',
  traditional_chinese: 'Medicina Tradicional Chinesa',
  ayurvedic: 'Ayurvédica',
  homeopathic: 'Homeopática',
  integrative: 'Integrativa'
}

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
  rationality_analysis?: Record<Rationality, string>
  ai_discussion?: string
}

interface NewCaseForm {
  title: string
  content: string
  category: string
  complexity: 'low' | 'medium' | 'high'
  specialty: string
  tags: string[]
  uploadedFiles: File[]
  aiDiscussion: string
  rationalityAnalysis: Record<Rationality, string>
}

const ForumCasosClinicos: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedComplexity, setSelectedComplexity] = useState('all')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [casePosts, setCasePosts] = useState<CasePost[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewCaseModal, setShowNewCaseModal] = useState(false)
  const [noaAI] = useState(() => new NoaResidentAI())
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'ai', content: string }>>([])
  const [aiInput, setAiInput] = useState('')
  const [isAiProcessing, setIsAiProcessing] = useState(false)
  const [selectedRationality, setSelectedRationality] = useState<Rationality | null>(null)
  const [isAnalyzingRationality, setIsAnalyzingRationality] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const [newCase, setNewCase] = useState<NewCaseForm>({
    title: '',
    content: '',
    category: 'cannabis',
    complexity: 'medium',
    specialty: 'clinica-medica',
    tags: [],
    uploadedFiles: [],
    aiDiscussion: '',
    rationalityAnalysis: {
      biomedical: '',
      traditional_chinese: '',
      ayurvedic: '',
      homeopathic: '',
      integrative: ''
    }
  })

  const stats = {
    totalCases: casePosts.length,
    totalInteractions: casePosts.reduce((sum, post) => sum + post.comments + post.likes, 0),
    resolvedCases: casePosts.filter(p => p.status === 'resolved').length,
    activeParticipants: new Set(casePosts.map(p => p.author.id)).size
  }

  const categoryCounts = casePosts.reduce((acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  useEffect(() => {
    loadForumData()
  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [aiMessages])

  const loadForumData = async () => {
    try {
      setLoading(true)

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

      const { data: commentsData } = await supabase
        .from('forum_comments')
        .select('post_id, author_id')

      const { data: likesData } = await supabase
        .from('forum_likes')
        .select('post_id')

      const { data: viewsData } = await supabase
        .from('forum_views')
        .select('post_id, user_id')

      const posts: CasePost[] = (postsData || []).map((post: any) => {
        const author = post.author || { id: post.author_id, name: 'Autor', type: 'professional' }
        const comments = commentsData?.filter(c => c.post_id === post.id) || []
        const likes = likesData?.filter(l => l.post_id === post.id) || []
        const views = viewsData?.filter(v => v.post_id === post.id) || []

        return {
          id: post.id,
          title: post.title,
          content: post.content || '',
          author: {
            id: author.id,
            name: author.name || 'Autor',
            type: author.type || 'professional'
          },
          category: post.category || 'cannabis',
          complexity: (post.complexity || 'medium') as 'low' | 'medium' | 'high',
          specialty: post.specialty || 'clinica-medica',
          tags: post.tags || [],
          createdAt: new Date(post.created_at),
          updatedAt: new Date(post.updated_at || post.created_at),
          views: views.length,
          likes: likes.length,
          comments: comments.length,
          isBookmarked: false,
          isPinned: post.is_pinned || false,
          status: (post.status || 'open') as 'open' | 'closed' | 'resolved',
          attachments: post.attachments || [],
          rationality_analysis: post.rationality_analysis || {},
          ai_discussion: post.ai_discussion || ''
        }
      })

      setCasePosts(posts)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar dados do fórum:', error)
      setCasePosts([])
      setLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setNewCase(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, ...files]
    }))
  }

  const removeFile = (index: number) => {
    setNewCase(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }))
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const handleSendAIMessage = async () => {
    if (!aiInput.trim() || isAiProcessing) return

    const userMessage = aiInput.trim()
    setAiInput('')
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsAiProcessing(true)

    try {
      // Incluir contexto do caso atual
      const caseContext = `
Caso Clínico:
Título: ${newCase.title}
Conteúdo: ${newCase.content}
Categoria: ${newCase.category}
Complexidade: ${newCase.complexity}
Especialidade: ${newCase.specialty}
Tags: ${newCase.tags.join(', ')}
${newCase.uploadedFiles.length > 0 ? `\nDocumentos anexados: ${newCase.uploadedFiles.length} arquivo(s)` : ''}
      `.trim()

      const fullMessage = `${caseContext}\n\nPergunta do profissional: ${userMessage}`
      const response = await noaAI.processMessage(fullMessage, user?.id, user?.email)

      setAiMessages(prev => [...prev, { role: 'ai', content: response.content }])
      
      // Atualizar discussão AI no formulário
      setNewCase(prev => ({
        ...prev,
        aiDiscussion: prev.aiDiscussion 
          ? `${prev.aiDiscussion}\n\n[${new Date().toLocaleString('pt-BR')}]\nPergunta: ${userMessage}\nResposta: ${response.content}`
          : `[${new Date().toLocaleString('pt-BR')}]\nPergunta: ${userMessage}\nResposta: ${response.content}`
      }))
    } catch (error) {
      console.error('Erro ao processar mensagem da IA:', error)
      setAiMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.' 
      }])
    } finally {
      setIsAiProcessing(false)
    }
  }

  const handleAnalyzeRationality = async (rationality: Rationality) => {
    if (isAnalyzingRationality) return

    setIsAnalyzingRationality(true)
    setSelectedRationality(rationality)

    try {
      const caseContext = `
Caso Clínico para análise:
Título: ${newCase.title}
Conteúdo: ${newCase.content}
Categoria: ${newCase.category}
Complexidade: ${newCase.complexity}
Especialidade: ${newCase.specialty}
Tags: ${newCase.tags.join(', ')}
${newCase.uploadedFiles.length > 0 ? `\nDocumentos anexados: ${newCase.uploadedFiles.length} arquivo(s)` : ''}

Analise este caso clínico sob a perspectiva da racionalidade médica: ${RATIONALITY_LABEL[rationality]}.

Forneça:
1. Análise do caso sob esta racionalidade
2. Principais aspectos a considerar
3. Abordagem terapêutica sugerida
4. Pontos de atenção
      `.trim()

      const response = await noaAI.processMessage(caseContext, user?.id, user?.email)
      
      setNewCase(prev => ({
        ...prev,
        rationalityAnalysis: {
          ...prev.rationalityAnalysis,
          [rationality]: response.content
        }
      }))
    } catch (error) {
      console.error('Erro ao analisar racionalidade:', error)
      setNewCase(prev => ({
        ...prev,
        rationalityAnalysis: {
          ...prev.rationalityAnalysis,
          [rationality]: 'Erro ao analisar esta racionalidade. Tente novamente.'
        }
      }))
    } finally {
      setIsAnalyzingRationality(false)
    }
  }

  const handleSubmitCase = async () => {
    if (!newCase.title.trim() || !newCase.content.trim()) {
      alert('Preencha o título e o conteúdo do caso')
      return
    }

    if (!user) {
      alert('Você precisa estar logado para criar um caso')
      return
    }

    try {
      // Upload de arquivos se houver
      const uploadedFileUrls: string[] = []
      
      for (const file of newCase.uploadedFiles) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `forum-cases/${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('forum-attachments')
          .upload(filePath, file)

        if (!uploadError) {
          const { data } = supabase.storage
            .from('forum-attachments')
            .getPublicUrl(filePath)
          uploadedFileUrls.push(data.publicUrl)
        }
      }

      // Salvar caso no banco
      const { data, error } = await supabase
        .from('forum_posts')
        .insert([{
          title: newCase.title,
          content: newCase.content,
          category: newCase.category,
          complexity: newCase.complexity,
          specialty: newCase.specialty,
          tags: newCase.tags,
          author_id: user.id,
          attachments: uploadedFileUrls,
          rationality_analysis: newCase.rationalityAnalysis,
          ai_discussion: newCase.aiDiscussion,
          status: 'open'
        }])
        .select()
        .single()

      if (error) {
        console.error('Erro ao salvar caso:', error)
        alert('Erro ao salvar caso. Tente novamente.')
        return
      }

      // Resetar formulário
      setNewCase({
        title: '',
        content: '',
        category: 'cannabis',
        complexity: 'medium',
        specialty: 'clinica-medica',
        tags: [],
        uploadedFiles: [],
        aiDiscussion: '',
        rationalityAnalysis: {
          biomedical: '',
          traditional_chinese: '',
          ayurvedic: '',
          homeopathic: '',
          integrative: ''
        }
      })
      setAiMessages([])
      setShowNewCaseModal(false)

      // Recarregar casos
      await loadForumData()

      alert('Caso criado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar caso:', error)
      alert('Erro ao criar caso. Tente novamente.')
    }
  }

  const handleCreateLessonFromCase = (caseId: string) => {
    navigate(`/app/ensino/profissional/preparacao-aulas?case_id=${caseId}`)
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
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
        return 'bg-green-100 text-green-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      case 'resolved':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  // Paleta de cores da landing page: verde #00C16A, azul, slate-900
  const primaryGreen = '#00C16A'
  const primaryBlue = '#0ea5e9'
  const bgGradient = 'from-slate-900 via-blue-900 to-green-800'

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300C16A' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div 
            className="rounded-xl p-4 md:p-6 lg:p-8 mb-4 md:mb-6 border shadow-xl overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${primaryGreen} 0%, ${primaryBlue} 100%)`,
              borderColor: `${primaryGreen}80`
            }}
          >
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
              <button 
                onClick={() => setShowNewCaseModal(true)}
                className="bg-white text-green-600 px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 rounded-xl font-bold text-sm md:text-base lg:text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 flex-shrink-0 whitespace-nowrap"
                style={{ color: primaryGreen }}
              >
                <Plus className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0" />
                <span>Novo Caso</span>
              </button>
            </div>

            {/* Acesso ético e seguro */}
            <div 
              className="rounded-xl p-3 md:p-4 border-2 shadow-lg backdrop-blur-sm overflow-hidden"
              style={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
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
                  <Users className="w-3 h-3 md:w-4 md:h-4 text-green-300 flex-shrink-0" />
                  <span className="text-white/90"><strong className="text-white">Profissional:</strong> Clínica, Ensino e Pesquisa</span>
                </div>
                <div className="flex items-center space-x-1">
                  <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-blue-300 flex-shrink-0" />
                  <span className="text-white/90"><strong className="text-white">Aluno:</strong> Ensino e Pesquisa</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="w-3 h-3 md:w-4 md:h-4 text-pink-300 flex-shrink-0" />
                  <span className="text-white/90"><strong className="text-white">Paciente:</strong> Temas exclusivos sobre Ensino, Pesquisa e Saúde</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
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
                    className="w-full pl-10 pr-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-700 text-white placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors duration-200 text-white"
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Categoria
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-700 text-white"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Complexidade
                  </label>
                  <select
                    value={selectedComplexity}
                    onChange={(e) => setSelectedComplexity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-700 text-white"
                  >
                    {complexities.map((complexity) => (
                      <option key={complexity.id} value={complexity.id}>
                        {complexity.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Especialidade
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-700 text-white"
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Carregando casos clínicos...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <div key={post.id} className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: primaryGreen }}
                    >
                      {post.author.name.split(' ').map(n => n[0]).join('')}
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
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(post.status)}`}>
                      {getStatusLabel(post.status)}
                    </span>
                    <button 
                      onClick={() => handleCreateLessonFromCase(post.id)}
                      className="p-2 text-green-400 hover:text-green-300 hover:bg-slate-700 rounded-lg transition-colors"
                      title="Criar aula baseada neste caso"
                    >
                      <GraduationCap className="w-4 h-4" />
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
                      className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats and Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-sm text-slate-400">
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Nenhum caso encontrado
            </h3>
            <p className="text-slate-400">
              Tente ajustar os filtros ou criar um novo caso clínico
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/80 rounded-lg p-6 text-center border border-slate-700">
            <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalCases.toLocaleString()}</div>
            <div className="text-sm text-slate-400">Casos Discutidos</div>
          </div>
          <div className="bg-slate-800/80 rounded-lg p-6 text-center border border-slate-700">
            <div className="w-8 h-8 text-green-500 mx-auto mb-2 text-2xl">👍</div>
            <div className="text-2xl font-bold text-white">{stats.totalInteractions.toLocaleString()}</div>
            <div className="text-sm text-slate-400">Interações</div>
          </div>
          <div className="bg-slate-800/80 rounded-lg p-6 text-center border border-slate-700">
            <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.resolvedCases.toLocaleString()}</div>
            <div className="text-sm text-slate-400">Casos Resolvidos</div>
          </div>
          <div className="bg-slate-800/80 rounded-lg p-6 text-center border border-slate-700">
            <div className="w-8 h-8 text-orange-500 mx-auto mb-2 text-2xl">👥</div>
            <div className="text-2xl font-bold text-white">{stats.activeParticipants.toLocaleString()}</div>
            <div className="text-sm text-slate-400">Participantes Ativos</div>
          </div>
        </div>
      </div>

      {/* Modal Novo Caso */}
      {showNewCaseModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-white">Novo Caso Clínico</h2>
              <button
                onClick={() => setShowNewCaseModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Informações Básicas</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Título do Caso *
                  </label>
                  <input
                    type="text"
                    value={newCase.title}
                    onChange={(e) => setNewCase(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-700 text-white"
                    placeholder="Ex: Paciente com dor crônica refratária"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Descrição do Caso *
                  </label>
                  <textarea
                    value={newCase.content}
                    onChange={(e) => setNewCase(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                    className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-700 text-white"
                    placeholder="Descreva o caso clínico em detalhes..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Categoria
                    </label>
                    <select
                      value={newCase.category}
                      onChange={(e) => setNewCase(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-700 text-white"
                    >
                      {categories.filter(c => c.id !== 'all').map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Complexidade
                    </label>
                    <select
                      value={newCase.complexity}
                      onChange={(e) => setNewCase(prev => ({ ...prev, complexity: e.target.value as 'low' | 'medium' | 'high' }))}
                      className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-700 text-white"
                    >
                      {complexities.filter(c => c.id !== 'all').map((complexity) => (
                        <option key={complexity.id} value={complexity.id}>
                          {complexity.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Especialidade
                    </label>
                    <select
                      value={newCase.specialty}
                      onChange={(e) => setNewCase(prev => ({ ...prev, specialty: e.target.value }))}
                      className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-700 text-white"
                    >
                      {specialties.filter(s => s.id !== 'all').map((specialty) => (
                        <option key={specialty.id} value={specialty.id}>
                          {specialty.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    value={newCase.tags.join(', ')}
                    onChange={(e) => setNewCase(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                    }))}
                    className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-700 text-white"
                    placeholder="Ex: cannabis, dor crônica, nefrologia"
                  />
                </div>
              </div>

              {/* Upload de Documentos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Documentos (Anamneses Antigas)</h3>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center space-x-2 px-4 py-2 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors text-white"
                >
                  <Upload className="w-4 h-4" />
                  <span>Adicionar Documentos</span>
                </button>

                {newCase.uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {newCase.uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span className="text-white text-sm">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat com IA */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-green-500" />
                  <span>Discussão com IA Residente</span>
                </h3>

                <div 
                  ref={chatContainerRef}
                  className="bg-slate-900 rounded-lg p-4 h-64 overflow-y-auto space-y-4 border border-slate-700"
                >
                  {aiMessages.length === 0 && (
                    <div className="text-center text-slate-400 py-8">
                      <Brain className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p>Inicie uma conversa com a IA sobre este caso</p>
                    </div>
                  )}
                  {aiMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === 'user'
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-700 text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isAiProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-slate-700 rounded-lg p-3">
                        <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendAIMessage()}
                    placeholder="Pergunte à IA sobre o caso..."
                    className="flex-1 px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-700 text-white"
                  />
                  <button
                    onClick={handleSendAIMessage}
                    disabled={isAiProcessing || !aiInput.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Conclusões Compartilhadas com IA
                  </label>
                  <textarea
                    value={newCase.aiDiscussion}
                    onChange={(e) => setNewCase(prev => ({ ...prev, aiDiscussion: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-700 text-white"
                    placeholder="Registre as conclusões da discussão com a IA aqui..."
                  />
                </div>
              </div>

              {/* Análise por Racionalidades Médicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Análise por Racionalidades Médicas</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  {RATIONALITY_OPTIONS.map((rationality) => (
                    <button
                      key={rationality.key}
                      onClick={() => handleAnalyzeRationality(rationality.key)}
                      disabled={isAnalyzingRationality}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        selectedRationality === rationality.key
                          ? 'border-green-500 bg-green-500/20'
                          : 'border-slate-600 bg-slate-700 hover:bg-slate-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div className={`${rationality.color} mb-2 flex justify-center`}>
                        {rationality.icon}
                      </div>
                      <div className="text-white text-xs font-medium text-center">
                        {rationality.label}
                      </div>
                      {newCase.rationalityAnalysis[rationality.key] && (
                        <CheckCircle className="w-4 h-4 text-green-500 mx-auto mt-2" />
                      )}
                    </button>
                  ))}
                </div>

                {selectedRationality && newCase.rationalityAnalysis[selectedRationality] && (
                  <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                    <h4 className="text-white font-semibold mb-2">
                      Análise: {RATIONALITY_LABEL[selectedRationality]}
                    </h4>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">
                      {newCase.rationalityAnalysis[selectedRationality]}
                    </p>
                  </div>
                )}

                {isAnalyzingRationality && (
                  <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center space-x-2 text-slate-300">
                      <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                      <span>Analisando caso...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-slate-700">
                <button
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-6 py-2 border border-slate-600 rounded-lg text-white hover:bg-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitCase}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  style={{ backgroundColor: primaryGreen }}
                >
                  Publicar Caso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ForumCasosClinicos
