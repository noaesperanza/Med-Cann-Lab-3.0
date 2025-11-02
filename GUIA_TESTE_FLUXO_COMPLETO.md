# 🧪 Guia de Teste - Fluxo Completo MedCannLab

## 📋 Pré-requisitos

### 1. **Configurar Banco de Dados**
Execute os scripts SQL no Supabase (SQL Editor):

```sql
-- 1. Criar tabela de avaliações clínicas
-- Execute: CREATE_CLINICAL_ASSESSMENTS_TABLE.sql

-- 2. Inserir dados de teste
-- Execute: INSERT_TEST_PATIENTS.sql
```

### 2. **Configurar Variáveis de Ambiente**
No arquivo `.env`:
```env
VITE_OPENAI_API_KEY=sua_chave_openai_aqui
```

## 🎯 Fluxo de Teste Completo

### **FASE 1: PACIENTE - AVALIAÇÃO CLÍNICA**

#### 1. **Login do Paciente**
- Acesse: `http://localhost:5173`
- Clique em "Entrar"
- Use: `maria.silva@test.com` / `123456`
- Ou: `joao.santos@test.com` / `123456`

#### 2. **Onboarding do Paciente**
- Será redirecionado para `/patient-onboarding`
- **Passo 1:** NFT Escute-se - Clique "Continuar"
- **Passo 2:** Consentimento Informado - Marque checkbox e "Continuar"
- **Passo 3:** Valores da Plataforma - Clique "Continuar"
- **Passo 4:** Iniciar Avaliação Clínica - Clique "Iniciar Avaliação"

#### 3. **Chat com Nôa Esperança**
- Será redirecionado para `/app/chat-noa-esperanca`
- A IA Nôa Esperança iniciará a conversa
- **Responda as perguntas da avaliação IMRE:**
  - "Olá! Eu sou a Nôa Esperança. Por favor, apresente-se e diga em que posso ajudar hoje."
  - Responda: "Olá, sou Maria Silva, tenho dor de cabeça e insônia"
  - Continue respondendo as perguntas da IA
  - A IA fará perguntas sobre:
    - Queixas principais
    - Intensidade e duração
    - Medicações atuais
    - Alergias
    - Histórico familiar
    - Estilo de vida

#### 4. **Finalização da Avaliação**
- Quando a IA disser algo como "relatório concluído" ou "avaliação finalizada"
- O sistema salvará automaticamente no banco de dados
- Você verá uma mensagem de confirmação

### **FASE 2: PROFISSIONAL - VISUALIZAÇÃO**

#### 1. **Login do Profissional**
- Acesse: `http://localhost:5173`
- Clique em "Entrar"
- Use: `ricardo.valenca@medcannlab.com` / `123456`

#### 2. **Dashboard Profissional**
- Será redirecionado para `/app/professional-dashboard`
- **Área de Atendimento** será exibida
- **Lista de Pacientes** (lado esquerdo):
  - Maria Silva
  - João Santos

#### 3. **Selecionar Paciente**
- Clique em "Maria Silva" na lista
- **Prontuário do Paciente** será exibido (lado direito):
  - Header com dados do paciente
  - Botões de vídeo/áudio/chat
  - Campo de notas clínicas
  - Documentos compartilhados
  - **Relatórios Médicos** com as avaliações salvas

#### 4. **Visualizar Relatório**
- Na seção "Relatórios Médicos"
- Clique em "📄 Ver relatório completo"
- O relatório será aberto em nova janela
- Verifique se contém:
  - Dados do paciente
  - Queixas principais
  - Medicações
  - Alergias
  - Histórico familiar
  - Recomendações

### **FASE 3: CHAT PROFISSIONAL ↔ PACIENTE**

#### 1. **Iniciar Chat**
- No dashboard profissional
- Com paciente selecionado
- Clique no botão "Chat" (ícone MessageCircle)
- Ou acesse diretamente: `/app/patient-chat`

#### 2. **Conversa**
- Profissional pode enviar mensagens
- Paciente pode responder
- Histórico da conversa é mantido

## 🔍 Verificações Importantes

### **No Banco de Dados (Supabase)**
```sql
-- Verificar avaliações salvas
SELECT * FROM clinical_assessments ORDER BY created_at DESC;

-- Verificar dados específicos
SELECT 
  patient_id,
  assessment_type,
  status,
  data->>'complaintList' as queixas,
  data->>'medications' as medicacoes,
  created_at
FROM clinical_assessments;
```

### **No Console do Navegador**
- Abra DevTools (F12)
- Verifique logs:
  - "✅ Relatório clínico salvo com sucesso"
  - "🧠 Processando mensagem com IA Residente"
  - "✅ Resposta da IA Residente"

### **Funcionalidades Testadas**
- ✅ Login de paciente e profissional
- ✅ Onboarding completo do paciente
- ✅ Chat com IA Nôa Esperança
- ✅ Salvamento automático da avaliação
- ✅ Visualização no dashboard profissional
- ✅ Abertura de relatórios
- ✅ Busca de pacientes
- ✅ Interface responsiva

## 🚨 Solução de Problemas

### **Erro: "Tabela não existe"**
- Execute o script `CREATE_CLINICAL_ASSESSMENTS_TABLE.sql`

### **Erro: "Nenhum paciente encontrado"**
- Execute o script `INSERT_TEST_PATIENTS.sql`

### **IA não responde**
- Verifique se `VITE_OPENAI_API_KEY` está configurada
- Verifique console para erros de API

### **Relatório não aparece**
- Verifique se a avaliação foi salva no banco
- Verifique se o status é 'completed'

## 📊 Resultados Esperados

### **Paciente**
- Conclui onboarding em 4 passos
- Realiza avaliação clínica com IA
- Avaliação é salva automaticamente

### **Profissional**
- Vê lista de pacientes com avaliações
- Pode visualizar relatórios completos
- Pode iniciar chat com pacientes
- Interface funcional para atendimento

### **Sistema**
- Dados persistidos no Supabase
- IA funcionando com GPT-4
- Fluxo completo operacional
- Interface profissional

---

## 🎉 Teste Concluído!

Se todos os passos funcionaram, o sistema está operacional para:
- Avaliações clínicas automatizadas
- Gestão de pacientes
- Relatórios médicos
- Comunicação profissional-paciente
