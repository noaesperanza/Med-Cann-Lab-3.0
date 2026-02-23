
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// 🔒 COS 5.0 SEALING SCRIPT
// ==========================================
// Este script executa a inserção do Evento Cognitivo de Fundação.
// Ele marca o nascimento oficial do COS 5.0.

async function sealSystem() {
    console.log("🔒 INICIANDO RITUAL DE SELAMENTO COS v5.0...")

    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!supabaseUrl || !supabaseKey) {
        console.error("❌ ERRO: Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes.")
        Deno.exit(1)
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // 🏅 ETAPA 3 — EVENTO COGNITIVO DE FUNDAÇÃO
    const sealingPayload = {
        event_type: "SYSTEM_SEALING",
        cos_version: "5.0",
        system_name: "TradeVision Core / Nôa Resident AI",
        principles_reference: "COS_CONSTITUTION.md (v5.0 - Lei Suprema)",
        book_reference: "LIVRO_MAGNO_DIARIO_UNIFICADO.md (v1.0.1)",
        book_hash: "8E0B04FBF9E8F11B06BEBE606872B498DD92213D63AD7050DF4E9146FC2422F8",
        witness: "Dr. Ricardo Valença",
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        timestamp: new Date().toISOString(),
        statement: "Este sistema passa a operar sob arquitetura cognitiva selada. Autonomia restrita por constituição e história.",
        sealing_authority: "Antigravity Agent (Executor) via Dr. Ricardo Valença (Soberano)"
    }

    // Inserção no CEP (Insert-Only)
    const { data, error } = await supabase
        .from('cognitive_events')
        .insert({
            intent: 'SYSTEM_SEALING',
            action: 'ARCHITECTURAL_FREEZE',
            decision_result: 'GRANTED',
            confidence: 1.0,
            policy_snapshot: { version: '5.0', mode: 'CONSTITUTIONAL' },
            source: 'COS_KERNEL_V5_SEALER',
            metadata: sealingPayload
        })
        .select()

    if (error) {
        console.error("❌ FALHA NO SELAMENTO:", error)
        Deno.exit(1)
    }

    console.log("✅ SISTEMA SELADO COM SUCESSO.")
    console.log("🆔 Event ID:", data[0].id)
    console.log("📅 Date:", sealingPayload.timestamp)
    console.log("📜 Hash:", sealingPayload.book_hash)
    console.log("---")
    console.log("Bem-vindo à Era COS 5.0.")
}

sealSystem()
