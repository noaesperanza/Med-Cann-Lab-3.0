/**
 * MÓDULO DE FUNÇÕES DA PLATAFORMA
 * 
 * Detecta intenções e executa ações específicas da plataforma:
 * - Gerar relatórios clínicos
 * - Consultar dashboard
 * - Salvar avaliações
 * - Notificar profissionais
 * 
 * Este módulo NÃO gera respostas conversacionais - apenas executa ações.
 * As respostas vêm do Assistant (com personalidade da Nôa).
 */

import { clinicalReportService } from './clinicalReportService'
import { supabase } from './supabase'

export interface PlatformIntent {
  type: 'ASSESSMENT_START' | 'ASSESSMENT_COMPLETE' | 'REPORT_GENERATE' | 'DASHBOARD_QUERY' | 'PATIENTS_QUERY' | 'REPORTS_COUNT_QUERY' | 'APPOINTMENTS_QUERY' | 'KPIS_QUERY' | 'NOTIFY_PROFESSIONAL' | 'NONE'
  confidence: number
  metadata?: any
}

export interface PlatformActionResult {
  success: boolean
  data?: any
  error?: string
  requiresResponse?: boolean // Se true, o Assistant deve mencionar essa ação na resposta
}

export class PlatformFunctionsModule {
  private activeAssessments: Map<string, any> = new Map()

  /**
   * Detectar intenção relacionada a funções da plataforma
   */
  detectIntent(message: string, userId?: string): PlatformIntent {
    const lowerMessage = message.toLowerCase()

    // Verificar se há avaliação em andamento
    if (userId) {
      const assessment = this.activeAssessments.get(userId)
      if (assessment) {
        // Verificar se a avaliação está sendo concluída
        if (lowerMessage.includes('finalizar') || 
            lowerMessage.includes('concluir') ||
            lowerMessage.includes('terminar') ||
            lowerMessage.includes('pronto') ||
            assessment.step === 'EVOLUTION') {
          return {
            type: 'ASSESSMENT_COMPLETE',
            confidence: 0.9,
            metadata: { assessment }
          }
        }
      }
    }

    // Detectar início de avaliação clínica inicial
    if (lowerMessage.includes('avaliação clínica inicial') ||
        lowerMessage.includes('avaliacao clinica inicial') ||
        lowerMessage.includes('protocolo imre') ||
        (lowerMessage.includes('avaliação') && lowerMessage.includes('imre'))) {
      return {
        type: 'ASSESSMENT_START',
        confidence: 0.95,
        metadata: { userId }
      }
    }

    // Detectar geração de relatório
    if (lowerMessage.includes('gerar relatório') ||
        lowerMessage.includes('relatório clínico') ||
        lowerMessage.includes('criar relatório')) {
      return {
        type: 'REPORT_GENERATE',
        confidence: 0.85,
        metadata: { userId }
      }
    }

    // Detectar consulta ao dashboard
    if (lowerMessage.includes('dashboard') ||
        lowerMessage.includes('meus relatórios') ||
        lowerMessage.includes('relatórios salvos')) {
      return {
        type: 'DASHBOARD_QUERY',
        confidence: 0.8,
        metadata: { userId }
      }
    }

    // Detectar consulta sobre pacientes
    if (lowerMessage.includes('paciente') || lowerMessage.includes('prontuário') || lowerMessage.includes('prontuario')) {
      if (lowerMessage.includes('ativo') ||
          lowerMessage.includes('meus pacientes') ||
          lowerMessage.includes('lista de pacientes') ||
          lowerMessage.includes('verificar') ||
          lowerMessage.includes('nome do paciente') ||
          lowerMessage.includes('paciente ativo') ||
          lowerMessage.includes('no meu prontuário') ||
          lowerMessage.includes('no meu prontuario') ||
          lowerMessage.includes('que está constando') ||
          lowerMessage.includes('na minha aba')) {
        return {
          type: 'PATIENTS_QUERY',
          confidence: 0.95,
          metadata: { userId }
        }
      }
      // Qualquer menção a paciente também deve acionar
      return {
        type: 'PATIENTS_QUERY',
        confidence: 0.8,
        metadata: { userId }
      }
    }

    // Detectar consulta sobre relatórios
    if (lowerMessage.includes('relatório') && (
        lowerMessage.includes('emitido') ||
        lowerMessage.includes('número') ||
        lowerMessage.includes('quantos') ||
        lowerMessage.includes('total')
      )) {
      return {
        type: 'REPORTS_COUNT_QUERY',
        confidence: 0.85,
        metadata: { userId }
      }
    }

    // Detectar consulta sobre agendamentos
    if (lowerMessage.includes('agendamento') || 
        lowerMessage.includes('consulta') ||
        lowerMessage.includes('agenda')) {
      return {
        type: 'APPOINTMENTS_QUERY',
        confidence: 0.85,
        metadata: { userId }
      }
    }

    // Detectar consulta sobre KPIs ou estatísticas
    if (lowerMessage.includes('kpi') ||
        lowerMessage.includes('estatística') ||
        lowerMessage.includes('status') ||
        lowerMessage.includes('quantidade') ||
        lowerMessage.includes('total de')) {
      return {
        type: 'KPIS_QUERY',
        confidence: 0.8,
        metadata: { userId }
      }
    }

    return { type: 'NONE', confidence: 0 }
  }

