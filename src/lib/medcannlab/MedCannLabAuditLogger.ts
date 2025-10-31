export interface AuditLogEntry {
  timestamp: string;
  clinicianProfile?: string;
  endpoint: string;
  intent?: string;
  payload?: Record<string, unknown>;
  error?: string;
}

export interface AuditLogger {
  log(entry: AuditLogEntry): Promise<void>;
}

/**
 * Minimal audit logger that writes into Supabase if a client is provided.
 * In local/offline environments it falls back to console warnings so that
 * clinical conversations are still traceable during development.
 */
export class MedCannLabAuditLogger implements AuditLogger {
  private readonly consoleFallback: boolean;
  private readonly supabaseClient?: {
    from(table: string): {
      insert(entry: AuditLogEntry): Promise<{ error?: { message: string } }>;
    };
  };
  private readonly tableName: string;

  constructor(options: {
    supabaseClient?: MedCannLabAuditLogger['supabaseClient'];
    tableName?: string;
    consoleFallback?: boolean;
  } = {}) {
    this.supabaseClient = options.supabaseClient;
    this.tableName = options.tableName ?? 'medcannlab_audit_logs';
    this.consoleFallback = options.consoleFallback ?? true;
  }

  async log(entry: AuditLogEntry): Promise<void> {
    if (this.supabaseClient) {
      try {
        const result = await this.supabaseClient
          .from(this.tableName)
          .insert(entry);
        if (result.error && this.consoleFallback) {
          console.warn('MedCannLabAuditLogger warning:', result.error.message);
        }
        return;
      } catch (error) {
        if (this.consoleFallback) {
          console.warn('MedCannLabAuditLogger fallback error:', error);
        }
      }
    }

    if (this.consoleFallback) {
      console.info('[Audit]', entry);
    }
  }
}
