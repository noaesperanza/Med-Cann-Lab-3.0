
import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import Toast, { ToastType } from '../components/ui/Toast';
import ConfirmModal from '../components/ui/ConfirmModal';

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ConfirmOptions {
  title?: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
}

interface ToastContextData {
  showToast: (type: ToastType, message: string, description?: string, duration?: number) => void;
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
  success: (message: string, descriptionOrDuration?: string | number, duration?: number) => void;
  error: (message: string, descriptionOrDuration?: string | number, duration?: number) => void;
  warning: (message: string, descriptionOrDuration?: string | number, duration?: number) => void;
  info: (message: string, descriptionOrDuration?: string | number, duration?: number) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

let toastIdCounter = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    options: {},
    resolve: null,
  });

  const showToast = useCallback((type: ToastType, message: string, description?: string, duration = 3000) => {
    const id = `toast-${toastIdCounter++}`;
    setToasts((prev) => [...prev, { id, type, message, description, duration }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const confirm = useCallback((message: string, options: ConfirmOptions = {}): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        title: options.title || 'Confirmação',
        message: message,
        type: options.type || 'warning',
        options: options,
        resolve: resolve,
      });
    });
  }, []);

  const handleModalConfirm = () => {
    if (modalState.resolve) modalState.resolve(true);
    setModalState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  const handleModalCancel = () => {
    if (modalState.resolve) modalState.resolve(false);
    setModalState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  const success = useCallback((message: string, descriptionOrDuration?: string | number, duration?: number) => {
    if (typeof descriptionOrDuration === 'number') {
      showToast('success', message, undefined, descriptionOrDuration);
    } else {
      showToast('success', message, descriptionOrDuration, duration);
    }
  }, [showToast]);

  const error = useCallback((message: string, descriptionOrDuration?: string | number, duration?: number) => {
    if (typeof descriptionOrDuration === 'number') {
      showToast('error', message, undefined, descriptionOrDuration);
    } else {
      showToast('error', message, descriptionOrDuration, duration);
    }
  }, [showToast]);

  const warning = useCallback((message: string, descriptionOrDuration?: string | number, duration?: number) => {
    if (typeof descriptionOrDuration === 'number') {
      showToast('warning', message, undefined, descriptionOrDuration);
    } else {
      showToast('warning', message, descriptionOrDuration, duration);
    }
  }, [showToast]);

  const info = useCallback((message: string, descriptionOrDuration?: string | number, duration?: number) => {
    if (typeof descriptionOrDuration === 'number') {
      showToast('info', message, undefined, descriptionOrDuration);
    } else {
      showToast('info', message, descriptionOrDuration, duration);
    }
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, confirm, success, error, warning, info }}>
      {children}

      {/* Toast Container (Fixed Position) */}
      <div className="fixed top-4 right-4 z-[10000] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>

      {/* Confirmation Modal (Global Overlay) */}
      {modalState.isOpen && (
        <ConfirmModal
          isOpen={modalState.isOpen}
          title={modalState.title}
          message={modalState.message}
          type={modalState.type}
          confirmText={modalState.options.confirmText}
          cancelText={modalState.options.cancelText}
          onConfirm={handleModalConfirm}
          onCancel={handleModalCancel}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextData => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Also export a standalone nice wrapper if needed
export const toast = {
  success: (msg: string) => { }, // Needs context access, usually done via hook
};