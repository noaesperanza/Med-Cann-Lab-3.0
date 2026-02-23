/**
 * Clinical Governance Engine - Public API
 * 
 * Adaptive Clinical Decision Support System (ACDSS)
 * Baseado em TradeVision, adaptado para governança clínica
 * 
 * @module clinicalGovernance
 */

// Core
export { analyzePatientContext } from './core/analyzePatientContext'
export { classifyPatientState } from './core/stateClassifier'
export { detectTherapeuticExhaustion } from './core/exhaustionDetector'
export { calculateConfluences } from './core/confluenceCalculator'

// Learning
export { shouldLearnFromOutcome } from './learning/learningGuard'

// Utils
export { logger, getCached, setCache, clearCache } from './utils'
export * from './utils/thresholds'

// Types
export * from './types'
export * from './types/enums'
