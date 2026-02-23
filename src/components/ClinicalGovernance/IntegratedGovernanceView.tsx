import { useState, useEffect } from 'react'
import { Brain, Activity, Loader2, AlertCircle } from 'lucide-react'
import { useClinicalGovernance } from '../../hooks/useClinicalGovernance'
import { ContextAnalysisCard } from './ContextAnalysisCard'
import { mapPatientToContext } from '../../lib/clinicalGovernance/utils/patientMapper'
import { supabase } from '../../lib/supabase'
import type { PatientContext } from '../../lib/clinicalGovernance'

interface IntegratedGovernanceViewProps {
    patientId: string | null
}

export default function IntegratedGovernanceView({ patientId }: IntegratedGovernanceViewProps) {
    const [patientContext, setPatientContext] = useState<PatientContext | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!patientId) {
            setPatientContext(null)
            return
        }

        async function fetchPatientData() {
            setLoading(true)
            setError(null)
            try {
                // 1. Buscar Paciente + Avaliações + Prescrições
                const { data: patientData, error: patientError } = await supabase
                    .from('users')
                    .select(`
                        id, 
                        name, 
                        email,
                        assessments:clinical_assessments(*),
                        prescriptions:cfm_prescriptions(*)
                    `)
                    .eq('id', patientId!)
                    .single()

                if (patientError) throw patientError

                // 2. Mapear para o contexto da Engine ACDSS
                const context = mapPatientToContext(patientData)
                setPatientContext(context)
            } catch (err: any) {
                console.error('Error fetching clinical context:', err)
                setError('Erro ao carregar dados clínicos do paciente.')
            } finally {
                setLoading(false)
            }
        }

        fetchPatientData()
    }, [patientId])

    const { analysis, loading: analysisLoading } = useClinicalGovernance(patientContext, {
        specialty: 'cannabis' // Foco solicitado pelo usuário
    })

    if (!patientId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[450px] text-center p-20 bg-[#0b1120]">
                <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 shadow-lg shadow-purple-500/5">
                    <Brain className="w-10 h-10 text-purple-400 opacity-60" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Clinical Governance Engine</h3>
                <p className="text-slate-400 text-base max-w-sm mx-auto leading-relaxed opacity-70">
                    Selecione um paciente na lista lateral para gerar a análise de governança clínica (ACDSS) e apoio à decisão.
                </p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-500 p-8">
                <AlertCircle className="w-12 h-12 mb-4" />
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-[#0b1120]">
            {/* Optimized Centered Header - Compact Version */}
            <div className="flex flex-col items-center text-center space-y-4 py-4 border-b border-slate-700/50 mb-4 px-6">
                <div className="space-y-0.5">
                    <div className="flex items-center justify-center gap-2 mb-0.5">
                        <div className="p-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <Brain className="w-5 h-5 text-purple-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            Clinical Governance Engine
                        </h2>
                    </div>
                    <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                        Análise Cognitiva e Apoio à Decisão Clínica (ACDSS) baseada em evidências.
                    </p>
                </div>

                <div className="flex items-center p-0.5 bg-slate-900/50 rounded-full border border-slate-700 backdrop-blur-md">
                    <span className="px-4 py-1.5 text-[10px] uppercase font-bold tracking-wider text-purple-400 whitespace-nowrap">
                        Protocolo IA Regulatória
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6 custom-scrollbar w-full">
                <ContextAnalysisCard analysis={analysis} loading={analysisLoading} />

                {analysis && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-emerald-400" />
                                Status de Exaustão
                            </h4>
                            <div className="text-2xl font-bold text-white uppercase">
                                {analysis.exhaustionLevel}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-400" />
                                Risco Identificado
                            </h4>
                            <div className="text-2xl font-bold text-white uppercase">
                                {analysis.urgencyLevel}
                            </div>
                        </div>
                    </div>
                )}

                {!analysis && !analysisLoading && (
                    <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-8 text-center">
                        <p className="text-slate-400">Nenhum dado clínico suficiente para gerar análise ACDSS para este paciente.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
