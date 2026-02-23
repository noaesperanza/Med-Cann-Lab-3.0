# 👑 Guia: Admin Visualizar Como Outros Perfis

**Data:** 06/02/2026  
**Status:** ✅ **FUNCIONALIDADE JÁ IMPLEMENTADA!**

---

## ✅ RESPOSTA RÁPIDA

**NÃO precisa ter email vinculado a todos os perfis!**

O sistema já permite que o admin visualize como qualquer tipo de usuário (paciente, profissional, aluno) **sem precisar ter emails vinculados**.

---

## 🎯 COMO FUNCIONA

### **Sistema de "Visualizar Como" (Impersonation)**

O sistema usa o `UserViewContext` que permite:

1. **Admin mantém seu email original** (`phpg69@gmail.com`, `rrvalenca@gmail.com`, etc.)
2. **Admin pode "visualizar como"** qualquer tipo de usuário
3. **O sistema trata o admin como o tipo visual** para:
   - Navegação (rotas)
   - Permissões (RLS)
   - Interface (dashboards)
   - Funcionalidades (chat, videochamadas, etc.)

---

## 🚀 COMO USAR

### **Passo 1: Fazer Login como Admin**

1. Faça login com qualquer email de admin:
   - `phpg69@gmail.com`
   - `rrvalenca@gmail.com`
   - `eduardoscfaveret@gmail.com`
   - `cbdrcpremium@gmail.com`

### **Passo 2: Selecionar "Visualizar Como"**

1. No **Header** (canto superior direito), clique no **ícone do seu perfil**
2. Você verá um menu com opções:
   - 👑 Admin
   - 👨‍⚕️ Profissional
   - 👤 Paciente
   - 🎓 Aluno

3. **Clique no tipo que deseja visualizar**

### **Passo 3: Sistema Redireciona Automaticamente**

O sistema automaticamente:
- ✅ Redireciona para o dashboard do tipo selecionado
- ✅ Ajusta permissões para o tipo visual
- ✅ Mostra interface do tipo visual
- ✅ Permite usar funcionalidades do tipo visual

---

## 📋 FUNCIONALIDADES DISPONÍVEIS

### **Quando Visualiza Como Paciente:**
- ✅ Dashboard do paciente
- ✅ Chat com profissionais
- ✅ Videochamadas (solicitar e receber)
- ✅ Agendamentos
- ✅ Prontuário médico
- ✅ Prescrições
- ✅ Todas as funcionalidades de paciente

### **Quando Visualiza Como Profissional:**
- ✅ Dashboard profissional
- ✅ Lista de pacientes
- ✅ Chat com pacientes
- ✅ Videochamadas (iniciar e receber)
- ✅ Avaliações clínicas
- ✅ Relatórios clínicos
- ✅ Agendamentos
- ✅ Todas as funcionalidades de profissional

### **Quando Visualiza Como Aluno:**
- ✅ Dashboard do aluno
- ✅ Aulas
- ✅ Biblioteca
- ✅ Avaliações
- ✅ Todas as funcionalidades de aluno

### **Quando Visualiza Como Admin:**
- ✅ Dashboard administrativo
- ✅ Gerenciamento de usuários
- ✅ Configurações do sistema
- ✅ Relatórios administrativos
- ✅ Todas as funcionalidades de admin

---

## 🔧 COMO FUNCIONA TECNICAMENTE

### **1. UserViewContext**

```typescript
// src/contexts/UserViewContext.tsx
const { viewAsType, setViewAsType, getEffectiveUserType } = useUserView()
```

- `viewAsType`: Tipo que o admin está visualizando (null = admin normal)
- `setViewAsType`: Função para mudar o tipo visual
- `getEffectiveUserType`: Retorna o tipo efetivo (visual se admin, senão real)

### **2. Armazenamento**

O tipo visual é salvo no `localStorage`:
- Chave: `viewAsUserType`
- Valores: `'paciente'`, `'profissional'`, `'aluno'`, `'admin'` ou `null`

### **3. Redirecionamento Automático**

O `SmartDashboardRedirect` detecta quando admin muda o tipo visual e redireciona automaticamente:

```typescript
// Se admin está visualizando como outro tipo, redirecionar
if (userType === 'admin' && viewAsType) {
  const viewRoute = getDefaultRouteByType(viewAsType)
  return <Navigate to={viewRoute} replace />
}
```

### **4. Permissões (RLS)**

O sistema usa `getEffectiveUserType()` para determinar permissões:
- Se admin está visualizando como paciente → permissões de paciente
- Se admin está visualizando como profissional → permissões de profissional
- Se admin está visualizando como admin → permissões de admin

---

## 📊 EXEMPLO DE USO

### **Cenário: Testar Chat Paciente-Profissional**

1. **Login como admin:** `phpg69@gmail.com`
2. **Visualizar como paciente:**
   - Clicar no perfil → Selecionar "👤 Paciente"
   - Sistema redireciona para `/app/clinica/paciente/dashboard`
3. **Abrir chat:**
   - Ir para "Chat com Profissional"
   - Selecionar um profissional
   - Enviar mensagem
   - Solicitar videochamada
4. **Voltar para admin:**
   - Clicar no perfil → Selecionar "👑 Admin"
   - Sistema redireciona para `/app/admin`

---

## ⚠️ IMPORTANTE

### **O que NÃO precisa:**
- ❌ Criar emails separados para cada perfil
- ❌ Fazer login múltiplo
- ❌ Ter contas vinculadas

### **O que o sistema faz automaticamente:**
- ✅ Mantém o email original do admin
- ✅ Ajusta permissões baseado no tipo visual
- ✅ Redireciona para dashboards corretos
- ✅ Permite usar todas as funcionalidades do tipo visual

---

## 🐛 TESTANDO BUGS

### **Para testar funcionalidades de paciente:**
1. Login como admin
2. Visualizar como paciente
3. Testar todas as funcionalidades
4. Reportar bugs encontrados

### **Para testar funcionalidades de profissional:**
1. Login como admin
2. Visualizar como profissional
3. Testar todas as funcionalidades
4. Reportar bugs encontrados

### **Para testar funcionalidades de aluno:**
1. Login como admin
2. Visualizar como aluno
3. Testar todas as funcionalidades
4. Reportar bugs encontrados

---

## ✅ CONCLUSÃO

**O sistema já está pronto para testar todos os perfis!**

- ✅ Não precisa ter emails vinculados
- ✅ Admin pode visualizar como qualquer tipo
- ✅ Todas as funcionalidades estão disponíveis
- ✅ Sistema ajusta permissões automaticamente

**Basta usar o menu "Visualizar Como" no Header!**

---

**Documento criado por:** Sistema de Documentação  
**Data:** 06/02/2026  
**Status:** ✅ Funcionalidade já implementada e funcionando
