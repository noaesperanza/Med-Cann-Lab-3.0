import React, { useState, useEffect, useRef } from 'react'
import {
    Activity,
    FileText,
    BookOpen,
    BarChart3,
    Shield,
    Terminal as TerminalIcon,
    Settings,
    Users,
    MessageSquare,
    Search,
    User,
    X,
    ChevronLeft,
    LayoutDashboard,
    ClipboardList
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { clinicalReportService } from '../lib/clinicalReportService'
import ClinicalGovernanceDemo from '../pages/ClinicalGovernanceDemo'
import ClinicalReports from './ClinicalReports'
import Library from '../pages/Library'
import ForumCasosClinicos from '../pages/ForumCasosClinicos'
import PatientsManagement from '../pages/PatientsManagement'
import PatientAnalytics from './PatientAnalytics'

type TabId = 'governance' | 'reports' | 'knowledge' | 'forum' | 'patient-focus'

const ClinicalTerminal: React.FC = () => {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<TabId>('governance')
    const [linkedPatients, setLinkedPatients] = useState<{ id: string; name: string }[]>([])
    const [patientSearch, setPatientSearch] = useState('')
    const [patientDropdownOpen, setPatientDropdownOpen] = useState(false)
    const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null)
    const [showPatientAvatarView, setShowPatientAvatarView] = useState(false)
    const [patientAvatarUrl, setPatientAvatarUrl] = useState<string | null>(null)
    const patientDropdownRef = useRef<HTMLDivElement>(null)
    /** Sub-aba em "Paciente em foco": Evolução e Analytics (avatar) ou Prontuário */
    const [patientFocusSubTab, setPatientFocusSubTab] = useState<'analytics' | 'prontuario'>('analytics')
    const [focusReports, setFocusReports] = useState<any[]>([])
    const [focusReportsLoading, setFocusReportsLoading] = useState(false)
    const [focusAppointments, setFocusAppointments] = useState<Array<{ id: string; date: string; time: string; professional: string; type: string; status: string }>>([])
    const [focusPrescriptions, setFocusPrescriptions] = useState<Array<{ id: string; title: string; status: string; issuedAt?: string; startsAt?: string | null; endsAt?: string | null; professionalName?: string | null }>>([])
    const [focusPrescriptionsLoading, setFocusPrescriptionsLoading] = useState(false)

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (patientDropdownRef.current && !patientDropdownRef.current.contains(e.target as Node)) setPatientDropdownOpen(false)
        }
        if (patientDropdownOpen) document.addEventListener('click', onDocClick)
        return () => document.removeEventListener('click', onDocClick)
    }, [patientDropdownOpen])

    useEffect(() => {
        if (!selectedPatient?.id) {
            setPatientAvatarUrl(null)
            return
        }
        let cancelled = false
        const loadAvatar = async () => {
            try {
                const { data } = await supabase
                    .from('users')
                    .select('avatar_url, user_metadata')
                    .eq('id', selectedPatient.id)
                    .maybeSingle()
                if (cancelled) return
                const url = (data as any)?.avatar_url ?? (data as any)?.user_metadata?.avatar_url ?? null
                setPatientAvatarUrl(url)
            } catch {
                if (!cancelled) setPatientAvatarUrl(null)
            }
        }
        loadAvatar()
        return () => { cancelled = true }
    }, [selectedPatient?.id])

    // Carregar dados para PatientAnalytics quando "Paciente em foco" está aberto (relatórios, agendamentos, prescrições)
    useEffect(() => {
        if (!showPatientAvatarView || !selectedPatient?.id) {
            setFocusReports([])
            setFocusAppointments([])
            setFocusPrescriptions([])
            return
        }
        const pid = selectedPatient.id
        let cancelled = false
        const load = async () => {
            setFocusReportsLoading(true)
            setFocusPrescriptionsLoading(true)
            try {
                const [reports, apptsResult, prescResult] = await Promise.all([
                    clinicalReportService.getPatientReports(pid),
                    supabase.from('appointments').select('*').eq('patient_id', pid).order('appointment_date', { ascending: true }).limit(20),
                    supabase.from('v_patient_prescriptions').select('*').eq('patient_id', pid).order('issued_at', { ascending: false })
                ])
                if (cancelled) return
                setFocusReports(reports || [])
                if (apptsResult.data?.length) {
                    setFocusAppointments(apptsResult.data.map((apt: any) => ({
                        id: apt.id,
                        date: apt.appointment_date,
                        time: apt.appointment_time || '09:00',
                        professional: apt.professional_name || 'Equipe Clínica',
                        type: apt.appointment_type || 'Consulta',
                        status: apt.status || 'scheduled'
                    })))
                } else {
                    const viewResult = await supabase.from('appointments').select('*').eq('patient_id', pid).order('appointment_date', { ascending: true }).limit(20)
                    if (!cancelled && viewResult.data?.length) {
                        setFocusAppointments(viewResult.data.map((apt: any) => ({
                            id: apt.id,
                            date: apt.appointment_date,
                            time: apt.appointment_time || apt.start_time || '09:00',
                            professional: apt.professional_name || apt.professional_full_name || 'Equipe Clínica',
                            type: apt.appointment_type || apt.type || 'Consulta',
                            status: apt.status || 'scheduled'
                        })))
                    } else {
                        setFocusAppointments([])
                    }
                }
                if (prescResult.data?.length) {
                    setFocusPrescriptions(prescResult.data.map((row: any) => ({
                        id: row.id,
                        title: row.title ?? row.template_title ?? 'Prescrição integrativa',
                        status: row.status ?? 'draft',
                        issuedAt: row.issued_at,
                        startsAt: row.starts_at ?? row.plan_starts_at ?? null,
                        endsAt: row.ends_at ?? row.plan_ends_at ?? null,
                        professionalName: row.professional_name ?? null
                    })))
                } else {
                    setFocusPrescriptions([])
                }
            } catch (e) {
                if (!cancelled) {
                    setFocusReports([])
                    setFocusAppointments([])
                    setFocusPrescriptions([])
                }
            } finally {
                if (!cancelled) {
                    setFocusReportsLoading(false)
                    setFocusPrescriptionsLoading(false)
                }
            }
        }
        load()
        return () => { cancelled = true }
    }, [showPatientAvatarView, selectedPatient?.id])

    useEffect(() => {
        if (!user?.id) return
        const load = async () => {
            const isAdmin = (user as any)?.type === 'admin'
            if (isAdmin) {
                const { data: usersData, error: usersError } = await supabase
                    .from('users')
                    .select('id, name')
                    .in('type', ['patient', 'paciente'])
                    .order('name', { ascending: true })
                if (!usersError && usersData) {
                    setLinkedPatients(usersData.filter((u: any) => u.id !== user?.id).map((u: any) => ({ id: u.id, name: u.name || 'Sem nome' })))
                } else {
                    const { data: compatData } = await supabase
                        .from('users_compatible')
                        .select('id, name')
                        .in('type', ['patient', 'paciente'])
                        .order('name', { ascending: true })
                    if (compatData) setLinkedPatients(compatData.filter((u: any) => u.id !== user?.id).map((u: any) => ({ id: u.id, name: u.name || 'Sem nome' })))
                }
                return
            }
            const { data: assessmentsData } = await supabase
                .from('clinical_assessments')
                .select('patient_id')
                .eq('doctor_id', user.id)
            const ids = Array.from(new Set((assessmentsData || []).map(a => a.patient_id).filter((id): id is string => id !== null)))
            if (ids.length === 0) {
                setLinkedPatients([])
                return
            }
            const { data: usersData } = await supabase
                .from('users')
                .select('id, name')
                .in('id', ids)
            setLinkedPatients((usersData || []).map((u: any) => ({ id: u.id, name: u.name || 'Sem nome' })))
        }
        load()
    }, [user?.id])

    const filteredPatients = patientSearch.trim()
        ? linkedPatients.filter(p => p.name.toLowerCase().includes(patientSearch.trim().toLowerCase()))
        : linkedPatients

    const tabs = [
        { id: 'governance' as TabId, label: 'Clinical Governance Engine', icon: Shield, color: 'text-indigo-400' },
        { id: 'patient-focus' as TabId, label: 'Paciente em foco', icon: User, color: 'text-amber-400' },
        { id: 'reports' as TabId, label: 'Relatórios IA', icon: BarChart3, color: 'text-orange-400' },
        { id: 'knowledge' as TabId, label: 'Base de Conhecimento', icon: BookOpen, color: 'text-emerald-400' },
        { id: 'forum' as TabId, label: 'Fórum de Casos Clínicos', icon: MessageSquare, color: 'text-cyan-400' }
    ]

    const renderContent = () => {
        switch (activeTab) {
            case 'governance':
                return (
                    <div className="h-full overflow-y-auto scrollbar-hide">
                        <ClinicalGovernanceDemo
                            selectedPatientId={selectedPatient?.id ?? null}
                            selectedPatientName={selectedPatient?.name ?? null}
                        />
                    </div>
                )
            case 'reports':
                return (
                  <div className="h-full overflow-y-auto scrollbar-hide p-4">
                    <ClinicalReports className="max-w-6xl mx-auto" />
                  </div>
                )
            case 'knowledge':
                return <div className="h-full overflow-y-auto scrollbar-hide"><Library /></div>
            case 'forum':
                return <div className="h-full overflow-y-auto scrollbar-hide"><ForumCasosClinicos /></div>
            case 'patient-focus':
                return (
                    <div className="h-full overflow-y-auto scrollbar-hide p-4 md:p-6">
                        <div className="w-full max-w-full min-w-0">
                            {showPatientAvatarView && selectedPatient ? (
                                /* Unificado: Evolução e Analytics (avatar) + Prontuário em duas sub-abas */
                                <div className="h-full min-h-0 flex flex-col -m-2">
                                    <div className="flex items-center justify-between gap-4 mb-4 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => { setShowPatientAvatarView(false); setPatientFocusSubTab('analytics') }}
                                            className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            Voltar à seleção
                                        </button>
                                        <div className="flex items-center gap-2 min-w-0">
                                            {patientAvatarUrl ? (
                                                <img src={patientAvatarUrl} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/50" />
                                            ) : (
                                                <span className="w-8 h-8 rounded-full bg-amber-500/50 flex items-center justify-center text-amber-200 text-sm font-semibold">
                                                    {selectedPatient.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                            <span className="text-white font-medium truncate">{selectedPatient.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 p-1 rounded-xl bg-slate-800/60 border border-slate-700/50 mb-4 flex-shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setPatientFocusSubTab('analytics')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${patientFocusSubTab === 'analytics' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                                        >
                                            <LayoutDashboard className="w-4 h-4" />
                                            Evolução e Analytics
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPatientFocusSubTab('prontuario')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${patientFocusSubTab === 'prontuario' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                                        >
                                            <ClipboardList className="w-4 h-4" />
                                            Prontuário
                                        </button>
                                    </div>
                                    <div className="flex-1 min-h-0 overflow-hidden flex flex-col terminal-patient-focus-content">
                                        {patientFocusSubTab === 'analytics' ? (
                                            <div className="flex-1 overflow-y-auto scrollbar-hide">
                                                <PatientAnalytics
                                                    reports={focusReports}
                                                    loading={focusReportsLoading}
                                                    user={{ id: selectedPatient.id, name: selectedPatient.name } as any}
                                                    appointments={focusAppointments}
                                                    patientPrescriptions={focusPrescriptions}
                                                    patientPrescriptionsLoading={focusPrescriptionsLoading}
                                                    isProfessionalView
                                                    compact
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex-1 min-h-0 flex flex-col">
                                                <PatientsManagement
                                                    embedded
                                                    detailOnly
                                                    preselectedPatientId={selectedPatient.id}
                                                    onBack={() => setShowPatientAvatarView(false)}
                                                    hideBackButton
                                                    compact
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-6">
                                        <User className="w-10 h-10 text-amber-400" />
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Paciente em foco</h2>
                                            <p className="text-sm text-slate-400">Selecione um paciente para acessar Evolução e Analytics (avatar, scores, relatórios) e o Prontuário completo em uma única vista.</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 mb-6">
                                        <div className="relative" ref={patientDropdownRef}>
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="text"
                                                value={patientSearch}
                                                onChange={(e) => { setPatientSearch(e.target.value); setPatientDropdownOpen(true) }}
                                                onFocus={() => setPatientDropdownOpen(true)}
                                                placeholder="Buscar por nome..."
                                                className="w-64 pl-9 pr-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                                            />
                                            {patientDropdownOpen && filteredPatients.length > 0 && (
                                                <div className="absolute top-full left-0 mt-1 w-72 rounded-lg border border-slate-700 bg-slate-900 shadow-xl z-30 max-h-48 overflow-y-auto scrollbar-hide">
                                                    {filteredPatients.map((p) => (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            onClick={() => { setSelectedPatient(p); setPatientSearch(p.name); setPatientDropdownOpen(false) }}
                                                            className="w-full px-3 py-2 text-left text-sm text-white hover:bg-amber-500/20 flex items-center gap-2"
                                                        >
                                                            <span className="w-8 h-8 rounded-full bg-amber-500/40 flex items-center justify-center text-amber-200 text-xs font-semibold">
                                                                {p.name.charAt(0).toUpperCase()}
                                                            </span>
                                                            {p.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {selectedPatient && (
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/15 border border-amber-500/30">
                                                <span className="w-8 h-8 rounded-full bg-amber-500/50 flex items-center justify-center text-white text-sm font-semibold">
                                                    {selectedPatient.name.charAt(0).toUpperCase()}
                                                </span>
                                                <span className="text-sm text-white font-medium">{selectedPatient.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => { setSelectedPatient(null); setPatientSearch('') }}
                                                    className="text-slate-400 hover:text-white text-xs"
                                                >
                                                    limpar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {selectedPatient ? (
                                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
                                            <p className="text-sm text-amber-200 mb-4">
                                                <strong>{selectedPatient.name}</strong> em foco. Abra Evolução e Analytics + Prontuário (duas abas unificadas).
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setShowPatientAvatarView(true)}
                                                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium"
                                            >
                                                Abrir vista unificada
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 text-center text-slate-400">
                                            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>Busque e selecione um paciente acima para abrir Evolução e Analytics + Prontuário no terminal.</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-[#050914] w-full overflow-hidden" data-clinical-terminal>
            {/* Header do Terminal */}
            <header className="bg-[#0B1120] border-b border-slate-800 shrink-0 z-20 shadow-2xl">
                <div className="flex items-center justify-between px-6 h-16 w-full">
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                            <TerminalIcon className="w-6 h-6 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-black text-white leading-none tracking-tight">TERMINAL <span className="text-indigo-400">CLÍNICO</span></h1>
                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-1">Command & Governance Center</p>
                        </div>
                    </div>

                    <nav className="flex-1 flex items-center justify-center mx-4 h-full">
                        <div className="flex items-center gap-2 p-1 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                            {tabs.map((tab) => {
                                const Icon = tab.icon
                                const isActive = activeTab === tab.id
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            relative group flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                                            ${isActive
                                                ? 'bg-slate-800 text-white shadow-lg border border-slate-700/50'
                                                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'}
                                        `}
                                    >
                                        <Icon className={`w-4 h-4 transition-colors ${isActive ? tab.color : 'text-slate-600 group-hover:text-slate-500'}`} />
                                        <span className="hidden md:inline">{tab.label}</span>
                                        {isActive && (
                                            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full blur-[2px] ${tab.color.replace('text-', 'bg-')}`}></div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </nav>

                    <div className="flex items-center gap-3 shrink-0">
                        <div className="h-8 w-[1px] bg-slate-800 mx-2 hidden sm:block"></div>
                        <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            <Shield className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Viewport */}
            <main className="flex-1 overflow-hidden relative bg-[#050914]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(5,9,20,1)_100%)]"></div>
                <div className="relative h-full z-10 animate-in fade-in zoom-in-95 duration-500">
                    {renderContent()}
                </div>

                {/* Marca d'água logo — canto inferior direito */}
                <div
                    className="absolute bottom-4 right-4 z-20 flex items-center gap-2 opacity-20 hover:opacity-30 transition-opacity pointer-events-none"
                    aria-hidden
                >
                    <img
                        src="/brain.png"
                        alt=""
                        className="w-8 h-8 object-contain"
                    />
                    <span className="text-[10px] font-semibold text-emerald-400/90 uppercase tracking-widest">
                        MedCannLab
                    </span>
                </div>
            </main>
        </div>
    )
}

export default ClinicalTerminal
