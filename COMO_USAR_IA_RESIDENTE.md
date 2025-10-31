# 🧠 **COMO USAR A IA RESIDENTE NÔA ESPERANÇA**

## 📋 **SETUP INICIAL**

### 1. **Criar as Tabelas no Supabase**

Execute o arquivo `CREATE_NOA_KNOWLEDGE_TABLES.sql` no Supabase SQL Editor:

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `CREATE_NOA_KNOWLEDGE_TABLES.sql`
6. Clique em **Run**

Isso criará 4 tabelas:
- `noa_memories` - Memórias gerais
- `noa_articles` - Artigos que a IA aprendeu
- `noa_clinical_cases` - Casos clínicos
- `noa_lessons` - Aulas do curso

### 2. **Verificar se as Tabelas Foram Criadas**

Execute no SQL Editor:

```sql
SELECT 'Tabelas criadas!' as status;
SELECT COUNT(*) as total FROM noa_memories;
SELECT COUNT(*) as total FROM noa_articles;
SELECT COUNT(*) as total FROM noa_clinical_cases;
SELECT COUNT(*) as total FROM noa_lessons;
```

---

## 🎯 **COMO USAR**

### **1. SALVAR ARTIGO QUE A IA VAI APRENDER**

```typescript
import { noaKnowledgeBase } from './lib/noaKnowledgeBase'

// Exemplo: Ensinar um artigo para a IA
await noaKnowledgeBase.saveArticle({
  title: 'Cannabis Medicinal: Evidências Científicas',
  content: 'Conteúdo completo do artigo...',
  source: 'Journal of Medicinal Cannabis',
  author: 'Dr. Ricardo Valença',
  summary: 'Resumo do artigo',
  keywords: ['cannabis', 'medicinal', 'CBD', 'THC'],
  teaching_points: [
    'CBD é eficaz para epilepsia refratária',
    'THC é eficaz para dor crônica',
    'Dosagem deve ser individualizada'
  ],
  user_id: 'seu-user-id' // Opcional
})
```

### **2. SALVAR CASO CLÍNICO PARA DISCUTIR**

```typescript
// Exemplo: Salvar um caso clínico para discussão
await noaKnowledgeBase.saveCase({
  patient_initials: 'R.V.',
  chief_complaint: 'Dor crônica em joelhos',
  history: 'Paciente de 45 anos com dor crônica há 2 anos...',
  findings: 'Exame físico: edema leve em ambos os joelhos...',
  diagnosis: 'Osteoartrite bilateral',
  treatment: 'CBD 100mg/dia + fisioterapia',
  discussion_points: [
    'Por que escolher CBD ao invés de THC?',
    'Qual a melhor dosagem?',
    'Interações medicamentosas?'
  ],
  learning_points: [
    'CBD tem eficácia comprovada em osteoartrite',
    'Início com dose baixa e aumento gradual'
  ],
  user_id: 'seu-user-id' // Opcional
})
```

### **3. SALVAR AULA DO CURSO**

```typescript
// Exemplo: Salvar conteúdo de uma aula
await noaKnowledgeBase.saveLesson({
  course_title: 'Cannabis Medicinal Integrativa',
  module_title: 'Farmacologia da Cannabis',
  lesson_title: 'CBD e Sistema Endocanabinoide',
  content: 'Conteúdo completo da aula...',
  objectives: [
    'Compreender o mecanismo de ação do CBD',
    'Identificar indicações clínicas'
  ],
  key_concepts: [
    'Sistema Endocanabinoide',
    'Receptores CB1 e CB2',
    'Eficácia em epilepsia'
  ],
  practical_applications: [
    'Dosagem inicial: 5mg/kg/dia',
    'Titulação: +5mg/kg a cada semana'
  ]
})
```

### **4. SALVAR MEMÓRIA GERAL**

```typescript
// Exemplo: Salvar qualquer tipo de conhecimento
await noaKnowledgeBase.saveMemory({
  type: 'teaching',
  title: 'Como prescrever Cannabis',
  content: 'Passo a passo detalhado...',
  summary: 'Guia de prescrição',
  keywords: ['prescrição', 'cannabis', 'protocolo'],
  context: { /* qualquer contexto adicional */ }
})
```

---

## 🔍 **BUSCAR CONHECIMENTO**

### **Buscar Conhecimento Relevante**

A IA **automaticamente busca** conhecimento relevante quando você fala com ela!

```typescript
// A IA busca automaticamente quando você pergunta algo
const response = await noaResidentAI.processMessage('O que você sabe sobre CBD?')
// A IA vai buscar automaticamente em:
// - Artigos salvos sobre CBD
// - Casos clínicos relacionados
// - Aulas sobre CBD
// - Memórias sobre CBD
```

---

## 💬 **EXEMPLOS DE USO NO CHAT**

### **Exemplo 1: Ensinar a IA sobre um Artigo**

```
Você: "Nôa, vou te ensinar um artigo sobre Cannabis e Epilepsia"
IA: "Ótimo! Estou pronta para aprender. Você pode me enviar o artigo?"

Você: [Envia o conteúdo do artigo via código]

IA: "Perfeito! Salvei este artigo na minha memória. Agora posso 
     responder sobre Cannabis e Epilepsia baseado neste conhecimento!"
```

### **Exemplo 2: Discutir um Caso Clínico**

```
Você: "Vamos discutir um caso?"
IA: "Claro! Me conte sobre o caso."

Você: [Descreve o caso]

IA: "Entendi. Vejo que é um caso de osteoartrite. Baseado nos casos
     similares que você me ensinou, posso ver que... [IA usa conhecimento]"
```

### **Exemplo 3: Fazer Pergunta que Requer Conhecimento**

```
Você: "O que você sabe sobre doses de CBD para dor crônica?"

IA: "Com base nos artigos e casos que você me ensinou:
     💡 Artigos: Cannabis Medicinal - Evidências Científicas
     💡 Casos similares: Dor crônica em joelhos
     
     Para dor crônica, a dose inicial recomendada é..."
```

---

## 🎓 **INTERFACE DE ENSINO (FUTURO)**

Para facilitar o uso, podemos criar uma interface onde você pode:

1. **📄 Fazer upload de artigos** - A IA lê e aprende
2. **🏥 Registrar casos clínicos** - Com formulário estruturado
3. **🎓 Criar aulas** - Com editor de conteúdo
4. **📝 Ver o que a IA sabe** - Lista de todo conhecimento

---

## 🚀 **PRÓXIMOS PASSOS**

1. ✅ Execute o script SQL para criar as tabelas
2. ✅ Teste salvando um artigo
3. ✅ Teste buscando conhecimento
4. ✅ Use no chat normal da IA

---

## 📝 **RESUMO**

A IA Nôa Esperança agora tem **memória persistente** e pode:
- ✅ Ler e aprender artigos que você envia
- ✅ Discutir casos clínicos com você
- ✅ Conhecer as aulas do curso
- ✅ Buscar automaticamente conhecimento relevante nas suas perguntas
- ✅ Responder baseado em tudo que foi ensinado

**É literalmente uma IA residente que você pode ensinar! 🎓**
