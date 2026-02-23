import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Eye, EyeOff, User, Mail, Lock, Stethoscope, GraduationCap, Shield } from 'lucide-react'

const Login: React.FC = () => {
  const { login, register } = useAuth()
  const { success, error } = useToast()
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'professional' as 'patient' | 'professional' | 'admin' | 'aluno',
    councilType: '' as 'CRM' | 'CFN' | 'CRP' | 'CRF' | 'CRO' | '',
    councilNumber: '',
    councilState: ''
  })

  // Carregar tipo de usuário do localStorage
  useEffect(() => {
    const savedUserType = localStorage.getItem('selectedUserType');
    if (savedUserType && ['patient', 'professional', 'admin', 'aluno'].includes(savedUserType)) {
      setFormData(prev => ({
        ...prev,
        userType: savedUserType as 'patient' | 'professional' | 'admin' | 'aluno'
      }));
    }
  }, []);

  const userTypes = [
    {
      value: 'patient',
      label: 'Paciente',
      icon: <User className="w-5 h-5" />,
      description: 'Acesso a avaliações clínicas e relatórios'
    },
    {
      value: 'professional',
      label: 'Profissional',
      icon: <Stethoscope className="w-5 h-5" />,
      description: 'Ferramentas clínicas e gestão de pacientes'
    },
    {
      value: 'aluno',
      label: 'Aluno',
      icon: <GraduationCap className="w-5 h-5" />,
      description: 'Cursos e certificações médicas'
    },
    {
      value: 'admin',
      label: 'Administrador',
      icon: <Shield className="w-5 h-5" />,
      description: 'Gestão completa da plataforma'
    }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        await login(formData.email, formData.password)
        success('Login realizado com sucesso!')
        navigate('/dashboard')
      } else {
        if (formData.password !== formData.confirmPassword) {
          error('As senhas não coincidem')
          return
        }
        await register(
          formData.email,
          formData.password,
          formData.userType,
          formData.name,
          formData.councilType,
          formData.councilNumber,
          formData.councilState
        )
        success('Conta criada com sucesso!')
        navigate('/dashboard')
      }
    } catch (err) {
      error('Erro na autenticação. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </h2>
          <p className="mt-2 text-sm text-slate-200">
            {isLogin ? 'Acesse sua conta no MedCannLab 3.0' : 'Junte-se à revolução da medicina'}
          </p>
        </div>

        {/* Form */}
        <div className="card p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                    Nome Completo
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Seu nome completo"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="userType" className="block text-sm font-medium text-slate-200 mb-2">
                    Tipo de Usuário
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {userTypes.map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${formData.userType === type.value
                          ? 'border-blue-500 bg-blue-900/30'
                          : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                          }`}
                      >
                        <input
                          type="radio"
                          name="userType"
                          value={type.value}
                          checked={formData.userType === type.value}
                          onChange={(e) => {
                            handleInputChange(e)
                            // Limpar campos de conselho se mudar de profissional
                            if (e.target.value !== 'professional') {
                              setFormData(prev => ({
                                ...prev,
                                councilType: '',
                                councilNumber: '',
                                councilState: ''
                              }))
                            }
                          }}
                          className="sr-only"
                        />
                        <div className="flex items-center space-x-2">
                          {type.icon}
                          <span className="text-sm font-medium text-slate-200">
                            {type.label}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Campos de Conselho Profissional - Apenas para profissionais */}
                {!isLogin && formData.userType === 'professional' && (
                  <>
                    <div>
                      <label htmlFor="councilType" className="block text-sm font-medium text-slate-200 mb-2">
                        Conselho Profissional <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="councilType"
                        name="councilType"
                        required
                        value={formData.councilType}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="">Selecione o conselho</option>
                        <option value="CRM">CRM - Conselho Regional de Medicina</option>
                        <option value="CFN">CFN - Conselho Federal de Nutrição</option>
                        <option value="CRP">CRP - Conselho Regional de Psicologia</option>
                        <option value="CRF">CRF - Conselho Regional de Farmácia</option>
                        <option value="CRO">CRO - Conselho Regional de Odontologia</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="councilNumber" className="block text-sm font-medium text-slate-200 mb-2">
                        Número do Registro <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="councilNumber"
                        name="councilNumber"
                        type="text"
                        required
                        value={formData.councilNumber}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Ex: 12345 (sem hífen)"
                      />
                    </div>

                    {(formData.councilType === 'CRM' || formData.councilType === 'CRO' || formData.councilType === 'CRP' || formData.councilType === 'CRF') && (
                      <div>
                        <label htmlFor="councilState" className="block text-sm font-medium text-slate-200 mb-2">
                          Estado do Conselho <span className="text-red-400">*</span>
                        </label>
                        <select
                          id="councilState"
                          name="councilState"
                          required
                          value={formData.councilState}
                          onChange={handleInputChange}
                          className="input-field"
                        >
                          <option value="">Selecione o estado</option>
                          <option value="AC">AC - Acre</option>
                          <option value="AL">AL - Alagoas</option>
                          <option value="AP">AP - Amapá</option>
                          <option value="AM">AM - Amazonas</option>
                          <option value="BA">BA - Bahia</option>
                          <option value="CE">CE - Ceará</option>
                          <option value="DF">DF - Distrito Federal</option>
                          <option value="ES">ES - Espírito Santo</option>
                          <option value="GO">GO - Goiás</option>
                          <option value="MA">MA - Maranhão</option>
                          <option value="MT">MT - Mato Grosso</option>
                          <option value="MS">MS - Mato Grosso do Sul</option>
                          <option value="MG">MG - Minas Gerais</option>
                          <option value="PA">PA - Pará</option>
                          <option value="PB">PB - Paraíba</option>
                          <option value="PR">PR - Paraná</option>
                          <option value="PE">PE - Pernambuco</option>
                          <option value="PI">PI - Piauí</option>
                          <option value="RJ">RJ - Rio de Janeiro</option>
                          <option value="RN">RN - Rio Grande do Norte</option>
                          <option value="RS">RS - Rio Grande do Sul</option>
                          <option value="RO">RO - Rondônia</option>
                          <option value="RR">RR - Roraima</option>
                          <option value="SC">SC - Santa Catarina</option>
                          <option value="SP">SP - São Paulo</option>
                          <option value="SE">SE - Sergipe</option>
                          <option value="TO">TO - Tocantins</option>
                        </select>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field pl-10"
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Sua senha"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-2">
                  Confirmar Senha
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required={!isLogin}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Confirme sua senha"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              ) : (
                isLogin ? 'Entrar' : 'Criar Conta'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              {isLogin ? 'Não tem uma conta? Criar conta' : 'Já tem uma conta? Entrar'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Ao continuar, você concorda com nossos{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-500">
              Termos de Uso
            </Link>{' '}
            e{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
