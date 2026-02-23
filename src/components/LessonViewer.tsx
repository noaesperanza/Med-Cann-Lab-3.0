import React, { useState, useEffect, useRef } from 'react'
import {
    ArrowLeft,
    Clock,
    Star,
    Download,
    FileText,
    Video,
    CheckCircle,
    ThumbsUp,
    ThumbsDown,
    MessageCircle,
    Send,
    ChevronDown,
    ChevronUp,
    Loader2,
    Play,
    Award
} from 'lucide-react'
import { useNoa } from '../contexts/NoaContext'
import NoaEsperancaAvatar from './NoaEsperancaAvatar'

interface LessonViewerProps {
    lessonId: string
    title: string
    moduleName?: string
    videoUrl?: string          // YouTube URL ou URL de vídeo
    pdfUrl?: string            // URL para download de PDF
    slidesUrl?: string         // URL para download de slides
    content?: string           // Conteúdo em texto/markdown
    duration?: string          // Ex: "45min"
    points?: number            // Pontos da aula
    isCompleted?: boolean      // Se já foi concluída
    onComplete?: () => void    // Callback ao completar
    onBack?: () => void        // Callback para voltar
    courseContext?: string     // Contexto para o chat Nôa
}

const LessonViewer: React.FC<LessonViewerProps> = ({
    lessonId,
    title,
    moduleName,
    videoUrl,
    pdfUrl,
    slidesUrl,
    content,
    duration = '0min',
    points = 50,
    isCompleted = false,
    onComplete,
    onBack,
    courseContext = ''
}) => {
    const [completed, setCompleted] = useState(isCompleted)
    const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null)
    const [chatOpen, setChatOpen] = useState(true)  // Iniciar aberto
    const [chatInput, setChatInput] = useState('')
    const chatEndRef = useRef<HTMLDivElement>(null)

    // Usar o contexto real da Nôa
    const { messages: noaMessages, sendMessage, isTyping: noaChatLoading } = useNoa()

    // Scroll to bottom quando novas mensagens chegam
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [noaMessages])

    // Extrair video ID do YouTube se for uma URL do YouTube
    const getYouTubeEmbedUrl = (url: string): string | null => {
        if (!url) return null

        // Padrões de URL do YouTube
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
            /youtube\.com\/watch\?.*v=([^&\s]+)/
        ]

        for (const pattern of patterns) {
            const match = url.match(pattern)
            if (match && match[1]) {
                return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`
            }
        }

        // Se já for uma URL de embed, retornar como está
        if (url.includes('youtube.com/embed/')) {
            return url
        }

        return null
    }

    const handleComplete = () => {
        setCompleted(true)
        onComplete?.()
    }

    const handleFeedback = (type: 'like' | 'dislike') => {
        setFeedback(type)
        // TODO: Salvar feedback no banco
    }

    const handleSendChat = async () => {
        if (!chatInput.trim() || noaChatLoading) return
        const userMessage = chatInput.trim()
        setChatInput('')
        // Enviar para a Nôa real com contexto da aula
        const contextPrefix = `[Contexto: Aula "${title}"${moduleName ? `, módulo "${moduleName}"` : ''}] `
        sendMessage(contextPrefix + userMessage)
    }

    const youtubeEmbedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="hidden sm:inline">Voltar</span>
                            </button>
                            <div className="h-6 w-px bg-slate-700" />
                            <div>
                                {moduleName && (
                                    <p className="text-xs text-primary-400 uppercase tracking-wider">{moduleName}</p>
                                )}
                                <h1 className="text-lg sm:text-xl font-semibold text-white truncate max-w-[200px] sm:max-w-none">
                                    {title}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Pontos */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full">
                                <Award className="w-4 h-4 text-amber-400" />
                                <span className="text-sm font-semibold text-amber-300">{points} pts</span>
                            </div>

                            {/* Duração */}
                            <div className="hidden sm:flex items-center gap-2 text-slate-400">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{duration}</span>
                            </div>

                            {/* Status */}
                            {completed && (
                                <div className="flex items-center gap-1.5 text-primary-400">
                                    <CheckCircle className="w-5 h-5" />
                                    <span className="hidden sm:inline text-sm">Concluída</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6 pb-32">
                {/* Video Player */}
                {youtubeEmbedUrl ? (
                    <div className="mb-6 max-w-4xl mx-auto">
                        <div className="relative w-full aspect-video max-h-[480px] bg-slate-800 rounded-xl overflow-hidden border border-slate-700/50 shadow-xl">
                            <iframe
                                src={youtubeEmbedUrl}
                                title={title}
                                className="absolute inset-0 w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                ) : videoUrl ? (
                    <div className="mb-6 max-w-4xl mx-auto">
                        <div className="relative w-full aspect-video max-h-[480px] bg-slate-800 rounded-xl overflow-hidden border border-slate-700/50 shadow-xl">
                            <video
                                src={videoUrl}
                                controls
                                className="absolute inset-0 w-full h-full"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="mb-6 max-w-4xl mx-auto">
                        <div className="w-full aspect-video max-h-[480px] bg-slate-800/50 rounded-xl border border-dashed border-slate-600 flex flex-col items-center justify-center">
                            <Video className="w-16 h-16 text-slate-600 mb-4" />
                            <p className="text-slate-500 text-lg">Vídeo não disponível</p>
                            <p className="text-slate-600 text-sm mt-1">O instrutor ainda não adicionou um vídeo para esta aula</p>
                        </div>
                    </div>
                )}

                {/* Downloads */}
                {(pdfUrl || slidesUrl) && (
                    <div className="mb-6 flex flex-wrap gap-3">
                        {pdfUrl && (
                            <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                            >
                                <Download className="w-4 h-4 text-red-400" />
                                <span className="text-sm font-medium">Material PDF</span>
                            </a>
                        )}
                        {slidesUrl && (
                            <a
                                href={slidesUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
                            >
                                <FileText className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium">Slides</span>
                            </a>
                        )}
                    </div>
                )}

                {/* Noa Chat - Primary interaction area */}
                <div className="mb-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                    {/* Chat Header */}
                    <button
                        onClick={() => setChatOpen(!chatOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-primary-400" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-white">Nôa Esperança</p>
                                <p className="text-xs text-slate-400">Tire dúvidas sobre esta aula</p>
                            </div>
                        </div>
                        {chatOpen ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                    </button>

                    {/* Chat Body */}
                    {chatOpen && (
                        <div className="border-t border-slate-700/50">
                            <div className="h-80 overflow-y-auto px-4 py-3 space-y-3">
                                {noaMessages.length === 0 && (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <MessageCircle className="w-6 h-6 text-primary-400" />
                                        </div>
                                        <p className="text-slate-400 text-sm">
                                            Olá! Sou a Nôa, posso ajudar com dúvidas sobre esta aula.
                                        </p>
                                        <p className="text-slate-500 text-xs mt-1">
                                            Digite sua pergunta abaixo para começar.
                                        </p>
                                    </div>
                                )}
                                {noaMessages.map((msg, idx) => (
                                    <div key={msg.id || idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        {msg.type === 'noa' && (
                                            <div className="w-8 h-8 mr-2 flex-shrink-0">
                                                <NoaEsperancaAvatar />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${msg.type === 'user'
                                                ? 'bg-primary-500 text-white rounded-br-md'
                                                : 'bg-slate-700 text-slate-200 rounded-bl-md'
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {noaChatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-slate-700 px-4 py-2 rounded-2xl rounded-bl-md">
                                            <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                        placeholder="Digite sua dúvida..."
                                        className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-sm"
                                    />
                                    <button
                                        onClick={handleSendChat}
                                        disabled={!chatInput.trim() || noaChatLoading}
                                        className="p-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition-colors"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-400">O conteúdo foi útil?</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleFeedback('like')}
                                className={`p-2 rounded-lg transition-all ${feedback === 'like'
                                    ? 'bg-primary-500/20 text-primary-400 ring-2 ring-primary-500/30'
                                    : 'bg-slate-700 text-slate-400 hover:text-primary-400 hover:bg-slate-600'
                                    }`}
                            >
                                <ThumbsUp className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => handleFeedback('dislike')}
                                className={`p-2 rounded-lg transition-all ${feedback === 'dislike'
                                    ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/30'
                                    : 'bg-slate-700 text-slate-400 hover:text-red-400 hover:bg-slate-600'
                                    }`}
                            >
                                <ThumbsDown className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                        >
                            Voltar
                        </button>
                        {!completed && (
                            <button
                                onClick={handleComplete}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary-500/20"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Marcar como Concluída
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LessonViewer
