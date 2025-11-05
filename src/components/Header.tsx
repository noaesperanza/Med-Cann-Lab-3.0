import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, User, LogOut, Settings } from 'lucide-react'

const Header: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Debug: verificar se o usuário é admin (removido para evitar spam)
  // console.log('🔍 Header - User type:', user?.type, 'isAdmin:', user?.type === 'admin')

  const getNavigationByUserType = () => {
    if (!user) return []
    
    switch (user.type) {
      case 'patient':
        // Botões removidos - já estão no "Meu Dashboard de Saúde"
        return []
      case 'professional':
        // Botão do fórum movido para a sidebar
        return []
      case 'student':
        return [
          { name: '🎓 Dashboard Estudante', href: '/app/dashboard' },
          { name: '📚 Meus Cursos', href: '/app/courses' },
          { name: '📖 Biblioteca', href: '/app/library' },
          { name: '🏆 Gamificação', href: '/app/gamificacao' },
          { name: '📊 Meu Progresso', href: '/app/progress' },
          { name: '👤 Meu Perfil', href: '/app/profile' },
        ]
      default:
        return []
    }
  }

  const navigation = getNavigationByUserType()

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-slate-800 shadow-lg border-b border-slate-700 header-mobile">
      <div className="px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Título */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <Link to="/" className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-primary-600 to-accent-500 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/brain.png" 
                  alt="MedCannLab Logo" 
                  className="w-full h-full object-contain p-1"
                  style={{
                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3)) brightness(1.2) contrast(1.1)'
                  }}
                />
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-bold text-base md:text-lg">MedCannLab 3.0</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {navigation.length > 0 && (
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-primary-400 bg-primary-900/30'
                        : 'text-slate-200 hover:text-primary-400 hover:bg-slate-700/50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-slate-200 hover:text-primary-400 transition-colors duration-200"
                >
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-xs md:text-sm font-medium">{user.name}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-40 md:w-48 bg-slate-800 rounded-md shadow-lg py-1 z-50 border border-slate-700">
                    <div className="px-3 md:px-4 py-2 border-b border-slate-700">
                      <p className="text-xs md:text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      to={user?.type === 'admin' ? '/app/admin-settings' : '/app/profile'}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center px-3 md:px-4 py-2 text-xs md:text-sm text-slate-200 hover:bg-slate-700"
                    >
                      <Settings className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                      Configurações
                    </Link>
                    <button
                      onClick={async () => {
                        console.log('🚪 Botão Sair clicado')
                        setIsProfileOpen(false)
                        try {
                          await logout()
                          console.log('✅ Logout concluído, redirecionando...')
                          // Limpar storage
                          localStorage.clear()
                          sessionStorage.clear()
                          // Redirecionar
                          window.location.href = '/'
                        } catch (error) {
                          console.error('❌ Erro no logout:', error)
                          // Forçar redirecionamento mesmo com erro
                          window.location.href = '/'
                        }
                      }}
                      className="flex items-center w-full px-3 md:px-4 py-2 text-xs md:text-sm text-slate-200 hover:bg-slate-700"
                    >
                      <LogOut className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary-600 hover:bg-primary-700 text-white px-3 md:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-xs md:text-sm"
              >
                Entrar
              </Link>
            )}

            {/* Mobile menu button - apenas se houver itens de navegação */}
            {navigation.length > 0 && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-md text-slate-200 hover:text-primary-400 hover:bg-slate-700"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-700">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-primary-400 bg-primary-900/30'
                      : 'text-slate-200 hover:text-primary-400 hover:bg-slate-700/50'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
