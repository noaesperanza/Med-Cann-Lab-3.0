// Serviço para integração da Base de Conhecimento com Nôa Esperança
import { supabase } from '../lib/supabase'

export interface DocumentMetadata {
  id: string
  title: string
  category: string
  area: string
  tags: string[]
  keywords: string[]
  isLinkedToAI: boolean
  aiRelevance: number
  summary: string
  content?: string
}

export class NoaKnowledgeBase {
  /**
   * Buscar documentos para treinamento da IA
   */
  static async getDocumentsForAI(): Promise<DocumentMetadata[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('isLinkedToAI', true)
        .order('aiRelevance', { ascending: false })
        .limit(100)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar documentos para IA:', error)
      return []
    }
  }

  /**
   * Atualizar relevância de um documento para a IA
   */
  static async updateAIGRelevance(
    documentId: string,
    relevance: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ aiRelevance: relevance })
        .eq('id', documentId)

      if (error) throw error

      return true
    } catch (error) {
      console.error('❌ Erro ao atualizar relevância:', error)
      return false
    }
  }

  /**
   * Vincular documento à IA
   */
  static async linkDocumentToAI(
    documentId: string,
    relevance: number = 5
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          isLinkedToAI: true,
          aiRelevance: relevance
        })
        .eq('id', documentId)

      if (error) throw error

      console.log('✅ Documento vinculado à IA:', documentId)
      return true
    } catch (error) {
      console.error('❌ Erro ao vincular documento:', error)
      return false
    }
  }

  /**
   * Desvincular documento da IA
   */
  static async unlinkDocumentFromAI(documentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('documents')
        .update({
          isLinkedToAI: false,
          aiRelevance: 0
        })
        .eq('id', documentId)

      if (error) throw error

      return true
    } catch (error) {
      console.error('❌ Erro ao desvincular documento:', error)
      return false
    }
  }

  /**
   * Buscar documentos relevantes para uma query
   */
  static async searchRelevantDocuments(
    query: string,
    limit: number = 5
  ): Promise<DocumentMetadata[]> {
    try {
      // Busca por título, keywords ou tags
      const searchTerm = query.toLowerCase()

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('isLinkedToAI', true)
        .or(`title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`)
        .order('aiRelevance', { ascending: false })
        .limit(limit)

      if (error) throw error

      // Filtrar por keywords e tags
      const filtered = (data || []).filter(
        (doc) =>
          doc.keywords?.some((k: string) =>
            k.toLowerCase().includes(searchTerm)
          ) ||
          doc.tags?.some((t: string) => t.toLowerCase().includes(searchTerm))
      )

      return filtered.length > 0 ? filtered : (data || [])
    } catch (error) {
      console.error('❌ Erro ao buscar documentos relevantes:', error)
      return []
    }
  }

  /**
   * Obter estatísticas da Base de Conhecimento para a IA
   */
  static async getAIStats(): Promise<{
    totalDocuments: number
    aiLinkedDocuments: number
    averageRelevance: number
    topCategories: { category: string; count: number }[]
  }> {
    try {
      // Total de documentos
      const { count: totalCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })

      // Documentos vinculados à IA
      const { data: aiDocs } = await supabase
        .from('documents')
        .select('*')
        .eq('isLinkedToAI', true)

      // Calcular média de relevância
      const avgRelevance =
        aiDocs && aiDocs.length > 0
          ? aiDocs.reduce((sum, doc) => sum + (doc.aiRelevance || 0), 0) /
            aiDocs.length
          : 0

      // Top categorias
      const categoryCount: { [key: string]: number } = {}
      aiDocs?.forEach((doc) => {
        const cat = doc.category || 'unknown'
        categoryCount[cat] = (categoryCount[cat] || 0) + 1
      })

      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      return {
        totalDocuments: totalCount || 0,
        aiLinkedDocuments: aiDocs?.length || 0,
        averageRelevance: avgRelevance,
        topCategories
      }
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error)
      return {
        totalDocuments: 0,
        aiLinkedDocuments: 0,
        averageRelevance: 0,
        topCategories: []
      }
    }
  }

  /**
   * Registrar uso de documento em resposta da IA
   */
  static async recordDocumentUsage(
    documentId: string,
    query: string
  ): Promise<boolean> {
    try {
      // Incrementar contador de uso (se existir campo use_count)
      // Ou criar registro em tabela de uso
      const { error } = await supabase.rpc('increment_document_usage', {
        doc_id: documentId
      })

      if (error) {
        // Fallback: atualizar metadata diretamente
        const { error: updateError } = await supabase
          .from('documents')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', documentId)

        if (updateError) throw updateError
      }

      console.log('✅ Uso de documento registrado:', documentId)
      return true
    } catch (error) {
      console.error('❌ Erro ao registrar uso:', error)
      return false
    }
  }
}
