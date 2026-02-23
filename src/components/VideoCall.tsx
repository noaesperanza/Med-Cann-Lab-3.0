import React, { useRef, useEffect, useState } from 'react'
import { X, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Settings, Maximize2, Minimize2, Circle, Square } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useWebRTCRoom } from '../hooks/useWebRTCRoom'

interface VideoCallProps {
  isOpen: boolean
  onClose: () => void
  patientId?: string
  isAudioOnly?: boolean
  /** Id da sala para sinalização WebRTC (ex.: request_id). Quando definido, conecta áudio/vídeo com o outro participante. */
  signalingRoomId?: string
  /** Quem iniciou a chamada (envia o offer). O outro participante é o callee (envia o answer). */
  isInitiator?: boolean
}

// Política de consentimento para videochamada
const VIDEO_CALL_CONSENT_POLICY = {
  scope: "video_call",
  description: "Esta videochamada será registrada para fins de auditoria e registro clínico. Nenhum conteúdo de áudio ou vídeo será armazenado permanentemente, apenas metadados (quem, quando, duração).",
  automaticAnalysis: false,
  secondaryUse: false,
  requestedBy: "professional"
}

// Política de consentimento para gravação clínica pontual
const RECORDING_CONSENT_POLICY = {
  scope: "clinical_record",
  maxDurationMinutes: 5,
  automaticAnalysis: false,
  secondaryUse: false,
  requestedBy: "professional",
  description: "O médico solicitou a gravação de um trecho curto (até 5 minutos) desta consulta, exclusivamente para registro clínico. A gravação não será analisada automaticamente nem usada para outros fins."
}

type RecordingConsentSnapshot = {
  scope: string
  maxDurationMinutes?: number
  automaticAnalysis: boolean
  secondaryUse: boolean
  requestedBy: string
  acceptedBy: string
  timestamp: string
  description?: string
}

