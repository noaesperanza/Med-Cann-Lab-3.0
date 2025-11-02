# Centralização de Contato com Paciente

## Objetivo
Centralizar **TODO** contato com o paciente em um único documento/prontuário, incluindo:
- Relatórios de avaliação inicial (IMRE)
- Mensagens de chat via plataforma
- Chamadas de vídeo/áudio
- Anotações clínicas do médico
- Documentos compartilhados pelo paciente

## Estrutura de Dados

### Tabela: `clinical_assessments`
Armazena todos os contatos e avaliações do paciente.

```sql
CREATE TABLE clinical_assessments (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id),
  doctor_id UUID REFERENCES auth.users(id),
  assessment_type TEXT, -- 'IMRE', 'AEC', 'CONSULTA', 'CHAT', 'CALL'
  status TEXT, -- 'completed', 'in_progress', 'pending'
  data JSONB, -- Dados da avaliação (queixas, medicações, etc)
  clinical_report TEXT, -- Relatório formatado
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Tabela: `patient_interactions` (A CRIAR)
Registra todas as interações com o paciente.

```sql
CREATE TABLE patient_interactions (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id),
  doctor_id UUID REFERENCES auth.users(id),
  interaction_type TEXT, -- 'CHAT', 'CALL', 'NOTE', 'DOCUMENT'
  content TEXT, -- Mensagem, anotação, etc
  metadata JSONB, -- Duração, arquivo, etc
  created_at TIMESTAMP
);
```

## Fluxo de Funcionamento

### 1. Relatório de Avaliação Inicial (IMRE)
- Paciente completa o questionário
- IA gera relatório em `clinical_report`
- Relatório aparece na área de atendimento
- Botões disponíveis: Ver, Download, Compartilhar

### 2. Chat com Paciente
- Médico ou paciente envia mensagem
- Mensagem é salva em `patient_interactions`
- Exibida no histórico do paciente
- Integrada ao relatório geral

### 3. Chamada de Vídeo/Áudio
- Iniciada pelo botão de vídeo ou áudio
- Duração da chamada registrada
- Transcrição (se disponível) salva em `patient_interactions`
- Nota clínica pode ser adicionada

### 4. Anotações Clínicas
- Médico digita notas durante atendimento
- Salvas no campo "Notas Clínicas"
- Integradas ao prontuário do paciente

## Interface do Usuário

### Cards de Status
- **Total de Pacientes**: Número total de pacientes cadastrados
- **Agendamentos Hoje**: Consultas agendadas para hoje
- **Relatórios Pendentes**: Relatórios que precisam de revisão
- **Ver Todos Pacientes**: Lista completa de pacientes

### Área de Atendimento
- **Lista de Pacientes**: Busca e seleção de pacientes
- **Prontuário**: Exibe informações do paciente selecionado
- **Botões de Comunicação**:
  - 📹 Vídeo: Inicia chamada de vídeo
  - 📞 Áudio: Inicia chamada de áudio
  - 💬 Chat: Abre chat com paciente

### Relatórios Médicos
Para cada avaliação:
- **Ver relatório completo**: Abre em nova janela
- **Download**: Baixa como arquivo .txt
- **Compartilhar**: Compartilha com outro profissional

## Próximos Passos

### Implementações Pendentes

1. **Integração com Zoom** (quando chave API disponível)
   - Substituir componente de vídeo local por SDK do Zoom
   - Registrar automaticamente duração e participação

2. **Sistema de Chat em Tempo Real**
   - Usar Supabase Realtime para mensagens
   - Notificações de novas mensagens
   - Histórico completo de conversas

3. **Transcrição de Chamadas**
   - Integrar com serviço de transcrição (ex: AWS Transcribe)
   - Salvar transcrição em `patient_interactions`
   - Converter para texto pesquisável

4. **Prontuário Eletrônico Completo**
   - Timeline de todos os contatos
   - Filtros por tipo de interação
   - Busca por palavras-chave
   - Exportação completa em PDF

5. **Compartilhamento de Documentos**
   - Upload de exames e imagens
   - Armazenamento no Supabase Storage
   - Controle de acesso por profissional

## Arquivos Relevantes

- `src/pages/ProfessionalDashboard.tsx` - Dashboard principal do profissional
- `src/components/VideoCall.tsx` - Componente de chamada de vídeo/áudio
- `src/pages/PatientDoctorChat.tsx` - Chat entre médico e paciente
- `src/lib/clinicalAssessmentService.ts` - Serviço para avaliações clínicas
- `sql/CLINICAL_ASSESSMENTS.sql` - Schema do banco de dados

## Notas Técnicas

- Todos os dados são armazenados no Supabase
- RLS (Row Level Security) garante privacidade
- Apenas médicos com relação ao paciente podem ver dados
- Histórico completo e imutável (append-only)
- Backup automático pelo Supabase
