// Sistema de Permissões Administrativas
// Permite que admin acesse todos os dados da plataforma

import { supabase } from './supabase'
import { normalizeUserType } from './userTypes'

// IDs de emails de admin com acesso completo
const ADMIN_EMAILS = [
  'rrvalenca@gmail.com',
  'rrvlenca@gmail.com',
  'profrvalenca@gmail.com',
  'iaianoaesperanza@gmail.com'
]

/**
 * Verifica se um usuário é admin
 */
export const isAdmin = (user: { email?: string; type?: string } | null): boolean => {
  if (!user) return false
  
  // Verificar email
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return true
  }
  
  // Verificar tipo
  const normalizedType = normalizeUserType(user.type)
  return normalizedType === 'admin'
}

/**
 * Buscar todos os pacientes (admin tem acesso completo)
 */
export const getAllPatients = async (userId: string, userType: string) => {
  try {
    // Se for admin, buscar todos os pacientes sem filtro
    if (isAdmin({ type: userType })) {
      const { data: assessments, error } = await supabase
        .from('clinical_assessments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar pacientes (admin):', error)
        throw error
      }

      // Agrupar por paciente
      const patientsMap = new Map()
      assessments?.forEach(assessment => {
        if (assessment.patient_id && !patientsMap.has(assessment.patient_id)) {
          patientsMap.set(assessment.patient_id, {
            id: assessment.patient_id,
            name: assessment.patient_name || `Paciente ${assessment.patient_id.slice(0, 8)}`,
            age: assessment.patient_age || 0,
            cpf: assessment.patient_cpf || '',
            phone: assessment.patient_phone || '',
            email: assessment.patient_email || '',
            lastVisit: new Date(assessment.created_at).toLocaleDateString('pt-BR'),
            status: assessment.status || 'Aguardando',
            condition: assessment.condition || 'Não especificado',
            priority: assessment.priority || 'medium',
            assessments: [assessment]
          })
        } else {
          const patient = patientsMap.get(assessment.patient_id)
          if (patient) {
            patient.assessments.push(assessment)
          }
        }
      })

      return Array.from(patientsMap.values())
    } else {
      // Usuário normal: buscar apenas seus próprios pacientes (com RLS)
      const { data: assessments, error } = await supabase
        .from('clinical_assessments')
        .select('*')
        .eq('doctor_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar pacientes:', error)
        throw error
      }

      const patientsMap = new Map()
      assessments?.forEach(assessment => {
        if (assessment.patient_id && !patientsMap.has(assessment.patient_id)) {
          patientsMap.set(assessment.patient_id, {
            id: assessment.patient_id,
            name: assessment.patient_name || `Paciente ${assessment.patient_id.slice(0, 8)}`,
            age: assessment.patient_age || 0,
            cpf: assessment.patient_cpf || '',
            phone: assessment.patient_phone || '',
            email: assessment.patient_email || '',
            lastVisit: new Date(assessment.created_at).toLocaleDateString('pt-BR'),
            status: assessment.status || 'Aguardando',
            condition: assessment.condition || 'Não especificado',
            priority: assessment.priority || 'medium',
            assessments: [assessment]
          })
        } else {
          const patient = patientsMap.get(assessment.patient_id)
          if (patient) {
            patient.assessments.push(assessment)
          }
        }
      })

      return Array.from(patientsMap.values())
    }
  } catch (error) {
    console.error('❌ Erro ao buscar pacientes:', error)
    throw error
  }
}

/**
 * Buscar prontuário completo de um paciente (admin tem acesso)
 */
export const getPatientMedicalRecord = async (patientId: string, userId: string, userType: string) => {
  try {
    // Admin pode ver qualquer prontuário
    if (isAdmin({ type: userType })) {
      const { data: records, error } = await supabase
        .from('patient_medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar prontuário (admin):', error)
        throw error
      }

      return records
    } else {
      // Usuário normal: apenas seus próprios registros ou pacientes associados
      const { data: records, error } = await supabase
        .from('patient_medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erro ao buscar prontuário:', error)
        throw error
      }

      return records
    }
  } catch (error) {
    console.error('❌ Erro ao buscar prontuário:', error)
    throw error
  }
}

/**
 * Buscar todos os profissionais (admin)
 */
export const getAllProfessionals = async (userType: string) => {
  try {
    if (!isAdmin({ type: userType })) {
      throw new Error('Apenas administradores podem acessar esta função')
    }

    const { data: profiles, error } = await supabase
      .from('users')
      .select('*')
      .in('type', ['professional', 'profissional', 'admin'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar profissionais:', error)
      throw error
    }

    return profiles || []
  } catch (error) {
    console.error('❌ Erro ao buscar profissionais:', error)
    throw error
  }
}

/**
 * Buscar todos os relatórios clínicos (admin)
 */
export const getAllClinicalReports = async (userType: string) => {
  try {
    if (!isAdmin({ type: userType })) {
      throw new Error('Apenas administradores podem acessar esta função')
    }

    const { data: reports, error } = await supabase
      .from('clinical_reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar relatórios clínicos:', error)
      throw error
    }

    return reports || []
  } catch (error) {
    console.error('❌ Erro ao buscar relatórios clínicos:', error)
    throw error
  }
}

/**
 * Buscar todas as avaliações clínicas (admin)
 */
export const getAllClinicalAssessments = async (userType: string) => {
  try {
    if (!isAdmin({ type: userType })) {
      throw new Error('Apenas administradores podem acessar esta função')
    }

    const { data: assessments, error } = await supabase
      .from('clinical_assessments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Erro ao buscar avaliações:', error)
      throw error
    }

    return assessments || []
  } catch (error) {
    console.error('❌ Erro ao buscar avaliações:', error)
    throw error
  }
}


