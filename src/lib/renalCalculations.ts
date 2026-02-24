/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MÓDULO DE CÁLCULOS RENAIS — MedCannLab 3.0
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Baseado em:
 *  • KDIGO 2024 Clinical Practice Guideline for CKD Evaluation & Management
 *  • CKD-EPI 2021 Creatinine Equation (sem fator racial)
 *  • Kidney Failure Risk Equation (KFRE) — Tangri et al., JAMA 2016
 *  • "The Burden of Chronic Kidney Disease" — Jha et al., The Lancet 2013
 *  • KDIGO CGA Risk Map (Cause–GFR–Albuminuria)
 *
 * Funções:
 *  1. Cálculo eGFR (CKD-EPI 2021)
 *  2. Classificação GFR (G1-G5) — KDIGO
 *  3. Classificação Albuminúria (A1-A3) — KDIGO
 *  4. Mapa de Risco KDIGO (CGA Heat Map)
 *  5. KFRE — Risco de falência renal em 2 e 5 anos
 *  6. Avaliação de Fatores de Risco — "The Burden of CKD"
 *  7. Análise de Tendência eGFR (ΔeGFR/ano)
 *  8. Avaliação Completa Integrada
 */

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface RenalProfile {
    creatinine: number    // mg/dL
    age: number
    sex: 'male' | 'female'
}

export interface AlbuminuriaData {
    acr: number           // mg/g (Albumin-to-Creatinine Ratio)
}

export interface RenalRiskFactors {
    diabetes: boolean
    hypertension: boolean
    cardiovascularDisease: boolean
    obesity: boolean                // BMI ≥ 30
    smoking: boolean
    familyHistoryCKD: boolean
    historyAKI: boolean
    nephrotoxicMeds: boolean
    autoimmune: boolean
    ageOver60: boolean
}

export type GFRStage = 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5'
export type AlbuminuriaStage = 'A1' | 'A2' | 'A3'
export type KDIGORiskLevel = 'low' | 'moderate' | 'high' | 'very-high' | 'highest'

export interface RenalAssessment {
    egfr: number
    stage: GFRStage
    description: string
    actionPlan: string
}

export interface AlbuminuriaAssessment {
    acr: number
    stage: AlbuminuriaStage
    description: string
}

export interface KDIGORiskResult {
    riskLevel: KDIGORiskLevel
    color: string               // CSS color for the heat map cell
    label: string               // e.g. "Risco Muito Alto"
    monitoringFrequency: string  // e.g. "A cada 3 meses"
    needsNephrologyReferral: boolean
}

export interface KFREResult {
    risk2Year: number    // % probability of ESKD in 2 years
    risk5Year: number    // % probability of ESKD in 5 years
    interpretation: string
}

export interface RiskFactorAssessment {
    factors: RenalRiskFactors
    totalFactors: number
    activeFactors: string[]
    riskScore: 'low' | 'moderate' | 'high' | 'very-high'
    recommendation: string
}

export interface EGFRTrend {
    deltaPerYear: number           // mL/min/1.73m²/year
    isRapidDecline: boolean        // > 5 mL/min/year = rapid
    trend: 'stable' | 'declining' | 'rapid-decline' | 'improving' | 'insufficient-data'
    interpretation: string
}

