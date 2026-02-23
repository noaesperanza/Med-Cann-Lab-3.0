// Script para analisar todas as tabelas e dados do Supabase
import { supabase } from './src/lib/supabase.ts'

console.log('🔍 Analisando Banco de Dados Supabase...\n')

async function analyzeDatabase() {
    const results = {
        tables: [],
        totalRecords: 0,
        errors: []
    }

    // Lista de tabelas conhecidas para verificar
    const knownTables = [
        'users',
        'profiles',
        'chat_messages',
        'chat_rooms',
        'documents',
        'knowledge_base',
        'noa_knowledge_documents',
        'imre_assessments',
        'clinical_reports',
        'clinical_assessments',
        'appointments',
        'prescriptions',
        'courses',
        'course_modules',
        'enrollments',
        'gamification_points',
        'badges',
        'notifications',
        'user_interactions',
        'moderator_requests',
        'patient_health_history',
        'subscriptions',
        'financial_transactions',
        'prescription_templates',
        'newsletter_items',
        'assignments'
    ]

    console.log(`📊 Verificando ${knownTables.length} tabelas conhecidas...\n`)

    for (const tableName of knownTables) {
        try {
            // Tentar contar registros
            const { count, error: countError } = await supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true })

            if (countError) {
                results.errors.push({
                    table: tableName,
                    error: countError.message
                })
                console.log(`❌ ${tableName}: ${countError.message}`)
                continue
            }

            // Se a tabela existe e tem dados, buscar alguns registros
            if (count !== null && count > 0) {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(5)

                if (!error && data) {
                    results.tables.push({
                        name: tableName,
                        count: count,
                        sample: data,
                        columns: Object.keys(data[0] || {})
                    })
                    results.totalRecords += count
                    console.log(`✅ ${tableName}: ${count} registros`)
                }
            } else if (count === 0) {
                results.tables.push({
                    name: tableName,
                    count: 0,
                    sample: [],
                    columns: []
                })
                console.log(`⚠️  ${tableName}: 0 registros (tabela vazia)`)
            }
        } catch (error) {
            results.errors.push({
                table: tableName,
                error: error.message
            })
            console.log(`❌ ${tableName}: ${error.message}`)
        }
    }

    console.log(`\n📈 Total de registros no banco: ${results.totalRecords}`)
    console.log(`📋 Tabelas encontradas: ${results.tables.length}`)
    console.log(`❌ Erros: ${results.errors.length}`)

    return results
}

// Executar análise
const analysis = await analyzeDatabase()

// Salvar resultado em arquivo JSON
const fs = await import('fs')
fs.writeFileSync(
    'supabase-analysis.json',
    JSON.stringify(analysis, null, 2),
    'utf-8'
)

console.log('\n💾 Análise salva em supabase-analysis.json')

// Gerar relatório detalhado
console.log('\n📄 RELATÓRIO DETALHADO:\n')
console.log('='.repeat(80))

for (const table of analysis.tables) {
    console.log(`\n📊 Tabela: ${table.name}`)
    console.log(`   Registros: ${table.count}`)

    if (table.columns.length > 0) {
        console.log(`   Colunas: ${table.columns.join(', ')}`)
    }

    if (table.count > 0 && table.sample.length > 0) {
        console.log(`   Exemplo de registro:`)
        console.log(`   ${JSON.stringify(table.sample[0], null, 2)}`)
    }
}

if (analysis.errors.length > 0) {
    console.log('\n\n❌ TABELAS COM ERROS:\n')
    for (const error of analysis.errors) {
        console.log(`   ${error.table}: ${error.error}`)
    }
}

console.log('\n' + '='.repeat(80))
console.log('✅ Análise completa!')
