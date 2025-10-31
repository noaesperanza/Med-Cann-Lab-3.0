// Serviço para integração completa da Biblioteca com a Base de Conhecimento da IA Nôa Esperança
import { supabase } from '../lib/supabase'

export interface KnowledgeDocument {
  id: string
  title: string
  file_type: string
  file_size: number
  author: string
  category: string
  target_audience: string[]
  tags: string[]
  keywords: string[]
  isLinkedToAI: boolean
  summary: string
  aiRelevance: number
  file_url?: string
  downloads?: number
  created_at: string
  updated_at: string
}

export interface KnowledgeStats {
  totalDocuments: number
  aiLinkedDocuments: number
  averageRelevance: number
  topCategories: { category: string; count: number }[]
  topAuthors: { author: string; count: number }[]
  recentDocuments: KnowledgeDocument[]
}

export class KnowledgeBaseIntegration {
  /**
   * Buscar todos os documentos da base de conhecimento
   */
  static async getAllDocuments(): Promise<KnowledgeDocument[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('aiRelevance', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar documentos:', error)
      return []
    }
  }

  /**
   * Buscar documentos vinculados à IA Nôa Esperança
   */
  static async getAIDocuments(): Promise<KnowledgeDocument[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('isLinkedToAI', true)
        .order('aiRelevance', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar documentos da IA:', error)
      return []
    }
  }

  /**
   * Buscar documentos por categoria
   */
  static async getDocumentsByCategory(category: string): Promise<KnowledgeDocument[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('category', category)
        .order('aiRelevance', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar documentos por categoria:', error)
      return []
    }
  }

  /**
   * Buscar documentos por tipo de usuário
   */
  static async getDocumentsByAudience(audience: string): Promise<KnowledgeDocument[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .contains('target_audience', [audience])
        .order('aiRelevance', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar documentos por audiência:', error)
      return []
    }
  }

  /**
   * Busca semântica inteligente na base de conhecimento
   */
  static async semanticSearch(
    query: string, 
    options: {
      category?: string
      audience?: string
      aiLinkedOnly?: boolean
      limit?: number
    } = {}
  ): Promise<KnowledgeDocument[]> {
    try {
      const { category, audience, aiLinkedOnly = false, limit = 20 } = options
      
      let queryBuilder = supabase
        .from('documents')
        .select('*')

      // Filtro por categoria
      if (category && category !== 'all') {
        queryBuilder = queryBuilder.eq('category', category)
      }

      // Filtro por audiência
      if (audience && audience !== 'all') {
        queryBuilder = queryBuilder.contains('target_audience', [audience])
      }

      // Filtro por documentos vinculados à IA
      if (aiLinkedOnly) {
        queryBuilder = queryBuilder.eq('isLinkedToAI', true)
      }

      // Busca por texto
      const searchTerm = query.toLowerCase()
      queryBuilder = queryBuilder.or(
        `title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`
      )

      // Ordenar por relevância da IA
      queryBuilder = queryBuilder.order('aiRelevance', { ascending: false })
      
      // Limitar resultados
      if (limit) {
        queryBuilder = queryBuilder.limit(limit)
      }

      const { data, error } = await queryBuilder

      if (error) throw error

      // Filtrar por keywords e tags para melhor precisão
      const filtered = (data || []).filter(doc => {
        const matchesKeywords = doc.keywords?.some((k: string) =>
          k.toLowerCase().includes(searchTerm)
        )
        const matchesTags = doc.tags?.some((t: string) =>
          t.toLowerCase().includes(searchTerm)
        )
        const matchesTitle = doc.title?.toLowerCase().includes(searchTerm)
        const matchesSummary = doc.summary?.toLowerCase().includes(searchTerm)

        return matchesKeywords || matchesTags || matchesTitle || matchesSummary
      })

      return filtered
    } catch (error) {
      console.error('❌ Erro na busca semântica:', error)
      return []
    }
  }

  /**
   * Obter estatísticas da base de conhecimento
   */
  static async getKnowledgeStats(): Promise<KnowledgeStats> {
    try {
      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')

      if (error) throw error

      const docs = documents || []
      
      // Calcular estatísticas
      const totalDocuments = docs.length
      const aiLinkedDocuments = docs.filter(d => d.isLinkedToAI).length
      const averageRelevance = docs.reduce((sum, d) => sum + (d.aiRelevance || 0), 0) / totalDocuments

      // Top categorias
      const categoryCount = docs.reduce((acc, doc) => {
        acc[doc.category] = (acc[doc.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Top autores
      const authorCount = docs.reduce((acc, doc) => {
        acc[doc.author] = (acc[doc.author] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const topAuthors = Object.entries(authorCount)
        .map(([author, count]) => ({ author, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Documentos recentes
      const recentDocuments = docs
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)

      return {
        totalDocuments,
        aiLinkedDocuments,
        averageRelevance: Math.round(averageRelevance * 100) / 100,
        topCategories,
        topAuthors,
        recentDocuments
      }
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error)
      return {
        totalDocuments: 0,
        aiLinkedDocuments: 0,
        averageRelevance: 0,
        topCategories: [],
        topAuthors: [],
        recentDocuments: []
      }
    }
  }

  /**
   * Vincular documento à IA Nôa Esperança
   */
  static async linkDocumentToAI(
    documentId: string, 
    relevance: number = 0.8
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ 
          isLinkedToAI: true,
          aiRelevance: relevance,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('❌ Erro ao vincular documento à IA:', error)
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
          aiRelevance: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('❌ Erro ao desvincular documento da IA:', error)
      return false
    }
  }

  /**
   * Atualizar relevância de documento para a IA
   */
  static async updateAIRelevance(
    documentId: string, 
    relevance: number
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('documents')
        .update({ 
          aiRelevance: Math.max(0, Math.min(1, relevance)),
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('❌ Erro ao atualizar relevância:', error)
      return false
    }
  }

  /**
   * Registrar uso de documento pela IA
   */
  static async registerDocumentUsage(
    documentId: string,
    query: string,
    userId?: string
  ): Promise<boolean> {
    try {
      // Incrementar contador de downloads/uso
      const { error: updateError } = await supabase
        .from('documents')
        .update({ 
          downloads: supabase.raw('downloads + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)

      if (updateError) throw updateError

      // Registrar interação (se houver tabela de interações)
      if (userId) {
        const { error: interactionError } = await supabase
          .from('user_interactions')
          .insert({
            user_id: userId,
            text_raw: query,
            context: { document_id: documentId, type: 'knowledge_search' }
          })

        if (interactionError) {
          console.warn('⚠️ Erro ao registrar interação:', interactionError)
        }
      }

      return true
    } catch (error) {
      console.error('❌ Erro ao registrar uso do documento:', error)
      return false
    }
  }

  /**
   * Buscar documentos relacionados
   */
  static async getRelatedDocuments(
    documentId: string, 
    limit: number = 5
  ): Promise<KnowledgeDocument[]> {
    try {
      // Primeiro, buscar o documento original
      const { data: originalDoc, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single()

      if (docError || !originalDoc) throw docError

      // Buscar documentos com categorias, tags ou keywords similares
      const relatedKeywords = originalDoc.keywords?.slice(0, 3) || []
      const relatedTags = originalDoc.tags?.slice(0, 3) || []

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .neq('id', documentId)
        .or(
          `category.eq.${originalDoc.category},` +
          relatedKeywords.map(k => `keywords.cs.{${k}}`).join(',') +
          relatedTags.map(t => `tags.cs.{${t}}`).join(',')
        )
        .order('aiRelevance', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar documentos relacionados:', error)
      return []
    }
  }
}
