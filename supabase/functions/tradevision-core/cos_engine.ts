/**
 * ⚛️ COS v1.0: CORE KERNEL (PURE LOGIC)
 * Orquestrado por Pedro Henrique Passos Galluf
 * Co-criado por Noa Esperanza (Dr. Ricardo Valença)
 * 
 * Este arquivo é a ABI Cognitiva do COS.
 * Ele NÃO chama APIs externas (OpenAI), NÃO conhece o Banco de Dados (Supabase).
 * Ele apenas decide: "O sistema pode pensar agora?"
 */

export type COS_Mode = 'FULL' | 'READ_ONLY' | 'OFF';

export interface COS_Context {
    intent: 'CLINICA' | 'ADMIN' | 'ENSINO' | 'FINANCEIRO';
    action?: string;
    mode: COS_Mode;
    policy?: {
        autonomy_level: number;
        forbidden_actions?: string[];
    };
    metabolism?: {
        decision_count_today: number;
        daily_limit: number;
    };
    trauma?: {
        active: boolean;
        reason?: string;
    };
}

export interface COS_Decision {
    allowed: boolean;
    reason?: string;
    autonomy_level: number;
    flags: {
        read_only: boolean;
        trauma_lock: boolean;
        metabolic_throttle: boolean;
    };
    mode: COS_Mode | 'TRAUMA_RESTRICTED' | 'SILENCE_MODE';
}

export class COS {
    static evaluate(context: COS_Context): COS_Decision {
        // 🔴 1. KILL SWITCH TOTAL
        if (context.mode === 'OFF') {
            return {
                allowed: false,
                reason: 'Doutrina COS: Sistema em modo OFF (Kill Switch).',
                autonomy_level: 0,
                flags: { read_only: false, trauma_lock: true, metabolic_throttle: false },
                mode: 'OFF'
            };
        }

        // 🟠 2. TRAUMA INSTITUCIONAL (Homeostase de Sobrevivência)
        if (context.trauma?.active) {
            return {
                allowed: false,
                reason: `Doutrina COS: Modo conservador por trauma institucional: ${context.trauma.reason}`,
                autonomy_level: 0,
                flags: { read_only: true, trauma_lock: true, metabolic_throttle: false },
                mode: 'TRAUMA_RESTRICTED'
            };
        }

        // 🟡 3. METABOLISMO (Regulação de Energia)
        if (
            context.metabolism &&
            context.metabolism.decision_count_today >= context.metabolism.daily_limit
        ) {
            return {
                allowed: false,
                reason: 'Doutrina COS: Limite metabólico diário atingido (Silêncio Cognitivo).',
                autonomy_level: context.policy?.autonomy_level ?? 1,
                flags: { read_only: true, trauma_lock: false, metabolic_throttle: true },
                mode: 'SILENCE_MODE'
            };
        }

        // 🔵 4. READ ONLY MODE
        if (context.mode === 'READ_ONLY' && context.action) {
            return {
                allowed: false,
                reason: 'Doutrina COS: Sistema em modo READ_ONLY (Escrita Proibida).',
                autonomy_level: context.policy?.autonomy_level ?? 1,
                flags: { read_only: true, trauma_lock: false, metabolic_throttle: false },
                mode: 'READ_ONLY'
            };
        }

        // 🚫 5. POLICY ENFORCEMENT (Normatividade)
        if (context.policy?.forbidden_actions?.includes(context.action ?? '')) {
            return {
                allowed: false,
                reason: `Doutrina COS: Ação "${context.action}" bloqueada por política institucional.`,
                autonomy_level: context.policy.autonomy_level,
                flags: { read_only: false, trauma_lock: false, metabolic_throttle: false },
                mode: context.mode
            };
        }

        // ✅ 6. AUTORIZADO A PENSAR (Córtex Liberado)
        return {
            allowed: true,
            autonomy_level: context.policy?.autonomy_level ?? 1,
            flags: { read_only: false, trauma_lock: false, metabolic_throttle: false },
            mode: context.mode
        };
    }
}
