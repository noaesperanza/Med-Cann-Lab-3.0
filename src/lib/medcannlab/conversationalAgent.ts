import { getMedCannLabApiClient, MedCannLabApiClient } from './apiClient'
import { parseIntent } from './nlp'
import {
  ConversationContext,
  ConversationalIntent,
  KnowledgeLibraryRequest,
  ParsedIntent,
  PlatformStatus,
  SimulationActionPayload,
  SimulationFilters,
  SimulationResponse,
  TrainingContextRequest,
  TrainingContextResponse
} from './types'
import { getAuditLogger } from './auditLogger'
import { NoaEsperancaCore, noaEsperancaConfig, NoaInteraction } from '../noaEsperancaCore'
import { getMedCannLabApiKeyManager } from './apiKeyManager'
import { MedCannLabApiError } from './errors'

interface HandleMessageInput {
  conversationId: string
  userId?: string
  userName?: string
  message: string
  locale?: string
}

interface HandleMessageResult {
  reply: string
  intent: ConversationalIntent
  confidence: number
  followUpQuestions?: string[]
  usedEndpoints?: string[]
  data?: Record<string, unknown>
  metadata?: Record<string, unknown>
}

interface IntentRouteMeta {
  conversationId: string
  userId?: string
  userName?: string
  originalMessage: string
  context: ConversationContext
}

const DEFAULT_FOLLOW_UP = [
  'Deseja aprofundar em algum protocolo específico?',
  'Posso abrir um novo cenário de simulação para você agora?',
  'Quer que eu organize um sumário IMRE deste caso?'
]

export class MedCannLabConversationalAgent {
  private readonly apiClient: MedCannLabApiClient
  private readonly noaCore: NoaEsperancaCore
  private readonly contexts: Map<string, ConversationContext> = new Map()

  constructor(apiClient: MedCannLabApiClient = getMedCannLabApiClient()) {
    this.apiClient = apiClient
    this.noaCore = new NoaEsperancaCore(noaEsperancaConfig)
  }

  async handleMessage(input: HandleMessageInput): Promise<HandleMessageResult> {
    const { conversationId, message, userId, userName } = input
    const parsedIntent = parseIntent(message)
    const context = this.getOrCreateContext(conversationId, userId)

    context.history.push({
      role: 'user',
      message,
      timestamp: new Date().toISOString(),
      intent: parsedIntent.intent
    })
    context.lastUpdatedAt = new Date().toISOString()

    const routeMeta: IntentRouteMeta = {
      conversationId,
      userId,
      userName,
      originalMessage: message,
      context
    }

    const result = await this.routeIntent(parsedIntent, routeMeta)

    context.history.push({
      role: 'noa',
      message: result.reply,
      timestamp: new Date().toISOString(),
      intent: parsedIntent.intent
    })
    context.activeIntent = parsedIntent.intent
    context.focusArea = parsedIntent.focusArea ?? context.focusArea
    context.imreAxes = parsedIntent.axes ?? context.imreAxes
    context.lastUpdatedAt = new Date().toISOString()

    await getAuditLogger().log({
      conversationId,
      userId,
      action: `conversation.intent.${parsedIntent.intent.toLowerCase()}`,
      timestamp: new Date().toISOString(),
      metadata: {
        confidence: parsedIntent.confidence,
        entities: parsedIntent.entities
      }
    })

    return {
      reply: result.reply,
      intent: parsedIntent.intent,
      confidence: parsedIntent.confidence,
      followUpQuestions: result.followUpQuestions ?? DEFAULT_FOLLOW_UP,
      usedEndpoints: result.usedEndpoints,
      data: result.data,
      metadata: {
        focusArea: context.focusArea,
        imreAxes: context.imreAxes,
        keyRotation: await this.ensureKeyFreshness()
      }
    }
  }

  getContext(conversationId: string): ConversationContext | undefined {
    return this.contexts.get(conversationId)
  }

  clearContext(conversationId: string): void {
    this.contexts.delete(conversationId)
  }

  private getOrCreateContext(conversationId: string, userId?: string): ConversationContext {
    const existing = this.contexts.get(conversationId)

    if (existing) {
      return existing
    }

    const context: ConversationContext = {
      id: conversationId,
      userId,
      history: [],
      lastUpdatedAt: new Date().toISOString()
    }

    this.contexts.set(conversationId, context)
    return context
  }

