/**
 * Clinical Governance Engine - Confluence Calculator
 * 
 * Calcula confluências (múltiplos indicadores alinhados)
 * Conceito do TradeVision adaptado para clínica
 * 
 * NOVO: Suporta especialidades médicas diferentes
 */

import type { Confluence, PatientContext } from '../types'
import { INDICATOR_WEIGHTS } from '../utils/thresholds'
import { getSpecialtyConfig, isIndicatorRelevant, getIndicatorWeight, type Specialty } from '../utils/specialtyConfigs'
import { logger } from '../utils/logger'

/**
 * Calcular confluências clínicas
 * 
 * @param context - Contexto do paciente
 * @param specialty - Especialidade do profissional (opcional)
 */
export function calculateConfluences(
    context: PatientContext,
    specialty?: Specialty
): {
    confluences: Confluence[]
    totalScore: number
} {
    const confluences: Confluence[] = []
    let totalScore = 35 // Base neutra (igual TradeVision)

    const { currentAssessment, kpiHistory, timeContext } = context
    const specialtyConfig = getSpecialtyConfig(specialty)

    logger.info('ConfluenceCalculator', `Calculando para especialidade: ${specialtyConfig.name}`, {
        indicators: specialtyConfig.indicators.length
    })

    // ============================================================================
    // INDICADORES RENAIS (Nefrologia)
    // ============================================================================

    if (isIndicatorRelevant('creatinina', specialty)) {
        const recentCreatinina = kpiHistory
            .filter(k => k.type === 'creatinina')
            .slice(-2)

        if (recentCreatinina.length >= 2) {
            const [prev, current] = recentCreatinina
            if (current.value > prev.value) {
                const points = getIndicatorWeight('creatinina_rising', specialty, INDICATOR_WEIGHTS.creatinina_rising)
                totalScore += points
                confluences.push({
                    indicator: 'Creatinina em Alta',
                    points,
                    reasoning: `Creatinina subiu de ${prev.value} para ${current.value}`,
                    weight: 1.0
                })
            }
        }
    }

    if (isIndicatorRelevant('tfg', specialty)) {
        const recentTFG = kpiHistory
            .filter(k => k.type === 'tfg')
            .slice(-2)

        if (recentTFG.length >= 2) {
            const [prev, current] = recentTFG
            if (current.value < prev.value) {
                const points = getIndicatorWeight('tfg_falling', specialty, INDICATOR_WEIGHTS.tfg_falling)
                totalScore += points
                confluences.push({
                    indicator: 'TFG em Queda',
                    points,
                    reasoning: `TFG caiu de ${prev.value} para ${current.value}`,
                    weight: 1.0
                })
            }
        }
    }

    if (isIndicatorRelevant('proteinuria', specialty)) {
        if (currentAssessment.imreData?.renal?.proteinuria !== 'negativa') {
            const points = getIndicatorWeight('proteinuria_positive', specialty, INDICATOR_WEIGHTS.proteinuria_positive)
            totalScore += points
            confluences.push({
                indicator: 'Proteinúria Detectada',
                points,
                reasoning: `Proteinúria: ${currentAssessment.imreData?.renal?.proteinuria}`,
                weight: 1.0
            })
        }
    }

    // ============================================================================
    // INDICADORES CANNABIS MEDICINAL
    // ============================================================================

    // 1. Aumento de Dose sem Melhora (Exaustão Terapêutica)
    if (isIndicatorRelevant('dose_thc', specialty)) {
        const recentDose = kpiHistory.filter(k => k.type === 'dose_thc').slice(-2)
        const recentPain = kpiHistory.filter(k => k.type === 'eva_dor').slice(-2)

        if (recentDose.length >= 2 && recentPain.length >= 2) {
            const [prevDose, currDose] = recentDose
            const [prevPain, currPain] = recentPain

            if (currDose.value > prevDose.value * 1.2 && currPain.value >= prevPain.value) {
                const points = getIndicatorWeight('dose_increased_no_response', specialty, 25)
                totalScore += points
                confluences.push({
                    indicator: 'Aumento Dose s/ Resposta',
                    points,
                    reasoning: `Dose subiu ${((currDose.value / prevDose.value - 1) * 100).toFixed(0)}% sem melhora na dor`,
                    weight: 1.0
                })
            }
        }
    }

    // 2. Efeitos Colaterais em Alta
    if (isIndicatorRelevant('efeitos_colaterais', specialty)) {
        const recentSideEffects = kpiHistory.filter(k => k.type === 'efeitos_colaterais').slice(-2)
        if (recentSideEffects.length >= 2) {
            const [prev, curr] = recentSideEffects
            if (curr.value > prev.value) {
                const points = getIndicatorWeight('side_effects_increasing', specialty, 30)
                totalScore += points
                confluences.push({
                    indicator: 'Efeitos Colaterais',
                    points,
                    reasoning: 'Score de efeitos adversos aumentando',
                    weight: 1.0
                })
            }
        }
    }

    // ============================================================================
    // INDICADORES PSIQUIATRIA
    // ============================================================================

    // 1. Piora nos Scores (GAD7 / PHQ9)
    if (isIndicatorRelevant('gad7', specialty)) {
        const recentGad = kpiHistory.filter(k => k.type === 'gad7').slice(-2)
        if (recentGad.length >= 2) {
            const [prev, curr] = recentGad
            if (curr.value >= prev.value + 2) { // Variação clínica significativa
                const points = getIndicatorWeight('gad7_worsening', specialty, 30)
                totalScore += points
                confluences.push({
                    indicator: 'Ansiedade em Alta',
                    points,
                    reasoning: `GAD-7 subiu de ${prev.value} para ${curr.value}`,
                    weight: 1.0
                })
            }
        }
    }

    // 2. Ideação Suicida (Gatekeeper)
    if (isIndicatorRelevant('ideacao_suicida', specialty)) {
        const suicideRisk = kpiHistory.find(k => k.type === 'ideacao_suicida' && k.value > 0)
        // Check current assessment data directly if available
        const currentRisk = currentAssessment.imreData?.psiquiatria?.ideacao_suicida

        if (suicideRisk || currentRisk) {
            const points = getIndicatorWeight('suicidal_ideation', specialty, 50)
            totalScore += points
            confluences.push({
                indicator: 'Risco Elevado (Ideação)',
                points,
                reasoning: 'Sinalização de ideação suicida detectada',
                weight: 1.0
            })
        }
    }

    // ============================================================================
    // INDICADORES DOR CRÔNICA
    // ============================================================================

    // 1. Uso Excessivo de Resgate
    if (isIndicatorRelevant('rescue_medication', specialty)) {
        const rescueUsage = kpiHistory.filter(k => k.type === 'rescue_medication').slice(-2)
        if (rescueUsage.length >= 2) {
            const [prev, curr] = rescueUsage
            if (curr.value > prev.value) {
                const points = getIndicatorWeight('rescue_overuse', specialty, 25)
                totalScore += points
                confluences.push({
                    indicator: 'Uso de Resgate',
                    points,
                    reasoning: 'Aumento na frequência de medicação de resgate',
                    weight: 1.0
                })
            }
        }
    }

    // ============================================================================
    // INDICADORES GERAIS (Todas especialidades)
    // ============================================================================

    // Múltiplos ajustes de protocolo
    if (context.prescriptionHistory.length >= 3) {
        const points = getIndicatorWeight('multiple_adjustments', specialty, INDICATOR_WEIGHTS.multiple_adjustments)
        totalScore += points
        confluences.push({
            indicator: 'Múltiplos Ajustes',
            points,
            reasoning: `${context.prescriptionHistory.length} ajustes de protocolo`,
            weight: 1.0
        })
    }

    // Tempo sem melhora
    if (timeContext.daysSinceLastChange > 60) {
        const points = getIndicatorWeight('days_without_improvement', specialty, INDICATOR_WEIGHTS.days_without_improvement)
        totalScore += points
        confluences.push({
            indicator: 'Estagnação Prolongada',
            points,
            reasoning: `${timeContext.daysSinceLastChange} dias sem mudanças`,
            weight: 1.0
        })
    }

    logger.info('ConfluenceCalculator', 'Confluências calculadas', {
        specialty: specialtyConfig.name,
        count: confluences.length,
        totalScore
    })

    return {
        confluences,
        totalScore
    }
}
