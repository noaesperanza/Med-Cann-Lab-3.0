import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  type: 'patient' | 'professional' | 'student' | 'admin' | 'unconfirmed'
  name: string
  crm?: string
  cro?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, userType: string, name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    console.warn('useAuth must be used within an AuthProvider - returning default values')
    return {
      user: null,
      isLoading: true,
      login: async () => {},
      logout: async () => {},
      register: async () => {}
    }
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Função auxiliar para carregar usuário
  const loadUser = async (authUser: any) => {
    // Determinar tipo de usuário baseado nos metadados
    let userType: 'patient' | 'professional' | 'student' | 'admin' = 'patient'
    let userName = 'Usuário'
    const email = authUser.email || ''
    
    // Detectar nome baseado no email ou metadados
    if (email.toLowerCase() === 'escutese@gmail.com' || email.toLowerCase() === 'escute-se@gmail.com') {
      userName = 'Escutese'
      userType = 'patient'
    } else if (email.includes('ricardo') || email.includes('rrvalenca') || email.includes('rrvlenca') || email.includes('profrvalenca') || email.includes('valenca')) {
      userName = 'Dr. Ricardo Valença'
    } else if (email.includes('eduardo') || email.includes('faveret')) {
      userName = 'Dr. Eduardo Faveret'
    } else {
      userName = authUser.user_metadata?.name || email.split('@')[0] || 'Usuário'
    }
    
    // Determinar tipo do usuário - Primeiro tentar buscar da tabela users
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('type, name, email')
        .eq('id', authUser.id)
        .maybeSingle()
      
      if (!userError && userData) {
        // Usar dados da tabela users se disponível
        if (userData.type && ['patient', 'professional', 'student', 'admin', 'aluno'].includes(userData.type)) {
          // Mapear 'aluno' para 'student' (compatibilidade com dados antigos)
          const normalizedType = userData.type === 'aluno' ? 'student' : userData.type
          userType = normalizedType as 'patient' | 'professional' | 'student' | 'admin'
        }
        if (userData.name) {
          userName = userData.name
        }
        console.log('✅ Tipo de usuário obtido da tabela users:', userType)
      } else {
        console.log('⚠️ Usuário não encontrado na tabela users, usando metadados')
      }
    } catch (error) {
      console.warn('⚠️ Erro ao buscar tipo do usuário da tabela users:', error)
    }
    
    // Fallback: Determinar tipo do usuário baseado em metadados ou localStorage
    if (userType === 'patient') { // Só usar fallback se ainda for o padrão
      const testUserType = localStorage.getItem('test_user_type')
      if (testUserType && ['patient', 'professional', 'student', 'admin', 'aluno'].includes(testUserType)) {
        // Mapear 'aluno' para 'student' (compatibilidade com dados antigos)
        userType = (testUserType === 'aluno' ? 'student' : testUserType) as 'patient' | 'professional' | 'student' | 'admin'
      } else if (email === 'rrvalenca@gmail.com' || email === 'rrvlenca@gmail.com' || email === 'profrvalenca@gmail.com') {
        userType = 'admin'
      } else if (authUser.user_metadata?.type) {
        const metadataType = String(authUser.user_metadata.type).toLowerCase()
        if (['patient', 'professional', 'student', 'admin', 'aluno'].includes(metadataType)) {
          // Mapear 'aluno' para 'student' (compatibilidade com dados antigos)
          userType = (metadataType === 'aluno' ? 'student' : metadataType) as 'patient' | 'professional' | 'student' | 'admin'
        }
      } else if (authUser.user_metadata?.user_type) {
        const metadataUserType = String(authUser.user_metadata.user_type).toLowerCase()
        if (['patient', 'professional', 'student', 'admin', 'aluno'].includes(metadataUserType)) {
          // Mapear 'aluno' para 'student' (compatibilidade com dados antigos)
          userType = (metadataUserType === 'aluno' ? 'student' : metadataUserType) as 'patient' | 'professional' | 'student' | 'admin'
        }
      } else if (authUser.user_metadata?.role) {
        const metadataRole = String(authUser.user_metadata.role).toLowerCase()
        if (['patient', 'professional', 'student', 'admin', 'aluno'].includes(metadataRole)) {
          // Mapear 'aluno' para 'student' (compatibilidade com dados antigos)
          userType = (metadataRole === 'aluno' ? 'student' : metadataRole) as 'patient' | 'professional' | 'student' | 'admin'
        }
      }
    }
    
    // Garantir que o nome não seja um tipo válido
    if (userName && ['patient', 'professional', 'student', 'admin', 'aluno'].includes(userName.toLowerCase())) {
      userName = email.split('@')[0] || 'Usuário'
    }
    
    // Garantir que o tipo seja válido (mapear 'aluno' para 'student')
    if (userType === 'aluno') {
      userType = 'student'
    }
    if (!['patient', 'professional', 'student', 'admin'].includes(userType)) {
      userType = 'patient' // Padrão seguro
    }
    
    const debugUser: User = {
      id: authUser.id,
      email: email,
      type: userType,
      name: userName,
      crm: authUser.user_metadata?.crm,
      cro: authUser.user_metadata?.cro
    }
    
    setUser(debugUser)
    setIsLoading(false)
  }

  // Verificar se o usuário já está logado
  useEffect(() => {
    // Tratamento global para erros de refresh token
    const handleTokenError = (error: any) => {
      if (error?.message?.includes('Refresh Token') || 
          error?.message?.includes('refresh_token') ||
          error?.message?.includes('Invalid Refresh Token')) {
        console.warn('⚠️ Erro de refresh token detectado, limpando autenticação...')
        // Limpar localStorage do Supabase (todas as chaves que começam com 'sb-')
        try {
          const keys = Object.keys(localStorage)
          keys.forEach(key => {
            if (key.startsWith('sb-') && key.includes('auth-token')) {
              localStorage.removeItem(key)
            }
          })
        } catch (e) {
          // Ignorar erros ao limpar
        }
        supabase.auth.signOut().catch(() => {})
        setUser(null)
        setIsLoading(false)
        return true
      }
      return false
    }

    // Verificar sessão inicial
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          // Se houver erro com refresh token, limpar sessão
          if (handleTokenError(error)) {
            return
          }
          setIsLoading(false)
          return
        }
        
        if (session?.user) {
          loadUser(session.user)
        } else {
          setIsLoading(false)
        }
      })
      .catch((error) => {
        // Capturar erros de refresh token durante inicialização
        if (!handleTokenError(error)) {
          console.warn('⚠️ Erro ao verificar sessão:', error)
          setIsLoading(false)
        }
      })

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Tratar erro de refresh token inválido
      if (event === 'TOKEN_REFRESHED' && !session) {
        console.warn('⚠️ Token refresh falhou, limpando sessão...')
        await supabase.auth.signOut().catch(() => {})
        setUser(null)
        setIsLoading(false)
        return
      }
      
      if (session?.user) {
        loadUser(session.user)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Erro no login:', error.message)
        throw new Error(error.message)
      }

      if (data.user) {
        console.log('✅ Login realizado com sucesso para:', email)
      }
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Erro no logout:', error.message)
        throw new Error(error.message)
      }
      setUser(null)
      console.log('✅ Logout realizado com sucesso')
    } catch (error) {
      console.error('Erro no logout:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, userType: string, name: string) => {
    try {
      setIsLoading(true)
      console.log('📝 Tentando registrar:', { email, userType, name })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            type: userType,
            name: name,
            user_type: userType
          }
        }
      })

      if (error) {
        console.error('❌ Erro no Supabase Auth:', error)
        console.error('❌ Mensagem de erro:', error.message)
        console.error('❌ Status do erro:', error.status)
        throw new Error(error.message || 'Erro ao criar conta')
      }

      if (data.user) {
        console.log('✅ Registro realizado com sucesso para:', email)
        console.log('✅ Dados do usuário:', data.user)
        
        // Se o Supabase exigir confirmação de email, o usuário pode não estar confirmado ainda
        if (!data.session) {
          console.log('⚠️ Usuário criado mas email precisa ser confirmado')
        }
      } else {
        console.warn('⚠️ Registro concluído mas data.user está vazio')
        throw new Error('Usuário não foi criado. Verifique as configurações do Supabase.')
      }
    } catch (error: any) {
      console.error('❌ Erro no registro:', error)
      console.error('❌ Stack trace:', error.stack)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    console.log('🔍 Estado do usuário atualizado:', user)
  }, [user])

  const value = {
    user,
    isLoading,
    login,
    logout,
    register,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}