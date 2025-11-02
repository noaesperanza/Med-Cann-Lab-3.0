// Sistema de Treinamento e Contexto da Nôa Esperança
// Gerencia todo o conhecimento e histórico da plataforma

interface PatientSimulation {
  id: string
  name: string
  age: number
  condition: string
  symptoms: string[]
  medicalHistory: string
  currentStatus: 'active' | 'completed' | 'archived'
  conversationLog: ConversationMessage[]
  assessments: AssessmentRecord[]
  timestamp: Date
}

interface ConversationMessage {
  role: 'user' | 'noa' | 'system'
  content: string
  timestamp: Date
  context?: {
    route?: string
    userId?: string
    userCode?: string
  }
  metadata?: {
    confidence?: number
    intent?: string
    entities?: string[]
  }
}

interface AssessmentRecord {
  id: string
  patientId: string
  type: 'initial' | 'followup' | 'imre'
  status: 'in_progress' | 'completed'
  data: any
  timestamp: Date
}

interface PlatformContext {
  // Informações do sistema
  platformName: string
  version: string
  lastUpdate: Date
  features: string[]
  
  // Estatísticas da plataforma
  totalUsers: number
  activeSimulations: number
  completedAssessments: number
  
  // Métricas
  avgResponseTime: number
  userSatisfaction: number
  systemHealth: 'excellent' | 'good' | 'moderate' | 'poor'
}

interface UserIdentity {
  code: string
  name: string
  role: 'developer' | 'admin' | 'professional' | 'observer'
  permissions: string[]
  accessLevel: 'full' | 'limited' | 'observer'
}

export class NoaTrainingSystem {
  private platformContext: PlatformContext
  private patientSimulations: Map<string, PatientSimulation>
  private conversationHistory: ConversationMessage[]
  private userIdentities: Map<string, UserIdentity>
  private currentRoute: string = '/'
  
  constructor() {
    this.platformContext = {
      platformName: 'MedCannLab 3.0',
      version: '3.0.0',
      lastUpdate: new Date(),
      features: [
        'Avaliação Clínica IMRE Triaxial (28 blocos especializados)',
        'Chat com IA Residente Nôa Esperança',
        'Sistema de Gestão de Pacientes (Prontuário Eletrônico)',
        'Biblioteca Médica (500+ artigos científicos)',
        'Gamificação e Certificações',
        'Chat Global para Profissionais',
        'Sistema Financeiro e Subscrições',
        'Preparação de Aulas a partir de casos clínicos'
      ],
      totalUsers: 156,
      activeSimulations: 0,
      completedAssessments: 0,
      avgResponseTime: 1.2,
      userSatisfaction: 4.7,
      systemHealth: 'excellent'
    }
    
    this.patientSimulations = new Map()
    this.conversationHistory = []
    this.userIdentities = new Map()
    
    // Usuário dev/admin padrão
    this.registerUser('DEV-001', 'Administrador', 'developer', ['full'])
  }

  // Registro de identidade do usuário
  registerUser(code: string, name: string, role: UserIdentity['role'], permissions: string[]) {
    const accessLevel = role === 'developer' ? 'full' : role === 'admin' ? 'full' : 'limited'
    
    this.userIdentities.set(code, {
      code,
      name,
      role,
      permissions,
      accessLevel
    })
  }

  // Identificar usuário atual
  identifyUser(code: string): UserIdentity | null {
    return this.userIdentities.get(code) || null
  }

  // Adicionar mensagem ao histórico
  addConversationMessage(message: Omit<ConversationMessage, 'timestamp'>) {
    const fullMessage: ConversationMessage = {
      ...message,
      timestamp: new Date()
    }
    
    this.conversationHistory.push(fullMessage)
    
    // Manter apenas últimas 1000 mensagens
    if (this.conversationHistory.length > 1000) {
      this.conversationHistory = this.conversationHistory.slice(-1000)
    }
  }

