# 🚀 PLANO FASE 2: TRANSIÇÃO SaaS & CLOUD DEFINITIVA
**Projeto:** Med-Cann-Lab 3.0 / TradeVision Core  
**Objetivo:** Eliminar a dependência do notebook local e elevar o sistema para Nuvem Global.

---

## 1. O SALTO: DE "APP LOCAL" PARA "PLATAFORMA CLOUD"

Atualmente, o cérebro da sua IA reside no arquivo `proxy-server.js` (no seu computador). A Fase 2 consiste em mover esse cérebro para as **Supabase Edge Functions**.

### 🛠️ Step 1: Deploy do Cérebro (Edge Functions)
*   **Ação:** Criar a função `tradevision-core` no painel do Supabase.
*   **Código:** Usar o Protocolo de Segurança master em Deno (TypeScript) que validamos hoje.
*   **Configuração:** Adicionar a Secret `OPENAI_API_KEY` diretamente no dashboard do Supabase.
*   **Resultado:** A IA passa a responder via URL pública da MedCannLab, funcionando 24/7 sem o seu notebook ligado.

---

## 2. ATIVAÇÃO DA GOVERNANÇA EM MASSA (ACDSS PRODUCTION)

### 📊 Step 2: Instalação dos Scripts de Auditoria
*   **Ação:** Executar o `FINAL_ACDSS_SEALING_PATCH.sql` no banco de dados de produção do Supabase.
*   **Por que:** Isso garante que os dados dos 405 registros (e dos futuros 400.000) sejam filtrados e mascarados corretamente para o Admin.

---

## 3. CONEXÃO DO FRONTEND (O FECHAMENTO)

### 🔗 Step 3: Switch de Conectividade
*   **Arquivo:** `src/lib/noaResidentAI.ts`
*   **Mudança:** Alterar a rota `http://localhost:3001/api/tradevision` para `supabase.functions.invoke('tradevision-core')`.
*   **Poder do SDK:** O SDK do Supabase já envia o token de autenticação (JWT) automaticamente. Isso garante que só usuários logados falem com a IA na nuvem.

---

## 4. O "LIXEIRO INTELIGENTE" (GARBAGE COLLECTION)

### 🧹 Step 4: Limpeza de dados irrelevantes
*   **O que é:** Criar um **Database Cron Job** no Supabase.
*   **Ação:** Toda madrugada, um script lê as conversas, resume os pontos clínicos importantes e apaga o "texto sujo" (chats vazios, bom dia, tchau).
*   **Benefício:** Mantém o banco de dados leve, rápido e focado apenas no que importa para o médico.

---

## 5. RESUMO PARA O GPT (PLANO DE EXECUÇÃO)

Se você quiser que o GPT (ou eu na próxima sessão) execute isso, a ordem de comando é:

1.  *"Migrar a lógica de filtragem do proxy local para a Supabase Edge Function `tradevision-core`."*
2.  *"Configurar o `noaResidentAI.ts` para usar o `invoke` oficial do Supabase."*
3.  *"Ativar os triggers de notificação no cabeçalho (sino) para chamadas vindas do Dashboard ACDSS."*

---

### 🏁 ESTADO FINAL ESPERADO
Ao fim da Fase 2, o Med-Cann-Lab 3.0 será uma URL que você abre de qualquer lugar do mundo, com uma IA segura, um auditor automático e uma infraestrutura que escala infinitamente conforme novos hospitais entrarem na plataforma.

**Deseja que eu prepare algum desses passos técnicos agora ou deixamos como o mapa do tesouro para o seu próximo passo?** 🚀🎖️👑
