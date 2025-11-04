import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Mic, MicOff, X, Send, Loader2, Activity, BookOpen, Brain, Upload } from 'lucide-react'
import clsx from 'clsx'
import NoaAnimatedAvatar from './NoaAnimatedAvatar'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'
import { useMedCannLabConversation } from '../hooks/useMedCannLabConversation'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { KnowledgeBaseIntegration } from '../services/knowledgeBaseIntegration'

interface NoaConversationalInterfaceProps {
  userCode?: string
  userName?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  hideButton?: boolean
}

const quickCommands = [
  {
    label: 'Status da plataforma',
    command: 'Nôa, como está o status da plataforma agora?'
  },
  {
    label: 'Contexto de nefrologia',
    command: 'Nôa, mostre o contexto de treinamento recente focado em nefrologia.'
  },
  {
    label: 'Simulação renal IMRE',
    command: 'Inicie uma simulação clínica renal considerando todos os eixos IMRE.'
  },
  {
    label: 'Protocolos cannabis',
    command: 'Busque protocolos atualizados de cannabis medicinal aplicados à nefrologia.'
  }
]

const getPositionClasses = (position: NoaConversationalInterfaceProps['position']) => {
  switch (position) {
    case 'bottom-left':
      return 'bottom-4 left-4'
    case 'top-right':
      return 'top-4 right-4'
    case 'top-left':
      return 'top-4 left-4'
    case 'bottom-right':
    default:
      return 'bottom-4 right-4'
  }
}

type RecognitionHandle = {
  recognition: any
  timer?: number
  buffer: string
  stopped?: boolean
}

