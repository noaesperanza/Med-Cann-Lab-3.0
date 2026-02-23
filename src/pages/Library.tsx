import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Search,
  Eye,
  FileText,
  Star,
  Upload,
  X,
  Image as ImageIcon,
  BookOpen,
  FileText as ReportIcon,
  Brain,
  Users,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  User,
  Heart,
  TrendingUp,
  BarChart3,
  Trash2,
  Share2,
  Link as LinkIcon,
  XCircle,
  Target,
  Download,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { KnowledgeBaseIntegration, KnowledgeDocument, KnowledgeStats } from '../services/knowledgeBaseIntegration'
import * as pdfjsLib from 'pdfjs-dist'

// Configurar PDF.js worker
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
} catch (err) {
  console.warn('Erro ao configurar PDF.js worker na Biblioteca:', err)
}
import {
  backgroundGradient,
  surfaceStyle,
  secondarySurfaceStyle,
  accentGradient,
  secondaryGradient,
  goldenGradient
} from '../constants/designSystem'

// 🧪 TESTE DE CONTROLE DO DEPLOY: Teste concluído com sucesso!
// ✅ O Vercel detecta erros de build automaticamente
// Comentado: const ERRO_INTENCIONAL = undefined.toString()

const Library: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  // Aplicar filtro de tipo de usuário passado via state, se houver
  const [selectedUserType, setSelectedUserType] = useState<string>(
    (location.state as { userType?: string })?.userType || 'all'
  )
  const [openDocumentId, setOpenDocumentId] = useState<string | null>(
    (location.state as { openDocumentId?: string } | null)?.openDocumentId || null
  )
  const lastAutoOpenedRef = useRef<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadCategory, setUploadCategory] = useState('ai-residente')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [realDocuments, setRealDocuments] = useState<KnowledgeDocument[]>([])
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true)
  const [totalDocs, setTotalDocs] = useState(0)
  const [lastLoadTime, setLastLoadTime] = useState<number>(0)
  const [cacheExpiry, setCacheExpiry] = useState<number>(30000) // 30 segundos
  const [knowledgeStats, setKnowledgeStats] = useState<KnowledgeStats | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 6

  const backgroundGradient = 'linear-gradient(135deg, #0A192F 0%, #1a365d 55%, #2d5a3d 100%)'

  const surfaceStyle: React.CSSProperties = {
    background: 'rgba(7, 22, 41, 0.88)',
    border: '1px solid rgba(0, 193, 106, 0.12)',
    boxShadow: '0 18px 42px rgba(2, 12, 27, 0.55)'
  }
  const secondarySurfaceStyle: React.CSSProperties = {
    background: 'rgba(12, 31, 54, 0.78)',
    border: '1px solid rgba(0, 193, 106, 0.1)',
    boxShadow: '0 14px 32px rgba(2, 12, 27, 0.45)'
  }
  const accentGradient = 'linear-gradient(135deg, #00C16A 0%, #13794f 100%)'
  const secondaryGradient = 'linear-gradient(135deg, #1a365d 0%, #274a78 100%)'
  const highlightGradient = 'linear-gradient(135deg, rgba(0, 193, 106, 0.25) 0%, rgba(16, 49, 91, 0.4) 60%, rgba(9, 25, 43, 0.75) 100%)'
  const goldenGradient = 'linear-gradient(135deg, #FFD33D 0%, #FFAA00 100%)'
  const dropzoneStyle: React.CSSProperties = isDragging
    ? {
      border: '1px dashed rgba(0,193,106,0.6)',
      background: 'rgba(0,193,106,0.18)',
      boxShadow: '0 0 0 2px rgba(0,193,106,0.25) inset'
    }
    : {
      border: '1px dashed rgba(0,193,106,0.3)',
      background: 'rgba(10, 25, 47, 0.58)',
      boxShadow: '0 16px 32px rgba(2,12,27,0.42)'
    }

  // Tipos de usuário
  const userTypes = [
    { id: 'all', name: 'Todos os Usuários', icon: Users, color: 'blue' },
    { id: 'student', name: 'Alunos', icon: GraduationCap, color: 'green' },
    { id: 'professional', name: 'Profissionais', icon: User, color: 'purple' },
    { id: 'patient', name: 'Pacientes', icon: Heart, color: 'red' }
  ]

  // Categorias: IA, Protocolos, Pesquisa, Casos, Multimídia
  const categories = [
    { id: 'all', name: 'Todos', icon: '📚', count: totalDocs },
    { id: 'ai-documents', name: 'IA Residente', icon: '🧠', count: 0 },
    { id: 'protocols', name: 'Protocolos', icon: '📖', count: 0 },
    { id: 'research', name: 'Pesquisa', icon: '🔬', count: 0 },
    { id: 'cases', name: 'Casos', icon: '📊', count: 0 },
    { id: 'multimedia', name: 'Multimídia', icon: '🎥', count: 0 }
  ]

  // Áreas: Cannabis, IMRE, Clínica, Gestão
  const knowledgeAreas = [
    { id: 'all', name: 'Todas', icon: '🌐', color: 'slate' },
    { id: 'cannabis', name: 'Cannabis', icon: '🌿', color: 'green' },
    { id: 'imre', name: 'IMRE', icon: '🧬', color: 'purple' },
    { id: 'clinical', name: 'Clínica', icon: '🏥', color: 'blue' },
    { id: 'research', name: 'Gestão', icon: '📈', color: 'orange' }
  ]

  const [selectedArea, setSelectedArea] = useState('all')

  const documentTypes = [
    { id: 'all', name: 'Todos os Tipos', icon: '📁' },
    { id: 'pdf', name: 'PDF', icon: '📄' },
    { id: 'video', name: 'Vídeo', icon: '🎥' },
    { id: 'image', name: 'Imagem', icon: '🖼️' },
    { id: 'book', name: 'Livro', icon: '📚' }
  ]

  // Contar documentos por categoria
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return realDocuments.length
    const filtered = realDocuments.filter((doc: any) => {
      // Verificar se o documento pertence à categoria
      if (categoryId === 'ai-documents') {
        // IA Residente: incluir todos os documentos que estão vinculados à IA OU têm categoria/tags relacionados
        const isAILinked = doc.isLinkedToAI === true
        const isAICategory = doc.category === 'ai-documents' || doc.category === 'ai-residente'
        const hasAITags = doc.tags && (
          doc.tags.includes('ai-documents') ||
          doc.tags.includes('ai-residente') ||
          doc.tags.includes('upload') ||
          doc.tags.some((tag: string) => tag.toLowerCase().includes('ai'))
        )
        const hasAIKeywords = doc.keywords && (
          doc.keywords.some((k: string) => k === 'ai-documents' || k === 'ai-residente' || k.toLowerCase().includes('ai'))
        )

        const matches = isAILinked || isAICategory || hasAITags || hasAIKeywords
        return matches
      }
      // Para outras categorias, verificar category OU tags/keywords
      return doc.category === categoryId ||
        (doc.tags && doc.tags.includes(categoryId)) ||
        (doc.keywords && doc.keywords.some((k: string) => k === categoryId))
    })
    return filtered.length
  }

  // Atualizar contadores das categorias
  const categoriesWithCount = categories.map(cat => ({
    ...cat,
    count: getCategoryCount(cat.id)
  }))

  // Debug logs comentados
  // console.log('📊 Contadores de categorias:', categoriesWithCount)
  // console.log('📚 Documentos reais completos:', realDocuments)

  // Estado para documentos filtrados com busca semântica
  const [filteredDocuments, setFilteredDocuments] = useState<KnowledgeDocument[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleViewDocument = useCallback(async (doc: KnowledgeDocument) => {
    try {
      let viewUrl = doc.file_url

      // Se o documento não tiver arquivo (file_url), abrir o conteúdo textual em nova aba
      // (muitos itens em `documents` são "slides"/texto e não estão no Storage)
      if (!viewUrl) {
        const safeTitle = (doc.title || 'Documento').toString()
        const body = (doc.content || doc.summary || 'Sem conteúdo disponível.').toString()
        const win = window.open('', '_blank')
        if (!win) {
          alert('Não foi possível abrir uma nova aba para visualizar o documento.')
          return
        }
        const escaped = body
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        win.document.open()
        win.document.write(`
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 24px; color: #0f172a; }
      h1 { font-size: 20px; margin: 0 0 12px; }
      pre { white-space: pre-wrap; word-wrap: break-word; background: #f8fafc; padding: 16px; border-radius: 10px; border: 1px solid #e2e8f0; }
      .meta { color: #475569; font-size: 12px; margin-bottom: 16px; }
    </style>
  </head>
  <body>
    <h1>${safeTitle.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h1>
    <div class="meta">Fonte: MedCannLab documents (texto)</div>
    <pre>${escaped}</pre>
  </body>
</html>`)
        win.document.close()
        return
      }

      // Se não tiver URL ou URL não funcionar, tentar criar signed URL
      if (!viewUrl || viewUrl.includes('Bucket not found') || viewUrl.includes('404')) {
        // Tentar encontrar o arquivo no Storage
        const fileName = doc.title || ''
        const { data: files } = await supabase.storage
          .from('documents')
          .list('', { limit: 100 })

        if (files) {
          const file = files.find(f =>
            f.name.toLowerCase().includes(fileName.toLowerCase().split('.')[0]) ||
            fileName.toLowerCase().includes(f.name.toLowerCase().split('.')[0])
          )

          if (file) {
            // Criar signed URL
            const { data: signedData, error: signedError } = await supabase.storage
              .from('documents')
              .createSignedUrl(file.name, 3600)

            if (!signedError && signedData) {
              viewUrl = signedData.signedUrl
              // Atualizar file_url no documento
              await supabase
                .from('documents')
                .update({ file_url: signedData.signedUrl })
                .eq('id', doc.id)
            }
          }
        }
      } else if (viewUrl.includes('supabase.co/storage')) {
        // Se for URL do Supabase mas não funcionar, tentar criar signed URL
        const pathMatch = viewUrl.match(/\/storage\/v1\/object\/[^\/]+\/(.+)$/)
        if (pathMatch) {
          const filePath = decodeURIComponent(pathMatch[1])
          const { data: signedData, error: signedError } = await supabase.storage
            .from('documents')
            .createSignedUrl(filePath, 3600)

          if (!signedError && signedData) {
            viewUrl = signedData.signedUrl
          }
        }
      }

      if (viewUrl) {
        window.open(viewUrl, '_blank')
      } else {
        alert('Não foi possível acessar o arquivo. Verifique se o arquivo existe no Storage.')
      }
    } catch (error) {
      console.error('Erro ao visualizar:', error)
      alert('Erro ao visualizar o arquivo. Verifique as permissões do Storage.')
    }
  }, [])

  // Função para realizar busca semântica
  const performSemanticSearch = async () => {
    if (!debouncedSearchTerm.trim()) {
      // Se não há termo de busca, usar filtros normais
      const filtered = realDocuments.filter((doc: KnowledgeDocument) => {
        // Filtro de categoria (consistente com getCategoryCount)
        let matchesCategory = true
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'ai-documents') {
            // IA Residente: incluir todos os documentos vinculados à IA OU com categoria/tags relacionados
            const isAILinked = doc.isLinkedToAI === true
            const isAICategory = doc.category === 'ai-documents' || doc.category === 'ai-residente'
            const hasAITags = doc.tags && (
              doc.tags.includes('ai-documents') ||
              doc.tags.includes('ai-residente') ||
              doc.tags.includes('upload') ||
              doc.tags.some((tag: string) => tag.toLowerCase().includes('ai'))
            )
            const hasAIKeywords = doc.keywords && (
              doc.keywords.some((k: string) => k === 'ai-documents' || k === 'ai-residente' || k.toLowerCase().includes('ai'))
            )
            matchesCategory = isAILinked || isAICategory || hasAITags || hasAIKeywords
          } else {
            // Para outras categorias, verificar category OU tags/keywords (consistente com getCategoryCount)
            matchesCategory = doc.category === selectedCategory ||
              (doc.tags && doc.tags.includes(selectedCategory)) ||
              (doc.keywords && doc.keywords.some((k: string) => k === selectedCategory))
          }
        }

        // Filtro de tipo de arquivo
        const matchesType = selectedType === 'all' || doc.file_type === selectedType

        // Filtro de tipo de usuário
        const matchesUserType = selectedUserType === 'all' ||
          (doc.target_audience && doc.target_audience.includes(selectedUserType))

        // Filtro de área de conhecimento
        const matchesArea = selectedArea === 'all' ||
          doc.keywords?.some((k: string) => k.toLowerCase().includes(selectedArea)) ||
          doc.tags?.some((tag: string) => tag.toLowerCase().includes(selectedArea)) ||
          doc.title?.toLowerCase().includes(selectedArea) ||
          doc.summary?.toLowerCase().includes(selectedArea)

        return matchesCategory && matchesType && matchesUserType && matchesArea
      })
      setFilteredDocuments(filtered)
      return
    }

    setIsSearching(true)
    try {
      // Usar busca semântica da base de conhecimento
      const searchResults = await KnowledgeBaseIntegration.semanticSearch(debouncedSearchTerm, {
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        audience: selectedUserType !== 'all' ? selectedUserType : undefined,
        aiLinkedOnly: selectedCategory === 'ai-documents',
        limit: 50
      })

      // Aplicar filtros adicionais (incluindo categoria)
      const filtered = searchResults.filter((doc: KnowledgeDocument) => {
        // Filtro de categoria (consistente com getCategoryCount)
        let matchesCategory = true
        if (selectedCategory !== 'all') {
          if (selectedCategory === 'ai-documents') {
            const isAILinked = doc.isLinkedToAI === true
            const isAICategory = doc.category === 'ai-documents' || doc.category === 'ai-residente'
            const hasAITags = doc.tags && (
              doc.tags.includes('ai-documents') ||
              doc.tags.includes('ai-residente') ||
              doc.tags.includes('upload') ||
              doc.tags.some((tag: string) => tag.toLowerCase().includes('ai'))
            )
            const hasAIKeywords = doc.keywords && (
              doc.keywords.some((k: string) => k === 'ai-documents' || k === 'ai-residente' || k.toLowerCase().includes('ai'))
            )
            matchesCategory = isAILinked || isAICategory || hasAITags || hasAIKeywords
          } else {
            matchesCategory = doc.category === selectedCategory ||
              (doc.tags && doc.tags.includes(selectedCategory)) ||
              (doc.keywords && doc.keywords.some((k: string) => k === selectedCategory))
          }
        }

        const matchesType = selectedType === 'all' || doc.file_type === selectedType
        const matchesUserType = selectedUserType === 'all' ||
          (doc.target_audience && doc.target_audience.includes(selectedUserType))

        const matchesArea = selectedArea === 'all' ||
          doc.keywords?.some((k: string) => k.toLowerCase().includes(selectedArea)) ||
          doc.tags?.some((tag: string) => tag.toLowerCase().includes(selectedArea)) ||
          doc.title?.toLowerCase().includes(selectedArea) ||
          doc.summary?.toLowerCase().includes(selectedArea)

        return matchesCategory && matchesType && matchesUserType && matchesArea
      })

      setFilteredDocuments(filtered)
    } catch (error) {
      console.error('❌ Erro na busca semântica:', error)
      setFilteredDocuments([])
    } finally {
      setIsSearching(false)
    }
  }

  // Efeito para realizar busca semântica quando os filtros mudam
  useEffect(() => {
    performSemanticSearch()
    setCurrentPage(1) // Reset pagination when filters change
  }, [debouncedSearchTerm, selectedCategory, selectedType, selectedUserType, selectedArea, realDocuments])

  // Compute paginated documents
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE)
  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )


  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <span className="text-red-500 text-xl">📄</span>
      case 'video':
        return <span className="text-blue-500 text-xl">🎥</span>
      case 'image':
        return <span className="text-green-500 text-xl">🖼️</span>
      case 'book':
        return <span className="text-[#4FE0C1] text-xl">📚</span>
      default:
        return <span className="text-gray-500 text-xl">📁</span>
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Data não disponível'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'Tamanho não disponível'
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  // 🔥 FUNÇÃO PARA EXTRAIR CONTEÚDO REAL DE PDFs
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return ''
      }

      console.log('📄 Extraindo texto do PDF na Biblioteca:', file.name)
      const arrayBuffer = await file.arrayBuffer()

      // Carregar documento
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        useWorkerFetch: true,
        isEvalSupported: false
      })

      const pdf = await loadingTask.promise
      let fullText = ''

      // Extrair texto de todas as páginas (limitado a 50 para performance)
      const maxPages = Math.min(pdf.numPages, 50)

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()

          if (pageText) {
            fullText += `\n[Página ${pageNum}]\n${pageText}\n`
          }
        } catch (pageErr) {
          console.warn(`⚠️ Erro na página ${pageNum}:`, pageErr)
        }

        if (fullText.length > 100000) break
      }

      console.log(`✅ Extração na Biblioteca concluída: ${fullText.length} caracteres`)
      return fullText.trim() || 'Documento PDF processado, mas nenhum texto legível foi extraído.'
    } catch (error) {
      console.error('❌ Erro crítico na extração do PDF na Biblioteca:', error)
      return ''
    }
  }

  // 🔥 FUNÇÃO PARA EXTRAIR CONTEÚDO DE DOCX/TXT
  const extractTextFromTextFile = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      if (fileExt === 'txt') {
        return await file.text()
      }

      return ''
    } catch (error) {
      console.error('❌ Erro ao extrair texto do arquivo na Biblioteca:', error)
      return ''
    }
  }

  // Função unificada de upload
  const handleUploadFile = async (file: File, category: string = 'ai-documents') => {
    console.log('🚀 Iniciando upload:', file.name, 'Categoria:', category)
    setIsUploading(true)
    setUploadProgress(0)

    let progressInterval: NodeJS.Timeout | null = null

    try {
      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const bucketName = category === 'ai-avatar' ? 'avatar' : 'documents'

      console.log('📤 Enviando para Storage:', fileName, 'Bucket:', bucketName)

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file)

      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError)
        throw uploadError
      }

      console.log('✅ Arquivo enviado:', uploadData)

      // Se for avatar, não salvar no banco
      if (category === 'ai-avatar') {
        const { data: { publicUrl } } = supabase.storage
          .from('avatar')
          .getPublicUrl(fileName)

        // Emitir evento para atualizar avatar
        const event = new CustomEvent('avatarUpdated', { detail: { url: publicUrl } })
        window.dispatchEvent(event)

        alert('✅ Avatar atualizado!')
        if (progressInterval) clearInterval(progressInterval)
        setUploadProgress(100)
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 1000)
        return
      }

      // Para documentos, salvar metadata no banco
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      // Mapear categoria para dados do documento
      let documentCategory = 'research'
      let targetAudience = ['professional']

      if (category === 'ai-documents') {
        documentCategory = 'ai-documents'
        targetAudience = ['professional', 'student']
      } else if (category === 'student') {
        documentCategory = 'multimedia'
        targetAudience = ['student']
      } else if (category === 'professional') {
        documentCategory = 'protocols'
        targetAudience = ['professional']
      } else if (category === 'reports') {
        documentCategory = 'reports'
        targetAudience = ['professional']
      } else if (category === 'research') {
        documentCategory = 'research'
        targetAudience = ['professional', 'student']
      }

      // Criar signed URL para o arquivo (para bucket privado)
      let finalUrl = publicUrl
      if (bucketName === 'documents') {
        // Para bucket privado, criar signed URL válida por 30 dias
        try {
          const { data: signedUrlData, error: signedError } = await supabase.storage
            .from('documents')
            .createSignedUrl(fileName, 2592000) // 30 dias

          if (!signedError && signedUrlData) {
            finalUrl = signedUrlData.signedUrl
            console.log('✅ Signed URL criada para documento privado')
          } else {
            console.warn('⚠️ Erro ao criar signed URL, usando public URL:', signedError)
          }
        } catch (signedError) {
          console.warn('⚠️ Erro ao criar signed URL:', signedError)
        }
      }

      // Garantir que tags e keywords incluam tanto a categoria de upload quanto a categoria final
      const tags = ['upload', category, documentCategory].filter((t, i, arr) => arr.indexOf(t) === i) // Remove duplicatas
      const keywords = [fileExt || 'document', category, documentCategory].filter((k, i, arr) => arr.indexOf(k) === i) // Remove duplicatas

      // Extrair conteúdo antes de salvar metadata
      let extractedContent = ''
      try {
        console.log('📄 Iniciando extração de conteúdo na Biblioteca...')
        if (fileExt === 'pdf') {
          extractedContent = await extractTextFromPDF(file)
        } else if (fileExt === 'txt') {
          extractedContent = await file.text()
        }

        if (extractedContent) {
          console.log(`✅ Conteúdo extraído: ${extractedContent.length} caracteres`)
          // Limitar tamanho para evitar problemas (máximo 500k caracteres)
          if (extractedContent.length > 500000) {
            extractedContent = extractedContent.substring(0, 500000) + '\n\n[... conteúdo truncado para otimização ...]'
          }
        }
      } catch (extError) {
        console.warn('⚠️ Erro na extração de conteúdo na Biblioteca:', extError)
      }

      // Criar resumo inteligente
      let dynamicSummary = `Documento enviado em ${new Date().toLocaleDateString('pt-BR')} - Categoria: ${documentCategory}`
      if (extractedContent) {
        const preview = extractedContent.substring(0, 300).replace(/\n+/g, ' ').trim()
        dynamicSummary = `${dynamicSummary}\n\nResumo:\n${preview}${extractedContent.length > 300 ? '...' : ''}`
      }

      const documentMetadata = {
        title: file.name,
        content: extractedContent,
        file_type: fileExt || 'unknown',
        file_url: finalUrl,
        file_size: file.size,
        author: user?.name || 'Usuário',
        category: documentCategory,
        target_audience: targetAudience,
        tags: tags,
        isLinkedToAI: category === 'ai-documents' || category === 'research' || documentCategory === 'protocols',
        summary: dynamicSummary,
        keywords: keywords
      }

      console.log('💾 Salvando metadata:', documentMetadata)

      // Salvar metadata no banco
      const { data: documentData, error: docError } = await supabase
        .from('documents')
        .insert(documentMetadata)
        .select()

      if (docError) {
        console.error('❌ Erro ao salvar metadata:', docError)
        throw docError
      }

      console.log('✅ Metadata salva!', documentData)

      // Aguardar um pouco para garantir que o banco foi atualizado
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Recarregar lista de documentos com retry
      let retryCount = 0
      const maxRetries = 5

      while (retryCount < maxRetries) {
        await loadDocuments(true) // Force reload após upload

        // Aguardar um pouco para o estado atualizar
        await new Promise(resolve => setTimeout(resolve, 500))

        // Recarregar novamente para garantir que pegamos o estado atualizado
        await loadDocuments(true)

        // Verificar se o documento foi carregado
        const allDocs = await KnowledgeBaseIntegration.getAllDocuments()
        console.log('🔍 Verificando documentos:', {
          totalDocs: allDocs.length,
          fileName,
          publicUrl,
          uploadedFileName: file.name
        })

        // Buscar por múltiplos critérios
        const newDocExists = allDocs.some(doc => {
          const titleMatch = doc.title === file.name || doc.title?.includes(file.name.replace(/\.[^/.]+$/, ''))
          const urlMatch = doc.file_url?.includes(fileName) || doc.file_url === publicUrl
          const recentMatch = doc.created_at && new Date(doc.created_at).getTime() > (Date.now() - 10000) // Criado nos últimos 10 segundos

          return titleMatch || urlMatch || recentMatch
        })

        if (newDocExists) {
          console.log('✅ Documento encontrado na lista após upload!')
          // Atualizar estado local
          setRealDocuments(allDocs)
          setTotalDocs(allDocs.length)
          setLastLoadTime(Date.now())
          break
        } else {
          console.log(`⚠️ Documento não encontrado, tentativa ${retryCount + 1}/${maxRetries}`)
          retryCount++
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        }
      }

      if (progressInterval) clearInterval(progressInterval)
      setUploadProgress(100)
      setUploadSuccess(true)

      console.log('🎉 Upload concluído!')
      alert('✅ Upload realizado com sucesso!')

      // Atualizar lista imediatamente após sucesso
      await loadDocuments(true)

      setTimeout(() => {
        setUploadSuccess(false)
        setUploadProgress(0)
        setIsUploading(false)
        // Não fechar modal imediatamente - dar tempo para ver sucesso
        // setShowUploadModal(false)
        setUploadedFile(null)

        // Atualizar lista novamente após delay
        setTimeout(() => {
          loadDocuments(true)
        }, 500)
      }, 2000)
    } catch (error: any) {
      console.error('❌ Erro no upload:', error)
      if (progressInterval) clearInterval(progressInterval)
      setUploadProgress(0)
      alert(`Erro ao fazer upload: ${error.message || 'Erro desconhecido'}`)
      setIsUploading(false)
    }
  }



  const handleUpload = async () => {
    if (!uploadedFile) return
    await handleUploadFile(uploadedFile, uploadCategory)
  }

  const uploadCategories = [
    {
      id: 'ai-avatar',
      name: 'Avatar IA Residente',
      description: 'Imagem do avatar da Nôa Esperança',
      icon: <Brain className="w-5 h-5" />,
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'ai-documents',
      name: 'Documentos IA Residente',
      description: 'Documentos vinculados à base de conhecimento da IA',
      icon: <Brain className="w-5 h-5" />,
      color: 'from-[#00c16a] to-[#00a85a]'
    },
    {
      id: 'student',
      name: 'Materiais para Alunos',
      description: 'Aulas, cursos e material didático',
      icon: <GraduationCap className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'professional',
      name: 'Prescrições e Protocolos',
      description: 'Documentos para profissionais de saúde',
      icon: <FileText className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'reports',
      name: 'Relatórios e Análises',
      description: 'Relatórios clínicos e análises',
      icon: <ReportIcon className="w-5 h-5" />,
      color: 'from-[#00c16a] to-[#00a85a]'
    },
    {
      id: 'research',
      name: 'Artigos Científicos',
      description: 'Pesquisas e evidências científicas',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'from-amber-500 to-yellow-500'
    }
  ]

  // Função para sincronizar e corrigir documentos existentes
  const syncAllDocuments = async () => {
    try {
      console.log('🔄 Sincronizando todos os documentos com a base de conhecimento...')

      // Buscar todos os documentos
      const { data: allDocs, error } = await supabase
        .from('documents')
        .select('*')

      if (error) throw error

      if (!allDocs || allDocs.length === 0) {
        console.log('ℹ️ Nenhum documento encontrado para sincronizar')
        return
      }

      console.log(`📚 Encontrados ${allDocs.length} documentos para sincronizar`)

      // Atualizar documentos que precisam de correção
      let updatedCount = 0
      for (const doc of allDocs) {
        const updates: any = {}
        let needsUpdate = false

        // Garantir que category está correta
        if (doc.category) {
          // Se category é 'professional' ou tem tag 'professional', garantir que tags e keywords incluam 'protocols'
          if (doc.category === 'professional' || (doc.tags && doc.tags.includes('professional'))) {
            if (!doc.tags || !doc.tags.includes('protocols')) {
              updates.tags = [...(doc.tags || []), 'protocols'].filter((t, i, arr) => arr.indexOf(t) === i)
              needsUpdate = true
            }
            if (!doc.keywords || !doc.keywords.includes('protocols')) {
              updates.keywords = [...(doc.keywords || []), 'protocols'].filter((k, i, arr) => arr.indexOf(k) === i)
              needsUpdate = true
            }
            if (doc.category !== 'protocols') {
              updates.category = 'protocols'
              needsUpdate = true
            }
          }

          // Se category é 'student' ou tem tag 'student', garantir que tags e keywords incluam 'multimedia'
          if (doc.category === 'student' || (doc.tags && doc.tags.includes('student'))) {
            if (!doc.tags || !doc.tags.includes('multimedia')) {
              updates.tags = [...(doc.tags || []), 'multimedia'].filter((t, i, arr) => arr.indexOf(t) === i)
              needsUpdate = true
            }
            if (!doc.keywords || !doc.keywords.includes('multimedia')) {
              updates.keywords = [...(doc.keywords || []), 'multimedia'].filter((k, i, arr) => arr.indexOf(k) === i)
              needsUpdate = true
            }
            if (doc.category !== 'multimedia') {
              updates.category = 'multimedia'
              needsUpdate = true
            }
          }
        }

        // Garantir que protocolos e multimedia estejam vinculados à IA
        if (doc.category === 'protocols' || doc.category === 'multimedia') {
          if (!doc.isLinkedToAI) {
            updates.isLinkedToAI = true
            needsUpdate = true
          }
        }

        // Atualizar documento se necessário
        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('documents')
            .update(updates)
            .eq('id', doc.id)

          if (updateError) {
            console.error(`❌ Erro ao atualizar documento ${doc.id}:`, updateError)
          } else {
            updatedCount++
            console.log(`✅ Documento ${doc.id} sincronizado`)
          }
        }
      }

      console.log(`✅ Sincronização concluída: ${updatedCount} documentos atualizados`)

      // Recarregar documentos após sincronização
      await loadDocuments(true)

      alert(`✅ Sincronização concluída! ${updatedCount} documentos foram atualizados na base de conhecimento.`)
    } catch (error) {
      console.error('❌ Erro ao sincronizar documentos:', error)
      alert('❌ Erro ao sincronizar documentos. Verifique o console para mais detalhes.')
    }
  }

  // Função para carregar documentos com cache usando a integração da base de conhecimento
  const loadDocuments = async (forceReload: boolean = false) => {
    const now = Date.now()

    // Verificar se o cache ainda é válido
    if (!forceReload && lastLoadTime > 0 && (now - lastLoadTime) < cacheExpiry && realDocuments.length > 0) {
      console.log('📋 Usando cache de documentos (válido por mais', Math.round((cacheExpiry - (now - lastLoadTime)) / 1000), 'segundos)')
      return
    }

    setIsLoadingDocuments(true)
    try {
      console.log('🔄 Carregando base de conhecimento completa...')

      // Carregar documentos usando a integração da base de conhecimento
      const documents = await KnowledgeBaseIntegration.getAllDocuments()

      console.log('📚 Documentos carregados da base de conhecimento:', documents.length)
      console.log('📋 Documentos vinculados à IA:', documents.filter(d => d.isLinkedToAI).length)

      if (documents.length > 0) {
        setRealDocuments(documents)
        setTotalDocs(documents.length)
        setLastLoadTime(now)

        // Carregar estatísticas da base de conhecimento
        const stats = await KnowledgeBaseIntegration.getKnowledgeStats()
        setKnowledgeStats(stats)

        console.log(`✅ ${documents.length} documentos carregados da base de conhecimento`)
        console.log('📊 Estatísticas:', stats)
      } else {
        console.log('⚠️ Nenhum documento encontrado na base de conhecimento')
        setRealDocuments([])
        setTotalDocs(0)
        setLastLoadTime(now)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar base de conhecimento:', error)
      alert('Erro ao carregar base de conhecimento')
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  // Aplicar filtro de tipo de usuário quando vier via location.state
  useEffect(() => {
    const state = location.state as { userType?: string; openDocumentId?: string } | null
    if (state?.userType) {
      setSelectedUserType(state.userType)
    }
    if (state?.openDocumentId) {
      setOpenDocumentId(state.openDocumentId)
    }
  }, [location.state])

  // Auto-abrir documento quando vier por comando (`openDocumentId`) — fail-closed (não abre se não achar/sem permissão)
  useEffect(() => {
    if (!openDocumentId) return
    if (!realDocuments || realDocuments.length === 0) return
    if (lastAutoOpenedRef.current === openDocumentId) return

    const doc = realDocuments.find(d => d.id === openDocumentId)
    if (!doc) return

    lastAutoOpenedRef.current = openDocumentId
    void handleViewDocument(doc)
  }, [openDocumentId, realDocuments, handleViewDocument])

  // Carregar documentos reais do Supabase
  useEffect(() => {
    loadDocuments()
  }, [])

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  return (
    <div className="min-h-screen text-white" style={{ background: backgroundGradient }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header — compacto e pro */}
        <div className="mb-5">
          <div
            className="relative overflow-hidden rounded-xl px-4 py-3 border"
            style={{ ...surfaceStyle, border: '1px solid rgba(0,193,106,0.18)' }}
          >
            <div className="absolute inset-0 opacity-60" style={{ background: highlightGradient }} />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-xl shrink-0"
                  style={{ background: accentGradient }}
                >
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-300 via-teal-200 to-cyan-200 bg-clip-text text-transparent leading-tight">
                    Base de Conhecimento da IA Residente
                  </h1>
                  <p className="text-xs text-slate-300 mt-0.5">Nôa Esperança IA • Educação • Pesquisa</p>
                </div>
              </div>
              {knowledgeStats && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/70 border border-slate-600/50 shadow-sm backdrop-blur-sm">
                    <Brain className="w-3.5 h-3.5 text-[#00F5A0]" />
                    <span className="text-[11px] text-slate-300">Vinculados</span>
                    <span className="text-xs font-bold tabular-nums text-[#00F5A0]">{knowledgeStats.aiLinkedDocuments}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/70 border border-slate-600/50 shadow-sm backdrop-blur-sm">
                    <TrendingUp className="w-3.5 h-3.5 text-[#4FE0C1]" />
                    <span className="text-[11px] text-slate-300">Relevância</span>
                    <span className="text-xs font-bold tabular-nums text-[#4FE0C1]">{knowledgeStats.averageRelevance.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: goldenGradient, color: '#0A192F' }}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    {showStats ? 'Ocultar' : 'Stats'}
                  </button>
                </div>
              )}
            </div>
            <div className="relative z-10 mt-1.5 pt-1.5 flex items-center gap-1.5 flex-wrap border-t border-slate-700/40">
              <span className="text-[11px] text-slate-500">Treinamento IA</span>
              <span className="text-slate-600 text-[10px]">·</span>
              <span className="text-[11px] text-slate-500">Recursos educacionais</span>
              <span className="text-slate-600 text-[10px]">·</span>
              <span className="text-[11px] text-slate-500">Referências científicas</span>
              <span className="text-slate-600 text-[10px]">·</span>
              <span className="text-[11px] text-slate-500">Protocolos clínicos</span>
            </div>
          </div>

          {showStats && knowledgeStats && (
            <div
              className="mt-3 p-4 rounded-lg"
              style={{ ...secondarySurfaceStyle, border: '1px solid rgba(0,193,106,0.16)' }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center py-1">
                  <div className="text-xl font-bold text-[#00F5A0]">{knowledgeStats.totalDocuments}</div>
                  <div className="text-xs text-slate-300">Total</div>
                </div>
                <div className="text-center py-1">
                  <div className="text-xl font-bold text-[#4FE0C1]">{knowledgeStats.aiLinkedDocuments}</div>
                  <div className="text-xs text-slate-300">Vinculados IA</div>
                </div>
                <div className="text-center py-1">
                  <div className="text-xl font-bold text-[#4FE0C1]">{knowledgeStats.averageRelevance.toFixed(2)}</div>
                  <div className="text-xs text-slate-300">Relevância</div>
                </div>
                <div className="text-center py-1">
                  <div className="text-xl font-bold text-[#FFD33D]">{knowledgeStats.topCategories.length}</div>
                  <div className="text-xs text-slate-300">Categorias</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <h3 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-[#00F5A0]" /> Top Categorias
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {knowledgeStats.topCategories.map((cat) => (
                    <span
                      key={cat.category}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs text-slate-200 bg-slate-800/50 border border-slate-700/50"
                    >
                      {cat.category}
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: accentGradient }}>{cat.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Busca e filtros — compacto e pro */}
        <div
          className="relative overflow-hidden rounded-xl p-4 mb-5"
          style={{ ...surfaceStyle, border: '1px solid rgba(0,193,106,0.16)' }}
        >
          <div className="absolute inset-0 opacity-50" style={{ background: 'linear-gradient(135deg, rgba(0,193,106,0.12) 0%, rgba(16,49,91,0.2) 50%, rgba(7,22,41,0.9) 100%)' }} />
          <div className="relative z-10 space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por título, conteúdo, autor..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00C16A]/50"
                  style={{ border: '1px solid rgba(0,193,106,0.25)', background: 'rgba(12,34,54,0.85)' }}
                />
                {searchTerm && (
                  <button type="button" onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center justify-center gap-1 px-3 py-2 text-white text-[11px] font-semibold rounded shrink-0 transition-all hover:opacity-90"
                style={{ background: accentGradient }}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload
              </button>
            </div>

            {/* Trigger bar padrão sofisticado */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" />
                  Filtros
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 rounded-xl text-white text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-[#00C16A]/40 min-w-0 transition-all"
                  style={{ background: 'rgba(12,34,54,0.95)', border: '1px solid rgba(0,193,106,0.25)' }}
                >
                  {categoriesWithCount.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.count})</option>
                  ))}
                </select>
                <select
                  value={selectedType}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedType(e.target.value)}
                  className="px-3 py-2 rounded-xl text-white text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-[#00C16A]/40 min-w-0 transition-all"
                  style={{ background: 'rgba(12,34,54,0.95)', border: '1px solid rgba(0,193,106,0.25)' }}
                >
                  {documentTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <select
                  value={selectedArea}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedArea(e.target.value)}
                  className="px-3 py-2 rounded-xl text-white text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-[#00C16A]/40 min-w-0 transition-all"
                  style={{ background: 'rgba(12,34,54,0.95)', border: '1px solid rgba(0,193,106,0.25)' }}
                >
                  {knowledgeAreas.map((a) => (
                    <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                  ))}
                </select>
              </div>
              <div className="h-5 w-px bg-slate-600/60 shrink-0" aria-hidden />
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-600/50 text-[11px] font-medium text-slate-300 tabular-nums">
                {filteredDocuments.length} {filteredDocuments.length === 1 ? 'doc.' : 'docs.'}
              </span>
              {selectedUserType !== 'all' && (
                <span className="text-xs text-slate-400 flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <Brain className="w-3 h-3 text-[#4FE0C1]" />
                  {userTypes.find(ut => ut.id === selectedUserType)?.name}
                </span>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => loadDocuments(true)}
                  disabled={isLoadingDocuments || isUploading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold disabled:opacity-50 transition-all hover:opacity-90 active:scale-[0.98] shadow-sm"
                  style={{ background: secondaryGradient, color: '#E6F4FF', border: '1px solid rgba(79,224,193,0.2)' }}
                >
                  {isLoadingDocuments ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  Atualizar
                </button>
                <button
                  onClick={syncAllDocuments}
                  disabled={isLoadingDocuments || isUploading}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold disabled:opacity-50 transition-all hover:opacity-90 active:scale-[0.98] shadow-md"
                  style={{ background: accentGradient, color: '#0A192F', border: '1px solid rgba(0,193,106,0.35)' }}
                  title="Sincronizar base com a plataforma"
                >
                  <Brain className="w-3.5 h-3.5" />
                  Sincronizar
                </button>
              </div>
            </div>
          </div>
        </div>


        {/* Upload Hint - Unified system with Drag and Drop */}
        {filteredDocuments.length === 0 && (
          <div
            className="mb-5 text-center py-8 rounded-lg transition-all"
            style={dropzoneStyle}
            onDragEnter={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsDragging(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsDragging(false)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsDragging(false)

              const files = e.dataTransfer.files
              if (files && files.length > 0) {
                const file = files[0]
                setUploadedFile(file)
                setShowUploadModal(true)
                console.log('📎 Arquivo solto na área principal:', file.name)
              }
            }}
          >
            <Brain className="w-10 h-10 mx-auto mb-2" style={{ color: isDragging ? '#00F5A0' : '#4FE0C1' }} />
            <h3 className="text-base font-semibold text-white mb-1">Base de Conhecimento Nôa</h3>
            <p className="text-sm text-slate-300 mb-3">
              {isDragging ? 'Solte aqui' : 'Upload para treinar a IA'}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-1.5 text-white text-sm font-medium rounded-lg transition-all"
              style={{ background: accentGradient }}
            >
              <Upload className="w-4 h-4 inline mr-1.5" />
              Upload
            </button>
            <p className="text-[11px] text-slate-400 mt-2">Arraste e solte ou clique</p>
          </div>
        )}

        {/* Lista de documentos — grid 3 cards, ~20% maior */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedDocuments.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border transition-all duration-200 hover:shadow-md p-4 flex flex-col h-full min-h-[11rem]"
              style={{ ...secondarySurfaceStyle, border: '1px solid rgba(0,193,106,0.12)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-md flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #00C16A 0%, #1a6ab3 100%)' }}
                >
                  <div className="text-sm leading-none">{getTypeIcon(doc.file_type)}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <h3 className="text-[13px] font-medium text-white line-clamp-1 truncate" title={doc.title}>
                      {doc.title}
                    </h3>
                    {doc.isLinkedToAI === true && (
                      <span className="shrink-0 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold flex items-center gap-0.5" style={{ background: accentGradient }}>
                        <Brain className="w-2.5 h-2.5" /> IA
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {doc.author || '—'} · {formatDate(doc.created_at)}
                  </p>
                </div>
              </div>

              {doc.summary && (
                <p className="text-[11px] text-slate-500 mb-2 line-clamp-2 italic flex-shrink-0">{doc.summary}</p>
              )}
              {((doc.tags?.length > 0) || (doc.keywords?.length > 0)) && (
                <div className="flex flex-wrap gap-1 mb-2 flex-shrink-0">
                      {[...(doc.tags || []), ...(doc.keywords || [])].slice(0, 3).map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-1.5 py-0.5 text-slate-400 text-[9px] rounded bg-slate-800/50"
                        >
                          {tag}
                        </span>
                      ))}
                      {([...(doc.tags || []), ...(doc.keywords || [])].length > 3) && (
                        <span className="px-1.5 py-0.5 text-slate-500 text-[9px] rounded bg-slate-800/50">
                          +{([...(doc.tags || []), ...(doc.keywords || [])].length - 3)}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 pt-3 mt-auto border-t border-slate-700/30">
                    <span className="text-[10px] text-slate-500 mr-auto">⬇{doc.downloads ?? 0}</span>
                    {doc.aiRelevance !== undefined && doc.aiRelevance > 0 && (
                      <span className="text-[9px] text-slate-500">Rel {doc.aiRelevance}</span>
                    )}
                    <div className="flex items-center gap-1 flex-wrap">
                      <button
                        onClick={() => void handleViewDocument(doc)}
                        title="Ver documento"
                        className="inline-flex items-center gap-1 h-6 min-w-0 px-2 rounded border border-slate-600/50 bg-slate-800/60 text-slate-200 text-[9px] font-medium leading-none transition-all hover:bg-slate-700/70 hover:border-slate-500/50"
                      >
                        <Eye className="w-2.5 h-2.5 shrink-0 opacity-90" />
                        Ver
                      </button>
                      <button
                        title="Baixar"
                        onClick={async () => {
                          try {
                            let downloadUrl = doc.file_url

                            // Se não tiver URL ou URL não funcionar, criar signed URL
                            if (!downloadUrl || downloadUrl.includes('Bucket not found') || downloadUrl.includes('404')) {
                              // Tentar encontrar o arquivo no Storage
                              const fileName = doc.title || ''
                              const { data: files } = await supabase.storage
                                .from('documents')
                                .list('', { limit: 100 })

                              if (files) {
                                const file = files.find(f =>
                                  f.name.toLowerCase().includes(fileName.toLowerCase().split('.')[0]) ||
                                  fileName.toLowerCase().includes(f.name.toLowerCase().split('.')[0])
                                )

                                if (file) {
                                  const { data: signedData, error: signedError } = await supabase.storage
                                    .from('documents')
                                    .createSignedUrl(file.name, 3600)

                                  if (!signedError && signedData) {
                                    downloadUrl = signedData.signedUrl
                                  }
                                }
                              }
                            } else if (downloadUrl.includes('supabase.co/storage')) {
                              // Tentar criar signed URL se necessário
                              const pathMatch = downloadUrl.match(/\/storage\/v1\/object\/[^\/]+\/(.+)$/)
                              if (pathMatch) {
                                const filePath = decodeURIComponent(pathMatch[1])
                                const { data: signedData } = await supabase.storage
                                  .from('documents')
                                  .createSignedUrl(filePath, 3600)

                                if (signedData) {
                                  downloadUrl = signedData.signedUrl
                                }
                              }
                            }

                            if (downloadUrl) {
                              // Incrementar contador de downloads
                              await supabase
                                .from('documents')
                                .update({ downloads: (doc.downloads || 0) + 1 })
                                .eq('id', doc.id)

                              // Fazer download
                              const link = document.createElement('a')
                              link.href = downloadUrl
                              link.download = doc.title
                              link.target = '_blank'
                              link.click()

                              // Atualizar contador local
                              setRealDocuments(prev => prev.map(d =>
                                d.id === doc.id ? { ...d, downloads: (d.downloads || 0) + 1 } : d
                              ))
                            } else {
                              alert('Não foi possível fazer download. Verifique se o arquivo existe no Storage.')
                            }
                          } catch (error) {
                            console.error('Erro no download:', error)
                            alert('Erro ao fazer download do arquivo')
                          }
                        }}
                        className="inline-flex items-center gap-1 h-6 min-w-0 px-2 rounded border border-emerald-600/40 bg-emerald-900/40 text-emerald-200 text-[9px] font-medium leading-none transition-all hover:bg-emerald-800/50 hover:border-emerald-500/50"
                      >
                        <Download className="w-2 h-2 shrink-0 opacity-90" />
                        Baixar
                      </button>
                      {doc.isLinkedToAI ? (
                        <button
                          onClick={async () => {
                            if (!confirm(`Tem certeza que deseja desvincular o documento "${doc.title}" da IA residente?`)) {
                              return
                            }

                            try {
                              const success = await KnowledgeBaseIntegration.unlinkDocumentFromAI(doc.id)

                              if (success) {
                                // Atualizar estado local
                                setRealDocuments(prev => prev.map(d =>
                                  d.id === doc.id ? { ...d, isLinkedToAI: false, aiRelevance: 0 } : d
                                ))

                                // Recarregar estatísticas
                                const stats = await KnowledgeBaseIntegration.getKnowledgeStats()
                                setKnowledgeStats(stats)

                                alert('Documento desvinculado da IA residente com sucesso!')
                              } else {
                                alert('Erro ao desvincular documento da IA.')
                              }
                            } catch (error) {
                              console.error('Erro ao desvincular documento:', error)
                              alert('Erro ao desvincular documento da IA.')
                            }
                          }}
                          className="inline-flex items-center gap-0.5 h-5 min-w-0 px-1.5 rounded-sm border border-sky-600/40 bg-sky-900/40 text-sky-200 text-[8px] font-medium leading-none transition-all hover:bg-sky-800/50 hover:border-sky-500/50"
                          title="Desvincular da IA residente"
                        >
                          <XCircle className="w-2 h-2 shrink-0 opacity-90" />
                          Desvinc.
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              const success = await KnowledgeBaseIntegration.linkDocumentToAI(doc.id, 5)

                              if (success) {
                                // Atualizar estado local
                                setRealDocuments(prev => prev.map(d =>
                                  d.id === doc.id ? { ...d, isLinkedToAI: true, aiRelevance: 5 } : d
                                ))

                                // Recarregar estatísticas
                                const stats = await KnowledgeBaseIntegration.getKnowledgeStats()
                                setKnowledgeStats(stats)

                                alert('Documento vinculado à IA residente com sucesso!')
                              } else {
                                alert('Erro ao vincular documento à IA.')
                              }
                            } catch (error) {
                              console.error('Erro ao vincular documento:', error)
                              alert('Erro ao vincular documento à IA.')
                            }
                          }}
                          className="inline-flex items-center gap-1 h-6 min-w-0 px-2 rounded border border-emerald-600/40 bg-emerald-900/40 text-emerald-200 text-[9px] font-medium leading-none transition-all hover:bg-emerald-800/50 hover:border-emerald-500/50"
                          title="Vincular à IA residente"
                        >
                          <LinkIcon className="w-2 h-2 shrink-0 opacity-90" />
                          Vincular
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          if (!confirm(`Tem certeza que deseja excluir o documento "${doc.title}"? Esta ação não pode ser desfeita.`)) {
                            return
                          }

                          try {
                            // Extrair nome do arquivo da URL ou título
                            let fileName: string | null = null

                            if (doc.file_url) {
                              const pathMatch = doc.file_url.match(/\/storage\/v1\/object\/[^\/]+\/(.+)$/)
                              if (pathMatch) {
                                fileName = decodeURIComponent(pathMatch[1])
                              }
                            }

                            // Se não encontrou na URL, tentar encontrar no Storage
                            if (!fileName) {
                              const { data: files } = await supabase.storage
                                .from('documents')
                                .list('', { limit: 100 })

                              if (files) {
                                const file = files.find(f =>
                                  f.name.toLowerCase().includes(doc.title.toLowerCase().split('.')[0]) ||
                                  doc.title.toLowerCase().includes(f.name.toLowerCase().split('.')[0])
                                )

                                if (file) {
                                  fileName = file.name
                                }
                              }
                            }

                            // Deletar do Storage se encontrou o arquivo
                            if (fileName) {
                              const { error: storageError } = await supabase.storage
                                .from('documents')
                                .remove([fileName])

                              if (storageError) {
                                console.warn('Erro ao deletar arquivo do Storage (pode não existir):', storageError)
                              } else {
                                console.log('✅ Arquivo deletado do Storage:', fileName)
                              }
                            }

                            // Deletar do banco de dados
                            const { error: dbError } = await supabase
                              .from('documents')
                              .delete()
                              .eq('id', doc.id)

                            if (dbError) {
                              throw dbError
                            }

                            // Remover da lista local
                            setRealDocuments(prev => prev.filter(d => d.id !== doc.id))
                            setTotalDocs(prev => Math.max(0, prev - 1))

                            alert('Documento excluído com sucesso!')
                          } catch (error) {
                            console.error('Erro ao excluir documento:', error)
                            alert('Erro ao excluir documento. Verifique as permissões.')
                          }
                        }}
                        className="inline-flex items-center gap-1 h-6 min-w-0 px-2 rounded border border-red-500/40 bg-red-900/30 text-red-200 text-[9px] font-medium leading-none transition-all hover:bg-red-800/40 hover:border-red-400/50"
                        title="Excluir documento"
                      >
                        <Trash2 className="w-2 h-2 shrink-0 opacity-90" />
                        Excluir
                      </button>
                    </div>
                  </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-center gap-2 mt-5 mb-3">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: currentPage === 1 ? 'rgba(12, 31, 54, 0.6)' : accentGradient,
                color: 'white',
                boxShadow: currentPage === 1 ? 'none' : '0 8px 20px rgba(0,193,106,0.3)'
              }}
            >
              ← Anterior
            </button>

            <div className="flex items-center gap-1">
              {/* Show first page */}
              {currentPage > 3 && (
                <>
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="w-9 h-9 rounded-lg font-bold text-sm transition-all text-slate-300 hover:text-white"
                    style={{ background: 'rgba(12, 31, 54, 0.6)' }}
                  >
                    1
                  </button>
                  {currentPage > 4 && <span className="text-slate-500 px-1">...</span>}
                </>
              )}

              {/* Show nearby pages */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page >= currentPage - 2 && page <= currentPage + 2)
                .map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg font-bold text-sm transition-all ${currentPage === page
                      ? 'text-white shadow-lg'
                      : 'text-slate-300 hover:text-white'
                      }`}
                    style={{
                      background: currentPage === page ? accentGradient : 'rgba(12, 31, 54, 0.6)',
                      boxShadow: currentPage === page ? '0 8px 20px rgba(0,193,106,0.3)' : 'none'
                    }}
                  >
                    {page}
                  </button>
                ))}

              {/* Show last page */}
              {currentPage < totalPages - 2 && (
                <>
                  {currentPage < totalPages - 3 && <span className="text-slate-500 px-1">...</span>}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-9 h-9 rounded-lg font-bold text-sm transition-all text-slate-300 hover:text-white"
                    style={{ background: 'rgba(12, 31, 54, 0.6)' }}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: currentPage === totalPages ? 'rgba(12, 31, 54, 0.6)' : accentGradient,
                color: 'white',
                boxShadow: currentPage === totalPages ? 'none' : '0 8px 20px rgba(0,193,106,0.3)'
              }}
            >
              Próximo →
            </button>
          </div>
        )}

        {/* Page Info */}
        {filteredDocuments.length > 0 && (
          <div className="text-center text-sm text-slate-400 mb-6">
            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredDocuments.length)} de {filteredDocuments.length} documentos
          </div>
        )}

        {/* Empty State */}

        {filteredDocuments.length === 0 && (
          <div
            className="text-center py-12 rounded-lg"
            style={{
              border: '1px dashed rgba(0,193,106,0.4)',
              background: 'rgba(12,34,54,0.72)',
              boxShadow: '0 16px 32px rgba(2,12,27,0.4)'
            }}
          >
            <div className="w-16 h-16 mx-auto mb-4 text-5xl" style={{ color: '#4FE0C1' }}>📁</div>
            <h3 className="text-lg font-medium text-white mb-2">
              Nenhum documento encontrado
            </h3>
            <p className="text-slate-300">
              Tente ajustar os filtros ou fazer uma nova busca
            </p>
            <p className="text-xs text-[#00F5A0] mt-2">
              Ou faça upload de um novo documento para a base de conhecimento
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="rounded-xl p-6 text-center" style={{ ...secondarySurfaceStyle, border: '1px solid rgba(0,193,106,0.16)' }}>
            <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: '#4FE0C1' }} />
            <div className="text-2xl font-bold text-white">
              {totalDocs > 0 ? totalDocs : '1,247'}
            </div>
            <div className="text-sm text-slate-300">
              {totalDocs > 0 ? 'Documentos Reais' : 'Documentos (Fictício)'}
            </div>
          </div>
          <div className="rounded-xl p-6 text-center" style={{ ...secondarySurfaceStyle, border: '1px solid rgba(0,193,106,0.16)' }}>
            <div className="w-8 h-8 mx-auto mb-2 text-2xl" style={{ color: '#00F5A0' }}>⬇️</div>
            <div className="text-2xl font-bold text-white">
              {realDocuments.reduce((sum, doc: any) => sum + (doc.downloads || 0), 0)}
            </div>
            <div className="text-sm text-slate-300">Total de Downloads</div>
          </div>
          <div className="rounded-xl p-6 text-center" style={{ ...secondarySurfaceStyle, border: '1px solid rgba(0,193,106,0.16)' }}>
            <div className="w-8 h-8 mx-auto mb-2 text-2xl" style={{ color: '#4FE0C1' }}>#</div>
            <div className="text-2xl font-bold text-white">
              {realDocuments.filter((d: any) => d.isLinkedToAI === true).length}
            </div>
            <div className="text-sm text-slate-300">
              Vinculados à IA
            </div>
          </div>
          <div className="rounded-xl p-6 text-center" style={{ ...secondarySurfaceStyle, border: '1px solid rgba(0,193,106,0.16)' }}>
            <Star className="w-8 h-8 mx-auto mb-2" style={{ color: '#FFD33D' }} />
            <div className="text-2xl font-bold text-white">
              {realDocuments.length > 0
                ? (realDocuments.reduce((sum: number, doc: any) => sum + (doc.aiRelevance || 0), 0) / realDocuments.length).toFixed(1)
                : '0'
              }
            </div>
            <div className="text-sm text-slate-300">Relevância IA Média</div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div
            className="rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            style={{ background: 'rgba(7,22,41,0.96)' }}
          >
            {/* Modal Header */}
            <div className="p-6" style={{ borderBottom: '1px solid rgba(0,193,106,0.12)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Upload de Documentos</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Upload Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Selecione a Categoria do Upload
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {uploadCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setUploadCategory(category.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${uploadCategory === category.id
                        ? 'border-emerald-400 bg-emerald-500/10'
                        : 'border-slate-600 hover:border-emerald-400 bg-slate-700/40'
                        }`}
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 text-white`}>
                        {category.icon}
                      </div>
                      <h3 className="font-semibold text-white text-sm mb-1">
                        {category.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {category.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload Area */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Selecione o Arquivo
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : uploadedFile
                      ? 'border-emerald-400 bg-emerald-500/10'
                      : 'border-slate-600 hover:border-emerald-400'
                    }`}
                  onDragEnter={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsDragging(true)
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsDragging(false)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsDragging(false)

                    const files = e.dataTransfer.files
                    if (files && files.length > 0) {
                      const file = files[0]
                      setUploadedFile(file)
                      console.log('📎 Arquivo solto via drag and drop:', file.name)
                    }
                  }}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setUploadedFile(file)
                        console.log('📎 Arquivo selecionado:', file.name)
                      }
                    }}
                    accept={uploadCategory === 'ai-avatar' ? 'image/*' : '*'}
                  />
                  {uploadedFile ? (
                    <div className="space-y-3">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                      <div>
                        <p className="text-white font-medium">{uploadedFile.name}</p>
                        <p className="text-sm text-slate-400">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="text-sm text-red-400 hover:text-red-300"
                      >
                        Remover arquivo
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer block"
                    >
                      <Upload className="w-16 h-16 text-slate-400 mx-auto mb-3" />
                      <p className="text-white font-medium mb-1">
                        Clique para selecionar ou arraste o arquivo aqui
                      </p>
                      <p className="text-sm text-slate-400">
                        {uploadCategory === 'ai-avatar' ? 'PNG, JPG ou SVG (recomendado: PNG, 512x512px)' : 'PDF, DOCX, MP4, Imagens, etc.'}
                      </p>
                    </label>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Enviando...</span>
                    <span className="text-sm text-slate-300">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%`, background: accentGradient }}
                    />
                  </div>
                </div>
              )}

              {/* Success Message */}
              {uploadSuccess && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <div>
                      <p className="font-medium text-green-400">Upload concluído com sucesso!</p>
                      <p className="text-sm text-slate-300">
                        {uploadCategory === 'ai-avatar'
                          ? 'O avatar da IA residente foi atualizado.'
                          : 'O documento foi adicionado à biblioteca.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg transition-colors text-white"
                  style={{ background: 'rgba(12,34,54,0.85)', border: '1px solid rgba(0,193,106,0.2)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadedFile || isUploading}
                  className="flex-1 px-4 py-3 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{ background: accentGradient }}
                >
                  {isUploading ? 'Enviando...' : 'Fazer Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Library

