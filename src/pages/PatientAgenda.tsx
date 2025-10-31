import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Video, 
  Plus,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const PatientAgenda: React.FC = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')

  const appointments = [
    {
      id: 1,
      title: 'Consulta com Dr. Ricardo Silva',
      specialty: 'Nefrologia',
      date: '2024-12-14',
      time: '10:00',
      duration: '45 min',
      type: 'Presencial',
      location: 'Hospital São Paulo',
      doctor: {
        name: 'Dr. Ricardo Silva',
        specialty: 'Nefrologia',
        avatar: 'RS'
      },
      status: 'Agendada'
    },
    {
      id: 2,
      title: 'Consulta com Dra. Ana Costa',
      specialty: 'Nutrição',
      date: '2024-12-19',
      time: '14:30',
      duration: '30 min',
      type: 'Online',
      location: 'Teleconsulta',
      doctor: {
        name: 'Dra. Ana Costa',
        specialty: 'Nutrição',
        avatar: 'AC'
      },
      status: 'Agendada'
    },
    {
      id: 3,
      title: 'Avaliação Clínica',
      specialty: 'Medicina Geral',
      date: '2024-12-21',
      time: '09:00',
      duration: '60 min',
      type: 'Presencial',
      location: 'Clínica MedCannLab',
      doctor: {
        name: 'Dr. João Santos',
        specialty: 'Medicina Geral',
        avatar: 'JS'
      },
      status: 'Confirmada'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Agendada': return 'bg-blue-500'
      case 'Confirmada': return 'bg-green-500'
      case 'Cancelada': return 'bg-red-500'
      case 'Realizada': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'Online' ? Video : MapPin
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/app/patient-dashboard')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Agenda</h1>
              <p className="text-slate-400">Programa de Cuidado Renal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nova Consulta</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              <a href="/app/patient-dashboard" className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <Calendar className="w-5 h-5" />
                <span>Dashboard</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700 text-white">
                <Calendar className="w-5 h-5" />
                <span>Agenda</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <span className="w-5 h-5">📊</span>
                <span>Meus KPIs</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <span className="w-5 h-5">❤️</span>
                <span>Avaliação Clínica</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <span className="w-5 h-5">💬</span>
                <span>Chat com Nôa</span>
              </a>
              <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                <span className="w-5 h-5">📄</span>
                <span>Relatórios</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Filters and View Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-lg font-semibold">Dezembro 2024</span>
                  <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setViewMode('day')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      viewMode === 'day' ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    Dia
                  </button>
                  <button 
                    onClick={() => setViewMode('week')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      viewMode === 'week' ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    Semana
                  </button>
                  <button 
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      viewMode === 'month' ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    Mês
                  </button>
                </div>
                
                <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
                <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
              {appointments.map((appointment) => {
                const TypeIcon = getTypeIcon(appointment.type)
                return (
                  <div key={appointment.id} className="bg-slate-800 rounded-xl p-6 hover:bg-slate-750 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{appointment.doctor.avatar}</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{appointment.title}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)} text-white`}>
                              {appointment.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-slate-400 mb-3">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{appointment.time} ({appointment.duration})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <TypeIcon className="w-4 h-4" />
                              <span>{appointment.type}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{appointment.location}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-300">Dr(a). {appointment.doctor.name}</span>
                            <span className="text-sm text-slate-400">•</span>
                            <span className="text-sm text-slate-400">{appointment.specialty}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                          <Video className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                          <span className="text-sm">⋮</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Empty State */}
            {appointments.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold text-white mb-2">Nenhuma consulta agendada</h3>
                <p className="text-slate-400 mb-6">Você não possui consultas agendadas para este período.</p>
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors">
                  Agendar Consulta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientAgenda
