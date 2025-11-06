import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Mic, MicOff, X, Send, Loader2, Activity, BookOpen, Brain, Upload, Maximize2, Minimize2, User } from 'lucide-react'
import clsx from 'clsx'
import NoaAnimatedAvatar from './NoaAnimatedAvatar'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'
import { useMedCannLabConversation } from '../hooks/useMedCannLabConversation'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { KnowledgeBaseIntegration } from '../services/knowledgeBaseIntegration'
import { normalizeUserType } from '../lib/userTypes'

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
  const [isExpanded, setIsExpanded] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadCategory, setUploadCategory] = useState('ai-documents')
  const [uploadArea, setUploadArea] = useState('cannabis')
  const [uploadUserType, setUploadUserType] = useState<string[]>(['professional', 'student'])
  // Estados para gravação de consulta
  const [isRecordingConsultation, setIsRecordingConsultation] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [consultationTranscript, setConsultationTranscript] = useState<string[]>([])
  const [consultationStartTime, setConsultationStartTime] = useState<Date | null>(null)
  const [showPatientSelector, setShowPatientSelector] = useState(false)
  const [availablePatients, setAvailablePatients] = useState<any[]>([])
  const [isSavingConsultation, setIsSavingConsultation] = useState(false)
  const recognitionRef = useRef<RecognitionHandle | null>(null)
  const consultationRecognitionRef = useRef<any>(null) // Para gravação de consulta
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const isListeningRef = useRef(false) // Ref para verificar estado atual de isListening
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
    // Atualizar ref PRIMEIRO para evitar reinício
    isListeningRef.current = false
    
    const handle = recognitionRef.current
    if (handle) {
      handle.stopped = true
      if (handle.timer) {
        window.clearTimeout(handle.timer)
        handle.timer = undefined
      }
      // Remover callbacks para evitar reinício
      handle.recognition.onresult = null
      handle.recognition.onerror = null
      handle.recognition.onend = null
      try {
        handle.recognition.stop()
      } catch (e) {
        // Ignorar erros ao parar
      }
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
      console.warn('⚠️ Reconhecimento de voz não suportado neste navegador.')
      return
    }

    // Não iniciar se já estiver escutando
    if (isListening) {
      console.log('ℹ️ Já está escutando, ignorando startListening')
      return
    }

    // Parar fala da IA imediatamente quando iniciar escuta
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    window.dispatchEvent(new Event('noaStopSpeech'))
    
    // Parar qualquer escuta anterior
    stopListening()
    
    console.log('🎤 Iniciando escuta de voz...')

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
        console.log('📤 Enviando mensagem capturada por voz:', text)
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
          const transcript = result[0].transcript.trim()
          if (transcript.length > 0) {
            handle.buffer += `${transcript} `
            scheduleFlush()
            console.log('🎤 Texto capturado:', transcript)
          }
        }
      }
    }

    recognition.onerror = (event: any) => {
      // Ignorar erros não críticos silenciosamente
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return
      }
      
      // Para erros críticos, logar
      if (event.error !== 'network') {
        console.error('❌ Erro no reconhecimento de voz:', event.error)
      }
      
      if (handle.timer) {
        window.clearTimeout(handle.timer)
        handle.timer = undefined
      }
      flush()
      
      // Só parar se for erro crítico
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        handle.stopped = true
        setIsListening(false)
        isListeningRef.current = false
        recognitionRef.current = null
        console.warn('⚠️ Permissão de microfone negada')
      }
    }

    recognition.onend = () => {
      // Se o handle foi removido ou mudou, ou foi explicitamente parado, não reiniciar
      if (recognitionRef.current !== handle || handle.stopped) {
        setIsListening(false)
        isListeningRef.current = false
        return
      }

      // Se o usuário ainda quer o microfone ativo, reiniciar
      if (isListeningRef.current && !handle.stopped) {
        // Pequeno delay antes de reiniciar para evitar loops
        setTimeout(() => {
          // Verificar novamente se ainda deve estar ativo
          if (recognitionRef.current === handle && !handle.stopped && isListeningRef.current) {
            try {
              recognition.start()
              console.log('🔄 Reiniciando escuta de voz')
            } catch (e: any) {
              // Se falhar porque já está rodando, tudo bem
              if (e.message && e.message.includes('already started')) {
                return
              }
              // Se for outro erro, tentar novamente após um delay maior
              setTimeout(() => {
                if (recognitionRef.current === handle && !handle.stopped && isListeningRef.current) {
                  try {
                    recognition.start()
                  } catch (e2) {
                    // Se ainda falhar, parar apenas se não for "already started"
                    if (!(e2 as any)?.message?.includes('already started')) {
                      console.log('🛑 Erro ao reiniciar escuta:', e2)
                    }
                  }
                }
              }, 500)
            }
          } else {
            // Se as condições mudaram, parar
            setIsListening(false)
            isListeningRef.current = false
            recognitionRef.current = null
            console.log('🛑 Escuta de voz finalizada')
          }
        }, 100)
      } else {
        // Se não estiver mais ativo, parar
        setIsListening(false)
        isListeningRef.current = false
        recognitionRef.current = null
        console.log('🛑 Escuta de voz finalizada')
      }
    }

    try {
      recognition.start()
      setIsListening(true)
      isListeningRef.current = true // Atualizar ref
      console.log('✅ Escuta de voz iniciada com sucesso')
    } catch (error: any) {
      console.error('❌ Erro ao iniciar escuta:', error)
      setIsListening(false)
      isListeningRef.current = false
      recognitionRef.current = null
    }
  }, [sendMessage, stopListening, isListening])

  // Parar microfone quando a IA começar a processar
  useEffect(() => {
    if (isProcessing && isListening) {
      // Atualizar ref antes de parar para evitar reinício
      isListeningRef.current = false
      stopListening()
    }
  }, [isProcessing, isListening, stopListening])

  // REMOVIDO: Auto-iniciar microfone e detecção de voz contínua
  // O microfone agora só funciona quando o usuário clica no botão manualmente

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

  // Carregar pacientes disponíveis
  const loadPatients = useCallback(async () => {
    if (!user) return

    try {
      const userType = normalizeUserType(user.type)
      if (userType !== 'profissional' && userType !== 'admin') return

      // Buscar pacientes do profissional
      // Primeiro buscar assessments, depois buscar dados dos pacientes
      const { data: assessments, error } = await supabase
        .from('clinical_assessments')
        .select('patient_id')
        .eq('doctor_id', user.id)
        .not('patient_id', 'is', null)

      if (error) {
        console.error('Erro ao carregar pacientes:', error)
        return
      }

      // Extrair IDs únicos de pacientes
      const patientIds = [...new Set(assessments?.map((a: any) => a.patient_id).filter(Boolean) || [])]

      if (patientIds.length === 0) {
        setAvailablePatients([])
        return
      }

      // Buscar dados dos pacientes
      const { data: patients, error: patientsError } = await supabase
        .from('users')
        .select('id, name, email')
        .in('id', patientIds)

      if (patientsError) {
        console.error('Erro ao carregar dados dos pacientes:', patientsError)
        return
      }

      // Mapear pacientes
      setAvailablePatients(patients || [])
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    }
  }, [user])

  // Iniciar gravação de consulta
  const handleStartConsultationRecording = useCallback(async () => {
    if (!user) return

    const userType = normalizeUserType(user.type)
    if (userType !== 'profissional' && userType !== 'admin') {
      sendMessage('Apenas profissionais podem gravar consultas.', { preferVoice: false })
      return
    }

    // Se não houver paciente selecionado, mostrar seletor
    if (!selectedPatientId) {
      await loadPatients()
      setShowPatientSelector(true)
      sendMessage('Por favor, selecione o paciente para iniciar a gravação da consulta.', { preferVoice: false })
      return
    }

    // Parar escuta normal
    if (isListening) {
      stopListening()
    }

    // Iniciar gravação de consulta
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      sendMessage('Reconhecimento de voz não suportado neste navegador.', { preferVoice: false })
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition: any = new SpeechRecognition()
    recognition.lang = 'pt-BR'
    recognition.continuous = true
    recognition.interimResults = true

    const transcriptBuffer: string[] = []

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          const transcript = result[0].transcript.trim()
          transcriptBuffer.push(transcript)
          setConsultationTranscript(prev => [...prev, transcript])
          
          // Adicionar mensagem visual no chat
          sendMessage(`[Gravação] ${transcript}`, { preferVoice: false })
        }
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Erro na gravação:', event.error)
      if (event.error === 'no-speech') {
        // Reiniciar se não houver fala
        try {
          recognition.start()
        } catch (e) {
          // Ignorar
        }
      }
    }

    recognition.onend = () => {
      if (isRecordingConsultation) {
        try {
          recognition.start()
        } catch (e) {
          // Ignorar
        }
      }
    }

    try {
      recognition.start()
      consultationRecognitionRef.current = recognition
      setIsRecordingConsultation(true)
      setConsultationStartTime(new Date())
      setConsultationTranscript([])
      sendMessage('🎙️ Gravação de consulta iniciada. Diga "Parar gravação" para finalizar.', { preferVoice: false })
    } catch (e) {
      console.error('Erro ao iniciar gravação:', e)
      sendMessage('Erro ao iniciar gravação. Tente novamente.', { preferVoice: false })
    }
  }, [user, selectedPatientId, isListening, stopListening, isRecordingConsultation, sendMessage, loadPatients])

  // Parar gravação e salvar consulta
  const handleStopConsultationRecording = useCallback(async () => {
    if (!isRecordingConsultation || !user || !selectedPatientId) return

    setIsSavingConsultation(true)

    // Parar reconhecimento de voz
    if (consultationRecognitionRef.current) {
      try {
        consultationRecognitionRef.current.stop()
        consultationRecognitionRef.current = null
      } catch (e) {
        // Ignorar
      }
    }

    const endTime = new Date()
    const duration = consultationStartTime 
      ? Math.round((endTime.getTime() - consultationStartTime.getTime()) / 1000 / 60) // minutos
      : 0

    const fullTranscript = consultationTranscript.join(' ')

    try {
      // Salvar em clinical_assessments
      const { data: assessment, error: assessmentError } = await supabase
        .from('clinical_assessments')
        .insert({
          patient_id: selectedPatientId,
          doctor_id: user.id,
          assessment_type: 'CONSULTA',
          status: 'completed',
          data: {
            transcript: fullTranscript,
            duration_minutes: duration,
            start_time: consultationStartTime?.toISOString(),
            end_time: endTime.toISOString()
          },
          clinical_report: `Consulta gravada em ${consultationStartTime?.toLocaleString('pt-BR')}\n\nTranscrição:\n${fullTranscript}`,
          created_at: consultationStartTime?.toISOString() || new Date().toISOString(),
          updated_at: endTime.toISOString()
        })
        .select()
        .single()

      if (assessmentError) {
        throw assessmentError
      }

      // Salvar também em clinical_reports se a tabela existir
      try {
        await supabase
          .from('clinical_reports')
          .insert({
            patient_id: selectedPatientId,
            professional_id: user.id,
            assessment_id: assessment.id,
            report_data: {
              type: 'CONSULTA',
              transcript: fullTranscript,
              duration_minutes: duration,
              date: consultationStartTime?.toISOString()
            },
            status: 'generated'
          })
      } catch (reportError) {
        // Ignorar se a tabela não existir
        console.warn('Tabela clinical_reports não disponível:', reportError)
      }

      sendMessage(`✅ Consulta gravada e salva com sucesso! Duração: ${duration} minutos.`, { preferVoice: false })
      
      // Resetar estados
      setIsRecordingConsultation(false)
      setConsultationTranscript([])
      setConsultationStartTime(null)
      setSelectedPatientId(null)
    } catch (error: any) {
      console.error('Erro ao salvar consulta:', error)
      sendMessage(`❌ Erro ao salvar consulta: ${error.message || 'Erro desconhecido'}`, { preferVoice: false })
    } finally {
      setIsSavingConsultation(false)
    }
  }, [isRecordingConsultation, user, selectedPatientId, consultationStartTime, consultationTranscript, sendMessage])

  // REMOVIDO: Detecção de voz contínua e comando "Escute-se, Nôa!"
  // O microfone agora só funciona quando o usuário clica no botão manualmente

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
        <div className={clsx(
          'fixed z-50 bg-slate-900/95 border border-slate-700 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden transition-all duration-300',
          isExpanded 
            ? 'left-[80px] lg:left-[320px] right-4 top-4 bottom-4' // Expandido: da barra lateral (80px quando colapsada, 320px quando expandida) até a borda direita
            : position === 'bottom-right' 
              ? 'bottom-4 right-4 w-[600px] max-w-[calc(100vw-2rem)] h-[720px] max-h-[calc(100vh-2rem)]'
              : position === 'bottom-left'
                ? 'bottom-4 left-4 w-[600px] max-w-[calc(100vw-2rem)] h-[720px] max-h-[calc(100vh-2rem)]'
                : position === 'top-right'
                  ? 'top-4 right-4 w-[600px] max-w-[calc(100vw-2rem)] h-[720px] max-h-[calc(100vh-2rem)]'
                  : 'top-4 left-4 w-[600px] max-w-[calc(100vw-2rem)] h-[720px] max-h-[calc(100vh-2rem)]'
        )}>
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-500 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <NoaAnimatedAvatar size={isExpanded ? "lg" : "md"} isListening={isListening} isSpeaking={isSpeaking} />
              <div>
                <p className="text-sm text-emerald-100">Nôa Esperança • IA Residente</p>
                <p className="text-xs text-emerald-50/80">{userName} • {userCode}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-full text-white/80 hover:bg-white/10 transition"
                title={isExpanded ? "Minimizar" : "Expandir"}
              >
                {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setIsExpanded(false)
                  closeChat()
                  stopListening()
                  window.dispatchEvent(new Event('noaChatClosed'))
                }}
                className="p-2 rounded-full text-white/80 hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="border-b border-slate-800 bg-slate-900/80 px-5 py-2 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Último fluxo: {lastIntent ?? 'Exploração'}</span>
            <span className="flex items-center gap-1 text-slate-400">{messages.length - 1} interações</span>
            {isRecordingConsultation && (
              <span className="flex items-center gap-1 text-red-400 animate-pulse">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                Gravando consulta...
              </span>
            )}
          </div>

          {/* Seletor de Paciente */}
          {showPatientSelector && !isRecordingConsultation && (
            <div className="border-b border-slate-800 bg-slate-900/90 px-5 py-4">
              <p className="text-sm text-slate-300 mb-3">Selecione o paciente:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availablePatients.length === 0 ? (
                  <p className="text-xs text-slate-400">Nenhum paciente encontrado. Você precisa ter pelo menos uma avaliação clínica com um paciente.</p>
                ) : (
                  availablePatients.map((patient: any) => (
                    <button
                      key={patient.id}
                      onClick={() => {
                        setSelectedPatientId(patient.id)
                        setShowPatientSelector(false)
                        handleStartConsultationRecording()
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm flex items-center gap-2 transition"
                    >
                      <User className="w-4 h-4" />
                      <span>{patient.name || patient.email}</span>
                    </button>
                  ))
                )}
              </div>
              <button
                onClick={() => setShowPatientSelector(false)}
                className="mt-3 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancelar
              </button>
            </div>
          )}

          {/* Controles de Gravação de Consulta (apenas para profissionais) */}
          {user && (normalizeUserType(user.type) === 'profissional' || normalizeUserType(user.type) === 'admin') && !showPatientSelector && (
            <div className="border-b border-slate-800 bg-slate-900/80 px-5 py-3">
              {!isRecordingConsultation ? (
                <button
                  onClick={handleStartConsultationRecording}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition"
                >
                  <Mic className="w-4 h-4 text-white" />
                  Iniciar Gravação de Consulta
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Gravando consulta...</span>
                    <span className="text-red-400 animate-pulse">
                      {consultationStartTime && Math.floor((new Date().getTime() - consultationStartTime.getTime()) / 1000)}s
                    </span>
                  </div>
                  <button
                    onClick={handleStopConsultationRecording}
                    disabled={isSavingConsultation}
                    className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    {isSavingConsultation ? 'Salvando...' : 'Parar e Salvar Consulta'}
                  </button>
                </div>
              )}
            </div>
          )}

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
                disabled={isProcessing || isRecordingConsultation}
                className={clsx(
                  'p-3 rounded-2xl border transition-all duration-300',
                  isListening
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/50 hover:bg-emerald-500'
                    : isSpeaking
                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/50'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-emerald-400 hover:text-emerald-200'
                )}
                title={
                  isListening 
                    ? 'Parar captura de voz' 
                    : isSpeaking 
                    ? 'IA está falando' 
                    : 'Ativar comandos por voz'
                }
              >
                {isListening ? (
                  <Mic className="w-4 h-4 text-white" />
                ) : isSpeaking ? (
                  <Activity className="w-4 h-4 text-white animate-pulse" />
                ) : (
                  <MicOff className="w-4 h-4" />
                )}
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

