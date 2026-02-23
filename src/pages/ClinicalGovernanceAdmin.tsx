/**
 * Clinical Governance (ACDSS) - Premium "Space Tech" Dashboard
 * Versão Master V2: Monitoramento Financeiro & Controle Total
 */

import { useState, useEffect } from 'react'
import {
    Brain,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    RefreshCw,
    ShieldCheck,
    Activity,
    Database,
    Zap,
    LayoutGrid,
    Droplet,
    Leaf,
    User,
    Eye,
    MessageSquare,
    X,
    Bell,
    DollarSign,
    Lock,
    Unlock,
    Wifi,
    WifiOff,
    Search,
    CreditCard,
    Ban
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { notificationService } from '../services/notificationService'

// --- Types ---
type Domain = 'todos' | 'cannabis' | 'nefrologia'

interface AdminUser {
    user_id: string
    name: string
    email: string
    type: string
    status: 'active' | 'suspended' | 'banned'
    payment_status: 'pending' | 'paid' | 'exempt'
    owner_id: string | null
    created_at: string
    last_sign_in_at: string | null
    is_online: boolean
}

// --- Space Components ---
const SpaceCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-[#0B1120]/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-xl shadow-black/40 ${className}`}>
        {children}
    </div>
)

const NeonBadge = ({ type, text }: { type: 'success' | 'warning' | 'danger' | 'info' | 'purple', text: string }) => {
    const styles = {
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
        danger: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
        info: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
        purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
    }
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${styles[type]}`}>
            {text}
        </span>
    )
}

export default function ClinicalGovernanceAdmin() {
    // State
    const [users, setUsers] = useState<AdminUser[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [refreshTime, setRefreshTime] = useState(new Date())

    // Stats
    const stats = {
        totalUsers: users.length,
        totalRevenue: users.filter(u => u.payment_status === 'paid').length * 63,
        onlineNow: users.filter(u => u.is_online).length,
        pendingPayments: users.filter(u => u.payment_status === 'pending').length
    }

    // Fetch Data (RPC)
    const fetchData = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.rpc('admin_get_users_status')
            if (error) throw error
            if (data) setUsers(data as any)
        } catch (error) {
            console.error('Erro no Painel Admin:', error)
        } finally {
            setLoading(false)
            setRefreshTime(new Date())
        }
    }

    // Actions
    const handleTogglePayment = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'paid' ? 'pending' : 'paid'
        // Optimistic UI
        setUsers(users.map(u => u.user_id === userId ? { ...u, payment_status: newStatus as any } : u))

        const { error } = await supabase.from('users').update({ payment_status: newStatus }).eq('id', userId)
        if (error) fetchData() // Revert on error
    }

    const handleToggleBan = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'banned' ? 'active' : 'banned'
        if (!confirm(`Tem certeza que deseja ${newStatus === 'banned' ? 'BANIR' : 'ATIVAR'} este usuário?`)) return

        // Optimistic UI
        setUsers(users.map(u => u.user_id === userId ? { ...u, status: newStatus as any } : u))

        const { error } = await supabase.from('users').update({ status: newStatus }).eq('id', userId)
        if (error) fetchData()
    }

    useEffect(() => {
        fetchData()
        // Auto-refresh every 30s for "Live" feel
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-[#050914] p-6 lg:p-10 font-sans text-slate-300">

            {/* 1. Header Premium */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                            <Activity className="w-8 h-8 text-indigo-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">
                                MISSION <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">CONTROL</span>
                            </h1>
                            <p className="text-slate-500 text-sm font-medium tracking-wide">MEDCANNLAB GOVERNANCE V3.0</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Status</span>
                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            OPERATIONAL
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 hover:border-slate-600 text-white"
                        title="Force Refresh"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="h-10 w-[1px] bg-slate-800 mx-2"></div>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px]">
                            <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. KPI Grid (Space Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <SpaceCard className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <User className="w-24 h-24" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                            <User className="w-6 h-6" />
                        </div>
                        <NeonBadge type="info" text="TOTAL" />
                    </div>
                    <div className="text-4xl font-black text-white mb-1">{stats.totalUsers}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Usuários Cadastrados</div>
                </SpaceCard>

                <SpaceCard className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign className="w-24 h-24" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <NeonBadge type="success" text="REVENUE" />
                    </div>
                    <div className="text-4xl font-black text-white mb-1">
                        R$ {stats.totalRevenue.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Receita Estimada (Paid)</div>
                </SpaceCard>

                <SpaceCard className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wifi className="w-24 h-24" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                            <Wifi className="w-6 h-6" />
                        </div>
                        <NeonBadge type="purple" text="LIVE" />
                    </div>
                    <div className="text-4xl font-black text-white mb-1">{stats.onlineNow}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Online Agora (15min)</div>
                </SpaceCard>

                <SpaceCard className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle className="w-24 h-24" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <NeonBadge type="warning" text="PENDING" />
                    </div>
                    <div className="text-4xl font-black text-white mb-1">{stats.pendingPayments}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">Aguardando Pagamento</div>
                </SpaceCard>
            </div>

            {/* 3. Main Data Grid (The "Terminal") */}
            <SpaceCard className="min-h-[600px] flex flex-col">
                {/* Toolbar */}
                <div className="p-6 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1 bg-indigo-500 rounded-full"></div>
                        <h3 className="text-xl font-bold text-white">Base de Usuários Unificada</h3>
                        <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-500 font-mono">
                            SYNC: {refreshTime.toLocaleTimeString()}
                        </span>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, email ou ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-700/50">
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Usuário / ID</th>
                                <th className="px-6 py-4">Tipo</th>
                                <th className="px-6 py-4">Financeiro</th>
                                <th className="px-6 py-4">Owner (Médico)</th>
                                <th className="px-6 py-4">Último Login</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredUsers.map((user) => (
                                <tr key={user.user_id} className={`hover:bg-slate-800/30 transition-colors group ${user.status === 'banned' ? 'opacity-50 grayscale' : ''}`}>

                                    {/* Online/Status */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {user.status === 'banned' ? (
                                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                            ) : user.is_online ? (
                                                <div className="relative flex h-2.5 w-2.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                                </div>
                                            ) : (
                                                <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
                                            )}

                                            <span className={`text-xs font-bold ${user.is_online ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                {user.status === 'banned' ? 'BANIDO' : user.is_online ? 'ONLINE' : 'OFFLINE'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* User Info */}
                                    <td className="px-6 py-4">
                                        <div>
                                            <div className="font-bold text-white text-sm">{user.name || 'Sem Nome'}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{user.email}</div>
                                            <div className="text-[10px] text-slate-600 font-mono mt-0.5">ID: {user.user_id.slice(0, 8)}...</div>
                                        </div>
                                    </td>

                                    {/* Type */}
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${user.type === 'admin' ? 'bg-indigo-500/20 text-indigo-400' :
                                                user.type === 'profissional' ? 'bg-purple-500/20 text-purple-400' :
                                                    'bg-slate-700/30 text-slate-400'
                                            }`}>
                                            {user.type}
                                        </span>
                                    </td>

                                    {/* Financeiro */}
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleTogglePayment(user.user_id, user.payment_status)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-xs font-bold ${user.payment_status === 'paid'
                                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                                                }`}
                                        >
                                            {user.payment_status === 'paid' ? <CheckCircle className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                                            {user.payment_status.toUpperCase()}
                                        </button>
                                    </td>

                                    {/* Owner */}
                                    <td className="px-6 py-4">
                                        {user.owner_id ? (
                                            <div className="text-xs text-slate-400 flex items-center gap-1.5">
                                                <User className="w-3 h-3" />
                                                {users.find(u => u.user_id === user.owner_id)?.name || 'Desconhecido'}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-slate-600">-</span>
                                        )}
                                    </td>

                                    {/* Last Login */}
                                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Nunca'}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleToggleBan(user.user_id, user.status)}
                                                className={`p-2 rounded-lg transition-all ${user.status === 'banned'
                                                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                                                        : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                                                    }`}
                                                title={user.status === 'banned' ? "Desbanir Usuário" : "Banir Usuário"}
                                            >
                                                {user.status === 'banned' ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </td>

                                </tr>
                            ))}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-600">
                                            <Search className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="text-sm font-medium">Nenhum usuário encontrado.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </SpaceCard>
        </div>
    )
}
