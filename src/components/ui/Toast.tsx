
import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
    description?: string;
    duration?: number;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, message, description, duration = 3000, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-emerald-400" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-400" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-amber-400" />;
            case 'info':
                return <Info className="w-5 h-5 text-sky-400" />;
        }
    };

    const getClasses = () => {
        switch (type) {
            case 'success':
                return 'border-emerald-500/20 bg-emerald-500/10 shadow-emerald-500/10';
            case 'error':
                return 'border-red-500/20 bg-red-500/10 shadow-red-500/10';
            case 'warning':
                return 'border-amber-500/20 bg-amber-500/10 shadow-amber-500/10';
            case 'info':
                return 'border-sky-500/20 bg-sky-500/10 shadow-sky-500/10';
        }
    };

    return (
        <div
            className={`
        flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg
        transform transition-all duration-300 animate-in slide-in-from-right fade-in zoom-in-95
        ${getClasses()}
        bg-slate-900/90 text-slate-200 min-w-[300px] max-w-sm pointer-events-auto
      `}
            role="alert"
        >
            <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
            <div className="flex-1 space-y-1">
                <div className="text-sm font-semibold text-white leading-tight">{message}</div>
                {description && (
                    <div className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {description}
                    </div>
                )}
            </div>
            <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
                <X className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
        </div>
    );
};

export default Toast;
