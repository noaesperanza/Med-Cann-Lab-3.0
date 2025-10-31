import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { User, Shield, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

interface DebugInfo {
  authUser: any
  userType: string
  metadata: any
  session: any
}

const LoginDebugPanel: React.FC = () => {
  const { user, isLoading } = useAuth()
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [isLoadingDebug, setIsLoadingDebug] = useState(false)

  const loadDebugInfo = async () => {
    setIsLoadingDebug(true)
    try {
      // Obter sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Erro ao obter sessão:', sessionError)
        return
      }

      if (!session?.user) {
        console.log('Nenhuma sessão ativa')
        setDebugInfo(null)
        return
      }

      const authUser = session.user
      const metadata = authUser.user_metadata || {}
      
      // Determinar tipo de usuário usando a mesma lógica do AuthContext
      let userType = 'patient'
      if (metadata.type) {
        userType = metadata.type
      } else if (metadata.user_type) {
        userType = metadata.user_type
      } else if (metadata.role) {
        userType = metadata.role
      } else if (authUser.email?.includes('admin') || authUser.email?.includes('philip')) {
        userType = 'admin'
      }

      setDebugInfo({
        authUser,
        userType,
        metadata,
        session
      })
    } catch (error) {
      console.error('Erro ao carregar debug info:', error)
    } finally {
      setIsLoadingDebug(false)
    }
  }

  useEffect(() => {
    loadDebugInfo()
  }, [user])

  const getExpectedRedirect = (userType: string) => {
    switch (userType) {
      case 'admin':
        return '/app/dashboard'
      case 'professional':
        return '/app/professional-dashboard'
      case 'patient':
        return '/app/patient-dashboard'
      case 'student':
        return '/app/student-dashboard'
      default:
        return '/app/dashboard'
    }
  }

  const getTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin':
        return 'text-red-400'
      case 'professional':
        return 'text-blue-400'
      case 'patient':
        return 'text-green-400'
      case 'student':
        return 'text-purple-400'
      default:
        return 'text-gray-400'
    }
  }

  if (!debugInfo) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-slate-400">
          <AlertCircle className="w-5 h-5" />
          <span>Nenhuma sessão ativa</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Shield className="w-5 h-5 text-yellow-400" />
          <span>Debug do Sistema de Login</span>
        </h3>
        <button
          onClick={loadDebugInfo}
          disabled={isLoadingDebug}
          className="flex items-center space-x-2 px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingDebug ? 'animate-spin' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Status do Usuário */}
        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Status do Usuário</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">ID:</span>
              <span className="text-white font-mono text-sm">{debugInfo.authUser.id}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-300">Email:</span>
              <span className="text-white">{debugInfo.authUser.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-300">Nome:</span>
              <span className="text-white">{debugInfo.metadata.name || 'Não definido'}</span>
            </div>
          </div>
        </div>

        {/* Tipo de Usuário */}
        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Tipo de Usuário</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-slate-300">Tipo Detectado:</span>
              <span className={`font-semibold ${getTypeColor(debugInfo.userType)}`}>
                {debugInfo.userType.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-300">Redirecionamento Esperado:</span>
              <span className="text-white font-mono text-sm">
                {getExpectedRedirect(debugInfo.userType)}
              </span>
            </div>
          </div>
        </div>

        {/* Metadados */}
        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Metadados do Usuário</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-slate-300">metadata.type:</span>
              <span className="text-white">{debugInfo.metadata.type || 'null'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-300">metadata.user_type:</span>
              <span className="text-white">{debugInfo.metadata.user_type || 'null'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-300">metadata.role:</span>
              <span className="text-white">{debugInfo.metadata.role || 'null'}</span>
            </div>
          </div>
        </div>

        {/* Estado do Context */}
        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Estado do AuthContext</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-slate-300">Loading:</span>
              <span className={isLoading ? 'text-yellow-400' : 'text-green-400'}>
                {isLoading ? 'Sim' : 'Não'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-300">User Context:</span>
              <span className={user ? 'text-green-400' : 'text-red-400'}>
                {user ? 'Definido' : 'Null'}
              </span>
            </div>
            {user && (
              <div className="flex items-center space-x-2">
                <span className="text-slate-300">Tipo no Context:</span>
                <span className={`font-semibold ${getTypeColor(user.type)}`}>
                  {user.type.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Problemas Detectados */}
        <div className="bg-slate-900 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Diagnóstico</h4>
          <div className="space-y-2">
            {!debugInfo.metadata.type && !debugInfo.metadata.user_type && !debugInfo.metadata.role && (
              <div className="flex items-center space-x-2 text-yellow-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">⚠️ Nenhum tipo definido nos metadados</span>
              </div>
            )}
            {debugInfo.userType === 'patient' && (
              <div className="flex items-center space-x-2 text-blue-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">✅ Usando fallback 'patient'</span>
              </div>
            )}
            {debugInfo.authUser.email?.includes('admin') && debugInfo.userType !== 'admin' && (
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">❌ Email admin mas tipo não é admin</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginDebugPanel
