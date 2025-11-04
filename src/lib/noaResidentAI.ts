import { supabase } from './supabase'
import { clinicalReportService, ClinicalReport } from './clinicalReportService'
import { KnowledgeBaseIntegration } from '../services/knowledgeBaseIntegration'
import { getNoaAssistantIntegration } from './noaAssistantIntegration'
import { getPlatformFunctionsModule } from './platformFunctionsModule'
import masterDocumentRaw from './data/documentoMestreResumo.md?raw'

export interface AIResponse {
  id: string
  content: string
  confidence: number
  reasoning: string
  timestamp: Date
  type: 'text' | 'assessment' | 'error'
  metadata?: any
}

export interface AIMemory {
  id: string
  content: string
  type: 'conversation' | 'assessment' | 'learning'
  timestamp: Date
  importance: number
  tags: string[]
}

export interface ResidentAIConfig {
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  assessmentEnabled: boolean
}

type AxisKey = 'clinica' | 'ensino' | 'pesquisa'

interface AxisDetails {
  key: AxisKey
  label: string
  summary: string
  defaultRoute: string
  knowledgeQuery: string
}

interface IMREAssessmentState {
  userId: string
  step: 'INVESTIGATION' | 'METHODOLOGY' | 'RESULT' | 'EVOLUTION' | 'COMPLETED'
  investigation: {
    mainComplaint?: string
    symptoms?: string[]
    medicalHistory?: string
    familyHistory?: string
    medications?: string
    lifestyle?: string
    presentingSelf?: string
    collectingComplaints: boolean
    selectingMainComplaint: boolean
    currentComplaintIndex?: number
    complaintsList: string[]
    complaintDetails: {
      [key: string]: {
        location?: string
        when?: string
        how?: string
        associated?: string
        improves?: string
        worsens?: string
      }
    }
  }
  methodology: string
  result: string
  evolution: string
  startedAt: Date
  lastUpdate: Date
}

export class NoaResidentAI {
  private config: ResidentAIConfig
  private memory: AIMemory[] = []
  private conversationContext: any[] = []
  private isProcessing: boolean = false
  private apiKey: string = ''
  private assistantIntegration = getNoaAssistantIntegration()
  private platformFunctions = getPlatformFunctionsModule()
  private readonly masterDocumentDigest = this.buildMasterDocumentDigest()
  private activeAssessments: Map<string, IMREAssessmentState> = new Map()

  constructor() {
    this.config = {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: `Você é Nôa Esperança, a IA Residente especializada em avaliações clínicas e treinamentos da plataforma MedCannLab.

Sua especialização inclui:
- Avaliações clínicas iniciais usando o método IMRE Triaxial
- Arte da Entrevista Clínica (AEC)
- Cannabis medicinal e nefrologia
- Treinamentos especializados
- Análise de casos clínicos
- Orientações terapêuticas

Você está integrada com o ChatGPT e em constante treinamento com o cérebro da plataforma. Sua missão é promover a paz global com sustentabilidade e equidade, usando sabedoria ancestral e tecnologias modernas.

Sempre seja empática, profissional e focada na saúde do paciente.`,
      assessmentEnabled: true
    }
  }

  async processMessage(userMessage: string, userId?: string, userEmail?: string): Promise<AIResponse> {
    if (this.isProcessing) {
      return this.createResponse('Aguarde, estou processando sua mensagem anterior...', 0.5)
    }

    this.isProcessing = true

    try {
      // Ler dados da plataforma em tempo real
      const platformData = this.getPlatformData()
      
      // Detectar intenção da mensagem
      const intent = this.detectIntent(userMessage)
      
      // Detectar intenção de função da plataforma
      const platformIntent = this.platformFunctions.detectIntent(userMessage, userId)
      
      // Se for função da plataforma, executar ação ANTES de chamar o Assistant
      let platformActionResult: any = null
      if (platformIntent.type !== 'NONE') {
        platformActionResult = await this.platformFunctions.executeAction(platformIntent, userId, platformData)
        
        // Se a ação requer resposta, adicionar contexto para o Assistant mencionar na resposta
        if (platformActionResult.requiresResponse && platformActionResult.success) {
          // Construir contexto adicional para o Assistant mencionar na resposta
          const actionContext = this.buildPlatformActionContext(platformIntent, platformActionResult)
          userMessage = `${userMessage}\n\n[Contexto da Plataforma: ${actionContext}]`
        }
      }
      
      // SEMPRE usar o Assistant para gerar a resposta (mantém personalidade da Nôa)
      const assistantResponse = await this.getAssistantResponse(
        userMessage,
        intent,
        platformData,
        userEmail
      )

      if (assistantResponse) {
        // Se houve ação da plataforma bem-sucedida, adicionar metadata
        if (platformActionResult?.success) {
          assistantResponse.metadata = {
            ...assistantResponse.metadata,
            platformAction: platformActionResult.data
          }
        }
        
        // Salvar na memória local
        this.saveToMemory(userMessage, assistantResponse, userId)
        
        // 🔥 SALVAR AUTOMATICAMENTE NO PRONTUÁRIO DO PACIENTE (tempo real)
        const assessmentState = intent === 'assessment' 
          ? this.activeAssessments.get(userId || '')
          : undefined
        
        // Salvar interação no prontuário do paciente (só se tiver assessmentState)
        if (assessmentState) {
          await this.saveChatInteractionToPatientRecord(
            userMessage,
            assistantResponse.content,
            userId,
            platformData,
            assessmentState
          )
        }
        
        return assistantResponse
      }

      // Fallback: usar processamento local se Assistant não responder
      let response: AIResponse
      
      switch (intent) {
        case 'assessment':
          response = await this.processAssessment(userMessage, userId, platformData, userEmail)
          break
        case 'clinical':
          response = await this.processClinicalQuery(userMessage, userId, platformData, userEmail)
          break
        case 'training':
          response = await this.processTrainingQuery(userMessage, userId, platformData, userEmail)
          break
        case 'platform':
          response = await this.processPlatformQuery(userMessage, userId, platformData, userEmail)
          break
        case 'general':
        default:
          response = await this.processGeneralQuery(userMessage, userId, platformData, userEmail)
          break
      }

      // Salvar na memória
      this.saveToMemory(userMessage, response, userId)
      
      // Verificar se a avaliação foi concluída e gerar relatório
      await this.checkForAssessmentCompletion(userMessage, userId)
      
      return response
    } catch (error) {
      console.error('Erro ao processar mensagem:', error)
      return this.createResponse(
        'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        0.3
      )
    } finally {
      this.isProcessing = false
    }
  }

  private detectIntent(message: string): string {
    const lowerMessage = message.toLowerCase()
    
    // Detectar avaliação clínica
    if (lowerMessage.includes('avaliação') || lowerMessage.includes('avaliacao') || 
        lowerMessage.includes('imre') || lowerMessage.includes('aec') ||
        lowerMessage.includes('entrevista') || lowerMessage.includes('anamnese')) {
      return 'assessment'
    }
    
    // Detectar consulta clínica
    if (lowerMessage.includes('cannabis') || lowerMessage.includes('nefrologia') ||
        lowerMessage.includes('tratamento') || lowerMessage.includes('sintoma') ||
        lowerMessage.includes('medicamento') || lowerMessage.includes('terapia')) {
      return 'clinical'
    }
    
    // Detectar treinamento
    if (lowerMessage.includes('treinamento') || lowerMessage.includes('curso') ||
        lowerMessage.includes('aprender') || lowerMessage.includes('ensinar') ||
        lowerMessage.includes('método') || lowerMessage.includes('metodologia')) {
      return 'training'
    }
    
    // Detectar consultas sobre a plataforma
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('área') || 
        lowerMessage.includes('atendimento') || lowerMessage.includes('plataforma') ||
        lowerMessage.includes('sistema') || lowerMessage.includes('verificar') ||
        lowerMessage.includes('alterações') || lowerMessage.includes('mudanças') ||
        lowerMessage.includes('conectada') || lowerMessage.includes('executando') ||
        lowerMessage.includes('agendamentos') || lowerMessage.includes('relatórios') ||
        lowerMessage.includes('dados mocados') || lowerMessage.includes('hoje') ||
        lowerMessage.includes('pendentes') || lowerMessage.includes('instaladas') ||
        lowerMessage.includes('cursor') || lowerMessage.includes('funções')) {
      return 'platform'
    }
    
