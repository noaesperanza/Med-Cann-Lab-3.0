/**
 * Clinical Governance Engine - Learning Guard
 * 
 * CRÍTICO: Bloqueia aprendizado em estados estáveis
 * Previne overfitting e viés de confirmação
 */

import { PatientState } from '../types/enums'
import type { ClinicalOutcome } from '../types'
import { LEARNING_CONFIG } from '../utils/thresholds'
import { logger } from '../utils/logger'

/**
 * Determinar se deve aprender com este outcome
 * 
 * REGRA: NÃO aprender se paciente está STABLE
 */
export function shouldLearnFromOutcome(
    patientState: PatientState,
    outcome: ClinicalOutcome
): boolean {
    // ❌ NUNCA aprender com STABLE
    if (patientState === PatientState.STABLE) {
        logger.warn('LearningGuard', 'BLOQUEADO: Não aprende com estado STABLE', {
            state: patientState
        })
        return false
    }

    // ✅ Apenas aprender com mudanças validadas
    const validStates = [
        PatientState.IMPROVING,
        PatientState.DETERIORATING,
        PatientState.AT_LIMIT,
        PatientState.CRITICAL
    ]

    if (!validStates.includes(patientState)) {
        logger.warn('LearningGuard', 'BLOQUEADO: Estado inválido para aprendizado', {
            state: patientState
        })
        return false
    }

    // Tempo mínimo para causalidade
    if (outcome.daysElapsed < LEARNING_CONFIG.MIN_DAYS_FOR_LEARNING) {
        logger.warn('LearningGuard', 'BLOQUEADO: Tempo insuficiente', {
            daysElapsed: outcome.daysElapsed,
            minimum: LEARNING_CONFIG.MIN_DAYS_FOR_LEARNING
        })
        return false
    }

    // Outcome deve ser conhecido (não inferido)
    if (!outcome || typeof outcome.improved !== 'boolean') {
        logger.warn('LearningGuard', 'BLOQUEADO: Outcome desconhecido')
        return false
    }

    // ✅ APROVADO para aprendizado
    logger.info('LearningGuard', 'APROVADO: Sistema pode aprender', {
        state: patientState,
        daysElapsed: outcome.daysElapsed,
        improved: outcome.improved
    })

    return true
}
