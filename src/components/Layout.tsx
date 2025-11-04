import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ProtectedRoute from './ProtectedRoute'
import Header from './Header'
import Footer from './Footer'
import Sidebar from './Sidebar'
import NoaConversationalInterface from './NoaConversationalInterface'
import Breadcrumbs from './Breadcrumbs'
import NavegacaoIndividualizada from './NavegacaoIndividualizada'
import MobileResponsiveWrapper from './MobileResponsiveWrapper'

const Layout: React.FC = () => {
  const { user, isLoading } = useAuth()
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!user) {
      localStorage.removeItem('platformData')
      return
    }

    const platformData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        user_type: user.type,
        crm: user.crm ?? null,
        cro: user.cro ?? null
      },
      dashboard: {
        activeSection: location.pathname,
        totalPatients: 0,
        recentReports: 0,
        pendingNotifications: 0,
        lastUpdate: new Date().toISOString()
      },
      totalPatients: 0,
      completedAssessments: 0,
      aecProtocols: 0,
      activeClinics: 0
    }

    localStorage.setItem('platformData', JSON.stringify(platformData))
    ;(window as any).getPlatformData = () => platformData
  }, [user, location.pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="loading-dots mb-4">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    )
  }

  // Verificar se o email não foi confirmado
  if (user?.type === 'unconfirmed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Confirme seu Email
          </h1>
          <p className="text-slate-300 mb-6">
            Enviamos um link de confirmação para <strong>{user.email}</strong>
          </p>
          <p className="text-slate-400 text-sm mb-8">
            Verifique sua caixa de entrada e clique no link para ativar sua conta.
            Se não encontrar o email, verifique a pasta de spam.
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Voltar ao Início
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Já Confirmei - Atualizar
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Layout específico para pacientes (sem sidebar externa)
  if (user?.type === 'patient') {
    return (
      <ProtectedRoute>
        <MobileResponsiveWrapper>
          <div className="min-h-screen bg-slate-900">
            {/* Main Content - sem sidebar externa */}
            <div className="flex flex-col min-h-screen">
              <Header />
              {/* NavegacaoIndividualizada removida - botões dos eixos já estão na sidebar */}
              <main className={`flex-1 bg-slate-900 ${isMobile ? 'px-2 py-2' : 'px-4 py-4'}`}>
                <Outlet />
              </main>
              <Footer />
            </div>
            
            {/* Interface Conversacional Nôa Esperança */}
            <NoaConversationalInterface 
              userName={user?.name || 'Usuário'}
              userCode={user?.id || 'USER-001'}
            />
          </div>
        </MobileResponsiveWrapper>
      </ProtectedRoute>
    )
  }

  // Layout padrão para outros tipos de usuário (com sidebar)
  return (
    <ProtectedRoute>
      <MobileResponsiveWrapper onMobileMenuToggle={setIsSidebarOpen}>
        <div className="min-h-screen bg-slate-900">
          {/* Sidebar */}
          <Sidebar 
            userType={user?.type} 
            isMobile={isMobile}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onCollapseChange={setIsSidebarCollapsed}
          />
          
          {/* Main Content */}
          <div 
            className="flex flex-col min-h-screen transition-all duration-300"
            style={{
              marginLeft: isMobile ? '0' : isSidebarCollapsed ? '80px' : '320px'
            }}
          >
            <Header />
            {/* NavegacaoIndividualizada removida - botões dos eixos já estão na sidebar */}
            <main className={`flex-1 bg-slate-900 ${isMobile ? 'px-2 py-2' : 'px-4 py-4 lg:ml-4'}`}>
              <Outlet />
            </main>
            <Footer />
          </div>
          
          {/* Interface Conversacional Nôa Esperança */}
          <NoaConversationalInterface 
            userName={user?.name || 'Usuário'}
            userCode={user?.id || 'USER-001'}
          />
        </div>
      </MobileResponsiveWrapper>
    </ProtectedRoute>
  )
}

export default Layout