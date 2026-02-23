import React, { useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, BookOpen } from 'lucide-react'
import NoaConversationalInterface from '../components/NoaConversationalInterface'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'
import { useAuth } from '../contexts/AuthContext'

const PatientNOAChat: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isHovered, setIsHovered] = React.useState(false)
  const { sendInitialMessage } = useNoaPlatform()
  const { user } = useAuth()
  const hasInitiatedRef = useRef(false)

  const brainSrc = `${import.meta.env.BASE_URL}brain.png`

  // ── Partículas orbitais neon (para fundo) ──
  // Note: These will be behind the chat interface
  const ambientParticles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, idx) => ({
      key: `amb-${idx}`,
      size: Math.random() * 3 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.2 + 0.1,
    }))
  }, [])

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    // Center of the container
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Mouse position relative to container
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Distance from center
    const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))

    // Activation radius (approx 250px)
    const isClose = dist < 250

    setIsHovered(prev => {
      if (prev !== isClose) return isClose
      return prev
    })
  }, [])

  // Verificar se está em modo embed
  const searchParams = new URLSearchParams(location.search)
  const isEmbed = searchParams.get('embed') === 'true'

  // Verificar se veio do agendamento e iniciar avaliação automaticamente
  useEffect(() => {
    const state = location.state as {
      startAssessment?: boolean;
      appointmentData?: any;
      targetProfessional?: { name: string; specialty: string }
    }

    if (state?.startAssessment && !hasInitiatedRef.current && user) {
      hasInitiatedRef.current = true

      setTimeout(() => {
        let assessmentPrompt = `Iniciar Avaliação Clínica Inicial IMRE Triaxial.`

        if (state.targetProfessional) {
          assessmentPrompt += ` Gostaria de realizar minha avaliação para posterior agendamento com ${state.targetProfessional.name} (${state.targetProfessional.specialty}).`
        } else {
          assessmentPrompt += ` Acabei de solicitar uma avaliação clínica.`
        }

        if (state.appointmentData) {
          assessmentPrompt += `\n\nDetalhes do agendamento prévio:\n- Data: ${state.appointmentData?.date || 'Não informado'}\n- Horário: ${state.appointmentData?.time || 'Não informado'}`
        }

        assessmentPrompt += `\n\nPor favor, inicie o protocolo IMRE para minha avaliação clínica inicial.`

        sendInitialMessage(assessmentPrompt)
      }, 1500)
    }
  }, [location.state, sendInitialMessage, user])

  // Se estiver em modo embed, renderizar apenas o conteúdo
  if (isEmbed) {
    return (
      <div className="bg-slate-950 min-h-screen h-full w-full overflow-hidden relative">
        {/* Background Effects for Embed */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/[0.03] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/[0.03] rounded-full blur-[100px]" />
        </div>
        <div className="h-full flex flex-col relative z-10">
          <div className="flex-1 min-h-0">
            <NoaConversationalInterface
              userName={user?.name || 'Paciente'}
              userCode={user?.id || 'PATIENT-001'}
              position="inline"
              hideButton={true}
              variant="clean"
            />
          </div>
        </div>
      </div>
    )
  }

  // Modo normal (Clean Layout)
  // Modo normal (Clean Layout)
  return (
    <div
      className="bg-slate-950 w-full h-[100dvh] flex flex-col relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-10px, -20px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(1.05); }
        }
        .patient-particle {
          position: absolute;
          border-radius: 50%;
          background: white;
          box-shadow: 0 0 10px rgba(52, 211, 153, 0.8), 0 0 20px rgba(52, 211, 153, 0.4);
          animation-name: float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        .patient-brain-watermark {
          animation: pulse-glow 8s infinite ease-in-out;
        }
      `}</style>

      {/* ── Static Noa Avatar (Interactive) ── */}
      <img
        src={`${import.meta.env.BASE_URL}AvatarsEstatico.png`}
        alt="Nôa Avatar"
        aria-hidden="true"
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] object-cover object-top rounded-full transition-all duration-700 ease-in-out pointer-events-none z-0
          ${isHovered
            ? 'opacity-100 scale-105 border-2 border-cyan-400/50 shadow-[0_0_50px_rgba(34,211,238,0.4)]'
            : 'opacity-40 scale-100 grayscale-[0.3] border border-white/5'
          }
        `}
        draggable={false}
        loading="eager"
      />

      {/* Ambient Glows */}
      <div className={`absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/[0.04] rounded-full blur-[150px] pointer-events-none transition-opacity duration-1000 ${isHovered ? 'opacity-100' : 'opacity-50'}`} />
      <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/[0.04] rounded-full blur-[150px] pointer-events-none transition-opacity duration-1000 ${isHovered ? 'opacity-100' : 'opacity-50'}`} />

      {/* Ambient Particles - Active on Hover */}
      <div className={`absolute inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        {ambientParticles.map(p => (
          <span
            key={p.key}
            className="patient-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity, // Base opacity defined in array
              animationDuration: `${p.duration * 0.8}s`, // Slightly faster on hover feels more dynamic
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>

      {/* ── Custom Header ── */}
      <div className="container mx-auto px-4 py-4 flex-shrink-0 relative z-20">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/app/clinica/paciente/dashboard')}
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors group px-3 py-2 rounded-lg hover:bg-slate-800/50"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Voltar</span>
          </button>

          {/* Center Branding - Optional, since visual focus is on the chat */}
          <div className="hidden md:block opacity-0">
            {/* Placeholder for symmetry */}
          </div>

          <button
            onClick={() => navigate('/app/library')}
            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-slate-800/50"
            title="Biblioteca & Documentos"
          >
            <BookOpen className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 w-full min-h-0 relative z-10 flex flex-col overflow-hidden">
        <NoaConversationalInterface
          userName={user?.name || 'Paciente'}
          userCode={user?.id || 'PATIENT-001'}
          position="inline"
          hideButton={true}
          variant="clean"
        />
      </div>
    </div>
  )
}

export default PatientNOAChat