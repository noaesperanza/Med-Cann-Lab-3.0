# Changelog - Sessão 22/12/2025

## 🐛 Correções de Bugs (Chat)
- **Correção Erro 400 (Bad Request):** Ajustado `PatientChat.tsx` para usar a coluna correta `room_id` ao invés de `chat_id` (mismatch de schema).
- **Correção de Visibilidade de Mensagens:**
  - Identificado e corrigido problema onde mensagens eram enviadas mas não visualizadas devido a Row Level Security (RLS) bloqueando leitura em salas sem participantes.
  - Criado script de diagnóstico e reparo (`debug-chat.cjs`) para restaurar salas inconsistentes no Supabase.
  - Implementado header de contexto ("Conversando com: Nome") para clareza visual.
  - Removido código duplicado de renderização que causava erros de interface.

## 📱 Interface (Mobile)
- **Header Mobile:**
  - Corrigido layout quebrado onde Avatar e Seletores ficavam fora da barra.
  - **Layout Final Mobile:**
    - Esquerda: Menu + Bandeira.
    - Centro: Seletor de Perfil (Absoluto).
    - Direita: Avatar.
  - Removido `transform` CSS que desalinhava o Avatar.
  - Organizado container Flexbox para melhor distribuição dos itens no mobile.

## 🛠️ Outros
- Atualização de dependências e scripts de debug temporários.
