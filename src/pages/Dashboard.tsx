import React from 'react'
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

const Dashboard: React.FC = () => {
  const { user } = useAuth()

  // Debug temporário
  console.log('🔍 Dashboard - User type:', user?.type, 'User name:', user?.name)

  const getDashboardContent = () => {
    console.log('🔍 Dashboard - Renderizando conteúdo para tipo:', user?.type)
    switch (user?.type) {
      case 'patient':
        console.log('🎯 Renderizando PatientDashboard')
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
        console.log('⚠️ Tipo não reconhecido, renderizando DefaultDashboard')
        return (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-white mb-4">
              Bem-vindo ao MedCannLab 3.0
            </h1>
            <p className="text-slate-300 mb-8">
              Faça login para acessar seu dashboard personalizado
            </p>
            <Link
              to="/login"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Fazer Login
            </Link>
          </div>
        )
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
