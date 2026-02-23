import React, { Component, ErrorInfo, ReactNode } from 'react'
import { useToast } from '../contexts/ToastContext'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ ErrorBoundary capturou um erro:', error)
    console.error('❌ ErrorInfo:', errorInfo)

    this.setState({
      error,
      errorInfo
    })

    // Tentar mostrar toast se disponível
    try {
      // Toast será mostrado pelo componente wrapper
    } catch (e) {
      console.error('Erro ao mostrar toast:', e)
    }
  }

  handleReload = () => {
    // Limpar localStorage problemático
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('sb-') && key.includes('auth-token')) {
          localStorage.removeItem(key)
        }
      })
    } catch (e) {
      console.error('Erro ao limpar localStorage:', e)
    }

    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
          <div className="max-w-md w-full bg-slate-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Ops! Algo deu errado
            </h1>

            <p className="text-slate-300 text-center mb-6">
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-4 p-3 bg-slate-900 rounded text-xs text-red-400 overflow-auto max-h-32">
                <p className="font-mono">{this.state.error.message}</p>
                {this.state.error.stack && (
                  <pre className="mt-2 text-xs">{this.state.error.stack.split('\n').slice(0, 5).join('\n')}</pre>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Recarregar Página
              </button>

              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null })
                }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrapper com Toast
const ErrorBoundary: React.FC<Props> = ({ children, fallback }) => {
  const { error: notifyError } = useToast()

  return (
    <ErrorBoundaryClass
      fallback={fallback}
      children={children}
    />
  )
}

export default ErrorBoundary

