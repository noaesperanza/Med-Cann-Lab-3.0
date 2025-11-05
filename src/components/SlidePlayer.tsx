import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Maximize2, Minimize2, Play, Pause } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Slide {
  id: string
  title: string
  content: string
  order?: number
}

interface SlidePlayerProps {
  isOpen: boolean
  onClose: () => void
  initialSlideId?: string
}

const SlidePlayer: React.FC<SlidePlayerProps> = ({ isOpen, onClose, initialSlideId }) => {
  const { user } = useAuth()
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadSlides()
    }
  }, [isOpen, user?.id])

  useEffect(() => {
    if (initialSlideId && slides.length > 0) {
      const index = slides.findIndex(s => s.id === initialSlideId)
      if (index >= 0) {
        setCurrentSlideIndex(index)
      }
    }
  }, [initialSlideId, slides])

  const loadSlides = async () => {
    try {
      setLoading(true)
      if (!user?.id) return

      const authorFilter = user.name || user.email
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('category', 'slides')
        .or(`author.eq.${authorFilter},author.eq.${user.email}`)
        .order('created_at', { ascending: true })

      if (error) {
        console.warn('⚠️ Erro ao carregar slides:', error)
        return
      }

      if (data && data.length > 0) {
        const loadedSlides = data.map((doc, index) => ({
          id: doc.id,
          title: doc.title || `Slide ${index + 1}`,
          content: doc.content || doc.summary || '',
          order: index
        }))
        setSlides(loadedSlides)
        setCurrentSlideIndex(0)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar slides:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  const previousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const element = document.documentElement
      if (element.requestFullscreen) {
        element.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  const toggleAutoPlay = () => {
    if (isAutoPlay) {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval)
        setAutoPlayInterval(null)
      }
      setIsAutoPlay(false)
    } else {
      const interval = setInterval(() => {
        if (currentSlideIndex < slides.length - 1) {
          setCurrentSlideIndex(prev => prev + 1)
        } else {
          setIsAutoPlay(false)
          if (autoPlayInterval) {
            clearInterval(autoPlayInterval)
            setAutoPlayInterval(null)
          }
        }
      }, 5000) // 5 segundos por slide
      setAutoPlayInterval(interval)
      setIsAutoPlay(true)
    }
  }

  useEffect(() => {
    if (isAutoPlay && currentSlideIndex >= slides.length - 1) {
      setIsAutoPlay(false)
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval)
        setAutoPlayInterval(null)
      }
    }
  }, [currentSlideIndex, slides.length])

  // Teclado de atalhos
  useEffect(() => {
    if (!isOpen) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextSlide()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        previousSlide()
      } else if (e.key === 'Escape') {
        onClose()
        if (isFullscreen) {
          if (document.exitFullscreen) {
            document.exitFullscreen()
          }
        }
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, currentSlideIndex, slides.length])

  // Limpar interval ao desmontar
  useEffect(() => {
    return () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval)
      }
    }
  }, [])

  if (!isOpen) return null

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="text-white text-xl">Carregando slides...</div>
      </div>
    )
  }

  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Nenhum slide disponível</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    )
  }

  const currentSlide = slides[currentSlideIndex]

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Fechar (ESC)"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div>
            <h2 className="text-white font-semibold">{currentSlide.title}</h2>
            <p className="text-sm text-slate-400">
              Slide {currentSlideIndex + 1} de {slides.length}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleAutoPlay}
            className={`p-2 rounded-lg transition-colors ${
              isAutoPlay
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
            title="Reprodução Automática"
          >
            {isAutoPlay ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            title="Tela Cheia (F)"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div className="max-w-5xl w-full bg-white rounded-xl shadow-2xl p-12 min-h-[60vh] flex flex-col">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">{currentSlide.title}</h1>
          <div
            className="flex-1 text-slate-700 text-lg leading-relaxed prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html: currentSlide.content
                .replace(/\n/g, '<br />')
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/^# (.+)$/gm, '<h2>$1</h2>')
                .replace(/^## (.+)$/gm, '<h3>$1</h3>')
                .replace(/^### (.+)$/gm, '<h4>$1</h4>')
                .replace(/^- (.+)$/gm, '<li>$1</li>')
            }}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 p-4 flex items-center justify-between">
        <button
          onClick={previousSlide}
          disabled={currentSlideIndex === 0}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            currentSlideIndex === 0
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Anterior</span>
        </button>

        {/* Slide Indicators */}
        <div className="flex items-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlideIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlideIndex
                  ? 'bg-green-500 w-8'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
              title={`Slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlideIndex === slides.length - 1}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
            currentSlideIndex === slides.length - 1
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          <span>Próximo</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="absolute bottom-20 right-4 bg-slate-800/80 backdrop-blur-sm rounded-lg p-3 text-xs text-slate-300">
        <p className="mb-1">Atalhos:</p>
        <p>← → Navegar | ESC Fechar | F Tela Cheia | Espaço Próximo</p>
      </div>
    </div>
  )
}

export default SlidePlayer

