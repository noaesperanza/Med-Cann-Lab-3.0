import { supabase } from '../lib/supabase'
import { notificationService } from './notificationService'

export interface VideoCallRequest {
  id: string
  request_id: string
  requester_id: string
  recipient_id: string
  call_type: 'video' | 'audio'
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled'
  expires_at: string
  accepted_at?: string
  rejected_at?: string
  cancelled_at?: string
  metadata?: {
    patientId?: string
    roomId?: string
    [key: string]: any
  }
  created_at: string
}

export interface CreateVideoCallRequestParams {
  recipientId: string
  callType: 'video' | 'audio'
  timeoutSeconds?: number // Padrão: 30 segundos
  metadata?: {
    patientId?: string
    roomId?: string
    [key: string]: any
  }
}

class VideoCallRequestService {
  /**
   * Criar uma nova solicitação de videochamada
   */
  async createRequest(params: CreateVideoCallRequestParams): Promise<VideoCallRequest | null> {
    const { user } = (await supabase.auth.getUser()).data
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const timeoutSeconds = params.timeoutSeconds || 30
    const requestId = `vcr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const { data, error } = await supabase
      .from('video_call_requests')
      .insert({
        request_id: requestId,
        requester_id: user.id,
        recipient_id: params.recipientId,
        call_type: params.callType,
        expires_at: new Date(Date.now() + timeoutSeconds * 1000).toISOString(),
        metadata: params.metadata || {}
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Erro ao criar solicitação de videochamada:', error)
      return null
    }

    // Solicitação criada - sem log para reduzir poluição no console

    // Notificação: usar sempre o caminho direto (RPC/insert) para evitar CORS no browser.
    // A Edge Function exige verify_jwt=false no gateway; enquanto isso não estiver aplicado,
    // o preflight OPTIONS recebe 401 e o browser bloqueia. O fallback já cria a notificação.
    try {
      await this.createNotificationFallback(params, requestId, user)
    } catch (notificationError: any) {
      if (!notificationError?.message?.includes('CORS') && !notificationError?.message?.includes('Failed to fetch')) {
        console.warn('⚠️ Erro ao criar notificação:', notificationError?.message || notificationError)
      }
    }

    return data as VideoCallRequest
  }

  /**
   * Aceitar uma solicitação de videochamada
   * UPDATE sem .select() para evitar 406 (RETURNING + RLS); busca a linha depois.
   */
  async acceptRequest(requestId: string): Promise<VideoCallRequest | null> {
    const { user } = (await supabase.auth.getUser()).data
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { error: updateError } = await supabase
      .from('video_call_requests')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('request_id', requestId)
      .eq('status', 'pending')

    if (updateError) {
      console.error('❌ Erro ao aceitar solicitação:', updateError)
      return null
    }

    const { data, error: selectError } = await supabase
      .from('video_call_requests')
      .select('*')
      .eq('request_id', requestId)
      .maybeSingle()

    if (selectError) {
      console.warn('⚠️ Aceite aplicado; falha ao ler registro:', selectError)
      return { request_id: requestId, status: 'accepted' } as VideoCallRequest
    }
    if (data) console.log('✅ Solicitação aceita:', data)
    return data as VideoCallRequest
  }

  /**
   * Recusar uma solicitação de videochamada
   * UPDATE sem .select() para evitar 406; busca a linha depois.
   */
  async rejectRequest(requestId: string): Promise<VideoCallRequest | null> {
    const { user } = (await supabase.auth.getUser()).data
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { error: updateError } = await supabase
      .from('video_call_requests')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString()
      })
      .eq('request_id', requestId)
      .eq('status', 'pending')

    if (updateError) {
      console.error('❌ Erro ao recusar solicitação:', updateError)
      return null
    }

    const { data } = await supabase
      .from('video_call_requests')
      .select('*')
      .eq('request_id', requestId)
      .maybeSingle()

    if (data) console.log('✅ Solicitação recusada:', data)
    return data as VideoCallRequest
  }

  /**
   * FALLBACK: Criar notificação diretamente no frontend quando Edge Function falhar
   */
  private async createNotificationFallback(
    params: CreateVideoCallRequestParams,
    requestId: string,
    requester: { id: string; email?: string; user_metadata?: { name?: string } }
  ): Promise<void> {
    try {
      // Buscar informações do requester
      const { data: requesterData } = await supabase
        .from('users')
        .select('id, name, email, type')
        .eq('id', requester.id)
        .single()

      // Buscar informações do recipient
      const { data: recipientData } = await supabase
        .from('users')
        .select('id, name, email, type')
        .eq('id', params.recipientId)
        .single()

      if (!recipientData) {
        console.warn('⚠️ Não foi possível buscar dados do recipient para notificação')
        return
      }

      const requesterName = requesterData?.name || requester.user_metadata?.name || requester.email?.split('@')[0] || 'Usuário'
      
      // Identificar tipo do requester (profissional/admin ou paciente)
      const requesterType = requesterData?.type || 'unknown'
      const isProfessionalRequesting = requesterType !== 'paciente' && 
                                      requesterType !== 'patient' && 
                                      (requesterType === 'profissional' || 
                                       requesterType === 'professional' || 
                                       requesterType === 'admin' || 
                                       requesterType === 'master' ||
                                       requesterType === 'gestor')
      
      const callTypeLabel = params.callType === 'video' ? 'Videochamada' : 'Chamada de Áudio'

      // Mensagens personalizadas baseadas no tipo de requester
      const notificationTitle = isProfessionalRequesting
        ? 'Profissional está chamando você'
        : 'Solicitação de Videochamada'

      const notificationMessage = isProfessionalRequesting
        ? `${requesterName} está chamando você para uma ${callTypeLabel.toLowerCase()}. Responda em até 30 segundos.`
        : `${requesterName} solicitou uma ${callTypeLabel.toLowerCase()}. Aguardando sua resposta (válido por 30 minutos).`

      // Criar notificação diretamente
      // Usar RPC para bypass RLS (permite criar notificação para outros usuários)
      try {
        // Tentar usar RPC primeiro (bypass RLS)
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_video_call_notification', {
          p_user_id: params.recipientId,
          p_title: notificationTitle,
          p_message: notificationMessage,
          p_metadata: {
            request_id: requestId,
            requester_id: requester.id,
            requester_name: requesterName,
            call_type: params.callType,
            is_professional_request: isProfessionalRequesting,
            ...params.metadata
          }
        })

        if (!rpcError && rpcData) {
          // Notificação criada com sucesso via RPC - sem log para reduzir poluição
          return
        }

        // Se RPC falhou, tentar fallback direto (sem logar erro comum)
        if (rpcError) {
          // Só logar se for erro inesperado (não função não encontrada)
          if (rpcError.code !== 'PGRST202' && !rpcError.message?.includes('function') && rpcError.code !== '42883') {
            console.warn('⚠️ RPC erro inesperado:', rpcError.message)
          }
        }

        // Fallback: tentar método direto (pode falhar por RLS)
        await notificationService.createNotification({
          user_id: params.recipientId,
          title: notificationTitle,
          message: notificationMessage,
          type: 'video_call_request',
          is_read: false,
          metadata: {
            request_id: requestId,
            requester_id: requester.id,
            requester_name: requesterName,
            call_type: params.callType,
            is_professional_request: isProfessionalRequesting,
            ...params.metadata
          }
        })
        // Notificação criada com sucesso - sem log para reduzir poluição
      } catch (metadataError: any) {
        // Se falhar por causa de metadata (schema cache não atualizado), tentar sem metadata
        if (metadataError?.message?.includes('metadata') || metadataError?.code === 'PGRST204') {
          try {
            const { data: rpcData, error: rpcError } = await supabase.rpc('create_video_call_notification', {
              p_user_id: params.recipientId,
              p_title: notificationTitle,
              p_message: notificationMessage,
              p_metadata: {}
            })

            if (!rpcError && rpcData) {
              // Notificação criada - sem log
              return
            }

            // Último fallback: método direto sem metadata
            await notificationService.createNotification({
              user_id: params.recipientId,
              title: notificationTitle,
              message: notificationMessage,
              type: 'video_call_request',
              is_read: false
            })
            // Notificação criada - sem log
          } catch (fallbackError: unknown) {
            const err = fallbackError as { message?: string; code?: string }
            if (!err?.message?.includes('row-level security') && !err?.code?.includes('42501')) {
              console.error('❌ Erro ao criar notificação:', fallbackError)
            }
            // Não throw - sistema continua funcionando mesmo sem notificação
          }
        } else if (metadataError?.code === '42501' || metadataError?.message?.includes('row-level security')) {
          // Erro de RLS - tentar RPC novamente (sem log - é esperado)
          try {
            const { data: rpcData, error: rpcError } = await supabase.rpc('create_video_call_notification', {
              p_user_id: params.recipientId,
              p_title: notificationTitle,
              p_message: notificationMessage,
              p_metadata: {
                request_id: requestId,
                requester_id: requester.id,
                requester_name: requesterName,
                call_type: params.callType,
                is_professional_request: isProfessionalRequesting,
                ...params.metadata
              }
            })

            if (!rpcError && rpcData) {
              // Notificação criada - sem log
            } else if (rpcError && rpcError.code !== 'PGRST202') {
              // Só logar se não for função não encontrada (esperado)
              console.error('❌ Erro ao criar notificação via RPC:', rpcError.message)
            }
          } catch (rpcError: any) {
            // Só logar se não for função não encontrada (esperado)
            if (rpcError?.code !== 'PGRST202' && !rpcError?.message?.includes('function')) {
              console.error('❌ Erro ao criar notificação via RPC:', rpcError.message)
            }
            // Não throw - sistema continua funcionando mesmo sem notificação
          }
        } else {
          console.error('❌ Erro ao criar notificação:', metadataError)
          // Não throw - sistema continua funcionando mesmo sem notificação
        }
      }
    } catch (error) {
      console.error('❌ Erro ao criar notificação via fallback:', error)
    }
  }

  /**
   * Cancelar uma solicitação de videochamada (pelo requester)
   */
  async cancelRequest(requestId: string): Promise<VideoCallRequest | null> {
    const { user } = (await supabase.auth.getUser()).data
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('video_call_requests')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('request_id', requestId)
      .eq('requester_id', user.id)
      .eq('status', 'pending')
      .select()
      .maybeSingle()

    if (error) {
      console.error('❌ Erro ao cancelar solicitação:', error)
      return null
    }
    if (data) console.log('✅ Solicitação cancelada:', data)
    return data as VideoCallRequest
  }

  /**
   * Buscar uma solicitação por request_id (requester ou recipient podem ler; RLS).
   * Usado para polling quando o requester está aguardando aceite (fallback do realtime).
   */
  async getRequestById(requestId: string): Promise<VideoCallRequest | null> {
    const { user } = (await supabase.auth.getUser()).data
    if (!user) return null

    const { data, error } = await supabase
      .from('video_call_requests')
      .select('*')
      .eq('request_id', requestId)
      .maybeSingle()

    if (error) {
      console.warn('getRequestById:', error.message)
      return null
    }
    return data as VideoCallRequest
  }

  /**
   * Buscar solicitações pendentes para o usuário atual
   */
  async getPendingRequests(): Promise<VideoCallRequest[]> {
    const { user } = (await supabase.auth.getUser()).data
    if (!user) {
      return []
    }

    const { data, error } = await supabase
      .from('video_call_requests')
      .select('*')
      .eq('recipient_id', user.id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString()) // Apenas não expiradas
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar solicitações pendentes:', error)
      return []
    }

    return (data || []) as VideoCallRequest[]
  }

  /**
   * Limpar solicitações expiradas
   */
  async expireOldRequests(): Promise<void> {
    const { error } = await supabase
      .from('video_call_requests')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString())

    if (error) {
      console.error('❌ Erro ao expirar solicitações:', error)
    }
  }

  /**
   * Inscrever-se em solicitações em tempo real
   */
  subscribeToRequests(
    userId: string,
    callback: (request: VideoCallRequest) => void
  ): () => void {
    const channel = supabase
      .channel(`video-call-requests:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'video_call_requests',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          const request = payload.new as VideoCallRequest
          // Verificar se não expirou
          if (new Date(request.expires_at) > new Date()) {
            callback(request)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'video_call_requests',
          filter: `requester_id=eq.${userId} OR recipient_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as VideoCallRequest)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }
}

export const videoCallRequestService = new VideoCallRequestService()
