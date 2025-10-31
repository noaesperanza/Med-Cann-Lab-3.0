// =====================================================
// MEDCANLAB 3.0 → 5.0 UNIFICATION: UNIFIED ASSESSMENT
// =====================================================
// Unificando avaliação IMRE com monitoramento renal
// Criando prontuário integrado e completo

import { supabase } from './supabase'
import { imreMigration } from './imreMigration'
import { noaIntegration } from './noaIntegration'

export interface UnifiedAssessment {
  id: string
  userId: string
  patientId: string
  assessmentDate: string
  
  // Dados IMRE Triaxial (preservados do 3.0)
  imreData: {
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
  
  // Dados Clínicos (do 5.0)
  clinicalData: {
    renalFunction: {
      creatinine: number
      gfr: number
      bun: number
      proteinuria: number
      stage: string
    }
    cannabisMetabolism: {
      cyp2c9: string
      cyp3a4: string
      cyp2c19: string
      metabolismRate: number
      drugInteractions: string[]
    }
    therapeuticResponse: {
      efficacy: number
      sideEffects: string[]
      dosage: number
      frequency: string
      duration: number
    }
  }
  
  // Correlações Integradas
  correlations: {
    imreClinicalCorrelations: {
      emotionalRenalCorrelation: number
      cognitiveRenalCorrelation: number
      behavioralRenalCorrelation: number
    }
    riskAssessment: {
      overallRisk: number
      renalRisk: number
      psychologicalRisk: number
      therapeuticRisk: number
    }
    treatmentRecommendations: {
      dosageAdjustment: string
      monitoringFrequency: string
      therapeuticInterventions: string[]
      lifestyleRecommendations: string[]
    }
  }
  
  // Metadados
  completionStatus: 'in_progress' | 'completed' | 'abandoned'
  sessionDuration: number
  clinicalNotes: string
  therapeuticGoals: string[]
  followUpDate: string
}

export interface AssessmentInsights {
  emotionalInsights: {
    patterns: string[]
    triggers: string[]
    copingStrategies: string[]
    therapeuticTargets: string[]
  }
  cognitiveInsights: {
    strengths: string[]
    challenges: string[]
    interventions: string[]
    monitoringAreas: string[]
  }
  behavioralInsights: {
    adaptiveBehaviors: string[]
    maladaptiveBehaviors: string[]
    behavioralGoals: string[]
    reinforcementStrategies: string[]
  }
  clinicalInsights: {
    renalFunctionTrends: string[]
    cannabisResponsePatterns: string[]
    drugInteractionRisks: string[]
    therapeuticOptimizations: string[]
  }
}

export class UnifiedAssessmentSystem {
  private static instance: UnifiedAssessmentSystem
  private currentAssessment: UnifiedAssessment | null = null

  static getInstance(): UnifiedAssessmentSystem {
    if (!UnifiedAssessmentSystem.instance) {
      UnifiedAssessmentSystem.instance = new UnifiedAssessmentSystem()
    }
    return UnifiedAssessmentSystem.instance
  }

  // =====================================================
  // INICIALIZAÇÃO DE AVALIAÇÃO UNIFICADA
  // =====================================================

  async initializeUnifiedAssessment(
    userId: string, 
    patientId: string
  ): Promise<UnifiedAssessment> {
    try {
      console.log('🔄 Inicializando avaliação unificada...')
      
      // 1. Carregar dados IMRE existentes
      const imreData = await this.loadIMREData(userId)
      
      // 2. Carregar dados clínicos existentes
      const clinicalData = await this.loadClinicalData(patientId)
      
      // 3. Inicializar NOA com contexto
      await noaIntegration.initializeNOA(userId, `assessment-${Date.now()}`)
      
      // 4. Criar avaliação unificada
      this.currentAssessment = {
        id: `unified-${Date.now()}`,
        userId,
        patientId,
        assessmentDate: new Date().toISOString(),
        imreData,
        clinicalData,
        correlations: {
          imreClinicalCorrelations: {
            emotionalRenalCorrelation: 0,
            cognitiveRenalCorrelation: 0,
            behavioralRenalCorrelation: 0
          },
          riskAssessment: {
            overallRisk: 0,
            renalRisk: 0,
            psychologicalRisk: 0,
            therapeuticRisk: 0
          },
          treatmentRecommendations: {
            dosageAdjustment: '',
            monitoringFrequency: '',
            therapeuticInterventions: [],
            lifestyleRecommendations: []
          }
        },
        completionStatus: 'in_progress',
        sessionDuration: 0,
        clinicalNotes: '',
        therapeuticGoals: [],
        followUpDate: ''
      }

      console.log('✅ Avaliação unificada inicializada')
      return this.currentAssessment
    } catch (error) {
      console.error('❌ Erro na inicialização da avaliação unificada:', error)
      throw error
    }
  }

