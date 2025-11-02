/**
 * Sistema de Comandos da IA Residente
 * Permite que a Nôa gerencie a plataforma através de comandos específicos
 */

interface CommandResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

interface AssessmentData {
  patientId: string
  patientName: string
  complaints: string[]
  mainComplaint: string
  symptoms: Record<string, any>
  medicalHistory: string
  familyHistory: string
  medications: string
  lifestyle: string
}

class NoaCommandSystem {
  private assistantIntegration: any
  private dashboardAPI: any

  constructor(assistantIntegration: any, dashboardAPI: any) {
    this.assistantIntegration = assistantIntegration
    this.dashboardAPI = dashboardAPI
  }

  /**
   * Processar comando da IA
   */
  async processCommand(command: string, context: any = {}): Promise<CommandResult> {
    try {
      console.log('🤖 Processando comando da IA:', command)

      const commandLower = command.toLowerCase().trim()

      // Comandos de avaliação clínica
      if (commandLower.includes('finalizar avaliação') || commandLower.includes('gerar relatório')) {
        return await this.finalizeAssessment(context)
      }

      if (commandLower.includes('buscar paciente') || commandLower.includes('histórico paciente')) {
        return await this.searchPatient(context.patientId)
      }

      if (commandLower.includes('emitir nft') || commandLower.includes('gerar nft')) {
        return await this.generateNFT(context.reportId)
      }

      if (commandLower.includes('dashboard paciente') || commandLower.includes('acessar dashboard')) {
        return await this.accessPatientDashboard(context.patientId)
      }

      if (commandLower.includes('status plataforma') || commandLower.includes('verificar sistema')) {
        return await this.checkSystemStatus()
      }

      if (commandLower.includes('transferir responsabilidades') || commandLower.includes('assumir responsabilidades')) {
        return await this.transferResponsibilities()
      }

      if (commandLower.includes('status responsabilidades') || commandLower.includes('verificar responsabilidades')) {
        return await this.checkResponsibilityStatus()
      }

      if (commandLower.includes('transferir permissões arquivos') || commandLower.includes('permissões arquivos')) {
        return await this.transferFilePermissions()
      }

      if (commandLower.includes('status permissões arquivos') || commandLower.includes('verificar permissões arquivos')) {
        return await this.checkFilePermissionStatus()
      }

      // Comando não reconhecido
      return {
        success: false,
        message: 'Comando não reconhecido. Comandos disponíveis: finalizar avaliação, buscar paciente, emitir NFT, dashboard paciente, status plataforma.',
        error: 'UNKNOWN_COMMAND'
      }

    } catch (error) {
      console.error('❌ Erro ao processar comando:', error)
      return {
        success: false,
        message: 'Erro interno ao processar comando',
        error: error instanceof Error ? error.message : 'UNKNOWN_ERROR'
      }
    }
  }

