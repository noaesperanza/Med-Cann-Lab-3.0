# 🔍 DEBUG LOGIN DR. EDUARDO FAVERET

## ✅ STATUS ATUAL:
- ✅ Usuário encontrado no banco de dados
- ✅ Email: eduardoscfaveret@gmail.com
- ✅ Senha: 123@456

## 🔍 PRÓXIMOS PASSOS DE DEBUG:

### 1. **Executar Script de Debug**
Execute `DEBUG_LOGIN_EDUARDO_FAVERET.sql` no Supabase para verificar:
- Status do email (confirmado/não confirmado)
- Status do login (já fez login/nunca fez login)
- Status do usuário (ativo/inativo)
- Metadados completos

### 2. **Verificar Console do Navegador**
1. Abra F12 (DevTools)
2. Vá para Console
3. Tente fazer login
4. Procure por erros como:
   - `AuthApiError`
   - `Invalid credentials`
   - `Email not confirmed`
   - `User not found`

### 3. **Verificar Network Tab**
1. Abra F12 (DevTools)
2. Vá para Network
3. Tente fazer login
4. Procure por requisições para:
   - `supabase.co/auth/v1/token`
   - `supabase.co/auth/v1/user`
5. Verifique o status code (200, 400, 401, 422)

### 4. **Possíveis Problemas e Soluções**

#### A) **Email Não Confirmado**
```sql
-- Solução: Confirmar email
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'eduardoscfaveret@gmail.com';
```

#### B) **Senha Incorreta**
```sql
-- Solução: Redefinir senha
UPDATE auth.users 
SET encrypted_password = crypt('123@456', gen_salt('bf'))
WHERE email = 'eduardoscfaveret@gmail.com';
```

#### C) **Usuário Inativo**
```sql
-- Solução: Ativar usuário
UPDATE auth.users 
SET aud = 'authenticated'
WHERE email = 'eduardoscfaveret@gmail.com';
```

### 5. **Testar Outros Usuários**
Para comparar, teste com usuários que funcionam:
- `rrvalenca@gmail.com` (admin)
- `profrvalenca@gmail.com` (paciente)

### 6. **Verificar Configurações Supabase**
No painel do Supabase:
1. Vá para Authentication > Settings
2. Verifique se "Enable email confirmations" está configurado corretamente
3. Verifique se "Enable signup" está habilitado
4. Verifique se "Enable password reset" está habilitado

## 🎯 INFORMAÇÕES ESPERADAS:

### Após Executar Debug:
```
nome: Dr. Eduardo Faveret
tipo: professional
crm: 123456
cro: 654321
especialidade: Cannabis Medicinal
instituicao: MedCannLab
status_email: Email confirmado
status_login: Já fez login antes (ou Nunca fez login)
status_usuario: Usuário ativo
```

## 🚀 SOLUÇÕES RÁPIDAS:

### Se Email Não Confirmado:
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'eduardoscfaveret@gmail.com';
```

### Se Senha Incorreta:
```sql
UPDATE auth.users 
SET encrypted_password = crypt('123@456', gen_salt('bf'))
WHERE email = 'eduardoscfaveret@gmail.com';
```

### Se Usuário Inativo:
```sql
UPDATE auth.users 
SET aud = 'authenticated'
WHERE email = 'eduardoscfaveret@gmail.com';
```

## 📋 CHECKLIST DE VERIFICAÇÃO:

- [ ] Executar script de debug
- [ ] Verificar console do navegador
- [ ] Verificar network tab
- [ ] Testar outros usuários
- [ ] Verificar configurações Supabase
- [ ] Aplicar soluções se necessário

---

**🎯 Execute o debug e identifique o problema específico!**