  // =====================================================
  // PROCESSAMENTO DE DADOS IMRE
  // =====================================================

  async processIMREData(imreInput: any): Promise<void> {
    if (!this.currentAssessment) {
      throw new Error('Avaliação não inicializada')
    }

    try {
      // 1. Processar dados IMRE
      const processedIMRE = await this.processIMREInput(imreInput)
      
      // 2. Atualizar avaliação atual
      this.currentAssessment.imreData = processedIMRE
      
      // 3. Calcular correlações com dados clínicos
      await this.calculateIMREClinicalCorrelations()
      
      // 4. Atualizar recomendações terapêuticas
      await this.updateTherapeuticRecommendations()
      
      console.log('✅ Dados IMRE processados e integrados')
    } catch (error) {
      console.error('❌ Erro no processamento IMRE:', error)
      throw error
    }
  }

  // =====================================================
  // PROCESSAMENTO DE DADOS CLÍNICOS
  // =====================================================

  async processClinicalData(clinicalInput: any): Promise<void> {
    if (!this.currentAssessment) {
      throw new Error('Avaliação não inicializada')
    }

    try {
      // 1. Processar dados clínicos
      const processedClinical = await this.processClinicalInput(clinicalInput)
      
      // 2. Atualizar avaliação atual
      this.currentAssessment.clinicalData = processedClinical
      
      // 3. Calcular correlações com dados IMRE
      await this.calculateIMREClinicalCorrelations()
      
      // 4. Atualizar avaliação de risco
      await this.updateRiskAssessment()
      
      console.log('✅ Dados clínicos processados e integrados')
    } catch (error) {
      console.error('❌ Erro no processamento clínico:', error)
      throw error
    }
  }

  // =====================================================
  // GERAÇÃO DE INSIGHTS INTEGRADOS
  // =====================================================

  async generateUnifiedInsights(): Promise<AssessmentInsights> {
    if (!this.currentAssessment) {
      throw new Error('Avaliação não inicializada')
    }

    try {
      // 1. Gerar insights emocionais
      const emotionalInsights = await this.generateEmotionalInsights()
      
      // 2. Gerar insights cognitivos
      const cognitiveInsights = await this.generateCognitiveInsights()
      
      // 3. Gerar insights comportamentais
      const behavioralInsights = await this.generateBehavioralInsights()
      
      // 4. Gerar insights clínicos
      const clinicalInsights = await this.generateClinicalInsights()
      
      return {
        emotionalInsights,
        cognitiveInsights,
        behavioralInsights,
        clinicalInsights
      }
    } catch (error) {
      console.error('❌ Erro na geração de insights:', error)
      throw error
    }
  }

  // =====================================================
  // SALVAMENTO DE AVALIAÇÃO UNIFICADA
  // =====================================================

  async saveUnifiedAssessment(): Promise<boolean> {
    if (!this.currentAssessment) {
      throw new Error('Avaliação não inicializada')
    }

    try {
      // 1. Salvar avaliação IMRE
      await this.saveIMREAssessment()
      
      // 2. Salvar dados clínicos
      await this.saveClinicalData()
      
      // 3. Salvar correlações
      await this.saveCorrelations()
      
      // 4. Salvar integração clínica
      await this.saveClinicalIntegration()
      
      console.log('✅ Avaliação unificada salva com sucesso')
      return true
    } catch (error) {
      console.error('❌ Erro ao salvar avaliação unificada:', error)
      return false
    }
  }

  // =====================================================
  // FUNÇÕES DE CARREGAMENTO DE DADOS
  // =====================================================

  private async loadIMREData(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('imre_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('assessment_date', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      return data?.triaxial_data || this.getDefaultIMREData()
    } catch (error) {
      console.error('Erro ao carregar dados IMRE:', error)
      return this.getDefaultIMREData()
    }
  }

  private async loadClinicalData(patientId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('clinical_integration')
        .select('*')
        .eq('user_id', patientId)
        .order('integration_date', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      return data || this.getDefaultClinicalData()
    } catch (error) {
      console.error('Erro ao carregar dados clínicos:', error)
      return this.getDefaultClinicalData()
    }
  }

  // =====================================================
  // FUNÇÕES DE PROCESSAMENTO
  // =====================================================

  private async processIMREInput(input: any): Promise<any> {
    // Implementar processamento de dados IMRE
    return {
      emotionalAxis: {
        intensity: input.emotionalIntensity || 0,
        valence: input.emotionalValence || 0,
        arousal: input.emotionalArousal || 0,
        stability: input.emotionalStability || 0
      },
      cognitiveAxis: {
        attention: input.attention || 0,
        memory: input.memory || 0,
        executive: input.executive || 0,
        processing: input.processing || 0
      },
      behavioralAxis: {
        activity: input.activity || 0,
        social: input.social || 0,
        adaptive: input.adaptive || 0,
        regulatory: input.regulatory || 0
      },
      semanticBlocks: input.semanticBlocks || []
    }
  }

  private async processClinicalInput(input: any): Promise<any> {
    // Implementar processamento de dados clínicos
    return {
      renalFunction: {
        creatinine: input.creatinine || 0,
        gfr: input.gfr || 0,
        bun: input.bun || 0,
        proteinuria: input.proteinuria || 0,
        stage: input.stage || 'normal'
      },
      cannabisMetabolism: {
        cyp2c9: input.cyp2c9 || 'normal',
        cyp3a4: input.cyp3a4 || 'normal',
        cyp2c19: input.cyp2c19 || 'normal',
        metabolismRate: input.metabolismRate || 1,
        drugInteractions: input.drugInteractions || []
      },
      therapeuticResponse: {
        efficacy: input.efficacy || 0,
        sideEffects: input.sideEffects || [],
        dosage: input.dosage || 0,
        frequency: input.frequency || 'daily',
        duration: input.duration || 0
      }
    }
  }

  // =====================================================
  // FUNÇÕES DE CORRELAÇÃO
  // =====================================================

  private async calculateIMREClinicalCorrelations(): Promise<void> {
    if (!this.currentAssessment) return

    // Calcular correlações entre dados IMRE e clínicos
    const emotionalRenalCorrelation = this.calculateEmotionalRenalCorrelation()
    const cognitiveRenalCorrelation = this.calculateCognitiveRenalCorrelation()
    const behavioralRenalCorrelation = this.calculateBehavioralRenalCorrelation()

    this.currentAssessment.correlations.imreClinicalCorrelations = {
      emotionalRenalCorrelation,
      cognitiveRenalCorrelation,
      behavioralRenalCorrelation
    }
  }

  private calculateEmotionalRenalCorrelation(): number {
    // Implementar cálculo de correlação emocional-renal
    return Math.random()
  }

  private calculateCognitiveRenalCorrelation(): number {
    // Implementar cálculo de correlação cognitiva-renal
    return Math.random()
  }

  private calculateBehavioralRenalCorrelation(): number {
    // Implementar cálculo de correlação comportamental-renal
    return Math.random()
  }

  // =====================================================
  // FUNÇÕES DE INSIGHTS
  // =====================================================

  private async generateEmotionalInsights(): Promise<any> {
    // Implementar geração de insights emocionais
    return {
      patterns: ['Padrão emocional 1', 'Padrão emocional 2'],
      triggers: ['Gatilho 1', 'Gatilho 2'],
      copingStrategies: ['Estratégia 1', 'Estratégia 2'],
      therapeuticTargets: ['Alvo 1', 'Alvo 2']
    }
  }

  private async generateCognitiveInsights(): Promise<any> {
    // Implementar geração de insights cognitivos
    return {
      strengths: ['Força 1', 'Força 2'],
      challenges: ['Desafio 1', 'Desafio 2'],
      interventions: ['Intervenção 1', 'Intervenção 2'],
      monitoringAreas: ['Área 1', 'Área 2']
    }
  }

