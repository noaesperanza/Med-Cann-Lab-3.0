export type HealthStatus = 'operational' | 'degraded' | 'down'

export interface PlatformComponentStatus {
  id: string
  name: string
  status: HealthStatus
  latencyMs?: number
  lastCheckedAt: string
  region?: string
  message?: string
  metadata?: Record<string, unknown>
}

export interface PlatformStatus {
  health: HealthStatus
  uptimeSeconds?: number
  version?: string
  components: PlatformComponentStatus[]
  incidents?: Array<{
    id: string
    title: string
    severity: 'info' | 'warning' | 'critical'
    startedAt: string
    resolvedAt?: string
    description?: string
  }>
  lastCheckedAt: string
  metadata?: Record<string, unknown>
}

export interface TrainingContextRequest extends Record<string, unknown> {
  profile?: string
  limit?: number
  includeProtocols?: boolean
  focusArea?: 'nefrologia' | 'cannabis' | 'educacional' | 'multidisciplinar'
  viewport?: 'clinica' | 'pesquisa' | 'ensino'
}

export interface TrainingContextItem {
  id: string
  topic: string
  summary: string
  updatedAt: string
  relatedProtocols?: string[]
  tags?: string[]
  references?: Array<{
    id: string
    title: string
    link?: string
  }>
  metadata?: Record<string, unknown>
}

export interface TrainingContextResponse {
  context: TrainingContextItem[]
  total: number
  lastUpdatedAt: string
  profile?: string
  focusArea?: string
  metadata?: Record<string, unknown>
}

export type SimulationLifecycleStatus = 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'archived'

export interface SimulationFilters extends Record<string, unknown> {
  patientId?: string
  professionalId?: string
  status?: SimulationLifecycleStatus
  tags?: string[]
  limit?: number
}

export interface SimulationScenario {
  id: string
  patientAlias: string
  condition: string
  stage: string
  status: SimulationLifecycleStatus
  createdAt: string
  updatedAt: string
  assignedProfessional?: string
  metadata?: Record<string, unknown>
}

export interface SimulationResponse {
  simulations: SimulationScenario[]
  total: number
  metadata?: Record<string, unknown>
}

export type SimulationActionType = 'create' | 'start' | 'pause' | 'resume' | 'complete' | 'reset'

export interface SimulationActionPayload extends Record<string, unknown> {
  simulationId?: string
  action: SimulationActionType
  data?: Record<string, unknown>
}

export type KnowledgeEntryType = 'artigo' | 'protocolo' | 'dissertacao' | 'aula' | 'simulacao' | 'outro'

export interface KnowledgeLibraryRequest extends Record<string, unknown> {
  query?: string
  category?: 'protocolos' | 'biblioteca' | 'dissertacao' | 'imre'
  tags?: string[]
  limit?: number
  includeContent?: boolean
}

export interface KnowledgeEntry {
  id: string
  title: string
  type: KnowledgeEntryType
  summary: string
  updatedAt: string
  content?: string
  url?: string
  tags?: string[]
  metadata?: Record<string, unknown>
}

export interface KnowledgeLibraryResponse {
  entries: KnowledgeEntry[]
  total: number
  highlights?: string[]
  metadata?: Record<string, unknown>
}

export interface AuditLogPayload {
  conversationId: string
  userId?: string
  action: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export type ConversationalIntent =
  | 'CHECK_STATUS'
  | 'GET_TRAINING_CONTEXT'
  | 'MANAGE_SIMULATION'
  | 'ACCESS_LIBRARY'
  | 'IMRE_ANALYSIS'
  | 'SMALL_TALK'
  | 'FOLLOW_UP'
  | 'HELP'
  | 'UNKNOWN'

export interface ParsedIntent {
  intent: ConversationalIntent
  confidence: number
  entities: Record<string, string>
  focusArea?: string
  axes?: Array<'somatico' | 'psiquico' | 'social'>
  isClinicalCommand?: boolean
  rawText: string
}

export interface ConversationContext {
  id: string
  userId?: string
  history: Array<{
    role: 'user' | 'noa'
    message: string
    timestamp: string
    intent?: ConversationalIntent
  }>
  activeIntent?: ConversationalIntent
  lastUpdatedAt: string
  focusArea?: string
  imreAxes?: Array<'somatico' | 'psiquico' | 'social'>
}

