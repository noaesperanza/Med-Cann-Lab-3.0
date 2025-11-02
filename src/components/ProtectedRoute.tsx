import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'patient' | 'professional' | 'student' | 'admin'
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user } = useAuth()

  // Se não estiver logado, redirecionar para landing
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Se tiver role específico e não for o role correto, redirecionar para dashboard
  if (requiredRole && user.type !== requiredRole) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
