import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  X,
  Shield,
  Bell,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Download,
  Settings
} from 'lucide-react'

const Profile: React.FC = () => {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isPasswordEditing, setIsPasswordEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [preferences, setPreferences] = useState({
    notifications: true,
    language: 'pt'
  })

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: (user as any).phone || '',
        location: (user as any).location || '',
        bio: (user as any).bio || ''
      })
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      // Atualizar perfil no Supabase
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      // Atualizar metadata do auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio
        }
      })

      if (updateError) throw updateError

      success('Perfil atualizado com sucesso!')
      setIsEditing(false)
    } catch (err: any) {
      showError(err.message || 'Erro ao atualizar perfil')
      console.error('Erro:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('As senhas não coincidem')
      return
    }

    if (passwordData.newPassword.length < 6) {
      showError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setIsLoading(true)
    try {
      // Atualizar senha no Supabase
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      success('Senha alterada com sucesso!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setIsPasswordEditing(false)
    } catch (err: any) {
      showError(err.message || 'Erro ao alterar senha')
      console.error('Erro:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    if (!user) return
    
    try {
      const data = {
        name: user.name,
        email: user.email,
        type: user.type,
        created_at: new Date().toISOString(),
        profile: formData
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `meus-dados-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      success('Dados exportados com sucesso!')
    } catch (err: any) {
      showError('Erro ao exportar dados')
      console.error('Erro:', err)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: '',
        location: '',
        bio: ''
      })
    }
    setIsEditing(false)
  }

  const getAccountStats = () => {
    // Mock data - em produção viria do banco
    return {
      memberSince: 'Janeiro 2024',
      lastLogin: 'Hoje',
      accountType: user?.type || 'professional'
    }
  }

  const stats = getAccountStats()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          👤 Meu Perfil
        </h1>
        <p className="text-slate-300">
          Gerencie suas informações pessoais e configurações
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                📝 Informações Pessoais
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <span>💾</span>
                    <span>{isLoading ? 'Salvando...' : 'Salvar'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {formData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {user?.name || 'Usuário'}
                  </h3>
                  <p className="text-slate-300">
                    {user?.type === 'professional' ? '👨‍⚕️ Profissional' : 
                     user?.type === 'patient' ? '👤 Paciente' : 
                     user?.type === 'student' ? '👨‍🎓 Estudante' : '👑 Administrador'}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-4 py-3 bg-slate-600 border border-slate-600 rounded-lg text-white cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Localização
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="São Paulo, SP"
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Biografia
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Conte um pouco sobre você..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                🔒 Segurança
              </h2>
              {!isPasswordEditing && (
                <button
                  onClick={() => setIsPasswordEditing(true)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
                >
                  Alterar Senha
                </button>
              )}
            </div>

            {isPasswordEditing && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      placeholder="Digite sua senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite sua nova senha"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirme sua nova senha"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    {isLoading ? 'Alterando...' : 'Confirmar Alteração'}
                  </button>
                  <button
                    onClick={() => {
                      setIsPasswordEditing(false)
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      })
                    }}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Stats */}
          <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              📊 Estatísticas da Conta
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Membro desde:</span>
                <span className="text-sm font-medium text-white">
                  {stats.memberSince}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Último login:</span>
                <span className="text-sm font-medium text-white">
                  {stats.lastLogin}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Tipo de conta:</span>
                <span className="text-sm font-medium text-white">
                  {user?.type === 'professional' ? '👨‍⚕️ Profissional' : 
                   user?.type === 'patient' ? '👤 Paciente' : 
                   user?.type === 'student' ? '👨‍🎓 Estudante' : '👑 Administrador'}
                </span>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              ⚙️ Preferências
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Notificações</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={preferences.notifications}
                    onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Idioma</span>
                </div>
                <select 
                  className="text-sm border border-slate-600 rounded px-2 py-1 bg-slate-700 text-white"
                  value={preferences.language}
                  onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                >
                  <option value="pt">Português</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Privacidade</span>
                </div>
                <button className="text-sm text-blue-400 hover:text-blue-300">
                  Configurar
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/80 rounded-lg p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              ⚡ Ações Rápidas
            </h3>
            <div className="space-y-3">
              <button 
                onClick={handleExportData}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-slate-700/50 rounded-lg transition-colors duration-200"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-white">Exportar Dados</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-slate-700/50 rounded-lg transition-colors duration-200">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white">Configurações de Segurança</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-slate-700/50 rounded-lg transition-colors duration-200">
                <Bell className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white">Gerenciar Notificações</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
