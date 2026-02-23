// Sistema de documentos críticos para atualização da IA
import { supabase } from '../lib/supabase'

const db = supabase as any

export interface CriticalDocument {
  id: string
  title: string
  content: string
  category: 'protocol' | 'guideline' | 'research' | 'case-study' | 'methodology'
  priority: 'high' | 'medium' | 'low'
  lastUpdated: string
  aiRelevance: number
  tags: string[]
  keywords: string[]
  isActive: boolean
}

export class CriticalDocumentsManager {
  static async addCriticalDocument(document: Omit<CriticalDocument, 'id' | 'lastUpdated'>): Promise<string> {
    try {
      const { data, error } = await db
        .from('critical_documents')
        .insert({ ...document, lastUpdated: new Date().toISOString() })
        .select()
        .single()

      if (error) throw error
      await this.notifyAIAboutNewDocument(data.id)
      return data.id
    } catch (error) {
      console.error('❌ Erro ao adicionar documento crítico:', error)
      throw error
    }
  }

  static async updateCriticalDocument(id: string, updates: Partial<CriticalDocument>): Promise<boolean> {
    try {
      const { error } = await db
        .from('critical_documents')
        .update({ ...updates, lastUpdated: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      await this.notifyAIAboutUpdate(id)
      return true
    } catch (error) {
      console.error('❌ Erro ao atualizar documento crítico:', error)
      return false
    }
  }

  static async getCriticalDocumentsByCategory(category: string): Promise<CriticalDocument[]> {
    try {
      const { data, error } = await db
        .from('critical_documents')
        .select('*')
        .eq('category', category)
        .eq('isActive', true)
        .order('priority', { ascending: false })
        .order('aiRelevance', { ascending: false })

      if (error) throw error
      return (data || []) as CriticalDocument[]
    } catch (error) {
      console.error('❌ Erro ao buscar documentos críticos:', error)
      return []
    }
  }

  static async getAllCriticalDocuments(): Promise<CriticalDocument[]> {
    try {
      const { data, error } = await db
        .from('critical_documents')
        .select('*')
        .eq('isActive', true)
        .order('priority', { ascending: false })
        .order('aiRelevance', { ascending: false })

      if (error) throw error
      return (data || []) as CriticalDocument[]
    } catch (error) {
      console.error('❌ Erro ao buscar documentos críticos:', error)
      return []
    }
  }

  static async searchCriticalDocuments(query: string): Promise<CriticalDocument[]> {
    try {
      const searchTerm = query.toLowerCase()

      const { data, error } = await db
        .from('critical_documents')
        .select('*')
        .eq('isActive', true)
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .order('aiRelevance', { ascending: false })

      if (error) throw error

      const docs = (data || []) as CriticalDocument[]
      const filtered = docs.filter(doc =>
        doc.keywords?.some((k: string) => k.toLowerCase().includes(searchTerm)) ||
        doc.tags?.some((t: string) => t.toLowerCase().includes(searchTerm))
      )

      return filtered.length > 0 ? filtered : docs
    } catch (error) {
      console.error('❌ Erro na busca de documentos críticos:', error)
      return []
    }
  }

  private static async notifyAIAboutNewDocument(documentId: string): Promise<void> {
    try {
      const { error } = await db
        .from('ai_notifications')
        .insert({
          type: 'new_critical_document',
          document_id: documentId,
          message: 'Novo documento crítico adicionado à base de conhecimento',
          created_at: new Date().toISOString()
        })

      if (error) throw error
      console.log('✅ IA notificada sobre novo documento crítico:', documentId)
    } catch (error) {
      console.error('❌ Erro ao notificar IA:', error)
    }
  }

  private static async notifyAIAboutUpdate(documentId: string): Promise<void> {
    try {
      const { error } = await db
        .from('ai_notifications')
        .insert({
          type: 'critical_document_updated',
          document_id: documentId,
          message: 'Documento crítico foi atualizado',
          created_at: new Date().toISOString()
        })

      if (error) throw error
      console.log('✅ IA notificada sobre atualização de documento:', documentId)
    } catch (error) {
      console.error('❌ Erro ao notificar IA:', error)
    }
  }

  static async getCriticalDocumentsStats(): Promise<{
    total: number
    byCategory: Record<string, number>
    byPriority: Record<string, number>
    averageRelevance: number
  }> {
    try {
      const documents = await this.getAllCriticalDocuments()

      const byCategory = documents.reduce((acc, doc) => {
        acc[doc.category] = (acc[doc.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const byPriority = documents.reduce((acc, doc) => {
        acc[doc.priority] = (acc[doc.priority] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const averageRelevance = documents.length > 0
        ? documents.reduce((sum, doc) => sum + doc.aiRelevance, 0) / documents.length
        : 0

      return {
        total: documents.length,
        byCategory,
        byPriority,
        averageRelevance: Math.round(averageRelevance * 100) / 100
      }
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas:', error)
      return { total: 0, byCategory: {}, byPriority: {}, averageRelevance: 0 }
    }
  }

  static async createDevelopmentDocument(
    title: string,
    content: string,
    category: CriticalDocument['category'] = 'protocol',
    priority: CriticalDocument['priority'] = 'high'
  ): Promise<string> {
    return this.addCriticalDocument({
      title,
      content,
      category,
      priority,
      aiRelevance: 1.0,
      tags: ['desenvolvimento', 'crítico', 'IA'],
      keywords: ['desenvolvimento', 'atualização', 'IA'],
      isActive: true
    })
  }
}
