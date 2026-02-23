/**
 * NÔA ESPERANÇA - CORE SYSTEM
 * Alma do sistema baseada na Arte da Entrevista Clínica
 * Implementação do estado da arte do Avatar Nôa
 */

export interface NoaEsperancaConfig {
  // Configurações do Avatar Nôa
  avatar: {
    name: string
    personality: string
    expertise: string[]
    communicationStyle: 'empatica' | 'tecnica' | 'educativa'
  }
  
  // Sistema IMRE Triaxial
  imre: {
    eixos: {
      somatico: boolean
      psiquico: boolean
      social: boolean
    }
    profundidade: 'superficial' | 'intermediaria' | 'profunda'
  }
  
  // Arte da Entrevista Clínica
  aec: {
    metodologia: string
    tecnicas: string[]
    objetivos: string[]
  }
}

export interface NoaInteraction {
  id: string
  timestamp: Date
  tipo: 'consulta' | 'anamnese' | 'orientacao' | 'suporte'
  modalidade: 'texto' | 'voz' | 'video'
  conteudo: string
  contexto: {
    paciente: any
    sintomas: string[]
    queixa: string
    historia: string
  }
  resposta: {
    empatia: number
    tecnicidade: number
    educacao: number
  }
}

export class NoaEsperancaCore {
  private config: NoaEsperancaConfig
  
  constructor(config: NoaEsperancaConfig) {
    this.config = config
  }
  
  /**
   * ARTE DA ENTREVISTA CLÍNICA - Metodologia AEC
   */
  async realizarEntrevistaClinica(interacao: NoaInteraction): Promise<string> {
    const { aec } = this.config
    
    // 1. ESTABELECIMENTO DE RAPPORT
    const rapport = await this.estabelecerRapport(interacao)
    
    // 2. COLETA DE DADOS IMRE
    const dadosImre = await this.coletarDadosImre(interacao)
    
    // 3. ANÁLISE SEMÂNTICA
    const analise = await this.analisarSemanticamente(dadosImre)
    
    // 4. RESPOSTA EMPÁTICA E TÉCNICA
    const resposta = await this.gerarResposta(analise, interacao)
    
    return resposta
  }
  
  private async estabelecerRapport(interacao: NoaInteraction): Promise<string> {
    const { avatar } = this.config
    
    const frasesEmpaticas = [
      "Olá! Sou a Nôa, sua assistente médica. Estou aqui para te ajudar com todo cuidado e atenção.",
      "Entendo que você está passando por um momento delicado. Vamos conversar com calma.",
      "Sua saúde é minha prioridade. Vamos trabalhar juntos para encontrar as melhores soluções.",
      "Cada pessoa é única, e vou respeitar sua individualidade em cada resposta."
    ]
    
    return frasesEmpaticas[Math.floor(Math.random() * frasesEmpaticas.length)]
  }
  
  private async coletarDadosImre(interacao: NoaInteraction): Promise<any> {
    const { imre } = this.config
    
    return {
      // Eixo Somático
      somatico: imre.eixos.somatico ? {
        sintomasFisicos: this.extrairSintomasFisicos(interacao.conteudo),
        localizacao: this.identificarLocalizacao(interacao.conteudo),
        intensidade: this.avaliarIntensidade(interacao.conteudo)
      } : null,
      
      // Eixo Psíquico
      psiquico: imre.eixos.psiquico ? {
        estadoEmocional: this.avaliarEstadoEmocional(interacao.conteudo),
        cognicao: this.avaliarCognicao(interacao.conteudo),
        humor: this.avaliarHumor(interacao.conteudo)
      } : null,
      
      // Eixo Social
      social: imre.eixos.social ? {
        relacoes: this.avaliarRelacoes(interacao.conteudo),
        trabalho: this.avaliarTrabalho(interacao.conteudo),
        familia: this.avaliarFamilia(interacao.conteudo)
      } : null
    }
  }
  
