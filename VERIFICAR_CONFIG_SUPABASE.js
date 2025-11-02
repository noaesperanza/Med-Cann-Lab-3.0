// =====================================================
// 🔍 VERIFICAR CONFIGURAÇÃO SUPABASE - MEDCANLAB 3.0
// =====================================================
// Cole este código no console do navegador (F12) para verificar configuração

console.log('🔍 VERIFICANDO CONFIGURAÇÃO SUPABASE...');

// 1. VERIFICAR SE SUPABASE ESTÁ DISPONÍVEL
console.log('🔗 Verificando Supabase...');
if (window.supabase) {
  console.log('✅ Supabase encontrado');
  console.log('🔗 URL:', window.supabase.supabaseUrl);
  console.log('🔑 Key presente:', window.supabase.supabaseKey ? 'Sim' : 'Não');
  console.log('🔑 Key (primeiros 20 chars):', window.supabase.supabaseKey?.substring(0, 20) + '...');
} else {
  console.error('❌ Supabase não encontrado');
  return;
}

// 2. VERIFICAR AUTENTICAÇÃO
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

// 3. TESTAR CONEXÃO BÁSICA
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

// 4. VERIFICAR CONFIGURAÇÃO DO PROJETO
console.log('⚙️ Verificando configuração do projeto...');
console.log('🌐 URL atual:', window.location.href);
console.log('🔧 Ambiente:', process.env.NODE_ENV || 'desenvolvimento');

// 5. TESTAR INSERÇÃO MUITO SIMPLES
console.log('📤 Testando inserção muito simples...');
const testMessage = {
  user_id: '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8',
  user_name: 'Teste Config',
  user_avatar: 'T',
  content: 'Teste Config - ' + new Date().toISOString(),
  channel: 'general',
  crm: 'ADMIN',
  specialty: 'Teste',
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
      console.error('❌ ERRO NA INSERÇÃO:', error);
      console.error('❌ Código:', error.code);
      console.error('❌ Mensagem:', error.message);
      console.error('❌ Detalhes:', error.details);
    } else {
      console.log('✅ INSERÇÃO BEM-SUCEDIDA:', data);
    }
  })
  .catch((err) => {
    console.error('❌ ERRO CATCH NA INSERÇÃO:', err);
  });

console.log('🔍 VERIFICAÇÃO DE CONFIGURAÇÃO CONCLUÍDA - Verifique os resultados acima');
