# 🎤 Teste dos Comandos de Voz

## ✅ Script SQL Executado com Sucesso!

O script `SUPABASE_ATUALIZACAO_COMANDOS_VOZ.sql` foi executado com sucesso. Agora você pode testar as funcionalidades de comandos de voz.

## 🔍 Verificação Rápida

Execute o script `VERIFICAR_ATUALIZACAO_VOZ.sql` no Supabase SQL Editor para confirmar que todas as alterações foram aplicadas.

## 🧪 Como Testar os Comandos de Voz

### 1. Teste de Agendamento de Consulta por Voz

1. **Abra o chat da Nôa Esperanza** na plataforma
2. **Diga ou digite:** "Agendar consulta" ou "Marcar consulta"
3. **A IA deve responder** perguntando:
   - Nome do paciente
   - Data da consulta
   - Hora da consulta
   - Tipo de consulta (opcional)
   - Observações (opcional)
4. **Responda às perguntas** da IA
5. **A IA deve confirmar** o agendamento criado

### 2. Teste de Cadastro de Paciente por Voz

1. **Abra o chat da Nôa Esperanza** na plataforma
2. **Diga ou digite:** "Novo paciente" ou "Cadastrar paciente"
3. **A IA deve responder** perguntando:
   - Nome do paciente
   - CPF (opcional)
   - Telefone (opcional)
   - Email (opcional)
   - Data de nascimento (opcional)
   - Gênero (opcional)
4. **Responda às perguntas** da IA
5. **A IA deve confirmar** o cadastro do paciente

## 📋 Checklist de Funcionalidades

- [ ] Agendamento de consulta por voz funciona
- [ ] Cadastro de paciente por voz funciona
- [ ] A IA coleta todos os dados necessários
- [ ] Os dados são salvos corretamente no Supabase
- [ ] A IA confirma a criação do agendamento/paciente

## 🐛 Troubleshooting

### Se o agendamento não funcionar:

1. **Verifique se o paciente existe:**
   ```sql
   SELECT * FROM users WHERE type = 'patient' LIMIT 5;
   ```

2. **Verifique se há erros no console do navegador**

3. **Verifique as políticas RLS:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'appointments';
   ```

### Se o cadastro de paciente não funcionar:

1. **Verifique se você é profissional ou admin:**
   ```sql
   SELECT type FROM users WHERE id = auth.uid();
   ```

2. **Verifique se as colunas foram criadas:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'users' 
   AND column_name IN ('cpf', 'birth_date', 'gender');
   ```

3. **Verifique as políticas RLS:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

## 🎯 Próximos Passos

1. ✅ Execute o script de verificação
2. ✅ Teste os comandos de voz
3. ✅ Verifique se os dados estão sendo salvos
4. ✅ Teste com diferentes tipos de usuários (profissional, admin)

## 📞 Suporte

Se encontrar problemas:
- Verifique os logs do Supabase
- Verifique o console do navegador
- Execute o script de verificação para diagnosticar

---

**Status:** ✅ Script executado com sucesso
**Próximo passo:** Testar os comandos de voz na plataforma




