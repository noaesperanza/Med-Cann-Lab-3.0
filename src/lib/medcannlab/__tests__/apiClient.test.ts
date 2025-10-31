import type { Mock } from 'vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MedCannLabApiClient } from '../apiClient'
import type { MedCannLabApiKeyManager } from '../apiKeyManager'

const createMockResponse = (payload: unknown, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  text: () => Promise.resolve(JSON.stringify(payload))
}) as Response

describe('MedCannLabApiClient', () => {
  const stubKeyManager = {
    getKey: vi.fn(async () => 'test-key'),
    renewKey: vi.fn(async () => 'test-key'),
    clear: vi.fn()
  } as unknown as MedCannLabApiKeyManager
  const baseUrl = 'https://api.medcannlab.test'

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue(createMockResponse({
      health: 'operational',
      components: [],
      lastCheckedAt: new Date().toISOString()
    }))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('anexa cabeçalho X-API-Key em todas as requisições', async () => {
    const client = new MedCannLabApiClient({ baseUrl, apiKeyManager: stubKeyManager })

    await client.getPlatformStatus()

    expect(global.fetch).toHaveBeenCalledTimes(1)
    const [, requestInit] = (global.fetch as unknown as Mock).mock.calls[0]
    const headers = new Headers(requestInit.headers)
    expect(headers.get('X-API-Key')).toBe('test-key')
  })

  it('monta corretamente query params em endpoints com filtros', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(createMockResponse({ entries: [], total: 0 }))

    const client = new MedCannLabApiClient({ baseUrl, apiKeyManager: stubKeyManager })

    await client.getKnowledgeLibrary({ query: 'nefrologia', limit: 5 })

    const [url] = (global.fetch as unknown as Mock).mock.calls[0]
    expect(url).toContain('/knowledge/library')
    expect(url).toContain('query=nefrologia')
    expect(url).toContain('limit=5')
  })

  it('lança erro quando base URL não utiliza HTTPS', () => {
    expect(() => new MedCannLabApiClient({ baseUrl: 'http://insecure.test', apiKeyManager: stubKeyManager })).toThrow()
  })
})

