import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Mic, MicOff, X, Send, Loader2, Activity, BookOpen, Brain } from 'lucide-react'
import clsx from 'clsx'
import NoaAnimatedAvatar from './NoaAnimatedAvatar'
import { useNoaPlatform } from '../contexts/NoaPlatformContext'
import { useMedCannLabConversation } from '../hooks/useMedCannLabConversation'

interface NoaConversationalInterfaceProps {
  userCode?: string
  userName?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  hideButton?: boolean
}

const quickCommands = [
  {
    label: 'Status da plataforma',
    command: 'Nôa, como está o status da plataforma agora?'
  },
  {
    label: 'Contexto de nefrologia',
    command: 'Nôa, mostre o contexto de treinamento recente focado em nefrologia.'
  },
  {
    label: 'Simulação renal IMRE',
    command: 'Inicie uma simulação clínica renal considerando todos os eixos IMRE.'
  },
  {
    label: 'Protocolos cannabis',
    command: 'Busque protocolos atualizados de cannabis medicinal aplicados à nefrologia.'
  }
]

const getPositionClasses = (position: NoaConversationalInterfaceProps['position']) => {
  switch (position) {
    case 'bottom-left':
      return 'bottom-4 left-4'
    case 'top-right':
      return 'top-4 right-4'
    case 'top-left':
      return 'top-4 left-4'
    case 'bottom-right':
    default:
      return 'bottom-4 right-4'
  }
}

type RecognitionHandle = {
  recognition: any
  timer?: number
  buffer: string
  stopped?: boolean
}

