import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Heart,
  Loader2,
  Lock,
  Plus,
  Search,
  Stethoscope,
  Target,
  User,
  X,
  Zap
} from 'lucide-react'

import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

type Rationality =
  | 'biomedical'
  | 'traditional_chinese'
  | 'ayurvedic'
  | 'homeopathic'
  | 'integrative'

type PrescriptionTemplate = {
  id: string
  name: string
  summary: string | null
  description: string | null
  rationality: Rationality
  category: string | null
  defaultDosage: string | null
  defaultFrequency: string | null
  defaultDuration: string | null
  defaultInstructions: string | null
  indications: string[]
  contraindications: string[]
  monitoring: string[]
  tags: string[]
}

type PatientPrescription = {
  id: string
  title: string
  summary: string | null
  rationality: Rationality | null
  dosage: string | null
  frequency: string | null
  duration: string | null
  instructions: string | null
  indications: string[]
  status: 'draft' | 'active' | 'completed' | 'suspended' | 'cancelled'
  issuedAt: string
  startsAt: string | null
  endsAt: string | null
  lastReviewedAt: string | null
  professionalName: string | null
  templateName: string | null
  planTitle: string | null
}

interface IntegrativePrescriptionsProps {
  patientId?: string | null
  patientName?: string | null
  planId?: string | null
  className?: string
}

type DraftPrescription = {
  dosage: string
  frequency: string
  duration: string
  instructions: string
  notes: string
  startsAt: string
  endsAt: string
}

const RATIONALITY_OPTIONS: Array<{
  key: 'all' | Rationality
  label: string
  icon: React.ReactNode
}> = [
  { key: 'all', label: 'Todas', icon: <Brain className="w-4 h-4" /> },
  { key: 'biomedical', label: 'Biomédica', icon: <Heart className="w-4 h-4" /> },
  { key: 'traditional_chinese', label: 'MTC', icon: <Stethoscope className="w-4 h-4" /> },
  { key: 'ayurvedic', label: 'Ayurvédica', icon: <Zap className="w-4 h-4" /> },
  { key: 'homeopathic', label: 'Homeopática', icon: <Target className="w-4 h-4" /> },
  { key: 'integrative', label: 'Integrativa', icon: <Brain className="w-4 h-4" /> }
]

const RATIONALITY_LABEL: Record<Rationality, string> = {
  biomedical: 'Biomédica',
  traditional_chinese: 'Medicina Tradicional Chinesa',
  ayurvedic: 'Ayurvédica',
  homeopathic: 'Homeopática',
  integrative: 'Integrativa'
}

const IntegrativePrescriptions: React.FC<IntegrativePrescriptionsProps> = ({
  patientId,
  patientName,
  planId,
  className = ''
}) => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [templates, setTemplates] = useState<PrescriptionTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templatesError, setTemplatesError] = useState<string | null>(null)

  const [patientPrescriptions, setPatientPrescriptions] = useState<PatientPrescription[]>([])
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false)
  const [prescriptionsError, setPrescriptionsError] = useState<string | null>(null)

  const [selectedRationality, setSelectedRationality] = useState<'all' | Rationality>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [selectedTemplate, setSelectedTemplate] = useState<PrescriptionTemplate | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [draft, setDraft] = useState<DraftPrescription>({
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    notes: '',
    startsAt: '',
    endsAt: ''
  })

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showCFMModal, setShowCFMModal] = useState(false)

  const loadTemplates = useCallback(async () => {
    setTemplatesLoading(true)
    setTemplatesError(null)
    try {
      const { data, error } = await supabase
        .from('integrative_prescription_templates')
        .select(
          'id, name, summary, description, rationality, category, default_dosage, default_frequency, default_duration, default_instructions, indications, contraindications, monitoring, tags'
        )
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) {
        throw error
      }

      const mapped: PrescriptionTemplate[] =
        data?.map(template => ({
          id: template.id,
          name: template.name ?? 'Prescrição',
          summary: template.summary ?? null,
          description: template.description ?? null,
          rationality: (template.rationality ?? 'integrative') as Rationality,
          category: template.category ?? null,
          defaultDosage: template.default_dosage ?? null,
          defaultFrequency: template.default_frequency ?? null,
          defaultDuration: template.default_duration ?? null,
          defaultInstructions: template.default_instructions ?? null,
          indications: template.indications ?? [],
          contraindications: template.contraindications ?? [],
          monitoring: template.monitoring ?? [],
          tags: template.tags ?? []
        })) ?? []

      setTemplates(mapped)
    } catch (error) {
      console.warn('Falha ao carregar templates de prescrição:', error)
      setTemplatesError('Não foi possível carregar os modelos de prescrição.')
      setTemplates([])
    } finally {
      setTemplatesLoading(false)
    }
  }, [])

  const loadPatientPrescriptions = useCallback(async () => {
    if (!patientId) {
      setPatientPrescriptions([])
      return
    }

    setPrescriptionsLoading(true)
    setPrescriptionsError(null)
    try {
      const { data, error } = await supabase
        .from('patient_prescriptions')
        .select(
          `
          *,
          template:integrative_prescription_templates (id, name, rationality, summary),
          plan:patient_therapeutic_plans (id, title, status),
          professional:users_compatible (id, name, email)
        `
        )
        .eq('patient_id', patientId)
        .order('issued_at', { ascending: false })

      if (error) {
        throw error
      }

      const mapped: PatientPrescription[] =
        data?.map(entry => ({
          id: entry.id,
          title: entry.title ?? entry.template?.name ?? 'Prescrição integrativa',
          summary: entry.summary ?? entry.template?.summary ?? null,
          rationality: (entry.rationality ?? entry.template?.rationality ?? null) as Rationality | null,
          dosage: entry.dosage ?? null,
          frequency: entry.frequency ?? null,
          duration: entry.duration ?? null,
          instructions: entry.instructions ?? null,
          indications: entry.indications ?? [],
          status: entry.status ?? 'active',
          issuedAt: entry.issued_at,
          startsAt: entry.starts_at ?? null,
          endsAt: entry.ends_at ?? null,
          lastReviewedAt: entry.last_reviewed_at ?? null,
          professionalName: entry.professional?.name ?? null,
          templateName: entry.template?.name ?? null,
          planTitle: entry.plan?.title ?? null
        })) ?? []

      setPatientPrescriptions(mapped)
    } catch (error) {
      console.warn('Falha ao carregar prescrições do paciente:', error)
      setPrescriptionsError('Não foi possível carregar as prescrições do paciente.')
      setPatientPrescriptions([])
    } finally {
      setPrescriptionsLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    void loadTemplates()
  }, [loadTemplates])

  useEffect(() => {
    void loadPatientPrescriptions()
  }, [loadPatientPrescriptions])

  useEffect(() => {
    if (!selectedTemplate) return
    setDraft({
      dosage: selectedTemplate.defaultDosage ?? '',
      frequency: selectedTemplate.defaultFrequency ?? '',
      duration: selectedTemplate.defaultDuration ?? '',
      instructions: selectedTemplate.defaultInstructions ?? '',
      notes: '',
      startsAt: '',
      endsAt: ''
    })
  }, [selectedTemplate])

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    return templates.filter(template => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        template.name.toLowerCase().includes(normalizedSearch) ||
        (template.summary ?? '').toLowerCase().includes(normalizedSearch) ||
        (template.description ?? '').toLowerCase().includes(normalizedSearch)

      if (!matchesSearch) return false
      if (selectedRationality === 'all') return true
      return template.rationality === selectedRationality
    })
  }, [templates, searchTerm, selectedRationality])

  const handleOpenTemplate = (template: PrescriptionTemplate) => {
    if (!patientId) {
      setActionMessage({
        type: 'error',
        text: 'Selecione um paciente para prescrever.'
      })
      return
    }
    setSelectedTemplate(template)
    setShowTemplateModal(true)
  }

  const handleConfirmPrescription = async () => {
    if (!selectedTemplate || !patientId || !user?.id) return

    setActionLoading(true)
    setActionMessage(null)

    try {
      const payload: Record<string, unknown> = {
        patient_id: patientId,
        professional_id: user.id,
        template_id: selectedTemplate.id,
        plan_id: planId ?? null,
        title: selectedTemplate.name,
        summary: selectedTemplate.summary,
        rationality: selectedTemplate.rationality,
        dosage: draft.dosage || selectedTemplate.defaultDosage,
        frequency: draft.frequency || selectedTemplate.defaultFrequency,
        duration: draft.duration || selectedTemplate.defaultDuration,
        instructions: draft.instructions || selectedTemplate.defaultInstructions,
        indications: selectedTemplate.indications,
        notes: draft.notes || null,
        starts_at: draft.startsAt ? new Date(draft.startsAt).toISOString().slice(0, 10) : null,
        ends_at: draft.endsAt ? new Date(draft.endsAt).toISOString().slice(0, 10) : null
      }

      const { error } = await supabase.from('patient_prescriptions').insert(payload)

      if (error) {
        throw error
      }

      setShowTemplateModal(false)
      setActionMessage({
        type: 'success',
        text: 'Prescrição registrada e vinculada ao plano terapêutico.'
      })
      await loadPatientPrescriptions()
    } catch (error) {
      console.error('Falha ao emitir prescrição:', error)
      setActionMessage({
        type: 'error',
        text: 'Não foi possível emitir a prescrição. Tente novamente.'
      })
    } finally {
      setActionLoading(false)
    }
  }

  const rationalityBadge = (rationality: Rationality | null) => {
    if (!rationality) return null
    let badgeColor = 'bg-slate-800 border-slate-700 text-slate-300'
    switch (rationality) {
      case 'biomedical':
        badgeColor = 'bg-blue-500/10 border-blue-400/40 text-blue-200'
        break
      case 'traditional_chinese':
        badgeColor = 'bg-rose-500/10 border-rose-400/40 text-rose-200'
        break
      case 'ayurvedic':
        badgeColor = 'bg-amber-500/10 border-amber-400/40 text-amber-200'
        break
      case 'homeopathic':
        badgeColor = 'bg-emerald-500/10 border-emerald-400/40 text-emerald-200'
        break
      case 'integrative':
        badgeColor = 'bg-purple-500/10 border-purple-400/40 text-purple-200'
        break
    }

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-semibold ${badgeColor}`}>
        {RATIONALITY_LABEL[rationality]}
      </span>
    )
  }

  return (
    <>
      <div className={`space-y-6 ${className} w-full`}>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary-300 mb-2">Prescrições integrativas</p>
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary-300" />
                Biblioteca de protocolos clínicos
              </h2>
              <p className="text-sm text-slate-400 mt-2 max-w-2xl">
                Selecione um protocolo para emitir uma prescrição conectada ao plano terapêutico do paciente. As cinco racionalidades médicas estão disponíveis com os ajustes recomendados pela equipe MedCannLab.
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowCFMModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-white text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nova prescrição CFM
              </button>
              <button
                onClick={() => navigate('/app/clinica/prescricoes')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-primary-200 hover:border-primary-500/50 text-sm transition-colors"
              >
                Gerenciar prescrições
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          {actionMessage && (
            <div
              className={`rounded-xl px-4 py-3 text-sm ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-400/40 text-emerald-200'
                  : 'bg-rose-500/10 border border-rose-400/40 text-rose-200'
              }`}
            >
              {actionMessage.text}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Buscar por nome, descrição ou indicação..."
                className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-start md:justify-end overflow-x-auto md:overflow-visible">
              {RATIONALITY_OPTIONS.map(option => (
                <button
                  key={option.key}
                  onClick={() => setSelectedRationality(option.key)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    selectedRationality === option.key
                      ? 'border-primary-500/60 bg-primary-500/10 text-primary-200'
                      : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-primary-500/40'
                  }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 min-w-0 w-full">
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>
              📋{' '}
              {templatesLoading
                ? 'Carregando modelos...'
                : filteredTemplates.length === 1
                ? '1 modelo disponível'
                : `${filteredTemplates.length} modelos disponíveis`}
            </span>
            {selectedRationality !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-200 text-xs border border-primary-500/30">
                Racionalidade: {RATIONALITY_OPTIONS.find(option => option.key === selectedRationality)?.label}
              </span>
            )}
          </div>

          {templatesError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-200 px-4 py-3 text-sm">
              {templatesError}
            </div>
          )}

          {templatesLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Carregando biblioteca de protocolos...
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-2xl py-12 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 border border-slate-800 mx-auto">
                <BookOpen className="w-6 h-6 text-slate-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-400">Nenhum protocolo encontrado com os filtros atuais.</p>
                <button
                  onClick={() => {
                    setSelectedRationality('all')
                    setSearchTerm('')
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-200 hover:border-primary-500/40 hover:text-primary-200 transition-colors text-sm"
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredTemplates.map(template => (
                <article
                  key={template.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4 transition-colors hover:border-primary-500/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <h3 className="text-white text-lg font-semibold leading-snug">{template.name}</h3>
                      <p className="text-sm text-slate-400 line-clamp-3">{template.summary ?? template.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {rationalityBadge(template.rationality)}
                        {template.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-slate-700 bg-slate-900/60 text-[11px] text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-3.5 h-3.5 text-primary-300" />
                      <span>{template.defaultDosage ?? 'Dosagem personalizada'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{template.defaultFrequency ?? 'Definir frequência'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-sky-300" />
                      <span>{template.defaultDuration ?? 'Definir duração'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-amber-300" />
                      <span>{template.indications.length} indicação(ões)</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {template.indications.slice(0, 3).map(indication => (
                      <span key={indication} className="inline-flex items-center px-2 py-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 text-[11px] text-emerald-200">
                        {indication}
                      </span>
                    ))}
                    {template.indications.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full border border-slate-700 bg-slate-900/70 text-[11px] text-slate-300">
                        +{template.indications.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => handleOpenTemplate(template)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500/90 hover:bg-primary-400 text-white text-sm font-semibold transition-colors"
                    >
                      Prescrever
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedTemplate(template)}
                      className="text-xs text-slate-400 hover:text-primary-200 transition-colors"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-300" />
                Prescrições emitidas
              </h3>
              <p className="text-xs text-slate-400">
                Visão consolidada das prescrições registradas para {patientName ?? 'o paciente selecionado'}.
              </p>
            </div>
            {patientId && (
              <div className="text-xs text-slate-400">
                {patientPrescriptions.length > 0 ? `${patientPrescriptions.length} registro(s)` : 'Nenhum registro'}
              </div>
            )}
          </div>

          {!patientId ? (
            <div className="border border-dashed border-slate-800 rounded-2xl py-12 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 border border-slate-800 mx-auto">
                <Brain className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-sm text-slate-400">Selecione um paciente para visualizar as prescrições registradas.</p>
            </div>
          ) : prescriptionsLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Carregando prescrições emitidas...
            </div>
          ) : prescriptionsError ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-200 px-4 py-3 text-sm">
              {prescriptionsError}
            </div>
          ) : patientPrescriptions.length === 0 ? (
            <div className="border border-dashed border-slate-800 rounded-2xl py-12 text-center space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 border border-slate-800 mx-auto">
                <CheckCircle className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-sm text-slate-400">Nenhuma prescrição registrada para este paciente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patientPrescriptions.map(prescription => (
                <article
                  key={prescription.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        {prescription.title}
                        {rationalityBadge(prescription.rationality)}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Emitida em {new Date(prescription.issuedAt).toLocaleDateString('pt-BR')}
                        {prescription.professionalName ? ` • Profissional: ${prescription.professionalName}` : ''}
                        {prescription.planTitle ? ` • Plano: ${prescription.planTitle}` : ''}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
                        prescription.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-200 border-emerald-400/40'
                          : prescription.status === 'completed'
                          ? 'bg-sky-500/10 text-sky-200 border-sky-400/40'
                          : prescription.status === 'suspended'
                          ? 'bg-amber-500/10 text-amber-200 border-amber-400/40'
                          : 'bg-rose-500/10 text-rose-200 border-rose-400/40'
                      }`}
                    >
                      {prescription.status === 'active'
                        ? 'Ativa'
                        : prescription.status === 'completed'
                        ? 'Concluída'
                        : prescription.status === 'suspended'
                        ? 'Suspensa'
                        : 'Cancelada'}
                    </span>
                  </div>
                  {prescription.summary && (
                    <p className="text-sm text-slate-300">{prescription.summary}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-3.5 h-3.5 text-primary-300" />
                      <span>{prescription.dosage ?? 'Dosagem definida pelo profissional'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-300" />
                      <span>{prescription.frequency ?? 'Frequência personalizada'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-sky-300" />
                      <span>
                        {prescription.duration ??
                          (prescription.startsAt
                            ? `De ${new Date(prescription.startsAt).toLocaleDateString('pt-BR')}${
                                prescription.endsAt ? ` a ${new Date(prescription.endsAt).toLocaleDateString('pt-BR')}` : ''
                              }`
                            : 'Duração personalizada')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-300" />
                      <span>{prescription.templateName ?? 'Modelo personalizado'}</span>
                    </div>
                  </div>
                  {prescription.instructions && (
                    <div className="rounded-xl bg-slate-900/70 border border-slate-800 px-4 py-3 text-xs text-slate-300">
                      {prescription.instructions}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {showTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[1000] px-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedTemplate.name}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Vinculada ao paciente {patientName ?? 'selecionado'} • {RATIONALITY_LABEL[selectedTemplate.rationality]}
                </p>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="w-9 h-9 rounded-full border border-slate-700 text-slate-300 hover:text-primary-200 hover:border-primary-500/40 transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Dosagem</label>
                  <input
                    value={draft.dosage}
                    onChange={event => setDraft(prev => ({ ...prev, dosage: event.target.value }))}
                    placeholder={selectedTemplate.defaultDosage ?? 'Defina a dosagem'}
                    className="w-full mt-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Frequência</label>
                  <input
                    value={draft.frequency}
                    onChange={event => setDraft(prev => ({ ...prev, frequency: event.target.value }))}
                    placeholder={selectedTemplate.defaultFrequency ?? 'Defina a frequência'}
                    className="w-full mt-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Duração</label>
                  <input
                    value={draft.duration}
                    onChange={event => setDraft(prev => ({ ...prev, duration: event.target.value }))}
                    placeholder={selectedTemplate.defaultDuration ?? 'Defina a duração'}
                    className="w-full mt-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Início</label>
                    <input
                      type="date"
                      value={draft.startsAt}
                      onChange={event => setDraft(prev => ({ ...prev, startsAt: event.target.value }))}
                      className="w-full mt-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/60"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Término</label>
                    <input
                      type="date"
                      value={draft.endsAt}
                      onChange={event => setDraft(prev => ({ ...prev, endsAt: event.target.value }))}
                      className="w-full mt-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/60"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Instruções clínicas</label>
                <textarea
                  value={draft.instructions}
                  onChange={event => setDraft(prev => ({ ...prev, instructions: event.target.value }))}
                  placeholder={selectedTemplate.defaultInstructions ?? 'Descreva as orientações para o paciente'}
                  className="w-full mt-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/60 min-h-[120px]"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Notas adicionais (visão do profissional)</label>
                <textarea
                  value={draft.notes}
                  onChange={event => setDraft(prev => ({ ...prev, notes: event.target.value }))}
                  placeholder="Informações complementares visíveis apenas para a equipe profissional."
                  className="w-full mt-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/60 min-h-[100px]"
                />
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-300 space-y-1">
                <p>• Indicações principais: {selectedTemplate.indications.join(', ') || 'Sem indicações registradas'}</p>
                {selectedTemplate.contraindications.length > 0 && (
                  <p>• Contraindicações: {selectedTemplate.contraindications.join(', ')}</p>
                )}
                {selectedTemplate.monitoring.length > 0 && (
                  <p>• Monitoramento sugerido: {selectedTemplate.monitoring.join(', ')}</p>
                )}
              </div>
            </div>
            <div className="px-6 py-5 border-t border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-primary-200 hover:border-primary-500/40 text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPrescription}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmar prescrição
              </button>
            </div>
          </div>
        </div>
      )}

      {showCFMModal && (
        <div
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-[1100] px-4"
          onClick={event => {
            if (event.target === event.currentTarget) {
              setShowCFMModal(false)
            }
          }}
        >
          <div
            className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
              <div>
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary-300" />
                  Emitir prescrição CFM
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Selecione o tipo de receituário conforme as diretrizes do Conselho Federal de Medicina.
                </p>
              </div>
              <button
                onClick={() => setShowCFMModal(false)}
                className="w-9 h-9 rounded-full border border-slate-700 text-slate-300 hover:text-primary-200 hover:border-primary-500/40 transition-colors flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    navigate('/app/prescriptions?type=simple')
                    setShowCFMModal(false)
                  }}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 text-left space-y-2 hover:border-primary-500/40 transition-colors"
                >
                  <FileText className="w-7 h-7 text-primary-300" />
                  <p className="text-white font-semibold text-lg">Receituário simples</p>
                  <p className="text-sm text-slate-400">Medicamentos sem controle especial, assinatura digital e envio automático ao paciente.</p>
                </button>
                <button
                  onClick={() => {
                    navigate('/app/prescriptions?type=special')
                    setShowCFMModal(false)
                  }}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 text-left space-y-2 hover:border-primary-500/40 transition-colors"
                >
                  <Lock className="w-7 h-7 text-sky-300" />
                  <p className="text-white font-semibold text-lg">Receita branca controle especial</p>
                  <p className="text-sm text-slate-400">Psicotrópicos e retinoides (lista C2) com assinatura ICP-Brasil.</p>
                </button>
                <button
                  onClick={() => {
                    navigate('/app/prescriptions?type=blue')
                    setShowCFMModal(false)
                  }}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 text-left space-y-2 hover:border-primary-500/40 transition-colors"
                >
                  <Lock className="w-7 h-7 text-blue-300" />
                  <p className="text-white font-semibold text-lg">Receita azul (B1/B2)</p>
                  <p className="text-sm text-slate-400">Entorpecentes e psicotrópicos controlados, com QR Code para validação.</p>
                </button>
                <button
                  onClick={() => {
                    navigate('/app/prescriptions?type=yellow')
                    setShowCFMModal(false)
                  }}
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 text-left space-y-2 hover:border-primary-500/40 transition-colors"
                >
                  <Lock className="w-7 h-7 text-amber-300" />
                  <p className="text-white font-semibold text-lg">Receita amarela (A1/A2/A3)</p>
                  <p className="text-sm text-slate-400">Entorpecentes de uso restrito com integração ao Portal do ITI.</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default IntegrativePrescriptions
