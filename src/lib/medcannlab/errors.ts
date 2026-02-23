export interface MedCannLabErrorOptions {
  status?: number
  code?: string
  details?: unknown
  cause?: unknown
}

export class MedCannLabApiError extends Error {
  public readonly status: number
  public readonly code?: string
  public readonly details?: unknown

  constructor(message: string, options: MedCannLabErrorOptions = {}) {
    super(message)
    this.name = 'MedCannLabApiError'
    this.status = options.status ?? 500
    this.code = options.code
    this.details = options.details

    if (options.cause !== undefined) {
      ;(this as unknown as { cause?: unknown }).cause = options.cause
    }
  }
}

export class MedCannLabAuthenticationError extends MedCannLabApiError {
  constructor(message = 'Falha de autenticação com a API MedCannLab', options: MedCannLabErrorOptions = {}) {
    super(message, { ...options, status: options.status ?? 401 })
    this.name = 'MedCannLabAuthenticationError'
  }
}

export class MedCannLabAuthorizationError extends MedCannLabApiError {
  constructor(message = 'Permissões insuficientes para executar esta operação', options: MedCannLabErrorOptions = {}) {
    super(message, { ...options, status: options.status ?? 403 })
    this.name = 'MedCannLabAuthorizationError'
  }
}

export class MedCannLabValidationError extends MedCannLabApiError {
  constructor(message = 'Dados inválidos enviados à API MedCannLab', options: MedCannLabErrorOptions = {}) {
    super(message, { ...options, status: options.status ?? 422 })
    this.name = 'MedCannLabValidationError'
  }
}

export class MedCannLabNetworkError extends MedCannLabApiError {
  constructor(message = 'Erro de rede ao comunicar com a API MedCannLab', options: MedCannLabErrorOptions = {}) {
    super(message, { ...options, status: options.status ?? 503 })
    this.name = 'MedCannLabNetworkError'
  }
}

export class MedCannLabTimeoutError extends MedCannLabApiError {
  constructor(message = 'Tempo limite excedido na requisição à API MedCannLab', options: MedCannLabErrorOptions = {}) {
    super(message, { ...options, status: options.status ?? 504 })
    this.name = 'MedCannLabTimeoutError'
  }
}

