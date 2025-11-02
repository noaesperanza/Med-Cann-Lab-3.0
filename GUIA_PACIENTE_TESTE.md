# 🔄 ALTERAÇÃO DE USUÁRIO PARA PACIENTE TESTE

## 📋 Objetivo
Alterar o usuário `profrvalenca@gmail.com` de profissional para paciente, tornando-o o paciente teste do Dr. Eduardo Faveret.

## 🎯 Funcionalidades que serão testadas:
- ✅ Chat entre Dr. Eduardo e paciente teste
- ✅ Relatórios compartilhados pelo paciente
- ✅ Prontuário integrado com conversas
- ✅ Sistema de avaliações clínicas
- ✅ Integração com KPIs do dashboard

## 📝 Passos para Execução:

### 1. Acessar Supabase Dashboard
- Ir para: https://supabase.com/dashboard
- Selecionar o projeto: `medcannlab-3.0`

### 2. Executar SQL
- Ir para: **SQL Editor**
- Copiar e colar o conteúdo do arquivo `ALTERAR_USUARIO_PACIENTE_TESTE.sql`
- Executar o script

### 3. Verificar Alteração
- Ir para: **Authentication** → **Users**
- Buscar por: `profrvalenca@gmail.com`
- Verificar se o tipo mudou para `patient`

### 4. Testar Login
- Fazer logout do sistema atual
- Fazer login com:
  - **Email:** `profrvalenca@gmail.com`
  - **Senha:** `123456`
- Verificar se redireciona para dashboard de paciente

## 🔍 Dados do Paciente Teste Criados:

### Informações Pessoais:
- **Nome:** Paciente Teste
- **Idade:** 35 anos
- **CPF:** 123.456.789-00
- **Telefone:** (11) 99999-9999
- **Condição:** Epilepsia refratária

### Avaliações Clínicas:
1. **Avaliação IMRE** (15 dias atrás)
   - Status: Concluída
   - Melhora: Sim
   - Medicação: CBD 10mg/dia

2. **Avaliação AEC** (7 dias atrás)
   - Status: Concluída
   - Melhora: Sim
   - Medicação: CBD 10mg/dia + THC 2mg/dia

## 🧪 Cenários de Teste:

### 1. Chat com Paciente
- Dr. Eduardo acessa "Chat com Pacientes"
- Seleciona "Paciente Teste"
- Inicia conversa
- Verifica se mensagens são arquivadas no prontuário

### 2. Relatórios Compartilhados
- Paciente Teste faz login
- Acessa avaliação clínica inicial
- Compartilha relatório com Dr. Eduardo
- Dr. Eduardo visualiza na página de Relatórios

### 3. Prontuário Integrado
- Verificar se conversas aparecem no prontuário
- Verificar se relatórios estão integrados
- Verificar dados de wearables (simulados)

### 4. KPIs Atualizados
- Verificar se os cards do dashboard refletem os dados do paciente teste
- Verificar contadores de pacientes, avaliações, etc.

## ⚠️ Importante:
- O usuário `profrvalenca@gmail.com` agora será um **paciente**
- Ele aparecerá na lista de pacientes do Dr. Eduardo
- Todas as conversas serão arquivadas no prontuário
- Os relatórios serão compartilhados automaticamente

## 🎉 Resultado Esperado:
Sistema completo de comunicação e prontuário integrado funcionando entre Dr. Eduardo Faveret e Paciente Teste!
