export type ConversationRole = 'user' | 'assistant' | 'system';

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  content: string;
  timestamp: string;
  intent?: string;
  metadata?: Record<string, unknown>;
}

export interface ConversationTelemetry {
  endpointsCalled: string[];
  lastUpdated: string | null;
}

export interface ConversationError {
  code?: string;
  message: string;
}
