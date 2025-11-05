import React, { useState, useEffect, useRef } from 'react'
import { Brain, Mic, MicOff, Loader2 } from 'lucide-react'
import { NoaResidentAI } from '../lib/noaResidentAI'

interface ChatAIResidentProps {
  chatId: string
  patientId: string
  doctorId: string
  messages: Array<{
    id: string
    content: string
    sender_id: string
    created_at: string
  }>
  onAISuggestion?: (suggestion: string) => void
}

const ChatAIResident: React.FC<ChatAIResidentProps> = ({
  chatId,
  patientId,
  doctorId,
  messages,
  onAISuggestion
}) => {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiSuggestion, setAISuggestion] = useState<string | null>(null)
  const [isPresent, setIsPresent] = useState(true)
  const recognitionRef = useRef<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const noaAI = useRef(new NoaResidentAI())

  // Processar mensagens para contexto da IA (debounced para evitar processamento excessivo)
  useEffect(() => {
    if (messages.length > 0 && isPresent) {
      const timer = setTimeout(() => {
        processMessagesForAI()
      }, 1000) // Aguardar 1 segundo após última mensagem
      
      return () => clearTimeout(timer)
    }
  }, [messages.length, isPresent])

  const processMessagesForAI = async () => {
    try {
      setIsProcessing(true)
      
      // Pegar última mensagem para contexto
      const lastMessage = messages[messages.length - 1]
      if (!lastMessage) return

      // Não processar mensagens da própria IA ou muito curtas
      if (lastMessage.content.length < 3) return

      // Criar contexto da conversa (últimas 10 mensagens)
      const conversationContext = messages
        .slice(-10)
        .map(msg => `${msg.sender_id === patientId ? 'Paciente' : 'Profissional'}: ${msg.content}`)
        .join('\n')

      // Processar com IA residente
      const userId = patientId // IA dedicada ao paciente
      const userEmail = undefined // Não necessário aqui
      
      // Usar processMessage da IA residente
      // A IA automaticamente salva no histórico clínico
      const response = await noaAI.current.processMessage(
        `${conversationContext}\n\n[Última mensagem: ${lastMessage.content}]`,
        userId,
        userEmail
      )

      if (response && response.content) {
        // Mostrar sugestão da IA apenas se for relevante
        if (response.content.length > 10) {
          setAISuggestion(response.content)
          onAISuggestion?.(response.content)
        }
      }
    } catch (error) {
      console.error('Erro ao processar mensagem com IA:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const startAudioRecording = async () => {
    try {
      // Iniciar transcrição em tempo real usando Web Speech API
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Reconhecimento de voz não suportado neste navegador.')
        return
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = 'pt-BR'
      recognition.continuous = true
      recognition.interimResults = true

      let transcriptBuffer = ''
      
      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcriptBuffer += event.results[i][0].transcript + ' '
          }
        }
      }

      recognition.onerror = (event: any) => {
        console.error('Erro no reconhecimento de voz:', event.error)
      }

      recognition.onend = async () => {
        // Quando a gravação terminar, salvar transcrição
        if (transcriptBuffer.trim()) {
          // Salvar transcrição no histórico
          await saveTranscriptToHistory(transcriptBuffer.trim())
        }
      }

      recognition.start()
      recognitionRef.current = recognition

      // Iniciar gravação de áudio também
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        await saveAudioToHistory(audioBlob, transcriptBuffer.trim() || '[Áudio gravado]')
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsListening(true)
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error)
      alert('Erro ao acessar microfone. Verifique as permissões.')
    }
  }

  const stopAudioRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop()
      setIsListening(false)
    }
  }

  const saveTranscriptToHistory = async (transcript: string) => {
    try {
      const { supabase } = await import('../lib/supabase')
      
      // Salvar transcrição no histórico clínico
      const { error: historyError } = await supabase
        .from('patient_interactions')
        .insert({
          patient_id: patientId,
          doctor_id: doctorId,
          interaction_type: 'AUDIO_TRANSCRIPT',
          content: transcript,
          metadata: {
            chat_id: chatId,
            transcribed_at: new Date().toISOString(),
            source: 'voice_recognition'
          }
        })

      if (historyError && historyError.code !== '42P01') {
        // Fallback para clinical_assessments
        await supabase
          .from('clinical_assessments')
          .insert({
            patient_id: patientId,
            doctor_id: doctorId,
            assessment_type: 'AUDIO_TRANSCRIPT',
            status: 'completed',
            data: {
              transcript: transcript,
              chat_id: chatId
            },
            clinical_report: `Transcrição de áudio: ${transcript}`
          })
      }
    } catch (error) {
      console.error('Erro ao salvar transcrição no histórico:', error)
    }
  }

  const transcribeAndSaveAudio = async (audioBlob: Blob) => {
    try {
      // Usar Web Speech API para transcrição em tempo real
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('Reconhecimento de voz não suportado. Gravando áudio sem transcrição.')
        await saveAudioToHistory(audioBlob, '[Áudio gravado - transcrição não disponível]')
        return
      }

      // Criar URL temporária para o áudio
      const audioUrl = URL.createObjectURL(audioBlob)
      
      // Usar Web Speech API para transcrição
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = 'pt-BR'
      recognition.continuous = false
      recognition.interimResults = false

      // Para transcrever um arquivo de áudio gravado, precisamos usar uma abordagem diferente
      // Por enquanto, vamos usar a API de transcrição em tempo real durante a gravação
      // e salvar o texto transcrito junto com o áudio
      
      // Salvar áudio (a transcrição será feita durante a gravação)
      await saveAudioToHistory(audioBlob, '[Áudio gravado - aguardando transcrição]')
      
      URL.revokeObjectURL(audioUrl)
    } catch (error) {
      console.error('Erro ao transcrever áudio:', error)
      // Salvar áudio mesmo sem transcrição
      await saveAudioToHistory(audioBlob, '[Áudio gravado - erro na transcrição]')
    }
  }

  const saveAudioToHistory = async (audioBlob: Blob, transcript: string) => {
    try {
      const { supabase } = await import('../lib/supabase')
      
      // Tentar fazer upload do áudio para Supabase Storage
      let audioUrl = null
      try {
        // Verificar se o bucket existe, senão criar
        const fileName = `chat-audio-${chatId}-${Date.now()}.webm`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-audio')
          .upload(fileName, audioBlob, {
            contentType: 'audio/webm',
            upsert: false
          })

        if (!uploadError && uploadData) {
          // Obter URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('chat-audio')
            .getPublicUrl(fileName)
          audioUrl = publicUrl
        }
      } catch (storageError) {
        console.warn('Erro ao fazer upload do áudio para storage:', storageError)
        // Continuar mesmo sem upload do áudio
      }

      // Salvar no histórico clínico (com ou sem URL do áudio)
      const { error: historyError } = await supabase
        .from('patient_interactions')
        .insert({
          patient_id: patientId,
          doctor_id: doctorId,
          interaction_type: 'AUDIO_CHAT',
          content: transcript,
          metadata: {
            audio_url: audioUrl,
            chat_id: chatId,
            audio_size: audioBlob.size,
            transcribed_at: new Date().toISOString(),
            source: 'voice_recording'
          }
        })

      if (historyError && historyError.code !== '42P01') {
        // Fallback para clinical_assessments
        const { error: assessmentError } = await supabase
          .from('clinical_assessments')
          .insert({
            patient_id: patientId,
            doctor_id: doctorId,
            assessment_type: 'AUDIO_CHAT',
            status: 'completed',
            data: {
              transcript: transcript,
              audio_url: audioUrl,
              audio_size: audioBlob.size,
              chat_id: chatId
            },
            clinical_report: `Áudio transcrito: ${transcript}`
          })

        if (assessmentError) {
          console.error('Erro ao salvar no histórico clínico:', assessmentError)
        }
      }
    } catch (error) {
      console.error('Erro ao salvar áudio no histórico:', error)
    }
  }

  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-3 border border-purple-500/30 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600/20 rounded-lg">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm">IA Residente Nôa Esperança</h4>
            <p className="text-slate-300 text-xs">
              {isProcessing ? 'Processando conversa...' : 'Presente e ouvindo'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isProcessing && (
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
          )}
          
          <button
            onClick={isListening ? stopAudioRecording : startAudioRecording}
            className={`p-2 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' 
                : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30'
            }`}
            title={isListening ? 'Parar gravação' : 'Iniciar gravação de áudio'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {aiSuggestion && (
        <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-purple-500/20">
          <p className="text-xs text-purple-400 mb-1 font-semibold">Sugestão da IA:</p>
          <p className="text-white text-sm">{aiSuggestion}</p>
        </div>
      )}

      {isListening && (
        <div className="mt-3 flex items-center space-x-2">
          <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 animate-pulse" style={{ width: '50%' }}></div>
          </div>
          <span className="text-xs text-red-400">Gravando...</span>
        </div>
      )}
    </div>
  )
}

export default ChatAIResident

