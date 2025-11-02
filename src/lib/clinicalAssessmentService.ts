import { supabase } from './supabase'

export interface ClinicalReport {
  id?: string
  patientId: string
  assessmentType: string
  clinicalNotes: string
  complaintList?: string[]
  complaintDetails?: any
  medications?: string[]
  allergies?: string[]
  familyHistory?: string
  lifestyle?: any
  createdAt?: string
}

export class ClinicalAssessmentService {
  /**
   * Salva uma avaliação clínica no banco de dados
   */
  static async saveClinicalAssessment(report: ClinicalReport): Promise<string> {
    try {
      // Primeiro, tenta inserir na tabela imre_assessments
      const { data: imreData, error: imreError } = await supabase
        .from('imre_assessments')
        .insert({
          user_id: report.patientId, // ou pegar do contexto de autenticação
          patient_id: report.patientId,
          assessment_type: report.assessmentType,
          triaxial_data: {
            complaintList: report.complaintList || [],
            complaintDetails: report.complaintDetails || {},
            medications: report.medications || [],
            allergies: report.allergies || [],
            familyHistory: report.familyHistory || '',
            lifestyle: report.lifestyle || {}
          },
          semantic_context: {
            clinicalNotes: report.clinicalNotes,
            assessmentDate: new Date().toISOString()
          },
          completion_status: 'completed',
          clinical_notes: report.clinicalNotes
        })
        .select('id')
        .single()

      if (imreError && imreError.code !== '42P01') { // Se a tabela não existir
        console.error('Erro ao salvar avaliação IMRE:', imreError)
        throw imreError
      }

      // Fallback: tentar salvar em clinical_assessments
      if (imreError && imreError.code === '42P01') {
        const { data: clinicalData, error: clinicalError } = await supabase
          .from('clinical_assessments')
          .insert({
            patient_id: report.patientId,
            assessment_type: report.assessmentType,
            data: {
              complaintList: report.complaintList || [],
              complaintDetails: report.complaintDetails || {},
              medications: report.medications || [],
              allergies: report.allergies || [],
              familyHistory: report.familyHistory || '',
              lifestyle: report.lifestyle || {},
              clinicalNotes: report.clinicalNotes
            },
            status: 'completed'
          })
          .select('id')
          .single()

        if (clinicalError) {
          console.error('Erro ao salvar avaliação clínica:', clinicalError)
          throw clinicalError
        }

        console.log('✅ Avaliação clínica salva com sucesso:', clinicalData.id)
        return clinicalData.id
      }

      console.log('✅ Avaliação IMRE salva com sucesso:', imreData.id)
      return imreData.id
    } catch (error) {
      console.error('❌ Erro ao salvar avaliação clínica:', error)
      throw error
    }
  }

  /**
   * Busca avaliações de um paciente
   */
  static async getPatientAssessments(patientId: string) {
    try {
      // Tentar buscar em imre_assessments primeiro
      const { data: imreData, error: imreError } = await supabase
        .from('imre_assessments')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (imreError && imreError.code !== '42P01') {
        throw imreError
      }

      if (imreData && imreData.length > 0) {
        return imreData
      }

      // Fallback: buscar em clinical_assessments
      const { data: clinicalData, error: clinicalError } = await supabase
        .from('clinical_assessments')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (clinicalError) {
        throw clinicalError
      }

      return clinicalData || []
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error)
      return []
    }
  }
}
