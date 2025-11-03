import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { supabase } from '../lib/supabase'
import LoginDebugPanel from '../components/LoginDebugPanel'
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
  const [activeProfile, setActiveProfile] = useState<'professional' | 'patient' | 'aluno' | null>(null)
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
      
      // Redirecionar baseado no tipo de usuário
      switch (user.type) {
        case 'admin':
          navigate('/app/dashboard')
          break
        case 'professional':
          // Redirecionamento especial para Dr. Eduardo Faveret - usando a mesma estrutura organizada
          if (user.email === 'eduardoscfaveret@gmail.com' || user.name === 'Dr. Eduardo Faveret') {
            console.log('🎯 Redirecionando Dr. Eduardo Faveret para dashboard organizado')
            navigate('/app/clinica/profissional/dashboard-eduardo')
          } else {
            navigate('/app/clinica/profissional/dashboard')
          }
          break
        case 'patient':
          navigate('/app/patient-dashboard')
          break
        case 'aluno':
          navigate('/app/aluno-dashboard')
          break
        default:
          console.warn('⚠️ Tipo de usuário não reconhecido:', user.type)
          navigate('/app/dashboard')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading])

  // Debug adicional removido para evitar spam

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'professional' as 'patient' | 'professional' | 'admin' | 'aluno'
  })
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const handleRegister = async () => {
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
      await register(registerData.email, registerData.password, registerData.name, registerData.userType)
      success('Conta criada com sucesso!')
      setRegisterData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'professional'
      })
      // Redirecionar baseado no tipo de usuário
      if (registerData.userType === 'admin') {
        navigate('/app/dashboard')
      } else if (registerData.userType === 'patient') {
        navigate('/app/patient-dashboard')
        } else if (registerData.userType === 'aluno') {
          navigate('/app/aluno-dashboard')
        } else {
        navigate('/app/professional-dashboard')
      }
    } catch (err) {
      error('Erro ao criar conta. Tente novamente.')
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
      id: 'professional',
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
      id: 'patient',
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
    { name: 'Hospital São Paulo', logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTIwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjYwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKdpDwvdGV4dD4KPC9zdmc+', type: 'Hospital' },
    { name: 'Clínica MedCann', logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTIwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjYwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKdpDwvdGV4dD4KPC9zdmc+', type: 'Clínica' },
    { name: 'Universidade Federal', logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTIwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjYwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKdpDwvdGV4dD4KPC9zdmc+', type: 'Universidade' },
    { name: 'Instituto de Pesquisa', logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTIwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjYwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKdpDwvdGV4dD4KPC9zdmc+', type: 'Pesquisa' }
  ]

  const stats = [
    { number: '2.5K+', label: 'Profissionais Ativos' },
    { number: '15K+', label: 'Pacientes Atendidos' },
    { number: '240+', label: 'Artigos Científicos' },
    { number: '99.9%', label: 'Satisfação' }
  ]

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
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#00C16A' }}> {/* Verde principal */}
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  MedCannLab
                </h1>
                <p className="text-sm text-slate-200">Plataforma Médica Avançada</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-slate-200 hover:text-green-300 font-medium transition-colors">Recursos</a>
              <a href="#partners" className="text-slate-200 hover:text-green-300 font-medium transition-colors">Parceiros</a>
              <a href="#about" className="text-slate-200 hover:text-green-300 font-medium transition-colors">Sobre</a>
              <a href="#contact" className="text-slate-200 hover:text-green-300 font-medium transition-colors">Contato</a>
            </nav>

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

            {/* CTA */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  // Scroll para a seção de perfis
                  document.getElementById('profiles')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Começar Agora
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1a365d 50%, #2d5a3d 100%)' }}> {/* Compactado */}
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-800/30 via-slate-800/30 to-yellow-800/30"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col mx-auto" style={{ transform: 'translateY(-30%)', maxWidth: '1000px' }}>
            {/* Imagem do Cérebro com Glow - ACIMA */}
            <div className="relative flex justify-center mb-8" style={{ transform: 'translateX(38%) translateY(103%) scale(1.44)' }}>
              <div className="relative">
                <img 
                  src="/brain.png" 
                  alt="Cérebro com IA" 
                  className="w-80 h-80 object-contain drop-shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 0 15px rgba(0, 193, 106, 0.2)) drop-shadow(0 0 30px rgba(255, 211, 61, 0.1)) brightness(1.1) contrast(1.1)'
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between mb-8">
              <div className="text-center lg:text-left max-w-2xl mb-8 lg:mb-0">
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                          Medicina do <span style={{ color: '#FFD33D' }}>Futuro</span> {/* Amarelo com moderação */}
                          <br />Hoje
                        </h1>
                <p className="text-xl text-white/90 mb-8">
                  Plataforma médica completa com IA, avaliação clínica avançada e 
                  metodologia AEC para profissionais e pacientes.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <button
                    onClick={() => {
                      // Scroll para a seção de perfis
                      document.getElementById('profiles')?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 inline-flex items-center justify-center shadow-xl hover:shadow-2xl" 
                    style={{ 
                      backgroundColor: '#00C16A', 
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                      borderRadius: '12px'
                    }}
                    onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#00A85A'}
                    onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#00C16A'}
                  >
                    Começar Gratuitamente
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                  <button className="border-2 border-slate-200 text-slate-200 hover:bg-slate-700/50 hover:text-white backdrop-blur-sm px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300">
                    Ver Demonstração
                  </button>
                </div>
              </div>
              
              {/* Espaço vazio para balancear o layout */}
              <div className="hidden lg:block w-80"></div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
              {stats.map((stat, index) => (
                <div key={index} className="text-center backdrop-blur-sm rounded-xl p-6" 
                     style={{ 
                       backgroundColor: 'rgba(255,255,255,0.03)', 
                       border: '1px solid rgba(255,255,255,0.1)',
                       borderRadius: '12px',
                       boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                     }}> {/* Opacidade reduzida, borda sutil */}
                  <div className="text-3xl font-bold mb-2" style={{ color: '#00A85A' }}>{stat.number}</div> {/* Verde suave */}
                  <div style={{ color: '#C8D6E5' }}>{stat.label}</div> {/* Texto secundário mais claro */}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Profile Selection */}
      <section id="profiles" className="py-6" style={{ backgroundColor: '#0A192F' }}> {/* Compactado */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6"> {/* Compactado */}
            <h2 className="text-4xl font-bold text-white mb-4">
              Escolha seu Perfil
            </h2>
            <p className="text-xl text-slate-200 max-w-3xl mx-auto mb-4">
              Acesse funcionalidades personalizadas para seu tipo de usuário
            </p>
            <p className="text-sm text-slate-300">
              Clique em um perfil abaixo para começar seu cadastro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"> {/* Compactado */}
            {profiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => {
                  setActiveProfile(profile.id as any)
                  setRegisterData(prev => ({ ...prev, userType: profile.id as any }))
                }}
                className={`p-6 cursor-pointer transition-all duration-300 group`} // Reduzido 25% (p-8 → p-6)
                style={{
                  backgroundColor: activeProfile === profile.id ? 'rgba(0, 193, 106, 0.1)' : 'rgba(255,255,255,0.03)',
                  border: activeProfile === profile.id ? '2px solid #00C16A' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: activeProfile === profile.id ? '0 8px 20px rgba(0, 193, 106, 0.3)' : '0 4px 10px rgba(0,0,0,0.2)',
                  transform: activeProfile === profile.id ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${profile.color} rounded-xl flex items-center justify-center text-white mx-auto mb-4 relative`}>
                    {profile.icon}
                    {activeProfile === profile.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#00C16A' }}>
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {profile.title}
                  </h3>
                  <p className="text-slate-300 mb-6">{profile.subtitle}</p>
                  <ul className="space-y-2 text-left">
                    {profile.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-slate-200">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Card de Cadastro */}
          {activeProfile && (
            <div className="max-w-md mx-auto mt-6"> {/* Compactado */}
              <div className="p-8" 
                   style={{ 
                     backgroundColor: 'rgba(255,255,255,0.03)', 
                     border: '1px solid rgba(255,255,255,0.1)',
                     borderRadius: '12px',
                     boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                   }}> {/* Nova paleta de cores */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {isLoginMode ? 'Entrar' : profiles.find(p => p.id === activeProfile)?.title}
                  </h3>
                  <p style={{ color: '#C8D6E5' }}>
                    {isLoginMode ? 'Faça login em sua conta' : 'Preencha os dados para criar sua conta'}
                  </p>
                </div>

                <form className="space-y-4 pointer-events-auto relative z-10" onClick={(e) => e.stopPropagation()}>
                  {!isLoginMode && (
                    <div className="pointer-events-auto">
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        value={registerData.name}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-4 py-3 text-white focus:outline-none relative z-20"
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.03)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#00C16A'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                        placeholder="Seu nome completo"
                      />
                    </div>
                  )}

                  <div className="pointer-events-auto">
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={isLoginMode ? loginData.email : registerData.email}
                      onChange={(e) => {
                        if (isLoginMode) {
                          setLoginData(prev => ({ ...prev, email: e.target.value }))
                        } else {
                          setRegisterData(prev => ({ ...prev, email: e.target.value }))
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-4 py-3 text-white focus:outline-none relative z-20"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#00C16A'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div className="pointer-events-auto">
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={isLoginMode ? loginData.password : registerData.password}
                        onChange={(e) => {
                          if (isLoginMode) {
                            setLoginData(prev => ({ ...prev, password: e.target.value }))
                          } else {
                            setRegisterData(prev => ({ ...prev, password: e.target.value }))
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-4 py-3 text-white focus:outline-none pr-10"
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.03)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#00C16A'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
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
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Confirmar Senha
                      </label>
                      <input
                        type="password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-4 py-3 text-white focus:outline-none relative z-20"
                        style={{ 
                          backgroundColor: 'rgba(255,255,255,0.03)', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#00C16A'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
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
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#00A85A'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#00C16A'}
                    >
                      {isLoading ? (isLoginMode ? 'Entrando...' : 'Criando conta...') : (isLoginMode ? 'Entrar' : 'Criar Conta')}
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
                      onMouseEnter={(e) => (e.target as HTMLButtonElement).style.color = '#00C16A'}
                      onMouseLeave={(e) => (e.target as HTMLButtonElement).style.color = '#00A85A'}
                    >
                      {isLoginMode ? 'Não tem uma conta? Criar conta' : 'Já tem uma conta? Entrar'}
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-8" style={{ backgroundColor: '#0A192F' }}> {/* Compactado */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              Nossos Parceiros
            </h2>
            <p className="text-xl text-slate-200 max-w-3xl mx-auto">
              Instituições de saúde que confiam na nossa plataforma
            </p>
          </div>

          {/* Carrossel de Parceiros */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll space-x-8">
              {[...partners, ...partners].map((partner, index) => (
                <div key={index} className="flex-shrink-0 w-64 p-6 hover:shadow-xl transition-all duration-300" 
                     style={{ 
                       backgroundColor: 'rgba(255,255,255,0.03)', 
                       border: '1px solid rgba(255,255,255,0.1)',
                       borderRadius: '12px',
                       boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                     }}> {/* Nova paleta de cores */}
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#00C16A' }}>
                      <span className="text-white font-bold text-lg">{partner.name.charAt(0)}</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">{partner.name}</h3>
                    <p className="text-sm mb-3" style={{ color: '#C8D6E5' }}>{partner.type}</p> {/* Texto mais claro */}
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


      {/* Footer Profissional - Simplificado */}
      <footer className="text-white py-2" style={{ background: 'linear-gradient(135deg, #2d5a3d 0%, #1a365d 50%, #0A192F 100%)' }}> {/* Mesma cor do background dos parceiros */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#00C16A' }}>
                <span className="text-white font-bold text-sm">M</span>
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
