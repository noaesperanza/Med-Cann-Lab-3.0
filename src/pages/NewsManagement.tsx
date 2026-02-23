import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Eye, Calendar, Tag, FileText } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface NewsItem {
  id?: string
  title: string
  summary: string
  content?: string
  category: 'cannabis-medicinal' | 'pesquisa-clinica' | 'metodologia-aec' | 'regulamentacao' | 'nefrologia' | 'clinica' | 'pesquisa' | 'farmacologia'
  author: string
  date: string
  readTime?: string
  impact?: 'high' | 'medium' | 'low'
  source?: string
  url?: string
  tags?: string[]
  imageUrl?: string
  published: boolean
  created_at?: string
  updated_at?: string
  created_by?: string
}

const NewsManagement: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showPreview, setShowPreview] = useState(false)

  const categories = [
    { key: 'all', label: 'Todas' },
    { key: 'cannabis-medicinal', label: 'Cannabis Medicinal' },
    { key: 'pesquisa-clinica', label: 'Pesquisa Clínica' },
    { key: 'metodologia-aec', label: 'Metodologia AEC' },
    { key: 'regulamentacao', label: 'Regulamentação' },
    { key: 'nefrologia', label: 'Nefrologia' },
    { key: 'clinica', label: 'Clínica' },
    { key: 'pesquisa', label: 'Pesquisa' },
    { key: 'farmacologia', label: 'Farmacologia' }
  ]

  useEffect(() => {
    loadNewsItems()
  }, [selectedCategory])

  const loadNewsItems = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('news_items')
        .select('*')
        .order('date', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) {
        console.error('Erro ao carregar notícias:', error)
        // Se a tabela não existir, usar dados mockados
        setNewsItems([])
      } else {
        setNewsItems((data || []) as any)
      }
    } catch (error) {
      console.error('Erro ao carregar notícias:', error)
      setNewsItems([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNew = () => {
    const newItem: NewsItem = {
      title: '',
      summary: '',
      content: '',
      category: 'cannabis-medicinal',
      author: user?.name || '',
      date: new Date().toISOString().split('T')[0],
      readTime: '5 min',
      impact: 'medium',
      published: false,
      tags: []
    }
    setEditingItem(newItem)
    setIsEditing(true)
  }

  const handleEdit = (item: NewsItem) => {
    setEditingItem({ ...item })
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!editingItem) return

    try {
      if (editingItem.id) {
        // Atualizar
        const { error } = await supabase
          .from('news_items')
          .update({
            ...editingItem,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id)

        if (error) throw error
      } else {
        // Criar novo
        const { error } = await supabase
          .from('news_items')
          .insert({
            ...editingItem,
            created_by: user?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error) throw error
      }

      setIsEditing(false)
      setEditingItem(null)
      loadNewsItems()
    } catch (error) {
      console.error('Erro ao salvar notícia:', error)
      alert('Erro ao salvar notícia. Verifique se a tabela news_items existe no banco de dados.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return

    try {
      const { error } = await supabase
        .from('news_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      loadNewsItems()
    } catch (error) {
      console.error('Erro ao excluir notícia:', error)
      alert('Erro ao excluir notícia.')
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingItem(null)
  }

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.key === category)?.label || category
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">📰 Gestão de Notícias</h1>
              <p className="text-slate-400 mt-1">Crie e gerencie notícias para a plataforma</p>
            </div>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Notícia</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editor ou Lista */}
        {isEditing && editingItem ? (
          <div className="bg-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingItem.id ? 'Editar Notícia' : 'Nova Notícia'}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulário */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título *</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="Título da notícia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Resumo *</label>
                  <textarea
                    value={editingItem.summary}
                    onChange={(e) => setEditingItem({ ...editingItem, summary: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-green-500"
                    rows={3}
                    placeholder="Resumo da notícia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Conteúdo Completo</label>
                  <textarea
                    value={editingItem.content || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-green-500"
                    rows={10}
                    placeholder="Conteúdo completo da notícia (opcional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Categoria *</label>
                    <select
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as NewsItem['category'] })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-green-500"
                    >
                      {categories.filter(c => c.key !== 'all').map(cat => (
                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Data *</label>
                    <input
                      type="date"
                      value={editingItem.date}
                      onChange={(e) => setEditingItem({ ...editingItem, date: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Autor *</label>
                    <input
                      type="text"
                      value={editingItem.author}
                      onChange={(e) => setEditingItem({ ...editingItem, author: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-green-500"
                      placeholder="Nome do autor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tempo de Leitura</label>
                    <input
                      type="text"
                      value={editingItem.readTime || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, readTime: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-green-500"
                      placeholder="Ex: 5 min"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Impacto</label>
                    <select
                      value={editingItem.impact || 'medium'}
                      onChange={(e) => setEditingItem({ ...editingItem, impact: e.target.value as 'high' | 'medium' | 'low' })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-green-500"
                    >
                      <option value="high">Alto</option>
                      <option value="medium">Médio</option>
                      <option value="low">Baixo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Publicado</label>
                    <select
                      value={editingItem.published ? 'true' : 'false'}
                      onChange={(e) => setEditingItem({ ...editingItem, published: e.target.value === 'true' })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-green-500"
                    >
                      <option value="false">Rascunho</option>
                      <option value="true">Publicado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">URL da Imagem</label>
                  <input
                    type="url"
                    value={editingItem.imageUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={editingItem.tags?.join(', ') || ''}
                    onChange={(e) => setEditingItem({ 
                      ...editingItem, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                    })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="cannabis, nefrologia, pesquisa"
                  />
                </div>
              </div>

              {/* Preview */}
              {showPreview && (
                <div className="bg-slate-700 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Preview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Tag className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">{getCategoryLabel(editingItem.category)}</span>
                      </div>
                      <h4 className="text-lg font-bold mb-2">{editingItem.title || 'Título da notícia'}</h4>
                      <p className="text-slate-300 text-sm mb-2">{editingItem.summary || 'Resumo da notícia'}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{editingItem.date}</span>
                        </span>
                        {editingItem.readTime && (
                          <span className="flex items-center space-x-1">
                            <FileText className="w-3 h-3" />
                            <span>{editingItem.readTime}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Lista de Notícias */
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-slate-400">Carregando notícias...</p>
              </div>
            ) : newsItems.length === 0 ? (
              <div className="bg-slate-800 rounded-lg p-12 text-center">
                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">Nenhuma notícia encontrada.</p>
                <p className="text-slate-500 text-sm mb-6">
                  {selectedCategory !== 'all' 
                    ? `Nenhuma notícia na categoria "${getCategoryLabel(selectedCategory)}"` 
                    : 'Crie sua primeira notícia clicando em "Nova Notícia"'}
                </p>
                {selectedCategory === 'all' && (
                  <button
                    onClick={handleCreateNew}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    Criar Primeira Notícia
                  </button>
                )}
              </div>
            ) : (
              newsItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-800 rounded-lg p-6 hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                          {getCategoryLabel(item.category)}
                        </span>
                        {item.published ? (
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">Publicado</span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">Rascunho</span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-slate-400 mb-4">{item.summary}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <span>{item.author}</span>
                        <span>•</span>
                        <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                        {item.readTime && (
                          <>
                            <span>•</span>
                            <span>{item.readTime}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5 text-blue-400" />
                      </button>
                      <button
                        onClick={() => item.id && handleDelete(item.id)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default NewsManagement

