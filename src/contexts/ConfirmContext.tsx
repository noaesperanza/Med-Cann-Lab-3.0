import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { X, AlertTriangle, CheckCircle, Info, AlertCircle, ShieldAlert } from 'lucide-react'

type ConfirmType = 'danger' | 'warning' | 'info' | 'success'

interface ConfirmOptions {
    title: string
    message: string
    type?: ConfirmType
    confirmText?: string
    cancelText?: string
}

interface ConfirmState extends ConfirmOptions {
    isOpen: boolean
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined)

export const useConfirm = () => {
    const context = useContext(ConfirmContext)
    if (context === undefined) {
        throw new Error('useConfirm must be used within a ConfirmProvider')
    }
    return context
}

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ConfirmState>({
        isOpen: false,
        title: '',
        message: '',
        type: 'warning',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar'
    })
    const [isClosing, setIsClosing] = useState(false)

    const resolverRef = useRef<((value: boolean) => void) | null>(null)

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise<boolean>((resolve) => {
            resolverRef.current = resolve
            setState({
                isOpen: true,
                title: options.title,
                message: options.message,
                type: options.type || 'warning',
                confirmText: options.confirmText || 'Confirmar',
                cancelText: options.cancelText || 'Cancelar'
            })
        })
    }, [])

    const handleClose = useCallback((result: boolean) => {
        setIsClosing(true)
        setTimeout(() => {
            setState(prev => ({ ...prev, isOpen: false }))
            setIsClosing(false)
            if (resolverRef.current) {
                resolverRef.current(result)
                resolverRef.current = null
            }
        }, 150)
    }, [])

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {state.isOpen && (
                <ConfirmDialog
                    {...state}
                    isClosing={isClosing}
                    onConfirm={() => handleClose(true)}
                    onCancel={() => handleClose(false)}
                />
            )}
        </ConfirmContext.Provider>
    )
}

// ─────────────────────────────────────────────────────────────
// 🎨 CONFIRM DIALOG — Premium Glassmorphism Design
// ─────────────────────────────────────────────────────────────
interface ConfirmDialogProps extends ConfirmState {
    isClosing: boolean
    onConfirm: () => void
    onCancel: () => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    title,
    message,
    type = 'warning',
    confirmText,
    cancelText,
    isClosing,
    onConfirm,
    onCancel
}) => {
    const getIcon = () => {
        const iconClass = 'w-6 h-6'
        switch (type) {
            case 'danger':
                return <AlertCircle className={`${iconClass} text-red-400`} />
            case 'warning':
                return <AlertTriangle className={`${iconClass} text-amber-400`} />
            case 'info':
                return <Info className={`${iconClass} text-blue-400`} />
            case 'success':
                return <CheckCircle className={`${iconClass} text-emerald-400`} />
            default:
                return <ShieldAlert className={`${iconClass} text-amber-400`} />
        }
    }

    const getAccentColor = () => {
        switch (type) {
            case 'danger': return 'from-red-500/20 to-red-900/10'
            case 'warning': return 'from-amber-500/20 to-amber-900/10'
            case 'info': return 'from-blue-500/20 to-blue-900/10'
            case 'success': return 'from-emerald-500/20 to-emerald-900/10'
            default: return 'from-amber-500/20 to-amber-900/10'
        }
    }

    const getButtonColors = () => {
        switch (type) {
            case 'danger':
                return 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-900/30'
            case 'warning':
                return 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-amber-900/30'
            case 'info':
                return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-blue-900/30'
            case 'success':
                return 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-900/30'
            default:
                return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-blue-900/30'
        }
    }

    const getBorderGlow = () => {
        switch (type) {
            case 'danger': return 'border-red-500/30 shadow-[0_0_30px_-5px_rgba(239,68,68,0.15)]'
            case 'warning': return 'border-amber-500/30 shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)]'
            case 'info': return 'border-blue-500/30 shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)]'
            case 'success': return 'border-emerald-500/30 shadow-[0_0_30px_-5px_rgba(16,185,129,0.15)]'
            default: return 'border-amber-500/30'
        }
    }

    const animClass = isClosing
        ? 'animate-out fade-out zoom-out-95 duration-150'
        : 'animate-in fade-in zoom-in-95 duration-200'

    return (
        <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4`}>
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/70 backdrop-blur-md ${isClosing ? 'animate-out fade-out duration-150' : 'animate-in fade-in duration-200'}`}
                onClick={onCancel}
            />

            {/* Modal */}
            <div className={`relative max-w-md w-full ${animClass}`}>
                {/* Glow effect behind */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${getAccentColor()} rounded-2xl blur-xl opacity-60`} />

                <div className={`relative bg-slate-900/95 backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden ${getBorderGlow()}`}>
                    {/* Top accent bar */}
                    <div className={`h-1 w-full bg-gradient-to-r ${getAccentColor()}`} />

                    <div className="p-6">
                        {/* Close button */}
                        <button
                            onClick={onCancel}
                            className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800/50"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Content */}
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-0.5 p-2 rounded-xl bg-slate-800/80">
                                {getIcon()}
                            </div>
                            <div className="flex-1 min-w-0 pr-6">
                                <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                                    {title}
                                </h3>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800/50">
                            <button
                                onClick={onCancel}
                                className="px-5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl transition-all duration-200 font-medium text-sm border border-slate-700/50 hover:border-slate-600/50"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`px-5 py-2.5 rounded-xl transition-all duration-200 font-medium text-sm text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${getButtonColors()}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ConfirmProvider
