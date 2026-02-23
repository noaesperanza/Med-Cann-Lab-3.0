
import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import RicardoValencaDashboard from '../pages/RicardoValencaDashboard'
import EduardoFaveretDashboard from '../pages/EduardoFaveretDashboard'
import ProfessionalMyDashboard from '../pages/ProfessionalMyDashboard'

const ProfessionalDashboardRouter: React.FC = () => {
    const { user } = useAuth()
    const email = user?.email?.toLowerCase() || ''

    // Dashboard Unificado para TODOS os profissionais (incluindo Dr. Ricardo e Dr. Eduardo)
    return <ProfessionalMyDashboard />
}

export default ProfessionalDashboardRouter
