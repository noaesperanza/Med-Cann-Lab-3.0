/**
 * NOA ESPERANÇA - SISTEMA DE CONHECIMENTO E MEMÓRIA
 * Sistema de memória persistente que permite ensinar a IA
 */

import { supabase } from './supabase'

export interface Memory {
  id?: string
  type: 'conversation' | 'article' | 'case' | 'lesson' | 'teaching'
  title: string
  content: string
  summary?: string
  keywords?: string[]
  context?: any
  user_id?: string
  created_at?: string
}

export interface ArticleMemory {
  id?: string
  title: string
  content: string
  source: string
  author?: string
  summary: string
  keywords: string[]
  teaching_points: string[] // Pontos-chave que a IA deve aprender
  user_id?: string
  created_at?: string
}

export interface ClinicalCase {
  id?: string
  patient_initials: string
  chief_complaint: string
  history: string
  findings: string
  diagnosis?: string
  treatment?: string
  discussion_points: string[] // Pontos para discussão com a IA
  learning_points: string[] // Lições aprendidas
  user_id?: string
  created_at?: string
}

export interface Lesson {
  id?: string
  course_title: string
  module_title: string
  lesson_title: string
  content: string
  objectives: string[]
  key_concepts: string[]
  practical_applications: string[]
  created_at?: string
}

export class NoaKnowledgeBase {
  /**
   * Salvar uma memória no banco de dados
   */
  async saveMemory(memory: Memory): Promise<string> {
    try {
      console.log('💾 Salvando memória:', memory.type, memory.title)
      
      const { data, error } = await supabase
        .from('noa_memories')
        .insert([{
          type: memory.type,
          title: memory.title,
          content: memory.content,
          summary: memory.summary,
          keywords: memory.keywords || [],
          context: memory.context,
          user_id: memory.user_id
        }])
        .select()
        .single()

      if (error) throw error

      console.log('✅ Memória salva:', data.id)
      return data.id
    } catch (error) {
      console.error('❌ Erro ao salvar memória:', error)
      throw error
    }
  }

  /**
   * Buscar memórias por tipo
   */
  async getMemoriesByType(type: Memory['type'], limit: number = 10): Promise<Memory[]> {
    try {
      const { data, error } = await supabase
        .from('noa_memories')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar memórias:', error)
      return []
    }
  }

