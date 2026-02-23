// =====================================================
// MEDCANLAB 3.0 → 5.0 UNIFICATION: IMRE MIGRATION
// =====================================================
// Preservando a "alma" semântica durante a transição
// Migrando IndexedDB para Supabase mantendo toda funcionalidade

import { supabase } from './supabase'

export interface IMREAssessment {
  id: string
  userId: string
  patientId?: string
  assessmentType: 'triaxial'
  
  // Dados do Sistema IMRE Triaxial (37 blocos preservados)
  triaxialData: {
    emotionalAxis: {
      intensity: number
      valence: number
      arousal: number
      stability: number
    }
    cognitiveAxis: {
      attention: number
      memory: number
      executive: number
      processing: number
    }
    behavioralAxis: {
      activity: number
      social: number
      adaptive: number
      regulatory: number
    }
    semanticBlocks: Array<{
      blockNumber: number
      blockType: string
      content: any
      emotionalWeight: number
      cognitiveComplexity: number
      behavioralImpact: number
      timestamp: string
      confidenceScore: number
    }>
  }
  
  semanticContext: {
    emotionalPatterns: any
    cognitiveTrajectories: any
    behavioralEvolution: any
    semanticMemory: any
  }
  
  // Metadados
  assessmentDate: string
  sessionDuration: number
  completionStatus: 'in_progress' | 'completed' | 'abandoned'
  clinicalNotes?: string
  riskFactors?: any
  therapeuticGoals?: any
}

export interface IMREBlock {
  id: string
  assessmentId: string
  blockNumber: number
  blockType: string
  semanticContent: any
  emotionalWeight: number
  cognitiveComplexity: number
  behavioralImpact: number
  blockTimestamp: string
  responseTime: number
  confidenceScore: number
  validationStatus: 'pending' | 'validated' | 'flagged'
}

export interface NOAInteraction {
  id: string
  userId: string
  assessmentId: string
  interactionType: 'voice' | 'text' | 'multimodal'
  interactionContent: any
  noaResponse: any
  interactionTimestamp: string
  responseTime: number
  confidenceScore: number
  sessionId: string
  emotionalState: string
  cognitiveLoad: number
}

export class IMRESystemMigration {
  private static instance: IMRESystemMigration
  private migrationStatus: 'idle' | 'migrating' | 'completed' | 'error' = 'idle'
  private migrationProgress: number = 0

  static getInstance(): IMRESystemMigration {
    if (!IMRESystemMigration.instance) {
      IMRESystemMigration.instance = new IMRESystemMigration()
    }
    return IMRESystemMigration.instance
  }

  // =====================================================
  // MIGRAÇÃO DO INDEXEDDB PARA SUPABASE
  // =====================================================

  async migrateIndexedDBToSupabase(): Promise<{
    success: boolean
    migratedAssessments: number
    migratedBlocks: number
    migratedInteractions: number
    errors: string[]
  }> {
    this.migrationStatus = 'migrating'
    this.migrationProgress = 0

    const errors: string[] = []
    let migratedAssessments = 0
    let migratedBlocks = 0
    let migratedInteractions = 0

    try {
      // 1. Migrar Avaliações IMRE
      console.log('🔄 Migrando avaliações IMRE...')
      const assessments = await this.getIndexedDBAssessments()
      
      for (const assessment of assessments) {
        try {
          const { data, error } = await supabase
            .from('imre_assessments')
            .insert({
              user_id: assessment.userId,
              patient_id: assessment.patientId,
              assessment_type: assessment.assessmentType,
              triaxial_data: assessment.triaxialData,
              semantic_context: assessment.semanticContext,
              assessment_date: assessment.assessmentDate,
              session_duration: assessment.sessionDuration,
              completion_status: assessment.completionStatus,
              clinical_notes: assessment.clinicalNotes,
              risk_factors: assessment.riskFactors,
              therapeutic_goals: assessment.therapeuticGoals
            })
            .select()

          if (error) throw error
          migratedAssessments++
          
          // 2. Migrar Blocos Semânticos
          const blocks = await this.getIndexedDBBlocks(assessment.id)
          for (const block of blocks) {
            try {
              const { error: blockError } = await supabase
                .from('imre_semantic_blocks')
                .insert({
                  assessment_id: data[0].id,
                  block_number: block.blockNumber,
                  block_type: block.blockType,
                  semantic_content: block.semanticContent,
                  emotional_weight: block.emotionalWeight,
                  cognitive_complexity: block.cognitiveComplexity,
                  behavioral_impact: block.behavioralImpact,
                  block_timestamp: block.blockTimestamp,
                  response_time: block.responseTime,
                  confidence_score: block.confidenceScore,
                  validation_status: block.validationStatus
                })

              if (blockError) throw blockError
              migratedBlocks++
            } catch (blockError) {
              errors.push(`Block migration error: ${blockError}`)
            }
          }

          // 3. Migrar Interações NOA
          const interactions = await this.getIndexedDBInteractions(assessment.id)
          for (const interaction of interactions) {
            try {
              const { error: interactionError } = await supabase
                .from('noa_interaction_logs')
                .insert({
                  user_id: interaction.userId,
                  assessment_id: data[0].id,
                  interaction_type: interaction.interactionType,
                  interaction_content: interaction.interactionContent,
                  noa_response: interaction.noaResponse,
                  interaction_timestamp: interaction.interactionTimestamp,
                  response_time: interaction.responseTime,
                  confidence_score: interaction.confidenceScore,
                  session_id: interaction.sessionId,
                  emotional_state: interaction.emotionalState,
                  cognitive_load: interaction.cognitiveLoad
                })

              if (interactionError) throw interactionError
              migratedInteractions++
            } catch (interactionError) {
              errors.push(`Interaction migration error: ${interactionError}`)
            }
          }

          this.migrationProgress = (migratedAssessments / assessments.length) * 100
        } catch (assessmentError) {
          errors.push(`Assessment migration error: ${assessmentError}`)
        }
      }

      // 4. Migrar Contexto Semântico Persistente
      await this.migrateSemanticContext()

      this.migrationStatus = 'completed'
      console.log('✅ Migração IMRE concluída!')

      return {
        success: true,
        migratedAssessments,
        migratedBlocks,
        migratedInteractions,
        errors
      }

    } catch (error) {
      this.migrationStatus = 'error'
      console.error('❌ Erro na migração IMRE:', error)
      return {
        success: false,
        migratedAssessments,
        migratedBlocks,
        migratedInteractions,
        errors: [...errors, `Migration failed: ${error}`]
      }
    }
  }

  // =====================================================
  // FUNÇÕES DE ACESSO AO INDEXEDDB
  // =====================================================

  private async getIndexedDBAssessments(): Promise<IMREAssessment[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MedCannLabDB', 1)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['imreAssessments'], 'readonly')
        const store = transaction.objectStore('imreAssessments')
        const getAllRequest = store.getAll()
        
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result)
        }
        
        getAllRequest.onerror = () => {
          reject(getAllRequest.error)
        }
      }
      
      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  private async getIndexedDBBlocks(assessmentId: string): Promise<IMREBlock[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MedCannLabDB', 1)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['imreBlocks'], 'readonly')
        const store = transaction.objectStore('imreBlocks')
        const index = store.index('assessmentId')
        const getAllRequest = index.getAll(assessmentId)
        
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result)
        }
        
        getAllRequest.onerror = () => {
          reject(getAllRequest.error)
        }
      }
      
      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  private async getIndexedDBInteractions(assessmentId: string): Promise<NOAInteraction[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MedCannLabDB', 1)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['noaInteractions'], 'readonly')
        const store = transaction.objectStore('noaInteractions')
        const index = store.index('assessmentId')
        const getAllRequest = index.getAll(assessmentId)
        
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result)
        }
        
        getAllRequest.onerror = () => {
          reject(getAllRequest.error)
        }
      }
      
      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  private async migrateSemanticContext(): Promise<void> {
    try {
      const semanticContext = await this.getIndexedDBSemanticContext()
      
      for (const context of semanticContext) {
        const { error } = await supabase
          .from('imre_semantic_context')
          .insert({
            user_id: context.userId,
            semantic_memory: context.semanticMemory,
            emotional_patterns: context.emotionalPatterns,
            cognitive_trajectories: context.cognitiveTrajectories,
            behavioral_evolution: context.behavioralEvolution,
            context_version: context.contextVersion || 1,
            context_stability: context.contextStability || 0
          })

        if (error) throw error
      }
    } catch (error) {
      console.error('Erro na migração do contexto semântico:', error)
    }
  }

  private async getIndexedDBSemanticContext(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MedCannLabDB', 1)
      
      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['semanticContext'], 'readonly')
        const store = transaction.objectStore('semanticContext')
        const getAllRequest = store.getAll()
        
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result)
        }
        
        getAllRequest.onerror = () => {
          reject(getAllRequest.error)
        }
      }
      
      request.onerror = () => {
        reject(request.error)
      }
    })
  }

  // =====================================================
  // FUNÇÕES DE INTEGRAÇÃO COM NOA
  // =====================================================

  async saveNOAInteraction(interaction: Omit<NOAInteraction, 'id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('noa_interaction_logs')
        .insert({
          user_id: interaction.userId,
          assessment_id: interaction.assessmentId,
          interaction_type: interaction.interactionType,
          interaction_content: interaction.interactionContent,
          noa_response: interaction.noaResponse,
          interaction_timestamp: interaction.interactionTimestamp,
          response_time: interaction.responseTime,
          confidence_score: interaction.confidenceScore,
          session_id: interaction.sessionId,
          emotional_state: interaction.emotionalState,
          cognitive_load: interaction.cognitiveLoad
        })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erro ao salvar interação NOA:', error)
      return false
    }
  }

  async getLatestSemanticContext(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('imre_semantic_context')
        .select('semantic_memory, emotional_patterns, cognitive_trajectories, behavioral_evolution')
        .eq('user_id', userId)
        .order('last_updated', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao obter contexto semântico:', error)
      return null
    }
  }

  // =====================================================
  // FUNÇÕES DE STATUS E PROGRESSO
  // =====================================================

  getMigrationStatus(): string {
    return this.migrationStatus
  }

  getMigrationProgress(): number {
    return this.migrationProgress
  }

  // =====================================================
  // FUNÇÕES DE VALIDAÇÃO
  // =====================================================

  async validateMigration(): Promise<{
    assessmentsValid: boolean
    blocksValid: boolean
    interactionsValid: boolean
    contextValid: boolean
    totalRecords: number
  }> {
    try {
      // Validar avaliações
      const { count: assessmentCount } = await supabase
        .from('imre_assessments')
        .select('*', { count: 'exact', head: true })

      // Validar blocos
      const { count: blockCount } = await supabase
        .from('imre_semantic_blocks')
        .select('*', { count: 'exact', head: true })

      // Validar interações
      const { count: interactionCount } = await supabase
        .from('noa_interaction_logs')
        .select('*', { count: 'exact', head: true })

      // Validar contexto
      const { count: contextCount } = await supabase
        .from('imre_semantic_context')
        .select('*', { count: 'exact', head: true })

      return {
        assessmentsValid: (assessmentCount || 0) > 0,
        blocksValid: (blockCount || 0) > 0,
        interactionsValid: (interactionCount || 0) > 0,
        contextValid: (contextCount || 0) > 0,
        totalRecords: (assessmentCount || 0) + (blockCount || 0) + (interactionCount || 0) + (contextCount || 0)
      }
    } catch (error) {
      console.error('Erro na validação da migração:', error)
      return {
        assessmentsValid: false,
        blocksValid: false,
        interactionsValid: false,
        contextValid: false,
        totalRecords: 0
      }
    }
  }
}

// =====================================================
// EXPORT DA INSTÂNCIA SINGLETON
// =====================================================
export const imreMigration = IMRESystemMigration.getInstance()
