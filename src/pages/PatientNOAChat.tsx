import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import NoaAnimatedAvatar from '../components/NoaAnimatedAvatar'

const PatientNOAChat: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-slate-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/app/patient-dashboard')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">🤖 Nôa Esperança</h1>
              <p className="text-slate-300 text-lg">IA Residente</p>
            </div>
            <div className="w-20"></div>
          </div>
          
          {/* Avatar da Nôa Residente AI */}
          <div className="bg-slate-800 rounded-xl p-8 flex flex-col items-center">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-white mb-2">Nôa Esperança</h3>
              <p className="text-sm text-slate-400">IA Residente - Especializada em Avaliações Clínicas</p>
            </div>
            
            <div className="flex justify-center mb-6">
              <NoaAnimatedAvatar
                size="xl"
                showStatus={true}
              />
            </div>
            
            <div className="text-center">
              <p className="text-lg text-slate-300 mb-4">
                🌬️ Bons ventos soprem! Sou Nôa Esperança, sua IA Residente.
              </p>
              <p className="text-sm text-slate-400">
                Especializada em avaliações clínicas e treinamentos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientNOAChat