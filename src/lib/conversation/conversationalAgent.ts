import { synthesizeClinicalResponse } from './NoaEsperancaCore';
import { detectIntent, isClinicalIntent, type DetectedIntent } from './nlp';
import type { ConversationMessage } from '../../types';
import {
  MedCannLabApiClient,
  type KnowledgeLibraryResponse,
  type PatientSimulationResponse,
  type PlatformStatusResponse,
  type TrainingContextResponse
} from '../medcannlab/apiClient';

export interface AgentResponse {
  intent: DetectedIntent;
  message: string;
  data?: unknown;
  endpoint?: string;
}

export interface AgentContext {
  clinicianProfile?: string;
  history: ConversationMessage[];
}

export interface MedCannLabConversationalAgentOptions {
  clinicianProfile?: string;
}

export class MedCannLabConversationalAgent {
  constructor(
    private readonly apiClient: MedCannLabApiClient,
    private readonly options: MedCannLabConversationalAgentOptions = {}
  ) {}

  async process(userInput: string, context: AgentContext): Promise<AgentResponse> {
    const intent = detectIntent(userInput);

    if (!isClinicalIntent(intent)) {
      return {
        intent,
        message: this.handleNonClinicalIntent(intent, context)
      };
    }

    try {
      const { data, endpoint } = await this.resolveClinicalData(intent, userInput);
      const structured = synthesizeClinicalResponse(intent, data?.data ?? data, {
        clinicianProfile: this.options.clinicianProfile ?? context.clinicianProfile,
        contextSummary: context.history.slice(-3).map((m) => m.content).join(' \n')
      });

      const message = `${structured.intro}\n${structured.confirmation}\n${structured.payloadSummary}`;

      return {
        intent,
        message,
        data,
        endpoint
      };
    } catch (error) {
      const message =
        'Encontrei uma intercorrência ao consultar a plataforma. Podemos tentar novamente ou ajustar o comando clínico?';
      return {
        intent,
        message,
        data: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  private async resolveClinicalData(intent: DetectedIntent, userInput: string) {
    switch (intent.type) {
      case 'STATUS': {
        const data = await this.apiClient.getPlatformStatus();
        return { data: data.data as PlatformStatusResponse, endpoint: '/platform/status' };
      }
      case 'TRAINING_CONTEXT': {
        const data = await this.apiClient.getTrainingContext();
        return { data: data.data as TrainingContextResponse, endpoint: '/training/context' };
      }
      case 'SIMULATION': {
        const data = await this.apiClient.getPatientSimulations();
        return { data: data.data as PatientSimulationResponse, endpoint: '/patients/simulations' };
      }
      case 'KNOWLEDGE': {
        const query = this.extractQueryFromInput(userInput);
        const data = await this.apiClient.getKnowledgeLibrary(query);
        return { data: data.data as KnowledgeLibraryResponse, endpoint: '/knowledge/library' };
      }
      case 'IMRE_ANALYSIS':
      default:
        return { data: { insight: 'Aplicando escuta clínica e correlações IMRE.' }, endpoint: 'imre' };
    }
  }

  private extractQueryFromInput(input: string): string | undefined {
    const parts = input.split(' ');
    if (parts.length < 3) {
      return undefined;
    }
    return parts.slice(-3).join(' ');
  }

  private handleNonClinicalIntent(intent: DetectedIntent, context: AgentContext): string {
    if (intent.type === 'SMALL_TALK') {
      return 'Gratidão pelo contato. Sigo à disposição para novos comandos clínicos ou dúvidas pedagógicas.';
    }

    if (!intent.rawInput.trim()) {
      return 'Pode me orientar sobre o próximo passo clínico ou dúvida sobre a plataforma?';
    }

    const previousContext = context.history.slice(-1)[0];
    if (previousContext) {
      return `Entendi. Em nossa última interação falamos sobre "${previousContext.content}". Deseja aprofundar ou abrir novo foco?`;
    }

    return 'Estou pronta para auxiliar com protocolos de cannabis medicinal, nefrologia e metodologia IMRE. Como posso contribuir?';
  }
}
