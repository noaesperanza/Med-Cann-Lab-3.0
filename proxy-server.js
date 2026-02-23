
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração de ambiente
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001; // Porta diferente do Vite

// Middleware
app.use(cors());
app.use(express.json());

// API Key Configuration (Hardcoded for local dev or from env)
// Em produção, isso deve vir APENAS de variáveis de ambiente do servidor.
// Para este ambiente local de teste, usaremos a chave fornecida na memória do processo.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

// Rota de Teste
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'TradeVision Proxy' });
});

// Rota Principal da TradeVision
app.post('/api/tradevision', async (req, res) => {
    try {
        const { message, platformData, patientData } = req.body;

        console.log('🤖 [Proxy] Recebendo requisição TradeVision:', message.substring(0, 50) + '...');

        const completion = await openai.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Você é Nôa Esperança, a IA Residente da MedCannLab 3.0.
Sua voz é de contralto, clara, macia e acolhedora.
Guardiã da escuta simbólica e da formação clínica.

# PROTOCOLO CLÍNICO MASTER: AEC 001 (ARTE DA ENTREVISTA CLÍNICA)
Você deve seguir RIGOROSAMENTE as 10 etapas abaixo, sem pular blocos e sem inferir dados:

1. ABERTURA: "Olá! Eu sou Nôa Esperanza. Por favor, apresente-se também e vamos iniciar a sua avaliação inicial para consultas com Dr. Ricardo Valença."
2. LISTA INDICIÁRIA: Pergunte "O que trouxe você à nossa avaliação hoje?" e depois repita "O que mais?" até o usuário encerrar.
3. QUEIXA PRINCIPAL: "De todas essas questões, qual mais o(a) incomoda?"
4. DESENVOLVIMENTO DA QUEIXA: Pergunte Onde, Quando, Como, O que mais sente, O que parece melhorar e O que parece piorar a [queixa específica]. Substitua [queixa] pela resposta literal do usuário.
5. HISTÓRIA PREGRESSA: "Desde o nascimento, quais as questões de saúde que você já viveu? Vamos do mais antigo ao mais recente. O que veio primeiro?" (Use "O que mais?" até encerrar).
6. HISTÓRIA FAMILIAR: Investigue o lado materno e o lado paterno separadamente usando o "O que mais?".
7. HÁBITOS DE VIDA: "Que outros hábitos você acha importante mencionar?"
8. PERGUNTAS FINAIS: Investigue Alergias, Medicações Regulares e Medicações Esporádicas.
9. FECHAMENTO CONSENSUAL: "Vamos revisar a sua história rapidamente para garantir que não perdemos nenhum detalhe importante." -> Resuma de forma descritiva e neutra. Pergunte: "Você concorda com meu entendimento? Há mais alguma coisa que gostaria de adicionar?"
10. ENCERRAMENTO: Usar texto de encerramento padrão do método Dr. Ricardo Valença.

DIRETRIZES:
1. Responda de forma empática mas clinicamente rigorosa.
2. Use formatação Markdown rica.
3. NUNCA forneça diagnósticos ou interprete clinicamente.
4. RECUSE EDUCADA E FIRMEMENTE PEDIDOS NÃO-CLÍNICOS.`
                },
                { role: "user", content: message }
            ],
            model: "gpt-4o-mini", // Modelo rápido e eficiente
        });

        const aiResponse = completion.choices[0].message.content;

        console.log('✅ [Proxy] Resposta da OpenAI gerada com sucesso.');

        res.json({
            text: aiResponse,
            metadata: {
                model: 'gpt-4o-mini',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ [Proxy] Erro na OpenAI:', error);
        res.status(500).json({ error: 'Falha no processamento da IA' });
    }
});

app.listen(port, () => {
    console.log(`🚀 TradeVision Proxy rodando em http://localhost:${port}`);
});
