import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useMedCannLabConversation } from '../hooks/useMedCannLabConversation';
import type { ConversationMessage } from '../types';
import './NoaConversationalInterface.css';

interface NoaConversationalInterfaceProps {
  clinicianProfile?: string;
}

const quickActions: Array<{ label: string; prompt: string }> = [
  {
    label: 'Status da plataforma',
    prompt: 'Verifique o status operacional da plataforma MedCannLab'
  },
  {
    label: 'Contexto de treinamento',
    prompt: 'Traga o histórico de treinamento recente com foco em IMRE Triaxial'
  },
  {
    label: 'Simulações clínicas',
    prompt: 'Liste as simulações clínicas ativas relacionadas à nefrologia'
  },
  {
    label: 'Biblioteca de protocolos',
    prompt: 'Pesquise protocolos de cannabis medicinal para dor neuropática'
  }
];

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function NoaConversationalInterface({
  clinicianProfile
}: NoaConversationalInterfaceProps) {
  const [input, setInput] = useState('');
  const conversation = useMedCannLabConversation({ clinicianProfile });
  const { messages, sendMessage, voice, telemetry, isProcessing, error } = conversation;
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isProcessing]);

  const lastAssistantMessage = useMemo(() => {
    return [...messages].reverse().find((message) => message.role === 'assistant');
  }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }
    await sendMessage(input.trim());
    setInput('');
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    void sendMessage(prompt);
  };

  const renderMessage = (message: ConversationMessage) => {
    return (
      <div key={message.id} className={`noa-message ${message.role}`}>
        <div className="noa-bubble">
          {message.content}
        </div>
        <span className="noa-timestamp">
          {message.intent ? `${message.intent} · ` : ''}
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
    );
  };

  return (
    <div className="noa-container" role="region" aria-label="Interface conversacional Nôa Esperança">
      <header className="noa-header">
        <div>
          <h1>Nôa Esperança · MedCannLab 3.0</h1>
          <p>Interface clínica conversacional com metodologia IMRE e escuta ativa.</p>
        </div>
        <div className="noa-profile">
          <strong>Perfil clínico</strong>
          <span>{clinicianProfile ?? 'Profissional convidado'}</span>
          {voice.supported ? <span>Voz habilitada</span> : <span>Voz indisponível</span>}
        </div>
      </header>

      <section className="noa-conversation" aria-live="polite">
        {messages.map(renderMessage)}
        {isProcessing && (
          <div className="noa-message assistant">
            <div className="noa-bubble">Estou analisando sua solicitação com carinho clínico…</div>
            <span className="noa-timestamp">IMRE · processamento</span>
          </div>
        )}
        <div ref={bottomRef} />
      </section>

      <section className="noa-telemetry">
        <div>
          <strong>Telemetria</strong>
          <ul>
            {telemetry.endpointsCalled.map((endpoint, index) => (
              <li key={`${endpoint}-${index}`}>{endpoint}</li>
            ))}
            {telemetry.endpointsCalled.length === 0 && <li>Nenhum endpoint chamado ainda.</li>}
          </ul>
        </div>
        <div>
          <strong>Última atualização</strong>
          <div>{telemetry.lastUpdated ? formatTimestamp(telemetry.lastUpdated) : 'Aguardando interação.'}</div>
        </div>
      </section>

      <section className="noa-quick-actions">
        {quickActions.map((action) => (
          <button
            key={action.label}
            type="button"
            className="noa-quick-button"
            onClick={() => handleQuickAction(action.prompt)}
          >
            {action.label}
          </button>
        ))}
      </section>

      <form className="noa-input-area" onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Digite seu comando clínico ou utilize o microfone."
          aria-label="Mensagem para Nôa Esperança"
        />
        <button
          type="button"
          className="noa-action-button"
          onClick={() => {
            if (!voice.supported) {
              return;
            }
            voice
              .start()
              .catch(() => {
                // handled via hook error state
              });
          }}
        >
          Voz
        </button>
        <button className="noa-action-button" type="submit" disabled={isProcessing}>
          Enviar
        </button>
      </form>

      {error && <div className="noa-error">{error.message}</div>}

      {lastAssistantMessage && (
        <footer>
          <strong>Resumo recente</strong>
          <p>{lastAssistantMessage.content}</p>
        </footer>
      )}
    </div>
  );
}
