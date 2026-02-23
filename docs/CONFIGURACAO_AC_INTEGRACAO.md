# 🔐 Configuração de Integração com Autoridades Certificadoras (AC)

**Data:** 06/02/2026  
**Status:** ✅ Estrutura pronta - Aguardando credenciais de AC

---

## 📋 Visão Geral

O sistema de assinatura digital está preparado para integração com múltiplas Autoridades Certificadoras (ACs) ICP-Brasil. Atualmente, a estrutura está implementada para **Soluti** e **Certisign**, com suporte para extensão a outras ACs.

---

## 🏗️ Arquitetura

### Estrutura de Arquivos

```
src/lib/
└── acIntegration.ts          # Interfaces, classes base e factory

supabase/functions/
└── digital-signature/
    └── index.ts              # Edge Function (usa integração AC)
```

### Padrões Utilizados

- **Factory Pattern**: `getACProvider()` cria instância baseada no nome
- **Strategy Pattern**: Cada AC implementa `ACProviderInterface`
- **Base Class**: `BaseACProvider` fornece funcionalidades comuns

---

## 🔧 Configuração

### Variáveis de Ambiente (Supabase Edge Functions)

Configure as seguintes variáveis de ambiente no Supabase Dashboard:

#### Para Soluti

```bash
AC_PROVIDER=Soluti
AC_API_KEY=seu_api_key_soluti
AC_API_URL=https://api.soluti.com.br/v1
AC_ENVIRONMENT=production  # ou 'sandbox' para testes
```

#### Para Certisign

```bash
AC_PROVIDER=Certisign
AC_API_KEY=seu_api_key_certisign
AC_API_URL=https://api.certisign.com.br/v1
AC_ENVIRONMENT=production  # ou 'sandbox' para testes
```

### Como Configurar no Supabase

1. Acesse o **Supabase Dashboard**
2. Vá em **Edge Functions** → **digital-signature**
3. Clique em **Settings** → **Secrets**
4. Adicione as variáveis de ambiente acima

---

## 📚 ACs Suportadas

### ✅ Implementadas (estrutura pronta)

- **Soluti** (`SolutiAC`)
- **Certisign** (`CertisignAC`)

### 🔜 Planejadas (estrutura preparada)

- **Valid**
- **Safeweb**
- **Serasa**
- **AC Certificadora**
- **Outro** (genérico)

---

## 🔌 Integração Real

### Status Atual

- ✅ **Estrutura completa** de classes e interfaces
- ✅ **Factory pattern** implementado
- ✅ **Edge Function** preparada para usar integração real
- ⚠️ **Chamadas reais** ainda em modo simulação (aguardando credenciais)

### Próximos Passos para Ativação

1. **Obter credenciais da AC escolhida:**
   - Conta de desenvolvedor
   - API Key / Token
   - Documentação da API

2. **Implementar chamadas reais:**
   - Descomentar e adaptar código em `callACProvider()` na Edge Function
   - Ou implementar métodos em `SolutiAC` / `CertisignAC` em `acIntegration.ts`

3. **Testar em sandbox:**
   - Configurar `AC_ENVIRONMENT=sandbox`
   - Testar assinatura de documento de teste
   - Validar resposta e formato

4. **Ativar em produção:**
   - Configurar `AC_ENVIRONMENT=production`
   - Testar com certificado real
   - Monitorar logs e erros

---

## 📖 Exemplo de Uso

### No Frontend (já implementado)

```typescript
// Prescriptions.tsx já chama a Edge Function
const { data, error } = await supabase.functions.invoke('digital-signature', {
  body: {
    documentId: currentPrescriptionId,
    documentLevel: 'level_3',
    professionalId: user.id,
    userConfirmed: true
  }
})
```

### Na Edge Function (atual)

```typescript
// digital-signature/index.ts
const { signature, validationUrl, validationCode } = await callACProvider(
  certificate,
  documentHash
)
```

### Com Integração Real (futuro)

```typescript
// Quando implementado, callACProvider() usará:
// - SolutiAC.signDocument() ou
// - CertisignAC.signDocument()
// baseado em AC_PROVIDER
```

---

## 🧪 Testes

### Modo Simulação (atual)

O sistema funciona em modo simulação quando:
- Variáveis de ambiente não configuradas
- Ou `AC_ENVIRONMENT=sandbox` sem credenciais válidas

### Modo Real (quando configurado)

O sistema usará integração real quando:
- `AC_PROVIDER` configurado
- `AC_API_KEY` válido
- `AC_API_URL` correto
- Chamadas reais implementadas

---

## 📝 Documentação das ACs

### Soluti

- **Site:** https://www.soluti.com.br
- **Documentação API:** (consultar site oficial)
- **Suporte:** (consultar site oficial)

### Certisign

- **Site:** https://www.certisign.com.br
- **Documentação API:** (consultar site oficial)
- **Suporte:** (consultar site oficial)

---

## ⚠️ Importante

1. **Credenciais Seguras:**
   - Nunca commitar API keys no código
   - Usar apenas variáveis de ambiente do Supabase
   - Rotacionar keys periodicamente

2. **Ambiente de Testes:**
   - Sempre testar em `sandbox` antes de `production`
   - Validar formato de resposta da AC
   - Verificar tratamento de erros

3. **Monitoramento:**
   - Logs da Edge Function
   - Tabela `pki_transactions` (auditoria)
   - Erros de assinatura

---

## 🚀 Status de Implementação

| Item | Status |
|------|--------|
| Estrutura de classes | ✅ Completo |
| Factory pattern | ✅ Completo |
| SolutiAC (estrutura) | ✅ Completo |
| CertisignAC (estrutura) | ✅ Completo |
| Edge Function integrada | ✅ Completo |
| Chamadas reais Soluti | ⏳ Aguardando credenciais |
| Chamadas reais Certisign | ⏳ Aguardando credenciais |
| Testes em sandbox | ⏳ Aguardando credenciais |
| Produção | ⏳ Aguardando credenciais |

---

**Documento criado por:** Sistema de Implementação  
**Última atualização:** 06/02/2026
