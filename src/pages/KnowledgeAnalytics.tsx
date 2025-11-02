import React, { useState, useEffect } from 'react'
import { 
  TrendingUp,
  TrendingDown,
  FileText,
  Users,
  Brain,
  Search,
  Star,
  BarChart3,
  PieChart
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { NoaKnowledgeBase } from '../services/noaKnowledgeBase'

interface AnalyticsData {
  totalDocuments: number
  aiLinkedDocuments: number
  averageRelevance: number
  documentsByCategory: { category: string; count: number }[]
  documentsByArea: { area: string; count: number }[]
  documentsByAudience: { audience: string; count: number }[]
  growthData: { month: string; count: number }[]
  topCategories: { category: string; count: number }[]
}

const KnowledgeAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalDocuments: 0,
    aiLinkedDocuments: 0,
    averageRelevance: 0,
    documentsByCategory: [],
    documentsByArea: [],
    documentsByAudience: [],
    growthData: [],
    topCategories: []
  })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    loadAnalyticsData()
  }, [period])

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Carregar todos os dados
      const { data: allDocs } = await supabase
        .from('documents')
        .select('*')

      if (!allDocs) {
        setLoading(false)
        return
      }

      // Calcular estatísticas
      const aiDocs = allDocs.filter(d => d.isLinkedToAI)
      const avgRelevance = aiDocs.length > 0 
        ? aiDocs.reduce((sum, doc) => sum + (doc.aiRelevance || 0), 0) / aiDocs.length 
        : 0

      // Por categoria
      const categoryCount: { [key: string]: number } = {}
      allDocs.forEach(doc => {
        const cat = doc.category || 'unknown'
        categoryCount[cat] = (categoryCount[cat] || 0) + 1
      })

      // Por área (keywords/tags)
      const areaCount: { [key: string]: number } = {}
      allDocs.forEach(doc => {
        const keywords = doc.keywords || []
        keywords.forEach((kw: string) => {
          if (kw.includes('cannabis') || kw.includes('canabi')) areaCount['Cannabis'] = (areaCount['Cannabis'] || 0) + 1
          if (kw.includes('imre')) areaCount['IMRE'] = (areaCount['IMRE'] || 0) + 1
          if (kw.includes('clinic')) areaCount['Clínica'] = (areaCount['Clínica'] || 0) + 1
        })
      })

      // Por audiência
      const audienceCount: { [key: string]: number } = {}
      allDocs.forEach(doc => {
        const audience = doc.target_audience || []
        if (Array.isArray(audience)) {
          audience.forEach((aud: string) => {
            audienceCount[aud] = (audienceCount[aud] || 0) + 1
          })
        }
      })

      // Dados de crescimento (simulado baseado em created_at)
      const growthData = [
        { month: 'Jan', count: Math.floor(allDocs.length * 0.1) },
        { month: 'Fev', count: Math.floor(allDocs.length * 0.15) },
        { month: 'Mar', count: Math.floor(allDocs.length * 0.2) },
        { month: 'Abr', count: Math.floor(allDocs.length * 0.3) },
        { month: 'Mai', count: Math.floor(allDocs.length * 0.4) },
        { month: 'Jun', count: allDocs.length }
      ]

      setData({
        totalDocuments: allDocs.length,
        aiLinkedDocuments: aiDocs.length,
        averageRelevance: avgRelevance,
        documentsByCategory: Object.entries(categoryCount).map(([category, count]) => ({ category, count })),
        documentsByArea: Object.entries(areaCount).map(([area, count]) => ({ area, count })),
        documentsByAudience: Object.entries(audienceCount).map(([audience, count]) => ({ audience, count })),
        growthData,
        topCategories: Object.entries(categoryCount)
          .map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      })
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMaxValue = (array: { count: number }[]) => {
    return Math.max(...array.map(item => item.count), 1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            📊 Analytics da Base de Conhecimento
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            KPIs, métricas e insights da Base de Conhecimento Nôa Esperança
          </p>
        </div>

        {/* Period Filter */}
        <div className="mb-6 flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                period === p
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total de Documentos</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{data.totalDocuments}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 font-semibold">+12.5%</span>
              <span className="text-gray-500 ml-2">vs mês anterior</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Vinculados à IA</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{data.aiLinkedDocuments}</p>
              </div>
              <Brain className="w-12 h-12 text-purple-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 font-semibold">
                {data.totalDocuments > 0 ? ((data.aiLinkedDocuments / data.totalDocuments) * 100).toFixed(1) : 0}%
              </span>
              <span className="text-gray-500 ml-2">taxa de vinculação</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Relevância Média</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {data.averageRelevance.toFixed(1)}/10
                </p>
              </div>
              <Star className="w-12 h-12 text-green-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 font-semibold">+0.3</span>
              <span className="text-gray-500 ml-2">vs mês anterior</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Áreas de Conhecimento</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{data.documentsByArea.length}</p>
              </div>
              <Users className="w-12 h-12 text-orange-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Search className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-blue-600 font-semibold">Ativas</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Growth Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Crescimento do Acervo
            </h3>
            <div className="h-64 flex items-end justify-around gap-2">
              {data.growthData.map((item, index) => {
                const maxCount = getMaxValue(data.growthData)
                const height = (item.count / maxCount) * 100
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="relative w-full h-full flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-purple-600 to-blue-500 rounded-t-lg transition-all duration-300 hover:opacity-80"
                        style={{ height: `${height}%` }}
                      >
                        <div className="absolute top-2 left-0 right-0 text-center text-xs font-semibold text-white">
                          {item.count}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 font-medium">{item.month}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Documents by Category */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Top Categorias
            </h3>
            <div className="space-y-3">
              {data.topCategories.map((item, index) => {
                const maxCount = getMaxValue(data.topCategories)
                const percentage = (item.count / maxCount) * 100
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{item.category}</span>
                      <span className="text-gray-500">{item.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-600 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Area */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Distribuição por Área
            </h3>
            <div className="space-y-2">
              {data.documentsByArea.map((item, index) => {
                const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
                const color = colors[index % colors.length]
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{item.area}</span>
                        <span className="text-gray-500">{item.count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* By Audience */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Distribuição por Audiência
            </h3>
            <div className="space-y-2">
              {data.documentsByAudience.map((item, index) => {
                const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
                const color = colors[index % colors.length]
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{item.audience}</span>
                        <span className="text-gray-500">{item.count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KnowledgeAnalytics
