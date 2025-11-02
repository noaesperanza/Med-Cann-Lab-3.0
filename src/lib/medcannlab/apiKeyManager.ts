import { supabase } from '../supabase'
import { MedCannLabApiError, MedCannLabAuthenticationError } from './errors'

interface SecureKeyResponse {
  apiKey: string
  expiresAt?: string | null
}

interface ApiKeyManagerOptions {
  functionName?: string
  cacheGracePeriodMs?: number
}

const DEFAULT_FUNCTION = 'medcannlab-api-key'

export class MedCannLabApiKeyManager {
  private key: string | null = null
  private expiresAt: number | null = null
  private readonly functionName: string
  private readonly cacheGracePeriodMs: number
  private isRefreshing = false

  constructor(options: ApiKeyManagerOptions = {}) {
    this.functionName = options.functionName ?? DEFAULT_FUNCTION
    this.cacheGracePeriodMs = options.cacheGracePeriodMs ?? 60_000
  }

  async getKey(forceRefresh = false): Promise<string> {
    const now = Date.now()

    if (!forceRefresh && this.key) {
      const willExpireSoon = this.expiresAt && this.expiresAt - now < this.cacheGracePeriodMs
      if (!willExpireSoon) {
        return this.key
      }
    }

    return this.refreshKey()
  }

  async renewKey(reason = 'automatic_renewal'): Promise<string> {
    return this.refreshKey({ renew: true, reason })
  }

  clear(): void {
    this.key = null
    this.expiresAt = null
  }

  private async refreshKey(options: { renew?: boolean; reason?: string } = {}): Promise<string> {
    if (this.isRefreshing) {
      return this.waitUntilRefreshed()
    }

    this.isRefreshing = true

    try {
      const secureKey = await this.fetchKeyFromSecureVault(options)
      this.key = secureKey.apiKey
      this.expiresAt = secureKey.expiresAt ? new Date(secureKey.expiresAt).getTime() : null
      return this.key
    } finally {
      this.isRefreshing = false
    }
  }

  private async waitUntilRefreshed(): Promise<string> {
    return new Promise((resolve, reject) => {
      let attempts = 0
      const interval = setInterval(() => {
        attempts += 1

        if (this.key) {
          clearInterval(interval)
          resolve(this.key)
          return
        }

        if (attempts > 50) {
          clearInterval(interval)
          reject(new MedCannLabApiError('Timeout ao recuperar chave X-API-Key atualizada'))
        }
      }, 100)
    })
  }

  private async fetchKeyFromSecureVault(options: { renew?: boolean; reason?: string }): Promise<SecureKeyResponse> {
    try {
      // Tentar obter chave via Supabase Function (edge function protegida)
      const { data, error } = await supabase.functions.invoke<SecureKeyResponse>(this.functionName, {
        body: {
          action: options.renew ? 'renew' : 'issue',
          reason: options.reason ?? 'noa_conversational_interface'
        }
      })

      if (error) {
        throw error
      }

      if (data?.apiKey) {
        return data
      }
    } catch (error) {
      console.warn('[MedCannLabApiKeyManager] Falha ao recuperar chave segura via Supabase Function.', error)
    }

    // Fallback para variáveis de ambiente (último recurso)
    const fallbackKey = (import.meta as any).env?.VITE_MEDCANNLAB_API_KEY || (import.meta as any).env?.VITE_API_KEY

    if (fallbackKey && typeof fallbackKey === 'string' && fallbackKey.trim().length > 0) {
      return { apiKey: fallbackKey }
    }

    throw new MedCannLabAuthenticationError('Chave X-API-Key não encontrada nas fontes seguras configuradas')
  }
}

let apiKeyManager: MedCannLabApiKeyManager | null = null

export const getMedCannLabApiKeyManager = (): MedCannLabApiKeyManager => {
  if (!apiKeyManager) {
    apiKeyManager = new MedCannLabApiKeyManager()
  }

  return apiKeyManager
}

