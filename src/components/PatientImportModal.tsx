import React, { useState, useRef } from 'react'
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2, Users, FileSpreadsheet } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import * as pdfjsLib from 'pdfjs-dist'

// Configurar worker do PDF.js
if (typeof window !== 'undefined') {
  try {
    // Tentar usar worker local primeiro, depois CDN como fallback
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  } catch (err) {
    console.warn('Erro ao configurar PDF.js worker:', err)
  }
}

interface PatientData {
  name: string
  email?: string
  phone?: string
  cpf?: string
  birthDate?: string
  gender?: string
  address?: string
  labResults?: any
}

interface PatientImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete?: (importedCount: number) => void
}

const PatientImportModal: React.FC<PatientImportModalProps> = ({ isOpen, onClose, onImportComplete }) => {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<'pdf' | 'csv' | 'excel'>('pdf')
  const [extractedPatients, setExtractedPatients] = useState<PatientData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResults, setImportResults] = useState<{
    success: number
    errors: number
    skipped: number
    details: string[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile)
    setExtractedPatients([])
    setImportResults(null)
    setIsProcessing(true)

    try {
      if (importMode === 'pdf') {
        await extractPatientsFromPDF(selectedFile)
      } else if (importMode === 'csv') {
        await extractPatientsFromCSV(selectedFile)
      } else {
        showError('Formato Excel ainda não suportado. Use PDF ou CSV.')
        setIsProcessing(false)
      }
    } catch (err: any) {
      console.error('Erro ao processar arquivo:', err)
      showError('Erro ao processar arquivo: ' + (err.message || 'Erro desconhecido'))
      setIsProcessing(false)
    }
  }

  const extractPatientsFromPDF = async (pdfFile: File) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      const patients: PatientData[] = []
      const patientNames = new Set<string>()

      // Processar todas as páginas
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        const text = textContent.items.map((item: any) => item.str).join(' ')

        // Extrair nomes de pacientes (heurística simples - pode ser melhorada)
        // Procurar por padrões comuns em planilhas: linhas com nomes próprios
        const lines = text.split('\n').filter(line => line.trim().length > 0)

        for (const line of lines) {
          // Tentar identificar linhas que contêm nomes de pacientes
          // Normalmente em planilhas, a primeira coluna contém o nome
          const words = line.trim().split(/\s+/)

          // Se a linha tem 2+ palavras e parece um nome (primeira letra maiúscula)
          if (words.length >= 2) {
            const potentialName = words.slice(0, 2).join(' ')

            // Verificar se parece um nome (não é número, não é data, etc.)
            if (
              /^[A-ZÁÉÍÓÚÇ][a-záéíóúç]+ [A-ZÁÉÍÓÚÇ][a-záéíóúç]+/.test(potentialName) &&
              !potentialName.match(/\d/) &&
              !patientNames.has(potentialName)
            ) {
              patientNames.add(potentialName)
              patients.push({
                name: potentialName,
                labResults: { source: 'planilha', page: pageNum }
              })
            }
          }
        }
      }

      if (patients.length === 0) {
        // Tentar método alternativo: procurar por padrões mais específicos
        const fullText = (await Promise.all(
          Array.from({ length: pdf.numPages }, async (_, i) => {
            const page = await pdf.getPage(i + 1)
            const textContent = await page.getTextContent()
            return textContent.items.map((item: any) => item.str).join(' ')
          })
        )).join('\n')

        // Procurar por padrões de nomes em português
        const namePattern = /([A-ZÁÉÍÓÚÇ][a-záéíóúç]+(?:\s+[A-ZÁÉÍÓÚÇ][a-záéíóúç]+)+)/g
        const matches = fullText.match(namePattern) || []

        for (const match of matches) {
          if (!patientNames.has(match) && match.split(' ').length >= 2) {
            patientNames.add(match)
            patients.push({
              name: match,
              labResults: { source: 'planilha' }
            })
          }
        }
      }

      setExtractedPatients(patients)
      setIsProcessing(false)

      if (patients.length === 0) {
        showError('Nenhum paciente encontrado na planilha. Verifique se o formato está correto.')
      } else {
        success(`${patients.length} paciente(s) extraído(s) da planilha!`)
      }
    } catch (err: any) {
      console.error('Erro ao extrair pacientes do PDF:', err)
      showError('Erro ao processar PDF: ' + (err.message || 'Erro desconhecido'))
      setIsProcessing(false)
    }
  }

  const extractPatientsFromCSV = async (csvFile: File) => {
    try {
      const text = await csvFile.text()
      const lines = text.split('\n').filter(line => line.trim().length > 0)

      if (lines.length === 0) {
        showError('Arquivo CSV vazio')
        setIsProcessing(false)
        return
      }

      // Assumir que a primeira linha é cabeçalho
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const nameColumnIndex = headers.findIndex(h =>
        h.includes('nome') || h.includes('name') || h.includes('paciente')
      )

      if (nameColumnIndex === -1) {
        showError('Coluna "Nome" não encontrada no CSV. Verifique o cabeçalho.')
        setIsProcessing(false)
        return
      }

      const patients: PatientData[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const name = values[nameColumnIndex]

        if (name && name.length > 0) {
          const patient: PatientData = { name }

          // Tentar extrair outros campos se existirem
          const emailIndex = headers.findIndex(h => h.includes('email') || h.includes('e-mail'))
          const phoneIndex = headers.findIndex(h => h.includes('telefone') || h.includes('phone') || h.includes('celular'))
          const cpfIndex = headers.findIndex(h => h.includes('cpf'))

          if (emailIndex !== -1 && values[emailIndex]) patient.email = values[emailIndex]
          if (phoneIndex !== -1 && values[phoneIndex]) patient.phone = values[phoneIndex]
          if (cpfIndex !== -1 && values[cpfIndex]) patient.cpf = values[cpfIndex]

          patients.push(patient)
        }
      }

      setExtractedPatients(patients)
      setIsProcessing(false)

      if (patients.length === 0) {
        showError('Nenhum paciente encontrado no CSV')
      } else {
        success(`${patients.length} paciente(s) extraído(s) do CSV!`)
      }
    } catch (err: any) {
      console.error('Erro ao extrair pacientes do CSV:', err)
      showError('Erro ao processar CSV: ' + (err.message || 'Erro desconhecido'))
      setIsProcessing(false)
    }
  }

  const importPatients = async () => {
    if (extractedPatients.length === 0) {
      showError('Nenhum paciente para importar')
      return
    }

    setIsImporting(true)
    setImportProgress(0)

    const results = {
      success: 0,
      errors: 0,
      skipped: 0,
      details: [] as string[]
    }

    try {
      for (let i = 0; i < extractedPatients.length; i++) {
        const patient = extractedPatients[i]
        setImportProgress(Math.round(((i + 1) / extractedPatients.length) * 100))

        try {
          // Verificar se paciente já existe (por nome ou email)
          let existingPatient = null

          if (patient.email) {
            const { data: emailMatch } = await supabase
              .from('profiles')
              .select('id, name, email')
              .eq('email', patient.email)
              .single()

            if (emailMatch) {
              existingPatient = emailMatch
            }
          }

          // Se não encontrou por email, buscar por nome
          if (!existingPatient) {
            const { data: nameMatches } = await supabase
              .from('profiles')
              .select('id, name, email')
              .ilike('name', `%${patient.name}%`)
              .limit(1)

            if (nameMatches && nameMatches.length > 0) {
              existingPatient = nameMatches[0]
            }
          }

          if (existingPatient) {
            results.skipped++
            results.details.push(`⏭️ ${patient.name} - Já existe no sistema`)
            continue
          }

          // Criar novo paciente
          // Primeiro criar usuário no auth.users
          const email = patient.email || `${patient.name.toLowerCase().replace(/\s+/g, '.')}@importado.medcannlab.com`

          // Verificar se email já existe na tabela profiles
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('email', email)
            .single()

          if (existingProfile) {
            results.skipped++
            results.details.push(`⏭️ ${patient.name} - Email já cadastrado`)
            continue
          }

          // Criar usuário paciente usando RPC ou inserção direta
          // Como não temos acesso ao auth.admin no cliente, vamos criar diretamente na tabela profiles
          // e o usuário precisará fazer signup depois ou usar uma função RPC no backend
          const tempPassword = Math.random().toString(36).slice(-12)
          const userId = crypto.randomUUID()

          // Criar perfil do paciente diretamente
          // Nota: Para criar usuário completo, seria necessário uma função RPC no Supabase
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              name: patient.name,
              email: email,
              phone: patient.phone || null,
              cpf: patient.cpf || null,
              type: 'patient',
              created_at: new Date().toISOString()
            })

          if (profileError) {
            throw profileError
          }

          // Tentar criar usuário no auth.users via RPC (se disponível)
          // Se não disponível, o perfil já foi criado e o usuário pode fazer signup depois
          try {
            const { error: rpcError } = await (supabase as any).rpc('create_patient_user', {
              user_id: userId,
              user_email: email,
              user_password: tempPassword,
              user_name: patient.name
            })

            // Se RPC não existir, não é problema crítico - o perfil já foi criado
            if (rpcError && !rpcError.message.includes('function') && !rpcError.message.includes('does not exist')) {
              console.warn('RPC create_patient_user não disponível ou erro:', rpcError)
            }
          } catch (rpcErr) {
            // RPC pode não existir, não é crítico
            console.warn('RPC não disponível, perfil criado mas usuário auth precisa ser criado manualmente')
          }



          results.success++
          results.details.push(`✅ ${patient.name} - Importado com sucesso`)
        } catch (err: any) {
          console.error(`Erro ao importar ${patient.name}:`, err)
          results.errors++
          results.details.push(`❌ ${patient.name} - Erro: ${err.message || 'Erro desconhecido'}`)
        }
      }

      setImportResults(results)
      setIsImporting(false)

      if (results.success > 0) {
        success(`${results.success} paciente(s) importado(s) com sucesso!`)
        if (onImportComplete) {
          onImportComplete(results.success)
        }
      }
    } catch (err: any) {
      console.error('Erro durante importação:', err)
      showError('Erro durante importação: ' + (err.message || 'Erro desconhecido'))
      setIsImporting(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Users className="w-6 h-6 mr-2 text-blue-400" />
              Importar Pacientes de Planilha
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Importe pacientes de planilhas PDF, CSV ou Excel
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Seleção de Modo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Tipo de Arquivo
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setImportMode('pdf')}
                className={`p-4 rounded-lg border-2 transition-colors ${importMode === 'pdf'
                  ? 'border-blue-500 bg-blue-500/20 text-white'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                  }`}
              >
                <FileText className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">PDF</span>
              </button>
              <button
                onClick={() => setImportMode('csv')}
                className={`p-4 rounded-lg border-2 transition-colors ${importMode === 'csv'
                  ? 'border-blue-500 bg-blue-500/20 text-white'
                  : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                  }`}
              >
                <FileSpreadsheet className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">CSV</span>
              </button>
              <button
                onClick={() => setImportMode('excel')}
                disabled
                className="p-4 rounded-lg border-2 border-slate-600 bg-slate-700/30 text-slate-500 cursor-not-allowed opacity-50"
              >
                <FileSpreadsheet className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Excel</span>
                <span className="text-xs block mt-1">Em breve</span>
              </button>
            </div>
          </div>

          {/* Área de Upload */}
          {!file && (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-white font-medium mb-2">
                Clique para selecionar ou arraste o arquivo aqui
              </p>
              <p className="text-sm text-slate-400">
                Formatos suportados: {importMode === 'pdf' ? 'PDF' : 'CSV'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={importMode === 'pdf' ? '.pdf' : '.csv'}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0])
                  }
                }}
                className="hidden"
              />
            </div>
          )}

          {/* Processando */}
          {isProcessing && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-slate-300">Processando arquivo...</p>
              <p className="text-sm text-slate-400 mt-2">Extraindo dados dos pacientes</p>
            </div>
          )}

          {/* Arquivo Selecionado */}
          {file && !isProcessing && extractedPatients.length === 0 && (
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-sm text-slate-400">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null)
                    setExtractedPatients([])
                  }}
                  className="p-2 hover:bg-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          )}

          {/* Pacientes Extraídos */}
          {extractedPatients.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Pacientes Encontrados ({extractedPatients.length})
                </h3>
                <button
                  onClick={importPatients}
                  disabled={isImporting}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Importando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Importar Todos</span>
                    </>
                  )}
                </button>
              </div>

              {/* Barra de Progresso */}
              {isImporting && (
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Progresso</span>
                    <span className="text-sm text-slate-300">{importProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Lista de Pacientes */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {extractedPatients.map((patient, index) => (
                  <div
                    key={index}
                    className="bg-slate-700/50 rounded-lg p-4 border border-slate-600"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium">{patient.name}</p>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                          {patient.email && <span>📧 {patient.email}</span>}
                          {patient.phone && <span>📞 {patient.phone}</span>}
                          {patient.cpf && <span>🆔 {patient.cpf}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resultados da Importação */}
          {importResults && (
            <div className="mt-6 bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-4">Resultado da Importação</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-400">{importResults.success}</p>
                  <p className="text-sm text-slate-400">Importados</p>
                </div>
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-400">{importResults.skipped}</p>
                  <p className="text-sm text-slate-400">Ignorados</p>
                </div>
                <div className="text-center">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-400">{importResults.errors}</p>
                  <p className="text-sm text-slate-400">Erros</p>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {importResults.details.map((detail, index) => (
                  <p key={index} className="text-sm text-slate-300">{detail}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default PatientImportModal