  // Criar simulação de paciente
  createPatientSimulation(patientData: Partial<PatientSimulation>): PatientSimulation {
    const simulation: PatientSimulation = {
      id: `patient-${Date.now()}`,
      name: patientData.name || 'Paciente Anônimo',
      age: patientData.age || 45,
      condition: patientData.condition || 'Não especificado',
      symptoms: patientData.symptoms || [],
      medicalHistory: patientData.medicalHistory || '',
      currentStatus: 'active',
      conversationLog: [],
      assessments: [],
      timestamp: new Date(),
      ...patientData
    }
    
    this.patientSimulations.set(simulation.id, simulation)
    this.platformContext.activeSimulations = this.patientSimulations.size
    
    return simulation
  }

  // Obter contexto completo da conversa
  getConversationContext(userCode?: string, limit: number = 50): ConversationMessage[] {
    let messages = [...this.conversationHistory]
    
    // Filtrar por código do usuário se fornecido
    if (userCode) {
      messages = messages.filter(msg => msg.context?.userCode === userCode)
    }
    
    // Retornar apenas últimas N mensagens
    return messages.slice(-limit)
  }

  // Analisar pergunta e contexto
  analyzeQuery(query: string, userCode?: string, currentRoute?: string): {
    intent: 'question' | 'command' | 'simulation' | 'status'
    entities: string[]
    context: {
      route?: string
      userCode?: string
      relatedSimulations?: string[]
    }
    suggestedResponse?: string
  } {
    const lowerQuery = query.toLowerCase()
    
    // Detectar intenções
    let intent: 'question' | 'command' | 'simulation' | 'status' = 'question'
    const entities: string[] = []
    
    if (lowerQuery.includes('simular') || lowerQuery.includes('paciente') || lowerQuery.includes('caso')) {
      intent = 'simulation'
      entities.push('patient_simulation')
    }
    
    if (lowerQuery.includes('status') || lowerQuery.includes('como está') || lowerQuery.includes('situação')) {
      intent = 'status'
      entities.push('platform_status')
    }
    
    if (lowerQuery.includes('criar') || lowerQuery.includes('adicionar') || lowerQuery.includes('remover')) {
      intent = 'command'
    }
    
    // Detectar entidades
    const features = [
      'avaliação clínica', 'imre', 'chat', 'dashboard', 'painel', 'pacientes', 'profissionais',
      'relatórios', 'agendamentos', 'biblioteca', 'documento', 'artigo', 'gamificação', 
      'financeiro', 'finanças', 'entrevista', 'anamnese', 'caso clínico', 'simulação',
      'aula', 'preparação', 'curso', 'certificado', 'nota'
    ]
    
    features.forEach(feature => {
      if (lowerQuery.includes(feature)) {
        entities.push(feature)
      }
    })
    
    // Buscar simulações relacionadas
    const relatedSimulations: string[] = []
    this.patientSimulations.forEach((sim, id) => {
      if (lowerQuery.includes(sim.name.toLowerCase()) || lowerQuery.includes(sim.condition.toLowerCase())) {
        relatedSimulations.push(id)
      }
    })
    
    return {
      intent,
      entities,
      context: {
        route: currentRoute,
        userCode,
        relatedSimulations: relatedSimulations.length > 0 ? relatedSimulations : undefined
      }
    }
  }

  // Gerar resposta contextual com conhecimento da plataforma
  generateContextualResponse(query: string, userCode?: string, currentRoute?: string): string {
    const analysis = this.analyzeQuery(query, userCode, currentRoute)
    const user = userCode ? this.identifyUser(userCode) : null
    const recentMessages = this.getConversationContext(userCode, 10)
    
    let response = ''
    
    // Cumprimentar usuário identificado apenas na primeira mensagem
    if (user && recentMessages.length === 0) {
      response += `Olá, ${user.name}! `
    }
    
    // Responder baseado na intenção
    switch (analysis.intent) {
      case 'status':
        response += this.generateStatusResponse()
        break
      
      case 'simulation':
        response += this.generateSimulationResponse(analysis)
        break
      
      case 'question':
        response += this.generateEnhancedQuestionResponse(query, analysis, recentMessages)
        break
      
      case 'command':
        response += this.generateCommandResponse(query, analysis)
        break
      
      default:
        response += this.generateDefaultResponse(query)
    }
    
    return response
  }

