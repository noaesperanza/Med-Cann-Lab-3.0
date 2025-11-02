import { pipeline } from '@xenova/transformers'

export interface SemanticAnalysis {
  topics: string[]
  emotions: string
  biomedical_terms: string[]
  interpretations: string
  confidence: number
}

export interface ChatMessage {
  id: string
  text: string
  timestamp: Date
  isUser: boolean
  analysis?: SemanticAnalysis
}

class NOAEngine {
  private isInitialized = false
  private classifier: any = null
  private embeddings: any = null
  private sessionContext: ChatMessage[] = []

  async initialize() {
    if (this.isInitialized) return

    try {
      console.log('🧠 Inicializando NOA Engine...')
      
      // Carregar modelo de classificação de sentimentos
      this.classifier = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english')
      
      // Carregar modelo de embeddings para análise semântica
      this.embeddings = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
      
      this.isInitialized = true
      console.log('✅ NOA Engine inicializado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao inicializar NOA Engine:', error)
      throw error
    }
  }

  async analyzePatientInput(text: string): Promise<SemanticAnalysis> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Análise de sentimento
      const sentimentResult = await this.classifier(text)
      const emotions = sentimentResult[0]?.label || 'neutro'
      
      // Extrair termos biomédicos usando regex
      const biomedicalTerms = this.extractBiomedicalTerms(text)
      
      // Extrair tópicos principais
      const topics = this.extractTopics(text)
      
      // Gerar interpretação clínica
      const interpretations = this.generateClinicalInterpretation(text, biomedicalTerms, topics, emotions)
      
      // Calcular confiança baseada na análise
      const confidence = this.calculateConfidence(sentimentResult[0]?.score || 0.5, biomedicalTerms.length)

