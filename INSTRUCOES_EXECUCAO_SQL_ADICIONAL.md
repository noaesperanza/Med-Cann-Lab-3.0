# 📋 INSTRUÇÕES - EXECUTAR SQL ADICIONAL

## ⚠️ IMPORTANTE

Você precisa executar **DOIS scripts SQL** no Supabase:

### 1. ✅ PRIMEIRO (JÁ EXECUTADO)
- `SUPABASE_COMPLETO_FINAL_CORRIGIDO.sql`
- ✅ Status: Já executado com sucesso

### 2. ⏳ SEGUNDO (EXECUTAR AGORA)
- `SUPABASE_TABELAS_ADICIONAIS.sql`
- ⏳ Status: **PRECISA SER EXECUTADO**

---

## 🎯 O QUE O SEGUNDO SCRIPT FAZ

O script `SUPABASE_TABELAS_ADICIONAIS.sql` cria:

1. **clinical_reports** - Relatórios clínicos
2. **clinical_kpis** - KPIs clínicos personalizados
3. **patient_profiles** - Perfis de pacientes (TEA, Neurologia)
4. **documents** - Biblioteca de documentos
5. **chat_messages** - Mensagens de chat
6. **forum_posts** - Posts do fórum
7. **notifications** - Notificações
8. **clinical_assessments** - Avaliações clínicas (IMRE, AEC)

E também adiciona campos faltantes em tabelas existentes:
- `appointments.rating` - Avaliação dos agendamentos
- `appointments.revenue` - Receita dos agendamentos
- `appointments.comment` - Comentários
- `courses.thumbnail` - Thumbnail dos cursos
- `courses.price` - Preço dos cursos
- `course_modules.resources` - Recursos dos módulos
- `users.age` - Idade dos usuários
- `users.diagnosis` - Diagnóstico dos pacientes

---

## 📝 COMO EXECUTAR

1. Abra o Supabase Dashboard
2. Vá para **SQL Editor**
3. Abra o arquivo `SUPABASE_TABELAS_ADICIONAIS.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** ou pressione `Ctrl+Enter`
7. Aguarde a execução completar

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

Deve retornar 8 linhas (uma para cada tabela).

---

## 🚨 SE DER ERRO

Se algum erro aparecer, me avise qual foi o erro e eu corrijo o script.

---

**Status**: ⏳ **AGUARDANDO EXECUÇÃO**

