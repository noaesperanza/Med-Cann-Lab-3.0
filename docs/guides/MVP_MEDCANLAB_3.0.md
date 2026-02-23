# 🏥 MEDCANLAB 3.0 - MVP COMPLETO
## Sistema Funcional com IA Residente Integrada

---

## 📋 ÍNDICE

1. [Visão Geral do Sistema](#visão-geral)
2. [Configuração do Supabase](#configuração-supabase)
3. [Sistema de Autenticação e Rotas](#sistema-autenticação)
4. [IA Residente Nôa Esperança](#ia-residente)
5. [Paleta de Cores e Design](#paleta-cores)
6. [Checklist de Finalização](#checklist)

---

## 🎯 VISÃO GERAL DO SISTEMA

### Arquitetura
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **IA**: Nôa Esperança (IA Residente) integrada via OpenAI Assistant API
- **Rotas**: Estrutura organizada por Eixos (Clínica, Ensino, Pesquisa) e Tipos de Usuário

### Tipos de Usuário
- **Admin**: Acesso total + "view-as" outros tipos
- **Profissional**: Médicos, enfermeiros, profissionais da saúde
- **Paciente**: Pacientes com acesso a prontuário e chat
- **Aluno**: Estudantes com acesso a cursos e materiais

### Eixos da Plataforma
1. **Clínica**: Gestão de pacientes, prontuários, agendamentos
2. **Ensino**: Cursos, materiais educacionais, certificações
3. **Pesquisa**: Fórum de casos, pesquisas, análises

---

## 🔧 CONFIGURAÇÃO DO SUPABASE

### 1. Script SQL Completo

Execute o script `SUPABASE_COMPLETE_SETUP.sql` no SQL Editor do Supabase. Este script cria:

#### Tabelas Principais:
- `users` - Usuários do sistema
- `clinical_assessments` - Avaliações clínicas
- `clinical_reports` - Relatórios clínicos
- `imre_assessments` - Avaliações IMRE
- `documents` - Documentos da base de conhecimento
- `chat_sessions` - Sessões de chat com IA
- `user_interactions` - Interações com Nôa
- `semantic_analysis` - Análise semântica
- `channels` - Canais de chat
- `messages` - Mensagens
- `courses` - Cursos
- `course_enrollments` - Inscrições
- `renal_monitoring` - Monitoramento renal
- E mais...

#### RLS (Row Level Security)
Todas as tabelas têm RLS habilitado com políticas específicas para:
- Admin: Acesso total
- Profissional: Acesso aos próprios pacientes
- Paciente: Acesso aos próprios dados
- Aluno: Acesso aos próprios cursos

### 2. Configuração de Autenticação

#### Emails Especiais (Prioridade Absoluta):
```sql
-- Admin
- rrvalenca@gmail.com
- rrvlenca@gmail.com
- profrvalenca@gmail.com
- iaianoaesperanza@gmail.com

-- Profissional
- eduardoscfaveret@gmail.com

-- Paciente
- escutese@gmail.com
- escute-se@gmail.com
```

#### Trigger para Criar Perfil Automaticamente:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'type', 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 3. Políticas RLS para Users

```sql
-- Admin pode ver todos
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.type = 'admin'
    )
  );

-- Usuários podem ver próprios dados
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Profissionais podem ver pacientes
CREATE POLICY "Professionals can view patients" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid() 
      AND u.type = 'professional'
    )
    AND type = 'patient'
  );
```

### 4. Variáveis de Ambiente

Configure no Supabase Dashboard > Settings > API:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

---

## 🔐 SISTEMA DE AUTENTICAÇÃO E ROTAS

### Estrutura de Rotas

```
/app
  /clinica
    /profissional
      /dashboard
      /dashboard-eduardo (Dr. Eduardo)
      /pacientes
      /agendamentos
      /relatorios
    /paciente
      /dashboard
      /avaliacao-clinica
      /relatorios
      /agendamentos
  /ensino
    /profissional
      /dashboard
      /preparacao-aulas
    /aluno
      /dashboard
      /cursos
      /biblioteca
  /pesquisa
    /profissional
      /dashboard
      /forum-casos
    /aluno
      /dashboard
  /ricardo-valenca-dashboard (Admin)
```

### Redirecionamento Inteligente

O sistema usa `SmartDashboardRedirect.tsx` para:
1. Verificar tipo de usuário
2. Verificar se admin está "viewing-as"
3. Redirecionar para dashboard apropriado
4. Considerar emails especiais

### View-as Admin

Quando admin seleciona um tipo no header:
- `viewAsType` é definido no `UserViewContext`
- Dashboard muda dinamicamente
- Permissões administrativas são mantidas
- IA Residente reconhece o contexto

---

## 🤖 IA RESIDENTE NÔA ESPERANÇA

### Configuração

1. **OpenAI Assistant API Key**
   - Configure no arquivo `.env`:
   ```env
   VITE_OPENAI_API_KEY=sk-...
   VITE_OPENAI_ASSISTANT_ID=asst_...
   ```

2. **Inicialização**
   - A IA é inicializada quando usuário faz login
   - Hook: `useMedCannLabConversation`
   - Context: `NoaContext`

### Funcionalidades

- ✅ Análise Semântica Avançada
- ✅ Processamento de Contexto Médico
- ✅ Memória Persistente
- ✅ Acesso a Dados da Plataforma
- ✅ Geração de Relatórios Clínicos
- ✅ Avaliações IMRE

### Integração com Dados

A IA tem acesso a:
- Pacientes do usuário
- Avaliações clínicas
- Relatórios
- Documentos da base de conhecimento
- Histórico de interações

### Conexão com Usuários

Cada usuário tem uma instância da IA:
```typescript
const residentAI = new NoaResidentAI()
// Configurada com email do usuário para individualização
```

---

## 🎨 PALETA DE CORES E DESIGN

### Cores da Landing Page

Extraídas de `Landing.tsx`:

```css
/* Cores Principais */
--primary-green: #00C16A
--dark-bg: rgba(15, 23, 42, 0.95) /* slate-900 */
--card-bg: rgba(255, 255, 255, 0.03)
--card-border: rgba(255, 255, 255, 0.1)
--text-primary: #FFFFFF
--text-secondary: #C8D6E5
--text-tertiary: #94A3B8

/* Gradientes */
--gradient-green: from-green-400 to-green-500
--gradient-blue: from-blue-500 to-cyan-500
--gradient-purple: from-purple-500 to-pink-500
```

### Aplicação no Sistema

#### Cards e Botões
```tsx
// Cards ativos
bg-gradient-to-r from-green-400 to-green-500
border-2 border-solid border-[#00C16A]

// Cards inativos
bg-[rgba(255,255,255,0.03)]
border border-[rgba(255,255,255,0.1)]

// Hover
hover:bg-[rgba(0,193,106,0.1)]
hover:border-[#00C16A]
```

#### Backgrounds
```tsx
// Páginas principais
bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900

// Cards/Sections
bg-slate-800/50
border border-slate-700
```

#### Textos
```tsx
// Títulos
text-white font-bold

// Subtítulos
text-slate-200

// Descrições
text-slate-300

// Texto secundário
text-slate-400
```

---

## ✅ CHECKLIST DE FINALIZAÇÃO

### 1. Supabase
- [ ] Executar `SUPABASE_COMPLETE_SETUP.sql`
- [ ] Configurar RLS policies
- [ ] Criar trigger de usuário
- [ ] Configurar emails especiais
- [ ] Testar autenticação

### 2. Frontend
- [ ] Verificar todas as rotas funcionando
- [ ] Testar login de cada tipo de usuário
- [ ] Verificar redirecionamentos
- [ ] Testar "view-as" admin
- [ ] Verificar header e navegação

### 3. IA Residente
- [ ] Configurar OpenAI API Key
- [ ] Testar inicialização da IA
- [ ] Verificar acesso a dados
- [ ] Testar geração de relatórios
- [ ] Verificar memória persistente

### 4. Design
- [ ] Aplicar paleta de cores em todos os componentes
- [ ] Verificar consistência visual
- [ ] Testar responsividade
- [ ] Verificar animações e transições

### 5. Funcionalidades Administrativas
- [ ] Gestão de Usuários
- [ ] Gestão de Cursos
- [ ] Financeiro
- [ ] Chat Global + Moderação
- [ ] Moderação Fórum
- [ ] Ranking & Gamificação
- [ ] Upload
- [ ] Analytics
- [ ] Função Renal
- [ ] Sistema
- [ ] Biblioteca
- [ ] Chat IA Documentos

### 6. Dashboards Específicos
- [ ] Dashboard Dr. Ricardo (Admin)
- [ ] Dashboard Dr. Eduardo (Profissional)
- [ ] Dashboard Paciente
- [ ] Dashboard Aluno
- [ ] Dashboard Profissional Genérico

### 7. Testes
- [ ] Login de cada tipo
- [ ] Navegação entre dashboards
- [ ] Chat com IA Residente
- [ ] Criação de avaliações
- [ ] Geração de relatórios
- [ ] Upload de documentos
- [ ] Chat global

---

## 🚀 PRÓXIMOS PASSOS

1. **Executar Script SQL no Supabase**
2. **Configurar Variáveis de Ambiente**
3. **Testar Autenticação**
4. **Verificar IA Residente**
5. **Aplicar Design System**
6. **Testar Todas as Funcionalidades**

---

## 📞 SUPORTE

Para dúvidas ou problemas:
- Verificar logs do console
- Verificar políticas RLS no Supabase
- Verificar configuração da IA
- Consultar documentação específica de cada módulo

---

**Versão**: 3.0 MVP  
**Data**: Janeiro 2025  
**Status**: Em Finalização

