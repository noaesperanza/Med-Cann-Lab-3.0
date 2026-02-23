import { supabase } from './supabase'
import LocalLLM from './localLLM'

export interface Document {
  id: string
  title: string
  content: string
  summary: string
  keywords: string[]
  medical_terms: string[]
  embeddings?: number[]
  created_at: string
}

export class RAGSystem {
  private localLLM: LocalLLM
  private isInitialized = false

  constructor() {
    this.localLLM = new LocalLLM()
  }

  private calculateAIRelevance(fileName: string, content: string): number {
    const name = fileName.toLowerCase();
    const text = content.toLowerCase();

    // Prioridade Máxima: Protocolos, Diretrizes e Manuais Oficiais
    if (name.includes('protocolo') || name.includes('diretriz') || name.includes('manual') ||
      text.includes('protocolo clínico') || text.includes('diretriz terapêutica')) {
      return 1.0;
    }

    // Prioridade Alta: Artigos Científicos, Estudos e Pesquisas
    if (name.includes('artigo') || name.includes('estudo') || name.includes('pesquisa') ||
      name.includes('paper') || text.includes('clinical trial') || text.includes('metanálise')) {
      return 0.85;
    }

    // Prioridade Média: Notas de Aula, Resumos, Materiais de Apoio
    if (name.includes('aula') || name.includes('resumo') || name.includes('slide') ||
      name.includes('apresentação')) {
      return 0.7;
    }

    // Padrão para outros documentos
    return 0.6;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log('🧠 Inicializando sistema RAG...')
      await this.localLLM.initialize()
      this.isInitialized = true
      console.log('✅ Sistema RAG pronto!')
    } catch (error) {
      console.error('❌ Erro ao inicializar RAG:', error)
      throw error
    }
  }

  async processDocument(file: File): Promise<Document> {
    if (!this.isInitialized) await this.initialize()

    try {
      console.log('📄 Processando documento:', file.name)

      // 1. Extrair texto do arquivo
      const text = await this.extractTextFromFile(file)

      // 2. Gerar resumo com LLM local
      const summary = await this.localLLM.summarizeDocument(text)

      // 3. Extrair palavras-chave
      const keywords = await this.localLLM.extractKeywords(text)

      // 4. Gerar embeddings
      const embeddings = await this.localLLM.generateEmbeddings(text)

      // 5. Salvar no banco de dados
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: file.name,
          content: text,
          summary,
          keywords,
          medical_terms: keywords,
          embeddings: JSON.stringify(embeddings),
          isLinkedToAI: true,
          aiRelevance: this.calculateAIRelevance(file.name, text)
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao salvar documento:', error)
        throw error
      }

      console.log('✅ Documento processado e salvo!')
      return data as any
    } catch (error) {
      console.error('Erro ao processar documento:', error)
      throw error
    }
  }

  async generateResponse(question: string): Promise<string> {
    if (!this.isInitialized) await this.initialize()

    try {
      console.log('🤖 Gerando resposta com análise cruzada para:', question)

      // 1. Buscar documentos relevantes
      const relevantDocs = await this.retrieveRelevantDocuments(question)

      if (relevantDocs.length === 0) {
        return this.generateNoContextResponse(question)
      }

      // 2. Análise cruzada e similaridade
      const crossAnalysis = await this.performCrossAnalysis(question, relevantDocs)

      // 3. Construir contexto enriquecido
      const context = relevantDocs.map(doc => doc.content).join('\n\n')

      // 4. Gerar resposta com LLM local
      const answer = await this.localLLM.answerQuestion(question, context)

      // 5. Formatar resposta com análise cruzada
      return this.formatCannabisResponse(answer, relevantDocs)
    } catch (error) {
      console.error('Erro ao gerar resposta:', error)
      return "Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente."
    }
  }

  private async performCrossAnalysis(question: string, docs: Document[]): Promise<any> {
    // Simular análise cruzada inteligente
    const similarities = []
    const patterns = []
    const connections = []

    // Encontrar similaridades entre documentos
    for (let i = 0; i < docs.length; i++) {
      for (let j = i + 1; j < docs.length; j++) {
        const similarity = this.calculateDocumentSimilarity(docs[i], docs[j])
        if (similarity > 0.7) {
          similarities.push({
            doc1: docs[i].title,
            doc2: docs[j].title,
            similarity: Math.round(similarity * 100),
            commonTerms: this.findCommonTerms(docs[i], docs[j])
          })
        }
      }
    }

    // Identificar padrões
    const allKeywords = docs.flatMap(doc => doc.keywords)
    const keywordFrequency = this.calculateKeywordFrequency(allKeywords)
    const topPatterns = Object.entries(keywordFrequency)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([keyword, freq]) => ({ keyword, frequency: freq }))

    return {
      similarities,
      patterns: topPatterns,
      totalConnections: similarities.length,
      crossReferences: this.findCrossReferences(docs)
    }
  }

  private calculateDocumentSimilarity(doc1: Document, doc2: Document): number {
    const keywords1 = doc1.keywords || []
    const keywords2 = doc2.keywords || []

    const intersection = keywords1.filter(k => keywords2.includes(k))
    const union = [...new Set([...keywords1, ...keywords2])]

    return intersection.length / union.length
  }

  private findCommonTerms(doc1: Document, doc2: Document): string[] {
    const keywords1 = doc1.keywords || []
    const keywords2 = doc2.keywords || []
    return keywords1.filter(k => keywords2.includes(k))
  }

  private calculateKeywordFrequency(keywords: string[]): { [key: string]: number } {
    return keywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1
      return acc
    }, {} as { [key: string]: number })
  }

  private findCrossReferences(docs: Document[]): any[] {
    const references: any[] = []
    docs.forEach(doc => {
      if (doc.content.includes('estudo') || doc.content.includes('pesquisa')) {
        references.push({
          type: 'estudo',
          title: doc.title,
          relevance: 'alta'
        })
      }
    })
    return references
  }

  async retrieveRelevantDocuments(question: string): Promise<Document[]> {
    try {
      // Buscar todos os documentos
      const { data: allDocs, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Erro ao buscar documentos:', error)
        return []
      }

      if (!allDocs || allDocs.length === 0) {
        return []
      }

      // Usar LLM para encontrar documentos similares
      const relevantDocs = await this.localLLM.findSimilarDocuments(question, allDocs)

      return relevantDocs
    } catch (error) {
      console.error('Erro ao recuperar documentos:', error)
      return []
    }
  }

  async getAllDocuments(): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar documentos:', error)
        return []
      }

      return (data || []) as any[]
    } catch (error) {
      console.error('Erro ao buscar documentos:', error)
      return []
    }
  }

  private async extractTextFromFile(file: File): Promise<string> {
    if (file.type === 'application/pdf') {
      try {
        console.log('📄 Extraindo texto de PDF usando pdfjs-dist...')
        const arrayBuffer = await file.arrayBuffer()

        // Importação dinâmica para evitar problemas de SSR se houver
        const pdfjsLib = await import('pdfjs-dist')

        // Configurar o worker (importante para pdf.js)
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        let fullText = ''

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
          fullText += pageText + '\n'

          if (fullText.length > 50000) break // Limite de sanidade
        }

        return fullText || 'Documento PDF sem texto extraível.'
      } catch (error) {
        console.error('❌ Erro na extração de PDF:', error)
        return 'Falha ao ler conteúdo do PDF.'
      }
    }

    // Fallback para arquivos de texto (.txt, .md, etc)
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string || ''
        resolve(text.substring(0, 50000))
      }
      reader.onerror = () => resolve('Erro ao carregar arquivo de texto.')
      reader.readAsText(file)
    })
  }

  private formatResponse(answer: string, docs: Document[], question: string): string {
    const lowerQuestion = question.toLowerCase()

    // Respostas específicas para temas médicos
    if (lowerQuestion.includes('cannabis') || lowerQuestion.includes('cbd')) {
      return this.formatCannabisResponse(answer, docs)
    }

    if (lowerQuestion.includes('protocolo') || lowerQuestion.includes('imre')) {
      return this.formatProtocolResponse(answer, docs)
    }

    if (lowerQuestion.includes('dor') || lowerQuestion.includes('dor crônica')) {
      return this.formatPainResponse(answer, docs)
    }

    // Resposta genérica
    return this.formatGenericResponse(answer, docs)
  }

  private formatCannabisResponse(answer: string, docs: Document[]): string {
    const cannabisDocs = docs.filter(doc =>
      doc.keywords.some(k => k.includes('cannabis') || k.includes('cbd'))
    )

    return `🌿 **Análise sobre Cannabis Medicinal:**

${answer}

📄 **Documentos Analisados:**
${cannabisDocs.map(doc => `• ${doc.title}`).join('\n')}

🔍 **Informações Adicionais:**
• CBD demonstra eficácia em epilepsia refratária
• THC tem aplicações em dor crônica e náuseas
• Dosagem deve ser individualizada

💡 **Recomendações:**
• Iniciar com baixas doses
• Monitorar efeitos adversos
• Documentar resposta terapêutica

Precisa de mais detalhes sobre algum aspecto específico?`
  }

  private formatProtocolResponse(answer: string, docs: Document[]): string {
    return `📋 **Protocolo IMRE Triaxial:**

${answer}

🎯 **Estrutura do Protocolo:**
• 28 blocos de avaliação
• Anamnese detalhada
• Exame físico sistematizado
• Avaliação psicossocial

📊 **Benefícios:**
• Reduz variabilidade na avaliação
• Melhora qualidade do registro
• Facilita comunicação entre profissionais

Gostaria que eu detalhe algum bloco específico do protocolo?`
  }

  private formatPainResponse(answer: string, docs: Document[]): string {
    return `🩺 **Análise sobre Dor Crônica:**

${answer}

📚 **Documentos Relevantes:**
${docs.map(doc => `• ${doc.title}`).join('\n')}

💊 **Abordagens Terapêuticas:**
• Medicamentos convencionais
• Cannabis medicinal
• Terapias complementares

🔬 **Evidências Científicas:**
• Estudos clínicos disponíveis
• Protocolos de tratamento
• Resultados documentados

Precisa de informações sobre algum tratamento específico?`
  }

  private formatGenericResponse(answer: string, docs: Document[]): string {
    return `🤖 **Resposta da IA:**

${answer}

📄 **Documentos Consultados:**
${docs.map(doc => `• ${doc.title}`).join('\n')}

🔍 **Contexto Encontrado:**
${docs.map(doc => `• ${doc.summary}`).join('\n')}

💡 **Próximos Passos:**
Gostaria que eu detalhe algum aspecto específico ou você tem alguma pergunta mais direcionada?`
  }

  private generateNoContextResponse(question: string): string {
    return `🤖 **Resposta da IA:**

Não encontrei informações específicas sobre "${question}" nos documentos disponíveis.

📚 **Para melhorar as respostas:**
• Faça upload de mais documentos relevantes
• Reformule sua pergunta de forma mais específica
• Use termos médicos mais precisos

💡 **Sugestões:**
• Tente perguntas sobre: cannabis, protocolos, dor crônica
• Use palavras-chave médicas específicas
• Seja mais específico sobre o tema de interesse

Gostaria de fazer upload de algum documento para enriquecer a base de conhecimento?`
  }
}

export default RAGSystem
