import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Settings,
  ArrowLeft,
  Wallet,
  Award,
  Camera,
  Star
} from 'lucide-react'

const Profile: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
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

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Avatar: user_metadata.avatar_url ou auth
  useEffect(() => {
    const url = (user as any)?.user_metadata?.avatar_url ?? (user as any)?.avatar_url ?? null
    setAvatarUrl(url)
  }, [user])

  // Scroll para #carteira quando vier pelo link da Carteira
  useEffect(() => {
    if (window.location.hash === '#carteira') {
      const el = document.getElementById('carteira')
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || ''
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
        .from('profiles')
        .upsert({
          id: user.id,
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

  const handleChangePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    if (!file.type.startsWith('image/')) {
      showError('Selecione uma imagem (JPG, PNG ou GIF).')
      return
    }
    setIsUploadingPhoto(true)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `profiles/${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatar')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatar').getPublicUrl(path)
      const urlWithCache = `${publicUrl}?t=${Date.now()}`

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: urlWithCache }
      })
      if (updateError) throw updateError

      setAvatarUrl(urlWithCache)
      success('Foto atualizada!')
      window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: { url: urlWithCache } }))
    } catch (err: any) {
      showError(err.message || 'Erro ao enviar foto. Verifique se o bucket "avatar" permite upload em profiles/.')
    } finally {
      setIsUploadingPhoto(false)
      e.target.value = ''
    }
  }

  const triggerFileInput = () => fileInputRef.current?.click()

  const getAccountStats = () => {
    // Mock data - em produção viria do banco
    return {
      memberSince: 'Janeiro 2024',
      lastLogin: 'Hoje',
      accountType: user?.type || 'profissional'
    }
  }

  const stats = getAccountStats()

  const walletCredits = 0
  const ranking = 42
  // Média de estrelas (0–5) das avaliações que entram no cálculo do rank (a cada 50 consultas/avaliações). Em produção viria do banco.
  const averageRatingStars = 4.2
  const renderStars = (value: number) => {
    const v = Math.min(5, Math.max(0, value))
    const full = Math.floor(v)
    const half = v - full >= 0.5 ? 1 : 0
    const empty = 5 - full - half
    return (
      <span className="inline-flex items-center gap-0.5" title={`${value.toFixed(1)} de 5`}>
        {Array.from({ length: full }, (_, i) => (
          <Star key={`f-${i}`} className="w-4 h-4 text-amber-400 fill-amber-400" />
        ))}
        {half ? <Star key="h" className="w-4 h-4 text-amber-400 fill-amber-400" /> : null}
        {Array.from({ length: empty }, (_, i) => (
          <Star key={`e-${i}`} className="w-4 h-4 text-slate-500" />
        ))}
      </span>
    )
  }

  return (
    <div className="space-y-3 px-3.5 sm:px-5 lg:px-7 max-w-6xl mx-auto -mt-4 pt-1">
      {/* Voltar */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar
      </button>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-semibold text-white mb-1">
          Meu Perfil
        </h1>
        <p className="text-sm text-slate-400">
          Informações pessoais e configurações
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">
                Informações Pessoais
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Edit className="w-3 h-3" />
                  Editar
                </button>
              ) : (
                <div className="flex gap-1.5">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    {isLoading ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Avatar + Alterar foto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleChangePhoto}
              />
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={isUploadingPhoto}
                    className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#00c16a] to-[#00a85a] flex items-center justify-center ring-2 ring-slate-600 hover:ring-emerald-400 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    title="Alterar foto"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-semibold text-lg">
                        {formData.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </button>
                  <span className="absolute -bottom-0.5 right-0 w-5 h-5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                    <Camera className="w-2.5 h-2.5 text-slate-300" />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white">
                    {user?.name || 'Usuário'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {user?.type === 'profissional' ? 'Profissional' :
                      user?.type === 'paciente' ? 'Paciente' :
                        user?.type === 'aluno' ? 'Estudante' : 'Administrador'}
                  </p>
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={isUploadingPhoto}
                    className="text-xs text-emerald-400 hover:text-emerald-300 mt-1 font-medium"
                  >
                    {isUploadingPhoto ? 'Enviando...' : 'Alterar foto'}
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-3 py-2 text-sm bg-slate-600 border border-slate-600 rounded text-white cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Telefone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="(11) 99999-9999"
                    className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Localização</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="São Paulo, SP"
                    className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Biografia</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Conte um pouco sobre você..."
                  className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white">
                Segurança
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
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Senha Atual</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-9"
                      placeholder="Senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nova Senha</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nova senha"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Confirmar</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirmar nova senha"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-3 py-1.5 rounded text-xs font-medium"
                  >
                    {isLoading ? 'Alterando...' : 'Confirmar'}
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
                    className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1.5 rounded text-xs font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Ações Rápidas — abaixo de Segurança, triggers lado a lado */}
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-2">
              Ações Rápidas
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportData}
                className="flex items-center gap-1.5 py-2 px-3 text-xs hover:bg-slate-700/50 rounded-lg transition-colors border border-slate-600/50"
              >
                <Download className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-slate-200">Exportar Dados</span>
              </button>
              <button className="flex items-center gap-1.5 py-2 px-3 text-xs hover:bg-slate-700/50 rounded-lg transition-colors border border-slate-600/50">
                <Shield className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <span className="text-slate-200">Segurança</span>
              </button>
              <button className="flex items-center gap-1.5 py-2 px-3 text-xs hover:bg-slate-700/50 rounded-lg transition-colors border border-slate-600/50">
                <Bell className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="text-slate-200">Notificações</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Carteira — especificações */}
          <div id="carteira" className="bg-slate-800/80 rounded-lg p-3 border border-amber-500/20">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-amber-400" />
              Carteira
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Créditos</span>
                <span className="font-semibold text-amber-400 tabular-nums">{walletCredits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Cashback</span>
                <span className="text-slate-400">% consultas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Indicação</span>
                <span className="text-slate-400">créd./ind.</span>
              </div>
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-600">
                <span className="text-slate-400 flex items-center gap-1"><Award className="w-3.5 h-3.5 text-emerald-400" /> Ranking</span>
                <span className="font-semibold text-white">#{ranking}</span>
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-400 flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400" /> Estrelas</span>
                {renderStars(averageRatingStars)}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">Média das avaliações (0–5) que entram no rank. Regras no dashboard.</p>
          </div>

          {/* Account Stats */}
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-2">
              Estatísticas
            </h3>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Membro desde</span>
                <span className="text-slate-300">{stats.memberSince}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Último login</span>
                <span className="text-slate-300">{stats.lastLogin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tipo</span>
                <span className="text-slate-300">
                  {user?.type === 'profissional' ? 'Profissional' :
                    user?.type === 'paciente' ? 'Paciente' :
                      user?.type === 'aluno' ? 'Estudante' : 'Administrador'}
                </span>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-2">
              Preferências
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Notificações</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={preferences.notifications}
                    onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                  />
                  <div className="w-9 h-5 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Idioma</span>
                <select
                  className="text-xs border border-slate-600 rounded px-1.5 py-0.5 bg-slate-700 text-white"
                  value={preferences.language}
                  onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                >
                  <option value="pt">Português</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Privacidade</span>
                <button className="text-xs text-blue-400 hover:text-blue-300">Configurar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
