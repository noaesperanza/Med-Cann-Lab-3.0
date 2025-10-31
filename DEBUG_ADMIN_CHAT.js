// =====================================================
// 🔍 DEBUG ADMIN CHAT - MEDCANLAB 3.0
// =====================================================
// Cole este código no console do navegador (F12) para debug do admin

console.log('🔍 INICIANDO DEBUG DO CHAT ADMIN...');

// 1. VERIFICAR USUÁRIO ADMIN
console.log('👤 USUÁRIO ADMIN:');
console.log('user:', window.user || 'Não encontrado');
console.log('user.id:', window.user?.id || 'Não encontrado');
console.log('user.name:', window.user?.name || 'Não encontrado');
console.log('user.type:', window.user?.type || 'Não encontrado');
console.log('user.crm:', window.user?.crm || 'Não encontrado');

// 2. VERIFICAR ESTADO DO CHAT
console.log('💬 ESTADO DO CHAT:');
console.log('activeChannel:', window.activeChannel || 'Não encontrado');
console.log('message:', window.message || 'Não encontrado');
console.log('messages.length:', window.messages?.length || 'Não encontrado');

// 3. VERIFICAR FUNÇÃO DE ENVIO
console.log('📤 TESTANDO FUNÇÃO DE ENVIO...');
if (window.handleSendMessage) {
  console.log('✅ Função handleSendMessage encontrada');
} else {
  console.log('❌ Função handleSendMessage NÃO encontrada');
}

// 4. TESTAR ENVIO MANUAL COM DADOS DO ADMIN
console.log('🧪 TESTANDO ENVIO MANUAL DO ADMIN...');
if (window.supabase && window.user) {
  const testMessage = {
    user_id: window.user.id,
    user_name: window.user.name || 'Admin',
    user_avatar: 'A',
    content: 'Teste do admin - ' + new Date().toISOString(),
    channel: 'general',
    crm: window.user.crm || 'ADMIN',
    specialty: 'Administrador',
    type: 'text',
    reactions: { heart: 0, thumbs: 0, reply: 0 },
    is_pinned: false,
    is_online: true
  };
  
  console.log('📤 Dados da mensagem:', testMessage);
  
  window.supabase
    .from('chat_messages')
    .insert(testMessage)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ ERRO NO ENVIO DO ADMIN:', error);
        console.error('❌ Detalhes do erro:', error.message);
        console.error('❌ Código do erro:', error.code);
      } else {
        console.log('✅ ENVIO DO ADMIN BEM-SUCEDIDO:', data);
      }
    });
} else {
  console.error('❌ SUPABASE OU USUÁRIO ADMIN NÃO ENCONTRADO');
}

// 5. VERIFICAR MENSAGENS EXISTENTES
console.log('📋 MENSAGENS EXISTENTES:');
if (window.supabase) {
  window.supabase
    .from('chat_messages')
    .select('*')
    .eq('channel', 'general')
    .order('created_at', { ascending: false })
    .limit(10)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ ERRO AO CARREGAR MENSAGENS:', error);
      } else {
        console.log('✅ MENSAGENS CARREGADAS:', data);
        console.log('📊 Total de mensagens:', data?.length || 0);
      }
    });
}

// 6. VERIFICAR SE O USUÁRIO ESTÁ REALMENTE LOGADO
console.log('🔐 VERIFICANDO AUTENTICAÇÃO:');
if (window.supabase) {
  window.supabase.auth.getUser().then(({ data: { user }, error }) => {
    if (error) {
      console.error('❌ ERRO DE AUTENTICAÇÃO:', error);
    } else {
      console.log('✅ USUÁRIO AUTENTICADO:', user);
      console.log('✅ ID do usuário:', user?.id);
      console.log('✅ Email do usuário:', user?.email);
    }
  });
}

console.log('🔍 DEBUG ADMIN CONCLUÍDO - Verifique os resultados acima');
