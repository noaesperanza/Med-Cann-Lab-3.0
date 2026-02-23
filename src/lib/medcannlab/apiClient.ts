import { MedCannLabApiKeyManager, getMedCannLabApiKeyManager } from './apiKeyManager'
import {
  KnowledgeLibraryRequest,
  KnowledgeLibraryResponse,
  PlatformStatus,
  SimulationActionPayload,
  SimulationFilters,
  SimulationResponse,
  TrainingContextRequest,
  TrainingContextResponse
} from './types'
import {
  MedCannLabApiError,
  MedCannLabAuthenticationError,
  MedCannLabNetworkError,
  MedCannLabTimeoutError,
  MedCannLabValidationError
} from './errors'
import { getAuditLogger } from './auditLogger'

interface RequestOptions extends RequestInit {
  query?: Record<string, unknown>
  audit?: {
    action: string
    metadata?: Record<string, unknown>
    conversationId?: string
    userId?: string
  }
  timeoutMs?: number
  retryOnAuthFailure?: boolean
}

interface MedCannLabApiClientConfig {
  baseUrl?: string
  timeoutMs?: number
  apiKeyManager?: MedCannLabApiKeyManager
}

const DEFAULT_TIMEOUT = 20_000

export class MedCannLabApiClient {
  private readonly baseUrl: string
  private readonly timeoutMs: number
  private readonly apiKeyManager: MedCannLabApiKeyManager

  constructor(config: MedCannLabApiClientConfig = {}) {
    const rawBaseUrl = config.baseUrl ?? (import.meta as any).env?.VITE_MEDCANNLAB_API_URL ?? (import.meta as any).env?.VITE_API_BASE_URL ?? ''

    if (!rawBaseUrl) {
      throw new MedCannLabApiError('Base URL da API MedCannLab não configurada', { status: 500 })
    }

    if (!rawBaseUrl.startsWith('https://')) {
      throw new MedCannLabApiError('A URL da API MedCannLab deve utilizar HTTPS', { status: 500 })
    }

    this.baseUrl = rawBaseUrl.replace(/\/$/, '')
    this.timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT
    this.apiKeyManager = config.apiKeyManager ?? getMedCannLabApiKeyManager()
  }

  async getPlatformStatus(options: Partial<RequestOptions> = {}): Promise<PlatformStatus> {
    const audit = options.audit ?? { action: 'platform.status' }

    return this.request<PlatformStatus>('/platform/status', {
      method: 'GET',
      ...options,
      audit
    })
  }

  async getTrainingContext(params: TrainingContextRequest = {}, options: Partial<RequestOptions> = {}): Promise<TrainingContextResponse> {
    const audit = options.audit ?? {
      action: 'training.context',
      metadata: { params: { ...params } }
    }

    return this.request<TrainingContextResponse>('/training/context', {
      method: 'GET',
      query: this.cleanQuery(params),
      ...options,
      audit
    })
  }

  async getPatientSimulations(filters: SimulationFilters = {}, options: Partial<RequestOptions> = {}): Promise<SimulationResponse> {
    const audit = options.audit ?? {
      action: 'patients.simulations.list',
      metadata: { filters: { ...filters } }
    }

    return this.request<SimulationResponse>('/patients/simulations', {
      method: 'GET',
      query: this.cleanQuery(filters),
      ...options,
      audit
    })
  }

