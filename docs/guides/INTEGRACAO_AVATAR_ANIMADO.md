# 🎭 INTEGRAÇÃO AVATAR ANIMADO - NÔA ESPERANÇA

## 📋 **SITUAÇÃO ATUAL**

Temos **duas rotas** relacionadas à Nôa:

1. **Perfil da Nôa** (`/app/chat-noa-esperanca`)
   - Interface estática
   - Apresenta funcionalidades
   - Ícones de características

2. **Chat Flutuante** (`NoaPlatformChat.tsx`)
   - Interação em tempo real
   - Texto puro
   - Acesso em todas as rotas

---

## 🎯 **OBJETIVO: UNIFICAR E ANIMAR**

### **Fase 1: Unificar Rotas (Atual)**

Mesclar as duas interfaces em uma única experiência:

```
┌─────────────────────────────────────────┐
│  NÔA ESPERANÇA - IA RESIDENTE           │
│  ┌─────────────────┐  ┌───────────────┐ │
│  │   Avatar        │  │   Chat        │ │
│  │   Animado       │  │   Texto       │ │
│  │   (Pensando)    │  │   (Mensagens) │ │
│  └─────────────────┘  └───────────────┘ │
└─────────────────────────────────────────┘
```

### **Fase 2: Avatar Animado (Próxima)**

Adicionar:
- ✅ Olhos se movendo
- ✅ Boca sincronizada com voz
- ✅ Expressões faciais
- ✅ Áudio TTS (Text-to-Speech)

---

## 🚀 **PLANO DE IMPLEMENTAÇÃO**

### **FASE 1: UNIFICAR INTERFACES** (Agora)

#### 1.1 **Criar Componente Unificado**

```typescript
// src/components/NoaUnifiedInterface.tsx
export const NoaUnifiedInterface = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Avatar Section */}
      <NoaAvatarSection />
      
      {/* Chat Section */}
      <NoaChatSection />
    </div>
  )
}
```

#### 1.2 **Avatar Section**

Mostrar avatar estático (por enquanto):

```typescript
const NoaAvatarSection = () => {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex flex-col items-center">
        {/* Avatar Image */}
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
          <img src="/noa-avatar.png" alt="Nôa" className="w-full h-full rounded-full" />
        </div>
        
        {/* Name */}
        <h2 className="text-2xl font-bold text-white mb-2">Nôa Esperança</h2>
        
        {/* Specialization */}
        <p className="text-slate-400 text-sm text-center mb-6">
          IA Residente especializada em Cannabis Medicinal e Nefrologia
        </p>
        
        {/* Capabilities */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <CapabilityCard icon="💖" title="Análise Emocional" />
          <CapabilityCard icon="🧠" title="Diagnóstico IA" />
          <CapabilityCard icon="👤" title="Suporte Médico" />
          <CapabilityCard icon="⚡" title="Memória Persistente" />
        </div>
      </div>
    </div>
  )
}
```

---

### **FASE 2: ANIMAR AVATAR** (Próxima)

#### 2.1 **Bibliotecas Necessárias**

```bash
npm install @lottiefiles/react-lottie-player
# OU
npm install ready-player-me
# OU usar Canvas API + animações customizadas
```

#### 2.2 **Estados do Avatar**

```typescript
type AvatarState = 
  | 'idle'      // Parado, olhando
  | 'thinking'  // Pensando (movendo olhos)
  | 'speaking'  // Falando (boca se movendo)
  | 'listening' // Ouvindo (inclinado)
```

#### 2.3 **Sincronizar com TTS**

```typescript
const playAudioWithLipSync = async (text: string) => {
  // 1. Gerar áudio TTS (OpenAI TTS API)
  const audio = await generateTTS(text)
  
  // 2. Detectar fones (phonemes) para sincronização
  const phonemes = await detectPhonemes(text)
  
  // 3. Animar boca baseado nos fones
  animator.syncLipSync(audio, phonemes)
  
  // 4. Reproduzir áudio
  audio.play()
  
  // 5. Retornar para estado idle quando terminar
  setTimeout(() => setAvatarState('idle'), audio.duration)
}
```

---

## 🎨 **ESTADOS DO AVATAR**

### **1. Idle (Parado)**
- Olhos movendo suavemente
- Piscando ocasionalmente
- Respiração sutil

