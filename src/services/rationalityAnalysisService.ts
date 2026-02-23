import { supabase } from '../lib/supabase'
import { NoaResidentAI } from '../lib/noaResidentAI'

export type Rationality = 'biomedical' | 'traditional_chinese' | 'ayurvedic' | 'homeopathic' | 'integrative'

interface RationalityAnalysis {
  assessment: string
  recommendations: string[]
  considerations: string
  approach: string
}

const RATIONALITY_PROMPTS: Record<Rationality, string> = {
  biomedical: `Analise este relatório clínico do ponto de vista biomédico ocidental. 
Foque em:
- Diagnósticos diferenciais baseados em evidências
- Exames complementares recomendados
- Protocolos farmacológicos baseados em evidências científicas
- Monitoramento de parâmetros laboratoriais e clínicos
- Interações medicamentosas e contraindicações

Forneça uma análise estruturada com recomendações práticas.`,

  traditional_chinese: `Analise este relatório clínico do ponto de vista da Medicina Tradicional Chinesa (MTC).
Foque em:
- Padrões de desarmonia (Zang-Fu)
- Síndromes identificadas (ex: deficiência de Qi, estagnação de Xue)
- Princípios de tratamento (tonificar, dispersar, harmonizar)
- Pontos de acupuntura relevantes
- Fitoterapia chinesa e formulações clássicas
- Relação com os cinco elementos e meridianos

Forneça uma análise estruturada com recomendações práticas.`,

  ayurvedic: `Analise este relatório clínico do ponto de vista da Medicina Ayurvédica.
Foque em:
- Identificação do dosha predominante (Vata, Pitta, Kapha) e desequilíbrios
- Constituição (Prakriti) e estado atual (Vikriti)
- Agni (fogo digestivo) e Ama (toxinas)
- Recomendações dietéticas (Ahara) baseadas no dosha
- Fitoterapia ayurvédica e formulações
- Práticas de estilo de vida (Dinacharya, Ritucharya)
- Tratamentos de purificação (Panchakarma) se aplicável

Forneça uma análise estruturada com recomendações práticas.`,

  homeopathic: `Analise este relatório clínico do ponto de vista da Homeopatia.
Foque em:
- Sintomas mentais, emocionais e físicos característicos
- Modalidades (o que melhora/piora)
- Miasmas identificados (Psora, Sycosis, Syphilis)
- Remédio constitucional sugerido
- Remédios agudos ou sintomáticos se aplicável
- Potência e posologia recomendadas
- Considerações sobre agravação inicial e direção da cura (Lei de Hering)

Forneça uma análise estruturada com recomendações práticas.`,

  integrative: `Analise este relatório clínico do ponto de vista da Medicina Integrativa.
Foque em:
- Síntese das perspectivas biomédica, MTC, ayurvédica e homeopática
- Abordagem multidisciplinar e complementar
- Integração de terapias convencionais e complementares
- Priorização de intervenções baseada em segurança e evidências
- Plano de tratamento coordenado
- Monitoramento integrado de resultados

Forneça uma análise estruturada com recomendações práticas que integrem múltiplas racionalidades.`
}

export class RationalityAnalysisService {
  private noaAI: NoaResidentAI

  constructor() {
    this.noaAI = new NoaResidentAI()
  }

  /**
   * Gera análise de um relatório clínico segundo uma racionalidade médica específica
   */
  async generateAnalysis(
    reportContent: any,
    rationality: Rationality,
    userId?: string,
    userEmail?: string
  ): Promise<RationalityAnalysis> {
    try {
      // Construir contexto do relatório
      const reportContext = `
RELATÓRIO CLÍNICO PARA ANÁLISE:

Queixa Principal: ${reportContent.chiefComplaint || 'Não informado'}
História: ${reportContent.history || 'Não informado'}
Exame Físico: ${reportContent.physicalExam || 'Não informado'}
Avaliação: ${reportContent.assessment || 'Não informado'}
Plano: ${reportContent.plan || 'Não informado'}
      `.trim()

      // Prompt específico da racionalidade
      const rationalityPrompt = RATIONALITY_PROMPTS[rationality]

      // Mensagem completa para a IA
      const fullMessage = `${rationalityPrompt}\n\n${reportContext}\n\nPor favor, forneça uma análise detalhada segundo esta racionalidade médica.`

      // Processar com Nôa
      const response = await this.noaAI.processMessage(
        fullMessage,
        userId,
        userEmail
      )

      // Estruturar resposta
      const analysis: RationalityAnalysis = {
        assessment: response.content,
        recommendations: this.extractRecommendations(response.content),
        considerations: this.extractConsiderations(response.content),
        approach: this.extractApproach(response.content)
      }

      return analysis
    } catch (error) {
      console.error('Erro ao gerar análise de racionalidade:', error)
      throw error
    }
  }

  /**
   * Salva análise de racionalidade no relatório
   */
  async saveAnalysisToReport(
    reportId: string,
    rationality: Rationality,
    analysis: RationalityAnalysis
  ): Promise<void> {
    try {
      // Buscar relatório atual
      const { data: report, error: fetchError } = await supabase
        .from('clinical_reports')
        .select('content')
        .eq('id', reportId)
        .single()

      if (fetchError) throw fetchError

      // Atualizar campo rationalities no content
      const currentContent = (report.content as any) || {}
      const currentRationalities = (currentContent as any).rationalities || {}

      // Mapear nome da racionalidade para o formato do banco
      const rationalityKey = rationality === 'traditional_chinese'
        ? 'traditionalChinese'
        : rationality

      currentRationalities[rationalityKey] = {
        assessment: analysis.assessment,
        recommendations: analysis.recommendations,
        considerations: analysis.considerations,
        approach: analysis.approach,
        generatedAt: new Date().toISOString()
      }

      // Atualizar relatório
      const { error: updateError } = await supabase
        .from('clinical_reports')
        .update({
          content: {
            ...currentContent,
            rationalities: currentRationalities
          }
        })
        .eq('id', reportId)

      if (updateError) throw updateError
    } catch (error) {
      console.error('Erro ao salvar análise no relatório:', error)
      throw error
    }
  }

  /**
   * Extrai recomendações da resposta da IA
   */
  private extractRecommendations(content: string): string[] {
    const recommendations: string[] = []
    const lines = content.split('\n')

    let inRecommendations = false
    for (const line of lines) {
      if (line.toLowerCase().includes('recomenda') || line.toLowerCase().includes('sugest')) {
        inRecommendations = true
      }
      if (inRecommendations && (line.startsWith('-') || line.startsWith('•') || line.match(/^\d+\./))) {
        recommendations.push(line.replace(/^[-•\d.\s]+/, '').trim())
      }
    }

    return recommendations.length > 0 ? recommendations : [content.substring(0, 200) + '...']
  }

  /**
   * Extrai considerações da resposta da IA
   */
  private extractConsiderations(content: string): string {
    const considerationsMatch = content.match(/considera[çc][õo]es?[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/is)
    return considerationsMatch ? considerationsMatch[1].trim() : ''
  }

  /**
   * Extrai abordagem da resposta da IA
   */
  private extractApproach(content: string): string {
    const approachMatch = content.match(/abordagem[:\s]+(.*?)(?=\n\n|\n[A-Z]|$)/is)
    return approachMatch ? approachMatch[1].trim() : content.substring(0, 300)
  }
}

export const rationalityAnalysisService = new RationalityAnalysisService()

