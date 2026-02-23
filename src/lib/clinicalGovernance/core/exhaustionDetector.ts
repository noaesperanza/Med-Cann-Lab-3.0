/**
 * Clinical Governance Engine - Exhaustion Detector
 * 
 * Detecta saturação terapêutica (protocolo sem eficácia adicional)
 * CRÍTICO: Baseado no conceito de "exaustão de estratégia" do TradeVision
 */

import { ExhaustionLevel } from '../types/enums'
import type { PatientContext } from '../types'
import { EXHAUSTION_CRITERIA } from '../utils/thresholds'
import { logger } from '../utils/logger'

export interface ExhaustionAnalysis {
    level: ExhaustionLevel
    score: number // 0-100
    reasons: string[]
    recommendation: string
}

/**
 * Detectar saturação terapêutica
 */
export function detectTherapeuticExhaustion(context: PatientContext): ExhaustionAnalysis {
    logger.debug('ExhaustionDetector', 'Iniciando detecção', {
        patientId: context.patientId,
        daysSinceLastChange: context.timeContext.daysSinceLastChange
    })

    let exhaustionScore = 0
    const reasons: string[] = []

    // ============================================================================
    // CRITÉRIO 1: Protocolo sem mudança por muito tempo
    // ============================================================================
    const daysSinceChange = context.timeContext.daysSinceLastChange

    if (daysSinceChange > EXHAUSTION_CRITERIA.DAYS_WITHOUT_CHANGE_ALERT) {
        exhaustionScore += 30
        reasons.push(`Protocolo sem mudança há ${daysSinceChange} dias (alerta: ${EXHAUSTION_CRITERIA.DAYS_WITHOUT_CHANGE_ALERT}+ dias)`)
    } else if (daysSinceChange > EXHAUSTION_CRITERIA.DAYS_WITHOUT_CHANGE_WARNING) {
        exhaustionScore += 15
        reasons.push(`Protocolo sem mudança há ${daysSinceChange} dias (atenção: ${EXHAUSTION_CRITERIA.DAYS_WITHOUT_CHANGE_WARNING}+ dias)`)
    }

    // ============================================================================
    // CRITÉRIO 2: KPIs estáveis mas sem melhora
    // ============================================================================
    const recentKPIs = context.kpiHistory.slice(-3)
    let improvingKPIs = 0
    let stableKPIs = 0

    recentKPIs.forEach(kpi => {
        if (kpi.trend === 'up' && kpi.type !== 'creatinina') improvingKPIs++ // TFG subindo é bom
        if (kpi.trend === 'down' && kpi.type === 'creatinina') improvingKPIs++ // Creatinina caindo é bom
        if (kpi.trend === 'stable') stableKPIs++
    })

    if (stableKPIs >= 2 && improvingKPIs === 0 && daysSinceChange > EXHAUSTION_CRITERIA.DAYS_STABLE_NO_IMPROVEMENT) {
        exhaustionScore += 25
        reasons.push(`KPIs estáveis mas sem melhora há ${daysSinceChange} dias`)
    }

    // ============================================================================
    // CRITÉRIO 3: Múltiplos ajustes sem resposta proporcional
    // ============================================================================
    const adjustmentsCount = context.prescriptionHistory.length
    const treatmentDuration = context.timeContext.treatmentDuration

    // Calcular taxa de ajustes
    const adjustmentsPerMonth = adjustmentsCount / (treatmentDuration / 30)

    if (adjustmentsCount >= EXHAUSTION_CRITERIA.MAX_ADJUSTMENTS_WITHOUT_RESPONSE) {
        // Verificar se houve melhora proporcional
        // (Simplificado: se KPIs não melhoraram mas ajustes > 3)
        if (improvingKPIs < adjustmentsCount * EXHAUSTION_CRITERIA.MIN_IMPROVEMENT_RATE) {
            exhaustionScore += 25
            reasons.push(`${adjustmentsCount} ajustes sem melhora proporcional (mínimo esperado: ${EXHAUSTION_CRITERIA.MIN_IMPROVEMENT_RATE * 100}%)`)
        }
    }

    // ============================================================================
    // CRITÉRIO 4: Taxa de mudança excessiva (mudanças muito frequentes)
    // ============================================================================
    if (adjustmentsPerMonth > 2) {
        exhaustionScore += 20
        reasons.push(`Taxa de mudança excessiva: ${adjustmentsPerMonth.toFixed(1)} ajustes/mês`)
    }

    // ============================================================================
    // DETERMINAR NÍVEL DE EXAUSTÃO
    // ============================================================================
    let level: ExhaustionLevel
    let recommendation: string

    if (exhaustionScore >= 50) {
        level = ExhaustionLevel.HIGH
        recommendation = 'Saturação terapêutica ALTA - Considerar mudança de estratégia'
    } else if (exhaustionScore >= 30) {
        level = ExhaustionLevel.MEDIUM
        recommendation = 'Saturação MÉDIA - Avaliar benefício de continuar protocolo atual'
    } else {
        level = ExhaustionLevel.LOW
        recommendation = 'Sem sinais de saturação - Protocolo pode ser mantido'
    }

    logger.info('ExhaustionDetector', 'Detecção concluída', {
        level,
        score: exhaustionScore,
        reasonsCount: reasons.length
    })

    return {
        level,
        score: exhaustionScore,
        reasons,
        recommendation
    }
}
