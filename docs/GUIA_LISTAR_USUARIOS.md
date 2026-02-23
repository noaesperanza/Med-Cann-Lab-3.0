# 👥 Guia: Listar Todos os Usuários

**Data:** 06/02/2026

---

## 📋 O QUE ESTE SCRIPT FAZ

O script `LISTAR_TODOS_USUARIOS_POR_TIPO_06-02-2026.sql` lista todos os usuários do sistema organizados por tipo.

---

## 📊 RESULTADOS QUE VOCÊ VERÁ

### 1. **👑 TODOS OS ADMINS**
- Email, nome, tipo, CRM, telefone, data de criação

### 2. **👨‍⚕️ TODOS OS PROFISSIONAIS**
- Email, nome, tipo, CRM, CRO, telefone, data de criação

### 3. **👤 TODOS OS PACIENTES**
- Email, nome, tipo, telefone, data de criação
- Total de assessments
- Total de appointments
- Total de chat rooms

### 4. **🎓 TODOS OS ALUNOS**
- Email, nome, tipo, telefone, data de criação

### 5. **📊 RESUMO POR TIPO**
- Quantos usuários de cada tipo
- Lista de emails de cada tipo

### 6. **📋 LISTA COMPLETA**
- Todos os usuários em uma única tabela
- Organizados por tipo (admins primeiro, depois profissionais, pacientes, alunos)

### 7. **👨‍⚕️ PROFISSIONAIS COM DETALHES**
- Quantos pacientes cada profissional tem
- Detalhado por tipo de vínculo (assessments, reports, appointments, chat)

### 8. **👑 ADMINS COM DETALHES**
- Quantos pacientes cada admin tem
- Detalhado por tipo de vínculo

---

## 🚀 COMO USAR

1. Acesse: https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/sql/new
2. Abra: `database/scripts/LISTAR_TODOS_USUARIOS_POR_TIPO_06-02-2026.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **"Run"**
6. **Role para cima** para ver todos os resultados!

---

## 📊 EXEMPLO DE RESULTADOS

### Admins:
```
tipo_usuario | email | name | type
👑 ADMIN | phpg69@gmail.com | Pedro | admin
👑 ADMIN | rrvalenca@gmail.com | Ricardo | admin
```

### Profissionais:
```
tipo_usuario | email | name | type | crm
👨‍⚕️ PROFISSIONAL | iaianoaesperanza@gmail.com | Dr. Ricardo | profissional | CRM-123
```

### Pacientes:
```
tipo_usuario | email | name | total_assessments | total_appointments
👤 PACIENTE | casualmusic2021@gmail.com | Pedro Paciente | 3 | 2
```

---

## 💡 DICA

**Role para cima** no Supabase SQL Editor para ver todos os resultados! A última mensagem de status aparece no final, mas os dados importantes estão acima.

---

**Documento criado por:** Sistema de Documentação  
**Data:** 06/02/2026
