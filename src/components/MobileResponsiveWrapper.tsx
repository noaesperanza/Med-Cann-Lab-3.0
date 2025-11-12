import React, { useState, useEffect } from 'react'
import { Menu, X, ChevronDown, ChevronUp } from 'lucide-react'

interface MobileResponsiveWrapperProps {
  children: React.ReactNode
  className?: string
  showMobileMenu?: boolean
  onMobileMenuToggle?: (isOpen: boolean) => void
}

const MobileResponsiveWrapper: React.FC<MobileResponsiveWrapperProps> = ({
  children,
  className = '',
  showMobileMenu = true,
  onMobileMenuToggle
}) => {
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isMobile) return
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobile, isMenuOpen])

  useEffect(() => {
    if (!isMobile && isMenuOpen) {
      setIsMenuOpen(false)
      onMobileMenuToggle?.(false)
    }
  }, [isMobile, isMenuOpen, onMobileMenuToggle])

  const closeMenu = () => {
    setIsMenuOpen(false)
    onMobileMenuToggle?.(false)
  }

  const toggleMenu = () => {
    const newState = !isMenuOpen
    setIsMenuOpen(newState)
    onMobileMenuToggle?.(newState)
  }

  return (
    <div className={`mobile-responsive-wrapper ${className}`}>
      {/* Mobile Menu Toggle */}
      {isMobile && showMobileMenu && (
        <button
          onClick={toggleMenu}
          className="fixed left-4 z-50 bg-slate-800 text-white p-2 rounded-md shadow-lg lg:hidden"
          style={{ top: 'calc(env(safe-area-inset-top) + 1rem)' }}
          aria-label={isMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Content */}
      <div className={`${isMobile ? 'mobile-content' : 'desktop-content'}`}>
        {children}
      </div>

      {/* Mobile Overlay */}
      {isMobile && showMobileMenu && isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}
    </div>
  )
}

export default MobileResponsiveWrapper
