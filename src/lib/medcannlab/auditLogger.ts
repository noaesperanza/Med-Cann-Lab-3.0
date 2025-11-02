import { supabase } from '../supabase'
import { AuditLogPayload } from './types'

interface AuditLoggerOptions {
  tableName?: string
  enableConsoleFallback?: boolean
}

const DEFAULT_TABLE = 'medcannlab_audit_logs'

export class MedCannLabAuditLogger {
  private readonly tableName: string
  private readonly enableConsoleFallback: boolean

  constructor(options: AuditLoggerOptions = {}) {
    this.tableName = options.tableName ?? DEFAULT_TABLE
    this.enableConsoleFallback = options.enableConsoleFallback ?? true
  }

  async log(event: AuditLogPayload): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .insert({
          conversation_id: event.conversationId,
          user_id: event.userId ?? null,
          action: event.action,
          metadata: event.metadata ?? null,
          created_at: event.timestamp
        })

      if (error) {
        throw error
      }
    } catch (error) {
      if (this.enableConsoleFallback) {
        console.warn('[AuditLogger] Falha ao registrar log na tabela, usando fallback local.', error)
        console.info('[AuditLogger] Evento:', event)
      }
    }
  }
}

let auditLogger: MedCannLabAuditLogger | null = null

export const getAuditLogger = (): MedCannLabAuditLogger => {
  if (!auditLogger) {
    auditLogger = new MedCannLabAuditLogger()
  }

  return auditLogger
}

