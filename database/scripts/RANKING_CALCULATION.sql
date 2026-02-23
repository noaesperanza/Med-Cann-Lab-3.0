-- ==============================================================================
-- 🧮 RANKING_CALCULATION.sql
-- Objetivo: Funções de Cálculo Mensal de Ranking e Concessão de Benefícios
-- Data: 02/02/2026
-- Dependências: MERIT_SYSTEM_DDL.sql
-- ==============================================================================

-- 1. Função Principal: Calcular Ranking do Mês
-- Esta função deve ser rodada via Cron/Edge Function todo dia 1º do mês
CREATE OR REPLACE FUNCTION public.calculate_monthly_ranking(ref_date date DEFAULT CURRENT_DATE)
RETURNS void AS $$
DECLARE
    target_month date;
    total_users integer;
BEGIN
    -- Normalizar para o primeiro dia do mês atual (ou passado por parametro)
    target_month := date_trunc('month', ref_date)::date;
    
    -- 1. Snapshot de Pontos
    -- Insere ou Atualiza o histórico baseando-se nos pontos atuais do user_profiles
    INSERT INTO public.ranking_history (user_id, reference_month, total_points_earned)
    SELECT 
        user_id,
        target_month,
        points -- Pega o saldo atual acumulado (Modelo simplificado: Pontos Totais = Ranking)
    FROM 
        public.user_profiles
    ON CONFLICT (user_id, reference_month) 
    DO UPDATE SET 
        total_points_earned = EXCLUDED.total_points_earned,
        created_at = now();

    -- 2. Calcular Percentis e Posições
    WITH RankedUsers AS (
        SELECT 
            user_id,
            percent_rank() OVER (ORDER BY total_points_earned DESC) as p_rank,
            rank() OVER (ORDER BY total_points_earned DESC) as absolute_rank
        FROM 
            public.ranking_history
        WHERE 
            reference_month = target_month
    )
    UPDATE public.ranking_history rh
    SET 
        percentile = ru.p_rank, -- 0.0 a 1.0 (onde 1.0 é o pior, 0.0 é o melhor no percent_rank padrão do PG? Cuidado: percent_rank é relative rank)
        -- Correção: percent_rank retorna 0 a 1. Onde 0 = menor valor.
        -- Queremos Top 5% (Melhores). Então se ordenamos DESC, o melhor é rank 1.
        -- Vamos usar Logica Simples: Se você está no top 5%, seu percentil é <= 0.05
        
        global_rank_position = ru.absolute_rank,
        tier_label = CASE 
            WHEN ru.p_rank <= 0.01 THEN 'ELITE'    -- Top 1%
            WHEN ru.p_rank <= 0.05 THEN 'GOLD'     -- Top 5%
            WHEN ru.p_rank <= 0.10 THEN 'SILVER'   -- Top 10%
            ELSE 'STANDARD'
        END
    FROM 
        RankedUsers ru
    WHERE 
        rh.user_id = ru.user_id 
        AND rh.reference_month = target_month;

    -- Log
    RAISE NOTICE 'Ranking calculado para %.', target_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Função de Concessão de Benefícios (A Regra dos 3 Meses)
CREATE OR REPLACE FUNCTION public.grant_benefits_rewards(ref_date date DEFAULT CURRENT_DATE)
RETURNS void AS $$
DECLARE
    u_record RECORD;
    target_month date;
BEGIN
    target_month := date_trunc('month', ref_date)::date;

    FOR u_record IN SELECT id FROM public.users LOOP
        
        -- Verificar se o usuário já tem registro de benefícios
        INSERT INTO public.user_benefits_status (user_id) 
        VALUES (u_record.id) 
        ON CONFLICT DO NOTHING;

        -- Checar últimos 3 meses de ranking
        -- Se o usuário foi 'ELITE' ou 'GOLD' nos últimos 3 meses
        WITH RecentPerformance AS (
            SELECT count(*) as elite_months
            FROM public.ranking_history
            WHERE user_id = u_record.id
            AND reference_month >= (target_month - INTERVAL '3 months')
            AND reference_month < (target_month + INTERVAL '1 month') -- Até o mês atual
            AND tier_label IN ('ELITE', 'GOLD')
        )
        UPDATE public.user_benefits_status
        SET 
            -- Incrementa contador se foi Elite/Gold neste mês
            consecutive_months_top5 = (
                SELECT CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM public.ranking_history 
                        WHERE user_id = u_record.id 
                        AND reference_month = target_month 
                        AND tier_label IN ('ELITE', 'GOLD')
                    ) THEN consecutive_months_top5 + 1
                    ELSE 0 -- Zerou o streak se falhou este mês
                END
            ),
            last_month_checked = target_month,
            updated_at = now()
        WHERE user_id = u_record.id;
        
        -- AGORA: APLICAR BENEFÍCIOS SE ELEGÍVEL
        -- Regra: Se consecutive_months_top5 >= 3
        UPDATE public.user_benefits_status
        SET 
            is_eligible = (consecutive_months_top5 >= 3),
            
            -- Benefício 1: Consulta Grátis (a cada 6 meses de elegibilidade mantida)
            free_consultations_balance = CASE 
                WHEN consecutive_months_top5 >= 3 AND (consecutive_months_top5 - 3) % 6 = 0 THEN free_consultations_balance + 1
                ELSE free_consultations_balance
            END,
            
            -- Benefício 2: Desconto Progressivo (Começa no mês 7 = 3 meses carência + 4 de jornada? Não, mês 7 de streak)
            current_discount_percent = CASE 
                WHEN consecutive_months_top5 < 7 THEN 0
                WHEN consecutive_months_top5 = 7 THEN 5
                WHEN consecutive_months_top5 = 8 THEN 10
                WHEN consecutive_months_top5 = 9 THEN 15
                WHEN consecutive_months_top5 = 10 THEN 20
                WHEN consecutive_months_top5 = 11 THEN 25
                WHEN consecutive_months_top5 >= 12 THEN 30
                ELSE 0
            END
        WHERE user_id = u_record.id;

    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger ou Função Wrapper para rodar tudo junto
CREATE OR REPLACE FUNCTION public.process_monthly_closing()
RETURNS text AS $$
BEGIN
    PERFORM calculate_monthly_ranking(CURRENT_DATE);
    PERFORM grant_benefits_rewards(CURRENT_DATE);
    RETURN 'Fechamento Mensal e Distribuição de Benefícios Concluída.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT '✅ Funções de Cálculo de Ranking (v1.0) criadas com sucesso!' as status;
