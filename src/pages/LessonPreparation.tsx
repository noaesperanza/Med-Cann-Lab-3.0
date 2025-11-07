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

interface SlideContent {
  id: string
  title: string
  content: string
  bullets: string[]
  notes: string
  layout: 'cover' | 'bullets' | 'two-column' | 'image-focus'
  accent: 'emerald' | 'blue' | 'purple' | 'amber'
  imagePrompt?: string
  imageUrl?: string
  aiDraft?: boolean
  order: number
  updatedAt?: string
}

const slideAccentStyles: Record<SlideContent['accent'], { background: string; headline: string; body: string }> = {
  emerald: {
    background: 'linear-gradient(135deg, rgba(0,193,106,0.9) 0%, rgba(19,121,79,0.92) 45%, rgba(10,25,47,0.95) 100%)',
    headline: '#E6FFFA',
    body: '#D1FAE5'
  },
  blue: {
    background: 'linear-gradient(135deg, rgba(14,116,238,0.9) 0%, rgba(37,99,235,0.92) 50%, rgba(30,64,175,0.94) 100%)',
    headline: '#DBEAFE',
    body: '#BFDBFE'
  },
  purple: {
    background: 'linear-gradient(135deg, rgba(139,92,246,0.92) 0%, rgba(109,40,217,0.92) 50%, rgba(59,7,100,0.95) 100%)',
    headline: '#F5F3FF',
    body: '#EDE9FE'
  },
  amber: {
    background: 'linear-gradient(135deg, rgba(255,193,7,0.9) 0%, rgba(245,158,11,0.92) 45%, rgba(120,53,15,0.94) 100%)',
    headline: '#FFFBEB',
    body: '#FEF3C7'
  }
}

const slideTemplates: Array<{ id: SlideContent['layout']; label: string; description: string; accent: SlideContent['accent']; bullets: string[] }> = [
  {
    id: 'cover',
    label: 'Capa',
    description: 'Apresente o tema com impacto visual e destaque institucional.',
    accent: 'emerald',
    bullets: ['Objetivo principal da apresentação', 'Módulo ou disciplina da aula', 'Facilitador responsável']
  },
  {
    id: 'bullets',
    label: 'Lista de Destaques',
    description: 'Organize conceitos principais e mensagens prioritárias.',
    accent: 'blue',
    bullets: ['Conceito-chave 1', 'Conceito-chave 2', 'Conceito-chave 3']
  },
  {
    id: 'two-column',
    label: 'Comparativo',
    description: 'Contraste condutas, abordagens clínicas ou análises A/B.',
    accent: 'purple',
    bullets: ['Coluna A: pontos fortes', 'Coluna B: pontos de atenção', 'Insights da IA residente']
  },
  {
    id: 'image-focus',
    label: 'Slide Visual',
    description: 'Combine narrativa textual com imagens geradas pela IA.',
    accent: 'amber',
    bullets: ['Contextualização da imagem', 'Insight clínico', 'Próximos passos sugeridos']
  }
]

const aiDraftLibrary = [
  {
    keywords: ['entrevista', 'aec', 'arte da entrevista'],
    bullets: [
      'Estabelecer vínculo e acolhimento na abertura da consulta',
      'Investigar fatores tradicionais, não tradicionais e simbólicos',
      'Registrar narrativas utilizando a metodologia IMRE'
    ],
    notes: 'Reforce a tríade Escuta-Observação-Registro e conecte com avaliações da IA residente.'
  },
  {
    keywords: ['cannabis', 'canabin'],
    bullets: [
      'Classificação de fitocanabinóides e terpenos chave',
      'Indicações clínicas respaldadas em evidências recentes',
      'Monitoramento de efeitos adversos e ajustes terapêuticos'
    ],
    notes: 'Citar protocolos MedCannLab e critérios de acompanhamento nefrológico.'
  },
  {
    keywords: ['nefro', 'renal', 'rim'],
    bullets: [
      'KPIs de função renal para acompanhamento longitudinal',
      'Fatores de risco tradicionais e não tradicionais avaliados',
      'Insights de dispositivos conectados e relatórios da IA residente'
    ],
    notes: 'Sugerir recomendações de adesão e educação em saúde para pacientes.'
  }
]

