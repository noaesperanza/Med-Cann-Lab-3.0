// 🔄 RESETAR ESTADO DO CHAT - CONSOLE DO NAVEGADOR
// Cole este código no console do navegador (F12 > Console)

console.log('🔄 Resetando estado do chat...')

// 1. Verificar se o componente está montado
const chatComponent = document.querySelector('[data-testid="chat-global"]') || document.querySelector('.chat-global')
if (chatComponent) {
  console.log('✅ Componente chat encontrado')
} else {
  console.log('❌ Componente chat não encontrado')
}

// 2. Tentar acessar o estado via React DevTools (se disponível)
if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
  console.log('✅ React DevTools disponível')
} else {
  console.log('❌ React DevTools não disponível')
}

// 3. Forçar reload da página para resetar estado
console.log('🔄 Recarregando página para resetar estado...')
window.location.reload()

// 4. Alternativa: Tentar resetar via localStorage
localStorage.removeItem('chat-sending-state')
sessionStorage.removeItem('chat-sending-state')

console.log('✅ Estado resetado! Recarregue a página.')
