/**
 * useClinicalGovernance Hook
 * 
 * Hook React para acessar análise de governança clínica
 */

import { useState, useEffect } from 'react'
import { analyzePatientContext } from '../lib/clinicalGovernance'
import type { ClinicalGovernanceOutput, PatientContext } from '../lib/clinicalGovernance'
import { ClinicalMode } from '../lib/clinicalGovernance'
import type { Specialty } from '../lib/clinicalGovernance/utils/specialtyConfigs'

interface UseClinicalGovernanceOptions {
    enabled?: boolean
    mode?: ClinicalMode
    specialty?: Specialty
}

export function useClinicalGovernance(
    patientContext: PatientContext | null,
    options: UseClinicalGovernanceOptions = {}
) {
    const { enabled = true, mode = ClinicalMode.ASSIST, specialty } = options

    const [analysis, setAnalysis] = useState<ClinicalGovernanceOutput | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!enabled || !patientContext) {
            setAnalysis(null)
            return
        }

        let cancelled = false

        async function runAnalysis() {
            try {
                setLoading(true)
                setError(null)

                const result = await analyzePatientContext(patientContext as PatientContext, mode, specialty)

                if (!cancelled) {
                    setAnalysis(result)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err : new Error('Erro desconhecido'))
                    setAnalysis(null)
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        runAnalysis()

        return () => {
            cancelled = true
        }
    }, [patientContext, enabled, mode, specialty])

    const refresh = async () => {
        if (!patientContext) return

        try {
            setLoading(true)
            setError(null)
            const result = await analyzePatientContext(patientContext, mode, specialty)
            setAnalysis(result)
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro desconhecido'))
        } finally {
            setLoading(false)
        }
    }

    return {
        analysis,
        loading,
        error,
        refresh
    }
}
