import { Resend } from 'resend';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("🔍 INICIANDO VALIDAÇÃO DE INTEGRAÇÕES EXTERNAS...\n");

// 1. Validate Resend
console.log("📧 Testando SDK do Resend...");
try {
    const resendApiKey = process.env.RESEND_API_KEY || "aviso_chave_faltando";
    const resend = new Resend(resendApiKey);
    if (resendApiKey === "aviso_chave_faltando") {
        console.log("   ⚠️  SDK carregou, mas a chave 'RESEND_API_KEY' não está no arquivo .env.");
    } else {
        console.log("   ✅  SDK carregou e chave encontrada.");
    }
} catch (error) {
    console.error("   ❌  Falha ao carregar Resend:", error);
}

// 2. Validate Stripe
console.log("\n💳 Testando SDK do Stripe...");
try {
    const stripeApiKey = process.env.STRIPE_SECRET_KEY || "aviso_chave_faltando";
    if (stripeApiKey === "aviso_chave_faltando") {
        console.log("   ⚠️  SDK carregou, mas a chave 'STRIPE_SECRET_KEY' não está no arquivo .env.");
        // Initialize with a dummy key just to test the library import
        new Stripe('sk_test_dummy', { apiVersion: '2023-10-16' });
    } else {
        const stripe = new Stripe(stripeApiKey, { apiVersion: '2023-10-16' });
        console.log("   ✅  SDK carregou e chave encontrada.");
    }
} catch (error) {
    console.error("   ❌  Falha ao carregar Stripe:", error);
}

// 3. Check Supabase URL
console.log("\n⚡ Testando Variáveis do Supabase...");
if (process.env.VITE_SUPABASE_URL) {
    console.log(`   ✅  VITE_SUPABASE_URL encontrada: ${process.env.VITE_SUPABASE_URL}`);
} else {
    console.log("   ❌  VITE_SUPABASE_URL faltando!");
}

if (process.env.VITE_SUPABASE_ANON_KEY) {
    console.log("   ✅  VITE_SUPABASE_ANON_KEY encontrada.");
} else {
    console.log("   ❌  VITE_SUPABASE_ANON_KEY faltando!");
}

console.log("\n🏁 Validação Técnica Concluída.");
