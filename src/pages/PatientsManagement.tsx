import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import IntegrativePrescriptions from '../components/IntegrativePrescriptions'
import { 
  ArrowLeft, 
  Search,
  Plus,
  User,
  FileText,
  Download,
  Upload,
  Archive,
  TrendingUp,
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  UserPlus,
  Edit,
  Clock,
  Activity,
  Target,
  CheckCircle,
  XCircle
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
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
  const [selectedClinic, setSelectedClinic] = useState<string>('rio-bonito')
  const [selectedRoom, setSelectedRoom] = useState<string>('indifferent')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'evolution' | 'prescription' | 'files' | 'receipts' | 'charts' | 'appointments'>('overview')
  
  // Ler parâmetro da URL para abrir aba de agendamentos
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'appointments') {
      setActiveTab('appointments')
    }
  }, [searchParams])
  const [showNewEvolution, setShowNewEvolution] = useState(false)
  const [evolutionContent, setEvolutionContent] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [evolutions, setEvolutions] = useState<Evolution[]>([])
  const [loadingEvolutions, setLoadingEvolutions] = useState(false)
  const [showNewPatientMenu, setShowNewPatientMenu] = useState(false)
  const [openingChat, setOpeningChat] = useState(false)

  const navigationState = location.state as { from?: string } | null
  const originPath = navigationState?.from

  const handleBack = useCallback(() => {
    if (originPath) {
      navigate(originPath)
      return
    }

    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/app/clinica/profissional/dashboard')
  }, [navigate, originPath])

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showNewPatientMenu && !target.closest('.new-patient-menu-container')) {
        setShowNewPatientMenu(false)
      }
    }

    if (showNewPatientMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNewPatientMenu])

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

  // Carregar pacientes reais do Supabase
  useEffect(() => {
    loadPatients()
  }, [user])

  // Carregar evoluções quando um paciente é selecionado
  useEffect(() => {
    if (selectedPatient) {
      loadEvolutions(selectedPatient.id)
    }
  }, [selectedPatient])

  const loadPatients = async () => {
    try {
      setLoading(true)
      
      // BUSCAR TODOS OS PACIENTES DIRETAMENTE NA TABELA USERS
      // Isso garante que pacientes criados pelo profissional apareçam mesmo sem avaliações
      let usersData: any[] = []
      try {
        const { data, error } = await supabase
          .from('users_compatible')
          .select('id, name, email, phone, type, created_at')
          .eq('type', 'patient')
          .order('created_at', { ascending: false })

        if (!error && data) {
          // Excluir o próprio usuário da lista de pacientes
          usersData = data.filter(u => u.id !== user?.id)
        } else if (error) {
          console.error('Erro ao buscar usuários:', error)
        }
      } catch (err) {
        console.log('Tabela users não encontrada ou erro ao buscar:', err)
      }

      // Buscar avaliações clínicas para complementar dados dos pacientes
      const { data: assessments, error: assessmentsError } = await supabase
        .from('clinical_assessments')
        .select('patient_id, created_at, status, assessment_type, data, clinical_report, doctor_id')
        .order('created_at', { ascending: false })

      if (assessmentsError) {
        console.error('Erro ao buscar avaliações:', assessmentsError)
      }

      // Se não encontrou pacientes na tabela users, tentar usar dados das avaliações como fallback
      if (usersData.length === 0 && assessments && assessments.length > 0) {
        const assessmentsMap = new Map()
        assessments.forEach(a => {
          // Excluir o próprio usuário da lista de pacientes
          if (a.patient_id && a.patient_id !== user?.id && !assessmentsMap.has(a.patient_id)) {
            const patientData = a.data || {}
            assessmentsMap.set(a.patient_id, {
              id: a.patient_id,
              name: patientData.name || 'Paciente',
              email: '',
              phone: patientData.phone || '',
              type: 'patient',
              address: null,
              created_at: a.created_at
            })
          }
        })
        usersData = Array.from(assessmentsMap.values())
      }

      // Consolidar dados dos pacientes (excluindo o próprio usuário se for profissional)
      const patientsMap = new Map<string, Patient>()
      
      usersData?.filter(u => {
        // Excluir o próprio usuário da lista de pacientes
        if (user?.id && u.id === user.id) {
          return false
        }
        // Apenas pacientes (não profissionais)
        return u.type === 'patient' || !u.type || u.type === null
      }).forEach(u => {
        // Contar atendimentos e faltas
        const patientAssessments = assessments?.filter(a => a.patient_id === u.id) || []
        const appointmentsCount = patientAssessments.length
        
        // Buscar dados adicionais do paciente em TODAS as avaliações (não só a primeira)
        // Usar a avaliação mais recente com dados completos
        const latestAssessment = patientAssessments[0]
        const patientData = latestAssessment?.data || {}
        
        // Tentar buscar nome de todas as avaliações
        let patientName = u.name || 'Paciente'
        let patientCpf = ''
        let patientPhone = u.phone || ''
        let patientAge = 0
        
        // Buscar em todas as avaliações
        for (const assessment of patientAssessments) {
          const data = assessment.data || {}
          if (data.name && data.name !== 'Paciente') {
            patientName = data.name
          }
          if (data.cpf && !patientCpf) {
            patientCpf = data.cpf
          }
          if (data.phone && !patientPhone) {
            patientPhone = data.phone
          }
          if (data.age && !patientAge) {
            patientAge = typeof data.age === 'number' ? data.age : parseInt(data.age) || 0
          }
          if (patientName !== 'Paciente' && patientCpf && patientPhone) break // Se já encontrou tudo, parar
        }
        
        // Se ainda não encontrou nome, usar dados da avaliação clinical_report ou data
        if (patientName === 'Paciente' || !patientName) {
          // Tentar buscar nome do clinical_report da avaliação
          if (latestAssessment?.clinical_report) {
            // Tentar extrair nome do relatório
            const reportMatch = latestAssessment.clinical_report.match(/Paciente[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i)
            if (reportMatch && reportMatch[1]) {
              patientName = reportMatch[1]
            }
          }
          
          // Se ainda não encontrou, buscar do campo data da avaliação
          if ((patientName === 'Paciente' || !patientName) && latestAssessment?.data) {
            const dataObj = typeof latestAssessment.data === 'string' 
              ? JSON.parse(latestAssessment.data) 
              : latestAssessment.data
            if (dataObj?.patientName || dataObj?.name) {
              patientName = dataObj.patientName || dataObj.name
            }
          }
        }
        
        // Calcular idade se disponível
        let age = patientAge, months = 0, days = 0
        
        // Gerar código do paciente (PAT + últimos dígitos do ID)
        const patientIdStr = u.id?.toString().replace(/-/g, '') || ''
        const patientCode = `#PAT${patientIdStr.substring(0, 8).toUpperCase() || '0001'}`
        
        patientsMap.set(u.id, {
          id: u.id,
          name: patientName,
          age,
          months,
          days,
          phone: patientPhone || 'Não informado',
          cpf: patientCpf,
          code: patientCode,
      photo: '',
          specialty: patientData.specialty || 'Cannabis Medicinal',
          clinic: patientData.clinic || 'Consultório Dr. Ricardo Valença',
          room: patientData.room || 'Sala 1',
          referringDoctor: patientData.referringDoctor || 'Dr. Ricardo Valença',
      status: 'active',
          appointmentsCount,
          absences: 0, // Calcular de appointments se houver tabela
          servicesCount: patientAssessments.filter(a => a.status === 'completed').length
        })
      })

      setPatients(Array.from(patientsMap.values()))
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadEvolutions = async (patientId: string) => {
    try {
      setLoadingEvolutions(true)
      
      // Buscar avaliações clínicas do paciente como evoluções
      const { data: assessments, error } = await supabase
        .from('clinical_assessments')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar evoluções:', error)
        return
      }

      // Converter avaliações para formato de evolução
      const evolutionsList: Evolution[] = (assessments || []).map(assessment => ({
        id: assessment.id,
        date: new Date(assessment.created_at).toLocaleDateString('pt-BR'),
        time: new Date(assessment.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: assessment.status === 'completed' ? 'current' : 'historical',
        content: assessment.clinical_report || assessment.data?.clinicalNotes || 'Sem descrição',
        professional: 'IA Residente'
      }))

      setEvolutions(evolutionsList)
    } catch (error) {
      console.error('Erro ao carregar evoluções:', error)
    } finally {
      setLoadingEvolutions(false)
    }
  }

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.code.toLowerCase().includes(searchTerm.toUpperCase())
  )

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setActiveTab('overview')
  }

  const handleOpenPatientChat = async () => {
    if (!user?.id || !selectedPatient?.id) return

    setOpeningChat(true)
    try {
      let targetRoomId: string | undefined

      const { data: patientRooms, error: roomsError } = await supabase
        .from('chat_participants')
        .select('room_id, chat_rooms!inner(id, type)')
        .eq('user_id', selectedPatient.id)
        .eq('chat_rooms.type', 'patient')
        .limit(1)

      if (!roomsError && patientRooms?.length) {
        targetRoomId = patientRooms[0].room_id
      } else {
        const { data: newRoom, error: roomError } = await supabase
          .from('chat_rooms')
          .insert({
            name: `Canal de cuidado • ${selectedPatient.name}`,
            type: 'patient',
            created_by: user.id
          })
          .select('id')
          .single()

        if (roomError || !newRoom) {
          throw roomError ?? new Error('Não foi possível criar a sala clínica do paciente')
        }

        targetRoomId = newRoom.id

        await supabase
          .from('chat_participants')
          .upsert(
            [
              { room_id: newRoom.id, user_id: selectedPatient.id, role: 'patient' },
              { room_id: newRoom.id, user_id: user.id, role: 'professional' }
            ],
            { onConflict: 'room_id,user_id' }
          )
      }

      if (!targetRoomId) {
        throw new Error('Canal do paciente não encontrado')
      }

      await supabase
        .from('chat_participants')
        .upsert(
          [{ room_id: targetRoomId, user_id: user.id, role: 'professional' }],
          { onConflict: 'room_id,user_id' }
        )

      navigate(`/app/clinica/paciente/chat-profissional?origin=professional-dashboard&roomId=${targetRoomId}`)
    } catch (error) {
      console.error('Erro ao abrir chat clínico do paciente:', error)
      navigate('/app/clinica/paciente/chat-profissional?origin=professional-dashboard')
    } finally {
      setOpeningChat(false)
    }
  }

  const handleSaveEvolution = async () => {
    if (!selectedPatient || !evolutionContent.trim()) return

    try {
      // Salvar evolução como avaliação clínica
      const { error } = await supabase
        .from('clinical_assessments')
        .insert({
          patient_id: selectedPatient.id,
          assessment_type: 'FOLLOW_UP',
          data: {
            clinicalNotes: evolutionContent,
            type: 'evolution',
            created_by: user?.id
          },
          clinical_report: evolutionContent,
          status: 'completed'
        })

      if (error) {
        console.error('Erro ao salvar evolução:', error)
        alert('Erro ao salvar evolução. Tente novamente.')
        return
      }

      // Recarregar evoluções
      await loadEvolutions(selectedPatient.id)
    setShowNewEvolution(false)
    setEvolutionContent('')
      alert('Evolução salva com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar evolução:', error)
      alert('Erro ao salvar evolução. Tente novamente.')
    }
  }

  const handleUploadFiles = () => {
    // Implementar upload de arquivos
    alert('Funcionalidade de upload de arquivos em desenvolvimento')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Prontuário Eletrônico</h1>
                <p className="text-slate-400">Gestão de Pacientes e Atendimentos</p>
              </div>
            </div>
            <div className="relative new-patient-menu-container">
            <button
                onClick={() => setShowNewPatientMenu(!showNewPatientMenu)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors"
            >
              <UserPlus className="w-5 h-5" />
              <span>Novo Paciente</span>
            </button>
              
              {showNewPatientMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 new-patient-menu-container">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowNewPatientMenu(false)
                        navigate('/app/new-patient?mode=manual')
                      }}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-white flex items-center space-x-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Cadastro Manual</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowNewPatientMenu(false)
                        navigate('/app/new-patient?mode=csv')
                      }}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-white flex items-center space-x-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Importar CSV</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowNewPatientMenu(false)
                        navigate('/app/new-patient?mode=database')
                      }}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-white flex items-center space-x-2"
                    >
                      <Archive className="w-4 h-4" />
                      <span>Importar do Banco</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowNewPatientMenu(false)
                        navigate('/app/new-patient?mode=drag-drop')
                      }}
                      className="w-full text-left px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-white flex items-center space-x-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Arrastar Arquivos</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
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
                {loading ? (
                  <div className="p-4 text-center text-slate-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
                    <p>Carregando pacientes...</p>
                  </div>
                ) : filteredPatients.length === 0 ? (
                  <div className="p-4 text-center text-slate-400">
                    <User className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    <p>Nenhum paciente encontrado</p>
                  </div>
                ) : (
                  filteredPatients.map(patient => (
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
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Patient Details - Main Content */}
          <div className="lg:col-span-2">
            {/* Se a aba de agendamentos está ativa, mostrar agendamentos mesmo sem paciente selecionado */}
            {activeTab === 'appointments' && !selectedPatient ? (
              <div className="space-y-6">
                {/* Agendamentos */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-green-400" />
                        <span>Agendamentos</span>
                      </h3>
                      <p className="text-slate-400">Gerencie agendamentos e visualize sua agenda completa</p>
                    </div>
                    <button
                      onClick={() => navigate('/app/scheduling')}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Novo Agendamento</span>
                    </button>
                  </div>

                  {/* KPIs de Agendamentos */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-sm text-slate-400 mb-1">Hoje</p>
                      <p className="text-2xl font-bold text-white">8</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-sm text-slate-400 mb-1">Esta Semana</p>
                      <p className="text-2xl font-bold text-white">24</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-sm text-slate-400 mb-1">Confirmados</p>
                      <p className="text-2xl font-bold text-green-400">18</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4">
                      <p className="text-sm text-slate-400 mb-1">Pendentes</p>
                      <p className="text-2xl font-bold text-yellow-400">6</p>
                    </div>
                  </div>

                  {/* Agenda de Hoje */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-white mb-4">Agenda de Hoje</h4>
                    <div className="space-y-3">
                      {/* Agendamento 1 */}
                      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-500 rounded-lg p-2 text-white font-bold text-sm">09</div>
                            <div>
                              <h5 className="font-semibold text-white mb-1">Maria Santos</h5>
                              <p className="text-sm text-slate-400 mb-2">Consulta de retorno - Epilepsia</p>
                              <div className="flex items-center space-x-4 text-xs text-slate-300">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>09:00</span>
                                </div>
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">Confirmado</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Agendamento 2 */}
                      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-500 rounded-lg p-2 text-white font-bold text-sm">14</div>
                            <div>
                              <h5 className="font-semibold text-white mb-1">João Silva</h5>
                              <p className="text-sm text-slate-400 mb-2">Avaliação inicial - TEA</p>
                              <div className="flex items-center space-x-4 text-xs text-slate-300">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>14:00</span>
                                </div>
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">Confirmado</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Agendamento 3 */}
                      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-500 rounded-lg p-2 text-white font-bold text-sm">16</div>
                            <div>
                              <h5 className="font-semibold text-white mb-1">Ana Costa</h5>
                              <p className="text-sm text-slate-400 mb-2">Consulta de emergência</p>
                              <div className="flex items-center space-x-4 text-xs text-slate-300">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>16:30</span>
                                </div>
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">Pendente</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações Rápidas */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate('/app/scheduling')}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Novo Agendamento</span>
                    </button>
                    <button
                      onClick={() => navigate('/app/clinica/profissional/agendamentos')}
                      className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Ver Agenda Completa</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedPatient ? (
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
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setShowNewEvolution(true)}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors"
                      >
                        Nova Evolução
                      </button>
                      <button
                        onClick={handleOpenPatientChat}
                        disabled={openingChat}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          openingChat
                            ? 'bg-primary-500/60 text-white cursor-wait'
                            : 'bg-primary-500 text-white hover:bg-primary-400'
                        }`}
                      >
                        {openingChat ? 'Abrindo chat...' : 'Chat Clínico'}
                      </button>
                    </div>
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

                {/* Tabs - Apenas quando há paciente selecionado */}
                {selectedPatient && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                  <div className="border-b border-slate-700">
                    <div className="flex space-x-1 p-4">
                      {[
                        { id: 'overview', label: 'Visão Geral', icon: Activity },
                        { id: 'evolution', label: 'Evolução', icon: FileText },
                        { id: 'prescription', label: 'Prescrição Médica', icon: Edit },
                        { id: 'appointments', label: 'Agendamentos', icon: Calendar },
                        { id: 'files', label: 'Arquivos', icon: Archive },
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
                  <div className="p-4 sm:p-6 w-full max-w-full overflow-x-hidden">
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
                        
                        {loadingEvolutions ? (
                          <div className="text-center text-slate-400 py-8">
                            <Clock className="w-12 h-12 mx-auto mb-3 text-slate-600 animate-spin" />
                            <p>Carregando evoluções...</p>
                          </div>
                        ) : evolutions.length === 0 ? (
                        <div className="text-center text-slate-400 py-8">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                          <p>Nenhuma evolução registrada</p>
                        </div>
                        ) : (
                          <div className="space-y-4">
                            {evolutions.map(evolution => (
                              <div key={evolution.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <p className="font-semibold text-white">{evolution.date} • {evolution.time}</p>
                                    <p className="text-xs text-slate-400">{evolution.professional}</p>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    evolution.type === 'current' 
                                      ? 'bg-green-500/20 text-green-400' 
                                      : 'bg-blue-500/20 text-blue-400'
                                  }`}>
                                    {evolution.type === 'current' ? 'Atual' : 'Histórico'}
                                  </span>
                                </div>
                                <p className="text-slate-300 text-sm whitespace-pre-wrap">{evolution.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'prescription' && (
                      <div className="space-y-4 w-full max-w-full overflow-x-hidden">
                        <IntegrativePrescriptions
                          patientId={selectedPatient?.id}
                          patientName={selectedPatient?.name}
                        />
                      </div>
                    )}

                    {activeTab === 'appointments' && (
                      <div className="space-y-4 w-full max-w-full overflow-x-hidden">
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-2 flex items-center space-x-2">
                                <Calendar className="w-5 h-5 text-green-400" />
                                <span>Agendamentos</span>
                              </h3>
                              <p className="text-slate-400">Gerencie agendamentos e visualize sua agenda completa</p>
                            </div>
                            <button
                              onClick={() => navigate('/app/scheduling')}
                              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Novo Agendamento</span>
                            </button>
                          </div>

                          {/* KPIs de Agendamentos */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-slate-700/50 rounded-lg p-4">
                              <p className="text-sm text-slate-400 mb-1">Hoje</p>
                              <p className="text-2xl font-bold text-white">8</p>
                            </div>
                            <div className="bg-slate-700/50 rounded-lg p-4">
                              <p className="text-sm text-slate-400 mb-1">Esta Semana</p>
                              <p className="text-2xl font-bold text-white">24</p>
                            </div>
                            <div className="bg-slate-700/50 rounded-lg p-4">
                              <p className="text-sm text-slate-400 mb-1">Confirmados</p>
                              <p className="text-2xl font-bold text-green-400">18</p>
                            </div>
                            <div className="bg-slate-700/50 rounded-lg p-4">
                              <p className="text-sm text-slate-400 mb-1">Pendentes</p>
                              <p className="text-2xl font-bold text-yellow-400">6</p>
                            </div>
                          </div>

                          {/* Agenda de Hoje */}
                          <div className="mb-6">
                            <h4 className="text-lg font-bold text-white mb-4">Agenda de Hoje</h4>
                            <div className="space-y-3">
                              {/* Agendamento 1 */}
                              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-3">
                                    <div className="bg-blue-500 rounded-lg p-2 text-white font-bold text-sm">09</div>
                                    <div>
                                      <h5 className="font-semibold text-white mb-1">Maria Santos</h5>
                                      <p className="text-sm text-slate-400 mb-2">Consulta de retorno - Epilepsia</p>
                                      <div className="flex items-center space-x-4 text-xs text-slate-300">
                                        <div className="flex items-center space-x-1">
                                          <Clock className="w-3 h-3" />
                                          <span>09:00</span>
                                        </div>
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">Confirmado</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Agendamento 2 */}
                              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-3">
                                    <div className="bg-blue-500 rounded-lg p-2 text-white font-bold text-sm">14</div>
                                    <div>
                                      <h5 className="font-semibold text-white mb-1">João Silva</h5>
                                      <p className="text-sm text-slate-400 mb-2">Avaliação inicial - TEA</p>
                                      <div className="flex items-center space-x-4 text-xs text-slate-300">
                                        <div className="flex items-center space-x-1">
                                          <Clock className="w-3 h-3" />
                                          <span>14:00</span>
                                        </div>
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">Confirmado</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Agendamento 3 */}
                              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start space-x-3">
                                    <div className="bg-blue-500 rounded-lg p-2 text-white font-bold text-sm">16</div>
                                    <div>
                                      <h5 className="font-semibold text-white mb-1">Ana Costa</h5>
                                      <p className="text-sm text-slate-400 mb-2">Consulta de emergência</p>
                                      <div className="flex items-center space-x-4 text-xs text-slate-300">
                                        <div className="flex items-center space-x-1">
                                          <Clock className="w-3 h-3" />
                                          <span>16:30</span>
                                        </div>
                                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">Pendente</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Ações Rápidas */}
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => navigate('/app/scheduling')}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Novo Agendamento</span>
                            </button>
                            <button
                              onClick={() => navigate('/app/clinica/profissional/agendamentos')}
                              className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                              <Calendar className="w-4 h-4" />
                              <span>Ver Agenda Completa</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'files' && (
                      <div className="space-y-4">
                      <div className="text-center text-slate-400 py-8">
                          <Archive className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p>Nenhum arquivo anexado</p>
                        <button
                            onClick={handleUploadFiles}
                          className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                        >
                          <Upload className="w-5 h-5 inline mr-2" />
                          Upload de Arquivos
                        </button>
                        </div>
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
                )}
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
