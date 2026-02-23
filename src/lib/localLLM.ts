import { pipeline } from '@xenova/transformers'
import './transformersConfig'

export class LocalLLM {
  private embeddingPipeline: any = null
  private qaPipeline: any = null
  private summarizer: any = null
  private isInitialized = false

  async initialize() {
    if (this.isInitialized) return

    try {
      console.log('🤖 Inicializando modelos locais...')
      
      // MiniLM-L6 para embeddings (super rápido)
      this.embeddingPipeline = await pipeline(
        'feature-extraction', 
        'Xenova/all-MiniLM-L6-v2'
      )
      
      // DistilBERT para Q&A (leve e eficiente)
      this.qaPipeline = await pipeline(
        'question-answering',
        'Xenova/distilbert-base-cased-distilled-squad'
      )
      
      // DistilBART para sumarização (otimizado)
      this.summarizer = await pipeline(
        'summarization',
        'Xenova/distilbart-cnn-12-6'
      )
      
      this.isInitialized = true
      console.log('✅ Modelos carregados com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao carregar modelos:', error)
      throw error
    }
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    if (!this.embeddingPipeline) await this.initialize()
    
    try {
      const result = await this.embeddingPipeline(text, {
        pooling: 'mean',
        normalize: true
      })
      
      // Retornar embeddings como array de números
      return Array.from(result.data)
    } catch (error) {
      console.error('Erro ao gerar embeddings:', error)
      return []
    }
  }

  async answerQuestion(question: string, context: string): Promise<string> {
    if (!this.qaPipeline) await this.initialize()
    
    try {
      const result = await this.qaPipeline(question, context)
      
      if (result.score > 0.1) {
        return result.answer
      } else {
        return "Não encontrei informações suficientes no contexto fornecido."
      }
    } catch (error) {
      console.error('Erro ao responder pergunta:', error)
      return "Desculpe, ocorreu um erro ao processar sua pergunta."
    }
  }

  async summarizeDocument(text: string): Promise<string> {
    if (!this.summarizer) await this.initialize()
    
    try {
      // Limitar tamanho do texto para o modelo
      const maxLength = 1000
      const truncatedText = text.length > maxLength 
        ? text.substring(0, maxLength) + '...'
        : text
      
      const result = await this.summarizer(truncatedText, {
        max_length: 150,
        min_length: 50,
        do_sample: false
      })
      
      return result[0].summary_text
    } catch (error) {
      console.error('Erro ao resumir documento:', error)
      return "Resumo não disponível."
    }
  }

  async extractKeywords(text: string): Promise<string[]> {
    // Extrair palavras-chave médicas relevantes
    const medicalTerms = [
      'cannabis', 'cbd', 'thc', 'dor', 'epilepsia', 'ansiedade', 'depressão',
      'protocolo', 'dosagem', 'tratamento', 'sintomas', 'diagnóstico',
      'anamnese', 'exame', 'terapêutico', 'medicamento', 'efeito',
      'imre', 'avaliação', 'clínica', 'paciente', 'médico', 'terapia',
      'dor crônica', 'neuropatia', 'esclerose', 'parkinson', 'alzheimer'
    ]
    
    const foundTerms = medicalTerms.filter(term => 
      text.toLowerCase().includes(term.toLowerCase())
    )
    
    // Adicionar palavras únicas do texto
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 4)
      .filter(word => !medicalTerms.includes(word))
    
    const uniqueWords = [...new Set(words)].slice(0, 5)
    
    return [...foundTerms, ...uniqueWords]
  }

  async findSimilarDocuments(query: string, documents: any[]): Promise<any[]> {
    if (!this.embeddingPipeline) await this.initialize()
    
    try {
      // Gerar embeddings da query
      const queryEmbeddings = await this.generateEmbeddings(query)
      
      // Calcular similaridade com cada documento
      const similarities = documents.map(doc => {
        if (!doc.embeddings || doc.embeddings.length === 0) {
          return { ...doc, similarity: 0 }
        }
        
        const similarity = this.cosineSimilarity(queryEmbeddings, doc.embeddings)
        return { ...doc, similarity }
      })
      
      // Retornar documentos ordenados por similaridade
      return similarities
        .filter(doc => doc.similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3)
    } catch (error) {
      console.error('Erro ao buscar documentos similares:', error)
      return []
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}

export default LocalLLM
