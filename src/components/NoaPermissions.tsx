import React, { useState } from 'react'
import { Shield, CheckCircle, XCircle, AlertCircle, Key, Database, FileText, Zap } from 'lucide-react'
import { getNoaPermissionManager } from '../lib/noaPermissionManager'

interface NoaPermissionsProps {
  className?: string
}

const NoaPermissions: React.FC<NoaPermissionsProps> = ({ className = '' }) => {
  const [showDetails, setShowDetails] = useState(false)
  const permissionManager = getNoaPermissionManager()
  const summary = permissionManager.getPermissionSummary()

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'dashboard': return <Database className="w-4 h-4" />
      case 'reports': return <FileText className="w-4 h-4" />
      case 'nft': return <Zap className="w-4 h-4" />
      case 'patients': return <Shield className="w-4 h-4" />
      case 'system': return <Key className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dashboard': return 'text-blue-400'
      case 'reports': return 'text-green-400'
      case 'nft': return 'text-purple-400'
      case 'patients': return 'text-orange-400'
      case 'system': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className={`bg-slate-800 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Permissões da IA Residente</h3>
            <p className="text-slate-400 text-sm">Status das permissões para operações da plataforma</p>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-slate-400 hover:text-white transition-colors"
        >
          {showDetails ? 'Ocultar' : 'Detalhes'}
        </button>
      </div>

      {/* Resumo das Permissões */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">{summary.total}</div>
          <div className="text-xs text-slate-400">Total</div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{summary.granted}</div>
          <div className="text-xs text-slate-400">Concedidas</div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{summary.required}</div>
          <div className="text-xs text-slate-400">Obrigatórias</div>
        </div>
        <div className="bg-slate-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{summary.requiredGranted}</div>
          <div className="text-xs text-slate-400">Obrigatórias OK</div>
        </div>
      </div>

      {/* Status Geral */}
      <div className={`rounded-lg p-4 mb-4 ${
        summary.requiredGranted === summary.required 
          ? 'bg-green-900/20 border border-green-500' 
          : 'bg-red-900/20 border border-red-500'
      }`}>
        <div className="flex items-center space-x-2">
          {summary.requiredGranted === summary.required ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <XCircle className="w-5 h-5 text-red-400" />
          )}
          <span className={`font-semibold ${
            summary.requiredGranted === summary.required ? 'text-green-400' : 'text-red-400'
          }`}>
            {summary.requiredGranted === summary.required 
              ? 'Todas as permissões obrigatórias concedidas' 
              : 'Permissões obrigatórias em falta'
            }
          </span>
        </div>
      </div>

      {/* Detalhes por Categoria */}
      {showDetails && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-white">Permissões por Categoria</h4>
          {Object.entries(summary.categories).map(([category, stats]) => (
            <div key={category} className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={getCategoryColor(category)}>
                    {getCategoryIcon(category)}
                  </div>
                  <span className="font-semibold text-white capitalize">{category}</span>
                </div>
                <div className="text-sm text-slate-400">
                  {stats.granted}/{stats.total}
                </div>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.granted / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}

          {/* Lista Detalhada */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-white mb-3">Lista Detalhada de Permissões</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {permissionManager.getAllPermissions().map((permission) => (
                <div key={permission.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {permission.granted ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-white">{permission.name}</div>
                      <div className="text-xs text-slate-400">{permission.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {permission.required && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        Obrigatória
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      permission.granted 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                    }`}>
                      {permission.granted ? 'Concedida' : 'Negada'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Token de Autorização */}
      <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-white">Token de Autorização</span>
          <button
            onClick={() => {
              const token = permissionManager.generateAuthToken()
              navigator.clipboard.writeText(token)
            }}
            className="text-xs text-purple-400 hover:text-purple-300"
          >
            Copiar
          </button>
        </div>
        <div className="text-xs text-slate-400 font-mono break-all">
          {permissionManager.generateAuthToken().substring(0, 50)}...
        </div>
      </div>
    </div>
  )
}

export default NoaPermissions
