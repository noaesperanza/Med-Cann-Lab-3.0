// Sistema de Rotas Individualizadas - MedCannLab 3.0
// Estrutura: /eixo/tipo/usuario/acao

export interface RouteConfig {
  path: string
  component: React.ComponentType
  requiredRole?: 'admin' | 'professional' | 'patient' | 'aluno'
  title: string
  description: string
  icon?: string
}

export interface UserRoute {
  eixo: 'ensino' | 'pesquisa' | 'clinica'
  tipo: 'profissional' | 'aluno' | 'paciente'
  rotas: RouteConfig[]
}

// =====================================================
// ROTAS POR EIXO E TIPO DE USUÁRIO
// =====================================================

export const ROTAS_INDIVIDUALIZADAS: Record<string, UserRoute> = {
  // EIXO CLÍNICA
  'clinica-profissional': {
    eixo: 'clinica',
    tipo: 'profissional',
    rotas: [
      {
        path: '/app/clinica/profissional/dashboard',
        component: () => import('../pages/ProfessionalDashboard').then(m => m.default),
        requiredRole: 'professional',
        title: 'Dashboard Clínico',
        description: 'Visão geral do atendimento clínico',
        icon: '🏥'
      },
      {
        path: '/app/clinica/profissional/pacientes',
        component: () => import('../pages/PatientsManagement').then(m => m.default),
        requiredRole: 'professional',
        title: 'Gestão de Pacientes',
        description: 'Gerenciar pacientes e prontuários',
        icon: '👥'
      },
      {
        path: '/app/clinica/profissional/agendamentos',
        component: () => import('../pages/ProfessionalScheduling').then(m => m.default),
        requiredRole: 'professional',
        title: 'Agendamentos',
        description: 'Gerenciar consultas e horários',
        icon: '📅'
      },
      {
        path: '/app/clinica/profissional/relatorios',
        component: () => import('../pages/Reports').then(m => m.default),
        requiredRole: 'professional',
        title: 'Relatórios Clínicos',
        description: 'Visualizar relatórios gerados pela IA',
        icon: '📊'
      },
      {
        path: '/app/clinica/profissional/chat-pacientes',
        component: () => import('../pages/ProfessionalChat').then(m => m.default),
        requiredRole: 'professional',
        title: 'Chat com Pacientes',
        description: 'Comunicação direta com pacientes',
        icon: '💬'
      }
    ]
  },

  'clinica-paciente': {
    eixo: 'clinica',
    tipo: 'paciente',
    rotas: [
      {
        path: '/app/clinica/paciente/dashboard',
        component: () => import('../pages/PatientDashboard').then(m => m.default),
        requiredRole: 'patient',
        title: 'Meu Dashboard de Saúde',
        description: 'Acompanhamento da sua jornada de cuidado',
        icon: '🏠'
      },
      {
        path: '/app/clinica/paciente/avaliacao-clinica',
        component: () => import('../pages/ClinicalAssessment').then(m => m.default),
        requiredRole: 'patient',
        title: 'Avaliação Clínica Inicial',
        description: 'Realizar avaliação com IA residente',
        icon: '🤖'
      },
      {
        path: '/app/clinica/paciente/agenda',
        component: () => import('../pages/PatientAgenda').then(m => m.default),
        requiredRole: 'patient',
        title: 'Minha Agenda',
        description: 'Consultas e compromissos',
        icon: '📅'
      },
      {
        path: '/app/clinica/paciente/chat-profissional',
        component: () => import('../pages/PatientDoctorChat').then(m => m.default),
        requiredRole: 'patient',
        title: 'Chat com Profissional',
        description: 'Comunicação com seu médico',
        icon: '💬'
      }
    ]
  },

  // EIXO ENSINO
  'ensino-profissional': {
    eixo: 'ensino',
    tipo: 'profissional',
    rotas: [
      {
        path: '/app/ensino/profissional/dashboard',
        component: () => import('../pages/EnsinoDashboard').then(m => m.default),
        requiredRole: 'professional',
        title: 'Dashboard de Ensino',
        description: 'Gestão de cursos e materiais',
        icon: '🎓'
      },
      {
        path: '/app/ensino/profissional/preparacao-aulas',
        component: () => import('../pages/LessonPreparation').then(m => m.default),
        requiredRole: 'professional',
        title: 'Ferramentas Pedagógicas',
        description: 'Produza relatos de caso e crie aulas a partir de casos clínicos reais',
        icon: '📝'
      },
      {
        path: '/app/ensino/profissional/arte-entrevista-clinica',
        component: () => import('../pages/ArteEntrevistaClinica').then(m => m.default),
        requiredRole: 'professional',
        title: 'Arte da Entrevista Clínica',
        description: 'Metodologia AEC - Dr. Eduardo Faveret',
        icon: '🎭'
      },
      {
        path: '/app/ensino/profissional/gestao-alunos',
        component: () => import('../pages/GestaoAlunos').then(m => m.default),
        requiredRole: 'professional',
        title: 'Gestão de Alunos',
        description: 'Acompanhar desenvolvimento dos alunos por curso',
        icon: '👥'
      }
    ]
  },

  'ensino-aluno': {
    eixo: 'ensino',
    tipo: 'aluno',
    rotas: [
      {
        path: '/app/ensino/aluno/dashboard',
        component: () => import('../pages/AlunoDashboard').then(m => m.default),
        requiredRole: 'aluno',
        title: 'Dashboard do Aluno',
        description: 'Acompanhamento acadêmico',
        icon: '🎓'
      },
      {
        path: '/app/ensino/aluno/cursos',
        component: () => import('../pages/Courses').then(m => m.default),
        requiredRole: 'aluno',
        title: 'Meus Cursos',
        description: 'Cannabis Medicinal e AEC',
        icon: '📚'
      },
      {
        path: '/app/ensino/aluno/biblioteca',
        component: () => import('../pages/Library').then(m => m.default),
        requiredRole: 'aluno',
        title: 'Biblioteca',
        description: 'Materiais de estudo',
        icon: '📖'
      },
      {
        path: '/app/ensino/aluno/gamificacao',
        component: () => import('../pages/Gamificacao').then(m => m.default),
        requiredRole: 'aluno',
        title: 'Gamificação',
        description: 'Pontos e certificados',
        icon: '🏆'
      }
    ]
  },

  // EIXO PESQUISA
  'pesquisa-profissional': {
    eixo: 'pesquisa',
    tipo: 'profissional',
    rotas: [
      {
        path: '/app/pesquisa/profissional/dashboard',
        component: () => import('../pages/PesquisaDashboard').then(m => m.default),
        requiredRole: 'professional',
        title: 'Dashboard de Pesquisa',
        description: 'Gestão de projetos de pesquisa',
        icon: '🔬'
      },
      {
        path: '/app/pesquisa/profissional/forum-casos',
        component: () => import('../pages/ForumCasosClinicos').then(m => m.default),
        requiredRole: 'professional',
        title: 'Fórum de Casos Clínicos',
        description: 'Discussão de casos e pesquisas',
        icon: '💬'
      }
    ]
  },

  'pesquisa-aluno': {
    eixo: 'pesquisa',
    tipo: 'aluno',
    rotas: [
      {
        path: '/app/pesquisa/aluno/dashboard',
        component: () => import('../pages/PesquisaDashboard').then(m => m.default),
        requiredRole: 'aluno',
        title: 'Dashboard de Pesquisa',
        description: 'Participação em projetos de pesquisa',
        icon: '🔬'
      },
      {
        path: '/app/pesquisa/aluno/forum-casos',
        component: () => import('../pages/ForumCasosClinicos').then(m => m.default),
        requiredRole: 'aluno',
        title: 'Fórum de Casos Clínicos',
        description: 'Discussão de casos e pesquisas',
        icon: '💬'
      }
    ]
  }
}

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

