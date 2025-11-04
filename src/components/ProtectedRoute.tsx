import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'patient' | 'professional' | 'student' | 'admin'
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth()

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

  // Se tiver role específico e não for o role correto, redirecionar para dashboard
  if (requiredRole && user.type !== requiredRole) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
