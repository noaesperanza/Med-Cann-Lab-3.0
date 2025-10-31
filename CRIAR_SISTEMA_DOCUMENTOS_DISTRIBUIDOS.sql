-- Script para criar sistema de documentos distribuídos e críticos
-- Execute este script no Supabase SQL Editor

-- 1. TABELA DE DOCUMENTOS CRÍTICOS PARA IA
CREATE TABLE IF NOT EXISTS critical_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('protocol', 'guideline', 'research', 'case-study', 'methodology')),
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  lastUpdated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  aiRelevance DECIMAL(3,2) DEFAULT 0.5 CHECK (aiRelevance >= 0 AND aiRelevance <= 1),
  tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  isActive BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE NOTIFICAÇÕES PARA IA
CREATE TABLE IF NOT EXISTS ai_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  document_id UUID,
  message TEXT NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ATUALIZAR TABELA DOCUMENTS PARA SUPORTAR CONTEÚDO
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS aiRelevance DECIMAL(3,2) DEFAULT 0.5 CHECK (aiRelevance >= 0 AND aiRelevance <= 1),
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low'));

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_critical_documents_category ON critical_documents(category);
CREATE INDEX IF NOT EXISTS idx_critical_documents_priority ON critical_documents(priority);
CREATE INDEX IF NOT EXISTS idx_critical_documents_active ON critical_documents(isActive);
CREATE INDEX IF NOT EXISTS idx_critical_documents_relevance ON critical_documents(aiRelevance DESC);
CREATE INDEX IF NOT EXISTS idx_critical_documents_tags ON critical_documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_critical_documents_keywords ON critical_documents USING GIN(keywords);

CREATE INDEX IF NOT EXISTS idx_ai_notifications_type ON ai_notifications(type);
CREATE INDEX IF NOT EXISTS idx_ai_notifications_processed ON ai_notifications(processed);
CREATE INDEX IF NOT EXISTS idx_ai_notifications_created ON ai_notifications(created_at DESC);

-- 5. FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. TRIGGERS PARA ATUALIZAR updated_at
CREATE TRIGGER update_critical_documents_updated_at 
    BEFORE UPDATE ON critical_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. INSERIR DOCUMENTOS CRÍTICOS INICIAIS PARA DESENVOLVIMENTO
INSERT INTO critical_documents (title, content, category, priority, aiRelevance, tags, keywords, isActive) VALUES

-- Protocolo AEC - Documento Crítico
(
  'Metodologia AEC - Arte da Entrevista Clínica (CRÍTICO)',
  'A Arte da Entrevista Clínica (AEC) é uma metodologia desenvolvida pelo Dr. Eduardo Faveret para humanização do atendimento médico. 

PRINCÍPIOS FUNDAMENTAIS:
1. Escuta Ativa: Ouvir além das palavras, captar emoções e necessidades
2. Presença Integral: Estar completamente presente no momento da consulta
3. Comunicação Empática: Conectar-se genuinamente com o paciente
4. Abordagem Holística: Considerar aspectos físicos, emocionais e sociais

TÉCNICAS PRINCIPAIS:
- Perguntas abertas para explorar o contexto
- Validação emocional das experiências do paciente
- Uso de linguagem acessível e respeitosa
- Registro narrativo das consultas

APLICAÇÃO EM CANNABIS MEDICINAL:
- Avaliar motivação real do paciente
- Identificar expectativas e medos
- Estabelecer relação de confiança
- Documentar evolução terapêutica

Este documento é CRÍTICO para o treinamento da IA Nôa Esperança.',
  'methodology',
  'high',
  0.95,
  ARRAY['AEC', 'Entrevista', 'Humanização', 'Crítico', 'IA'],
  ARRAY['AEC', 'Entrevista', 'Humanização', 'Metodologia', 'Cannabis', 'IA'],
  true
),

-- Protocolo IMRE - Documento Crítico
(
  'Protocolo IMRE Triaxial - Avaliação Clínica (CRÍTICO)',
  'O Protocolo IMRE (Indicação, Motivação, Resultados Esperados) é um método triaxial para avaliação clínica integral.

ESTRUTURA TRIAXIAL:

1. EIXO INDICAÇÃO (I):
   - Diagnóstico principal e secundários
   - Comorbidades relevantes
   - Fatores de risco identificados
   - Histórico médico detalhado

2. EIXO MOTIVAÇÃO (M):
   - Expectativas do paciente
   - Experiências prévias com tratamentos
   - Medos e preocupações
   - Suporte familiar e social

3. EIXO RESULTADOS ESPERADOS (R):
   - Objetivos terapêuticos definidos
   - Marcadores de melhora
   - Timeline de avaliação
   - Critérios de sucesso

APLICAÇÃO EM CANNABIS MEDICINAL:
- Avaliar indicação clínica precisa
- Compreender motivação real do paciente
- Estabelecer resultados esperados realistas
- Monitorar evolução nos três eixos

28 BLOCOS SEMÂNTICOS:
O protocolo inclui 28 blocos semânticos para análise completa do caso clínico.

Este documento é CRÍTICO para avaliações clínicas da IA.',
  'protocol',
  'high',
  0.95,
  ARRAY['IMRE', 'Protocolo', 'Avaliação', 'Triaxial', 'Crítico'],
  ARRAY['IMRE', 'Protocolo', 'Avaliação', 'Triaxial', 'Cannabis', 'Clínica'],
  true
),