  /**
   * Executar ação baseada na intenção detectada
   */
  async executeAction(intent: PlatformIntent, userId?: string, platformData?: any): Promise<PlatformActionResult> {
    if (intent.type === 'NONE' || !userId) {
      return { success: false, requiresResponse: false }
    }

    try {
      switch (intent.type) {
        case 'ASSESSMENT_START':
          return await this.startAssessment(userId, platformData)

        case 'ASSESSMENT_COMPLETE':
          return await this.completeAssessment(userId, intent.metadata?.assessment, platformData)

        case 'REPORT_GENERATE':
          return await this.generateReport(userId, platformData)

        case 'DASHBOARD_QUERY':
          return await this.queryDashboard(userId)

        case 'PATIENTS_QUERY':
          return await this.queryPatients(userId)

        case 'REPORTS_COUNT_QUERY':
          return await this.queryReportsCount(userId)

        case 'APPOINTMENTS_QUERY':
          return await this.queryAppointments(userId)

        case 'KPIS_QUERY':
          return await this.queryKPIs(userId)

        default:
          return { success: false, requiresResponse: false }
      }
    } catch (error: any) {
      console.error('Erro ao executar ação da plataforma:', error)
      return {
        success: false,
        error: error.message || 'Erro desconhecido',
        requiresResponse: true
      }
    }
  }

  /**
   * Iniciar avaliação clínica
   */
  private async startAssessment(userId: string, platformData?: any): Promise<PlatformActionResult> {
    const assessment = {
      userId,
      step: 'INVESTIGATION',
      investigation: {},
      methodology: '',
      result: '',
      evolution: '',
      startedAt: new Date(),
      lastUpdate: new Date()
    }

    this.activeAssessments.set(userId, assessment)

    return {
      success: true,
      data: {
        assessmentStarted: true,
        step: 'INVESTIGATION'
      },
      requiresResponse: false // Assistant vai responder
    }
  }

