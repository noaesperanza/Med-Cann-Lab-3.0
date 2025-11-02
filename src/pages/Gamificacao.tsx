import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Award, 
  Star, 
  Zap, 
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  Shield,
  Heart,
  Brain,
  BookOpen,
  Stethoscope,
  MessageCircle,
  BarChart3
} from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  points: number
  category: 'learning' | 'clinical' | 'social' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  isUnlocked: boolean
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
}

interface NFT {
  id: string
  name: string
  description: string
  image: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  value: number
  isOwned: boolean
  canTrade: boolean
  category: 'escute-se' | 'achievement' | 'special'
}

interface DailyGoal {
  id: string
  title: string
  description: string
  points: number
  isCompleted: boolean
  progress: number
  maxProgress: number
  category: 'learning' | 'clinical' | 'social'
}

const Gamificacao: React.FC = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'achievements', name: 'Conquistas', icon: <span className="text-lg">🏆</span> },
    { id: 'nfts', name: 'NFTs', icon: <span className="text-lg">💎</span> },
    { id: 'goals', name: 'Metas', icon: <span className="text-lg">🎯</span> },
    { id: 'leaderboard', name: 'Ranking', icon: <span className="text-lg">👑</span> }
  ]

  const userStats = {
    totalPoints: 15420,
    level: 12,
    rank: 45,
    nftsOwned: 8,
    achievementsUnlocked: 23,
    streak: 7,
    weeklyPoints: 1250,
    monthlyPoints: 4200
  }

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Primeira Avaliação',
      description: 'Complete sua primeira avaliação clínica',
      icon: <Stethoscope className="w-6 h-6" />,
      points: 100,
      category: 'clinical',
      rarity: 'common',
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Curso Concluído',
      description: 'Complete um curso completo',
      icon: <BookOpen className="w-6 h-6" />,
      points: 500,
      category: 'learning',
      rarity: 'rare',
      isUnlocked: true,
      unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      title: 'Comunidade Ativa',
      description: 'Participe de 10 discussões no fórum',
      icon: <MessageCircle className="w-6 h-6" />,
      points: 200,
      category: 'social',
      rarity: 'common',
      isUnlocked: false,
      progress: 7,
      maxProgress: 10
    },
    {
      id: '4',
      title: 'Especialista em Cannabis',
      description: 'Complete 50 avaliações relacionadas à cannabis',
      icon: <Heart className="w-6 h-6" />,
      points: 1000,
      category: 'clinical',
      rarity: 'epic',
      isUnlocked: false,
      progress: 23,
      maxProgress: 50
    },
    {
      id: '5',
      title: 'Mestre da Metodologia AEC',
      description: 'Demonstre domínio completo da metodologia AEC',
      icon: <Brain className="w-6 h-6" />,
      points: 2000,
      category: 'special',
      rarity: 'legendary',
      isUnlocked: false,
      progress: 0,
      maxProgress: 1
    }
  ]

  const nfts: NFT[] = [
    {
      id: '1',
      name: 'Escute-se #001',
      description: 'NFT fundador da comunidade MedCannLab',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+QjzwvdGV4dD4KPC9zdmc+',
      rarity: 'legendary',
      value: 1000,
      isOwned: true,
      canTrade: true,
      category: 'escute-se'
    },
    {
      id: '2',
      name: 'Avaliador Clínico',
      description: 'Conquistado por completar 10 avaliações clínicas',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+QjzwvdGV4dD4KPC9zdmc+',
      rarity: 'rare',
      value: 250,
      isOwned: true,
      canTrade: false,
      category: 'achievement'
    },
    {
      id: '3',
      name: 'Especialista em Cannabis',
      description: 'Reconhecimento por expertise em cannabis medicinal',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+QjzwvdGV4dD4KPC9zdmc+',
      rarity: 'epic',
      value: 500,
      isOwned: false,
      canTrade: true,
      category: 'achievement'
    },
    {
      id: '4',
      name: 'Mentor da Comunidade',
      description: 'NFT especial para mentores ativos',
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+8J+QjzwvdGV4dD4KPC9zdmc+',
      rarity: 'legendary',
      value: 2000,
      isOwned: false,
      canTrade: true,
      category: 'special'
    }
  ]

  const dailyGoals: DailyGoal[] = [
    {
      id: '1',
      title: 'Avaliação Clínica',
      description: 'Complete uma avaliação clínica',
      points: 50,
      isCompleted: true,
      progress: 1,
      maxProgress: 1,
      category: 'clinical'
    },
    {
      id: '2',
      title: 'Participação no Fórum',
      description: 'Comente em 3 discussões',
      points: 30,
      isCompleted: false,
      progress: 2,
      maxProgress: 3,
      category: 'social'
    },
    {
      id: '3',
      title: 'Estudo Diário',
      description: 'Assista a 1 aula ou leia 1 artigo',
      points: 25,
      isCompleted: false,
      progress: 0,
      maxProgress: 1,
      category: 'learning'
    }
  ]

  const leaderboard = [
    { rank: 1, name: 'Dr. Maria Santos', points: 25420, level: 18, nfts: 12 },
    { rank: 2, name: 'Dr. Carlos Oliveira', points: 23890, level: 17, nfts: 10 },
    { rank: 3, name: 'Dra. Ana Costa', points: 22150, level: 16, nfts: 9 },
    { rank: 4, name: 'Dr. Pedro Lima', points: 19800, level: 15, nfts: 8 },
    { rank: 5, name: 'Dr. João Silva', points: 18750, level: 14, nfts: 7 }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'text-gray-600 dark:text-gray-400'
      case 'rare':
        return 'text-blue-600 dark:text-blue-400'
      case 'epic':
        return 'text-purple-600 dark:text-purple-400'
      case 'legendary':
        return 'text-yellow-600 dark:text-yellow-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getRarityBg = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 dark:bg-gray-800'
      case 'rare':
        return 'bg-blue-100 dark:bg-blue-900/20'
      case 'epic':
        return 'bg-purple-100 dark:bg-purple-900/20'
      case 'legendary':
        return 'bg-yellow-100 dark:bg-yellow-900/20'
      default:
        return 'bg-gray-100 dark:bg-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'learning':
        return <BookOpen className="w-4 h-4" />
      case 'clinical':
        return <Stethoscope className="w-4 h-4" />
      case 'social':
        return <MessageCircle className="w-4 h-4" />
      case 'special':
        return <span className="text-lg">👑</span>
      default:
        return <Award className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white mb-2">
            Gamificação e Engajamento
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Ganhe pontos, desbloqueie conquistas e colete NFTs únicos
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* User Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6 text-center">
                <span className="text-4xl mx-auto mb-2 block">🏆</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white">
                  {userStats.totalPoints.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Pontos Totais</div>
              </div>
              <div className="card p-6 text-center">
                <span className="text-4xl mx-auto mb-2 block">👑</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white">
                  Nível {userStats.level}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Rank #{userStats.rank}</div>
              </div>
              <div className="card p-6 text-center">
                <span className="text-4xl mx-auto mb-2 block">💎</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white">
                  {userStats.nftsOwned}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">NFTs Coletados</div>
              </div>
              <div className="card p-6 text-center">
                <span className="text-4xl mx-auto mb-2 block">🔥</span>
                <div className="text-2xl font-bold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white">
                  {userStats.streak}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Dias Consecutivos</div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white mb-4">
                Conquistas Recentes
              </h3>
              <div className="space-y-4">
                {achievements.filter(a => a.isUnlocked).slice(0, 3).map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-slate-100/30 dark:bg-slate-800/50 rounded-lg">
                    <div className={`p-3 rounded-lg ${getRarityBg(achievement.rarity)}`}>
                      <div className={getRarityColor(achievement.rarity)}>
                        {achievement.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900 dark:text-white dark:text-slate-900 dark:text-white">
                        {achievement.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {achievement.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">
                        +{achievement.points}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        pontos
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Goals */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white mb-4">
                Metas de Hoje
              </h3>
              <div className="space-y-4">
                {dailyGoals.map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-4 bg-slate-100/30 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        goal.isCompleted ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {goal.isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white dark:text-slate-900 dark:text-white">
                          {goal.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {goal.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">
                        +{goal.points}
                      </div>
                      {!goal.isCompleted && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {goal.progress}/{goal.maxProgress}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={`card p-6 ${achievement.isUnlocked ? '' : 'opacity-60'}`}>
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${getRarityBg(achievement.rarity)}`}>
                      <div className={getRarityColor(achievement.rarity)}>
                        {achievement.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white">
                          {achievement.title}
                        </h3>
                        {achievement.isUnlocked && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(achievement.category)}
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {achievement.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary-600">
                            {achievement.points}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            pontos
                          </div>
                        </div>
                      </div>
                      {!achievement.isUnlocked && achievement.progress !== undefined && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Progresso</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(achievement.progress / (achievement.maxProgress || 100)) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NFTs Tab */}
        {activeTab === 'nfts' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {nfts.map((nft) => (
                <div key={nft.id} className={`card p-6 ${nft.isOwned ? '' : 'opacity-60'}`}>
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-6xl text-gray-400">💎</span>
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white mb-2">
                      {nft.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {nft.description}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getRarityBg(nft.rarity)} ${getRarityColor(nft.rarity)}`}>
                        {nft.rarity}
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-white dark:text-slate-900 dark:text-white">
                        {nft.value} pts
                      </span>
                    </div>
                    {nft.isOwned ? (
                      <div className="flex space-x-2">
                        <button className="flex-1 btn-secondary text-sm">
                          Ver Detalhes
                        </button>
                        {nft.canTrade && (
                          <button className="flex-1 btn-primary text-sm">
                            Trocar
                          </button>
                        )}
                      </div>
                    ) : (
                      <button className="w-full btn-secondary text-sm" disabled>
                        Não Possuído
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white mb-4">
                Metas Diárias
              </h3>
              <div className="space-y-4">
                {dailyGoals.map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-4 bg-slate-100/30 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        goal.isCompleted ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {goal.isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white dark:text-slate-900 dark:text-white">
                          {goal.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {goal.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">
                        +{goal.points}
                      </div>
                      {!goal.isCompleted && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {goal.progress}/{goal.maxProgress}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white dark:text-slate-900 dark:text-white mb-4">
                Ranking da Comunidade
              </h3>
              <div className="space-y-4">
                {leaderboard.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-100/30 dark:bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 font-bold">
                        {user.rank}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white dark:text-slate-900 dark:text-white">
                          {user.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Nível {user.level} • {user.nfts} NFTs
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">
                        {user.points.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        pontos
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Gamificacao
