import { ConversationalIntent, ParsedIntent } from './types'

interface IntentPattern {
  intent: ConversationalIntent
  keywords: string[]
  weight?: number
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    intent: 'CHECK_STATUS',
    keywords: ['status', 'operacional', 'online', 'disponivel', 'andamento', 'monitoramento', 'uptime'],
    weight: 0.9
  },
  {
    intent: 'GET_TRAINING_CONTEXT',
    keywords: ['treinamento', 'contexto', 'historico', 'simulacao anterior', 'caso anterior', 'registro clinico'],
    weight: 0.85
  },
  {
    intent: 'MANAGE_SIMULATION',
    keywords: ['simulacao', 'iniciar cenario', 'rodar protocolo', 'caso clinico', 'executar simulacao'],
    weight: 0.95
  },
  {
    intent: 'ACCESS_LIBRARY',
    keywords: ['biblioteca', 'protocolo', 'dissertacao', 'literatura', 'evidencia', 'guideline'],
    weight: 0.9
  },
  {
    intent: 'IMRE_ANALYSIS',
    keywords: ['imre', 'somatico', 'psiquico', 'social', 'triaxial', 'entrevista clinica', 'anamnese'],
    weight: 0.92
  },
  {
    intent: 'HELP',
    keywords: ['ajuda', 'como usar', 'o que posso', 'orientação', 'menu', 'comandos'],
    weight: 0.8
  }
]

const CLINICAL_KEYWORDS = ['nefro', 'renal', 'rim', 'hemodialise', 'dialise', 'creatinina', 'proteinuria']
const CANNABIS_KEYWORDS = ['cannabis', 'canabidiol', 'thc', 'cbn', 'oleo', 'fitocanabinoide', 'fitoterapico']

const AXES_KEYWORDS: Record<'somatico' | 'psiquico' | 'social', string[]> = {
  somatico: ['somatico', 'dor', 'sintoma', 'fadiga', 'colica', 'pressao', 'edema', 'biomarcador', 'fisico', 'renal'],
  psiquico: ['ansiedade', 'humor', 'sono', 'emocao', 'psicologico', 'mental', 'sentindo'],
  social: ['familia', 'trabalho', 'social', 'apoio', 'caregiver', 'ambiente']
}

const FOCUS_AREAS = [
  { id: 'cannabis', keywords: CANNABIS_KEYWORDS, priority: 3 },
  { id: 'nefrologia', keywords: CLINICAL_KEYWORDS, priority: 2 },
  { id: 'educacional', keywords: ['curso', 'aula', 'estudo', 'material didatico'], priority: 1 }
]

export const parseIntent = (text: string): ParsedIntent => {
  const normalized = normalizeText(text)
  const tokens = normalized.split(/\s+/).filter(Boolean)

  let bestIntent: ConversationalIntent = 'UNKNOWN'
  let bestScore = 0

  for (const pattern of INTENT_PATTERNS) {
    const matches = pattern.keywords.reduce((score, keyword) => {
      if (normalized.includes(keyword)) {
        return score + 1
      }
      return score
    }, 0)

    if (matches === 0) continue

    const denominator = Math.min(pattern.keywords.length, 3)
    const candidateScore = Math.min(1, (matches / denominator) * (pattern.weight ?? 1))

    if (candidateScore > bestScore) {
      bestScore = candidateScore
      bestIntent = pattern.intent
    }
  }

  if (bestScore < 0.2 && /obrigado|valeu|agradeço|certo|ok/.test(normalized)) {
    bestIntent = 'SMALL_TALK'
    bestScore = 0.3
  }

  const focusArea = detectFocusArea(normalized)
  const axes = detectImreAxes(normalized)
  const entities = extractEntities(tokens)

  return {
    intent: bestIntent,
    confidence: Math.min(1, Number(bestScore.toFixed(2))),
    entities,
    focusArea,
    axes,
    isClinicalCommand: ['CHECK_STATUS', 'MANAGE_SIMULATION', 'IMRE_ANALYSIS', 'GET_TRAINING_CONTEXT', 'ACCESS_LIBRARY'].includes(bestIntent),
    rawText: text
  }
}

const normalizeText = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

const detectFocusArea = (normalizedText: string): string | undefined => {
  let bestArea: { id: string; score: number; priority: number } | undefined

  for (const area of FOCUS_AREAS) {
    const score = area.keywords.reduce((acc, keyword) => (
      normalizedText.includes(keyword) ? acc + 1 : acc
    ), 0)

    if (score === 0) continue

    if (!bestArea || score > bestArea.score || (score === bestArea.score && area.priority > bestArea.priority)) {
      bestArea = { id: area.id, score, priority: area.priority }
    }
  }

  return bestArea?.id
}

const detectImreAxes = (normalizedText: string): ('somatico' | 'psiquico' | 'social')[] | undefined => {
  const detected: ('somatico' | 'psiquico' | 'social')[] = []

  ;(['somatico', 'psiquico', 'social'] as const).forEach(axis => {
    const keywords = AXES_KEYWORDS[axis]
    if (keywords.some(keyword => normalizedText.includes(keyword))) {
      detected.push(axis)
    }
  })

  return detected.length > 0 ? detected : undefined
}

const extractEntities = (tokens: string[]): Record<string, string> => {
  const entities: Record<string, string> = {}

  const patientMatch = tokens.find(token => /^paciente-?[a-z0-9]+$/.test(token))
  if (patientMatch) {
    entities.patientId = patientMatch.replace('paciente', '').replace('-', '')
  }

  const simulationMatch = tokens.find(token => /^simulacao-?[a-z0-9]+$/.test(token))
  if (simulationMatch) {
    entities.simulationId = simulationMatch.replace('simulacao', '').replace('-', '')
  }

  const protocolMatch = tokens.find(token => /^protocolo-?[a-z0-9]+$/.test(token))
  if (protocolMatch) {
    entities.protocolId = protocolMatch.replace('protocolo', '').replace('-', '')
  }

  return entities
}