const VideoCall: React.FC<VideoCallProps> = ({ isOpen, onClose, patientId, isAudioOnly = false, signalingRoomId, isInitiator = false }) => {
  const { user } = useAuth()
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const remoteAudioRef = useRef<HTMLAudioElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const [localStreamForWebRTC, setLocalStreamForWebRTC] = useState<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordingChunksRef = useRef<Blob[]>([])
  
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isRemoteMuted, setIsRemoteMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [cameraOnDuringAudioCall, setCameraOnDuringAudioCall] = useState(false)
  const [cameraStreamDuringAudio, setCameraStreamDuringAudio] = useState<MediaStream | null>(null)
  
  // Estados de consentimento e sessão
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [consentGiven, setConsentGiven] = useState(false)
  const [consentSnapshot, setConsentSnapshot] = useState<RecordingConsentSnapshot | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // Estados de gravação clínica
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null)
  
  // Estado para solicitação de gravação (profissional solicita, paciente aceita)
  const [recordingRequested, setRecordingRequested] = useState(false)
  const [showPatientConsentNotification, setShowPatientConsentNotification] = useState(false)
  
  // Verificar se usuário é profissional/admin
  const isProfessional = user?.type === 'profissional' || user?.type === 'admin'

  // Gerar session_id único
  const generateSessionId = () => {
    return `vc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Modal de consentimento antes de iniciar
  useEffect(() => {
    if (isOpen && !consentGiven) {
      setShowConsentModal(true)
    }
  }, [isOpen, consentGiven])

  // Iniciar chamada após consentimento
  useEffect(() => {
    if (isOpen && consentGiven && !sessionStartTime) {
      const newSessionId = generateSessionId()
      setSessionId(newSessionId)
      setSessionStartTime(new Date())
      setCameraOnDuringAudioCall(false)

      navigator.mediaDevices
        .getUserMedia({ video: !isAudioOnly, audio: true })
        .then((stream) => {
          localStreamRef.current = stream
          setLocalStreamForWebRTC(stream)
          if (localVideoRef.current && !isAudioOnly) {
            localVideoRef.current.srcObject = stream
          }
        })
        .catch((error) => {
          console.error('Error accessing media devices:', error)
          alert('Não foi possível acessar a câmera e o microfone. Verifique as permissões.')
          onClose()
        })
    }
  }, [isOpen, consentGiven, sessionStartTime, isAudioOnly, onClose])

  // Timer de duração da chamada
  useEffect(() => {
    if (isOpen && consentGiven && sessionStartTime) {
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)

      return () => {
        clearInterval(interval)
      }
    }
  }, [isOpen, consentGiven, sessionStartTime])

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecordingStartTime(null)
    }
  }

  // Timer de gravação (limite 5 minutos)
  useEffect(() => {
    if (isRecording && recordingStartTime) {
      const interval = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 1
          // Auto-stop em 5 minutos (300 segundos)
          if (newDuration >= 300) {
            stopRecording()
            return 300
          }
          return newDuration
        })
      }, 1000)

      return () => {
        clearInterval(interval)
      }
    }
  }, [isRecording, recordingStartTime])

  // Quando câmera é ligada durante áudio, manter ref em sync para toggleVideo
  useEffect(() => {
    if (cameraStreamDuringAudio && localVideoRef.current) {
      localVideoRef.current.srcObject = cameraStreamDuringAudio
    }
  }, [cameraStreamDuringAudio])

  // Atribuir stream local ao elemento de vídeo via ref (srcObject não é prop JSX válida)
  useEffect(() => {
    if (!localVideoRef.current) return
    if (!isAudioOnly && localStreamForWebRTC) {
      localVideoRef.current.srcObject = localStreamForWebRTC
    } else if (cameraOnDuringAudioCall && cameraStreamDuringAudio) {
      localVideoRef.current.srcObject = cameraStreamDuringAudio
    } else {
      localVideoRef.current.srcObject = null
    }
  }, [isAudioOnly, localStreamForWebRTC, cameraOnDuringAudioCall, cameraStreamDuringAudio])

  // WebRTC: sinalização e stream remoto (quando signalingRoomId está definido)
  const { remoteStream, connectionState: webrtcState, error: webrtcError } = useWebRTCRoom({
    roomId: signalingRoomId,
    isInitiator,
    localStream: localStreamForWebRTC,
    enabled: isOpen && consentGiven && !!signalingRoomId && !!user?.id,
    userId: user?.id ?? ''
  })

  // Atribuir stream remoto aos elementos de mídia (ouvir/ver o outro participante)
  useEffect(() => {
    if (remoteStream) {
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream
        remoteAudioRef.current.play().catch(() => {})
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
        remoteVideoRef.current.play().catch(() => {})
      }
    } else {
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    }
  }, [remoteStream])

  // Viva-voz: rotear áudio remoto para o alto-falante (setSinkId quando disponível)
  useEffect(() => {
    const el = remoteAudioRef.current || remoteVideoRef.current
    if (!el || !('setSinkId' in el)) return
    if (isSpeakerOn) {
      (el as HTMLMediaElement & { setSinkId?: (id: string) => Promise<void> })
        .setSinkId?.('')
        .catch(() => {})
    }
  }, [isSpeakerOn])

  // Cleanup ao fechar
  useEffect(() => {
    if (!isOpen) {
      setConsentGiven(false)
      setConsentSnapshot(null)
      setSessionStartTime(null)
      setSessionId(null)
      setCallDuration(0)
      setIsRecording(false)
      setRecordingDuration(0)
      setRecordingStartTime(null)
      setCameraOnDuringAudioCall(false)
      setCameraStreamDuringAudio(null)
      setLocalStreamForWebRTC(null)
      const stream = localStreamRef.current
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
        localStreamRef.current = null
      }
      if (localVideoRef.current?.srcObject) {
        const s = localVideoRef.current.srcObject as MediaStream
        s.getTracks().forEach((t) => t.stop())
        localVideoRef.current.srcObject = null
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [isOpen, isRecording])

  const toggleMute = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
    setIsFullscreen(!isFullscreen)
  }

  const toggleSpeaker = () => {
    setIsSpeakerOn((v) => !v)
  }

  const enableCameraDuringCall = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((t) => t.stop())
        }
        localStreamRef.current = stream
        setLocalStreamForWebRTC(stream)
        setCameraStreamDuringAudio(stream)
        setCameraOnDuringAudioCall(true)
      })
      .catch((err) => {
        console.error('Erro ao ligar câmera:', err)
        alert('Não foi possível acessar a câmera. Verifique as permissões.')
      })
  }

  // Salvar sessão no banco de dados
  const saveSession = async () => {
    if (!sessionId || !sessionStartTime || !user?.id) {
      console.warn('⚠️ Não foi possível salvar sessão: dados incompletos (sessionId, sessionStartTime ou user.id faltando)')
      return
    }

    // Se não há patientId, ainda salvar a sessão (pode ser chamada sem paciente específico)
    // Mas avisar no log
    if (!patientId) {
      console.warn('⚠️ Salvando sessão sem patientId (pode ser chamada geral)')
    }

    try {
      const endedAt = new Date()
      const durationSeconds = Math.floor((endedAt.getTime() - sessionStartTime.getTime()) / 1000)

      const { data, error } = await supabase
        .from('video_call_sessions')
        .insert({
          session_id: sessionId,
          professional_id: user.id,
          patient_id: patientId || null, // Permitir null se não houver patientId
          started_at: sessionStartTime.toISOString(),
          ended_at: endedAt.toISOString(),
          duration_seconds: durationSeconds,
          call_type: isAudioOnly ? 'audio' : 'video',
          consent_snapshot: consentSnapshot || {
            timestamp: sessionStartTime.toISOString(),
            acceptedBy: 'patient',
            ...VIDEO_CALL_CONSENT_POLICY
          }
        })

      if (error) {
        console.error('❌ Erro ao salvar sessão:', error)
      } else {
        console.log('✅ Sessão salva com sucesso:', data)
      }
    } catch (error) {
      console.error('❌ Erro ao salvar sessão:', error)
    }
  }

  // Salvar trecho clínico gravado
  const saveSnippet = async (blob: Blob) => {
    if (!sessionId || !recordingStartTime || !user?.id || !consentSnapshot) {
      console.warn('⚠️ Não foi possível salvar trecho: dados incompletos (sessionId, recordingStartTime, user.id ou consentSnapshot faltando)')
      return
    }
    
    // Se não há patientId, ainda salvar o trecho (pode ser gravação geral)
    if (!patientId) {
      console.warn('⚠️ Salvando trecho sem patientId (pode ser gravação geral)')
    }

    try {
      const endedAt = new Date()
      const durationSeconds = Math.floor((endedAt.getTime() - recordingStartTime.getTime()) / 1000)

      // Em produção, o blob seria enviado para storage e o path seria salvo
      // Por enquanto, salvamos apenas os metadados
      const { data, error } = await supabase
        .from('video_clinical_snippets')
        .insert({
          professional_id: user.id,
          patient_id: patientId,
          started_at: recordingStartTime.toISOString(),
          ended_at: endedAt.toISOString(),
          duration_seconds: durationSeconds,
          purpose: 'clinical_record',
          consent_snapshot: consentSnapshot,
          retention_policy: 'medical_record'
        } as any)

      if (error) {
        console.error('❌ Erro ao salvar trecho clínico:', error)
      } else {
        console.log('✅ Trecho clínico salvo com sucesso:', data)
      }
    } catch (error) {
      console.error('❌ Erro ao salvar trecho clínico:', error)
    }
  }

  // Iniciar gravação
  const startRecording = () => {
    if (!localVideoRef.current?.srcObject) {
      alert('Não há stream de mídia disponível para gravar.')
      return
    }

    const stream = localVideoRef.current.srcObject as MediaStream
    
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(recordingChunksRef.current, { type: 'video/webm' })
        await saveSnippet(blob)
        recordingChunksRef.current = []
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // Coletar dados a cada 1 segundo
      setIsRecording(true)
      setRecordingStartTime(new Date())
      setRecordingDuration(0)
    } catch (error) {
      console.error('❌ Erro ao iniciar gravação:', error)
      alert('Não foi possível iniciar a gravação. Verifique se o navegador suporta MediaRecorder.')
    }
  }

  // Aceitar consentimento de videochamada
  const handleAcceptConsent = () => {
    const snapshot: RecordingConsentSnapshot = {
      ...VIDEO_CALL_CONSENT_POLICY,
      acceptedBy: 'patient',
      timestamp: new Date().toISOString()
    }
    setConsentSnapshot(snapshot)
    setConsentGiven(true)
    setShowConsentModal(false)
  }

  // Recusar consentimento de videochamada
  const handleRejectConsent = () => {
    setShowConsentModal(false)
    onClose()
  }

  // Solicitar gravação (profissional)
  const handleRequestRecording = () => {
    if (isProfessional) {
      setRecordingRequested(true)
      // Notificação aparece na tela do paciente (via Supabase Realtime ou estado compartilhado)
      // Por enquanto, mostra notificação se paciente estiver na mesma sessão
      setShowPatientConsentNotification(true)
    }
  }

  // Aceitar consentimento de gravação (paciente)
  const handleAcceptRecordingConsent = () => {
    const snapshot: RecordingConsentSnapshot = {
      ...RECORDING_CONSENT_POLICY,
      acceptedBy: 'patient',
      timestamp: new Date().toISOString()
    }
    setConsentSnapshot(snapshot)
    setShowPatientConsentNotification(false)
    setRecordingRequested(false)
    // Iniciar gravação automaticamente após aceitar
    setTimeout(() => {
      startRecording()
    }, 500) // Pequeno delay para UX
  }

  // Recusar consentimento de gravação (paciente)
  const handleRejectRecordingConsent = () => {
    setShowPatientConsentNotification(false)
    setRecordingRequested(false)
  }

  const handleEndCall = async () => {
    // Parar gravação se estiver gravando
    if (isRecording) {
      stopRecording()
    }

    // Salvar sessão no banco
    await saveSession()

    // Stop all tracks
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
    
    onClose()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <>
      {/* Modal de Consentimento para Videochamada */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-5 border-b border-slate-700/50">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-400" />
                Consentimento para Videochamada
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-300 text-sm">
                {VIDEO_CALL_CONSENT_POLICY.description}
              </p>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-xs space-y-2">
                <p className="text-slate-400">• Metadados registrados: quem, quando, duração</p>
                <p className="text-slate-400">• Nenhum conteúdo de áudio/vídeo será armazenado</p>
                <p className="text-slate-400">• Registro apenas para auditoria e registro clínico</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleRejectConsent}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Recusar
                </button>
                <button
                  onClick={handleAcceptConsent}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Aceitar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Notificação de Consentimento para Paciente (grande, centralizada) */}
      {/* Esta notificação aparece quando profissional solicita gravação */}
      {showPatientConsentNotification && !isProfessional && recordingRequested && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[70] p-4 backdrop-blur-md">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-primary-500/50 rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-500/50">
                  <Circle className="w-10 h-10 text-red-400 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Solicitação de Gravação Clínica
                </h3>
                <p className="text-slate-300 text-sm">
                  O médico solicitou a gravação de um trecho desta consulta
                </p>
              </div>

              {/* Conteúdo */}
              <div className="bg-slate-800/50 rounded-2xl p-6 space-y-4 border border-slate-700/50">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-400 text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Duração máxima: 5 minutos</p>
                      <p className="text-slate-400 text-xs mt-1">A gravação será curta e pontual</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-400 text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Finalidade: registro clínico</p>
                      <p className="text-slate-400 text-xs mt-1">Exclusivamente para seu prontuário médico</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary-400 text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Uso restrito</p>
                      <p className="text-slate-400 text-xs mt-1">Não será analisada automaticamente nem usada para outros fins</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={handleRejectRecordingConsent}
                  className="flex-1 px-6 py-3.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
                >
                  Recusar
                </button>
                <button
                  onClick={handleAcceptRecordingConsent}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/30"
                >
                  Aceitar e Iniciar
                </button>
              </div>

              {/* Footer */}
              <p className="text-xs text-slate-500 text-center">
                Você pode recusar a gravação a qualquer momento
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Componente de Videochamada */}
      <div className="fixed inset-0 z-50 bg-black">
      {/* Áudio remoto (viva-voz): elemento para quando WebRTC enviar o stream; setSinkId usa isso */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
      {/* Remote Video — imagem do outro participante (tela principal) */}
      <div className="relative w-full h-full bg-slate-900">
        {!isAudioOnly && (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {webrtcState === 'connecting' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                <p className="text-slate-400">Conectando vídeo...</p>
              </div>
            )}
          </>
        )}
        
        {isAudioOnly && !cameraOnDuringAudioCall && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold text-white">P</span>
              </div>
              <p className="text-white text-xl">Chamada de Áudio</p>
              <p className="text-slate-400 mt-2">
                {patientId ? `Paciente ID: ${patientId}` : 'Conectando...'}
              </p>
              <p className="text-slate-500 text-sm mt-4">Use &quot;Viva-voz&quot; para ouvir pelo alto-falante</p>
              {signalingRoomId && (
                <p className="text-slate-400 text-xs mt-2">
                  {webrtcState === 'connecting' && 'Conectando áudio...'}
                  {webrtcState === 'connected' && 'Conectado'}
                  {webrtcError && <span className="text-amber-400">{webrtcError}</span>}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) — stream atribuído via useEffect acima */}
        {(!isAudioOnly || cameraOnDuringAudioCall) && (
          <div className="absolute bottom-20 right-4 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden border border-white/20 shadow-xl">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Call Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
          <div className="max-w-md mx-auto">
            {/* Call Duration */}
            <div className="text-center mb-4">
              <span className="text-white font-mono text-lg">
                {formatDuration(callDuration)}
              </span>
            </div>

            {/* Control Buttons - Estilo Zoom */}
            <div className="flex items-center justify-center space-x-3 flex-wrap gap-2">
              <button
                onClick={toggleMute}
                className={`p-3.5 rounded-full transition-all ${
                  isMuted
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
                }`}
                title={isMuted ? 'Ativar microfone' : 'Desativar microfone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Viva-voz: áudio pelo alto-falante (importante no mobile) */}
              <button
                onClick={toggleSpeaker}
                className={`p-3.5 rounded-full transition-all ${
                  isSpeakerOn
                    ? 'bg-primary-500 hover:bg-primary-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
                }`}
                title={isSpeakerOn ? 'Viva-voz ligado' : 'Ligar viva-voz (alto-falante)'}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* Ligar câmera durante chamada de áudio */}
              {isAudioOnly && !cameraOnDuringAudioCall && (
                <button
                  onClick={enableCameraDuringCall}
                  className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
                  title="Ligar câmera"
                >
                  <Video className="w-5 h-5" />
                </button>
              )}

              {(!isAudioOnly || cameraOnDuringAudioCall) && (
                <button
                  onClick={toggleVideo}
                  className={`p-3.5 rounded-full transition-all ${
                    isVideoOff
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
                  }`}
                  title={isVideoOff ? 'Ligar câmera' : 'Desligar câmera'}
                >
                  {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
              )}

              {/* Botão Solicitar Gravação (apenas para profissional, modo vídeo) */}
              {!isAudioOnly && consentGiven && isProfessional && !isRecording && (
                <button
                  onClick={() => {
                    if (!recordingRequested) {
                      handleRequestRecording()
                    }
                  }}
                  disabled={recordingRequested}
                  className={`p-3.5 rounded-full transition-all ${
                    recordingRequested
                      ? 'bg-yellow-500/50 text-white cursor-wait animate-pulse'
                      : 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm'
                  }`}
                  title={recordingRequested ? 'Aguardando consentimento do paciente...' : 'Solicitar gravação clínica ao paciente'}
                >
                  <Circle className="w-5 h-5" />
                </button>
              )}

              {/* Botão Parar Gravação (quando está gravando) */}
              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="p-3.5 rounded-full bg-red-500 hover:bg-red-600 text-white animate-pulse transition-all"
                  title="Parar gravação"
                >
                  <Square className="w-5 h-5" />
                </button>
              )}

              <button
                onClick={handleEndCall}
                className="p-3.5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all"
                title="Encerrar chamada"
              >
                <X className="w-5 h-5" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
                title={isFullscreen ? 'Sair do modo tela cheia' : 'Tela cheia'}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Call Info */}
            <div className="mt-4 text-center text-sm text-slate-400 space-y-1">
              {!isSpeakerOn && (
                <p className="text-amber-400 flex items-center justify-center space-x-2">
                  <VolumeX className="w-4 h-4" />
                  <span>Viva-voz desligado — toque no ícone para ouvir pelo alto-falante</span>
                </p>
              )}
              {isMuted && (
                <p className="text-yellow-400 flex items-center justify-center space-x-2">
                  <MicOff className="w-4 h-4" />
                  <span>Você está sem som</span>
                </p>
              )}
              {isVideoOff && (!isAudioOnly || cameraOnDuringAudioCall) && (
                <p className="text-yellow-400 flex items-center justify-center space-x-2">
                  <VideoOff className="w-4 h-4" />
                  <span>Sua câmera está desligada</span>
                </p>
              )}
              {isRecording && (
                <p className="text-red-400 flex items-center justify-center space-x-2">
                  <Circle className="w-4 h-4 animate-pulse" />
                  <span>Gravando: {formatDuration(recordingDuration)} / 5:00</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleEndCall}
          className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
    </>
  )
}

export default VideoCall
