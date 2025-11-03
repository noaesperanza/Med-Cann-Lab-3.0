import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
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
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  // --- REFS for concurrency control & caching ---
  const profilePromisesRef = useRef<Map<string, Promise<User | null>>>(new Map())
  const profileLoadedForUserRef = useRef<string | null>(null)
  const profileLoadingRef = useRef<boolean>(false)

  // Verificar se o usuário já está logado
  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout

    // Timeout de segurança para evitar loading infinito
    timeoutId = setTimeout(() => {
      if (isMounted) {
        console.log('⏰ Timeout de segurança - definindo isLoading como false')
        setIsLoading(false)
      }
    }, 20000)

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event, 'Session:', !!session, 'User:', session?.user?.id)
      if (isMounted) {
        clearTimeout(timeoutId)
        
        if (session?.user) {
          console.log('👤 Usuário no auth state change:', session.user.id)
          
          if (event === 'SIGNED_OUT') {
            console.log('🚪 Evento de logout detectado - definindo user como null')
            setUser(null)
          } else {
            // Determinar tipo de usuário baseado nos metadados e buscar do banco de dados
            let userType: 'patient' | 'professional' | 'aluno' | 'admin' = 'patient'
            let userName = 'Usuário'
            const email = session.user.email || ''
            
            // Tentar buscar perfil do banco de dados
            try {
              console.log('🔍 Buscando perfil no banco de dados para usuário:', session.user.id)
              const { data: profileData, error: profileError } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle()
              
              if (profileError) {
                console.warn('⚠️ Erro ao buscar perfil do banco:', profileError.message, profileError)
              }
              
              if (!profileError && profileData) {
                // Verificar tipos com segurança
                const profile = profileData as any
                const profileType = profile.tipo || profile.user_type || profile.type
                const profileName = profile.nome || profile.name
                
                if (profileType && ['patient', 'professional', 'aluno', 'admin'].includes(profileType)) {
                  userType = profileType as 'patient' | 'professional' | 'aluno' | 'admin'
                }
                if (profileName) {
                  userName = String(profileName)
                }
                
                console.log('✅ Perfil encontrado no banco de dados:', profileData)
                
                const dbUser: User = {
                  id: session.user.id,
                  email: email,
                  type: userType,
                  name: userName,
                  crm: profile.crm || undefined,
                  cro: profile.cro || undefined
                }
                
                console.log('✅ Usuário carregado do banco de dados:', dbUser)
                setUser(dbUser)
                setIsLoading(false)
                return
              } else {
                console.log('ℹ️ Perfil não encontrado no banco de dados, usando metadados do auth')
              }
            } catch (error) {
              console.warn('⚠️ Erro ao buscar perfil do banco de dados, usando metadados:', error)
            }
            
            // Detectar nome baseado no email
            if (email.includes('ricardo') || email.includes('rrvalenca') || email.includes('rrvlenca') || email.includes('profrvalenca') || email.includes('valenca')) {
              userName = 'Dr. Ricardo Valença'
            } else if (email.includes('eduardo') || email.includes('faveret')) {
              userName = 'Dr. Eduardo Faveret'
            } else {
              userName = session.user.user_metadata?.name || email.split('@')[0] || 'Usuário'
            }
            
            // MODO DE TESTE: Permitir forçar tipo de usuário via localStorage (útil para testes)
            const testUserType = localStorage.getItem('test_user_type')
            if (testUserType && ['patient', 'professional', 'aluno', 'admin'].includes(testUserType)) {
              console.log(`🧪 MODO DE TESTE: Forçando tipo de usuário: ${testUserType}`)
              userType = testUserType as 'patient' | 'professional' | 'aluno' | 'admin'
            } else if (email === 'rrvalenca@gmail.com' || email === 'rrvlenca@gmail.com' || email === 'profrvalenca@gmail.com') {
              // SOLUÇÃO TEMPORÁRIA: Forçar admin apenas para emails específicos
              userType = 'admin'
            } else if (session.user.user_metadata?.type) {
              userType = session.user.user_metadata.type
            } else if (session.user.user_metadata?.user_type) {
              userType = session.user.user_metadata.user_type
            } else if (session.user.user_metadata?.role) {
              userType = session.user.user_metadata.role
            }
            
            const debugUser: User = {
              id: session.user.id,
              email: email,
              type: userType,
              name: userName,
              crm: session.user.user_metadata?.crm,
              cro: session.user.user_metadata?.cro
            }
            
            console.log('✅ Usuário criado com metadados:', debugUser)
            console.log('📧 Email:', email)
            console.log('👤 Tipo detectado:', userType)
            console.log('📝 Nome:', userName)
            setUser(debugUser)
            setIsLoading(false)
          }
        } else {
          console.log('❌ Nenhum usuário no auth state change - fazendo logout')
          setUser(null)
          setIsLoading(false)
        }
      }
    })

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
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