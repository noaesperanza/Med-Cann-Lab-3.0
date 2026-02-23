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
  Zap,
  History,
  LayoutGrid,
  List,
  Printer
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

  // Tab State
  const [activeTab, setActiveTab] = useState<'library' | 'history'>('library')

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
          plan:patient_therapeutic_plans (id, title, status)
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
          professionalName: null,
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

      const { error } = await supabase.from('patient_prescriptions').insert(payload as any)

      if (error) {
        throw error
      }

      setShowTemplateModal(false)
      setActionMessage({
        type: 'success',
        text: 'Prescrição registrada e vinculada ao plano terapêutico.'
      })
      await loadPatientPrescriptions()
      setActiveTab('history') // Auto-switch to history on success
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
        {/* Header & Controls */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-primary-300 mb-2">Prescrições Integrativas</p>
              <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary-300" />
                Gestão de Prescrições
              </h2>
            </div>
            {/* Tabs */}
            <div className="flex items-center gap-2 bg-slate-950/50 p-1 rounded-xl border border-slate-800/50">
              <button
                onClick={() => setActiveTab('library')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'library'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Biblioteca
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'history'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <History className="w-4 h-4" />
                Histórico
              </button>
            </div>
          </div>

          {/* Subheader Actions */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-6">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              {activeTab === 'library' ? (
                <>
                  <BookOpen className="w-4 h-4 text-primary-400" />
                  <span>Selecione um protocolo para iniciar a prescrição</span>
                </>
              ) : (
                <>
                  <List className="w-4 h-4 text-primary-400" />
                  <span>Histórico de prescrições emitidas para o paciente</span>
                </>
              )}
            </div>
            <button
              onClick={() => setShowCFMModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
            >
              <Plus className="w-4 h-4" />
              Nova Prescrição CFM
            </button>
          </div>

          {actionMessage && (
            <div
              className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${actionMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-400/40 text-emerald-200'
                  : 'bg-rose-500/10 border border-rose-400/40 text-rose-200'
                }`}
            >
              <div className={`w-2 h-2 rounded-full ${actionMessage.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              {actionMessage.text}
            </div>
          )}
        </div>

        {/* --- LIBRARY TAB --- */}
        {activeTab === 'library' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Filters */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={event => setSearchTerm(event.target.value)}
                  placeholder="Buscar protocolo..."
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/60"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                {RATIONALITY_OPTIONS.map(option => (
                  <button
                    key={option.key}
                    onClick={() => setSelectedRationality(option.key)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap ${selectedRationality === option.key
                        ? 'border-primary-500/60 bg-primary-500/10 text-primary-200'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {templatesLoading ? (
              <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
                <Loader2 className="w-5 h-5 animate-spin mr-3 text-primary-500" />
                Carregando biblioteca...
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-2xl py-16 text-center space-y-4 bg-slate-900/20">
                <div className="bg-slate-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                  <Search className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                  <p className="text-slate-300 font-medium">Nenhum protocolo encontrado</p>
                  <p className="text-sm text-slate-500">Tente ajustar seus filtros de busca.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredTemplates.map(template => (
                  <article
                    key={template.id}
                    className="group rounded-2xl border border-slate-800 bg-slate-950/40 p-5 space-y-4 transition-all hover:border-primary-500/30 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-primary-900/5 flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between w-full">
                          <h3 className="text-white text-base font-semibold leading-snug group-hover:text-primary-200 transition-colors">
                            {template.name}
                          </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {rationalityBadge(template.rationality)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed flex-grow">
                      {template.summary ?? template.description}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 border-t border-slate-800/60 pt-4 mt-auto">
                      <span className="flex items-center gap-1.5" title="Dosagem Padrão">
                        <Stethoscope className="w-3.5 h-3.5 text-slate-600" />
                        {template.defaultDosage ? 'Dosagem pré-def.' : 'Personalizável'}
                      </span>
                      <span className="flex items-center gap-1.5" title="Duração Padrão">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        {template.defaultDuration ?? 'Duração aberta'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenTemplate(template)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                    >
                      Prescrever este protocolo
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- HISTORY TAB --- */}
        {activeTab === 'history' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-300" />
                Registros de Prescrições
              </h3>
              {!patientId && (
                <span className="text-xs text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Selecione um paciente
                </span>
              )}
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Data / Hora</th>
                    <th className="px-6 py-4 whitespace-nowrap">Protocolo / Título</th>
                    <th className="px-6 py-4 whitespace-nowrap">Racionalidade</th>
                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 whitespace-nowrap">Profissional</th>
                    <th className="px-6 py-4 text-right whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {prescriptionsLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-primary-500" />
                        Carregando histórico...
                      </td>
                    </tr>
                  ) : patientPrescriptions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-600 bg-slate-900/20">
                        <div className="bg-slate-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto border border-slate-700 mb-3">
                          <History className="w-5 h-5 text-slate-500" />
                        </div>
                        Nenhuma prescrição encontrada para este paciente.
                      </td>
                    </tr>
                  ) : (
                    patientPrescriptions.map(presc => (
                      <tr key={presc.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4 text-slate-300 whitespace-nowrap">
                          <div className="font-medium text-white">{new Date(presc.issuedAt).toLocaleDateString('pt-BR')}</div>
                          <div className="text-xs text-slate-600">{new Date(presc.issuedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-200 font-medium block truncate max-w-[200px] group-hover:text-primary-200 transition-colors">{presc.title}</span>
                          {presc.templateName && <span className="text-xs text-slate-500">Base: {presc.templateName}</span>}
                        </td>
                        <td className="px-6 py-4">
                          {rationalityBadge(presc.rationality)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${presc.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              presc.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                            {presc.status === 'active' ? 'Ativa' : presc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                          {presc.professionalName || <span className="text-slate-600 italic">Sistema</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-500 hover:text-primary-300 p-2 hover:bg-primary-500/10 rounded-lg transition-colors" title="Imprimir / Visualizar">
                            <Printer className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- TEMPLATE MODAL (UNCHANGED) --- */}
      {showTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[1000] px-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 sticky top-0 backdrop-blur-md z-10">
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
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500 font-medium">Dosagem</label>
                  <input
                    value={draft.dosage}
                    onChange={event => setDraft(prev => ({ ...prev, dosage: event.target.value }))}
                    placeholder={selectedTemplate.defaultDosage ?? 'Defina a dosagem'}
                    className="w-full mt-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500 font-medium">Frequência</label>
                  <input
                    value={draft.frequency}
                    onChange={event => setDraft(prev => ({ ...prev, frequency: event.target.value }))}
                    placeholder={selectedTemplate.defaultFrequency ?? 'Defina a frequência'}
                    className="w-full mt-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500 font-medium">Duração</label>
                  <input
                    value={draft.duration}
                    onChange={event => setDraft(prev => ({ ...prev, duration: event.target.value }))}
                    placeholder={selectedTemplate.defaultDuration ?? 'Defina a duração'}
                    className="w-full mt-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-transparent transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500 font-medium">Início</label>
                    <input
                      type="date"
                      value={draft.startsAt}
                      onChange={event => setDraft(prev => ({ ...prev, startsAt: event.target.value }))}
                      className="w-full mt-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500 font-medium">Término</label>
                    <input
                      type="date"
                      value={draft.endsAt}
                      onChange={event => setDraft(prev => ({ ...prev, endsAt: event.target.value }))}
                      className="w-full mt-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500 font-medium">Instruções clínicas</label>
                <textarea
                  value={draft.instructions}
                  onChange={event => setDraft(prev => ({ ...prev, instructions: event.target.value }))}
                  placeholder={selectedTemplate.defaultInstructions ?? 'Descreva as orientações para o paciente'}
                  className="w-full mt-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-transparent min-h-[120px] transition-all"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500 font-medium">Notas adicionais (interno)</label>
                <textarea
                  value={draft.notes}
                  onChange={event => setDraft(prev => ({ ...prev, notes: event.target.value }))}
                  placeholder="Informações complementares visíveis apenas para a equipe profissional."
                  className="w-full mt-1.5 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-transparent min-h-[100px] transition-all"
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
            <div className="px-6 py-5 border-t border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-900/30 sticky bottom-0 backdrop-blur-md">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-primary-200 hover:border-primary-500/40 text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPrescription}
                disabled={actionLoading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-900/20"
              >
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmar prescrição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CFM MODAL (UNCHANGED) --- */}
      {showCFMModal && (
        <div
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-[1100] px-4 animate-in fade-in zoom-in-95 duration-200"
          onClick={event => {
            if (event.target === event.currentTarget) {
              setShowCFMModal(false)
            }
          }}
        >
          <div
            className="bg-slate-950 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto border border-slate-800 shadow-2xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
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
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 text-left space-y-2 hover:border-primary-500/40 hover:bg-slate-900/80 transition-all hover:scale-[1.01]"
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
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 text-left space-y-2 hover:border-primary-500/40 hover:bg-slate-900/80 transition-all hover:scale-[1.01]"
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
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 text-left space-y-2 hover:border-primary-500/40 hover:bg-slate-900/80 transition-all hover:scale-[1.01]"
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
                  className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 text-left space-y-2 hover:border-primary-500/40 hover:bg-slate-900/80 transition-all hover:scale-[1.01]"
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
