
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data: listData, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error(error);
        return;
    }
    console.log(`Found ${listData.users.length} users:`);
    listData.users.forEach(u => console.log(`${u.email} : ${u.id}`));
}

run();
