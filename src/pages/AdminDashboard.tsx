import React, { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Activity, BarChart3, FileText, Settings, ShieldAlert, Upload, Users, Eye, Stethoscope, GraduationCap, Heart } from 'lucide-react'
import AdminSettings from './AdminSettings'
import Reports from './Reports'
import Library from './Library'
import { RiskCockpit } from '../components/RiskCockpit'
import ClinicalGovernanceAdmin from './ClinicalGovernanceAdmin'
import { useUserView } from '../contexts/UserViewContext'
import { UserType } from '../lib/userTypes'

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') || 'overview').toLowerCase()
  const { viewAsType, setViewAsType } = useUserView()

  const tabs = useMemo(() => ([
    { id: 'overview', label: 'Terminal', icon: Activity },
    { id: 'risco', label: 'Risco', icon: ShieldAlert },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'analytics', label: 'Análises', icon: BarChart3 },
    { id: 'system', label: 'Sistema', icon: Settings },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'upload', label: 'Conhecimento', icon: Upload }
  ]), [])

  const viewAsOptions: { type: UserType; label: string; icon: React.ElementType; route: string }[] = [
    { type: 'paciente', label: 'Paciente', icon: Heart, route: '/app/clinica/paciente/dashboard' },
    { type: 'profissional', label: 'Profissional', icon: Stethoscope, route: '/app/clinica/profissional/dashboard' },
    { type: 'aluno', label: 'Aluno', icon: GraduationCap, route: '/app/ensino/aluno/dashboard' },
  ]

  const setTab = (next: string) => {
    const nextTab = next || 'overview'
    setSearchParams(prev => {
      const p = new URLSearchParams(prev)
      p.set('tab', nextTab)
      return p
    }, { replace: true })
  }

  const handleViewAs = (type: UserType, route: string) => {
    setViewAsType(type)
    navigate(route)
  }

  const renderContent = () => {
    switch (tab) {
      case 'users':
        return <AdminSettings initialTab="users" />
      case 'analytics':
        return <AdminSettings initialTab="analytics" />
      case 'system':
        return <AdminSettings initialTab="system" />
      case 'reports':
        return <Reports />
      case 'upload':
        return <Library />
      case 'risco':
        return <RiskCockpit />
      case 'overview':
      default:
        return <ClinicalGovernanceAdmin />
    }
  }

  return (
    <div className="min-h-screen bg-[#050914] text-white">
      <div className="max-w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Barra de navegação principal */}
        <div className="bg-[#0f172a]/50 backdrop-blur-md rounded-2xl border border-slate-800/50 shadow-xl">
          <nav className="flex gap-2 p-2 overflow-x-auto scrollbar-hide">
            {tabs.map((t) => {
              const Icon = t.icon
              const active = tab === t.id || (!searchParams.get('tab') && t.id === 'overview')
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl whitespace-nowrap transition-all font-bold text-sm ${active
                    ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] border border-indigo-400/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-600'}`} />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Barra "Visualizar Como" — Admin pode simular qualquer perfil */}
        <div className="bg-[#0f172a]/40 backdrop-blur-md rounded-xl border border-slate-800/40 px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <Eye className="w-4 h-4" />
            <span>Visualizar como:</span>
          </div>
          {viewAsOptions.map(({ type, label, icon: Icon, route }) => (
            <button
              key={type}
              onClick={() => handleViewAs(type, route)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                viewAsType === type
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
          {viewAsType && (
            <button
              onClick={() => setViewAsType(null)}
              className="px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-900/20 transition-all ml-auto"
            >
              ✕ Sair do modo visualização
            </button>
          )}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
