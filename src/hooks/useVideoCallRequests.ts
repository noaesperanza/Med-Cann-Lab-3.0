import { useEffect, useState, useCallback } from 'react'
import { videoCallRequestService, VideoCallRequest, CreateVideoCallRequestParams } from '../services/videoCallRequestService'
import { useAuth } from '../contexts/AuthContext'

export interface UseVideoCallRequestsOptions {
  /** Chamado quando uma solicitação que nós criamos é aceita (para abrir a chamada no lado do caller). */
  onRequestAccepted?: (request: VideoCallRequest) => void
}

interface UseVideoCallRequestsReturn {
  pendingRequests: VideoCallRequest[]
  isLoading: boolean
  createRequest: (params: CreateVideoCallRequestParams) => Promise<VideoCallRequest | null>
  acceptRequest: (requestId: string) => Promise<VideoCallRequest | null>
  rejectRequest: (requestId: string) => Promise<VideoCallRequest | null>
  cancelRequest: (requestId: string) => Promise<VideoCallRequest | null>
}

export const useVideoCallRequests = (options?: UseVideoCallRequestsOptions): UseVideoCallRequestsReturn => {
  const { onRequestAccepted } = options ?? {}
  const { user } = useAuth()
  const [pendingRequests, setPendingRequests] = useState<VideoCallRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Carregar solicitações pendentes
  const loadPendingRequests = useCallback(async () => {
    if (!user?.id) {
      setPendingRequests([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const requests = await videoCallRequestService.getPendingRequests()
      setPendingRequests(requests)
    } catch (error) {
      console.error('Erro ao carregar solicitações pendentes:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // Criar solicitação
  const createRequest = useCallback(async (params: CreateVideoCallRequestParams): Promise<VideoCallRequest | null> => {
    try {
      const request = await videoCallRequestService.createRequest(params)
      if (request) {
        // Recarregar solicitações pendentes
        await loadPendingRequests()
      }
      return request
    } catch (error) {
      console.error('Erro ao criar solicitação:', error)
      return null
    }
  }, [loadPendingRequests])

  // Aceitar solicitação
  const acceptRequest = useCallback(async (requestId: string): Promise<VideoCallRequest | null> => {
    try {
      const request = await videoCallRequestService.acceptRequest(requestId)
      if (request) {
        setPendingRequests(prev => prev.filter(r => r.request_id !== requestId))
      }
      return request
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error)
      return null
    }
  }, [])

  // Recusar solicitação
  const rejectRequest = useCallback(async (requestId: string): Promise<VideoCallRequest | null> => {
    try {
      const request = await videoCallRequestService.rejectRequest(requestId)
      if (request) {
        setPendingRequests(prev => prev.filter(r => r.request_id !== requestId))
      }
      return request
    } catch (error) {
      console.error('Erro ao recusar solicitação:', error)
      return null
    }
  }, [])

  // Cancelar solicitação
  const cancelRequest = useCallback(async (requestId: string): Promise<VideoCallRequest | null> => {
    try {
      const request = await videoCallRequestService.cancelRequest(requestId)
      if (request) {
        // Remover imediatamente da lista
        setPendingRequests(prev => prev.filter(r => r.request_id !== requestId))
        // Recarregar para garantir sincronização
        await loadPendingRequests()
      }
      return request
    } catch (error) {
      console.error('Erro ao cancelar solicitação:', error)
      // Mesmo se der erro, remover da lista local para limpar UI
      setPendingRequests(prev => prev.filter(r => r.request_id !== requestId))
      return null
    }
  }, [loadPendingRequests])

  // Carregar solicitações ao montar
  useEffect(() => {
    loadPendingRequests()
  }, [loadPendingRequests])

  // Inscrever-se em atualizações em tempo real
  useEffect(() => {
    if (!user?.id) return

    const unsubscribe = videoCallRequestService.subscribeToRequests(user.id, (request) => {
      if (request.status === 'pending' && request.recipient_id === user.id) {
        // Nova solicitação recebida
        setPendingRequests(prev => {
          // Evitar duplicatas
          if (prev.some(r => r.request_id === request.request_id)) {
            return prev
          }
          return [request, ...prev]
        })
      } else if (request.status === 'accepted' || request.status === 'rejected' || request.status === 'expired' || request.status === 'cancelled') {
        if (request.status === 'accepted' && request.requester_id === user.id && onRequestAccepted) {
          onRequestAccepted(request)
        }
        setPendingRequests(prev => prev.filter(r => r.request_id !== request.request_id))
      }
    })

    return () => {
      unsubscribe()
    }
  }, [user?.id, onRequestAccepted])

  // Limpar solicitações expiradas periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      videoCallRequestService.expireOldRequests()
      loadPendingRequests()
    }, 5000) // A cada 5 segundos

    return () => clearInterval(interval)
  }, [loadPendingRequests])

  return {
    pendingRequests,
    isLoading,
    createRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest
  }
}
