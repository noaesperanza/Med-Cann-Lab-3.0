import React, { useState, useRef, useEffect } from 'react'
import { Brain, ChevronDown } from 'lucide-react'
import { useDashboardTriggersOptional } from '../contexts/DashboardTriggersContext'

/**
 * Barra de triggers + cérebro em um nível ACIMA do cabeçalho do app.
 * Se moreOptions existir (terminal unificado): 4 principais + dropdown "Mais".
 * Senão: triggers divididos à esquerda/direita do cérebro.
 * Mobile: barra oculta (cérebro fica no Header).
 */
const DashboardTriggersBar: React.FC = () => {
  const ctx = useDashboardTriggersOptional()
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  const hasTriggers = ctx?.options != null && ctx.options.length > 0
  const hasMore = (ctx?.moreOptions != null && ctx.moreOptions.length > 0)

  useEffect(() => {
    if (!moreOpen) return
    const close = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [moreOpen])

  if (!hasTriggers || !ctx) return null

  const handleAction = (id: string) => {
    setMoreOpen(false)
    if (id === 'novo-paciente') ctx.onNovoPaciente?.()
    else if (id === 'prescricao-rapida') ctx.onPrescricaoRapida?.()
    else ctx.onChange(id)
  }

  const mainOptions = hasMore ? ctx.options! : ctx.options!
  const leftCount = hasMore ? Math.ceil(mainOptions.length / 2) : Math.ceil(ctx.options!.length / 2)
  const leftOptions = hasMore ? mainOptions.slice(0, leftCount) : ctx.options!.slice(0, leftCount).reverse()
  const rightOptions = hasMore ? mainOptions.slice(leftCount) : ctx.options!.slice(leftCount)
  const moreOptions = ctx.moreOptions ?? []

  return (
    <div
      className="hidden md:flex items-center justify-center gap-2 py-2 px-2 border-b border-[#0f172a]/50 w-full"
      style={{
        background: 'linear-gradient(135deg, rgba(10,25,47,0.98) 0%, rgba(26,54,93,0.95) 55%, rgba(45,90,61,0.92) 100%)',
        borderColor: 'rgba(0,193,106,0.12)'
      }}
    >
      <div className="flex-1 flex justify-end overflow-hidden min-w-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-2 py-1 mask-linear-fade-left cursor-grab active:cursor-grabbing" style={{ direction: 'rtl', scrollbarWidth: 'none' }}>
          <div className="flex items-center gap-2" style={{ direction: 'ltr' }}>
            {leftOptions.map((opt) => {
              const Icon = opt.icon
              const isActive = ctx.activeId === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleAction(opt.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all whitespace-nowrap ${
                    isActive ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-100' : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-emerald-500/30'
                  }`}
                  title={opt.description || opt.label}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => ctx.onBrainClick?.()}
          className="relative w-11 h-11 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-400/20 hover:scale-110 transition-all"
          aria-label="Abrir chat Nôa"
        >
          <Brain className="w-5 h-5 text-white drop-shadow-md" />
        </button>
      </div>
      <div className="flex-1 flex justify-start overflow-hidden min-w-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-2 py-1 mask-linear-fade-right cursor-grab active:cursor-grabbing" style={{ scrollbarWidth: 'none' }}>
          {rightOptions.map((opt) => {
            const Icon = opt.icon
            const isActive = ctx.activeId === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleAction(opt.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all whitespace-nowrap ${
                  isActive ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-100' : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-emerald-500/30'
                }`}
                title={opt.description || opt.label}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {opt.label}
              </button>
            )
          })}
          {hasMore && (
            <div className="relative flex-shrink-0" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen((o) => !o)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all whitespace-nowrap bg-slate-800/60 border-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-emerald-500/30 ${
                  moreOpen ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-100' : ''
                }`}
                title="Mais ações"
              >
                <ChevronDown className={`w-3.5 h-3.5 ${moreOpen ? 'text-emerald-400' : 'text-slate-400'}`} />
                Mais
              </button>
              {moreOpen && (
                <div
                  className="absolute top-full right-0 mt-1 py-1 rounded-lg border border-slate-700/50 bg-slate-900/98 shadow-xl z-50 min-w-[180px]"
                  style={{ borderColor: 'rgba(0,193,106,0.12)' }}
                >
                  {moreOptions.map((opt) => {
                    const Icon = opt.icon
                    const isActive = ctx.activeId === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleAction(opt.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors ${
                          isActive ? 'bg-emerald-600/20 text-emerald-100' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardTriggersBar
