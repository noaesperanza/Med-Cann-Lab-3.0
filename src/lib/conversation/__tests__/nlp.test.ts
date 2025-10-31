import { describe, expect, it } from 'vitest';
import { detectIntent } from '../nlp';

describe('detectIntent', () => {
  it('identifica intenções de status da plataforma', () => {
    const intent = detectIntent('Qual o status atual da plataforma MedCannLab?');
    expect(intent.type).toBe('STATUS');
    expect(intent.confidence).toBeGreaterThan(0.2);
  });

  it('mapeia perguntas sobre biblioteca com foco em cannabis', () => {
    const intent = detectIntent('Preciso consultar a biblioteca sobre cannabis medicinal para dor crônica.');
    expect(intent.type).toBe('KNOWLEDGE');
    expect(intent.domain).toBe('cannabis');
  });

  it('reconhece comandos para simulações clínicas', () => {
    const intent = detectIntent('Atualize as simulações de pacientes nefro em andamento.');
    expect(intent.type).toBe('SIMULATION');
    expect(intent.domain).toBe('nefrologia');
  });

  it('realiza fallback IMRE quando sem palavras-chave explícitas mas com contexto clínico', () => {
    const intent = detectIntent('Paciente em dor crônica precisa de análise IMRE triaxial.');
    expect(intent.type).toBe('IMRE_ANALYSIS');
  });

  it('retorna unknown para mensagem vazia', () => {
    const intent = detectIntent('   ');
    expect(intent.type).toBe('UNKNOWN');
    expect(intent.confidence).toBe(0);
  });
});
