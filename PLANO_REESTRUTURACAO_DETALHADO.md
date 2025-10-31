# 📋 PLANO DE REESTRUTURAÇÃO MEDCANLAB 3.0

## 🎯 **OBJETIVO**
Reestruturar o sistema para seguir exatamente a metodologia Arte da Entrevista Clínica com:
- **3 Eixos**: Ensino, Pesquisa, Clínica
- **3 Tipos de Usuário**: Profissional, Aluno, Paciente  
- **3 Camadas de KPIs**: Administrativos, Semânticos, Clínicos
- **NFT e LGPD** implementados

---

## 📊 **ETAPAS DETALHADAS**

### **🔧 ETAPA 1: CORREÇÃO DE NOMENCLATURA**
**Duração estimada**: 2-3 horas  
**Risco**: Baixo  
**Impacto**: Médio  

#### **Alterações:**
1. **Alterar `student` → `aluno`** em todo sistema
2. **Atualizar tipos de usuário** nos contextos
3. **Corrigir redirecionamentos** e rotas
4. **Atualizar componentes** de navegação
5. **Testar login/registro** com novos tipos

#### **Arquivos a alterar:**
- `src/pages/Login.tsx`
- `src/pages/Landing.tsx` 
- `src/contexts/AuthContext.tsx`
- `src/components/UserTypeNavigation.tsx`
- `src/App.tsx`
- `src/pages/StudentDashboard.tsx` → `AlunoDashboard.tsx`

#### **Critérios de sucesso:**
- ✅ Login funciona com tipo `aluno`
- ✅ Redirecionamento correto para `/app/aluno-dashboard`
- ✅ Navegação atualizada
- ✅ Sem erros de console

---

### **🛣️ ETAPA 2: ESTRUTURAÇÃO DE ROTAS**
**Duração estimada**: 4-5 horas  
**Risco**: Médio  
**Impacto**: Alto  

#### **Alterações:**
1. **Implementar rotas estruturadas**: `/eixo/{ensino|pesquisa|clinica}/tipo/{profissional|aluno|paciente}`
2. **Reorganizar navegação** por eixo e tipo
3. **Criar middleware** de roteamento
4. **Implementar breadcrumbs** de navegação
5. **Testar todos os fluxos** de navegação

#### **Arquivos a alterar:**
- `src/App.tsx` - Nova estrutura de rotas
- `src/components/Layout.tsx` - Breadcrumbs
- `src/components/Sidebar.tsx` - Navegação por eixo
- `src/components/UserTypeNavigation.tsx` - Seleção de eixo/tipo
- Criar `src/components/EixoNavigation.tsx`

#### **Critérios de sucesso:**
- ✅ Rotas funcionam: `/eixo/clinica/tipo/paciente`
- ✅ Navegação clara por eixo e tipo
- ✅ Breadcrumbs funcionando
- ✅ Todos os dashboards acessíveis

---

### **🔗 ETAPA 3: NFT E BLOCKCHAIN**
**Duração estimada**: 6-8 horas  
**Risco**: Alto  
**Impacto**: Alto  

#### **Alterações:**
1. **Implementar geração de NFT** para relatórios
2. **Sistema de blockchain** para propriedade
3. **Controle de transferência** de NFTs
4. **Integração com avaliação clínica**
5. **Dashboard de NFTs** do usuário

#### **Arquivos a criar/alterar:**
- `src/lib/nftService.ts` - Serviço de NFT
- `src/lib/blockchainService.ts` - Blockchain
- `src/components/NFTGenerator.tsx` - Geração de NFT
- `src/pages/NFTDashboard.tsx` - Dashboard de NFTs
- `src/pages/ClinicalAssessment.tsx` - Integração NFT

#### **Critérios de sucesso:**
- ✅ NFT gerado após avaliação clínica
- ✅ Propriedade controlada por blockchain
- ✅ Transferência de NFTs funcionando
- ✅ Dashboard de NFTs implementado

