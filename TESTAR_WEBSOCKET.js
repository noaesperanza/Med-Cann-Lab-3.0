// =====================================================
// 🔍 TESTAR WEBSOCKET - MEDCANLAB 3.0
// =====================================================
// Cole este código no console do navegador (F12) para testar WebSocket

console.log('🔍 TESTANDO WEBSOCKET...');

// 1. VERIFICAR CONEXÃO SUPABASE
console.log('🔗 Verificando Supabase...');
if (window.supabase) {
  console.log('✅ Supabase encontrado');
  console.log('🔗 URL:', window.supabase.supabaseUrl);
  console.log('🔑 Key presente:', window.supabase.supabaseKey ? 'Sim' : 'Não');
} else {
  console.error('❌ Supabase não encontrado');
  return;
}

// 2. TESTAR CONEXÃO BÁSICA
console.log('🧪 Testando conexão básica...');
window.supabase
  .from('chat_messages')
  .select('count(*)')
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ ERRO DE CONEXÃO:', error);
      console.error('❌ Código:', error.code);
      console.error('❌ Mensagem:', error.message);
    } else {
      console.log('✅ CONEXÃO OK:', data);
    }
  })
  .catch((err) => {
    console.error('❌ ERRO CATCH:', err);
  });

// 3. TESTAR INSERÇÃO SIMPLES
console.log('📤 Testando inserção simples...');
const testMessage = {
  user_id: '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8',
  user_name: 'Teste WebSocket',
  user_avatar: 'T',
  content: 'Teste WebSocket - ' + new Date().toISOString(),
  channel: 'general',
  crm: 'ADMIN',
  specialty: 'Teste',
  type: 'text',
  reactions: { heart: 0, thumbs: 0, reply: 0 },
  is_pinned: false,
  is_online: true
};

console.log('📤 Dados da mensagem:', testMessage);

const startTime = Date.now();
window.supabase
  .from('chat_messages')
  .insert(testMessage)
  .then(({ data, error }) => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('⏱️ Duração:', duration + 'ms');
    
    if (error) {
      console.error('❌ ERRO NA INSERÇÃO:', error);
      console.error('❌ Código:', error.code);
      console.error('❌ Mensagem:', error.message);
      console.error('❌ Detalhes:', error.details);
    } else {
      console.log('✅ INSERÇÃO BEM-SUCEDIDA:', data);
    }
  })
  .catch((err) => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error('❌ ERRO CATCH NA INSERÇÃO:', err);
    console.log('⏱️ Duração:', duration + 'ms');
  });

// 4. VERIFICAR AUTENTICAÇÃO
console.log('🔐 Verificando autenticação...');
window.supabase.auth.getUser().then(({ data: { user }, error }) => {
  if (error) {
    console.error('❌ ERRO DE AUTENTICAÇÃO:', error);
  } else {
    console.log('✅ USUÁRIO AUTENTICADO:', user);
    console.log('✅ ID:', user?.id);
    console.log('✅ Email:', user?.email);
  }
});

console.log('🔍 TESTE WEBSOCKET CONCLUÍDO - Verifique os resultados acima');
