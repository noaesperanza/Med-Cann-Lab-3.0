# 🧪 GUIA DE TESTE - ROTAS ESTRUTURADAS POR EIXO E TIPO

## 📋 **USUÁRIOS DE TESTE CRIADOS**

### **🔑 Credenciais de Acesso:**

#### **1. Administrador**
- **Email**: `rrvalenca@gmail.com` (existente)
- **Senha**: `[sua senha atual]`
- **Tipo**: `admin`
- **Acesso**: Todos os eixos e tipos

#### **2. Profissional - Clínica**
- **Email**: `profissional.clinica@medcannlab.com`
- **Senha**: `clinica123`
- **Tipo**: `professional`
- **Nome**: Dr. Ana Silva
- **CRM**: 12345
- **Acesso**: Eixo Clínica (Profissional + Paciente)

#### **3. Paciente - Clínica**
- **Email**: `paciente.clinica@medcannlab.com`
- **Senha**: `paciente123`
- **Tipo**: `patient`
- **Nome**: Maria Santos
- **CPF**: 123.456.789-00
- **Acesso**: Eixo Clínica (apenas Paciente)

#### **4. Profissional - Ensino**
- **Email**: `profissional.ensino@medcannlab.com`
- **Senha**: `ensino123`
- **Tipo**: `professional`
- **Nome**: Dr. Carlos Mendes
- **CRM**: 54321
- **Acesso**: Eixo Ensino (Profissional + Aluno)

#### **5. Aluno - Ensino**
- **Email**: `aluno.ensino@medcannlab.com`
- **Senha**: `aluno123`
- **Tipo**: `aluno`
- **Nome**: João Oliveira
- **Matrícula**: 2024001
- **Acesso**: Eixo Ensino (apenas Aluno)

#### **6. Profissional - Pesquisa**
- **Email**: `profissional.pesquisa@medcannlab.com`
- **Senha**: `pesquisa123`
- **Tipo**: `professional`
- **Nome**: Dra. Fernanda Costa
- **CRM**: 98765
- **Acesso**: Eixo Pesquisa (Profissional + Aluno)

#### **7. Aluno - Pesquisa**
- **Email**: `aluno.pesquisa@medcannlab.com`
- **Senha**: `pesquisa123`
- **Tipo**: `aluno`
- **Nome**: Pedro Almeida
- **Matrícula**: 2024002
- **Acesso**: Eixo Pesquisa (apenas Aluno)

---

## 🎯 **ROTAS DE TESTE**

### **Rotas Estruturadas:**
- `/eixo/clinica/tipo/profissional` → Dashboard Profissional
- `/eixo/clinica/tipo/paciente` → Dashboard Paciente
- `/eixo/ensino/tipo/profissional` → Dashboard Ensino
- `/eixo/ensino/tipo/aluno` → Dashboard Aluno
- `/eixo/pesquisa/tipo/profissional` → Dashboard Pesquisa
- `/eixo/pesquisa/tipo/aluno` → Dashboard Aluno

### **Seletor de Eixo:**
- `/selecionar-eixo` → Interface de seleção

---

## 🧪 **PLANO DE TESTE DETALHADO**

### **TESTE 1: Administrador**
1. **Login**: `rrvalenca@gmail.com`
2. **Verificar**: Redirecionamento para `/app/dashboard`
3. **Testar**: Botão "Selecionar Área de Trabalho"
4. **Acessar**: `/selecionar-eixo`
5. **Verificar**: Acesso a todos os eixos e tipos
6. **Testar**: Todas as combinações de eixo/tipo

### **TESTE 2: Profissional - Clínica**
1. **Login**: `profissional.clinica@medcannlab.com` / `clinica123`
2. **Verificar**: Redirecionamento para `/app/professional-dashboard`
3. **Testar**: `/eixo/clinica/tipo/profissional` → ✅ Deve funcionar
4. **Testar**: `/eixo/clinica/tipo/paciente` → ✅ Deve funcionar
5. **Testar**: `/eixo/ensino/tipo/profissional` → ✅ Deve funcionar
6. **Testar**: `/eixo/ensino/tipo/aluno` → ❌ Deve ser bloqueado
7. **Testar**: `/eixo/pesquisa/tipo/profissional` → ✅ Deve funcionar
8. **Testar**: `/eixo/pesquisa/tipo/aluno` → ❌ Deve ser bloqueado

### **TESTE 3: Paciente - Clínica**
1. **Login**: `paciente.clinica@medcannlab.com` / `paciente123`
2. **Verificar**: Redirecionamento para `/app/patient-dashboard`
3. **Testar**: `/eixo/clinica/tipo/paciente` → ✅ Deve funcionar
4. **Testar**: `/eixo/clinica/tipo/profissional` → ❌ Deve ser bloqueado
5. **Testar**: `/eixo/ensino/tipo/aluno` → ❌ Deve ser bloqueado
6. **Testar**: `/eixo/pesquisa/tipo/aluno` → ❌ Deve ser bloqueado

### **TESTE 4: Profissional - Ensino**
1. **Login**: `profissional.ensino@medcannlab.com` / `ensino123`
2. **Verificar**: Redirecionamento para `/app/professional-dashboard`
3. **Testar**: `/eixo/ensino/tipo/profissional` → ✅ Deve funcionar
4. **Testar**: `/eixo/ensino/tipo/aluno` → ✅ Deve funcionar
5. **Testar**: `/eixo/clinica/tipo/paciente` → ❌ Deve ser bloqueado
6. **Testar**: `/eixo/pesquisa/tipo/profissional` → ✅ Deve funcionar

### **TESTE 5: Aluno - Ensino**
1. **Login**: `aluno.ensino@medcannlab.com` / `aluno123`
2. **Verificar**: Redirecionamento para `/app/aluno-dashboard`
3. **Testar**: `/eixo/ensino/tipo/aluno` → ✅ Deve funcionar
4. **Testar**: `/eixo/ensino/tipo/profissional` → ❌ Deve ser bloqueado
5. **Testar**: `/eixo/clinica/tipo/paciente` → ❌ Deve ser bloqueado
6. **Testar**: `/eixo/pesquisa/tipo/aluno` → ✅ Deve funcionar

### **TESTE 6: Profissional - Pesquisa**
1. **Login**: `profissional.pesquisa@medcannlab.com` / `pesquisa123`
2. **Verificar**: Redirecionamento para `/app/professional-dashboard`
3. **Testar**: `/eixo/pesquisa/tipo/profissional` → ✅ Deve funcionar
4. **Testar**: `/eixo/pesquisa/tipo/aluno` → ✅ Deve funcionar
5. **Testar**: `/eixo/clinica/tipo/paciente` → ❌ Deve ser bloqueado
6. **Testar**: `/eixo/ensino/tipo/profissional` → ✅ Deve funcionar

### **TESTE 7: Aluno - Pesquisa**
1. **Login**: `aluno.pesquisa@medcannlab.com` / `pesquisa123`
2. **Verificar**: Redirecionamento para `/app/aluno-dashboard`
3. **Testar**: `/eixo/pesquisa/tipo/aluno` → ✅ Deve funcionar
4. **Testar**: `/eixo/pesquisa/tipo/profissional` → ❌ Deve ser bloqueado
5. **Testar**: `/eixo/clinica/tipo/paciente` → ❌ Deve ser bloqueado
6. **Testar**: `/eixo/ensino/tipo/aluno` → ✅ Deve funcionar

---

## 🔍 **VERIFICAÇÕES OBRIGATÓRIAS**

### **Para cada teste, verificar:**
1. ✅ **Login funciona** com credenciais corretas
2. ✅ **Redirecionamento** para dashboard correto
3. ✅ **Breadcrumbs aparecem** nas rotas estruturadas
4. ✅ **Acesso permitido** para rotas adequadas
5. ❌ **Acesso bloqueado** para rotas inadequadas
6. ✅ **Seletor de eixo** funciona corretamente
7. ✅ **Interface responsiva** em diferentes telas

### **Logs a observar:**
- Console do navegador (F12)
- Logs de redirecionamento
- Mensagens de acesso/bloqueio
- Breadcrumbs funcionando

---

## 📊 **RESULTADO ESPERADO**

### **✅ Sucesso:**
- Todos os usuários conseguem fazer login
- Redirecionamentos corretos por tipo
- Breadcrumbs funcionando
- Lógica de acesso respeitada
- Seletor de eixo operacional

### **❌ Falha:**
- Usuário não consegue fazer login
- Redirecionamento incorreto
- Acesso inadequado permitido
- Breadcrumbs não aparecem
- Seletor de eixo não funciona

---

## 🚀 **PRÓXIMOS PASSOS**

1. **Execute o script SQL** para criar usuários
2. **Teste cada usuário** conforme o plano
3. **Documente resultados** encontrados
4. **Reporte problemas** se houver
5. **Valide funcionamento** completo

**Execute o script SQL e inicie os testes!** 🧪