-- Diretrizes Cannabis - Documento Crítico
(
  'Diretrizes Cannabis Medicinal - ANVISA (CRÍTICO)',
  'DIRETRIZES OFICIAIS DA ANVISA PARA CANNABIS MEDICINAL NO BRASIL

INDICAÇÕES APROVADAS:
- Epilepsia refratária
- Dor crônica
- Espasticidade em esclerose múltipla
- Náusea e vômito em quimioterapia
- Anorexia em pacientes com AIDS

REQUISITOS PARA PRESCRIÇÃO:
1. Médico com CRM ativo
2. Diagnóstico confirmado
3. Falha em tratamentos convencionais
4. Consentimento informado
5. Acompanhamento regular

PRODUTOS AUTORIZADOS:
- CBD isolado
- THC isolado
- Produtos combinados CBD/THC
- Produtos importados com registro ANVISA

DOSAGEM E TITULAÇÃO:
- Início com doses baixas
- Titulação gradual
- Monitoramento de efeitos
- Ajuste conforme resposta

CONTRAINDICAÇÕES:
- Gravidez e lactação
- Psicose ativa
- Dependência química ativa
- Alergia conhecida aos componentes

MONITORAMENTO:
- Consultas regulares
- Avaliação de efeitos
- Exames laboratoriais
- Registro de eventos adversos

Este documento é CRÍTICO para prescrições seguras.',
  'guideline',
  'high',
  0.90,
  ARRAY['ANVISA', 'Diretrizes', 'Cannabis', 'Prescrição', 'Crítico'],
  ARRAY['ANVISA', 'Diretrizes', 'Cannabis', 'Prescrição', 'Brasil', 'Segurança'],
  true
),

-- Caso Clínico Crítico
(
  'Caso Clínico Crítico - Epilepsia Refratária',
  'CASO CLÍNICO: Paciente de 8 anos com epilepsia refratária tratada com cannabis medicinal

HISTÓRICO:
- Diagnóstico: Síndrome de Dravet aos 2 anos
- Crises: 15-20 por dia (tônico-clônicas generalizadas)
- Tratamentos prévios: 8 antiepilépticos sem sucesso
- Desenvolvimento: Atraso neuropsicomotor significativo

INTERVENÇÃO COM CANNABIS:
- Produto: CBD isolado (Epidiolex)
- Dosagem inicial: 5mg/kg/dia
- Titulação: Aumento de 2,5mg/kg a cada 2 semanas
- Dosagem final: 20mg/kg/dia

RESULTADOS:
- Redução de 80% nas crises em 3 meses
- Melhora na qualidade do sono
- Redução da irritabilidade
- Melhora na interação social

MONITORAMENTO:
- Consultas mensais
- EEG trimestral
- Avaliação neuropsicológica
- Exames laboratoriais

LIÇÕES APRENDIDAS:
- Importância da titulação gradual
- Necessidade de acompanhamento multidisciplinar
- Registro detalhado de evolução
- Suporte familiar essencial

Este caso é CRÍTICO para compreensão da eficácia.',
  'case-study',
  'high',
  0.85,
  ARRAY['Caso', 'Clínico', 'Epilepsia', 'CBD', 'Crítico'],
  ARRAY['Caso', 'Clínico', 'Epilepsia', 'CBD', 'Pediatria', 'Eficácia'],
  true
),

-- Documento de Desenvolvimento Atual
(
  'Atualização Sistema MedCannLab - Janeiro 2025',
  'ATUALIZAÇÕES CRÍTICAS DO SISTEMA MEDCANLAB - JANEIRO 2025

MUDANÇAS IMPLEMENTADAS:
1. Sistema de documentos distribuídos
2. Integração com IA Nôa Esperança
3. Base de conhecimento expandida
4. Protocolos atualizados

NOVAS FUNCIONALIDADES:
- Documentos integrados por módulo
- Sistema de documentos críticos
- Notificações automáticas para IA
- Busca semântica avançada

PROTOCOLOS ATUALIZADOS:
- AEC: Versão 2.1 com novas técnicas
- IMRE: Inclusão de 5 novos blocos semânticos
- Cannabis: Atualização das diretrizes ANVISA
- Monitoramento: Novos parâmetros de avaliação

INTEGRAÇÃO IA:
- Treinamento com documentos críticos
- Atualização automática de conhecimento
- Respostas contextualizadas
- Análise semântica avançada

PRÓXIMOS PASSOS:
- Implementação de IA multimodal
- Integração com wearables
- Sistema de alertas inteligentes
- Dashboard de analytics avançado

Este documento é CRÍTICO para manter a IA atualizada.',
  'protocol',
  'high',
  0.90,
  ARRAY['Desenvolvimento', 'Atualização', 'Sistema', 'IA', 'Crítico'],
  ARRAY['Desenvolvimento', 'Atualização', 'Sistema', 'IA', 'MedCannLab', '2025'],
  true
);

-- 8. VERIFICAR INSERÇÃO
SELECT 
  COUNT(*) as total_documentos_criticos,
  COUNT(CASE WHEN priority = 'high' THEN 1 END) as alta_prioridade,
  COUNT(CASE WHEN category = 'protocol' THEN 1 END) as protocolos,
  COUNT(CASE WHEN category = 'methodology' THEN 1 END) as metodologias
FROM critical_documents;

-- 9. LISTAR DOCUMENTOS CRÍTICOS INSERIDOS
SELECT 
  title,
  category,
  priority,
  aiRelevance,
  isActive,
  created_at
FROM critical_documents 
ORDER BY priority DESC, aiRelevance DESC;
