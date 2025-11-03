# 📋 Instruções de Execução dos Scripts SQL

## ⚠️ IMPORTANTE: Ordem de Execução

Execute os scripts **NESTA ORDEM** no Supabase SQL Editor:

### ✅ 1. ADICIONAR_COMPARTILHAMENTO_RELATORIOS.sql (OBRIGATÓRIO)

**O que faz:**
- Adiciona colunas de compartilhamento (`shared_with`, `shared_at`, `shared_by`, `assessment_id`) à tabela `clinical_reports`
- Cria função `share_report_with_doctors()` para compartilhar relatórios
- Cria função `get_shared_reports_for_doctor()` para buscar relatórios compartilhados
- Cria função `generate_report_from_assessment()` para gerar relatórios automaticamente
- Cria triggers para gerar relatórios automaticamente quando a IA residente completa uma avaliação
- Atualiza políticas RLS para compartilhamento

**Quando executar:**
- ✅ Execute AGORA - Este script é obrigatório para o sistema funcionar
- ✅ Apenas uma vez - Pode executar novamente sem problemas (usa `IF NOT EXISTS` e `DROP IF EXISTS`)

**Tempo estimado:** ~30 segundos

---

### ✅ 2. CRIAR_PACIENTE_PAULO_GONCALVES_COMPLETO.sql (OPCIONAL - APENAS PARA TESTES)

**O que faz:**
- Cria usuário Paulo Gonçalves no `auth.users`
- Cria registro na tabela `users`
- Cria avaliação clínica inicial
- Gera relatório automaticamente (usando os triggers criados no script 1)

**Dados de login criados:**
- Email: `paulo.goncalves@test.com`
- Senha: `paulo123456`
- Tipo: `patient`

**Quando executar:**
- ⚠️ Apenas se você quiser criar o paciente de teste
- ✅ Execute DEPOIS do script 1
- ✅ Pode executar várias vezes (usando `IF NOT EXISTS` e `ON CONFLICT`)

**Tempo estimado:** ~10 segundos

---

## 📝 Passo a Passo de Execução

### No Supabase Dashboard:

1. **Acesse o SQL Editor:**
   - Vá para: `https://supabase.com/dashboard/project/[seu-projeto]/sql`
   - Ou clique em "SQL Editor" no menu lateral

2. **Execute o Script 1:**
   - Copie TODO o conteúdo de `ADICIONAR_COMPARTILHAMENTO_RELATORIOS.sql`
   - Cole no SQL Editor
   - Clique em "RUN" ou pressione `Ctrl+Enter`
   - ✅ Verifique se não há erros (deve mostrar "Success")

3. **Execute o Script 2 (opcional):**
   - Copie TODO o conteúdo de `CRIAR_PACIENTE_PAULO_GONCALVES_COMPLETO.sql`
   - Cole no SQL Editor (pode limpar o anterior ou usar uma nova query)
   - Clique em "RUN"
   - ✅ Verifique se não há erros

---

## ✅ Verificação Após Execução

### Script 1 (ADICIONAR_COMPARTILHAMENTO_RELATORIOS.sql):

Execute estas queries para verificar:

```sql
-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clinical_reports'
  AND column_name IN ('shared_with', 'shared_at', 'shared_by', 'assessment_id');

-- Verificar se as funções foram criadas
SELECT routine_name 
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'share_report_with_doctors',
    'get_shared_reports_for_doctor',
    'generate_report_from_assessment',
    'generate_report_on_insert_assessment'
  );

-- Verificar se os triggers foram criados
SELECT trigger_name 
FROM information_schema.triggers
WHERE event_object_table = 'clinical_assessments'
  AND trigger_name LIKE '%generate_report%';
```

### Script 2 (CRIAR_PACIENTE_PAULO_GONCALVES_COMPLETO.sql):

Execute estas queries para verificar:

```sql
-- Verificar usuário criado
SELECT id, email, raw_user_meta_data->>'name' as name
FROM auth.users 
WHERE email = 'paulo.goncalves@test.com';

-- Verificar avaliação criada
SELECT id, patient_id, assessment_type, status
FROM clinical_assessments 
WHERE patient_id IN (
  SELECT id FROM auth.users WHERE email = 'paulo.goncalves@test.com'
);

-- Verificar relatório gerado automaticamente
SELECT id, patient_id, patient_name, report_type, status, assessment_id
FROM clinical_reports 
WHERE patient_id IN (
  SELECT id::TEXT FROM auth.users WHERE email = 'paulo.goncalves@test.com'
);
```

---

## 🚨 Solução de Problemas

### Erro: "column does not exist"
- ✅ Verifique se executou o script 1 PRIMEIRO
- ✅ Certifique-se de que a tabela `clinical_reports` existe

### Erro: "relation does not exist"
- ✅ Verifique se a tabela `users` existe no seu banco
- ✅ Se não existir, você pode precisar criar a tabela `users` primeiro

### Erro: "syntax error"
- ✅ Verifique se copiou TODO o conteúdo do script
- ✅ Certifique-se de que não há caracteres especiais corrompidos

---

## 📌 Resumo Rápido

**Para o sistema funcionar:**
1. ✅ Execute `ADICIONAR_COMPARTILHAMENTO_RELATORIOS.sql` (OBRIGATÓRIO)

**Para criar paciente de teste:**
2. ✅ Execute `CRIAR_PACIENTE_PAULO_GONCALVES_COMPLETO.sql` (OPCIONAL)

**Ordem:** Script 1 → Script 2 (opcional)

---

## 🎯 Próximos Passos Após Execução

1. ✅ Teste o login como paciente: `paulo.goncalves@test.com` / `paulo123456`
2. ✅ Complete uma avaliação clínica inicial com a IA residente
3. ✅ Verifique se o relatório foi gerado automaticamente
4. ✅ Teste o compartilhamento do relatório com os médicos
5. ✅ Verifique se os médicos veem o relatório compartilhado nos dashboards

---

**Dúvidas?** Verifique os logs de erro no Supabase SQL Editor ou verifique se todas as tabelas necessárias existem.