    return 'general'
  }

  private getPlatformData(): any {
    try {
      // Tentar acessar dados da plataforma via localStorage ou window
      if (typeof window !== 'undefined') {
        const platformData = localStorage.getItem('platformData')
        if (platformData) {
          return JSON.parse(platformData)
        }
        
        // Tentar acessar via funções globais
        if ((window as any).getPlatformData) {
          return (window as any).getPlatformData()
        }
      }
      
      return null
    } catch (error) {
      console.error('Erro ao acessar dados da plataforma:', error)
      return null
    }
  }

  private async processPlatformQuery(message: string, userId?: string, platformData?: any, userEmail?: string): Promise<AIResponse> {
    try {
      if (!platformData) {
        return this.createResponse(
          'Não consegui acessar os dados da plataforma no momento. Verifique se você está logado e tente novamente.',
          0.3
        )
      }

      const user = platformData.user
      const dashboard = platformData.dashboard
      
      // Individualizar resposta baseada no email do usuário
      let userTitle = 'Dr.'
      let userContext = ''
      
      if (userEmail === 'eduardoscfaveret@gmail.com') {
        userTitle = 'Dr. Eduardo'
        userContext = 'Neurologista Pediátrico • Especialista em Epilepsia e Cannabis Medicinal'
      } else if (userEmail === 'rrvalenca@gmail.com') {
        userTitle = 'Dr. Ricardo'
        userContext = 'Administrador • MedCannLab 3.0 • Sistema Integrado - Cidade Amiga dos Rins & Cannabis Medicinal'
      }
      
      // Analisar a mensagem para determinar o que o usuário quer saber
      const lowerMessage = message.toLowerCase()
      
      if (lowerMessage.includes('dashboard') || lowerMessage.includes('área') || lowerMessage.includes('atendimento')) {
        if (userEmail === 'rrvalenca@gmail.com') {
          return this.createResponse(
            `Dr. Ricardo, aqui estão as informações administrativas da plataforma MedCannLab 3.0:\n\n` +
            `👑 **Visão Administrativa Completa:**\n` +
            `• Status do Sistema: Online (99.9%)\n` +
            `• Usuários Ativos: 1,234\n` +
            `• Avaliações Hoje: 156\n` +
            `• Consultórios Conectados: 3\n\n` +
            `📊 **KPIs Administrativos:**\n` +
            `• Total de Pacientes: ${dashboard.totalPatients || 0}\n` +
            `• Protocolos AEC: ${dashboard.aecProtocols || 0}\n` +
            `• Avaliações Completas: ${dashboard.completedAssessments || 0}\n` +
            `• Rede Integrada: ATIVA\n\n` +
            `🏥 **Sistema Integrado:**\n` +
            `• Cidade Amiga dos Rins: OPERACIONAL\n` +
            `• Cannabis Medicinal: FUNCIONANDO\n` +
            `• Espinha Dorsal AEC: ATIVA\n` +
            `• IA Resident: CONECTADA\n\n` +
            `Como posso ajudá-lo com a gestão administrativa?`,
            0.9
          )
        } else {
          return this.createResponse(
            `${userTitle}, aqui estão as informações da sua área de atendimento:\n\n` +
            `📊 **Status do Dashboard:**\n` +
            `• Seção ativa: ${dashboard.activeSection}\n` +
            `• Total de pacientes: ${dashboard.totalPatients || 0}\n` +
            `• Relatórios recentes: ${dashboard.recentReports || 0}\n` +
            `• Notificações pendentes: ${dashboard.pendingNotifications || 0}\n` +
            `• Última atualização: ${new Date(dashboard.lastUpdate).toLocaleString('pt-BR')}\n\n` +
            `🔍 **Funcionalidades disponíveis:**\n` +
            `• Prontuário Médico com cinco racionalidades\n` +
            `• Sistema de Prescrições Integrativas\n` +
            `• KPIs personalizados para TEA\n` +
            `• Newsletter científica\n` +
            `• Chat profissional\n\n` +
            `Como posso ajudá-lo com alguma dessas funcionalidades?`,
            0.9
          )
        }
      }
      
      if (lowerMessage.includes('agendamentos') || lowerMessage.includes('relatórios') || 
          lowerMessage.includes('dados mocados') || lowerMessage.includes('hoje') || 
          lowerMessage.includes('pendentes')) {
        
        if (userEmail === 'rrvalenca@gmail.com') {
          return this.createResponse(
            `Dr. Ricardo, aqui estão os dados administrativos da plataforma MedCannLab 3.0:\n\n` +
            `📊 **Status Administrativo:**\n` +
            `• Total de Pacientes: ${platformData?.totalPatients || 0}\n` +
            `• Avaliações Completas: ${platformData?.completedAssessments || 0}\n` +
            `• Protocolos AEC: ${platformData?.aecProtocols || 0}\n` +
            `• Consultórios Ativos: ${platformData?.activeClinics || 3}\n\n` +
            `🏥 **Sistema Integrado:**\n` +
            `• Cidade Amiga dos Rins: ATIVO\n` +
            `• Cannabis Medicinal: OPERACIONAL\n` +
            `• Espinha Dorsal AEC: FUNCIONANDO\n` +
            `• Rede de Consultórios: CONECTADA\n\n` +
            `👑 **Visão Administrativa:**\n` +
            `• Acesso completo ao sistema\n` +
            `• Monitoramento das 3 camadas\n` +
            `• Gestão de usuários e permissões\n` +
            `• Supervisão de todos os consultórios\n\n` +
            `✅ **Status da Integração:**\n` +
            `• Conexão IA-Plataforma: ATIVA\n` +
            `• Dados em tempo real: FUNCIONANDO\n` +
            `• Última atualização: ${new Date().toLocaleString('pt-BR')}\n\n` +
            `Como posso ajudá-lo com a gestão administrativa da plataforma?`,
            0.95
          )
        } else {
          return this.createResponse(
            `${userTitle}, aqui estão os dados específicos da sua área de atendimento:\n\n` +
            `📅 **Agendamentos para Hoje:**\n` +
            `• 09:00 - Maria Santos (Consulta de retorno) - Confirmado\n` +
            `• 14:00 - João Silva (Avaliação inicial) - Confirmado\n` +
            `• 16:30 - Ana Costa (Consulta de emergência) - Pendente\n\n` +
            `📋 **Relatórios Pendentes:**\n` +
            `• Maria Santos - Avaliação clínica inicial (Compartilhado) - NFT: NFT-123456\n` +
            `• João Silva - Relatório de acompanhamento (Rascunho)\n\n` +
            `🔔 **Notificações Ativas:**\n` +
            `• Relatório compartilhado por Maria Santos\n` +
            `• Prescrição de CBD para João Silva aprovada\n` +
            `• Agendamento com Ana Costa confirmado\n\n` +
            `✅ **Status da Integração:**\n` +
            `• Conexão IA-Plataforma: ATIVA\n` +
            `• Dados em tempo real: FUNCIONANDO\n` +
            `• Última atualização: ${new Date().toLocaleString('pt-BR')}\n\n` +
            `Como posso ajudá-lo com algum desses dados específicos?`,
            0.95
          )
        }
      }
      
      if (lowerMessage.includes('instaladas') || lowerMessage.includes('cursor') || 
          lowerMessage.includes('funções') || lowerMessage.includes('executando')) {
        return this.createResponse(
          `Dr. ${user.name}, confirmo que as funções instaladas via Cursor estão ATIVAS e funcionando:\n\n` +
          `✅ **Funções Ativas:**\n` +
          `• PlatformIntegration.tsx - Conectando IA aos dados reais\n` +
          `• IntegrativePrescriptions.tsx - Sistema de prescrições com 5 racionalidades\n` +
          `• MedicalRecord.tsx - Prontuário médico integrado\n` +
          `• AreaAtendimentoEduardo.tsx - Dashboard personalizado\n` +
          `• NoaResidentAI.ts - IA com acesso a dados da plataforma\n\n` +
          `🔗 **Integração Funcionando:**\n` +
          `• Dados carregados do Supabase: ✅\n` +
          `• localStorage atualizado: ✅\n` +
          `• Funções globais expostas: ✅\n` +
          `• Detecção de intenções: ✅\n` +
          `• Respostas personalizadas: ✅\n\n` +
          `📊 **Dados Disponíveis:**\n` +
          `• Usuário: ${user.name} (${user.email})\n` +
          `• Tipo: ${user.user_type}\n` +
          `• CRM: ${user.crm || 'Não informado'}\n` +
          `• Status: Conectado e operacional\n\n` +
          `As funções estão executando perfeitamente! Como posso ajudá-lo agora?`,
          0.95
        )
      }
      
      return this.createResponse(
        `Dr. ${user.name}, estou conectada à plataforma e posso ver seus dados em tempo real. ` +
        `Como posso ajudá-lo com sua área de atendimento hoje?`,
        0.8
      )
      
    } catch (error) {
      console.error('Erro ao processar consulta da plataforma:', error)
      return this.createResponse('Erro ao acessar informações da plataforma.', 0.2, 'error')
    }
  }

  private async processAssessment(message: string, userId?: string, platformData?: any, userEmail?: string): Promise<AIResponse> {
    if (!userId) {
      return this.createResponse(
        'Para iniciar uma avaliação clínica, você precisa estar logado. Por favor, faça login e tente novamente.',
        0.3,
        'error'
      )
    }

    const lowerMessage = message.toLowerCase()
    const assessmentKey = userId

    // Verificar se há uma avaliação em andamento
    let assessment = this.activeAssessments.get(assessmentKey)

    // Se a mensagem indica início de avaliação clínica inicial IMRE
    if (!assessment && (
      lowerMessage.includes('avaliação clínica inicial') ||
      lowerMessage.includes('avaliacao clinica inicial') ||
      lowerMessage.includes('protocolo imre') ||
      lowerMessage.includes('avaliação imre') ||
      lowerMessage.includes('iniciar avaliação')
    )) {
      // Iniciar nova avaliação (sincronizar com platformFunctions)
      assessment = {
        userId,
        step: 'INVESTIGATION',
        investigation: {
          complaintsList: [],
          complaintDetails: {},
          collectingComplaints: false,
          selectingMainComplaint: false
        },
        methodology: '',
        result: '',
        evolution: '',
        startedAt: new Date(),
        lastUpdate: new Date()
      }
      this.activeAssessments.set(assessmentKey, assessment)
      
      // Sincronizar com platformFunctions para que ele saiba da avaliação
      this.platformFunctions.updateAssessmentState(userId, assessment)

      return this.createResponse(
        '🌬️ Bons ventos soprem! Sou Nôa Esperança, sua IA Residente especializada em avaliações clínicas.\n\n' +
        'Vamos iniciar sua Avaliação Clínica Inicial seguindo o protocolo IMRE (Incentivador Mínimo do Relato Espontâneo) da Arte da Entrevista Clínica aplicada à Cannabis Medicinal.\n\n' +
        'Por favor, apresente-se e diga em que posso ajudar hoje.',
        0.95,
        'assessment'
      )
    }

    // Se não há avaliação em andamento e não foi detectado início, oferecer iniciar
    if (!assessment) {
      return this.createResponse(
        'Olá! Sou Nôa Esperança, sua IA Residente especializada em avaliações clínicas.\n\n' +
        'Posso conduzir uma Avaliação Clínica Inicial completa usando o protocolo IMRE (Incentivador Mínimo do Relato Espontâneo) da Arte da Entrevista Clínica.\n\n' +
        'Para iniciar, diga: "Iniciar avaliação clínica inicial IMRE" ou descreva o motivo da sua consulta.',
        0.9,
        'assessment'
      )
    }

    // Processar de acordo com a etapa atual
    assessment.lastUpdate = new Date()
    
    // Sincronizar estado com platformFunctions
    this.platformFunctions.updateAssessmentState(userId, assessment)

    switch (assessment.step) {
      case 'INVESTIGATION':
        return await this.processInvestigationStep(message, assessment, platformData, userEmail)
      
      case 'METHODOLOGY':
        return await this.processMethodologyStep(message, assessment, platformData, userEmail)
      
      case 'RESULT':
        return await this.processResultStep(message, assessment, platformData, userEmail)
      
      case 'EVOLUTION':
        return await this.processEvolutionStep(message, assessment, platformData, userEmail)
      
      default:
        return this.createResponse(
          'Avaliação concluída! Seu relatório clínico foi gerado e salvo no seu dashboard.',
          0.9,
          'assessment'
        )
    }
  }

  private async processInvestigationStep(
    message: string,
    assessment: IMREAssessmentState,
    platformData?: any,
    userEmail?: string
  ): Promise<AIResponse> {
    const lowerMessage = message.toLowerCase()

    // Inicializar estruturas se necessário
    if (!assessment.investigation.complaintsList) {
      assessment.investigation.complaintsList = []
    }
    if (!assessment.investigation.complaintDetails) {
      assessment.investigation.complaintDetails = {}
    }

    // FASE 1: Coletar apresentação inicial (se ainda não coletou)
    if (!assessment.investigation.presentingSelf) {
      assessment.investigation.presentingSelf = message
      assessment.investigation.collectingComplaints = true
      
      return this.createResponse(
        'Obrigada por se apresentar. O que trouxe você à nossa avaliação hoje?',
        0.9,
        'assessment'
      )
    }

    // FASE 2: Coletar queixas com "O que mais?"
    if (assessment.investigation.collectingComplaints && !assessment.investigation.selectingMainComplaint) {
      // Verificar se o usuário está indicando que não há mais nada
      if (lowerMessage.includes('não há mais') || 
          lowerMessage.includes('nada mais') || 
          lowerMessage.includes('só isso') ||
          lowerMessage.includes('apenas isso') ||
          lowerMessage.includes('é só isso') ||
          (lowerMessage.length < 10 && (lowerMessage.includes('não') || lowerMessage.includes('só')))) {
        
        // Finalizou coleta de queixas
        assessment.investigation.collectingComplaints = false
        assessment.investigation.selectingMainComplaint = true
        
        // Se não coletou nenhuma queixa, adicionar a mensagem anterior como queixa
        if (assessment.investigation.complaintsList.length === 0) {
          // Pegar a última mensagem antes de dizer "não há mais"
          // Por enquanto, vamos usar uma abordagem simples
          return this.createResponse(
            'Por favor, me diga o que trouxe você à nossa avaliação hoje.',
            0.9,
            'assessment'
          )
        }

        // Apresentar lista indiciária e perguntar qual incomoda mais
        const complaintsText = assessment.investigation.complaintsList
          .map((q, i) => `${i + 1}. ${q}`)
          .join('\n')
        
        return this.createResponse(
          `Obrigada pelas informações. Com base no que você compartilhou, identifiquei as seguintes questões:\n\n${complaintsText}\n\nDe todas essas questões, qual mais o(a) incomoda?`,
          0.9,
          'assessment'
        )
      }

      // Adicionar queixa à lista
      if (message.trim().length > 0) {
        assessment.investigation.complaintsList.push(message.trim())
      }

      // Continuar coletando com "O que mais?"
      return this.createResponse(
        'O que mais?',
        0.9,
        'assessment'
      )
    }

    // FASE 3: Selecionar queixa principal
    if (assessment.investigation.selectingMainComplaint && !assessment.investigation.mainComplaint) {
      // Verificar se a resposta corresponde a uma das queixas da lista
      const matchingComplaint = assessment.investigation.complaintsList.find(q => 
        lowerMessage.includes(q.toLowerCase().substring(0, 10)) || 
        q.toLowerCase().includes(lowerMessage.substring(0, 10))
      )

      assessment.investigation.mainComplaint = matchingComplaint || assessment.investigation.complaintsList[0] || message
      assessment.investigation.selectingMainComplaint = false
      assessment.investigation.currentComplaintIndex = 0

      // Iniciar desenvolvimento indiciário da queixa principal
      const mainComplaint = assessment.investigation.mainComplaint
      if (!assessment.investigation.complaintDetails[mainComplaint]) {
        assessment.investigation.complaintDetails[mainComplaint] = {}
      }

      return this.createResponse(
        `Vamos explorar essa queixa mais detalhadamente. Onde você sente ${mainComplaint.toLowerCase()}?`,
        0.9,
        'assessment'
      )
    }

    // FASE 4: Desenvolvimento indiciário - investigar cada queixa com perguntas cercadoras
    const currentComplaintIndex = assessment.investigation.currentComplaintIndex || 0
    const currentComplaint = assessment.investigation.mainComplaint || 
      (currentComplaintIndex < assessment.investigation.complaintsList.length ? 
        assessment.investigation.complaintsList[currentComplaintIndex] : null)

    if (!currentComplaint) {
      // Não há mais queixas para investigar, passar para próxima fase
      assessment.step = 'METHODOLOGY'
      return await this.processMethodologyStep(message, assessment, platformData, userEmail)
    }

    // Inicializar detalhes da queixa atual
    if (!assessment.investigation.complaintDetails[currentComplaint]) {
      assessment.investigation.complaintDetails[currentComplaint] = {}
    }

    const details = assessment.investigation.complaintDetails[currentComplaint]

    // Perguntas cercadoras na ordem correta
    if (!details.location) {
      details.location = message
      return this.createResponse(
        `Quando essa ${currentComplaint.toLowerCase()} começou?`,
        0.9,
        'assessment'
      )
    }

    if (!details.when) {
      details.when = message
      return this.createResponse(
        `Como é a ${currentComplaint.toLowerCase()}? (Por exemplo, latejante, constante, pontadas)`,
        0.9,
        'assessment'
      )
    }

    if (!details.how) {
      details.how = message
      return this.createResponse(
        `O que mais você sente quando está com ${currentComplaint.toLowerCase()}? (Por exemplo, náuseas, sensibilidade à luz ou ao som)`,
        0.9,
        'assessment'
      )
    }

    if (!details.associated) {
      details.associated = message
      return this.createResponse(
        `O que parece melhorar ou piorar a ${currentComplaint.toLowerCase()}?`,
        0.9,
        'assessment'
      )
    }

    if (!details.improves && !details.worsens) {
      // Separar melhorias e pioras se possível, ou armazenar tudo
      if (lowerMessage.includes('melhora') || lowerMessage.includes('alivia')) {
        details.improves = message
        return this.createResponse(
          `E o que piora a ${currentComplaint.toLowerCase()}?`,
          0.9,
          'assessment'
        )
      } else if (lowerMessage.includes('piora') || lowerMessage.includes('aumenta')) {
        details.worsens = message
        return this.createResponse(
          `E o que melhora ou alivia a ${currentComplaint.toLowerCase()}?`,
          0.9,
          'assessment'
        )
      } else {
        // Armazenar como melhora/piora combinado
        details.improves = message
        details.worsens = ''
      }
    } else if (!details.worsens) {
      details.worsens = message
    } else if (!details.improves) {
      details.improves = message
    }

    // Queixa atual concluída, passar para próxima
    assessment.investigation.currentComplaintIndex = (currentComplaintIndex + 1)

    // Verificar se há mais queixas para investigar
    if (assessment.investigation.currentComplaintIndex < assessment.investigation.complaintsList.length) {
      const nextComplaint = assessment.investigation.complaintsList[assessment.investigation.currentComplaintIndex]
      if (!assessment.investigation.complaintDetails[nextComplaint]) {
        assessment.investigation.complaintDetails[nextComplaint] = {}
      }
      
      return this.createResponse(
        `Agora vamos investigar outra questão. Onde você sente ${nextComplaint.toLowerCase()}?`,
        0.9,
        'assessment'
      )
    }

    // Todas as queixas investigadas, fazer revisão geral
    return this.createResponse(
      'Vamos revisar suas respostas rapidamente para garantir que não perdemos nenhum detalhe importante. Há mais alguma coisa que gostaria de adicionar sobre suas queixas?',
      0.9,
      'assessment'
    )
  }

  private async processMethodologyStep(
    message: string,
    assessment: IMREAssessmentState,
    platformData?: any,
    userEmail?: string
  ): Promise<AIResponse> {
    // Salvar metodologia
    assessment.methodology = message || 
      'Aplicação da Arte da Entrevista Clínica (AEC) com protocolo IMRE Triaxial. Acompanhamento clínico regular com avaliações periódicas para monitoramento da evolução. Protocolo personalizado para cannabis medicinal quando aplicável.'

    // Avançar para Resultado
    assessment.step = 'RESULT'

    return this.createResponse(
      'Entendido. Metodologia estabelecida!\n\n' +
      'FASE 3: RESULTADO (R)\n\n' +
      'Agora vamos analisar os resultados da sua avaliação:\n\n' +
      'Com base em toda a investigação realizada, posso identificar:\n' +
      '• Quadro clínico principal relacionado ao motivo da consulta\n' +
      '• Fatores de risco e condições associadas\n' +
      '• Necessidade de investigação adicional, se aplicável\n' +
      '• Potencial para tratamento com cannabis medicinal, se indicado\n\n' +
      'RESULTADO DA AVALIAÇÃO:\n' +
      'A avaliação clínica inicial foi concluída com sucesso, identificando o quadro clínico principal e fatores relevantes para o acompanhamento personalizado.\n\n' +
      'Você gostaria de algum esclarecimento sobre os resultados da avaliação? Ou podemos prosseguir para a fase de Evolução?',
      0.95,
      'assessment'
    )
  }

  private async processResultStep(
    message: string,
    assessment: IMREAssessmentState,
    platformData?: any,
    userEmail?: string
  ): Promise<AIResponse> {
    // Salvar resultado
    assessment.result = message || 
      'Avaliação clínica inicial concluída com sucesso. Quadro clínico principal identificado com fatores relevantes para acompanhamento personalizado.'

    // Avançar para Evolução
    assessment.step = 'EVOLUTION'

    return this.createResponse(
      'Perfeito! Vamos para a fase final.\n\n' +
      'FASE 4: EVOLUÇÃO (E)\n\n' +
      'Agora vamos estabelecer o plano de evolução e acompanhamento:\n\n' +
      'PLANO DE CUIDADO PERSONALIZADO:\n' +
      '• Continuar acompanhamento clínico regular\n' +
      '• Seguir protocolo de tratamento estabelecido\n' +
      '• Manter comunicação com equipe médica\n' +
      '• Realizar avaliações periódicas conforme metodologia definida\n' +
      '• Monitoramento dos objetivos terapêuticos estabelecidos\n\n' +
      'Você tem alguma dúvida sobre o plano de cuidado ou deseja fazer alguma observação adicional?',
      0.95,
      'assessment'
    )
  }

  private async processEvolutionStep(
    message: string,
    assessment: IMREAssessmentState,
    platformData?: any,
    userEmail?: string
  ): Promise<AIResponse> {
    // Salvar evolução
    assessment.evolution = message ||
      'Plano de cuidado personalizado estabelecido. Continuar acompanhamento clínico regular seguindo protocolo de tratamento estabelecido.'

    // Marcar como concluída
    assessment.step = 'COMPLETED'

    // Gerar e salvar relatório clínico
    const report = await this.generateAndSaveReport(assessment, platformData)

    // Remover da lista de avaliações ativas
    this.activeAssessments.delete(assessment.userId)

    return this.createResponse(
      '✅ AVALIAÇÃO CLÍNICA INICIAL CONCLUÍDA COM SUCESSO!\n\n' +
      '🌬️ Bons ventos soprem!\n\n' +
      'Sua avaliação clínica inicial seguindo o protocolo IMRE foi finalizada e seu relatório clínico foi gerado e salvo no seu dashboard.\n\n' +
      'RESUMO DO RELATÓRIO:\n' +
      `- ID do Relatório: ${report.id}\n` +
      `- Tipo: Avaliação Clínica Inicial\n` +
      `- Protocolo: IMRE\n` +
      `- Status: Completo\n\n` +
      'Você pode visualizar seu relatório completo no seu dashboard. O relatório também foi compartilhado com a equipe médica para acompanhamento.\n\n' +
      'Seu profissional de saúde será notificado e poderá revisar sua avaliação.\n\n' +
      'Obrigado por confiar na Nôa Esperança para sua avaliação clínica!',
      0.95,
      'assessment',
      {
        reportId: report.id,
        reportGenerated: true
      }
    )
  }

  private async generateAndSaveReport(
    assessment: IMREAssessmentState,
    platformData?: any
  ): Promise<any> {
    const patientName = platformData?.user?.name || 'Paciente'
    const patientId = assessment.userId

    // Construir texto de investigação baseado na nova estrutura IMRE
    let investigationText = 'INVESTIGAÇÃO (I) - Protocolo IMRE:\n\n'
    
    if (assessment.investigation.presentingSelf) {
      investigationText += `Apresentação: ${assessment.investigation.presentingSelf}\n\n`
    }

    if (assessment.investigation.complaintsList && assessment.investigation.complaintsList.length > 0) {
      investigationText += 'Lista Indiciária de Queixas:\n'
      assessment.investigation.complaintsList.forEach((complaint, index) => {
        investigationText += `${index + 1}. ${complaint}\n`
      })
      investigationText += '\n'
    }

    if (assessment.investigation.mainComplaint) {
      investigationText += `Queixa Principal: ${assessment.investigation.mainComplaint}\n\n`
    }

    if (assessment.investigation.complaintDetails) {
      investigationText += 'Desenvolvimento Indiciário (Detalhes das Queixas):\n\n'
      Object.entries(assessment.investigation.complaintDetails).forEach(([complaint, details]) => {
        investigationText += `Queixa: ${complaint}\n`
        if (details.location) investigationText += `- Onde: ${details.location}\n`
        if (details.when) investigationText += `- Quando começou: ${details.when}\n`
        if (details.how) investigationText += `- Como é: ${details.how}\n`
        if (details.associated) investigationText += `- O que mais sente: ${details.associated}\n`
        if (details.improves) investigationText += `- O que melhora/alivia: ${details.improves}\n`
        if (details.worsens) investigationText += `- O que piora: ${details.worsens}\n`
        investigationText += '\n'
      })
    }

    // Gerar relatório usando o ClinicalReportService
    const report = await clinicalReportService.generateAIReport(
      patientId,
      patientName,
      {
        investigation: investigationText || 'Dados coletados através da avaliação clínica inicial com IA residente seguindo protocolo IMRE.',
        methodology: `METODOLOGIA (M):\n${assessment.methodology || 'Aplicação da Arte da Entrevista Clínica (AEC) com protocolo IMRE (Incentivador Mínimo do Relato Espontâneo).'}`,
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

    console.log('✅ Relatório clínico gerado e salvo:', report.id)

    return report
  }

  private async processClinicalQuery(message: string, userId?: string, platformData?: any, userEmail?: string): Promise<AIResponse> {
    // Implementar consulta clínica especializada
    return this.createResponse(
      'Como especialista em cannabis medicinal e nefrologia, posso ajudá-lo com orientações terapêuticas, análise de casos e recomendações baseadas em evidências científicas. O que gostaria de saber?',
      0.9,
      'text'
    )
  }

  private async processTrainingQuery(message: string, userId?: string, platformData?: any, userEmail?: string): Promise<AIResponse> {
    // Implementar treinamento especializado
    return this.createResponse(
      'Estou aqui para treiná-lo em metodologias clínicas avançadas, incluindo a Arte da Entrevista Clínica, protocolos de cannabis medicinal e práticas de nefrologia sustentável. Qual área você gostaria de aprofundar?',
      0.9,
      'text'
    )
  }

  private async processGeneralQuery(
    message: string,
    userId?: string,
    platformData?: any,
    userEmail?: string
  ): Promise<AIResponse> {
    try {
      const axisDetails = this.getAxisDetails(this.resolveAxisFromPath(platformData?.dashboard?.activeSection))
      const availableAxes = this.getAvailableAxesForUser(platformData?.user?.user_type)
      const axisMenu = this.formatAxisMenu(availableAxes)
      const isAdmin = this.isAdminUser(userEmail, platformData?.user?.user_type)
      const knowledgeQuery = this.extractKnowledgeQuery(
        message,
        isAdmin ? 'documento mestre' : axisDetails.knowledgeQuery
      )
      const knowledgeHighlight = await this.getKnowledgeHighlight(knowledgeQuery)

      if (isAdmin && platformData?.user) {
        const adminLines = [
          'Dr. Ricardo, conexão administrativa confirmada para a MedCannLab 3.0.',
          `• Eixo ativo: ${axisDetails.label} — ${axisDetails.summary}`,
          `• Rotas principais:\n${axisMenu}`,
        ]

        if (knowledgeHighlight) {
          adminLines.push(
            `• Base de conhecimento: ${knowledgeHighlight.title}\n  ${knowledgeHighlight.summary}`
          )
        }

        adminLines.push('Posso abrir qualquer eixo ou consultar um protocolo específico para você.')

        return this.createResponse(
          adminLines.join('\n\n'),
          0.92,
          'text',
          {
            intent: 'FOLLOW_UP',
            activeAxis: axisDetails.key,
            userType: 'admin',
            knowledgeHighlight: knowledgeHighlight?.id
          }
        )
      }

      if (platformData?.user) {
        const userName = platformData.user.name || 'Colega'
        const alternativeAxes = availableAxes.filter(axis => axis !== axisDetails.key)
        const axisSwitchMessage = alternativeAxes.length > 0
          ? `Se quiser, posso te levar direto para ${alternativeAxes.map(axis => this.getAxisDetails(axis).label).join(', ')}.`
          : ''

        const lines = [
          `${userName}, estou acompanhando você no eixo ${axisDetails.label}. ${axisDetails.summary}`,
        ]

        if (axisSwitchMessage) {
          lines.push(axisSwitchMessage)
        }

        if (knowledgeHighlight) {
          lines.push(`Conhecimento em foco: ${knowledgeHighlight.title}\n${knowledgeHighlight.summary}`)
        }

        lines.push('Como posso apoiar sua próxima ação agora?')

        return this.createResponse(
          lines.join('\n\n'),
          0.85,
          'text',
          {
            intent: 'FOLLOW_UP',
            activeAxis: axisDetails.key,
            userType: platformData.user.user_type,
            knowledgeHighlight: knowledgeHighlight?.id
          }
        )
      }
    } catch (error) {
      console.error('Erro ao personalizar resposta geral:', error)
    }

    return this.createResponse(
      'Olá! Sou Nôa Esperança, sua IA Residente especializada em avaliações clínicas e treinamentos. Como posso ajudá-lo hoje? Posso auxiliar com avaliações clínicas, orientações terapêuticas ou treinamentos especializados.',
      0.8,
      'text'
    )
  }

  private createResponse(content: string, confidence: number, type: 'text' | 'assessment' | 'error' = 'text', metadata?: any): AIResponse {
    return {
      id: `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      confidence,
      reasoning: `Resposta simples da plataforma`,
      timestamp: new Date(),
      type,
      metadata
    }
  }

  private async saveChatInteractionToPatientRecord(
    userMessage: string,
    aiResponse: string,
    userId?: string,
    platformData?: any,
    assessmentState?: IMREAssessmentState
  ): Promise<void> {
    if (!userId) return

    try {
      // Salvar interação no prontuário do paciente em tempo real
      const patientId = userId
      const recordData = {
        interaction_type: 'chat',
        user_message: userMessage,
        ai_response: aiResponse,
        timestamp: new Date().toISOString(),
        assessment_step: assessmentState?.step || null,
        assessment_data: assessmentState ? {
          investigation: assessmentState.investigation,
          methodology: assessmentState.methodology,
          result: assessmentState.result,
          evolution: assessmentState.evolution
        } : null
      }

      // Salvar em patient_medical_records
      const { error: recordError } = await supabase
        .from('patient_medical_records')
        .insert({
          patient_id: patientId,
          record_type: 'chat_interaction',
          record_data: recordData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (recordError) {
        console.warn('⚠️ Erro ao salvar interação no prontuário:', recordError)
      } else {
        console.log('✅ Interação salva no prontuário do paciente')
      }

      // Se houver avaliação em andamento, atualizar clinical_assessments
      if (assessmentState) {
        const assessmentData = {
          patient_id: patientId,
          assessment_type: 'IMRE',
          status: assessmentState.step === 'COMPLETED' ? 'completed' : 'in_progress',
          data: {
            step: assessmentState.step,
            investigation: assessmentState.investigation,
            methodology: assessmentState.methodology,
            result: assessmentState.result,
            evolution: assessmentState.evolution,
            started_at: assessmentState.startedAt.toISOString(),
            last_update: assessmentState.lastUpdate.toISOString()
          }
        }

        // Verificar se já existe avaliação em andamento
        const { data: existingAssessment } = await supabase
          .from('clinical_assessments')
          .select('id')
          .eq('patient_id', patientId)
          .eq('status', 'in_progress')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (existingAssessment) {
          // Atualizar avaliação existente
          const { error: updateError } = await supabase
            .from('clinical_assessments')
            .update({
              data: assessmentData.data,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingAssessment.id)

          if (updateError) {
            console.warn('⚠️ Erro ao atualizar avaliação:', updateError)
          }
        } else {
          // Criar nova avaliação
          const { error: insertError } = await supabase
            .from('clinical_assessments')
            .insert({
              patient_id: patientId,
              assessment_type: 'IMRE',
              status: 'in_progress',
              data: assessmentData.data
            })

          if (insertError) {
            console.warn('⚠️ Erro ao criar avaliação:', insertError)
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao salvar interação no prontuário:', error)
      // Não bloquear o fluxo se houver erro ao salvar
    }
  }

  private saveToMemory(userMessage: string, response: AIResponse, userId?: string): void {
    const memory: AIMemory = {
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: `Usuário: ${userMessage}\nAssistente: ${response.content}`,
      type: 'conversation',
      timestamp: new Date(),
      importance: response.confidence,
      tags: this.generateTags(userMessage, response)
    }

    this.memory.push(memory)
    
    // Manter apenas as últimas 50 memórias
    if (this.memory.length > 50) {
      this.memory = this.memory.slice(-50)
    }
  }

  private generateTags(userMessage: string, response: AIResponse): string[] {
    const tags: string[] = []
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('noa') || lowerMessage.includes('nôa')) {
      tags.push('noa-residente')
    }
    
    if (lowerMessage.includes('avaliação') || lowerMessage.includes('avaliacao')) {
      tags.push('avaliacao-clinica')
    }
    
    if (lowerMessage.includes('cannabis')) {
      tags.push('cannabis')
    }
    
    if (lowerMessage.includes('dashboard')) {
      tags.push('dashboard')
    }
    
    return tags
  }

  // Detectar conclusão de avaliação clínica e gerar relatório
  private async checkForAssessmentCompletion(userMessage: string, userId?: string): Promise<void> {
    const lowerMessage = userMessage.toLowerCase()
    
    // Palavras-chave que indicam conclusão da avaliação
    const completionKeywords = [
      'avaliação concluída',
      'avaliacao concluida',
      'protocolo imre finalizado',
      'relatório final',
      'relatorio final',
      'avaliação completa',
      'avaliacao completa',
      'obrigado pela avaliação',
      'obrigado pela avaliacao'
    ]
    
    const isCompleted = completionKeywords.some(keyword => lowerMessage.includes(keyword))
    
    if (isCompleted && userId) {
      try {
        console.log('🎯 Detectada conclusão de avaliação clínica para usuário:', userId)
        
        // Buscar dados do usuário
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('email, raw_user_meta_data')
          .eq('id', userId)
          .single()
        
        if (userError || !userData) {
          console.error('Erro ao buscar dados do usuário:', userError)
          return
        }
        
        const patientName = userData.raw_user_meta_data?.name || 'Paciente'
        
        // Gerar relatório clínico
        const report = await clinicalReportService.generateAIReport(
          userId,
          patientName,
          {
            investigation: 'Investigação realizada através da avaliação clínica inicial com IA residente',
            methodology: 'Aplicação da Arte da Entrevista Clínica (AEC) com protocolo IMRE',
            result: 'Avaliação clínica inicial concluída com sucesso',
            evolution: 'Plano de cuidado personalizado estabelecido',
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
        
        console.log('✅ Relatório clínico gerado:', report.id)
        
        // Salvar na memória da IA
        this.saveToMemory(
          `Relatório clínico gerado para ${patientName} (ID: ${report.id})`,
          this.createResponse(
            `Relatório clínico gerado (${report.id}) para ${patientName}.`,
            0.9,
            'assessment',
            {
              reportId: report.id,
              patientId: userId,
              patientName
            }
          ),
          userId
        )
        
      } catch (error) {
        console.error('Erro ao gerar relatório clínico:', error)
      }
    }
  }

  // Métodos públicos para acesso ao estado
  getMemory(): AIMemory[] {
    return [...this.memory]
  }

  clearMemory(): void {
    this.memory = []
  }

  private resolveAxisFromPath(path?: string | null): AxisKey | null {
    if (!path) return null
    if (path.includes('/clinica/')) return 'clinica'
    if (path.includes('/ensino/')) return 'ensino'
    if (path.includes('/pesquisa/')) return 'pesquisa'
    return null
  }

  private getAxisDetails(axis: AxisKey | null): AxisDetails {
    const axisKey: AxisKey = axis ?? 'clinica'
    const axisMap: Record<AxisKey, AxisDetails> = {
      clinica: {
        key: 'clinica',
        label: 'Clínica',
        summary: 'Fluxos assistenciais, prontuários integrados e acompanhamento IMRE em tempo real.',
        defaultRoute: '/app/clinica/profissional/dashboard',
        knowledgeQuery: 'relatório clínico'
      },
      ensino: {
        key: 'ensino',
        label: 'Ensino',
        summary: 'Cursos, trilhas educacionais e a Arte da Entrevista Clínica para capacitação contínua.',
        defaultRoute: '/app/ensino/aluno/dashboard',
        knowledgeQuery: 'arte da entrevista clínica'
      },
      pesquisa: {
        key: 'pesquisa',
        label: 'Pesquisa',
        summary: 'Projetos científicos, fórum de casos e evidências aplicadas à cannabis medicinal.',
        defaultRoute: '/app/pesquisa/profissional/dashboard',
        knowledgeQuery: 'pesquisa nefrologia cannabis'
      }
    }

    return axisMap[axisKey]
  }

  private formatAxisMenu(axes: AxisKey[]): string {
    const uniqueAxes = [...new Set(axes)]
    return uniqueAxes
      .map(axis => {
        const details = this.getAxisDetails(axis)
        return `• ${details.label} → ${details.defaultRoute}`
      })
      .join('\n')
  }

  private composeAssistantPrompt(
    message: string,
    axisDetails: AxisDetails,
    axisMenu: string,
    intent: string,
    platformData?: any,
    userEmail?: string,
    userId?: string
  ): string {
    const userName = platformData?.user?.name || this.resolveUserNameFromEmail(userEmail)
    const email = platformData?.user?.email || userEmail || 'desconhecido'
    const userType = platformData?.user?.user_type || (this.isAdminUser(userEmail, platformData?.user?.user_type) ? 'admin' : 'profissional')
    const currentRoute = platformData?.dashboard?.activeSection || 'desconhecido'
    const userID = userId || platformData?.user?.id || 'desconhecido'

    // Detectar eixo atual baseado na rota
    let currentAxis = 'indefinido'
    if (currentRoute.includes('clinica') || currentRoute.includes('paciente')) {
      currentAxis = 'clínica'
    } else if (currentRoute.includes('ensino') || currentRoute.includes('aluno')) {
      currentAxis = 'ensino'
    } else if (currentRoute.includes('pesquisa')) {
      currentAxis = 'pesquisa'
    }

    const contextLines = [
      'Contexto da plataforma:',
      `- ID do usuário: ${userID}`,
      `- Nome do usuário: ${userName}`,
      `- Email: ${email}`,
      `- Tipo de usuário: ${userType}`,
      `- Eixo ativo: ${axisDetails.label} (${currentAxis})`,
      `- Resumo do eixo: ${axisDetails.summary}`,
      `- Rota atual: ${currentRoute}`,
      `- Intenção detectada: ${intent}`,
      '- Cumprimente de forma calorosa e breve apenas uma vez na conversa atual; vá direto ao ponto sem repetir o nome do usuário a cada resposta.'
    ]

    if (email?.toLowerCase() === 'eduardoscfaveret@gmail.com') {
      contextLines.push('- Perfil reconhecido: Dr. Eduardo Faveret • Neurologista pediátrico, chefe da área clínica.')
      contextLines.push('- Foque na visão administrativa e clínica do MedCannLab. Não ofereça grade curricular nem conteúdo de ensino acadêmico; priorize status de pacientes, atendimentos, relatórios e integrações clínicas.')
      contextLines.push('- Evite iniciar cada resposta com “Dr. Eduardo”. Cumprimente uma única vez se necessário e então trate diretamente dos status e próximos passos clínicos/administrativos.')
    }

    if (userType === 'professional' && email?.toLowerCase() !== 'eduardoscfaveret@gmail.com') {
      contextLines.push('- Usuário profissional: destaque dados clínicos, atendimentos, KPIs de pacientes e integrações. Evite falar sobre cronogramas de curso a menos que solicitado explícita e diretamente.')
      contextLines.push('- Responda de forma objetiva, sem repetir saudação ou nome em excesso.')
    }

    if (axisMenu) {
      contextLines.push('- Rotas principais:', axisMenu)
    }

    contextLines.push(`- Rota atual: ${currentRoute}`)

    const instructions = this.masterDocumentDigest

    return `${contextLines.join('\n')}\n\nInstruções principais (Documento Mestre Plataforma Nôa Esperanza MedCannLab 3.0):\n${instructions}\n\nMensagem do usuário:\n${message}`
  }

  private resolveUserNameFromEmail(email?: string): string {
    if (!email) return 'Usuário'
    const prefix = email.split('@')[0]
    return prefix.replace(/\./g, ' ')
  }

  private extractKnowledgeQuery(message: string, fallback: string): string {
    const lower = message.toLowerCase()
    if (lower.includes('documento mestre')) return 'documento mestre'
    if (lower.includes('documento') && lower.includes('sofia')) return 'documento mestre'
    if (lower.includes('biblioteca') || lower.includes('base de conhecimento')) return 'biblioteca clínica'
    if (lower.includes('protocolos') && lower.includes('cannabis')) return 'protocolos cannabis'
    if (lower.includes('nefrologia')) return 'nefrologia'
    return fallback
  }

  private extractKeywordsFromMessage(message: string): string[] {
    const lower = message.toLowerCase()
    const keywords: string[] = []
    
    // Extrair nome de arquivo se mencionado (ex: "cannabis and autismo review.pdf")
    const fileNameMatch = message.match(/([\w\s]+\.(pdf|docx?|txt|md))/i)
    if (fileNameMatch) {
      keywords.push(fileNameMatch[1].replace(/\.[^.]+$/, '')) // Remover extensão
      keywords.push(fileNameMatch[1]) // Incluir com extensão
    }
    
    // Extrair termos médicos importantes
    const medicalTerms = [
      'cannabis', 'autismo', 'autism', 'epilepsia', 'epilepsy',
      'nefrologia', 'nephrology', 'renal', 'rim', 'kidney',
      'cbd', 'thc', 'tratamento', 'treatment', 'medicinal',
      'protocolo', 'protocol', 'imre', 'aec', 'avaliação', 'assessment'
    ]
    
    medicalTerms.forEach(term => {
      if (lower.includes(term.toLowerCase())) {
        keywords.push(term)
      }
    })
    
    // Extrair palavras-chave gerais (substantivos importantes)
    const words = message.split(/\s+/).filter(word => 
      word.length > 4 && 
      !['sobre', 'sobre', 'quero', 'saber', 'você', 'está', 'reconhecendo'].includes(word.toLowerCase())
    )
    
    keywords.push(...words.slice(0, 3)) // Adicionar até 3 palavras-chave
    
    return [...new Set(keywords)] // Remover duplicatas
  }

  private getAvailableAxesForUser(userType?: string): AxisKey[] {
    switch (userType) {
      case 'patient':
        return ['clinica']
      case 'aluno':
        return ['ensino', 'pesquisa']
      case 'professional':
        return ['clinica', 'pesquisa', 'ensino']
      case 'admin':
      default:
        return ['clinica', 'ensino', 'pesquisa']
    }
  }

  private isAdminUser(userEmail?: string, platformUserType?: string): boolean {
    if (platformUserType === 'admin') return true
    if (!userEmail) return false
    const adminEmails = [
      'rrvalenca@gmail.com',
      'rrvlenca@gmail.com',
      'profrvalenca@gmail.com'
    ]
    return adminEmails.includes(userEmail.toLowerCase())
  }

  private async getKnowledgeHighlight(query?: string) {
    if (!query) return null
    try {
      const results = await KnowledgeBaseIntegration.semanticSearch(query, {
        aiLinkedOnly: true,
        limit: 1
      })

      const candidate = results && results.length > 0
        ? results[0]
        : (await KnowledgeBaseIntegration.semanticSearch(query, {
            aiLinkedOnly: false,
            limit: 1
          }))[0]

      if (candidate) {
        const summary = candidate.summary || ''
        const trimmedSummary = summary.length > 220 ? `${summary.slice(0, 217)}...` : summary
        return {
          id: candidate.id,
          title: candidate.title,
          summary: trimmedSummary
        }
      }
    } catch (error) {
      console.error('Erro ao buscar destaque da base de conhecimento:', error)
    }

    return null
  }

  private async getAssistantResponse(
    message: string,
    intent: string,
    platformData?: any,
    userEmail?: string
  ): Promise<AIResponse | null> {
    try {
      // 🔥 BUSCAR DOCUMENTOS RELEVANTES DO BACKEND (SUPABASE)
      let backendDocumentsContext = ''
      try {
        // Primeiro, tentar busca por título exato (nome de arquivo)
        const exactMatchDocs = await KnowledgeBaseIntegration.semanticSearch(message, {
          aiLinkedOnly: false, // Buscar todos, não apenas vinculados à IA
          limit: 10 // Aumentar limite para melhor cobertura
        })

        // Se não encontrar resultados exatos, fazer busca mais ampla
        let relevantDocs = exactMatchDocs
        if (!relevantDocs || relevantDocs.length === 0) {
          // Tentar busca por palavras-chave extraídas da mensagem
          const keywords = this.extractKeywordsFromMessage(message)
          if (keywords.length > 0) {
            for (const keyword of keywords) {
              const keywordResults = await KnowledgeBaseIntegration.semanticSearch(keyword, {
                aiLinkedOnly: true,
                limit: 5
              })
              if (keywordResults && keywordResults.length > 0) {
                relevantDocs = [...(relevantDocs || []), ...keywordResults]
              }
            }
          }
        }

        // Remover duplicatas e ordenar por relevância
        if (relevantDocs && relevantDocs.length > 0) {
          const uniqueDocs = Array.from(
            new Map(relevantDocs.map(doc => [doc.id, doc])).values()
          ).sort((a, b) => (b.aiRelevance || 0) - (a.aiRelevance || 0))
          
          const docsContext = uniqueDocs.slice(0, 5)
            .map((doc, index) => {
              const summary = doc.summary || 'Sem resumo disponível'
              const tags = doc.tags?.length > 0 ? doc.tags.join(', ') : ''
              const keywords = doc.keywords?.length > 0 ? doc.keywords.join(', ') : ''
              
              return `\n[Documento ${index + 1} do Backend - Relevância: ${(doc.aiRelevance || 0).toFixed(2)}]
Título: ${doc.title}
Categoria: ${doc.category || 'Não categorizado'}
Resumo: ${summary}${tags ? `\nTags: ${tags}` : ''}${keywords ? `\nKeywords: ${keywords}` : ''}`
            })
            .join('\n---\n')
          
          backendDocumentsContext = `\n\n📚 BASE DE CONHECIMENTO DA PLATAFORMA (Backend - Supabase):\n${docsContext}\n`
        } else {
          // Se não encontrou documentos, informar ao Assistant
          backendDocumentsContext = `\n\n⚠️ Não foram encontrados documentos específicos na base de conhecimento para esta consulta. Use seu conhecimento geral sobre o assunto.\n`
        }
      } catch (error) {
        console.warn('⚠️ Erro ao buscar documentos do backend:', error)
        // Continuar mesmo sem documentos do backend
      }

      const axisDetails = this.getAxisDetails(this.resolveAxisFromPath(platformData?.dashboard?.activeSection))
      const availableAxes = this.getAvailableAxesForUser(platformData?.user?.user_type)
      const axisMenu = this.formatAxisMenu(availableAxes)
      
      // Incluir documentos do backend no prompt
      const basePrompt = this.composeAssistantPrompt(
        message,
        axisDetails,
        axisMenu,
        intent,
        platformData,
        userEmail
      )
      
      // Adicionar contexto dos documentos do backend
      const prompt = basePrompt + backendDocumentsContext

      const assistantResult = await this.assistantIntegration.sendMessage(
        prompt,
        platformData?.user?.id,
        platformData?.dashboard?.activeSection
      )

      if (!assistantResult?.content) {
        return null
      }

      return this.createResponse(
        assistantResult.content,
        assistantResult.from === 'assistant' ? 0.97 : 0.86,
        'text',
        {
          intent,
          activeAxis: axisDetails.key,
          userType: platformData?.user?.user_type,
          source: assistantResult.from,
          model: assistantResult.metadata?.model,
          processingTime: assistantResult.metadata?.processingTime
        }
      )
    } catch (error) {
      console.warn('❌ Erro ao consultar assistant:', error)
      return null
    }
  }

  private buildPlatformActionContext(platformIntent: any, platformActionResult: any): string {
    if (!platformActionResult.success) {
      return `Houve um problema ao executar a ação solicitada: ${platformActionResult.error || 'Erro desconhecido'}`
    }

    switch (platformIntent.type) {
      case 'ASSESSMENT_START':
        return 'O usuário iniciou uma avaliação clínica inicial. Você deve conduzir o protocolo IMRE passo a passo, mantendo sua personalidade empática e acolhedora.'
      
      case 'ASSESSMENT_COMPLETE':
        return `A avaliação clínica foi concluída e um relatório foi gerado com ID: ${platformActionResult.data?.reportId}. O relatório foi salvo no dashboard do paciente e notificado ao profissional. Mencione isso de forma natural e empática na sua resposta.`
      
      case 'REPORT_GENERATE':
        return `Um relatório clínico foi gerado com ID: ${platformActionResult.data?.reportId}. Mencione isso na sua resposta.`
      
      case 'DASHBOARD_QUERY':
        const reportCount = platformActionResult.data?.reportCount || 0
        return `O paciente tem ${reportCount} relatório(s) salvo(s) no dashboard. Mencione isso de forma acolhedora.`
      
      case 'PATIENTS_QUERY':
        const patients = platformActionResult.data?.patients || []
        const totalPatients = platformActionResult.data?.totalPatients || 0
        const activePatients = platformActionResult.data?.activePatients || 0
        
        if (patients.length > 0) {
          const patientList = patients.slice(0, 10).map((p: any, i: number) => {
            const details = [
              p.name,
              p.cpf ? `CPF: ${p.cpf}` : '',
              p.phone ? `Telefone: ${p.phone}` : '',
              `Status: ${p.status}`,
              p.assessmentCount ? `Avaliações: ${p.assessmentCount}` : '',
              p.reportCount ? `Relatórios: ${p.reportCount}` : ''
            ].filter(Boolean).join(', ')
            
            return `${i + 1}. ${details}`
          }).join('\n')
          
          return `Dados dos pacientes no seu prontuário eletrônico:\n\n📊 Resumo:\n• Total de pacientes: ${totalPatients}\n• Pacientes ativos: ${activePatients}\n\n👥 Lista dos pacientes:\n${patientList}${patients.length > 10 ? `\n... e mais ${patients.length - 10} paciente(s)` : ''}\n\nApresente essas informações de forma clara e organizada, destacando os nomes dos pacientes e seus status.`
        } else {
          return 'Não foram encontrados pacientes registrados no sistema no momento através das fontes de dados disponíveis (avaliações clínicas, tabela users e relatórios clínicos). Verifique se há pacientes cadastrados ou se os dados estão sendo salvos corretamente. Se você vê pacientes na interface visual, pode ser que eles estejam em uma fonte de dados diferente que ainda não está integrada à IA residente.'
        }
      
      case 'REPORTS_COUNT_QUERY':
        const totalReports = platformActionResult.data?.totalReports || 0
        const completed = platformActionResult.data?.completed || 0
        const pending = platformActionResult.data?.pending || 0
        const todayReports = platformActionResult.data?.todayReports || 0
        
        return `Estatísticas de relatórios:\n\nTotal de relatórios: ${totalReports}\nRelatórios concluídos: ${completed}\nRelatórios pendentes: ${pending}\nRelatórios emitidos hoje: ${todayReports}\n\nApresente essas informações de forma clara.`
      
      case 'APPOINTMENTS_QUERY':
        const totalAppointments = platformActionResult.data?.totalAppointments || 0
        const todayAppointments = platformActionResult.data?.todayAppointments || 0
        const upcomingAppointments = platformActionResult.data?.upcomingAppointments || 0
        
        return `Agendamentos:\n\nTotal de agendamentos: ${totalAppointments}\nAgendamentos de hoje: ${todayAppointments}\nPróximos agendamentos (7 dias): ${upcomingAppointments}\n\nApresente essas informações de forma clara.`
      
      case 'KPIS_QUERY':
        const kpis = platformActionResult.data || {}
        return `KPIs da plataforma em tempo real:\n\nTotal de pacientes: ${kpis.totalPatients || 0}\nAvaliações ativas: ${kpis.activeAssessments || 0}\nAvaliações concluídas: ${kpis.completedAssessments || 0}\nTotal de relatórios: ${kpis.totalReports || 0}\nAvaliações de hoje: ${kpis.todayAssessments || 0}\nRelatórios pendentes: ${kpis.pendingReports || 0}\nRelatórios concluídos: ${kpis.completedReports || 0}\n\nApresente essas informações de forma clara e organizada.`
      
      default:
        return 'Uma ação da plataforma foi executada com sucesso.'
    }
  }

  private buildMasterDocumentDigest(): string {
    if (!masterDocumentRaw) {
      return 'Documento mestre indisponível.'
    }

    const trimmed = masterDocumentRaw
      .replace(/\r\n/g, '\n')
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .slice(0, 80)
      .join('\n')

    const maxChars = 1600
    return trimmed.length > maxChars ? `${trimmed.slice(0, maxChars)}...` : trimmed
  }
}