import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { UserPlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const InvitePatient: React.FC = () => {
    const [searchParams] = useSearchParams()
    const { user, isLoading } = useAuth()
    const navigate = useNavigate()
    const doctorId = searchParams.get('doctor_id')

    const [doctorName, setDoctorName] = useState<string | null>(null)
    const [status, setStatus] = useState<'loading' | 'confirm' | 'success' | 'error'>('loading')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    useEffect(() => {
        // Se não tiver ID do médico na URL, erro
        if (!doctorId) {
            setStatus('error')
            setErrorMessage('Link de convite inválido (ID do profissional ausente).')
            return
        }

        // Carregar dados do médico
        const loadDoctor = async () => {
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('name')
                    .eq('id', doctorId)
                    .single()

                if (error || !data) {
                    throw new Error('Profissional não encontrado.')
                }

                setDoctorName(data.name)
                setStatus('confirm')
            } catch (err: any) {
                setStatus('error')
                setErrorMessage(err.message || 'Erro ao buscar dados do profissional.')
            }
        }

        loadDoctor()
    }, [doctorId])

    const handleConnect = async () => {
        if (!user || !doctorId) return

        setStatus('loading')
        try {
            // Usar a RPC corrigida para criar a conexão (sala de chat)
            const { data, error } = await supabase.rpc('create_chat_room_for_patient_uuid', {
                p_patient_id: user.id,
                p_professional_id: doctorId
            })

            if (error) throw error

            setStatus('success')

            // Redirecionar para o chat após 2 segundos
            setTimeout(() => {
                navigate('/app/clinica/paciente/chat?roomId=' + data)
            }, 2000)

        } catch (err: any) {
            console.error('Erro ao conectar via convite:', err)
            setStatus('error')
            setErrorMessage(err.message || 'Falha ao criar conexão.')
        }
    }

    // Se não estiver logado, redirecionar para login mantendo a URL de retorno
    if (!isLoading && !user) {
        // Redirecionar para login
        // A lógica de AuthContext geralmente lida com redirecionamento se protegida, 
        // mas se essa for uma rota pública, precisamos forçar login.
        // Vamos assumir que o usuário deve fazer login/cadastro.
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
                <div className="bg-slate-800 p-8 rounded-xl max-w-md w-full text-center border border-slate-700 shadow-2xl">
                    <UserPlus className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Convite para Conexão</h2>
                    <p className="text-slate-300 mb-6">
                        Você foi convidado para se conectar com <strong>{doctorName || 'um profissional'}</strong> no MedCannLab.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate(`/login?redirectTo=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                            Fazer Login
                        </button>
                        <button
                            onClick={() => navigate(`/register?redirectTo=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                            Criar Nova Conta
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="bg-slate-900 p-8 rounded-xl max-w-md w-full border border-slate-800 shadow-2xl">
                {status === 'loading' && (
                    <div className="text-center py-8">
                        <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-300">Processando convite...</p>
                    </div>
                )}

                {status === 'confirm' && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <UserPlus className="w-8 h-8 text-primary-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Conectar com Profissional</h2>
                        <p className="text-slate-300 mb-6">
                            Deseja se conectar com <strong>Dr(a). {doctorName}</strong> e iniciar seu acompanhamento?
                        </p>
                        <p className="text-xs text-slate-500 mb-8 bg-slate-800 p-3 rounded-lg">
                            Isso criará um canal de chat direto para que vocês possam se comunicar.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/app/clinica/paciente/dashboard')}
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConnect}
                                className="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-500 transition-colors"
                            >
                                Conectar Agora
                            </button>
                        </div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Conectado!</h2>
                        <p className="text-slate-300 mb-4">
                            Você está sendo redirecionado para o chat...
                        </p>
                        <Loader2 className="w-5 h-5 text-slate-500 animate-spin mx-auto" />
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Ops! Algo deu errado.</h2>
                        <p className="text-slate-300 mb-6">
                            {errorMessage}
                        </p>
                        <button
                            onClick={() => navigate('/app/clinica/paciente/dashboard')}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
                        >
                            Voltar ao Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default InvitePatient
