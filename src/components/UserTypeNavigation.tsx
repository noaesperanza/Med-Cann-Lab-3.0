import React, { useState } from 'react'
import { 
  Stethoscope, 
  GraduationCap, 
  User, 
  ChevronDown,
  Users,
  BookOpen,
  FlaskConical,
  Heart,
  Brain,
  MessageCircle
} from 'lucide-react'

interface UserTypeNavigationProps {
  currentUserType: 'professional' | 'aluno' | 'patient' | 'admin' | 'clinica' | 'ensino' | 'pesquisa'
  onUserTypeChange: (userType: 'professional' | 'aluno' | 'patient' | 'admin' | 'clinica' | 'ensino' | 'pesquisa') => void
}

const UserTypeNavigation: React.FC<UserTypeNavigationProps> = ({
  currentUserType,
  onUserTypeChange
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const userTypes = [
    {
      id: 'admin',
      name: 'Administrador',
      description: 'Gestão da Plataforma',
      icon: Users,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      href: '/app/dashboard'
    },
    {
      id: 'clinica',
      name: 'Clínica',
      description: 'Área Clínica',
      icon: Stethoscope,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      href: '/app/clinica-dashboard'
    },
    {
      id: 'ensino',
      name: 'Ensino',
      description: 'Área de Ensino',
      icon: BookOpen,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      href: '/app/ensino-dashboard'
    },
    {
      id: 'pesquisa',
      name: 'Pesquisa',
      description: 'Área de Pesquisa',
      icon: FlaskConical,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20',
      href: '/app/pesquisa-dashboard'
    }
  ]

  const currentType = userTypes.find(type => type.id === currentUserType) || userTypes[3]

  const getServiceAreas = (userType: string) => {
    switch (userType) {
      case 'admin':
        return [
          { name: 'Dashboard Administrativo', icon: Users, href: '/app/dashboard' },
          { name: 'Gestão de Usuários', icon: User, href: '/app/admin-users' },
          { name: 'Relatórios Gerais', icon: BookOpen, href: '/app/admin-reports' },
          { name: 'Configurações', icon: Stethoscope, href: '/app/admin-settings' }
        ]
      case 'clinica':
        return [
          { name: 'Dashboard Clínica', icon: Stethoscope, href: '/app/clinica-dashboard' },
          { name: 'Meus Pacientes', icon: Users, href: '/app/clinica-patients' },
          { name: 'Avaliações', icon: Heart, href: '/app/clinica-assessments' },
          { name: 'Fórum de Conselheiros em IA na Saúde', icon: MessageCircle, href: '/app/clinica-chat' },
          { name: 'Relatórios', icon: BookOpen, href: '/app/clinica-reports' }
        ]
      case 'ensino':
        return [
          { name: 'Dashboard Ensino', icon: BookOpen, href: '/app/ensino-dashboard' },
          { name: 'Biblioteca Médica', icon: BookOpen, href: '/app/ensino-library' },
          { name: 'Arte da Entrevista', icon: Heart, href: '/app/ensino-arte-entrevista' },
          { name: 'Cannabis Medicinal', icon: Brain, href: '/app/ensino-cannabis' },
          { name: 'Fórum de Conselheiros em IA na Saúde', icon: MessageCircle, href: '/app/ensino-chat' },
          { name: 'Relatórios', icon: BookOpen, href: '/app/ensino-reports' }
        ]
      case 'pesquisa':
        return [
          { name: 'Dashboard Pesquisa', icon: FlaskConical, href: '/app/pesquisa-dashboard' },
          { name: 'Meus Pacientes', icon: Users, href: '/app/pesquisa-patients' },
          { name: 'Avaliações', icon: Heart, href: '/app/pesquisa-assessments' },
          { name: 'Fórum de Conselheiros em IA na Saúde', icon: MessageCircle, href: '/app/pesquisa-chat' },
          { name: 'Relatórios', icon: BookOpen, href: '/app/pesquisa-reports' }
        ]
      default:
        return []
    }
  }

  const serviceAreas = getServiceAreas(currentUserType)

  return (
    <div className="relative">
      {/* User Type Selector */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
      >
        <div className={`p-2 rounded-lg ${currentType.bgColor} ${currentType.borderColor} border`}>
          <currentType.icon className={`w-5 h-5 ${currentType.color}`} />
        </div>
        <div className="text-left">
          <div className="text-white font-medium">{currentType.name}</div>
          <div className="text-sm text-slate-400">{currentType.description}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-slate-800 rounded-xl shadow-xl border border-slate-700 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Selecionar Área de Atuação</h3>
            
            {/* User Types */}
            <div className="space-y-2 mb-6">
              {userTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      onUserTypeChange(type.id as any)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      currentUserType === type.id 
                        ? 'bg-slate-700' 
                        : 'hover:bg-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${type.bgColor} ${type.borderColor} border`}>
                      <Icon className={`w-5 h-5 ${type.color}`} />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-medium">{type.name}</div>
                      <div className="text-sm text-slate-400">{type.description}</div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Service Areas for Current User Type */}
            {serviceAreas.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3">
                  Áreas de Serviço - {currentType.name}
                </h4>
                <div className="space-y-1">
                  {serviceAreas.map((area, index) => {
                    const Icon = area.icon
                    return (
                      <a
                        key={index}
                        href={area.href}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 transition-colors"
                      >
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-300">{area.name}</span>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Platform Backbone */}
            <div className="mt-6 pt-4 border-t border-slate-700">
              <div className="flex items-center space-x-2 mb-3">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-sm font-semibold text-pink-400">Espinha Dorsal da Plataforma</span>
              </div>
              <div className="space-y-1">
                <a
                  href="/app/arte-entrevista-clinica"
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Arte da Entrevista Clínica</span>
                </a>
                <a
                  href="/app/cannabis-medicinal-course"
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Brain className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Pós-Graduação Cannabis Medicinal</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserTypeNavigation
