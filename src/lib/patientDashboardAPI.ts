/**
 * API para integração da IA Residente com o Dashboard do Paciente
 * Permite registro de relatórios clínicos e emissão de NFTs
 */

import { getNoaPermissionManager } from './noaPermissionManager'

interface PatientRecord {
  id: string
  patientId: string
  patientName: string
  reportType: 'initial_assessment' | 'follow_up' | 'consultation'
  content: string
  timestamp: Date
  professionalId: string
  professionalName: string
  status: 'draft' | 'completed' | 'approved'
  nftHash?: string
}

interface NFTMetadata {
  patientId: string
  reportId: string
  timestamp: Date
  professionalId: string
  contentHash: string
  blockchain: 'ethereum' | 'polygon'
}

class PatientDashboardAPI {
  private baseURL: string
  private apiKey: string

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.medcannlab.com'
    this.apiKey = import.meta.env.VITE_API_KEY || ''
  }

  /**
   * Registrar relatório clínico no dashboard do paciente
   */
  async registerClinicalReport(record: Omit<PatientRecord, 'id' | 'nftHash'>): Promise<PatientRecord> {
    try {
      // Verificar permissões
      const permissionManager = getNoaPermissionManager()
      const permissionCheck = permissionManager.checkOperationPermissions('create_report')
      
      if (!permissionCheck.allowed) {
        throw new Error(`Permissões insuficientes: ${permissionCheck.missingPermissions.join(', ')}`)
      }

      console.log('📋 Registrando relatório clínico no dashboard do paciente...')
      
      const response = await fetch(`${this.baseURL}/api/patients/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          ...record,
          timestamp: record.timestamp.toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Erro ao registrar relatório: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Relatório registrado com sucesso:', result.id)
      
      return result
    } catch (error) {
      console.error('❌ Erro ao registrar relatório clínico:', error)
      throw error
    }
  }

  /**
   * Emitir hash NFT para o relatório clínico
   */
  async generateNFTHash(recordId: string, metadata: NFTMetadata): Promise<string> {
    try {
      console.log('🔗 Gerando hash NFT para relatório clínico...')
      
      const response = await fetch(`${this.baseURL}/api/patients/records/${recordId}/nft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          ...metadata,
          timestamp: metadata.timestamp.toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Erro ao gerar NFT: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Hash NFT gerado:', result.nftHash)
      
      return result.nftHash
    } catch (error) {
      console.error('❌ Erro ao gerar hash NFT:', error)
      throw error
    }
  }

  /**
   * Buscar relatórios do paciente
   */
  async getPatientRecords(patientId: string): Promise<PatientRecord[]> {
    try {
      console.log('📊 Buscando relatórios do paciente...')
      
      const response = await fetch(`${this.baseURL}/api/patients/${patientId}/records`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Key': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar relatórios: ${response.statusText}`)
      }

      const records = await response.json()
      console.log('✅ Relatórios encontrados:', records.length)
      
      return records
    } catch (error) {
      console.error('❌ Erro ao buscar relatórios:', error)
      throw error
    }
  }

  /**
   * Atualizar status do relatório
   */
  async updateReportStatus(recordId: string, status: PatientRecord['status']): Promise<void> {
    try {
      console.log('🔄 Atualizando status do relatório...')
      
      const response = await fetch(`${this.baseURL}/api/patients/records/${recordId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error(`Erro ao atualizar status: ${response.statusText}`)
      }

      console.log('✅ Status atualizado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error)
      throw error
    }
  }

  /**
   * Verificar se a API está disponível
   */
  async checkAvailability(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey
        }
      })
      
      return response.ok
    } catch (error) {
      console.warn('⚠️ API não disponível:', error)
      return false
    }
  }

  /**
   * Processo completo: registrar relatório + gerar NFT
   */
  async processCompleteReport(
    patientId: string,
    patientName: string,
    reportContent: string,
    professionalId: string,
    professionalName: string
  ): Promise<{ recordId: string; nftHash: string }> {
    try {
      console.log('🚀 Iniciando processo completo de registro e NFT...')

      // 1. Registrar relatório clínico
      const record = await this.registerClinicalReport({
        patientId,
        patientName,
        reportType: 'initial_assessment',
        content: reportContent,
        timestamp: new Date(),
        professionalId,
        professionalName,
        status: 'completed'
      })

      // 2. Gerar hash NFT
      const nftHash = await this.generateNFTHash(record.id, {
        patientId,
        reportId: record.id,
        timestamp: new Date(),
        professionalId,
        contentHash: this.generateContentHash(reportContent),
        blockchain: 'polygon'
      })

      // 3. Atualizar registro com NFT hash
      await this.updateReportStatus(record.id, 'approved')

      console.log('✅ Processo completo finalizado:', { recordId: record.id, nftHash })
      
      return {
        recordId: record.id,
        nftHash
      }
    } catch (error) {
      console.error('❌ Erro no processo completo:', error)
      throw error
    }
  }

  /**
   * Gerar hash do conteúdo para NFT
   */
  private generateContentHash(content: string): string {
    // Simulação de hash criptográfico
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    return Array.from(data)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 64)
  }
}

// Instância singleton
let patientDashboardAPI: PatientDashboardAPI | null = null

export const getPatientDashboardAPI = (): PatientDashboardAPI => {
  if (!patientDashboardAPI) {
    patientDashboardAPI = new PatientDashboardAPI()
  }
  return patientDashboardAPI
}

export default PatientDashboardAPI
