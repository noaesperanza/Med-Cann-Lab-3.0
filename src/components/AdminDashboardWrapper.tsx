import React, { useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import AdminDashboard from '../pages/AdminDashboard'

const AdminDashboardWrapper: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Verificar se já tem parâmetro tab na URL
    const existingTab = searchParams.get('tab')
    if (existingTab) {
      // Se já tem tab, não fazer nada
      return
    }

    // Extrair a aba da URL e redirecionar com parâmetro tab
    const path = location.pathname
    let tab = 'overview'
    
    if (path.includes('/admin/users')) tab = 'users'
    else if (path.includes('/admin/courses')) tab = 'courses'
    else if (path.includes('/admin/analytics')) tab = 'analytics'
    else if (path.includes('/admin/system')) tab = 'settings'
    else if (path.includes('/admin/reports')) tab = 'reports'
    else if (path.includes('/admin/upload')) tab = 'upload'
    else if (path.includes('/admin/chat')) tab = 'chat'
    else if (path.includes('/admin/forum')) tab = 'forum'
    else if (path.includes('/admin/gamification')) tab = 'gamification'
    else if (path.includes('/admin/renal')) tab = 'renal'
    else if (path.includes('/admin/unification')) tab = 'unification'
    else if (path.includes('/admin/financial')) tab = 'financial'
    
    // Redirecionar para a mesma rota mas com parâmetro tab
    if (tab !== 'overview') {
      navigate(`/app/admin?tab=${tab}`, { replace: true })
    }
  }, [location.pathname, navigate, searchParams])

  return <AdminDashboard />
}

export default AdminDashboardWrapper
