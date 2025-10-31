# Nôa Esperança · MedCannLab 3.0

Interface conversacional clínica com foco em cannabis medicinal e nefrologia, integrada aos principais fluxos da plataforma MedCannLab 3.0 e à metodologia IMRE Triaxial.

## Visão geral

- **Interface única**: componente `NoaConversationalInterface` com suporte a voz e texto, atalhos clínicos e telemetria de endpoints.
- **Orquestração**: hook `useMedCannLabConversation` mantém histórico, trata estados de digitação, aciona o agente e controla reconhecimento de voz.
- **Cliente MedCannLab**: autenticação via `X-API-Key`, renovação automática e auditoria opcional com Supabase.
- **NLP/Agente**: detecção de intenções orientadas a cannabis/nefrologia e geração de respostas empáticas com IMRE.
- **Testes**: Vitest cobre parsing de intenções e cliente HTTP.

## Pré-requisitos

1. Node.js 18+
2. Crie `.env.local` com as variáveis:
   ```bash
   VITE_MEDCANNLAB_API_BASE_URL=https://api.medcannlab.local
   VITE_MEDCANNLAB_API_KEY=chave-teste
   ```
   > Para produção recomenda-se utilizar edge function no Supabase (`medcannlab-api-key`) para recuperar a chave com rotação.

## Scripts

```bash
npm install        # instala dependências
npm run dev        # ambiente de desenvolvimento (http://localhost:5173)
npm run build      # build de produção
npm run preview    # servidor de preview
npm test           # Vitest (nlp + api client)
npm run type-check # verificação TypeScript
```

## Auditoria e Segurança

- `MedCannLabApiClient` adiciona `X-API-Key` em todas as requisições e suporta renovação automática.
- `MedCannLabAuditLogger` envia logs para Supabase (tabela `medcannlab_audit_logs`) quando disponível, com fallback em console.
- Recomenda-se trafegar apenas via HTTPS e restringir a chave a escopo clínico.

## Estrutura

```
src/
├── App.tsx
├── components/
│   ├── NoaConversationalInterface.css
│   └── NoaConversationalInterface.tsx
├── hooks/
│   └── useMedCannLabConversation.ts
├── lib/
│   ├── conversation/
│   │   ├── NoaEsperancaCore.ts
│   │   ├── conversationalAgent.ts
│   │   └── nlp.ts
│   └── medcannlab/
│       ├── MedCannLabAuditLogger.ts
│       ├── __tests__/apiClient.test.ts
│       └── apiClient.ts
├── styles/
│   └── global.css
├── types/
│   ├── conversation.ts
│   └── index.ts
└── lib/conversation/__tests__/nlp.test.ts
```

## Próximos passos sugeridos

- Corrigir eventuais pendências do `npm run type-check` quando novas integrações forem adicionadas.
- Criar pipeline CI com `npm ci`, `npm run lint` (a ser configurado), `npm run type-check` e `npm test`.
- Provisionar tabela `medcannlab_audit_logs` no Supabase e função `medcannlab-api-key` para rotação segura de credenciais.
- Validar fluxos clínicos com especialistas e ajustar o mapeamento de intenções conforme feedback.
