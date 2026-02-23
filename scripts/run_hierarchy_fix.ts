
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

// Tenta usar a SERVICE_ROLE_KEY se disponível, senão usa a ANON (que pode falhar por RLS)
const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

console.log('Connecting to Supabase...')
const supabase = createClient(supabaseUrl, supabaseKey)

async function updateUserType(email, type) {
    if (!email) return

    // Primeiro tenta buscar pelo id
    const { data: users, error: searchError } = await supabase
        .from('users')
        .select('id, name, email')
        .ilike('email', email)

    if (searchError) {
        console.error(`Error searching ${email}:`, searchError.message)
        return
    }

    if (!users || users.length === 0) {
        console.warn(`User ${email} not found.`)
        return
    }

    for (const user of users) {
        const { error: updateError } = await supabase
            .from('users')
            .update({ type: type })
            .eq('id', user.id)

        if (updateError) {
            console.error(`Failed to update ${user.email} (${user.name}) to ${type}:`, updateError.message)
        } else {
            console.log(`✅ Success: ${user.email} (${user.name}) is now ${type}`)
        }
    }
}

async function fixHierarchy() {
    console.log('--- STARTING HIERARCHY FIX ---')

    // 1. ADMINS
    await updateUserType('phpg69@gmail.com', 'admin')
    await updateUserType('cbdrcpremium@gmail.com', 'admin')
    await updateUserType('rrvalenca@gmail.com', 'admin')
    await updateUserType('eduardocfaveret@gmail.com', 'admin')

    // 2. PROFESSIONALS
    await updateUserType('inoaviana@gmail.com', 'professional')

    // Busca Dayana pelo nome
    const { data: dayanas, error } = await supabase
        .from('users')
        .select('email, name')
        .ilike('name', '%dayana%')

    if (dayanas && dayanas.length > 0) {
        for (const d of dayanas) {
            await updateUserType(d.email, 'professional')
        }
    } else {
        console.warn('⚠️ Dayana not found by name.')
    }

    console.log('--- DONE ---')
}

fixHierarchy()
