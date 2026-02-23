
import React from 'react';
import { AlertTriangle, Info, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    type = 'warning',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />;
            case 'warning':
                return <HelpCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />;
            case 'info':
                return <Info className="w-12 h-12 text-sky-500 mx-auto mb-4" />;
        }
    };

    const getButtonClass = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20';
            case 'warning':
                return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20';
            case 'info':
                return 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-500/20';
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                <div className="text-center">
                    {getIcon()}

                    <h3 className="text-xl font-bold text-white mb-2 font-display">
                        {title}
                    </h3>

                    <p className="text-slate-400 mb-8 leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={onCancel}
                            className="px-6 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors font-medium"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 ${getButtonClass()}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
