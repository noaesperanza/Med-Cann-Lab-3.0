import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import LessonViewer from '../components/LessonViewer'

const LessonDetail: React.FC = () => {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [lesson, setLesson] = useState<any>(null)
  const [module, setModule] = useState<any>(null)
  const [lessonContent, setLessonContent] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (moduleId && lessonId) {
      loadLessonData()
    }
  }, [moduleId, lessonId])

  const loadLessonData = async () => {
    try {
      setLoading(true)

      // Tentar carregar do localStorage primeiro
      const storageKey = `lesson_${moduleId}_${lessonId}`
      const localContent = localStorage.getItem(storageKey)

      if (localContent) {
        setLessonContent(localContent)
      }

      // Buscar conteúdo do Supabase
      if (user) {
        try {
          const { data: lessonData, error } = await supabase
            .from('lesson_content')
            .select('*')
            .eq('module_id', moduleId)
            .eq('lesson_id', lessonId)
            .maybeSingle()

          if (!error && lessonData && lessonData.content) {
            setLessonContent(lessonData.content)
          }
        } catch (error) {
          console.warn('Erro ao buscar conteúdo da aula do Supabase:', error)
        }
      }

      // Carregar módulos mockados (mesmos do CursoEduardoFaveret)
      const mockModules: any[] = [
        {
          id: '1',
          title: 'Introdução à Cannabis Medicinal',
          description: 'Fundamentos históricos, legais e científicos da cannabis medicinal',
          duration: '8h',
          lessonCount: 4,
          lessons: [
            { id: '1-1', title: 'História da Cannabis Medicinal', type: 'video', duration: '45min', isCompleted: false, isLocked: false, points: 50 },
            { id: '1-2', title: 'Aspectos Legais e Regulamentação', type: 'video', duration: '60min', isCompleted: false, isLocked: false, points: 50 },
            { id: '1-3', title: 'Farmacologia Básica dos Canabinoides', type: 'reading', duration: '30min', isCompleted: false, isLocked: false, points: 30 },
            { id: '1-4', title: 'Quiz: Fundamentos', type: 'quiz', duration: '15min', isCompleted: false, isLocked: false, points: 40 }
          ]
        },
        {
          id: '2',
          title: 'Farmacologia e Biologia da Cannabis',
          description: 'Mecanismos de ação, receptores e sistemas endocanabinoides',
          duration: '12h',
          lessonCount: 6,
          lessons: [
            { id: '2-1', title: 'Sistema Endocanabinoide', type: 'video', duration: '60min', isCompleted: false, isLocked: false, points: 60 },
            { id: '2-2', title: 'Receptores CB1 e CB2', type: 'video', duration: '55min', isCompleted: false, isLocked: false, points: 55 },
            { id: '2-3', title: 'Metabolismo dos Canabinoides', type: 'video', duration: '50min', isCompleted: false, isLocked: false, points: 50 },
            { id: '2-4', title: 'Interações Farmacológicas', type: 'reading', duration: '45min', isCompleted: false, isLocked: false, points: 45 },
            { id: '2-5', title: 'Casos Clínicos: Farmacologia', type: 'assignment', duration: '90min', isCompleted: false, isLocked: false, points: 80 },
            { id: '2-6', title: 'Quiz: Farmacologia', type: 'quiz', duration: '30min', isCompleted: false, isLocked: false, points: 60 }
          ]
        },
        {
          id: '3',
          title: 'Aspectos Legais e Éticos',
          description: 'Regulamentação, prescrição e aspectos éticos do uso medicinal',
          duration: '6h',
          lessonCount: 3,
          lessons: [
            { id: '3-1', title: 'Regulamentação no Brasil', type: 'reading', duration: '60min', isCompleted: false, isLocked: false, points: 60 },
            { id: '3-2', title: 'Prescrição e Documentação', type: 'video', duration: '45min', isCompleted: false, isLocked: false, points: 45 },
            { id: '3-3', title: 'Aspectos Éticos', type: 'reading', duration: '30min', isCompleted: false, isLocked: false, points: 30 }
          ]
        },
        {
          id: '4',
          title: 'Aplicações Clínicas e Protocolos',
          description: 'Indicações clínicas, protocolos de tratamento e monitoramento',
          duration: '15h',
          lessonCount: 8,
          lessons: [
            { id: '4-1', title: 'Indicações Clínicas', type: 'video', duration: '60min', isCompleted: false, isLocked: false, points: 60 },
            { id: '4-2', title: 'Protocolos de Tratamento', type: 'video', duration: '75min', isCompleted: false, isLocked: false, points: 75 },
            { id: '4-3', title: 'Dosagem e Titulação', type: 'video', duration: '50min', isCompleted: false, isLocked: false, points: 50 },
            { id: '4-4', title: 'Monitoramento de Efeitos', type: 'video', duration: '45min', isCompleted: false, isLocked: false, points: 45 },
            { id: '4-5', title: 'Contraindicações', type: 'reading', duration: '40min', isCompleted: false, isLocked: false, points: 40 },
            { id: '4-6', title: 'Interações Medicamentosas', type: 'reading', duration: '50min', isCompleted: false, isLocked: false, points: 50 },
            { id: '4-7', title: 'Casos Clínicos Práticos', type: 'assignment', duration: '120min', isCompleted: false, isLocked: false, points: 100 },
            { id: '4-8', title: 'Quiz: Aplicações Clínicas', type: 'quiz', duration: '30min', isCompleted: false, isLocked: true, points: 60 }
          ]
        },
        {
          id: '5',
          title: 'Avaliação e Monitoramento de Pacientes',
          description: 'Ferramentas de avaliação, acompanhamento e ajuste de protocolos',
          duration: '8h',
          lessonCount: 4,
          lessons: [
            { id: '5-1', title: 'Escalas de Avaliação', type: 'video', duration: '60min', isCompleted: false, isLocked: true, points: 60 },
            { id: '5-2', title: 'Monitoramento de Efeitos Adversos', type: 'video', duration: '45min', isCompleted: false, isLocked: true, points: 45 },
            { id: '5-3', title: 'Ajuste de Protocolos', type: 'video', duration: '50min', isCompleted: false, isLocked: true, points: 50 },
            { id: '5-4', title: 'Relatórios e Documentação', type: 'reading', duration: '30min', isCompleted: false, isLocked: true, points: 30 }
          ]
        }
      ]

      // Buscar o módulo e a aula nos módulos mockados
      const foundModule = mockModules.find(m => m.id === moduleId)
      if (foundModule) {
        setModule(foundModule)
        const foundLesson = foundModule.lessons.find((l: any) => l.id === lessonId)
        if (foundLesson) {
          setLesson(foundLesson)
          if (!lessonContent) {
            setLessonContent(`# ${foundLesson.title}\n\nConteúdo da aula será exibido aqui.\n\n**Duração:** ${foundLesson.duration}\n**Tipo:** ${foundLesson.type}\n**Pontos:** ${foundLesson.points}`)
          }
        } else {
          setLesson({ id: lessonId, title: `Aula ${lessonId}`, type: 'video', duration: '45min', isCompleted: false, isLocked: false, points: 50 })
          if (!lessonContent) {
            setLessonContent(`# Aula ${lessonId}\n\nConteúdo da aula será exibido aqui.`)
          }
        }
      } else {
        setModule({ id: moduleId, title: `Módulo ${moduleId}`, description: 'Módulo do curso', duration: '8h' })
        setLesson({ id: lessonId, title: `Aula ${lessonId}`, type: 'video', duration: '45min', isCompleted: false, isLocked: false, points: 50 })
        if (!lessonContent) {
          setLessonContent(`# Aula ${lessonId}\n\nConteúdo da aula será exibido aqui.`)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados da aula:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    // TODO: Marcar como concluída no banco
    console.log('Aula concluída:', lessonId)
    if (lesson) {
      setLesson({ ...lesson, isCompleted: true })
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando aula...</p>
        </div>
      </div>
    )
  }

  // Usar o novo LessonViewer
  return (
    <LessonViewer
      lessonId={lessonId || ''}
      title={lesson?.title || 'Aula'}
      moduleName={module?.title}
      content={lessonContent}
      duration={lesson?.duration || '45min'}
      points={lesson?.points || 50}
      isCompleted={lesson?.isCompleted || false}
      onComplete={handleComplete}
      onBack={handleBack}
      courseContext={`Pós-Graduação em Cannabis Medicinal. Módulo: ${module?.title || ''}`}
    />
  )
}

export default LessonDetail
