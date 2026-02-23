import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUserView } from '../contexts/UserViewContext'
import { getDefaultRouteByType, normalizeUserType } from '../lib/userTypes'

const SmartDashboardRedirect: React.FC = () => {
  const { user } = useAuth()
  const { viewAsType, getEffectiveUserType } = useUserView()

  if (!user) {
    return <Navigate to="/" replace />
  }

  const userType = normalizeUserType(user.type)

  // Admin visualizando como outro perfil → redirecionar para dashboard desse perfil
  if (userType === 'admin' && viewAsType) {
    return <Navigate to={getDefaultRouteByType(viewAsType)} replace />
  }

  // Rota padrão pelo tipo efetivo do usuário
  const effectiveType = getEffectiveUserType(user.type)
  return <Navigate to={getDefaultRouteByType(effectiveType)} replace />
}

export default SmartDashboardRedirect
