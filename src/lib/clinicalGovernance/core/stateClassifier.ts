/**
 * Clinical Governance Engine - State Classifier
 * 
 * Classifica o estado atual do paciente baseado em indicadores
 */

import { PatientState, ConfidenceLevel } from '../types/enums'
import type { PatientContext, KPI } from '../types'
import { logger } from '../utils/logger'

export interface StateClassification {
    state: PatientState
    confidence: ConfidenceLevel
    reasoning: string
    indicators: {
        improving: string[]
        deteriorating: string[]
        stable: string[]
    }
}

/**
 * Classificar estado do paciente
 */
export function classifyPatientState(context: PatientContext): StateClassification {
    logger.debug('StateClassifier', 'Iniciando classificação', {
        patientId: context.patientId
    })

    const indicators = {
        improving: [] as string[],
        deteriorating: [] as string[],
        stable: [] as string[]
    }

    // Analisar KPIs (últimos 3 valores para tendência)
    const recentKPIs = context.kpiHistory.slice(-3)

    if (recentKPIs.length >= 2) {
        recentKPIs.forEach(kpi => {
            if (kpi.trend === 'down' && kpi.type === 'creatinina') {
                indicators.improving.push('Creatinina em queda')
            } else if (kpi.trend === 'up' && kpi.type === 'creatinina') {
                indicators.deteriorating.push('Creatinina em alta')
            } else if (kpi.trend === 'up' && kpi.type === 'tfg') {
                indicators.improving.push('TFG melhorando')
            } else if (kpi.trend === 'down' && kpi.type === 'tfg') {
                indicators.deteriorating.push('TFG caindo')
            } else if (kpi.trend === 'stable') {
                indicators.stable.push(`${kpi.type} estável`)
            }
        })
    }

    // Analisar tempo sem mudanças
    if (context.timeContext.daysSinceLastChange > 90) {
        indicators.stable.push('Sem mudanças há 90+ dias')
    }

    // Determinar estado final
    let state: PatientState
    let confidence: ConfidenceLevel

    const improvingCount = indicators.improving.length
    const deterioratingCount = indicators.deteriorating.length
    const stableCount = indicators.stable.length

    if (deterioratingCount >= 2) {
        state = PatientState.DETERIORATING
        confidence = ConfidenceLevel.HIGH
    } else if (deterioratingCount === 1 && improvingCount === 0) {
        state = PatientState.DETERIORATING
        confidence = ConfidenceLevel.MEDIUM
    } else if (improvingCount >= 2) {
        state = PatientState.IMPROVING
        confidence = ConfidenceLevel.HIGH
    } else if (improvingCount === 1 && deterioratingCount === 0) {
        state = PatientState.IMPROVING
        confidence = ConfidenceLevel.MEDIUM
    } else if (stableCount >= 2 || (improvingCount === deterioratingCount)) {
        state = PatientState.STABLE
        confidence = ConfidenceLevel.HIGH
    } else {
        state = PatientState.STABLE
        confidence = ConfidenceLevel.LOW
    }

    // Caso crítico: múltiplos indicadores ruins
    if (deterioratingCount >= 3) {
        state = PatientState.CRITICAL
        confidence = ConfidenceLevel.VERY_HIGH
    }

    const reasoning = `Estado: ${state} com ${confidence} confiança. ${improvingCount} indicadores melhorando, ${deterioratingCount} deteriorando, ${stableCount} estáveis.`

    logger.info('StateClassifier', 'Classificação concluída', {
        state,
        confidence,
        improving: improvingCount,
        deteriorating: deterioratingCount,
        stable: stableCount
    })

    return {
        state,
        confidence,
        reasoning,
        indicators
    }
}
