import React, { useState } from 'react'
import { X, Save, User, Mail, Phone, FileText, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface CreatePatientModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export const CreatePatientModal: React.FC<CreatePatientModalProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        cpf: ''
    })

    if (!isOpen) return null

    const modalStyle = {
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(148, 163, 184, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (!formData.name) {
                throw new Error('O nome do paciente é obrigatório.')
            }

            // Criar usuário na tabela users
            // Nota: Em um fluxo ideal, criaríamos via Auth Admin, mas aqui criamos o registro 'perfil'
            // para permitir agendamento. O auth real pode vir depois.
            // Precisamos gerar um UUID se o banco não gerar (mas geralmente o banco gera ou o client gera)
            // Vamos tentar insert sem ID para ver se o default gen_random_uuid() funciona, ou gerar um fake se for mock.
            // Assumindo Supabase real:

            const { data, error: insertError } = await supabase
                .from('users')
                .insert({
                    full_name: formData.name,
                    email: formData.email || null,
                    phone: formData.phone || null,
                    cpf: formData.cpf || null,
                    type: 'paciente',
                    created_at: new Date().toISOString()
                } as any)
                .select()
                .single()

            if (insertError) throw insertError

            onSuccess()
            onClose()
            setFormData({ name: '', email: '', phone: '', cpf: '' })
        } catch (err: any) {
            console.error('Erro ao criar paciente:', err)
            setError(err.message || 'Falha ao criar paciente. Verifique os dados.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
                style={modalStyle}
            >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-emerald-400" />
                        Novo Paciente
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Nome Completo *</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                placeholder="Ex: João da Silva"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                placeholder="Ex: joao@email.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Telefone</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">CPF</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={formData.cpf}
                                    onChange={e => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                    placeholder="000.000.000-00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Salvar Paciente
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
