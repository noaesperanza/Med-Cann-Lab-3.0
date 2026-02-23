// Script para testar conexão com Supabase (Node.js apenas — não é executado pelo Vite)
// Execute via: node scripts/debug/test-supabase-connection.js

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://itdjkfubfzmvmuxxjoae.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZGprZnViZnptdm11eHhqb2FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjUyOTAsImV4cCI6MjA3Njc0MTI5MH0.j9Kfff56O2cWs5ocInVHaUFcaNTS7lrUNwsKBh2KIFM'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

console.log('🔗 Testando conexão com Supabase...')
console.log('📍 URL:', SUPABASE_URL)

try {
    const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true })

    if (error) {
        console.error('❌ Erro ao conectar ao Supabase:', error.message)
        process.exit(1)
    }

    console.log('✅ Conexão com Supabase estabelecida!')
    console.log('📊 Total de usuários:', data)

    const { data: session } = await supabase.auth.getSession()
    if (session) {
        console.log('✅ Sessão ativa:', session.session?.user?.email)
    } else {
        console.log('ℹ️  Nenhuma sessão ativa (esperado antes do login)')
    }

    console.log('\n🎉 Todos os testes passaram!')

} catch (err) {
    console.error('❌ Erro inesperado:', err)
    process.exit(1)
}
