import React, { useEffect } from 'react'
import ResearchWorkstation from '../components/ResearchWorkstation'
import { useDashboardTriggers } from '../contexts/DashboardTriggersContext'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'

interface PesquisaDashboardProps {
  initialTab?: string
}

const PesquisaDashboard: React.FC<PesquisaDashboardProps> = ({ initialTab }) => {
  // Limpar triggers antigos ao montar, já que o Workstation tem sua própria navegação
  const { setDashboardTriggers } = useDashboardTriggers()
  const { openChat, closeChat, isOpen } = useNoaPlatform()

  useEffect(() => {
    // Definir triggers mínimos ou nulos, já que o workstation é autocontido
    setDashboardTriggers(null)
    return () => setDashboardTriggers(null)
  }, [setDashboardTriggers])

  return <ResearchWorkstation initialTab={initialTab} />
}

export default PesquisaDashboard
