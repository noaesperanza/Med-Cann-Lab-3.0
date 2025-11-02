import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft,
  User,
  Clock,
  FileText,
  BarChart3,
  Eye,
  Edit,
  Phone,
  Mail,
  MapPin,
  Heart,
  Activity,
  Plus,
  Video,
  Stethoscope,
  AlertCircle
} from 'lucide-react'

const PatientProfile: React.FC = () => {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'profile' | 'charts' | 'appointments' | 'chat' | 'files'>('profile')
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [appointmentData, setAppointmentData] = useState({
    date: '',
    time: '',
    type: 'presencial',
    specialty: '',
    service: '',
    room: '',
    notes: ''
  })


  // Mock data do paciente
  const patient = {
    id: patientId,
    name: 'Maria Silva',
    age: 45,
    gender: 'Feminino',
    email: 'maria.silva@email.com',
    phone: '(11) 99999-9999',
    address: 'São Paulo, SP',
    bloodType: 'O+',
    allergies: ['Penicilina', 'Amoxicilina'],
    medications: ['Losartana 50mg', 'Metformina 850mg'],
    diagnosis: 'Hipertensão e Diabetes Tipo 2',
    status: 'Média',
    lastConsultation: '2024-01-15',
    nextAppointment: '2024-02-15',
    doctor: 'Dr. João Silva',
    crm: '123456-SP',
    avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjOEI1Q0Y2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjMwIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPuKdpDwvdGV4dD4KPC9zdmc+',
    riskLevel: 'Médio',
    treatmentProgress: 65,
    totalConsultations: 12,
    emergencyContact: 'João Silva (Filho) - (11) 88888-8888'
  }

  // Mock dados de evolução
  const evolutionData = [
    {
      date: '2024-01-15',
      type: 'Consulta',
      description: 'Controle de pressão arterial. PA: 140/90 mmHg',
      doctor: 'Dr. João Silva',
      status: 'Concluída'
    },
    {
      date: '2024-01-10',
      type: 'Exame',
      description: 'Hemograma completo - Resultados dentro da normalidade',
      doctor: 'Dr. João Silva',
      status: 'Concluída'
    },
    {
      date: '2024-01-05',
      type: 'Consulta',
      description: 'Avaliação de glicemia. Glicemia: 120 mg/dL',
      doctor: 'Dr. João Silva',
      status: 'Concluída'
    }
  ]


  // Mock agendamentos
  const appointments = [
    {
      id: 1,
      date: '2024-02-15',
      time: '14:00',
      type: 'presencial',
      specialty: 'Cardiologia',
      service: 'Consulta de retorno',
      room: 'Sala 201',
      status: 'Agendado',
      notes: 'Trazer exames de sangue'
    },
    {
      id: 2,
      date: '2024-02-20',
      time: '10:00',
      type: 'online',
      specialty: 'Endocrinologia',
      service: 'Consulta online',
      room: 'Plataforma digital',
      status: 'Agendado',
      notes: 'Consulta por videochamada'
    }
  ]

  // Mock arquivos compartilhados
  const sharedFiles = [
    {
      id: 1,
      name: 'Hemograma_Jan2024.pdf',
      type: 'pdf',
      size: '2.3 MB',
      uploadedBy: 'Dr. João Silva',
      date: '2024-01-15',
      category: 'Exames'
    },
    {
      id: 2,
      name: 'Receita_Losartana.pdf',
      type: 'pdf',
      size: '1.1 MB',
      uploadedBy: 'Dr. João Silva',
      date: '2024-01-15',
      category: 'Receitas'
    },
    {
      id: 3,
      name: 'Relatorio_Consulta.pdf',
      type: 'pdf',
      size: '3.2 MB',
      uploadedBy: 'Dr. João Silva',
      date: '2024-01-15',
      category: 'Relatórios'
    }
  ]

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: <User className="w-4 h-4" /> },
    { id: 'charts', name: 'Gráficos', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'appointments', name: 'Agendamentos', icon: <Clock className="w-4 h-4" /> },
    { id: 'chat', name: 'Chat', icon: <Clock className="w-4 h-4" /> },
    { id: 'files', name: 'Arquivos', icon: <FileText className="w-4 h-4" /> }
  ]

  const handleScheduleAppointment = () => {
    setShowAppointmentModal(true)
  }

  const handleSaveAppointment = () => {
    // Salvar agendamento
    console.log('Agendamento salvo:', appointmentData)
    setShowAppointmentModal(false)
    setAppointmentData({
      date: '',
      time: '',
      type: 'presencial',
      specialty: '',
      service: '',
      room: '',
      notes: ''
    })
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Informações Básicas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center">
              <Mail className="w-4 h-4 text-slate-400 mr-3" />
              <span className="text-slate-300">{patient.email}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 text-slate-400 mr-3" />
              <span className="text-slate-300">{patient.phone}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-slate-400 mr-3" />
              <span className="text-slate-300">{patient.address}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <Heart className="w-4 h-4 text-slate-400 mr-3" />
              <span className="text-slate-300">Tipo Sanguíneo: {patient.bloodType}</span>
            </div>
            <div className="flex items-center">
              <AlertCircle className="w-4 h-4 text-slate-400 mr-3" />
              <span className="text-slate-300">Alergias: {patient.allergies.join(', ')}</span>
            </div>
            <div className="flex items-center">
              <Stethoscope className="w-4 h-4 text-slate-400 mr-3" />
              <span className="text-slate-300">Medicamentos: {patient.medications.join(', ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnóstico e Status */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Stethoscope className="w-5 h-5 mr-2" />
          Diagnóstico e Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-sm text-slate-400 mb-2">Diagnóstico Principal</h4>
            <p className="text-white font-medium">{patient.diagnosis}</p>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-sm text-slate-400 mb-2">Status</h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              patient.status === 'Média' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
            }`}>
              {patient.status}
            </span>
          </div>
          <div className="bg-slate-700 rounded-lg p-4">
            <h4 className="text-sm text-slate-400 mb-2">Nível de Risco</h4>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
              {patient.riskLevel}
            </span>
          </div>
        </div>
      </div>

      {/* Evolução do Tratamento */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Evolução do Tratamento
        </h3>
        <div className="space-y-4">
          {evolutionData.map((item, index) => (
            <div key={index} className="bg-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-slate-300 text-sm">{item.date}</span>
                    <span className="mx-2 text-slate-500">•</span>
                    <span className="text-slate-300 text-sm">{item.type}</span>
                  </div>
                  <p className="text-white mb-2">{item.description}</p>
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-slate-300 text-sm">{item.doctor}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.status === 'Concluída' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderChartsTab = () => (
    <div className="space-y-6">
      {/* Gráfico de Pressão Arterial */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Heart className="w-5 h-5 mr-2" />
          Pressão Arterial
        </h3>
        <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-400">Gráfico de Pressão Arterial</p>
            <p className="text-slate-500 text-sm">Última medição: 140/90 mmHg</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Glicemia */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Glicemia
        </h3>
        <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-12 h-12 text-green-400 mx-auto mb-2" />
            <p className="text-slate-400">Gráfico de Glicemia</p>
            <p className="text-slate-500 text-sm">Última medição: 120 mg/dL</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Peso */}
      <div className="bg-slate-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2" />
          Peso
        </h3>
        <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-12 h-12 text-blue-400 mx-auto mb-2" />
            <p className="text-slate-400">Gráfico de Peso</p>
            <p className="text-slate-500 text-sm">Última medição: 73 kg</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppointmentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Agendamentos para {patient.name}</h3>
        <button
          onClick={handleScheduleAppointment}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </button>
      </div>

      {/* Lista de agendamentos */}
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="bg-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Clock className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-white font-medium">{appointment.date}</span>
                  <span className="mx-2 text-slate-500">•</span>
                  <Clock className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-slate-300">{appointment.time}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Especialidade</p>
                    <p className="text-white">{appointment.specialty}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Serviço</p>
                    <p className="text-white">{appointment.service}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Tipo</p>
                    <div className="flex items-center">
                      {appointment.type === 'presencial' ? (
                        <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                      ) : (
                        <Video className="w-4 h-4 text-slate-400 mr-2" />
                      )}
                      <span className="text-white capitalize">{appointment.type}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Sala</p>
                    <p className="text-white">{appointment.room}</p>
                  </div>
                </div>
                {appointment.notes && (
                  <div className="mt-4">
                    <p className="text-slate-400 text-sm">Observações</p>
                    <p className="text-slate-300">{appointment.notes}</p>
                  </div>
                )}
              </div>
              <div className="ml-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  appointment.status === 'Agendado' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                }`}>
                  {appointment.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderChatTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Chat com {patient.name}</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-slate-400 text-sm">Online</span>
        </div>
      </div>
      
      <div className="bg-slate-800 rounded-xl p-8 text-center">
        <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h4 className="text-xl font-semibold text-white mb-2">Chat Exclusivo</h4>
        <p className="text-slate-400 mb-6">
          Acesse o chat exclusivo para conversar diretamente com {patient.name}
        </p>
        <button
          onClick={() => navigate(`/patient-chat/${patientId}`)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg flex items-center mx-auto transition-colors"
        >
            <Clock className="w-5 h-5 mr-2" />
          Abrir Chat Exclusivo
        </button>
      </div>
    </div>
  )

  const renderFilesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Arquivos Compartilhados</h3>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Enviar Arquivo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sharedFiles.map((file) => (
          <div key={file.id} className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-slate-400 mr-3" />
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-slate-400 text-sm">{file.size}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="text-slate-400 hover:text-white">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-slate-400 hover:text-white">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center">
                <User className="w-4 h-4 text-slate-400 mr-2" />
                <span className="text-slate-300 text-sm">{file.uploadedBy}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-slate-400 mr-2" />
                <span className="text-slate-300 text-sm">{file.date}</span>
              </div>
              <div className="flex items-center">
                <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                  {file.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/patients')}
                className="mr-4 p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </button>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center mr-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{patient.name}</h1>
                  <p className="text-slate-400">{patient.age} anos • {patient.gender}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(`/patient-chat/${patientId}`)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                <Clock className="w-4 h-4 mr-2" />
                Chat Exclusivo
              </button>
              <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 transition-colors flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'charts' && renderChartsTab()}
        {activeTab === 'appointments' && renderAppointmentsTab()}
        {activeTab === 'chat' && renderChatTab()}
        {activeTab === 'files' && renderFilesTab()}
      </div>

      {/* Modal de Agendamento */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Novo Agendamento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Data</label>
                <input
                  type="date"
                  value={appointmentData.date}
                  onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Horário</label>
                <input
                  type="time"
                  value={appointmentData.time}
                  onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Tipo</label>
                <select
                  value={appointmentData.type}
                  onChange={(e) => setAppointmentData({...appointmentData, type: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="presencial">Presencial</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Especialidade</label>
                <select
                  value={appointmentData.specialty}
                  onChange={(e) => setAppointmentData({...appointmentData, specialty: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Selecione</option>
                  <option value="cardiologia">Cardiologia</option>
                  <option value="endocrinologia">Endocrinologia</option>
                  <option value="neurologia">Neurologia</option>
                  <option value="psiquiatria">Psiquiatria</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Serviço</label>
                <input
                  type="text"
                  value={appointmentData.service}
                  onChange={(e) => setAppointmentData({...appointmentData, service: e.target.value})}
                  placeholder="Ex: Consulta de retorno"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Sala</label>
                <input
                  type="text"
                  value={appointmentData.room}
                  onChange={(e) => setAppointmentData({...appointmentData, room: e.target.value})}
                  placeholder="Ex: Sala 201"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Observações</label>
                <textarea
                  value={appointmentData.notes}
                  onChange={(e) => setAppointmentData({...appointmentData, notes: e.target.value})}
                  placeholder="Observações adicionais..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white h-20"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAppointment}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Agendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientProfile
