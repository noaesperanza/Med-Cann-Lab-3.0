import React, { useState, useEffect } from 'react'
import { Brain, Check, X, MessageSquare, AlertCircle, ShieldCheck, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface CognitiveDecision {
    id: string
    decision_type: 'priority' | 'scheduling' | 'alert' | 'protocol'
    recommendation: any
    justification: string
    confidence: number
    autonomy_level: number
    created_at: string
    metadata?: any
}

export const DecisionFeedbackLoop: React.FC = () => {
    const [decisions, setDecisions] = useState<CognitiveDecision[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    useEffect(() => {
        fetchPendingDecisions()
    }, [])

    const fetchPendingDecisions = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('cognitive_decisions')
                .select('*')
                .is('human_feedback', null)
                .eq('requires_human_confirmation', true)
                .order('created_at', { ascending: false })
                .limit(5)

            if (error) throw error
            setDecisions((data || []).map(d => ({
                ...d,
                decision_type: d.decision_type as CognitiveDecision['decision_type'],
                justification: d.justification ?? '',
                confidence: d.confidence ?? 0,
                autonomy_level: d.autonomy_level ?? 0,
                created_at: d.created_at ?? new Date().toISOString()
            })))
        } catch (err) {
            console.error('❌ Erro ao buscar decisões cognitivas:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleFeedback = async (id: string, feedback: 'accepted' | 'rejected', notes?: string) => {
        try {
            setProcessingId(id)
            const { error } = await supabase
                .from('cognitive_decisions')
                .update({
                    human_feedback: feedback,
                    human_notes: notes,
                    requires_human_confirmation: false
                })
                .eq('id', id)

            if (error) throw error

            // Remover da lista local com animação (simulada por state)
            setDecisions(prev => prev.filter(d => d.id !== id))
        } catch (err) {
            console.error('❌ Erro ao salvar feedback:', err)
        } finally {
            setProcessingId(null)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center p-8 text-slate-400">
            <div className="animate-spin mr-3"><Brain size={20} /></div>
            <span>Sincronizando Jurisprudência Cognitiva...</span>
        </div>
    )

    if (decisions.length === 0) return null

    return (
        <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-[#00C16A] flex items-center tracking-wider uppercase">
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Fila de Calibração CCOS v2.0
                </h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {decisions.length} pendentes
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {decisions.map((decision) => (
                    <div
                        key={decision.id}
                        className="group relative bg-[#0A192F]/80 backdrop-blur-md border border-emerald-500/20 rounded-xl p-5 hover:border-emerald-500/40 transition-all duration-300"
                    >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded uppercase tracking-tighter border border-slate-700">
                                        {decision.decision_type}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                        {new Date(decision.created_at).toLocaleTimeString()}
                                    </span>
                                    <div className="flex items-center gap-1 ml-2">
                                        <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 transition-all"
                                                style={{ width: `${decision.confidence * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[9px] text-emerald-400/70 font-mono">
                                            {(decision.confidence * 100).toFixed(0)}% CONF
                                        </span>
                                    </div>
                                </div>

                                <p className="text-white text-sm font-medium mb-3 leading-relaxed">
                                    {decision.justification}
                                </p>

                                {decision.recommendation?.recommended_action && (
                                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 mb-4">
                                        <div className="text-[10px] text-[#00C16A] uppercase font-bold mb-1">Ação Sugerida</div>
                                        <div className="text-white text-xs font-mono">
                                            {decision.recommendation.recommended_action}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleFeedback(decision.id, 'rejected')}
                                    disabled={!!processingId}
                                    className="p-2.5 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors border border-slate-700"
                                    title="Rejeitar"
                                >
                                    <X size={18} />
                                </button>
                                <button
                                    onClick={() => handleFeedback(decision.id, 'accepted')}
                                    disabled={!!processingId}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/30 font-bold text-xs"
                                >
                                    {processingId === decision.id ? (
                                        <div className="animate-spin"><Brain size={14} /></div>
                                    ) : (
                                        <Check size={16} />
                                    )}
                                    VALIDAR DECISÃO
                                </button>
                            </div>
                        </div>

                        {/* Hover Decorator */}
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="text-emerald-500/30 w-4 h-4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
