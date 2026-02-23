import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  Activity, 
  AlertCircle, 
  CheckCircle,
  Clock,
  FileText,
  Download,
  Printer,
  Info,
  Heart,
  Droplet,
  Stethoscope,
  Pill
} from 'lucide-react'

interface MonitoringEvent {
  id: string
  stage: string
  exam: string
  frequency: string
  description: string
  critical: boolean
  category: 'laboratory' | 'clinical' | 'imaging' | 'consultation'
}

const DRCMonitoringSchedule: React.FC = () => {
  const navigate = useNavigate()
  const [selectedStage, setSelectedStage] = useState<string>('all')

  // Calendário de referência baseado nas diretrizes de DRC (KDIGO, SBN, etc.)
  const monitoringSchedule: MonitoringEvent[] = [
    // Estágio 1 (TFG ≥ 90 mL/min/1.73m²)
    {
      id: 'stage1-creatinine',
      stage: 'Estágio 1',
      exam: 'Creatinina sérica',
      frequency: 'Anual',
      description: 'Avaliação anual da função renal em pacientes com DRC estágio 1',
      critical: false,
      category: 'laboratory'
    },
    {
      id: 'stage1-proteinuria',
      stage: 'Estágio 1',
      exam: 'Proteinúria (relação albumina/creatinina)',
      frequency: 'Anual',
      description: 'Rastreamento anual de proteinúria para detecção precoce',
      critical: false,
      category: 'laboratory'
    },
    {
      id: 'stage1-consultation',
      stage: 'Estágio 1',
      exam: 'Consulta nefrológica',
      frequency: 'Anual',
      description: 'Acompanhamento clínico anual com nefrologista',
      critical: false,
      category: 'consultation'
    },

    // Estágio 2 (TFG 60-89 mL/min/1.73m²)
    {
      id: 'stage2-creatinine',
      stage: 'Estágio 2',
      exam: 'Creatinina sérica e TFG',
      frequency: 'Semestral',
      description: 'Monitoramento semestral da função renal',
      critical: false,
      category: 'laboratory'
    },
    {
      id: 'stage2-proteinuria',
      stage: 'Estágio 2',
      exam: 'Proteinúria quantitativa',
      frequency: 'Semestral',
      description: 'Avaliação semestral de proteinúria',
      critical: false,
      category: 'laboratory'
    },
    {
      id: 'stage2-electrolytes',
      stage: 'Estágio 2',
      exam: 'Eletrólitos (Na, K, P)',
      frequency: 'Anual',
      description: 'Controle anual de eletrólitos',
      critical: false,
      category: 'laboratory'
    },
    {
      id: 'stage2-consultation',
      stage: 'Estágio 2',
      exam: 'Consulta nefrológica',
      frequency: 'Semestral',
      description: 'Acompanhamento semestral',
      critical: false,
      category: 'consultation'
    },

    // Estágio 3a (TFG 45-59 mL/min/1.73m²)
    {
      id: 'stage3a-creatinine',
      stage: 'Estágio 3a',
      exam: 'Creatinina sérica e TFG',
      frequency: 'Trimestral',
      description: 'Monitoramento trimestral da função renal',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage3a-proteinuria',
      stage: 'Estágio 3a',
      exam: 'Proteinúria quantitativa',
      frequency: 'Trimestral',
      description: 'Avaliação trimestral de proteinúria',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage3a-electrolytes',
      stage: 'Estágio 3a',
      exam: 'Eletrólitos completos',
      frequency: 'Semestral',
      description: 'Controle semestral de eletrólitos (Na, K, P, Ca)',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage3a-hemoglobin',
      stage: 'Estágio 3a',
      exam: 'Hemoglobina',
      frequency: 'Semestral',
      description: 'Rastreamento de anemia renal',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage3a-consultation',
      stage: 'Estágio 3a',
      exam: 'Consulta nefrológica',
      frequency: 'Trimestral',
      description: 'Acompanhamento trimestral com nefrologista',
      critical: true,
      category: 'consultation'
    },

    // Estágio 3b (TFG 30-44 mL/min/1.73m²)
    {
      id: 'stage3b-creatinine',
      stage: 'Estágio 3b',
      exam: 'Creatinina sérica e TFG',
      frequency: 'Trimestral',
      description: 'Monitoramento trimestral rigoroso',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage3b-proteinuria',
      stage: 'Estágio 3b',
      exam: 'Proteinúria quantitativa',
      frequency: 'Trimestral',
      description: 'Avaliação trimestral de proteinúria',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage3b-electrolytes',
      stage: 'Estágio 3b',
      exam: 'Eletrólitos completos + PTH',
      frequency: 'Trimestral',
      description: 'Controle trimestral de eletrólitos e metabolismo ósseo',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage3b-hemoglobin',
      stage: 'Estágio 3b',
      exam: 'Hemoglobina e ferritina',
      frequency: 'Trimestral',
      description: 'Monitoramento trimestral de anemia',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage3b-vitamind',
      stage: 'Estágio 3b',
      exam: 'Vitamina D (25-OH)',
      frequency: 'Semestral',
      description: 'Avaliação semestral de vitamina D',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage3b-consultation',
      stage: 'Estágio 3b',
      exam: 'Consulta nefrológica',
      frequency: 'Trimestral',
      description: 'Acompanhamento trimestral obrigatório',
      critical: true,
      category: 'consultation'
    },

    // Estágio 4 (TFG 15-29 mL/min/1.73m²)
    {
      id: 'stage4-creatinine',
      stage: 'Estágio 4',
      exam: 'Creatinina sérica e TFG',
      frequency: 'Mensal',
      description: 'Monitoramento mensal da função renal',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage4-proteinuria',
      stage: 'Estágio 4',
      exam: 'Proteinúria quantitativa',
      frequency: 'Trimestral',
      description: 'Avaliação trimestral de proteinúria',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage4-electrolytes',
      stage: 'Estágio 4',
      exam: 'Eletrólitos completos + PTH + Fósforo',
      frequency: 'Mensal',
      description: 'Controle mensal rigoroso de eletrólitos',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage4-hemoglobin',
      stage: 'Estágio 4',
      exam: 'Hemoglobina, ferritina, transferrina',
      frequency: 'Mensal',
      description: 'Monitoramento mensal de anemia',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage4-vitamind',
      stage: 'Estágio 4',
      exam: 'Vitamina D (25-OH)',
      frequency: 'Trimestral',
      description: 'Avaliação trimestral de vitamina D',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage4-albumin',
      stage: 'Estágio 4',
      exam: 'Albumina sérica',
      frequency: 'Trimestral',
      description: 'Avaliação do estado nutricional',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage4-consultation',
      stage: 'Estágio 4',
      exam: 'Consulta nefrológica',
      frequency: 'Mensal',
      description: 'Acompanhamento mensal obrigatório - preparação para terapia renal substitutiva',
      critical: true,
      category: 'consultation'
    },
    {
      id: 'stage4-dialysis-prep',
      stage: 'Estágio 4',
      exam: 'Avaliação para terapia renal substitutiva',
      frequency: 'Quando TFG < 20',
      description: 'Início da preparação para diálise ou transplante',
      critical: true,
      category: 'consultation'
    },

    // Estágio 5 (TFG < 15 mL/min/1.73m² ou em diálise)
    {
      id: 'stage5-creatinine',
      stage: 'Estágio 5',
      exam: 'Creatinina sérica e TFG',
      frequency: 'Mensal',
      description: 'Monitoramento mensal da função renal residual',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage5-electrolytes',
      stage: 'Estágio 5',
      exam: 'Eletrólitos completos + PTH + Fósforo + Cálcio',
      frequency: 'Mensal',
      description: 'Controle mensal rigoroso de eletrólitos e metabolismo ósseo',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage5-hemoglobin',
      stage: 'Estágio 5',
      exam: 'Hemoglobina, ferritina, transferrina, EPO',
      frequency: 'Mensal',
      description: 'Monitoramento mensal de anemia e necessidade de eritropoetina',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage5-albumin',
      stage: 'Estágio 5',
      exam: 'Albumina sérica',
      frequency: 'Mensal',
      description: 'Avaliação mensal do estado nutricional',
      critical: true,
      category: 'laboratory'
    },
    {
      id: 'stage5-consultation',
      stage: 'Estágio 5',
      exam: 'Consulta nefrológica',
      frequency: 'Mensal',
      description: 'Acompanhamento mensal obrigatório',
      critical: true,
      category: 'consultation'
    },
    {
      id: 'stage5-dialysis',
      stage: 'Estágio 5',
      exam: 'Avaliação de adequação de diálise',
      frequency: 'Mensal',
      description: 'Monitoramento da eficácia da terapia renal substitutiva',
      critical: true,
      category: 'consultation'
    }
  ]

  const stages = ['all', 'Estágio 1', 'Estágio 2', 'Estágio 3a', 'Estágio 3b', 'Estágio 4', 'Estágio 5']
  
  const filteredSchedule = selectedStage === 'all' 
    ? monitoringSchedule 
    : monitoringSchedule.filter(item => item.stage === selectedStage)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'laboratory': return <Droplet className="w-4 h-4" />
      case 'clinical': return <Stethoscope className="w-4 h-4" />
      case 'imaging': return <Activity className="w-4 h-4" />
      case 'consultation': return <Heart className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'laboratory': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'clinical': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'imaging': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'consultation': return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Estágio 1': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Estágio 2': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'Estágio 3a': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'Estágio 3b': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'Estágio 4': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'Estágio 5': return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    const content = filteredSchedule.map(item => 
      `${item.stage} | ${item.exam} | ${item.frequency} | ${item.description}`
    ).join('\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `calendario-monitoramento-drc-${selectedStage}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-rose-400" />
                Calendário de Monitoramento - DRC
              </h1>
              <p className="text-slate-300">
                Calendário de referência baseado nas diretrizes KDIGO e SBN para Doença Renal Crônica
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </div>
        </div>

        {/* Informações sobre Diretrizes */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-blue-300 mb-1">
                Baseado nas Diretrizes Oficiais
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Este calendário segue as recomendações das diretrizes KDIGO (Kidney Disease: Improving Global Outcomes) 
                e SBN (Sociedade Brasileira de Nefrologia) para monitoramento de pacientes com Doença Renal Crônica. 
                As frequências podem ser ajustadas conforme avaliação clínica individual e presença de comorbidades.
              </p>
            </div>
          </div>
        </div>

        {/* Filtro por Estágio */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Filtrar por Estágio da DRC
          </label>
          <div className="flex flex-wrap gap-2">
            {stages.map(stage => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedStage === stage
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {stage === 'all' ? 'Todos os Estágios' : stage}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de Monitoramento */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Estágio DRC
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Exame/Procedimento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Frequência
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Tipo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredSchedule.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-slate-700/50 transition-colors ${
                      item.critical ? 'bg-rose-500/5' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStageColor(item.stage)}`}>
                        {item.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.critical && (
                          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        )}
                        <span className={`font-medium ${item.critical ? 'text-rose-300' : 'text-white'}`}>
                          {item.exam}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-200 font-medium">{item.frequency}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-300">{item.description}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${getCategoryColor(item.category)}`}>
                        {getCategoryIcon(item.category)}
                        <span className="capitalize">
                          {item.category === 'laboratory' ? 'Laboratorial' :
                           item.category === 'clinical' ? 'Clínico' :
                           item.category === 'imaging' ? 'Imagem' :
                           'Consulta'}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              Legenda de Estágios
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-slate-300">Estágio 1: TFG ≥ 90 mL/min/1.73m²</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-slate-300">Estágio 2: TFG 60-89 mL/min/1.73m²</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-slate-300">Estágio 3a: TFG 45-59 mL/min/1.73m²</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-slate-300">Estágio 3b: TFG 30-44 mL/min/1.73m²</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-slate-300">Estágio 4: TFG 15-29 mL/min/1.73m²</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-slate-300">Estágio 5: TFG &lt; 15 mL/min/1.73m² ou em diálise</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              Observações Importantes
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>As frequências podem ser ajustadas conforme avaliação clínica individual</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Pacientes com proteinúria significativa podem necessitar de monitoramento mais frequente</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Comorbidades (diabetes, hipertensão) podem alterar a frequência de monitoramento</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Pacientes em uso de cannabis medicinal requerem monitoramento específico adicional</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DRCMonitoringSchedule

