# 🎯 FLUXO DETALHADO: DASHBOARDS ÚNICOS

**Data:** 06/02/2026  
**Foco:** Dr. Ricardo Valença e Dr. Eduardo Faveret

---

## 📋 CONFIGURAÇÃO ATUAL

### 👨‍⚕️ **Dr. Ricardo Valença**

**Email Admin:** `rrvalenca@gmail.com`  
**Email Profissional:** `iaianoaesperanza@gmail.com`  
**Dashboard Único:** `/app/ricardo-valenca-dashboard`  
**Dashboard Alternativo:** `/app/clinica/profissional/dashboard`  
**Status:** ✅ **VINCULADO E FUNCIONAL**

**Rotas que redirecionam para Ricardo:**
- `iaianoaesperanza@gmail.com` → `/app/ricardo-valenca-dashboard`
- `rrvalenca@gmail.com` → `/app/ricardo-valenca-dashboard`
- `rrvlenca@gmail.com` → `/app/ricardo-valenca-dashboard`
- `profrvalenca@gmail.com` → `/app/ricardo-valenca-dashboard`

---

### 👨‍⚕️ **Dr. Eduardo Faveret**

**Email Admin:** `eduardoscfaveret@gmail.com`  
**Email Profissional:** ⚠️ **AINDA NÃO CADASTRADO** (vai usar Hotmail)  
**Dashboard Único:** `/app/clinica/profissional/dashboard-eduardo`  
**Status:** ⚠️ **AGUARDANDO CADASTRO COMO PROFISSIONAL**

**Rotas que redirecionam para Eduardo:**
- `eduardoscfaveret@gmail.com` → `/app/clinica/profissional/dashboard-eduardo` (admin)
- `eduardo.faveret@hotmail.com` → `/app/clinica/profissional/dashboard-eduardo` (quando cadastrar)
- Qualquer email hotmail do Eduardo → `/app/clinica/profissional/dashboard-eduardo` (quando cadastrar)

**Nota:** Eduardo vai se cadastrar como profissional com email Hotmail. Quando isso acontecer, o sistema automaticamente redirecionará para o dashboard-eduardo baseado no email ou nome.

---

## 🔄 FLUXO DETALHADO

### **1. Login e Redirecionamento**

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE LOGIN                            │
└─────────────────────────────────────────────────────────────┘

RICARDO VALENÇA:
  Login com: iaianoaesperanza@gmail.com
    │
    ▼
  Sistema verifica email
    │
    ▼
  Redireciona para: /app/ricardo-valenca-dashboard
    │
    ▼
  Dashboard Ricardo carregado ✅

EDUARDO FAVERET:
  Login com: eduardoscfaveret@gmail.com
    │
    ▼
  Sistema verifica email
    │
    ▼
  Redireciona para: /app/clinica/profissional/dashboard-eduardo
    │
    ▼
  Dashboard Eduardo carregado ✅
```

---

### **2. Dashboard Ricardo Valença**

**Rota:** `/app/ricardo-valenca-dashboard`

**Funcionalidades:**
- ✅ Lista de pacientes vinculados
- ✅ Chat com pacientes
- ✅ Videochamadas
- ✅ Avaliações clínicas
- ✅ Relatórios clínicos
- ✅ Agendamentos
- ✅ Prescrições
- ✅ Ferramentas de atendimento
- ✅ KPIs e métricas

**Isolamento:**
- ✅ Vê apenas pacientes vinculados via `iaianoaesperanza@gmail.com`
- ✅ RLS aplicado corretamente
- ✅ Admin pode acessar tudo (bypass RLS)

---

### **3. Dashboard Eduardo Faveret**

**Rota:** `/app/clinica/profissional/dashboard-eduardo`

**Funcionalidades:**
- ✅ Lista de pacientes vinculados
- ✅ Chat com pacientes
- ✅ Videochamadas
- ✅ Avaliações clínicas
- ✅ Relatórios clínicos
- ✅ Agendamentos
- ✅ Prescrições
- ✅ Ferramentas de atendimento
- ✅ KPIs e métricas

**Isolamento:**
- ⚠️ Precisa vincular pacientes via `eduardoscfaveret@gmail.com`
- ✅ RLS aplicado corretamente
- ✅ Admin pode acessar tudo (bypass RLS)

---

## 🔧 VINCULAR EDUARDO COMO PROFISSIONAL

### **Opção 1: Usar Mesmo Email (Recomendado)**

**Como funciona:**
- Eduardo faz login com `eduardoscfaveret@gmail.com`
- Sistema detecta email e redireciona para dashboard-eduardo
- Sistema usa email para vincular pacientes
- RLS permite acesso baseado em email

**Vantagens:**
- ✅ Não precisa criar registro separado
- ✅ Funciona com sistema atual
- ✅ Admin pode "visualizar como" profissional

**Como vincular pacientes:**
- Criar avaliações clínicas com `doctor_id` = ID do Eduardo
- Criar relatórios com `professional_id` = ID do Eduardo
- Criar agendamentos com `professional_id` = ID do Eduardo

---

### **Opção 2: Criar Registro Profissional Separado**

**Como funciona:**
- Criar novo registro em `users` com:
  - Email: `eduardoscfaveret@gmail.com` (mesmo email)
  - Type: `profissional`
  - Name: `Dr. Eduardo Faveret`

**Vantagens:**
- ✅ Separação clara entre admin e profissional
- ✅ Facilita isolamento de dados

**Desvantagens:**
- ⚠️ Dois registros com mesmo email
- ⚠️ Pode causar confusão

---

## 📊 FLUXO COMPLETO COM DASHBOARDS ÚNICOS

```
┌─────────────────────────────────────────────────────────────┐
│           FLUXO CLÍNICO COM DASHBOARDS ÚNICOS                │
└─────────────────────────────────────────────────────────────┘

