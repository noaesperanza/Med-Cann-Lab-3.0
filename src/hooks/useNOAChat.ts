import { useState, useEffect, useCallback } from 'react'
import { noaEngine, ChatMessage, SemanticAnalysis } from '../lib/noaEngine'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useNOAChat = () => {
  const { user } = useAuth()
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
        .eq('user_id', user?.id)
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
    const responses: ChatMessage[] = []
    
    userMessages.forEach((message, index) => {
      if (message.analysis) {
        const noaResponse = noaEngine.generateNOAResponse(message.text, message.analysis)
        responses.push({
          id: `noa-${message.id}`,
          text: noaResponse,
          timestamp: new Date(message.timestamp.getTime() + 1000), // 1 segundo depois
          isUser: false
        })
      }
    })

    return responses
  }

  const sendMessage = useCallback(async (text: string) => {
    if (!user || !isInitialized || !text.trim()) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      timestamp: new Date(),
      isUser: true
    }

    // Adicionar mensagem do usuário
    setMessages(prev => [...prev, userMessage])
    noaEngine.addToContext(userMessage)

    setIsAnalyzing(true)

    try {
      // Salvar interação no Supabase
      const { data: interaction, error: interactionError } = await supabase
        .from('user_interactions')
        .insert({
          user_id: user.id,
          text_raw: text.trim(),
          context: JSON.stringify(noaEngine.getContext().slice(-5)), // Últimos 5 contextos
          timestamp: new Date().toISOString()
        })
        .select()
        .single()

      if (interactionError) {
        console.error('Erro ao salvar interação:', interactionError)
      }

      // Análise semântica
      const analysis = await noaEngine.analyzePatientInput(text.trim())

      // Salvar análise semântica
      if (interaction) {
        const { error: analysisError } = await supabase
          .from('semantic_analysis')
          .insert({
            chat_id: interaction.id,
            topics: analysis.topics,
            emotions: analysis.emotions,
            biomedical_terms: analysis.biomedical_terms,
            interpretations: analysis.interpretations,
            confidence: analysis.confidence
          })

        if (analysisError) {
          console.error('Erro ao salvar análise:', analysisError)
        }
      }

      // Atualizar mensagem com análise
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, analysis }
          : msg
      ))

      // Gerar resposta da NOA
      const noaResponse = noaEngine.generateNOAResponse(text.trim(), analysis)
      const noaMessage: ChatMessage = {
        id: `noa-${Date.now()}`,
        text: noaResponse,
        timestamp: new Date(),
        isUser: false
      }

      // Adicionar resposta da NOA
      setTimeout(() => {
        setMessages(prev => [...prev, noaMessage])
        noaEngine.addToContext(noaMessage)
        setIsAnalyzing(false)
      }, 1000 + Math.random() * 2000) // Delay realista

    } catch (error) {
      console.error('Erro ao processar mensagem:', error)
      setIsAnalyzing(false)
      
      // Resposta de erro da NOA
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        text: 'Desculpe, estou processando suas palavras. Pode repetir?',
        timestamp: new Date(),
        isUser: false
      }
      
      setTimeout(() => {
        setMessages(prev => [...prev, errorMessage])
      }, 1000)
    }
  }, [user, isInitialized])

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
