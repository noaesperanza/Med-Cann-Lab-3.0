
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar .env manualmente pois estamos fora da raiz ou usando ESM
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERRO: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados no .env');
    console.log('Certifique-se de que o arquivo .env existe na raiz com a SERVICE_ROLE_KEY.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const knowledgeBase = [
    {
        id: 'kb-protocolo-cbd',
        titulo: 'Critérios de Prescrição de CBD (Canabidiol)',
        conteudo: 'O Canabidiol (CBD) pode ser prescrito segundo a Resolução CFM 2.324/2022 para tratamento de epilepsias refratárias às terapias convencionais na Síndrome de Dravet e Lennox-Gastaut e no Complexo de Esclerose Tuberosa. O médico deve informar ao paciente sobre os riscos e benefícios. É obrigatório o Termo de Consentimento Livre e Esclarecido (TCLE) assinado pelo paciente ou responsável legal.',
        categoria: 'protocolo',
        tags: ['cbd', 'epilepsia', 'cfm', 'prescricao', 'legal'],
        versao: '1.0',
        autor: 'Dr. Ricardo Valença',
        prioridade: 'alta'
    },
    {
        id: 'kb-curso-aec',
        titulo: 'Sobre o Curso Arte da Entrevista Clínica (AEC)',
        conteudo: 'O curso "Arte da Entrevista Clínica" (AEC) é um programa de formação exclusivo da MedCannLab, desenvolvido pelo Dr. Ricardo Valença. Ele ensina técnicas de escuta ativa, construção de vínculo e anamnese detalhada para prática integrativa. O curso tem módulos sobre narrativa do paciente, mapeamento de sintomas e fechamento consensual. É indicado para estudantes e profissionais de saúde que desejam humanizar e aprofundar suas consultas.',
        categoria: 'educacao',
        tags: ['curso', 'aec', 'entrevista', 'ensino', 'formacao'],
        versao: '2.1',
        autor: 'Dr. Ricardo Valença',
        prioridade: 'media'
    }
];

async function seed() {
    console.log('🌱 Iniciando Seed da Base de Conhecimento...');

    for (const item of knowledgeBase) {
        const { error } = await supabase.from('base_conhecimento').upsert(item);
        if (error) {
            console.error(`❌ Erro ao inserir "${item.titulo}":`, error.message);
        } else {
            console.log(`✅ Conhecimento inserido/atualizado: "${item.titulo}"`);
        }
    }

    console.log('🏁 Seed concluído!');
}

seed();
