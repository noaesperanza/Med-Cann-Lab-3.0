/**
 * Clinical Governance Context
 * 
 * Provider para análises de governança clínica
 */

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { ClinicalGovernanceOutput } from '../lib/clinicalGovernance'
import { ClinicalMode } from '../lib/clinicalGovernance'

interface ClinicalGovernanceContextValue {
    mode: ClinicalMode
    setMode: (mode: ClinicalMode) => void
    analysisCache: Map<string, ClinicalGovernanceOutput>
    cacheAnalysis: (patientId: string, analysis: ClinicalGovernanceOutput) => void
    getCachedAnalysis: (patientId: string) => ClinicalGovernanceOutput | null
    clearCache: () => void
}

const ClinicalGovernanceContext = createContext<ClinicalGovernanceContextValue | null>(null)

export function ClinicalGovernanceProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<ClinicalMode>(ClinicalMode.ASSIST)
    const [analysisCache] = useState(() => new Map<string, ClinicalGovernanceOutput>())

    const cacheAnalysis = useCallback((patientId: string, analysis: ClinicalGovernanceOutput) => {
        analysisCache.set(patientId, analysis)
    }, [analysisCache])

    const getCachedAnalysis = useCallback((patientId: string) => {
        return analysisCache.get(patientId) || null
    }, [analysisCache])

    const clearCache = useCallback(() => {
        analysisCache.clear()
    }, [analysisCache])

    return (
        <ClinicalGovernanceContext.Provider
            value={{
                mode,
                setMode,
                analysisCache,
                cacheAnalysis,
                getCachedAnalysis,
                clearCache
            }}
        >
            {children}
        </ClinicalGovernanceContext.Provider>
    )
}

export function useClinicalGovernanceContext() {
    const context = useContext(ClinicalGovernanceContext)
    if (!context) {
        throw new Error('useClinicalGovernanceContext must be used within ClinicalGovernanceProvider')
    }
    return context
}
