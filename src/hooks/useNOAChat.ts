import { useState, useEffect, useCallback } from 'react'
import { noaEngine, ChatMessage, SemanticAnalysis } from '../lib/noaEngine'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

export function useNOAChat(initialContext?: any) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Inicializar NOA Engine - VERSÃO SIMPLES
  useEffect(() => {
    const initializeNOA = async () => {
      try {
        // Inicialização instantânea (sem carregar modelos pesados)
        setIsInitialized(true)

        // Adicionar mensagem de boas-vindas
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          text: 'Sou Nôa Esperanza. Apresente-se também e diga o que trouxe você aqui? Você pode utilizar o chat aqui embaixo à direita para responder ou pedir ajuda. Bons ventos sóprem.',
          timestamp: new Date(),
          isUser: false
        }
        setMessages([welcomeMessage])
      } catch (error) {
        console.error('Erro ao inicializar NOA:', error)
      }
    }

    initializeNOA()
  }, [])

  // Carregar histórico do chat
  useEffect(() => {
    if (user && isInitialized) {
      loadChatHistory()
    }
  }, [user, isInitialized])

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('user_interactions')
        .select(`
          *,
          semantic_analysis (
            topics,
            emotions,
            biomedical_terms,
            interpretations,
            confidence
          )
        `)
        .eq('user_id', user?.id ?? '')
        .order('timestamp', { ascending: true })

      if (error) {
        console.error('Erro ao carregar histórico:', error)
        return
      }

      if (data && data.length > 0) {
        const chatMessages: ChatMessage[] = data.map((interaction: any) => ({
          id: interaction.id,
          text: interaction.text_raw,
          timestamp: new Date(interaction.timestamp),
          isUser: true,
          analysis: interaction.semantic_analysis?.[0]
        }))

        // Adicionar respostas da NOA
        const noaResponses = generateNOAResponses(chatMessages)
        const allMessages = [...chatMessages, ...noaResponses].sort((a, b) =>
          a.timestamp.getTime() - b.timestamp.getTime()
        )

        setMessages(allMessages)
      }
    } catch (error) {
      console.error('Erro ao carregar histórico do chat:', error)
    }
  }

  const generateNOAResponses = (userMessages: ChatMessage[]): ChatMessage[] => {
    // Na versão TradeVision, o histórico deve vir do banco (ai_chat_interactions)
    // Por enquanto, retornamos vazio para não gerar alucinações no histórico antigo
    return []
  }

  const sendMessage = useCallback(async (text: string) => {
    if (!user || !isInitialized || !text.trim()) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      timestamp: new Date(),
      isUser: true
    }

    // 1. Adicionar mensagem do usuário na UI imediatamente
    setMessages(prev => [...prev, userMessage])
    noaEngine.addToContext(userMessage)
    setIsAnalyzing(true)

    try {
      // 2. Chamar TradeVision Core (Secure API)
      // TODO: Passar contexto do paciente real aqui quando disponível
      const { response, analysis } = await noaEngine.processUserMessage(text.trim())

      // 3. Criar mensagem da IA
      const aiMessage: ChatMessage = {
        id: `tv-${Date.now()}`,
        text: response,
        timestamp: new Date(),
        isUser: false,
        analysis: analysis
      }

      // 4. Atualizar UI
      setMessages(prev => [...prev, aiMessage])
      noaEngine.addToContext(aiMessage)

    } catch (error) {
      console.error('Erro ao processar mensagem:', error)

      // 3. Use showToast for immediate feedback
      showToast('error', 'Falha na conexão com TradeVision Core. Tente novamente.')

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        text: '⚠️ Falha na conexão com TradeVision Core. Tente novamente.',
        timestamp: new Date(),
        isUser: false
      }
      setMessages(prev => [...prev, errorMessage]) // 4. Keep the setMessages error
    } finally {
      setIsAnalyzing(false)
    }
  }, [user, isInitialized, showToast]) // Add showToast to dependency array

  const clearChat = useCallback(() => {
    setMessages([{
      id: 'welcome',
      text: 'Sou Nôa Esperanza. Apresente-se também e diga o que trouxe você aqui? Você pode utilizar o chat aqui embaixo à direita para responder ou pedir ajuda. Bons ventos soprem.',
      timestamp: new Date(),
      isUser: false
    }])
    noaEngine.clearContext()
  }, [])

  return {
    messages,
    isAnalyzing,
    isInitialized,
    sendMessage,
    clearChat
  }
}