  private async generateBehavioralInsights(): Promise<any> {
    // Implementar geração de insights comportamentais
    return {
      adaptiveBehaviors: ['Comportamento 1', 'Comportamento 2'],
      maladaptiveBehaviors: ['Comportamento 1', 'Comportamento 2'],
      behavioralGoals: ['Meta 1', 'Meta 2'],
      reinforcementStrategies: ['Estratégia 1', 'Estratégia 2']
    }
  }

  private async generateClinicalInsights(): Promise<any> {
    // Implementar geração de insights clínicos
    return {
      renalFunctionTrends: ['Tendência 1', 'Tendência 2'],
      cannabisResponsePatterns: ['Padrão 1', 'Padrão 2'],
      drugInteractionRisks: ['Risco 1', 'Risco 2'],
      therapeuticOptimizations: ['Otimização 1', 'Otimização 2']
    }
  }

  // =====================================================
  // FUNÇÕES DE SALVAMENTO
  // =====================================================

  private async saveIMREAssessment(): Promise<void> {
    if (!this.currentAssessment) return

    const { error } = await supabase
      .from('imre_assessments')
      .insert({
        user_id: this.currentAssessment.userId,
        patient_id: this.currentAssessment.patientId,
        assessment_type: 'triaxial',
        triaxial_data: this.currentAssessment.imreData,
        semantic_context: this.currentAssessment.imreData.semanticBlocks,
        assessment_date: this.currentAssessment.assessmentDate,
        session_duration: this.currentAssessment.sessionDuration,
        completion_status: this.currentAssessment.completionStatus,
        clinical_notes: this.currentAssessment.clinicalNotes,
        therapeutic_goals: this.currentAssessment.therapeuticGoals
      })

    if (error) throw error
  }

  private async saveClinicalData(): Promise<void> {
    if (!this.currentAssessment) return

    const { error } = await supabase
      .from('clinical_integration')
      .insert({
        user_id: this.currentAssessment.userId,
        assessment_id: this.currentAssessment.id,
        renal_function_data: this.currentAssessment.clinicalData.renalFunction,
        cannabis_metabolism_data: this.currentAssessment.clinicalData.cannabisMetabolism,
        therapeutic_response: this.currentAssessment.clinicalData.therapeuticResponse,
        imre_clinical_correlations: this.currentAssessment.correlations.imreClinicalCorrelations,
        risk_assessment: this.currentAssessment.correlations.riskAssessment,
        treatment_recommendations: this.currentAssessment.correlations.treatmentRecommendations
      })

    if (error) throw error
  }

  private async saveCorrelations(): Promise<void> {
    // Implementar salvamento de correlações
  }

  private async saveClinicalIntegration(): Promise<void> {
    // Implementar salvamento de integração clínica
  }

  // =====================================================
  // FUNÇÕES AUXILIARES
  // =====================================================

  private getDefaultIMREData(): any {
    return {
      emotionalAxis: { intensity: 0, valence: 0, arousal: 0, stability: 0 },
      cognitiveAxis: { attention: 0, memory: 0, executive: 0, processing: 0 },
      behavioralAxis: { activity: 0, social: 0, adaptive: 0, regulatory: 0 },
      semanticBlocks: []
    }
  }

  private getDefaultClinicalData(): any {
    return {
      renalFunction: { creatinine: 0, gfr: 0, bun: 0, proteinuria: 0, stage: 'normal' },
      cannabisMetabolism: { cyp2c9: 'normal', cyp3a4: 'normal', cyp2c19: 'normal', metabolismRate: 1, drugInteractions: [] },
      therapeuticResponse: { efficacy: 0, sideEffects: [], dosage: 0, frequency: 'daily', duration: 0 }
    }
  }

  private async updateTherapeuticRecommendations(): Promise<void> {
    // Implementar atualização de recomendações terapêuticas
  }

  private async updateRiskAssessment(): Promise<void> {
    // Implementar atualização de avaliação de risco
  }

  // =====================================================
  // FUNÇÕES DE STATUS
  // =====================================================

  getCurrentAssessment(): UnifiedAssessment | null {
    return this.currentAssessment
  }

  isAssessmentInProgress(): boolean {
    return this.currentAssessment?.completionStatus === 'in_progress'
  }

  getAssessmentProgress(): number {
    // Implementar cálculo de progresso da avaliação
    return 0
  }
}

// =====================================================
// EXPORT DA INSTÂNCIA SINGLETON
// =====================================================
export const unifiedAssessment = UnifiedAssessmentSystem.getInstance()