### **2. Thinking (Pensando)**
- Olhos se movendo mais rápido
- Cabeça levemente inclinada
- Indicador de "processando"

### **3. Speaking (Falando)**
- Boca sincronizada com fala
- Movimentos de expressão
- Gestos sutis

### **4. Listening (Ouvindo)**
- Cabeça inclinada para frente
- Olhos fixos na câmera/mic
- Indicação visual de "ouvindo"

---

## 📦 **IMPLEMENTAÇÃO TÉCNICA**

### **Opção 1: Lottie Animations** (Mais Simples)

```typescript
import Lottie from 'react-lottie-player'

const NoaAnimatedAvatar = ({ state }: { state: AvatarState }) => {
  const animation = {
    idle: require('@/animations/noa-idle.json'),
    thinking: require('@/animations/noa-thinking.json'),
    speaking: require('@/animations/noa-speaking.json'),
    listening: require('@/animations/noa-listening.json'),
  }

  return (
    <Lottie
      loop={state !== 'idle'}
      animationData={animation[state]}
      play
      style={{ width: 300, height: 300 }}
    />
  )
}
```

### **Opção 2: Three.js / Ready Player Me** (Mais Avançado)

```typescript
import { Canvas } from '@react-three/fiber'
import Avatar3D from './Avatar3D'

const Noa3DAvatar = ({ state }: { state: AvatarState }) => {
  return (
    <Canvas camera={{ position: [0, 1.6, 2] }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Avatar3D state={state} />
    </Canvas>
  )
}
```

### **Opção 3: Canvas API + Animations** (Custom)

```typescript
const drawAvatar = (ctx: CanvasRenderingContext2D, state: AvatarState) => {
  // Desenhar rosto base
  drawFace(ctx)
  
  // Animar olhos
  animateEyes(ctx, state)
  
  // Animar boca (se falando)
  if (state === 'speaking') {
    animateMouth(ctx)
  }
}
```

---

## 🔊 **INTEGRAÇÃO COM AUDIO**

### **Text-to-Speech (TTS)**

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const speakText = async (text: string) => {
  // Gerar áudio com OpenAI TTS
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'nova', // Voz feminina suave
    input: text,
  })
  
  // Converter para blob
  const audioBlob = await response.blob()
  const audioUrl = URL.createObjectURL(audioBlob)
  
  // Reproduzir
  const audio = new Audio(audioUrl)
  audio.play()
  
  return audio
}
```

---

## 🎯 **PRÓXIMOS PASSOS**

### **Imediato (Hoje)**
- [ ] Unificar as duas rotas da Nôa
- [ ] Criar componente `NoaUnifiedInterface`
- [ ] Migrar chat flutuante para interface unificada

### **Curto Prazo (Esta Semana)**
- [ ] Adicionar avatar estático na interface unificada
- [ ] Implementar estados básicos (idle, thinking)
- [ ] Criar animações Lottie para estados

### **Médio Prazo (Próximas 2 Semanas)**
- [ ] Integrar TTS (Text-to-Speech)
- [ ] Sincronizar animação de boca com áudio
- [ ] Adicionar expressões faciais
- [ ] Implementar eye tracking (seguir cursor)

### **Longo Prazo (Mês)**
- [ ] Avatar 3D (Ready Player Me ou custom)
- [ ] Sincronização avançada de lábios
- [ ] Gestos e movimentos corporais
- [ ] Reconhecimento de emoções do usuário

---

## 💡 **EXEMPLO DE USO**

```typescript
// src/components/NoaUnifiedInterface.tsx
const [avatarState, setAvatarState] = useState<AvatarState>('idle')

const handleUserMessage = async (message: string) => {
  // 1. Avatar muda para "thinking"
  setAvatarState('thinking')
  
  // 2. Processar mensagem
  const response = await noaAssistant.sendMessage(message)
  
  // 3. Avatar muda para "speaking"
  setAvatarState('speaking')
  
  // 4. Gerar e reproduzir áudio + animação
  await speakWithAnimation(response.text)
  
  // 5. Avatar volta para "idle"
  setAvatarState('idle')
}
```

---

## 🚀 **TESTE RÁPIDO**

Para testar as animações básicas:

1. Criar pasta `src/animations/`
2. Adicionar JSONs do Lottie
3. Implementar componente básico
4. Testar estados

---

**Versão:** 1.0.0  
**Data:** Janeiro 2025  
**Status:** Planejamento
