// Sistema Unificado de Tipos de Usuário - MedCannLab 3.0
// Padrão: Português (aluno, profissional, paciente, admin)

export type UserType = 'aluno' | 'profissional' | 'paciente' | 'admin'

// Mapeamento entre tipos em português e inglês (para compatibilidade com Supabase)
export const USER_TYPE_MAP = {
  // Português -> Inglês (para Supabase)
  'aluno': 'student',
  'profissional': 'professional',
  'paciente': 'patient',
  'admin': 'admin',
  // Inglês -> Português (para compatibilidade com dados antigos)
  'student': 'aluno',
  'professional': 'profissional',
  'patient': 'paciente',
} as const

// Tipos válidos aceitos (tanto em português quanto inglês)
export const VALID_USER_TYPES = [
  'aluno', 'student',
  'profissional', 'professional',
  'paciente', 'patient',
  'admin'
] as const

// Função para normalizar tipo de usuário (sempre retorna português)
export const normalizeUserType = (type: string | undefined | null): UserType => {
  if (!type) return 'paciente' // Padrão seguro
  
  const normalized = String(type).toLowerCase().trim()
  
  // Se já está em português, retornar
  if (['aluno', 'profissional', 'paciente', 'admin'].includes(normalized)) {
    return normalized as UserType
  }
  
  // Se está em inglês, traduzir para português
  if (normalized === 'student') return 'aluno'
  if (normalized === 'professional') return 'profissional'
  if (normalized === 'patient') return 'paciente'
  
  // Se o tipo contém um nome (como "Mário Valença"), não é um tipo válido
  // Verificar se contém espaços ou caracteres especiais que indicam um nome
  if (normalized.includes(' ') || normalized.length > 20) {
    console.warn(`⚠️ Tipo de usuário parece ser um nome (${type}), usando padrão 'paciente'`)
    return 'paciente'
  }
  
  // Tipo inválido, retornar padrão
  console.warn(`⚠️ Tipo de usuário inválido: ${type}, usando padrão 'paciente'`)
  return 'paciente'
}

// Função para converter tipo português para inglês (para Supabase)
export const toEnglishType = (type: UserType): string => {
  return USER_TYPE_MAP[type] || type
}

// Função para converter tipo inglês para português
export const toPortugueseType = (type: string): UserType => {
  return normalizeUserType(type)
}

// Função para obter label em português
export const getUserTypeLabel = (type: UserType): string => {
  const labels = {
    'aluno': 'Aluno',
    'profissional': 'Profissional',
    'paciente': 'Paciente',
    'admin': 'Administrador'
  }
  return labels[type] || 'Usuário'
}

// Função para obter descrição do tipo
export const getUserTypeDescription = (type: UserType): string => {
  const descriptions = {
    'aluno': 'Cursos e certificações médicas',
    'profissional': 'Ferramentas clínicas e gestão de pacientes',
    'paciente': 'Acesso a avaliações clínicas e relatórios',
    'admin': 'Gestão completa da plataforma'
  }
  return descriptions[type] || 'Usuário da plataforma'
}

// Função para verificar se um tipo é válido
export const isValidUserType = (type: string): type is UserType => {
  return ['aluno', 'profissional', 'paciente', 'admin'].includes(type.toLowerCase())
}

// Permissões por tipo de usuário
export interface UserPermissions {
  canAccessClinica: boolean
  canAccessEnsino: boolean
  canAccessPesquisa: boolean
  canManagePatients: boolean
  canManageCourses: boolean
  canManageUsers: boolean
  canAccessAdmin: boolean
  canChatProfessional: boolean
  canChatPatient: boolean
  canChatGlobal: boolean
}

export const getUserPermissions = (type: UserType): UserPermissions => {
  const permissions: Record<UserType, UserPermissions> = {
    'aluno': {
      canAccessClinica: false,
      canAccessEnsino: true,
      canAccessPesquisa: true,
      canManagePatients: false,
      canManageCourses: false,
      canManageUsers: false,
      canAccessAdmin: false,
      canChatProfessional: false,
      canChatPatient: false,
      canChatGlobal: true, // Acesso limitado ao fórum
    },
    'profissional': {
      canAccessClinica: true,
      canAccessEnsino: true,
      canAccessPesquisa: true,
      canManagePatients: true,
      canManageCourses: true,
      canManageUsers: false,
      canAccessAdmin: false,
      canChatProfessional: true,
      canChatPatient: true,
      canChatGlobal: true,
    },
    'paciente': {
      canAccessClinica: true,
      canAccessEnsino: false,
      canAccessPesquisa: false,
      canManagePatients: false,
      canManageCourses: false,
      canManageUsers: false,
      canAccessAdmin: false,
      canChatProfessional: true,
      canChatPatient: false,
      canChatGlobal: true, // Acesso limitado ao fórum
    },
    'admin': {
      canAccessClinica: true,
      canAccessEnsino: true,
      canAccessPesquisa: true,
      canManagePatients: true,
      canManageCourses: true,
      canManageUsers: true,
      canAccessAdmin: true,
      canChatProfessional: true,
      canChatPatient: true,
      canChatGlobal: true,
    },
  }
  
  return permissions[type]
}

// Rotas padrão por tipo de usuário
export const getDefaultRouteByType = (type: UserType): string => {
  const routes = {
    'aluno': '/app/ensino/aluno/dashboard',
    'profissional': '/app/clinica/profissional/dashboard',
    'paciente': '/app/clinica/paciente/dashboard',
    'admin': '/app/clinica/profissional/dashboard', // Admin usa dashboard profissional
  }
  
  return routes[type]
}

