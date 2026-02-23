import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import {
  UserType,
  normalizeUserType,
  toEnglishType,
  isValidUserType
} from '../lib/userTypes'

interface User {
  id: string
  email: string
  type: UserType // Usa tipos em português: 'aluno' | 'profissional' | 'paciente' | 'admin'
  name: string
  crm?: string
  cro?: string
  phone?: string
  location?: string
  bio?: string
  payment_status?: 'pending' | 'paid' | 'exempt'
  /** Fim do período de demonstração (3 dias a partir do created_at). Paciente pending com now < trial_ends_at acessa livre. */
  trial_ends_at?: Date
  user_metadata?: any
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (
    email: string,
    password: string,
    userType: string,
    name: string,
    councilType?: string,
    councilNumber?: string,
    councilState?: string
  ) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    console.warn('useAuth must be used within an AuthProvider - returning default values')
    return {
      user: null,
      isLoading: true,
      login: async () => { },
      logout: async () => { },
      register: async () => { }
    }
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Função auxiliar para carregar usuário
  const loadUser = async (authUser: any) => {
    let userType: UserType = 'paciente' // Padrão seguro
    let userName = 'Usuário'
    let paymentStatus: 'pending' | 'paid' | 'exempt' = 'pending'
    const email = authUser.email || ''

    // Fallback de nome a partir dos metadados
    userName = authUser.user_metadata?.name || email.split('@')[0] || 'Usuário'

    // FONTE ÚNICA DE VERDADE PARA PERMISSÕES: public.user_roles (via RPC get_my_primary_role)
    // Dados de exibição (nome / pagamento) podem vir de public.users, mas NÃO definem role.
    try {
      // 1) Role (server-side)
      const { data: roleData, error: roleError } = await supabase.rpc('get_my_primary_role')

      if (!roleError && roleData) {
        userType = normalizeUserType(String(roleData))
      } else {
        // Fallback seguro
        if (roleError) {
          console.warn('⚠️ Erro ao buscar role via RPC get_my_primary_role:', roleError)
        }
        userType = 'paciente'
      }

      // 2) Dados do usuário (display + cobrança)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name, email, payment_status')
        .eq('id', authUser.id)
        .maybeSingle()

      if (!userError && userData) {
        if (userData.name) userName = userData.name
        if (userData.payment_status) {
          paymentStatus = userData.payment_status as 'exempt' | 'paid' | 'pending'
        }
      } else if (userError && !(userError?.message?.includes('infinite recursion'))) {
        console.warn('⚠️ Erro ao buscar dados do usuário na tabela users:', userError)
      }

      console.log('✅ Role carregada (user_roles):', userType)
    } catch (error: any) {
      console.warn('⚠️ Erro ao carregar role/dados:', error)
      userType = 'paciente'
    }

    // Garantir que o nome não seja um tipo válido (verificar se o nome é exatamente um tipo, não apenas contém)
    if (userName && isValidUserType(userName.toLowerCase().trim())) {
      console.warn(`⚠️ Nome do usuário é um tipo válido (${userName}), usando email como nome`)
      userName = email.split('@')[0] || 'Usuário'
    }

    // Verificar se o nome contém um tipo válido (como "Mário Valença" não deve ser confundido com tipo)
    // Se o nome for exatamente igual a um tipo válido, usar email como nome
    const nameLower = userName.toLowerCase().trim()
    if (['aluno', 'profissional', 'paciente', 'admin', 'student', 'professional', 'patient'].includes(nameLower)) {
      console.warn(`⚠️ Nome do usuário é exatamente um tipo válido (${userName}), usando email como nome`)
      userName = email.split('@')[0] || 'Usuário'
    }

    // Garantir que o tipo seja válido (normalizeUserType já faz isso, mas garantimos aqui)
    if (!isValidUserType(userType)) {
      console.warn(`⚠️ Tipo de usuário inválido após normalização: ${userType}, usando padrão 'paciente'`)
      userType = 'paciente'
    }

    // Demonstração: 3 dias grátis a partir do created_at (paciente pending usa no PaymentGuard)
    const createdAt = authUser.created_at ? new Date(authUser.created_at) : null
    const trialEndsAt = createdAt
      ? new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000)
      : undefined

    const debugUser: User = {
      id: authUser.id,
      email: email,
      type: userType, // Sempre em português
      name: userName,
      crm: authUser.user_metadata?.crm,
      cro: authUser.user_metadata?.cro,
      payment_status: paymentStatus,
      trial_ends_at: trialEndsAt
    }

    console.log('✅ Usuário carregado:', { email, type: userType, name: userName })
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
        supabase.auth.signOut().catch(() => { })
        setUser(null)
        setIsLoading(false)
        return true
      }
      return false
    }

    // --- MOCK AUTH FOR SMOKE TESTING ---
    // REMOVIDO: nunca usar localStorage/hardcode para autenticação/role (risco de escalonamento de privilégio)
    // -----------------------------------

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
          setUser(null)
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
        await supabase.auth.signOut().catch(() => { })
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
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Erro no logout:', error.message)
      }
    } catch (error) {
      console.error('Erro no logout:', error)
    } finally {
      try {
        // Remover tokens do Supabase armazenados localmente
        const keys = Object.keys(localStorage)
        keys.forEach(key => {
          if (key.startsWith('sb-') && key.includes('auth-token')) {
            localStorage.removeItem(key)
          }
        })
      } catch (e) {
        // Ignorar erros ao limpar tokens
      }

      // Limpar estados derivados
      localStorage.removeItem('viewAsUserType')
      localStorage.removeItem('selectedUserType')
      localStorage.removeItem('test_user_type')
      setUser(null)
      setIsLoading(false)
      console.log('✅ Logout concluído (estado local limpo)')
    }
  }

  const register = async (
    email: string,
    password: string,
    userType: string,
    name: string,
    councilType?: string,
    councilNumber?: string,
    councilState?: string
  ) => {
    try {
      setIsLoading(true)

      // Normalizar tipo de usuário para português
      const normalizedType = normalizeUserType(userType)
      // Converter para inglês para salvar no Supabase (compatibilidade)
      const englishType = toEnglishType(normalizedType)

      console.log('📝 Tentando registrar:', { email, userType, normalizedType, englishType, name })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            type: englishType, // Salvar em inglês no Supabase para compatibilidade
            name: name,
            user_type: englishType,
            // Também salvar em português para referência futura
            type_pt: normalizedType,
            // Dados do conselho (opcionais)
            council_type: councilType,
            council_number: councilNumber,
            council_state: councilState
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