  private async analisarSemanticamente(dadosImre: any): Promise<any> {
    // Análise semântica profunda baseada nos 3 eixos IMRE
    const analise = {
      padroes: this.identificarPadroes(dadosImre),
      correlacoes: this.identificarCorrelacoes(dadosImre),
      prioridades: this.definirPrioridades(dadosImre),
      sugestoes: this.gerarSugestoes(dadosImre)
    }
    
    return analise
  }
  
  private async gerarResposta(analise: any, interacao: NoaInteraction): Promise<string> {
    const { avatar } = this.config
    
    // Resposta baseada na personalidade do Avatar Nôa
    let resposta = ""
    
    if (avatar.communicationStyle === 'empatica') {
      resposta = this.gerarRespostaEmpatica(analise, interacao)
    } else if (avatar.communicationStyle === 'tecnica') {
      resposta = this.gerarRespostaTecnica(analise, interacao)
    } else {
      resposta = this.gerarRespostaEducativa(analise, interacao)
    }
    
    return resposta
  }
  
  private gerarRespostaEmpatica(analise: any, interacao: NoaInteraction): string {
    return `Entendo perfeitamente o que você está sentindo. ${analise.sugestoes[0]} Vamos trabalhar juntos para melhorar sua qualidade de vida.`
  }
  
  private gerarRespostaTecnica(analise: any, interacao: NoaInteraction): string {
    return `Baseado na análise dos dados apresentados, identifiquei ${analise.padroes.length} padrões relevantes. ${analise.sugestoes[0]}`
  }
  
  private gerarRespostaEducativa(analise: any, interacao: NoaInteraction): string {
    return `Vou te explicar o que está acontecendo: ${analise.correlacoes[0]}. Isso é importante porque ${analise.sugestoes[0]}`
  }
  
  // Métodos auxiliares para análise IMRE
  private extrairSintomasFisicos(conteudo: string): string[] {
    const sintomasComuns = [
      'dor', 'fadiga', 'nausea', 'tontura', 'febre', 'tremor',
      'rigidez', 'inchaço', 'formigamento', 'palpitacao'
    ]
    
    return sintomasComuns.filter(sintoma => 
      conteudo.toLowerCase().includes(sintoma)
    )
  }
  
  private identificarLocalizacao(conteudo: string): string {
    const localizacoes = [
      'cabeça', 'pescoço', 'ombros', 'costas', 'peito', 'abdomen',
      'braços', 'pernas', 'joelhos', 'tornozelos'
    ]
    
    return localizacoes.find(local => 
      conteudo.toLowerCase().includes(local)
    ) || 'não especificada'
  }
  
  private avaliarIntensidade(conteudo: string): number {
    const intensidade = conteudo.match(/\b(leve|moderada|intensa|severe)\b/gi)
    if (intensidade) {
      const nivel = intensidade[0].toLowerCase()
      switch (nivel) {
        case 'leve': return 1
        case 'moderada': return 2
        case 'intensa': return 3
        case 'severe': return 4
        default: return 2
      }
    }
    return 2 // Moderada por padrão
  }
  
  private avaliarEstadoEmocional(conteudo: string): string {
    const emocoes = [
      'ansiedade', 'depressão', 'estresse', 'tristeza', 'alegria',
      'medo', 'raiva', 'calma', 'confusão', 'esperança'
    ]
    
    return emocoes.find(emocao => 
      conteudo.toLowerCase().includes(emocao)
    ) || 'neutro'
  }
  
  private avaliarCognicao(conteudo: string): string {
    const cognicoes = [
      'clareza', 'confusão', 'foco', 'distração', 'memória',
      'concentração', 'raciocínio', 'decisão'
    ]
    
    return cognicoes.find(cognicao => 
      conteudo.toLowerCase().includes(cognicao)
    ) || 'normal'
  }
  
  private avaliarHumor(conteudo: string): string {
    const humores = [
      'eutímico', 'deprimido', 'elevado', 'irritado', 'ansioso',
      'calmo', 'agitado', 'melancólico'
    ]
    
    return humores.find(humor => 
      conteudo.toLowerCase().includes(humor)
    ) || 'eutímico'
  }
  
  private avaliarRelacoes(conteudo: string): string {
    const relacoes = [
      'familia', 'amigos', 'parceiro', 'colegas', 'vizinhos'
    ]
    
    return relacoes.find(relacao => 
      conteudo.toLowerCase().includes(relacao)
    ) || 'não mencionada'
  }
  
  private avaliarTrabalho(conteudo: string): string {
    const trabalhos = [
      'emprego', 'trabalho', 'profissão', 'carreira', 'ocupação'
    ]
    
    return trabalhos.some(trabalho => 
      conteudo.toLowerCase().includes(trabalho)
    ) ? 'mencionado' : 'não mencionado'
  }
  
  private avaliarFamilia(conteudo: string): string {
    const familia = [
      'pai', 'mãe', 'filho', 'filha', 'irmão', 'irmã', 'esposo', 'esposa'
    ]
    
    return familia.some(membro => 
      conteudo.toLowerCase().includes(membro)
    ) ? 'mencionada' : 'não mencionada'
  }
  
  private identificarPadroes(dadosImre: any): string[] {
    const padroes = []
    
    if (dadosImre.somatico?.sintomasFisicos?.length > 0) {
      padroes.push('Sintomas físicos identificados')
    }
    
    if (dadosImre.psiquico?.estadoEmocional !== 'neutro') {
      padroes.push('Alteração emocional detectada')
    }
    
    if (dadosImre.social?.relacoes !== 'não mencionada') {
      padroes.push('Impacto social observado')
    }
    
    return padroes
  }
  
  private identificarCorrelacoes(dadosImre: any): string[] {
    const correlacoes = []
    
    if (dadosImre.somatico && dadosImre.psiquico) {
      correlacoes.push('Correlação somato-psíquica identificada')
    }
    
    if (dadosImre.psiquico && dadosImre.social) {
      correlacoes.push('Impacto psico-social observado')
    }
    
    return correlacoes
  }
  
  private definirPrioridades(dadosImre: any): string[] {
    const prioridades = []
    
    if (dadosImre.somatico?.intensidade >= 3) {
      prioridades.push('Atenção imediata aos sintomas físicos')
    }
    
    if (dadosImre.psiquico?.estadoEmocional === 'ansiedade' || dadosImre.psiquico?.estadoEmocional === 'depressão') {
      prioridades.push('Suporte emocional prioritário')
    }
    
    return prioridades
  }
  
  private gerarSugestoes(dadosImre: any): string[] {
    const sugestoes = []
    
    if (dadosImre.somatico?.sintomasFisicos?.length > 0) {
      sugestoes.push('Considere técnicas de relaxamento e respiração')
    }
    
    if (dadosImre.psiquico?.estadoEmocional === 'ansiedade') {
      sugestoes.push('Pratique mindfulness e meditação')
    }
    
    if (dadosImre.social?.relacoes !== 'não mencionada') {
      sugestoes.push('Mantenha conexões sociais positivas')
    }
    
    return sugestoes
  }
}

// Configuração padrão da Nôa Esperança
export const noaEsperancaConfig: NoaEsperancaConfig = {
  avatar: {
    name: "Nôa Esperança",
    personality: "Empática, técnica e educativa",
    expertise: [
      "Cannabis Medicinal",
      "Arte da Entrevista Clínica",
      "Sistema IMRE Triaxial",
      "Acompanhamento Terapêutico"
    ],
    communicationStyle: "empatica"
  },
  
  imre: {
    eixos: {
      somatico: true,
      psiquico: true,
      social: true
    },
    profundidade: "profunda"
  },
  
  aec: {
    metodologia: "Arte da Entrevista Clínica - Metodologia AEC",
    tecnicas: [
      "Estabelecimento de Rapport",
      "Escuta Ativa",
      "Perguntas Abertas",
      "Validação Emocional",
      "Orientação Técnica"
    ],
    objetivos: [
      "Coleta de dados IMRE",
      "Análise semântica",
      "Resposta empática",
      "Orientação terapêutica"
    ]
  }
}
