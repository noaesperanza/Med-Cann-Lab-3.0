
import { PatientContext, ClinicalAssessment, KPI, Prescription, TimeContext, IMREData } from '../types'


/**
 * Mapeia dados brutos do paciente (Supabase) para o Contexto Clínico (ACDSS)
 * 
 * @param patient - Objeto 'patient' vindo do banco de dados (users + assessments + records)
 */
export function mapPatientToContext(patient: any): PatientContext {
    // 1. Extrair avaliação mais recente (IMRE)
    const latestAssessment = patient.assessments?.[0] || {} // Assumindo ordenação descendente

    // 2. Construir Histórico de KPIs (Extraindo de múltiplas fontes se necessário)
    const kpiHistory: KPI[] = []

    if (patient.assessments) {
        patient.assessments.forEach((assess: any) => {
            // Exemplo: Extrair creatinina se existir
            if (assess.renal_function?.creatinine) {
                kpiHistory.push({
                    type: 'creatinina',
                    value: Number(assess.renal_function.creatinine),
                    date: new Date(assess.created_at),
                    trend: 'stable' // TODO: Calcular tendência real
                })
            }
            // Cannabis Pain Score
            if (assess.pain_map?.intensity) {
                kpiHistory.push({
                    type: 'eva_dor',
                    value: Number(assess.pain_map.intensity),
                    date: new Date(assess.created_at),
                    trend: 'stable'
                })
            }
            // GAD-7 (Exemplo)
            if (assess.mental_health?.gad7_score) {
                kpiHistory.push({
                    type: 'gad7',
                    value: Number(assess.mental_health.gad7_score),
                    date: new Date(assess.created_at)
                })
            }
            // Ideação Suicida (Gatekeeper)
            if (assess.mental_health?.suicidal_ideation) {
                kpiHistory.push({
                    type: 'ideacao_suicida',
                    value: 1, // 1 = true
                    date: new Date(assess.created_at)
                })
            }
        })
    }

    // 3. Current Assessment Object
    const currentAssessment: ClinicalAssessment = {
        id: latestAssessment.id || crypto.randomUUID(),
        createdAt: latestAssessment.created_at ? new Date(latestAssessment.created_at) : new Date(),
        professionalId: patient.professional_id || 'unknown',
        imreData: {
            integrativa: {},
            multidimensional: {},
            renal: {
                creatinina: Number(latestAssessment.renal_function?.creatinine) || 0,
                tfg: Number(latestAssessment.renal_function?.gfr) || 0,
                proteinuria: latestAssessment.renal_function?.proteinuria || 'negativa'
            },
            psiquiatria: {
                ideacao_suicida: latestAssessment.mental_health?.suicidal_ideation || false
            },
            existencial: {}
        }
    }

    // 4. Histórico de Prescrições
    const prescriptionHistory: Prescription[] = (patient.prescriptions || []).map((presc: any) => ({
        id: presc.id,
        medications: presc.medications || {},
        protocolType: presc.prescription_type || 'general',
        createdAt: new Date(presc.created_at)
    }))

    // 5. Contexto Temporal
    const lastChange = prescriptionHistory[0]?.createdAt || new Date()
    const daysSinceLastChange = Math.floor((new Date().getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24))

    const timeContext: TimeContext = {
        treatmentDuration: 0, // TODO: Calcular start date
        lastModification: lastChange,
        changeFrequency: 0,
        daysSinceLastChange: daysSinceLastChange
    }

    return {
        patientId: patient.id,
        currentAssessment,
        prescriptionHistory,
        kpiHistory,
        timeContext
    }
}
