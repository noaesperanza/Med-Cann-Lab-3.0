import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import LessonViewer from '../components/LessonViewer'

const LessonPage: React.FC = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { courseId, moduleId, lessonId } = useParams()
    const [searchParams] = useSearchParams()

    const [lessonData, setLessonData] = useState<{
        title: string
        moduleName: string
        content: string
        videoUrl?: string
        pdfUrl?: string
        duration: string
        points: number
        isCompleted: boolean
        courseTitle: string
        courseInstructor: string
    } | null>(null)

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadLessonData()
    }, [courseId, moduleId, lessonId])

    const loadLessonData = async () => {
        try {
            setLoading(true)

            // Dados da URL
            const title = searchParams.get('title') || 'Aula'
            const moduleName = searchParams.get('module') || 'Módulo'
            const courseTitle = searchParams.get('course') || 'Curso'
            const courseInstructor = searchParams.get('instructor') || 'Instrutor'

            // Tentar buscar conteúdo do banco
            let content = ''

            try {
                // Buscar de noa_lessons
                const { data: noaLesson } = await (supabase as any)
                    .from('noa_lessons')
                    .select('content, video_url, pdf_url')
                    .eq('course_title', courseTitle)
                    .eq('module_title', moduleName)
                    .eq('lesson_title', title)
                    .single()

                if (noaLesson) {
                    content = noaLesson.content || ''
                }
            } catch (e) {
                // Tentar localStorage como fallback
                const storageKey = `lesson_${moduleId}_${lessonId}`
                content = localStorage.getItem(storageKey) || ''
            }

            setLessonData({
                title,
                moduleName,
                content: content || `# ${title}\n\nConteúdo da aula será exibido aqui.\n\n**Duração:** 45min\n**Tipo:** vídeo\n**Pontos:** 50`,
                videoUrl: undefined,
                pdfUrl: undefined,
                duration: '45min',
                points: 50,
                isCompleted: false,
                courseTitle,
                courseInstructor
            })
        } catch (error) {
            console.error('Erro ao carregar aula:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleComplete = async () => {
        // TODO: Marcar como concluída no banco
        console.log('Aula concluída:', lessonId)

        // Atualizar estado local
        if (lessonData) {
            setLessonData({ ...lessonData, isCompleted: true })
        }
    }

    const handleBack = () => {
        // Voltar para o curso
        navigate(-1)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-lg">Carregando aula...</div>
            </div>
        )
    }

    if (!lessonData) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-white text-lg">Aula não encontrada</div>
            </div>
        )
    }

    return (
        <LessonViewer
            lessonId={lessonId || ''}
            title={lessonData.title}
            moduleName={lessonData.moduleName}
            videoUrl={lessonData.videoUrl}
            pdfUrl={lessonData.pdfUrl}
            content={lessonData.content}
            duration={lessonData.duration}
            points={lessonData.points}
            isCompleted={lessonData.isCompleted}
            onComplete={handleComplete}
            onBack={handleBack}
            courseContext={`Curso: ${lessonData.courseTitle}. Instrutor: ${lessonData.courseInstructor}.`}
        />
    )
}

export default LessonPage
