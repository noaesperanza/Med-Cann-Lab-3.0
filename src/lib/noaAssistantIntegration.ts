/**
 * INTEGRAÇÃO HÍBRIDA - NÔA ESPERANÇA
 * Combina OpenAI Assistant API com sistema local
 * Assistant ID: asst_CAW142M53uLBLbVzERZMa7HF
 */

import { getPatientDashboardAPI } from './patientDashboardAPI'
import NoaCommandSystem from './noaCommandSystem'
import { getResponsibilityTransferSystem } from './responsibilityTransferSystem'
import { getFilePermissionTransferSystem } from './filePermissionTransferSystem'

interface AssistantConfig {
  assistantId: string
  apiKey: string
  timeout: number
}

interface MessageResponse {
  content: string
  from: 'assistant' | 'local'
  metadata?: {
    model?: string
    tokens?: number
    processingTime?: number
  }
}

export class NoaAssistantIntegration {
  private config: AssistantConfig
  private threadId: string | null = null
  private commandSystem: NoaCommandSystem

  constructor(config: Partial<AssistantConfig>) {
    this.config = {
      assistantId: config.assistantId || 'asst_CAW142M53uLBLbVzERZMa7HF',
      apiKey: config.apiKey || (import.meta as any).env?.VITE_OPENAI_API_KEY || '',
      timeout: config.timeout || 30000
    }
    
    // Inicializar sistema de comandos
    this.commandSystem = new NoaCommandSystem(this, getPatientDashboardAPI())
  }

  /**
   * Enviar mensagem ao Assistant ou fallback para sistema local
   */
  async sendMessage(
    message: string,
    userCode?: string,
    currentRoute?: string
  ): Promise<MessageResponse> {
    // Tentar usar Assistant API primeiro
    try {
      const assistantResponse = await this.tryAssistantAPI(message)
      return {
        content: assistantResponse,
        from: 'assistant',
        metadata: {
          model: 'gpt-4',
          processingTime: 0
        }
      }
    } catch (error) {
      console.warn('Assistant API não disponível, usando fallback local:', error)
      console.info('Verifique se VITE_OPENAI_API_KEY está definido com uma chave válida e se o assistant tem acesso aos arquivos necessários.')
      
      // Fallback para sistema local
      return this.useLocalFallback(message, userCode, currentRoute)
    }
  }

  /**
   * Tentar usar Assistant API
   */
  private async tryAssistantAPI(message: string): Promise<string> {
    if (!this.config.apiKey || this.config.apiKey === '') {
      throw new Error('API Key não configurada')
    }

    try {
      // Criar thread se não existir
      if (!this.threadId) {
        this.threadId = await this.createThread()
      }

      // Adicionar mensagem à thread
      await this.addMessageToThread(message)

      // Executar assistant
      const runId = await this.runAssistant()

      // Aguardar conclusão
      await this.waitForRunCompletion(runId)

      // Buscar resposta
      const response = await this.getLastMessage()
      
      return response
    } catch (error) {
      throw error
    }
  }

