import { describe, expect, it, vi } from 'vitest';
import { MedCannLabApiClient, MedCannLabApiError } from '../apiClient';
import type { AuditLogger } from '../MedCannLabAuditLogger';

describe('MedCannLabApiClient', () => {
  const createAuditLogger = () => ({
    log: vi.fn().mockResolvedValue(undefined)
  }) satisfies AuditLogger;

  it('anexa X-API-Key e respeita baseUrl configurada', async () => {
    const auditLogger = createAuditLogger();
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const json = async () => ({ status: 'online', updatedAt: '2024-01-01T00:00:00Z' });
      return {
        ok: true,
        status: 200,
        headers: new Headers(),
        json,
        text: async () => JSON.stringify(await json())
      } as Response;
    });

    const client = new MedCannLabApiClient({
      baseUrl: 'https://example.medcannlab',
      apiKey: 'secure-key',
      fetchImpl: fetchMock,
      auditLogger
    });

    await client.getPlatformStatus();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.medcannlab/platform/status');
    expect(new Headers(init?.headers).get('X-API-Key')).toBe('secure-key');
  });

  it('renova a chave via apiKeyProvider quando encontra 401', async () => {
    const auditLogger = createAuditLogger();
    const fetchMock = vi
      .fn(async (_url: string, init?: RequestInit) => {
        const key = new Headers(init?.headers).get('X-API-Key');
        if (key === 'expired-key') {
          return {
            ok: false,
            status: 401,
            headers: new Headers(),
            json: async () => ({}),
            text: async () => 'unauthorized'
          } as Response;
        }
        return {
          ok: true,
          status: 200,
          headers: new Headers(),
          json: async () => ({ status: 'online', updatedAt: '2024-01-01T00:00:00Z' }),
          text: async () => 'ok'
        } as Response;
      });

    let refreshed = false;
    const client = new MedCannLabApiClient({
      baseUrl: 'https://example.medcannlab',
      apiKey: 'expired-key',
      fetchImpl: fetchMock,
      auditLogger,
      apiKeyProvider: async () => {
        refreshed = true;
        return 'fresh-key';
      }
    });

    await client.getPlatformStatus();

    expect(refreshed).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const secondCallHeaders = new Headers(fetchMock.mock.calls[1][1]?.headers);
    expect(secondCallHeaders.get('X-API-Key')).toBe('fresh-key');
  });

  it('lança erro e registra auditoria quando resposta não é ok', async () => {
    const auditLogger = createAuditLogger();
    const fetchMock = vi.fn(async () => {
      return {
        ok: false,
        status: 500,
        headers: new Headers(),
        json: async () => ({}),
        text: async () => 'erro interno'
      } as Response;
    });

    const client = new MedCannLabApiClient({
      baseUrl: 'https://example.medcannlab',
      apiKey: 'secure-key',
      fetchImpl: fetchMock,
      auditLogger
    });

    await expect(client.getPlatformStatus()).rejects.toBeInstanceOf(MedCannLabApiError);
    expect(auditLogger.log).toHaveBeenCalledWith(
      expect.objectContaining({
        endpoint: '/platform/status',
        error: 'erro interno'
      })
    );
  });
});
