import type { DetectedIntent } from './nlp';

const empathyPhrases = [
  'Estou aqui para apoiar cada passo da sua avaliação clínica.',
  'Vamos integrar ciência, escuta ativa e protocolos atualizados.',
  'Seguirei com acolhimento e foco na segurança do paciente.'
];

function randomEmpathyPhrase() {
  return empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)];
}

export interface EmpatheticResponseOptions {
  clinicianProfile?: string;
  contextSummary?: string;
}

export function buildEmpatheticIntroduction(options: EmpatheticResponseOptions = {}) {
  const greeting = options.clinicianProfile
    ? `Olá, ${options.clinicianProfile}.`
    : 'Olá.';
  const empathy = randomEmpathyPhrase();
  return `${greeting} ${empathy}`;
}

export function craftIntentConfirmation(intent: DetectedIntent) {
  switch (intent.type) {
    case 'STATUS':
      return 'Vou verificar o status operacional da plataforma.';
    case 'TRAINING_CONTEXT':
      return 'Reunindo o histórico recente de treinamento para IMRE e metodologias associadas.';
    case 'SIMULATION':
      return 'Vamos revisar as simulações clínicas em andamento para ajustar a triagem.';
    case 'KNOWLEDGE':
      return 'Consultando a biblioteca médica para trazer a evidência mais relevante.';
    case 'IMRE_ANALYSIS':
      return 'Integrarei os eixos IMRE Triaxial com escuta e hipóteses clínicas.';
    default:
      return 'Estou processando seu pedido com atenção plena.';
  }
}

export function synthesizeClinicalResponse(
  intent: DetectedIntent,
  payload: unknown,
  options: EmpatheticResponseOptions = {}
) {
  const intro = buildEmpatheticIntroduction(options);
  const confirmation = craftIntentConfirmation(intent);

  return {
    intro,
    confirmation,
    payloadSummary: summarizePayload(intent, payload)
  };
}

function summarizePayload(intent: DetectedIntent, payload: unknown): string {
  if (!payload) {
    return 'Não encontrei dados adicionais neste momento, mas posso investigar outra fonte se desejar.';
  }

  switch (intent.type) {
    case 'STATUS':
      return describePlatformStatus(payload as Record<string, unknown>);
    case 'TRAINING_CONTEXT':
      return describeTrainingContext(payload as Record<string, unknown>);
    case 'SIMULATION':
      return describeSimulations(payload as Record<string, unknown>);
    case 'KNOWLEDGE':
      return describeKnowledge(payload as Record<string, unknown>);
    case 'IMRE_ANALYSIS':
      return 'Vamos correlacionar sinais, sintomas e camadas contextuais pelo IMRE Triaxial. Posso aprofundar-se em cada eixo se precisar.';
    default:
      return 'Sigo disponível para novos direcionamentos clínicos ou pedagógicos.';
  }
}

function describePlatformStatus(payload: Record<string, unknown>): string {
  const status = payload?.['status'] as string | undefined;
  const updatedAt = payload?.['updatedAt'] as string | undefined;
  const notes = payload?.['notes'] as string | undefined;
  const base = status ? `Sistema identificado como ${status}.` : 'Status operacional coletado.';
  const updated = updatedAt ? ` Última atualização registrada em ${updatedAt}.` : '';
  const noteText = notes ? ` Observação técnica: ${notes}` : '';
  return `${base}${updated}${noteText}`.trim();
}

function describeTrainingContext(payload: Record<string, unknown>): string {
  const modules = Array.isArray(payload?.['modules']) ? (payload['modules'] as Array<Record<string, unknown>>) : [];
  if (modules.length === 0) {
    return 'Nenhum módulo de treinamento encontrado. Podemos iniciar uma nova trilha focada em cannabis medicinal ou nefrologia.';
  }
  const highlighted = modules
    .slice(0, 3)
    .map((module) => `${module['title']} (${module['focus']})`)
    .join(', ');
  return `Módulos priorizados: ${highlighted}. Podemos revisar objetivos e registrar insights IMRE para cada um.`;
}

function describeSimulations(payload: Record<string, unknown>): string {
  const simulations = Array.isArray(payload?.['simulations'])
    ? (payload['simulations'] as Array<Record<string, unknown>>)
    : [];
  if (simulations.length === 0) {
    return 'Nenhuma simulação ativa. Podemos abrir um cenário com foco em dor crônica ou ajuste renal para cannabis medicinal.';
  }
  const overview = simulations
    .slice(0, 3)
    .map((simulation) => {
      const status = simulation['status'];
      const specialty = simulation['specialty'];
      return `${specialty} (${status})`;
    })
    .join('; ');
  return `Simulações monitoradas: ${overview}. Posso detalhar intervenções sugeridas.`;
}

function describeKnowledge(payload: Record<string, unknown>): string {
  const entries = Array.isArray(payload?.['entries'])
    ? (payload['entries'] as Array<Record<string, unknown>>)
    : [];
  if (entries.length === 0) {
    return 'Biblioteca sem resultados para esse recorte. Ajuste o termo ou peça sugestões clínicas que eu pesquiso por você.';
  }
  const highlights = entries
    .slice(0, 3)
    .map((entry) => `${entry['title']} [${entry['category']}]`)
    .join(' | ');
  return `Conteúdos em destaque: ${highlights}. Envio o link completo mediante confirmação.`;
}
