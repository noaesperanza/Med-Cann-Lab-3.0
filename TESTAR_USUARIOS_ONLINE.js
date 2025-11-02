// =====================================================
// 🔍 TESTAR USUÁRIOS ONLINE - MEDCANLAB 3.0
// =====================================================
// Cole este código no console do navegador (F12) para testar usuários online

console.log('🔍 TESTANDO USUÁRIOS ONLINE...');

// 1. VERIFICAR USUÁRIOS ONLINE
console.log('👥 Verificando usuários online...');
if (window.supabase) {
  window.supabase
    .from('chat_messages')
    .select('user_id, user_name, user_avatar, crm, specialty, is_online, created_at')
    .eq('is_online', true)
    .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Últimos 5 minutos
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ ERRO AO CARREGAR USUÁRIOS ONLINE:', error);
      } else {
        console.log('✅ USUÁRIOS ONLINE:', data);
        console.log('📊 Total de usuários online:', data?.length || 0);
        
        // Remover duplicatas
        const uniqueUsers = data?.reduce((acc, msg) => {
          if (!acc.find(user => user.user_id === msg.user_id)) {
            acc.push({
              id: msg.user_id,
              name: msg.user_name,
              avatar: msg.user_avatar,
              crm: msg.crm,
              specialty: msg.specialty
            });
          }
          return acc;
        }, []) || [];
        
        console.log('👥 USUÁRIOS ÚNICOS ONLINE:', uniqueUsers);
        console.log('📊 Total de usuários únicos:', uniqueUsers.length);
      }
    });
} else {
  console.error('❌ SUPABASE NÃO ENCONTRADO');
}

// 2. VERIFICAR MENSAGENS RECENTES
console.log('💬 Verificando mensagens recentes...');
if (window.supabase) {
  window.supabase
    .from('chat_messages')
    .select('user_id, user_name, user_avatar, content, channel, created_at')
    .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Última hora
    .order('created_at', { ascending: false })
    .limit(10)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ ERRO AO CARREGAR MENSAGENS:', error);
      } else {
        console.log('✅ MENSAGENS RECENTES:', data);
        console.log('📊 Total de mensagens:', data?.length || 0);
      }
    });
}

// 3. VERIFICAR CANAIS
console.log('📋 Verificando canais...');
if (window.supabase) {
  window.supabase
    .from('chat_messages')
    .select('channel, user_id, created_at')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24 horas
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ ERRO AO CARREGAR CANAIS:', error);
      } else {
        console.log('✅ DADOS DOS CANAIS:', data);
        
        // Contar por canal
        const channelCounts = data?.reduce((acc, msg) => {
          acc[msg.channel] = (acc[msg.channel] || 0) + 1;
          return acc;
        }, {}) || {};
        
        console.log('📊 CONTAGEM POR CANAL:', channelCounts);
      }
    });
}

console.log('🔍 TESTE USUÁRIOS ONLINE CONCLUÍDO - Verifique os resultados acima');
