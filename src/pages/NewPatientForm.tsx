import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Upload,
  X,
  UserPlus,
  Briefcase,
  Camera,
  File,
  Image as ImageIcon,
  Save,
  FileText as FileTextIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  file: File
  preview?: string
}

const NewPatientForm: React.FC = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    professionalId: '',
    specialty: '',
    referringDoctor: '',
    room: 'Indiferente',
    observations: ''
  })
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const professionals = [
    { id: 'ricardo', name: 'Dr. Ricardo Valença', specialty: 'Cannabis Medicinal Integrativa', crm: 'CRM-RJ 123456' },
    { id: 'eduardo', name: 'Dr. Eduardo Faveret', specialty: 'Cannabis Medicinal Integrativa', crm: 'CRM-RJ 789012' }
  ]

  const specialties = [
    'Sem especialidade',
    'Cannabis Medicinal',
    'Nefrologia',
    'Dor',
    'Psiquiatria'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        file: file
      }

      // Criar preview para imagens
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          newFile.preview = e.target?.result as string
          setUploadedFiles(prev => [...prev, newFile])
        }
        reader.readAsDataURL(file)
      } else {
        setUploadedFiles(prev => [...prev, newFile])
      }
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-400" />
    if (type.includes('pdf')) return <FileTextIcon className="w-5 h-5 text-red-400" />
    if (type.includes('word')) return <FileTextIcon className="w-5 h-5 text-blue-500" />
    return <File className="w-5 h-5 text-slate-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Simular salvamento
      console.log('Salvando paciente:', formData)
      console.log('Arquivos anexados:', uploadedFiles)
      
      // Aqui você integraria com a API
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      alert('Paciente cadastrado com sucesso!')
      navigate('/app/patients')
    } catch (error) {
      console.error('Erro ao salvar paciente:', error)
      alert('Erro ao cadastrar paciente. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isStep1Valid = formData.name && formData.cpf && formData.phone
  const isStep2Valid = formData.professionalId && formData.specialty

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/app/patients')}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Novo Paciente</h1>
                <p className="text-slate-400">Cadastro manual e importação de documentos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[
              { num: 1, label: 'Dados Pessoais' },
              { num: 2, label: 'Atendimento' },
              { num: 3, label: 'Documentos' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                      step >= s.num
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                  </div>
                  <span className={`text-sm mt-2 ${step >= s.num ? 'text-white' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`flex-1 h-0.5 mx-2 ${step > s.num ? 'bg-blue-500' : 'bg-slate-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 mb-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Informações Pessoais</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="Digite o nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="(21) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="paciente@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sexo
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="Rua, número, complemento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="Nome da cidade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Estado
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => navigate('/app/patients')}
                  className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Informações de Atendimento</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Profissional Responsável *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {professionals.map(prof => (
                      <button
                        key={prof.id}
                        onClick={() => setFormData(prev => ({ ...prev, professionalId: prof.id }))}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.professionalId === prof.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-700 bg-slate-700/50 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{prof.name}</p>
                            <p className="text-xs text-slate-400">{prof.crm}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-300">{prof.specialty}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Especialidade *
                    </label>
                    <select
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Selecione</option>
                      {specialties.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Sala
                    </label>
                    <select
                      name="room"
                      value={formData.room}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Indiferente">Indiferente</option>
                      <option value="Sala 1">Sala 1</option>
                      <option value="Sala 2">Sala 2</option>
                      <option value="Sala 3">Sala 3</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Médico Encaminhador
                    </label>
                    <input
                      type="text"
                      name="referringDoctor"
                      value={formData.referringDoctor}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="Nome do médico que encaminhou (opcional)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Observações Iniciais
                    </label>
                    <textarea
                      name="observations"
                      value={formData.observations}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="Observações iniciais sobre o paciente..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!isStep2Valid}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Upload de Documentos</h2>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm text-slate-300">
                    <p className="font-semibold text-white mb-1">Importação de Arquivos em Lote</p>
                    <p>Você pode arrastar e soltar ou selecionar múltiplos arquivos (PDFs, DOCs, imagens, etc.) para importação rápida.</p>
                    <p className="mt-2">Arquivos aceitos: PDF, DOC, DOCX, JPG, PNG, DICOM</p>
                    <p className="mt-2 text-yellow-400">Importante: Este cadastro é destinado a profissionais. Pacientes devem ser direcionados ao agendamento.</p>
                  </div>
                </div>
              </div>

              {/* Upload Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-700/30 hover:border-slate-600'
                }`}
              >
                <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <p className="text-lg font-semibold text-white mb-2">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-sm text-slate-400 mb-4">
                  Suporta múltiplos arquivos (anemneses, exames, imagens, etc.)
                </p>
                <label className="inline-block px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors cursor-pointer">
                  Selecionar Arquivos
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dcm"
                  />
                </label>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Arquivos Anexados ({uploadedFiles.length})</h3>
                  <div className="space-y-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {file.preview ? (
                            <img src={file.preview} alt={file.name} className="w-10 h-10 rounded object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-600 rounded flex items-center justify-center">
                              {getFileIcon(file.type)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{file.name}</p>
                            <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Salvar Paciente</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NewPatientForm
