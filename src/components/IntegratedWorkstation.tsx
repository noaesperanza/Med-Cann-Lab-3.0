import React, { useState, useEffect, useMemo } from 'react'
import {
    Users,
    MessageSquare,
    Activity,
    FileText,
    Calendar,
    User,
    Stethoscope,
    Shield,
    BarChart3,
    BookOpen,
    MessageCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

import RenalFunctionModule from './RenalFunctionModule'
import QuickPrescriptions from './QuickPrescriptions'
import ProfessionalChatSystem from './ProfessionalChatSystem'
import EduardoScheduling from './EduardoScheduling'
import PatientsManagement from '../pages/PatientsManagement'
import PatientFocusView from './PatientFocusView'
import ClinicalGovernanceDemo from '../pages/ClinicalGovernanceDemo'
import ClinicalReports from './ClinicalReports'
import Library from '../pages/Library'
import ForumCasosClinicos from '../pages/ForumCasosClinicos'

// Props do Componente
interface IntegratedWorkstationProps {
    initialTab?: string
    defaultPatientId?: string
}

type TabGroup = 'atendimento' | 'governanca'
type TabId = 'patients' | 'patient-focus' | 'chat' | 'renal' | 'prescriptions' | 'scheduling' | 'governance' | 'reports' | 'knowledge' | 'forum'

const IntegratedWorkstation: React.FC<IntegratedWorkstationProps> = ({ initialTab, defaultPatientId }) => {
    const { user } = useAuth()

    /** Fonte única da verdade: paciente ativo no workstation. Abas consomem via props; PatientFocusView emite onPatientChange. */
    const [activePatientId, setActivePatientId] = useState<string | null>(defaultPatientId || null)
    const [activeTab, setActiveTab] = useState<TabId>(() => {
        const t = (initialTab as TabId)
        const valid: TabId[] = ['patients', 'patient-focus', 'chat', 'renal', 'prescriptions', 'scheduling', 'governance', 'reports', 'knowledge', 'forum']
        return t && valid.includes(t) ? t : 'patients'
    })

    // Abas com group para agrupamento futuro (lista plana em V1)
    const tabs: { id: TabId; label: string; icon: typeof Users; color: string; group: TabGroup }[] = [
        { id: 'patients', label: 'Prontuário', icon: Users, color: 'text-blue-400', group: 'atendimento' },
        { id: 'patient-focus', label: 'Paciente em foco', icon: User, color: 'text-amber-400', group: 'atendimento' },
        { id: 'chat', label: 'Chat Clínico', icon: MessageSquare, color: 'text-green-400', group: 'atendimento' },
        { id: 'prescriptions', label: 'Prescrições', icon: FileText, color: 'text-pink-400', group: 'atendimento' },
        { id: 'scheduling', label: 'Agendamentos', icon: Calendar, color: 'text-cyan-400', group: 'atendimento' },
        { id: 'renal', label: 'Saúde Renal', icon: Activity, color: 'text-orange-400', group: 'atendimento' },
        { id: 'governance', label: 'Governança', icon: Shield, color: 'text-purple-400', group: 'governanca' },
        { id: 'reports', label: 'Relatórios IA', icon: BarChart3, color: 'text-orange-400', group: 'governanca' },
        { id: 'knowledge', label: 'Conhecimento', icon: BookOpen, color: 'text-emerald-400', group: 'governanca' },
        { id: 'forum', label: 'Fórum', icon: MessageCircle, color: 'text-cyan-400', group: 'governanca' }
    ]

    const renderContent = () => {
        switch (activeTab) {
            case 'patients':
                return (
                    <div className="h-full w-full overflow-hidden bg-[#0f172a] relative integrated-terminal-content">
                        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-hide">
                            <PatientsManagement embedded compact />
                        </div>
                    </div>
                )
            case 'patient-focus':
                return (
                    <div className="h-full bg-[#0f172a] overflow-hidden">
                        <PatientFocusView
                            activePatientId={activePatientId}
                            onPatientChange={(id) => setActivePatientId(id)}
                        />
                    </div>
                )
            case 'chat':
                return <div className="h-full bg-[#0f172a]"><ProfessionalChatSystem selectedPatientId={activePatientId} /></div>
            case 'renal':
                return (
                    <div className="h-full overflow-y-auto bg-[#0f172a]">
                        <RenalFunctionModule patientId={activePatientId || undefined} />
                    </div>
                )
            case 'prescriptions':
                return (
                    <div className="h-full overflow-y-auto bg-[#0f172a]">
                        <QuickPrescriptions patientId={activePatientId || ''} />
                    </div>
                )
            case 'scheduling':
                return <div className="h-full overflow-y-auto bg-[#0f172a]"><EduardoScheduling /></div>
            case 'governance':
                return (
                    <div className="h-full overflow-y-auto bg-[#0f172a]">
                        <div className="px-4 py-2 border-b border-slate-700/50 bg-slate-800/30 flex items-center gap-2 text-slate-400 text-sm">
                            <Shield className="w-4 h-4 text-purple-400" />
                            <span>Modo analítico / Governança</span>
                        </div>
                        <ClinicalGovernanceDemo
                            selectedPatientId={activePatientId}
                            selectedPatientName={null}
                        />
                    </div>
                )
            case 'reports':
                return (
                    <div className="h-full overflow-y-auto scrollbar-hide bg-[#0f172a] p-4">
                        <ClinicalReports className="max-w-6xl mx-auto" />
                    </div>
                )
            case 'knowledge':
                return <div className="h-full overflow-y-auto scrollbar-hide bg-[#0f172a]"><Library /></div>
            case 'forum':
                return <div className="h-full overflow-y-auto scrollbar-hide bg-[#0f172a]"><ForumCasosClinicos /></div>
            default:
                return null
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0f172a] w-full max-w-full overflow-hidden" data-integrated-terminal>
            <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 border-b border-[#334155] shrink-0 z-10 shadow-sm relative w-full h-12 flex items-center">
                <div className="flex items-center justify-between px-3 w-full h-full">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                            <Stethoscope className="w-4 h-4 text-white" />
                        </div>
                        <div className="hidden sm:block leading-tight">
                            <h1 className="text-sm font-bold text-white leading-none">Terminal Integrado</h1>
                            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">MedCannLab OS</p>
                        </div>
                    </div>

                    <nav className="flex-1 flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar mx-2 h-full">
                        <div className="flex items-center gap-1 h-full">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                const isActive = activeTab === tab.id
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            relative group flex items-center gap-1.5 px-2.5 h-8 rounded-md text-xs font-medium transition-all whitespace-nowrap
                                            ${isActive
                                                ? 'bg-[#334155] text-white shadow-inner'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-[#334155]/50'}
                                        `}
                                    >
                                        <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? tab.color : 'text-slate-500 group-hover:text-slate-400'}`} />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                        {isActive && (
                                            <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full mb-0.5 ${tab.color.replace('text-', 'bg-')}`}></span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </nav>

                    {/* Botão Sair */}
                    <div className="flex items-center shrink-0 ml-2">
                    </div>
                </div>
            </header >

            <main className="flex-1 overflow-hidden relative bg-[#0f172a] w-full">
                {renderContent()}
            </main>

        </div >
    )
}

export default IntegratedWorkstation
