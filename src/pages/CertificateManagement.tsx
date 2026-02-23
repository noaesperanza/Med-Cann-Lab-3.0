import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import {
  Shield,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Key,
  Trash2,
  Loader2,
  ArrowLeft
} from 'lucide-react'

interface Certificate {
  id: string
  professional_id: string
  certificate_type: 'A1' | 'A3' | 'remote'
  ac_provider: string
  certificate_thumbprint: string | null
  certificate_serial_number: string | null
  certificate_subject: string | null
  expires_at: string
  is_active: boolean
  created_at: string
  updated_at: string
}

const CertificateManagement: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Form state
  const [certificateType, setCertificateType] = useState<'A1' | 'A3' | 'remote'>('A1')
  const [acProvider, setAcProvider] = useState('')
  const [certificateFile, setCertificateFile] = useState<File | null>(null)
  const [expiresAt, setExpiresAt] = useState('')
  const [certificatePassword, setCertificatePassword] = useState('')

  const AC_PROVIDERS = [
    'Soluti',
    'Certisign',
    'Valid',
    'Safeweb',
    'Serasa',
    'AC Certificadora',
    'Outro'
  ]

  useEffect(() => {
    if (user?.id) {
      loadCertificates()
    }
  }, [user])

  const loadCertificates = async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('medical_certificates')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setCertificates((data || []) as any)
    } catch (err: any) {
      console.error('Erro ao carregar certificados:', err)
      setError(err.message || 'Erro ao carregar certificados')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id) {
      setError('Usuário não identificado')
      return
    }

    if (!acProvider || !expiresAt) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // TODO: Em produção, aqui seria necessário:
      // 1. Validar o certificado (A1: arquivo .pfx/.p12, A3: token físico, remote: API)
      // 2. Extrair informações do certificado (thumbprint, serial, subject)
      // 3. Verificar validade e expiração
      
      // Por enquanto, criamos um registro básico
      const certificateData = {
        professional_id: user.id,
        certificate_type: certificateType,
        ac_provider: acProvider,
        certificate_thumbprint: certificateFile ? `THUMBPRINT-${Date.now()}` : null,
        certificate_serial_number: null, // Seria extraído do certificado
        certificate_subject: null, // Seria extraído do certificado
        expires_at: expiresAt,
        is_active: true
      }

      const { error: insertError } = await supabase
        .from('medical_certificates')
        .insert(certificateData)

      if (insertError) {
        throw insertError
      }

      // Limpar formulário
      setCertificateType('A1')
      setAcProvider('')
      setCertificateFile(null)
      setExpiresAt('')
      setCertificatePassword('')
      setShowAddForm(false)

      // Recarregar lista
      await loadCertificates()

      alert('✅ Certificado adicionado com sucesso!')
    } catch (err: any) {
      console.error('Erro ao adicionar certificado:', err)
      setError(err.message || 'Erro ao adicionar certificado')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivateCertificate = async (certificateId: string) => {
    if (!window.confirm('Tem certeza que deseja desativar este certificado?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('medical_certificates')
        .update({ is_active: false })
        .eq('id', certificateId)

      if (error) throw error

      await loadCertificates()
      alert('Certificado desativado com sucesso')
    } catch (err: any) {
      console.error('Erro ao desativar certificado:', err)
      alert('Erro ao desativar certificado: ' + (err.message || 'Erro desconhecido'))
    }
  }

  const handleDeleteCertificate = async (certificateId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este certificado? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('medical_certificates')
        .delete()
        .eq('id', certificateId)

      if (error) throw error

      await loadCertificates()
      alert('Certificado excluído com sucesso')
    } catch (err: any) {
      console.error('Erro ao excluir certificado:', err)
      alert('Erro ao excluir certificado: ' + (err.message || 'Erro desconhecido'))
    }
  }

  const isCertificateExpired = (expiresAt: string): boolean => {
    return new Date(expiresAt) < new Date()
  }

  const isCertificateExpiringSoon = (expiresAt: string, days: number = 30): boolean => {
    const expirationDate = new Date(expiresAt)
    const today = new Date()
    const diffTime = expirationDate.getTime() - today.getTime()
    const diffDays = diffTime / (1000 * 60 * 60 * 24)
    return diffDays > 0 && diffDays <= days
  }

  const getCertificateStatus = (cert: Certificate) => {
    if (!cert.is_active) {
      return { label: 'Inativo', color: 'text-gray-500', icon: XCircle }
    }
    if (isCertificateExpired(cert.expires_at)) {
      return { label: 'Expirado', color: 'text-red-500', icon: AlertTriangle }
    }
    if (isCertificateExpiringSoon(cert.expires_at, 30)) {
      return { label: 'Expirando em breve', color: 'text-yellow-500', icon: AlertTriangle }
    }
    return { label: 'Ativo', color: 'text-green-500', icon: CheckCircle }
  }

  if (loading && certificates.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary-400" />
                Gestão de Certificados Digitais
              </h1>
              <p className="text-slate-400">
                Gerencie seus certificados ICP-Brasil para assinatura digital de prescrições
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Adicionar Certificado
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Add Certificate Form */}
        {showAddForm && (
          <div className="mb-6 p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Adicionar Novo Certificado</h2>
            <form onSubmit={handleAddCertificate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tipo de Certificado *
                  </label>
                  <select
                    value={certificateType}
                    onChange={(e) => setCertificateType(e.target.value as 'A1' | 'A3' | 'remote')}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="A1">A1 (Arquivo .pfx/.p12)</option>
                    <option value="A3">A3 (Token físico)</option>
                    <option value="remote">Remoto (API)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Autoridade Certificadora (AC) *
                  </label>
                  <select
                    value={acProvider}
                    onChange={(e) => setAcProvider(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Selecione a AC</option>
                    {AC_PROVIDERS.map(provider => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Data de Expiração *
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                {certificateType === 'A1' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Arquivo do Certificado (.pfx/.p12)
                    </label>
                    <input
                      type="file"
                      accept=".pfx,.p12"
                      onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {certificateFile && (
                      <p className="mt-2 text-sm text-slate-400">
                        Arquivo selecionado: {certificateFile.name}
                      </p>
                    )}
                  </div>
                )}

                {certificateType === 'A1' && certificateFile && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Senha do Certificado
                    </label>
                    <input
                      type="password"
                      value={certificatePassword}
                      onChange={(e) => setCertificatePassword(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Digite a senha do certificado"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Adicionar Certificado
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setError(null)
                  }}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Certificates List */}
        <div className="space-y-4">
          {certificates.length === 0 ? (
            <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-lg text-center">
              <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Nenhum certificado cadastrado</h3>
              <p className="text-slate-400 mb-4">
                Adicione um certificado ICP-Brasil para poder assinar prescrições digitalmente
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg inline-flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Adicionar Primeiro Certificado
              </button>
            </div>
          ) : (
            certificates.map(cert => {
              const status = getCertificateStatus(cert)
              const StatusIcon = status.icon
              
              return (
                <div
                  key={cert.id}
                  className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Key className="w-6 h-6 text-primary-400" />
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Certificado {cert.certificate_type} - {cert.ac_provider}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <StatusIcon className={`w-4 h-4 ${status.color}`} />
                            <span className={`text-sm ${status.color}`}>{status.label}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Tipo</p>
                          <p className="text-sm text-white">{cert.certificate_type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1">AC</p>
                          <p className="text-sm text-white">{cert.ac_provider}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Expira em
                          </p>
                          <p className={`text-sm ${isCertificateExpired(cert.expires_at) ? 'text-red-400' : isCertificateExpiringSoon(cert.expires_at) ? 'text-yellow-400' : 'text-white'}`}>
                            {new Date(cert.expires_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>

                      {cert.certificate_thumbprint && (
                        <div className="mt-4">
                          <p className="text-xs text-slate-400 mb-1">Thumbprint</p>
                          <p className="text-xs text-slate-500 font-mono break-all">{cert.certificate_thumbprint}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      {cert.is_active && !isCertificateExpired(cert.expires_at) && (
                        <button
                          onClick={() => handleDeactivateCertificate(cert.id)}
                          className="px-3 py-1.5 text-sm bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition-colors"
                        >
                          Desativar
                        </button>
                      )}
                      {!cert.is_active && (
                        <button
                          onClick={async () => {
                            try {
                              await supabase
                                .from('medical_certificates')
                                .update({ is_active: true })
                                .eq('id', cert.id)
                              await loadCertificates()
                            } catch (err: any) {
                              alert('Erro ao reativar certificado: ' + err.message)
                            }
                          }}
                          className="px-3 py-1.5 text-sm bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-colors"
                        >
                          Reativar
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCertificate(cert.id)}
                        className="px-3 py-1.5 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default CertificateManagement
