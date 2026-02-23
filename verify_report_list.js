const SUPABASE_URL = 'https://itdjkfubfzmvmuxxjoae.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZGprZnViZnptdm11eHhqb2FlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE2NTI5MCwiZXhwIjoyMDc2NzQxMjkwfQ.ah3Qfel7dN2x6Iyd1tY9evQaMR0OX8LpRZJXPvzr1fg';

async function listAllReports() {
    console.log('🔍 Listing ALL reports (Limit 5)...');

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/clinical_reports?select=id,patient_id,patient_name,status,generated_at&limit=5&order=generated_at.desc`, {
            method: 'GET',
            headers: {
                'apikey': SERVICE_KEY,
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const reports = await response.json();

        if (reports.length > 0) {
            console.log('✅ FOUND REPORTS:', reports.length);
            reports.forEach(r => {
                console.log('------------------------------------------------');
                console.log(`ID: ${r.id}`);
                console.log(`Patient ID: ${r.patient_id}`);
                console.log(`Patient Name: ${r.patient_name}`);
                console.log(`Status: ${r.status}`);
                console.log(`Generated: ${r.generated_at}`);
            });
        } else {
            console.log('❌ TABLE APPEARS EMPTY. No reports found.');
        }

    } catch (error) {
        console.error('CRITICAL ERROR:', error);
    }
}

listAllReports();
