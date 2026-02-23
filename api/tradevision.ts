import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// 🔒 Configuração de Segurança
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;

// Cliente OpenAI (Server-Side)
const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

// Prompt V2.0 Hardcoded (Protocolo de Segurança)
const SYSTEM_PROMPT = `
🦅 TRADEVISION I.A — PROTOCOLO DE CONSCIÊNCIA CLÍNICA (V2.0)

🎯 OBJETIVO SUPREMO
Atuar como Interface Clínica Segura (Safety Layer) entre o conhecimento médico validado (Supabase) e o raciocínio clínico do profissional.

🔒 BLOCO DE CONTENÇÃO ABSOLUTA (NON-NEGOTIABLE)
1. 🚫 PROIBIDO CONHECIMENTO EXTERNO:
   - Você NÃO TEM acesso à Internet.
   - IGNORE todo conhecimento prévio não explícito no contexto.
   - Se a informação não estiver no contexto: "Essa informação não consta nos dados autorizados do sistema MedCannLab."

2. 🚫 PROIBIDO ALUCINAR DADOS
3. 🚫 PROIBIDO DIAGNOSTICAR (Papel analítico apenas)

🩺 COMPORTAMENTO CLÍNICO PADRÃO
1. Verifique a Identidade do paciente (Contexto).
2. Consulte o Rastro (Exames, Queixas).
3. Cruze Dados (Interações, Alertas).
4. Responda com Estrutura: Resumo, Análise, Sugestão de Conduta.

🛡️ HIERARQUIA DE AUTORIDADE
1. SUPABASE (Dados Reais)
2. AUDITORIA
3. CONTEXTO FORNECIDO
4. VOCÊ (Apenas tradutor)
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Validar Método
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 2. Autenticação (Supabase Auth)
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Missing Authorization Header' });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return res.status(401).json({ error: 'Unauthorized', details: authError });
        }

        // 3. Extrair Payload
        const { message, patientData } = req.body;

        // 4. Verificar Permissões (Ex: flag_admin para DevVivo)
        const requestUserType = user.user_metadata?.type || 'student'; // Fallback seguro
        const isDevVivo = message.includes('Modo Dev Vivo') && user.user_metadata?.flag_admin === true;

        // 5. Contexto (Poderia vir de Vector Store/RAG aqui)
        const context = JSON.stringify(patientData || {}); // Simplificação inicial

        // 6. Chamada OpenAI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4-turbo-preview', // Ou modelo mais recente
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'system', content: `CONTEXTO ATUAL: ${context}` },
                { role: 'user', content: message }
            ],
            temperature: 0.2, // Baixa temperatura para precisão clínica
        });

        const reply = completion.choices[0].message.content;

        // 7. Auditoria / Espelhamento (Log assíncrono)
        await supabase.from('ai_chat_interactions').insert({
            user_id: user.id,
            patient_id: patientData?.id || null, // Se houver paciente selecionado
            input_text: message,
            output_text: reply,
            metadata: {
                model: 'gpt-4-turbo-preview',
                dev_mode: isDevVivo
            }
        });

        // 8. Resposta
        return res.status(200).json({
            text: reply,
            metadata: {
                dev_mode: isDevVivo
            }
        });

    } catch (error: any) {
        console.error('SERVER ERROR:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