  // Gerar resposta de status
  private generateStatusResponse(): string {
    const ctx = this.platformContext
    
    return `**Status da Plataforma**\n\n` +
      `🏥 **${ctx.platformName}** v${ctx.version}\n` +
      `📊 Usuários: ${ctx.totalUsers}\n` +
      `🤖 Simulações Ativas: ${ctx.activeSimulations}\n` +
      `📋 Avaliações Concluídas: ${ctx.completedAssessments}\n` +
      `⚡ Tempo Médio de Resposta: ${ctx.avgResponseTime}s\n` +
      `💚 Satisfação: ${ctx.userSatisfaction}/5.0\n` +
      `🔋 Sistema: ${this.getHealthEmoji(ctx.systemHealth)} ${ctx.systemHealth}\n\n` +
      `**Funcionalidades Disponíveis:**\n${ctx.features.map(f => `- ${f}`).join('\n')}\n\n` +
      `Última atualização: ${ctx.lastUpdate.toLocaleString('pt-BR')}`
  }

  // Gerar resposta de simulação
  private generateSimulationResponse(analysis: any): string {
    const simulations = Array.from(this.patientSimulations.values())
    
    if (simulations.length === 0) {
      return `Não há simulações de pacientes ativas no momento.\n\n` +
        `Posso criar uma simulação para você! ` +
        `Basta me dizer qual tipo de caso clínico você gostaria de simular.`
    }
    
    let response = `**Simulações de Pacientes:**\n\n`
    
    simulations.forEach(sim => {
      response += `👤 **${sim.name}** (${sim.age} anos)\n` +
        `📋 Condição: ${sim.condition}\n` +
        `🩺 Sintomas: ${sim.symptoms.join(', ')}\n` +
        `📊 Status: ${sim.currentStatus}\n` +
        `🕐 Criado em: ${sim.timestamp.toLocaleString('pt-BR')}\n\n`
    })
    
    return response
  }

