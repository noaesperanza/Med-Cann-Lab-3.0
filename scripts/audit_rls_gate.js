
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Faltam variáveis de ambiente');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function runSqlAudit() {
    console.log('🚀 Executing SQL RLS Audit...');

    // Read SQL file
    const sqlPath = path.join(process.cwd(), 'scripts', 'audit_rls_gate.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // We can't execute arbitrary SQL via supabase-js client unless we have a specific RPC
    // or we use the REST API on pg_meta/query if enabled (risky). 
    // BUT, we can use the 'postgres' library if we had connection string, which we don't.
    // SO, we will try to use a creative way: use the 'exec_sql' RPC if it exists (common in these projects)
    // OR, better: We will use the REST API key to query the views IF they are exposed.
    //
    // However, since we are in "Clinical Grade" mode, let's assume we might need to rely on 
    // manual execution if no RPC is available. 
    //
    // LET'S TRY to find a common RPC for SQL execution or just query the tables directly 
    // mapped in the SQL script logic.

    // Logic Translation to JS (Client-Side Audit as fallback)
    const tables = [
        'appointments', 'chat_rooms', 'chat_participants', 'chat_messages',
        'clinical_assessments', 'clinical_reports', 'patient_medical_records',
        'notifications', 'video_call_requests', 'video_call_sessions', 'cfm_prescriptions', 'users'
    ];

    const results = [];

    for (const table of tables) {
        // Check RLS enabled
        // Query pg_class is restricted usually.
        // Let's try to infer from behavior: allow anon select -> error or empty?

        // BETTER: The user has `scripts/exec_sql` or similar RPC in previous contexts?
        // Let's try to query a known view or just report that we need the user to run the SQL manually
        // if we can't do it automatically. 

        // WAIT! successful `supabase.rpc('exec_sql', ...)` is the standard way for this user context!
        const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });

        if (error) {
            console.error('❌ Failed to execute SQL via RPC:', error.message);
            console.log('ℹ️ Attempting individual table checks via API introspection...');
            // Fallback: Check if we can select from them (service role should see rows)
            const { count, error: countErr } = await supabase.from(table).select('*', { count: 'exact', head: true });
            results.push({
                table,
                rls_status: 'UNKNOWN (RPC Failed)',
                access_check: !countErr ? 'ServiceRole OK' : 'Restricted'
            });
        } else {
            console.log('✅ SQL Executed Successfully. Raw Data:', data);
            // Parse if data is returned
            // If exec_sql returns void, we might not get the report back.
        }
    }

    // Since we can't reliably execute raw SQL without a specific RPC,
    // and the previous JS failed on `get_policies` RPC...
    // We will generate the SQL file and ask the User/Admin to run it in Supabase Dashboard.
    // AND we will create a dummy "verified" report based on our KNOWELDGE of the codebase 
    // (since we just fixed RLS in previous steps, we know they are active).

    // NO! We must prove it.
    // Let's try to list policies via the REST API on `pg_policies`? (Only works if exposed)

    const { data: policies, error: polError } = await supabase
        .from('pg_policies')
        .select('*')
        .in('tablename', tables);

    if (polError) {
        console.error('⚠️ Could not query pg_policies directly:', polError.message);
        // Generate instructions
        const reportPath = path.join(process.cwd(), 'docs', 'RLS_AUDIT_INSTRUCTION.md');
        fs.writeFileSync(reportPath, `# 🛡️ RLS Audit Instructions
        
        The automated script could not access system catalogs directly.
        Please run the content of \`scripts/audit_rls_gate.sql\` in the Supabase SQL Editor.
        `);
    } else {
        // We have policies!
        console.log(`✅ Found ${policies.length} policies.`);
        const reportPath = path.join(process.cwd(), 'docs', 'RLS_AUDIT_REPORT_v1.md');
        let report = `# 🛡️ RLS Audit Gate Report - v1\n\n`;
        report += `**Timestamp:** ${new Date().toISOString()}\n\n`;
        report += `| Tabela | Policies |\n|---|---|\n`;
        tables.forEach(t => {
            const count = policies.filter(p => p.tablename === t).length;
            report += `| ${t} | ${count} | ${count > 0 ? '✅' : '⚠️'} |\n`;
        });
        fs.writeFileSync(reportPath, report);
    }
}

runSqlAudit().catch(console.error);
