# 🏥 MedCannLab 3.0 - Sistema Integrado de Cannabis Medicinal

## 🎯 Visão Geral
Sistema completo de gestão clínica integrando IA residente (Nôa Esperança) com protocolo IMRE para avaliações clínicas de Cannabis Medicinal.

## 🚀 Funcionalidades Implementadas

### ✅ Sistema de Relatórios Clínicos
- **IA Individualizada**: Avaliações personalizadas por paciente
- **Protocolo IMRE**: Investigação, Metodologia, Resultado, Evolução
- **Geração Automática**: Relatórios criados pela IA residente
- **Dashboard do Paciente**: Visualização de relatórios
- **Notificações**: Alertas para profissionais
- **Contagem de Métricas**: Sistema de KPIs operacional

### 🗣️ Interface Conversacional Nôa Esperança 3.0
- **Assistente Multimodal**: interação por texto e voz, com escuta ativa e respostas empáticas alinhadas ao protocolo IMRE.
- **Integração direta com MedCannLab**: consumo dos endpoints `/platform/status`, `/training/context`, `/patients/simulations` e `/knowledge/library` via `X-API-Key` segura.
- **NLP clínico especializado**: identificação de intenções em nefrologia e cannabis medicinal, com mapeamento automático para comandos clínicos e acesso à biblioteca.
- **Contexto persistente**: retomada de conversas, histórico clínico e análise triaxial (somático, psíquico e social) dentro da própria interface.
- **Interface acessível**: componente único `NoaConversationalInterface` presente em todas as rotas protegidas, eliminando o uso manual do cursor.

### ✅ Infraestrutura
- **Frontend**: React + Vite (Porta 3001)
- **Backend**: Node.js (Porta 3002)
- **Database**: PostgreSQL (Porta 5432)
- **Cloud**: Supabase (BaaS)
- **Segurança**: RLS (Row Level Security)

## 🎯 Rota Mais Importante
**Avaliação Clínica Inicial com IA Resident**
- Individualizada por paciente
- Protocolo IMRE automatizado
- Relatórios salvos automaticamente
- Sistema de notificações ativo

## 📊 Status do Sistema
- ✅ **100% Funcional**
- ✅ **Testado e Validado**
- ✅ **Pronto para Produção**
- ✅ **Documentado**

## 🔧 Tecnologias
- React + TypeScript
- Supabase (PostgreSQL + Auth)
- Tailwind CSS
- Vite
- Node.js

## 🔐 Configuração da API MedCannLab
Para habilitar a interface conversacional diretamente na plataforma:

1. Defina as variáveis de ambiente no frontend (`.env.local`):
   ```bash
   VITE_MEDCANNLAB_API_URL="https://api.medcannlab.com"
   VITE_MEDCANNLAB_API_KEY="chave_temporaria"
   ```
2. (Recomendado) Exponha função segura no Supabase (`medcannlab-api-key`) para emitir/renovar a `X-API-Key`. O client (`MedCannLabApiKeyManager`) tentará usar essa função antes de recorrer ao fallback em variáveis de ambiente.
3. Garanta que as respostas dos endpoints estejam em JSON e com HTTPS habilitado. A camada de cliente trata automaticamente timeouts (20s), renovação de chave em 401 e logs de auditoria.

## 🧪 Testes e Integração Contínua
- **Framework**: [Vitest](https://vitest.dev/) com relatório de cobertura (`npm test`).
- **Suites atuais**:
  - `src/lib/medcannlab/__tests__/apiClient.test.ts`: garante cabeçalhos `X-API-Key` e construção correta de URLs.
  - `src/lib/medcannlab/__tests__/nlp.test.ts`: valida parser de intenções clínicas, detecção de foco (nefrologia/cannabis) e mapeamento IMRE.
- **CI sugerido**:
  - Executar `npm ci` + `npm run lint` + `npm run type-check` + `npm test`.
  - Falhas em auditoria (ex.: ausência da tabela `medcannlab_audit_logs`) não interrompem fluxos — são registrados como *warnings* para configuração posterior.

## 🛡️ Auditoria e Privacidade
- Todas as chamadas ao MedCannLab são logadas via `MedCannLabAuditLogger` no Supabase (`medcannlab_audit_logs`).
- Caso a tabela não exista, o sistema faz fallback para logs locais sem interromper o atendimento.
- Tráfego sempre em HTTPS + `X-API-Key`; tokens jamais são armazenados em `localStorage`, permanecendo apenas em memória.

## 🎙️ Comandos Clínicos Sugeridos
- “Nôa, qual é o status da plataforma agora?”
- “Mostre o contexto de treinamento recente focado em nefrologia.”
- “Inicie a simulação clínica renal com abordagem IMRE completa.”
- “Busque protocolos atualizados de cannabis medicinal para pacientes em diálise.”

## 📝 Última Atualização
Sistema consolidado com IA individualizada e relatórios clínicos automatizados.

---
**🎉 Estado da Arte - MedCannLab 3.0**