  /**
   * Completar avaliação e gerar relatório
   */
  private async completeAssessment(
    userId: string,
    assessment: any,
    platformData?: any
  ): Promise<PlatformActionResult> {
    if (!assessment) {
      return {
        success: false,
        error: 'Nenhuma avaliação em andamento encontrada',
        requiresResponse: true
      }
    }

    const patientName = platformData?.user?.name || 'Paciente'

    // Gerar relatório clínico
    const report = await clinicalReportService.generateAIReport(
      userId,
      patientName,
      {
        investigation: `INVESTIGAÇÃO (I):\n` +
          `Motivo Principal: ${assessment.investigation?.mainComplaint || 'Não informado'}\n` +
          `Sintomas: ${assessment.investigation?.symptoms?.join(', ') || 'Não informado'}\n` +
          `História Médica: ${assessment.investigation?.medicalHistory || 'Não informado'}\n` +
          `História Familiar: ${assessment.investigation?.familyHistory || 'Não informado'}\n` +
          `Medicações: ${assessment.investigation?.medications || 'Não informado'}\n` +
          `Hábitos de Vida: ${assessment.investigation?.lifestyle || 'Não informado'}`,
        methodology: `METODOLOGIA (M):\n${assessment.methodology || 'Aplicação da Arte da Entrevista Clínica (AEC) com protocolo IMRE.'}`,
        result: `RESULTADO (R):\n${assessment.result || 'Avaliação clínica inicial concluída com sucesso.'}`,
        evolution: `EVOLUÇÃO (E):\n${assessment.evolution || 'Plano de cuidado personalizado estabelecido.'}`,
        recommendations: [
          'Continuar acompanhamento clínico regular',
          'Seguir protocolo de tratamento estabelecido',
          'Manter comunicação com equipe médica',
          'Realizar avaliações periódicas conforme metodologia definida',
          'Monitoramento dos objetivos terapêuticos estabelecidos'
        ],
        scores: {
          clinical_score: 75,
          treatment_adherence: 80,
          symptom_improvement: 70,
          quality_of_life: 85
        }
      }
    )

    // Remover da lista de avaliações ativas
    this.activeAssessments.delete(userId)

    return {
      success: true,
      data: {
        reportId: report.id,
        reportGenerated: true,
        assessmentCompleted: true
      },
      requiresResponse: true // Assistant deve mencionar o relatório gerado
    }
  }

  /**
   * Gerar relatório manualmente
   */
  private async generateReport(userId: string, platformData?: any): Promise<PlatformActionResult> {
    const patientName = platformData?.user?.name || 'Paciente'

    const report = await clinicalReportService.generateAIReport(
      userId,
      patientName,
      {
        investigation: 'Dados coletados através da avaliação clínica inicial.',
        methodology: 'Aplicação da Arte da Entrevista Clínica (AEC) com protocolo IMRE.',
        result: 'Avaliação clínica inicial concluída.',
        evolution: 'Plano de cuidado personalizado estabelecido.',
        recommendations: [
          'Continuar acompanhamento clínico regular',
          'Seguir protocolo de tratamento estabelecido',
          'Manter comunicação com equipe médica'
        ],
        scores: {
          clinical_score: 75,
          treatment_adherence: 80,
          symptom_improvement: 70,
          quality_of_life: 85
        }
      }
    )

    return {
      success: true,
      data: {
        reportId: report.id,
        reportGenerated: true
      },
      requiresResponse: true
    }
  }

  /**
   * Consultar dashboard do paciente
   */
  private async queryDashboard(userId: string): Promise<PlatformActionResult> {
    try {
      const reports = await clinicalReportService.getPatientReports(userId)

      return {
        success: true,
        data: {
          reports,
          reportCount: reports.length
        },
        requiresResponse: true
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erro ao consultar dashboard',
        requiresResponse: true
      }
    }
  }

  /**
   * Atualizar estado da avaliação (chamado pelo sistema de conversa)
   */
  updateAssessmentState(userId: string, state: any): void {
    const assessment = this.activeAssessments.get(userId)
    if (assessment) {
      Object.assign(assessment, state)
      assessment.lastUpdate = new Date()
      this.activeAssessments.set(userId, assessment)
    }
  }

  /**
   * Obter estado atual da avaliação
   */
  getAssessmentState(userId: string): any | null {
    return this.activeAssessments.get(userId) || null
  }

