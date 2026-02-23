
import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * PaymentGuard (Paywall)
 * 
 * Este componente bloqueia o acesso de pacientes com status de pagamento 'pending'.
 * Eles são forçados a ir para a página de checkout.
 * 
 * Regras:
 * 1. Se não for paciente, libera.
 * 2. Se for paciente 'paid' ou 'exempt', libera.
 * 3. Se for paciente 'pending', bloqueia (exceto rotas de pagamento).
 */
const PaymentGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth()
    const location = useLocation()
    const [isChecking, setIsChecking] = useState(true)

    // Rotas permitidas mesmo sem pagamento (todas as rotas de app são /app/...)
    const allowedPathnames = [
        '/app/checkout',
        '/app/subscription-plans',
        '/app/profile',
        '/termos-lgpd'
    ]

    useEffect(() => {
        if (!isLoading) {
            setIsChecking(false)
        }
    }, [isLoading])

    if (isLoading || isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                    <p className="text-slate-400 text-sm">Verificando status de assinatura...</p>
                </div>
            </div>
        )
    }

    // Se não tiver usuário, deixa o AuthContext ou ProtectedRoute lidar
    if (!user) return <>{children}</>

    // Admin, profissional e aluno: sempre acesso livre
    if (user.type !== 'paciente') {
        return <>{children}</>
    }

    // Lógica do Paywall (apenas pacientes)
    if (user.type === 'paciente') {
        const paymentStatus = (user as any).payment_status || 'pending'
        const trialEndsAt = (user as any).trial_ends_at ? new Date((user as any).trial_ends_at) : null
        const isInTrial = trialEndsAt && new Date() < trialEndsAt // 3 dias grátis

        // Se for exempt ou paid: acesso total
        if (paymentStatus === 'paid' || paymentStatus === 'exempt') {
            return <>{children}</>
        }

        // Se estiver pendente E fora do trial E tentar acessar rota protegida → checkout
        if (paymentStatus === 'pending' && !isInTrial && !allowedPathnames.includes(location.pathname)) {
            console.warn('🔒 Paywall Ativado: Paciente pendente tentando acessar', location.pathname)
            return <Navigate to="/app/checkout" replace />
        }
    }

    return <>{children}</>
}

export default PaymentGuard
