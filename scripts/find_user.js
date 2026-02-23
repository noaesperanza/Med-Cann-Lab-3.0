
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function listUsers() {
    console.log('Listing all users (JSON)...');
    const { data, error } = await supabase.from('users').select('email, name, type');
    if (error) {
        console.error(error);
        return;
    }
    console.log(JSON.stringify(data, null, 2));
}
listUsers();
