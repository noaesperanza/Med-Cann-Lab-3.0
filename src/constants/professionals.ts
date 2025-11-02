// Constantes dos Profissionais Reais do MedCannLab
export const PROFESSIONALS = {
  RICARDO_VALENCA: {
    id: 'ricardo-valenca',
    name: 'Dr. Ricardo Valença',
    specialty: 'Cannabis Medicinal & Nefrologia',
    avatar: 'RV',
    online: true,
    consultorio: 'Consultório Escola Ricardo Valença',
    email: 'ricardo@medcannlab.com',
    crm: 'CRM-RV'
  },
  EDUARDO_FAVERET: {
    id: 'eduardo-faveret',
    name: 'Dr. Eduardo Faveret',
    specialty: 'Cannabis Medicinal & Arte da Entrevista Clínica',
    avatar: 'EF',
    online: true,
    consultorio: 'Consultório Escola Eduardo Faveret',
    email: 'eduardo@medcannlab.com',
    crm: 'CRM-EF'
  }
} as const

export const PROFESSIONALS_ARRAY = [
  PROFESSIONALS.RICARDO_VALENCA,
  PROFESSIONALS.EDUARDO_FAVERET
]
