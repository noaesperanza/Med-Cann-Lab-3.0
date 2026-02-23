import React, { useState } from 'react'
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  QrCode,
  ExternalLink,
  Copy,
  Loader2,
  FileCheck,
  Calendar,
  Key
} from 'lucide-react'

interface DigitalSignatureWidgetProps {
  documentId?: string
  signature?: string | null
  signatureTimestamp?: string | null
  itiValidationCode?: string | null
  itiValidationUrl?: string | null
  status?: 'draft' | 'signed' | 'sent' | 'validated' | 'cancelled'
  professionalName?: string
  onValidate?: () => Promise<void>
  compact?: boolean
  showQRCode?: boolean
}

const DigitalSignatureWidget: React.FC<DigitalSignatureWidgetProps> = ({
  documentId,
  signature,
  signatureTimestamp,
  itiValidationCode,
  itiValidationUrl,
  status = 'draft',
  professionalName,
  onValidate,
  compact = false,
  showQRCode = true
}) => {
  const [validating, setValidating] = useState(false)
  const [copied, setCopied] = useState(false)

  const isSigned = status === 'signed' || status === 'sent' || status === 'validated'
  const hasValidationData = !!(itiValidationCode && itiValidationUrl)

  const handleCopyCode = async () => {
    if (itiValidationCode) {
      try {
        await navigator.clipboard.writeText(itiValidationCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Erro ao copiar código:', err)
      }
    }
  }

  const handleValidate = async () => {
    if (onValidate) {
      setValidating(true)
      try {
        await onValidate()
      } catch (err) {
        console.error('Erro ao validar:', err)
      } finally {
        setValidating(false)
      }
    } else if (itiValidationUrl) {
      window.open(itiValidationUrl, '_blank')
    }
  }

  const getStatusInfo = () => {
    switch (status) {
      case 'signed':
      case 'sent':
      case 'validated':
        return {
          label: 'Assinado Digitalmente',
          color: 'text-green-500',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/50',
          icon: CheckCircle
        }
      case 'cancelled':
        return {
          label: 'Cancelado',
          color: 'text-red-500',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/50',
          icon: XCircle
        }
      default:
        return {
          label: 'Não Assinado',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/50',
          icon: AlertTriangle
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  // QR Code URL usando API externa
  const qrCodeUrl = itiValidationUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(itiValidationUrl)}`
    : null

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusInfo.bgColor} ${statusInfo.borderColor} border`}>
        <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
        <span className={`text-sm font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
            <Shield className={`w-6 h-6 ${statusInfo.color}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Assinatura Digital</h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
              <span className={`text-sm ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Signed Content */}
      {isSigned && (
        <div className="space-y-4">
          {/* Professional Info */}
          {professionalName && (
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-400 mb-1">Assinado por</p>
              <p className="text-sm text-white font-medium">{professionalName}</p>
              {signatureTimestamp && (
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(signatureTimestamp).toLocaleString('pt-BR')}
                </p>
              )}
            </div>
          )}

          {/* Signature Hash */}
          {signature && (
            <div className="p-3 bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                <Key className="w-3 h-3" />
                Hash da Assinatura
              </p>
              <p className="text-xs text-slate-300 font-mono break-all">
                {signature.substring(0, 64)}...
              </p>
            </div>
          )}

          {/* ITI Validation */}
          {hasValidationData && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                  <FileCheck className="w-3 h-3" />
                  Validação ICP-Brasil / ITI
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={itiValidationCode || ''}
                    readOnly
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-xs text-white font-mono"
                  />
                  <button
                    onClick={handleCopyCode}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded flex items-center gap-1 transition-colors"
                    title="Copiar código"
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {showQRCode && qrCodeUrl && (
                <div className="p-4 bg-white rounded-lg flex flex-col items-center gap-3">
                  <img
                    src={qrCodeUrl}
                    alt="QR Code Validação ITI"
                    className="w-48 h-48"
                  />
                  <div className="text-center">
                    <p className="text-xs text-slate-600 font-medium mb-1">
                      Escaneie para validar
                    </p>
                    <p className="text-xs text-slate-500">
                      Ou acesse o portal do ITI
                    </p>
                  </div>
                </div>
              )}

              {/* Validation Button */}
              <button
                onClick={handleValidate}
                disabled={validating}
                className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Validar no Portal ITI
                  </>
                )}
              </button>

              {/* Instructions */}
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-xs text-blue-300 font-medium mb-2">
                  Como validar este documento:
                </p>
                <ol className="text-xs text-blue-200 space-y-1 list-decimal list-inside">
                  <li>Acesse o portal do ITI ou escaneie o QR Code acima</li>
                  <li>Digite o código de validação: <strong className="font-mono">{itiValidationCode}</strong></li>
                  <li>Verifique a autenticidade da assinatura digital</li>
                </ol>
              </div>
            </div>
          )}

          {/* No Validation Data */}
          {!hasValidationData && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-xs text-yellow-300">
                ⚠️ Dados de validação ITI ainda não disponíveis. Aguardando processamento.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Not Signed Content */}
      {!isSigned && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-300 font-medium mb-1">
                Documento não assinado
              </p>
              <p className="text-xs text-yellow-200">
                Este documento ainda não possui assinatura digital ICP-Brasil e não tem valor legal.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DigitalSignatureWidget
