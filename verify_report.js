const SUPABASE_URL = 'https://itdjkfubfzmvmuxxjoae.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZGprZnViZnptdm11eHhqb2FlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE2NTI5MCwiZXhwIjoyMDc2NzQxMjkwfQ.ah3Qfel7dN2x6Iyd1tY9evQaMR0OX8LpRZJXPvzr1fg';
const PATIENT_ID = 'c68fb133-a72a-4c1e-8a8f-5d559a6713c3';

async function checkReports() {
    console.log('🔍 Checking reports for patient:', PATIENT_ID);

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/clinical_reports?patient_id=eq.${PATIENT_ID}&select=id,status,generated_at,content`, {
            method: 'GET',
            headers: {
                'apikey': SERVICE_KEY,
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const reports = await response.json();

        if (reports.length > 0) {
            console.log('✅ REPORTS FOUND:', reports.length);
            reports.forEach(r => {
                console.log(`- ID: ${r.id}`);
                console.log(`  Status: ${r.status}`);
                console.log(`  Date: ${r.generated_at}`);
                console.log(`  Content Keys: ${Object.keys(r.content || {})}`);
            });
        } else {
            console.log('❌ NO REPORTS FOUND for patient', PATIENT_ID);
            await checkAnyReport();
        }

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    }
}

async function checkAnyReport() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/clinical_reports?select=count`, {
            method: 'HEAD',
            headers: {
                'apikey': SERVICE_KEY,
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'Range': '0-0'
            }
        });
        console.log('--- Checking Any Data ---');
        console.log('Total Reports in Table:', response.headers.get('content-range'));
    } catch (e) {
        console.log('Error checking count', e);
    }
}

checkReports();
