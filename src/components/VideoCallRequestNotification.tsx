import React, { useEffect, useState } from 'react'
import { Video, Phone, X, Check, Clock } from 'lucide-react'
import { videoCallRequestService, VideoCallRequest } from '../services/videoCallRequestService'

interface VideoCallRequestNotificationProps {
  request: VideoCallRequest
  onAccept: (request: VideoCallRequest) => void
  onReject: (request: VideoCallRequest) => void
  onExpire: (request: VideoCallRequest) => void
}

const VideoCallRequestNotification: React.FC<VideoCallRequestNotificationProps> = ({
  request,
  onAccept,
  onReject,
  onExpire
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const updateTimeRemaining = () => {
      const expiresAt = new Date(request.expires_at)
      const now = new Date()
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
      
      setTimeRemaining(remaining)
      
      if (remaining === 0 && !isExpired) {
        setIsExpired(true)
        onExpire(request)
      }
    }

    updateTimeRemaining()
    const interval = setInterval(updateTimeRemaining, 1000)

    return () => clearInterval(interval)
  }, [request, isExpired, onExpire])

  const handleAccept = async () => {
    const accepted = await videoCallRequestService.acceptRequest(request.request_id)
    // Sempre abre a sala para quem aceitou: usa o request já em mãos se o backend falhar (ex.: 406)
    const toUse = accepted ?? { ...request, status: 'accepted' as const }
    onAccept(toUse)
  }

  const handleReject = async () => {
    const rejected = await videoCallRequestService.rejectRequest(request.request_id)
    if (rejected) {
      onReject(rejected)
    }
  }

  if (isExpired) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-slate-900 border border-primary-500/50 rounded-xl shadow-2xl p-4 min-w-[320px] max-w-md animate-in slide-in-from-right">
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${request.call_type === 'video' ? 'bg-blue-500/20' : 'bg-green-500/20'}`}>
          {request.call_type === 'video' ? (
            <Video className="w-5 h-5 text-blue-400" />
          ) : (
            <Phone className="w-5 h-5 text-green-400" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-white">
              Solicitação de {request.call_type === 'video' ? 'Videochamada' : 'Chamada de Áudio'}
            </h3>
            <button
              onClick={handleReject}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-xs text-slate-400 mb-3">
            Alguém está solicitando uma {request.call_type === 'video' ? 'videochamada' : 'chamada de áudio'}
          </p>
          
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3 h-3 text-slate-500" />
            <span className="text-xs text-slate-500">
              {timeRemaining > 0 ? `${timeRemaining}s restantes` : 'Expirado'}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-500 hover:bg-primary-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Check className="w-4 h-4" />
              Aceitar
            </button>
            <button
              onClick={handleReject}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
            >
              Recusar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoCallRequestNotification
