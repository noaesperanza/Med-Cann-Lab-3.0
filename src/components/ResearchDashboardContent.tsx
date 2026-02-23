import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
    CheckCircle,
    BookOpen,
    GraduationCap,
    Eye,
    Download,
    Share2,
    Plus,
    FlaskConical,
    Link as Link2
} from 'lucide-react'

// Tipo para estudos de pesquisa
interface ResearchStudy {
    id: string
    title: string
    description: string
    status: string
    progress: number
    participants: number
    startDate: string
    endDate: string
    color: string
}

const ResearchDashboardContent: React.FC = () => {
    const navigate = useNavigate()
    const [showAllStudies, setShowAllStudies] = useState(false)
    const [researchData, setResearchData] = useState<ResearchStudy[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Carregar estudos do Supabase (tabela courses com categoria 'Pesquisa')
    useEffect(() => {
        const loadStudies = async () => {
            setIsLoading(true)
            try {
                // Por enquanto, usar a tabela courses como base para estudos de pesquisa
                // Futuramente pode ser criada uma tabela específica 'research_studies'
                const { data, error } = await supabase
                    .from('courses')
                    .select('id, title, description, category, created_at, updated_at')
                    .eq('category', 'Pesquisa')
                    .order('created_at', { ascending: false })

                if (error) {
                    console.warn('Erro ao carregar estudos:', error)
                    setResearchData([])
                } else if (data && data.length > 0) {
                    // Mapear cursos de pesquisa para formato de estudos
                    const studies: ResearchStudy[] = data.map((course: any, index: number) => ({
                        id: course.id,
                        title: course.title,
                        description: course.description || 'Estudo em andamento',
                        status: index === 0 ? 'Em Andamento' : 'Planejado',
                        progress: Math.floor(Math.random() * 60) + 20, // Temporário até ter campo real
                        participants: Math.floor(Math.random() * 50) + 10, // Temporário
                        startDate: course.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                        endDate: course.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                        color: 'from-[#00c16a] to-[#00a85a]'
                    }))
                    setResearchData(studies)
                } else {
                    setResearchData([])
                }
            } catch (err) {
                console.error('Erro ao carregar estudos:', err)
                setResearchData([])
            } finally {
                setIsLoading(false)
            }
        }
        loadStudies()
    }, [])

    // Mostrar apenas estudos ativos inicialmente, ou todos se showAllStudies for true
    const displayedStudies = showAllStudies ? researchData : researchData.filter(study => study.status !== 'Concluído')

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Em Andamento': return 'text-blue-400'
            case 'Análise': return 'text-yellow-400'
            case 'Concluído': return 'text-green-400'
            case 'Pendente': return 'text-slate-400'
            default: return 'text-slate-400'
        }
    }

    const getProgressColor = (progress: number) => {
        if (progress >= 80) return 'bg-green-500'
        if (progress >= 50) return 'bg-blue-500'
        return 'bg-yellow-500'
    }

    return (
        <div className="max-w-7xl mx-auto w-full overflow-x-hidden p-4 md:p-6">
            {/* Destaque MedCann Lab */}
            <div className="rounded-2xl border border-[#00C16A]/20 bg-gradient-to-br from-[#0A192F] via-[#102C45] to-[#1F4B38] p-6 md:p-8 shadow-xl mb-6 md:mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center shadow-lg" style={{
                            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f3a3a 100%)',
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(0, 193, 106, 0.2)'
                        }}>
                            <img
                                src="/brain.png"
                                alt="MedCann Lab"
                                className="w-10 h-10 object-contain"
                                style={{ filter: 'brightness(1.1) contrast(1.1) drop-shadow(0 0 6px rgba(0, 193, 106, 0.6))' }}
                            />
                        </div>
                        <div>
                            <p className="text-[11px] uppercase tracking-[0.35em] text-[#00C16A] mb-2">MedCann Lab</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white">Integração Cannabis &amp; Nefrologia</h2>
                            <p className="text-sm md:text-base text-[#C8D6E5] mt-3 max-w-3xl">
                                Pesquisa pioneira conectando ensino, clínica e pesquisa para mapear benefícios terapêuticos da cannabis medicinal,
                                avaliando impactos na função renal com apoio da metodologia AEC.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/app/pesquisa/profissional/cidade-amiga-dos-rins')}
                        className="self-start lg:self-center bg-gradient-to-r from-[#00C16A] to-[#1a365d] text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                    >
                        Explorar Projeto
                    </button>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            title: 'Protocolos de prescrição AEC',
                            description: 'Fluxos clínicos padronizados pela metodologia de anamnese AEC',
                        },
                        {
                            title: 'Monitoramento de função renal',
                            description: 'KPIs nefrológicos integrados ao prontuário avaliados em tempo real',
                        },
                        {
                            title: 'Deep Learning em biomarcadores',
                            description: 'Modelos que correlacionam exames laboratoriais e evolução clínica',
                        },
                        {
                            title: 'Integração com dispositivos médicos',
                            description: 'Wearables e equipamentos enviando dados contínuos para o LabPec',
                        },
                    ].map((item) => (
                        <div key={item.title} className="bg-[#0F243C]/70 border border-[#00C16A]/10 rounded-lg p-4 flex items-start space-x-3">
                            <CheckCircle className="w-4 h-4 text-[#00C16A] mt-1" />
                            <div>
                                <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                                <p className="text-xs text-[#9FB3C6] leading-relaxed">{item.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Conexões entre Cursos e Dados Clínicos */}
            <div className="bg-slate-800 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
                    <Link2 className="w-6 h-6 text-purple-400" />
                    <span>Integrações e Conexões</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full overflow-x-hidden">
                    {/* Arte da Entrevista Clínica + Dados */}
                    <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-lg p-4 md:p-6 border border-blue-500/20 overflow-hidden w-full max-w-full">
                        <div className="flex items-center space-x-3 mb-4">
                            <BookOpen className="w-8 h-8 text-blue-400" />
                            <div>
                                <h4 className="text-lg font-semibold text-white">Arte da Entrevista Clínica</h4>
                                <p className="text-sm text-gray-400">Metodologia AEC aplicada</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-300">Casos com AEC aplicada:</span>
                                <span className="text-blue-400 font-semibold">89 casos</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-300">Profissionais certificados:</span>
                                <span className="text-blue-400 font-semibold">34</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-300">Dados clínicos correlacionados:</span>
                                <span className="text-blue-400 font-semibold">156</span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/app/arte-entrevista-clinica')}
                            className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
                        >
                            Acessar Curso
                        </button>
                    </div>

                    {/* Cannabis Medicinal + Dados */}
                    <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 rounded-lg p-6 border border-green-500/20">
                        <div className="flex items-center space-x-3 mb-4">
                            <GraduationCap className="w-8 h-8 text-green-400" />
                            <div>
                                <h4 className="text-lg font-semibold text-white">Pós-Graduação Cannabis Medicinal</h4>
                                <p className="text-sm text-gray-400">Dr. Eduardo Faveret</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-300">Pacientes em protocolos:</span>
                                <span className="text-green-400 font-semibold">124</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-300">Alunos aplicando conhecimento:</span>
                                <span className="text-green-400 font-semibold">856</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-300">Estudos baseados no curso:</span>
                                <span className="text-green-400 font-semibold">3 estudos</span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/curso-eduardo-faveret')}
                            className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                        >
                            Acessar Curso
                        </button>
                    </div>
                </div>
            </div>

            {/* Research Studies */}
            <div className="bg-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">🔬 Meus Estudos</h3>
                    <button
                        onClick={() => setShowAllStudies(!showAllStudies)}
                        className="bg-gradient-to-r from-[#00c16a] to-[#00a85a] text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-colors"
                    >
                        {showAllStudies ? 'Ver Ativos' : `Ver Todos (${researchData.length})`}
                    </button>
                </div>

                <div className="space-y-6">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-slate-400">Carregando estudos...</p>
                        </div>
                    ) : displayedStudies.length === 0 ? (
                        <div className="text-center py-12 bg-slate-700/50 rounded-xl border border-slate-600">
                            <FlaskConical className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <h4 className="text-lg text-slate-300 mb-2">Nenhum estudo cadastrado</h4>
                            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                                Comece a criar estudos de pesquisa para acompanhar o progresso dos seus projetos clínicos.
                            </p>
                            <button
                                onClick={() => navigate('/app/pesquisa/profissional/cidade-amiga-dos-rins')}
                                className="bg-gradient-to-r from-[#00c16a] to-[#00a85a] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Explorar Projeto Cidade Amiga dos Rins
                            </button>
                        </div>
                    ) : (
                        displayedStudies.map((study) => (
                            <div key={study.id} className="bg-slate-700 rounded-lg p-4 md:p-6 hover:bg-slate-650 transition-colors overflow-hidden w-full max-w-full">
                                <div className="flex items-start justify-between mb-4 gap-2 flex-wrap">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                                            <h4 className="text-lg font-semibold text-white break-words flex-1 min-w-0">{study.title}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(study.status)}`}>
                                                {study.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 mb-3 break-words">{study.description}</p>

                                        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 mb-4">
                                            <span className="whitespace-nowrap">Participantes: {study.participants}</span>
                                            <span className="whitespace-nowrap">Início: {study.startDate}</span>
                                            <span className="whitespace-nowrap">Fim: {study.endDate}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 bg-slate-600 rounded-lg hover:bg-slate-500 transition-colors">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-2">
                                    <div className="flex items-center justify-between text-sm mb-1">
                                        <span className="text-slate-400">Progresso</span>
                                        <span className="text-white font-medium">{study.progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-600 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full ${getProgressColor(study.progress)}`}
                                            style={{ width: `${study.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {!showAllStudies && researchData.filter(study => study.status === 'Concluído').length > 0 && (
                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-400 mb-2">
                            {researchData.filter(study => study.status === 'Concluído').length} estudos concluídos não exibidos
                        </p>
                        <button
                            onClick={() => setShowAllStudies(true)}
                            className="text-pink-400 hover:text-pink-300 text-sm font-medium"
                        >
                            Ver estudos concluídos
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ResearchDashboardContent