1. LOGIN
   │
   ├─ Ricardo (iaianoaesperanza@gmail.com)
   │   └─→ /app/ricardo-valenca-dashboard
   │
   └─ Eduardo (eduardoscfaveret@gmail.com)
       └─→ /app/clinica/profissional/dashboard-eduardo

2. DASHBOARD CARREGADO
   │
   ├─ Lista de pacientes vinculados
   │   ├─ Ricardo: pacientes via iaianoaesperanza@gmail.com
   │   └─ Eduardo: pacientes via eduardoscfaveret@gmail.com
   │
   ├─ Seleciona paciente
   │   └─→ Abre prontuário, chat, etc.
   │
   └─ Ferramentas de atendimento
       ├─ Videochamada
       ├─ Chat
       ├─ Avaliação clínica
       └─ Prescrição

3. ISOLAMENTO (RLS)
   │
   ├─ Ricardo vê apenas:
   │   └─ Pacientes vinculados via iaianoaesperanza@gmail.com
   │
   └─ Eduardo vê apenas:
       └─ Pacientes vinculados via eduardoscfaveret@gmail.com

4. ADMIN BYPASS
   │
   └─ Admin (phpg69@gmail.com, etc.) vê:
       └─ Todos os pacientes de todos os profissionais
```

---

## ✅ CHECKLIST DE VINCULAÇÃO

### **Para Ricardo (Já Funcional):**
- [x] Email profissional: `iaianoaesperanza@gmail.com`
- [x] Dashboard único: `/app/ricardo-valenca-dashboard`
- [x] Redirecionamento automático funcionando
- [x] Pacientes vinculados via email
- [x] RLS aplicado corretamente

### **Para Eduardo (Precisa Fazer):**
- [ ] Executar script `VINCULAR_EDUARDO_COMO_PROFISSIONAL_06-02-2026.sql`
- [ ] Verificar redirecionamento automático
- [ ] Vincular pacientes via `eduardoscfaveret@gmail.com`
- [ ] Testar dashboard-eduardo
- [ ] Verificar RLS aplicado corretamente

---

## 🔑 REGRAS IMPORTANTES

1. **Email é a chave:**
   - Sistema usa email para redirecionamento
   - Sistema usa email para vincular pacientes
   - Mesmo email pode ser admin E profissional

2. **RLS isola por profissional:**
   - Ricardo vê apenas seus pacientes
   - Eduardo vê apenas seus pacientes
   - Admin vê todos (bypass RLS)

3. **Dashboards únicos:**
   - Cada profissional tem seu dashboard
   - Redirecionamento automático por email
   - Funciona mesmo sendo admin

---

## 📝 PRÓXIMOS PASSOS

1. **Executar script de vinculação:**
   - `database/scripts/VINCULAR_EDUARDO_COMO_PROFISSIONAL_06-02-2026.sql`

2. **Testar redirecionamento:**
   - Login com `eduardoscfaveret@gmail.com`
   - Verificar se redireciona para dashboard-eduardo

3. **Vincular pacientes:**
   - Criar avaliações/relatórios/agendamentos
   - Usar `eduardoscfaveret@gmail.com` como profissional

4. **Testar isolamento:**
   - Verificar que Eduardo vê apenas seus pacientes
   - Verificar que Ricardo vê apenas seus pacientes
   - Verificar que Admin vê todos

---

**Documento criado por:** Sistema de Análise  
**Data:** 06/02/2026  
**Status:** ✅ Fluxo Detalhado
