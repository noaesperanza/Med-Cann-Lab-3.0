
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

console.log('Connecting to Supabase for Audit...')
const supabase = createClient(supabaseUrl, supabaseKey)

async function auditUsers() {
    console.log('\n--- RELATÓRIO DE USUÁRIOS E PAPÉIS ---\n')

    // Tenta pegar todos os users (limit 100)
    const { data: users, error } = await supabase
        .from('users')
        .select('email, name, type, id')
        .order('type', { ascending: false }) // Admins primeiro (alfabeticamente 'admin' vem antes? nao. type usually 'admin', 'professional', 'patient'. 'patient' > 'professional' > 'admin' desc? vou ordenar por nome depois)

    if (error) {
        console.error('Erro ao auditar:', error.message)
        return
    }

    if (!users || users.length === 0) {
        console.log('Nenhum usuário encontrado na tabela public.users.')
        return
    }

    // Ordenar manualmente para ficar bonito: Admin -> Professional -> Patient
    const roleOrder = { 'admin': 1, 'professional': 2, 'patient': 3, 'student': 4, null: 5 }

    users.sort((a, b) => (roleOrder[a.type] || 5) - (roleOrder[b.type] || 5))

    console.table(users.map(u => ({
        Email: u.email,
        Nome: u.name?.substring(0, 20),
        Papel: u.type || 'SEM PAPEL (NULL)',
        ID_Final: '...' + u.id.slice(-6)
    })))

    console.log(`\nTotal de Usuários Listados: ${users.length}`)
}

auditUsers()
