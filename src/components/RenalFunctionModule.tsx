/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MÓDULO DE FUNÇÃO RENAL — MedCannLab 3.0
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * UI completa com:
 *  • Calculadora eGFR (CKD-EPI 2021) com preview em tempo real
 *  • Classificação Albuminúria (A1-A3)
 *  • Mapa de Risco KDIGO (Heat Map CGA interativo)
 *  • KFRE (Kidney Failure Risk Equation)
 *  • Avaliação de Fatores de Risco ("The Burden of CKD")
 *  • Histórico de exames com tendência eGFR
 *  • Registro de novos exames no Supabase
 */

import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import {
    calculateEGFR,
    classifyStage,
    classifyAlbuminuria,
    calculateKDIGORisk,
    calculateKFRE,
    assessRiskFactors,
    analyzeEGFRTrend,
    getStageDescription,
    getFullKDIGORiskMap,
    type RenalRiskFactors,
    type GFRStage,
    type AlbuminuriaStage,
    type KDIGORiskLevel,
} from '../lib/renalCalculations'
import {
    Activity,
    Save,
    TrendingUp,
    TrendingDown,
    History,
    Info,
    AlertTriangle,
    CheckCircle,
    ShieldAlert,
    Heart,
    Droplet,
    ChevronRight,
    BarChart3,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface RenalExam {
    id: string
    exam_date: string
    creatinine: number
    urea: number
    egfr: number
    drc_stage: string
    acr?: number
    alb_stage?: string
}

interface RenalFunctionModuleProps {
    patientId?: string
    patientAge?: number
    patientGender?: 'male' | 'female'
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Small colored badge */
const RiskBadge = ({ level }: { level: string }) => {
    const colorMap: Record<string, string> = {
        low: 'bg-green-500/20 text-green-300 border-green-500/30',
        moderate: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        'very-high': 'bg-red-500/20 text-red-300 border-red-500/30',
        highest: 'bg-red-900/40 text-red-200 border-red-700/50',
    }
    const labelMap: Record<string, string> = {
        low: 'Baixo',
        moderate: 'Moderado',
        high: 'Alto',
        'very-high': 'Muito Alto',
        highest: 'Altíssimo',
    }
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${colorMap[level] || colorMap.low}`}>
            {labelMap[level] || level}
        </span>
    )
}

/** KDIGO Heat Map grid */
const KDIGOHeatMap = ({ currentG, currentA }: { currentG?: GFRStage; currentA?: AlbuminuriaStage }) => {
    const map = getFullKDIGORiskMap()
    const gfrLabels: { stage: GFRStage; label: string }[] = [
        { stage: 'G1', label: 'G1 ≥90' },
        { stage: 'G2', label: 'G2 60-89' },
        { stage: 'G3a', label: 'G3a 45-59' },
        { stage: 'G3b', label: 'G3b 30-44' },
        { stage: 'G4', label: 'G4 15-29' },
        { stage: 'G5', label: 'G5 <15' },
    ]
    const albLabels: { stage: AlbuminuriaStage; label: string }[] = [
        { stage: 'A1', label: 'A1 <30' },
        { stage: 'A2', label: 'A2 30-299' },
        { stage: 'A3', label: 'A3 ≥300' },
    ]

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
                <thead>
                    <tr>
                        <th className="p-2 text-slate-400 text-left border-b border-slate-700">
                            <span className="flex items-center gap-1"><Droplet className="w-3 h-3" /> eGFR ↓ / RAC →</span>
                        </th>
                        {albLabels.map(a => (
                            <th key={a.stage} className={`p-2 text-center border-b border-slate-700 font-bold ${currentA === a.stage ? 'text-white bg-slate-700/50' : 'text-slate-400'}`}>
                                {a.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {gfrLabels.map(g => (
                        <tr key={g.stage}>
                            <td className={`p-2 font-bold border-b border-slate-700/50 ${currentG === g.stage ? 'text-white bg-slate-700/50' : 'text-slate-400'}`}>
                                {g.label}
                            </td>
                            {albLabels.map(a => {
                                const cell = map.find(c => c.gfr === g.stage && c.alb === a.stage)!
                                const isCurrent = currentG === g.stage && currentA === a.stage
                                return (
                                    <td
                                        key={`${g.stage}-${a.stage}`}
                                        className={`p-2 text-center border-b border-slate-700/50 font-semibold transition-all ${isCurrent ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 scale-105 z-10' : ''}`}
                                        style={{
                                            backgroundColor: cell.risk.color + (isCurrent ? '' : '33'),
                                            color: isCurrent ? '#fff' : cell.risk.color,
                                        }}
                                    >
                                        {cell.risk.label.replace('Risco ', '')}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

/** Risk Factor Checklist */
const RiskFactorChecklist = ({
    factors,
    onChange,
}: {
    factors: RenalRiskFactors
    onChange: (factors: RenalRiskFactors) => void
}) => {
    const items: { key: keyof RenalRiskFactors; label: string; icon: string }[] = [
        { key: 'diabetes', label: 'Diabetes mellitus', icon: '🩸' },
        { key: 'hypertension', label: 'Hipertensão arterial', icon: '💓' },
        { key: 'cardiovascularDisease', label: 'Doença cardiovascular', icon: '❤️' },
        { key: 'obesity', label: 'Obesidade (IMC ≥ 30)', icon: '⚖️' },
        { key: 'smoking', label: 'Tabagismo', icon: '🚬' },
        { key: 'familyHistoryCKD', label: 'História familiar de DRC', icon: '👨‍👩‍👧' },
        { key: 'historyAKI', label: 'Histórico de LRA/IRA', icon: '🏥' },
        { key: 'nephrotoxicMeds', label: 'Medicamentos nefrotóxicos', icon: '💊' },
        { key: 'autoimmune', label: 'Doença autoimune', icon: '🛡️' },
        { key: 'ageOver60', label: 'Idade > 60 anos', icon: '👴' },
    ]

    const toggle = (key: keyof RenalRiskFactors) => {
        onChange({ ...factors, [key]: !factors[key] })
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {items.map(item => (
                <button
                    key={item.key}
                    onClick={() => toggle(item.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left ${factors[item.key]
                        ? 'bg-red-500/15 border-red-500/40 text-red-300'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                >
                    <span className="text-sm">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {factors[item.key] && <CheckCircle className="w-3.5 h-3.5 text-red-400" />}
                </button>
            ))}
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const RenalFunctionModule: React.FC<RenalFunctionModuleProps> = ({
    patientId,
    patientAge = 40,
    patientGender = 'male',
}) => {
    // ─── State ──────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false)
    const [exams, setExams] = useState<RenalExam[]>([])
    const [activeTab, setActiveTab] = useState<'calculator' | 'riskmap' | 'factors' | 'history'>('calculator')

    // Form
    const [creatinine, setCreatinine] = useState('')
    const [urea, setUrea] = useState('')
    const [acr, setAcr] = useState('')
    const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0])

    // Risk Factors
    const [riskFactors, setRiskFactors] = useState<RenalRiskFactors>({
        diabetes: false,
        hypertension: false,
        cardiovascularDisease: false,
        obesity: false,
        smoking: false,
        familyHistoryCKD: false,
        historyAKI: false,
        nephrotoxicMeds: false,
        autoimmune: false,
        ageOver60: patientAge > 60,
    })

    // ─── Computed ───────────────────────────────────────────────────────────
    const previewEgfr = useMemo(() => {
        const val = parseFloat(creatinine)
        if (isNaN(val) || val <= 0) return null
        return calculateEGFR({ creatinine: val, age: patientAge, sex: patientGender })
    }, [creatinine, patientAge, patientGender])

    const previewGStage = previewEgfr ? classifyStage(previewEgfr) : null
    const previewAStage = useMemo(() => {
        const val = parseFloat(acr)
        if (isNaN(val) || val < 0) return null
        return classifyAlbuminuria(val)
    }, [acr])

    const kdigoRisk = previewGStage && previewAStage
        ? calculateKDIGORisk(previewGStage, previewAStage.stage)
        : null

    const kfre = previewEgfr && previewEgfr < 60 && previewAStage
        ? calculateKFRE(patientAge, patientGender, previewEgfr, previewAStage.acr)
        : null

    const riskAssessment = useMemo(() => assessRiskFactors(riskFactors), [riskFactors])

    const egfrTrend = useMemo(() => {
        if (exams.length < 2) return null
        return analyzeEGFRTrend(exams.map(e => ({ date: new Date(e.exam_date), egfr: e.egfr })))
    }, [exams])

    // ─── Effects ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (patientId) {
            loadExams()
        } else {
            setExams([])
        }
    }, [patientId])

    // ─── Data ───────────────────────────────────────────────────────────────
    const loadExams = async () => {
        if (!patientId) return
        try {
            const { data, error } = await (supabase as any)
                .from('renal_exams')
                .select('*')
                .eq('patient_id', patientId)
                .order('exam_date', { ascending: false })

            if (error) throw error
            setExams(
                (data || []).map((e: any) => ({
                    id: e.id,
                    exam_date: e.exam_date,
                    creatinine: e.creatinine ?? 0,
                    urea: e.urea ?? 0,
                    egfr: e.egfr ?? 0,
                    drc_stage: e.drc_stage ?? '',
                    acr: e.acr ?? undefined,
                    alb_stage: e.alb_stage ?? undefined,
                }))
            )
        } catch (err) {
            console.error('Error loading renal exams:', err)
        }
    }

    const handleSave = async () => {
        if (!creatinine || !previewEgfr || !patientId) return
        setLoading(true)
        try {
            const stage = classifyStage(previewEgfr)
            const acrVal = parseFloat(acr)
            const albStage = !isNaN(acrVal) ? classifyAlbuminuria(acrVal).stage : undefined

            const record: Record<string, unknown> = {
                patient_id: patientId,
                exam_date: examDate,
                creatinine: parseFloat(creatinine),
                urea: parseFloat(urea) || 0,
                egfr: previewEgfr,
                drc_stage: stage,
                created_at: new Date().toISOString(),
            }

            if (!isNaN(acrVal)) {
                record.acr = acrVal
                record.alb_stage = albStage
            }

            const { error } = await (supabase as any).from('renal_exams').insert(record)
            if (error) throw error

            setCreatinine('')
            setUrea('')
            setAcr('')
            loadExams()
        } catch (err) {
            console.error('Error saving exam:', err)
            alert('Erro ao salvar exame. Verifique se a tabela renal_exams existe no Supabase.')
        } finally {
            setLoading(false)
        }
    }

    const getStageColor = (stage: string) => {
        if (['G1', 'G2'].includes(stage)) return 'bg-green-900/40 text-green-300 border-green-800'
        if (['G3a', 'G3b'].includes(stage)) return 'bg-yellow-900/40 text-yellow-300 border-yellow-800'
        return 'bg-red-900/40 text-red-300 border-red-800'
    }

    // ─── Empty State ────────────────────────────────────────────────────────
    if (!patientId) {
        return (
            <div className="bg-[#0f172a] rounded-xl border border-slate-700/50 p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                    <Activity className="w-10 h-10 text-emerald-400 opacity-60" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Módulo de Função Renal</h3>
                <p className="text-slate-400 text-base max-w-sm mx-auto leading-relaxed opacity-70">
                    Selecione um paciente para acessar a avaliação completa de risco renal (KDIGO + KFRE + Burden of CKD).
                </p>
            </div>
        )
    }

    // ─── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="bg-[#0B1120] rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
            {/* ── Header ── */}
            <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-b border-slate-700/50 px-6 py-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                            <Activity className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Avaliação Renal Completa</h2>
                            <p className="text-slate-400 text-xs">CKD-EPI 2021 • KDIGO CGA • KFRE • Burden of CKD</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {(['calculator', 'riskmap', 'factors', 'history'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === tab
                                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                {tab === 'calculator' && '🧮 Calculadora'}
                                {tab === 'riskmap' && '🗺️ Mapa KDIGO'}
                                {tab === 'factors' && '⚠️ Fatores de Risco'}
                                {tab === 'history' && '📊 Histórico'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* ════════════════ TAB: CALCULADORA ════════════════ */}
                {activeTab === 'calculator' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Input */}
                        <div className="space-y-5">
                            <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
                                <TrendingUp className="w-4 h-4 text-cyan-400" /> Novo Registro de Exame
                            </h4>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Creatinina (mg/dL)
                                    </label>
                                    <input
                                        type="number" step="0.01" value={creatinine}
                                        onChange={e => setCreatinine(e.target.value)}
                                        className="w-full bg-slate-800 rounded-lg border border-slate-700 text-sm text-white px-3 py-2.5 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-600"
                                        placeholder="0.9"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        Ureia (mg/dL)
                                    </label>
                                    <input
                                        type="number" value={urea}
                                        onChange={e => setUrea(e.target.value)}
                                        className="w-full bg-slate-800 rounded-lg border border-slate-700 text-sm text-white px-3 py-2.5 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-600"
                                        placeholder="35"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                        RAC (mg/g)
                                    </label>
                                    <input
                                        type="number" value={acr}
                                        onChange={e => setAcr(e.target.value)}
                                        className="w-full bg-slate-800 rounded-lg border border-slate-700 text-sm text-white px-3 py-2.5 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 placeholder-slate-600"
                                        placeholder="15"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                    Data do Exame
                                </label>
                                <input
                                    type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
                                    className="w-full bg-slate-800 rounded-lg border border-slate-700 text-sm text-white px-3 py-2.5 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                                />
                            </div>

                            {/* Preview Result Card */}
                            {previewEgfr && (
                                <div className={`rounded-xl border p-5 space-y-4 ${previewEgfr >= 60
                                    ? 'bg-green-900/10 border-green-800/50'
                                    : previewEgfr >= 30
                                        ? 'bg-yellow-900/10 border-yellow-800/50'
                                        : 'bg-red-900/10 border-red-800/50'
                                    }`}>
                                    {/* eGFR */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">eTFG Estimada</p>
                                            <div className="text-3xl font-black text-white mt-1">
                                                {previewEgfr} <span className="text-sm font-normal text-slate-400">mL/min/1.73m²</span>
                                            </div>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStageColor(previewGStage!)}`}>
                                                {previewGStage}
                                            </span>
                                            {previewAStage && (
                                                <span className={`block px-3 py-1 rounded-full text-xs font-bold ${previewAStage.stage === 'A1' ? 'bg-green-900/40 text-green-300 border-green-800' :
                                                    previewAStage.stage === 'A2' ? 'bg-yellow-900/40 text-yellow-300 border-yellow-800' :
                                                        'bg-red-900/40 text-red-300 border-red-800'
                                                    }`}>
                                                    {previewAStage.stage}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* GFR Description */}
                                    <div className="text-xs text-slate-300">
                                        <strong className="text-slate-200">Estágio {previewGStage}:</strong> {getStageDescription(previewGStage!).desc}
                                        <br />
                                        <span className="text-slate-400">{getStageDescription(previewGStage!).action}</span>
                                    </div>

                                    {/* Albuminuria Description */}
                                    {previewAStage && (
                                        <div className="text-xs text-slate-300 pt-2 border-t border-slate-700/50">
                                            <strong className="text-slate-200">Albuminúria {previewAStage.stage}:</strong> {previewAStage.description}
                                        </div>
                                    )}

                                    {/* KDIGO Risk */}
                                    {kdigoRisk && (
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: kdigoRisk.color }} />
                                                <span className="text-xs font-bold text-white">{kdigoRisk.label}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400">{kdigoRisk.monitoringFrequency}</span>
                                        </div>
                                    )}

                                    {/* KFRE */}
                                    {kfre && (
                                        <div className="pt-2 border-t border-slate-700/50">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                KFRE — Risco de Falência Renal
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                                                    <div className="text-xl font-black text-white">{kfre.risk2Year}%</div>
                                                    <div className="text-[10px] text-slate-400">2 anos</div>
                                                </div>
                                                <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                                                    <div className="text-xl font-black text-white">{kfre.risk5Year}%</div>
                                                    <div className="text-[10px] text-slate-400">5 anos</div>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-2">{kfre.interpretation}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={handleSave}
                                disabled={!creatinine || loading}
                                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                            >
                                {loading ? 'Salvando...' : <><Save className="w-4 h-4" /> Registrar Exame</>}
                            </button>
                        </div>

                        {/* Right: Quick History + Trend */}
                        <div className="space-y-5">
                            {/* Trend Card */}
                            {egfrTrend && egfrTrend.trend !== 'insufficient-data' && (
                                <div className={`rounded-xl border p-4 ${egfrTrend.isRapidDecline
                                    ? 'bg-red-900/15 border-red-800/50'
                                    : egfrTrend.trend === 'improving'
                                        ? 'bg-green-900/15 border-green-800/50'
                                        : 'bg-slate-800/50 border-slate-700'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {egfrTrend.deltaPerYear > 0
                                            ? <TrendingUp className="w-4 h-4 text-green-400" />
                                            : <TrendingDown className="w-4 h-4 text-red-400" />
                                        }
                                        <span className="text-xs font-bold text-white">Tendência eGFR</span>
                                    </div>
                                    <div className="text-2xl font-black text-white">
                                        {egfrTrend.deltaPerYear > 0 ? '+' : ''}{egfrTrend.deltaPerYear}
                                        <span className="text-sm font-normal text-slate-400"> mL/min/ano</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">{egfrTrend.interpretation}</p>
                                </div>
                            )}

                            {/* Recent Exams */}
                            <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
                                <History className="w-4 h-4 text-cyan-400" /> Últimos Exames
                            </h4>

                            {exams.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <Info className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Nenhum exame registrado</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                    {exams.slice(0, 10).map(exam => (
                                        <div key={exam.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/60 transition-colors">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-mono">
                                                    {new Date(exam.exam_date).toLocaleDateString('pt-BR')}
                                                </p>
                                                <p className="text-sm font-medium text-white">
                                                    Cr: {exam.creatinine} <span className="text-slate-600">|</span> eTFG: {exam.egfr}
                                                    {exam.acr != null && <span className="text-slate-600"> | RAC: {exam.acr}</span>}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-[10px] px-2 py-1 rounded font-bold border ${getStageColor(exam.drc_stage)}`}>
                                                    {exam.drc_stage}
                                                </span>
                                                {exam.alb_stage && (
                                                    <span className={`text-[10px] px-2 py-1 rounded font-bold border ${exam.alb_stage === 'A1' ? 'bg-green-900/40 text-green-300 border-green-800' :
                                                        exam.alb_stage === 'A2' ? 'bg-yellow-900/40 text-yellow-300 border-yellow-800' :
                                                            'bg-red-900/40 text-red-300 border-red-800'
                                                        }`}>
                                                        {exam.alb_stage}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ════════════════ TAB: MAPA KDIGO ════════════════ */}
                {activeTab === 'riskmap' && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-white flex items-center gap-2 text-sm mb-2">
                                <BarChart3 className="w-4 h-4 text-cyan-400" /> Mapa de Risco CGA — KDIGO 2024
                            </h4>
                            <p className="text-xs text-slate-400 mb-4">
                                Classificação de prognóstico baseada na combinação Causa (C) + Taxa de Filtração Glomerular (G) + Albuminúria (A).
                                A posição atual do paciente é destacada na grade.
                            </p>
                        </div>

                        <KDIGOHeatMap
                            currentG={previewGStage || (exams.length > 0 ? exams[0].drc_stage as GFRStage : undefined)}
                            currentA={previewAStage?.stage || (exams.length > 0 && exams[0].alb_stage ? exams[0].alb_stage as AlbuminuriaStage : undefined)}
                        />

                        {kdigoRisk && (
                            <div className="rounded-xl border p-5 space-y-3" style={{ borderColor: kdigoRisk.color + '66', backgroundColor: kdigoRisk.color + '0D' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: kdigoRisk.color }} />
                                    <span className="text-lg font-bold text-white">{kdigoRisk.label}</span>
                                    <RiskBadge level={kdigoRisk.riskLevel} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                                    <div className="flex items-start gap-2">
                                        <ChevronRight className="w-3 h-3 mt-0.5 text-slate-500" />
                                        <span><strong>Monitoramento:</strong> {kdigoRisk.monitoringFrequency}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <ChevronRight className="w-3 h-3 mt-0.5 text-slate-500" />
                                        <span><strong>Nefrologista:</strong> {kdigoRisk.needsNephrologyReferral ? '✅ Indicado' : '❌ Não necessário'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                            <p className="text-[10px] text-slate-500">
                                <strong>Referência:</strong> KDIGO 2024 Clinical Practice Guideline for the Evaluation and Management of Chronic Kidney Disease.
                                Kidney Int Suppl. 2024;14(4):e1-e314.
                            </p>
                        </div>
                    </div>
                )}

                {/* ════════════════ TAB: FATORES DE RISCO ════════════════ */}
                {activeTab === 'factors' && (
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-white flex items-center gap-2 text-sm mb-2">
                                <ShieldAlert className="w-4 h-4 text-amber-400" /> Avaliação de Fatores de Risco para DRC
                            </h4>
                            <p className="text-xs text-slate-400 mb-4">
                                Baseado em: <em>"The Burden of Chronic Kidney Disease"</em> — Jha V et al., The Lancet 2013;382(9888):260-272.
                                Selecione os fatores presentes para calcular o escore de risco.
                            </p>
                        </div>

                        <RiskFactorChecklist factors={riskFactors} onChange={setRiskFactors} />

                        {/* Assessment Result */}
                        <div className={`rounded-xl border p-5 space-y-3 ${riskAssessment.riskScore === 'low' ? 'bg-green-900/10 border-green-800/40' :
                            riskAssessment.riskScore === 'moderate' ? 'bg-yellow-900/10 border-yellow-800/40' :
                                riskAssessment.riskScore === 'high' ? 'bg-orange-900/10 border-orange-800/40' :
                                    'bg-red-900/10 border-red-800/40'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-white" />
                                    <span className="text-lg font-bold text-white">Resultado</span>
                                </div>
                                <RiskBadge level={riskAssessment.riskScore} />
                            </div>

                            <div className="text-xs text-slate-300">
                                <strong>Fatores ativos:</strong> {riskAssessment.totalFactors} de 10
                                {riskAssessment.activeFactors.length > 0 && (
                                    <span className="text-slate-400"> — {riskAssessment.activeFactors.join(', ')}</span>
                                )}
                            </div>

                            <div className="text-xs text-slate-300 pt-2 border-t border-slate-700/50">
                                <strong>Recomendação:</strong> {riskAssessment.recommendation}
                            </div>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                            <p className="text-[10px] text-slate-500">
                                <strong>Referências:</strong> Jha V et al. The Lancet 2013;382(9888):260-272 • KDIGO 2024 CKD Guideline • ISN Global Kidney Health Atlas.
                            </p>
                        </div>
                    </div>
                )}

                {/* ════════════════ TAB: HISTÓRICO ════════════════ */}
                {activeTab === 'history' && (
                    <div className="space-y-6">
                        <h4 className="font-semibold text-white flex items-center gap-2 text-sm">
                            <History className="w-4 h-4 text-cyan-400" /> Histórico Completo de Exames Renais
                        </h4>

                        {/* Trend Summary */}
                        {egfrTrend && egfrTrend.trend !== 'insufficient-data' && (
                            <div className={`rounded-xl border p-4 flex items-center gap-4 ${egfrTrend.isRapidDecline ? 'bg-red-900/15 border-red-800/50' :
                                egfrTrend.trend === 'improving' ? 'bg-green-900/15 border-green-800/50' :
                                    'bg-slate-800/50 border-slate-700'
                                }`}>
                                {egfrTrend.isRapidDecline ? (
                                    <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0" />
                                ) : egfrTrend.trend === 'improving' ? (
                                    <TrendingUp className="w-8 h-8 text-green-400 flex-shrink-0" />
                                ) : (
                                    <BarChart3 className="w-8 h-8 text-slate-400 flex-shrink-0" />
                                )}
                                <div>
                                    <div className="text-lg font-bold text-white">
                                        ΔeGFR: {egfrTrend.deltaPerYear > 0 ? '+' : ''}{egfrTrend.deltaPerYear} mL/min/ano
                                    </div>
                                    <p className="text-xs text-slate-400">{egfrTrend.interpretation}</p>
                                </div>
                            </div>
                        )}

                        {exams.length === 0 ? (
                            <div className="text-center py-16 text-slate-500">
                                <Info className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="text-sm font-medium">Nenhum exame registrado</p>
                                <p className="text-xs mt-1">Vá para a aba Calculadora para registrar o primeiro exame.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900/50 text-[10px] uppercase tracking-widest text-slate-500 border-b border-slate-700/50">
                                            <th className="px-4 py-3">Data</th>
                                            <th className="px-4 py-3">Creatinina</th>
                                            <th className="px-4 py-3">Ureia</th>
                                            <th className="px-4 py-3">eTFG</th>
                                            <th className="px-4 py-3">Estágio G</th>
                                            <th className="px-4 py-3">RAC</th>
                                            <th className="px-4 py-3">Estágio A</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {exams.map(exam => (
                                            <tr key={exam.id} className="hover:bg-slate-800/30 transition-colors text-sm">
                                                <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                                                    {new Date(exam.exam_date).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-4 py-3 text-white font-medium">{exam.creatinine} mg/dL</td>
                                                <td className="px-4 py-3 text-slate-300">{exam.urea} mg/dL</td>
                                                <td className="px-4 py-3 text-white font-bold">{exam.egfr}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getStageColor(exam.drc_stage)}`}>
                                                        {exam.drc_stage}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-300">{exam.acr != null ? `${exam.acr} mg/g` : '—'}</td>
                                                <td className="px-4 py-3">
                                                    {exam.alb_stage ? (
                                                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${exam.alb_stage === 'A1' ? 'bg-green-900/40 text-green-300 border-green-800' :
                                                            exam.alb_stage === 'A2' ? 'bg-yellow-900/40 text-yellow-300 border-yellow-800' :
                                                                'bg-red-900/40 text-red-300 border-red-800'
                                                            }`}>
                                                            {exam.alb_stage}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default RenalFunctionModule