  // Gerar resposta de pergunta com conhecimento expandido
  private generateEnhancedQuestionResponse(query: string, analysis: any, recentMessages: ConversationMessage[]): string {
    const lowerQuery = query.toLowerCase()
    let response = ''
    
    // Detecção específica de perguntas sobre biblioteca
    if (lowerQuery.includes('biblioteca') || lowerQuery.includes('documento') || lowerQuery.includes('artigo')) {
      return `📚 **Biblioteca Médica**\n\n` +
        `Nossa biblioteca atualmente possui:\n` +
        `• Mais de 500 artigos científicos sobre cannabis medicinal\n` +
        `• Guias clínicos e protocolos de tratamento\n` +
        `• Materiais didáticos para formação\n` +
        `• Pesquisas atualizadas sobre terapias com canabinoides\n\n` +
        `Você pode acessar a biblioteca através do menu lateral. ` +
        `Deseja que eu busque algo específico para você?`
    }
    
    // Detecção de perguntas sobre entrevista clínica
    if (lowerQuery.includes('entrevista') || lowerQuery.includes('anamnese') || lowerQuery.includes('arte')) {
      return `🎨 **A Arte da Entrevista Clínica**\n\n` +
        `A entrevista clínica é fundamental no processo de cuidado. Principais aspectos:\n\n` +
        `**1. Escuta Ativa**\n` +
        `• Dar atenção plena ao paciente\n` +
        `• Fazer perguntas abertas\n` +
        `• Validar sentimentos e preocupações\n\n` +
        `**2. Rapport e Empatia**\n` +
        `• Criar ambiente de confiança\n` +
        `• Demonstrar compreensão\n` +
        `• Respeitar o tempo do paciente\n\n` +
        `**3. Técnicas de Comunicação**\n` +
        `• Reformulação e clarificação\n` +
        `• Uso de perguntas abertas e fechadas\n` +
        `• Observação de linguagem não verbal\n\n` +
        `**4. Estrutura IMRE**\n` +
        `• **I** - Identificação da Queixa\n` +
        `• **M** - Medicação e Histórico\n` +
        `• **R** - Responsabilidade e Contexto\n` +
        `• **E** - Escuta Empática\n\n` +
        `Posso simular uma entrevista clínica com você ou criar um caso prático!`
    }
    
    // Detecção de perguntas sobre dashboard
    if (lowerQuery.includes('dashboard') || lowerQuery.includes('painel')) {
      return `📊 **Dashboards Personalizados**\n\n` +
        `Cada tipo de usuário tem seu próprio dashboard:\n\n` +
        `**👨‍⚕️ Profissional:**\n` +
        `• Gestão de pacientes\n` +
        `• Prontuários eletrônicos\n` +
        `• Relatórios clínicos\n` +
        `• Preparação de aulas\n` +
        `• Gestão financeira\n\n` +
        `**🏥 Paciente:**\n` +
        `• Chat com Nôa\n` +
        `• Meus relatórios\n` +
        `• Agendamentos\n` +
        `• Planos e finanças\n\n` +
        `**🎓 Estudante:**\n` +
        `• Certificações\n` +
        `• Biblioteca\n` +
        `• Cursos\n\n` +
        `**⚙️ Admin:**\n` +
        `• Gestão completa da plataforma\n` +
        `• Análises e métricas\n`
    }
    
    // Análise de contexto das mensagens recentes
    const contextTopics = this.extractContextTopics(recentMessages)
    
    // Responder baseado nas entidades detectadas
    if (analysis.entities.includes('avaliação clínica')) {
      response += `📋 O sistema de avaliação clínica IMRE Triaxial está ` +
        `operando normalmente. Posso criar uma simulação de avaliação para você.\n\n`
    }
    
    if (analysis.entities.includes('chat')) {
      response += `💬 O chat com Nôa Esperança está integrado em todas as rotas. ` +
        `Você pode conversar comigo sobre qualquer aspecto da plataforma.\n\n`
    }
    
    // Resposta genérica se nenhuma entidade específica detectada
    if (analysis.entities.length === 0 && !response) {
      response = `Como IA residente da plataforma, estou aqui para ajudar com:\n\n` +
        `• Status da plataforma\n` +
        `• Simulações de pacientes\n` +
        `• Informações sobre funcionalidades\n` +
        `• Biblioteca médica\n` +
        `• Técnicas de entrevista clínica\n` +
        `• E muito mais...\n\n` +
        `O que você gostaria de saber?`
    }
    
    return response
  }
  
  // Gerar resposta de pergunta (método antigo para compatibilidade)
  private generateQuestionResponse(query: string, analysis: any, recentMessages: ConversationMessage[]): string {
    return this.generateEnhancedQuestionResponse(query, analysis, recentMessages)
  }

  // Gerar resposta de comando
  private generateCommandResponse(query: string, analysis: any): string {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('criar paciente') || lowerQuery.includes('simular paciente')) {
      return this.createDefaultPatientSimulation()
    }
    
    if (lowerQuery.includes('listar') || lowerQuery.includes('mostrar')) {
      return this.generateSimulationResponse(analysis)
    }
    
