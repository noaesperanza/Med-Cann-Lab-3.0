import React, { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  color: string
  opacity: number
  speedX: number
  speedY: number
  twinkleSpeed: number
}

interface AnimatedParticlesProps {
  count?: number
  colors?: string[]
  minSize?: number
  maxSize?: number
  containerRef?: React.RefObject<HTMLDivElement>
}

const AnimatedParticles: React.FC<AnimatedParticlesProps> = ({
  count = 50,
  colors = ['#00D9FF', '#FFD33D', '#00C16A'], // Azul neon, amarelo, verde
  minSize = 0.5,
  maxSize = 1.5,
  containerRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Obter dimensões do container ou usar window
    const getDimensions = () => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect()
        return { width: rect.width, height: rect.height }
      }
      return { width: window.innerWidth, height: window.innerHeight }
    }

    const resizeCanvas = () => {
      const { width, height } = getDimensions()
      canvas.width = width
      canvas.height = height
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Criar partículas
    const createParticles = () => {
      particlesRef.current = []
      const { width, height } = getDimensions()
      
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * (maxSize - minSize) + minSize,
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.4 + 0.2, // Opacidade entre 0.2 e 0.6 (mais sutil)
          speedX: (Math.random() - 0.5) * 0.15, // Movimento mais lento
          speedY: (Math.random() - 0.5) * 0.15,
          twinkleSpeed: Math.random() * 0.015 + 0.008 // Velocidade de piscar mais suave
        })
      }
    }

    createParticles()

    // Função de animação
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const { width, height } = getDimensions()

      particlesRef.current.forEach((particle) => {
        // Atualizar posição
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Wrap around edges
        if (particle.x < 0) particle.x = width
        if (particle.x > width) particle.x = 0
        if (particle.y < 0) particle.y = height
        if (particle.y > height) particle.y = 0

        // Efeito de piscar (twinkle) - mais sutil
        particle.opacity += particle.twinkleSpeed
        if (particle.opacity > 0.8) {
          particle.opacity = 0.8
          particle.twinkleSpeed = -particle.twinkleSpeed
        } else if (particle.opacity < 0.15) {
          particle.opacity = 0.15
          particle.twinkleSpeed = -particle.twinkleSpeed
        }

        // Desenhar partícula como estrela pequena e fina
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        
        // Brilho sutil e fino
        ctx.shadowBlur = 2
        ctx.shadowColor = particle.color
        ctx.fill()
        
        // Resetar sombra
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [count, colors, minSize, maxSize, containerRef])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}

export default AnimatedParticles