const createDraftForSlide = (slide: SlideContent): Partial<SlideContent> => {
  const combinedText = `${slide.title} ${slide.content}`.toLowerCase()
  const matchedDraft = aiDraftLibrary.find((draft) =>
    draft.keywords.some((keyword) => combinedText.includes(keyword))
  )

  const defaultBullets = [
    'Introduzir o conceito principal com clareza clínica',
    'Apresentar evidências ou casos ilustrativos',
    'Relacionar com a jornada do paciente, estudante ou equipe'
  ]

  const bullets = matchedDraft?.bullets || defaultBullets
  return {
    bullets,
    content: bullets.join('\n'),
    notes:
      matchedDraft?.notes ||
      'Inclua exemplos, dados clínicos e referências bibliográficas para aprofundar a discussão.',
    aiDraft: true
  }
}

const createSlideFromTemplate = (
  templateId: SlideContent['layout'],
  order: number,
  title?: string
): SlideContent => {
  const template = slideTemplates.find((tpl) => tpl.id === templateId) || slideTemplates[1]
  return {
    id: `slide_${Date.now()}_${order}`,
    title: title || template.label,
    content: template.bullets.join('\n'),
    bullets: template.bullets,
    notes: '',
    layout: template.id,
    accent: template.accent,
    order,
    aiDraft: false
  }
}

let slideSaveTimeout: number | undefined

