# ✅ INSTRUÇÕES PARA EXECUTAR O SCRIPT SQL CORRIGIDO

## 🔧 Correção Aplicada

O erro `ERROR: 42703: column "crm" does not exist` foi corrigido. O script agora:

1. **Verifica e cria todas as colunas opcionais** antes de criar a view
2. **Adiciona colunas faltantes** (`crm`, `cro`, `avatar_url`, `phone`, `address`, `blood_type`, `allergies`, `medications`, `cpf`, `birth_date`, `gender`)
3. **Cria a view `users_compatible`** apenas depois que todas as colunas existem

## 🚀 Como Executar

1. **Acesse o Supabase Dashboard**
   - Vá para o seu projeto
   - Clique em **SQL Editor** no menu lateral

2. **Cole o conteúdo do arquivo `SUPABASE_CORRECAO_ERROS_400_404.sql`**
   - Copie todo o conteúdo do arquivo
   - Cole no editor SQL

3. **Execute o script**
   - Clique em **Run** ou pressione `Ctrl+Enter`
   - Aguarde a execução

4. **Verifique as mensagens de sucesso**
   - Você deve ver mensagens como:
     - `✅ Coluna crm adicionada à users`
     - `✅ Coluna cro adicionada à users`
     - `✅ Tabela clinical_kpis criada`
     - `✅ View users_compatible criada para compatibilidade`
     - etc.

## ✅ O que o Script Faz

1. **Cria a tabela `clinical_kpis`** (se não existir)
2. **Verifica/corrige a tabela `course_enrollments`**
3. **Adiciona colunas faltantes em `courses`** (instructor, price, level, etc.)
4. **Adiciona colunas opcionais em `users`** (crm, cro, avatar_url, phone, address, blood_type, allergies, medications, cpf, birth_date, gender)
5. **Cria a view `users_compatible`** para compatibilidade de tipos (aluno/student, profissional/professional, etc.)

## 🔍 Verificação

Após executar o script, você pode verificar se tudo foi criado corretamente:

```sql
-- Verificar se a view foi criada
SELECT * FROM users_compatible LIMIT 1;

-- Verificar se a tabela clinical_kpis existe
SELECT * FROM clinical_kpis LIMIT 1;

-- Verificar colunas da tabela users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

## ⚠️ Notas Importantes

- O script é **idempotente** (pode ser executado múltiplas vezes sem problemas)
- Todas as colunas são criadas com `IF NOT EXISTS`, então não há risco de duplicação
- A view é recriada com `DROP VIEW IF EXISTS CASCADE` para garantir que está atualizada

## 🎯 Próximos Passos

Após executar o script com sucesso:

1. ✅ Teste as queries no frontend
2. ✅ Verifique se não há mais erros 400/404/500 no console
3. ✅ Teste o microfone e a conversa por voz
4. ✅ Teste o comando "Escute-se, Nôa!"




