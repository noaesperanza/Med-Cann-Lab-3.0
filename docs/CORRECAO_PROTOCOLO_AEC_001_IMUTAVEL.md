# 🔒 CORREÇÃO: Protocolo AEC 001 IMUTÁVEL

**Data:** 05/02/2026  
**Problema:** GPT estava adicionando frases como "Pode falar livremente" que não estão no protocolo  
**Solução:** Reforçar que o protocolo é IMUTÁVEL e deve ser seguido EXATAMENTE

---

## 🎯 PROBLEMA IDENTIFICADO

### **O que estava acontecendo:**

Quando o usuário (incluindo Dr. Ricardo Valença como admin) pedia para fazer avaliação clínica inicial, o GPT respondia:

```
"Olá! Eu sou Nôa Esperanza. Vamos iniciar a sua avaliação clínica inicial, 
que pode ser utilizada para consultas com o Dr. Eduardo Faveret. 
Por favor, apresente-se e me diga: o que trouxe você à nossa avaliação hoje? 
Pode falar livremente sobre suas queixas e preocupações de saúde."
```

### **O que DEVERIA ser (Protocolo AEC 001):**

```
"Olá! Eu sou Nôa Esperanza. Por favor, apresente-se também e vamos iniciar 
a sua avaliação inicial para consultas com Dr. Ricardo Valença."
```

**Depois:**
```
"O que trouxe você à nossa avaliação hoje?"
```

### **Problemas identificados:**

1. ❌ GPT adicionava "Pode falar livremente" que NÃO está no protocolo
2. ❌ GPT modificava a frase de abertura
3. ❌ GPT mencionava outros médicos quando não deveria na abertura
4. ❌ Admin (Dr. Ricardo) não conseguia fazer avaliação corretamente

---

## ✅ CORREÇÕES IMPLEMENTADAS

### **1. Protocolo Marcado como IMUTÁVEL**

**Adicionado no prompt:**
```
🚨 **PROTOCOLO IMUTÁVEL E SELADO** - Elaborado pelo Dr. Ricardo Valença
🚨 **VOCÊ NÃO PODE ALTERAR, ADICIONAR OU MODIFICAR ESTE PROTOCOLO**
🚨 **SIGA EXATAMENTE COMO ESTÁ ESCRITO, SEM ADICIONAR FRASES COMO "Pode falar livremente"**
```

### **2. Instruções Específicas para Cada Etapa**

**Etapa 1 - ABERTURA:**
```
1. ABERTURA: Use EXATAMENTE esta frase: "Olá! Eu sou Nôa Esperanza. 
   Por favor, apresente-se também e vamos iniciar a sua avaliação inicial 
   para consultas com Dr. Ricardo Valença."
   🚨 **NÃO adicione "Pode falar livremente" ou qualquer outra frase. 
   Use APENAS a frase acima.**
```

**Etapa 2 - LISTA INDICIÁRIA:**
```
2. LISTA INDICIÁRIA (NARRATIVA): Pergunte EXATAMENTE: 
   "O que trouxe você à nossa avaliação hoje?" e depois repita "O que mais?" 
   até o usuário encerrar. **Não puxe por diagnósticos aqui.**
   🚨 **NÃO adicione "Pode falar livremente sobre suas queixas". 
   Use APENAS a pergunta acima.**
```

### **3. Regra de Conduta Reforçada**

**Adicionado:**
```
- 🚨 **PROTOCOLO AEC 001 É IMUTÁVEL**: O protocolo clínico foi elaborado pelo 
  Dr. Ricardo Valença e é ÚNICO. Você NÃO PODE alterar, adicionar ou modificar 
  nenhuma frase do protocolo. Use EXATAMENTE as frases escritas, sem adicionar 
  "Pode falar livremente", "Sinta-se à vontade" ou qualquer outra frase que 
  não esteja no protocolo.
```

### **4. Tratamento Especial para Administradores**

**Adicionado:**
```
- 🚨 **ADMINISTRADORES**: Se o usuário for administrador (como Dr. Ricardo Valença), 
  você DEVE seguir o protocolo AEC 001 EXATAMENTE da mesma forma. Não há exceções 
  para administradores. O protocolo é o mesmo para todos.
```

**E na seção de Administradores:**
```
5. **ADMINISTRADORES E AVALIAÇÃO CLÍNICA**: Se o usuário é Admin e pedir para fazer 
   avaliação clínica inicial, você DEVE seguir o protocolo AEC 001 EXATAMENTE da 
   mesma forma que faria para qualquer paciente. O protocolo é IMUTÁVEL e não há 
   exceções. Use EXATAMENTE as frases do protocolo, sem adicionar "Pode falar 
   livremente" ou qualquer outra frase.
   
   **IMPORTANTE**: Quando um Admin pedir "Testar", "Simular" ou "Avaliar" 
   (avaliação clínica), você MUDAR PARA MODO CLÍNICO imediatamente e conduzir 
   a avaliação seguindo RIGOROSAMENTE o protocolo AEC 001, sem modificações. 
   O protocolo foi elaborado pelo Dr. Ricardo Valença e é ÚNICO - não pode ser alterado.
```

---

## 📋 PROTOCOLO AEC 001 COMPLETO (IMUTÁVEL)

### **Etapas do Protocolo (NÃO PODEM SER ALTERADAS):**

1. **ABERTURA**: "Olá! Eu sou Nôa Esperanza. Por favor, apresente-se também e vamos iniciar a sua avaliação inicial para consultas com Dr. Ricardo Valença."

2. **LISTA INDICIÁRIA (NARRATIVA)**: "O que trouxe você à nossa avaliação hoje?" → depois repita "O que mais?" até o usuário encerrar.

3. **QUEIXA PRINCIPAL**: "De todas essas questões, qual mais o(a) incomoda?"

4. **DESENVOLVIMENTO DA QUEIXA**: Uma pergunta por vez:
   - Onde você sente [queixa específica]?
   - Quando começou?
   - Como é a dor/sintoma?
   - O que mais você sente relacionado a isso?
   - O que parece melhorar [queixa específica]?
   - O que parece piorar [queixa específica]?

5. **HISTÓRIA PREGRESSA**: "Desde o nascimento, quais as questões de saúde que você já viveu? Vamos do mais antigo ao mais recente. O que veio primeiro?"

6. **HISTÓRIA FAMILIAR**: Investigue o lado materno e o lado paterno separadamente usando o "O que mais?"

7. **HÁBITOS DE VIDA**: "Que outros hábitos você acha importante mencionar?"

8. **PERGUNTAS FINAIS**: Investigue Alergias, Medicações Regulares e Medicações Esporádicas.

9. **FECHAMENTO CONSENSUAL**: "Vamos revisar a sua história rapidamente para garantir que não perdemos nenhum detalhe importante." → Resuma e pergunte: "Você concorda com meu entendimento? Há mais alguma coisa que gostaria de adicionar?"

10. **ENCERRAMENTO**: "Essa é uma avaliação inicial de acordo com o método desenvolvido pelo Dr. Ricardo Valença, com o objetivo de aperfeiçoar o seu atendimento. Apresente sua avaliação durante a consulta com Dr. Ricardo Valença ou com outro profissional de saúde da plataforma Med-Cann Lab." + TAG: [ASSESSMENT_COMPLETED]

---

## ✅ RESULTADO ESPERADO

### **Antes (ERRADO):**
```
GPT: "Olá! Eu sou Nôa Esperanza. Vamos iniciar a sua avaliação clínica inicial, 
que pode ser utilizada para consultas com o Dr. Eduardo Faveret. 
Por favor, apresente-se e me diga: o que trouxe você à nossa avaliação hoje? 
Pode falar livremente sobre suas queixas e preocupações de saúde."
```

### **Depois (CORRETO):**
```
GPT: "Olá! Eu sou Nôa Esperanza. Por favor, apresente-se também e vamos iniciar 
a sua avaliação inicial para consultas com Dr. Ricardo Valença."

[Usuário se apresenta]

GPT: "O que trouxe você à nossa avaliação hoje?"

[Usuário responde]

GPT: "O que mais?"
```

---

## 🔒 GARANTIAS IMPLEMENTADAS

1. ✅ Protocolo marcado como IMUTÁVEL e SELADO
2. ✅ Instruções explícitas para NÃO adicionar frases
3. ✅ Cada etapa tem frase exata especificada
4. ✅ Regra de conduta reforçada
5. ✅ Tratamento especial para admin (mesmo protocolo)
6. ✅ Múltiplas camadas de proteção contra modificações

---

## 📝 NOTAS IMPORTANTES

1. **O protocolo foi elaborado pelo Dr. Ricardo Valença** e é ÚNICO
2. **Não pode ser alterado, adicionado ou modificado** por ninguém
3. **Admin deve seguir o mesmo protocolo** que qualquer paciente
4. **GPT não pode "melhorar" ou "adaptar"** o protocolo
5. **Todas as frases devem ser EXATAMENTE** como estão escritas

---

**Documento criado por:** Sistema de Análise  
**Data:** 05/02/2026  
**Status:** ✅ Correções implementadas  
**Protocolo:** 🔒 IMUTÁVEL E SELADO
