import React, { useState, useEffect } from 'react'
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
  Target
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { KnowledgeBaseIntegration, KnowledgeDocument, KnowledgeStats } from '../services/knowledgeBaseIntegration'

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
  }, [debouncedSearchTerm, selectedCategory, selectedType, selectedUserType, selectedArea, realDocuments])

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
      
      const documentMetadata = {
        title: file.name,
        content: '', // Deixar vazio para extrair depois
        file_type: fileExt || 'unknown',
        file_url: finalUrl,
        file_size: file.size,
        author: user?.name || 'Usuário',
        category: documentCategory,
        target_audience: targetAudience,
        tags: tags,
        isLinkedToAI: category === 'ai-documents' || category === 'research' || documentCategory === 'protocols',
        summary: `Documento enviado em ${new Date().toLocaleDateString('pt-BR')} - Categoria: ${documentCategory}`,
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
      color: 'from-blue-500 to-cyan-500'
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
      color: 'from-blue-500 to-cyan-500'
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
    const state = location.state as { userType?: string } | null
    if (state?.userType) {
      setSelectedUserType(state.userType)
    }
  }, [location.state])

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
        {/* Header Melhorado - Conectado à IA Residente */}
        <div className="mb-8">
          <div
            className="relative overflow-hidden rounded-2xl p-6 border"
            style={{ ...surfaceStyle, border: '1px solid rgba(0,193,106,0.18)' }}
          >
            <div className="absolute inset-0" style={{ background: highlightGradient }}></div>
            <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className="p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform"
                  style={{ background: accentGradient, boxShadow: '0 18px 36px rgba(0,193,106,0.32)' }}
                >
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-green-300 via-teal-200 to-cyan-200 bg-clip-text text-transparent mb-1">
                    Base de Conhecimento
                  </h1>
                  <p className="text-sm font-semibold text-[rgba(200,214,229,0.85)]">
                    Nôa Esperança IA • Educação • Pesquisa
                  </p>
                </div>
              </div>
              
              {/* Estatísticas Inline Melhoradas - Conectadas à IA */}
              {knowledgeStats && (
                <div className="flex flex-wrap items-center gap-4">
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                    style={{ background: 'rgba(7, 44, 68, 0.78)', border: '1px solid rgba(0,193,106,0.22)', boxShadow: '0 14px 28px rgba(0,0,0,0.35)' }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="p-2 rounded-lg shadow-lg"
                        style={{ background: accentGradient }}
                      >
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-200 font-medium">Vinculados à IA Residente</div>
                        <div className="text-lg font-bold text-[#00F5A0]">{knowledgeStats.aiLinkedDocuments}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
                    style={{ background: 'rgba(7, 36, 54, 0.78)', border: '1px solid rgba(0,193,106,0.22)', boxShadow: '0 14px 28px rgba(0,0,0,0.35)' }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="p-2 rounded-lg shadow-lg"
                        style={{ background: secondaryGradient }}
                      >
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-200 font-medium">Relevância Média IA</div>
                        <div className="text-lg font-bold text-[#4FE0C1]">{knowledgeStats.averageRelevance.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    style={{ background: goldenGradient, color: '#0A192F' }}
                  >
                    <BarChart3 className="w-5 h-5" />
                    {showStats ? 'Ocultar' : 'Ver'} Estatísticas
                  </button>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(0,193,106,0.12)', border: '1px solid rgba(0,193,106,0.35)' }}
              >
                <Brain className="w-4 h-4 text-[#00F5A0]" />
                <span className="text-sm text-slate-200 font-medium">Treinamento da IA Residente</span>
              </div>
              <span className="text-slate-500">•</span>
              <span className="text-sm text-slate-300 font-medium">Recursos educacionais</span>
              <span className="text-slate-500">•</span>
              <span className="text-sm text-slate-300 font-medium">Referências científicas</span>
              <span className="text-slate-500">•</span>
              <span className="text-sm text-slate-300 font-medium">Protocolos clínicos</span>
            </div>
            </div>
          </div>

          {/* Painel de Estatísticas Expandido */}
          {showStats && knowledgeStats && (
            <div
              className="mt-6 p-6 rounded-xl"
              style={{ ...secondarySurfaceStyle, border: '1px solid rgba(0,193,106,0.16)' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#00F5A0]">
                    {knowledgeStats.totalDocuments}
                  </div>
                  <div className="text-sm text-slate-200">
                    Total de Documentos
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4FE0C1]">
                    {knowledgeStats.aiLinkedDocuments}
                  </div>
                  <div className="text-sm text-slate-200">
                    Vinculados à IA
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4FE0C1]">
                    {knowledgeStats.averageRelevance.toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-200">
                    Relevância Média
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#FFD33D]">
                    {knowledgeStats.topCategories.length}
                  </div>
                  <div className="text-sm text-slate-200">
                    Categorias Ativas
                  </div>
                </div>
              </div>
              
              {/* Top Categorias */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#00F5A0]" />
                  Top Categorias
                </h3>
                <div className="flex flex-wrap gap-2">
                  {knowledgeStats.topCategories.map((cat, index) => (
                    <div
                      key={cat.category}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(7, 44, 68, 0.65)', border: '1px solid rgba(0,193,106,0.16)' }}
                    >
                      <span className="text-sm font-medium text-slate-200">
                        {cat.category}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full font-bold" style={{ background: accentGradient }}>
                        {cat.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Busca Melhorada - Conectada à IA Residente */}
        <div
          className="relative overflow-hidden rounded-2xl shadow-xl p-6 mb-8"
          style={{ ...surfaceStyle, border: '1px solid rgba(0,193,106,0.16)' }}
        >
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,193,106,0.2) 0%, rgba(16,49,91,0.35) 45%, rgba(7,22,41,0.85) 100%)' }}></div>
          <div className="relative z-10">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar Melhorada */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Search className="w-6 h-6 text-[#4FE0C1]" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar documentos por título, conteúdo, autor..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 rounded-xl focus:outline-none focus:ring-4 text-white font-medium text-lg shadow-lg"
                  style={{
                    border: '1px solid rgba(0,193,106,0.3)',
                    background: 'rgba(12,34,54,0.85)',
                    boxShadow: '0 10px 28px rgba(2,12,27,0.45)'
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Upload Button Melhorado */}
            <button 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center justify-center gap-2 px-8 py-4 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 text-lg"
              style={{ background: accentGradient }}
            >
              <Upload className="w-6 h-6" />
              Fazer Upload
            </button>
          </div>
          
          {/* Filtros Secundários */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,193,106,0.16)' }}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">Categoria:</span>
              <select
                value={selectedCategory}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg text-white font-semibold focus:outline-none"
                style={{ background: 'rgba(12,34,54,0.82)', border: '1px solid rgba(0,193,106,0.16)', boxShadow: '0 8px 20px rgba(2,12,27,0.35)' }}
              >
                {categoriesWithCount.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">Tipo:</span>
              <select
                value={selectedType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedType(e.target.value)}
                className="px-4 py-2 rounded-lg text-white font-semibold focus:outline-none"
                style={{ background: 'rgba(12,34,54,0.82)', border: '1px solid rgba(0,193,106,0.16)', boxShadow: '0 8px 20px rgba(2,12,27,0.35)' }}
              >
                {documentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">Área:</span>
              <select
                value={selectedArea}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedArea(e.target.value)}
                className="px-4 py-2 rounded-lg text-white font-semibold focus:outline-none"
                style={{ background: 'rgba(12,34,54,0.82)', border: '1px solid rgba(0,193,106,0.16)', boxShadow: '0 8px 20px rgba(2,12,27,0.35)' }}
              >
                {knowledgeAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.icon} {area.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Contador e Atualizar - Integrado ao Card de Busca */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(0,193,106,0.16)' }}>
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg shadow-lg"
                style={{ background: accentGradient }}
              >
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">
                  {filteredDocuments.length} {filteredDocuments.length === 1 ? 'documento encontrado' : 'documentos encontrados'}
                </p>
                {selectedUserType !== 'all' && (
                  <p className="text-sm text-slate-300 mt-1 flex items-center gap-1">
                    <Brain className="w-3 h-3" style={{ color: '#4FE0C1' }} />
                    Filtrado para: {userTypes.find(ut => ut.id === selectedUserType)?.name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadDocuments(true)}
                disabled={isLoadingDocuments || isUploading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                style={{ background: secondaryGradient, color: '#E6F4FF' }}
              >
                {isLoadingDocuments ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Carregando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Atualizar Lista
                  </>
                )}
              </button>
              
              <button
                onClick={syncAllDocuments}
                disabled={isLoadingDocuments || isUploading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                style={{ background: accentGradient }}
                title="Sincronizar todos os documentos da plataforma com a base de conhecimento"
              >
                <Brain className="w-5 h-5" />
                Sincronizar Base
              </button>
            </div>
          </div>
          </div>
        </div>


        {/* Upload Hint - Unified system with Drag and Drop */}
        {filteredDocuments.length === 0 && (
          <div
            className="mb-8 text-center py-12 rounded-xl transition-all"
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
            <Brain className="w-12 h-12 mx-auto mb-3" style={{ color: isDragging ? '#00F5A0' : '#4FE0C1' }} />
            <h3 className="text-lg font-bold text-white mb-2">
              Base de Conhecimento da Nôa Esperança
            </h3>
            <p className="text-slate-200 mb-4">
              {isDragging 
                ? 'Solte o arquivo aqui para fazer upload' 
                : 'Faça upload de documentos para treinar a IA e expandir a base de conhecimento'}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2 text-white font-semibold rounded-lg transition-all"
              style={{ background: accentGradient }}
            >
              <Upload className="w-5 h-5 inline mr-2" />
              Fazer Upload
            </button>
            <p className="text-xs text-slate-300 mt-3">
              Ou arraste e solte um arquivo aqui
            </p>
          </div>
        )}

        {/* Documents List - Dynamic and Intelligent */}
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <div 
              key={doc.id} 
              className="rounded-xl border transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
              style={{ ...secondarySurfaceStyle, border: '1px solid rgba(0,193,106,0.16)' }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #00C16A 0%, #1a6ab3 100%)', boxShadow: '0 16px 32px rgba(0,0,0,0.35)' }}
                >
                  <div className="text-3xl">
                    {getTypeIcon(doc.file_type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-white mb-2 line-clamp-2">
                        {doc.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-300 font-medium mb-3">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {doc.author || 'Autor não disponível'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {formatFileSize(doc.file_size || 0)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          📅 {formatDate(doc.created_at)}
                        </span>
                      </div>
                    </div>
                    
                    {/* AI Badge */}
                    {doc.isLinkedToAI === true && (
                      <div className="flex-shrink-0">
                        <div
                          className="text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1"
                          style={{ background: accentGradient }}
                        >
                          <Brain className="w-3 h-3" />
                          IA Ativa
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {doc.summary && (
                    <p className="text-sm text-slate-200 mb-3 line-clamp-2 italic">
                      {doc.summary}
                    </p>
                  )}

                  {/* Tags */}
                  {(doc.tags?.length > 0 || doc.keywords?.length > 0) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {doc.tags && doc.tags.length > 0 && doc.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-white text-xs rounded-full font-semibold shadow-md"
                          style={{ background: secondaryGradient }}
                        >
                          {tag}
                        </span>
                      ))}
                      {doc.keywords && doc.keywords.map((keyword: string, index: number) => (
                        <span
                          key={`kw-${index}`}
                          className="px-3 py-1 text-white text-xs rounded-full font-semibold shadow-md"
                          style={{ background: accentGradient }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(0,193,106,0.16)' }}>
                    <div className="flex items-center gap-4 text-xs text-slate-200 font-medium">
                      <span className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: 'rgba(12, 48, 68, 0.65)' }}>
                        ⬇️ {doc.downloads || 0} downloads
                      </span>
                      {doc.aiRelevance && doc.aiRelevance > 0 && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: 'rgba(0,193,106,0.12)', border: '1px solid rgba(0,193,106,0.35)', color: '#4FE0C1' }}>
                          <Brain className="w-3 h-3" />
                          Relevância IA: {doc.aiRelevance}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={async () => {
                          try {
                            let viewUrl = doc.file_url
                            
                            // Se não tiver URL ou URL não funcionar, criar signed URL
                            if (!viewUrl || viewUrl.includes('Bucket not found') || viewUrl.includes('404')) {
                              // Tentar encontrar o arquivo no Storage pelo título
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
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
                        style={{ background: secondaryGradient }}
                      >
                        <Eye className="w-4 h-4" />
                        Visualizar
                      </button>
                      <button 
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
                        className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
                        style={{ background: accentGradient }}
                      >
                        ⬇️ Baixar
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
                          className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
                          style={{ background: 'linear-gradient(135deg, #1a365d 0%, #00A176 100%)' }}
                          title="Desvincular da IA residente"
                        >
                          <XCircle className="w-4 h-4" />
                          Desvincular IA
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
                          className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
                          style={{ background: accentGradient }}
                          title="Atribuir à IA residente"
                        >
                          <LinkIcon className="w-4 h-4" />
                          Atribuir à IA
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
                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
                        style={{ background: 'linear-gradient(135deg, #FF5F6D 0%, #FFC371 100%)', color: '#0A192F' }}
                        title="Excluir documento"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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
            style={{ background: 'rgba(7,22,41,0.96)', border: '1px solid rgba(0,193,106,0.16)' }}
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
                      className={`p-4 rounded-lg border-2 transition-all ${
                        uploadCategory === category.id
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
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging
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

