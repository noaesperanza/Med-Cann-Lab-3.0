// =====================================================
// COMPONENTE: CENTRO DE NOTIFICAÇÕES
// =====================================================
// Componente para exibir e gerenciar notificações

import React, { useState, useEffect, useCallback } from 'react'
import { Bell, X, Check, CheckCheck, AlertCircle, Info, CheckCircle, AlertTriangle, FileText, Calendar, MessageSquare, Stethoscope, Video } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { notificationService, Notification, NotificationType } from '../services/notificationService'

interface NotificationCenterProps {
  className?: string
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500" />
    case 'clinical':
      return <Stethoscope className="w-5 h-5 text-blue-500" />
    case 'prescription':
      return <FileText className="w-5 h-5 text-purple-500" />
    case 'report':
      return <FileText className="w-5 h-5 text-indigo-500" />
    case 'appointment':
      return <Calendar className="w-5 h-5 text-cyan-500" />
    case 'message':
      return <MessageSquare className="w-5 h-5 text-pink-500" />
    case 'video_call_scheduled':
      return <Video className="w-5 h-5 text-blue-500" />
    default:
      return <Info className="w-5 h-5 text-blue-500" />
  }
}

const getNotificationColor = (type: NotificationType) => {
  switch (type) {
    case 'success':
      return 'bg-green-500/10 border-green-500/20'
    case 'warning':
      return 'bg-yellow-500/10 border-yellow-500/20'
    case 'error':
      return 'bg-red-500/10 border-red-500/20'
    case 'clinical':
      return 'bg-blue-500/10 border-blue-500/20'
    case 'prescription':
      return 'bg-purple-500/10 border-purple-500/20'
    case 'report':
      return 'bg-indigo-500/10 border-indigo-500/20'
    case 'appointment':
      return 'bg-cyan-500/10 border-cyan-500/20'
    case 'message':
      return 'bg-pink-500/10 border-pink-500/20'
    case 'video_call_scheduled':
      return 'bg-blue-500/10 border-blue-500/20'
    default:
      return 'bg-slate-500/10 border-slate-500/20'
  }
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  // Carregar notificações
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      const [notifs, count] = await Promise.all([
        notificationService.getUserNotifications(user.id, { limit: 20 }),
        notificationService.getUnreadCount(user.id)
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Carregar ao montar e quando usuário mudar
  useEffect(() => {
    loadNotifications()

    // Inscrever em notificações em tempo real
    if (user?.id) {
      const unsubscribe = notificationService.subscribeToNotifications(user.id, (newNotification) => {
        setNotifications(prev => [newNotification, ...prev])
        if (!newNotification.is_read) {
          setUnreadCount(prev => prev + 1)
        }
      })

      return () => {
        unsubscribe()
      }
    }
  }, [user?.id, loadNotifications])

  // Marcar como lida
  const handleMarkAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId)
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Marcar todas como lidas
  const handleMarkAllAsRead = async () => {
    if (!user?.id) return
    const count = await notificationService.markAllAsRead(user.id)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  // Deletar notificação
  const handleDelete = async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId)
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  // Formatar data relativa
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Agora'
    if (minutes < 60) return `${minutes}m atrás`
    if (hours < 24) return `${hours}h atrás`
    if (days < 7) return `${days}d atrás`
    return date.toLocaleDateString('pt-BR')
  }

  if (!user) return null

  return (
    <div className={`relative ${className}`}>
      {/* Botão do sino */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors"
        aria-label="Notificações"
      >
        <Bell className="w-6 h-6 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Painel de notificações */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Painel */}
          <div className="absolute right-0 top-12 w-96 max-h-[600px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-slate-300" />
                <h3 className="text-lg font-semibold text-white">Notificações</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-1.5 rounded hover:bg-slate-800 transition-colors"
                    title="Marcar todas como lidas"
                  >
                    <CheckCheck className="w-4 h-4 text-slate-400" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Lista de notificações */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-400">
                  Carregando notificações...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-slate-800/50 transition-colors ${
                        !notification.is_read ? 'bg-slate-800/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className={`text-sm font-semibold ${!notification.is_read ? 'text-white' : 'text-slate-300'}`}>
                                {notification.title}
                              </h4>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-500 mt-2">
                                {formatRelativeTime(notification.created_at)}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          {notification.action_url && (
                            <a
                              href={notification.action_url}
                              className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-block"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Ver detalhes →
                            </a>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-1 rounded hover:bg-slate-700 transition-colors"
                            title="Marcar como lida"
                          >
                            <Check className="w-4 h-4 text-slate-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-1 rounded hover:bg-slate-700 transition-colors"
                            title="Deletar"
                          >
                            <X className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default NotificationCenter

