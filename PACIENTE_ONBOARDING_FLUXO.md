# Fluxo de Cadastro de Pacientes - MedCannLab

## Visão Geral

O sistema possui **dois fluxos distintos** para cadastro de pacientes:

## 1. Cadastro Manual (Profissional) - `/app/new-patient`

**Quem usa:** Profissionais (Dr. Ricardo Valença, Dr. Eduardo Faveret)

**Quando usar:**
- Importar pacientes de outros prontuários eletrônicos
- Cadastrar pacientes com documentos em lote
- Registrar pacientes que não possuem acesso digital
- Migrar base de pacientes existente

**Características:**
- 3 etapas (Dados Pessoais → Atendimento → Documentos)
- Upload em lote de arquivos (PDFs, DOCs, imagens, etc.)
- Seleção de profissional responsável
- Especialidade e sala
- Observações iniciais

**Acesso:** Botão "Novo Paciente" no Prontuário Eletrônico (`/app/patients`)

---

## 2. Cadastro Automático (Paciente) - `/patient-onboarding`

**Quem usa:** Pacientes (primeira vez acessando a plataforma)

**Quando usar:**
- Paciente já possui conta na plataforma
- Acesso através do Dashboard do Paciente
- Processo de onboarding completo

**Fluxo atual:**
1. NFT Escute-se (filme introdutório)
2. Consentimento Informado
3. Valores da Plataforma
4. Iniciar Avaliação Clínica (IMRE)

**Características:**
- Sistema coleta dados automaticamente do perfil do usuário
- Não requer re-digitação de informações básicas
- Foco no onboarding e avaliação clínica inicial

**Acesso:** Após login como paciente → Dashboard do Paciente → botão de avaliação clínica

---

## Fluxo de Agendamento

**Cenário:** Paciente novo quer agendar uma consulta

### Opção 1: Paciente já tem conta
1. Acessa com suas credenciais
2. Vai para Dashboard do Paciente
3. Clica em "Agendamento" ou "Agenda"
4. Seleciona profissional (Dr. Ricardo ou Dr. Eduardo)
5. Escolhe data e horário
6. Sistema usa dados já cadastrados (nome, email, telefone)

### Opção 2: Paciente não tem conta
1. Cria conta na landing page
2. Realiza onboarding completo (NFT + Consentimento + Valores)
3. Dados pessoais são salvos automaticamente
4. Pode agendar consulta normalmente

### Opção 3: Profissional cadastra
1. Dr. Ricardo ou Dr. Eduardo acessa Prontuário Eletrônico
2. Clica em "Novo Paciente"
3. Preenche dados + upload de documentos
4. Paciente pode ou não receber credenciais de acesso
5. Se receber, pode agendar consultas online

---

## Dados Necessários

### Dados Coletados Automaticamente (Onboarding):
- Email (usuário)
- Nome completo (usuário)
- Data de nascimento (opcional no perfil)
- Telefone (opcional no perfil)

### Dados Coletados no Cadastro Manual:
- Nome completo *
- CPF *
- Email
- Telefone *
- Data de nascimento
- Sexo
- Endereço completo
- Profissional responsável *
- Especialidade *
- Sala
- Médico encaminhador
- Observações iniciais

---

## Recomendações

1. **Para profissionais:** Use cadastro manual para importar pacientes e documentos
2. **Para pacientes:** Forneça instruções de criação de conta e agendamento
3. **Email informativo:** Enviar email ao paciente após cadastro manual com:
   - Link para criar conta
   - Credenciais temporárias
   - Tutorial de como usar a plataforma
4. **Integração futura:** Integrar cadastro manual com agendamento automático

---

## Próximos Passos Sugeridos

1. ✅ Cadastro manual implementado
2. ⏳ Email automático ao paciente após cadastro profissional
3. ⏳ Integração de dados do cadastro manual com agendamento
4. ⏳ Opção de enviar convite para o paciente criar conta
5. ⏳ Sincronização de documentos entre cadastros
