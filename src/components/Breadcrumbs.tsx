import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

const Breadcrumbs: React.FC = () => {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  const getBreadcrumbLabel = (segment: string, index: number): string => {
    // Mapear segmentos para labels amigáveis
    const labels: { [key: string]: string } = {
      'app': 'Dashboard',
      'eixo': 'Eixo',
      'ensino': 'Ensino',
      'pesquisa': 'Pesquisa',
      'clinica': 'Clínica',
      'tipo': 'Tipo',
      'profissional': 'Profissional',
      'aluno': 'Aluno',
      'paciente': 'Paciente',
      'patient-dashboard': 'Dashboard do Paciente',
      'professional-dashboard': 'Dashboard do Profissional',
      'aluno-dashboard': 'Dashboard do Aluno',
      'admin-dashboard': 'Dashboard Administrativo',
      'ensino-dashboard': 'Dashboard de Ensino',
      'pesquisa-dashboard': 'Dashboard de Pesquisa',
      'clinica-dashboard': 'Dashboard Clínico'
    }

    return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
  }

  const getBreadcrumbPath = (index: number): string => {
    return '/' + pathSegments.slice(0, index + 1).join('/')
  }

  const isLastSegment = (index: number): boolean => {
    return index === pathSegments.length - 1
  }

  // Não mostrar breadcrumbs na página inicial
  if (pathSegments.length === 0 || (pathSegments.length === 1 && pathSegments[0] === 'app')) {
    return null
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-slate-400 mb-6">
      <Link 
        to="/app" 
        className="flex items-center space-x-1 hover:text-white transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Início</span>
      </Link>
      
      {pathSegments.map((segment, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4" />
          {isLastSegment(index) ? (
            <span className="text-white font-medium">
              {getBreadcrumbLabel(segment, index)}
            </span>
          ) : (
            <Link 
              to={getBreadcrumbPath(index)}
              className="hover:text-white transition-colors"
            >
              {getBreadcrumbLabel(segment, index)}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export default Breadcrumbs
