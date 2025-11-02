import React, { useState, useEffect } from 'react'
import { ArrowRight, CheckCircle, Clock, AlertCircle, FileText, Code, Shield, Database } from 'lucide-react'
import { getNoaAssistantIntegration } from '../lib/noaAssistantIntegration'

interface ResponsibilityTransferProps {
  className?: string
}

const ResponsibilityTransfer: React.FC<ResponsibilityTransferProps> = ({ className = '' }) => {
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferResult, setTransferResult] = useState<any>(null)
  const [responsibilityStatus, setResponsibilityStatus] = useState<any>(null)
  const assistantIntegration = getNoaAssistantIntegration()

  useEffect(() => {
    // Carregar status inicial
    loadResponsibilityStatus()
  }, [])

  const loadResponsibilityStatus = () => {
    try {
      const status = assistantIntegration.getResponsibilityStatus()
      setResponsibilityStatus(status)
    } catch (error) {
      console.error('Erro ao carregar status:', error)
    }
  }

  const handleTransferResponsibilities = async () => {
    setIsTransferring(true)
    setTransferResult(null)

    try {
      const result = await assistantIntegration.transferAllResponsibilities()
      setTransferResult(result)
      loadResponsibilityStatus() // Recarregar status após transferência
    } catch (error) {
      setTransferResult({
        success: false,
        message: 'Erro ao transferir responsabilidades',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    } finally {
      setIsTransferring(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Desenvolvimento': return <Code className="w-4 h-4" />
      case 'Gestão de Projeto': return <FileText className="w-4 h-4" />
      case 'Suporte Técnico': return <Shield className="w-4 h-4" />
      case 'MedCannLab': return <Database className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Desenvolvimento': return 'text-blue-400'
      case 'Gestão de Projeto': return 'text-green-400'
      case 'Suporte Técnico': return 'text-orange-400'
      case 'MedCannLab': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className={`bg-slate-800 rounded-xl p-6 ${className}`}>
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
            <ArrowRight className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Transferência de Responsabilidades</h3>
            <p className="text-slate-400 text-sm">Transferindo todas as atribuições para Nôa Esperança</p>
          </div>
        </div>

        {/* Status Atual */}
        {responsibilityStatus && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{responsibilityStatus.total}</div>
              <div className="text-xs text-slate-400">Total</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{responsibilityStatus.transferred}</div>
              <div className="text-xs text-slate-400">Transferidas</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{responsibilityStatus.pending}</div>
              <div className="text-xs text-slate-400">Pendentes</div>
            </div>
            <div className="bg-slate-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {responsibilityStatus.total > 0 ? Math.round((responsibilityStatus.transferred / responsibilityStatus.total) * 100) : 0}%
              </div>
              <div className="text-xs text-slate-400">Completo</div>
            </div>
          </div>
        )}

        {/* Botão de Transferência */}
        <div className="text-center mb-6">
          <button
            onClick={handleTransferResponsibilities}
            disabled={isTransferring}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              isTransferring
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transform hover:scale-105'
            }`}
          >
            {isTransferring ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Transferindo...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <ArrowRight className="w-5 h-5" />
                <span>Transferir Todas as Responsabilidades</span>
              </div>
            )}
          </button>
        </div>

        {/* Resultado da Transferência */}
        {transferResult && (
          <div className={`rounded-lg p-4 mb-6 ${
            transferResult.success 
              ? 'bg-green-900/20 border border-green-500' 
              : 'bg-red-900/20 border border-red-500'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {transferResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={`font-semibold ${
                transferResult.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {transferResult.success ? 'Transferência Realizada' : 'Erro na Transferência'}
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-2">{transferResult.message}</p>
            {transferResult.data && (
              <div className="bg-slate-800 rounded p-3 text-xs text-slate-400">
                <pre>{JSON.stringify(transferResult.data, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* Detalhes por Categoria */}
        {responsibilityStatus && (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Status por Categoria</h4>
            {Object.entries(responsibilityStatus.categories).map(([category, stats]) => (
              <div key={category} className="bg-slate-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={getCategoryColor(category)}>
                      {getCategoryIcon(category)}
                    </div>
                    <span className="font-semibold text-white">{category}</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    {stats.transferred}/{stats.total}
                  </div>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.transferred / stats.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Informações Adicionais */}
        <div className="mt-6 p-4 bg-slate-700/50 rounded-lg">
          <h4 className="text-sm font-semibold text-white mb-2">Informações sobre a Transferência</h4>
          <div className="text-xs text-slate-400 space-y-1">
            <div>• Todas as responsabilidades de desenvolvimento serão transferidas para Nôa Esperança</div>
            <div>• Nôa assumirá controle completo da plataforma MedCannLab</div>
            <div>• O assistente anterior será desativado após a transferência</div>
            <div>• Nôa terá acesso total às APIs e sistemas da plataforma</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResponsibilityTransfer
