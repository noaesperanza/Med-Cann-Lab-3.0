# DECISÃO SELADA — ROTAS CANÔNICAS v1

**Status:** CONTRATO INSTITUCIONAL (OFICIAL)

**Data de selamento:** 05/02/2026

**Escopo:** Navegação, rotas de front-end, Sidebar, links internos e documentação

**Objetivo:** Estabelecer uma única verdade de navegação, reduzir entropia sistêmica e eliminar realidades paralelas **sem quebrar o que funciona**.

> ⛔ **Este documento NÃO altera o Core (`tradevision-core`), o COS, os triggers nem o modelo "fala ≠ ação".**
> A canonização aplica-se **exclusivamente** ao front (rotas, Sidebar, links e docs).
> O Core já emite os paths corretos via `app_commands` e navegação — **não deve ser modificado**.

---

## 1. Leis do documento (invariantes)

1. **Verdade de rota**
   A forma canônica é:

   ```
   /app/eixo/tipo/acao
   ```

   Exemplo:

   ```
   /app/clinica/paciente/dashboard
   ```

   Esta é a **única forma permitida** para:

   * Sidebar e menus
   * Links internos
   * Breadcrumbs
   * Documentação (fluxos, treinamento, rotas estruturadas)

   O Core **já emite** esses paths; não alterá-lo. Apenas alinhar o restante do app.

2. **Rotas legadas**
   Permanecem **somente como redirect** em `App.tsx`:

   ```tsx
   <Route path="/rota-antiga" element={<Navigate to="/app/..." replace />} />
   ```

   * Nunca devem ser linkadas novamente
   * Nunca devem aparecer na Sidebar ou docs

3. **Sidebar e documentação**
   Devem usar **exclusivamente rotas canônicas**.

4. **Evolução futura**

   * Novas telas já nascem no padrão canônico
   * Nenhuma rota legada nova pode ser criada

---

## 2. Mapa canônico — FONTE DE VERDADE

### Eixo Clínica

| Tela                                      | Rota canônica                                | Componente              |
| ----------------------------------------- | -------------------------------------------- | ----------------------- |
| Dashboard profissional                    | /app/clinica/profissional/dashboard          | RicardoValencaDashboard |
| Dashboard profissional (Eduardo)          | /app/clinica/profissional/dashboard-eduardo  | EduardoFaveretDashboard |
| Pacientes                                 | /app/clinica/profissional/pacientes          | PatientsManagement      |
| Agendamentos profissional                 | /app/clinica/profissional/agendamentos       | ProfessionalScheduling  |
| Relatórios profissional                   | /app/clinica/profissional/relatorios         | Reports                 |
| Chat profissionais                        | /app/clinica/profissional/chat-profissionais | ProfessionalChat        |
| Prescrições                               | /app/clinica/prescricoes                     | Prescriptions           |
| Dashboard paciente                        | /app/clinica/paciente/dashboard              | PatientDashboard        |
| Avaliação clínica                         | /app/clinica/paciente/avaliacao-clinica      | ClinicalAssessment      |
| Relatórios paciente                       | /app/clinica/paciente/relatorios             | Reports                 |
| **Agendamentos paciente (única verdade)** | /app/clinica/paciente/agendamentos           | PatientAppointments     |
| Chat com profissional                     | /app/clinica/paciente/chat-profissional      | PatientDoctorChat       |
| Chat NOA (paciente)                        | /app/clinica/paciente/chat-noa               | PatientNOAChat          |

---

### Eixo Ensino

| Tela                    | Rota canônica                                     | Componente            |
| ----------------------- | ------------------------------------------------- | --------------------- |
| Dashboard profissional  | /app/ensino/profissional/dashboard                | EnsinoDashboard       |
| Preparação de aulas     | /app/ensino/profissional/preparacao-aulas         | LessonPreparation     |
| Arte Entrevista Clínica | /app/ensino/profissional/arte-entrevista-clinica  | ArteEntrevistaClinica |
| Pós-graduação Cannabis  | /app/ensino/profissional/pos-graduacao-cannabis   | CursoEduardoFaveret   |
| Gestão de alunos        | /app/ensino/profissional/gestao-alunos            | GestaoAlunos          |
| Aula                    | /app/ensino/profissional/aula/:moduleId/:lessonId | LessonDetail          |
| Dashboard aluno         | /app/ensino/aluno/dashboard                       | AlunoDashboard        |
| Cursos                  | /app/ensino/aluno/cursos                          | Courses               |
| Biblioteca              | /app/ensino/aluno/biblioteca                      | Library               |
| Gamificação             | /app/ensino/aluno/gamificacao                     | Gamificacao           |

