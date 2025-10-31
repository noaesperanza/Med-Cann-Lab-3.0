// =====================================================
// 🔍 DEBUG FRONTEND CHAT - MEDCANLAB 3.0
// =====================================================
// Cole este código no console do navegador (F12) para debug

console.log('🔍 INICIANDO DEBUG DO CHAT...');

// 1. VERIFICAR USUÁRIO ATUAL
console.log('👤 USUÁRIO ATUAL:');
console.log('user:', window.user || 'Não encontrado');
console.log('user.id:', window.user?.id || 'Não encontrado');
console.log('user.name:', window.user?.name || 'Não encontrado');
console.log('user.type:', window.user?.type || 'Não encontrado');

// 2. VERIFICAR ESTADO DO CHAT
console.log('💬 ESTADO DO CHAT:');
console.log('activeChannel:', window.activeChannel || 'Não encontrado');
console.log('message:', window.message || 'Não encontrado');
console.log('messages.length:', window.messages?.length || 'Não encontrado');

// 3. VERIFICAR CONEXÃO SUPABASE
console.log('🔗 CONEXÃO SUPABASE:');
console.log('supabase:', window.supabase ? 'Conectado' : 'Não encontrado');

// 4. TESTAR ENVIO MANUAL
console.log('🧪 TESTANDO ENVIO MANUAL...');
if (window.supabase && window.user) {
  window.supabase
    .from('chat_messages')
    .insert({
      user_id: window.user.id,
      user_name: window.user.name || 'Usuário',
      user_avatar: 'U',
      content: 'Teste manual do console - ' + new Date().toISOString(),
      channel: 'general',
      crm: window.user.crm || '',
      specialty: '',
      type: 'text',
      reactions: { heart: 0, thumbs: 0, reply: 0 },
      is_pinned: false,
      is_online: true
    })
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ ERRO NO ENVIO:', error);
      } else {
        console.log('✅ ENVIO BEM-SUCEDIDO:', data);
      }
    });
} else {
  console.error('❌ SUPABASE OU USUÁRIO NÃO ENCONTRADO');
}

// 5. VERIFICAR MENSAGENS EXISTENTES
console.log('📋 MENSAGENS EXISTENTES:');
if (window.supabase) {
  window.supabase
    .from('chat_messages')
    .select('*')
    .eq('channel', 'general')
    .order('created_at', { ascending: false })
    .limit(5)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ ERRO AO CARREGAR:', error);
      } else {
        console.log('✅ MENSAGENS CARREGADAS:', data);
      }
    });
}

console.log('🔍 DEBUG CONCLUÍDO - Verifique os resultados acima');
