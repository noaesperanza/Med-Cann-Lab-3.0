import React from 'react'
import { Brain, ArrowRight, Shield, X, Stethoscope } from 'lucide-react'

interface AssessmentRequiredModalProps {
    isOpen: boolean
    onClose: () => void
    onStartAssessment: () => void
    professionalName?: string
}

const AssessmentRequiredModal: React.FC<AssessmentRequiredModalProps> = ({
    isOpen,
    onClose,
    onStartAssessment,
    professionalName
}) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-5 border-b border-slate-700/50 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        Avaliação Obrigatória
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-500/20">
                        <Brain className="w-8 h-8 text-blue-400" />
                    </div>

                    <p className="text-center text-slate-300">
                        Para agendar com <strong className="text-white">{professionalName || 'nossos especialistas'}</strong>,
                        é necessário realizar primeiramente sua <strong className="text-emerald-400">Avaliação Clínica Inicial</strong>.
                    </p>

                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 text-sm space-y-2">
                        <div className="flex gap-2">
                            <div className="min-w-[4px] bg-emerald-500 rounded-full"></div>
                            <p className="text-slate-400">A avaliação é conduzida pela Nôa (IA) e é totalmente sigilosa.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="min-w-[4px] bg-blue-500 rounded-full"></div>
                            <p className="text-slate-400">Seu relatório será salvo e enviado automaticamente para o profissional escolhido.</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-700/50 flex flex-col gap-3">
                    <button
                        onClick={onStartAssessment}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/20"
                    >
                        <Brain className="w-5 h-5" />
                        Iniciar Avaliação Agora
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-medium transition-colors"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AssessmentRequiredModal
