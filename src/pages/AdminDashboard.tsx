import React, { useLayoutEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const hasRedirectedRef = useRef(false)
  
  // Redirecionar automaticamente para o dashboard principal (apenas uma vez e apenas se ainda estamos nesta rota)
  useLayoutEffect(() => {
    // Se já redirecionamos ou não estamos mais na rota do AdminDashboard, não fazer nada
    if (hasRedirectedRef.current || location.pathname !== '/app/dashboard') {
      return
    }
    
    hasRedirectedRef.current = true
    navigate('/app/ricardo-valenca-dashboard', { replace: true })
  }, [location.pathname, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Redirecionando para o dashboard principal...</p>
      </div>
    </div>
  )
}

export default AdminDashboard
