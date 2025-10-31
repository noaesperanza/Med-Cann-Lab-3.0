import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  BookOpen, 
  FlaskConical, 
  Stethoscope, 
  ChevronRight,
  Users,
  GraduationCap,
  User
} from 'lucide-react'

const EixoSelector: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [selectedEixo, setSelectedEixo] = useState<string | null>(null)

  const eixos = [
    {
      id: 'ensino',
      nome: 'Ensino',
      descricao: 'Pós-graduação em Cannabis Medicinal e Arte da Entrevista Clínica',
      cor: 'from-green-600 to-emerald-500',
      icone: BookOpen,
      tiposDisponiveis: ['profissional', 'aluno']
    },
    {
      id: 'pesquisa',
      nome: 'Pesquisa',
      descricao: 'Pesquisa científica em Cannabis Medicinal e Nefrologia',
      cor: 'from-purple-600 to-pink-500',
      icone: FlaskConical,
      tiposDisponiveis: ['profissional', 'aluno']
    },
    {
      id: 'clinica',
      nome: 'Clínica',
      descricao: 'Prática clínica com metodologia Arte da Entrevista Clínica',
      cor: 'from-blue-600 to-cyan-500',
      icone: Stethoscope,
      tiposDisponiveis: ['profissional', 'paciente']
    }
  ]

  const tipos = [
    {
      id: 'profissional',
      nome: 'Profissional',
      descricao: 'Médicos e profissionais de saúde',
      icone: Users,
      cor: 'from-blue-500 to-cyan-400'
    },
    {
      id: 'aluno',
      nome: 'Aluno',
      descricao: 'Estudantes de medicina',
      icone: GraduationCap,
      cor: 'from-green-500 to-emerald-400'
    },
    {
      id: 'paciente',
      nome: 'Paciente',
      descricao: 'Pacientes em tratamento',
      icone: User,
      cor: 'from-pink-500 to-purple-400'
    }
  ]

  const handleEixoSelect = (eixoId: string) => {
    setSelectedEixo(eixoId)
  }

  const handleTipoSelect = (tipoId: string) => {
    if (selectedEixo) {
      navigate(`/eixo/${selectedEixo}/tipo/${tipoId}`)
    }
  }

  const getTiposDisponiveis = () => {
    if (!selectedEixo) return []
    const eixo = eixos.find(e => e.id === selectedEixo)
    return tipos.filter(tipo => eixo?.tiposDisponiveis.includes(tipo.id))
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">
          Selecionar Área de Trabalho
        </h1>
        <p className="text-slate-300 text-lg">
          Escolha o eixo e tipo de usuário para acessar sua área específica
        </p>
      </div>

      {/* Seleção de Eixo */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">1. Escolha o Eixo</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {eixos.map((eixo) => {
            const Icon = eixo.icone
            const isSelected = selectedEixo === eixo.id
            return (
              <div
                key={eixo.id}
                onClick={() => handleEixoSelect(eixo.id)}
                className={`p-6 rounded-xl cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'bg-gradient-to-r ' + eixo.cor + ' shadow-lg scale-105' 
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <h3 className={`text-lg font-semibold ${isSelected ? 'text-white' : 'text-white'}`}>
                    {eixo.nome}
                  </h3>
                </div>
                <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                  {eixo.descricao}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Seleção de Tipo */}
      {selectedEixo && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">2. Escolha o Tipo de Usuário</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getTiposDisponiveis().map((tipo) => {
              const Icon = tipo.icone
              return (
                <div
                  key={tipo.id}
                  onClick={() => handleTipoSelect(tipo.id)}
                  className="p-6 rounded-xl cursor-pointer transition-all duration-200 bg-gradient-to-r hover:shadow-lg hover:scale-105"
                  style={{ background: `linear-gradient(to right, ${tipo.cor.split(' ')[1]}, ${tipo.cor.split(' ')[3]})` }}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <Icon className="w-6 h-6 text-white" />
                    <h3 className="text-lg font-semibold text-white">
                      {tipo.nome}
                    </h3>
                  </div>
                  <p className="text-sm text-white/90">
                    {tipo.descricao}
                  </p>
                  <div className="mt-3 flex items-center text-white/80">
                    <span className="text-sm">Acessar área</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Informações do Usuário Atual */}
      <div className="bg-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm">Usuário atual</p>
            <p className="text-white font-semibold">{user?.name}</p>
            <p className="text-slate-300 text-sm">Tipo: {user?.type}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-sm">Acesso</p>
            <p className="text-green-400 text-sm">Admin - Todos os eixos</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EixoSelector