      return {
        topics,
        emotions,
        biomedical_terms: biomedicalTerms,
        interpretations,
        confidence
      }
    } catch (error) {
      console.error('❌ Erro na análise semântica:', error)
      return {
        topics: ['geral'],
        emotions: 'neutro',
        biomedical_terms: [],
        interpretations: 'Análise em andamento...',
        confidence: 0.5
      }
    }
  }

  private extractBiomedicalTerms(text: string): string[] {
    const medicalTerms = [
      'pressão', 'pressão alta', 'hipertensão', 'diabetes', 'glicose', 'açúcar',
      'coração', 'cardíaco', 'dor no peito', 'angina', 'infarto',
      'câncer', 'tumor', 'quimioterapia', 'radioterapia',
      'depressão', 'ansiedade', 'estresse', 'pânico',
      'dor', 'dores', 'cólica', 'enxaqueca', 'cefaleia',
      'febre', 'tosse', 'gripe', 'resfriado', 'alergia',
      'asma', 'bronquite', 'pneumonia',
      'rim', 'renal', 'fígado', 'hepatite', 'cirrose',
      'estômago', 'gastrite', 'úlcera', 'refluxo',
      'cannabis', 'maconha', 'CBD', 'THC', 'medicinal',
      'medicamento', 'remédio', 'droga', 'fármaco',
      'cirurgia', 'operar', 'pós-operatório',
      'exame', 'laboratório', 'sangue', 'urina',
      'dieta', 'alimentação', 'nutrição',
      'exercício', 'atividade física', 'fisioterapia',
      'sono', 'insônia', 'dormir',
      'peso', 'obesidade', 'magreza', 'emagrecer'
    ]

    const foundTerms = medicalTerms.filter(term => 
      text.toLowerCase().includes(term.toLowerCase())
    )

    return foundTerms
  }

  private extractTopics(text: string): string[] {
    const topicKeywords = {
      'sintomas': ['dor', 'cansaço', 'fadiga', 'mal-estar', 'sintoma', 'sintomas'],
      'medicamentos': ['medicamento', 'remédio', 'droga', 'fármaco', 'pílula', 'comprimido'],
      'exames': ['exame', 'laboratório', 'sangue', 'urina', 'raio-x', 'ultrassom'],
      'alimentação': ['comida', 'alimentação', 'dieta', 'nutrição', 'comer', 'beber'],
      'exercício': ['exercício', 'atividade', 'física', 'caminhar', 'correr', 'malhar'],
      'sono': ['dormir', 'sono', 'insônia', 'cansado', 'descansar'],
      'emocional': ['ansiedade', 'depressão', 'estresse', 'tristeza', 'alegria', 'medo'],
      'cannabis': ['cannabis', 'maconha', 'CBD', 'THC', 'medicinal', 'óleo']
    }

    const topics: string[] = []
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        topics.push(topic)
      }
    })

    return topics.length > 0 ? topics : ['geral']
  }

  private generateClinicalInterpretation(
    text: string, 
    biomedicalTerms: string[], 
    topics: string[], 
    emotions: string
  ): string {
    let interpretation = ''

    // Interpretação baseada em termos biomédicos
    if (biomedicalTerms.length > 0) {
      interpretation += `Identifiquei ${biomedicalTerms.length} termo(s) médico(s): ${biomedicalTerms.join(', ')}. `
    }

    // Interpretação baseada em tópicos
    if (topics.includes('sintomas')) {
      interpretation += 'Você está relatando sintomas que merecem atenção. '
    }
    if (topics.includes('medicamentos')) {
      interpretation += 'Mencionou uso de medicamentos - importante para o acompanhamento. '
    }
    if (topics.includes('cannabis')) {
      interpretation += 'Falou sobre cannabis medicinal - área de especialização da NOA. '
    }

    // Interpretação emocional
    if (emotions === 'POSITIVE') {
      interpretation += 'Percebo um tom positivo em sua fala. '
    } else if (emotions === 'NEGATIVE') {
      interpretation += 'Entendo que pode estar passando por um momento difícil. '
    }

    return interpretation || 'Analisando suas palavras com cuidado...'
  }

  private calculateConfidence(sentimentScore: number, biomedicalTermsCount: number): number {
    // Confiança baseada na pontuação de sentimento e número de termos biomédicos
    const sentimentConfidence = Math.abs(sentimentScore - 0.5) * 2 // 0-1
    const termsConfidence = Math.min(biomedicalTermsCount / 5, 1) // 0-1
    return (sentimentConfidence + termsConfidence) / 2
  }

  addToContext(message: ChatMessage) {
    this.sessionContext.push(message)
    
    // Manter apenas as últimas 10 mensagens
    if (this.sessionContext.length > 10) {
      this.sessionContext = this.sessionContext.slice(-10)
    }
  }

  getContext(): ChatMessage[] {
    return this.sessionContext
  }

  clearContext() {
    this.sessionContext = []
  }

  generateNOAResponse(userMessage: string, analysis: SemanticAnalysis): string {
    const responses = [
      `Entendi, você mencionou ${analysis.biomedical_terms.slice(0, 2).join(' e ')}. Quer que eu registre isso no seu acompanhamento?`,
      `Percebo que está falando sobre ${analysis.topics[0]}. Como você tem se sentido com isso?`,
      `Interessante, você trouxe ${analysis.biomedical_terms.length} ponto(s) importante(s). Vamos explorar mais?`,
      `Compreendo sua preocupação com ${analysis.biomedical_terms[0] || 'essa questão'}. Posso ajudar de alguma forma?`,
      `Vejo que ${analysis.emotions === 'POSITIVE' ? 'está se sentindo bem' : 'pode estar passando por dificuldades'}. Conte-me mais.`,
      `Registrei suas palavras sobre ${analysis.topics.join(' e ')}. Isso é muito importante para seu acompanhamento.`,
      `Sua fala sobre ${analysis.biomedical_terms[0] || 'essa questão'} me chamou atenção. Vamos conversar mais sobre isso?`,
      `Entendo perfeitamente. ${analysis.interpretations} Como posso te ajudar melhor?`
    ]

    // Selecionar resposta baseada na análise
    let selectedResponse = responses[Math.floor(Math.random() * responses.length)]
    
    // Personalizar baseado na análise
    if (analysis.biomedical_terms.length > 0) {
      selectedResponse = responses[0] // Resposta focada em termos biomédicos
    } else if (analysis.topics.includes('cannabis')) {
      selectedResponse = `Falou sobre cannabis medicinal! 🌿 Essa é minha especialidade. Conte-me mais sobre sua experiência.`
    } else if (analysis.emotions === 'NEGATIVE') {
      selectedResponse = responses[4] // Resposta empática
    }

    return selectedResponse
  }
}

export const noaEngine = new NOAEngine()
