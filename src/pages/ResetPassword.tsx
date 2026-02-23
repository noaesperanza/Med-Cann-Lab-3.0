import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Brain } from 'lucide-react'

const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    // Supabase detecta automaticamente o token de recovery na URL (hash)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true)
        setCheckingSession(false)
      } else if (event === 'SIGNED_IN' && session) {
        // Pode chegar como SIGNED_IN dependendo da versão do SDK
        setIsValidSession(true)
        setCheckingSession(false)
      }
    })

    // Timeout de segurança para não ficar travado
    const timeout = setTimeout(() => {
      setCheckingSession(false)
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!password || !confirmPassword) {
      setError('Preencha todos os campos.')
      return
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem.')
      return
    }

    setIsLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => navigate('/'), 3000)
    } catch (err: any) {
      setError(err?.message || 'Erro ao redefinir senha. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1a365d 50%, #2d5a3d 100%)' }}>
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1a365d 50%, #2d5a3d 100%)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-green-500/30 flex items-center justify-center">
            <Brain className="w-6 h-6 text-green-400" />
          </div>
          <span className="text-xl font-bold text-white">MedCannLab</span>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Senha redefinida!</h2>
              <p className="text-slate-400">Sua senha foi atualizada com sucesso. Redirecionando para a página inicial...</p>
            </div>
          ) : !isValidSession ? (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">Link inválido ou expirado</h2>
              <p className="text-slate-400 text-sm">Este link de recuperação pode ter expirado. Solicite um novo link na página inicial.</p>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-3 font-semibold hover:opacity-90 transition-all"
              >
                Voltar ao início
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">Redefinir senha</h2>
              <p className="text-slate-400 text-sm mb-6">Digite sua nova senha abaixo.</p>

              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Nova senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    placeholder="Mínimo 6 caracteres"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Confirmar nova senha</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    placeholder="Repita a nova senha"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-3 font-semibold hover:shadow-lg hover:shadow-green-500/20 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Salvando...' : 'Salvar nova senha'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
