import { MedCannLabAuditLogger, type AuditLogger } from './MedCannLabAuditLogger';

export type HttpMethod = 'GET' | 'POST';

export interface MedCannLabApiClientOptions {
  baseUrl?: string;
  apiKey?: string;
  apiKeyProvider?: () => Promise<string> | string;
  auditLogger?: AuditLogger;
  clinicianProfile?: string;
  fetchImpl?: typeof fetch;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export class MedCannLabApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'MedCannLabApiError';
  }
}

export class MedCannLabApiClient {
  private apiKey?: string;
  private readonly apiKeyProvider?: () => Promise<string>;
  private readonly auditLogger: AuditLogger;
  private readonly baseUrl: string;
  private readonly clinicianProfile?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: MedCannLabApiClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? import.meta.env?.VITE_MEDCANNLAB_API_BASE_URL ?? 'https://api.medcannlab.local';
    this.apiKey = options.apiKey ?? import.meta.env?.VITE_MEDCANNLAB_API_KEY;
    this.clinicianProfile = options.clinicianProfile;
    this.fetchImpl = options.fetchImpl ?? fetch;
    if (typeof options.apiKeyProvider === 'function') {
      this.apiKeyProvider = async () => Promise.resolve(options.apiKeyProvider!());
    }
    this.auditLogger =
      options.auditLogger ?? new MedCannLabAuditLogger({ consoleFallback: true });
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async refreshApiKey(): Promise<string | undefined> {
    if (!this.apiKeyProvider) {
      return this.apiKey;
    }
    const nextKey = await this.apiKeyProvider();
    this.apiKey = nextKey;
    return nextKey;
  }

  private resolveUrl(path: string) {
    return new URL(path, this.baseUrl).toString();
  }

  private async performRequest<T>(path: string, init: RequestInit & { method?: HttpMethod } = {}): Promise<ApiResponse<T>> {
    const url = this.resolveUrl(path);
    const headers = new Headers(init.headers ?? {});
    if (this.apiKey) {
      headers.set('X-API-Key', this.apiKey);
    }
    headers.set('Accept', 'application/json');
    const response = await this.fetchImpl(url, {
      ...init,
      headers
    });

    if (response.status === 401 && this.apiKeyProvider) {
      const refreshed = await this.refreshApiKey();
      if (refreshed) {
        headers.set('X-API-Key', refreshed);
        const retry = await this.fetchImpl(url, {
          ...init,
          headers
        });
        return this.parseJsonResponse<T>(retry, path);
      }
    }

    return this.parseJsonResponse<T>(response, path);
  }

  private async parseJsonResponse<T>(response: Response, endpoint: string): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const text = await response.text().catch(() => undefined);
      const message = text || `MedCannLab API request failed with status ${response.status}`;
      await this.auditLogger.log({
        timestamp: new Date().toISOString(),
        endpoint,
        clinicianProfile: this.clinicianProfile,
        error: message
      });
      throw new MedCannLabApiError(message, response.status);
    }

    const data = (await response.json()) as T;
    await this.auditLogger.log({
      timestamp: new Date().toISOString(),
      endpoint,
      clinicianProfile: this.clinicianProfile,
      payload: { status: response.status }
    });

    return {
      data,
      status: response.status,
      headers: response.headers
    };
  }

  async getPlatformStatus() {
    return this.performRequest<PlatformStatusResponse>('/platform/status');
  }

  async getTrainingContext() {
    return this.performRequest<TrainingContextResponse>('/training/context');
  }

  async getPatientSimulations() {
    return this.performRequest<PatientSimulationResponse>('/patients/simulations');
  }

  async getKnowledgeLibrary(query?: string) {
    const path = query ? `/knowledge/library?query=${encodeURIComponent(query)}` : '/knowledge/library';
    return this.performRequest<KnowledgeLibraryResponse>(path);
  }
}

export interface PlatformStatusResponse {
  status: 'online' | 'maintenance' | 'degraded';
  updatedAt: string;
  notes?: string;
}

export interface TrainingContextResponse {
  modules: Array<{
    id: string;
    title: string;
    focus: string;
    lastAccessedAt?: string;
  }>;
}

export interface PatientSimulationResponse {
  simulations: Array<{
    id: string;
    specialty: string;
    status: 'pending' | 'active' | 'completed';
    createdAt: string;
    nextStep?: string;
  }>;
}

export interface KnowledgeLibraryResponse {
  entries: Array<{
    id: string;
    title: string;
    category: 'dissertation' | 'protocol' | 'article' | 'case-study';
    summary: string;
    url: string;
  }>;
}
