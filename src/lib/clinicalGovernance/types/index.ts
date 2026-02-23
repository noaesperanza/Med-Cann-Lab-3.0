/**
 * Clinical Governance Engine - Type Definitions
 * 
 * Interfaces principais do sistema ACDSS
 */

import {
    PatientState,
    ExhaustionLevel,
    RecommendationType,
    UrgencyLevel,
    ConfidenceLevel,
    ClinicalMode
} from './enums'

// ============================================================================
// INPUT TYPES
// ============================================================================

export interface PatientContext {
    patientId: string
    currentAssessment: ClinicalAssessment
    prescriptionHistory: Prescription[]
    kpiHistory: KPI[]
    timeContext: TimeContext
}

export interface ClinicalAssessment {
    id: string
    imreData: IMREData
    createdAt: Date
    professionalId: string
}

export interface IMREData {
    integrativa: any
    multidimensional: any
    renal: {
        creatinina: number
        tfg: number
        proteinuria: string
    }
    psiquiatria?: {
        ideacao_suicida?: boolean
    }
    existencial: any
}

export interface Prescription {
    id: string
    medications: any
    protocolType: string
    createdAt: Date
}

export interface KPI {
    type: string
    value: number
    date: Date
    trend?: 'up' | 'down' | 'stable'
}

export interface TimeContext {
    treatmentDuration: number  // dias
    lastModification: Date
    changeFrequency: number     // mudanças por mês
    daysSinceLastChange: number
}

// ============================================================================
// OUTPUT TYPES
// ============================================================================

export interface ClinicalGovernanceOutput {
    shouldAlert: boolean
    recommendation: RecommendationType
    reasoning: string
    confidence: number // 0-100
    state: PatientState
    exhaustionLevel: ExhaustionLevel
    urgencyLevel: UrgencyLevel
    confluences: Confluence[]
    contextualInsight: string
    suggestedActionWindow: number // dias
    isBlocked: boolean
    safeToIntervene: boolean
    metadata: AnalysisMetadata
}

export interface Confluence {
    indicator: string
    points: number
    reasoning: string
    weight: number
}

export interface AnalysisMetadata {
    analysisId: string
    timestamp: Date
    mode: ClinicalMode
    similarCasesCount: number
    cacheHit: boolean
    processingTimeMs: number
}

// ============================================================================
// LEARNING TYPES
// ============================================================================

export interface SimilarCase {
    patientId: string
    similarity: number // 0-1
    outcome: ClinicalOutcome
    successRate: number
    imreData: IMREData
}

export interface ClinicalOutcome {
    state: PatientState
    improved: boolean
    daysElapsed: number
    protocolUsed: string
}

export interface ProtocolMemory {
    id: string
    protocolName: string
    successRate: number
    totalCases: number
    confidence: ConfidenceLevel
    adaptiveWeight: number
    status: 'collecting' | 'promoted' | 'disabled'
}

// ============================================================================
// CACHE TYPES
// ============================================================================

export interface CacheEntry<T> {
    data: T
    timestamp: number
    ttl: number
}
