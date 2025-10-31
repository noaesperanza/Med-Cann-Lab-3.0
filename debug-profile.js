// Script para debug e correção do carregamento de perfil
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://itdjkfubfzmvmuxxjoae.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZGprZnViZnptdm11eHhqb2FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjUyOTAsImV4cCI6MjA3Njc0MTI5MH0.j9Kfff56O2cWs5ocInVHaUFcaNTS7lrUNwsKBh2KIFM'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugProfile() {
  console.log('🔍 Iniciando debug do perfil...')
  
  // 1. Verificar usuário atual
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  console.log('👤 Usuário atual:', user?.id)
  console.log('📧 Email:', user?.email)
  console.log('❌ Erro:', userError)
  
  if (!user) {
    console.log('❌ Nenhum usuário autenticado')
    return
  }
  
  // 2. Verificar se existe na tabela profiles
  console.log('🔍 Verificando tabela profiles...')
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()
  
  console.log('📋 Dados do perfil:', profileData)
  console.log('⚠️ Erro do perfil:', profileError)
  
  // 3. Se não existir, criar o perfil
  if (!profileData && !profileError) {
    console.log('➕ Criando perfil para o usuário...')
    
    const newProfile = {
      id: user.id,
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
      email: user.email,
      user_type: user.user_metadata?.user_type || 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
    
    console.log('✅ Perfil criado:', insertData)
    console.log('❌ Erro na criação:', insertError)
  }
  
  // 4. Verificar políticas RLS
  console.log('🔒 Verificando políticas RLS...')
  const { data: policies, error: policiesError } = await supabase
    .rpc('get_table_policies', { table_name: 'profiles' })
  
  console.log('📋 Políticas RLS:', policies)
  console.log('❌ Erro nas políticas:', policiesError)
  
  // 5. Testar consulta simples
  console.log('🧪 Testando consulta simples...')
  const { data: testData, error: testError } = await supabase
    .from('profiles')
    .select('id, name, user_type')
    .limit(1)
  
  console.log('📊 Dados de teste:', testData)
  console.log('❌ Erro de teste:', testError)
}

// Executar o debug
debugProfile().catch(console.error)
