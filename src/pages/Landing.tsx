import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'
import LoginDebugPanel from '../components/LoginDebugPanel'
import { normalizeUserType, getDefaultRouteByType } from '../lib/userTypes'
import { 
  Stethoscope, 
  User, 
  GraduationCap, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  Star,
  Brain,
  Eye,
  EyeOff,
  Globe,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'

const Landing: React.FC = () => {
  const navigate = useNavigate()
  const { register, login, isLoading: authLoading, user } = useAuth()
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoginMode, setIsLoginMode] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminLoginData, setAdminLoginData] = useState({
    email: '',
    password: ''
  })
  
  // Função de login de emergência para debug
  const handleEmergencyLogin = async () => {
    console.log('🚨 Login de emergência ativado')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@medcannlab.com',
        password: 'admin123'
      })
      
      if (error) {
        console.error('❌ Erro no login de emergência:', error)
        success('Erro no login de emergência')
      } else {
        console.log('✅ Login de emergência bem-sucedido')
        success('Login de emergência realizado')
      }
    } catch (err) {
      console.error('❌ Erro geral no login de emergência:', err)
    }
  }

  // Redirecionar quando o usuário fizer login baseado no tipo
  useEffect(() => {
    if (user && !authLoading) {
      console.log('🔄 Usuário logado detectado, redirecionando...', user.type)
      
      const userType = normalizeUserType(user.type)
      
      // Redirecionamento especial para Dr. Eduardo Faveret
      if (user.email === 'eduardoscfaveret@gmail.com' || user.name === 'Dr. Eduardo Faveret') {
        console.log('🎯 Redirecionando Dr. Eduardo Faveret para dashboard organizado')
        navigate('/app/clinica/profissional/dashboard-eduardo')
        return
      }
      
      // Redirecionamento especial para Dr. Ricardo Valença (Admin) - APENAS emails específicos
      if (user.email === 'rrvalenca@gmail.com' || user.email === 'rrvlenca@gmail.com' || user.email === 'profrvalenca@gmail.com' || user.email === 'iaianoaesperanza@gmail.com') {
        console.log('🎯 Redirecionando Dr. Ricardo Valença para dashboard administrativo')
        navigate('/app/ricardo-valenca-dashboard')
        return
      }
      
      // Usar rotas padrão por tipo
      const defaultRoute = getDefaultRouteByType(userType)
      console.log('🎯 Redirecionando para:', defaultRoute, '(tipo:', userType, ')')
      navigate(defaultRoute)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  // Debug adicional removido para evitar spam

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'profissional' as 'paciente' | 'profissional' | 'admin' | 'aluno' | 'patient' | 'professional' | 'student' // Aceita ambos para compatibilidade
  })
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const handleRegister = async () => {
    if (!registerData.name || !registerData.email || !registerData.password) {
      error('Preencha todos os campos obrigatórios')
      return
    }

    if (registerData.password !== registerData.confirmPassword) {
      error('As senhas não coincidem')
      return
    }

    if (registerData.password.length < 6) {
      error('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setIsLoading(true)
    try {
      // Garantir que o tipo selecionado está sendo usado
      const userTypeToRegister = registerData.userType || localStorage.getItem('selectedUserType') || 'paciente'
      console.log('📝 Iniciando registro:', { ...registerData, userType: userTypeToRegister })
      await register(registerData.email, registerData.password, userTypeToRegister, registerData.name)
      success('Conta criada com sucesso!')
      setRegisterData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'profissional'
      })
      // Redirecionar baseado no tipo de usuário usando rotas organizadas por eixo
      const userType = normalizeUserType(registerData.userType)
      const defaultRoute = getDefaultRouteByType(userType)
      navigate(defaultRoute)
    } catch (err: any) {
      console.error('❌ Erro no handleRegister:', err)
      const errorMessage = err?.message || 'Erro ao criar conta. Tente novamente.'
      error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      error('Preencha todos os campos')
      return
    }

    setIsLoading(true)
    try {
      await login(loginData.email, loginData.password)
      success('Login realizado com sucesso!')
      setLoginData({ email: '', password: '' })
      // O redirecionamento será feito pelo useEffect quando o user for carregado
    } catch (err) {
      error('Erro ao fazer login. Verifique suas credenciais.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminLogin = async () => {
    if (!adminLoginData.email || !adminLoginData.password) {
      error('Preencha todos os campos')
      return
    }

    setIsLoading(true)
    try {
      await login(adminLoginData.email, adminLoginData.password)
      success('Login admin realizado com sucesso!')
      setAdminLoginData({ email: '', password: '' })
      setShowAdminLogin(false)
      
      // O redirecionamento será feito pelo useEffect quando o user for carregado
      console.log('✅ Login realizado, aguardando carregamento do perfil...')
    } catch (err) {
      error('Erro no login admin. Verifique suas credenciais.')
    } finally {
      setIsLoading(false)
    }
  }

  const profiles = [
    {
      id: 'profissional',
      title: 'Profissional da Saúde',
      subtitle: 'CRM, CRO, Enfermeiros',
      icon: <Stethoscope className="w-8 h-8" />,
      color: 'from-green-400 to-green-500',
      features: [
        'Avaliação Clínica IMRE',
        'Gestão de Pacientes',
        'Relatórios Avançados',
        'Integração com IA Nôa'
      ]
    },
    {
      id: 'paciente',
      title: 'Paciente',
      subtitle: 'Cuidado Personalizado',
      icon: <User className="w-8 h-8" />,
      color: 'from-green-400 to-green-500',
      features: [
        'Pré-Anamnese Digital',
        'Histórico Clínico',
        'Relatórios Pessoais',
        'Acompanhamento Médico'
      ]
    },
    {
      id: 'aluno',
      title: 'Aluno',
      subtitle: 'Formação Médica',
      icon: <GraduationCap className="w-8 h-8" />,
      color: 'from-green-400 to-green-500',
      features: [
        'Cursos Especializados',
        'Certificações',
        'Casos Clínicos',
        'Metodologia AEC'
      ]
    }
  ]

  const partners = [
    // Logos removidos temporariamente - adicionar quando arquivos estiverem disponíveis
    // { name: 'Remederi', logo: '/logos/remederi.png', type: 'Empresa' },
    // { name: 'Alessandra LLC', logo: '/logos/alessandra-llc.png', type: 'Empresa' },
    // { name: 'IEP Remederi', logo: '/logos/iep-remederi.png', type: 'Instituto' }
    { name: 'Remederi', logo: null, type: 'Empresa' },
    { name: 'Alessandra LLC', logo: null, type: 'Empresa' },
    { name: 'IEP Remederi', logo: null, type: 'Instituto' }
  ]

  const professionalPlans = [
    {
      id: 'medcann-basic',
      name: 'MedCann Básico',
      price: 150,
      description: 'Entrada ideal para profissionais que desejam integrar a IA Nôa Esperanza ao atendimento clínico.',
      features: [
        'Gestão de pacientes e consultas online',
        'Avaliação clínica IMRE guiada',
        'Relatórios essenciais com assinatura digital',
        'Acesso à Biblioteca MedCannLab'
      ]
    },
    {
      id: 'medcann-professional',
      name: 'MedCann Professional',
      price: 250,
      description: 'Plano avançado com foco em equipes multiprofissionais e acompanhamento contínuo.',
      highlight: 'Plano mais assinado',
      features: [
        'Tudo do plano Básico',
        'Protocolos IMRE completos e personalizáveis',
        'Dashboards analíticos da IA residente',
        'Atendimento síncrono com suporte clínico'
      ]
    },
    {
      id: 'medcann-premium',
      name: 'MedCann Premium',
      price: 350,
      description: 'Experiência premium para centros clínicos e grupos de pesquisa avançados.',
      features: [
        'Tudo do plano Professional',
        'Consultoria estratégica com equipe MedCannLab',
        'Integração com wearables e KPIs em tempo real',
        'Suporte prioritário 24/7 e onboarding dedicado'
      ]
    }
  ]

  const healthPlans = [
    {
      id: 'medcann-saude-individual',
      name: 'Med Cann Saúde Individual',
      price: 200,
      tagline: 'Cuidado personalizado para você',
      features: [
        'Cuidado personalizado para você',
        'Acesso direto aos profissionais de saúde',
        'Escuta personalizada para você',
        '50% de desconto nas consultas mensais ou bimensais',
        '24h diárias de acesso à Nôa Esperanza',
        'Monitoramento renal individualizado',
        'Avaliação com Nôa Esperanza'
      ]
    },
    {
      id: 'medcann-saude-familia',
      name: 'Med Cann Saúde Família',
      price: 400,
      tagline: 'Proteção para toda a família',
      features: [
        'Contato contínuo com os profissionais de saúde',
        'Escuta personalizada para toda a família',
        'Acesso direto com os profissionais de saúde',
        '50% de desconto nas consultas para toda família',
        '24h diárias de acesso à Nôa Esperanza',
        'Programa de benefícios Amores'
      ]
    }
  ]

  const handlePlanSelect = (planId: string) => {
    navigate(`/app/checkout?plan=${planId}`)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-green-800 relative overflow-hidden"> {/* Azul petróleo → verde escuro suavizado */}
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      {/* Header Profissional */}
      <header className="bg-slate-800/90 backdrop-blur-sm shadow-lg border-b border-slate-700/50 py-4" style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}> {/* Sombra padronizada */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#00C16A' }}>
                <img 
                  src="/brain.png" 
                  alt="MedCannLab Logo" 
                  className="w-full h-full object-contain p-1"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3)) brightness(1.2) contrast(1.1)'
                  }}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  MedCannLab
                </h1>
                <p className="text-sm text-slate-200">Plataforma Médica Avançada</p>
              </div>
            </div>

            {/* Botões do Header */}
            <div className="flex items-center space-x-4">
              {/* Botão Entre */}
              <button
                onClick={() => {
                  // Scroll para a seção de perfis
                  document.getElementById('profiles')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Entre
              </button>

              {/* Botão de Login Admin - sempre visível */}
              <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600/20 to-red-600/20 border border-yellow-500/30 px-3 py-2 rounded-lg">
                <button
                  onClick={() => {
                    console.log('🔑 Login Admin clicado - abrindo modal')
                    setShowAdminLogin(true)
                  }}
                  className="flex items-center space-x-2 text-white hover:text-yellow-300 transition-colors"
                >
                  <Shield className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium">
                    👑 Login Admin
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1a365d 50%, #2d5a3d 100%)' }}>
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-800/30 via-slate-800/30 to-yellow-800/30"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-4">
            {/* Texto Principal */}
            <div className="flex-1 text-center lg:text-left max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                Med Cann Lab
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ color: '#FFD33D' }}>
                Plataforma Nôa Esperanza
              </h2>
              <p className="text-lg text-white/90">
                Pesquisa pioneira da cannabis medicinal aplicada à nefrologia e neurologia, utilizando a metodologia AEC 
                para identificar benefícios terapêuticos e avaliar impactos na função renal.
              </p>
            </div>
            
            {/* Imagem do Cérebro - Redimensionada */}
            <div className="flex-shrink-0">
              <img 
                src="/brain.png" 
                alt="Cérebro com IA" 
                className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 0 15px rgba(0, 193, 106, 0.2)) drop-shadow(0 0 30px rgba(255, 211, 61, 0.1)) brightness(1.1) contrast(1.1)'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Profile Selection */}
      <section id="profiles" className="py-8" style={{ backgroundColor: '#0A192F' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-3">Escolha seu Perfil</h2>
            <p className="text-lg text-slate-200 max-w-3xl mx-auto mb-2">
              Acesse funcionalidades personalizadas para seu tipo de usuário
            </p>
            <p className="text-sm text-slate-300">Clique em um perfil abaixo para começar seu cadastro</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => {
                  setRegisterData((prev) => ({ ...prev, userType: profile.id as any }))
                }}
                className="p-4 cursor-pointer transition-all duration-300 group"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                  transform: 'scale(1)'
                }}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 bg-gradient-to-r ${profile.color} rounded-xl flex items-center justify-center text-white mx-auto mb-3 relative`}>
                    <div className="scale-75">{profile.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{profile.title}</h3>
                  <p className="text-sm text-slate-300 mb-4">{profile.subtitle}</p>
                  <ul className="space-y-1.5 text-left text-sm">
                    {profile.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-slate-200">
                        <CheckCircle className="w-3 h-3 text-green-400 mr-2 flex-shrink-0" />
                        <span className="text-xs">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-md mx-auto mt-6">
            <div
              className="p-8"
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
              }}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {isLoginMode ? 'Entrar' : profiles.find((p) => p.id === 'profissional')?.title}
                </h3>
                <p style={{ color: '#C8D6E5' }}>
                  {isLoginMode ? 'Faça login em sua conta' : 'Preencha os dados para criar sua conta'}
                </p>
              </div>

              <form className="space-y-4 pointer-events-auto relative z-10" onClick={(e) => e.stopPropagation()}>
                {!isLoginMode && (
                  <div className="pointer-events-auto">
                    <label className="block text-sm font-medium text-slate-200 mb-2">Nome Completo</label>
                    <input
                      type="text"
                      value={registerData.name}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, name: e.target.value }))}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-4 py-3 text-white focus:outline-none relative z-20"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#00C16A')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                      placeholder="Seu nome completo"
                    />
                  </div>
                )}

                <div className="pointer-events-auto">
                  <label className="block text-sm font-medium text-slate-200 mb-2">Email</label>
                  <input
                    type="email"
                    value={isLoginMode ? loginData.email : registerData.email}
                    onChange={(e) => {
                      if (isLoginMode) {
                        setLoginData((prev) => ({ ...prev, email: e.target.value }))
                      } else {
                        setRegisterData((prev) => ({ ...prev, email: e.target.value }))
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full px-4 py-3 text-white focus:outline-none relative z-20"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#00C16A')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="pointer-events-auto">
                  <label className="block text-sm font-medium text-slate-200 mb-2">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={isLoginMode ? loginData.password : registerData.password}
                      onChange={(e) => {
                        if (isLoginMode) {
                          setLoginData((prev) => ({ ...prev, password: e.target.value }))
                        } else {
                          setRegisterData((prev) => ({ ...prev, password: e.target.value }))
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-4 py-3 text-white focus:outline-none pr-10"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#00C16A')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                      placeholder="Sua senha"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowPassword(!showPassword)
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {!isLoginMode && (
                  <div className="pointer-events-auto">
                    <label className="block text-sm font-medium text-slate-200 mb-2">Confirmar Senha</label>
                    <input
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-4 py-3 text-white focus:outline-none relative z-20"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#00C16A')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                      placeholder="Confirme sua senha"
                    />
                  </div>
                )}

                <div className="pt-4 pointer-events-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (isLoginMode) {
                        handleLogin()
                      } else {
                        handleRegister()
                      }
                    }}
                    disabled={isLoading}
                    className="w-full text-white py-3 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: '#00C16A',
                      borderRadius: '12px',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }}
                    onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#00A85A')}
                    onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#00C16A')}
                  >
                    {isLoading ? (isLoginMode ? 'Entrando...' : 'Criando conta...') : isLoginMode ? 'Entrar' : 'Criar Conta'}
                  </button>
                </div>

                <div className="text-center pointer-events-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsLoginMode(!isLoginMode)
                    }}
                    className="font-medium"
                    style={{ color: '#00A85A' }}
                    onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.color = '#00C16A')}
                    onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.color = '#00A85A')}
                  >
                    {isLoginMode ? 'Não tem uma conta? Criar conta' : 'Já tem uma conta? Entrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-6" style={{ backgroundColor: '#0A192F' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-3">
              Nossos Colaboradores
            </h2>
            <p className="text-lg text-slate-200 max-w-3xl mx-auto">
              Instituições que confiam na nossa plataforma
            </p>
          </div>

          {/* Carrossel de Parceiros */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll space-x-6">
              {[...partners, ...partners].map((partner, index) => (
                <div key={index} className="flex-shrink-0 w-56 p-5 hover:shadow-xl transition-all duration-300" 
                     style={{ 
                       backgroundColor: 'rgba(255,255,255,0.03)', 
                       border: '1px solid rgba(255,255,255,0.1)',
                       borderRadius: '12px',
                       boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                     }}>
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                      {partner.logo ? (
                        <img 
                          src={partner.logo} 
                          alt={partner.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            // Fallback se a imagem não carregar
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = `<div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style="background-color: #00C16A;"><span class="text-white font-bold text-lg">${partner.name.charAt(0)}</span></div>`
                            }
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#00C16A' }}>
                          <span className="text-white font-bold text-lg">{partner.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-white mb-2">{partner.name}</h3>
                    <p className="text-sm mb-3" style={{ color: '#C8D6E5' }}>{partner.type}</p>
                    <div className="flex justify-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section id="plans" className="py-10" style={{ background: 'linear-gradient(135deg, rgba(7,22,41,0.95) 0%, rgba(10,25,47,0.92) 55%, rgba(26,54,93,0.9) 100%)' }}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(0,193,106,0.12)', border: '1px solid rgba(0,193,106,0.2)', color: '#00F5A0' }}>
              PLANOS DE ASSINATURA MEDCANNLAB
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-4">
              Plataforma clínica, educacional e de pesquisa em um só lugar
            </h2>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              A MedCannLab conecta profissionais, pacientes e estudantes em torno da IA residente Nôa Esperanza, trazendo protocolos IMRE, agendamento inteligente e acompanhamento terapêutico humanizado. Escolha o plano ideal para o seu perfil e o da sua família.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-5 mb-12">
            <div className="lg:col-span-2 p-6 rounded-2xl h-full" style={{ background: 'rgba(12,34,54,0.85)', border: '1px solid rgba(0,193,106,0.14)', boxShadow: '0 18px 36px rgba(2,12,27,0.45)' }}>
              <h3 className="text-xl font-semibold text-white mb-3">Por que escolher a MedCannLab?</h3>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-[#00F5A0] mt-0.5" />
                  <span>Metodologia Arte da Entrevista Clínica aplicada em todas as jornadas.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-[#00F5A0] mt-0.5" />
                  <span>IA Nôa Esperanza atuando 24h em pré-anamnese, monitoramento e relatórios.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-[#00F5A0] mt-0.5" />
                  <span>Integração clínica, ensino e pesquisa com dashboards personalizáveis.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-[#00F5A0] mt-0.5" />
                  <span>Suporte dedicado e transição assistida para equipes e famílias.</span>
                </li>
              </ul>
              <div className="mt-6 p-4 rounded-xl" style={{ background: 'rgba(0,193,106,0.08)', border: '1px solid rgba(0,193,106,0.18)' }}>
                <p className="text-sm text-slate-200">
                  Precisa de um plano personalizado para sua clínica ou instituição? <button onClick={() => navigate('/app/chat?context=comercial')} className="underline text-[#00F5A0] hover:text-[#00F5A0]/80">Fale com nosso time</button> e organize uma proposta sob medida.
                </p>
              </div>
            </div>

            <div className="lg:col-span-3 grid md:grid-cols-2 gap-4">
              {professionalPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-2xl p-6 flex flex-col h-full"
                  style={{ background: 'rgba(15,36,60,0.78)', border: '1px solid rgba(0,193,106,0.12)', boxShadow: '0 16px 30px rgba(2,12,27,0.4)' }}
                >
                  {plan.highlight && (
                    <span className="self-start text-xs font-semibold px-3 py-1 mb-4 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(14,165,233,0.25) 100%)', border: '1px solid rgba(59,130,246,0.35)', color: '#93C5FD' }}>
                      {plan.highlight}
                    </span>
                  )}
                  <h3 className="text-xl font-semibold text-white mb-1">{plan.name}</h3>
                  <p className="text-slate-300 text-sm mb-4 flex-1">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">R$ {plan.price.toFixed(0)}</span>
                    <span className="text-slate-400 text-sm ml-1">/mês</span>
                  </div>
                  <ul className="space-y-2 mb-5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm text-slate-200">
                        <CheckCircle className="w-4 h-4 text-[#00F5A0] mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className="w-full mt-auto py-3 rounded-lg font-semibold text-white transition-transform transform hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #00C16A 0%, #13794f 100%)', boxShadow: '0 12px 24px rgba(0,193,106,0.25)' }}
                  >
                    Assinar Plano Profissional
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {healthPlans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl p-6"
                style={{ background: 'rgba(12,34,54,0.82)', border: '1px solid rgba(0,193,106,0.14)', boxShadow: '0 18px 36px rgba(2,12,27,0.45)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-slate-300">{plan.tagline}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-white">R$ {plan.price}</span>
                    <span className="text-slate-400 text-xs block">por mês</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-sm text-slate-200">
                      <CheckCircle className="w-4 h-4 text-[#FFD33D] mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  className="w-full py-3 rounded-lg font-semibold text-slate-900 transition-transform transform hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #FFD33D 0%, #FFAA00 100%)', boxShadow: '0 12px 24px rgba(255,211,61,0.25)' }}
                >
                  Assinar Plano Med Cann Saúde
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Profissional - Simplificado */}
      <footer className="text-white py-2" style={{ background: 'linear-gradient(135deg, #2d5a3d 0%, #1a365d 50%, #0A192F 100%)' }}> {/* Mesma cor do background dos parceiros */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#00C16A' }}>
                <img 
                  src="/brain.png" 
                  alt="MedCannLab Logo" 
                  className="w-full h-full object-contain p-1"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3)) brightness(1.2) contrast(1.1)'
                  }}
                />
              </div>
              <span className="text-lg font-bold">MedCannLab</span>
            </div>
            
            <div className="text-center">
              <p className="text-sm" style={{ color: '#C8D6E5' }}>
                © 2025 MedCannLab. Todos os direitos reservados.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors" style={{ color: '#C8D6E5' }}>
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-white transition-colors" style={{ color: '#C8D6E5' }}>
                <Phone className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-white transition-colors" style={{ color: '#C8D6E5' }}>
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Painel de Debug - Apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-40 max-w-md">
          <LoginDebugPanel />
        </div>
      )}

      {/* Modal de Login Admin */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-8 max-w-md w-full mx-4 border border-yellow-500/30">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                👑 Acesso Administrativo
              </h3>
              <p className="text-slate-300">
                Digite suas credenciais de administrador
              </p>
            </div>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAdminLogin(); }}>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email Administrativo
                </label>
                <input
                  type="email"
                  value={adminLoginData.email}
                  onChange={(e) => setAdminLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  placeholder="admin@medcannlab.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Senha
                </label>
                <input
                  type="password"
                  value={adminLoginData.password}
                  onChange={(e) => setAdminLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                  placeholder="Sua senha de administrador"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdminLogin(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Entrando...' : '👑 Entrar como Admin'}
                </button>
              </div>
            </form>
            
            {/* Botão de Login de Emergência para Debug */}
            <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm mb-3">
                🚨 <strong>Debug:</strong> Se o login normal não funcionar, use este botão de emergência
              </p>
              <button
                type="button"
                onClick={handleEmergencyLogin}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                🚨 Login de Emergência (Debug)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Landing