  private async routeIntent(parsed: ParsedIntent, meta: IntentRouteMeta): Promise<HandleMessageResult> {
    try {
      switch (parsed.intent) {
        case 'CHECK_STATUS':
          return this.handlePlatformStatus(meta, parsed)
        case 'GET_TRAINING_CONTEXT':
          return this.handleTrainingContext(meta, parsed)
        case 'MANAGE_SIMULATION':
          return this.handleSimulation(meta, parsed)
        case 'ACCESS_LIBRARY':
          return this.handleKnowledge(meta, parsed)
        case 'IMRE_ANALYSIS':
          return this.handleImreAnalysis(meta, parsed)
        case 'HELP':
          return this.handleHelp(meta)
        case 'SMALL_TALK':
          return this.handleSmallTalk(meta)
        default:
          return this.handleFallback(meta)
      }
    } catch (error) {
      const friendlyMessage = this.composeErrorMessage(error)
      return {
        reply: friendlyMessage,
        intent: parsed.intent,
        confidence: parsed.confidence,
        followUpQuestions: ['Deseja tentar novamente ou focar em outro fluxo?']
      }
    }
  }

  private async handlePlatformStatus(meta: IntentRouteMeta, parsed: ParsedIntent): Promise<HandleMessageResult> {
    const status = await this.apiClient.getPlatformStatus({
      audit: {
        action: 'platform.status.query',
        conversationId: meta.conversationId,
        userId: meta.userId
      }
    })

    return {
      reply: this.composeStatusResponse(status, meta.userName),
      intent: parsed.intent,
      confidence: parsed.confidence,
      usedEndpoints: ['/platform/status'],
      data: { status }
    }
  }

  private async handleTrainingContext(meta: IntentRouteMeta, parsed: ParsedIntent): Promise<HandleMessageResult> {
    const request: TrainingContextRequest = {
      profile: meta.userId,
      focusArea: (parsed.focusArea as TrainingContextRequest['focusArea']) ?? undefined,
      includeProtocols: true,
      limit: 5
    }

    const response: TrainingContextResponse = await this.apiClient.getTrainingContext(request, {
      audit: {
        action: 'training.context.query',
        conversationId: meta.conversationId,
        userId: meta.userId,
        metadata: { request: { ...request } }
      }
    })

    const reply = this.composeTrainingResponse(response, parsed.focusArea)
    return {
      reply,
      intent: parsed.intent,
      confidence: parsed.confidence,
      usedEndpoints: ['/training/context'],
      data: { trainingContext: response }
    }
  }

  private async handleSimulation(meta: IntentRouteMeta, parsed: ParsedIntent): Promise<HandleMessageResult> {
    const action = this.detectSimulationAction(meta.originalMessage)
    const filters: SimulationFilters = {
      patientId: parsed.entities.patientId,
      status: action === 'start' ? 'pending' : undefined
    }

    let response: SimulationResponse | null = null
    const usedEndpoints: string[] = []

    if (action === 'create' || action === 'start' || action === 'resume' || action === 'pause' || action === 'complete') {
      const payload: SimulationActionPayload = {
        action,
        simulationId: parsed.entities.simulationId,
        data: {
          focusArea: parsed.focusArea,
          axes: parsed.axes
        }
      }

      response = await this.apiClient.triggerSimulationAction(payload, {
        audit: {
          action: `patients.simulations.${action}`,
          conversationId: meta.conversationId,
          userId: meta.userId,
          metadata: { payload: { ...payload } }
        }
      })
      usedEndpoints.push('/patients/simulations')
    }

    if (!response) {
      response = await this.apiClient.getPatientSimulations(filters, {
        audit: {
          action: 'patients.simulations.list',
          conversationId: meta.conversationId,
          userId: meta.userId,
          metadata: { filters: { ...filters } }
        }
      })
      usedEndpoints.push('/patients/simulations')
    }

    const reply = this.composeSimulationResponse(response, action, parsed)

    return {
      reply,
      intent: parsed.intent,
      confidence: parsed.confidence,
      usedEndpoints,
      data: { simulations: response, action }
    }
  }

  private async handleKnowledge(meta: IntentRouteMeta, parsed: ParsedIntent): Promise<HandleMessageResult> {
    const request: KnowledgeLibraryRequest = {
      query: meta.originalMessage,
      category: this.detectKnowledgeCategory(parsed),
      tags: parsed.focusArea ? [parsed.focusArea] : undefined,
      limit: 5,
      includeContent: false
    }

    const response = await this.apiClient.getKnowledgeLibrary(request, {
      audit: {
        action: 'knowledge.library.query',
        conversationId: meta.conversationId,
        userId: meta.userId,
        metadata: { request: { ...request } }
      }
    })

    const reply = this.composeKnowledgeResponse(response)

    return {
      reply,
      intent: parsed.intent,
      confidence: parsed.confidence,
      usedEndpoints: ['/knowledge/library'],
      data: { knowledge: response }
    }
  }

  private async handleImreAnalysis(meta: IntentRouteMeta, parsed: ParsedIntent): Promise<HandleMessageResult> {
    const interview: NoaInteraction = {
      id: `imre-${Date.now()}`,
      timestamp: new Date(),
      tipo: 'anamnese',
      modalidade: 'texto',
      conteudo: meta.originalMessage,
      contexto: {
        paciente: parsed.entities.patientId ?? 'paciente não identificado',
        sintomas: parsed.axes ?? [],
        queixa: meta.originalMessage,
        historia: meta.context.history.map(entry => entry.message).join('\n')
      },
      resposta: {
        empatia: 0,
        tecnicidade: 0,
        educacao: 0
      }
    }

    const responseText = await this.noaCore.realizarEntrevistaClinica(interview)
    const enrichedResponse = this.decorateWithFollowUps(responseText, parsed.axes)

    return {
      reply: enrichedResponse,
      intent: parsed.intent,
      confidence: parsed.confidence,
      usedEndpoints: [],
      data: { axes: parsed.axes }
    }
  }

  private async handleHelp(meta: IntentRouteMeta): Promise<HandleMessageResult> {
    return {
      reply: 'Posso monitorar o status da plataforma, abrir simulações clínicas, acessar biblioteca médica, ou organizar uma análise IMRE completa. Basta me dizer, por exemplo: "Nôa, inicie a simulação renal avançada" ou "Mostre protocolos de cannabis para diálise".',
      intent: 'HELP',
      confidence: 0.9,
      usedEndpoints: []
    }
  }

  private async handleSmallTalk(meta: IntentRouteMeta): Promise<HandleMessageResult> {
    return {
      reply: 'Fico feliz em acompanhar você por aqui. Quando quiser retomar algum protocolo ou paciente, é só pedir.',
      intent: 'SMALL_TALK',
      confidence: 0.4,
      usedEndpoints: []
    }
  }

  private async handleFallback(meta: IntentRouteMeta): Promise<HandleMessageResult> {
    return {
      reply: 'Vou te ajudar com isso. Pode me dizer se quer olhar status do sistema, simulações, biblioteca ou análise IMRE? Assim aciono o protocolo correto.',
      intent: 'UNKNOWN',
      confidence: 0.1,
      usedEndpoints: []
    }
  }

  private composeStatusResponse(status: PlatformStatus, userName?: string): string {
    const healthyComponents = status.components.filter(component => component.status === 'operational').length
    const degradedComponents = status.components.length - healthyComponents
    const greeting = userName ? `Dr. ${userName.split(' ')[0]}, ` : ''

    return `${greeting}a plataforma está ${status.health === 'operational' ? 'operacional' : 'em estado de alerta'}. ${healthyComponents} módulos principais respondendo bem${degradedComponents > 0 ? ` e ${degradedComponents} com atenção especial` : ''}. Última verificação: ${new Date(status.lastCheckedAt).toLocaleString('pt-BR')}.`
  }

  private composeTrainingResponse(response: TrainingContextResponse, focusArea?: string): string {
    if (!response.context.length) {
      return 'Não encontrei registros recentes de treinamento para este perfil. Posso abrir uma nova simulação ou buscar conteúdo complementar?'
    }

    const highlights = response.context
      .slice(0, 3)
      .map(item => `• ${item.topic}: ${item.summary}`)
      .join('\n')

    const focusMessage = focusArea ? `Foco em ${focusArea}. ` : ''

    return `${focusMessage}Separei os três pontos mais recentes do treinamento:\n${highlights}\nPosso detalhar algum deles ou sugerir protocolos relacionados.`
  }

