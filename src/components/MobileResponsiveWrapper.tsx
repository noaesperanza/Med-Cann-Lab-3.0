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
  showMobileMenu = false,
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

  const toggleMenu = () => {
    const newState = !isMenuOpen
    setIsMenuOpen(newState)
    onMobileMenuToggle?.(newState)
  }

  return (
    <div className={`mobile-responsive-wrapper ${className}`}>
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button
          onClick={toggleMenu}
          className="fixed top-4 left-4 z-50 bg-slate-800 text-white p-2 rounded-md shadow-lg lg:hidden"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      )}

      {/* Content */}
      <div className={`${isMobile ? 'mobile-content' : 'desktop-content'}`}>
        {children}
      </div>

      {/* Mobile Overlay */}
      {isMobile && isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  )
}

export default MobileResponsiveWrapper
