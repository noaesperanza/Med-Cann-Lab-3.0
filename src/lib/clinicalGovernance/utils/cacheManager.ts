/**
 * Clinical Governance Engine - Cache Manager
 * 
 * Sistema de cache em memória (copiado do TradeVision)
 * Reduz queries ao banco em ~70%
 */

import { CacheEntry } from '../types'
import { CACHE_TTL } from './thresholds'
import { logger } from './logger'

class ClinicalCacheManager {
    private cache: Map<string, CacheEntry<any>> = new Map()

    /**
     * Obter valor do cache
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key)

        if (!entry) {
            logger.debug('CacheManager', `Cache MISS: ${key}`)
            return null
        }

        // Verificar se expirou
        const isExpired = (Date.now() - entry.timestamp) >= entry.ttl

        if (isExpired) {
            logger.debug('CacheManager', `Cache EXPIRED: ${key}`)
            this.cache.delete(key)
            return null
        }

        logger.debug('CacheManager', `Cache HIT: ${key}`)
        return entry.data as T
    }

    /**
     * Salvar no cache
     */
    set<T>(key: string, data: T, ttl?: number): void {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl: ttl || CACHE_TTL.PATIENT_ANALYSIS
        }

        this.cache.set(key, entry)

        logger.debug('CacheManager', `Cache SET: ${key}`, {
            ttl: `${entry.ttl / 1000}s`
        })
    }

    /**
     * Limpar cache por prefixo
     */
    clearByPrefix(prefix: string): void {
        let cleared = 0

        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key)
                cleared++
            }
        }

        logger.info('CacheManager', `Cleared ${cleared} entries with prefix: ${prefix}`)
    }

    /**
     * Limpar todo cache
     */
    clearAll(): void {
        const size = this.cache.size
        this.cache.clear()
        logger.info('CacheManager', `Cleared all cache (${size} entries)`)
    }

    /**
     * Estatísticas do cache
     */
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        }
    }
}

// Singleton
export const cacheManager = new ClinicalCacheManager()

// Helper functions
export function getCached<T>(key: string): T | null {
    return cacheManager.get<T>(key)
}

export function setCache<T>(key: string, data: T, ttl?: number): void {
    cacheManager.set(key, data, ttl)
}

export function clearCache(keyPrefix?: string): void {
    if (keyPrefix) {
        cacheManager.clearByPrefix(keyPrefix)
    } else {
        cacheManager.clearAll()
    }
}
