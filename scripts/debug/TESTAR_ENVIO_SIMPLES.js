// =====================================================
// 🔍 TESTAR ENVIO SIMPLES - MEDCANLAB 3.0
// =====================================================
// Cole este código no console do navegador (F12) para testar envio simples

console.log('🔍 TESTANDO ENVIO SIMPLES...');

// Função de teste simplificada
async function testarEnvioSimples() {
  console.log('🚀 INICIANDO TESTE DE ENVIO SIMPLES...');
  
  try {
    const messageData = {
      user_id: '5b20ecec-ee1a-4a45-ba76-a8fa04dfe9f8',
      user_name: 'Teste Simples',
      user_avatar: 'T',
      content: 'Teste Simples - ' + new Date().toISOString(),
      channel: 'general',
      crm: 'ADMIN',
      specialty: 'Teste',
      type: 'text',
      reactions: { heart: 0, thumbs: 0, reply: 0 },
      is_pinned: false,
      is_online: true
    };
    
    console.log('📤 Dados da mensagem:', messageData);
    console.log('🔄 Enviando para Supabase...');
    
    const startTime = Date.now();
    
    const { data, error } = await window.supabase
      .from('chat_messages')
      .insert(messageData);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('⏱️ Duração:', duration + 'ms');
    console.log('📊 Data:', data);
    console.log('❌ Error:', error);
    
    if (error) {
      console.error('❌ ERRO:', error);
    } else {
      console.log('✅ SUCESSO:', data);
    }
    
  } catch (error) {
    console.error('❌ ERRO CATCH:', error);
  }
}

// Executar teste
testarEnvioSimples();

console.log('🔍 TESTE DE ENVIO SIMPLES CONCLUÍDO');
