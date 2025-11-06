# ✅ INSTRUÇÕES FINAIS - EXECUTAR SQL CORRIGIDO

## ✅ ARQUIVO CORRETO

Use o arquivo: **`SUPABASE_TABELAS_ADICIONAIS_CORRIGIDO.sql`**

Este arquivo:
- ✅ Verifica se a tabela `clinical_assessments` já existe
- ✅ Se existir, adiciona apenas as colunas faltantes (`doctor_id`, `completed_at`, `updated_at`)
- ✅ Se não existir, cria a tabela completa
- ✅ Remove políticas existentes antes de criar novas (evita erros)
- ✅ Não tem caracteres especiais

---

## 📝 COMO EXECUTAR

1. **Abra o arquivo**: `SUPABASE_TABELAS_ADICIONAIS_CORRIGIDO.sql`
2. **Selecione TODO o conteúdo** (Ctrl+A)
3. **Copie** (Ctrl+C)
4. **Abra o Supabase SQL Editor**
5. **Limpe qualquer conteúdo anterior** no editor
6. **Cole** (Ctrl+V) - **APENAS o código SQL**
7. **Execute** (Run ou Ctrl+Enter)

---

## ⚠️ IMPORTANTE

- **NÃO copie** colchetes `[` ou `]`
- **NÃO copie** mensagens de status
- **NÃO copie** resultados anteriores
- Copie **APENAS** o código SQL puro

---

## ✅ VERIFICAÇÃO

Após executar, verifique se as tabelas foram criadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'clinical_reports',
  'clinical_kpis',
  'patient_profiles',
  'documents',
  'chat_messages',
  'forum_posts',
  'notifications',
  'clinical_assessments'
)
ORDER BY table_name;
```

Deve retornar 8 linhas.

---

## 🔍 VERIFICAR COLUNA DOCTOR_ID

Se ainda der erro, verifique se a coluna foi adicionada:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'clinical_assessments' 
AND column_name = 'doctor_id';
```

Se retornar uma linha, a coluna existe. Se não retornar nada, execute apenas esta parte:

```sql
ALTER TABLE clinical_assessments 
ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
```

---

**Arquivo correto**: `SUPABASE_TABELAS_ADICIONAIS_CORRIGIDO.sql`

