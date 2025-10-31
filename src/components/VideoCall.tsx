import React, { useRef, useEffect, useState } from 'react'
import { X, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Settings, Maximize2, Minimize2 } from 'lucide-react'

interface VideoCallProps {
  isOpen: boolean
  onClose: () => void
  patientId?: string
  isAudioOnly?: boolean
}

const VideoCall: React.FC<VideoCallProps> = ({ isOpen, onClose, patientId, isAudioOnly = false }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isRemoteMuted, setIsRemoteMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)

  // Mock WebRTC connection - In production, this would use actual WebRTC API
  useEffect(() => {
    if (isOpen) {
      // Simulate getting user media
      navigator.mediaDevices
        .getUserMedia({ video: !isAudioOnly, audio: true })
        .then((stream) => {
          if (localVideoRef.current && !isAudioOnly) {
            localVideoRef.current.srcObject = stream
          }
        })
        .catch((error) => {
          console.error('Error accessing media devices:', error)
          alert('Não foi possível acessar a câmera e o microfone. Verifique as permissões.')
        })

      // Start call duration timer
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)

      return () => {
        clearInterval(interval)
        // Cleanup streams
        if (localVideoRef.current?.srcObject) {
          const stream = localVideoRef.current.srcObject as MediaStream
          stream.getTracks().forEach((track) => track.stop())
        }
      }
    }
  }, [isOpen, isAudioOnly])

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

  const handleEndCall = () => {
    // Stop all tracks
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
    onClose()
    setCallDuration(0)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Remote Video */}
      <div className="relative w-full h-full bg-slate-900">
        {!isAudioOnly && (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        
        {isAudioOnly && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl font-bold text-white">P</span>
              </div>
              <p className="text-white text-xl">Chamada de Áudio</p>
              <p className="text-slate-400 mt-2">
                {patientId ? `Paciente ID: ${patientId}` : 'Conectando...'}
              </p>
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        {!isAudioOnly && (
          <div className="absolute bottom-20 right-4 w-48 h-36 bg-slate-800 rounded-lg overflow-hidden">
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

            {/* Control Buttons */}
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full ${
                  isMuted
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                } text-white transition-colors`}
                title={isMuted ? 'Ativar microfone' : 'Desativar microfone'}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              {!isAudioOnly && (
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full ${
                    isVideoOff
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-slate-700 hover:bg-slate-600'
                  } text-white transition-colors`}
                  title={isVideoOff ? 'Ligar câmera' : 'Desligar câmera'}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </button>
              )}

              <button
                onClick={handleEndCall}
                className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                title="Encerrar chamada"
              >
                <X className="w-6 h-6" />
              </button>

              <button
                onClick={toggleFullscreen}
                className={`p-4 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors`}
                title={isFullscreen ? 'Sair do modo tela cheia' : 'Tela cheia'}
              >
                {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
              </button>
            </div>

            {/* Call Info */}
            <div className="mt-4 text-center text-sm text-slate-400">
              {isMuted && (
                <p className="text-yellow-400 flex items-center justify-center space-x-2">
                  <MicOff className="w-4 h-4" />
                  <span>Você está sem som</span>
                </p>
              )}
              {isVideoOff && !isAudioOnly && (
                <p className="text-yellow-400 flex items-center justify-center space-x-2">
                  <VideoOff className="w-4 h-4" />
                  <span>Sua câmera está desligada</span>
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
  )
}

export default VideoCall