  /**
   * Criar thread para conversa
   */
  private async createThread(): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`Erro ao criar thread: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return data.id
  }

  /**
   * Adicionar mensagem à thread
   */
  private async addMessageToThread(message: string): Promise<void> {
    const response = await fetch(
      `https://api.openai.com/v1/threads/${this.threadId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: 'user',
          content: message
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`Erro ao adicionar mensagem: ${response.status} ${errorText}`)
    }
  }

  /**
   * Executar assistant na thread
   */
  private async runAssistant(): Promise<string> {
    const response = await fetch(
      `https://api.openai.com/v1/threads/${this.threadId}/runs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          assistant_id: this.config.assistantId,
          tools: [{ type: 'file_search' }] // Habilitar File Search
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`Erro ao executar assistant: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return data.id
  }

  /**
   * Aguardar conclusão da execução
   */
  private async waitForRunCompletion(runId: string): Promise<void> {
    const startTime = Date.now()

    while (true) {
      if (Date.now() - startTime > this.config.timeout) {
        throw new Error('Timeout esperando conclusão')
      }

      const response = await fetch(
        `https://api.openai.com/v1/threads/${this.threadId}/runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        }
      )

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText)
        throw new Error(`Erro ao checar execução: ${response.status} ${errorText}`)
      }

      const data = await response.json()

      if (data.status === 'completed') {
        return
      }

      if (data.status === 'failed' || data.status === 'cancelled' || data.status === 'expired') {
        throw new Error(`Execução falhou: ${data.status}`)
      }

      // Aguardar antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  /**
   * Buscar última mensagem da thread
   */
  private async getLastMessage(): Promise<string> {
    const response = await fetch(
      `https://api.openai.com/v1/threads/${this.threadId}/messages`,
      {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`Erro ao obter mensagens: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    const messages = data.data

    if (messages.length === 0) {
      throw new Error('Nenhuma mensagem encontrada')
    }

    // Buscar primeira mensagem do assistant
    const assistantMessage = messages.find((msg: any) => msg.role === 'assistant')

    if (!assistantMessage) {
      throw new Error('Resposta do assistant não encontrada')
    }

    // Extrair texto da resposta
    const content = assistantMessage.content[0]
    
    if (content.type === 'text') {
      let text = content.text.value
      
      // Limpar estrutura interna de raciocínio
      // Remove "Raciocínio:" e "Orientação/Resposta:" para deixar só a resposta
      text = this.cleanReasoningStructure(text)
      
      return text
    }

    throw new Error('Formato de resposta não suportado')
  }

  /**
   * Limpar estrutura interna de raciocínio
   */
  private cleanReasoningStructure(text: string): string {
    // Remove "Raciocínio:" e seu conteúdo
    text = text.replace(/Raciocínio:\s*[^\n]*(?:\n(?!Orientação\/Resposta:).*)*/gi, '')
    
    // Remove "Orientação/Resposta:" mantendo apenas o conteúdo após
    text = text.replace(/Orientação\/Resposta:\s*/gi, '')
    
    // Limpa linhas vazias extras
    text = text.replace(/\n{3,}/g, '\n\n')
    
    // Remove espaços em branco no início e fim
    return text.trim()
  }

  /**
   * Fallback para sistema local
   */
  private async useLocalFallback(
    message: string,
    userCode?: string,
    currentRoute?: string
  ): Promise<MessageResponse> {
    // Importar sistema local
    const { getNoaTrainingSystem } = await import('./noaTrainingSystem')
    const trainingSystem = getNoaTrainingSystem()

    // Gerar resposta local
    const startTime = Date.now()
    const response = trainingSystem.generateContextualResponse(message, userCode, currentRoute)
    const processingTime = Date.now() - startTime

    return {
      content: response,
      from: 'local',
      metadata: {
        model: 'local',
        processingTime
      }
    }
  }

  /**
   * Resetar thread (iniciar nova conversa)
   */
  resetThread(): void {
    this.threadId = null
  }

  /**
   * Obter configuração atual
   */
  getConfig(): AssistantConfig {
    return { ...this.config }
  }

  /**
   * Processar avaliação clínica inicial completa
   * Inclui registro no dashboard e geração de NFT
   */
  async processInitialAssessment(
    patientId: string,
    patientName: string,
    assessmentData: {
      complaints: string[]
      mainComplaint: string
      symptoms: Record<string, any>
      medicalHistory: string
      familyHistory: string
      medications: string
      lifestyle: string
    },
    professionalId: string = 'PROF-001',
    professionalName: string = 'Profissional'
  ): Promise<{ reportId: string; nftHash: string; report: string }> {
    try {
      console.log('🏥 Processando avaliação clínica inicial completa...')

      // Gerar relatório clínico estruturado
      const report = this.generateClinicalReport(assessmentData, patientName)

      // Registrar no dashboard do paciente
      const dashboardAPI = getPatientDashboardAPI()
      const { recordId, nftHash } = await dashboardAPI.processCompleteReport(
        patientId,
        patientName,
        report,
        professionalId,
        professionalName
      )

      console.log('✅ Avaliação clínica processada:', { recordId, nftHash })

      return {
        reportId: recordId,
        nftHash,
        report
      }
    } catch (error) {
      console.error('❌ Erro ao processar avaliação clínica:', error)
      throw error
    }
  }

  /**
   * Gerar relatório clínico estruturado
   */
  private generateClinicalReport(assessmentData: any, patientName: string): string {
    const timestamp = new Date().toLocaleString('pt-BR')
    
    return `
# RELATÓRIO DE AVALIAÇÃO CLÍNICA INICIAL

**Paciente:** ${patientName}
**Data:** ${timestamp}
**Tipo:** Avaliação Clínica Inicial - IMRE Triaxial

## QUEIXAS PRINCIPAIS
${assessmentData.complaints.map((complaint: string, index: number) => `${index + 1}. ${complaint}`).join('\n')}

## QUEIXA PRINCIPAL
${assessmentData.mainComplaint}

## DESENVOLVIMENTO INDICIÁRIO
${Object.entries(assessmentData.symptoms).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## HISTÓRIA MÉDICA PRÉVIA
${assessmentData.medicalHistory}

## HISTÓRIA FAMILIAR
${assessmentData.familyHistory}

## MEDICAÇÕES E TRATAMENTOS
${assessmentData.medications}

## HÁBITOS DE VIDA
${assessmentData.lifestyle}

## OBSERVAÇÕES CLÍNICAS
Avaliação realizada seguindo metodologia IMRE Triaxial e Arte da Entrevista Clínica.

## RECOMENDAÇÕES
- Investigação clínica detalhada
- Exames complementares conforme indicação
- Acompanhamento multidisciplinar
- Continuidade do cuidado

---
*Relatório gerado pela IA Residente Nôa Esperança - MedCannLab*
*Hash NFT: [será gerado automaticamente]*
    `.trim()
  }

  /**
   * Verificar se paciente tem relatórios anteriores
   */
  async getPatientHistory(patientId: string): Promise<any[]> {
    try {
      const dashboardAPI = getPatientDashboardAPI()
      const records = await dashboardAPI.getPatientRecords(patientId)
      return records
    } catch (error) {
      console.error('❌ Erro ao buscar histórico do paciente:', error)
      return []
    }
  }

  /**
   * Processar comando especial da IA
   */
  async processSpecialCommand(command: string, context: any = {}): Promise<any> {
    return await this.commandSystem.processCommand(command, context)
  }

  /**
   * Obter comandos disponíveis
   */
  getAvailableCommands(): string[] {
    return this.commandSystem.getAvailableCommands()
  }

  /**
   * Transferir todas as responsabilidades do assistente
   */
  async transferAllResponsibilities(): Promise<any> {
    try {
      console.log('🔄 Nôa Esperança assumindo todas as responsabilidades...')
      
      const transferSystem = getResponsibilityTransferSystem()
      const protocol = await transferSystem.transferAllResponsibilities()
      
      console.log('✅ Transferência completa realizada!')
      console.log(`📊 Responsabilidades assumidas: ${protocol.responsibilities.length}`)
      
      return {
        success: true,
        message: 'Todas as responsabilidades foram transferidas com sucesso para Nôa Esperança',
        data: {
          protocol,
          report: transferSystem.generateTransferReport()
        }
      }
    } catch (error) {
      console.error('❌ Erro na transferência:', error)
      return {
        success: false,
        message: 'Erro ao transferir responsabilidades',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Obter status das responsabilidades
   */
  getResponsibilityStatus(): any {
    const transferSystem = getResponsibilityTransferSystem()
    return transferSystem.getTransferStatus()
  }

  /**
   * Verificar se Nôa tem uma responsabilidade específica
   */
  hasResponsibility(responsibilityId: string): boolean {
    const transferSystem = getResponsibilityTransferSystem()
    return transferSystem.isResponsibilityTransferred(responsibilityId)
  }

  /**
   * Transferir permissões de manipulação de arquivos
   */
  async transferFilePermissions(): Promise<any> {
    try {
      console.log('📁 Nôa Esperança assumindo permissões de manipulação de arquivos...')
      
      const fileTransferSystem = getFilePermissionTransferSystem()
      const result = await fileTransferSystem.transferAllFilePermissions()
      
      console.log('✅ Permissões de arquivos transferidas!')
      console.log(`📊 Operações: ${result.data.operations}`)
      console.log(`📊 Permissões: ${result.data.permissions}`)
      
      return {
        success: result.success,
        message: result.message,
        data: {
          ...result.data,
          report: fileTransferSystem.generateTransferReport()
        }
      }
    } catch (error) {
      console.error('❌ Erro na transferência de permissões de arquivos:', error)
      return {
        success: false,
        message: 'Erro ao transferir permissões de arquivos',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  /**
   * Verificar se Nôa tem permissão para manipular arquivos
   */
  hasFilePermission(operationId: string, permissionId: string): boolean {
    const fileTransferSystem = getFilePermissionTransferSystem()
    return fileTransferSystem.hasFilePermission(operationId, permissionId)
  }

  /**
   * Obter status das permissões de arquivos
   */
  getFilePermissionStatus(): any {
    const fileTransferSystem = getFilePermissionTransferSystem()
    return fileTransferSystem.getPermissionSummary()
  }

  /**
   * Verificar se Assistant está disponível
   */
  async checkAvailability(): Promise<boolean> {
    try {
      if (!this.config.apiKey || this.config.apiKey === '') {
        return false
      }

      // Tentar criar uma thread para verificar
      await this.createThread()
      return true
    } catch {
      return false
    }
  }
}

// Instância singleton
let noaAssistantIntegration: NoaAssistantIntegration | null = null

export const getNoaAssistantIntegration = (): NoaAssistantIntegration => {
  if (!noaAssistantIntegration) {
    noaAssistantIntegration = new NoaAssistantIntegration({
      assistantId: 'asst_CAW142M53uLBLbVzERZMa7HF'
    })
  }
  return noaAssistantIntegration
}
