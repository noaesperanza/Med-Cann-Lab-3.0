import { describe, expect, it } from 'vitest'
import { parseIntent } from '../nlp'

describe('MedCannLab NLP Intent Parsing', () => {
  it('identifica comandos de status da plataforma', () => {
    const result = parseIntent('Nôa, qual é o status atual da plataforma?')

    expect(result.intent).toBe('CHECK_STATUS')
    expect(result.confidence).toBeGreaterThanOrEqual(0.3)
    expect(result.isClinicalCommand).toBe(true)
  })

  it('detecta foco em cannabis medicinal para biblioteca', () => {
    const result = parseIntent('Preciso de protocolos de cannabis medicinal para pacientes em diálise')

    expect(result.intent).toBe('ACCESS_LIBRARY')
    expect(result.focusArea).toBe('cannabis')
  })

  it('interpreta pedidos de simulação clínica renal', () => {
    const result = parseIntent('Inicie a simulação clínica renal avançada com todos os dados')

    expect(result.intent).toBe('MANAGE_SIMULATION')
    expect(result.entities).toEqual({})
    expect(result.focusArea).toBe('nefrologia')
  })

  it('mapeia eixos IMRE mencionados explicitamente', () => {
    const result = parseIntent('Quero análise IMRE com foco somático e social deste caso clínico')

    expect(result.intent).toBe('IMRE_ANALYSIS')
    expect(result.axes).toEqual(expect.arrayContaining(['somatico', 'social']))
  })
})

