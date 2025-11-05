import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'
import { 
  BookOpen, FileText, Users, Clock, Search, Plus, Video, Presentation, 
  Edit, Save, Globe, Book, Upload, Download, ArrowLeft, 
  RotateCcw, HelpCircle, CheckCircle, XCircle, Image, File, 
  Layout, Type, Sparkles, Brain
} from 'lucide-react'

interface Case {
  id: string
  patient_name: string
  diagnosis: string
  created_at: string
  clinical_report: string
}

interface Lesson {
  id: string
  title: string
  description: string
  case_id?: string
  duration_minutes: number
  created_at: string
  status: 'draft' | 'published' | 'archived'
}

export function LessonPreparation() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { openChat, sendInitialMessage } = useNoaPlatform()
  const [cases, setCases] = useState<Case[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewLesson, setShowNewLesson] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [activeTab, setActiveTab] = useState<'cases' | 'lessons' | 'editor' | 'slides' | 'flipped' | 'quizzes'>('cases')
  
  // Slides states
  const [slides, setSlides] = useState<any[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slideTitle, setSlideTitle] = useState('')
  const [slideContent, setSlideContent] = useState('')
  
  // Flipped Classroom states
  const [flippedLessons, setFlippedLessons] = useState<any[]>([])
  const [newFlippedLesson, setNewFlippedLesson] = useState({
    title: '',
    preClassMaterial: '',
    inClassActivity: '',
    postClassActivity: ''
  })
  
  // Quiz states
  const [quizzes, setQuizzes] = useState<any[]>([])
  const [currentQuiz, setCurrentQuiz] = useState<any>(null)
  const [quizQuestions, setQuizQuestions] = useState<any[]>([])
  
  // Editor states
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [editorContent, setEditorContent] = useState({
    title: '',
    abstract: '',
    introduction: '',
    methodology: '',
    results: '',
    discussion: '',
    conclusion: '',
    keywords: '',
    references: ''
  })

  useEffect(() => {
    loadCases()
    loadLessons()
    loadSlides()
    
    // Listener para detectar quando a IA cria um slide
    const handleSlideCreated = (event: CustomEvent) => {
      const slideData = event.detail
      if (slideData && slideData.title) {
        console.log('📝 Slide criado pela IA detectado:', slideData)
        
        // Verificar se o slide já existe (evitar duplicatas)
        const slideExists = slides.some(s => s.id === slideData.id || s.title === slideData.title)
        if (slideExists) {
          console.log('⚠️ Slide já existe, atualizando...')
          setSlides(prev => prev.map(s => 
            (s.id === slideData.id || s.title === slideData.title)
              ? { ...s, title: slideData.title, content: slideData.content || s.content }
              : s
          ))
        } else {
          const newSlide = {
            id: slideData.id || `slide_${Date.now()}`,
            title: slideData.title,
            content: slideData.content || '',
            order: slides.length
          }
          setSlides(prev => {
            const updated = [...prev, newSlide]
            console.log('✅ Slide adicionado à lista:', updated.length, 'slides')
            return updated
          })
          setCurrentSlide(slides.length)
        }
        
        // Mudar para a aba de slides e recarregar do Supabase
        setActiveTab('slides')
        loadSlides()
      }
    }
    
    // Listener para detectar quando a IA atualiza um slide
    const handleSlideUpdated = (event: CustomEvent) => {
      const slideData = event.detail
      if (slideData && slideData.id) {
        setSlides(prev => prev.map(slide => 
          slide.id === slideData.id 
            ? { ...slide, title: slideData.title, content: slideData.content || slide.content }
            : slide
        ))
      }
    }
    
    window.addEventListener('slideCreated', handleSlideCreated as EventListener)
    window.addEventListener('slideUpdated', handleSlideUpdated as EventListener)
    
    return () => {
      window.removeEventListener('slideCreated', handleSlideCreated as EventListener)
      window.removeEventListener('slideUpdated', handleSlideUpdated as EventListener)
    }
  }, [slides.length])

  const loadCases = async () => {
    try {
      const { data } = await supabase
        .from('clinical_assessments')
        .select('*')
        .limit(20)
      
      if (data) {
        setCases(data.map(assessment => ({
          id: assessment.id,
          patient_name: assessment.patient_name || 'Paciente',
          diagnosis: assessment.diagnosis || 'Não especificado',
          created_at: assessment.created_at,
          clinical_report: assessment.clinical_report || ''
        })))
      }
    } catch (error) {
      console.error('Erro ao carregar casos:', error)
    }
  }

  const loadSlides = async () => {
    try {
      if (!user?.id) return
      
      // Buscar slides do Supabase (usar documents com categoria 'slides')
      const authorFilter = user.name || user.email
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('category', 'slides')
        .or(`author.eq.${authorFilter},author.eq.${user.email}`)
        .order('created_at', { ascending: true })
      
      if (error) {
        console.warn('⚠️ Erro ao carregar slides do Supabase, usando estado local:', error)
        return
      }
      
      if (data && data.length > 0) {
        const loadedSlides = data.map((doc, index) => ({
          id: doc.id,
          title: doc.title || `Slide ${index + 1}`,
          content: doc.content || doc.summary || '',
          order: index
        }))
        setSlides(loadedSlides)
        if (loadedSlides.length > 0) {
          setCurrentSlide(0)
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar slides:', error)
    }
  }

  const saveSlide = async (slide: any) => {
    try {
      if (!user?.id) return
      
      const slideData = {
        title: slide.title,
        content: slide.content || '',
        category: 'slides',
        file_type: 'slide',
        author: user.name || user.email,
        summary: slide.content?.substring(0, 200) || '',
        tags: ['slide', 'aula', 'pedagogico'],
        keywords: ['slide', 'presentation'],
        target_audience: ['student', 'professional'],
        isLinkedToAI: true
      }
      
      // Se o slide tem ID do Supabase (UUID), atualizar
      if (slide.id && slide.id.length > 20 && !slide.id.startsWith('slide_')) {
        // Atualizar slide existente no Supabase
        const { error } = await supabase
          .from('documents')
          .update(slideData)
          .eq('id', slide.id)
        
        if (error) throw error
      } else {
        // Criar novo slide
        const { data, error } = await supabase
          .from('documents')
          .insert(slideData)
          .select()
          .single()
        
        if (error) throw error
        
        // Atualizar o slide local com o ID do banco
        setSlides(prev => prev.map(s => 
          s === slide ? { ...s, id: data.id } : s
        ))
      }
      
      console.log('✅ Slide salvo no Supabase')
    } catch (error) {
      console.error('❌ Erro ao salvar slide:', error)
    }
  }

  const loadLessons = async () => {
    try {
      // TODO: Implementar busca de aulas do banco de dados
      // const { data } = await supabase.from('lessons').select('*').order('created_at', { ascending: false })
      // if (data) setLessons(data)
      
      // Por enquanto, iniciar com array vazio
      setLessons([])
    } catch (error) {
      console.error('Erro ao carregar aulas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCases = cases.filter(caseItem =>
    caseItem.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateLessonFromCase = (caseItem: Case) => {
    setSelectedCase(caseItem)
    setShowNewLesson(true)
  }

  const handleSaveNewLesson = async () => {
    if (!selectedCase) return
    
    // Criar nova aula e abrir editor
    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: `Relato de Caso: ${selectedCase.patient_name}`,
      description: `Aula criada a partir do caso clínico de ${selectedCase.patient_name}`,
      case_id: selectedCase.id,
      duration_minutes: 45,
      created_at: new Date().toISOString(),
      status: 'draft'
    }
    
    // Preencher editor com dados do caso
    setEditorContent({
      title: newLesson.title,
      abstract: `Este relato descreve o caso de um paciente com ${selectedCase.diagnosis}, avaliado através do sistema IMRE da plataforma MedCannLab 3.0.`,
      introduction: `Introdução ao caso clínico de ${selectedCase.patient_name}...`,
      methodology: 'Metodologia de avaliação baseada no sistema IMRE Triaxial...',
      results: selectedCase.clinical_report || 'Resultados da avaliação clínica...',
      discussion: 'Discussão dos achados e implicações clínicas...',
      conclusion: 'Conclusões e recomendações baseadas no caso apresentado.',
      keywords: 'cannabis medicinal, dor crônica, IMRE, caso clínico',
      references: '1. Referência bibliográfica 1\n2. Referência bibliográfica 2'
    })
    
    setLessons([...lessons, newLesson])
    setEditingLesson(newLesson)
    setShowNewLesson(false)
    setSelectedCase(null)
    setActiveTab('editor')
  }

  const handleEditLesson = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId)
    if (lesson) {
      setEditingLesson(lesson)
      // Preencher editor com conteúdo da aula
      setEditorContent({
        title: lesson.title,
        abstract: lesson.description || '',
        introduction: '',
        methodology: '',
        results: '',
        discussion: '',
        conclusion: '',
        keywords: '',
        references: ''
      })
      setActiveTab('editor')
    }
  }

  const handleSaveLesson = () => {
    if (!editingLesson) return
    
    // Atualizar aula com conteúdo do editor
    setLessons(lessons.map(l => 
      l.id === editingLesson.id 
        ? { 
            ...l, 
            title: editorContent.title,
            description: editorContent.abstract
          } 
        : l
    ))
    
    alert('Aula salva com sucesso!')
  }

  const handlePublishLesson = () => {
    if (!editingLesson) return
    
    if (window.confirm('Deseja publicar esta aula no curso de Pós-graduação em Cannabis Medicinal?')) {
      setLessons(lessons.map(l => 
        l.id === editingLesson.id 
          ? { ...l, status: 'published' as const } 
          : l
      ))
      
      alert('Aula publicada no curso com sucesso! 🎉')
      setEditingLesson(null)
      setActiveTab('lessons')
    }
  }

  const handleViewLesson = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId)
    if (lesson) {
      alert(`Visualizando aula: "${lesson.title}"\n\nDescrição: ${lesson.description}\nDuração: ${lesson.duration_minutes} minutos\nStatus: ${lesson.status === 'published' ? 'Publicada' : 'Rascunho'}`)
    }
  }

  const handleDeleteLesson = (lessonId: string) => {
    if (window.confirm('Tem certeza que deseja deletar esta aula?')) {
      setLessons(lessons.filter(l => l.id !== lessonId))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/app/ensino/profissional/dashboard')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                📝 Ferramentas Pedagógicas
              </h1>
              <p className="text-gray-300">
                Produza relatos de caso e crie aulas a partir de casos clínicos reais
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            {editingLesson && (
              <>
                <button
                  onClick={handleSaveLesson}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Save size={18} />
                  Salvar
                </button>
                <button
                  onClick={handlePublishLesson}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Globe size={18} />
                  Publicar no Curso
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        {activeTab !== 'editor' && activeTab !== 'slides' && activeTab !== 'flipped' && activeTab !== 'quizzes' && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar casos ou aulas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-4 border-b border-slate-700">
            <button 
              onClick={() => setActiveTab('cases')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'cases'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📁 Casos Clínicos ({cases.length})
            </button>
            <button 
              onClick={() => setActiveTab('lessons')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'lessons'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📚 Minhas Aulas ({lessons.length})
            </button>
            <button 
              onClick={() => setActiveTab('slides')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'slides'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📊 Preparação de Slides ({slides.length})
            </button>
            <button 
              onClick={() => setActiveTab('flipped')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'flipped'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              🔄 Sala de Aula Invertida ({flippedLessons.length})
            </button>
            <button 
              onClick={() => setActiveTab('quizzes')}
              className={`pb-3 px-4 font-semibold transition-colors ${
                activeTab === 'quizzes'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📝 Geração de Quizzes ({quizzes.length})
            </button>
            {editingLesson && (
              <button 
                className="pb-3 px-4 font-semibold text-blue-400 border-b-2 border-blue-400"
              >
                ✏️ Editor Científico
              </button>
            )}
          </div>
        </div>

        {/* Cases Grid */}
        {activeTab === 'cases' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full text-center text-gray-400">Carregando casos...</div>
          ) : filteredCases.length > 0 ? (
            filteredCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {caseItem.patient_name}
                    </h3>
                    <p className="text-sm text-gray-400">{caseItem.diagnosis}</p>
                  </div>
                  <FileText className="text-blue-400" size={24} />
                </div>
                
                <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                  {caseItem.clinical_report || 'Sem descrição disponível'}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>Jan 2025</span>
                  </div>
                  <button 
                    onClick={() => handleCreateLessonFromCase(caseItem)}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Criar Aula →
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400">
              Nenhum caso encontrado
            </div>
          )}
        </div>
        )}

        {/* Lessons */}
        {activeTab === 'lessons' && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Minhas Aulas</h2>
          <div className="space-y-4">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Presentation className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{lesson.title}</h3>
                      <p className="text-sm text-gray-300">{lesson.description}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    lesson.status === 'published' 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {lesson.status === 'published' ? 'Publicada' : 'Rascunho'}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{lesson.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Video size={16} />
                    <span>Com vídeo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>0 alunos</span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button 
                    onClick={() => handleEditLesson(lesson.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-sm"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => handleViewLesson(lesson.id)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-semibold text-sm"
                  >
                    Visualizar
                  </button>
                  <button 
                    onClick={() => handleDeleteLesson(lesson.id)}
                    className="px-4 bg-slate-700 hover:bg-red-600 text-white py-2 rounded-lg text-sm"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Scientific Editor */}
        {activeTab === 'editor' && editingLesson && (
          <div className="space-y-6">
            {/* Editor Toolbar */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center gap-2">
              <button className="p-2 hover:bg-slate-700 rounded-lg" title="Negrito"><strong>B</strong></button>
              <button className="p-2 hover:bg-slate-700 rounded-lg" title="Itálico"><em>I</em></button>
              <button className="p-2 hover:bg-slate-700 rounded-lg" title="Sublinhado"><u>U</u></button>
              <div className="w-px h-6 bg-slate-600"></div>
              <button className="p-2 hover:bg-slate-700 rounded-lg" title="Título"><span className="text-xl">H</span></button>
              <button className="p-2 hover:bg-slate-700 rounded-lg" title="Lista">• Lista</button>
              <div className="flex-1"></div>
              <button className="p-2 hover:bg-slate-700 rounded-lg" title="Exportar PDF"><Download size={18} /></button>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Título do Artigo</label>
              <input
                type="text"
                value={editorContent.title}
                onChange={(e) => setEditorContent({ ...editorContent, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Relato de Caso: Cannabis Medicinal em Dor Crônica"
              />
            </div>

            {/* Abstract */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">📄 Resumo (Abstract)</label>
              <textarea
                value={editorContent.abstract}
                onChange={(e) => setEditorContent({ ...editorContent, abstract: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Resumo do artigo em até 250 palavras..."
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">🔑 Palavras-chave</label>
              <input
                type="text"
                value={editorContent.keywords}
                onChange={(e) => setEditorContent({ ...editorContent, keywords: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="palavra-chave 1, palavra-chave 2, palavra-chave 3..."
              />
            </div>

            {/* Introduction */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">📖 Introdução</label>
              <textarea
                value={editorContent.introduction}
                onChange={(e) => setEditorContent({ ...editorContent, introduction: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contexto, justificativa e objetivos do caso..."
              />
            </div>

            {/* Methodology */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">🔬 Metodologia</label>
              <textarea
                value={editorContent.methodology}
                onChange={(e) => setEditorContent({ ...editorContent, methodology: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Metodologia de avaliação utilizada (Sistema IMRE)..."
              />
            </div>

            {/* Results */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">📊 Resultados</label>
              <textarea
                value={editorContent.results}
                onChange={(e) => setEditorContent({ ...editorContent, results: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Resultados da avaliação clínica, dados coletados..."
              />
            </div>

            {/* Discussion */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">💭 Discussão</label>
              <textarea
                value={editorContent.discussion}
                onChange={(e) => setEditorContent({ ...editorContent, discussion: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Análise dos resultados, interpretação dos achados..."
              />
            </div>

            {/* Conclusion */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">✅ Conclusão</label>
              <textarea
                value={editorContent.conclusion}
                onChange={(e) => setEditorContent({ ...editorContent, conclusion: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Conclusões e recomendações finais..."
              />
            </div>

            {/* References */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">📚 Referências</label>
              <textarea
                value={editorContent.references}
                onChange={(e) => setEditorContent({ ...editorContent, references: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="1. Autor, A. (2024). Título do artigo. Revista, volume(issue), páginas."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-700">
              <button
                onClick={() => {
                  setEditingLesson(null)
                  setActiveTab('lessons')
                }}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveLesson}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2"
              >
                <Save size={20} />
                Salvar Rascunho
              </button>
              <button
                onClick={handlePublishLesson}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center gap-2"
              >
                <Globe size={20} />
                Publicar no Curso de Pós-graduação
              </button>
            </div>
          </div>
        )}

        {/* Slides Tab */}
        {activeTab === 'slides' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Preparação de Slides</h2>
                <p className="text-slate-400 text-sm">
                  Envie um PowerPoint ou crie slides do zero. A IA residente trabalhará com você na produção e análise.
                </p>
              </div>
              <div className="flex items-center gap-3">
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
                          `Recebi seu arquivo PowerPoint: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB). ` +
                          `Vou analisar o conteúdo dos slides, sugerir melhorias, ajudar na edição e preparar para publicação. ` +
                          `Vamos começar a análise detalhada?`
                        )
                      }
                    }
                    fileInput.click()
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Upload size={18} />
                  Enviar PowerPoint
                </button>
                <button
                  onClick={() => {
                    const newSlide = {
                      id: Date.now().toString(),
                      title: `Slide ${slides.length + 1}`,
                      content: '',
                      order: slides.length
                    }
                    setSlides([...slides, newSlide])
                    setCurrentSlide(slides.length)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Plus size={18} />
                  Novo Slide
                </button>
              </div>
            </div>

            {slides.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Slides List */}
                <div className="lg:col-span-1 bg-slate-800 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Slides</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {slides.map((slide, index) => (
                      <div
                        key={slide.id}
                        onClick={() => setCurrentSlide(index)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          currentSlide === index
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{slide.title}</span>
                          <span className="text-xs">#{index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Slide Editor */}
                <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6">
                  {slides[currentSlide] && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Título do Slide</label>
                        <input
                          type="text"
                          value={slides[currentSlide].title}
                          onChange={(e) => {
                            const updated = [...slides]
                            updated[currentSlide].title = e.target.value
                            setSlides(updated)
                            // Salvar automaticamente após 2 segundos de inatividade
                            clearTimeout((window as any).slideSaveTimeout)
                            ;(window as any).slideSaveTimeout = setTimeout(() => {
                              saveSlide(updated[currentSlide])
                            }, 2000)
                          }}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Digite o título do slide..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Conteúdo</label>
                        <textarea
                          value={slides[currentSlide].content}
                          onChange={(e) => {
                            const updated = [...slides]
                            updated[currentSlide].content = e.target.value
                            setSlides(updated)
                            // Salvar automaticamente após 2 segundos de inatividade
                            clearTimeout((window as any).slideSaveTimeout)
                            ;(window as any).slideSaveTimeout = setTimeout(() => {
                              saveSlide(updated[currentSlide])
                            }, 2000)
                          }}
                          rows={12}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Digite o conteúdo do slide..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => {
                            openChat()
                            sendInitialMessage(
                              `Vou ajudá-lo a exportar os slides para PowerPoint. ` +
                              `Atualmente você tem ${slides.length} slides. ` +
                              `Vamos preparar o arquivo PPT para download?`
                            )
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                        >
                          <Download size={18} />
                          Exportar PPT
                        </button>
                        <button 
                          onClick={() => {
                            openChat()
                            sendInitialMessage(
                              `Vou ajudá-lo a melhorar o slide "${slides[currentSlide].title}". ` +
                              `Conteúdo atual: ${slides[currentSlide].content || '(vazio)'}. ` +
                              `Vou analisar e sugerir melhorias, edições e otimizações. ` +
                              `Vamos começar?`
                            )
                          }}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                        >
                          <Brain size={18} />
                          IA: Analisar/Editar
                        </button>
                        <button 
                          onClick={() => {
                            openChat()
                            sendInitialMessage(
                              `Vou gerar conteúdo para o slide "${slides[currentSlide].title}". ` +
                              `Me diga o tema ou contexto que você quer abordar e eu vou criar um conteúdo profissional e bem estruturado.`
                            )
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                        >
                          <Sparkles size={18} />
                          IA: Gerar Conteúdo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl p-12 text-center">
                <Presentation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Nenhum slide criado ainda</p>
                <p className="text-slate-500 text-sm mb-6">
                  Comece criando seu primeiro slide ou envie um PowerPoint para análise
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      openChat()
                      sendInitialMessage('Vamos criar seu primeiro slide! Me diga o tema ou assunto que você quer abordar e eu vou ajudá-lo a criar slides profissionais e bem estruturados.')
                    }}
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Criar Primeiro Slide
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
                            `Recebi seu arquivo PowerPoint: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB). ` +
                            `Vou analisar o conteúdo dos slides, sugerir melhorias, ajudar na edição e preparar para publicação. ` +
                            `Vamos começar a análise detalhada?`
                          )
                        }
                      }
                      fileInput.click()
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Upload size={18} />
                    Enviar PowerPoint
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Flipped Classroom Tab */}
        {activeTab === 'flipped' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Sala de Aula Invertida</h2>
                <p className="text-gray-400 mt-2">Organize materiais pré-aula, atividades em sala e pós-aula</p>
              </div>
              <button
                onClick={() => {
                  if (!newFlippedLesson.title.trim()) {
                    alert('Por favor, preencha o título da aula antes de criar.')
                    return
                  }
                  const newLesson = {
                    id: Date.now().toString(),
                    title: newFlippedLesson.title,
                    preClassMaterial: newFlippedLesson.preClassMaterial,
                    inClassActivity: newFlippedLesson.inClassActivity,
                    postClassActivity: newFlippedLesson.postClassActivity,
                    createdAt: new Date().toISOString()
                  }
                  setFlippedLessons([...flippedLessons, newLesson])
                  setNewFlippedLesson({ title: '', preClassMaterial: '', inClassActivity: '', postClassActivity: '' })
                  alert('Aula invertida criada com sucesso!')
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <Plus size={18} />
                Nova Aula
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Título da Aula</label>
              <input
                type="text"
                value={newFlippedLesson.title}
                onChange={(e) => setNewFlippedLesson({ ...newFlippedLesson, title: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o título da aula..."
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pre-Class Material */}
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">Material Pré-Aula</h3>
                </div>
                <textarea
                  value={newFlippedLesson.preClassMaterial}
                  onChange={(e) => setNewFlippedLesson({ ...newFlippedLesson, preClassMaterial: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Vídeos, leituras e materiais que os alunos devem estudar antes da aula..."
                />
              </div>

              {/* In-Class Activity */}
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">Atividade em Sala</h3>
                </div>
                <textarea
                  value={newFlippedLesson.inClassActivity}
                  onChange={(e) => setNewFlippedLesson({ ...newFlippedLesson, inClassActivity: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Exercícios práticos, discussões e atividades presenciais..."
                />
              </div>

              {/* Post-Class Activity */}
              <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <RotateCcw className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">Atividade Pós-Aula</h3>
                </div>
                <textarea
                  value={newFlippedLesson.postClassActivity}
                  onChange={(e) => setNewFlippedLesson({ ...newFlippedLesson, postClassActivity: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Revisões, exercícios e avaliações para consolidar o aprendizado..."
                />
              </div>
            </div>

            {/* Existing Flipped Lessons */}
            {flippedLessons.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-white mb-4">Aulas Criadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flippedLessons.map((lesson) => (
                    <div key={lesson.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                      <h4 className="text-lg font-semibold text-white mb-4">{lesson.title}</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-blue-400 font-medium">Pré-Aula:</span>
                          <p className="text-gray-300 mt-1 line-clamp-2">{lesson.preClassMaterial || 'Não definido'}</p>
                        </div>
                        <div>
                          <span className="text-green-400 font-medium">Em Sala:</span>
                          <p className="text-gray-300 mt-1 line-clamp-2">{lesson.inClassActivity || 'Não definido'}</p>
                        </div>
                        <div>
                          <span className="text-purple-400 font-medium">Pós-Aula:</span>
                          <p className="text-gray-300 mt-1 line-clamp-2">{lesson.postClassActivity || 'Não definido'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Geração de Quizzes</h2>
                <p className="text-gray-400 mt-2">Crie questões interativas para avaliar seus alunos</p>
              </div>
              <button
                onClick={() => {
                  const newQuiz = {
                    id: Date.now().toString(),
                    title: 'Novo Quiz',
                    questions: [],
                    createdAt: new Date().toISOString()
                  }
                  setQuizzes([...quizzes, newQuiz])
                  setCurrentQuiz(newQuiz)
                  setQuizQuestions([])
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <Plus size={18} />
                Novo Quiz
              </button>
            </div>

            {quizzes.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quiz List */}
                <div className="lg:col-span-1 bg-slate-800 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Meus Quizzes</h3>
                  <div className="space-y-2">
                    {quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        onClick={() => {
                          setCurrentQuiz(quiz)
                          setQuizQuestions(quiz.questions || [])
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          currentQuiz?.id === quiz.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
                        }`}
                      >
                        <div className="font-medium">{quiz.title}</div>
                        <div className="text-xs mt-1">
                          {quiz.questions?.length || 0} questões
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quiz Editor */}
                <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6">
                  {currentQuiz && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Título do Quiz</label>
                        <input
                          type="text"
                          value={currentQuiz.title}
                          onChange={(e) => {
                            const updated = quizzes.map(q => q.id === currentQuiz.id ? { ...q, title: e.target.value } : q)
                            setQuizzes(updated)
                            setCurrentQuiz({ ...currentQuiz, title: e.target.value })
                          }}
                          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">Questões</h3>
                          <button
                            onClick={() => {
                              const newQuestion = {
                                id: Date.now().toString(),
                                question: '',
                                options: ['', '', '', ''],
                                correctAnswer: 0
                              }
                              setQuizQuestions([...quizQuestions, newQuestion])
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                          >
                            <Plus size={16} />
                            Adicionar Questão
                          </button>
                        </div>

                        {quizQuestions.map((question, qIndex) => (
                          <div key={question.id} className="bg-slate-700 rounded-lg p-4">
                            <div className="mb-4">
                              <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Questão {qIndex + 1}
                              </label>
                              <textarea
                                value={question.question}
                                onChange={(e) => {
                                  const updated = [...quizQuestions]
                                  updated[qIndex].question = e.target.value
                                  setQuizQuestions(updated)
                                }}
                                rows={2}
                                className="w-full px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Digite a pergunta..."
                              />
                            </div>
                            <div className="space-y-2">
                              {question.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`question-${qIndex}`}
                                    checked={question.correctAnswer === oIndex}
                                    onChange={() => {
                                      const updated = [...quizQuestions]
                                      updated[qIndex].correctAnswer = oIndex
                                      setQuizQuestions(updated)
                                    }}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const updated = [...quizQuestions]
                                      updated[qIndex].options[oIndex] = e.target.value
                                      setQuizQuestions(updated)
                                    }}
                                    className="flex-1 px-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Alternativa ${oIndex + 1}...`}
                                  />
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => {
                                const updated = quizQuestions.filter((_, i) => i !== qIndex)
                                setQuizQuestions(updated)
                              }}
                              className="mt-3 text-red-400 hover:text-red-300 text-sm font-medium"
                            >
                              Remover Questão
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-slate-700">
                        <button 
                          onClick={() => {
                            if (!currentQuiz.title.trim()) {
                              alert('Por favor, preencha o título do quiz.')
                              return
                            }
                            if (quizQuestions.length === 0) {
                              alert('Adicione pelo menos uma questão ao quiz.')
                              return
                            }
                            const updated = quizzes.map(q => 
                              q.id === currentQuiz.id 
                                ? { ...q, questions: quizQuestions }
                                : q
                            )
                            setQuizzes(updated)
                            setCurrentQuiz(updated.find(q => q.id === currentQuiz.id))
                            alert('Quiz salvo com sucesso!')
                          }}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                        >
                          <Save size={18} />
                          Salvar Quiz
                        </button>
                        <button 
                          onClick={() => {
                            // TODO: Integrar com IA para gerar questões automaticamente
                            if (!currentQuiz.title.trim()) {
                              alert('Por favor, preencha o título do quiz primeiro.')
                              return
                            }
                            const generatedQuestion = {
                              id: Date.now().toString(),
                              question: `Questão gerada com IA sobre "${currentQuiz.title}"`,
                              options: [
                                'Alternativa A (correta)',
                                'Alternativa B',
                                'Alternativa C',
                                'Alternativa D'
                              ],
                              correctAnswer: 0
                            }
                            setQuizQuestions([...quizQuestions, generatedQuestion])
                            alert('Questão gerada com IA adicionada! (Demo)')
                          }}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                        >
                          <Sparkles size={18} />
                          Gerar com IA
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 rounded-xl p-12 text-center">
                <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">Nenhum quiz criado ainda</p>
                <button
                  onClick={() => {
                    const newQuiz = {
                      id: Date.now().toString(),
                      title: 'Novo Quiz',
                      questions: [],
                      createdAt: new Date().toISOString()
                    }
                    setQuizzes([newQuiz])
                    setCurrentQuiz(newQuiz)
                    setQuizQuestions([])
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Criar Primeiro Quiz
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal New Lesson */}
        {showNewLesson && selectedCase && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-4">Criar Nova Aula</h2>
              <p className="text-gray-300 mb-6">
                Criar aula baseada no caso: <strong className="text-white">{selectedCase.patient_name}</strong>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowNewLesson(false)
                    setSelectedCase(null)
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveNewLesson}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
                >
                  Criar Aula
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
