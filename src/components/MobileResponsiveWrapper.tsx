import React, { useState, useEffect } from 'react'

interface MobileResponsiveWrapperProps {
  children: React.ReactNode
  className?: string
}

const MobileResponsiveWrapper: React.FC<MobileResponsiveWrapperProps> = ({
  children,
  className = ''
}) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className={`mobile-responsive-wrapper w-full overflow-x-hidden ${className}`}>
      {/* Content */}
      <div className={`w-full overflow-x-hidden ${isMobile ? 'mobile-content' : 'desktop-content'}`}>
        {children}
      </div>
    </div>
  )
}

export default MobileResponsiveWrapper
