/**
 * Sistema de Permissões da IA Residente
 * Define e gerencia as permissões necessárias para operações da plataforma
 */

interface Permission {
  id: string
  name: string
  description: string
  required: boolean
  granted: boolean
  category: 'dashboard' | 'reports' | 'nft' | 'patients' | 'system'
}

interface PermissionSet {
  userId: string
  permissions: Permission[]
  expiresAt?: Date
  grantedBy: string
}

class NoaPermissionManager {
  private permissions: Permission[] = [
    // Dashboard do Paciente
    {
      id: 'dashboard_read',
      name: 'Leitura do Dashboard',
      description: 'Permite ler dados do dashboard do paciente',
      required: true,
      granted: true,
      category: 'dashboard'
    },
    {
      id: 'dashboard_write',
      name: 'Escrita no Dashboard',
      description: 'Permite escrever dados no dashboard do paciente',
      required: true,
      granted: true,
      category: 'dashboard'
    },
    {
      id: 'dashboard_update',
      name: 'Atualização do Dashboard',
      description: 'Permite atualizar dados do dashboard do paciente',
      required: true,
      granted: true,
      category: 'dashboard'
    },

    // Relatórios Clínicos
    {
      id: 'reports_create',
      name: 'Criar Relatórios',
      description: 'Permite criar novos relatórios clínicos',
      required: true,
      granted: true,
      category: 'reports'
    },
    {
      id: 'reports_read',
      name: 'Ler Relatórios',
      description: 'Permite ler relatórios clínicos existentes',
      required: true,
      granted: true,
      category: 'reports'
    },
    {
      id: 'reports_update',
      name: 'Atualizar Relatórios',
      description: 'Permite atualizar relatórios clínicos',
      required: true,
      granted: true,
      category: 'reports'
    },
    {
      id: 'reports_delete',
      name: 'Excluir Relatórios',
      description: 'Permite excluir relatórios clínicos',
      required: false,
      granted: false,
      category: 'reports'
    },

    // NFTs
    {
      id: 'nft_generate',
      name: 'Gerar NFTs',
      description: 'Permite gerar hash NFT para documentos',
      required: true,
      granted: true,
      category: 'nft'
    },
    {
      id: 'nft_verify',
      name: 'Verificar NFTs',
      description: 'Permite verificar autenticidade de NFTs',
      required: true,
      granted: true,
      category: 'nft'
    },

    // Pacientes
    {
      id: 'patients_read',
      name: 'Ler Dados do Paciente',
      description: 'Permite ler informações dos pacientes',
      required: true,
      granted: true,
      category: 'patients'
    },
    {
      id: 'patients_write',
      name: 'Escrever Dados do Paciente',
      description: 'Permite escrever informações dos pacientes',
      required: true,
      granted: true,
      category: 'patients'
    },
    {
      id: 'patients_history',
      name: 'Histórico do Paciente',
      description: 'Permite acessar histórico completo do paciente',
      required: true,
      granted: true,
      category: 'patients'
    },

    // Sistema
    {
      id: 'system_status',
      name: 'Status do Sistema',
      description: 'Permite verificar status da plataforma',
      required: true,
      granted: true,
      category: 'system'
    },
    {
      id: 'system_logs',
      name: 'Logs do Sistema',
      description: 'Permite acessar logs do sistema',
      required: false,
      granted: false,
      category: 'system'
    },
    {
      id: 'system_config',
      name: 'Configurações do Sistema',
      description: 'Permite modificar configurações do sistema',
      required: false,
      granted: false,
      category: 'system'
    }
  ]

  /**
   * Verificar se a IA tem permissão para uma operação
   */
  hasPermission(permissionId: string): boolean {
    const permission = this.permissions.find(p => p.id === permissionId)
    return permission ? permission.granted : false
  }

  /**
   * Verificar se a IA tem todas as permissões necessárias
   */
  hasRequiredPermissions(): boolean {
    return this.permissions
      .filter(p => p.required)
      .every(p => p.granted)
  }

