# 🔧 INSTRUÇÕES PARA CORREÇÃO DOS ERROS

## 📋 Erros Identificados nos Logs

### 1. Erro 400 em `course_enrollments`
- **Problema**: Query `select=*` pode estar faltando colunas
- **Solução**: Script SQL criado para verificar/criar tabela e colunas

### 2. Erro 404 em `clinical_kpis`
- **Problema**: Tabela não existe
- **Solução**: Script SQL criado para criar a tabela

### 3. Erro 500 em `courses`
- **Problema**: Query `.or()` muito complexa
- **Solução**: Query simplificada no código

### 4. Erro 400 em `users` com `type=eq.aluno`
- **Problema**: Código usando 'aluno' mas Supabase espera 'student'
- **Solução**: Código corrigido para usar 'student'

### 5. Erro 400 em `clinical_assessments`
- **Problema**: Foreign key incorreta na query
- **Solução**: Query simplificada para buscar pacientes separadamente

### 6. Microfone piscando
- **Problema**: `onerror` e `onend` reiniciando muito rapidamente
- **Solução**: Lógica melhorada com delays maiores e verificações de estado

### 7. Microfone não funciona para conversa normal
- **Problema**: Lógica de reinício não estava funcionando corretamente
- **Solução**: `useEffect` melhorado para reiniciar após IA terminar de falar

## 🚀 Passos para Aplicar as Correções

### Passo 1: Executar Script SQL no Supabase

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `SUPABASE_CORRECAO_ERROS_400_404.sql`
4. Execute o script
5. Verifique se todas as mensagens de sucesso aparecem

### Passo 2: Verificar Correções no Código

As seguintes correções já foram aplicadas no código:

1. ✅ `src/pages/GestaoAlunos.tsx`: Query corrigida para usar 'student' em vez de 'aluno'
2. ✅ `src/pages/AlunoDashboard.tsx`: Query de courses simplificada
3. ✅ `src/components/NoaConversationalInterface.tsx`: 
   - Query de pacientes corrigida
   - Lógica do microfone melhorada
   - Reinício automático após IA falar

### Passo 3: Testar

1. **Teste de Queries**:
   - Acesse a página de Gestão de Alunos
   - Acesse o Dashboard do Aluno
   - Verifique se não há mais erros 400/404/500 no console

2. **Teste do Microfone**:
   - Abra o chat da Nôa Esperanza
   - Aguarde a mensagem de boas-vindas
   - O microfone deve iniciar automaticamente (botão verde sólido)
   - Fale normalmente - o texto deve ser capturado e enviado automaticamente
   - Quando a IA falar, o botão deve ficar azul com animação
   - Após a IA terminar, o microfone deve reiniciar automaticamente (botão verde sólido)

3. **Teste do Comando "Escute-se, Nôa!"**:
   - Feche o chat
   - Diga: "Escute-se, Nôa!"
   - O chat deve abrir e expandir automaticamente
   - O microfone deve iniciar

## 📝 Notas Importantes

- O script SQL é **idempotente** (pode ser executado múltiplas vezes sem problemas)
- Todas as queries agora usam os tipos corretos ('student' em vez de 'aluno' para Supabase)
- O microfone agora tem delays maiores para evitar o efeito de "piscar"
- O estado visual do botão do microfone é mais estável

## 🔍 Verificação

Após aplicar as correções, verifique o console do navegador:
- ✅ Não deve haver mais erros 400/404/500
- ✅ O microfone deve funcionar corretamente
- ✅ O botão do microfone deve ter estado visual estável (verde quando escutando, azul quando IA falando)




