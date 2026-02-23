
# Corrigir Erros de Build + Porta 8080 (Lovable)

## Contexto
O projeto medcannlab5 foi carregado no Lovable mas apresenta 6 categorias de erros de build do TypeScript que impedem a execução. O Lovable **exige a porta 8080** internamente (o preview funciona nela), então a porta não pode ser mudada para 3000 aqui dentro. Mas todos os erros de compilação serão corrigidos para o projeto rodar.

Sobre o script `build:dev` que está faltando: você precisará adicionar manualmente via Code Editor no `package.json`, na seção `"scripts"`:
```json
"build:dev": "vite build --mode development"
```

---

## Erros a Corrigir (6 categorias)

### 1. `AlunoDashboard.tsx` — `useAuth` e `supabase` não importados
- O arquivo importa `useNoaPlatform` e `useDashboardTriggers` mas **não importa** `useAuth` nem `supabase`
- **Correção**: adicionar `import { useAuth } from '../contexts/AuthContext'` e `import { supabase } from '../lib/supabase'`

### 2. `AlunoDashboard.tsx` — `DashboardTriggerOption` espera `LucideIcon`, não `ComponentType`
- O tipo `DashboardTriggerOption.icon` exige `LucideIcon` (que é `ForwardRefExoticComponent`)
- Os `navItems` são construídos com ícones Lucide mas o TypeScript não consegue inferir que são `LucideIcon`
- **Correção**: tipar explicitamente o array `navItems` como `DashboardTriggerOption[]`

### 3. `AlunoDashboard.tsx` — `NoaConversationalInterface` não importado
- Linha 1855 usa `<NoaConversationalInterface>` mas não há import do componente
- **Correção**: adicionar `import NoaConversationalInterface from '../components/NoaConversationalInterface'`

### 4. `NoaConversationalInterface.tsx` — Comparação `resolvedVariant === 'clean'` dentro de bloco `!== 'clean'`
- Linhas 2177 e 2180: dentro de um bloco `{resolvedVariant !== 'clean' && ...}`, ainda compara `resolvedVariant === 'clean'` — TypeScript detecta como comparação impossível (tipo `'default'` vs `'clean'`)
- **Correção**: simplificar as classes CSS dentro do bloco, removendo a comparação redundante (usar sempre o estilo `'default'` pois já sabemos que não é `'clean'`)

### 5. `VideoCall.tsx` — `scope` duplicado e `srcObject` inválido em JSX
- Linha 321: o objeto `consent_snapshot` tem `scope` duplicado (definido explicitamente e também via spread de `VIDEO_CALL_CONSENT_POLICY`)
- Linhas 668: `srcObject` não é um atributo HTML padrão de `<video>` no JSX do React — deve ser atribuído via `ref` no `useEffect`
- **Correção para scope**: remover a propriedade `scope` explícita (deixar vir apenas do spread)
- **Correção para srcObject**: usar `useEffect` para atribuir `videoRef.current.srcObject = stream` diretamente no DOM em vez de via prop JSX

### 6. `acIntegration.ts` — Usa `Deno.env` em arquivo do frontend
- O arquivo `src/lib/acIntegration.ts` tem uma função `getACProviderFromEnv` que usa a API `Deno` (ambiente de Edge Functions), mas está dentro de `src/lib/` (frontend Vite/React)
- **Correção**: envolver com `try/catch` usando `typeof Deno !== 'undefined'` ou substituir `Deno.env.get(...)` por `import.meta.env.VITE_...` para compatibilidade com Vite, ou simplesmente mover essa função para um arquivo separado que não é importado pelo bundle do frontend

### 7. `ClinicalGovernanceDemo.tsx` — `.catch()` em `PromiseLike`
- Linha 188: a query Supabase usa `.then(r => r).catch(...)` mas o retorno de `.then()` é `PromiseLike`, que não tem `.catch()`
- **Correção**: usar `.then(r => r, () => ({ data: [] }))` ou adicionar `await` com try/catch

---

## Sobre a porta

O Lovable **usa internamente a porta 8080** para o preview — isso não pode ser mudado. Quando você rodar localmente na sua máquina (fora do Lovable), o `vite.config.ts` pode ser ajustado para 3000. Por ora, deixaremos em 8080 para o Lovable funcionar e incluiremos um comentário explicativo no config.

---

## Arquivos a modificar

1. `src/pages/AlunoDashboard.tsx` — Adicionar 3 imports + tipar navItems
2. `src/components/NoaConversationalInterface.tsx` — Remover comparações redundantes nas linhas 2177 e 2180
3. `src/components/VideoCall.tsx` — Remover `scope` duplicado + corrigir `srcObject`
4. `src/lib/acIntegration.ts` — Substituir `Deno.env` por `import.meta.env` (ou guard de tipo)
5. `src/pages/ClinicalGovernanceDemo.tsx` — Corrigir `.catch()` no `PromiseLike`

---

## Acao manual necessaria (voce mesmo)

No Code Editor do Lovable, abra `package.json` e adicione na secao `"scripts"`:
```json
"build:dev": "vite build --mode development"
```