  /**
   * Obter permissões por categoria
   */
  getPermissionsByCategory(category: Permission['category']): Permission[] {
    return this.permissions.filter(p => p.category === category)
  }

  /**
   * Obter todas as permissões
   */
  getAllPermissions(): Permission[] {
    return [...this.permissions]
  }

  /**
   * Conceder permissão específica
   */
  grantPermission(permissionId: string): boolean {
    const permission = this.permissions.find(p => p.id === permissionId)
    if (permission) {
      permission.granted = true
      console.log(`✅ Permissão concedida: ${permission.name}`)
      return true
    }
    return false
  }

  /**
   * Revogar permissão específica
   */
  revokePermission(permissionId: string): boolean {
    const permission = this.permissions.find(p => p.id === permissionId)
    if (permission && !permission.required) {
      permission.granted = false
      console.log(`❌ Permissão revogada: ${permission.name}`)
      return true
    }
    return false
  }

  /**
   * Verificar permissões para operação específica
   */
  checkOperationPermissions(operation: string): { allowed: boolean; missingPermissions: string[] } {
    const operationPermissions: Record<string, string[]> = {
      'create_report': ['reports_create', 'dashboard_write'],
      'read_report': ['reports_read', 'patients_read'],
      'update_report': ['reports_update', 'dashboard_update'],
      'delete_report': ['reports_delete'],
      'generate_nft': ['nft_generate', 'reports_read'],
      'verify_nft': ['nft_verify'],
      'access_dashboard': ['dashboard_read', 'patients_read'],
      'update_dashboard': ['dashboard_write', 'dashboard_update'],
      'read_patient_history': ['patients_history', 'patients_read'],
      'check_system_status': ['system_status'],
      'access_logs': ['system_logs'],
      'modify_config': ['system_config']
    }

    const requiredPermissions = operationPermissions[operation] || []
    const missingPermissions = requiredPermissions.filter(p => !this.hasPermission(p))

    return {
      allowed: missingPermissions.length === 0,
      missingPermissions
    }
  }

  /**
   * Obter resumo das permissões
   */
  getPermissionSummary(): {
    total: number
    granted: number
    required: number
    requiredGranted: number
    categories: Record<string, { total: number; granted: number }>
  } {
    const categories = this.permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = { total: 0, granted: 0 }
      }
      acc[permission.category].total++
      if (permission.granted) {
        acc[permission.category].granted++
      }
      return acc
    }, {} as Record<string, { total: number; granted: number }>)

    return {
      total: this.permissions.length,
      granted: this.permissions.filter(p => p.granted).length,
      required: this.permissions.filter(p => p.required).length,
      requiredGranted: this.permissions.filter(p => p.required && p.granted).length,
      categories
    }
  }

  /**
   * Gerar token de autorização para API
   */
  generateAuthToken(): string {
    const permissions = this.permissions
      .filter(p => p.granted)
      .map(p => p.id)
      .join(',')

    return btoa(JSON.stringify({
      permissions,
      timestamp: Date.now(),
      issuer: 'noa-resident-ai',
      version: '1.0'
    }))
  }

  /**
   * Validar token de autorização
   */
  validateAuthToken(token: string): boolean {
    try {
      const decoded = JSON.parse(atob(token))
      const now = Date.now()
      const tokenAge = now - decoded.timestamp
      
      // Token válido por 24 horas
      return tokenAge < 24 * 60 * 60 * 1000 && decoded.issuer === 'noa-resident-ai'
    } catch {
      return false
    }
  }
}

// Instância singleton
let noaPermissionManager: NoaPermissionManager | null = null

export const getNoaPermissionManager = (): NoaPermissionManager => {
  if (!noaPermissionManager) {
    noaPermissionManager = new NoaPermissionManager()
  }
  return noaPermissionManager
}

export default NoaPermissionManager
