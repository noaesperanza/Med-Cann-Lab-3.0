/**
 * Clinical Governance Engine - Enums
 * 
 * Estados, níveis e classificações do sistema
 */

export enum PatientState {
    STABLE = 'STABLE',
    IMPROVING = 'IMPROVING',
    DETERIORATING = 'DETERIORATING',
    AT_LIMIT = 'AT_LIMIT',
    CRITICAL = 'CRITICAL'
}

export enum ExhaustionLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH'
}

export enum RecommendationType {
    MAINTAIN = 'MAINTAIN',
    MONITOR_CLOSELY = 'MONITOR_CLOSELY',
    CONSIDER_CHANGE = 'CONSIDER_CHANGE',
    URGENT_INTERVENTION = 'URGENT_INTERVENTION'
}

export enum UrgencyLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export enum ConfidenceLevel {
    VERY_LOW = 'VERY_LOW',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    VERY_HIGH = 'VERY_HIGH'
}

export enum ClinicalMode {
    OBSERVE = 'OBSERVE',    // Apenas monitora, sem alertas
    ASSIST = 'ASSIST',      // Alertas habilitados
    RECOMMEND = 'RECOMMEND' // Recomendações ativas
}
