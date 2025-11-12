import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  MessageCircle,
  Calendar,
  User,
  Stethoscope,
  LayoutDashboard,
  BookOpen,
  ClipboardList
} from 'lucide-react'
import clsx from 'clsx'

type MobileDockItem = {
  label: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

interface MobileDockProps {
  userType?: string | null
}

const dockItemsByRole: Record<string, MobileDockItem[]> = {
  paciente: [
    { label: 'Início', href: '/app/clinica/paciente/dashboard', icon: Home },
    { label: 'Chat', href: '/app/clinica/paciente/chat-profissional', icon: MessageCircle },
    { label: 'Agenda', href: '/app/clinica/paciente/agenda', icon: Calendar },
    { label: 'Perfil', href: '/app/profile', icon: User }
  ],
  profissional: [
    { label: 'Dashboard', href: '/app/clinica/profissional/dashboard', icon: LayoutDashboard },
    { label: 'Pacientes', href: '/app/clinica/profissional/pacientes', icon: Stethoscope },
    { label: 'Chat', href: '/app/clinica/profissional/chat-profissionais', icon: MessageCircle },
    { label: 'Perfil', href: '/app/profile', icon: User }
  ],
  admin: [
    { label: 'Admin', href: '/app/admin', icon: LayoutDashboard },
    { label: 'Clínica', href: '/app/clinica/profissional/dashboard', icon: Stethoscope },
    { label: 'Relatórios', href: '/app/reports', icon: ClipboardList },
    { label: 'Perfil', href: '/app/profile', icon: User }
  ],
  aluno: [
    { label: 'Dashboard', href: '/app/ensino/aluno/dashboard', icon: LayoutDashboard },
    { label: 'Cursos', href: '/app/ensino/aluno/cursos', icon: BookOpen },
    { label: 'Chat', href: '/app/chat', icon: MessageCircle },
    { label: 'Perfil', href: '/app/profile', icon: User }
  ],
  default: [
    { label: 'Início', href: '/app/dashboard', icon: Home },
    { label: 'Chat', href: '/app/chat', icon: MessageCircle },
    { label: 'Agenda', href: '/app/patient-agenda', icon: Calendar },
    { label: 'Perfil', href: '/app/profile', icon: User }
  ]
}

const MobileDock: React.FC<MobileDockProps> = ({ userType }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const items = dockItemsByRole[userType ?? ''] ?? dockItemsByRole.default

  const handleNavigate = (href: string) => {
    if (location.pathname + location.search === href) return
    navigate(href)
  }

  return (
    <nav
      className="mobile-dock"
      aria-label="Navegação rápida em dispositivos móveis"
    >
      <div className="mobile-dock__inner">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname.startsWith(item.href)

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => handleNavigate(item.href)}
              className={clsx('mobile-dock__item', {
                'mobile-dock__item--active': isActive
              })}
            >
              <Icon className="mobile-dock__icon" aria-hidden="true" />
              <span className="mobile-dock__label">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileDock
