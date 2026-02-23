import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import RenalFunctionModule from './RenalFunctionModule'
import {
    Search,
    User,
    MessageCircle,
    Activity,
    FileText,
    Calendar,
    Phone,
    Mail,
    AlertCircle,
    Clock,
    ChevronRight,
    Loader2,
    Stethoscope,
    Heart,
    X
} from 'lucide-react'

interface Patient {
    id: string
    name: string
    email: string
    phone?: string
    birth_date?: string
    gender?: string
    created_at?: string
}

type ActiveTool = 'chat' | 'renal' | 'prescricao' | 'agenda'

const MedicalWorkstation: React.FC = () => {
    const { user } = useAuth()
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
    const [activeTool, setActiveTool] = useState<ActiveTool>('chat')

    // Carregar pacientes
    useEffect(() => {
        loadPatients()
    }, [])

    const loadPatients = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('users')
                .select('id, name, email, phone, birth_date, gender, created_at')
                .eq('type', 'paciente')
                .order('name')
                .limit(100)

            if (error) throw error
            setPatients((data || []).map(p => ({ ...p, phone: p.phone ?? undefined, birth_date: p.birth_date ?? undefined, gender: p.gender ?? undefined, created_at: p.created_at ?? undefined })))
        } catch (err) {
            console.error('Erro ao carregar pacientes:', err)
        } finally {
            setLoading(false)
        }
    }

    // Filtrar pacientes pela busca
    const filteredPatients = useMemo(() => {
        if (!searchQuery.trim()) return patients
        const query = searchQuery.toLowerCase()
        return patients.filter(p =>
            p.name?.toLowerCase().includes(query) ||
            p.email?.toLowerCase().includes(query)
        )
    }, [patients, searchQuery])

    // Calcular idade
    const calculateAge = (birthDate?: string): number | null => {
        if (!birthDate) return null
        const today = new Date()
        const birth = new Date(birthDate)
        let age = today.getFullYear() - birth.getFullYear()
        const monthDiff = today.getMonth() - birth.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--
        }
        return age
    }

    // Ferramentas disponíveis
    const tools = [
        { id: 'chat' as ActiveTool, label: 'Chat', icon: MessageCircle, color: 'blue' },
        { id: 'renal' as ActiveTool, label: 'Função Renal', icon: Activity, color: 'cyan' },
        { id: 'prescricao' as ActiveTool, label: 'Prescrição', icon: FileText, color: 'green' },
        { id: 'agenda' as ActiveTool, label: 'Agenda', icon: Calendar, color: 'purple' }
    ]

    // Renderizar ferramenta ativa
    const renderActiveTool = () => {
        if (!selectedPatient) {
            return (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                        <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        <p className="text-lg">Selecione um paciente na lista</p>
                        <p className="text-sm mt-2 opacity-70">para visualizar e usar as ferramentas</p>
                    </div>
                </div>
            )
        }

        switch (activeTool) {
            case 'renal':
                return <RenalFunctionModule patientId={selectedPatient.id} />

            case 'chat':
                return (
                    <div className="flex-1 flex flex-col">
                        <div className="bg-slate-800/50 rounded-lg p-6 h-full flex flex-col">
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700">
                                <MessageCircle className="w-6 h-6 text-blue-400" />
                                <h3 className="text-lg font-semibold text-white">Chat com {selectedPatient.name}</h3>
                            </div>
                            <div className="flex-1 bg-slate-900/50 rounded-lg p-4 mb-4 overflow-y-auto">
                                <p className="text-slate-400 text-center py-8">
                                    💬 Histórico de mensagens do paciente aparecerá aqui
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Digite sua mensagem..."
                                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                                    Enviar
                                </button>
                            </div>
                        </div>
                    </div>
                )

            case 'prescricao':
                return (
                    <div className="flex-1">
                        <div className="bg-slate-800/50 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <FileText className="w-6 h-6 text-green-400" />
                                <h3 className="text-lg font-semibold text-white">Nova Prescrição para {selectedPatient.name}</h3>
                            </div>
                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-sm text-slate-300 mb-2">Medicamento / Produto</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: CBD Oil 5%"
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-300 mb-2">Dosagem</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 10mg"
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-300 mb-2">Frequência</label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 2x ao dia"
                                            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-300 mb-2">Instruções</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Instruções adicionais..."
                                        className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                    />
                                </div>
                                <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors">
                                    Gerar Prescrição
                                </button>
                            </div>
                        </div>
                    </div>
                )

            case 'agenda':
                return (
                    <div className="flex-1">
                        <div className="bg-slate-800/50 rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Calendar className="w-6 h-6 text-purple-400" />
                                <h3 className="text-lg font-semibold text-white">Agenda de {selectedPatient.name}</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                    <p className="text-slate-400 text-center py-8">
                                        📅 Próximas consultas e histórico de agendamentos
                                    </p>
                                </div>
                                <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors">
                                    + Agendar Nova Consulta
                                </button>
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="h-[calc(100vh-120px)] flex gap-4">
            {/* COLUNA 1: Lista de Pacientes */}
            <div className="w-80 flex-shrink-0 bg-slate-800/50 rounded-xl border border-slate-700 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-400" />
                        Pacientes
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar paciente..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            Nenhum paciente encontrado
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700/50">
                            {filteredPatients.map((patient) => (
                                <button
                                    key={patient.id}
                                    onClick={() => setSelectedPatient(patient)}
                                    className={`w-full p-4 text-left transition-colors flex items-center gap-3 ${selectedPatient?.id === patient.id
                                            ? 'bg-emerald-500/20 border-l-4 border-emerald-500'
                                            : 'hover:bg-slate-700/50'
                                        }`}
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {patient.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{patient.name || 'Sem nome'}</p>
                                        <p className="text-slate-400 text-xs truncate">{patient.email}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* COLUNA 2: Área de Trabalho Principal */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Abas de Ferramentas */}
                {selectedPatient && (
                    <div className="flex gap-2 mb-4">
                        {tools.map((tool) => {
                            const Icon = tool.icon
                            const isActive = activeTool === tool.id
                            return (
                                <button
                                    key={tool.id}
                                    onClick={() => setActiveTool(tool.id)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${isActive
                                            ? `bg-${tool.color}-500/20 text-${tool.color}-300 border border-${tool.color}-500/40`
                                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700'
                                        }`}
                                    style={isActive ? {
                                        backgroundColor: tool.color === 'blue' ? 'rgba(59, 130, 246, 0.2)' :
                                            tool.color === 'cyan' ? 'rgba(6, 182, 212, 0.2)' :
                                                tool.color === 'green' ? 'rgba(34, 197, 94, 0.2)' :
                                                    'rgba(168, 85, 247, 0.2)',
                                        borderColor: tool.color === 'blue' ? 'rgba(59, 130, 246, 0.4)' :
                                            tool.color === 'cyan' ? 'rgba(6, 182, 212, 0.4)' :
                                                tool.color === 'green' ? 'rgba(34, 197, 94, 0.4)' :
                                                    'rgba(168, 85, 247, 0.4)',
                                        color: tool.color === 'blue' ? '#93c5fd' :
                                            tool.color === 'cyan' ? '#67e8f9' :
                                                tool.color === 'green' ? '#86efac' :
                                                    '#c4b5fd'
                                    } : {}}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tool.label}
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Conteúdo da Ferramenta Ativa */}
                <div className="flex-1 bg-slate-800/30 rounded-xl border border-slate-700 p-4 overflow-y-auto">
                    {renderActiveTool()}
                </div>
            </div>

            {/* COLUNA 3: Contexto do Paciente */}
            <div className="w-72 flex-shrink-0 bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                {selectedPatient ? (
                    <div className="h-full flex flex-col">
                        {/* Header do Paciente */}
                        <div className="p-4 bg-gradient-to-r from-emerald-900/50 to-cyan-900/50 border-b border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    {selectedPatient.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-semibold">{selectedPatient.name}</p>
                                    {selectedPatient.birth_date && (
                                        <p className="text-emerald-200/70 text-sm">
                                            {calculateAge(selectedPatient.birth_date)} anos
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setSelectedPatient(null)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Informações do Paciente */}
                        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-300 truncate">{selectedPatient.email}</span>
                                </div>
                                {selectedPatient.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-300">{selectedPatient.phone}</span>
                                    </div>
                                )}
                                {selectedPatient.gender && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-300 capitalize">{selectedPatient.gender}</span>
                                    </div>
                                )}
                            </div>

                            {/* Seção de Alertas */}
                            <div className="pt-4 border-t border-slate-700">
                                <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-3 h-3" />
                                    Alertas Clínicos
                                </h4>
                                <div className="bg-slate-900/50 rounded-lg p-3 text-sm text-slate-400">
                                    Nenhum alerta registrado
                                </div>
                            </div>

                            {/* Histórico Rápido */}
                            <div className="pt-4 border-t border-slate-700">
                                <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    Última Atividade
                                </h4>
                                <div className="bg-slate-900/50 rounded-lg p-3 text-sm text-slate-400">
                                    Cadastrado em {new Date(selectedPatient.created_at || '').toLocaleDateString('pt-BR')}
                                </div>
                            </div>

                            {/* Ações Rápidas */}
                            <div className="pt-4 border-t border-slate-700">
                                <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-3">
                                    Ações Rápidas
                                </h4>
                                <div className="grid gap-2">
                                    <button className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                        <Stethoscope className="w-4 h-4" />
                                        Iniciar Consulta
                                    </button>
                                    <button className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                        <Heart className="w-4 h-4" />
                                        Ver Prontuário
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-400">
                        <div className="text-center p-6">
                            <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">Selecione um paciente</p>
                            <p className="text-xs mt-1 opacity-70">para ver os detalhes</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MedicalWorkstation
