export const SCHEDULING_CONFIG = {
  startDateISO: '2025-11-10T00:00:00-03:00',
  workingDays: ['Terça', 'Quarta', 'Quinta'] as const,
  startTime: '14:00',
  endTime: '20:00',
  appointmentDurationMinutes: 60,
  bufferMinutes: 15
}

export type SchedulingWorkingDay = (typeof SCHEDULING_CONFIG.workingDays)[number]

export const getSchedulingStartDate = (): Date => {
  const baseDate = new Date(SCHEDULING_CONFIG.startDateISO)
  const today = new Date()
  return today < baseDate ? baseDate : today
}

export const generateAppointmentSlots = (
  startTime: string = SCHEDULING_CONFIG.startTime,
  endTime: string = SCHEDULING_CONFIG.endTime,
  appointmentMinutes: number = SCHEDULING_CONFIG.appointmentDurationMinutes,
  bufferMinutes: number = SCHEDULING_CONFIG.bufferMinutes
): string[] => {
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)

  const slots: string[] = []
  const startTotalMinutes = startHour * 60 + startMinute
  const endTotalMinutes = endHour * 60 + endMinute

  let cursor = startTotalMinutes

  while (cursor + appointmentMinutes <= endTotalMinutes) {
    const hours = Math.floor(cursor / 60)
    const minutes = cursor % 60
    slots.push(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)

    cursor += appointmentMinutes + bufferMinutes
  }

  return slots
}

export const isSchedulingWorkingDay = (date: Date): boolean => {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  return SCHEDULING_CONFIG.workingDays.includes(days[date.getDay()] as SchedulingWorkingDay)
}

export const clampToSchedulingStartDate = (date: Date): Date => {
  const startDate = new Date(SCHEDULING_CONFIG.startDateISO)
  return date < startDate ? startDate : date
}

