import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'

const CHANNEL_PREFIX = 'vc'
const SIGNAL_EVENT = 'webrtc'

type SignalMessage =
  | { type: 'offer'; data: RTCSessionDescriptionInit }
  | { type: 'answer'; data: RTCSessionDescriptionInit }
  | { type: 'ice'; data: RTCIceCandidateInit }
  | { type: 'ready' }

type ConnectionState = 'new' | 'connecting' | 'connected' | 'failed' | 'closed'

const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
}

export interface UseWebRTCRoomOptions {
  /** Id da sala (ex.: request_id da video_call_requests). Quando null/undefined, o hook não inicia conexão. */
  roomId: string | null | undefined
  /** Quem iniciou a chamada envia o offer; o outro espera o offer e envia o answer. */
  isInitiator: boolean
  /** Stream local (microfone/câmera). Passado após getUserMedia. */
  localStream: MediaStream | null
  /** Habilitar apenas quando a chamada está aberta e o usuário deu consentimento. */
  enabled: boolean
  /** Id do usuário atual (para ignorar mensagens próprias no broadcast). */
  userId: string
}

export interface UseWebRTCRoomReturn {
  /** Stream remoto (áudio/vídeo do outro participante). Atribuir a remoteAudioRef/remoteVideoRef. */
  remoteStream: MediaStream | null
  connectionState: ConnectionState
  error: string | null
}

