import React, { useEffect, useRef, useState } from 'react'
import { Bot, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Activity, Brain } from 'lucide-react'
import { supabase } from '../lib/supabase'

// Imagem padrão (fallback)
const DEFAULT_AVATAR_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBmaWxsPSIjOEI1Q0Y2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OPC90ZXh0Pjwvc3ZnPg=='

// Helper para combinar classes
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

interface NoaAnimatedAvatarProps {
  isSpeaking?: boolean
  isListening?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showStatus?: boolean
  showControls?: boolean
  onMessage?: (message: string) => void
}

const NoaAnimatedAvatar: React.FC<NoaAnimatedAvatarProps> = ({
  isSpeaking = false,
  isListening = false,
  size = 'lg',
  showStatus = true,
  showControls = false,
  onMessage
}) => {
  const avatarRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLipSyncActive, setIsLipSyncActive] = useState(false)
  const [pulseIntensity, setPulseIntensity] = useState(1)
  const [avatarUrl, setAvatarUrl] = useState<string>('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIiBmaWxsPSIjOEI1Q0Y2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OPC90ZXh0Pjwvc3ZnPg==')
  const [pensando, setPensando] = useState(false)
  const [cameraAtiva, setCameraAtiva] = useState(false)
  const [somAtivo, setSomAtivo] = useState(true)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)

  // Buscar a URL do avatar no Supabase Storage
  useEffect(() => {
    const fetchAvatarUrl = async () => {
      try {
        console.log('🔍 Buscando avatar no Supabase...')
        const { data, error } = await supabase.storage
          .from('avatar')
          .list('', {
            limit: 1,
            sortBy: { column: 'created_at', order: 'desc' }
          })

        if (error) {
          console.warn('❌ Erro ao buscar avatar:', error)
          return
        }

        console.log('📦 Arquivos encontrados:', data)

        if (data && data.length > 0) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatar')
            .getPublicUrl(data[0].name)
          
          console.log('✅ URL do avatar:', publicUrl)
          const urlWithCache = `${publicUrl}?t=${Date.now()}`
          setAvatarUrl(urlWithCache)
        } else {
          console.log('ℹ️ Nenhum avatar encontrado, usando imagem padrão')
        }
      } catch (error) {
        console.warn('❌ Erro ao buscar avatar do Supabase:', error)
      }
    }

    fetchAvatarUrl()

    const handleAvatarUpdate = (event: Event) => {
      console.log('🎧 Evento avatarUpdated recebido!')
      const customEvent = event as CustomEvent
      if (customEvent.detail?.url) {
        console.log('✅ Atualizando avatar para:', customEvent.detail.url)
        setAvatarUrl(customEvent.detail.url)
      }
    }

    window.addEventListener('avatarUpdated', handleAvatarUpdate)
    
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate)
      pararCamera()
      pararReconhecimentoVoz()
    }
  }, [])

  // Iniciar câmera
  const iniciarCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      mediaStreamRef.current = stream
      setCameraAtiva(true)
    } catch (error) {
      console.error('Erro ao acessar câmera:', error)
    }
  }

  // Parar câmera
  const pararCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraAtiva(false)
  }

  // Iniciar reconhecimento de voz
  const iniciarReconhecimentoVoz = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Reconhecimento de voz não suportado')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.lang = 'pt-BR'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: any) => {
      let transcricaoFinal = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcricaoFinal += event.results[i][0].transcript + ' '
        }
      }
      if (transcricaoFinal && onMessage) {
        onMessage(transcricaoFinal)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error)
    }

    recognition.start()
    recognitionRef.current = recognition
  }

  // Parar reconhecimento de voz
  const pararReconhecimentoVoz = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
  }

  // Tamanhos do avatar
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64'
  }

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  }

  // Animação de movimentação labial
  useEffect(() => {
    if (isSpeaking && avatarRef.current) {
      setIsLipSyncActive(true)
      const interval = setInterval(() => {
        if (avatarRef.current) {
          setPulseIntensity(1.05)
          setTimeout(() => {
            setPulseIntensity(1)
          }, 150)
        }
      }, 300)
      
      return () => {
        clearInterval(interval)
        setIsLipSyncActive(false)
        setPulseIntensity(1)
      }
    } else {
      setIsLipSyncActive(false)
      setPulseIntensity(1)
    }
  }, [isSpeaking])

  // Animação de escuta
  useEffect(() => {
    if (isListening && avatarRef.current) {
      const interval = setInterval(() => {
        setPulseIntensity(1.02)
        setTimeout(() => {
          setPulseIntensity(1)
        }, 200)
      }, 400)
      
      return () => {
        clearInterval(interval)
        setPulseIntensity(1)
      }
    }
  }, [isListening])

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('noaSoundToggled', { detail: { enabled: somAtivo } }))
  }, [somAtivo])

  return (
    <div className="relative w-48 h-48 mx-auto">
      <div 
        ref={avatarRef}
        className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#92400e] p-1 transition-all",
          isSpeaking && "shadow-[0_0_40px_rgba(30,58,138,0.8)]",
          pensando && "animate-spin"
        )}
        style={{
          animation: isSpeaking ? 'glow-pulse 1.5s ease-in-out infinite' : 'none',
          transform: `scale(${pulseIntensity})`
        }}
      >
        <div className="w-full h-full rounded-full bg-card overflow-hidden flex items-center justify-center">
          {cameraAtiva ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1e3a8a]/20 to-[#92400e]/20">
              <img 
                src={avatarUrl} 
                alt="Nôa Esperanza" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  console.error('❌ Erro ao carregar imagem do avatar:', avatarUrl)
                  // Fallback para uma imagem simples
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TjwvdGV4dD4KPC9zdmc+'
                }}
                onLoad={() => {
                  console.log('✅ Imagem do avatar carregada com sucesso:', avatarUrl)
                }}
              />
              
              {pensando && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Brain className="text-white animate-pulse" size={48} />
                </div>
              )}
              
              {isSpeaking && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full border-4 border-[#1e3a8a]/30 animate-ping" 
                           style={{ width: '120px', height: '80px', top: '60%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                      </div>
                      <div className="absolute bg-[#1e3a8a]/20 rounded-full animate-pulse" 
                           style={{ 
                             width: '60px', 
                             height: '30px', 
                             top: '65%', 
                             left: '50%', 
                             transform: 'translate(-50%, -50%)',
                             animation: 'mouth-move 0.3s ease-in-out infinite alternate'
                           }}>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div
                          key={i}
                          className="w-1 bg-[#1e3a8a] rounded-full"
                          style={{
                            height: `${Math.random() * 24 + 8}px`,
                            animation: 'audio-wave 0.5s ease-in-out infinite alternate',
                            animationDelay: `${i * 0.05}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      {showStatus && (
        <div className="absolute -top-2 -right-2 px-3 py-1 rounded-full bg-white/95 backdrop-blur-sm border-2 border-white/30 shadow-xl text-xs font-semibold flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            pensando ? "bg-yellow-500 animate-pulse" : isSpeaking ? "bg-green-500 animate-pulse" : "bg-blue-500"
          )} />
          <span className="text-gray-800">
            {pensando ? 'Pensando...' : isSpeaking ? 'Falando...' : 'Ouvindo'}
          </span>
        </div>
      )}

      {/* Controles Multimodais */}
      {showControls && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => {
              if (recognitionRef.current) {
                pararReconhecimentoVoz()
              } else {
                iniciarReconhecimentoVoz()
              }
            }}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all",
              recognitionRef.current 
                ? "bg-[#92400e] text-white hover:bg-[#7c2d12]" 
                : "bg-card border-2 border-border hover:border-[#1e3a8a]"
            )}
          >
            {recognitionRef.current ? <Mic size={24} /> : <MicOff size={24} className="text-muted-foreground" />}
          </button>

          <button
            onClick={cameraAtiva ? pararCamera : iniciarCamera}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all",
              cameraAtiva 
                ? "bg-[#1e40af] text-white hover:bg-[#1e3a8a]" 
                : "bg-card border-2 border-border hover:border-[#1e3a8a]"
            )}
          >
            {cameraAtiva ? <Video size={24} /> : <VideoOff size={24} className="text-muted-foreground" />}
          </button>

          <button
            onClick={() => setSomAtivo(prev => !prev)}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all",
              somAtivo 
                ? "bg-[#1e3a8a] text-white hover:bg-[#1e40af]" 
                : "bg-card border-2 border-border hover:border-[#1e3a8a]"
            )}
          >
            {somAtivo ? <Volume2 size={24} /> : <VolumeX size={24} className="text-muted-foreground" />}
          </button>
        </div>
      )}

      <style>{`
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(30, 58, 138, 0.5); }
          50% { box-shadow: 0 0 40px rgba(30, 58, 138, 0.8); }
        }
        @keyframes mouth-move {
          0% { transform: translate(-50%, -50%) scaleY(0.8); }
          100% { transform: translate(-50%, -50%) scaleY(1); }
        }
        @keyframes audio-wave {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}

export default NoaAnimatedAvatar
