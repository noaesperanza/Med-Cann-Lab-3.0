import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface ClinicalReport {
    id: string
    patient_id: string
    patient_name: string
    report_type: string
    protocol: string
    generated_by: string
    generated_at: string
    status: string
    content: any
}

interface SavedDocument {
    id: string
    user_id: string
    patient_id: string
    document_type: string
    title: string
    summary: string
    metadata: any
    is_shared_with_patient: boolean
    created_at: string
    content?: any
}

export default function AssessmentAnalytics() {
    const { user } = useAuth()
    const [reports, setReports] = useState<ClinicalReport[]>([])
    const [documents, setDocuments] = useState<SavedDocument[]>([])
    const [selectedReport, setSelectedReport] = useState<ClinicalReport | null>(null)
    const [selectedDocument, setSelectedDocument] = useState<SavedDocument | null>(null)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState<'overview' | 'professional' | 'patient'>('overview')

    useEffect(() => {
        if (user?.type === 'admin') {
            loadData()
        }
    }, [user])

    async function loadData() {
        setLoading(true)
        try {
            // Carregar clinical_reports (visão profissional)
            const { data: reportsData, error: reportsError } = await supabase
                .from('clinical_reports')
                .select('*')
                .order('generated_at', { ascending: false })
                .limit(50)

            if (!reportsError && reportsData) {
                setReports(reportsData)
            }

            // Carregar ai_saved_documents (visão paciente)
            const { data: docsData, error: docsError } = await supabase
                .from('ai_saved_documents')
                .select('*')
                .eq('document_type', 'assessment_report')
                .order('created_at', { ascending: false })
                .limit(50)

            if (!docsError && docsData) {
                setDocuments(docsData as any)
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
        } finally {
            setLoading(false)
        }
    }

    if (user?.type !== 'admin') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
                    <h1 className="text-2xl font-bold text-red-600">⚠️ Acesso Negado</h1>
                    <p className="mt-4 text-gray-600">Esta página é exclusiva para administradores.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                📊 Análise de Avaliações AEC
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Visualização de relatórios salvos (Profissional vs Paciente)
                            </p>
                        </div>
                        <button
                            onClick={loadData}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
                        >
                            🔄 Atualizar
                        </button>
                    </div>

                    {/* Métricas Rápidas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-6">
                            <div className="text-sm text-purple-600 font-semibold mb-2">
                                📋 Relatórios Profissionais
                            </div>
                            <div className="text-3xl font-bold text-purple-900">{reports.length}</div>
                            <div className="text-xs text-purple-600 mt-2">
                                Tabela: clinical_reports
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-6">
                            <div className="text-sm text-blue-600 font-semibold mb-2">
                                📄 Documentos Pacientes
                            </div>
                            <div className="text-3xl font-bold text-blue-900">{documents.length}</div>
                            <div className="text-xs text-blue-600 mt-2">
                                Tabela: ai_saved_documents
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-6">
                            <div className="text-sm text-green-600 font-semibold mb-2">
                                ✅ Taxa de Compartilhamento
                            </div>
                            <div className="text-3xl font-bold text-green-900">
                                {documents.length > 0
                                    ? Math.round((documents.filter(d => d.is_shared_with_patient).length / documents.length) * 100)
                                    : 0}%
                            </div>
                            <div className="text-xs text-green-600 mt-2">
                                is_shared_with_patient: true
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-xl p-2 mb-8">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTab('overview')}
                            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${tab === 'overview'
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            📊 Visão Geral
                        </button>
                        <button
                            onClick={() => setTab('professional')}
                            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${tab === 'professional'
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            👨‍⚕️ Visão Profissional
                        </button>
                        <button
                            onClick={() => setTab('patient')}
                            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${tab === 'patient'
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            🧑‍🦰 Visão Paciente
                        </button>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Carregando dados...</p>
                    </div>
                ) : (
                    <>
                        {/* Overview Tab */}
                        {tab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Últimos Relatórios */}
                                <div className="bg-white rounded-2xl shadow-xl p-6">
                                    <h2 className="text-xl font-bold text-purple-900 mb-4">
                                        📋 Últimos Relatórios Profissionais
                                    </h2>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {reports.slice(0, 10).map((report) => (
                                            <div
                                                key={report.id}
                                                onClick={() => setSelectedReport(report)}
                                                className="p-4 border border-purple-200 rounded-xl hover:bg-purple-50 cursor-pointer transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-semibold text-purple-900">
                                                        {report.patient_name || 'Sem nome'}
                                                    </div>
                                                    <div className="text-xs text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                                                        {report.protocol}
                                                    </div>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {new Date(report.generated_at).toLocaleString('pt-BR')}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    ID: {report.id.substring(0, 20)}...
                                                </div>
                                            </div>
                                        ))}
                                        {reports.length === 0 && (
                                            <div className="text-center text-gray-500 py-8">
                                                Nenhum relatório encontrado
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Últimos Documentos */}
                                <div className="bg-white rounded-2xl shadow-xl p-6">
                                    <h2 className="text-xl font-bold text-blue-900 mb-4">
                                        📄 Últimos Documentos Pacientes
                                    </h2>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {documents.slice(0, 10).map((doc) => (
                                            <div
                                                key={doc.id}
                                                onClick={() => setSelectedDocument(doc)}
                                                className="p-4 border border-blue-200 rounded-xl hover:bg-blue-50 cursor-pointer transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-semibold text-blue-900 text-sm">
                                                        {doc.title}
                                                    </div>
                                                    {doc.is_shared_with_patient && (
                                                        <div className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full">
                                                            ✅ Compartilhado
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-600 line-clamp-2">
                                                    {doc.summary}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-2">
                                                    {new Date(doc.created_at).toLocaleString('pt-BR')}
                                                </div>
                                            </div>
                                        ))}
                                        {documents.length === 0 && (
                                            <div className="text-center text-gray-500 py-8">
                                                Nenhum documento encontrado
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Professional Tab */}
                        {tab === 'professional' && (
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <h2 className="text-2xl font-bold text-purple-900 mb-6">
                                    👨‍⚕️ Como o Profissional Vê (clinical_reports)
                                </h2>
                                {selectedReport ? (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <button
                                                onClick={() => setSelectedReport(null)}
                                                className="text-purple-600 hover:text-purple-800"
                                            >
                                                ← Voltar
                                            </button>
                                            <div className="text-sm text-gray-600">
                                                ID: {selectedReport.id}
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-purple-50 p-4 rounded-xl">
                                                <div className="text-xs text-purple-600 mb-1">Paciente</div>
                                                <div className="font-semibold text-purple-900">
                                                    {selectedReport.patient_name}
                                                </div>
                                            </div>
                                            <div className="bg-purple-50 p-4 rounded-xl">
                                                <div className="text-xs text-purple-600 mb-1">Protocolo</div>
                                                <div className="font-semibold text-purple-900">
                                                    {selectedReport.protocol}
                                                </div>
                                            </div>
                                            <div className="bg-purple-50 p-4 rounded-xl">
                                                <div className="text-xs text-purple-600 mb-1">Tipo</div>
                                                <div className="font-semibold text-purple-900">
                                                    {selectedReport.report_type}
                                                </div>
                                            </div>
                                            <div className="bg-purple-50 p-4 rounded-xl">
                                                <div className="text-xs text-purple-600 mb-1">Status</div>
                                                <div className="font-semibold text-purple-900">
                                                    {selectedReport.status}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="bg-gray-50 p-6 rounded-xl">
                                            <h3 className="font-bold text-gray-900 mb-4">📋 Conteúdo Estruturado:</h3>
                                            <pre className="text-xs bg-white p-4 rounded-lg overflow-x-auto border border-gray-200">
                                                {JSON.stringify(selectedReport.content, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-12">
                                        Selecione um relatório na aba "Visão Geral"
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Patient Tab */}
                        {tab === 'patient' && (
                            <div className="bg-white rounded-2xl shadow-xl p-6">
                                <h2 className="text-2xl font-bold text-blue-900 mb-6">
                                    🧑‍🦰 Como o Paciente Vê (ai_saved_documents)
                                </h2>
                                {selectedDocument ? (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <button
                                                onClick={() => setSelectedDocument(null)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                ← Voltar
                                            </button>
                                            <div className="text-sm text-gray-600">
                                                ID: {selectedDocument.id}
                                            </div>
                                        </div>

                                        {/* Document Card (como paciente veria) */}
                                        <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-2xl font-bold text-blue-900">
                                                    {selectedDocument.title}
                                                </h3>
                                                {selectedDocument.is_shared_with_patient && (
                                                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
                                                        ✅ Compartilhado com você
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-white p-6 rounded-xl mb-4">
                                                <h4 className="font-semibold text-gray-900 mb-2">📝 Resumo:</h4>
                                                <p className="text-gray-700">{selectedDocument.summary}</p>
                                            </div>

                                            <div className="bg-white p-6 rounded-xl">
                                                <h4 className="font-semibold text-gray-900 mb-2">📊 Detalhes:</h4>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <div>
                                                        <strong>Data:</strong>{' '}
                                                        {new Date(selectedDocument.created_at).toLocaleString('pt-BR')}
                                                    </div>
                                                    <div>
                                                        <strong>Tipo:</strong> {selectedDocument.document_type}
                                                    </div>
                                                    {selectedDocument.metadata && (
                                                        <div>
                                                            <strong>Protocolo:</strong> {selectedDocument.metadata.protocol || 'N/A'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Conteúdo (opcional, colapsado) */}
                                            <details className="mt-4">
                                                <summary className="cursor-pointer text-blue-600 font-semibold hover:text-blue-800">
                                                    Ver conteúdo completo
                                                </summary>
                                                <div className="bg-gray-50 p-4 rounded-xl mt-2">
                                                    <pre className="text-xs overflow-x-auto">
                                                        {selectedDocument.content}
                                                    </pre>
                                                </div>
                                            </details>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-12">
                                        Selecione um documento na aba "Visão Geral"
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