---

### **🔒 ETAPA 4: LGPD E COMPARTILHAMENTO**
**Duração estimada**: 5-6 horas  
**Risco**: Médio  
**Impacto**: Alto  

#### **Alterações:**
1. **Sistema de permissões** por eixo
2. **Controle de compartilhamento** de dados
3. **Consentimento granular** do usuário
4. **Auditoria de acesso** aos dados
5. **Interface de gerenciamento** de privacidade

#### **Arquivos a criar/alterar:**
- `src/lib/lgpdService.ts` - Serviço LGPD
- `src/components/PermissionManager.tsx` - Gerenciador de permissões
- `src/components/DataSharing.tsx` - Compartilhamento de dados
- `src/pages/PrivacyDashboard.tsx` - Dashboard de privacidade
- `src/lib/auditService.ts` - Auditoria

#### **Critérios de sucesso:**
- ✅ Permissões por eixo funcionando
- ✅ Compartilhamento controlado
- ✅ Consentimento granular implementado
- ✅ Auditoria de acesso ativa

---

### **📊 ETAPA 5: KPIs ESTRUTURADOS**
**Duração estimada**: 4-5 horas  
**Risco**: Baixo  
**Impacto**: Médio  

#### **Alterações:**
1. **Separar KPIs em 3 camadas**: Administrativos, Semânticos, Clínicos
2. **KPIs específicos por eixo + tipo** de usuário
3. **Dashboard consolidado** de KPIs
4. **Relatórios automáticos** por camada
5. **Visualizações avançadas** de dados

#### **Arquivos a criar/alterar:**
- `src/lib/kpiService.ts` - Serviço de KPIs
- `src/components/KPILayer.tsx` - Componente de camada
- `src/pages/KPIDashboard.tsx` - Dashboard consolidado
- `src/components/KPIChart.tsx` - Gráficos de KPIs
- `src/lib/reportService.ts` - Relatórios automáticos

#### **Critérios de sucesso:**
- ✅ 3 camadas de KPIs implementadas
- ✅ KPIs específicos por eixo/tipo
- ✅ Dashboard consolidado funcionando
- ✅ Relatórios automáticos gerados

---

## 🎯 **FLUXO CLÍNICO ESPECÍFICO**

### **Rota Específica:**
`/eixo/clinica/tipo/paciente` → Avaliação Clínica Inicial

### **Processo:**
1. **Paciente acessa** rota específica
2. **Realiza avaliação** clínica inicial
3. **Sistema gera NFT** do relatório
4. **LGPD controla** compartilhamento
5. **KPIs atualizados** em todas as camadas

---

## 📋 **CRITÉRIOS DE AVALIAÇÃO**

### **✅ Sucesso da Etapa:**
- Funcionalidade implementada sem quebrar sistema existente
- Testes passando
- Documentação atualizada
- Checkpoint criado

### **❌ Falha da Etapa:**
- Sistema quebrado
- Funcionalidades existentes afetadas
- Erros críticos não resolvidos

### **🔄 Rollback:**
- Voltar ao checkpoint anterior
- Analisar causa da falha
- Ajustar plano
- Tentar novamente

---

## 🎉 **RESULTADO FINAL ESPERADO**

### **Estrutura Correta:**
- ✅ 3 Eixos: Ensino, Pesquisa, Clínica
- ✅ 3 Tipos: Profissional, Aluno, Paciente
- ✅ 3 Camadas KPIs: Administrativos, Semânticos, Clínicos
- ✅ NFT e Blockchain implementados
- ✅ LGPD e compartilhamento controlado
- ✅ Fluxo clínico específico funcionando

### **Sistema Funcional:**
- ✅ Todas as funcionalidades existentes mantidas
- ✅ Nova estrutura implementada
- ✅ Metodologia AEC seguida corretamente
- ✅ Plataforma pronta para produção

---

**Este plano garante alterações controladas e seguras, com pontos de retorno em cada etapa.**
