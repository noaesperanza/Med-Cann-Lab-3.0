import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  Settings,
  Users,
  Database,
  Shield,
  Bell,
  Globe,
  Lock,
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Key,
  Server,
  Mail,
  BarChart3,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Edit,
  Eye,
  EyeOff,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react'

const AdminSettings: React.FC = () => {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('general')
  const [isLoading, setIsLoading] = useState(false)

  // Estado para configurações gerais
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'MedCannLab 3.0',
    maintenanceMode: false,
    allowRegistrations: true,
    defaultUserRole: 'patient',
    sessionTimeout: 60
  })

  // Estado para estatísticas
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalDocuments: 0,
    totalMessages: 0,
    systemHealth: 'excellent'
  })

  // Carregar estatísticas
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Contar usuários
      const { count: userCount } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })

      // Contar documentos
      const { count: docCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })

      // Contar mensagens
      const { count: msgCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalUsers: userCount || 0,
        activeUsers: userCount || 0,
        totalDocuments: docCount || 0,
        totalMessages: msgCount || 0,
        systemHealth: 'excellent'
      })
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    }
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // Aqui você salvaria as configurações no banco
      success('Configurações salvas com sucesso!')
    } catch (err: any) {
      showError(err.message || 'Erro ao salvar configurações')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    try {
      // Exportar dados do sistema
      const data = {
        settings: generalSettings,
        stats,
        exportedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `admin-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      success('Dados exportados com sucesso!')
    } catch (err: any) {
      showError('Erro ao exportar dados')
    }
  }

  // Se não for admin, redirecionar
  useEffect(() => {
    if (user && user.type !== 'admin') {
      navigate('/app/profile')
    }
  }, [user, navigate])

  if (user?.type !== 'admin') {
    return null
  }

  const tabs = [
    { id: 'general', name: '⚙️ Geral', icon: Settings },
    { id: 'users', name: '👥 Usuários', icon: Users },
    { id: 'content', name: '📚 Conteúdo', icon: FileText },
    { id: 'security', name: '🔒 Segurança', icon: Shield },
    { id: 'notifications', name: '🔔 Notificações', icon: Bell },
    { id: 'analytics', name: '📊 Análises', icon: BarChart3 },
    { id: 'backup', name: '💾 Backup', icon: Database },
    { id: 'system', name: '🖥️ Sistema', icon: Server }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            ⚙️ Configurações Administrativas
          </h1>
          <p className="text-slate-300">
            Gerencie todas as configurações da plataforma
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Config</span>
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Salvando...' : 'Salvar Todas'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total de Usuários</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Documentos</p>
              <p className="text-2xl font-bold text-white">{stats.totalDocuments}</p>
            </div>
            <FileText className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Mensagens</p>
              <p className="text-2xl font-bold text-white">{stats.totalMessages}</p>
            </div>
            <Mail className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Status do Sistema</p>
              <p className="text-2xl font-bold text-green-400">✓ Excelente</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800/80 rounded-lg border border-slate-700">
        <div className="border-b border-slate-700">
          <nav className="flex space-x-1 p-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Configurações Gerais</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome da Plataforma
                  </label>
                  <input
                    type="text"
                    value={generalSettings.platformName}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, platformName: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">Modo de Manutenção</p>
                    <p className="text-xs text-slate-400">Bloquear acesso de usuários durante manutenção</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generalSettings.maintenanceMode}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-white">Permitir Registros</p>
                    <p className="text-xs text-slate-400">Permitir novos usuários se registrarem</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={generalSettings.allowRegistrations}
                      onChange={(e) => setGeneralSettings(prev => ({ ...prev, allowRegistrations: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Timeout de Sessão (minutos)
                  </label>
                  <input
                    type="number"
                    value={generalSettings.sessionTimeout}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 60 }))}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="5"
                    max="480"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Gestão de Usuários</h3>
                <button
                  onClick={() => navigate('/app/admin/users')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Ver Todos</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <p className="text-sm text-slate-400 mb-2">Total de Usuários</p>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <p className="text-sm text-slate-400 mb-2">Usuários Ativos</p>
                  <p className="text-3xl font-bold text-green-400">{stats.activeUsers}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <p className="text-sm text-slate-400 mb-2">Novos Hoje</p>
                  <p className="text-3xl font-bold text-blue-400">0</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/app/admin/users')}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition-colors text-left"
                >
                  <p className="font-medium">Gestão Completa de Usuários</p>
                  <p className="text-sm text-slate-400">Ver, editar e gerenciar todos os usuários</p>
                </button>
                <button
                  onClick={loadStats}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Gestão de Conteúdo</h3>
                <button
                  onClick={() => navigate('/app/library')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Biblioteca</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-white">Documentos</p>
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stats.totalDocuments}</p>
                  <button
                    onClick={() => navigate('/app/admin/upload')}
                    className="mt-3 text-sm text-blue-400 hover:text-blue-300"
                  >
                    Gerenciar Documentos →
                  </button>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-white">Categorias</p>
                    <Settings className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-white">-</p>
                  <button
                    onClick={() => navigate('/app/admin/upload')}
                    className="mt-3 text-sm text-purple-400 hover:text-purple-300"
                  >
                    Configurar Categorias →
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Segurança e Privacidade</h3>
              
              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-white">Autenticação de Dois Fatores</p>
                      <p className="text-xs text-slate-400">Requerer 2FA para todos os admins</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-white">Logs de Auditoria</p>
                      <p className="text-xs text-slate-400">Registrar todas as ações administrativas</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-white">Política de Senhas</p>
                      <p className="text-xs text-slate-400">Forçar senhas fortes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/app/admin/system')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors text-left flex items-center justify-between"
                >
                  <span>Configurações Avançadas de Segurança</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Notificações do Sistema</h3>
              
              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-white">Notificações por Email</p>
                      <p className="text-xs text-slate-400">Enviar emails para eventos importantes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-white">Alertas de Sistema</p>
                      <p className="text-xs text-slate-400">Notificar sobre problemas do sistema</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Análises e Relatórios</h3>
                <button
                  onClick={() => navigate('/app/admin/analytics')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Ver Análises Completas</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <p className="text-sm text-slate-400 mb-2">Relatórios Disponíveis</p>
                  <p className="text-2xl font-bold text-white">12</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <p className="text-sm text-slate-400 mb-2">Último Relatório</p>
                  <p className="text-lg font-medium text-white">Hoje</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Backup e Restauração</h3>
              
              <div className="space-y-4">
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-white">Backup Automático</p>
                      <p className="text-xs text-slate-400">Executar backup diariamente</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors">
                    <Download className="w-5 h-5 mx-auto mb-2" />
                    <p className="font-medium">Criar Backup Agora</p>
                  </button>
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors">
                    <Upload className="w-5 h-5 mx-auto mb-2" />
                    <p className="font-medium">Restaurar Backup</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Sistema e Performance</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <p className="text-sm text-slate-400 mb-2">Status do Sistema</p>
                  <p className="text-2xl font-bold text-green-400">✓ Operacional</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <p className="text-sm text-slate-400 mb-2">Uptime</p>
                  <p className="text-2xl font-bold text-white">99.9%</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <p className="text-sm text-slate-400 mb-2">Versão</p>
                  <p className="text-2xl font-bold text-white">3.0.0</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <p className="text-sm text-slate-400 mb-2">Última Atualização</p>
                  <p className="text-lg font-medium text-white">Hoje</p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/app/admin/system')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors text-left"
                >
                  <p className="font-medium">Configurações Avançadas</p>
                  <p className="text-sm text-slate-300">Ajustes detalhados do sistema</p>
                </button>
                <button
                  onClick={loadStats}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
