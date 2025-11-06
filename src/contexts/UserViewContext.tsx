// Contexto para permitir que admins vejam como outros tipos de usuário
import React, { createContext, useContext, useState, useEffect } from 'react'
import { UserType, normalizeUserType } from '../lib/userTypes'
import { useAuth } from './AuthContext'

interface UserViewContextType {
  viewAsType: UserType | null // Tipo que o admin está visualizando como
  setViewAsType: (type: UserType | null) => void
  getEffectiveUserType: (userType?: string) => UserType // Retorna o tipo efetivo (viewAsType se admin, senão o tipo real)
  isAdminViewingAs: boolean // Se o admin está visualizando como outro tipo
}

const UserViewContext = createContext<UserViewContextType | undefined>(undefined)

export const useUserView = () => {
  const context = useContext(UserViewContext)
  if (context === undefined) {
    return {
      viewAsType: null,
      setViewAsType: () => {},
      getEffectiveUserType: (userType?: string) => normalizeUserType(userType) || 'paciente',
      isAdminViewingAs: false
    }
  }
  return context
}

export const UserViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [viewAsType, setViewAsTypeState] = useState<UserType | null>(null)

  // Carregar tipo visual do localStorage ao iniciar
  useEffect(() => {
    const savedViewType = localStorage.getItem('viewAsUserType')
    if (savedViewType && ['aluno', 'profissional', 'paciente', 'admin'].includes(savedViewType)) {
      // Só carregar se for admin, caso contrário limpar
      const normalizedUserType = normalizeUserType(user?.type)
      if (normalizedUserType === 'admin') {
        setViewAsTypeState(savedViewType as UserType)
      } else {
        // Limpar se não for admin
        localStorage.removeItem('viewAsUserType')
      }
    }
  }, [user?.type])
  
  // Limpar tipo visual quando o usuário mudar (logout/login)
  useEffect(() => {
    if (!user) {
      setViewAsTypeState(null)
      localStorage.removeItem('viewAsUserType')
    }
  }, [user])

  const setViewAsType = (type: UserType | null) => {
    setViewAsTypeState(type)
    if (type) {
      localStorage.setItem('viewAsUserType', type)
      console.log('✅ Tipo visual definido:', type)
    } else {
      localStorage.removeItem('viewAsUserType')
      console.log('✅ Tipo visual removido')
    }
  }

  const getEffectiveUserType = (userType?: string): UserType => {
    const normalizedUserType = normalizeUserType(userType || user?.type)
    const isAdmin = normalizedUserType === 'admin'
    
    // Se é admin e há um tipo visual definido, retornar o tipo visual
    if (isAdmin && viewAsType) {
      console.log('👁️ Admin visualizando como:', viewAsType, '(tipo real:', normalizedUserType, ')')
      return viewAsType
    }
    
    // Caso contrário, retornar o tipo real
    return normalizedUserType
  }

  const isAdminViewingAs = normalizeUserType(user?.type) === 'admin' && viewAsType !== null

  return (
    <UserViewContext.Provider value={{ viewAsType, setViewAsType, getEffectiveUserType, isAdminViewingAs }}>
      {children}
    </UserViewContext.Provider>
  )
}

