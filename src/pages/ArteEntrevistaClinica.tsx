import React, { useState } from 'react'
import { 
  Stethoscope, 
  Heart, 
  Brain, 
  Users, 
  CheckCircle, 
  Clock,
  MessageCircle,
  FileText,
  User,
  Activity,
  Zap,
  Target
} from 'lucide-react'

const ArteEntrevistaClinica: React.FC = () => {
  const [etapaAtual, setEtapaAtual] = useState(0)
  const [dadosPaciente, setDadosPaciente] = useState({
    nome: '',
    idade: '',
    queixaPrincipal: '',
    historiaAtual: '',
    antecedentes: '',
    medicamentos: '',
    alergias: '',
    habitos: '',
    familia: '',
    social: ''
  })

  const etapasAEC = [
    {
      id: 'rapport',
      titulo: 'Estabelecimento de Rapport',
      descricao: 'Criar conexão empática e ambiente de confiança',
      icone: <Heart className="w-6 h-6" />,
      cor: 'pink',
      tecnicas: [
        'Cumprimento caloroso e pessoal',
        'Apresentação clara do papel',
        'Demonstração de interesse genuíno',
        'Criação de ambiente acolhedor'
      ]
    },
    {
      id: 'anamnese',
      titulo: 'Anamnese Estruturada',
      descricao: 'Coleta sistemática de informações clínicas',
      icone: <FileText className="w-6 h-6" />,
      cor: 'blue',
      tecnicas: [
        'Queixa principal em palavras do paciente',
        'História da doença atual',
        'Antecedentes pessoais e familiares',
        'Medicamentos e alergias'
      ]
    },
    {
      id: 'imre',
      titulo: 'Avaliação IMRE Triaxial',
      descricao: 'Análise dos três eixos: Somático, Psíquico e Social',
      icone: <Target className="w-6 h-6" />,
      cor: 'green',
      tecnicas: [
        'Eixo Somático: Sintomas físicos',
        'Eixo Psíquico: Estado emocional e cognitivo',
        'Eixo Social: Relações e ambiente',
        'Correlações entre os eixos'
      ]
    },
    {
      id: 'exame',
      titulo: 'Exame Físico',
      descricao: 'Avaliação física sistemática',
      icone: <Stethoscope className="w-6 h-6" />,
      cor: 'red',
      tecnicas: [
        'Inspeção geral',
        'Palpação de áreas relevantes',
        'Ausculta quando necessário',
        'Avaliação de sinais vitais'
      ]
    },
    {
      id: 'sintese',
      titulo: 'Síntese e Orientação',
      descricao: 'Consolidação dos dados e orientações',
      icone: <CheckCircle className="w-6 h-6" />,
      cor: 'purple',
      tecnicas: [
        'Resumo da consulta',
        'Explicação do diagnóstico',
        'Orientações terapêuticas',
        'Plano de acompanhamento'
      ]
    }
  ]

  const proximaEtapa = () => {
    if (etapaAtual < etapasAEC.length - 1) {
      setEtapaAtual(etapaAtual + 1)
    }
  }

  const etapaAnterior = () => {
    if (etapaAtual > 0) {
      setEtapaAtual(etapaAtual - 1)
    }
  }

  const etapaAtualData = etapasAEC[etapaAtual]

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Arte da Entrevista Clínica
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Metodologia AEC - Nôa Esperança
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((etapaAtual + 1) / etapasAEC.length) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between text-sm text-gray-400">
            <span>Etapa {etapaAtual + 1} de {etapasAEC.length}</span>
            <span>{Math.round(((etapaAtual + 1) / etapasAEC.length) * 100)}% Completo</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Etapas Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Etapas da AEC
              </h3>
              
              <div className="space-y-3">
                {etapasAEC.map((etapa, index) => (
                  <button
                    key={etapa.id}
                    onClick={() => setEtapaAtual(index)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      index === etapaAtual
                        ? 'bg-purple-600 text-white'
                        : index < etapaAtual
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {index < etapaAtual ? (
                        <CheckCircle className="w-5 h-5 text-green-300" />
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          index === etapaAtual ? 'border-white' : 'border-gray-400'
                        }`} />
                      )}
                      <div>
                        <div className="font-medium">{etapa.titulo}</div>
                        <div className="text-sm opacity-80">{etapa.descricao}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-lg p-6">
              {/* Etapa Atual */}
              <div className="mb-6">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium mb-4 bg-${etapaAtualData.cor}-500/20 text-${etapaAtualData.cor}-300`}>
                  {etapaAtualData.icone}
                  <span className="ml-2">{etapaAtualData.titulo}</span>
                </div>
                
                <h2 className="text-2xl font-bold mb-4">{etapaAtualData.titulo}</h2>
                <p className="text-gray-300 mb-6">{etapaAtualData.descricao}</p>
              </div>

              {/* Técnicas da Etapa */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-400" />
                  Técnicas Específicas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {etapaAtualData.tecnicas.map((tecnica, index) => (
                    <div key={index} className="bg-slate-700 p-4 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="text-sm">{tecnica}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formulário de Dados */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-green-400" />
                  Dados do Paciente
                </h3>
                
                <div className="space-y-4">
                  {etapaAtual === 0 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Nome do Paciente</label>
                        <input
                          type="text"
                          value={dadosPaciente.nome}
                          onChange={(e) => setDadosPaciente(prev => ({ ...prev, nome: e.target.value }))}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Digite o nome do paciente"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Idade</label>
                        <input
                          type="number"
                          value={dadosPaciente.idade}
                          onChange={(e) => setDadosPaciente(prev => ({ ...prev, idade: e.target.value }))}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="Idade do paciente"
                        />
                      </div>
                    </>
                  )}
                  
                  {etapaAtual === 1 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Queixa Principal</label>
                        <textarea
                          value={dadosPaciente.queixaPrincipal}
                          onChange={(e) => setDadosPaciente(prev => ({ ...prev, queixaPrincipal: e.target.value }))}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
                          placeholder="Descreva a queixa principal em palavras do paciente"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">História da Doença Atual</label>
                        <textarea
                          value={dadosPaciente.historiaAtual}
                          onChange={(e) => setDadosPaciente(prev => ({ ...prev, historiaAtual: e.target.value }))}
                          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
                          placeholder="Descreva a evolução dos sintomas"
                        />
                      </div>
                    </>
                  )}
                  
                  {etapaAtual === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-600/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-300 mb-2">Eixo Somático</h4>
                        <textarea
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm h-20"
                          placeholder="Sintomas físicos..."
                        />
                      </div>
                      <div className="bg-blue-600/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-300 mb-2">Eixo Psíquico</h4>
                        <textarea
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm h-20"
                          placeholder="Estado emocional..."
                        />
                      </div>
                      <div className="bg-purple-600/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-300 mb-2">Eixo Social</h4>
                        <textarea
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm h-20"
                          placeholder="Relações sociais..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navegação */}
              <div className="flex justify-between">
                <button
                  onClick={etapaAnterior}
                  disabled={etapaAtual === 0}
                  className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Etapa Anterior
                </button>
                
                <button
                  onClick={proximaEtapa}
                  disabled={etapaAtual === etapasAEC.length - 1}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {etapaAtual === etapasAEC.length - 1 ? 'Finalizar' : 'Próxima Etapa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArteEntrevistaClinica
