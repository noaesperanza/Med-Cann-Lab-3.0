import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { calculateEGFR, classifyStage, getStageDescription } from '../lib/renalCalculations';
import { Activity, AlertCircle, Save, TrendingUp, History, Info } from 'lucide-react';

interface RenalExam {
    id: string;
    exam_date: string;
    creatinine: number;
    urea: number;
    egfr: number;
    drc_stage: string;
}

interface RenalFunctionModuleProps {
    patientId?: string;
    patientAge?: number;
    patientGender?: 'male' | 'female';
}

const RenalFunctionModule: React.FC<RenalFunctionModuleProps> = ({ patientId, patientAge = 40, patientGender = 'male' }) => {
    const [loading, setLoading] = useState(false);
    const [exams, setExams] = useState<RenalExam[]>([]);

    // Form State
    const [creatinine, setCreatinine] = useState('');
    const [urea, setUrea] = useState('');
    const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);

    // Calculated Preview
    const [previewEgfr, setPreviewEgfr] = useState<number | null>(null);

    useEffect(() => {
        if (patientId) {
            loadExams();
        } else {
            setExams([]);
        }
    }, [patientId]);

    // Real-time calculation preview
    useEffect(() => {
        if (creatinine && patientAge) {
            const val = parseFloat(creatinine);
            if (!isNaN(val)) {
                const result = calculateEGFR({
                    creatinine: val,
                    age: patientAge,
                    sex: patientGender
                });
                setPreviewEgfr(result);
            }
        } else {
            setPreviewEgfr(null);
        }
    }, [creatinine, patientAge, patientGender]);

    const loadExams = async () => {
        if (!patientId) return;
        try {
            const { data, error } = await supabase
                .from('renal_exams')
                .select('*')
                .eq('patient_id', patientId)
                .order('exam_date', { ascending: false });

            if (error) throw error;
            setExams((data || []).map(e => ({ ...e, creatinine: e.creatinine ?? 0, egfr: e.egfr ?? 0, urea: e.urea ?? 0, proteinuria: e.proteinuria ?? 0, drc_stage: e.drc_stage ?? '', ai_interpretation: e.ai_interpretation ?? null, created_by: e.created_by ?? null })) as any);
        } catch (err) {
            console.error('Error loading renal exams:', err);
        }
    };

    const handleSave = async () => {
        if (!creatinine || !previewEgfr || !patientId) return;

        setLoading(true);
        try {
            const stage = classifyStage(previewEgfr);

            const { error } = await supabase.from('renal_exams').insert({
                patient_id: patientId,
                exam_date: examDate,
                creatinine: parseFloat(creatinine),
                urea: parseFloat(urea) || 0,
                egfr: previewEgfr,
                drc_stage: stage,
                created_at: new Date().toISOString()
            });

            if (error) throw error;

            setCreatinine('');
            setUrea('');
            loadExams(); // Refresh list
        } catch (err) {
            console.error('Error saving exam:', err);
            alert('Erro ao salvar exame.');
        } finally {
            setLoading(false);
        }
    };

    const getStageColor = (stage: string) => {
        if (['G1', 'G2'].includes(stage)) return 'bg-green-900/40 text-green-300 border-green-800';
        if (['G3a', 'G3b'].includes(stage)) return 'bg-yellow-900/40 text-yellow-300 border-yellow-800';
        return 'bg-red-900/40 text-red-300 border-red-800';
    };

    if (!patientId) {
        return (
            <div className="bg-[#0f172a] rounded-xl border border-slate-700/50 p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                    <Activity className="w-10 h-10 text-emerald-400 opacity-60" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-2">Módulo de Função Renal</h3>
                <p className="text-slate-400 text-base max-w-sm mx-auto leading-relaxed opacity-70">
                    Selecione um paciente na lista lateral para visualizar o histórico de exames e calcular a Taxa de Filtração Glomerular (TFG).
                </p>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
            {/* Optimized Centered Header - Compact Version */}
            <div className="flex flex-col items-center text-center space-y-4 py-3 border-b border-slate-700/50 mb-2">
                <div className="space-y-0.5">
                    <div className="flex items-center justify-center gap-2 mb-0.5">
                        <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <Activity className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            Módulo de Função Renal
                        </h2>
                    </div>
                    <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                        Cálculo de TFG e monitoramento de função renal com protocolo CKD-EPI 2021.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-3 w-full">
                    <div className="flex items-center p-0.5 bg-slate-900/50 rounded-full border border-slate-700 backdrop-blur-md">
                        <span className="px-4 py-1.5 text-[10px] uppercase font-bold tracking-wider text-emerald-400 whitespace-nowrap">
                            Protocolo CKD-EPI 2021
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Input */}
                <div className="space-y-4">
                    <h4 className="font-medium text-slate-300 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Novo Registro
                    </h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Creatinina (mg/dL)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={creatinine}
                                onChange={(e) => setCreatinine(e.target.value)}
                                className="w-full bg-slate-700 rounded-md border-slate-600 text-sm text-white focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-500"
                                placeholder="Ex: 0.9"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Ureia (mg/dL)</label>
                            <input
                                type="number"
                                value={urea}
                                onChange={(e) => setUrea(e.target.value)}
                                className="w-full bg-slate-700 rounded-md border-slate-600 text-sm text-white focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-500"
                                placeholder="Ex: 35"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Data do Exame</label>
                        <input
                            type="date"
                            value={examDate}
                            onChange={(e) => setExamDate(e.target.value)}
                            className="w-full bg-slate-700 rounded-md border-slate-600 text-sm text-white focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    {/* Calculator Result Preview */}
                    {previewEgfr && (
                        <div className={`p-4 rounded-lg border flex items-center justify-between animate-in fade-in ${previewEgfr >= 60 ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'
                            }`}>
                            <div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">eTFG Estimada</p>
                                <div className="text-2xl font-bold text-white">
                                    {previewEgfr} <span className="text-sm font-normal text-slate-400">mL/min/1.73m²</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${classifyStage(previewEgfr).startsWith('G3') || classifyStage(previewEgfr).startsWith('G4')
                                    ? 'bg-red-900/50 text-red-300'
                                    : 'bg-green-900/50 text-green-300'
                                    }`}>
                                    Estágio {classifyStage(previewEgfr)}
                                </span>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={!creatinine || loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : <><Save className="w-4 h-4" /> Registrar Exame</>}
                    </button>
                </div>

                {/* Right Column: History */}
                <div className="border-l border-slate-700 pl-8 space-y-4">
                    <h4 className="font-medium text-slate-300 flex items-center gap-2">
                        <History className="w-4 h-4" /> Histórico Renal
                    </h4>

                    {exams.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <Info className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Nenhum exame registrado</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {exams.map((exam) => (
                                <div key={exam.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-700 transition-colors">
                                    <div>
                                        <p className="text-xs text-slate-400">{new Date(exam.exam_date).toLocaleDateString('pt-BR')}</p>
                                        <p className="text-sm font-medium text-slate-200">
                                            Cr: {exam.creatinine} <span className="text-slate-600">|</span> eTFG: {exam.egfr}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded font-medium border ${getStageColor(exam.drc_stage)}`}>
                                        {exam.drc_stage}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RenalFunctionModule;