  /**
   * Consultar pacientes ativos do médico
   */
  private async queryPatients(userId: string): Promise<PlatformActionResult> {
    try {
      // Múltiplas fontes de dados de pacientes
      const patientsMap = new Map<string, any>()

      // 1. Buscar pacientes das avaliações clínicas
      const { data: assessments, error: assessmentsError } = await supabase
        .from('clinical_assessments')
        .select('*, patient_id, data')
        .order('created_at', { ascending: false })

      if (!assessmentsError && assessments) {
        assessments.forEach(assessment => {
          const patientId = assessment.patient_id
          if (patientId) {
            const assessmentData = assessment.data || {}
            const patientName = assessmentData.name || assessment.patient_name || `Paciente ${patientId.slice(0, 8)}`
            
            if (!patientsMap.has(patientId)) {
              patientsMap.set(patientId, {
                id: patientId,
                name: patientName,
                cpf: assessmentData.cpf || '',
                phone: assessmentData.phone || '',
                age: assessmentData.age || 0,
                status: assessment.status === 'completed' ? 'Ativo' : (assessment.status || 'Ativo'),
                assessmentCount: 1,
                lastAssessment: assessment.created_at,
                source: 'assessments'
              })
            } else {
              const patient = patientsMap.get(patientId)
              patient.assessmentCount = (patient.assessmentCount || 0) + 1
              if (!patient.lastAssessment || new Date(assessment.created_at) > new Date(patient.lastAssessment)) {
                patient.lastAssessment = assessment.created_at
              }
            }
          }
        })
      }

      // 2. Buscar pacientes da tabela users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, user_type, cpf, phone')
        .eq('user_type', 'patient')

      if (!usersError && users) {
        users.forEach(user => {
          if (!patientsMap.has(user.id)) {
            patientsMap.set(user.id, {
              id: user.id,
              name: user.name || `Paciente ${user.id.slice(0, 8)}`,
              email: user.email,
              cpf: user.cpf || '',
              phone: user.phone || '',
              status: 'Ativo',
              assessmentCount: 0,
              source: 'users'
            })
          } else {
            // Atualizar dados do usuário se já existe
            const patient = patientsMap.get(user.id)
            if (user.name && !patient.name.includes('Paciente')) {
              patient.name = user.name
            }
            if (user.cpf) patient.cpf = user.cpf
            if (user.phone) patient.phone = user.phone
            if (user.email) patient.email = user.email
            patient.source = 'both'
          }
        })
      }

      // 3. Buscar pacientes de relatórios clínicos (se houver patient_id)
      const { data: reports, error: reportsError } = await supabase
        .from('clinical_reports')
        .select('patient_id, patient_name, created_at')
        .not('patient_id', 'is', null)
        .order('created_at', { ascending: false })

      if (!reportsError && reports) {
        reports.forEach(report => {
          const patientId = report.patient_id
          if (patientId) {
            if (!patientsMap.has(patientId)) {
              patientsMap.set(patientId, {
                id: patientId,
                name: report.patient_name || `Paciente ${patientId.slice(0, 8)}`,
                status: 'Ativo',
                reportCount: 1,
                lastReport: report.created_at,
                source: 'reports'
              })
            } else {
              const patient = patientsMap.get(patientId)
              patient.reportCount = (patient.reportCount || 0) + 1
              if (report.patient_name && !patient.name.includes('Paciente')) {
                patient.name = report.patient_name
              }
            }
          }
        })
      }

      const patients = Array.from(patientsMap.values())
        .sort((a, b) => {
          // Ordenar por última avaliação/relatório (mais recente primeiro)
          const aDate = a.lastAssessment || a.lastReport
          const bDate = b.lastAssessment || b.lastReport
          if (!aDate) return 1
          if (!bDate) return -1
          return new Date(bDate).getTime() - new Date(aDate).getTime()
        })

      return {
        success: true,
        data: {
          patients,
          totalPatients: patients.length,
          activePatients: patients.filter(p => 
            p.status === 'Ativo' || 
            p.status === 'completed' || 
            p.status === 'in_progress' ||
            p.status === 'active'
          ).length
        },
        requiresResponse: true
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar pacientes:', error)
      return {
        success: false,
        error: error.message || 'Erro ao buscar pacientes',
        requiresResponse: true
      }
    }
  }

  /**
   * Consultar número de relatórios emitidos
   */
  private async queryReportsCount(userId: string): Promise<PlatformActionResult> {
    try {
      // Buscar relatórios clínicos
      const { data: reports, error } = await supabase
        .from('clinical_reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const totalReports = reports?.length || 0
      
      // Relatórios por status
      const completed = reports?.filter(r => r.status === 'completed' || r.status === 'validated').length || 0
      const pending = reports?.filter(r => r.status === 'pending' || r.status === 'shared').length || 0
      const inProgress = reports?.filter(r => r.status === 'in_progress').length || 0

      // Relatórios de hoje
      const today = new Date().toISOString().split('T')[0]
      const todayReports = reports?.filter(r => 
        r.created_at?.startsWith(today)
      ).length || 0

      return {
        success: true,
        data: {
          totalReports,
          completed,
          pending,
          inProgress,
          todayReports
        },
        requiresResponse: true
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar relatórios:', error)
      return {
        success: false,
        error: error.message || 'Erro ao buscar relatórios',
        requiresResponse: true
      }
    }
  }

  /**
   * Consultar agendamentos
   */
  private async queryAppointments(userId: string): Promise<PlatformActionResult> {
    try {
      // Buscar agendamentos (se a tabela existir)
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', userId)
        .order('appointment_date', { ascending: true })

      if (error && error.code !== 'PGRST116') { // Ignorar erro se tabela não existir
        throw error
      }

      const appointmentsData = appointments || []
      
      // Agendamentos de hoje
      const today = new Date().toISOString().split('T')[0]
      const todayAppointments = appointmentsData.filter(a => 
        a.appointment_date?.startsWith(today)
      )

      // Próximos agendamentos (próximos 7 dias)
      const nextWeek = new Date()
      nextWeek.setDate(nextWeek.getDate() + 7)
      const upcomingAppointments = appointmentsData.filter(a => {
        if (!a.appointment_date) return false
        const apptDate = new Date(a.appointment_date)
        return apptDate >= new Date() && apptDate <= nextWeek
      })

      return {
        success: true,
        data: {
          totalAppointments: appointmentsData.length,
          todayAppointments: todayAppointments.length,
          upcomingAppointments: upcomingAppointments.length,
          appointments: todayAppointments.slice(0, 10) // Próximos 10
        },
        requiresResponse: true
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar agendamentos:', error)
      return {
        success: false,
        error: error.message || 'Erro ao buscar agendamentos',
        requiresResponse: true
      }
    }
  }

  /**
   * Consultar KPIs da plataforma
   */
  private async queryKPIs(userId: string): Promise<PlatformActionResult> {
    try {
      // Buscar dados para KPIs
      const [assessmentsResult, reportsResult, patientsResult] = await Promise.all([
        supabase.from('clinical_assessments').select('*'),
        supabase.from('clinical_reports').select('*'),
        supabase.from('clinical_assessments').select('patient_id').not('patient_id', 'is', null)
      ])

      const assessments = assessmentsResult.data || []
      const reports = reportsResult.data || []
      const patientIds = new Set((patientsResult.data || []).map(a => a.patient_id).filter(Boolean))

      // Avaliações de hoje
      const today = new Date().toISOString().split('T')[0]
      const todayAssessments = assessments.filter(a => 
        a.created_at?.startsWith(today)
      ).length

      // KPIs
      const kpis = {
        totalPatients: patientIds.size,
        activeAssessments: assessments.filter(a => a.status === 'in_progress').length,
        completedAssessments: assessments.filter(a => a.status === 'completed').length,
        totalReports: reports.length,
        todayAssessments,
        pendingReports: reports.filter(r => r.status === 'pending' || r.status === 'shared').length,
        completedReports: reports.filter(r => r.status === 'completed' || r.status === 'validated').length
      }

      return {
        success: true,
        data: kpis,
        requiresResponse: true
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar KPIs:', error)
      return {
        success: false,
        error: error.message || 'Erro ao buscar KPIs',
        requiresResponse: true
      }
    }
  }
}

// Singleton
let platformFunctionsModuleInstance: PlatformFunctionsModule | null = null

export function getPlatformFunctionsModule(): PlatformFunctionsModule {
  if (!platformFunctionsModuleInstance) {
    platformFunctionsModuleInstance = new PlatformFunctionsModule()
  }
  return platformFunctionsModuleInstance
}