  /**
   * Finalizar avaliação clínica e gerar relatório
   */
  private async finalizeAssessment(context: AssessmentData): Promise<CommandResult> {
    try {
      if (!context.patientId || !context.patientName) {
        return {
          success: false,
          message: 'Dados do paciente incompletos para finalizar avaliação',
          error: 'MISSING_PATIENT_DATA'
        }
      }

      const result = await this.assistantIntegration.processInitialAssessment(
        context.patientId,
        context.patientName,
        context,
        'PROF-001',
        'Profissional'
      )

      return {
        success: true,
        message: `Avaliação clínica finalizada com sucesso! Relatório ID: ${result.reportId}, NFT Hash: ${result.nftHash}`,
        data: {
          reportId: result.reportId,
          nftHash: result.nftHash,
          report: result.report
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao finalizar avaliação clínica',
        error: error instanceof Error ? error.message : 'ASSESSMENT_ERROR'
      }
    }
  }

  /**
   * Buscar histórico do paciente
   */
  private async searchPatient(patientId: string): Promise<CommandResult> {
    try {
      if (!patientId) {
        return {
          success: false,
          message: 'ID do paciente não fornecido',
          error: 'MISSING_PATIENT_ID'
        }
      }

      const history = await this.assistantIntegration.getPatientHistory(patientId)

      return {
        success: true,
        message: `Histórico do paciente encontrado: ${history.length} registros`,
        data: history
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao buscar histórico do paciente',
        error: error instanceof Error ? error.message : 'SEARCH_ERROR'
      }
    }
  }

  /**
   * Gerar NFT para relatório
   */
  private async generateNFT(reportId: string): Promise<CommandResult> {
    try {
      if (!reportId) {
        return {
          success: false,
          message: 'ID do relatório não fornecido',
          error: 'MISSING_REPORT_ID'
        }
      }

      const nftHash = await this.dashboardAPI.generateNFTHash(reportId, {
        patientId: 'current',
        reportId,
        timestamp: new Date(),
        professionalId: 'DEV-001',
        contentHash: 'generated',
        blockchain: 'polygon'
      })

      return {
        success: true,
        message: `NFT gerado com sucesso! Hash: ${nftHash}`,
        data: { nftHash }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao gerar NFT',
        error: error instanceof Error ? error.message : 'NFT_ERROR'
      }
    }
  }

  /**
   * Acessar dashboard do paciente
   */
  private async accessPatientDashboard(patientId: string): Promise<CommandResult> {
    try {
      if (!patientId) {
        return {
          success: false,
          message: 'ID do paciente não fornecido',
          error: 'MISSING_PATIENT_ID'
        }
      }

      const records = await this.dashboardAPI.getPatientRecords(patientId)

      return {
        success: true,
        message: `Dashboard do paciente acessado. ${records.length} registros encontrados.`,
        data: {
          patientId,
          records,
          dashboardUrl: `/app/patient-dashboard/${patientId}`
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao acessar dashboard do paciente',
        error: error instanceof Error ? error.message : 'DASHBOARD_ERROR'
      }
    }
  }

  /**
   * Verificar status do sistema
   */
  private async checkSystemStatus(): Promise<CommandResult> {
    try {
      const apiAvailable = await this.dashboardAPI.checkAvailability()
      const assistantAvailable = await this.assistantIntegration.checkAvailability()

      return {
        success: true,
        message: 'Status do sistema verificado',
        data: {
          apiAvailable,
          assistantAvailable,
          timestamp: new Date().toISOString(),
          systemStatus: apiAvailable && assistantAvailable ? 'OPERATIONAL' : 'DEGRADED'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao verificar status do sistema',
        error: error instanceof Error ? error.message : 'STATUS_ERROR'
      }
    }
  }

  /**
   * Transferir responsabilidades do assistente
   */
  private async transferResponsibilities(): Promise<CommandResult> {
    try {
      const result = await this.assistantIntegration.transferAllResponsibilities()
      
      return {
        success: result.success,
        message: result.message,
        data: result.data
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao transferir responsabilidades',
        error: error instanceof Error ? error.message : 'TRANSFER_ERROR'
      }
    }
  }

  /**
   * Verificar status das responsabilidades
   */
  private async checkResponsibilityStatus(): Promise<CommandResult> {
    try {
      const status = this.assistantIntegration.getResponsibilityStatus()
      
      return {
        success: true,
        message: `Status das responsabilidades: ${status.transferred}/${status.total} transferidas`,
        data: status
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao verificar status das responsabilidades',
        error: error instanceof Error ? error.message : 'STATUS_ERROR'
      }
    }
  }
  /**
   * Transferir permissões de arquivos
   */
  private async transferFilePermissions(): Promise<CommandResult> {
    try {
      const result = await this.assistantIntegration.transferFilePermissions()
      
      return {
        success: result.success,
        message: result.message,
        data: result.data
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao transferir permissões de arquivos',
        error: error instanceof Error ? error.message : 'FILE_PERMISSION_ERROR'
      }
    }
  }

  /**
   * Verificar status das permissões de arquivos
   */
  private async checkFilePermissionStatus(): Promise<CommandResult> {
    try {
      const status = this.assistantIntegration.getFilePermissionStatus()
      
      return {
        success: true,
        message: `Status das permissões de arquivos: ${status.transferredPermissions}/${status.totalPermissions} transferidas`,
        data: status
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao verificar status das permissões de arquivos',
        error: error instanceof Error ? error.message : 'FILE_STATUS_ERROR'
      }
    }
  }
  /**
   * Listar comandos disponíveis
   */
  getAvailableCommands(): string[] {
    return [
      'finalizar avaliação - Finaliza avaliação clínica e gera relatório',
      'buscar paciente - Busca histórico do paciente',
      'emitir nft - Gera hash NFT para relatório',
      'dashboard paciente - Acessa dashboard do paciente',
      'status plataforma - Verifica status do sistema',
      'transferir responsabilidades - Assume todas as responsabilidades do assistente',
      'status responsabilidades - Verifica status das responsabilidades transferidas',
      'transferir permissões arquivos - Transfere permissões de manipulação de arquivos',
      'status permissões arquivos - Verifica status das permissões de arquivos'
    ]
  }
}

export default NoaCommandSystem
