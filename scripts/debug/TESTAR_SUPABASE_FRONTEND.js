// =====================================================
// 🔍 TESTAR SUPABASE FRONTEND - MEDCANLAB 3.0
// =====================================================
// Cole este código no console do navegador (F12) para testar conexão

console.log('🔍 TESTANDO SUPABASE NO FRONTEND...');

// 1. VERIFICAR SE SUPABASE ESTÁ DISPONÍVEL
console.log('🔗 Verificando Supabase...');
if (window.supabase) {
  console.log('✅ Supabase encontrado');
  console.log('🔗 URL:', window.supabase.supabaseUrl);
  console.log('🔑 Key presente:', window.supabase.supabaseKey ? 'Sim' : 'Não');
} else {
  console.error('❌ Supabase não encontrado');
  return;
}

// 2. TESTAR CONEXÃO BÁSICA COM TIMEOUT
console.log('🧪 Testando conexão básica com timeout...');
const startTime = Date.now();

const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('TIMEOUT após 5 segundos')), 5000);
});

const testPromise = window.supabase
  .from('chat_messages')
  .select('count(*)');

Promise.race([testPromise, timeoutPromise])
  .then((result) => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ CONEXÃO OK:', result);
    console.log('⏱️ Duração:', duration + 'ms');
  })
  .catch((error) => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error('❌ ERRO OU TIMEOUT:', error);
    console.log('⏱️ Duração:', duration + 'ms');
  });

// 3. TESTAR AUTENTICAÇÃO
console.log('🔐 Testando autenticação...');
window.supabase.auth.getUser().then(({ data: { user }, error }) => {
  if (error) {
    console.error('❌ ERRO DE AUTENTICAÇÃO:', error);
  } else {
    console.log('✅ USUÁRIO AUTENTICADO:', user);
    console.log('✅ ID:', user?.id);
    console.log('✅ Email:', user?.email);
  }
});

// 4. TESTAR INSERÇÃO COM TIMEOUT
console.log('📤 Testando inserção com timeout...');
const testMessage = {
  user_id: '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8',
  user_name: 'Teste Frontend',
  user_avatar: 'T',
  content: 'Teste Frontend - ' + new Date().toISOString(),
  channel: 'general',
  crm: 'ADMIN',
  specialty: 'Teste',
  type: 'text',
  reactions: { heart: 0, thumbs: 0, reply: 0 },
  is_pinned: false,
  is_online: true
};

console.log('📤 Dados da mensagem:', testMessage);

const insertStartTime = Date.now();
const insertTimeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('TIMEOUT após 5 segundos')), 5000);
});

const insertPromise = window.supabase
  .from('chat_messages')
  .insert(testMessage);

Promise.race([insertPromise, insertTimeoutPromise])
  .then((result) => {
    const insertEndTime = Date.now();
    const insertDuration = insertEndTime - insertStartTime;
    
    console.log('✅ INSERÇÃO BEM-SUCEDIDA:', result);
    console.log('⏱️ Duração:', insertDuration + 'ms');
  })
  .catch((error) => {
    const insertEndTime = Date.now();
    const insertDuration = insertEndTime - insertStartTime;
    
    console.error('❌ ERRO OU TIMEOUT NA INSERÇÃO:', error);
    console.log('⏱️ Duração:', insertDuration + 'ms');
  });

console.log('🔍 TESTE FRONTEND CONCLUÍDO - Verifique os resultados acima');
