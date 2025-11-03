import React, { useEffect } from 'react'
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
import AdminDashboard from './AdminDashboard'
import { getDefaultRoute } from '../lib/rotasIndividualizadas'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Debug temporário
  console.log('🔍 Dashboard - User type:', user?.type, 'User name:', user?.name)

  // Redirecionar pacientes e outros tipos não reconhecidos para seus dashboards corretos
  useEffect(() => {
    if (!user) return
    
    if (user.type === 'patient') {
      console.log('🔄 Paciente detectado no Dashboard genérico, redirecionando...')
      navigate('/app/clinica/paciente/dashboard', { replace: true })
    } else if (!['professional', 'aluno', 'admin'].includes(user.type)) {
      console.log('⚠️ Tipo não reconhecido, redirecionando para rota padrão')
      const defaultRoute = getDefaultRoute(user.type)
      navigate(defaultRoute, { replace: true })
    }
  }, [user?.type, navigate, user])

  // Se paciente ou tipo não reconhecido, não renderizar nada (aguardar redirecionamento)
  if (user?.type === 'patient' || (user && !['professional', 'aluno', 'admin'].includes(user.type))) {
    return null
  }

  const getDashboardContent = () => {
    console.log('🔍 Dashboard - Renderizando conteúdo para tipo:', user?.type)
    
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
        console.log('🎯 Renderizando PatientDashboard (fallback)')
        return <PatientDashboard />
      case 'professional':
        console.log('🎯 Renderizando ProfessionalDashboard')
        return <ProfessionalDashboard />
      case 'aluno':
        console.log('🎯 Renderizando AlunoDashboard')
        return <AlunoDashboard />
      case 'admin':
        console.log('🎯 Renderizando AdminDashboard')
        return <AdminDashboard />
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
