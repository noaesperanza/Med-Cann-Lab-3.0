import React, { useState, useEffect } from 'react'
import {
    Calendar,
    Clock,
    Users,
    TrendingUp,
    Star,
    DollarSign,
    BarChart3,
    PieChart,
    Settings,
    Plus,
    Edit,
    Trash2,
    Eye,
    Download,
    Filter,
    Search,
    Loader2,
    ChevronLeft,
    ChevronRight,
    MessageCircle,
    X,
    Phone,
    Check,
    Activity
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface RicardoSchedulingProps {
    className?: string
    patientId?: string
}

interface Appointment {
    id: string
    patientName: string
    patientId: string
    specialty: string
    date: string
    time: string
    duration: number
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
    notes?: string
    rating?: number
    revenue?: number
    patientPhone?: string
}

interface Analytics {
    totalAppointments: number
    completionRate: number
    averageRating: number
    totalRevenue: number
    appointmentsBySpecialty: { specialty: string; count: number }[]
    occupancyByHour: { hour: string; percentage: number }[]
}

const RicardoScheduling: React.FC<RicardoSchedulingProps> = ({ className = '', patientId }) => {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'analytics'>('calendar')
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [analytics, setAnalytics] = useState<Analytics | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date()) // Para navegar no calendário
    const [searchTerm, setSearchTerm] = useState('')
    const [filterSpecialty, setFilterSpecialty] = useState('all')
    const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false)
    const [patientsList, setPatientsList] = useState<{ id: string, name: string }[]>([])
    const [saving, setSaving] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false) // Novo estado para feedback visual

    // Detalhes do Agendamento (Modal)
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

    // New Appointment Form State
    const [newAppointment, setNewAppointment] = useState({
        patientId: patientId || '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        type: 'online',
        specialty: 'Nefrologia',
        service: 'primeira',
        notes: ''
    })

    useEffect(() => {
        if (user) {
            loadData()
            loadPatientsList()
        }
    }, [user])

    useEffect(() => {
        if (patientId) {
            setNewAppointment(prev => ({ ...prev, patientId }))
        }
    }, [patientId])

    const loadPatientsList = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, name')
                .eq('type', 'patient')
                .order('name')

            if (data) {
                setPatientsList(data)
            }
        } catch (err) {
            console.error("Erro ao carregar lista de pacientes", err)
        }
    }

    const loadData = async () => {
        if (!user) return

        setLoading(true)
        try {
            const { data: appointmentsData, error: appointmentsError } = await supabase
                .from('appointments')
                .select('*')
                .order('appointment_date', { ascending: true })
            // Dr. Ricardo pode ver todos ou filtrar por ele mesmo se necessário.
            // Assumindo visão global para Admin ou filtrado se for multi-tenant real.
            // .eq('professional_id', user.id) 

            if (appointmentsError) throw appointmentsError

            let patientsMap = new Map()
            if (appointmentsData && appointmentsData.length > 0) {
                const patientIds = [...new Set(appointmentsData.map((apt: any) => apt.patient_id))]
                const { data: patientsData } = await supabase
                    .from('users')
                    .select('id, name, email, phone')
                    .in('id', patientIds)

                patientsMap = new Map((patientsData || []).map((p: any) => [p.id, p]))
            }

            const formattedAppointments: Appointment[] = (appointmentsData || []).map((apt: any) => {
                const appointmentDate = new Date(apt.appointment_date)
                const patient = patientsMap.get(apt.patient_id)
                return {
                    id: apt.id,
                    patientName: patient?.name || 'Paciente',
                    patientId: apt.patient_id,
                    specialty: apt.type || 'Nefrologia',
                    date: appointmentDate.toISOString().split('T')[0],
                    time: appointmentDate.toTimeString().slice(0, 5),
                    duration: apt.duration || 60,
                    status: apt.status as 'scheduled' | 'completed' | 'cancelled' | 'no-show',
                    notes: apt.description || apt.notes,
                    rating: apt.rating,
                    revenue: apt.revenue,
                    patientPhone: patient?.phone
                }
            })

            setAppointments(formattedAppointments)

            setAnalytics({
                totalAppointments: formattedAppointments.length,
                completionRate: 0,
                averageRating: 0,
                totalRevenue: 0,
                appointmentsBySpecialty: [],
                occupancyByHour: []
            })

        } catch (error) {
            console.error('Erro ao carregar dados:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateAppointment = async () => {
        if (!newAppointment.patientId || !newAppointment.date || !newAppointment.time) {
            alert("Preencha os campos obrigatórios!")
            return
        }

        setSaving(true)
        try {
            const appointmentDateTime = `${newAppointment.date}T${newAppointment.time}:00`

            const { error } = await supabase.from('appointments').insert({
                professional_id: user?.id,
                patient_id: newAppointment.patientId,
                appointment_date: appointmentDateTime,
                duration: 60,
                status: 'scheduled',
                type: newAppointment.specialty,
                notes: newAppointment.notes,
                title: `${newAppointment.service === 'primeira' ? 'Primeira Consulta' : newAppointment.service === 'retorno' ? 'Retorno' : 'Urgência'} - ${newAppointment.specialty}`
            })

            if (error) throw error

            // SUCESSO ELEGANTE
            setShowSuccess(true)
            loadData()

            setNewAppointment({
                patientId: '',
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                type: 'online',
                specialty: 'Nefrologia',
                service: 'primeira',
                notes: ''
            })

            // Fechar modal após 2 segundos
            setTimeout(() => {
                setShowSuccess(false)
                setIsNewAppointmentModalOpen(false)
            }, 2000)

        } catch (err: any) {
            console.error("Erro ao criar agendamento:", err)
            alert("Erro ao criar agendamento: " + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleCancelAppointment = async (id: string) => {
        if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return;

        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', id)

            if (error) throw error

            alert('Agendamento cancelado.')
            setIsDetailsModalOpen(false)
            loadData()
        } catch (err: any) {
            alert("Erro ao cancelar: " + err.message)
        }
    }

    // CALENDAR HELPERS
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const days = new Date(year, month + 1, 0).getDate()
        const firstDay = new Date(year, month, 1).getDay()
        return { days, firstDay, month, year }
    }

    const { days, firstDay, month, year } = getDaysInMonth(currentDate)
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

    const navigateMonth = (direction: -1 | 1) => {
        const newDate = new Date(currentDate)
        newDate.setMonth(currentDate.getMonth() + direction)
        setCurrentDate(newDate)
    }

    const getAppointmentsForDay = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return appointments.filter(a => a.date === dateStr && a.status !== 'cancelled')
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-cyan-500/20 text-cyan-400'
            case 'completed': return 'bg-green-500/20 text-green-400'
            case 'cancelled': return 'bg-red-500/20 text-red-400'
            case 'no-show': return 'bg-yellow-500/20 text-yellow-400'
            default: return 'bg-gray-500/20 text-gray-400'
        }
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Header - THEME: Cyan/Blue for Kidneys */}
            <div className="bg-gradient-to-r from-cyan-900 to-blue-800 rounded-lg p-6 border border-cyan-800/30">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
                            <Calendar className="w-6 h-6" />
                            <span>Agenda "Cidade Amiga dos Rins"</span>
                        </h2>
                        <p className="text-cyan-200">
                            Gerencie consultas de Nefrologia Integrativa e acompanhe seus pacientes
                        </p>
                    </div>
                    <button
                        onClick={() => setIsNewAppointmentModalOpen(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition-colors shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Nova Consulta</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-2">
                    {[
                        { key: 'calendar', label: 'Calendário', icon: <Calendar className="w-4 h-4" /> },
                        { key: 'list', label: 'Lista', icon: <Users className="w-4 h-4" /> },
                        { key: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${activeTab === tab.key
                                ? 'bg-cyan-600 text-white'
                                : 'bg-cyan-800 text-cyan-200 hover:bg-cyan-700'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* CALENDAR VIEW */}
            {activeTab === 'calendar' && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <h3 className="text-white text-xl font-bold capitalize">
                                {monthNames[month]} {year}
                            </h3>
                            <div className="flex bg-slate-700 rounded-lg p-1">
                                <button onClick={() => navigateMonth(-1)} className="p-1 hover:bg-slate-600 rounded text-slate-300"><ChevronLeft className="w-5 h-5" /></button>
                                <button onClick={() => navigateMonth(1)} className="p-1 hover:bg-slate-600 rounded text-slate-300"><ChevronRight className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <button onClick={() => setCurrentDate(new Date())} className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">
                            Hoje
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-px bg-slate-700 border border-slate-700 rounded-lg overflow-hidden">
                        {/* Days Header */}
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                            <div key={day} className="bg-slate-800 text-center text-slate-400 text-sm font-medium py-3">
                                {day}
                            </div>
                        ))}

                        {/* Empty Days */}
                        {Array.from({ length: firstDay }).map((_, i) => (
                            <div key={`empty-${i}`} className="bg-slate-800/50 min-h-[120px]"></div>
                        ))}

                        {/* Actual Days */}
                        {Array.from({ length: days }).map((_, i) => {
                            const day = i + 1
                            const dayAppointments = getAppointmentsForDay(day)
                            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString()

                            return (
                                <div key={day} className={`bg-slate-800 min-h-[120px] p-2 hover:bg-slate-700/50 transition-colors border-t border-slate-700 ${isToday ? 'bg-slate-700/30 ring-1 ring-inset ring-cyan-500' : ''}`}>
                                    <div className="text-right mb-2">
                                        <span className={`text-sm font-medium ${isToday ? 'bg-cyan-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center' : 'text-slate-400'}`}>
                                            {day}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {dayAppointments.map(app => (
                                            <button
                                                key={app.id}
                                                onClick={() => {
                                                    setSelectedAppointment(app)
                                                    setIsDetailsModalOpen(true)
                                                }}
                                                className="w-full text-left text-xs bg-slate-700 border border-slate-600 hover:border-cyan-500 rounded px-2 py-1.5 truncate transition-all group"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white font-medium">{app.time}</span>
                                                    {app.status === 'scheduled' && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>}
                                                </div>
                                                <div className="text-slate-300 truncate group-hover:text-cyan-200">
                                                    {app.patientName.split(' ')[0]}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* List View */}
            {activeTab === 'list' && (
                <div className="space-y-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                        <input
                            type="text"
                            placeholder="Buscar consultas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-700 text-white px-4 py-2 rounded-md border border-slate-600 focus:border-cyan-500 focus:outline-none"
                        />
                    </div>
                    {appointments.map((appointment) => (
                        <div key={appointment.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex justify-between">
                            <div>
                                <h4 className="text-white font-medium">{appointment.patientName}</h4>
                                <p className="text-sm text-slate-400">{appointment.date} - {appointment.time}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className="text-center text-slate-400 py-10">Analytics Carregado</div>
            )}

            {/* Modal de Novo Agendamento */}
            {isNewAppointmentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-left">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh] relative overflow-hidden">

                        {/* SUCESSO ELEGANTE - OVERLAY */}
                        {showSuccess && (
                            <div className="absolute inset-0 z-50 bg-slate-800 flex flex-col items-center justify-center animate-in fade-in duration-300">
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                    <Check className="w-10 h-10 text-green-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Agendamento Realizado!</h3>
                                <p className="text-slate-400">Consulta confirmada no calendário.</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between p-6 border-b border-slate-700 shrink-0">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-cyan-500" />
                                Nova Consulta (Nefrologia)
                            </h3>
                            <button
                                onClick={() => setIsNewAppointmentModalOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors"
                                disabled={showSuccess}
                            >
                                <Trash2 className="w-5 h-5 rotate-45" />
                                <span className="sr-only">Fechar</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Paciente</label>
                                <div className="flex gap-2">
                                    <select
                                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                                        value={newAppointment.patientId}
                                        onChange={(e) => setNewAppointment({ ...newAppointment, patientId: e.target.value })}
                                    >
                                        <option value="">Selecione um paciente</option>
                                        {patientsList.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Data</label>
                                    <input type="date" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500" value={newAppointment.date} onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Horário</label>
                                    <input type="time" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500" value={newAppointment.time} onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Especialidade/Tipo</label>
                                <select
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                                    value={newAppointment.specialty}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, specialty: e.target.value })}
                                >
                                    <option value="Nefrologia">Nefrologia Geral</option>
                                    <option value="Cannabis Medicinal">Cannabis Medicinal</option>
                                    <option value="Função Renal">Avaliação Função Renal</option>
                                    <option value="Cálculo Renal">Cálculo Renal</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Observações</label>
                                <textarea
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                                    rows={3}
                                    value={newAppointment.notes}
                                    onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                                    placeholder="Queixa principal, observações extras..."
                                />
                            </div>

                            <div className="p-6 border-t border-slate-700 flex justify-end gap-3 shrink-0">
                                <button onClick={() => setIsNewAppointmentModalOpen(false)} className="px-6 py-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors font-medium" disabled={showSuccess}>Cancelar</button>
                                <button onClick={handleCreateAppointment} className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium shadow-lg hover:scale-105" disabled={saving || showSuccess}>Agendar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* APPOINTMENT DETAILS MODAL */}
            {isDetailsModalOpen && selectedAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-700">
                            <h3 className="text-xl font-bold text-white">Detalhes do Agendamento</h3>
                            <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-cyan-900/30 rounded-full flex items-center justify-center text-cyan-400 text-xl font-bold">
                                    {selectedAppointment.patientName.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white">{selectedAppointment.patientName}</h4>
                                    <p className="text-cyan-400 text-sm">{selectedAppointment.specialty}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <span className="text-slate-400 block mb-1">Data</span>
                                    <span className="text-white font-medium flex items-center gap-2"><Calendar className="w-3 h-3" /> {new Date(selectedAppointment.date).toLocaleDateString()}</span>
                                </div>
                                <div className="bg-slate-700/50 p-3 rounded-lg">
                                    <span className="text-slate-400 block mb-1">Horário</span>
                                    <span className="text-white font-medium flex items-center gap-2"><Clock className="w-3 h-3" /> {selectedAppointment.time}</span>
                                </div>
                            </div>

                            {selectedAppointment.notes && (
                                <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-700">
                                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2 block">Observações</span>
                                    <p className="text-slate-300 text-sm">{selectedAppointment.notes}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-2 pt-4">
                                <button
                                    onClick={() => selectedAppointment.patientPhone && window.open(`https://wa.me/${selectedAppointment.patientPhone.replace(/\D/g, '')}`, '_blank')}
                                    className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                                >
                                    <Phone className="w-5 h-5 text-green-400" />
                                    <span className="text-xs">WhatsApp</span>
                                </button>
                                <button
                                    className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                                >
                                    <MessageCircle className="w-5 h-5 text-blue-400" />
                                    <span className="text-xs">Chat</span>
                                </button>
                                <button
                                    onClick={() => handleCancelAppointment(selectedAppointment.id)}
                                    className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-slate-700 hover:bg-red-900/30 hover:border-red-800 border border-transparent text-white transition-colors group"
                                >
                                    <X className="w-5 h-5 text-red-500 group-hover:text-red-400" />
                                    <span className="text-xs group-hover:text-red-300">Cancelar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default RicardoScheduling
