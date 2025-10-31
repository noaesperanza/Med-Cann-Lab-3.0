export type MedCannLabIntentType =
  | 'STATUS'
  | 'TRAINING_CONTEXT'
  | 'SIMULATION'
  | 'KNOWLEDGE'
  | 'IMRE_ANALYSIS'
  | 'SMALL_TALK'
  | 'UNKNOWN';

export interface DetectedIntent {
  type: MedCannLabIntentType;
  confidence: number;
  keywords: string[];
  domain?: 'cannabis' | 'nefrologia' | 'geral';
  rawInput: string;
}

const keywordMatrix: Record<MedCannLabIntentType, string[]> = {
  STATUS: ['status', 'plataforma', 'sistema', 'online', 'latência', 'healthcheck'],
  TRAINING_CONTEXT: ['treinamento', 'histórico', 'contexto', 'módulo', 'imre', 'triaxial'],
  SIMULATION: ['simulação', 'simulacao', 'paciente', 'caso clínico', 'case', 'triagem'],
  KNOWLEDGE: ['biblioteca', 'protocolo', 'dissertação', 'artigo', 'paper', 'guideline'],
  IMRE_ANALYSIS: ['imre', 'triaxial', 'escuta', 'entrevista clínica', 'análise', 'contextualizar'],
  SMALL_TALK: ['obrigado', 'agradeço', 'como você está', 'bom dia', 'olá'],
  UNKNOWN: []
};

const cannabisKeywords = ['cannabis', 'canabidiol', 'thc', 'terpeno'];
const nephrologyKeywords = ['nefro', 'rim', 'renal', 'hemodiálise', 'creatinina'];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ');
}

export function detectIntent(input: string): DetectedIntent {
  const normalized = normalize(input);
  const keywordsDetected: string[] = [];
  let bestIntent: MedCannLabIntentType = 'UNKNOWN';
  let bestScore = 0;

  (Object.entries(keywordMatrix) as Array<[MedCannLabIntentType, string[]]>).forEach(
    ([intent, keywords]) => {
      if (intent === 'UNKNOWN') {
        return;
      }
      let score = 0;
      keywords.forEach((keyword) => {
        const normalizedKeyword = normalize(keyword).trim();
        if (normalized.includes(normalizedKeyword)) {
          score += 1;
          keywordsDetected.push(keyword);
        }
      });
      if (score > bestScore) {
        bestIntent = intent;
        bestScore = score;
      }
    }
  );

  const domain = cannabisKeywords.some((word) => normalized.includes(word))
    ? 'cannabis'
    : nephrologyKeywords.some((word) => normalized.includes(word))
    ? 'nefrologia'
    : 'geral';

  if (bestScore === 0) {
    if (normalized.trim().length === 0) {
      return {
        type: 'UNKNOWN',
        confidence: 0,
        keywords: [],
        domain,
        rawInput: input
      };
    }
    if (domain !== 'geral') {
      bestIntent = 'IMRE_ANALYSIS';
      bestScore = 1;
    }
  }

  const confidence = Math.min(1, bestScore / 3 + (domain !== 'geral' ? 0.1 : 0));

  return {
    type: bestIntent,
    confidence,
    keywords: keywordsDetected,
    domain,
    rawInput: input
  };
}

export function isClinicalIntent(intent: DetectedIntent): boolean {
  return ['STATUS', 'TRAINING_CONTEXT', 'SIMULATION', 'KNOWLEDGE', 'IMRE_ANALYSIS'].includes(
    intent.type
  );
}