---

### Eixo Pesquisa

| Tela                   | Rota canônica                                    | Componente         |
| ---------------------- | ------------------------------------------------ | ------------------ |
| Dashboard profissional | /app/pesquisa/profissional/dashboard             | PesquisaDashboard  |
| Fórum de casos         | /app/pesquisa/profissional/forum-casos           | ForumCasosClinicos |
| Cidade Amiga dos Rins  | /app/pesquisa/profissional/cidade-amiga-dos-rins | CidadeAmigaDosRins |
| MedCann Lab            | /app/pesquisa/profissional/medcann-lab           | MedCannLab         |
| Jardins de Cura        | /app/pesquisa/profissional/jardins-de-cura       | JardinsDeCura      |
| Dashboard aluno        | /app/pesquisa/aluno/dashboard                    | PesquisaDashboard  |
| Fórum aluno            | /app/pesquisa/aluno/forum-casos                  | ForumCasosClinicos |

---

## 3. Admin — PAPEL SISTÊMICO (não eixo)

* Admin é operador sistêmico
* Default route obrigatória:

  ```
  /app/admin
  ```

* Admin pode visualizar e acessar rotas em construção
* Este contrato **não bloqueia experimentação administrativa**

| Tela                 | Rota                            |
| -------------------- | ------------------------------- |
| Hub Admin            | /app/admin                      |
| Clinical Governance  | /app/admin/clinical-governance  |
| Assessment Analytics | /app/admin/assessment-analytics |
| News                 | /app/admin/news                 |

---

## 4. Entrada por tipo (SmartDashboardRedirect)

| Tipo         | Destino canônico                    |
| ------------ | ----------------------------------- |
| paciente     | /app/clinica/paciente/dashboard     |
| profissional | /app/clinica/profissional/dashboard |
| aluno        | /app/ensino/aluno/dashboard         |
| admin        | /app/admin                          |

---

## 5. Agenda do paciente — DECISÃO DE ÚNICA VERDADE

* **Única tela válida:**

  ```
  /app/clinica/paciente/agendamentos
  ```

* Rota `/agenda` vira redirect
* `rotasIndividualizadas.ts` deve apontar somente para esta rota
* Core já navega corretamente — não alterar

---

## 6. Rotas legadas → redirect

Todas as rotas antigas permanecem **apenas como redirect**.

Exemplos:

* /app/patient-dashboard → /app/clinica/paciente/dashboard
* /app/patient-appointments → /app/clinica/paciente/agendamentos
* /app/professional-dashboard → /app/clinica/profissional/dashboard
* /app/professional-scheduling → /app/clinica/profissional/agendamentos

Nenhuma rota legada pode ser removida antes do redirect existir.

---

## 7. Fora de escopo (PROIBIDO NESTE CICLO)

* Refatorar o Core
* Alterar COS
* Alterar triggers ou allow-list
* Mudar modelo "fala ≠ ação"
* Reescrever fluxos de chat ou avaliação
* Criar novas rotas legadas

---

## 8. Cláusula de selamento institucional

Este documento:

* Substitui qualquer entendimento informal anterior sobre rotas e navegação
* Passa a ser a **fonte única de verdade** para implementação, revisão e documentação
* Só pode ser alterado por **emenda explícita**, versionada e comunicada

Qualquer PR que toque em rotas, Sidebar, Admin ou navegação **DEVE** ser validado contra este contrato.

---

**STATUS FINAL:**

✅ Documento validado contra o sistema real

✅ Compatível com Core, COS e modelo cognitivo

✅ Aprovado para uso institucional

**SELADO.**
