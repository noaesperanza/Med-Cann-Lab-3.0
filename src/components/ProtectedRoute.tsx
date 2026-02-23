import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUserView } from '../contexts/UserViewContext'
import { UserType, normalizeUserType, getDefaultRouteByType } from '../lib/userTypes'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserType | 'patient' | 'professional' | 'student' | 'admin' // Aceita tanto português quanto inglês para compatibilidade
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth()
  const { getEffectiveUserType, isAdminViewingAs } = useUserView()

  // Aguardar carregamento antes de redirecionar
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-400">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não estiver logado, redirecionar para landing
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Se tiver role específico, verificar permissão
  if (requiredRole) {
    // Normalizar ambos os tipos (usuário e required) para português
    const userTypeNormalized = normalizeUserType(user.type)
    const requiredRoleNormalized = normalizeUserType(requiredRole)
    
    // Admin sempre tem acesso a tudo (pode visualizar como qualquer tipo)
    if (userTypeNormalized === 'admin') {
      console.log('✅ Admin acessando rota protegida:', requiredRoleNormalized, '- Acesso permitido')
      return <>{children}</>
    }
    
    // Se admin está visualizando como outro tipo, usar o tipo efetivo
    const effectiveType = getEffectiveUserType(user.type)
    
    // Verificar se o tipo efetivo corresponde ao role requerido
    if (effectiveType !== requiredRoleNormalized) {
      console.warn(`⚠️ Acesso negado: usuário efetivo é '${effectiveType}' mas rota requer '${requiredRoleNormalized}'`)
      // Redirecionar para o dashboard apropriado do usuário
      const defaultRoute = getDefaultRouteByType(effectiveType)
      return <Navigate to={defaultRoute} replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
