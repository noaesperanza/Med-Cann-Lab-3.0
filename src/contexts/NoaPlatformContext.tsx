import React, { createContext, useContext, useState, ReactNode } from 'react'

interface NoaPlatformContextType {
  isOpen: boolean
  openChat: () => void
  closeChat: () => void
  sendInitialMessage: (message: string) => void
  pendingMessage: string | null
  clearPendingMessage: () => void
  isGlobalChatHidden: boolean
  hideGlobalChat: () => void
  showGlobalChat: () => void
}

const NoaPlatformContext = createContext<NoaPlatformContextType | undefined>(undefined)

export const useNoaPlatform = () => {
  const context = useContext(NoaPlatformContext)
  if (!context) {
    throw new Error('useNoaPlatform must be used within a NoaPlatformProvider')
  }
  return context
}

interface NoaPlatformProviderProps {
  children: ReactNode
}

export const NoaPlatformProvider: React.FC<NoaPlatformProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const [isGlobalChatHidden, setIsGlobalChatHidden] = useState(false)

  const openChat = () => {
    setIsOpen(true)
  }

  const closeChat = () => {
    setIsOpen(false)
  }

  const sendInitialMessage = (message: string) => {
    setPendingMessage(message)
    setIsOpen(true)
  }

  const clearPendingMessage = () => {
    setPendingMessage(null)
  }

  const hideGlobalChat = () => setIsGlobalChatHidden(true)
  const showGlobalChat = () => setIsGlobalChatHidden(false)

  return (
    <NoaPlatformContext.Provider value={{
      isOpen,
      openChat,
      closeChat,
      sendInitialMessage,
      pendingMessage,
      clearPendingMessage,
      isGlobalChatHidden,
      hideGlobalChat,
      showGlobalChat
    }}>
      {children}
    </NoaPlatformContext.Provider>
  )
}