  /**
   * Buscar memórias por palavra-chave
   */
  async searchMemories(query: string, limit: number = 10): Promise<Memory[]> {
    try {
      const { data, error } = await supabase
        .from('noa_memories')
        .select('*')
        .or(`title.ilike.%${query}%, content.ilike.%${query}%, summary.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar memórias:', error)
      return []
    }
  }

  /**
   * Salvar artigo que a IA aprendeu
   */
  async saveArticle(article: ArticleMemory): Promise<string> {
    try {
      console.log('📄 Salvando artigo:', article.title)
      
      const { data, error } = await supabase
        .from('noa_articles')
        .insert([{
          title: article.title,
          content: article.content,
          source: article.source,
          author: article.author,
          summary: article.summary,
          keywords: article.keywords || [],
          teaching_points: article.teaching_points || [],
          user_id: article.user_id
        }])
        .select()
        .single()

      if (error) throw error

      console.log('✅ Artigo salvo:', data.id)
      
      // Também salvar como memória
      await this.saveMemory({
        type: 'article',
        title: article.title,
        content: article.content,
        summary: article.summary,
        keywords: article.keywords,
        user_id: article.user_id
      })

      return data.id
    } catch (error) {
      console.error('❌ Erro ao salvar artigo:', error)
      throw error
    }
  }

  /**
   * Buscar artigos salvos
   */
  async getArticles(limit: number = 10): Promise<ArticleMemory[]> {
    try {
      const { data, error } = await supabase
        .from('noa_articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar artigos:', error)
      return []
    }
  }

  /**
   * Salvar caso clínico
   */
  async saveCase(caseData: ClinicalCase): Promise<string> {
    try {
      console.log('🏥 Salvando caso clínico')
      
      const { data, error } = await supabase
        .from('noa_clinical_cases')
        .insert([{
          patient_initials: caseData.patient_initials,
          chief_complaint: caseData.chief_complaint,
          history: caseData.history,
          findings: caseData.findings,
          diagnosis: caseData.diagnosis,
          treatment: caseData.treatment,
          discussion_points: caseData.discussion_points || [],
          learning_points: caseData.learning_points || [],
          user_id: caseData.user_id
        }])
        .select()
        .single()

      if (error) throw error

      console.log('✅ Caso clínico salvo:', data.id)
      
      // Também salvar como memória
      await this.saveMemory({
        type: 'case',
        title: `Caso: ${caseData.chief_complaint}`,
        content: `${caseData.history}\n\nAchados: ${caseData.findings}`,
        summary: caseData.chief_complaint,
        keywords: ['caso clínico', caseData.chief_complaint, caseData.diagnosis || 'diagnóstico pendente'],
        context: caseData,
        user_id: caseData.user_id
      })

      return data.id
    } catch (error) {
      console.error('❌ Erro ao salvar caso clínico:', error)
      throw error
    }
  }

  /**
   * Buscar casos clínicos
   */
  async getCases(limit: number = 10): Promise<ClinicalCase[]> {
    try {
      const { data, error } = await supabase
        .from('noa_clinical_cases')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar casos:', error)
      return []
    }
  }

  /**
   * Salvar aula do curso
   */
  async saveLesson(lesson: Lesson): Promise<string> {
    try {
      console.log('🎓 Salvando aula:', lesson.lesson_title)
      
      const { data, error } = await supabase
        .from('noa_lessons')
        .insert([{
          course_title: lesson.course_title,
          module_title: lesson.module_title,
          lesson_title: lesson.lesson_title,
          content: lesson.content,
          objectives: lesson.objectives || [],
          key_concepts: lesson.key_concepts || [],
          practical_applications: lesson.practical_applications || []
        }])
        .select()
        .single()

      if (error) throw error

      console.log('✅ Aula salva:', data.id)
      
      // Também salvar como memória
      await this.saveMemory({
        type: 'lesson',
        title: `${lesson.course_title} - ${lesson.lesson_title}`,
        content: lesson.content,
        summary: `Aula de ${lesson.module_title}`,
        keywords: [...(lesson.key_concepts || []), lesson.course_title, lesson.module_title],
        context: lesson
      })

      return data.id
    } catch (error) {
      console.error('❌ Erro ao salvar aula:', error)
      throw error
    }
  }

  /**
   * Buscar aulas
   */
  async getLessons(courseTitle?: string, limit: number = 10): Promise<Lesson[]> {
    try {
      let query = supabase
        .from('noa_lessons')
        .select('*')

      if (courseTitle) {
        query = query.eq('course_title', courseTitle)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar aulas:', error)
      return []
    }
  }

  /**
   * Buscar conhecimento relevante para uma pergunta
   */
  async searchRelevantKnowledge(query: string): Promise<{
    memories: Memory[]
    articles: ArticleMemory[]
    cases: ClinicalCase[]
    lessons: Lesson[]
  }> {
    try {
      console.log('🔍 Buscando conhecimento relevante:', query)

      // Buscar em todos os tipos de memória
      const [memories, articles, cases, lessons] = await Promise.all([
        this.searchMemories(query, 5),
        this.searchArticles(query),
        this.searchCases(query),
        this.searchLessons(query)
      ])

      return { memories, articles, cases, lessons }
    } catch (error) {
      console.error('❌ Erro ao buscar conhecimento:', error)
      return { memories: [], articles: [], cases: [], lessons: [] }
    }
  }

  /**
   * Buscar artigos por palavra-chave
   */
  private async searchArticles(query: string): Promise<ArticleMemory[]> {
    try {
      const { data, error } = await supabase
        .from('noa_articles')
        .select('*')
        .or(`title.ilike.%${query}%, content.ilike.%${query}%, summary.ilike.%${query}%, keywords.cs.{${query}}`)
        .limit(5)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar artigos:', error)
      return []
    }
  }

  /**
   * Buscar casos por palavra-chave
   */
  private async searchCases(query: string): Promise<ClinicalCase[]> {
    try {
      const { data, error } = await supabase
        .from('noa_clinical_cases')
        .select('*')
        .or(`chief_complaint.ilike.%${query}%, history.ilike.%${query}%, findings.ilike.%${query}%, diagnosis.ilike.%${query}%`)
        .limit(5)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar casos:', error)
      return []
    }
  }

  /**
   * Buscar aulas por palavra-chave
   */
  private async searchLessons(query: string): Promise<Lesson[]> {
    try {
      const { data, error } = await supabase
        .from('noa_lessons')
        .select('*')
        .or(`lesson_title.ilike.%${query}%, content.ilike.%${query}%`)
        .limit(5)

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar aulas:', error)
      return []
    }
  }
}

// Singleton
export const noaKnowledgeBase = new NoaKnowledgeBase()