  async triggerSimulationAction(payload: SimulationActionPayload, options: Partial<RequestOptions> = {}): Promise<SimulationResponse> {
    if (!payload.action) {
      throw new MedCannLabValidationError('Ação da simulação não informada')
    }

    const audit = options.audit ?? {
      action: `patients.simulations.${payload.action}`,
      metadata: { payload: { ...payload } }
    }

    return this.request<SimulationResponse>('/patients/simulations', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: this.mergeHeaders(options.headers, { 'Content-Type': 'application/json' }),
      ...options,
      audit
    })
  }

  async getKnowledgeLibrary(params: KnowledgeLibraryRequest = {}, options: Partial<RequestOptions> = {}): Promise<KnowledgeLibraryResponse> {
    const audit = options.audit ?? {
      action: 'knowledge.library',
      metadata: { params: { ...params } }
    }

    return this.request<KnowledgeLibraryResponse>('/knowledge/library', {
      method: 'GET',
      query: this.cleanQuery(params),
      ...options,
      audit
    })
  }

  private async request<T>(path: string, options: RequestOptions): Promise<T> {
    const url = this.buildUrl(path, options.query)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? this.timeoutMs)

    try {
      const apiKey = await this.apiKeyManager.getKey()

      const response = await fetch(url, {
        ...options,
        headers: this.mergeHeaders(options.headers, {
          'X-API-Key': apiKey,
          Accept: 'application/json'
        }),
        signal: controller.signal
      })

      if (response.status === 401 && options.retryOnAuthFailure !== false) {
        await this.apiKeyManager.renewKey('unauthorized_response')
        return this.request<T>(path, { ...options, retryOnAuthFailure: false })
      }

      if (response.status === 403) {
        throw new MedCannLabAuthenticationError('Acesso não autorizado à API MedCannLab', {
          status: 403,
          details: await this.safeParseJSON(response)
        })
      }

      if (!response.ok) {
        const errorBody = await this.safeParseJSON(response)
        const errorMessage =
          (typeof errorBody === 'object' && errorBody && 'message' in errorBody && typeof (errorBody as any).message === 'string'
            ? (errorBody as any).message
            : undefined) || response.statusText || 'Erro desconhecido'

        if (response.status === 422) {
          throw new MedCannLabValidationError(errorMessage, {
            status: 422,
            details: errorBody
          })
        }

        throw new MedCannLabApiError(errorMessage, {
          status: response.status,
          details: errorBody
        })
      }

      const data = await this.safeParseJSON(response)

      const auditPayload = options.audit
      if (auditPayload?.action) {
        await getAuditLogger().log({
          conversationId: auditPayload.conversationId ?? 'noa-conversational',
          userId: auditPayload.userId,
          action: auditPayload.action,
          timestamp: new Date().toISOString(),
          metadata: auditPayload.metadata
        })
      }

      return data as T
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new MedCannLabTimeoutError('Requisição à API MedCannLab excedeu o tempo limite')
      }

      if (error instanceof MedCannLabApiError) {
        throw error
      }

      throw new MedCannLabNetworkError('Erro de rede ao comunicar com a API MedCannLab', { cause: error })
    } finally {
      clearTimeout(timeout)
    }
  }

  private buildUrl(path: string, query?: Record<string, unknown>): string {
    const url = path.startsWith('http')
      ? new URL(path)
      : new URL(path, this.baseUrl)

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null) return

        if (Array.isArray(value)) {
          value.forEach(item => url.searchParams.append(key, String(item)))
        } else {
          url.searchParams.set(key, String(value))
        }
      })
    }

    return url.toString()
  }

  private cleanQuery(params: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
    )
  }

  private mergeHeaders(existingHeaders: HeadersInit | undefined, newHeaders: Record<string, string>): HeadersInit {
    const headers = new Headers(existingHeaders ?? {})

    Object.entries(newHeaders).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      headers.set(key, value)
    })

    return headers
  }

  private async safeParseJSON(response: Response): Promise<unknown> {
    const text = await response.text()

    if (!text) {
      return null
    }

    try {
      return JSON.parse(text)
    } catch (error) {
      console.warn('[MedCannLabApiClient] Falha ao interpretar JSON da resposta.', error)
      return text
    }
  }
}

let apiClient: MedCannLabApiClient | null = null

export const getMedCannLabApiClient = (): MedCannLabApiClient => {
  if (!apiClient) {
    apiClient = new MedCannLabApiClient()
  }

  return apiClient
}

