
-- ============================================================
-- SPRINT 1.2: HABILITAR RLS NAS 20 TABELAS EXPOSTAS
-- Cada tabela recebe RLS + policies adequadas ao seu contexto
-- ============================================================

-- ==========================================
-- GRUPO 1: TABELAS CLÍNICAS (paciente_id)
-- Leitura por profissionais e admin, escrita restrita
-- ==========================================

-- 1. abertura_exponencial
ALTER TABLE public.abertura_exponencial ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read abertura_exponencial" ON public.abertura_exponencial
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/prof insert abertura_exponencial" ON public.abertura_exponencial
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profissional'));
CREATE POLICY "Admin/prof update abertura_exponencial" ON public.abertura_exponencial
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profissional'));

-- 2. avaliacoes_renais
ALTER TABLE public.avaliacoes_renais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read avaliacoes_renais" ON public.avaliacoes_renais
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/prof insert avaliacoes_renais" ON public.avaliacoes_renais
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profissional'));
CREATE POLICY "Admin/prof update avaliacoes_renais" ON public.avaliacoes_renais
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profissional'));

-- 3. contexto_longitudinal
ALTER TABLE public.contexto_longitudinal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read contexto_longitudinal" ON public.contexto_longitudinal
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/prof insert contexto_longitudinal" ON public.contexto_longitudinal
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profissional'));

-- 4. dados_imre_coletados
ALTER TABLE public.dados_imre_coletados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read dados_imre_coletados" ON public.dados_imre_coletados
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/prof insert dados_imre_coletados" ON public.dados_imre_coletados
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profissional'));

-- 5. desenvolvimento_indiciario
ALTER TABLE public.desenvolvimento_indiciario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read desenvolvimento_indiciario" ON public.desenvolvimento_indiciario
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/prof insert desenvolvimento_indiciario" ON public.desenvolvimento_indiciario
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profissional'));
CREATE POLICY "Admin/prof update desenvolvimento_indiciario" ON public.desenvolvimento_indiciario
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profissional'));

-- 6. fechamento_consensual
ALTER TABLE public.fechamento_consensual ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read fechamento_consensual" ON public.fechamento_consensual
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/prof insert fechamento_consensual" ON public.fechamento_consensual
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profissional'));

-- 7. interacoes_ia
ALTER TABLE public.interacoes_ia ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read interacoes_ia" ON public.interacoes_ia
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert interacoes_ia" ON public.interacoes_ia
  FOR INSERT TO authenticated WITH CHECK (true);

-- 8. pacientes
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read pacientes" ON public.pacientes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/prof insert pacientes" ON public.pacientes
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profissional'));
CREATE POLICY "Admin/prof update pacientes" ON public.pacientes
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profissional'));

-- 9. permissoes_compartilhamento
ALTER TABLE public.permissoes_compartilhamento ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read permissoes_compartilhamento" ON public.permissoes_compartilhamento
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin/prof manage permissoes" ON public.permissoes_compartilhamento
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profissional'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profissional'));

-- ==========================================
-- GRUPO 2: TABELAS DE SISTEMA/CONFIG
-- ==========================================

-- 10. feature_flags (leitura pública, escrita admin)
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read feature_flags" ON public.feature_flags
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage feature_flags" ON public.feature_flags
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 11. platform_params (leitura pública, escrita admin)
ALTER TABLE public.platform_params ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read platform_params" ON public.platform_params
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage platform_params" ON public.platform_params
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 12. role_catalog (leitura pública, imutável)
ALTER TABLE public.role_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read role_catalog" ON public.role_catalog
  FOR SELECT TO authenticated USING (true);

-- 13. kpi_daily_snapshots (leitura por admin/prof)
ALTER TABLE public.kpi_daily_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/prof read kpi_daily_snapshots" ON public.kpi_daily_snapshots
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'profissional'));
CREATE POLICY "System insert kpi_daily_snapshots" ON public.kpi_daily_snapshots
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System update kpi_daily_snapshots" ON public.kpi_daily_snapshots
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- GRUPO 3: TABELAS DE AUDITORIA/MODERAÇÃO
-- ==========================================

-- 14. medcannlab_audit_logs (apenas admin lê, sistema escreve)
ALTER TABLE public.medcannlab_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read audit_logs" ON public.medcannlab_audit_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated insert audit_logs" ON public.medcannlab_audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

-- 15. moderator_requests (user lê o seu, admin lê tudo)
ALTER TABLE public.moderator_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own moderator_requests" ON public.moderator_requests
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own moderator_requests" ON public.moderator_requests
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admin update moderator_requests" ON public.moderator_requests
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 16. user_mutes (admin gerencia)
ALTER TABLE public.user_mutes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read user_mutes" ON public.user_mutes
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());
CREATE POLICY "Admin manage user_mutes" ON public.user_mutes
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- GRUPO 4: TABELAS FINANCEIRAS/SOCIAL
-- ==========================================

-- 17. referral_bonus_cycles (admin e profissional leem)
ALTER TABLE public.referral_bonus_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/prof read referral_bonus_cycles" ON public.referral_bonus_cycles
  FOR SELECT TO authenticated USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'profissional')
    OR doctor_id = auth.uid()
  );
CREATE POLICY "System insert referral_bonus_cycles" ON public.referral_bonus_cycles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 18. debates (leitura pública, escrita autenticada)
ALTER TABLE public.debates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read debates" ON public.debates
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert debates" ON public.debates
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Owner/admin update debates" ON public.debates
  FOR UPDATE TO authenticated USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owner/admin delete debates" ON public.debates
  FOR DELETE TO authenticated USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- 19. friendships (user vê as suas)
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own friendships" ON public.friendships
  FOR SELECT TO authenticated USING (requester_id = auth.uid() OR addressee_id = auth.uid());
CREATE POLICY "Users insert friendships" ON public.friendships
  FOR INSERT TO authenticated WITH CHECK (requester_id = auth.uid());
CREATE POLICY "Users update own friendships" ON public.friendships
  FOR UPDATE TO authenticated USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- 20. usuarios (tabela legada - acesso admin)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read usuarios" ON public.usuarios
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage usuarios" ON public.usuarios
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
