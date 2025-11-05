import React, { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import NoaAnimatedAvatar from '../components/NoaAnimatedAvatar'
import NoaConversationalInterface from '../components/NoaConversationalInterface'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'
import { useAuth } from '../contexts/AuthContext'

const PatientNOAChat: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { sendInitialMessage, openChat } = useNoaPlatform()
  const { user } = useAuth()
  const hasInitiatedRef = useRef(false)

  // Verificar se veio do agendamento e iniciar avaliação automaticamente
  useEffect(() => {
    const state = location.state as { startAssessment?: boolean; appointmentData?: any }
    
    if (state?.startAssessment && !hasInitiatedRef.current && user) {
      hasInitiatedRef.current = true
      
      // Abrir o chat automaticamente
      openChat()
      
      // Aguardar para garantir que o chat esteja pronto antes de enviar mensagem
      setTimeout(() => {
        const assessmentPrompt = `Iniciar Avaliação Clínica Inicial IMRE Triaxial. Acabei de agendar uma consulta.

Detalhes do agendamento:
- Data: ${state.appointmentData?.date || 'Não informado'}
- Horário: ${state.appointmentData?.time || 'Não informado'}
- Especialidade: ${state.appointmentData?.specialty || 'Não informado'}
- Tipo de Serviço: ${state.appointmentData?.service || 'Não informado'}

Por favor, inicie o protocolo IMRE para minha avaliação clínica inicial.`

        sendInitialMessage(assessmentPrompt)
      }, 1500)
    }
  }, [location.state, sendInitialMessage, openChat, user])

  return (
    <div className="bg-slate-900 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate('/app/clinica/paciente/dashboard')}
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
          <div className="bg-slate-800 rounded-xl p-8 flex flex-col items-center mb-8">
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
              <p className="text-sm text-slate-400 mb-4">
                Especializada em avaliações clínicas e treinamentos
              </p>
              <p className="text-sm text-blue-400">
                💬 Clique no botão de chat no canto inferior direito para começar a conversar comigo!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interface Conversacional - Fixa no canto */}
      <NoaConversationalInterface 
        userName={user?.name || 'Paciente'}
        userCode={user?.id || 'PATIENT-001'}
        position="bottom-right"
        hideButton={false}
      />
    </div>
  )
}

export default PatientNOAChat