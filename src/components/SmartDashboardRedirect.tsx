import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useUserView } from '../contexts/UserViewContext'
import { getDefaultRouteByType, normalizeUserType } from '../lib/userTypes'

const SmartDashboardRedirect: React.FC = () => {
  const { user } = useAuth()
  const { viewAsType, getEffectiveUserType } = useUserView()

  // Debug temporário
  console.log('🔍 SmartDashboardRedirect - User type:', user?.type, 'View as:', viewAsType)

  if (!user) {
    return <Navigate to="/" replace />
  }

  // Normalizar tipo de usuário (garantir que está em português)
  const userType = normalizeUserType(user.type)
  
  // Se admin está visualizando como outro tipo, usar o tipo visual
  const effectiveType = getEffectiveUserType(user.type)

  // Redirecionamento especial para Dr. Eduardo Faveret - usando a mesma estrutura organizada
  if (user.email === 'eduardoscfaveret@gmail.com' || user.name === 'Dr. Eduardo Faveret') {
    console.log('🎯 Redirecionando Dr. Eduardo Faveret para dashboard organizado')
    return <Navigate to="/app/clinica/profissional/dashboard-eduardo" replace />
  }

  // Se admin está visualizando como outro tipo, redirecionar para o dashboard desse tipo
  if (userType === 'admin' && viewAsType) {
    console.log('🎯 Admin visualizando como:', viewAsType, '- redirecionando para dashboard desse tipo')
    const viewRoute = getDefaultRouteByType(viewAsType)
    return <Navigate to={viewRoute} replace />
  }

  // Redirecionamento especial para Dr. Ricardo Valença (Admin) - APENAS emails específicos (não por nome)
  if (user.email === 'rrvalenca@gmail.com' || user.email === 'rrvlenca@gmail.com' || user.email === 'profrvalenca@gmail.com' || user.email === 'iaianoaesperanza@gmail.com') {
    // Se não está visualizando como outro tipo, ir para dashboard admin
    if (!viewAsType) {
      console.log('🎯 Redirecionando Dr. Ricardo Valença para dashboard administrativo')
      return <Navigate to="/app/ricardo-valenca-dashboard" replace />
    }
  }

  // Redirecionamento para usuários admin (sem tipo visual)
  if (userType === 'admin' && !viewAsType) {
    console.log('🎯 Redirecionando usuário admin para dashboard administrativo')
    return <Navigate to="/app/ricardo-valenca-dashboard" replace />
  }

  // Usar o sistema de rotas por tipo de usuário (ou tipo efetivo se admin)
  const defaultRoute = getDefaultRouteByType(effectiveType)
  
  console.log('🎯 Redirecionando para rota individualizada:', defaultRoute, '(tipo efetivo:', effectiveType, ')')
  
  return <Navigate to={defaultRoute} replace />
}

export default SmartDashboardRedirect
