import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, FileText, Users, Clock, Search, Plus, Video, Presentation, Edit, Save, Globe, Book, Upload, Download } from 'lucide-react'

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
  const { user } = useAuth()
  const [cases, setCases] = useState<Case[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewLesson, setShowNewLesson] = useState(false)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [activeTab, setActiveTab] = useState<'cases' | 'lessons' | 'editor'>('cases')
  
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
  }, [])

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
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🎓 Editor Científico de Aulas
            </h1>
            <p className="text-gray-300">
              Crie artigos e relatos de caso a partir de casos clínicos reais
            </p>
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
        {activeTab !== 'editor' && (
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
