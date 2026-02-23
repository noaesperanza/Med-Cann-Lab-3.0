import React, { useState, useEffect, useRef } from 'react'
import {
    User,
    Search,
    ChevronLeft,
    LayoutDashboard,
    ClipboardList
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { clinicalReportService } from '../lib/clinicalReportService'
import PatientsManagement from '../pages/PatientsManagement'
import PatientAnalytics from './PatientAnalytics'

export interface PatientFocusViewProps {
    /** Paciente ativo no workstation (fonte única de verdade). Esta view consome e pode sugerir mudança. */
    activePatientId: string | null
    /** Callback para o workstation atualizar o paciente global. PatientFocusView não é dona do estado. */
    onPatientChange: (patientId: string | null, patientName?: string) => void
}

const PatientFocusView: React.FC<PatientFocusViewProps> = ({ activePatientId, onPatientChange }) => {
    const { user } = useAuth()
    const [linkedPatients, setLinkedPatients] = useState<{ id: string; name: string }[]>([])
    const [patientSearch, setPatientSearch] = useState('')
    const [patientDropdownOpen, setPatientDropdownOpen] = useState(false)
    /** Paciente selecionado nesta view (sincronizado com activePatientId quando possível). */
    const [selectedPatient, setSelectedPatient] = useState<{ id: string; name: string } | null>(null)
    const [showPatientAvatarView, setShowPatientAvatarView] = useState(false)
    const [patientAvatarUrl, setPatientAvatarUrl] = useState<string | null>(null)
    const patientDropdownRef = useRef<HTMLDivElement>(null)
    const [patientFocusSubTab, setPatientFocusSubTab] = useState<'analytics' | 'prontuario'>('analytics')
    const [focusReports, setFocusReports] = useState<any[]>([])
    const [focusReportsLoading, setFocusReportsLoading] = useState(false)
    const [focusAppointments, setFocusAppointments] = useState<Array<{ id: string; date: string; time: string; professional: string; type: string; status: string }>>([])
    const [focusPrescriptions, setFocusPrescriptions] = useState<Array<{ id: string; title: string; status: string; issuedAt?: string; startsAt?: string | null; endsAt?: string | null; professionalName?: string | null }>>([])
    const [focusPrescriptionsLoading, setFocusPrescriptionsLoading] = useState(false)

    // Sincronizar selectedPatient com activePatientId (workstation é fonte da verdade)
    useEffect(() => {
        if (!activePatientId) {
            setSelectedPatient(null)
            return
        }
        const found = linkedPatients.find(p => p.id === activePatientId)
        if (found) setSelectedPatient(found)
        else if (linkedPatients.length > 0) setSelectedPatient(null)
    }, [activePatientId, linkedPatients])

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

    const handleSelectPatient = (p: { id: string; name: string }) => {
        setSelectedPatient(p)
        setPatientSearch(p.name)
        setPatientDropdownOpen(false)
        onPatientChange(p.id, p.name)
    }

    const handleClearPatient = () => {
        setSelectedPatient(null)
        setPatientSearch('')
        onPatientChange(null)
    }

    const filteredPatients = patientSearch.trim()
        ? linkedPatients.filter(p => p.name.toLowerCase().includes(patientSearch.trim().toLowerCase()))
        : linkedPatients

    return (
        <div className="h-full overflow-y-auto scrollbar-hide p-4 md:p-6">
            <div className="w-full max-w-full min-w-0">
                {showPatientAvatarView && selectedPatient ? (
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
                                <p className="text-sm text-slate-400">Selecione um paciente para acessar Evolução e Analytics e o Prontuário em uma única vista.</p>
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
                                                onClick={() => handleSelectPatient(p)}
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
                                        onClick={handleClearPatient}
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
                                <p>Busque e selecione um paciente acima para abrir Evolução e Analytics + Prontuário.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default PatientFocusView