  private composeSimulationResponse(response: SimulationResponse, action: SimulationActionPayload['action'], parsed: ParsedIntent): string {
    const count = response.simulations.length

    if (count === 0) {
      return 'Nenhum cenário em execução neste momento. Posso iniciar uma simulação empática com base nos dados IMRE que você citou.'
    }

    const first = response.simulations[0]
    const baseMessage = action
      ? `Ação ${action} executada. `
      : ''

    const axesMessage = parsed.axes ? `Abordando eixos ${parsed.axes.join(', ')}. ` : ''

    return `${baseMessage}Tenho ${count} cenário(s) ativo(s). Destaque: ${first.condition} em estágio ${first.stage}. ${axesMessage}Quer que eu estruture as próximas intervenções?`
  }

  private composeKnowledgeResponse(response: { entries: any[]; total: number }): string {
    if (!response.entries.length) {
      return 'Nenhum documento encontrado com esse foco. Posso ajustar os filtros ou buscar diretamente na dissertação clínica principal.'
    }

    const summary = response.entries
      .slice(0, 3)
      .map(entry => `• ${entry.title} (${entry.type})`)
      .join('\n')

    return `Encontrei ${response.total} materiais relevantes. Aqui vão os principais:\n${summary}\nMe avise qual deseja abrir primeiro.`
  }

  private decorateWithFollowUps(response: string, axes?: Array<'somatico' | 'psiquico' | 'social'>): string {
    const axisMessage = axes && axes.length > 0
      ? `Estou acompanhando especialmente os eixos ${axes.join(', ')}. `
      : ''

    return `${response}\n${axisMessage}Podemos seguir para o próximo passo do protocolo IMRE quando desejar.`
  }

  private detectSimulationAction(message: string): SimulationActionPayload['action'] {
    const normalized = message.toLowerCase()

    if (/iniciar|começar|abrir/.test(normalized)) return 'start'
    if (/retomar|continuar|resumir/.test(normalized)) return 'resume'
    if (/pausar|parar/.test(normalized)) return 'pause'
    if (/finalizar|encerrar|concluir/.test(normalized)) return 'complete'
    if (/nova|criar|montar/.test(normalized)) return 'create'
    if (/resetar|reiniciar/.test(normalized)) return 'reset'

    return 'create'
  }

  private detectKnowledgeCategory(parsed: ParsedIntent): KnowledgeLibraryRequest['category'] {
    if (parsed.focusArea === 'nefrologia') return 'protocolos'
    if (parsed.focusArea === 'cannabis') return 'biblioteca'
    if (/dissertação/.test(parsed.rawText.toLowerCase())) return 'dissertacao'
    if (parsed.intent === 'IMRE_ANALYSIS') return 'imre'

    return undefined
  }

  private composeErrorMessage(error: unknown): string {
    if (error instanceof MedCannLabApiError) {
      if (error.status === 401 || error.status === 403) {
        return 'Minha chave de acesso à plataforma precisa ser renovada. Já acionei o protocolo de atualização e aviso quando estiver tudo pronto.'
      }

      return `Encontrei um obstáculo ao acessar a plataforma (${error.message}). Posso tentar novamente ou seguir por outro caminho?`
    }

    return 'Algo inesperado aconteceu, mas continuo aqui com você. Vamos tentar outra abordagem ou repetir o comando?'
  }

  private async ensureKeyFreshness(): Promise<{ refreshed: boolean }> {
    const manager = getMedCannLabApiKeyManager()
    try {
      await manager.getKey()
      return { refreshed: true }
    } catch (error) {
      console.warn('[ConversationalAgent] Não foi possível validar a chave neste momento.', error)
      return { refreshed: false }
    }
  }
}

let agent: MedCannLabConversationalAgent | null = null

export const getConversationalAgent = (): MedCannLabConversationalAgent => {
  if (!agent) {
    agent = new MedCannLabConversationalAgent()
  }

  return agent
}

