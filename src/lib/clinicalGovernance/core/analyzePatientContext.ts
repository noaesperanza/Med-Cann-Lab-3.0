/**
 * Clinical Governance Engine - Analyze Patient Context (CORE)
 * 
 * Adaptado de analyzePatternIntelligently (TradeVision)
 * Este é o MOTOR PRINCIPAL do sistema ACDSS
 */

import type { PatientContext, ClinicalGovernanceOutput } from '../types'
import { PatientState, RecommendationType, UrgencyLevel, ClinicalMode } from '../types/enums'
import type { Specialty } from '../utils/specialtyConfigs'
import { classifyPatientState } from './stateClassifier'
import { detectTherapeuticExhaustion } from './exhaustionDetector'
import { calculateConfluences } from './confluenceCalculator'
import { CLINICAL_THRESHOLDS, MODE_CONFIG } from '../utils/thresholds'
import { logger } from '../utils/logger'
import { getCached, setCache } from '../utils/cacheManager'

/**
 * FUNÇÃO PRINCIPAL: Analisa contexto clínico do paciente
 * 
 * @param context - Contexto do paciente
 * @param mode - Modo de operação (OBSERVE/ASSIST/RECOMMEND)
 * @param specialty - Especialidade do profissional (opcional)
 */
export async function analyzePatientContext(
    context: PatientContext,
    mode: ClinicalMode = ClinicalMode.ASSIST,
    specialty?: Specialty
): Promise<ClinicalGovernanceOutput> {
    const startTime = Date.now()

    logger.info('AnalyzePatientContext', 'Iniciando análise', {
        patientId: context.patientId,
        mode,
        specialty: specialty || 'geral'
    })

    // Verificar cache
    const cacheKey = `analysis_${context.patientId}_${context.currentAssessment.id}`
    const cached = getCached<ClinicalGovernanceOutput>(cacheKey)
    if (cached) {
        logger.info('AnalyzePatientContext', 'Retornando do cache')
        return cached
    }

    // ============================================================================
    // PASSO 1: Classificar Estado
    // ============================================================================
    const stateClassification = classifyPatientState(context)

    // ============================================================================
    // PASSO 2: Detectar Exaustão
    // ============================================================================
    const exhaustionAnalysis = detectTherapeuticExhaustion(context)

    // ============================================================================
    // PASSO 3: Calcular Confluências (com especialidade)
    // ============================================================================
    const { confluences, totalScore } = calculateConfluences(context, specialty)

    // ============================================================================
    // PASSO 4: Determinar Recomendação
    // ============================================================================
    let recommendation: RecommendationType
    let urgencyLevel: UrgencyLevel
    let shouldAlert = false

    const confidence = totalScore

    // Guard Rails
    const isBlocked = confidence < CLINICAL_THRESHOLDS.BLOCK_UNDER
    const safeToIntervene =
        confidence >= CLINICAL_THRESHOLDS.MIN_CONFIDENCE_ALERT &&
        confluences.length >= CLINICAL_THRESHOLDS.MIN_CONFLUENCES &&
        !isBlocked

    // Determinar recomendação baseada em score e estado
    if (safeToIntervene && confidence >= CLINICAL_THRESHOLDS.MIN_CONFIDENCE_URGENT) {
        recommendation = RecommendationType.URGENT_INTERVENTION
        urgencyLevel = UrgencyLevel.CRITICAL
        shouldAlert = true
    } else if (safeToIntervene && confidence >= CLINICAL_THRESHOLDS.MIN_CONFIDENCE_RECOMMEND) {
        recommendation = RecommendationType.CONSIDER_CHANGE
        urgencyLevel = UrgencyLevel.HIGH
        shouldAlert = true
    } else if (confidence >= CLINICAL_THRESHOLDS.MIN_CONFIDENCE_ALERT) {
        recommendation = RecommendationType.MONITOR_CLOSELY
        urgencyLevel = UrgencyLevel.MEDIUM
        shouldAlert = MODE_CONFIG[mode].allowAlert
    } else {
        recommendation = RecommendationType.MAINTAIN
        urgencyLevel = UrgencyLevel.LOW
        shouldAlert = false
    }

    // Ajustar baseado em modo
    if (!MODE_CONFIG[mode].allowAlert) {
        shouldAlert = false
    }

    // ============================================================================
    // PASSO 5: Gerar Output
    // ============================================================================
    const output: ClinicalGovernanceOutput = {
        shouldAlert,
        recommendation,
        reasoning: `Análise clínica: ${confluences.length} confluências detectadas, score ${confidence.toFixed(0)}%. Estado: ${stateClassification.state}. ${safeToIntervene ? '✅ Intervenção segura' : '⚠️ Aguardar mais dados'}.`,
        confidence,
        state: stateClassification.state,
        exhaustionLevel: exhaustionAnalysis.level,
        urgencyLevel,
        confluences,
        contextualInsight: `${stateClassification.reasoning}. ${exhaustionAnalysis.recommendation}`,
        suggestedActionWindow: urgencyLevel === UrgencyLevel.CRITICAL ? 7 : urgencyLevel === UrgencyLevel.HIGH ? 14 : 30,
        isBlocked,
        safeToIntervene,
        metadata: {
            analysisId: `analysis_${context.patientId}_${Date.now()}`,
            timestamp: new Date(),
            mode,
            similarCasesCount: 0, // TODO: Implementar depois
            cacheHit: false,
            processingTimeMs: Date.now() - startTime
        }
    }

    // Salvar em cache
    setCache(cacheKey, output)

    logger.info('AnalyzePatientContext', 'Análise concluída', {
        shouldAlert: output.shouldAlert,
        confidence: output.confidence.toFixed(0),
        state: output.state,
        processingTimeMs: output.metadata.processingTimeMs
    })

    return output
}
