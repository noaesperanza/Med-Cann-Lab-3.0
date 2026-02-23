import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react'
// Layout fixed: 100dvh
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Loader2, MessageCircle, Send, Users, FileText, Video, Phone, X } from 'lucide-react'

import { useAuth } from '../contexts/AuthContext'
import { useChatSystem } from '../hooks/useChatSystem'
import { supabase } from '../lib/supabase'
import { ChatEvolutionService, ChatSession } from '../services/chatEvolutionService'
import VideoCall from '../components/VideoCall'
import { useVideoCallRequests } from '../hooks/useVideoCallRequests'
import VideoCallRequestNotification from '../components/VideoCallRequestNotification'
import { videoCallRequestService } from '../services/videoCallRequestService'
import { useToast } from '../contexts/ToastContext'
import ConfirmModal from '../components/ConfirmModal'

interface ParticipantSummary {
  id: string
  name: string | null
  email: string | null
}

interface ChatParticipantProfile {
  user_id: string
  name: string | null
  email: string | null
}

const PatientDoctorChat: React.FC = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const roomIdParam = new URLSearchParams(location.search).get('roomId')
  const searchParams = new URLSearchParams(location.search)
  const origin = searchParams.get('origin')
  const startParam = searchParams.get('start')
  const patientIdParam = searchParams.get('patientId')

  const isImpersonatingPatient = user?.type === 'admin' && origin === 'patient-dashboard'
  const isPatient = user?.type === 'paciente' && !isImpersonatingPatient

  const [activeRoomId, setActiveRoomId] = useState<string | undefined>(roomIdParam ?? undefined)
  const [participants, setParticipants] = useState<ParticipantSummary[]>([])
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [allPatients, setAllPatients] = useState<Array<{ id: string; name: string | null; email: string | null }>>([])
  const [allProfessionals, setAllProfessionals] = useState<Array<{ id: string; name: string | null; email: string | null; specialty?: string }>>([])
  const [patientsLoading, setPatientsLoading] = useState(false)
  const [professionalsLoading, setProfessionalsLoading] = useState(false)
  const [savingEvolution, setSavingEvolution] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const hasTriggeredStartRef = useRef(false)

  // Estados para videochamada
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false)
  const [callType, setCallType] = useState<'video' | 'audio'>('video')
  const [videoCallRoomId, setVideoCallRoomId] = useState<string | null>(null)
  const [videoCallInitiator, setVideoCallInitiator] = useState(false)

  // Estados para solicitação de videochamada
  const [pendingCallRequest, setPendingCallRequest] = useState<string | null>(null) // request_id da solicitação pendente
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null) // Tempo restante em segundos

  // Estados para modal de confirmação
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type?: 'danger' | 'warning' | 'info' | 'success'
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    type: 'warning'
  })

  const toast = useToast()

  // Hook para gerenciar solicitações de videochamada (caller abre a chamada quando o outro aceita)
  const {
    pendingRequests,
    createRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest
  } = useVideoCallRequests({
    onRequestAccepted: (request) => {
      setVideoCallRoomId(request.request_id)
      setVideoCallInitiator(true)
      setCallType(request.call_type ?? 'video')
      setIsVideoCallOpen(true)
      setPendingCallRequest(null)
    }
  })

  // Polling: quando estamos aguardando resposta (requester), verificar se foi aceito (fallback do realtime)
  useEffect(() => {
    if (!pendingCallRequest || !user?.id) return
    const interval = setInterval(async () => {
      const req = await videoCallRequestService.getRequestById(pendingCallRequest)
      if (req?.status === 'accepted') {
        setVideoCallRoomId(req.request_id)
        setVideoCallInitiator(true)
        setCallType(req.call_type ?? 'video')
        setIsVideoCallOpen(true)
        setPendingCallRequest(null)
      }
    }, 1500)
    return () => clearInterval(interval)
  }, [pendingCallRequest, user?.id])

  const {
    inbox,
    inboxLoading,
    messages,
    messagesLoading,
    isOnline,
    sendMessage,
    markRoomAsRead,
    reloadInbox
  } = useChatSystem(activeRoomId, { enabled: !isImpersonatingPatient })

  const patientRooms = useMemo(() => {
    // O hook `useChatSystem` já usa `get_my_rooms` (RPC que filtra pelo user logado)
    // então `inbox` já contém apenas salas onde o usuário atual é participante.
    // Basta filtrar pelo tipo 'patient' para separar dos chats admin.
    return inbox.filter(room => room.type === 'patient');
  }, [inbox])

  // Mapear pacientes que já têm salas (baseado nos participantes)
  const [patientsWithRooms, setPatientsWithRooms] = useState<Set<string>>(new Set());
  // Mapear profissionais vinculados ao paciente atual (baseado em salas compartilhadas)
  const [linkedProfessionalIds, setLinkedProfessionalIds] = useState<Set<string>>(new Set());

  // Ref para evitar criação duplicada
  const isCreatingRoomRef = useRef(false);

  useEffect(() => {
    if (!user || patientRooms.length === 0) {
      setPatientsWithRooms(new Set());
      setLinkedProfessionalIds(new Set());
      return;
    }

    const loadPatientsWithRooms = async () => {
      try {
        const roomIds = patientRooms.map(room => room.id);
        const { data: participants } = await supabase
          .from('chat_participants')
          .select('room_id, user_id, role')
          .in('room_id', roomIds);

        const patientIds = new Set<string>();
        const professionalIds = new Set<string>();

        participants?.forEach(p => {
          if (p.user_id) {
            if (p.role === 'patient') {
              patientIds.add(p.user_id);
            } else if (p.role === 'professional' || p.role === 'admin') {
              professionalIds.add(p.user_id);
            }
          }
        });

        setPatientsWithRooms(patientIds);
        setLinkedProfessionalIds(professionalIds);
        console.log('🔗 Profissionais vinculados ao paciente:', professionalIds.size);
      } catch (error) {
        console.warn('Erro ao carregar participantes das salas:', error);
        setPatientsWithRooms(new Set());
        setLinkedProfessionalIds(new Set());
      }
    };

    loadPatientsWithRooms();
  }, [patientRooms, user]);

  // Carregar todos os pacientes do profissional (apenas para profissionais/admins)
  useEffect(() => {
    if (!user || isImpersonatingPatient || isPatient) return;

    // Apenas profissionais e admins podem ver a lista completa de pacientes
    if (user.type !== 'profissional' && user.type !== 'admin') return;

    const loadAllPatients = async () => {
      setPatientsLoading(true);
      try {
        // Buscar pacientes da tabela users (onde os pacientes são criados)
        // Buscar tanto 'patient' (inglês) quanto 'paciente' (português) para compatibilidade
        const { data: patientsData, error: patientsError } = await supabase
          .from('users')
          .select('id, name, email, type, created_at')
          .in('type', ['patient', 'paciente'])
          .order('created_at', { ascending: false });

        if (patientsError) {
          console.warn('Erro ao carregar pacientes:', patientsError);
          // Tentar fallback: buscar pacientes que têm avaliações clínicas
          try {
            const { data: assessmentData } = await supabase
              .from('clinical_assessments')
              .select('patient_id, data')
              .not('patient_id', 'is', null);

            if (assessmentData && assessmentData.length > 0) {
              const patientIds = [...new Set(assessmentData.map(a => a.patient_id))];
              const { data: fallbackData } = await supabase
                .from('users')
                .select('id, name, email')
                .in('id', patientIds);
              console.log('📋 Pacientes carregados (fallback):', fallbackData?.length || 0);
              setAllPatients(fallbackData || []);
            } else {
              console.log('📋 Nenhum paciente encontrado no fallback');
              setAllPatients([]);
            }
          } catch (fallbackError) {
            console.error('Erro no fallback de pacientes:', fallbackError);
            setAllPatients([]);
          }
        } else {
          console.log('📋 Pacientes carregados:', patientsData?.length || 0);
          setAllPatients(patientsData || []);
        }
      } catch (error) {
        console.error('Erro ao carregar lista de pacientes:', error);
        setAllPatients([]);
      } finally {
        setPatientsLoading(false);
      }
    };

    loadAllPatients();
  }, [user, isImpersonatingPatient]);

  // Carregar profissionais disponíveis (para mostrar na lista de contatos)
  useEffect(() => {
    if (!user) return;

    const loadAllProfessionals = async () => {
      setProfessionalsLoading(true);
      try {
        const { data: professionalsData, error: professionalsError } = await supabase
          .from('users')
          .select('id, name, email, type')
          .in('type', ['profissional', 'professional', 'admin'])
          .order('name', { ascending: true });

        if (professionalsError) {
          console.warn('Erro ao carregar profissionais:', professionalsError);
          setAllProfessionals([]);
        } else {
          console.log('👨‍⚕️ Profissionais carregados:', professionalsData?.length || 0);
          setAllProfessionals(professionalsData || []);
        }
      } catch (error) {
        console.error('Erro ao carregar lista de profissionais:', error);
        setAllProfessionals([]);
      } finally {
        setProfessionalsLoading(false);
      }
    };

    loadAllProfessionals();
  }, [user, isPatient]);

  // Quando há roomId na URL, garantir que ele seja usado e recarregar inbox se necessário
  useEffect(() => {
    if (roomIdParam && roomIdParam !== activeRoomId) {
      setActiveRoomId(roomIdParam);
      // Recarregar inbox para garantir que a sala apareça na lista
      reloadInbox();
    }
  }, [roomIdParam, activeRoomId, reloadInbox]);

  // Quando há patientId na URL, criar ou selecionar sala automaticamente
  useEffect(() => {
    // Só processar se não há roomId (roomId tem prioridade) e se é profissional/admin
    // E, crucialmente, se o inbox já terminou de carregar (para saber se a sala já existe)
    if (roomIdParam || !patientIdParam || !user || isPatient || isImpersonatingPatient || inboxLoading) {
      return;
    }

    // Só profissionais e admins podem criar salas
    if (user.type !== 'profissional' && user.type !== 'admin') {
      return;
    }

    const handlePatientIdFromUrl = async () => {
      // Bloqueio de reentrância para evitar múltiplas criações
      if (isCreatingRoomRef.current) return;
      isCreatingRoomRef.current = true;

      try {
        // Verificar se já existe uma sala para este paciente
        // Primeiro, verificar nas salas existentes se o paciente está como participante
        let existingRoomId: string | undefined = undefined;

        for (const room of patientRooms) {
          try {
            const { data: participants } = await supabase
              .from('chat_participants')
              .select('user_id')
              .eq('room_id', room.id)
              .eq('user_id', patientIdParam)
              .eq('role', 'patient')
              .limit(1);

            if (participants && participants.length > 0) {
              existingRoomId = room.id;
              break;
            }
          } catch (err) {
            console.warn('Erro ao verificar participantes da sala:', err);
          }
        }

        if (existingRoomId) {
          // Sala já existe, apenas selecionar
          console.log('✅ Sala existente encontrada para paciente:', patientIdParam);
          setActiveRoomId(existingRoomId);
          return;
        }

        // Buscar nome do paciente
        let patientName: string | null = null;
        const patient = allPatients.find(p => p.id === patientIdParam);
        if (patient) {
          patientName = patient.name;
        } else {
          // Tentar buscar do banco se não estiver na lista
          try {
            const { data: patientData } = await supabase
              .from('users')
              .select('name')
              .eq('id', patientIdParam)
              .single();
            patientName = patientData?.name || null;
          } catch (err) {
            console.warn('Erro ao buscar nome do paciente:', err);
          }
        }

        // Criar nova sala para o paciente
        console.log('🔄 Criando sala para paciente da URL:', patientIdParam);
        await handleCreateRoomForPatient(patientIdParam, patientName);
      } catch (error) {
        console.error('❌ Erro ao processar patientId da URL:', error);
      } finally {
        // Liberar bloqueio após conclusão (com sucesso ou erro)
        isCreatingRoomRef.current = false;
      }
    };

    // Aguardar um pouco para garantir que os dados foram carregados
    // Modificado para usar !inboxLoading como gate principal
    if (allPatients.length > 0 || !inboxLoading) {
      void handlePatientIdFromUrl();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientIdParam, roomIdParam, user, isPatient, isImpersonatingPatient, patientRooms, allPatients, inboxLoading]);

  // Selecionar primeira sala se não há roomId na URL
  useEffect(() => {
    // Não fazer nada se há roomId na URL (ele tem prioridade)
    if (roomIdParam) {
      return;
    }

    if (!patientRooms.length) {
      setActiveRoomId(undefined);
      return;
    }

    // Se não há sala ativa ou a sala ativa não está na lista, selecionar a primeira
    if (!activeRoomId || !patientRooms.some(room => room.id === activeRoomId)) {
      setActiveRoomId(patientRooms[0].id);
    }
  }, [patientRooms, activeRoomId, roomIdParam]);

  useEffect(() => {
    if (isImpersonatingPatient || !activeRoomId) {
      setParticipants([]);
      return;
    }

    const fetchParticipants = async () => {
      setParticipantsLoading(true);
      try {
        // PRIMEIRO: Tentar usar função RPC (contorna RLS e recursão)
        let participantRows: any[] | null = null;
        let participantError: any = null;

        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc(
            'get_chat_participants_for_room',
            { p_room_id: activeRoomId }
          );

          if (!rpcError && rpcData) {
            participantRows = rpcData;
            console.log('✅ Participantes carregados via RPC:', participantRows?.length);
          } else {
            participantError = rpcError;
            console.warn('⚠️ RPC não disponível, tentando query direta...', rpcError);
          }
        } catch (rpcErr) {
          console.warn('⚠️ Erro ao chamar RPC, tentando query direta...', rpcErr);
        }

        // FALLBACK: Se RPC não funcionar, tentar query direta
        if (!participantRows) {
          const { data: directData, error: directError } = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('room_id', activeRoomId);

          if (!directError && directData) {
            participantRows = directData;
          } else {
            participantError = directError;
          }
        }

        if (participantError || !participantRows?.length) {
          if (participantError) {
            console.warn('Não foi possível listar participantes do chat:', participantError);
            if (participantError.code === '42P17' || participantError.message?.includes('infinite recursion')) {
              console.error('❌ ERRO DE RECURSÃO! Execute o script SQL: CORRIGIR_RECURSAO_DEFINITIVO.sql no Supabase');
            }
          }
          setParticipants([]);
          return;
        }

        const userIds = participantRows
          .map((row: any) => row.user_id)
          .filter((id): id is string => Boolean(id));

        if (userIds.length === 0) {
          setParticipants([]);
          return;
        }

        const { data: profileRows, error: profileError } = await supabase.rpc(
          'get_chat_user_profiles',
          { p_user_ids: userIds }
        );

        if (profileError || !profileRows) {
          if (profileError) {
            console.warn('Falha ao buscar perfis dos participantes:', profileError);
          }
          setParticipants([]);
          return;
        }

        const profiles = profileRows as ChatParticipantProfile[];

        setParticipants(
          profiles.map(profile => ({
            id: profile.user_id,
            name: profile.name ?? null,
            email: profile.email ?? null
          }))
        );
      } finally {
        setParticipantsLoading(false);
      }
    };

    fetchParticipants();
  }, [activeRoomId, isImpersonatingPatient]);

  useEffect(() => {
    if (!isImpersonatingPatient && activeRoomId) {
      void markRoomAsRead(activeRoomId);
    }
  }, [activeRoomId, markRoomAsRead, isImpersonatingPatient]);

  useEffect(() => {
    if (hasTriggeredStartRef.current) return;
    if (!user || !activeRoomId || isImpersonatingPatient) return;
    if (startParam !== 'avaliacao-inicial') return;

    const triggerAssessment = async () => {
      try {
        await sendMessage(activeRoomId, user.id, 'Iniciar avaliação clínica inicial IMRE');
        hasTriggeredStartRef.current = true;
        const params = new URLSearchParams(location.search);
        params.delete('start');
        const searchString = params.toString();
        navigate(
          {
            pathname: location.pathname,
            search: searchString ? `?${searchString}` : ''
          },
          { replace: true }
        );
      } catch (error) {
        console.error('Erro ao iniciar avaliação clínica via chat:', error);
      }
    };

    void triggerAssessment();
  }, [activeRoomId, isImpersonatingPatient, location.pathname, location.search, navigate, sendMessage, startParam, user]);

  // Timer para mostrar tempo restante da solicitação pendente
  useEffect(() => {
    if (!pendingCallRequest) {
      setTimeRemaining(null)
      return
    }

    // Buscar a solicitação para pegar o expires_at
    const request = pendingRequests.find(r => r.request_id === pendingCallRequest)

    if (!request || !request.expires_at) {
      setTimeRemaining(null)
      return
    }

    const updateTimer = () => {
      const now = new Date().getTime()
      const expires = new Date(request.expires_at).getTime()
      const remaining = Math.max(0, Math.floor((expires - now) / 1000))
      setTimeRemaining(remaining)

      // Se expirou, limpar o estado
      if (remaining === 0) {
        setPendingCallRequest(null)
        setTimeRemaining(null)
      }
    }

    // Atualizar imediatamente
    updateTimer()

    // Atualizar a cada segundo
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [pendingCallRequest, pendingRequests])

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-900 text-slate-200">
        <p>Faça login para acessar o chat clínico.</p>
      </div>
    )
  }

  // Quando admin está visualizando como paciente, ainda pode usar videochamada
  // Mas o chat de mensagens fica bloqueado (conforme design original)
  // Videochamada é permitida porque admin pode iniciar mesmo visualizando como paciente
  if (isImpersonatingPatient && !isVideoCallOpen) {
    return (
      <div className="min-h-[calc(100vh-6rem)] bg-slate-950 text-slate-100 flex items-center justify-center px-6">
        <div className="max-w-xl text-center space-y-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-10">
          <MessageCircle className="w-10 h-10 mx-auto text-primary-400" />
          <h1 className="text-2xl font-semibold text-white">Chat disponível somente para o paciente</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Para visualizar o histórico real desta conversa, acesse com a conta do paciente ou adicione-se como participante autorizado na sala correspondente em
            <code className="block mt-2 text-xs text-primary-300">chat_participants</code>.
          </p>
          <p className="text-slate-300 text-sm mt-4">
            💡 <strong>Nota:</strong> Videochamadas podem ser iniciadas pelo profissional mesmo quando você está visualizando como paciente.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-white text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        </div>
      </div>
    )
  }

  const otherParticipants = participants.filter(participant => participant.id !== user.id)

  // Identificar patientId para videochamada
  // Quando admin está "visualizando como paciente", ainda pode iniciar videochamada como admin
  // Quando profissional inicia, precisa identificar qual é o paciente na sala
  const patientIdForCall = useMemo(() => {
    if (!activeRoomId || otherParticipants.length === 0) return undefined

    // Se o usuário é profissional/admin (mesmo quando está visualizando como paciente), pode iniciar
    if (user?.type === 'profissional' || user?.type === 'admin') {
      // Se há apenas um participante, esse é o paciente
      if (otherParticipants.length === 1) {
        return otherParticipants[0]?.id
      }

      // Se há múltiplos participantes, tentar identificar qual é o paciente
      // Buscar na lista de pacientes conhecidos
      const knownPatientId = allPatients.find(p =>
        otherParticipants.some(op => op.id === p.id)
      )?.id

      if (knownPatientId) {
        return knownPatientId
      }

      // Fallback: retornar o primeiro participante que não é o usuário atual
      return otherParticipants[0]?.id
    }
    // Se o usuário é paciente, não deve iniciar videochamada (só profissional pode)
    return undefined
  }, [activeRoomId, otherParticipants, user?.type, allPatients])

  const handleSelectRoom = async (roomId: string) => {
    // Se havia uma sala ativa anteriormente, salvar conversa antes de trocar
    if (activeRoomId && activeRoomId !== roomId && messages.length > 0 && (user?.type === 'profissional' || user?.type === 'admin')) {
      // Salvar automaticamente a conversa anterior como evolução
      try {
        await handleSaveConversationAsEvolution();
      } catch (error) {
        console.warn('Não foi possível salvar conversa anterior automaticamente:', error);
      }
    }

    setActiveRoomId(roomId);
    setMessageInput('');
    await markRoomAsRead(roomId);
  }

  // Função para PACIENTE criar sala com um profissional específico
  const handleCreateRoomWithProfessional = async (professionalId: string, professionalName: string | null) => {
    if (!user?.id) {
      toast.error('Erro de autenticação', 'Usuário não identificado. Faça login novamente.');
      return;
    }

    try {
      console.log('🔄 Paciente criando sala com profissional:', { professionalId, professionalName, patientId: user.id });

      // Usar RPC com os parâmetros invertidos (paciente = user, profissional = parâmetro)
      const { data: roomIdFromRPC, error: rpcError } = await supabase.rpc(
        'create_chat_room_for_patient_uuid',
        {
          p_patient_id: user.id,
          p_professional_id: professionalId
        }
      );

      if (!rpcError && roomIdFromRPC) {
        console.log('✅ Sala criada via RPC:', roomIdFromRPC);
        await new Promise(resolve => setTimeout(resolve, 500));
        await reloadInbox();
        setActiveRoomId(roomIdFromRPC);
        console.log('✅ Sala criada com profissional com sucesso!');
        return;
      }

      if (rpcError) {
        console.error('❌ Erro ao criar sala com profissional:', rpcError);
        toast.error('Erro ao iniciar conversa', rpcError.message);
      }
    } catch (error: any) {
      console.error('Erro ao criar sala com profissional:', error);
      toast.error('Erro ao iniciar conversa', error?.message || 'Tente novamente.');
    }
  };

  const handleCreateRoomForPatient = async (patientId: string, patientName: string | null) => {
    if (!user?.id) {
      toast.error('Erro de autenticação', 'Usuário não identificado. Faça login novamente.');
      return;
    }

    try {
      console.log('🔄 Criando sala via RPC (contorna RLS)...', { patientId, patientName, professionalId: user.id });

      // SEMPRE usar função RPC primeiro (contorna RLS e recursão)
      const { data: roomIdFromRPC, error: rpcError } = await supabase.rpc(
        'create_chat_room_for_patient_uuid',
        {
          p_patient_id: patientId,
          p_professional_id: user.id
        }
      );

      if (!rpcError && roomIdFromRPC) {
        // ✅ Sucesso usando RPC
        console.log('✅ Sala criada via RPC:', roomIdFromRPC);
        await new Promise(resolve => setTimeout(resolve, 500));
        await reloadInbox();
        setActiveRoomId(roomIdFromRPC);
        console.log('✅ Sala criada e selecionada com sucesso!');
        return;
      }

      // Se RPC falhar, mostrar erro claro
      if (rpcError) {
        console.error('❌ Erro na função RPC:', rpcError);
        throw new Error(`Erro ao criar sala: ${rpcError.message}. Execute o script SQL "SOLUCAO_DEFINITIVA_CHAT.sql" no Supabase.`);
      }

      // Se não retornou ID, tentar método direto como fallback
      console.log('⚠️ RPC não retornou ID, tentando método direto...');

      // Criar nova sala diretamente
      const { data: newRoom, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: `Canal de cuidado • ${patientName || 'Paciente'}`,
          type: 'patient',
          created_by: user.id
        })
        .select('id')
        .single();

      if (roomError || !newRoom) {
        console.error('❌ Erro ao criar sala:', roomError);
        console.error('Detalhes do erro:', {
          code: roomError?.code,
          message: roomError?.message,
          details: roomError?.details,
          hint: roomError?.hint,
          userId: user.id,
          patientId: patientId
        });

        // Mensagem mais detalhada para o usuário
        const errorMessage = roomError?.message || 'Não foi possível criar a sala clínica do paciente';
        if (roomError?.code === '42501' || errorMessage.includes('row-level security')) {
          throw new Error('Erro de permissão RLS: Execute o script SQL "CRIAR_FUNCAO_RPC_APENAS.sql" no Supabase SQL Editor para criar a função que contorna o RLS.');
        }
        throw roomError ?? new Error(errorMessage);
      }

      // Adicionar participantes (paciente e profissional)
      const { error: participantsError } = await supabase
        .from('chat_participants')
        .upsert(
          [
            { room_id: newRoom.id, user_id: patientId, role: 'patient' },
            { room_id: newRoom.id, user_id: user.id, role: 'professional' }
          ],
          { onConflict: 'room_id,user_id' }
        );

      if (participantsError) {
        console.error('Erro ao adicionar participantes:', participantsError);
        // Continuar mesmo com erro, pois pode já estar adicionado
      }

      // Aguardar um pouco para garantir que o banco foi atualizado
      await new Promise(resolve => setTimeout(resolve, 500));

      // Recarregar inbox e selecionar a nova sala
      await reloadInbox();
      setActiveRoomId(newRoom.id);

      // Aguardar um pouco para garantir que o banco foi atualizado
      await new Promise(resolve => setTimeout(resolve, 500));

      // Recarregar inbox e selecionar a nova sala
      await reloadInbox();
      setActiveRoomId(newRoom.id);

      console.log('✅ Sala criada com sucesso para paciente:', patientName);
    } catch (error: any) {
      console.error('Erro ao criar sala para paciente:', error);
      toast.error('Erro ao criar sala', error?.message || 'Tente novamente.');
    }
  }

  const handleSubmitMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeRoomId || !messageInput.trim() || !user?.id) return;

    const messageToSend = messageInput.trim();
    setMessageInput(''); // Limpar input imediatamente para melhor UX

    try {
      await sendMessage(activeRoomId, user.id, messageToSend);
      await markRoomAsRead(activeRoomId);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      // Restaurar mensagem no input em caso de erro
      setMessageInput(messageToSend);
      toast.error('Erro ao enviar mensagem', 'Por favor, tente novamente.');
    }
  }

  /**
   * Salva a conversa atual como evolução clínica no prontuário do paciente
   * Esta é uma das funcionalidades principais: registrar automaticamente
   * todas as conversas do chat no histórico clínico
   */
  const handleSaveConversationAsEvolution = async () => {
    if (!activeRoomId || !user?.id || messages.length === 0) {
      toast.warning('Nenhuma mensagem', 'Não há mensagens para salvar como evolução.');
      return;
    }

    setSavingEvolution(true);

    try {
      // Identificar paciente e profissional da sala
      // Usar RPC function para evitar recursão RLS
      let participants: any[] | null = null;
      try {
        const { data: participantsData, error: participantsError } = await supabase.rpc(
          'get_chat_participants_for_room',
          { p_room_id: activeRoomId }
        );

        if (!participantsError && participantsData) {
          participants = participantsData;
        } else {
          // Fallback: tentar query direta (pode falhar se RLS tiver recursão)
          const { data: directData, error: directError } = await supabase
            .from('chat_participants')
            .select('user_id, role')
            .eq('room_id', activeRoomId);

          if (!directError && directData) {
            participants = directData;
          } else if (directError) {
            console.warn('⚠️ Erro ao buscar participantes (pode ser recursão RLS):', directError);
            // Continuar com array vazio para não quebrar a interface
            participants = [];
          }
        }
      } catch (error) {
        console.warn('⚠️ Erro ao buscar participantes:', error);
        participants = [];
      }

      if (!participants) {
        participants = [];
      }

      if (!participants || participants.length < 2) {
        throw new Error('Não foi possível identificar os participantes da conversa.');
      }

      const patient = participants.find(p => p.role === 'patient');
      const professional = participants.find(p => p.role === 'professional' || p.role === 'admin');

      if (!patient || !professional) {
        throw new Error('Sala de chat deve ter paciente e profissional.');
      }

      // Buscar nomes dos participantes
      const { data: profiles } = await supabase
        .from('users')
        .select('id, name')
        .in('id', [patient.user_id, professional.user_id]);

      const profileMap = new Map(profiles?.map(p => [p.id, p.name || 'Usuário']) || []);

      // Preparar sessão de chat
      const chatMessages = messages.map(msg => ({
        id: msg.id,
        room_id: activeRoomId,
        sender_id: msg.senderId,
        message: msg.message,
        created_at: msg.createdAt,
        sender_name: profileMap.get(msg.senderId) || 'Usuário'
      }));

      const session: ChatSession = {
        room_id: activeRoomId,
        patient_id: patient.user_id,
        doctor_id: professional.user_id,
        messages: chatMessages,
        start_time: messages[0]?.createdAt || new Date().toISOString(),
        end_time: messages[messages.length - 1]?.createdAt || new Date().toISOString()
      };

      // Salvar como evolução clínica
      const evolutionId = await ChatEvolutionService.saveChatAsEvolution(session, {
        autoSave: true
      });

      if (evolutionId) {
        toast.success('Evolução salva', 'Conversa salva como evolução clínica no prontuário do paciente!');
        console.log('📋 Evolução criada:', evolutionId);
      } else {
        throw new Error('Não foi possível salvar a evolução.');
      }
    } catch (error: any) {
      console.error('Erro ao salvar conversa como evolução:', error);
      toast.error('Erro ao salvar evolução', error.message || 'Tente novamente.');
    } finally {
      setSavingEvolution(false);
    }
  }

  const brainSrc = `${import.meta.env.BASE_URL}brain.png`

  const ambientParticles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, idx) => ({
      key: `chat-p-${idx}`,
      size: Math.random() * 2.2 + 1,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 6 + 7,
      delay: Math.random() * 4,
      opacity: Math.random() * 0.2 + 0.15
    }))
  }, [])

  return (
    <div className="h-[100dvh] bg-slate-950 text-slate-100 relative overflow-hidden flex flex-col">
      {/* Brain watermark moved inside chat section */}
      {/* ── Ambient Particles ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {ambientParticles.map(p => (
          <span
            key={p.key}
            className="patient-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>
      {/* ── Ambient Glows ── */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 py-5 flex-1 flex flex-col min-h-0">
        <div className="flex flex-col gap-5 flex-1 min-h-0">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group w-fit shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm">Voltar</span>
          </button>

          <header className="relative overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
            {/* Header glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/8 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/6 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-[0.35em] text-primary-300/80 mb-2 font-medium">Programa de Cuidado Renal</p>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-500/15 border border-primary-500/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary-400" />
                </div>
                Atendimento Integrado
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-xl leading-relaxed">
                Converse com a equipe clínica responsável pelo seu acompanhamento em cannabis medicinal e saúde renal.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 relative z-10">
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm ${isOnline
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/50'
                }`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                {isOnline ? 'Conectado ao Realtime' : 'Offline'}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/40 text-xs text-slate-300">
                {patientRooms.length} canal(is)
              </span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
            <aside className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl p-4 flex flex-col shadow-xl shadow-black/10">
              <h2 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary-400" />
                Equipe clínica
              </h2>

              {inboxLoading || patientsLoading ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Carregando pacientes...
                </div>
              ) : (
                <>
                  {/* Barra de Pesquisa */}
                  <div className="mb-3">
                    <input
                      type="text"
                      placeholder="Buscar por nome..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    />
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto pr-1 max-h-[400px] custom-scrollbar">
                    {/* Salas existentes */}
                    {patientRooms.map(room => {
                      const isActive = room.id === activeRoomId;
                      const unreadBadge = room.unreadCount > 0 && !isActive;

                      return (
                        <button
                          key={room.id}
                          onClick={() => handleSelectRoom(room.id)}
                          className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${isActive
                            ? 'border-primary-500/60 bg-primary-500/10 text-white'
                            : 'border-slate-800 bg-slate-900/80 text-slate-200 hover:border-primary-500/40 hover:bg-primary-500/5'
                            }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{room.name || 'Canal Clínico'}</p>
                              <p className="text-xs text-slate-400">
                                {room.lastMessageAt
                                  ? new Date(room.lastMessageAt).toLocaleString('pt-BR', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                  : 'Em aberto'}
                              </p>
                            </div>
                            <div className="flex items-center gap-3 ml-2">
                              {unreadBadge && (
                                <span className="px-2 py-0.5 rounded-full bg-primary-500 text-white text-[10px] font-semibold">
                                  {room.unreadCount}
                                </span>
                              )}
                              <ChevronRight className="w-4 h-4 text-slate-500" />
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {/* Pacientes sem sala (apenas para profissionais/admins, não para pacientes) */}
                    {(user?.type === 'profissional' || user?.type === 'admin') && !isPatient && (() => {
                      const patientsWithoutRooms = allPatients.filter(patient => !patientsWithRooms.has(patient.id));
                      console.log('📋 Pacientes sem sala:', patientsWithoutRooms.length, 'de', allPatients.length);
                      return patientsWithoutRooms.map(patient => (
                        <button
                          key={`patient-${patient.id}`}
                          onClick={() => handleCreateRoomForPatient(patient.id, patient.name)}
                          className="w-full rounded-xl border border-slate-800 bg-slate-900/40 text-slate-300 hover:border-primary-500/40 hover:bg-primary-500/5 hover:text-white px-3 py-3 text-left transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{patient.name || 'Paciente'}</p>
                              <p className="text-xs text-slate-500">Clique para criar canal</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          </div>
                        </button>
                      ));
                    })()}

                      {/* Paciente: mensagem quando não há canais */}
                    {isPatient && patientRooms.length === 0 && (
                      <div className="text-center py-6 text-slate-400 text-sm">
                        <p>Nenhum canal de cuidado ativo.</p>
                        <p className="text-xs mt-1 text-slate-500">Seu profissional irá criar o canal assim que iniciar o acompanhamento.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </aside>

            <section className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/40 rounded-2xl flex flex-col min-h-[560px] shadow-xl shadow-black/10 relative overflow-hidden">
              {/* Chat section glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
              {/* ── Brain Watermark inside chat ── */}
              <img
                src={brainSrc}
                alt=""
                aria-hidden="true"
                className="patient-brain-watermark absolute right-[-40px] top-1/2 -translate-y-1/2 w-[480px] max-w-none opacity-[0.12] pointer-events-none select-none z-0"
                draggable={false}
                loading="eager"
              />
              <div className="relative z-10 border-b border-slate-700/40 px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/30">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {patientRooms.find(room => room.id === activeRoomId)?.name || 'Selecione um canal'}
                  </h2>
                  {!participantsLoading && otherParticipants.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      {otherParticipants.map(participant => participant.name || participant.email || 'Profissional').join(' • ')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {participantsLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}

                  {/* Botões de Videochamada (quando há sala ativa) */}
                  {/* Mostrar botões mesmo se participantes ainda não carregaram ou se houver apenas 1 participante */}
                  {activeRoomId && (
                    <>
                      <button
                        onClick={async () => {
                          // Buscar recipientId: primeiro de otherParticipants, depois de patientIdForCall, depois buscar da sala
                          let recipientId = otherParticipants[0]?.id || patientIdForCall

                          // Se ainda não tiver, buscar diretamente da sala
                          if (!recipientId && activeRoomId) {
                            try {
                              const { data: roomParticipants } = await supabase
                                .from('chat_participants')
                                .select('user_id')
                                .eq('room_id', activeRoomId)
                                .neq('user_id', user?.id)
                                .limit(1)

                              if (roomParticipants && roomParticipants.length > 0) {
                                recipientId = roomParticipants[0].user_id
                              }
                            } catch (err) {
                              console.warn('Erro ao buscar recipient da sala:', err)
                            }
                          }

                          if (!recipientId) {
                            toast.error('Erro', 'Não foi possível identificar o destinatário da chamada. Tente novamente.')
                            return
                          }

                          // Identificar se é paciente ou profissional solicitando
                          const isPatientRequesting = user?.type === 'paciente'

                          // Timeout: 30 minutos (1800 segundos) para solicitações de pacientes
                          // 30 segundos para solicitações de profissionais
                          const timeoutSeconds = isPatientRequesting ? 1800 : 30

                          // Criar solicitação de videochamada
                          const request = await createRequest({
                            recipientId,
                            callType: 'video',
                            timeoutSeconds,
                            metadata: {
                              patientId: isPatientRequesting ? user.id : patientIdForCall,
                              roomId: activeRoomId,
                              isPatientRequest: isPatientRequesting
                            }
                          })

                          if (request) {
                            setPendingCallRequest(request.request_id)
                            setCallType('video')

                            // Mensagem de feedback baseada em quem está solicitando
                            if (isPatientRequesting) {
                              toast.success('Solicitação enviada', 'O profissional receberá uma notificação e você será avisado quando ele aceitar. Aguarde até 30 minutos.')
                            } else {
                              toast.success('Chamada enviada', 'O paciente receberá uma notificação e você será avisado quando ele aceitar. Aguarde até 30 segundos.')
                            }
                          }
                        }}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={user?.type === 'paciente' ? 'Solicitar videochamada ao profissional' : 'Solicitar videochamada'}
                        disabled={!!pendingCallRequest}
                      >
                        <Video className="w-5 h-5" />
                      </button>
                      <button
                        onClick={async () => {
                          // Buscar recipientId: primeiro de otherParticipants, depois de patientIdForCall, depois buscar da sala
                          let recipientId = otherParticipants[0]?.id || patientIdForCall

                          // Se ainda não tiver, buscar diretamente da sala
                          if (!recipientId && activeRoomId) {
                            try {
                              const { data: roomParticipants } = await supabase
                                .from('chat_participants')
                                .select('user_id')
                                .eq('room_id', activeRoomId)
                                .neq('user_id', user?.id)
                                .limit(1)

                              if (roomParticipants && roomParticipants.length > 0) {
                                recipientId = roomParticipants[0].user_id
                              }
                            } catch (err) {
                              console.warn('Erro ao buscar recipient da sala:', err)
                            }
                          }

                          if (!recipientId) {
                            toast.error('Erro', 'Não foi possível identificar o destinatário da chamada. Tente novamente.')
                            return
                          }

                          // Identificar se é paciente ou profissional solicitando
                          const isPatientRequesting = user?.type === 'paciente'

                          // Timeout: 30 minutos (1800 segundos) para solicitações de pacientes
                          // 30 segundos para solicitações de profissionais
                          const timeoutSeconds = isPatientRequesting ? 1800 : 30

                          // Criar solicitação de chamada de áudio
                          const request = await createRequest({
                            recipientId,
                            callType: 'audio',
                            timeoutSeconds,
                            metadata: {
                              patientId: isPatientRequesting ? user.id : patientIdForCall,
                              roomId: activeRoomId,
                              isPatientRequest: isPatientRequesting
                            }
                          })

                          if (request) {
                            setPendingCallRequest(request.request_id)
                            setCallType('audio')

                            // Mensagem de feedback baseada em quem está solicitando
                            if (isPatientRequesting) {
                              toast.success('Solicitação enviada', 'O profissional receberá uma notificação e você será avisado quando ele aceitar. Aguarde até 30 minutos.')
                            } else {
                              toast.success('Chamada enviada', 'O paciente receberá uma notificação e você será avisado quando ele aceitar. Aguarde até 30 segundos.')
                            }
                          }
                        }}
                        className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={user?.type === 'paciente' ? 'Solicitar chamada de áudio ao profissional' : 'Solicitar chamada de áudio'}
                        disabled={!!pendingCallRequest}
                      >
                        <Phone className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="relative z-10 flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
                {activeRoomId ? (
                  messagesLoading ? (
                    <div className="flex items-center justify-center text-sm text-slate-400 h-full">
                      <Loader2 className="w-5 h-5 animate-spin mr-2 text-primary-400" /> Carregando mensagens...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/40 flex items-center justify-center">
                        <MessageCircle className="w-7 h-7 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-300 font-medium">Nenhuma conversa registrada ainda</p>
                        <p className="text-xs text-slate-500 mt-1">Envie a primeira mensagem para iniciar o atendimento.</p>
                      </div>
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isOwn = msg.senderId === user.id
                      return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}>
                          <div
                            className={`max-w-[70%] xl:max-w-[55%] rounded-2xl px-5 py-3.5 shadow-lg transition-all duration-200 ${isOwn
                              ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-md shadow-primary-900/20'
                              : 'bg-slate-800/70 backdrop-blur-sm text-slate-100 border border-slate-700/30 rounded-bl-md shadow-black/10'
                              }`}
                          >
                            <div className="flex items-center justify-between gap-4 mb-1.5">
                              <span className={`text-xs font-semibold ${isOwn ? 'text-primary-100' : 'text-primary-300'}`}>
                                {isOwn ? 'Você' : msg.senderName || 'Profissional'}
                              </span>
                              <span className={`text-[10px] ${isOwn ? 'text-primary-200/60' : 'text-slate-500'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                          </div>
                        </div>
                      )
                    })
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-slate-400">
                    Selecione um canal de atendimento para visualizar as mensagens.
                  </div>
                )}
              </div>

              {/* Botão para salvar conversa como evolução (apenas para profissionais) */}
              {activeRoomId && messages.length > 0 && (user?.type === 'profissional' || user?.type === 'admin') && !isPatient && (
                <div className="border-t border-slate-800 px-4 py-2 bg-slate-900/30">
                  <button
                    onClick={handleSaveConversationAsEvolution}
                    disabled={savingEvolution}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingEvolution ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Salvando no prontuário...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        <span>Salvar conversa no prontuário do paciente</span>
                      </>
                    )}
                  </button>
                  <p className="text-xs text-slate-500 mt-1 text-center">
                    Esta conversa será registrada automaticamente como evolução clínica
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmitMessage} className="relative z-10 border-t border-slate-700/40 px-5 py-4 bg-slate-900/30 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={event => setMessageInput(event.target.value)}
                    placeholder={activeRoomId ? 'Escreva sua mensagem...' : 'Selecione um canal para enviar mensagens'}
                    disabled={!activeRoomId}
                    className="flex-1 bg-slate-950/50 backdrop-blur-sm border border-slate-700/40 rounded-xl px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/30 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!activeRoomId || !messageInput.trim()}
                    className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-400 hover:to-primary-600 transition-all shadow-lg shadow-primary-900/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>  {/* end relative z-10 container */}

      {/* Notificações de solicitação de videochamada */}
      {/* Filtrar apenas solicitações pendentes (não mostrar canceladas) */}
      {pendingRequests.filter(r => r.status === 'pending').map(request => (
        <VideoCallRequestNotification
          key={request.id}
          request={request}
          onAccept={async (acceptedRequest) => {
            await acceptRequest(acceptedRequest.request_id)
            // Se a solicitação aceita foi a que criamos, abrir VideoCall
            if (pendingCallRequest === acceptedRequest.request_id) {
              setIsVideoCallOpen(true)
              setPendingCallRequest(null)
            } else {
              // Outro usuário aceitou nossa solicitação, abrir VideoCall
              setCallType(acceptedRequest.call_type)
              setIsVideoCallOpen(true)
            }
          }}
          onReject={async (rejectedRequest) => {
            await rejectRequest(rejectedRequest.request_id)
            if (pendingCallRequest === rejectedRequest.request_id) {
              setPendingCallRequest(null)
              if (user?.type === 'paciente') {
                toast.warning('Solicitação recusada', 'O profissional recusou sua solicitação de videochamada. Você pode tentar novamente mais tarde.')
              } else {
                toast.warning('Solicitação recusada', 'A solicitação de videochamada foi recusada.')
              }
            }
          }}
          onExpire={(expiredRequest) => {
            if (pendingCallRequest === expiredRequest.request_id) {
              setPendingCallRequest(null)
              if (user?.type === 'paciente') {
                toast.warning('Solicitação expirada', 'Sua solicitação de videochamada expirou (30 minutos). O profissional não respondeu a tempo. Você pode tentar novamente.')
              } else {
                toast.warning('Solicitação expirada', 'A solicitação de videochamada expirou.')
              }
            }
          }}
        />
      ))}

      {/* Indicador de espera para pacientes e profissionais */}
      {pendingCallRequest && (
        <div className="fixed bottom-4 right-4 bg-blue-600/90 backdrop-blur-sm border border-blue-500/50 rounded-xl p-4 shadow-2xl max-w-sm z-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white mb-1">⏳ Aguardando resposta</h4>
              <p className="text-xs text-blue-100 leading-relaxed mb-2">
                {user?.type === 'paciente'
                  ? 'Sua solicitação de videochamada foi enviada ao profissional. Você será notificado quando ele aceitar ou recusar.'
                  : 'Sua chamada foi enviada ao paciente. Você será notificado quando ele aceitar ou recusar.'
                }
              </p>
              {timeRemaining !== null && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-blue-200/80">⏰ Tempo restante:</span>
                  <span className="text-xs font-mono font-semibold text-white">
                    {timeRemaining > 0
                      ? `${Math.floor(timeRemaining / 60)}:${String(Math.floor(timeRemaining % 60)).padStart(2, '0')}`
                      : 'Expirado'
                    }
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (pendingCallRequest) {
                  setConfirmModal({
                    isOpen: true,
                    title: 'Cancelar solicitação',
                    message: 'Tem certeza que deseja cancelar a solicitação de videochamada?',
                    type: 'warning',
                    onConfirm: async () => {
                      try {
                        await cancelRequest(pendingCallRequest)
                        // Limpar estados imediatamente
                        setPendingCallRequest(null)
                        setTimeRemaining(null)
                        toast.success('Solicitação cancelada', 'A solicitação foi cancelada com sucesso.')
                      } catch (error) {
                        console.error('Erro ao cancelar:', error)
                        // Limpar estados mesmo se der erro
                        setPendingCallRequest(null)
                        setTimeRemaining(null)
                        toast.error('Erro', 'Não foi possível cancelar a solicitação, mas o estado foi limpo.')
                      }
                    }
                  })
                }
              }}
              className="text-white/60 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
              title="Cancelar solicitação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Componente de Videochamada */}
      <VideoCall
        isOpen={isVideoCallOpen}
        onClose={() => {
          setIsVideoCallOpen(false)
          setPendingCallRequest(null)
          setVideoCallRoomId(null)
        }}
        patientId={patientIdForCall}
        isAudioOnly={callType === 'audio'}
        signalingRoomId={videoCallRoomId ?? undefined}
        isInitiator={videoCallInitiator}
      />
    </div>
  )
}

export default PatientDoctorChat
