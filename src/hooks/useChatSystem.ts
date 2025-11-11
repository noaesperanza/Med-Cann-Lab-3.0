import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface ChatRoomSummary {
  id: string
  name: string | null
  type: string | null
  lastMessageAt: string | null
  unreadCount: number
}

export interface RoomMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  senderEmail: string
  message: string
  createdAt: string
  messageType: string
  fileUrl?: string | null
  readAt?: string | null
}

export interface ChatSystemState {
  inbox: ChatRoomSummary[]
  inboxLoading: boolean
  messages: RoomMessage[]
  messagesLoading: boolean
  isOnline: boolean
  sendMessage: (roomId: string, senderId: string, content: string) => Promise<void>
  markRoomAsRead: (roomId: string) => Promise<void>
  reloadInbox: () => Promise<void>
}

const mapRoomSummary = (entry: any): ChatRoomSummary => ({
  id: entry.id,
  name: entry.name,
  type: entry.type,
  lastMessageAt: entry.last_message_at ?? null,
  unreadCount: entry.unread_count ?? 0
})

export const useChatSystem = (activeRoomId?: string): ChatSystemState => {
  const [inbox, setInbox] = useState<ChatRoomSummary[]>([])
  const [inboxLoading, setInboxLoading] = useState(true)
  const [messages, setMessages] = useState<RoomMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== 'undefined' ? navigator.onLine : true
  )

  const loadInbox = useCallback(async () => {
    setInboxLoading(true)
    const { data, error } = await supabase.from('v_chat_inbox').select('*')
    if (!error && data) {
      setInbox(data.map(mapRoomSummary))
    }
    setInboxLoading(false)
  }, [])

  const loadMessages = useCallback(async (roomId: string) => {
    setMessagesLoading(true)
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, room_id, sender_id, message, message_type, file_url, created_at, read_at')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(500)

    if (error || !data) {
      setMessages([])
      setMessagesLoading(false)
      return
    }

    const senderIds = Array.from(new Set(data.map(row => row.sender_id).filter(Boolean)))
    let profileMap = new Map<string, { name: string; email: string | null }>()

    if (senderIds.length > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('user_id, name, email')
        .in('user_id', senderIds)

      if (profiles) {
        profileMap = new Map(
          profiles.map(profile => [
            profile.user_id,
            { name: profile.name ?? 'Usuário', email: profile.email ?? null }
          ])
        )
      }
    }

    const normalized: RoomMessage[] = data.map(row => {
      const meta = profileMap.get(row.sender_id) ?? { name: 'Usuário', email: null }
      return {
        id: String(row.id),
        roomId: row.room_id,
        senderId: row.sender_id,
        senderName: meta.name,
        senderEmail: meta.email ?? '',
        message: row.message ?? '',
        createdAt: row.created_at,
        messageType: row.message_type ?? 'text',
        fileUrl: row.file_url ?? null,
        readAt: row.read_at ?? null
      }
    })

    setMessages(normalized)
    setMessagesLoading(false)
  }, [])

  const markRoomAsRead = useCallback(
    async (roomId: string) => {
      await supabase.rpc('mark_room_read', { p_room_id: roomId })
      await loadInbox()
    },
    [loadInbox]
  )

  const sendMessage = useCallback(
    async (roomId: string, senderId: string, content: string) => {
      const trimmed = content.trim()
      if (!trimmed) return
      await supabase.from('chat_messages').insert({
        room_id: roomId,
        sender_id: senderId,
        message: trimmed,
        message_type: 'text'
      })
    },
    []
  )

  useEffect(() => {
    loadInbox()
  }, [loadInbox])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    const channel = supabase
      .channel('chat-inbox-watch')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        () => {
          loadInbox()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadInbox])

  useEffect(() => {
    if (!activeRoomId) {
      setMessages([])
      return
    }

    loadMessages(activeRoomId)
    void markRoomAsRead(activeRoomId)

    const channel = supabase
      .channel(`chat-room-${activeRoomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${activeRoomId}`
        },
        () => {
          loadMessages(activeRoomId)
          loadInbox()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeRoomId, loadInbox, loadMessages, markRoomAsRead])

  return useMemo(
    () => ({
      inbox,
      inboxLoading,
      messages,
      messagesLoading,
      isOnline,
      sendMessage,
      markRoomAsRead,
      reloadInbox: loadInbox
    }),
    [inbox, inboxLoading, isOnline, loadInbox, markRoomAsRead, messages, messagesLoading, sendMessage]
  )
}

