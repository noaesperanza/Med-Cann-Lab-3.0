import React, { useState, useEffect } from 'react'
import { X, Share2, User, CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface ShareReportModalProps {
  reportId: string
  patientId: string
  reportName: string
  onClose: () => void
  onShareSuccess?: () => void
}

interface Doctor {
  id: string
  name: string
  email: string
  type: string
}

const ShareReportModal: React.FC<ShareReportModalProps> = ({
  reportId,
  patientId,
  reportName,
  onClose,
  onShareSuccess
}) => {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Buscar médicos disponíveis (Ricardo e Eduardo)
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, user_type')
          .in('user_type', ['professional', 'admin'])
          .in('email', ['rrvalenca@gmail.com', 'ricardo.valenca@medcannlab.com', 'eduardoscfaveret@gmail.com', 'phpg69@gmail.com'])
          .order('name')

        if (error) {
          console.error('Erro ao buscar médicos:', error)
          return
        }

        setDoctors(data || [])
      } catch (err) {
        console.error('Erro ao carregar médicos:', err)
      }
    }

    loadDoctors()
  }, [])

  const toggleDoctor = (doctorId: string) => {
    setSelectedDoctors(prev => 
      prev.includes(doctorId)
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    )
  }

  const handleShare = async () => {
    if (selectedDoctors.length === 0) {
      setError('Selecione pelo menos um médico para compartilhar')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Chamar função SQL para compartilhar relatório
      const { data, error } = await supabase.rpc('share_report_with_doctors', {
        p_report_id: reportId,
        p_patient_id: patientId,
        p_doctor_ids: selectedDoctors
      })

      if (error) {
        console.error('Erro ao compartilhar relatório:', error)
        setError(error.message || 'Erro ao compartilhar relatório')
        return
      }

      setSuccess(true)
      
      // Chamar callback de sucesso
      if (onShareSuccess) {
        setTimeout(() => {
          onShareSuccess()
          onClose()
        }, 1500)
      } else {
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    } catch (err: any) {
      console.error('Erro ao compartilhar:', err)
      setError(err.message || 'Erro ao compartilhar relatório')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Share2 className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-bold text-white">Compartilhar Relatório</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Name */}
        <div className="mb-6">
          <p className="text-slate-400 text-sm mb-2">Relatório:</p>
          <p className="text-white font-semibold">{reportName}</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400">Relatório compartilhado com sucesso!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Doctors List */}
        {!success && (
          <>
            <div className="mb-4">
              <p className="text-slate-400 text-sm mb-3">Selecione os médicos com quem deseja compartilhar:</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {doctors.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-4">
                    Nenhum médico disponível
                  </p>
                ) : (
                  doctors.map(doctor => (
                    <label
                      key={doctor.id}
                      className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedDoctors.includes(doctor.id)}
                        onChange={() => toggleDoctor(doctor.id)}
                        className="w-4 h-4 text-purple-600 bg-slate-600 border-slate-500 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <User className="w-5 h-5 text-purple-400" />
                      <div className="flex-1">
                        <p className="text-white font-medium">{doctor.name}</p>
                        <p className="text-slate-400 text-xs">{doctor.email}</p>
                      </div>
                      {selectedDoctors.includes(doctor.id) && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleShare}
                disabled={loading || selectedDoctors.length === 0}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Compartilhando...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Compartilhar</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ShareReportModal

