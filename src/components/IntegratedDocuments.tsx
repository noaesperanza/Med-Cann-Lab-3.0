// Componente para documentos integrados nos módulos do app
import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Eye, 
  Brain, 
  BookOpen, 
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  GraduationCap,
  Heart
} from 'lucide-react'
import { KnowledgeBaseIntegration, KnowledgeDocument } from '../services/knowledgeBaseIntegration'

interface IntegratedDocumentsProps {
  module: string // 'clinical', 'research', 'education', 'protocols'
  category?: string
  audience?: string[]
  showFilters?: boolean
  maxDocuments?: number
  title?: string
  description?: string
}

const IntegratedDocuments: React.FC<IntegratedDocumentsProps> = ({
  module,
  category,
  audience = ['professional'],
  showFilters = true,
  maxDocuments = 10,
  title,
  description
}) => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<KnowledgeDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null)

  // Carregar documentos específicos do módulo
  useEffect(() => {
    loadModuleDocuments()
  }, [module, category])

  const loadModuleDocuments = async () => {
    setIsLoading(true)
    try {
      let moduleDocuments: KnowledgeDocument[] = []

      // Buscar documentos específicos do módulo
      if (category) {
        moduleDocuments = await KnowledgeBaseIntegration.getDocumentsByCategory(category)
      } else {
        // Buscar por módulo específico
        moduleDocuments = await KnowledgeBaseIntegration.semanticSearch(module, {
          limit: maxDocuments * 2
        })
      }

      // Filtrar por audiência
      const filteredByAudience = moduleDocuments.filter(doc => 
        doc.target_audience?.some(aud => audience.includes(aud))
      )

      // Ordenar por relevância da IA
      const sortedDocuments = filteredByAudience
        .sort((a, b) => (b.aiRelevance || 0) - (a.aiRelevance || 0))
        .slice(0, showAll ? maxDocuments * 2 : maxDocuments)

      setDocuments(sortedDocuments)
      setFilteredDocuments(sortedDocuments)
    } catch (error) {
      console.error('❌ Erro ao carregar documentos do módulo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar documentos por busca
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDocuments(documents)
      return
    }

    const filtered = documents.filter(doc =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())) ||
      doc.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    setFilteredDocuments(filtered)
  }, [searchTerm, documents])

  const getModuleIcon = () => {
    switch (module) {
      case 'clinical': return <Heart className="w-5 h-5" />
      case 'research': return <BookOpen className="w-5 h-5" />
      case 'education': return <GraduationCap className="w-5 h-5" />
      case 'protocols': return <FileText className="w-5 h-5" />
      default: return <Brain className="w-5 h-5" />
    }
  }

  const getModuleColor = () => {
    switch (module) {
      case 'clinical': return 'from-red-500 to-pink-500'
      case 'research': return 'from-blue-500 to-cyan-500'
      case 'education': return 'from-green-500 to-emerald-500'
      case 'protocols': return 'from-purple-500 to-indigo-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const handleDownload = async (doc: KnowledgeDocument) => {
    try {
      await KnowledgeBaseIntegration.registerDocumentUsage(doc.id, 'download')
      
      if (doc.file_url) {
        const link = document.createElement('a')
        link.href = doc.file_url
        link.download = doc.title
        link.target = '_blank'
        link.click()
      }
    } catch (error) {
      console.error('❌ Erro no download:', error)
    }
  }

  const handleView = async (doc: KnowledgeDocument) => {
    try {
      await KnowledgeBaseIntegration.registerDocumentUsage(doc.id, 'view')
      
      if (doc.file_url) {
        window.open(doc.file_url, '_blank')
      }
    } catch (error) {
      console.error('❌ Erro ao visualizar:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 bg-gradient-to-r ${getModuleColor()} rounded-lg`}>
            {getModuleIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title || `Documentos ${module.charAt(0).toUpperCase() + module.slice(1)}`}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {documents.length > maxDocuments && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2 px-3 py-1 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Ver Menos
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Ver Todos ({documents.length})
              </>
            )}
          </button>
        )}
      </div>

      {/* Busca */}
      {showFilters && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* Lista de Documentos */}
      <div className="space-y-3">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum documento encontrado</p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {doc.title}
                    </h4>
                    {doc.isLinkedToAI && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                        <Brain className="w-3 h-3" />
                        IA
                      </div>
                    )}
                    {doc.aiRelevance && doc.aiRelevance > 0.8 && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {doc.summary}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>📄 {doc.file_type?.toUpperCase()}</span>
                    <span>👤 {doc.author}</span>
                    <span>📅 {new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                    {doc.downloads && (
                      <span>⬇️ {doc.downloads} downloads</span>
                    )}
                  </div>

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {doc.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleView(doc)}
                    className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Visualizar"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    title="Baixar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer com estatísticas */}
      {filteredDocuments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>
              {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''} encontrado{filteredDocuments.length !== 1 ? 's' : ''}
            </span>
            <span>
              {filteredDocuments.filter(d => d.isLinkedToAI).length} vinculado{filteredDocuments.filter(d => d.isLinkedToAI).length !== 1 ? 's' : ''} à IA
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default IntegratedDocuments
