/**
 * DESIGN SYSTEM PADRONIZADO - MEDCANLAB 3.0
 * Baseado no padrão visual da Biblioteca
 */

// Background Gradients - Tom suave com leve degradê verde (padronizado com PatientDashboard)
export const backgroundGradient = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a3a 100%)'
export const headerGradient = 'linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.92) 50%, rgba(30,58,58,0.9) 100%)'

// Surface Styles (Cards e Containers)
export const surfaceStyle: React.CSSProperties = {
  background: 'rgba(7, 22, 41, 0.88)',
  border: '1px solid rgba(0, 193, 106, 0.12)',
  boxShadow: '0 18px 42px rgba(2, 12, 27, 0.55)',
  borderRadius: '1rem'
}

export const secondarySurfaceStyle: React.CSSProperties = {
  background: 'rgba(12, 31, 54, 0.78)',
  border: '1px solid rgba(0, 193, 106, 0.1)',
  boxShadow: '0 14px 32px rgba(2, 12, 27, 0.45)',
  borderRadius: '1rem'
}

export const cardStyle: React.CSSProperties = {
  background: 'rgba(15, 36, 60, 0.7)',
  border: '1px solid rgba(0, 193, 106, 0.12)',
  boxShadow: '0 12px 28px rgba(2, 12, 27, 0.35)',
  borderRadius: '0.75rem'
}

// Gradients
export const accentGradient = 'linear-gradient(135deg, #00C16A 0%, #13794f 100%)'
export const secondaryGradient = 'linear-gradient(135deg, #1a365d 0%, #274a78 100%)'
export const goldenGradient = 'linear-gradient(135deg, #FFD33D 0%, #FFAA00 100%)'
export const highlightGradient = 'linear-gradient(135deg, rgba(0, 193, 106, 0.25) 0%, rgba(16, 49, 91, 0.4) 60%, rgba(9, 25, 43, 0.75) 100%)'

// Cores Principais
export const colors = {
  primary: '#00C16A',
  primaryDark: '#13794f',
  secondary: '#1a365d',
  secondaryLight: '#274a78',
  accent: '#FFD33D',
  accentDark: '#FFAA00',
  text: {
    primary: '#FFFFFF',
    secondary: '#C8D6E5',
    tertiary: '#94A3B8',
    muted: '#64748B'
  },
  border: {
    primary: 'rgba(0, 193, 106, 0.12)',
    secondary: 'rgba(0, 193, 106, 0.1)',
    accent: 'rgba(0, 193, 106, 0.18)'
  },
  background: {
    surface: 'rgba(7, 22, 41, 0.88)',
    secondary: 'rgba(12, 31, 54, 0.78)',
    card: 'rgba(15, 36, 60, 0.7)'
  }
}

// Classes Tailwind Padronizadas
export const cardClasses = {
  base: 'rounded-xl border transition-all duration-300',
  primary: 'rounded-xl border transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]',
  secondary: 'rounded-lg border transition-all duration-200 hover:shadow-lg'
}

// Estilos inline padronizados para cards
export const getCardStyle = (variant: 'primary' | 'secondary' | 'card' = 'primary'): React.CSSProperties => {
  switch (variant) {
    case 'primary':
      return surfaceStyle
    case 'secondary':
      return secondarySurfaceStyle
    case 'card':
      return cardStyle
    default:
      return surfaceStyle
  }
}

// Estilos para botões padronizados
export const buttonStyles = {
  primary: {
    background: accentGradient,
    color: '#FFFFFF',
    borderRadius: '0.75rem',
    padding: '0.75rem 1.5rem',
    fontWeight: 'bold',
    boxShadow: '0 8px 20px rgba(0, 193, 106, 0.3)',
    transition: 'all 0.3s ease'
  },
  secondary: {
    background: secondaryGradient,
    color: '#E6F4FF',
    borderRadius: '0.75rem',
    padding: '0.75rem 1.5rem',
    fontWeight: 'bold',
    boxShadow: '0 8px 20px rgba(26, 54, 93, 0.3)',
    transition: 'all 0.3s ease'
  },
  golden: {
    background: goldenGradient,
    color: '#0A192F',
    borderRadius: '0.75rem',
    padding: '0.75rem 1.5rem',
    fontWeight: 'bold',
    boxShadow: '0 8px 20px rgba(255, 211, 61, 0.3)',
    transition: 'all 0.3s ease'
  }
}

