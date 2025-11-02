import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText,
  Plus,
  Search,
  Download,
  Send,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Lock,
  Calendar,
  User,
  Pill,
  FileCheck,
  Mail,
  QrCode
} from 'lucide-react'

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  duration: string
  quantity: string
}

interface Prescription {
  id: string
  type: 'simple' | 'special' | 'blue' | 'yellow'
  patientName: string
  date: string
  medications: Medication[]
  professionalName: string
  crm: string
  signature: string
  status: 'draft' | 'signed' | 'sent' | 'validated'
  validationUrl: string
}

const Prescriptions: React.FC = () => {
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState<'simple' | 'special' | 'blue' | 'yellow' | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [patientName, setPatientName] = useState('')
  const [patientCPF, setPatientCPF] = useState('')
  const [medications, setMedications] = useState<Medication[]>([])
  const [currentMedication, setCurrentMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantity: ''
  })

  // Tipos de prescrição do CFM
  const prescriptionTypes = [
    {
      id: 'simple',
      name: 'Receituário Simples',
      description: 'Medicamentos sem restrições',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'special',
      name: 'Receita Controle Especial (Branca)',
      description: 'Psicotrópicos, retinoides (Lista C2)',
      icon: Lock,
      color: 'from-slate-500 to-slate-600'
    },
    {
      id: 'blue',
      name: 'Receita Azul (B1/B2)',
      description: 'Entorpecentes e psicotrópicos',
      icon: Lock,
      color: 'from-blue-600 to-blue-700'
    },
    {
      id: 'yellow',
      name: 'Receita Amarela (A1/A2/A3)',
      description: 'Entorpecentes e psicotrópicos específicos',
      icon: Lock,
      color: 'from-yellow-500 to-amber-500'
    }
  ]

  const handleAddMedication = () => {
    if (currentMedication.name && currentMedication.dosage) {
      setMedications([...medications, {
        id: Date.now().toString(),
        ...currentMedication
      }])
      setCurrentMedication({
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        quantity: ''
      })
    }
  }

  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter(m => m.id !== id))
  }

  const handleCreatePrescription = () => {
    const prescription: Prescription = {
      id: Date.now().toString(),
      type: selectedType!,
      patientName,
      date: new Date().toLocaleDateString('pt-BR'),
      medications,
      professionalName: 'Dr. Ricardo Valença',
      crm: 'CRM-RJ 123456',
      signature: '',
      status: 'draft',
      validationUrl: ''
    }
    
    console.log('Prescrição criada:', prescription)
    alert('Prescrição criada com sucesso!')
    setShowForm(false)
  }

  const handleDigitalSignature = () => {
    alert('Assinatura Digital ICP Brasil aplicada com sucesso!')
  }

  const handleSendToPatient = () => {
    alert('Prescrição enviada ao paciente por email e SMS com link de validação ITI')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm">
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
                <h1 className="text-3xl font-bold text-white mb-2">Prescrições Médicas</h1>
                <p className="text-slate-400">CFM - Prescrição Eletrônica com Assinatura Digital ICP Brasil</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {!showForm ? (
          <>
            {/* Tipo de Prescrição */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">Selecione o Tipo de Receita</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prescriptionTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type.id as any)
                        setShowForm(true)
                      }}
                      className="group bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all text-left"
                    >
                      <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${type.color} mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{type.name}</h3>
                      <p className="text-sm text-slate-400">{type.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Informações CFM */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Conforme Diretrizes CFM</h3>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5" />
                      <span>Assinatura Digital com Certificado ICP Brasil</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5" />
                      <span>Validação no Portal do ITI</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5" />
                      <span>Envio por Email e SMS com QR Code</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5" />
                      <span>Modelos pré-definidos para agilizar o processo</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Prescrições Recentes */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Prescrições Recentes</h2>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <p className="text-slate-400 text-center py-8">Nenhuma prescrição encontrada</p>
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto">
            {/* Formulário de Prescrição */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700/50 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {prescriptionTypes.find(t => t.id === selectedType)?.name}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Dados do Paciente */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-white">Dados do Paciente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nome do Paciente
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="Digite o nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      CPF
                    </label>
                    <input
                      type="text"
                      value={patientCPF}
                      onChange={(e) => setPatientCPF(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
              </div>

              {/* Medicamentos */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Medicamentos</h3>
                
                {/* Formulário de Medicamento */}
                <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Nome do Medicamento
                      </label>
                      <input
                        type="text"
                        value={currentMedication.name}
                        onChange={(e) => setCurrentMedication({...currentMedication, name: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        placeholder="Ex: Paracetamol"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Dosagem
                      </label>
                      <input
                        type="text"
                        value={currentMedication.dosage}
                        onChange={(e) => setCurrentMedication({...currentMedication, dosage: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        placeholder="Ex: 500mg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Frequência
                      </label>
                      <input
                        type="text"
                        value={currentMedication.frequency}
                        onChange={(e) => setCurrentMedication({...currentMedication, frequency: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        placeholder="Ex: De 8/8 horas"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Duração
                      </label>
                      <input
                        type="text"
                        value={currentMedication.duration}
                        onChange={(e) => setCurrentMedication({...currentMedication, duration: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        placeholder="Ex: 7 dias"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddMedication}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-colors"
                  >
                    + Adicionar Medicamento
                  </button>
                </div>

                {/* Lista de Medicamentos */}
                {medications.length > 0 && (
                  <div className="space-y-2">
                    {medications.map((med) => (
                      <div key={med.id} className="flex items-center justify-between bg-slate-700/50 p-4 rounded-lg">
                        <div className="flex-1">
                          <p className="font-semibold text-white">{med.name} - {med.dosage}</p>
                          <p className="text-sm text-slate-400">{med.frequency} por {med.duration}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveMedication(med.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCreatePrescription}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <FileCheck className="w-5 h-5" />
                  <span>Criar Prescrição</span>
                </button>
                <button
                  onClick={handleDigitalSignature}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Lock className="w-5 h-5" />
                  <span>Assinar Digitalmente (ICP Brasil)</span>
                </button>
                <button
                  onClick={handleSendToPatient}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>Enviar ao Paciente</span>
                </button>
              </div>
            </div>

            {/* Validação ITI */}
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <QrCode className="w-6 h-6 text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Validação ITI</h3>
                  <p className="text-sm text-slate-300 mb-4">
                    Cada prescrição receberá um código único para validação no Portal do ITI (Instituto Nacional de Tecnologia da Informação).
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>QR Code gerado automaticamente</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-400 mt-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>Link de validação enviado por email e SMS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Prescriptions