const NoaConversationalInterface: React.FC<NoaConversationalInterfaceProps> = ({
  userCode = 'DR-001',
  userName = 'Dr. Ricardo Valença',
  position = 'bottom-right',
  hideButton = false
}) => {
  const { isOpen: contextIsOpen, pendingMessage, clearPendingMessage, closeChat } = useNoaPlatform()
  const [isOpen, setIsOpen] = useState(hideButton || contextIsOpen)
  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<RecognitionHandle | null>(null)

  const {
    messages,
    sendMessage,
    isProcessing,
    isSpeaking,
    error,
    triggerQuickCommand,
    usedEndpoints,
    lastIntent
  } = useMedCannLabConversation()
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    setIsOpen(contextIsOpen || hideButton)
  }, [contextIsOpen, hideButton])

  useEffect(() => {
    if (pendingMessage) {
      setInputValue(pendingMessage)
      sendMessage(pendingMessage)
      clearPendingMessage()
    }
  }, [pendingMessage, sendMessage, clearPendingMessage])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stopped = true
        if (recognitionRef.current.timer) {
          window.clearTimeout(recognitionRef.current.timer)
          recognitionRef.current.timer = undefined
        }
        recognitionRef.current.recognition.onresult = null
        recognitionRef.current.recognition.onerror = null
        recognitionRef.current.recognition.onend = null
        recognitionRef.current.recognition.stop()
        const text = recognitionRef.current.buffer.trim()
        if (text.length > 0) {
          sendMessage(text, { preferVoice: true })
        }
        recognitionRef.current = null
      }
    }
  }, [sendMessage])

  const stopListening = useCallback(() => {
    const handle = recognitionRef.current
    if (handle) {
      handle.stopped = true
      if (handle.timer) {
        window.clearTimeout(handle.timer)
        handle.timer = undefined
      }
      handle.recognition.onresult = null
      handle.recognition.onerror = null
      handle.recognition.onend = null
      handle.recognition.stop()
      const text = handle.buffer.trim()
      if (text.length > 0) {
        sendMessage(text, { preferVoice: true })
      }
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [sendMessage])

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Reconhecimento de voz não suportado neste navegador.')
      return
    }

    window.dispatchEvent(new Event('noaStopSpeech'))
    stopListening()

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition: any = new SpeechRecognition()
    recognition.lang = 'pt-BR'
    recognition.continuous = true
    recognition.interimResults = true

    const handle: RecognitionHandle = {
      recognition,
      buffer: ''
    }
    recognitionRef.current = handle

    const flush = () => {
      const text = handle.buffer.trim()
      if (text.length > 0) {
        sendMessage(text, { preferVoice: true })
        handle.buffer = ''
      }
    }

    const scheduleFlush = () => {
      if (handle.timer) {
        window.clearTimeout(handle.timer)
      }
      handle.timer = window.setTimeout(() => {
        flush()
      }, 900)
    }

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          handle.buffer += `${result[0].transcript.trim()} `
          scheduleFlush()
        }
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error)
      if (handle.timer) {
        window.clearTimeout(handle.timer)
        handle.timer = undefined
      }
      flush()
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onend = () => {
      if (handle.timer) {
        window.clearTimeout(handle.timer)
        handle.timer = undefined
      }
      flush()
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.start()
    setIsListening(true)
  }, [sendMessage, stopListening])

  const handleSend = useCallback(() => {
    if (!inputValue.trim()) return
    sendMessage(inputValue)
    setInputValue('')
  }, [inputValue, sendMessage])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  const handleQuickCommand = useCallback((command: string) => {
    setInputValue('')
    triggerQuickCommand(command)
  }, [triggerQuickCommand])

  const positionClasses = useMemo(() => getPositionClasses(position), [position])

  return (
    <>
      {!hideButton && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={clsx('fixed z-50 w-16 h-16 rounded-full shadow-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 transition-all duration-300 flex items-center justify-center text-white', positionClasses)}
        >
          <Brain className="w-8 h-8" />
        </button>
      )}

      {isOpen && (
        <div className={clsx('fixed z-50 w-[420px] max-w-[92vw] h-[640px] bg-slate-900/95 border border-slate-700 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden', positionClasses)}>
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-sky-500 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <NoaAnimatedAvatar size="md" isListening={isListening} isSpeaking={isSpeaking} />
              <div>
                <p className="text-sm text-emerald-100">Nôa Esperança • IA Residente</p>
                <p className="text-xs text-emerald-50/80">{userName} • {userCode}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false)
                closeChat()
                stopListening()
                window.dispatchEvent(new Event('noaChatClosed'))
              }}
              className="p-2 rounded-full text-white/80 hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="border-b border-slate-800 bg-slate-900/80 px-5 py-2 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Último fluxo: {lastIntent ?? 'Exploração'}</span>
            <span className="flex items-center gap-1 text-slate-400">{messages.length - 1} interações</span>
          </div>

          <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800">
            <p className="text-xs text-slate-300 mb-2">Comandos rápidos</p>
            <div className="flex flex-wrap gap-2">
              {quickCommands.map(command => (
                <button
                  key={command.label}
                  onClick={() => handleQuickCommand(command.command)}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-200 border border-slate-700 hover:border-emerald-500 hover:text-emerald-200 transition"
                >
                  {command.label}
                </button>
              ))}
            </div>
          </div>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {messages.map(message => (
              <div key={message.id} className={clsx('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={clsx(
                    'max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow-sm backdrop-blur-sm border',
                    message.role === 'user'
                      ? 'bg-emerald-600/90 text-white border-emerald-400/50'
                      : 'bg-slate-800/90 text-slate-100 border-slate-700'
                  )}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <span className="block text-[10px] mt-2 text-slate-400">{message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl bg-slate-800/80 text-slate-300 text-sm border border-slate-700 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Elaborando resposta clínica...
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 bg-slate-900/80 px-5 py-3 space-y-2">
            {error && (
              <div className="text-xs text-amber-400">
                {error}
              </div>
            )}

            {usedEndpoints.length > 0 && (
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <BookOpen className="w-3 h-3" /> Endpoints consultados: {usedEndpoints.join(', ')}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={toggleListening}
                className={clsx('p-3 rounded-2xl border transition',
                  isListening
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'border-slate-700 text-slate-300 hover:border-emerald-400 hover:text-emerald-200'
                )}
                title={isListening ? 'Parar captura de voz' : 'Ativar comandos por voz'}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <input
                value={inputValue}
                onChange={event => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Conversar com a Nôa..."
                className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 text-sm px-4 py-3 rounded-2xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/40"
              />

              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isProcessing}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-500 text-white shadow-lg hover:from-emerald-500 hover:to-sky-400 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NoaConversationalInterface