export function useWebRTCRoom({
  roomId,
  isInitiator,
  localStream,
  enabled,
  userId
}: UseWebRTCRoomOptions): UseWebRTCRoomReturn {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('new')
  const [error, setError] = useState<string | null>(null)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([])
  const statsIntervalRef = useRef<number | null>(null)

  // WebRTC Watchdog: Log quality and trigger reconnection if needed
  const startWatchdog = (pc: RTCPeerConnection) => {
    let lastBytesReceived = 0
    let lastTimestamp = 0
    let lastPacketsLost = 0
    let lastPacketsReceived = 0

    const monitor = async () => {
      try {
        if (!pc || pc.signalingState === 'closed') return

        const stats = await pc.getStats()
        let currentBitrate = 0
        let currentPacketLoss = 0
        let currentLatency = 0
        let currentResolution = 'unknown'

        stats.forEach((report) => {
          const r = report as any
          if (r.type === 'inbound-rtp' && r.kind === 'video') {
            // Bitrate calculation
            if (lastTimestamp > 0) {
              const bytes = r.bytesReceived - lastBytesReceived
              const time = (r.timestamp - lastTimestamp) / 1000
              if (time > 0) {
                currentBitrate = Math.round((bytes * 8) / (time * 1024))
              }
            }

            // Packet loss calculation
            if (lastPacketsReceived > 0) {
              const lost = r.packetsLost - lastPacketsLost
              const total = (r.packetsReceived - lastPacketsReceived) + lost
              if (total > 0) {
                currentPacketLoss = Math.round((lost / total) * 100)
              }
            }

            lastBytesReceived = r.bytesReceived
            lastPacketsLost = r.packetsLost
            lastPacketsReceived = r.packetsReceived
            lastTimestamp = r.timestamp

            if (r.frameWidth && r.frameHeight) {
              currentResolution = `${r.frameWidth}x${r.frameHeight}`
            }
          }

          if (r.type === 'candidate-pair' && r.state === 'succeeded') {
            currentLatency = Math.round(r.currentRoundTripTime * 1000)
          }
        })

        // Log to Supabase (B2.4)
        if (enabled && roomId) {
          void (supabase as any).from('video_call_quality_logs').insert({
            session_id: roomId,
            user_id: userId,
            bitrate_kbps: currentBitrate,
            packet_loss_percentage: currentPacketLoss,
            latency_ms: currentLatency,
            resolution: currentResolution,
            connection_state: pc.iceConnectionState,
            is_watchdog_trigger: currentBitrate < 100 || currentPacketLoss > 10
          })
        }

        // Reconnection logic (B2.3)
        if (pc.iceConnectionState === 'disconnected' || (currentBitrate < 50 && lastTimestamp > 0)) {
          console.warn('Watchdog: Bad connection detected. Attempting ICE restart...')
          try {
            pc.restartIce()
          } catch (e) {
            console.error('ICE Restart failed:', e)
          }
        }
      } catch (err) {
        console.error('Watchdog error:', err)
      }
    }

    statsIntervalRef.current = window.setInterval(monitor, 5000)
  }

  useEffect(() => {
    if (!roomId || !enabled || !localStream) {
      if (statsIntervalRef.current) {
        window.clearInterval(statsIntervalRef.current)
        statsIntervalRef.current = null
      }
      setRemoteStream(null)
      setConnectionState('new')
      return
    }

    setConnectionState('connecting')
    setError(null)

    const channelName = `${CHANNEL_PREFIX}:${roomId}`
    const pc = new RTCPeerConnection(rtcConfig)
    pcRef.current = pc

    // Start Monitoring Watchdog
    startWatchdog(pc)

    // Enviar candidatos ICE quando forem gerados
    pc.onicecandidate = (ev) => {
      if (ev.candidate && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: SIGNAL_EVENT,
          payload: { from: userId, type: 'ice', data: ev.candidate.toJSON() }
        } as any)
      }
    }

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState
      if (state === 'connected' || state === 'completed') {
        setConnectionState('connected')
        setError(null)
      } else if (state === 'failed' || state === 'disconnected') {
        setConnectionState('failed')
        setError('Falha na conexão. Tente encerrar e ligar novamente.')
      } else if (state === 'closed') {
        setConnectionState('closed')
      }
    }

    // Stream remoto (áudio/vídeo do outro)
    pc.ontrack = (ev) => {
      if (ev.streams?.[0]) {
        setRemoteStream(ev.streams[0])
      }
    }

    // Adicionar trilhas locais
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream)
    })

    const channel = supabase.channel(channelName)
    channelRef.current = channel

    channel
      .on('broadcast' as any, { event: SIGNAL_EVENT }, (payload: any) => {
        const msg = payload?.payload as (SignalMessage & { from?: string })
        if (!msg || msg.from === userId) return

        if (msg.type === 'offer') {
          if (pc.remoteDescription) return
          pc.setRemoteDescription(new RTCSessionDescription(msg.data))
            .then(() => pc.createAnswer())
            .then((answer) => pc.setLocalDescription(answer))
            .then(() => {
              channel.send({
                type: 'broadcast',
                event: SIGNAL_EVENT,
                payload: { from: userId, type: 'answer', data: pc.localDescription!.toJSON() }
              } as any)
            })
            .then(() => {
              pendingIceRef.current.forEach((c) => pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => { }))
              pendingIceRef.current = []
            })
            .catch((err) => {
              console.error('WebRTC answer error:', err)
              setError('Erro ao conectar. Tente novamente.')
              setConnectionState('failed')
            })
        } else if (msg.type === 'answer') {
          pc.setRemoteDescription(new RTCSessionDescription(msg.data))
            .then(() => {
              pendingIceRef.current.forEach((c) => pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => { }))
              pendingIceRef.current = []
            })
            .catch((err) => {
              console.error('WebRTC setRemoteDescription (answer) error:', err)
              setError('Erro ao conectar. Tente novamente.')
              setConnectionState('failed')
            })
        } else if (msg.type === 'ice') {
          if (pc.remoteDescription) {
            pc.addIceCandidate(new RTCIceCandidate(msg.data)).catch(() => { })
          } else {
            pendingIceRef.current.push(msg.data)
          }
        } else if (msg.type === 'ready' && isInitiator) {
          // Callee entrou; enviar offer agora para não perder
          pc.createOffer()
            .then((offer) => pc.setLocalDescription(offer))
            .then(() => {
              channel.send({
                type: 'broadcast',
                event: SIGNAL_EVENT,
                payload: { from: userId, type: 'offer', data: pc.localDescription!.toJSON() }
              } as any)
            })
            .catch((err) => {
              console.error('WebRTC offer error:', err)
              setError('Erro ao iniciar chamada. Tente novamente.')
              setConnectionState('failed')
            })
        }
      })
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') return
        if (!isInitiator) {
          channel.send({
            type: 'broadcast',
            event: SIGNAL_EVENT,
            payload: { from: userId, type: 'ready' }
          } as any)
        } else {
          // Iniciador também envia offer ao inscrever (caso o callee já esteja esperando)
          pc.createOffer()
            .then((offer) => pc.setLocalDescription(offer))
            .then(() => {
              channel.send({
                type: 'broadcast',
                event: SIGNAL_EVENT,
                payload: { from: userId, type: 'offer', data: pc.localDescription!.toJSON() }
              } as any)
            })
            .catch((err) => {
              console.error('WebRTC offer error:', err)
              setError('Erro ao iniciar chamada. Tente novamente.')
              setConnectionState('failed')
            })
        }
      })

    return () => {
      if (statsIntervalRef.current) {
        window.clearInterval(statsIntervalRef.current)
        statsIntervalRef.current = null
      }
      if (pcRef.current) {
        pcRef.current.close()
        pcRef.current = null
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      pendingIceRef.current = []
      setRemoteStream(null)
      setConnectionState('closed')
      setError(null)
    }
  }, [roomId, isInitiator, enabled, userId, localStream])

  // Manter localStream atualizado (trocar trilhas se o usuário ligar/desligar câmera)
  useEffect(() => {
    const pc = pcRef.current
    if (!pc || !localStream) return
    const senders = pc.getSenders()
    localStream.getTracks().forEach((track) => {
      const sender = senders.find((s) => s.track?.id === track.id)
      if (sender && sender.track !== track) {
        sender.replaceTrack(track).catch(() => { })
      }
    })
  }, [localStream])

  return { remoteStream, connectionState, error }
}
