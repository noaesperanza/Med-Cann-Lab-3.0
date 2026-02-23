/**
 * Clinical Governance - Specialty Configurations
 * 
 * Configurações personalizadas por especialidade médica
 */

import type { ConfidenceLevel } from '../types/enums'

export type Specialty =
    | 'nefrologia'
    | 'cannabis'
    | 'psiquiatria'
    | 'dor_cronica'
    | 'cardiologia'
    | 'odontologia'
    | 'dermatologia'
    | 'geral'

export interface SpecialtyConfig {
    name: string
    description: string
    indicators: string[]
    thresholds: {
        minConfidence: number
        exhaustionDays: number
        minConfluences: number
    }
    alertTypes: string[]
    weights: Record<string, number>
}

export const SPECIALTY_CONFIGS: Record<Specialty, SpecialtyConfig> = {
    // ============================================================================
    // NEFROLOGIA
    // ============================================================================
    nefrologia: {
        name: 'Nefrologia',
        description: 'Foco em função renal, DRC e tratamento conservador',
        indicators: [
            'creatinina',
            'tfg',
            'proteinuria',
            'volume_urinario',
            'pressao_arterial',
            'potassio',
            'bicarbonato'
        ],
        thresholds: {
            minConfidence: 75,  // Conservador (riscos renais graves)
            exhaustionDays: 90,
            minConfluences: 2
        },
        alertTypes: [
            'deterioracao_renal',
            'saturacao_medicamentosa',
            'risco_dialitico',
            'descompensacao_acida'
        ],
        weights: {
            creatinina_rising: 30,
            tfg_falling: 30,
            proteinuria_positive: 25,
            multiple_adjustments: 15
        }
    },

    // ============================================================================
    // CANNABIS MEDICINAL
    // ============================================================================
    cannabis: {
        name: 'Cannabis Medicinal',
        description: 'Protocolo canabinóide, dosagem e efeitos',
        indicators: [
            'dose_thc',
            'dose_cbd',
            'ratio_thc_cbd',
            'efeitos_colaterais',
            'eva_dor',
            'qualidade_sono',
            'frequencia_uso',
            'strain_tipo'
        ],
        thresholds: {
            minConfidence: 70,
            exhaustionDays: 60,
            minConfluences: 2
        },
        alertTypes: [
            'exaustao_terapeutica',
            'efeitos_adversos',
            'falta_resposta',
            'dosagem_subotima',
            'tolerancia_desenvolvida'
        ],
        weights: {
            dose_increased_no_response: 25,
            side_effects_increasing: 30,
            pain_not_improving: 25,
            sleep_deteriorating: 20
        }
    },

    // ============================================================================
    // PSIQUIATRIA
    // ============================================================================
    psiquiatria: {
        name: 'Psiquiatria',
        description: 'Saúde mental, escalas validadas e aderência',
        indicators: [
            'gad7',           // Ansiedade
            'phq9',           // Depressão
            'bdi',            // Beck Depression
            'aderencia',
            'ideacao_suicida',
            'sono',
            'funcionalidade'
        ],
        thresholds: {
            minConfidence: 80,  // Muito conservador (risco suicida)
            exhaustionDays: 45,
            minConfluences: 2
        },
        alertTypes: [
            'deterioracao_mental',
            'risco_suicida',
            'nao_aderencia',
            'sintomas_psiquiatricos',
            'emergencia_psiquiatrica'
        ],
        weights: {
            gad7_worsening: 30,
            phq9_worsening: 35,
            suicidal_ideation: 50,  // Peso máximo!
            non_adherence: 25
        }
    },

    // ============================================================================
    // DOR CRÔNICA
    // ============================================================================
    dor_cronica: {
        name: 'Dor Crônica',
        description: 'Manejo álgico, escalas de dor e funcionalidade',
        indicators: [
            'eva_dor',
            'dn4',              // Dor neuropática
            'rescue_medication',
            'dias_dor_severa',
            'avd',              // Atividades vida diária
            'qualidade_sono',
            'funcionalidade'
        ],
        thresholds: {
            minConfidence: 70,
            exhaustionDays: 60,
            minConfluences: 2
        },
        alertTypes: [
            'dor_refrataria',
            'exaustao_analgesica',
            'funcionalidade_comprometida',
            'uso_excessivo_rescue'
        ],
        weights: {
            eva_increasing: 30,
            rescue_overuse: 25,
            functionality_declining: 25,
            severe_pain_days_increasing: 20
        }
    },

    // ============================================================================
    // CARDIOLOGIA
    // ============================================================================
    cardiologia: {
        name: 'Cardiologia',
        description: 'Função cardíaca, pressão arterial e fatores de risco',
        indicators: [
            'pressao_arterial',
            'frequencia_cardiaca',
            'fevi',             // Fração ejeção
            'bnp',              // Peptídeo natriurético
            'edema',
            'dispneia',
            'capacidade_funcional'
        ],
        thresholds: {
            minConfidence: 75,
            exhaustionDays: 60,
            minConfluences: 2
        },
        alertTypes: [
            'descompensacao_cardiaca',
            'controle_pressao_inadequado',
            'sinais_congestao',
            'deterioracao_funcional'
        ],
        weights: {
            blood_pressure_uncontrolled: 30,
            bnp_rising: 30,
            edema_worsening: 20,
            functional_class_declining: 20
        }
    },

    // ============================================================================
    // ODONTOLOGIA
    // ============================================================================
    odontologia: {
        name: 'Odontologia',
        description: 'Saúde bucal, dor orofacial e tratamentos odontológicos',
        indicators: [
            'dor_orofacial',
            'indice_placa',
            'sangramento_gengival',
            'profundidade_bolsa',
            'mobilidade_dentaria',
            'dtm',              // Disfunção temporomandibular
            'bruxismo',
            'xerostomia'        // Boca seca
        ],
        thresholds: {
            minConfidence: 70,
            exhaustionDays: 45,
            minConfluences: 2
        },
        alertTypes: [
            'periodontal_deterioracao',
            'dor_orofacial_persistente',
            'dtm_refrataria',
            'infeccao_recorrente',
            'tratamento_ineficaz'
        ],
        weights: {
            orofacial_pain_increasing: 30,
            periodontal_disease_worsening: 25,
            dtm_symptoms_increasing: 25,
            infection_recurrent: 20
        }
    },

    // ============================================================================
    // DERMATOLOGIA
    // ============================================================================
    dermatologia: {
        name: 'Dermatologia',
        description: 'Condições dermatológicas, cannabis tópica/sistêmica e procedimentos',
        indicators: [
            'pasi',              // Psoríase (Psoriasis Area Severity Index)
            'dlqi',              // Dermatology Life Quality Index
            'scorad',            // Dermatite atópica (Scoring Atopic Dermatitis)
            'area_afetada',      // % da superfície corporal
            'prurido_escala',    // Escala de coceira (0-10)
            'eritema',           // Vermelhidão
            'descamacao',        // Descamação
            'lesoes_ativas',     // Número de lesões
            'densidade_capilar', // Tratamento capilar
            'grau_celulite',     // Tratamento corporal
            'hiperpigmentacao',  // Pele negra
            'sessoes_laser'      // Centro de laser
        ],
        thresholds: {
            minConfidence: 70,
            exhaustionDays: 60,  // Dermatologia responde em 4-8 semanas
            minConfluences: 2
        },
        alertTypes: [
            'exaustao_terapeutica',
            'corticoide_refratario',
            'qualidade_vida_deteriorando',
            'area_lesionada_expandindo',
            'prurido_incontrolavel',
            'laser_ineficaz',
            'tratamento_capilar_falhou'
        ],
        weights: {
            pasi_worsening: 30,
            dlqi_declining: 25,
            itching_increasing: 25,
            area_expanding: 20,
            hair_density_declining: 25,
            laser_sessions_exhausted: 20
        }
    },

    // ============================================================================
    // CLÍNICO GERAL / GENERALISTA
    // ============================================================================
    geral: {
        name: 'Clínico Geral',
        description: 'Visão holística, indicadores gerais de saúde',
        indicators: [
            'qualidade_vida',
            'aderencia',
            'sintomas_gerais',
            'funcionalidade',
            'comorbidades',
            'polifarmacia'
        ],
        thresholds: {
            minConfidence: 65,  // Menos conservador (mais sensível)
            exhaustionDays: 60,
            minConfluences: 2
        },
        alertTypes: [
            'qualquer_deterioracao',
            'multiplos_fatores',
            'nao_aderencia',
            'comorbidade_descompensada'
        ],
        weights: {
            quality_of_life_declining: 20,
            functionality_declining: 20,
            non_adherence: 25,
            multiple_symptoms: 15
        }
    }
}

/**
 * Obter configuração por especialidade
 */
export function getSpecialtyConfig(specialty?: Specialty): SpecialtyConfig {
    return SPECIALTY_CONFIGS[specialty || 'geral']
}

/**
 * Verificar se indicador é relevante para especialidade
 */
export function isIndicatorRelevant(indicator: string, specialty?: Specialty): boolean {
    const config = getSpecialtyConfig(specialty)
    return config.indicators.includes(indicator)
}

/**
 * Obter peso de indicador por especialidade
 */
export function getIndicatorWeight(
    indicator: string,
    specialty?: Specialty,
    defaultWeight: number = 20
): number {
    const config = getSpecialtyConfig(specialty)
    return config.weights[indicator] || defaultWeight
}
