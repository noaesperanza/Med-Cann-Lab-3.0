import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Search,
  Plus,
  User,
  FileText,
  Download,
  Upload,
  Folder,
  TrendingUp,
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  UserPlus,
  FileEdit,
  Camera,
  Clock,
  Activity,
  Target
} from 'lucide-react'

interface Patient {
  id: string
  name: string
  age: number
  months: number
  days: number
  phone: string
  cpf: string
  code: string
  photo: string
  specialty: string
  clinic: string
  room: string
  referringDoctor: string
  status: 'active' | 'inactive'
  appointmentsCount: number
  absences: number
  servicesCount: number
}

interface Evolution {
  id: string
  date: string
  time: string
  type: 'current' | 'historical'
  content: string
  professional: string
}

const PatientsManagement: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
  const [selectedClinic, setSelectedClinic] = useState<string>('rio-bonito')
  const [selectedRoom, setSelectedRoom] = useState<string>('indifferent')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'evolution' | 'prescription' | 'files' | 'receipts' | 'charts'>('overview')
  const [showNewEvolution, setShowNewEvolution] = useState(false)
  const [evolutionContent, setEvolutionContent] = useState('')

  const specialties = [
    { id: 'none', name: 'Sem especialidade' },
    { id: 'cannabis', name: 'Cannabis Medicinal' },
    { id: 'nephrology', name: 'Nefrologia' },
    { id: 'pain', name: 'Dor' },
    { id: 'psychiatry', name: 'Psiquiatria' }
  ]

  const clinics = [
    { id: 'rio-bonito', name: 'Rio Bonito' },
    { id: 'consultorio-ricardo', name: 'Consultório Dr. Ricardo Valença' },
    { id: 'consultorio-eduardo', name: 'Consultório Dr. Eduardo Faveret' }
  ]

  const rooms = [
    { id: 'indifferent', name: 'Indiferente' },
    { id: 'room-1', name: 'Sala 1' },
    { id: 'room-2', name: 'Sala 2' },
    { id: 'room-3', name: 'Sala 3' }
  ]

  const mockPatients: Patient[] = [
    {
      id: '1',
      name: 'Paulo Gonçalves',
      age: 45,
      months: 3,
      days: 15,
      phone: '(21) 98765-4321',
      cpf: '123.456.789-00',
      code: '#PAT001',
      photo: '',
      specialty: 'Cannabis Medicinal',
      clinic: 'Consultório Dr. Ricardo Valença',
      room: 'Sala 1',
      referringDoctor: 'Dr. Ricardo Valença',
      status: 'active',
      appointmentsCount: 4,
      absences: 0,
      servicesCount: 5
    }
  ]

  const filteredPatients = mockPatients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm) ||
    patient.code.includes(searchTerm.toUpperCase())
  )

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setActiveTab('overview')
  }

  const handleSaveEvolution = () => {
    console.log('Evolução salva:', evolutionContent)
    setShowNewEvolution(false)
    setEvolutionContent('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/app/professional-dashboard')}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Prontuário Eletrônico</h1>
                <p className="text-slate-400">Gestão de Pacientes e Atendimentos</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/app/new-patient')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span>Novo Paciente</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters Bar */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8 border border-slate-700/50">
          <h2 className="text-xl font-bold text-white mb-4">Filtros de Busca</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Specialty Filter */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Todas as Especialidades</option>
              {specialties.map(spec => (
                <option key={spec.id} value={spec.id}>{spec.name}</option>
              ))}
            </select>

            {/* Clinic Filter */}
            <select
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {clinics.map(clinic => (
                <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
              ))}
            </select>

            {/* Room Filter */}
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patients List - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">Pacientes Ativos</h3>
                <p className="text-sm text-slate-400">Total: {filteredPatients.length}</p>
              </div>
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                {filteredPatients.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    className={`w-full p-4 text-left border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${
                      selectedPatient?.id === patient.id ? 'bg-slate-700' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        {patient.photo ? (
                          <img src={patient.photo} alt={patient.name} className="w-12 h-12 rounded-full" />
                        ) : (
                          <User className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{patient.name}</p>
                        <p className="text-xs text-slate-400">{patient.code} • {patient.cpf}</p>
                        <p className="text-xs text-slate-400">
                          {patient.appointmentsCount} atendimentos • {patient.absences} faltas
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Patient Details - Main Content */}
          <div className="lg:col-span-2">
            {selectedPatient ? (
              <div className="space-y-6">
                {/* Patient Header */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                        {selectedPatient.photo ? (
                          <img src={selectedPatient.photo} alt={selectedPatient.name} className="w-20 h-20 rounded-full" />
                        ) : (
                          <User className="w-10 h-10 text-white" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedPatient.name}</h2>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                          <span>{selectedPatient.age}a, {selectedPatient.months}m, {selectedPatient.days}d</span>
                          <span>•</span>
                          <span>{selectedPatient.code}</span>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{selectedPatient.phone}</span>
                          </div>
                          <span>•</span>
                          <span>{selectedPatient.cpf}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowNewEvolution(true)}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors"
                    >
                      Nova Evolução
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-white">{selectedPatient.appointmentsCount}</p>
                      <p className="text-sm text-slate-400">Atendimentos</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-white">{selectedPatient.absences}</p>
                      <p className="text-sm text-slate-400">Faltas</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-white">{selectedPatient.servicesCount}</p>
                      <p className="text-sm text-slate-400">Serviços</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                  <div className="border-b border-slate-700">
                    <div className="flex space-x-1 p-4">
                      {[
                        { id: 'overview', label: 'Visão Geral', icon: Activity },
                        { id: 'evolution', label: 'Evolução', icon: FileText },
                        { id: 'prescription', label: 'Prescrição Médica', icon: FileEdit },
                        { id: 'files', label: 'Arquivos', icon: Folder },
                        { id: 'receipts', label: 'Recebimentos', icon: Download },
                        { id: 'charts', label: 'Gráficos', icon: TrendingUp }
                      ].map(tab => {
                        const Icon = tab.icon
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                              activeTab === tab.id
                                ? 'bg-blue-500 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === 'overview' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-700/50 rounded-lg p-4">
                            <p className="text-sm text-slate-400 mb-1">Especialidade</p>
                            <p className="font-semibold text-white">{selectedPatient.specialty}</p>
                          </div>
                          <div className="bg-slate-700/50 rounded-lg p-4">
                            <p className="text-sm text-slate-400 mb-1">Unidade</p>
                            <p className="font-semibold text-white">{selectedPatient.clinic}</p>
                          </div>
                          <div className="bg-slate-700/50 rounded-lg p-4">
                            <p className="text-sm text-slate-400 mb-1">Sala</p>
                            <p className="font-semibold text-white">{selectedPatient.room}</p>
                          </div>
                          <div className="bg-slate-700/50 rounded-lg p-4">
                            <p className="text-sm text-slate-400 mb-1">Encaminhador</p>
                            <p className="font-semibold text-white">{selectedPatient.referringDoctor || 'Não informado'}</p>
                          </div>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-4">
                          <p className="text-sm text-slate-400 mb-2">Histórico</p>
                          <p className="text-slate-300">Não há informações para serem exibidas.</p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'evolution' && (
                      <div className="space-y-4">
                        {showNewEvolution && (
                          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Nova Evolução</h3>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Tipo de Evolução
                                </label>
                                <select className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                  <option value="current">Atual</option>
                                  <option value="historical">Histórico</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Evolução
                                </label>
                                <textarea
                                  value={evolutionContent}
                                  onChange={(e) => setEvolutionContent(e.target.value)}
                                  rows={6}
                                  placeholder="Digite a evolução... Use @ para modelos e # para tags"
                                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                              <div className="flex space-x-3">
                                <button
                                  onClick={handleSaveEvolution}
                                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors"
                                >
                                  Salvar Evolução
                                </button>
                                <button
                                  onClick={() => setShowNewEvolution(false)}
                                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="text-center text-slate-400 py-8">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                          <p>Nenhuma evolução registrada</p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'prescription' && (
                      <div className="text-center text-slate-400 py-8">
                        <FileEdit className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p>Nenhuma prescrição médica registrada</p>
                        <button
                          onClick={() => navigate('/app/prescriptions')}
                          className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors"
                        >
                          Nova Prescrição
                        </button>
                      </div>
                    )}

                    {activeTab === 'files' && (
                      <div className="text-center text-slate-400 py-8">
                        <Folder className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p>Nenhum arquivo anexado</p>
                        <button
                          className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                        >
                          <Upload className="w-5 h-5 inline mr-2" />
                          Upload de Arquivos
                        </button>
                      </div>
                    )}

                    {activeTab === 'receipts' && (
                      <div className="text-center text-slate-400 py-8">
                        <Download className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p>Nenhum recebimento registrado</p>
                      </div>
                    )}

                    {activeTab === 'charts' && (
                      <div className="text-center text-slate-400 py-8">
                        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p>Nenhum gráfico disponível</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-slate-700/50 text-center">
                <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Selecione um Paciente</h3>
                <p className="text-slate-400">Escolha um paciente da lista para visualizar o prontuário</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientsManagement
