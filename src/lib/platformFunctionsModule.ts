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
  type: 'ASSESSMENT_START' | 'ASSESSMENT_COMPLETE' | 'REPORT_GENERATE' | 'DASHBOARD_QUERY' | 'NOTIFY_PROFESSIONAL' | 'NONE'
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
}

// Singleton
let platformFunctionsModuleInstance: PlatformFunctionsModule | null = null

export function getPlatformFunctionsModule(): PlatformFunctionsModule {
  if (!platformFunctionsModuleInstance) {
    platformFunctionsModuleInstance = new PlatformFunctionsModule()
  }
  return platformFunctionsModuleInstance
}

