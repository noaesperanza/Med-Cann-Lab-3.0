import React, { useState } from 'react'
import { Link, Share, Mail, MessageSquare, Copy, Check } from 'lucide-react'

interface ShareAssessmentProps {
  assessmentId: string
  patientName: string
  onClose: () => void
}

const ShareAssessment: React.FC<ShareAssessmentProps> = ({ assessmentId, patientName, onClose }) => {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const shareUrl = `${window.location.origin}/assessment/${assessmentId}`
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
  }

  const handleEmailShare = () => {
    const subject = `Avaliação Clínica - ${patientName}`
    const body = `Olá,\n\nCompartilho com você a avaliação clínica do paciente ${patientName}.\n\nAcesse: ${shareUrl}\n\nAtenciosamente`
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const handleWhatsAppShare = () => {
    const text = `Avaliação Clínica - ${patientName}\n\nAcesse: ${shareUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Compartilhar Avaliação</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Link de Compartilhamento */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Link de Compartilhamento
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600"
              />
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Compartilhar por Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Enviar por Email
            </label>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600"
              />
              <button
                onClick={handleEmailShare}
                disabled={!email}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Enviar por Email</span>
              </button>
            </div>
          </div>

          {/* Compartilhar no WhatsApp */}
          <div>
            <button
              onClick={handleWhatsAppShare}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Compartilhar no WhatsApp</span>
            </button>
          </div>

          {/* Mensagem Personalizada */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mensagem Personalizada (Opcional)
            </label>
            <textarea
              placeholder="Adicione uma mensagem personalizada..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg border border-slate-600 h-20 resize-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                // Lógica para salvar compartilhamento
                onClose()
              }}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg"
            >
              Compartilhar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareAssessment
