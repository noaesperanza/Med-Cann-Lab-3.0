import React from 'react'
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  confirmText?: string
  cancelText?: string
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar'
}) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertCircle className="w-6 h-6 text-red-400" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />
      case 'info':
        return <Info className="w-6 h-6 text-blue-400" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-400" />
      default:
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />
    }
  }

  const getButtonColors = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white'
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 text-white'
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white'
      default:
        return 'bg-primary-600 hover:bg-primary-700 text-white'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${getButtonColors()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