const NoaConversationalInterface: React.FC<NoaConversationalInterfaceProps> = ({
  userCode = 'DR-001',
  userName = 'Dr. Ricardo Valença',
  position = 'bottom-right',
  hideButton = false
}) => {
  const { isOpen: contextIsOpen, pendingMessage, clearPendingMessage, closeChat } = useNoaPlatform()
  const [isOpen, setIsOpen] = useState(hideButton || contextIsOpen)
  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadCategory, setUploadCategory] = useState('ai-documents')
  const [uploadArea, setUploadArea] = useState('cannabis')
  const [uploadUserType, setUploadUserType] = useState<string[]>(['professional', 'student'])
  const recognitionRef = useRef<RecognitionHandle | null>(null)
  const prevIsSpeakingRef = useRef(false)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { user } = useAuth()

  const {
    messages,
    sendMessage,
    isProcessing,
    isSpeaking,
    error,
    triggerQuickCommand,
    usedEndpoints,
    lastIntent
  } = useMedCannLabConversation()

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    setIsOpen(contextIsOpen || hideButton)
  }, [contextIsOpen, hideButton])

  useEffect(() => {
    if (pendingMessage) {
      setInputValue(pendingMessage)
      sendMessage(pendingMessage)
      clearPendingMessage()
    }
  }, [pendingMessage, sendMessage, clearPendingMessage])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stopped = true
        if (recognitionRef.current.timer) {
          window.clearTimeout(recognitionRef.current.timer)
          recognitionRef.current.timer = undefined
        }
        recognitionRef.current.recognition.onresult = null
        recognitionRef.current.recognition.onerror = null
        recognitionRef.current.recognition.onend = null
        recognitionRef.current.recognition.stop()
        const text = recognitionRef.current.buffer.trim()
        if (text.length > 0) {
          sendMessage(text, { preferVoice: true })
        }
        recognitionRef.current = null
      }
    }
  }, [sendMessage])

  const stopListening = useCallback(() => {
    const handle = recognitionRef.current
    if (handle) {
      handle.stopped = true
      if (handle.timer) {
        window.clearTimeout(handle.timer)
        handle.timer = undefined
      }
      handle.recognition.onresult = null
      handle.recognition.onerror = null
      handle.recognition.onend = null
      handle.recognition.stop()
      const text = handle.buffer.trim()
      if (text.length > 0) {
        sendMessage(text, { preferVoice: true })
      }
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [sendMessage])

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Reconhecimento de voz não suportado neste navegador.')
      return
    }

    window.dispatchEvent(new Event('noaStopSpeech'))
    stopListening()

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition: any = new SpeechRecognition()
    recognition.lang = 'pt-BR'
    recognition.continuous = true
    recognition.interimResults = true

    const handle: RecognitionHandle = {
      recognition,
      buffer: ''
    }
    recognitionRef.current = handle

    const flush = () => {
      const text = handle.buffer.trim()
      if (text.length > 0) {
        sendMessage(text, { preferVoice: true })
        handle.buffer = ''
      }
    }

    const scheduleFlush = () => {
      if (handle.timer) {
        window.clearTimeout(handle.timer)
      }
      handle.timer = window.setTimeout(() => {
        flush()
      }, 900)
    }

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          handle.buffer += `${result[0].transcript.trim()} `
          scheduleFlush()
        }
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error)
      if (handle.timer) {
        window.clearTimeout(handle.timer)
        handle.timer = undefined
      }
      flush()
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      if (handle.timer) {
        window.clearTimeout(handle.timer)
        handle.timer = undefined
      }
      flush()
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.start()
    setIsListening(true)
  }, [sendMessage, stopListening])

  // Parar microfone quando a IA começar a processar
  useEffect(() => {
    if (isProcessing && isListening) {
      stopListening()
    }
  }, [isProcessing, isListening, stopListening])

  // Auto-iniciar microfone quando a IA terminar de falar
  useEffect(() => {
    // Quando a IA termina de falar (isSpeaking muda de true para false)
    if (prevIsSpeakingRef.current && !isSpeaking && isOpen && !isProcessing) {
      // Aguardar um pequeno delay para garantir que a síntese de voz terminou completamente
      const timer = setTimeout(() => {
        // Verificar se não está já escutando, se o chat está aberto e não está processando
        if (!isListening && isOpen && !isProcessing) {
          startListening()
        }
      }, 300) // 300ms de delay para transição suave

      return () => clearTimeout(timer)
    }
    
    // Atualizar referência para próximo ciclo
    prevIsSpeakingRef.current = isSpeaking
  }, [isSpeaking, isOpen, isListening, isProcessing, startListening])

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return
    // Parar microfone quando enviar mensagem manualmente
    if (isListening) {
      stopListening()
    }
    sendMessage(inputValue)
    setInputValue('')
  }, [inputValue, sendMessage, isListening, stopListening])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  const handleQuickCommand = useCallback((command: string) => {
    setInputValue('')
    triggerQuickCommand(command)
  }, [triggerQuickCommand])

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Abrir modal de categorização
    setUploadedFile(file)
    setShowUploadModal(true)
    
    // Resetar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Processar upload com categorias selecionadas
  const processFileUpload = useCallback(async () => {
    if (!uploadedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setShowUploadModal(false)

    let progressInterval: NodeJS.Timeout | null = null

    try {
      // Adicionar mensagem inicial no chat
      sendMessage(`📤 Enviando documento "${uploadedFile.name}" para a biblioteca e base de conhecimento...`, { preferVoice: false })

      progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const fileExt = uploadedFile.name.split('.').pop()?.toLowerCase()
      const fileName = `${Date.now()}_${uploadedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const bucketName = 'documents'

      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, uploadedFile)

      if (uploadError) {
        throw uploadError
      }

      // Criar signed URL para o arquivo
      let finalUrl = ''
      try {
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName)

        const { data: signedUrlData, error: signedError } = await supabase.storage
          .from('documents')
          .createSignedUrl(fileName, 2592000) // 30 dias

        if (!signedError && signedUrlData) {
          finalUrl = signedUrlData.signedUrl
        } else {
          finalUrl = publicUrl
        }
      } catch (urlError) {
        console.warn('⚠️ Erro ao criar URL:', urlError)
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName)
        finalUrl = publicUrl
      }

      // Mapear categoria para formato do banco
      const categoryMap: Record<string, string> = {
        'ai-documents': 'ai-documents',
        'protocols': 'protocols',
        'research': 'research',
        'cases': 'cases',
        'multimedia': 'multimedia'
      }

      const dbCategory = categoryMap[uploadCategory] || 'research'

      // Salvar metadata no banco com categorias selecionadas
      const documentMetadata = {
        title: uploadedFile.name,
        content: '', // Deixar vazio para extrair depois
        file_type: fileExt || 'unknown',
        file_url: finalUrl,
        file_size: uploadedFile.size,
        author: user?.name || 'Usuário',
        category: dbCategory,
        target_audience: uploadUserType.length > 0 ? uploadUserType : ['professional', 'student'],
        tags: ['upload', 'chat-upload', uploadCategory, uploadArea],
        isLinkedToAI: uploadCategory === 'ai-documents' || uploadCategory === 'research',
        aiRelevance: uploadCategory === 'ai-documents' ? 0.9 : 0.7,
        summary: `Documento enviado pelo chat da IA Residente em ${new Date().toLocaleDateString('pt-BR')} - Categoria: ${uploadCategory}, Área: ${uploadArea}`,
        keywords: [fileExt || 'document', uploadCategory, uploadArea, ...uploadUserType]
      }

      const { data: documentData, error: docError } = await supabase
        .from('documents')
        .insert(documentMetadata)
        .select()
        .single()

      if (docError) {
        throw docError
      }

      // Vincular documento à IA automaticamente se for categoria IA ou pesquisa
      if (documentData?.id && (uploadCategory === 'ai-documents' || uploadCategory === 'research')) {
        await KnowledgeBaseIntegration.linkDocumentToAI(documentData.id, documentMetadata.aiRelevance || 0.8)
      }

      if (progressInterval) clearInterval(progressInterval)
      setUploadProgress(100)

      // Mensagem de sucesso com detalhes
      const categoryNames: Record<string, string> = {
        'ai-documents': 'IA Residente',
        'protocols': 'Protocolos',
        'research': 'Pesquisa',
        'cases': 'Casos',
        'multimedia': 'Multimídia'
      }

      sendMessage(`✅ Documento "${uploadedFile.name}" enviado com sucesso!\n\n📚 Categoria: ${categoryNames[uploadCategory] || uploadCategory}\n🎯 Área: ${uploadArea}\n👥 Público: ${uploadUserType.join(', ')}\n\nO arquivo foi adicionado à biblioteca${uploadCategory === 'ai-documents' ? ' e está vinculado à base de conhecimento da Nôa Esperança' : ''}. Agora posso usar este documento em minhas respostas!`, { preferVoice: false })

      // Resetar estados
      setUploadedFile(null)
      setUploadCategory('ai-documents')
      setUploadArea('cannabis')
      setUploadUserType(['professional', 'student'])

      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 1000)
    } catch (error: any) {
      console.error('❌ Erro no upload:', error)
      if (progressInterval) clearInterval(progressInterval)
      setUploadProgress(0)
      
      // Adicionar mensagem de erro no chat
      sendMessage(`❌ Erro ao fazer upload do documento "${uploadedFile?.name}": ${error.message || 'Erro desconhecido'}. Por favor, tente novamente.`, { preferVoice: false })
      
      setIsUploading(false)
      setUploadedFile(null)
    }
  }, [uploadedFile, uploadCategory, uploadArea, uploadUserType, sendMessage, user])

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const positionClasses = useMemo(() => getPositionClasses(position), [position])

  return (
    <>
      {!hideButton && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={clsx('fixed z-50 w-16 h-16 rounded-full shadow-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 transition-all duration-300 flex items-center justify-center text-white', positionClasses)}
        >
          <Brain className="w-8 h-8" />
        </button>
      )}

      {isOpen && (
        <div className={clsx('fixed z-50 w-[420px] max-w-[92vw] h-[640px] bg-slate-900/95 border border-slate-700 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden', positionClasses)}>
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-500 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <NoaAnimatedAvatar size="md" isListening={isListening} isSpeaking={isSpeaking} />
              <div>
                <p className="text-sm text-emerald-100">Nôa Esperança • IA Residente</p>
                <p className="text-xs text-emerald-50/80">{userName} • {userCode}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false)
                closeChat()
                stopListening()
                window.dispatchEvent(new Event('noaChatClosed'))
              }}
              className="p-2 rounded-full text-white/80 hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="border-b border-slate-800 bg-slate-900/80 px-5 py-2 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Último fluxo: {lastIntent ?? 'Exploração'}</span>
            <span className="flex items-center gap-1 text-slate-400">{messages.length - 1} interações</span>
          </div>

          <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800">
            <p className="text-xs text-slate-300 mb-2">Comandos rápidos</p>
            <div className="flex flex-wrap gap-2">
              {quickCommands.map(command => (
                <button
                  key={command.label}
                  onClick={() => handleQuickCommand(command.command)}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-200 border border-slate-700 hover:border-emerald-500 hover:text-emerald-200 transition"
                >
                  {command.label}
                </button>
              ))}
            </div>
          </div>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map(message => (
              <div key={message.id} className={clsx('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={clsx(
                    'max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm backdrop-blur-sm border',
                    message.role === 'user'
                      ? 'bg-emerald-600/90 text-white border-emerald-400/50'
                      : 'bg-slate-800/90 text-slate-100 border-slate-700'
                  )}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {(message.metadata as Record<string, any> | undefined)?.fullContent || message.content}
                  </p>
                  <span className="block text-[10px] mt-2 text-slate-400">{message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-slate-800/80 text-slate-300 text-sm border border-slate-700 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Elaborando resposta clínica...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 bg-slate-900/80 px-5 py-3 space-y-2">
            {error && (
              <div className="text-xs text-amber-400">
                {error}
              </div>
            )}

            {usedEndpoints.length > 0 && (
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <BookOpen className="w-3 h-3" /> Endpoints consultados: {usedEndpoints.join(', ')}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <button
                onClick={handleUploadClick}
                disabled={isUploading}
                className={clsx('p-3 rounded-2xl border transition',
                  isUploading
                    ? 'bg-emerald-600 text-white border-emerald-400 opacity-50 cursor-not-allowed'
                    : 'border-slate-700 text-slate-300 hover:border-emerald-400 hover:text-emerald-200'
                )}
                title={isUploading ? 'Enviando documento...' : 'Enviar documento para biblioteca'}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={toggleListening}
                className={clsx('p-3 rounded-2xl border transition',
                  isListening
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'border-slate-700 text-slate-300 hover:border-emerald-400 hover:text-emerald-200'
                )}
                title={isListening ? 'Parar captura de voz' : 'Ativar comandos por voz'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <input
                value={inputValue}
                onChange={event => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Conversar com a Nôa..."
                className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 text-sm px-4 py-3 rounded-2xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              />

              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isProcessing}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-500 text-white shadow-lg hover:from-emerald-500 hover:to-sky-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Upload com Categorias */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">📚 Categorizar Documento</h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadedFile(null)
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Arquivo Selecionado */}
              {uploadedFile && (
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="flex items-center space-x-3">
                    <Upload className="w-8 h-8 text-emerald-400" />
                    <div className="flex-1">
                      <p className="text-white font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-slate-400">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Seleção de Categoria */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  📚 Categoria
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'ai-documents', name: '🧠 IA Residente', desc: 'Treinar a Nôa Esperança' },
                    { id: 'protocols', name: '📖 Protocolos', desc: 'Diretrizes clínicas' },
                    { id: 'research', name: '🔬 Pesquisa', desc: 'Artigos científicos' },
                    { id: 'cases', name: '📊 Casos', desc: 'Casos clínicos' },
                    { id: 'multimedia', name: '🎥 Multimídia', desc: 'Vídeos e mídia' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setUploadCategory(cat.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        uploadCategory === cat.id
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                      }`}
                    >
                      <h3 className="font-semibold text-white text-sm mb-1">{cat.name}</h3>
                      <p className="text-xs text-slate-400">{cat.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seleção de Área */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  🎯 Área
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'cannabis', name: '🌿 Cannabis' },
                    { id: 'imre', name: '🧬 IMRE' },
                    { id: 'clinical', name: '🏥 Clínica' },
                    { id: 'research', name: '📈 Gestão' }
                  ].map((area) => (
                    <button
                      key={area.id}
                      onClick={() => setUploadArea(area.id)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        uploadArea === area.id
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                      }`}
                    >
                      <span className="font-semibold text-white text-sm">{area.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seleção de Tipo de Usuário */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  👥 Tipo de Usuário
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'all', name: '🌐 Todos os Usuários' },
                    { id: 'student', name: '🎓 Alunos' },
                    { id: 'professional', name: '👨‍⚕️ Profissionais' },
                    { id: 'patient', name: '❤️ Pacientes' }
                  ].map((type) => {
                    const isSelected = uploadUserType.includes(type.id) || (type.id === 'all' && uploadUserType.length === 3)
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          if (type.id === 'all') {
                            setUploadUserType(['professional', 'student', 'patient'])
                          } else {
                            setUploadUserType(prev => 
                              prev.includes(type.id) 
                                ? prev.filter(t => t !== type.id)
                                : [...prev, type.id]
                            )
                          }
                        }}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-600 hover:border-slate-500 bg-slate-700/50'
                        }`}
                      >
                        <span className="font-semibold text-white text-sm">{type.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Enviando...</span>
                    <span className="text-sm text-slate-300">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-sky-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex space-x-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadedFile(null)
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={processFileUpload}
                  disabled={!uploadedFile || isUploading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-sky-500 hover:from-emerald-500 hover:to-sky-400 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    'Fazer Upload'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NoaConversationalInterface

