
import { createClient } from '@supabase/supabase-js'
// import dotenv from 'dotenv' -- Removed to avoid dependency
import fs from 'fs'
import path from 'path'

// Tentar ler .env
const envPath = path.resolve(process.cwd(), '.env')
let fileEnv = {}
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8')
    content.split('\n').forEach(line => {
        const [key, val] = line.split('=')
        if (key && val) fileEnv[key.trim()] = val.trim()
    })
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL
// USAR A SERVICE ROLE KEY FORNECIDA PELO USUÁRIO SE NAO TIVER NO ENV
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZGprZnViZnptdm11eHhqb2FlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE2NTI5MCwiZXhwIjoyMDc2NzQxMjkwfQ.ah3Qfel7dN2x6Iyd1tY9evQaMR0OX8LpRZJXPvzr1fg'

console.log('Conectando ao Supabase...')
console.log('URL:', SUPABASE_URL)

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Erro: URL ou Service Role Key não encontrados.')
    process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function fixProfiles() {
    const targetId = 'a16f4505-9c52-4643-93cb-65f0f7568f0d'
    console.log(`🔍 Verificando usuário alvo: ${targetId}`)

    // 1. Verificar se existe em Auth
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(targetId)

    if (authError || !user) {
        console.log('❌ Usuário NÃO encontrado no Auth. (Provavelmente deletado)')
        console.log('💡 Solução: Recarregue a página do navegador para limpar o cache de pacientes.')
        return
    }

    console.log(`✅ Usuário encontrado no Auth: ${user.email}`)

    // 2. Verificar se existe em Public
    const { data: profile } = await supabase.from('users').select('*').eq('id', targetId).single()

    if (!profile) {
        console.log('⚠️ Usuário existe no Auth mas NÃO tem perfil público due to sync failure.')
        // Criar perfil
        const { error: insertError } = await supabase.from('users').insert({
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'Athanir Gusmão',
            type: 'paciente', // Forçar paciente
            created_at: user.created_at,
            updated_at: new Date().toISOString()
        })

        if (insertError) {
            console.error('❌ Falha ao criar perfil:', insertError)
        } else {
            console.log('✅ Perfil RECRIADO com sucesso!')
        }
    } else {
        console.log('✅ Perfil público JÁ EXISTE:', profile)
    }
}

fixProfiles().catch(console.error)
