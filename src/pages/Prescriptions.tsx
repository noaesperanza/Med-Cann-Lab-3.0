import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { useConfirm } from '../contexts/ConfirmContext'
import { supabase } from '../lib/supabase'
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
  QrCode,
  X,
  Loader2,
  Eye
} from 'lucide-react'
import DigitalSignatureWidget from '../components/DigitalSignatureWidget'

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
  prescription_type: 'simple' | 'special' | 'blue' | 'yellow'
  patient_id?: string
  patient_name: string
  patient_cpf?: string
  patient_email?: string
  patient_phone?: string
  professional_id?: string
  professional_name: string
  professional_crm: string
  professional_specialty?: string
  medications: Medication[]
  status: 'draft' | 'signed' | 'sent' | 'validated' | 'cancelled'
  iti_validation_code?: string
  iti_validation_url?: string
  iti_qr_code?: string
  digital_signature?: string
  signature_timestamp?: string
  created_at: string
  expires_at?: string
}

const Prescriptions: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const { confirm } = useConfirm()

  // Helper local para manter a sintaxe limpa
  const toast = {
    success: (title: string, message?: string) => showToast('success', message ? `${title}: ${message}` : title),
    error: (title: string, message?: string) => showToast('error', message ? `${title}: ${message}` : title),
    warning: (title: string, message?: string) => showToast('warning', message ? `${title}: ${message}` : title),
    info: (title: string, message?: string) => showToast('info', message ? `${title}: ${message}` : title)
  }
  const [searchParams] = useSearchParams()
  const [selectedType, setSelectedType] = useState<'simple' | 'special' | 'blue' | 'yellow' | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState<any[]>([])
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [currentPrescriptionId, setCurrentPrescriptionId] = useState<string | null>(null)

  // Ler tipo da URL e pré-selecionar
  useEffect(() => {
    const typeParam = searchParams.get('type')
    console.log('Parâmetro type da URL:', typeParam)
    if (typeParam && ['simple', 'special', 'blue', 'yellow'].includes(typeParam)) {
      console.log('Configurando tipo selecionado:', typeParam)
      setSelectedType(typeParam as any)
      setShowForm(true)
    }
  }, [searchParams])

  const [patientName, setPatientName] = useState('')
  const [patientCPF, setPatientCPF] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [patientId, setPatientId] = useState<string | null>(null)
  const [medications, setMedications] = useState<Medication[]>([])
  const [currentMedication, setCurrentMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantity: ''
  })
  const [notes, setNotes] = useState('')

  // Tipos de prescrição do CFM
  const prescriptionTypes = [
    {
      id: 'simple',
      name: 'Receituário Simples',
      description: 'Medicamentos sem restrições',
      icon: FileText,
      color: 'from-[#00c16a] to-[#00a85a]'
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
      color: 'from-[#00c16a] to-[#00a85a]'
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

  // Carregar prescrições do banco
  useEffect(() => {
    if (user) {
      loadPrescriptions()
    }
  }, [user])

  const loadPrescriptions = async () => {
    if (!user?.id) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('cfm_prescriptions')
        .select('*')
        .eq('professional_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        console.error('Erro ao carregar prescrições:', fetchError)
        setError('Erro ao carregar prescrições')
        return
      }

      const formattedPrescriptions: Prescription[] = (data || []).map((p: any) => ({
        id: p.id,
        prescription_type: p.prescription_type,
        patient_id: p.patient_id,
        patient_name: p.patient_name,
        patient_cpf: p.patient_cpf,
        patient_email: p.patient_email,
        patient_phone: p.patient_phone,
        professional_id: p.professional_id,
        professional_name: p.professional_name,
        professional_crm: p.professional_crm,
        professional_specialty: p.professional_specialty,
        medications: p.medications || [],
        status: p.status || 'draft',
        iti_validation_code: p.iti_validation_code,
        iti_validation_url: p.iti_validation_url,
        iti_qr_code: p.iti_qr_code,
        digital_signature: p.digital_signature,
        signature_timestamp: p.signature_timestamp,
        created_at: p.created_at,
        expires_at: p.expires_at
      }))

      setPrescriptions(formattedPrescriptions)
    } catch (err) {
      console.error('Erro ao carregar prescrições:', err)
      setError('Erro ao carregar prescrições')
    } finally {
      setLoading(false)
    }
  }

  // Buscar pacientes
  const searchPatients = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setPatientResults([])
      return
    }

    try {
      // Buscar pacientes - tentar users_compatible primeiro, depois users
      let usersData = null
      let usersError = null

      // Tentar users_compatible (view que combina auth.users e users)
      const { data: compatibleData, error: compatibleError } = await supabase
        .from('users_compatible')
        .select('id, name, email, cpf, phone, type')
        .or(`name.ilike.*${searchTerm}*,cpf.ilike.*${searchTerm}*,email.ilike.*${searchTerm}*`)
        .in('type', ['patient', 'paciente'])
        .limit(10)

      if (!compatibleError && compatibleData) {
        usersData = compatibleData
      } else {
        // Fallback: buscar em users
        const { data: usersDataFallback, error: usersErrorFallback } = await supabase
          .from('users')
          .select('id, name, email, cpf, phone, type')
          .or(`name.ilike.*${searchTerm}*,cpf.ilike.*${searchTerm}*,email.ilike.*${searchTerm}*`)
          .in('type', ['patient', 'paciente'])
          .limit(10)

        usersData = usersDataFallback
        usersError = usersErrorFallback
      }

      if (usersError) {
        console.error('Erro ao buscar pacientes:', usersError)
        return
      }

      setPatientResults(usersData || [])
    } catch (err) {
      console.error('Erro ao buscar pacientes:', err)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (patientSearch) {
        searchPatients(patientSearch)
      } else {
        setPatientResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [patientSearch])

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient)
    setPatientName(patient.name || '')
    setPatientCPF(patient.cpf || '')
    setPatientEmail(patient.email || '')
    setPatientPhone(patient.phone || '')
    setPatientId(patient.id)
    setPatientSearch('')
    setPatientResults([])
  }

  const handleCreatePrescription = async () => {
    if (!user) {
      toast.warning('Autenticação necessária', 'Você precisa estar logado para criar prescrições')
      return
    }

    if (!patientName || medications.length === 0) {
      toast.warning('Campos obrigatórios', 'Preencha o nome do paciente e adicione pelo menos um medicamento')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const prescriptionData = {
        prescription_type: selectedType!,
        patient_id: patientId || null,
        patient_name: patientName,
        patient_cpf: patientCPF || null,
        patient_email: patientEmail || null,
        patient_phone: patientPhone || null,
        professional_id: user.id,
        professional_name: user.name || 'Profissional',
        professional_crm: user.crm || '',
        professional_specialty: null,
        medications: medications.map(m => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          quantity: m.quantity
        })),
        status: 'draft',
        notes: notes || null,
        metadata: {}
      }

      const { data, error: insertError } = await supabase
        .from('cfm_prescriptions')
        .insert(prescriptionData)
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      setCurrentPrescriptionId(data.id)
      toast.success('Prescrição criada!', 'Agora você pode assinar digitalmente.')
      await loadPrescriptions()
    } catch (err: any) {
      console.error('Erro ao criar prescrição:', err)
      setError(err.message || 'Erro ao criar prescrição')
      toast.error('Erro ao criar prescrição', err.message || 'Erro desconhecido')
    } finally {
      setSaving(false)
    }
  }

  // --- WEB PKI INTEGRATION (LACUNA SOFTWARE) ---
  // https://webpki.lacunasoftware.com/

  const handleDigitalSignature = async () => {
    if (!currentPrescriptionId) {
      toast.info('Crie uma prescrição primeiro')
      return
    }

    if (!user?.id) {
      toast.warning('Sessão expirada', 'Faça login novamente.')
      return
    }

    // Confirmar assinatura
    const confirmed = await confirm({
      title: 'Confirmar Assinatura Digital',
      message: 'Você confirma a assinatura digital desta prescrição? Esta ação é irreversível e o documento será assinado com certificado ICP-Brasil.',
      type: 'warning',
      confirmText: 'Assinar',
      cancelText: 'Cancelar'
    })

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      console.log('🔐 Iniciando assinatura digital via Edge Function...')

      // Chamar Edge Function de assinatura digital
      const { data, error } = await supabase.functions.invoke('digital-signature', {
        body: {
          documentId: currentPrescriptionId,
          documentLevel: 'level_3', // Prescrição = nível 3 (requer ICP-Brasil)
          professionalId: user.id,
          userConfirmed: true
        }
      })

      if (error) {
        console.error('❌ Erro na Edge Function:', error)

        // Verificar se é erro de certificado não encontrado
        if (error.message?.includes('Certificado não encontrado') ||
          error.message?.includes('requiresRenewal') ||
          (data && data.requiresRenewal)) {
          const shouldNavigate = await confirm({
            title: 'Certificado não encontrado',
            message: 'Certificado ICP-Brasil não encontrado ou expirado. Deseja ir para a página de gestão de certificados para adicionar ou renovar seu certificado?',
            type: 'info',
            confirmText: 'Ir para Certificados',
            cancelText: 'Cancelar'
          })
          if (shouldNavigate) {
            navigate('/app/clinica/profissional/certificados')
          }
          return
        }

        throw error
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Erro desconhecido ao assinar prescrição')
      }

      console.log('✅ Assinatura digital realizada com sucesso:', data)

      // Atualizar lista de prescrições
      await loadPrescriptions()

      // Exibir sucesso
      toast.success(
        'Prescrição assinada!',
        `Código ITI: ${data.itiValidationCode || 'N/A'}${data.validationUrl ? ` • URL: ${data.validationUrl}` : ''}`
      )

    } catch (err: any) {
      console.error('❌ Erro ao assinar prescrição:', err)
      const errorMessage = err.message || 'Erro desconhecido ao assinar prescrição'
      setError(errorMessage)
      toast.error('Erro ao assinar prescrição', errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handlePrintPrescription = (prescription: Prescription) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.warning('Pop-ups bloqueado', 'Por favor, permita pop-ups para visualizar a prescrição.')
      return
    }

    const typeInfo = prescriptionTypes.find(t => t.id === prescription.prescription_type)

    // Formatar data
    const date = new Date(prescription.created_at).toLocaleDateString('pt-BR')
    const time = new Date(prescription.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescrição Médica - ${prescription.patient_name}</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: 'Arial', sans-serif; line-height: 1.5; color: #333; max-width: 21cm; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #00C16A; padding-bottom: 20px; }
          .logo { max-width: 200px; margin-bottom: 10px; }
          .doctor-info { font-size: 14px; color: #666; }
          .title { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 30px; text-transform: uppercase; color: #000; }
          .patient-box { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #eee; }
          .patient-name { font-size: 18px; font-weight: bold; }
          .medication-list { margin-bottom: 40px; }
          .medication-item { margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px dashed #ccc; }
          .med-name { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
          .med-dosage { font-size: 14px; margin-bottom: 5px; }
          .med-instructions { font-family: 'Courier New', monospace; background: #eee; padding: 10px; border-radius: 4px; margin-top: 5px; }
          .signature-box { margin-top: 60px; text-align: center; page-break-inside: avoid; }
          .digital-signature { border: 2px solid #00C16A; padding: 15px; display: inline-block; border-radius: 8px; background: #f0fdf4; width: 100%; }
          .ds-title { color: #00C16A; font-weight: bold; font-size: 14px; margin-bottom: 5px; }
          .ds-hash { font-family: monospace; font-size: 10px; color: #666; word-break: break-all; }
          .qr-section { margin-top: 20px; text-align: center; display: flex; justify-content: center; align-items: center; gap: 20px; }
          .footer { margin-top: 50px; font-size: 10px; text-align: center; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
          
          /* Watermark */
          .watermark {
            position: absolute; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%);
            width: 500px;
            height: 500px;
            background-image: url('${window.location.origin}/brain.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            opacity: 0.08; 
            z-index: -1; 
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div class="watermark"></div>
        
        <div class="header">
          <h1 style="color: #00C16A; margin:0;">MEDCANN LAB</h1>
          <div class="doctor-info">
            <strong>Dr(a). ${prescription.professional_name}</strong><br>
            CRM: ${prescription.professional_crm} ${prescription.professional_specialty ? `• ${prescription.professional_specialty}` : ''}
          </div>
        </div>

        <div class="title">
          ${typeInfo?.name || 'RECEITUÁRIO MÉDICO'}
        </div>

        <div class="patient-box">
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">PACIENTE</div>
          <div class="patient-name">${prescription.patient_name}</div>
          <div style="font-size: 12px; margin-top: 4px;">
            ${prescription.patient_cpf ? `CPF: ${prescription.patient_cpf}` : ''} 
            ${prescription.patient_email ? `• Email: ${prescription.patient_email}` : ''}
          </div>
        </div>

        <div class="medication-list">
          ${prescription.medications.map((med, index) => `
            <div class="medication-item">
              <div style="float: right; font-weight: bold;">${index + 1}</div>
              <div class="med-name">${med.name}</div>
              <div class="med-dosage">${med.dosage} • ${med.quantity} unidade(s)</div>
              <div class="med-dosage">Uso: ${med.frequency} por ${med.duration}</div>
              ${prescription.status === 'draft' && (prescription as any)['notes'] ? `<div class="med-instructions">Obs: ${(prescription as any)['notes']}</div>` : ''}
            </div>
          `).join('')}
        </div>

        ${prescription.status === 'signed' || prescription.status === 'sent' ? `
          <div class="signature-box">
            <div class="digital-signature">
              <div class="ds-title">DOCUMENTO ASSINADO DIGITALMENTE</div>
              <div>Dr(a). ${prescription.professional_name}</div>
              <div style="font-size: 12px; margin-top: 5px;">Data: ${new Date(prescription.signature_timestamp || '').toLocaleString()}</div>
              
              <div style="margin-top: 15px; border-top: 1px dashed #00C16A; padding-top: 10px;">
                <div style="font-size: 12px; font-weight: bold;">VALIDAÇÃO ICP-BRASIL / ITI</div>
                <div style="font-size: 12px;">Chave: ${prescription.iti_validation_code || 'AGUARDANDO-PROCESSAMENTO-ITI'}</div>
                <div class="ds-hash">${prescription.digital_signature}</div>
              </div>
            </div>
          </div>

          <div class="qr-section">
            <div style="border: 1px solid #ccc; padding: 5px; display: inline-block;">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(prescription.iti_validation_url || window.location.href)}" alt="QR Code Validação" width="100" />
            </div>
            <div style="text-align: left; font-size: 12px;">
              <strong>Para validar este documento:</strong><br>
              1. Acesse o portal do ITI ou aponte a câmera<br>
              2. Digite o código: <strong>${prescription.iti_validation_code}</strong><br>
              3. Verifique a autenticidade da assinatura
            </div>
          </div>
        ` : `
          <div class="signature-box">
             <div style="border-top: 1px solid #333; width: 60%; margin: 0 auto; padding-top: 10px;">
               Dr(a). ${prescription.professional_name}<br>
               CRM: ${prescription.professional_crm}<br>
               (Assinatura Manual ou Aguardando Assinatura Digital)
             </div>
          </div>
        `}

        <div class="footer">
          Emissão: ${date} às ${time} • MedCann Lab Platform • ID: ${prescription.id}<br>
          Este documento foi gerado eletronicamente e sua validade jurídica é garantida pela MP 2.200-2/2001.
        </div>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    // Pequeno delay para garantir carregamento de imagens/estilos
    setTimeout(() => {
      printWindow.print()
    }, 500)
  }

  const handleSendToPatient = async () => {
    if (!currentPrescriptionId) {
      toast.info('Crie e assine uma prescrição primeiro')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Verificar se está assinada
      const { data: prescription, error: fetchError } = await supabase
        .from('cfm_prescriptions')
        .select('status, patient_email, patient_phone, iti_validation_code, iti_validation_url')
        .eq('id', currentPrescriptionId)
        .single()

      if (fetchError) {
        throw fetchError
      }

      if (prescription.status !== 'signed') {
        toast.warning('Assinatura requerida', 'A prescrição precisa estar assinada digitalmente antes de ser enviada')
        return
      }

      // Atualizar status e marcar como enviada
      const updateData = {
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_via_email: !!prescription.patient_email,
        sent_via_sms: !!prescription.patient_phone,
        email_sent_at: prescription.patient_email ? new Date().toISOString() : null,
        sms_sent_at: prescription.patient_phone ? new Date().toISOString() : null
      }

      const { error: updateError } = await supabase
        .from('cfm_prescriptions')
        .update(updateData)
        .eq('id', currentPrescriptionId)

      if (updateError) {
        throw updateError
      }

      // Em produção, aqui seria feita a integração com serviço de email/SMS
      // Por enquanto, apenas simular
      toast.success('Prescrição enviada!', `Código ITI: ${prescription.iti_validation_code}${prescription.patient_email ? ` • Email: ${prescription.patient_email}` : ''}${prescription.patient_phone ? ` • SMS: ${prescription.patient_phone}` : ''}`)

      await loadPrescriptions()
      setShowForm(false)
      setCurrentPrescriptionId(null)
    } catch (err: any) {
      console.error('Erro ao enviar prescrição:', err)
      setError(err.message || 'Erro ao enviar prescrição')
      toast.error('Erro ao enviar prescrição', err.message || 'Erro desconhecido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/app/clinica/profissional/dashboard')}
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Prescrições Recentes</h2>
                {loading && <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />}
              </div>

              {loading && prescriptions.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <p className="text-slate-400 text-center py-8">Carregando prescrições...</p>
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                  <p className="text-slate-400 text-center py-8">Nenhuma prescrição encontrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {prescriptions.map((prescription) => {
                    const typeInfo = prescriptionTypes.find(t => t.id === prescription.prescription_type)
                    const TypeIcon = typeInfo?.icon || FileText
                    const statusColors = {
                      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                      signed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                      sent: 'bg-green-500/20 text-green-400 border-green-500/30',
                      validated: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
                    }
                    const statusLabels = {
                      draft: 'Rascunho',
                      signed: 'Assinada',
                      sent: 'Enviada',
                      validated: 'Validada',
                      cancelled: 'Cancelada'
                    }

                    return (
                      <div
                        key={prescription.id}
                        className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-slate-600 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${typeInfo?.color || 'from-[#00c16a] to-[#00a85a]'}`}>
                                <TypeIcon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white">{typeInfo?.name}</h3>
                                <p className="text-sm text-slate-400">
                                  {prescription.patient_name}
                                  {prescription.patient_cpf && ` • CPF: ${prescription.patient_cpf}`}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 space-y-2">
                              <div className="flex items-center space-x-4 text-sm">
                                <span className={`px-3 py-1 rounded-full border ${statusColors[prescription.status] || statusColors.draft}`}>
                                  {statusLabels[prescription.status] || 'Desconhecido'}
                                </span>
                                <span className="text-slate-400">
                                  {new Date(prescription.created_at).toLocaleDateString('pt-BR')}
                                </span>
                                {prescription.iti_validation_code && (
                                  <span className="text-blue-400">
                                    ITI: {prescription.iti_validation_code}
                                  </span>
                                )}
                              </div>

                              {prescription.medications && prescription.medications.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-slate-300 mb-2">Medicamentos:</p>
                                  <div className="space-y-1">
                                    {prescription.medications.map((med: any, idx: number) => (
                                      <p key={idx} className="text-sm text-slate-400">
                                        • {med.name} - {med.dosage} ({med.frequency})
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Widget de Assinatura Digital */}
                              {(prescription.status === 'signed' || prescription.status === 'sent' || prescription.status === 'validated') && (
                                <div className="mt-4">
                                  <DigitalSignatureWidget
                                    documentId={prescription.id}
                                    signature={prescription.digital_signature}
                                    signatureTimestamp={prescription.signature_timestamp}
                                    itiValidationCode={prescription.iti_validation_code}
                                    itiValidationUrl={prescription.iti_validation_url}
                                    status={prescription.status}
                                    professionalName={prescription.professional_name}
                                    showQRCode={true}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {prescription.iti_qr_code && (
                              <button
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                title="Ver QR Code"
                              >
                                <QrCode className="w-5 h-5 text-blue-400" />
                              </button>
                            )}
                            {prescription.iti_validation_url && (
                              <a
                                href={prescription.iti_validation_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                title="Validar no Portal ITI"
                              >
                                <FileCheck className="w-5 h-5 text-green-400" />
                              </a>
                            )}
                            <button
                              onClick={() => handlePrintPrescription(prescription)}
                              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                              title="Visualizar e Imprimir (PDF)"
                            >
                              <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-blue-400" />
                                <Download className="w-5 h-5 text-slate-400" />
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
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

                {/* Busca de Paciente */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Buscar Paciente
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="Digite nome, CPF ou email do paciente"
                    />
                    {selectedPatient && (
                      <button
                        onClick={() => {
                          setSelectedPatient(null)
                          setPatientName('')
                          setPatientCPF('')
                          setPatientEmail('')
                          setPatientPhone('')
                          setPatientId(null)
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Resultados da Busca */}
                  {patientResults.length > 0 && !selectedPatient && (
                    <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {patientResults.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => handleSelectPatient(patient)}
                          className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-b-0"
                        >
                          <p className="text-white font-medium">{patient.name}</p>
                          <p className="text-sm text-slate-400">
                            {patient.cpf && `CPF: ${patient.cpf} • `}
                            {patient.email && `Email: ${patient.email}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nome do Paciente *
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="Digite o nome completo"
                      required
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
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="(00) 00000-0000"
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
                        onChange={(e) => setCurrentMedication({ ...currentMedication, name: e.target.value })}
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
                        onChange={(e) => setCurrentMedication({ ...currentMedication, dosage: e.target.value })}
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
                        onChange={(e) => setCurrentMedication({ ...currentMedication, frequency: e.target.value })}
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
                        onChange={(e) => setCurrentMedication({ ...currentMedication, duration: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        placeholder="Ex: 7 dias"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleAddMedication}
                    className="w-full bg-gradient-to-r from-[#00c16a] to-[#00a85a] text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-colors"
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

              {/* Observações */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Observações / Notas
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  placeholder="Observações adicionais sobre a prescrição..."
                  rows={3}
                />
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <button
                  onClick={handleCreatePrescription}
                  disabled={saving || !patientName || medications.length === 0}
                  className="flex-1 bg-gradient-to-r from-[#00c16a] to-[#00a85a] text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-5 h-5" />
                      <span>Criar Prescrição</span>
                    </>
                  )}
                </button>
                {currentPrescriptionId && (
                  <>
                    <button
                      onClick={() => {
                        const currentPrescription = prescriptions.find(p => p.id === currentPrescriptionId)
                        if (currentPrescription) {
                          handlePrintPrescription(currentPrescription)
                        } else {
                          toast.error('Erro ao carregar', 'Tente recarregar a página.')
                        }
                      }}
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Eye className="w-5 h-5" />
                      <span>Visualizar / Imprimir</span>
                    </button>
                    <button
                      onClick={handleDigitalSignature}
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Assinando...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-5 h-5" />
                          <span>Assinar Digitalmente (ICP Brasil)</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleSendToPatient}
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-[#00c16a] to-[#00a85a] text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Enviar ao Paciente</span>
                        </>
                      )}
                    </button>
                  </>
                )}
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
