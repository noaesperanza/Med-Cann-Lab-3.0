# 🎨 DESIGN SYSTEM - MEDCANLAB 3.0 MVP

## Paleta de Cores da Landing Page

### Cores Principais

```css
/* Verde Principal (Primary) */
--primary-green: #00C16A
--green-400: #4ade80
--green-500: #22c55e
--green-600: #16a34a
--green-700: #15803d

/* Backgrounds */
--dark-bg: #0A192F (slate-900)
--card-bg: rgba(255, 255, 255, 0.03)
--card-border: rgba(255, 255, 255, 0.1)
--hover-bg: rgba(0, 193, 106, 0.1)

/* Textos */
--text-primary: #FFFFFF
--text-secondary: #C8D6E5
--text-tertiary: #94A3B8 (slate-300)
--text-muted: #64748B (slate-400)

/* Accents */
--yellow-accent: #FFD33D
--orange-accent: #f97316
--red-accent: #ef4444
--blue-accent: #3b82f6
```

### Aplicação em Componentes

#### Buttons
```tsx
// Primary Button
className="bg-[#00C16A] hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"

// Secondary Button
className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(0,193,106,0.1)] hover:border-[#00C16A] px-6 py-3 rounded-lg transition-all"

// Active/Card Button
className="bg-gradient-to-r from-green-400 to-green-500 text-white rounded-xl p-6 hover:shadow-lg hover:scale-105 transition-all"
```

#### Cards
```tsx
// Card Container
className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl p-6"

// Card Active
style={{
  backgroundColor: 'rgba(0, 193, 106, 0.1)',
  border: '2px solid #00C16A',
  boxShadow: '0 8px 20px rgba(0, 193, 106, 0.3)'
}

// Card Hover
className="hover:bg-[rgba(0,193,106,0.1)] hover:border-[#00C16A] transition-all"
```

#### Backgrounds
```tsx
// Main Background
className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"

// Section Background (Landing)
style={{ backgroundColor: '#0A192F' }}

// Hero Section
style={{ background: 'linear-gradient(135deg, #0A192F 0%, #1a365d 50%, #2d5a3d 100%)' }}
```

#### Inputs
```tsx
className="w-full px-4 py-3 text-white bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] rounded-xl focus:outline-none focus:border-[#00C16A] transition-all"
```

#### Text Styles
```tsx
// Heading 1
className="text-4xl md:text-5xl font-bold text-white"

// Heading 2
className="text-2xl md:text-3xl font-bold text-white"

// Body
className="text-lg text-white/90"

// Secondary
className="text-sm text-slate-300"

// Muted
className="text-xs text-slate-400"
```

### Componentes Específicos

#### Header
```tsx
className="bg-slate-800/90 backdrop-blur-sm shadow-lg border-b border-slate-700/50"
```

#### Dropdown/Select
```tsx
className="bg-slate-800 border border-slate-700 rounded-lg text-white"
```

#### Badge/Status
```tsx
// Success
className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full"

// Warning
className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 rounded-full"

// Error
className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full"
```

### Gradientes

```tsx
// Primary Gradient
className="bg-gradient-to-r from-green-400 to-green-500"

// Card Gradient (Active)
className="bg-gradient-to-r from-green-500 to-green-600"

// Accent Gradients
className="bg-gradient-to-r from-blue-500 to-cyan-500"
className="bg-gradient-to-r from-purple-500 to-pink-500"
className="bg-gradient-to-r from-yellow-500 to-orange-500"
```

### Shadows

```tsx
// Card Shadow
style={{ boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}

// Active Card Shadow
style={{ boxShadow: '0 8px 20px rgba(0, 193, 106, 0.3)' }}

// Button Shadow
className="shadow-lg hover:shadow-xl"
```

### Spacing

```tsx
// Padding
p-4, p-6, p-8
px-4, px-6, px-8
py-3, py-4, py-6

// Margin
mb-4, mb-6, mb-8
mt-4, mt-6, mt-8
gap-4, gap-6, gap-8
```

### Border Radius

```tsx
// Small
rounded-lg (8px)

// Medium
rounded-xl (12px)

// Large
rounded-2xl (16px)

// Full
rounded-full
```

### Transitions

```tsx
// Default
className="transition-all duration-300"

// Fast
className="transition-all duration-200"

// Slow
className="transition-all duration-500"
```

## Checklist de Aplicação

- [ ] Aplicar cores em todos os componentes
- [ ] Verificar consistência de sombras
- [ ] Verificar consistência de bordas
- [ ] Verificar consistência de espaçamentos
- [ ] Verificar responsividade
- [ ] Testar em diferentes temas/brightness
- [ ] Verificar contraste de textos
- [ ] Verificar estados hover/active/focus

