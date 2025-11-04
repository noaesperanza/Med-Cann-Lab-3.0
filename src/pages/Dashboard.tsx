import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { 
  BookOpen, 
  Stethoscope, 
  BarChart3, 
  Users, 
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Phone
} from 'lucide-react'
import PatientDashboard from './PatientDashboard'
import ProfessionalDashboard from './ProfessionalDashboard'
import AlunoDashboard from './AlunoDashboard'
import { getDefaultRoute } from '../lib/rotasIndividualizadas'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const hasRedirectedRef = useRef(false)
  const lastUserTypeRef = useRef<string | undefined>(undefined)

  // Debug removido para reduzir ruído no console

  // Redirecionar pacientes, admins e outros tipos não reconhecidos para seus dashboards corretos
  useEffect(() => {
    // Só redirecionar se o user type mudou e não redirecionamos ainda
    if (!user || hasRedirectedRef.current || lastUserTypeRef.current === user.type) {
      return
    }
    
    lastUserTypeRef.current = user.type
    
    if (user.type === 'patient') {
      hasRedirectedRef.current = true
      navigate('/app/clinica/paciente/dashboard', { replace: true })
    } else if (user.type === 'admin') {
      hasRedirectedRef.current = true
      navigate('/app/ricardo-valenca-dashboard', { replace: true })
    } else if (!['professional', 'aluno'].includes(user.type)) {
      hasRedirectedRef.current = true
      const defaultRoute = getDefaultRoute(user.type)
      navigate(defaultRoute, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.type])
  
  // Resetar ref se o usuário mudou completamente
  useEffect(() => {
    if (!user) {
      hasRedirectedRef.current = false
      lastUserTypeRef.current = undefined
    }
  }, [user?.id])

  // Se paciente, admin ou tipo não reconhecido, não renderizar nada (aguardar redirecionamento)
  if (user?.type === 'patient' || user?.type === 'admin' || (user && !['professional', 'aluno'].includes(user.type))) {
    return null
  }

  const getDashboardContent = () => {
    // Se não há usuário, mostrar página de login
    if (!user) {
      return (
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-white mb-4">
            Bem-vindo ao MedCannLab 3.0
          </h1>
          <p className="text-slate-300 mb-8">
            Faça login para acessar seu dashboard personalizado
          </p>
          <Link
            to="/"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Fazer Login
          </Link>
        </div>
      )
    }

    switch (user?.type) {
      case 'patient':
        // Não deve chegar aqui devido ao redirecionamento acima
        return <PatientDashboard />
      case 'professional':
        return <ProfessionalDashboard />
      case 'aluno':
        return <AlunoDashboard />
      case 'admin':
        // Não deve chegar aqui devido ao redirecionamento acima
        return null
      default:
        // Não deve chegar aqui devido ao redirecionamento acima
        return null
    }
  }

  return (
    <div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getDashboardContent()}
      </div>
    </div>
  )
}






export default Dashboard
