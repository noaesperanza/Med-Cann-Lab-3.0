import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getDefaultRoute, getUserRoutes } from '../lib/rotasIndividualizadas'

const RedirectIndividualizado: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation()

  // Debug
  console.log('🔍 RedirectIndividualizado - User:', user?.type, 'Path:', location.pathname)

  if (!user) {
    return <Navigate to="/" replace />
  }

  // Se já está em uma rota específica, manter
  if (location.pathname.includes('/app/') && location.pathname !== '/app') {
    return null
  }

  // Redirecionar para rota padrão baseada no tipo de usuário
  const defaultRoute = getDefaultRoute(user.type)
  
  console.log('🎯 Redirecionando para:', defaultRoute)
  
  return <Navigate to={defaultRoute} replace />
}

export default RedirectIndividualizado
