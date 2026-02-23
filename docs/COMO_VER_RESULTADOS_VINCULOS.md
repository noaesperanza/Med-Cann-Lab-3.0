# 📊 Como Ver os Resultados dos Vínculos

**Data:** 06/02/2026

---

## 🔍 O Problema

Quando você executa o script `VERIFICAR_VINCULOS_PACIENTES_PROFISSIONAIS_06-02-2026.sql`, ele retorna várias queries, mas você só vê a última mensagem:

```json
[
  {
    "status": "✅ Análise de vínculos concluída!"
  }
]
```

**Isso acontece porque:** O Supabase SQL Editor mostra apenas o resultado da última query. As queries anteriores também retornaram dados, mas você precisa rolar para cima para vê-las!

---

## ✅ SOLUÇÃO: Script Simplificado

Criei um novo script mais direto que retorna apenas os resultados importantes:

**Arquivo:** `database/scripts/RESUMO_VINCULOS_PACIENTES_PROFISSIONAIS_06-02-2026.sql`

### O que este script retorna:

1. **📋 Lista Completa de Vínculos**
   - Cada paciente e seus profissionais vinculados
   - Tipos de vínculo (assessment, report, appointment, chat)

2. **👥 Resumo por Paciente**
   - Quantos profissionais cada paciente tem
   - Lista de IDs dos profissionais

3. **👨‍⚕️ Resumo por Profissional**
   - Quantos pacientes cada profissional tem
   - Lista de emails dos pacientes

4. **📊 Estatísticas Gerais**
   - Total de pacientes
   - Total de profissionais
   - Pacientes com/sem vínculos
   - Profissionais com/sem pacientes

---

## 📋 COMO USAR

### Opção 1: Usar o Script Simplificado (Recomendado)

1. Acesse: https://supabase.com/dashboard/project/itdjkfubfzmvmuxxjoae/sql/new
2. Abra: `database/scripts/RESUMO_VINCULOS_PACIENTES_PROFISSIONAIS_06-02-2026.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **"Run"**
6. **Role para cima** para ver todos os resultados!

**Resultado:** Você verá 4 tabelas diferentes com os resultados.

---

### Opção 2: Ver Resultados do Script Original

Se você já executou o script original:

1. No Supabase SQL Editor, **role para cima** na área de resultados
2. Você verá várias tabelas com os resultados de cada query
3. Cada tabela mostra uma análise diferente:
   - Vínculos via Clinical Assessments
   - Vínculos via Clinical Reports
   - Vínculos via Appointments
   - Vínculos via Chat Rooms
   - Resumo por Paciente
   - Resumo por Profissional
   - Pacientes sem vínculos
   - Profissionais sem pacientes

---

## 📊 O QUE ESPERAR NOS RESULTADOS

### 1. Lista de Vínculos
```
paciente_email | paciente_nome | profissional_email | profissional_nome | tipos_vinculo
casualmusic2021@gmail.com | Pedro Paciente | phpg69@gmail.com | Pedro | assessment, appointment, chat
```

### 2. Resumo por Paciente
```
paciente_email | paciente_nome | total_profissionais
casualmusic2021@gmail.com | Pedro Paciente | 3
```

### 3. Resumo por Profissional
```
profissional_email | profissional_nome | total_pacientes
iaianoaesperanza@gmail.com | Dr. Ricardo | 15
```

### 4. Estatísticas Gerais
```
categoria | detalhe | valor
Total de Pacientes | | 21
Pacientes com Vínculos | | 18
Pacientes SEM Vínculos | | 3
```

---

## 💡 DICA

**No Supabase SQL Editor:**
- Os resultados aparecem em ordem (primeira query primeiro, última query por último)
- A última mensagem de status aparece no final
- **Role para cima** para ver todos os resultados anteriores!

---

## ✅ CONCLUSÃO

**Use o script simplificado** (`RESUMO_VINCULOS_PACIENTES_PROFISSIONAIS_06-02-2026.sql`) para ver os resultados de forma mais clara e organizada!

---

**Documento criado por:** Sistema de Documentação  
**Data:** 06/02/2026
