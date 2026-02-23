// =====================================================
// 🔍 DEBUG TIMEOUT CHAT - MEDCANLAB 3.0
// =====================================================
// Cole este código no console do navegador (F12) para debug de timeout

console.log('🔍 INICIANDO DEBUG DE TIMEOUT...');

// 1. VERIFICAR CONEXÃO SUPABASE
console.log('🔗 VERIFICANDO CONEXÃO SUPABASE...');
if (window.supabase) {
  console.log('✅ Supabase encontrado');
  
  // Testar conexão básica
  window.supabase
    .from('chat_messages')
    .select('count(*)')
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ ERRO DE CONEXÃO:', error);
      } else {
        console.log('✅ CONEXÃO OK:', data);
      }
    });
} else {
  console.error('❌ SUPABASE NÃO ENCONTRADO');
}

// 2. TESTAR INSERÇÃO COM TIMEOUT
console.log('⏱️ TESTANDO INSERÇÃO COM TIMEOUT...');
if (window.supabase) {
  const startTime = Date.now();
  
  const testMessage = {
    user_id: '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8',
    user_name: 'Teste Timeout',
    user_avatar: 'T',
    content: 'Teste Timeout - ' + new Date().toISOString(),
    channel: 'general',
    crm: 'ADMIN',
    specialty: 'Teste',
    type: 'text',
    reactions: { heart: 0, thumbs: 0, reply: 0 },
    is_pinned: false,
    is_online: true
  };
  
  console.log('📤 Enviando mensagem de teste...');
  
  const promise = window.supabase
    .from('chat_messages')
    .insert(testMessage);
  
  // Adicionar timeout de 10 segundos
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('TIMEOUT após 10 segundos')), 10000);
  });
  
  Promise.race([promise, timeoutPromise])
    .then((result) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('✅ INSERÇÃO BEM-SUCEDIDA:', result);
      console.log('⏱️ Duração:', duration + 'ms');
    })
    .catch((error) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.error('❌ ERRO OU TIMEOUT:', error);
      console.log('⏱️ Duração:', duration + 'ms');
    });
}

// 3. VERIFICAR CONFIGURAÇÃO DO SUPABASE
console.log('⚙️ VERIFICANDO CONFIGURAÇÃO...');
if (window.supabase) {
  console.log('🔗 URL:', window.supabase.supabaseUrl);
  console.log('🔑 Key:', window.supabase.supabaseKey ? 'Presente' : 'Ausente');
}

// 4. VERIFICAR AUTENTICAÇÃO
console.log('🔐 VERIFICANDO AUTENTICAÇÃO...');
if (window.supabase) {
  window.supabase.auth.getUser().then(({ data: { user }, error }) => {
    if (error) {
      console.error('❌ ERRO DE AUTENTICAÇÃO:', error);
    } else {
      console.log('✅ USUÁRIO AUTENTICADO:', user);
      console.log('✅ ID:', user?.id);
      console.log('✅ Email:', user?.email);
    }
  });
}

console.log('🔍 DEBUG TIMEOUT CONCLUÍDO - Verifique os resultados acima');
