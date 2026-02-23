import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Calendar, AlertCircle, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BonusCycle {
  id: string;
  patient_name: string;
  cycle_number: number;
  bonus_value: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  created_at: string;
  reference_month: string;
}

export const IncentivosPanel: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bonusCycles, setBonusCycles] = useState<BonusCycle[]>([]);
  const [stats, setStats] = useState({
    totalPending: 0,
    totalApproved: 0,
    totalPaid: 0,
    activePatientCycles: 0
  });

  useEffect(() => {
    if (user) {
      loadIncentivosData();
    }
  }, [user]);

  const loadIncentivosData = async () => {
    try {
      setLoading(true);
      
      // Buscar ciclos de bônus
      const { data, error } = await supabase
        .from('referral_bonus_cycles')
        .select(`
          *,
          patient:patient_id(name)
        `)
        .eq('doctor_id', user?.id ?? '')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: BonusCycle[] = (data || []).map((item: any) => ({
        id: item.id,
        patient_name: item.patient?.name || 'Paciente',
        cycle_number: item.cycle_number ?? 0,
        bonus_value: item.bonus_value,
        status: item.status ?? 'pending',
        created_at: item.created_at ?? new Date().toISOString(),
        reference_month: item.reference_month ?? ''
      }));

      setBonusCycles(formattedData);

      // Calcular estatísticas
      const totals = formattedData.reduce((acc, curr) => {
        if (curr.status === 'pending') acc.totalPending += curr.bonus_value;
        if (curr.status === 'approved') acc.totalApproved += curr.bonus_value;
        if (curr.status === 'paid') acc.totalPaid += curr.bonus_value;
        return acc;
      }, { totalPending: 0, totalApproved: 0, totalPaid: 0 });

      // Contar pacientes ativos (ciclos pendentes ou aprovados)
      const activePatients = new Set(formattedData
        .filter(c => c.status === 'pending' || c.status === 'approved')
        .map(c => c.patient_name)
      ).size;

      setStats({
        ...totals,
        activePatientCycles: activePatients
      });

    } catch (error) {
      console.error('❌ Erro ao carregar incentivos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Pendente</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            R$ {stats.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Aguardando aprovação</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Aprovado</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            R$ {stats.totalApproved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Pronto para resgate</p>
        </div>

        <div className="bg-gradient-to-br from-slate-500/10 to-slate-700/10 border border-slate-500/20 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-slate-600" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Pago</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            R$ {stats.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total resgatado</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Pacientes Ativos</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.activePatientCycles}</p>
          <p className="text-xs text-slate-500 mt-1">Geração de bônus ativa</p>
        </div>
      </div>

      {/* Informativo Blindagem */}
      <div className="bg-primary-900 border border-primary-700 rounded-xl p-6 text-white overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
            <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full">ATIVO</span>
            Protocolo de Blindagem Financeira (Modelo B)
          </h3>
          <p className="text-sm text-primary-100 max-w-2xl">
            Seu sistema de bônus de 30% está ativo. O bônus é calculado sobre a take rate dos primeiros 6 meses 
            de cada paciente indicado, garantindo sustentabilidade e rastreabilidade total.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <TrendingUp className="w-32 h-32" />
        </div>
      </div>

      {/* Tabela de Ciclos */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Detalhamento de Ciclos
          </h3>
          <button 
            onClick={loadIncentivosData}
            className="text-xs text-primary-600 hover:underline font-medium"
          >
            Atualizar dados
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-3">Paciente</th>
                <th className="px-6 py-3">Ciclo</th>
                <th className="px-6 py-3">Mês Ref.</th>
                <th className="px-6 py-3">Valor Bônus</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {bonusCycles.length > 0 ? (
                bonusCycles.map((cycle) => (
                  <tr key={cycle.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900">{cycle.patient_name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">
                        {cycle.cycle_number}/6
                      </span>
                    </td>
                    <td className="px-6 py-4 uppercase">{cycle.reference_month}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      R$ {cycle.bonus_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      {cycle.status === 'pending' && (
                        <span className="flex items-center gap-1.5 text-orange-600">
                          <Clock className="w-3 h-3" /> Pendente
                        </span>
                      )}
                      {cycle.status === 'approved' && (
                        <span className="flex items-center gap-1.5 text-blue-600">
                          <CheckCircle className="w-3 h-3" /> Aprovado
                        </span>
                      )}
                      {cycle.status === 'paid' && (
                        <span className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle className="w-3 h-3" /> Pago
                        </span>
                      )}
                      {cycle.status === 'cancelled' && (
                        <span className="flex items-center gap-1.5 text-red-600">
                          <AlertCircle className="w-3 h-3" /> Cancelado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(cycle.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Nenhum bônus registrado até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
