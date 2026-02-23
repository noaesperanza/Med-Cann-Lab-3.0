import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

export interface DashboardTriggerOption {
  id: string
  label: string
  icon: LucideIcon
  description?: string
}

interface DashboardTriggersContextType {
  options: DashboardTriggerOption[] | null
  /** Opções extras para dropdown "Mais" no terminal unificado */
  moreOptions: DashboardTriggerOption[] | null
  activeId: string
  setOptions: (opts: DashboardTriggerOption[] | null) => void
  setActiveId: (id: string) => void
  onChange: (id: string) => void
  onBrainClick: (() => void) | null
  setOnBrainClick: (fn: (() => void) | null) => void
  onPrescricaoRapida: (() => void) | null
  setOnPrescricaoRapida: (fn: (() => void) | null) => void
  onNovoPaciente: (() => void) | null
  setOnNovoPaciente: (fn: (() => void) | null) => void
  /** Configura tudo de uma vez (usado pelo dashboard ao montar) */
  setDashboardTriggers: (config: {
    options: DashboardTriggerOption[] | null
    activeId: string
    onChange: (id: string) => void
    onBrainClick: () => void
    onPrescricaoRapida?: () => void
    onNovoPaciente?: () => void
    /** Opções para dropdown "Mais" (ex.: Relatórios, Prescrições, Chat) */
    moreOptions?: DashboardTriggerOption[] | null
  } | null) => void
}

const DashboardTriggersContext = createContext<DashboardTriggersContextType | undefined>(undefined)

export const useDashboardTriggers = () => {
  const ctx = useContext(DashboardTriggersContext)
  if (ctx === undefined) {
    throw new Error('useDashboardTriggers must be used within DashboardTriggersProvider')
  }
  return ctx
}

/** Use when component may render outside provider (e.g. Header). Returns null if no provider. */
export const useDashboardTriggersOptional = () => useContext(DashboardTriggersContext) ?? null

interface DashboardTriggersProviderProps {
  children: ReactNode
}

export const DashboardTriggersProvider: React.FC<DashboardTriggersProviderProps> = ({ children }) => {
  const [options, setOptionsState] = useState<DashboardTriggerOption[] | null>(null)
  const [moreOptions, setMoreOptionsState] = useState<DashboardTriggerOption[] | null>(null)
  const [activeId, setActiveId] = useState('')
  const [onChangeFn, setOnChangeFn] = useState<((id: string) => void) | null>(null)
  const [onBrainClickFn, setOnBrainClick] = useState<(() => void) | null>(null)
  const [onPrescricaoRapidaFn, setOnPrescricaoRapida] = useState<(() => void) | null>(null)
  const [onNovoPacienteFn, setOnNovoPaciente] = useState<(() => void) | null>(null)

  const setOptions = useCallback((opts: DashboardTriggerOption[] | null) => {
    setOptionsState(opts)
  }, [])

  const onChange = useCallback((id: string) => {
    setActiveId(id)
    onChangeFn?.(id)
  }, [onChangeFn])

  const setDashboardTriggers = useCallback((config: {
    options: DashboardTriggerOption[] | null
    activeId: string
    onChange: (id: string) => void
    onBrainClick: () => void
    onPrescricaoRapida?: () => void
    onNovoPaciente?: () => void
    moreOptions?: DashboardTriggerOption[] | null
  } | null) => {
    if (!config) {
      setOptionsState(null)
      setMoreOptionsState(null)
      setActiveId('')
      setOnChangeFn(null)
      setOnBrainClick(null)
      setOnPrescricaoRapida(null)
      setOnNovoPaciente(null)
      return
    }
    setOptionsState(config.options)
    setMoreOptionsState(config.moreOptions ?? null)
    setActiveId(config.activeId)
    setOnChangeFn(() => config.onChange)
    setOnBrainClick(() => config.onBrainClick)
    setOnPrescricaoRapida(config.onPrescricaoRapida ? () => config.onPrescricaoRapida! : null)
    setOnNovoPaciente(config.onNovoPaciente ? () => config.onNovoPaciente! : null)
  }, [])

  return (
    <DashboardTriggersContext.Provider
      value={{
        options,
        moreOptions,
        activeId,
        setOptions,
        setActiveId,
        onChange,
        onBrainClick: onBrainClickFn,
        setOnBrainClick,
        onPrescricaoRapida: onPrescricaoRapidaFn,
        setOnPrescricaoRapida,
        onNovoPaciente: onNovoPacienteFn,
        setOnNovoPaciente,
        setDashboardTriggers
      }}
    >
      {children}
    </DashboardTriggersContext.Provider>
  )
}
