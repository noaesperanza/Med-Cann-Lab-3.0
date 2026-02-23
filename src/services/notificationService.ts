import { supabase } from '../lib/supabase'

export type NotificationType =
    | 'success'
    | 'warning'
    | 'error'
    | 'clinical'
    | 'prescription'
    | 'report'
    | 'appointment'
    | 'message'
    | 'video_call_scheduled'
    | 'video_call_request'
    | 'info'

export interface Notification {
    id: string
    title: string
    message: string
    type: NotificationType
    is_read: boolean
    user_id: string
    action_url?: string
    created_at: string
    metadata?: Record<string, any>
}

class NotificationService {
    async getUserNotifications(userId: string, options: { limit?: number } = {}): Promise<Notification[]> {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(options.limit || 20)

            if (error) throw error
            return (data as Notification[]) || []
        } catch (error) {
            console.error('Error fetching notifications:', error)
            return []
        }
    }

    async getUnreadCount(userId: string): Promise<number> {
        try {
            const { count, error } = await supabase
                .from('notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false)

            if (error) throw error
            return count || 0
        } catch (error) {
            console.error('Error fetching unread count:', error)
            return 0
        }
    }

    subscribeToNotifications(userId: string, callback: (notification: Notification) => void): () => void {
        const subscription = supabase
            .channel(`notifications:${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                callback(payload.new as Notification)
            })
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }

    async markAsRead(notificationId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId)

            if (error) throw error
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    async markAllAsRead(userId: string): Promise<number> {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false)
                .select()

            if (error) throw error
            return data?.length || 0
        } catch (error) {
            console.error('Error marking all notifications as read:', error)
            return 0
        }
    }

    async deleteNotification(notificationId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId)

            if (error) throw error
        } catch (error) {
            console.error('Error deleting notification:', error)
        }
    }

    async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification | null> {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .insert(notification as any)
                .select()
                .single()

            if (error) throw error
            return data as Notification
        } catch (error) {
            console.error('Error creating notification:', error)
            return null
        }
    }
}

export const notificationService = new NotificationService()
