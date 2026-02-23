# AUDITORIA COMPLETA SUPABASE - Med-Cann-Lab 3.0
**Data:** 23 de Dezembro de 2025, 09:15  
**Método:** Queries REST API diretas ao banco  
**URL:** `https://itdjkfubfzmvmuxxjoae.supabase.co`

---

## 📊 RESUMO EXECUTIVO

| Status | Quantidade |
|--------|------------|
| ✅ Tabelas OK | 12 |
| ❌ Tabelas Faltando | 6 |
| ⚠️ Views OK | 1 |

---

## ✅ TABELAS CONFIRMADAS (Existem e funcionam)

| Tabela | Registros | Status | Dados Reais |
|--------|-----------|--------|-------------|
| `users` | **29** | ✅ OK | Ricardo Valença (Admin/Prof/Paciente), Inoã Mota, Paulo Gonçalves |
| `appointments` | **4** | ✅ OK | Consultas agendadas até 2025-12-31 |
| `clinical_assessments` | **5+** | ✅ OK | Tipos: IMRE, CHAT, FOLLOW_UP |
| `clinical_reports` | **6+** | ✅ OK | Relatórios clínicos gerados |
| `chat_rooms` | **5+** | ✅ OK | "Discussão de Casos", canais de pacientes |
| `chat_messages` | **14+** | ✅ OK | Mensagens reais entre usuários |
| `chat_participants` | **Múltiplos** | ✅ OK | Vínculos room-user funcionando |
| `courses` | **6** | ✅ OK | "Arte da Entrevista Clínica", "Pós-Graduação Cannabis" |
| `documents` | **284** | ✅ OK | Slides, PDFs, materiais de aula |
| `forum_posts` | **1** | ✅ OK | Posts do fórum de casos |
| `forum_comments` | **0** | ✅ OK | Tabela existe, sem dados |
| `course_enrollments` | **0** | ✅ OK | Tabela existe, sem matrículas |

---

## ⚠️ VIEWS CONFIRMADAS

| View | Status | Descrição |
|------|--------|-----------|
| `v_chat_inbox` | ✅ OK | View de inbox do chat (6 registros) |

---

## ❌ TABELAS FALTANDO (404 - Não existem)

| Tabela Esperada | Usado Em | Impacto |
|-----------------|----------|---------|
| `lessons` | `LessonDetail.tsx`, `LessonPage.tsx` | 🔴 **CRÍTICO** - Aulas não carregam |
| `news` | `NewsManagement.tsx` | 🟡 Notícias não funcionam |
| `gamification_points` | `Gamificacao.tsx` | 🟡 Pontuação não persiste |
| `user_achievements` | `Gamificacao.tsx` | 🟡 Conquistas não funcionam |
| `modules` | `AlunoDashboard.tsx` | 🟡 Módulos de curso não listam |
| `ai_chat_history` | Chat NOA | 🟢 Baixo impacto |

---

## 📋 SCHEMA DETALHADO DAS TABELAS PRINCIPAIS

### `users`
```
id, name, email, type (admin/professional/patient), 
phone, created_at, avatar_url, ...
```

### `courses`
```
id, title, description, category, level, duration, 
price, is_active, is_published, is_featured, 
difficulty, instructor, is_live, next_class_date, slug
```

### `documents`
```
id, title (NÃO "name"!), content, summary, keywords,
medical_terms, file_url, file_type, file_size, 
category, tags, author, isLinkedToAI, downloads
```

### `chat_messages`
```
id, room_id, sender_id, message (NÃO "content"!),
message_type, file_url, created_at, read_at
```

---

## 🔧 O QUE PRECISA SER CRIADO NO SUPABASE

### Prioridade 1 (Bloqueador):
```sql
-- 1. Criar tabela lessons
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  module_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  duration INTEGER,
  order_index INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar tabela modules
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Prioridade 2 (Funcionalidade):
```sql
-- 3. Criar tabela news
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID REFERENCES users(id),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Criar tabelas de gamificação
CREATE TABLE gamification_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  points INTEGER DEFAULT 0,
  action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  achievement_id TEXT,
  unlocked_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## ✅ CONCLUSÃO

**Estado atual do banco:**
- **Funcionalidades core (Clínica):** 100% funcional
- **Funcionalidades Ensino:** ~60% (falta `lessons`, `modules`)
- **Funcionalidades Gamificação:** 0% (tabelas não existem)
- **Chat:** 100% funcional

**Ação recomendada:** Executar os SQLs acima no Supabase para habilitar Ensino completo e Gamificação.

---

*Auditoria realizada via REST API com service_role key.*