    return `Comando reconhecido. ` +
      `Ainda estou aprendendo a executar comandos específicos. ` +
      `Por favor, descreva melhor o que você gostaria que eu fizesse.`
  }

  // Resposta padrão
  private generateDefaultResponse(query: string): string {
    return `Entendi sua mensagem: "${query}"\n\n` +
      `Como IA residente da plataforma, posso ajudar com:\n` +
      `- Status da plataforma\n` +
      `- Simulações de pacientes\n` +
      `- Informações sobre funcionalidades\n` +
      `- Histórico de conversas\n\n` +
      `Como posso ajudar você?`
  }

  // Criar simulação de paciente padrão
  private createDefaultPatientSimulation(): string {
    const simulation = this.createPatientSimulation({
      name: 'Maria Silva',
      age: 56,
      condition: 'Dor Crônica em Joelho Direito',
      symptoms: [
        'Dor constante no joelho direito',
        'Dificuldade para dormir',
        'Limitação de movimento',
        'Rigidez matinal'
      ],
      medicalHistory: 'Paciente relata dor há 8 meses, sem trauma direto. ' +
        'Refere uso de anti-inflamatórios sem melhora significativa. ' +
        'Busca alternativas terapêuticas.'
    })
    
    return `✅ **Simulação de Paciente Criada!**\n\n` +
      `👤 **${simulation.name}** (${simulation.age} anos)\n` +
      `📋 Condição: ${simulation.condition}\n` +
      `🩺 Sintomas:\n${simulation.symptoms.map(s => `- ${s}`).join('\n')}\n` +
      `📝 Histórico: ${simulation.medicalHistory}\n` +
      `🆔 ID: ${simulation.id}\n\n` +
      `Agora você pode iniciar uma avaliação clínica com esta paciente. ` +
      `Como gostaria de proceder?`
  }

  // Extrair tópicos do contexto
  private extractContextTopics(messages: ConversationMessage[]): string[] {
    const topics = new Set<string>()
    
    messages.forEach(msg => {
      if (msg.content) {
        const words = msg.content.toLowerCase().split(/\s+/)
        words.forEach(word => {
          if (word.length > 4 && !this.isCommonWord(word)) {
            topics.add(word)
          }
        })
      }
    })
    
    return Array.from(topics)
  }

  // Verificar se palavra é comum
  private isCommonWord(word: string): boolean {
    const commonWords = [
      'como', 'para', 'com', 'que', 'não', 'você', 'isso', 'mais', 'sobre',
      'sobre', 'muito', 'quando', 'onde', 'porque', 'também', 'primeiro'
    ]
    return commonWords.includes(word)
  }

  // Emoji de saúde do sistema
  private getHealthEmoji(health: string): string {
    switch (health) {
      case 'excellent': return '🟢'
      case 'good': return '🟡'
      case 'moderate': return '🟠'
      case 'poor': return '🔴'
      default: return '⚪'
    }
  }

  // Atualizar contexto da plataforma
  updatePlatformContext(updates: Partial<PlatformContext>) {
    this.platformContext = {
      ...this.platformContext,
      ...updates,
      lastUpdate: new Date()
    }
  }

  // Obter simulações ativas
  getActiveSimulations(): PatientSimulation[] {
    return Array.from(this.patientSimulations.values()).filter(
      sim => sim.currentStatus === 'active'
    )
  }

  // Obter estatísticas
  getStats() {
    return {
      platform: this.platformContext,
      activeSimulations: this.patientSimulations.size,
      totalConversations: this.conversationHistory.length,
      registeredUsers: this.userIdentities.size
    }
  }

  // Definir rota atual
  setCurrentRoute(route: string) {
    this.currentRoute = route
  }

  // Obter rota atual
  getCurrentRoute() {
    return this.currentRoute
  }
}

// Instância singleton
let noaTrainingSystem: NoaTrainingSystem | null = null

export const getNoaTrainingSystem = (): NoaTrainingSystem => {
  if (!noaTrainingSystem) {
    noaTrainingSystem = new NoaTrainingSystem()
  }
  return noaTrainingSystem
}