const scheduleSlideSave = (callback: () => void) => {
  if (slideSaveTimeout) {
    window.clearTimeout(slideSaveTimeout)
  }
  slideSaveTimeout = window.setTimeout(callback, 800)
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
  const [slides, setSlides] = useState<SlideContent[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedTemplateId, setSelectedTemplateId] = useState<SlideContent['layout']>('bullets')
  const [isGeneratingSlide, setIsGeneratingSlide] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  
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

    const handleSlideCreated = (event: CustomEvent) => {
      const slideData = event.detail
      if (!slideData || !slideData.title) return

      let targetIndex = 0
      setSlides((prev) => {
        const normalized = normalizeSlide(slideData, prev.length)
        const existingIndex = prev.findIndex(
          (s) => s.id === normalized.id || s.title === normalized.title
        )
        if (existingIndex >= 0) {
          targetIndex = existingIndex
          const updated = [...prev]
          updated[existingIndex] = { ...prev[existingIndex], ...normalized }
          return updated
        }
        targetIndex = prev.length
        return [...prev, normalized]
      })

      setCurrentSlide(targetIndex)
      setActiveTab('slides')
      loadSlides()
    }

    const handleSlideUpdated = (event: CustomEvent) => {
      const slideData = event.detail
      if (!slideData || !slideData.id) return

      setSlides((prev) => {
        const normalized = normalizeSlide(slideData, 0)
        return prev.map((slide) => (slide.id === slideData.id ? { ...slide, ...normalized } : slide))
      })
    }

    window.addEventListener('slideCreated', handleSlideCreated as EventListener)
    window.addEventListener('slideUpdated', handleSlideUpdated as EventListener)

    return () => {
      window.removeEventListener('slideCreated', handleSlideCreated as EventListener)
      window.removeEventListener('slideUpdated', handleSlideUpdated as EventListener)
    }
  }, [user?.id])

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
        const loadedSlides = data.map((doc, index) => normalizeSlide(doc, index))
        setSlides(loadedSlides)
        setCurrentSlide(0)
      } else {
        setSlides([])
        setCurrentSlide(0)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar slides:', error)
    }
  }

  const saveSlide = async (slide: SlideContent) => {
    try {
      if (!user?.id) return

      const contentPreview = slide.content || slide.bullets.join('\n')

      const slideData = {
        title: slide.title,
        content: contentPreview,
        category: 'slides',
        file_type: 'slide',
        author: user.name || user.email,
        summary: contentPreview.substring(0, 200),
        tags: ['slide', 'aula', 'pedagogico'],
        keywords: ['slide', 'presentation'],
        target_audience: ['student', 'professional'],
        isLinkedToAI: true,
        metadata: {
          layout: slide.layout,
          accent: slide.accent,
          bullets: slide.bullets,
          notes: slide.notes,
          imagePrompt: slide.imagePrompt,
          imageUrl: slide.imageUrl,
          aiDraft: slide.aiDraft || false,
          updatedAt: new Date().toISOString()
        }
      }

      if (slide.id && slide.id.length > 20 && !slide.id.startsWith('slide_')) {
        const { error } = await supabase
          .from('documents')
          .update(slideData)
          .eq('id', slide.id)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('documents')
          .insert(slideData)
          .select()
          .single()

        if (error) throw error

        if (data) {
          setSlides((prev) =>
            prev.map((s) => (s.id === slide.id ? normalizeSlide(data, s.order) : s))
          )
        }
      }
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

  const normalizeSlide = (slideData: any, index: number): SlideContent => {
    const metadata = slideData?.metadata || {}
    const rawContent = slideData?.content || slideData?.summary || ''
    const bullets = Array.isArray(metadata.bullets)
      ? metadata.bullets
      : rawContent
          .split(/\n|\r|\u2022|\-/)
          .map((chunk: string) => chunk.trim())
          .filter((chunk: string) => chunk.length > 0)
          .slice(0, 8)

    return {
      id: slideData?.id || `slide_${Date.now()}_${index}`,
      title: slideData?.title || metadata.title || `Slide ${index + 1}`,
      content: rawContent,
      bullets,
      notes: metadata.notes || '',
      layout: metadata.layout || 'bullets',
      accent: metadata.accent || 'emerald',
      imagePrompt: metadata.imagePrompt,
      imageUrl: metadata.imageUrl,
      aiDraft: metadata.aiDraft ?? false,
      order: typeof slideData?.order === 'number' ? slideData.order : index,
      updatedAt: slideData?.updated_at || metadata.updatedAt
    }
  }

  const updateSlideAtIndex = (index: number, updates: Partial<SlideContent>, persist = true) => {
    setSlides((prev) => {
      if (!prev[index]) return prev
      const updatedSlide = { ...prev[index], ...updates }
      const nextSlides = [...prev]
      nextSlides[index] = updatedSlide
      if (persist) {
        scheduleSlideSave(() => saveSlide(updatedSlide))
      }
      return nextSlides
    })
  }

  const handleAddSlide = (layout?: SlideContent['layout']) => {
    const templateId = layout || selectedTemplateId
    const newSlide = createSlideFromTemplate(templateId, slides.length)
    setSlides((prev) => [...prev, newSlide])
    setCurrentSlide(slides.length)
    scheduleSlideSave(() => saveSlide(newSlide))
  }

  const handleGenerateSlideWithAI = () => {
    if (!slides[currentSlide]) return
    setIsGeneratingSlide(true)
    const draft = createDraftForSlide(slides[currentSlide])
    updateSlideAtIndex(currentSlide, {
      ...draft,
      content: draft.content || slides[currentSlide].content,
      bullets: draft.bullets || slides[currentSlide].bullets,
      notes: draft.notes ?? slides[currentSlide].notes,
      aiDraft: true
    })
    sendInitialMessage(
      `Nôa, gere tópicos e notas de fala para o slide "${slides[currentSlide].title}" seguindo a metodologia AEC, ` +
        'retornando instruções objetivas para apresentação.'
    )
    setTimeout(() => setIsGeneratingSlide(false), 600)
  }

  const handleGenerateImage = () => {
    const slide = slides[currentSlide]
    if (!slide) return
    if (!slide.imagePrompt || slide.imagePrompt.trim().length < 4) {
      alert('Descreva o que deseja visualizar antes de gerar a imagem (ex.: "neurônios conectados em tons verdes").')
      return
    }
    setIsGeneratingImage(true)
    const encodedPrompt = encodeURIComponent(slide.imagePrompt)
    const imageUrl = `https://source.unsplash.com/1600x900/?${encodedPrompt}`
    updateSlideAtIndex(currentSlide, { imageUrl }, false)
    setTimeout(() => {
      setIsGeneratingImage(false)
      scheduleSlideSave(() => saveSlide({ ...slide, imageUrl }))
    }, 500)
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
            <div className="bg-gradient-to-r from-blue-900/40 via-slate-900/60 to-emerald-900/40 border border-slate-700/60 rounded-xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Preparação de Slides</h2>
                  <p className="text-slate-300 text-sm max-w-2xl">
                    Crie apresentações clínicas com a paleta da landing page, gere rascunhos com a IA residente e exporte em formato PowerPoint.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
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
                            `Recebi o arquivo PowerPoint ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB). ` +
                            'Analise o deck, destaque oportunidades de melhoria e devolva um plano para atualização dos slides.'
                          )
                        }
                      }
                      fileInput.click()
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
                  >
                    <Upload size={18} />
                    Enviar PowerPoint
                  </button>
                  <button
                    onClick={() => handleAddSlide()}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
                  >
                    <Plus size={18} />
                    Novo Slide
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {slideTemplates.map((template) => {
                  const isSelected = selectedTemplateId === template.id
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`text-left p-4 rounded-xl transition-all border ${
                        isSelected
                          ? 'border-[#00F5A0] bg-slate-900/80 shadow-xl scale-[1.02]'
                          : 'border-slate-700/60 bg-slate-900/60 hover:border-slate-500/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                          <Layout size={16} />
                          {template.label}
                        </div>
                        {isSelected && <CheckCircle className="w-5 h-5 text-[#00F5A0]" />}
                      </div>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">{template.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
              <div className="space-y-4">
                <div className="bg-slate-900/70 border border-slate-700/60 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wide">Meus slides ({slides.length})</h3>
                    <button onClick={loadSlides} className="text-xs text-slate-400 flex items-center gap-1">
                      <RotateCcw size={14} />
                      Recarregar
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {slides.length === 0 && <p className="text-xs text-slate-400">Selecione um template e clique em "Novo Slide" para iniciar.</p>}
                    {slides.map((slide, index) => {
                      const accentStyle = slideAccentStyles[(slide.accent as SlideContent['accent']) || 'emerald']
                      const isActive = currentSlide === index
                      return (
                        <button
                          key={slide.id}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-full p-3 rounded-lg text-left transition-all border ${
                            isActive
                              ? 'border-[#00F5A0] bg-slate-800/90 shadow-lg'
                              : 'border-slate-700/60 bg-slate-800/60 hover:border-slate-500/60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-white truncate">{slide.title || `Slide ${index + 1}`}</span>
                            <span className="text-[11px] text-slate-400">#{index + 1}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            <span>{slide.layout === 'cover' ? 'Capa' : slide.layout === 'two-column' ? 'Comparativo' : slide.layout === 'image-focus' ? 'Visual' : 'Tópicos'}</span>
                            <span style={{ color: accentStyle.body }}>•</span>
                            <span>{(slide.bullets || []).length} tópicos</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {slides[currentSlide] ? (
                  <>
                    {(() => {
                      const slide = slides[currentSlide]
                      const accentStyle = slideAccentStyles[(slide.accent as SlideContent['accent']) || 'emerald']
                      return (
                        <div className="bg-slate-900/70 border border-slate-700/60 rounded-xl p-4 shadow-xl">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Pré-visualização</h3>
                              <p className="text-xs text-slate-400">Ajuste o layout e veja como o slide será apresentado.</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                              <Sparkles size={14} />
                              {slide.aiDraft ? 'Rascunho gerado pela IA' : 'Edição manual'}
                            </div>
                          </div>
                          <div className="rounded-2xl overflow-hidden border border-slate-700/60" style={{ background: accentStyle.background }}>
                            {slide.imageUrl && (
                              <div className="h-48 bg-black/20 overflow-hidden">
                                <img src={slide.imageUrl} alt={slide.imagePrompt || 'Imagem gerada'} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="p-8 space-y-4">
                              <h4 className="text-2xl font-semibold" style={{ color: accentStyle.headline }}>{slide.title || 'Título do Slide'}</h4>
                              <div
                                className={`${slide.layout === 'two-column' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-2'} text-sm leading-relaxed`}
                                style={{ color: accentStyle.body }}
                              >
                                {slide.layout === 'cover' ? (
                                  <p>{slide.content || 'Descreva o objetivo da aula, o módulo e a credencial do facilitador.'}</p>
                                ) : slide.layout === 'two-column' ? (
                                  <>
                                    <div>
                                      <p className="font-semibold mb-1">Coluna A</p>
                                      <ul className="space-y-1 text-sm">
                                        {(slide.bullets || []).slice(0, Math.ceil((slide.bullets || []).length / 2)).map((bullet, idx) => (
                                          <li key={`colA-${idx}`} className="flex items-start gap-2">
                                            <span className="text-xs">•</span>
                                            <span>{bullet}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div>
                                      <p className="font-semibold mb-1">Coluna B</p>
                                      <ul className="space-y-1 text-sm">
                                        {(slide.bullets || []).slice(Math.ceil((slide.bullets || []).length / 2)).map((bullet, idx) => (
                                          <li key={`colB-${idx}`} className="flex items-start gap-2">
                                            <span className="text-xs">•</span>
                                            <span>{bullet}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </>
                                ) : (
                                  <ul className="space-y-2 text-sm">
                                    {(slide.bullets || []).length > 0
                                      ? (slide.bullets || []).map((bullet, idx) => (
                                          <li key={idx} className="flex items-start gap-2">
                                            <span className="text-xs">•</span>
                                            <span>{bullet}</span>
                                          </li>
                                        ))
                                      : <li className="text-white/70">Insira tópicos para estruturar o slide.</li>}
                                  </ul>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    <div className="bg-slate-900/70 border border-slate-700/60 rounded-xl p-6 shadow-xl space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-2">Título</label>
                          <input
                            type="text"
                            value={slides[currentSlide].title}
                            onChange={(e) => updateSlideAtIndex(currentSlide, { title: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Digite o título do slide"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block font-semibold text-slate-300 mb-2">Layout</label>
                            <select
                              value={slides[currentSlide].layout}
                              onChange={(e) => updateSlideAtIndex(currentSlide, { layout: e.target.value as SlideContent['layout'] })}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="cover">Capa / Destaque</option>
                              <option value="bullets">Tópicos</option>
                              <option value="two-column">Comparativo</option>
                              <option value="image-focus">Visual + Legenda</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-semibold text-slate-300 mb-2">Paleta</label>
                            <select
                              value={slides[currentSlide].accent}
                              onChange={(e) => updateSlideAtIndex(currentSlide, { accent: e.target.value as SlideContent['accent'] })}
                              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="emerald">Verde Neon</option>
                              <option value="blue">Azul Profundo</option>
                              <option value="purple">Roxo Holográfico</option>
                              <option value="amber">Âmbar / Dourado</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-2">Texto livre</label>
                        <textarea
                          rows={4}
                          value={slides[currentSlide].content}
                          onChange={(e) => updateSlideAtIndex(currentSlide, { content: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                          placeholder="Cole aqui parágrafos ou adicione observações para transformar em tópicos."
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-2">Tópicos (um por linha)</label>
                        <textarea
                          rows={5}
                          value={(slides[currentSlide].bullets || []).join('\n')}
                          onChange={(e) => {
                            const bulletArray = e.target.value
                              .split('\n')
                              .map((item) => item.trim())
                              .filter((item) => item.length > 0)
                            updateSlideAtIndex(currentSlide, {
                              bullets: bulletArray,
                              content: bulletArray.join('\n')
                            })
                          }}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                          placeholder="• Introdução ao tema\n• Evidência clínica relevante\n• Conexão com o plano terapêutico"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-2">Notas de apresentação</label>
                        <textarea
                          rows={4}
                          value={slides[currentSlide].notes || ''}
                          onChange={(e) => updateSlideAtIndex(currentSlide, { notes: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                          placeholder="Apontamentos para o facilitador, insights da IA residente, referências clínicas..."
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-2">Prompt para imagem</label>
                          <input
                            type="text"
                            value={slides[currentSlide].imagePrompt || ''}
                            onChange={(e) => {
                              const newPrompt = e.target.value
                              const baseSlide = slides[currentSlide]
                              updateSlideAtIndex(currentSlide, { imagePrompt: newPrompt }, false)
                              if (baseSlide) {
                                scheduleSlideSave(() => saveSlide({ ...baseSlide, imagePrompt: newPrompt }))
                              }
                            }}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            placeholder="Ex.: neurônios conectados em tons verdes neon"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <button
                            onClick={handleGenerateImage}
                            disabled={isGeneratingImage}
                            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold px-4 py-3 rounded-lg shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {isGeneratingImage ? 'Gerando imagem...' : 'Gerar imagem com IA'}
                          </button>
                          {slides[currentSlide].imageUrl && (
                            <button
                              onClick={() => updateSlideAtIndex(currentSlide, { imageUrl: undefined })}
                              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-xs text-slate-300"
                            >
                              Remover
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          onClick={handleGenerateSlideWithAI}
                          disabled={isGeneratingSlide}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Sparkles size={18} />
                          {isGeneratingSlide ? 'Gerando rascunho...' : 'Gerar texto com IA'}
                        </button>
                        <button
                          onClick={() => {
                            openChat()
                            sendInitialMessage(
                              `Monte um arquivo PPTX com os ${slides.length} slides, respeitando título, tópicos, notas e imagens sugeridas. ` +
                              'Finalize com um slide de conclusão e uma chamada para ação clínica.'
                            )
                          }}
                          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                        >
                          <Download size={18} />
                          Exportar PPT
                        </button>
                        <button
                          onClick={() => handleAddSlide(slides[currentSlide].layout)}
                          className="bg-slate-800 border border-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Duplicar template
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-slate-900/70 border border-slate-700/60 rounded-xl p-10 text-center text-slate-400">
                    Crie seu primeiro slide selecionando um template acima.
                  </div>
                )}
              </div>
            </div>
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
