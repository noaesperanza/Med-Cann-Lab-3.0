
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Requires Service Role

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Erro: SUPABASE_SERVICE_ROLE_KEY não encontrada no .env. Impossível promover admin via script.");
    console.log("👉 Por favor, execute o SQL 'sql/PROMOTE_EDUARDO_ADMIN.sql' no painel do Supabase.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function promote() {
    const email = 'eduardoscfaveret@gmail.com';
    console.log(`🔍 Buscando usuário: ${email}...`);

    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error("Erro ao listar:", error);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error("❌ Usuário não encontrado no Auth.");
        return;
    }

    console.log(`✅ Usuário encontrado (ID: ${user.id}). Promovendo a ADMIN...`);

    const { data, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, role: 'admin', type: 'admin' }
    });

    if (updateError) {
        console.error("❌ Falha ao atualizar:", updateError);
    } else {
        console.log("✅ SUCESSO! Dr. Eduardo agora é ADMIN.");
    }
}

promote();
