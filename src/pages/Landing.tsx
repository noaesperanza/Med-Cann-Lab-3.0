import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'
import LoginDebugPanel from '../components/LoginDebugPanel'
import { normalizeUserType, getDefaultRouteByType } from '../lib/userTypes'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  ArrowRight,
  Star,
  Brain,
  Zap,
  Activity,
  Lock,
  Globe,
  Heart,
  CheckCircle2,
  Users,
  Menu,
  X,
  Stethoscope,
  Microscope,
  Database
} from 'lucide-react'

// --- Components ---

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 hover:border-green-500/30 p-6 rounded-2xl hover:bg-slate-800/60 transition-all duration-300 group"
  >
    <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
      <Icon className="w-6 h-6 text-blue-400 group-hover:text-green-400 transition-colors" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
  </motion.div>
)

const StepCard = ({ number, title, description }: { number: string, title: string, description: string }) => (
  <div className="flex items-start space-x-4">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-green-500">
      {number}
    </div>
    <div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  </div>
)

const AuthModal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-green-500 to-purple-500" />
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">{title}</h2>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

const Landing: React.FC = () => {
  const navigate = useNavigate()
  const { register, login, isLoading: authLoading, user } = useAuth()
  const { success, error } = useToast()

  const noaAvatarSrc = `${import.meta.env.BASE_URL}noa-avatar.png`
  const logoBrainSrc = `${import.meta.env.BASE_URL}brain.png`

  const heroParticles = useMemo(() => {
    // +40% em cima do ajuste anterior (43 → ~60)
    // +36 partículas (84 → 120)
    const count = 120
    return Array.from({ length: count }).map(() => {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 260 + 180 // 180..440px
      const dx = Math.cos(angle) * radius
      const dy = Math.sin(angle) * radius
      // -20% tamanho
      const size = (Math.random() * 2.2 + 1) * 0.8
      // +20% mais devagar (duração maior)
      const duration = (Math.random() * 2.8 + 5.5) * 1.2 // ~6.6..10.0s
      const delay = Math.random() * 4.5
      const peakOpacity = Math.random() * 0.25 + 0.65 // 0.65..0.9
      return { dx, dy, size, duration, delay, peakOpacity }
    })
  }, [])

  // Landing UX: manter scroll funcional, mas esconder a barra (especialmente visível sobre o Hero)
  useEffect(() => {
    if (typeof document === 'undefined') return
    // Evita scrollbar do browser (que aparece como "linha verde" no Windows/Chrome)
    // e move o scroll para o container desta página (com scrollbar invisível).
    const prevHtmlOverflow = document.documentElement.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    document.documentElement.classList.add('no-scrollbar')
    document.body.classList.add('no-scrollbar')
    document.documentElement.classList.add('landing-scroll-fix')
    document.body.classList.add('landing-scroll-fix')
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.classList.remove('no-scrollbar')
      document.body.classList.remove('no-scrollbar')
      document.documentElement.classList.remove('landing-scroll-fix')
      document.body.classList.remove('landing-scroll-fix')
    }
  }, [])

  // States
  const [isLoading, setIsLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Form States
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [adminLoginData, setAdminLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'profissional' as any,
    councilType: '',
    councilNumber: '',
    councilState: ''
  })

  // Effects & Handlers
  useEffect(() => {
    if (user && !authLoading) {
      const userType = normalizeUserType(user.type)
      // Um único dashboard para todos os profissionais (Ricardo Valença, Eduardo Faveret, etc.)
      navigate(getDefaultRouteByType(userType))
    }
  }, [user, authLoading, navigate])

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) return error('Preencha todos os campos')
    setIsLoading(true)
    try {
      await login(loginData.email, loginData.password)
      success('Bem-vindo de volta!')
      setShowLogin(false)
    } catch (err) {
      error('Credenciais inválidas.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminLogin = async () => {
    if (!adminLoginData.email || !adminLoginData.password) return error('Preencha os campos')
    setIsLoading(true)
    try {
      await login(adminLoginData.email, adminLoginData.password)
      success('Acesso administrativo concedido.')
      setShowAdminLogin(false)
    } catch (err) {
      error('Acesso negado.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!registerData.name || !registerData.email || !registerData.password) return error('Campos obrigatórios faltando')
    if (registerData.password !== registerData.confirmPassword) return error('Senhas não conferem')

    setIsLoading(true)
    try {
      // Logic from original file
      const userTypeToRegister = registerData.userType || localStorage.getItem('selectedUserType') || 'paciente'
      await register(
        registerData.email,
        registerData.password,
        userTypeToRegister,
        registerData.name,
        registerData.councilType,
        registerData.councilNumber,
        registerData.councilState
      )
      success('Conta criada com sucesso!')
      navigate(getDefaultRouteByType(normalizeUserType(userTypeToRegister)))
    } catch (err: any) {
      error(err?.message || 'Erro ao registrar.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) return error('Digite seu email')
    setIsLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (resetError) throw resetError
      success('Email enviado! Verifique sua caixa de entrada.')
      setShowForgotPassword(false)
      setForgotPasswordEmail('')
    } catch (err: any) {
      error(err?.message || 'Erro ao enviar email de recuperação.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmergencyLogin = async () => {
    console.log('🚨 Login de emergência ativado')
    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email: 'admin@medcannlab.com',
        password: 'admin123'
      })
      if (err) throw err
      success('Modo Emergência Ativo')
    } catch (err) {
      console.error(err)
      error('Falha no login de emergência')
    }
  }

  const partners = [
    { name: 'Remederi', logo: null, type: 'Empresa' },
    { name: 'Alessandra LLC', logo: null, type: 'Empresa' },
    { name: 'IEP Remederi', logo: null, type: 'Instituto' }
  ]

  if (authLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>

  return (
    <div className="h-screen overflow-y-auto no-scrollbar text-white font-sans selection:bg-green-500/30 overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1a365d 50%, #2d5a3d 100%)' }}>

      {/* --- Navegação High-End --- */}
      <nav className="fixed w-full top-0 z-40 bg-slate-950/80 backdrop-blur-lg border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3a3a 100%)',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(0, 193, 106, 0.2)'
              }}
            >
              <img
                src="/brain.png"
                alt="MedCannLab Logo"
                className="w-full h-full object-contain p-1"
                style={{
                  filter: 'brightness(1.1) contrast(1.1) drop-shadow(0 0 6px rgba(0, 193, 106, 0.6))'
                }}
              />
            </div>
            <div>
              <span className="text-xl font-bold block text-white tracking-tight leading-none">MedCannLab</span>
              <div className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase ml-0.5 mt-0.5">Plataforma 3.0</div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#solucao" className="text-sm text-slate-400 hover:text-white transition-colors">Solução</a>
            <a href="#como-funciona" className="text-sm text-slate-400 hover:text-white transition-colors">Como Funciona</a>
            <a href="#filosofia" className="text-sm text-slate-400 hover:text-white transition-colors">Filosofia</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => setShowLogin(true)} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Entrar</button>
            <button onClick={() => setShowRegister(true)} className="text-sm font-medium px-5 py-2.5 bg-white text-slate-950 rounded-lg hover:bg-slate-200 transition-colors shadow-lg hover:shadow-white/10">
              Começar Agora
            </button>
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* --- Hero Section 2026 --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-blue-900/20 via-green-900/10 to-transparent blur-3xl -z-10" />

        <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-1.5 mb-6">
              <div
                className="w-8 h-8 rounded-full overflow-hidden border border-green-500/40 flex-shrink-0 bg-slate-950/60"
                style={{ boxShadow: '0 0 14px rgba(0, 193, 106, 0.28)' }}
                title="Nôa Esperanza"
              >
                <img
                  src={noaAvatarSrc}
                  alt="Nôa Esperanza"
                  className="w-full h-full object-cover"
                  draggable={false}
                  loading="eager"
                  onError={(e) => {
                    // Fallback seguro caso o avatar não seja servido (base path/caching)
                    e.currentTarget.src = logoBrainSrc
                  }}
                />
              </div>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wide text-green-400 uppercase">NOA Esperanza 3.0 Live</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
              A Primeira IA Treinada na <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Arte da Escuta Clínica.</span>
            </h1>

            <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Estruture consultas, otimize decisões e recupere o tempo de cuidado. Onde a Neurociência encontra a Cannabis Medicinal numa plataforma de alta performance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button onClick={() => setShowRegister(true)} className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl text-white font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all text-lg flex items-center justify-center space-x-2 group">
                <span>Acessar Plataforma</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => setShowRegister(true)} className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 border border-green-500/40 rounded-2xl text-white font-semibold hover:bg-slate-800 hover:border-green-500/60 transition-all text-lg backdrop-blur-sm">
                Experimente 3 dias grátis
              </button>
            </div>
            <p className="text-center lg:text-left text-sm text-slate-500 mt-3">Novos usuários: 3 dias de acesso livre para ver como é.</p>

            <div className="mt-10 flex items-center justify-center lg:justify-start space-x-6 text-sm text-slate-500">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Dados Criptografados</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span>Validação Clínica</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 relative"
          >
            {/* Outer Container (Wider but centered) */}
            <div className="relative w-full max-w-xl mx-auto aspect-square flex items-center justify-center">

              {/* Simulated Brain/AI Pulse Effect with Golden Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-green-500/10 rounded-full blur-[100px] animate-pulse" />

              {/* --- Golden Particles Effect (Subtle & Contained) --- */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Partículas em raio (centro → fora) com brilho leve */}
                {heroParticles.map((p, i) => (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 top-[45%] rounded-full bg-yellow-300/60 blur-[0.8px]"
                    style={{
                      width: `${p.size}px`,
                      height: `${p.size}px`,
                      boxShadow: '0 0 6px rgba(255, 215, 0, 0.42)'
                    }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.8 }}
                    animate={{
                      x: [0, p.dx],
                      y: [0, p.dy],
                      opacity: [0, p.peakOpacity, 0],
                      scale: [0.8, 1, 0.95]
                    }}
                    transition={{
                      duration: p.duration,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: p.delay
                    }}
                  />
                ))}
              </div>

              <img
                src="/brain.png"
                alt="AI Core"
                className="relative z-10 w-full h-full max-w-lg object-contain hover:scale-105 transition-transform duration-700 drop-shadow-2xl mix-blend-normal opacity-100"
                style={{ filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.15))' }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Partners Carousel Section (Pulled up 15%) --- */}
      <section className="py-8 bg-slate-900/50 backdrop-blur-sm border-y border-white/5 -mt-24 relative z-20">
        <div className="container mx-auto px-6 overflow-hidden">
          <p className="text-center text-slate-400 text-sm mb-6 uppercase tracking-widest font-semibold">Instituições Parceiras</p>
          <div className="relative flex overflow-hidden group">
            <div className="flex animate-scroll space-x-12 whitespace-nowrap group-hover:paused">
              {[...partners, ...partners, ...partners].map((partner, index) => (
                <div key={index} className="flex items-center space-x-3 opacity-60 hover:opacity-100 transition-opacity duration-300 mx-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <span className="text-green-500 font-bold">{partner.name.charAt(0)}</span>
                  </div>
                  <span className="text-lg font-semibold text-slate-300">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Problem Section --- */}
      <section className="py-20 bg-slate-950 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">A Medicina Moderna enfrenta um colapso de atenção.</h2>
            <p className="text-slate-400">O excesso de dados e a burocracia estão drenando a capacidade humana de escutar.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              delay={0}
              icon={Database}
              title="Perda de Dados"
              description="80% das informações clínicas relevantes se perdem em anotações desestruturadas ou memória falha."
            />
            <FeatureCard
              delay={0.1}
              icon={Brain}
              title="Sobrecarga Cognitiva"
              description="Médicos tomam centenas de decisões por dia, levando à fadiga decisória e burnout silencioso."
            />
            <FeatureCard
              delay={0.2}
              icon={Users}
              title="Desumanização"
              description="A tecnologia atual transformou o paciente em uma linha de planilha, afastando o olhar clínico."
            />
          </div>
        </div>
      </section>

      {/* --- Unified Core Section --- */}
      <section id="solucao" className="py-24 relative overflow-hidden bg-slate-900/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-blue-900/5 -z-10" />
        <div className="container mx-auto px-6">
          {/* Top: Feature Split */}
          <div className="flex flex-col lg:flex-row items-center gap-16 mb-20">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-12 h-12 rounded-2xl overflow-hidden border border-green-500/30 bg-slate-950/60 flex-shrink-0"
                  style={{ boxShadow: '0 0 18px rgba(0, 193, 106, 0.22)' }}
                  title="Nôa Esperanza"
                >
                  <img
                    src={noaAvatarSrc}
                    alt="Nôa Esperanza"
                    className="w-full h-full object-cover"
                    draggable={false}
                    loading="eager"
                    onError={(e) => {
                      e.currentTarget.src = logoBrainSrc
                    }}
                  />
                </div>
                <h2 className="text-4xl font-bold leading-tight">
                  Nôa Esperanza: <br />
                  <span className="text-blue-400">Inteligência que cuida.</span>
                </h2>
              </div>
              <p className="text-slate-400 mb-8 text-lg">
                Não substituímos médicos. Amplificamos sua capacidade clínica com uma arquitetura cognitiva desenhada para a saúde.
              </p>

              <div className="space-y-6">
                <StepCard
                  number="01"
                  title="Memória Clínica Inteligente"
                  description="Organiza histórico e padrões do paciente automaticamente, criando uma timeline viva de saúde."
                />
                <StepCard
                  number="02"
                  title="Escuta Estruturada (Protocolo IMRE)"
                  description="Nossa IA conduz entrevistas preliminares seguindo rigorosos protocolos clínicos de anamnese."
                />
                <StepCard
                  number="03"
                  title="Apoio à Decisão Canabinoide"
                  description="Cruza dados clínicos com evidências científicas para sugerir caminhos terapêuticos seguros."
                />
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900">
                {/* Simplified Interface Visual */}
                <div className="p-4 border-b border-slate-800 flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="p-8 space-y-4">
                  <div className="flex space-x-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex-shrink-0"></div>
                    <div className="bg-blue-600/10 border border-blue-500/20 p-3 rounded-l-xl rounded-br-xl w-3/4">
                      <p className="text-xs text-blue-200 mb-2">Analisando padrão de sono e ansiedade...</p>
                      <div className="h-2 w-full bg-blue-500/30 rounded"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur px-3 py-1 rounded-full border border-green-500/30 text-xs text-green-400 font-mono">
                  ● System Active
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Philosophy Quote (Integrated) */}
          <div className="max-w-4xl mx-auto text-center border-t border-slate-800 pt-16 pb-12">
            <Heart className="w-8 h-8 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">"Uma epistemologia do cuidado."</h2>
            <p className="text-lg md:text-xl text-slate-300 italic font-light leading-relaxed mb-6">
              "Enquanto a maioria aposta na automação desumanizante, a MedCannLab propõe uma <span className="text-green-400 font-normal">economia da escuta</span>. Nôa Esperanza não é um chatbot; é um artefato cognitivo desenhado para preservar a humanidade na medicina."
            </p>
            <div className="flex items-center justify-center space-x-2 opacity-70">
              <img src="/brain.png" alt="Logo" className="w-6 h-6 grayscale" />
              <span className="text-slate-500 text-xs tracking-widest uppercase">Manifesto V1.1</span>
            </div>
          </div>

        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center opacity-50 hover:opacity-100 transition-opacity">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Brain className="w-5 h-5 text-slate-500" />
            <span className="font-semibold text-slate-400">MedCannLab</span>
          </div>
          <div className="flex space-x-6 text-sm text-slate-500">
            <span className="cursor-pointer hover:text-white">Termos de Uso</span>
            <span className="cursor-pointer hover:text-white">Privacidade</span>
            <span className="cursor-pointer hover:text-white" onClick={() => setShowAdminLogin(true)}>Admin</span>
          </div>
          <div className="mt-4 md:mt-0 text-xs text-slate-600">
            © 2026 MedCannLab. All rights reserved.
          </div>
        </div>
      </footer>

      {/* --- MODALS (Functional Preservation) --- */}

      {/* Login Modal */}
      <AuthModal isOpen={showLogin} onClose={() => setShowLogin(false)} title="Bem-vindo de volta">
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Senha</label>
            <input
              type="password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-3 font-semibold hover:shadow-lg hover:shadow-green-500/20 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Acessando...' : 'Entrar na Plataforma'}
          </button>
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500 cursor-pointer hover:text-white" onClick={() => { setShowLogin(false); setShowRegister(true); }}>
              Não tem conta? <span className="text-green-400">Criar agora</span>
            </p>
            <p className="text-sm text-slate-500 cursor-pointer hover:text-green-400 transition-colors" onClick={() => { setShowLogin(false); setShowForgotPassword(true); }}>
              Esqueci a senha
            </p>
          </div>
        </div>
      </AuthModal>

      {/* Forgot Password Modal */}
      <AuthModal isOpen={showForgotPassword} onClose={() => { setShowForgotPassword(false); setForgotPasswordEmail('') }} title="Recuperar Senha">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">Digite seu email e enviaremos um link para redefinir sua senha.</p>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
              placeholder="seu@email.com"
              autoFocus
            />
          </div>
          <button
            onClick={handleForgotPassword}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-3 font-semibold hover:shadow-lg hover:shadow-green-500/20 transition-all disabled:opacity-50"
          >
            {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
          <p className="text-center text-sm text-slate-500 cursor-pointer hover:text-white" onClick={() => { setShowForgotPassword(false); setShowLogin(true) }}>
            Lembrou a senha? <span className="text-green-400">Entrar</span>
          </p>
        </div>
      </AuthModal>

      {/* Register Modal */}
      <AuthModal isOpen={showRegister} onClose={() => setShowRegister(false)} title="Criar Nova Conta">
        <div className="space-y-4">
          {/* User Type Selector */}
          <div className="flex bg-slate-800 p-1 rounded-lg mb-4">
            {['paciente', 'profissional', 'aluno'].map((type) => (
              <button
                key={type}
                onClick={() => setRegisterData({ ...registerData, userType: type as any })}
                className={`flex-1 py-2 text-sm font-medium rounded-md capitalize transition-all ${registerData.userType === type ? 'bg-slate-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                {type}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Nome Completo"
            value={registerData.name}
            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-green-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-green-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="password"
              placeholder="Senha"
              value={registerData.password}
              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-green-500"
            />
            <input
              type="password"
              placeholder="Confirmar"
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-green-500"
            />
          </div>

          {/* Referral / Indication Field (Available for all types) */}
          <div className="pt-2 border-t border-slate-700/50">
            <label className="text-xs text-slate-400 mb-1 block ml-1">Indicação (Opcional)</label>
            <input
              type="text"
              placeholder="Código ou Nome de quem indicou"
              value={(registerData as any).referralCode || ''}
              onChange={(e) => setRegisterData({ ...registerData, referralCode: e.target.value } as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-green-500 placeholder:text-slate-500"
            />
            <p className="text-[10px] text-slate-500 mt-1 ml-1">
              * Informe o nome do médico, instituição ou código de parceiro se houver.
            </p>
          </div>

          {/* Conditional Fields based on User Type */}
          {registerData.userType === 'profissional' && (
            <div className="grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-2 mt-2">
              <select
                value={registerData.councilType}
                onChange={(e) => setRegisterData({ ...registerData, councilType: e.target.value })}
                className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
              >
                <option value="">Conselho</option>
                <option value="CRM">CRM</option>
                <option value="CRO">CRO</option>
                <option value="CRP">CRP</option>
                <option value="CRF">CRF</option>
              </select>
              <input
                type="text"
                placeholder="Número (UF)"
                value={registerData.councilNumber}
                onChange={(e) => setRegisterData({ ...registerData, councilNumber: e.target.value })}
                className="col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
              />
            </div>
          )}

          {registerData.userType === 'aluno' && (
            <div className="pt-2">
              <input
                type="text"
                placeholder="Matrícula / Instituição de Ensino"
                value={(registerData as any).studentId || ''}
                onChange={(e) => setRegisterData({ ...registerData, studentId: e.target.value } as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-green-500"
              />
              <div className="p-2 mt-2 bg-blue-900/20 border border-blue-500/20 rounded-lg text-xs text-blue-200 animate-in fade-in">
                🎓 Acesso exclusivo para estudantes. A matrícula será validada.
              </div>
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full bg-white text-slate-900 rounded-lg p-3 font-bold hover:bg-slate-200 transition-all mt-4 disabled:opacity-50"
          >
            {isLoading ? 'Criando Conta...' : `Registrar como ${registerData.userType.charAt(0).toUpperCase() + registerData.userType.slice(1)}`}
          </button>
          <p className="text-center text-sm text-slate-500 mt-4 cursor-pointer hover:text-white" onClick={() => { setShowRegister(false); setShowLogin(true); }}>
            Já tem conta? <span className="text-green-400">Entrar</span>
          </p>
        </div>
      </AuthModal>

      {/* Admin Login Modal */}
      <AuthModal isOpen={showAdminLogin} onClose={() => setShowAdminLogin(false)} title="Acesso Administrativo">
        <div className="space-y-4 border-l-4 border-yellow-500 pl-4 py-2 bg-yellow-500/5 rounded-r-lg mb-4">
          <p className="text-yellow-200 text-sm">Área restrita à governança do sistema.</p>
        </div>
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Admin Email"
            value={adminLoginData.email}
            onChange={(e) => setAdminLoginData({ ...adminLoginData, email: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500"
          />
          <input
            type="password"
            placeholder="Admin Key"
            value={adminLoginData.password}
            onChange={(e) => setAdminLoginData({ ...adminLoginData, password: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-yellow-500"
          />
          <button
            onClick={handleAdminLogin}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-lg p-3 font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isLoading ? 'Verificando...' : 'Acessar Core'}
          </button>
          <div className="pt-4 border-t border-slate-800">
            <button onClick={handleEmergencyLogin} className="text-xs text-red-500/50 hover:text-red-500 w-full text-center transition-colors">Emergency Protocol Override</button>
          </div>
        </div>
      </AuthModal>

      {process.env.NODE_ENV === 'development' && <div className="fixed bottom-4 right-4 z-50"><LoginDebugPanel /></div>}

    </div>
  )
}

export default Landing
