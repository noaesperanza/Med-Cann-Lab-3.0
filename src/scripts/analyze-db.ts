import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://itdjkfubfzmvmuxxjoae.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZGprZnViZnptdm11eHhqb2FlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjUyOTAsImV4cCI6MjA3Njc0MTI5MH0.j9Kfff56O2cWs5ocInVHaUFcaNTS7lrUNwsKBh2KIFM'
)

const tables = [
    'users', 'profiles', 'chat_messages', 'chat_rooms', 'documents',
    'knowledge_base', 'noa_knowledge_documents', 'imre_assessments',
    'clinical_reports', 'clinical_assessments', 'appointments',
    'prescriptions', 'courses', 'course_modules', 'enrollments',
    'gamification_points', 'badges', 'notifications', 'user_interactions',
    'moderator_requests', 'patient_health_history', 'subscriptions',
    'financial_transactions', 'prescription_templates', 'newsletter_items',
    'assignments', 'patient_professional_links'
]

console.log('🔍 Análise Completa do Supabase - MedCannLab 3.0\n')
console.log('='.repeat(80))

let totalRecords = 0
let tablesWithData = 0
let emptyTables = 0
const results = []

for (const table of tables) {
    try {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })

        if (count !== null) {
            if (count > 0) {
                const { data } = await supabase.from(table).select('*').limit(2)
                const columns = data?.[0] ? Object.keys(data[0]) : []

                results.push({ table, count, columns, sample: data })
                tablesWithData++
                totalRecords += count

                console.log(`\n✅ ${table}`)
                console.log(`   📊 Registros: ${count}`)
                console.log(`   📋 Colunas: ${columns.join(', ')}`)
                if (data?.[0]) {
                    console.log(`   📄 Exemplo:`, JSON.stringify(data[0], null, 2).substring(0, 200) + '...')
                }
            } else {
                results.push({ table, count: 0, columns: [], sample: [] })
                emptyTables++
                console.log(`\n⚠️  ${table}: VAZIA`)
            }
        }
    } catch (e: any) {
        console.log(`\n❌ ${table}: ERRO - ${e.message}`)
    }
}

console.log('\n' + '='.repeat(80))
console.log(`\n📊 RESUMO GERAL:`)
console.log(`   Total de Tabelas Analisadas: ${tables.length}`)
console.log(`   Tabelas com Dados: ${tablesWithData}`)
console.log(`   Tabelas Vazias: ${emptyTables}`)
console.log(`   Total de Registros: ${totalRecords}`)
console.log('\n' + '='.repeat(80))

// Salvar em arquivo JSON
import { writeFileSync } from 'fs'
writeFileSync('supabase-data.json', JSON.stringify({ results, summary: { totalRecords, tablesWithData, emptyTables } }, null, 2))
console.log('\n💾 Dados salvos em: supabase-data.json')
