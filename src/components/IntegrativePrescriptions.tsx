import React, { useState } from 'react'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Leaf,
  Zap,
  Target,
  Microscope,
  Brain,
  Heart,
  Activity,
  Download,
  Share2,
  QrCode,
  Lock,
  Send,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Stethoscope,
  Pill,
  Droplets,
  Flame,
  Wind,
  Mountain,
  Sun,
  Moon,
  Star
} from 'lucide-react'

interface PrescriptionTemplate {
  id: string
  name: string
  category: 'cannabis' | 'nefrologia' | 'sintomatico' | 'suporte' | 'integrativo'
  rationality: 'biomedical' | 'traditionalChinese' | 'ayurvedic' | 'homeopathic' | 'integrative'
  description: string
  dosage: string
  frequency: string
  duration: string
  indications: string[]
  contraindications: string[]
  monitoring: string[]
  lastUsed: string
  usageCount: number
  clinicalLayers: {
    primary: string
    secondary: string
    tertiary: string
    integrative: string
  }
  nftToken?: string
  blockchainHash?: string
}

interface IntegrativePrescriptionsProps {
  className?: string
}

const IntegrativePrescriptions: React.FC<IntegrativePrescriptionsProps> = ({ className = '' }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRationality, setSelectedRationality] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<PrescriptionTemplate | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  // Templates de prescrição integrados com cinco racionalidades
  const prescriptionTemplates: PrescriptionTemplate[] = [
    // BIOMÉDICA
    {
      id: '1',
      name: 'CBD para Dor Crônica Renal',
      category: 'cannabis',
      rationality: 'biomedical',
      description: 'Protocolo biomédico de CBD para controle de dor em pacientes com doença renal crônica',
      dosage: '10-20mg',
      frequency: '2x ao dia',
      duration: '30 dias',
      indications: ['Dor crônica', 'Insônia', 'Ansiedade', 'Inflamação'],
      contraindications: ['Hipotensão', 'Interação com anticoagulantes'],
      monitoring: ['Pressão arterial', 'Função renal', 'Sintomas neurológicos'],
      lastUsed: '2024-01-10',
      usageCount: 15,
      clinicalLayers: {
        primary: 'Dor neuropática secundária à doença renal',
        secondary: 'Inflamação sistêmica e desequilíbrio eletrolítico',
        tertiary: 'Impacto psicossocial e qualidade de vida',
        integrative: 'Abordagem multidisciplinar com fisioterapia e psicologia'
      }
    },
    {
      id: '2',
      name: 'THC para Náusea e Vômito',
      category: 'cannabis',
      rationality: 'biomedical',
      description: 'Protocolo biomédico de THC para controle de náusea e vômito em pacientes renais',
      dosage: '2.5-5mg',
      frequency: 'Conforme necessário',
      duration: '15 dias',
      indications: ['Náusea', 'Vômito', 'Perda de apetite'],
      contraindications: ['Psicose', 'Ansiedade severa'],
      monitoring: ['Estado mental', 'Apetite', 'Náusea'],
      lastUsed: '2024-01-08',
      usageCount: 8,
      clinicalLayers: {
        primary: 'Náusea central por toxinas urêmicas',
        secondary: 'Disfunção gastrointestinal e desequilíbrio metabólico',
        tertiary: 'Impacto nutricional e estado geral',
        integrative: 'Suporte nutricional e terapia ocupacional'
      }
    },
    // MEDICINA TRADICIONAL CHINESA
    {
      id: '3',
      name: 'Cannabis + Acupuntura para Epilepsia',
      category: 'integrativo',
      rationality: 'traditionalChinese',
      description: 'Protocolo integrativo combinando cannabis medicinal com pontos de acupuntura específicos',
      dosage: 'CBD 5-10mg + THC 1-2mg',
      frequency: '2x ao dia + acupuntura 2x/semana',
      duration: '60 dias',
      indications: ['Epilepsia refratária', 'Espasmos', 'Ansiedade'],
      contraindications: ['Gravidez', 'Hepatopatia severa'],
      monitoring: ['Frequência de crises', 'EEG', 'Estado mental'],
      lastUsed: '2024-01-12',
      usageCount: 12,
      clinicalLayers: {
        primary: 'Desarmonia entre Yin e Yang do Fígado',
        secondary: 'Deficiência de Qi do Rim e excesso de Fogo do Coração',
        tertiary: 'Bloqueio de meridianos e estagnação de Sangue',
        integrative: 'Equilíbrio energético com fitoterapia chinesa'
      }
    },
    {
      id: '4',
      name: 'Fitoterapia Chinesa + CBD',
      category: 'integrativo',
      rationality: 'traditionalChinese',
      description: 'Combinação de fitoterapia chinesa tradicional com CBD para equilíbrio energético',
      dosage: 'CBD 10mg + Tian Ma + Gou Teng',
      frequency: '3x ao dia',
      duration: '45 dias',
      indications: ['Tontura', 'Dor de cabeça', 'Insônia'],
      contraindications: ['Hipotensão', 'Alergia a plantas'],
      monitoring: ['Pressão arterial', 'Qualidade do sono', 'Sintomas neurológicos'],
      lastUsed: '2024-01-09',
      usageCount: 6,
      clinicalLayers: {
        primary: 'Deficiência de Qi do Baço e excesso de Yang do Fígado',
        secondary: 'Umidade interna e bloqueio de meridianos',
        tertiary: 'Desequilíbrio emocional e estresse',
        integrative: 'Meditação e exercícios de Qi Gong'
      }
    },
    // AYURVÉDICA
    {
      id: '5',
      name: 'Cannabis + Ayurveda para TEA',
      category: 'integrativo',
      rationality: 'ayurvedic',
      description: 'Protocolo ayurvédico integrado com cannabis para Transtorno do Espectro Autista',
      dosage: 'CBD 5mg + Ashwagandha + Brahmi',
      frequency: '2x ao dia',
      duration: '90 dias',
      indications: ['TEA', 'Ansiedade', 'Hiperatividade', 'Déficit de atenção'],
      contraindications: ['Hipotireoidismo', 'Gravidez'],
      monitoring: ['Comportamento', 'Sono', 'Apetite', 'Interação social'],
      lastUsed: '2024-01-14',
      usageCount: 18,
      clinicalLayers: {
        primary: 'Desequilíbrio dos doshas Vata-Pitta',
        secondary: 'Agni (fogo digestivo) fraco e Ama (toxinas) acumuladas',
        tertiary: 'Manas (mente) instável e Sattva (pureza) comprometida',
        integrative: 'Dieta pacificadora e rotina diária estruturada'
      }
    },
    {
      id: '6',
      name: 'Panchakarma + Cannabis',
      category: 'integrativo',
      rationality: 'ayurvedic',
      description: 'Protocolo de desintoxicação ayurvédica combinado com cannabis medicinal',
      dosage: 'CBD 15mg + Triphala + Ghee medicado',
      frequency: '1x ao dia + Panchakarma semanal',
      duration: '30 dias',
      indications: ['Toxemia', 'Fadiga crônica', 'Dores musculares'],
      contraindications: ['Doença aguda', 'Desidratação'],
      monitoring: ['Função digestiva', 'Energia', 'Qualidade do sono'],
      lastUsed: '2024-01-11',
      usageCount: 4,
      clinicalLayers: {
        primary: 'Ama (toxinas) acumuladas nos tecidos',
        secondary: 'Desequilíbrio dos doshas e Agni fraco',
        tertiary: 'Ojas (vitalidade) comprometida',
        integrative: 'Abhyanga (massagem) e meditação'
      }
    },
    // HOMEOPÁTICA
    {
      id: '7',
      name: 'Cannabis + Homeopatia para Dor',
      category: 'integrativo',
      rationality: 'homeopathic',
      description: 'Protocolo homeopático integrado com cannabis para controle de dor crônica',
      dosage: 'CBD 10mg + Arnica 30CH + Hypericum 30CH',
      frequency: 'CBD 2x/dia + Homeopatia 3x/dia',
      duration: '60 dias',
      indications: ['Dor neuropática', 'Trauma', 'Inflamação'],
      contraindications: ['Alergia a plantas', 'Gravidez'],
      monitoring: ['Escala de dor', 'Mobilidade', 'Qualidade de vida'],
      lastUsed: '2024-01-13',
      usageCount: 9,
      clinicalLayers: {
        primary: 'Vitalidade comprometida por trauma físico/emocional',
        secondary: 'Desequilíbrio energético e bloqueio de fluxo vital',
        tertiary: 'Sintomas mentais e emocionais associados',
        integrative: 'Individualização do remédio constitucional'
      }
    },
    {
      id: '8',
      name: 'Cannabis + Nosodes',
      category: 'integrativo',
      rationality: 'homeopathic',
      description: 'Protocolo com nosodes homeopáticos e cannabis para condições crônicas',
      dosage: 'CBD 5mg + Tuberculinum 200CH + Syphilinum 200CH',
      frequency: 'CBD diário + Nosodes semanal',
      duration: '120 dias',
      indications: ['Condições crônicas', 'Recidivas', 'Predisposições familiares'],
      contraindications: ['Crises agudas', 'Imunossupressão'],
      monitoring: ['Sintomas constitucionais', 'Padrões de recidiva', 'Vitalidade'],
      lastUsed: '2024-01-07',
      usageCount: 3,
      clinicalLayers: {
        primary: 'Miasma constitucional ativo',
        secondary: 'Predisposições hereditárias manifestadas',
        tertiary: 'Padrões de doença familiares',
        integrative: 'Tratamento constitucional profundo'
      }
    },
    // INTEGRATIVA
    {
      id: '9',
      name: 'Protocolo Integrativo Completo',
      category: 'integrativo',
      rationality: 'integrative',
      description: 'Protocolo multidisciplinar integrando todas as racionalidades médicas',
      dosage: 'CBD 10mg + THC 2mg + Fitoterapia + Acupuntura + Homeopatia',
      frequency: 'Medicamentos 2x/dia + Terapias 2x/semana',
      duration: '180 dias',
      indications: ['Condições complexas', 'Falha terapêutica', 'Múltiplas comorbidades'],
      contraindications: ['Alergias múltiplas', 'Interações medicamentosas'],
      monitoring: ['Sintomas globais', 'Qualidade de vida', 'Função orgânica'],
      lastUsed: '2024-01-15',
      usageCount: 5,
      clinicalLayers: {
        primary: 'Desequilíbrio sistêmico multifatorial',
        secondary: 'Interconexões entre sistemas orgânicos',
        tertiary: 'Impacto psicossocial e espiritual',
        integrative: 'Abordagem holística e personalizada'
      }
    }
  ]

  const filteredTemplates = prescriptionTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesRationality = selectedRationality === 'all' || template.rationality === selectedRationality
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesRationality && matchesSearch
  })

  const getRationalityIcon = (rationality: string) => {
    switch (rationality) {
      case 'biomedical': return <Microscope className="w-4 h-4" />
      case 'traditionalChinese': return <Leaf className="w-4 h-4" />
      case 'ayurvedic': return <Zap className="w-4 h-4" />
      case 'homeopathic': return <Target className="w-4 h-4" />
      case 'integrative': return <Brain className="w-4 h-4" />
      default: return <Stethoscope className="w-4 h-4" />
    }
  }

  const getRationalityColor = (rationality: string) => {
    switch (rationality) {
      case 'biomedical': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'traditionalChinese': return 'bg-red-100 text-red-800 border-red-200'
      case 'ayurvedic': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'homeopathic': return 'bg-green-100 text-green-800 border-green-200'
      case 'integrative': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cannabis': return <Leaf className="w-4 h-4" />
      case 'nefrologia': return <Droplets className="w-4 h-4" />
      case 'sintomatico': return <Zap className="w-4 h-4" />
      case 'suporte': return <CheckCircle className="w-4 h-4" />
      case 'integrativo': return <Brain className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cannabis': return 'bg-green-600'
      case 'nefrologia': return 'bg-blue-600'
      case 'sintomatico': return 'bg-yellow-600'
      case 'suporte': return 'bg-purple-600'
      case 'integrativo': return 'bg-indigo-600'
      default: return 'bg-gray-600'
    }
  }

  const categories = [
    { key: 'all', label: 'Todos', icon: <FileText className="w-4 h-4" /> },
    { key: 'cannabis', label: 'Cannabis', icon: <Leaf className="w-4 h-4" /> },
    { key: 'nefrologia', label: 'Nefrologia', icon: <Droplets className="w-4 h-4" /> },
    { key: 'sintomatico', label: 'Sintomático', icon: <Zap className="w-4 h-4" /> },
    { key: 'suporte', label: 'Suporte', icon: <CheckCircle className="w-4 h-4" /> },
    { key: 'integrativo', label: 'Integrativo', icon: <Brain className="w-4 h-4" /> }
  ]

  const rationalities = [
    { key: 'all', label: 'Todas', icon: <Brain className="w-4 h-4" /> },
    { key: 'biomedical', label: 'Biomédica', icon: <Microscope className="w-4 h-4" /> },
    { key: 'traditionalChinese', label: 'MTC', icon: <Leaf className="w-4 h-4" /> },
    { key: 'ayurvedic', label: 'Ayurvédica', icon: <Zap className="w-4 h-4" /> },
    { key: 'homeopathic', label: 'Homeopática', icon: <Target className="w-4 h-4" /> },
    { key: 'integrative', label: 'Integrativa', icon: <Brain className="w-4 h-4" /> }
  ]

  const handlePrescribe = (template: PrescriptionTemplate) => {
    setSelectedTemplate(template)
    setShowTemplateModal(true)
  }

  const handleGenerateNFT = async (template: PrescriptionTemplate) => {
    try {
      console.log('Gerando NFT para prescrição:', template.name)
      alert(`NFT gerado com sucesso!\nToken: NFT-${Date.now()}\nHash: 0x${Math.random().toString(16).substr(2, 8)}`)
    } catch (error) {
      console.error('Erro ao gerar NFT:', error)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center space-x-2">
              <Brain className="w-6 h-6" />
              <span>Prescrições Integrativas</span>
            </h2>
            <p className="text-slate-300">
              Sistema de prescrições com cinco racionalidades médicas e práticas integrativas
            </p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nova Prescrição</span>
          </button>
        </div>

        {/* Filtros e busca */}
        <div className="space-y-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar prescrições..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 text-white px-10 py-2 rounded-md border border-slate-600 focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex space-x-2">
              <span className="text-slate-300 text-sm font-medium py-2">Categoria:</span>
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedCategory === category.key 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'text-slate-300 border border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  {category.icon}
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex space-x-2">
              <span className="text-slate-300 text-sm font-medium py-2">Racionalidade:</span>
              {rationalities.map((rationality) => (
                <button
                  key={rationality.key}
                  onClick={() => setSelectedRationality(rationality.key)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedRationality === rationality.key 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'text-slate-300 border border-slate-600 hover:bg-slate-700'
                  }`}
                >
                  {rationality.icon}
                  <span>{rationality.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid de templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-white text-lg mb-2">
                  {template.name}
                </h3>
                <p className="text-slate-400 text-sm">
                  {template.description}
                </p>
              </div>
              <div className="flex flex-col space-y-1">
                <span className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${getCategoryColor(template.category)} text-white`}>
                  {getCategoryIcon(template.category)}
                </span>
                <span className={`flex items-center space-x-1 px-2 py-1 rounded text-sm border ${getRationalityColor(template.rationality)}`}>
                  {getRationalityIcon(template.rationality)}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Informações básicas */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2 text-slate-300">
                  <Pill className="w-3 h-3" />
                  <span>{template.dosage}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <Clock className="w-3 h-3" />
                  <span>{template.frequency}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <FileText className="w-3 h-3" />
                  <span>{template.duration}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <User className="w-3 h-3" />
                  <span>{template.usageCount}x usado</span>
                </div>
              </div>

              {/* Camadas clínicas */}
              <div>
                <h4 className="text-slate-300 text-sm font-medium mb-2">Camadas Clínicas:</h4>
                <div className="space-y-1 text-xs">
                  <div className="text-blue-400">• Primária: {template.clinicalLayers.primary}</div>
                  <div className="text-green-400">• Secundária: {template.clinicalLayers.secondary}</div>
                  <div className="text-yellow-400">• Terciária: {template.clinicalLayers.tertiary}</div>
                  <div className="text-purple-400">• Integrativa: {template.clinicalLayers.integrative}</div>
                </div>
              </div>

              {/* Indicações */}
              <div>
                <h4 className="text-slate-300 text-sm font-medium mb-2">Indicações:</h4>
                <div className="flex flex-wrap gap-1">
                  {template.indications.slice(0, 3).map((indication) => (
                    <span key={indication} className="px-2 py-1 text-xs text-green-400 border border-green-600 rounded">
                      {indication}
                    </span>
                  ))}
                  {template.indications.length > 3 && (
                    <span className="px-2 py-1 text-xs text-slate-400 border border-slate-600 rounded">
                      +{template.indications.length - 3} mais
                    </span>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex space-x-2 pt-2">
                <button 
                  onClick={() => handlePrescribe(template)}
                  className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Prescrever</span>
                </button>
                <button 
                  onClick={() => handleGenerateNFT(template)}
                  className="flex items-center justify-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>

              {/* Último uso */}
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-700">
                Último uso: {new Date(template.lastUsed).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Estatísticas */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center space-x-4">
            <span>📋 {filteredTemplates.length} templates disponíveis</span>
            <span>🧠 Cinco racionalidades médicas</span>
            <span>🔗 Práticas integrativas</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Atualização automática</span>
            <span className="px-2 py-1 text-xs text-green-400 border border-green-600 rounded">
              <CheckCircle className="w-3 h-3 inline mr-1" />
              Ativo
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Template */}
      {showTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">{selectedTemplate.name}</h3>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-slate-800 mb-2">Camadas Clínicas de Leitura:</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium text-blue-600">Primária:</span> {selectedTemplate.clinicalLayers.primary}</div>
                  <div><span className="font-medium text-green-600">Secundária:</span> {selectedTemplate.clinicalLayers.secondary}</div>
                  <div><span className="font-medium text-yellow-600">Terciária:</span> {selectedTemplate.clinicalLayers.tertiary}</div>
                  <div><span className="font-medium text-purple-600">Integrativa:</span> {selectedTemplate.clinicalLayers.integrative}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Dosagem:</h4>
                  <p className="text-slate-600">{selectedTemplate.dosage}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Frequência:</h4>
                  <p className="text-slate-600">{selectedTemplate.frequency}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Duração:</h4>
                  <p className="text-slate-600">{selectedTemplate.duration}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Racionalidade:</h4>
                  <p className="text-slate-600 capitalize">{selectedTemplate.rationality}</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  console.log('Prescrevendo:', selectedTemplate.name)
                  setShowTemplateModal(false)
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirmar Prescrição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IntegrativePrescriptions