export interface ComprehensiveRenalAssessment {
    gfr: RenalAssessment
    albuminuria: AlbuminuriaAssessment | null
    kdigoRisk: KDIGORiskResult | null
    kfre: KFREResult | null
    riskFactors: RiskFactorAssessment | null
    trend: EGFRTrend | null
    overallSummary: string
    timestamp: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. eGFR — CKD-EPI 2021 (SEM fator racial)
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * CKD-EPI 2021 Creatinine Equation
 * eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^-1.200 × 0.9938^Age × [1.012 if female]
 *
 * Reference: Inker LA et al. N Engl J Med 2021;385:1737-49
 */
export const calculateEGFR = (profile: RenalProfile): number => {
    const { creatinine, age, sex } = profile

    const K = sex === 'female' ? 0.7 : 0.9
    const alphaFactor = sex === 'female' ? -0.241 : -0.302
    const genderFactor = sex === 'female' ? 1.012 : 1

    const scrOverK = creatinine / K
    const minPart = Math.min(scrOverK, 1) ** alphaFactor
    const maxPart = Math.max(scrOverK, 1) ** -1.200

    const egfr = 142 * minPart * maxPart * (0.9938 ** age) * genderFactor

    return parseFloat(egfr.toFixed(1))
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Classificação GFR (G1-G5) — KDIGO
// ═══════════════════════════════════════════════════════════════════════════════
export const classifyStage = (egfr: number): GFRStage => {
    if (egfr >= 90) return 'G1'
    if (egfr >= 60) return 'G2'
    if (egfr >= 45) return 'G3a'
    if (egfr >= 30) return 'G3b'
    if (egfr >= 15) return 'G4'
    return 'G5'
}

export const getStageDescription = (stage: string): { desc: string; action: string } => {
    switch (stage) {
        case 'G1':
            return { desc: 'Normal ou Elevado (≥90)', action: 'Monitoramento anual se houver outros fatores de risco.' }
        case 'G2':
            return { desc: 'Levemente Diminuído (60-89)', action: 'Monitorar progressão, controlar PA e glicemia.' }
        case 'G3a':
            return { desc: 'Leve a Moderado (45-59)', action: 'Avaliar complicações (anemia, osso). Considerar referência ao nefrologista.' }
        case 'G3b':
            return { desc: 'Moderado a Grave (30-44)', action: 'Monitoramento estrito a cada 3-6 meses. Referência ao nefrologista.' }
        case 'G4':
            return { desc: 'Gravemente Diminuído (15-29)', action: 'Preparo para terapia substitutiva renal (diálise/transplante).' }
        case 'G5':
            return { desc: 'Falência Renal (<15)', action: 'Diálise ou transplante indicados. Acompanhamento mensal.' }
        default:
            return { desc: 'Indeterminado', action: 'Repetir exames.' }
    }
}

export const generateRenalAssessment = (profile: RenalProfile): RenalAssessment => {
    const egfr = calculateEGFR(profile)
    const stage = classifyStage(egfr)
    const info = getStageDescription(stage)
    return { egfr, stage, description: info.desc, actionPlan: info.action }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Classificação Albuminúria (A1-A3) — KDIGO
// ═══════════════════════════════════════════════════════════════════════════════
export const classifyAlbuminuria = (acr: number): AlbuminuriaAssessment => {
    if (acr < 30) {
        return { acr, stage: 'A1', description: 'Normal a levemente aumentada (<30 mg/g)' }
    }
    if (acr < 300) {
        return { acr, stage: 'A2', description: 'Moderadamente aumentada (30-299 mg/g)' }
    }
    return { acr, stage: 'A3', description: 'Gravemente aumentada (≥300 mg/g)' }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Mapa de Risco KDIGO — Heat Map CGA
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * KDIGO CGA Risk Map (Prognosis of CKD by GFR and Albuminuria Categories)
 *
 *              A1 (<30)     A2 (30-299)    A3 (≥300)
 * G1 (≥90)    Low          Moderate       High
 * G2 (60-89)  Low          Moderate       High
 * G3a (45-59) Moderate     High           Very High
 * G3b (30-44) High         Very High      Highest
 * G4 (15-29)  Very High    Highest        Highest
 * G5 (<15)    Highest      Highest        Highest
 */
const KDIGO_RISK_MAP: Record<GFRStage, Record<AlbuminuriaStage, KDIGORiskLevel>> = {
    G1: { A1: 'low', A2: 'moderate', A3: 'high' },
    G2: { A1: 'low', A2: 'moderate', A3: 'high' },
    G3a: { A1: 'moderate', A2: 'high', A3: 'very-high' },
    G3b: { A1: 'high', A2: 'very-high', A3: 'highest' },
    G4: { A1: 'very-high', A2: 'highest', A3: 'highest' },
    G5: { A1: 'highest', A2: 'highest', A3: 'highest' },
}

const RISK_LEVEL_CONFIG: Record<KDIGORiskLevel, { color: string; label: string; monitoring: string; referral: boolean }> = {
    'low': { color: '#22c55e', label: 'Risco Baixo', monitoring: 'Anual (se outros fatores de risco)', referral: false },
    'moderate': { color: '#eab308', label: 'Risco Moderado', monitoring: 'Anual', referral: false },
    'high': { color: '#f97316', label: 'Risco Alto', monitoring: 'A cada 6 meses', referral: true },
    'very-high': { color: '#ef4444', label: 'Risco Muito Alto', monitoring: 'A cada 3 meses', referral: true },
    'highest': { color: '#991b1b', label: 'Risco Altíssimo', monitoring: 'A cada 1-3 meses + Nefrologista', referral: true },
}

export const calculateKDIGORisk = (gfrStage: GFRStage, albStage: AlbuminuriaStage): KDIGORiskResult => {
    const riskLevel = KDIGO_RISK_MAP[gfrStage][albStage]
    const config = RISK_LEVEL_CONFIG[riskLevel]
    return {
        riskLevel,
        color: config.color,
        label: config.label,
        monitoringFrequency: config.monitoring,
        needsNephrologyReferral: config.referral,
    }
}

/** Retorna a grade completa do mapa de risco (para renderizar a UI) */
export const getFullKDIGORiskMap = (): { gfr: GFRStage; alb: AlbuminuriaStage; risk: KDIGORiskResult }[] => {
    const result: { gfr: GFRStage; alb: AlbuminuriaStage; risk: KDIGORiskResult }[] = []
    const gfrStages: GFRStage[] = ['G1', 'G2', 'G3a', 'G3b', 'G4', 'G5']
    const albStages: AlbuminuriaStage[] = ['A1', 'A2', 'A3']
    for (const g of gfrStages) {
        for (const a of albStages) {
            result.push({ gfr: g, alb: a, risk: calculateKDIGORisk(g, a) })
        }
    }
    return result
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. KFRE — Kidney Failure Risk Equation (4-variable)
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Tangri N et al. A Predictive Model for Progression of Chronic Kidney Disease
 * to Kidney Failure. JAMA 2011;305(15):1553-9 — Recalibrated 2016.
 *
 * 4-variable model (age, sex, eGFR, ACR):
 * sum = α₁×(age/10 - 7.036) + α₂×(male - 0.5642) + α₃×(eGFR/5 - 7.222) + α₄×(ln(ACR) - 5.137)
 *
 * 2-year: 1 - 0.9832^exp(sum)
 * 5-year: 1 - 0.9365^exp(sum)
 *
 * Coefficients (recalibrated for non-North American populations):
 * α₁ = -0.2201,  α₂ = 0.2467,  α₃ = -0.5567,  α₄ = 0.4510
 *
 * Applicable when eGFR 3-59 mL/min/1.73m² (G3a-G5 ranges)
 */
export const calculateKFRE = (
    age: number,
    sex: 'male' | 'female',
    egfr: number,
    acr: number
): KFREResult => {
    // KFRE is validated for eGFR < 60;  above that, risk is negligible
    if (egfr >= 60) {
        return {
            risk2Year: 0,
            risk5Year: 0,
            interpretation: 'eGFR ≥ 60: KFRE não aplicável. Risco de falência renal é muito baixo.',
        }
    }

    const male = sex === 'male' ? 1 : 0

    // Ensure ACR is at least 1 to avoid log(0)
    const safeAcr = Math.max(acr, 1)

    const sum =
        -0.2201 * (age / 10 - 7.036) +
        0.2467 * (male - 0.5642) +
        -0.5567 * (egfr / 5 - 7.222) +
        0.4510 * (Math.log(safeAcr) - 5.137)

    const risk2Year = (1 - Math.pow(0.9832, Math.exp(sum))) * 100
    const risk5Year = (1 - Math.pow(0.9365, Math.exp(sum))) * 100

    const r2 = parseFloat(risk2Year.toFixed(1))
    const r5 = parseFloat(risk5Year.toFixed(1))

    let interpretation: string
    if (r5 < 3) {
        interpretation = `Risco baixo de falência renal: ${r5}% em 5 anos. Monitoramento contínuo recomendado.`
    } else if (r5 < 10) {
        interpretation = `Risco moderado de falência renal: ${r5}% em 5 anos. Referência ao nefrologista indicada.`
    } else if (r5 < 20) {
        interpretation = `Risco alto de falência renal: ${r5}% em 5 anos. Acompanhamento nefrológico frequente.`
    } else {
        interpretation = `Risco muito alto de falência renal: ${r5}% em 5 anos. Preparo para terapia substitutiva renal.`
    }

    return { risk2Year: r2, risk5Year: r5, interpretation }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Avaliação de Fatores de Risco — "The Burden of CKD"
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * Based on:
 *  • Jha V et al. "Chronic kidney disease: global dimension and perspectives."
 *    The Lancet 2013;382(9888):260-272.
 *  • KDIGO 2024 CKD Guideline — Risk factor identification
 *
 * Each factor carries a weight; the total produces a risk classification.
 */
const RISK_FACTOR_WEIGHTS: Record<keyof RenalRiskFactors, { weight: number; label: string }> = {
    diabetes: { weight: 3, label: 'Diabetes mellitus' },
    hypertension: { weight: 3, label: 'Hipertensão arterial sistêmica' },
    cardiovascularDisease: { weight: 2, label: 'Doença cardiovascular' },
    obesity: { weight: 2, label: 'Obesidade (IMC ≥ 30)' },
    smoking: { weight: 1, label: 'Tabagismo' },
    familyHistoryCKD: { weight: 2, label: 'História familiar de DRC' },
    historyAKI: { weight: 3, label: 'Histórico de lesão renal aguda (LRA)' },
    nephrotoxicMeds: { weight: 2, label: 'Uso de medicamentos nefrotóxicos' },
    autoimmune: { weight: 2, label: 'Doença autoimune (lúpus, vasculite, etc.)' },
    ageOver60: { weight: 1, label: 'Idade > 60 anos' },
}

export const assessRiskFactors = (factors: RenalRiskFactors): RiskFactorAssessment => {
    let totalWeight = 0
    const activeFactors: string[] = []
    let totalFactors = 0

    for (const [key, value] of Object.entries(factors) as [keyof RenalRiskFactors, boolean][]) {
        if (value) {
            const config = RISK_FACTOR_WEIGHTS[key]
            totalWeight += config.weight
            activeFactors.push(config.label)
            totalFactors++
        }
    }

    let riskScore: RiskFactorAssessment['riskScore']
    let recommendation: string

    if (totalWeight <= 2) {
        riskScore = 'low'
        recommendation = 'Risco basal baixo. Manter hábitos saudáveis e triagem periódica de creatinina e microalbuminúria.'
    } else if (totalWeight <= 5) {
        riskScore = 'moderate'
        recommendation = 'Risco moderado. Solicitar creatinina + RAC urinário anualmente. Controlar fatores modificáveis.'
    } else if (totalWeight <= 10) {
        riskScore = 'high'
        recommendation = 'Risco alto. Avaliação renal completa (creatinina, eGFR, RAC, ultrassom). Encaminhar ao nefrologista se eGFR < 60 ou RAC > 30.'
    } else {
        riskScore = 'very-high'
        recommendation = 'Risco muito alto. Avaliação nefrológica imediata. Rastreamento completo de DRC. Monitoramento trimestral.'
    }

    return { factors, totalFactors, activeFactors, riskScore, recommendation }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Análise de Tendência eGFR
// ═══════════════════════════════════════════════════════════════════════════════
/**
 * KDIGO define "declínio rápido" como perda > 5 mL/min/1.73m²/ano.
 * Usa regressão linear simples sobre array de {date, egfr}.
 */
export const analyzeEGFRTrend = (
    dataPoints: { date: Date; egfr: number }[]
): EGFRTrend => {
    if (dataPoints.length < 2) {
        return {
            deltaPerYear: 0,
            isRapidDecline: false,
            trend: 'insufficient-data',
            interpretation: 'Dados insuficientes para análise de tendência. Mínimo de 2 exames necessários.',
        }
    }

    // Sort by date ascending
    const sorted = [...dataPoints].sort((a, b) => a.date.getTime() - b.date.getTime())

    // Simple linear regression: y = a + bx  where x = years from first exam
    const firstDate = sorted[0].date.getTime()
    const xs = sorted.map(p => (p.date.getTime() - firstDate) / (365.25 * 24 * 60 * 60 * 1000)) // years
    const ys = sorted.map(p => p.egfr)

    const n = xs.length
    const sumX = xs.reduce((a, b) => a + b, 0)
    const sumY = ys.reduce((a, b) => a + b, 0)
    const sumXY = xs.reduce((acc, x, i) => acc + x * ys[i], 0)
    const sumX2 = xs.reduce((acc, x) => acc + x * x, 0)

    const denom = n * sumX2 - sumX * sumX
    if (denom === 0) {
        return {
            deltaPerYear: 0,
            isRapidDecline: false,
            trend: 'insufficient-data',
            interpretation: 'Intervalo de tempo insuficiente entre exames para calcular tendência.',
        }
    }

    const slope = (n * sumXY - sumX * sumY) / denom // mL/min/1.73m²/year
    const deltaPerYear = parseFloat(slope.toFixed(2))
    const isRapidDecline = deltaPerYear < -5

    let trend: EGFRTrend['trend']
    let interpretation: string

    if (deltaPerYear > 1) {
        trend = 'improving'
        interpretation = `eGFR melhorando: +${Math.abs(deltaPerYear)} mL/min/1.73m²/ano. Tendência favorável.`
    } else if (deltaPerYear >= -3) {
        trend = 'stable'
        interpretation = `eGFR estável: ${deltaPerYear} mL/min/1.73m²/ano. Dentro da variação fisiológica esperada.`
    } else if (deltaPerYear >= -5) {
        trend = 'declining'
        interpretation = `eGFR em declínio: ${deltaPerYear} mL/min/1.73m²/ano. Monitoramento mais frequente recomendado.`
    } else {
        trend = 'rapid-decline'
        interpretation = `⚠️ DECLÍNIO RÁPIDO: ${deltaPerYear} mL/min/1.73m²/ano (>5 mL/min/ano). Avaliação nefrológica urgente.`
    }

    return { deltaPerYear, isRapidDecline, trend, interpretation }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Avaliação Completa Integrada
// ═══════════════════════════════════════════════════════════════════════════════
export const generateComprehensiveAssessment = (
    profile: RenalProfile,
    albuminuria?: AlbuminuriaData,
    riskFactors?: RenalRiskFactors,
    historicalData?: { date: Date; egfr: number }[]
): ComprehensiveRenalAssessment => {
    // 1. eGFR + GFR Stage
    const gfr = generateRenalAssessment(profile)

    // 2. Albuminuria (if available)
    const albuminuriaResult = albuminuria ? classifyAlbuminuria(albuminuria.acr) : null

    // 3. KDIGO Risk Map (requires both G and A)
    const kdigoRisk = albuminuriaResult
        ? calculateKDIGORisk(gfr.stage, albuminuriaResult.stage)
        : null

    // 4. KFRE (requires eGFR < 60 and ACR)
    const kfre = (albuminuria && gfr.egfr < 60)
        ? calculateKFRE(profile.age, profile.sex, gfr.egfr, albuminuria.acr)
        : null

    // 5. Risk Factors
    const riskFactorResult = riskFactors ? assessRiskFactors(riskFactors) : null

    // 6. Trend
    const trend = historicalData ? analyzeEGFRTrend(historicalData) : null

    // 7. Overall Summary
    const summaryParts: string[] = []
    summaryParts.push(`eGFR: ${gfr.egfr} mL/min/1.73m² — Estágio ${gfr.stage} (${gfr.description})`)

    if (albuminuriaResult) {
        summaryParts.push(`Albuminúria: RAC ${albuminuriaResult.acr} mg/g — ${albuminuriaResult.stage} (${albuminuriaResult.description})`)
    }

    if (kdigoRisk) {
        summaryParts.push(`Classificação KDIGO: ${kdigoRisk.label} — Monitoramento: ${kdigoRisk.monitoringFrequency}`)
        if (kdigoRisk.needsNephrologyReferral) {
            summaryParts.push('⚠️ Referência ao nefrologista indicada.')
        }
    }

    if (kfre) {
        summaryParts.push(`KFRE: Risco de falência renal — ${kfre.risk2Year}% (2 anos), ${kfre.risk5Year}% (5 anos)`)
    }

    if (riskFactorResult && riskFactorResult.totalFactors > 0) {
        summaryParts.push(`Fatores de risco: ${riskFactorResult.totalFactors} ativos (${riskFactorResult.activeFactors.join(', ')})`)
    }

    if (trend && trend.trend !== 'insufficient-data') {
        summaryParts.push(`Tendência eGFR: ${trend.deltaPerYear > 0 ? '+' : ''}${trend.deltaPerYear} mL/min/ano (${trend.trend === 'rapid-decline' ? '⚠️ DECLÍNIO RÁPIDO' : trend.trend})`)
    }

    return {
        gfr,
        albuminuria: albuminuriaResult,
        kdigoRisk,
        kfre,
        riskFactors: riskFactorResult,
        trend,
        overallSummary: summaryParts.join('\n'),
        timestamp: new Date().toISOString(),
    }
}
