/**
 * Clinical Governance Engine - Thresholds & Constants
 * 
 * Valores conservadores baseados em validação médica
 */

// ============================================================================
// CONFIDENCE THRESHOLDS (Conservador: 70%+)
// ============================================================================

export const CLINICAL_THRESHOLDS = {
    // Score mínimo para alertar médico
    MIN_CONFIDENCE_ALERT: 70,

    // Score mínimo para recomendar mudança
    MIN_CONFIDENCE_RECOMMEND: 75,

    // Score mínimo para urgência alta
    MIN_CONFIDENCE_URGENT: 80,

    // Mínimo de confluências (indicadores alinhados)
    MIN_CONFLUENCES: 2,

    // Bloquear qualquer ação abaixo deste score
    BLOCK_UNDER: 60
} as const

// ============================================================================
// EXHAUSTION DETECTION (Saturação Terapêutica)
// ============================================================================

export const EXHAUSTION_CRITERIA = {
    // Protocolo sem mudança > X dias
    DAYS_WITHOUT_CHANGE_WARNING: 60,
    DAYS_WITHOUT_CHANGE_ALERT: 90,

    // KPIs estáveis mas sem melhora > X dias
    DAYS_STABLE_NO_IMPROVEMENT: 30,

    // Número de ajustes sem resposta proporcional
    MAX_ADJUSTMENTS_WITHOUT_RESPONSE: 3,

    // Taxa mínima de melhora esperada
    MIN_IMPROVEMENT_RATE: 0.3 // 30%
} as const

// ============================================================================
// LEARNING SYSTEM
// ============================================================================

export const LEARNING_CONFIG = {
    // Mínimo de dias para aprender com um outcome
    MIN_DAYS_FOR_LEARNING: 30,

    // Taxa de sucesso para promover protocolo
    PROMOTION_THRESHOLD: 0.70, // 70%

    // Taxa de sucesso para desabilitar protocolo
    DEMOTION_THRESHOLD: 0.40, // 40%

    // Mínimo de casos para considerar válido
    MIN_CASES_FOR_PROMOTION: 10
} as const

// ============================================================================
// SIMILARITY ENGINE
// ============================================================================

export const SIMILARITY_CONFIG = {
    // Score mínimo de similaridade
    MIN_SIMILARITY_SCORE: 0.70, // 70% similar

    // Máximo de casos similares a retornar
    MAX_SIMILAR_CASES: 50,

    // Pesos para cálculo de similaridade
    WEIGHTS: {
        creatinina: 0.30,
        tfg: 0.30,
        age: 0.20,
        diagnosis: 0.20
    }
} as const

// ============================================================================
// CACHE TTL (Time To Live)
// ============================================================================

export const CACHE_TTL = {
    PATIENT_ANALYSIS: 5 * 60 * 1000,    // 5 minutos
    SIMILAR_CASES: 10 * 60 * 1000,      // 10 minutos
    PROTOCOL_MEMORY: 15 * 60 * 1000,    // 15 minutos
    CLINICAL_HISTORY: 2 * 60 * 1000     // 2 minutos
} as const

// ============================================================================
// MODE CONFIG (OBSERVE / ASSIST / RECOMMEND)
// ============================================================================

export const MODE_CONFIG = {
    OBSERVE: {
        allowAlert: false,
        allowRecommendation: false,
        description: 'Apenas monitora, sem alertas'
    },
    ASSIST: {
        allowAlert: true,
        allowRecommendation: false,
        description: 'Alertas habilitados, médico decide'
    },
    RECOMMEND: {
        allowAlert: true,
        allowRecommendation: true,
        description: 'Recomendações ativas'
    }
} as const

// ============================================================================
// CLINICAL WEIGHTS (Importância de cada indicador)
// ============================================================================

export const INDICATOR_WEIGHTS = {
    creatinina_rising: 25,
    tfg_falling: 25,
    proteinuria_positive: 20,
    multiple_adjustments: 20,
    days_without_improvement: 15,
    similar_cases_negative: 10
} as const
