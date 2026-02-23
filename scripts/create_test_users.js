
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function run() {
    console.log("Listing users...");
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error("Error listing users:", JSON.stringify(listError, null, 2));
        return;
    }

    console.log(`Found ${listData.users.length} users.`);
    // listData.users.forEach(u => console.log(`- ${u.email} (${u.id})`));

    const testEmails = [
        { email: 'ricardo.test@medcannlab.com', role: 'profissional', name: 'Ricardo Test' },
        { email: 'eduardo.test@medcannlab.com', role: 'profissional', name: 'Eduardo Test' },
        { email: 'patient.test@medcannlab.com', role: 'paciente', name: 'Patient Test' },
        // { email: 'admin.test@medcannlab.com', role: 'admin', name: 'Admin Test' }
    ];

    for (const { email, role, name } of testEmails) {
        console.log(`\nChecking ${email}...`);
        const existingUser = listData.users.find(u => u.email === email);

        if (existingUser) {
            console.log(`User exists (${existingUser.id}). Updating password...`);
            const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
                password: 'password123',
                user_metadata: { name, role, type: role }
            });
            if (error) console.error("Error updating:", JSON.stringify(error, null, 2));
            else console.log("Updated successfully.");
        } else {
            console.log(`Creating user...`);
            const { data, error } = await supabase.auth.admin.createUser({
                email,
                password: 'password123',
                email_confirm: true,
                user_metadata: { name, role, type: role }
            });
            if (error) {
                console.error("Error creating:", JSON.stringify(error, null, 2));

                // DEBUG: Try creating with NO metadata if failed
                //   console.log("DEBUG: Trying to create without metadata...");
                //   const { error: debugError } = await supabase.auth.admin.createUser({
                //       email: `debug.${email}`,
                //       password: 'password123',
                //       email_confirm: true
                //   });
                //   if (debugError) console.error("Error creating debug user:", JSON.stringify(debugError, null, 2));
                //   else console.log("Debug user created successfully (metadata likely the issue).");

            } else {
                console.log(`Created successfully (${data.user.id}).`);
            }
        }
    }
}

run();
