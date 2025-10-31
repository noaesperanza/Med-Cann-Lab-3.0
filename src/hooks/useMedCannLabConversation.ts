import { useCallback, useMemo, useRef, useState } from 'react';
import { MedCannLabConversationalAgent } from '../lib/conversation/conversationalAgent';
import { MedCannLabApiClient } from '../lib/medcannlab/apiClient';
import type {
  ConversationError,
  ConversationMessage,
  ConversationTelemetry
} from '../types';

interface UseMedCannLabConversationOptions {
  clinicianProfile?: string;
  initialMessages?: ConversationMessage[];
}

interface VoiceController {
  start: () => Promise<void>;
  stop: () => void;
  supported: boolean;
}

export interface UseMedCannLabConversationReturn {
  messages: ConversationMessage[];
  telemetry: ConversationTelemetry;
  isProcessing: boolean;
  error: ConversationError | null;
  sendMessage: (content: string) => Promise<void>;
  reset: () => void;
  voice: VoiceController;
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
    SpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function createMessage(content: string, role: ConversationMessage['role'], intent?: string): ConversationMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    content,
    role,
    intent,
    timestamp: new Date().toISOString()
  };
}

export function useMedCannLabConversation(
  options: UseMedCannLabConversationOptions = {}
): UseMedCannLabConversationReturn {
  const [messages, setMessages] = useState<ConversationMessage[]>(options.initialMessages ?? []);
  const [telemetry, setTelemetry] = useState<ConversationTelemetry>({
    endpointsCalled: [],
    lastUpdated: null
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<ConversationError | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const apiClient = useMemo(
    () =>
      new MedCannLabApiClient({
        clinicianProfile: options.clinicianProfile
      }),
    [options.clinicianProfile]
  );

  const agent = useMemo(
    () =>
      new MedCannLabConversationalAgent(apiClient, {
        clinicianProfile: options.clinicianProfile
      }),
    [apiClient, options.clinicianProfile]
  );

  const appendMessage = useCallback((message: ConversationMessage) => {
    setMessages((current) => [...current, message]);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) {
        return;
      }
      setIsProcessing(true);
      setError(null);

      const userMessage = createMessage(content, 'user');
      appendMessage(userMessage);

      try {
        const response = await agent.process(content, {
          clinicianProfile: options.clinicianProfile,
          history: [...messages, userMessage]
        });
        appendMessage(createMessage(response.message, 'assistant', response.intent.type));
        if (response.endpoint) {
          setTelemetry((current) => ({
            endpointsCalled: [...current.endpointsCalled, response.endpoint!],
            lastUpdated: new Date().toISOString()
          }));
        }
      } catch (agentError) {
        const fallback =
          agentError instanceof Error
            ? agentError.message
            : 'Ocorreu um erro inesperado ao processar o comando.';
        setError({ message: fallback });
        appendMessage(
          createMessage(
            'Houve um problema técnico ao acionar a plataforma MedCannLab. Podemos tentar novamente em instantes.',
            'assistant'
          )
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [agent, appendMessage, messages, options.clinicianProfile]
  );

  const reset = useCallback(() => {
    setMessages(options.initialMessages ?? []);
    setTelemetry({ endpointsCalled: [], lastUpdated: null });
    setError(null);
  }, [options.initialMessages]);

  const startVoice = useCallback(async () => {
    if (typeof window === 'undefined') {
      throw new Error('Ambiente sem suporte a voz.');
    }
    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      throw new Error('Reconhecimento de voz indisponível neste dispositivo.');
    }
    const recognition = new Recognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    await new Promise<void>((resolve, reject) => {
      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript ?? '';
        if (transcript.trim()) {
          void sendMessage(transcript.trim());
        }
        resolve();
      };
      recognition.onerror = (event) => {
        const message = event.error ?? 'Erro no reconhecimento de voz.';
        setError({ message });
        reject(new Error(message));
      };
      recognition.onend = () => {
        resolve();
      };
      recognition.start();
    });
  }, [sendMessage]);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  return {
    messages,
    telemetry,
    isProcessing,
    error,
    sendMessage,
    reset,
    voice: {
      start: startVoice,
      stop: stopVoice,
      supported:
        typeof window !== 'undefined' &&
        Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition)
    }
  };
}
