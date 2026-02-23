/**
 * Clinical Governance Engine - Logger
 * 
 * Sistema de logging estruturado para auditoria
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
    timestamp: Date
    level: LogLevel
    module: string
    message: string
    data?: any
    patientId?: string
    professionalId?: string
}

class ClinicalGovernanceLogger {
    private logs: LogEntry[] = []
    private maxLogs = 1000 // Limitar histórico em memória

    private log(level: LogLevel, module: string, message: string, data?: any) {
        const entry: LogEntry = {
            timestamp: new Date(),
            level,
            module,
            message,
            data: data ? JSON.parse(JSON.stringify(data)) : undefined // Deep clone
        }

        this.logs.push(entry)

        // Manter apenas últimos 1000 logs
        if (this.logs.length > this.maxLogs) {
            this.logs.shift()
        }

        // Console log formatado
        const prefix = `[ACDSS][${module}]`
        const formattedData = data ? JSON.stringify(data, null, 2) : ''

        switch (level) {
            case 'debug':
                console.log(`🔍 ${prefix} ${message}`, formattedData)
                break
            case 'info':
                console.log(`ℹ️ ${prefix} ${message}`, formattedData)
                break
            case 'warn':
                console.warn(`⚠️ ${prefix} ${message}`, formattedData)
                break
            case 'error':
                console.error(`❌ ${prefix} ${message}`, formattedData)
                break
        }
    }

    debug(module: string, message: string, data?: any) {
        this.log('debug', module, message, data)
    }

    info(module: string, message: string, data?: any) {
        this.log('info', module, message, data)
    }

    warn(module: string, message: string, data?: any) {
        this.log('warn', module, message, data)
    }

    error(module: string, message: string, data?: any) {
        this.log('error', module, message, data)
    }

    // Obter logs filtrados
    getLogs(filter?: { level?: LogLevel; module?: string }) {
        if (!filter) return [...this.logs]

        return this.logs.filter(log => {
            if (filter.level && log.level !== filter.level) return false
            if (filter.module && log.module !== filter.module) return false
            return true
        })
    }

    // Limpar logs
    clear() {
        this.logs = []
    }

    // Exportar para auditoria (salvará no Supabase depois)
    export(): LogEntry[] {
        return [...this.logs]
    }
}

// Singleton
export const logger = new ClinicalGovernanceLogger()
