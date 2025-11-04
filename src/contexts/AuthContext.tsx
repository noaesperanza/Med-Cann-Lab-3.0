import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  type: 'patient' | 'professional' | 'aluno' | 'admin' | 'unconfirmed'
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

  // Verificar se o usuário já está logado
  useEffect(() => {
    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Determinar tipo de usuário baseado nos metadados
        let userType: 'patient' | 'professional' | 'aluno' | 'admin' = 'patient'
        let userName = 'Usuário'
        const email = session.user.email || ''
        
        // Detectar nome baseado no email ou metadados
        if (email.toLowerCase() === 'escute-se@gmail.com') {
          userName = 'Escutese'
          userType = 'patient'
        } else if (email.includes('ricardo') || email.includes('rrvalenca') || email.includes('rrvlenca') || email.includes('profrvalenca') || email.includes('valenca')) {
          userName = 'Dr. Ricardo Valença'
        } else if (email.includes('eduardo') || email.includes('faveret')) {
          userName = 'Dr. Eduardo Faveret'
        } else {
          userName = session.user.user_metadata?.name || email.split('@')[0] || 'Usuário'
        }
        
        // Determinar tipo do usuário
        const testUserType = localStorage.getItem('test_user_type')
        if (testUserType && ['patient', 'professional', 'aluno', 'admin'].includes(testUserType)) {
          userType = testUserType as 'patient' | 'professional' | 'aluno' | 'admin'
        } else if (email === 'rrvalenca@gmail.com' || email === 'rrvlenca@gmail.com' || email === 'profrvalenca@gmail.com') {
          userType = 'admin'
        } else if (session.user.user_metadata?.type) {
          const metadataType = String(session.user.user_metadata.type).toLowerCase()
          if (['patient', 'professional', 'aluno', 'admin'].includes(metadataType)) {
            userType = metadataType as 'patient' | 'professional' | 'aluno' | 'admin'
          }
        } else if (session.user.user_metadata?.user_type) {
          const metadataUserType = String(session.user.user_metadata.user_type).toLowerCase()
          if (['patient', 'professional', 'aluno', 'admin'].includes(metadataUserType)) {
            userType = metadataUserType as 'patient' | 'professional' | 'aluno' | 'admin'
          }
        } else if (session.user.user_metadata?.role) {
          const metadataRole = String(session.user.user_metadata.role).toLowerCase()
          if (['patient', 'professional', 'aluno', 'admin'].includes(metadataRole)) {
            userType = metadataRole as 'patient' | 'professional' | 'aluno' | 'admin'
          }
        }
        
        // Garantir que o nome não seja um tipo válido
        if (userName && ['patient', 'professional', 'aluno', 'admin'].includes(userName.toLowerCase())) {
          userName = email.split('@')[0] || 'Usuário'
        }
        
        // Garantir que o tipo seja válido
        if (!['patient', 'professional', 'aluno', 'admin'].includes(userType)) {
          userType = 'patient' // Padrão seguro
        }
        
        const debugUser: User = {
          id: session.user.id,
          email: email,
          type: userType,
          name: userName,
          crm: session.user.user_metadata?.crm,
          cro: session.user.user_metadata?.cro
        }
        
        setUser(debugUser)
        setIsLoading(false)
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
        console.error('Erro no registro:', error.message)
        throw new Error(error.message)
      }

      if (data.user) {
        console.log('✅ Registro realizado com sucesso para:', email)
      }
    } catch (error) {
      console.error('Erro no registro:', error)
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