export const getRouteKey = (eixo: string, tipo: string): string => {
  return `${eixo}-${tipo}`
}

export const getUserRoutes = (eixo: string, tipo: string): UserRoute | null => {
  const key = getRouteKey(eixo, tipo)
  return ROTAS_INDIVIDUALIZADAS[key] || null
}

export const getDefaultRoute = (userType: string): string => {
  switch (userType) {
    case 'admin':
      return '/app/dashboard'
    case 'professional':
      return '/app/clinica/profissional/dashboard'
    case 'patient':
      return '/app/clinica/paciente/dashboard'
    case 'aluno':
      return '/app/ensino/aluno/dashboard'
    default:
      return '/app/dashboard'
  }
}

export const getBreadcrumbs = (path: string): Array<{label: string, path: string}> => {
  const segments = path.split('/').filter(Boolean)
  const breadcrumbs = []
  
  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    
    // Mapear segmentos para labels amigáveis
    const labelMap: Record<string, string> = {
      'app': 'MedCannLab',
      'clinica': 'Clínica',
      'ensino': 'Ensino',
      'pesquisa': 'Pesquisa',
      'profissional': 'Profissional',
      'paciente': 'Paciente',
      'aluno': 'Aluno',
      'dashboard': 'Dashboard',
      'avaliacao-clinica': 'Avaliação Clínica',
      'relatorios': 'Relatórios',
      'agenda': 'Agenda',
      'chat-profissional': 'Chat com Profissional',
      'pacientes': 'Pacientes',
      'agendamentos': 'Agendamentos',
      'chat-pacientes': 'Chat com Pacientes',
      'cursos': 'Cursos',
      'biblioteca': 'Biblioteca',
      'gamificacao': 'Gamificação',
      'preparacao-aulas': 'Preparação de Aulas',
      'arte-entrevista-clinica': 'Arte da Entrevista Clínica',
      'forum-casos': 'Fórum de Casos'
    }
    
    breadcrumbs.push({
      label: labelMap[segment] || segment,
      path: currentPath
    })
  }
  
  return breadcrumbs
}
