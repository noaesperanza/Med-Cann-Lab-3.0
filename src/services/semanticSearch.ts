/**
 * BUSCA SEMÂNTICA INTELIGENTE
 * Serviço para buscar documentos usando similaridade semântica
 */

import { supabase } from '../lib/supabase'

export interface SearchResult {
  id: string
  title: string
  summary: string
  relevance: number
  category: string
  area: string
  keywords: string[]
  tags: string[]
  target_audience: string[]
}

export class SemanticSearch {
  /**
   * Buscar documentos usando busca semântica
   */
  static async search(
    query: string,
    limit: number = 10,
    filters?: {
      category?: string
      area?: string
      target_audience?: string
      isLinkedToAI?: boolean
    }
  ): Promise<SearchResult[]> {
    try {
      // Normalizar query
      const normalizedQuery = this.normalizeText(query)
      const queryTerms = normalizedQuery.split(' ').filter(term => term.length > 2)

      // Buscar documentos
      let query_builder = supabase
        .from('documents')
        .select('*')

      // Aplicar filtros
      if (filters?.isLinkedToAI !== undefined) {
        query_builder = query_builder.eq('isLinkedToAI', filters.isLinkedToAI)
      }

      const { data: documents, error } = await query_builder

      if (error) throw error
      if (!documents) return []

      // Calcular relevância semântica
      const results = documents.map(doc => ({
        ...doc,
        relevance: this.calculateRelevance(doc, normalizedQuery, queryTerms)
      }))

      // Filtrar e ordenar por relevância
      const sorted = results
        .filter(doc => doc.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit)

      return sorted as SearchResult[]
    } catch (error) {
      console.error('❌ Erro na busca semântica:', error)
      return []
    }
  }

  /**
   * Calcular relevância semântica de um documento
   */
  private static calculateRelevance(
    doc: any,
    query: string,
    queryTerms: string[]
  ): number {
    let score = 0

    // 1. Busca no título (peso alto)
    const titleScore = this.textSimilarity(doc.title?.toLowerCase() || '', query.toLowerCase())
    score += titleScore * 0.4

    // 2. Busca no resumo (peso médio)
    const summaryScore = this.textSimilarity(doc.summary?.toLowerCase() || '', query.toLowerCase())
    score += summaryScore * 0.3

    // 3. Busca em keywords (peso alto)
    const keywords = (doc.keywords || []).map((k: string) => k.toLowerCase())
    const keywordMatches = queryTerms.filter(term => 
      keywords.some((kw: string) => kw.includes(term) || term.includes(kw))
    ).length
    score += (keywordMatches / queryTerms.length) * 0.2

    // 4. Busca em tags (peso médio)
    const tags = (doc.tags || []).map((t: string) => t.toLowerCase())
    const tagMatches = queryTerms.filter(term => 
      tags.some((t: string) => t.includes(term))
    ).length
    score += (tagMatches / queryTerms.length) * 0.1

    // 5. Bonus para documentos vinculados à IA
    if (doc.isLinkedToAI) {
      score *= 1.1
    }

    // 6. Bonus baseado na relevância da IA
    if (doc.aiRelevance) {
      score += (doc.aiRelevance / 10) * 0.1
    }

    return Math.min(score, 1) * 100 // Normalizar para 0-100
  }

  /**
   * Calcular similaridade de texto (simples)
   */
  private static textSimilarity(text1: string, text2: string): number {
    const words1 = text1.split(/\s+/)
    const words2 = text2.split(/\s+/)
    
    const intersection = words1.filter(word => words2.includes(word)).length
    const union = new Set([...words1, ...words2]).size

    return intersection / union
  }

  /**
   * Normalizar texto
   */
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, ' ') // Remove caracteres especiais
      .replace(/\s+/g, ' ') // Normaliza espaços
      .trim()
  }

  /**
   * Buscar documentos relacionados (para um documento específico)
   */
  static async findRelated(
    documentId: string,
    limit: number = 5
  ): Promise<SearchResult[]> {
    try {
      // Buscar o documento original
      const { data: originalDoc, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single()

      if (fetchError || !originalDoc) return []

      // Criar query de busca baseada no documento
      const query = `${originalDoc.title} ${originalDoc.summary || ''}`

      // Buscar documentos similares
      const { data: allDocs, error } = await supabase
        .from('documents')
        .select('*')
        .neq('id', documentId)

      if (error || !allDocs) return []

      // Calcular similaridade
      const results = allDocs.map(doc => ({
        ...doc,
        relevance: this.calculateDocumentSimilarity(originalDoc, doc)
      }))

      // Ordenar e retornar
      return results
        .filter(doc => doc.relevance > 0.2)
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, limit) as SearchResult[]
    } catch (error) {
      console.error('❌ Erro ao buscar documentos relacionados:', error)
      return []
    }
  }

  /**
   * Calcular similaridade entre dois documentos
   */
  private static calculateDocumentSimilarity(doc1: any, doc2: any): number {
    let score = 0

    // Similaridade por categoria
    if (doc1.category === doc2.category) score += 0.2

    // Similaridade por keywords
    const keywords1 = (doc1.keywords || []).map((k: string) => k.toLowerCase())
    const keywords2 = (doc2.keywords || []).map((k: string) => k.toLowerCase())
    const commonKeywords = keywords1.filter(k => keywords2.includes(k)).length
    score += (commonKeywords / Math.max(keywords1.length, keywords2.length, 1)) * 0.3

    // Similaridade por tags
    const tags1 = (doc1.tags || []).map((t: string) => t.toLowerCase())
    const tags2 = (doc2.tags || []).map((t: string) => t.toLowerCase())
    const commonTags = tags1.filter(t => tags2.includes(t)).length
    score += (commonTags / Math.max(tags1.length, tags2.length, 1)) * 0.2

    // Similaridade textual
    const text1 = `${doc1.title} ${doc1.summary || ''}`.toLowerCase()
    const text2 = `${doc2.title} ${doc2.summary || ''}`.toLowerCase()
    score += this.textSimilarity(text1, text2) * 0.3

    return Math.min(score, 1)
  }

  /**
   * Obter sugestões de busca (autocomplete)
   */
  static async getSuggestions(
    partialQuery: string,
    limit: number = 5
  ): Promise<string[]> {
    try {
      const normalizedQuery = partialQuery.toLowerCase()

      // Buscar em keywords e tags
      const { data: documents, error } = await supabase
        .from('documents')
        .select('keywords, tags')
        .limit(100)

      if (error || !documents) return []

      const suggestions = new Set<string>()

      documents.forEach(doc => {
        // Adicionar keywords que contêm a query
        ;(doc.keywords || []).forEach((kw: string) => {
          if (kw.toLowerCase().includes(normalizedQuery) && kw.length > 2) {
            suggestions.add(kw)
          }
        })

        // Adicionar tags que contêm a query
        ;(doc.tags || []).forEach((tag: string) => {
          if (tag.toLowerCase().includes(normalizedQuery) && tag.length > 2) {
            suggestions.add(tag)
          }
        })
      })

      return Array.from(suggestions).slice(0, limit)
    } catch (error) {
      console.error('❌ Erro ao obter sugestões:', error)
      return []
    }
  }
}
