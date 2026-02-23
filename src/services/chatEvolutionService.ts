import { supabase } from '../lib/supabase'

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  message: string
  created_at: string
  sender_name?: string
}

export interface ChatSession {
  room_id: string
  patient_id: string
  doctor_id: string
  messages: ChatMessage[]
  start_time: string
  end_time: string
}

/**
 * Serviço para integrar conversas do chat clínico ao histórico de evoluções do paciente
 * 
 * Este serviço garante que todas as conversas entre profissional e paciente
 * sejam automaticamente registradas no prontuário eletrônico, eliminando
 * a necessidade de copiar e colar manualmente conversas do WhatsApp.
 */
export class ChatEvolutionService {
  /**
   * Salva uma sessão de chat como evolução clínica
   * 
   * @param session Sessão de chat contendo mensagens
   * @param options Opções adicionais (revisar antes de salvar, etc)
   */
  static async saveChatAsEvolution(
    session: ChatSession,
    options?: {
      autoSave?: boolean // Se true, salva automaticamente sem revisão
      reviewBeforeSave?: boolean // Se true, cria como rascunho para revisão
    }
  ): Promise<string | null> {
    try {
      // Formatar mensagens como conversa estruturada
      const conversationText = this.formatConversation(session.messages);
      
      // Criar evolução clínica a partir da conversa
      const evolutionData = {
        patient_id: session.patient_id,
        doctor_id: session.doctor_id,
        assessment_type: 'FOLLOW_UP' as const,
        data: {
          type: 'chat_conversation',
          source: 'chat_clinico',
          conversation: conversationText,
          session_start: session.start_time,
          session_end: session.end_time,
          message_count: session.messages.length,
          room_id: session.room_id
        },
        clinical_report: this.generateClinicalReport(session),
        status: options?.reviewBeforeSave ? 'draft' : 'completed'
      };

      const { data, error } = await supabase
        .from('clinical_assessments')
        .insert(evolutionData)
        .select('id')
        .single();

      if (error) {
        console.error('Erro ao salvar conversa como evolução:', error);
        throw error;
      }

      console.log('✅ Conversa do chat salva como evolução clínica:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Erro ao salvar conversa como evolução:', error);
      return null;
    }
  }

  /**
   * Formata mensagens do chat como texto de conversa estruturada
   */
  private static formatConversation(messages: ChatMessage[]): string {
    return messages
      .map(msg => {
        const timestamp = new Date(msg.created_at).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        const sender = msg.sender_name || 'Usuário';
        return `[${timestamp}] ${sender}: ${msg.message}`;
      })
      .join('\n');
  }

  /**
   * Gera relatório clínico estruturado a partir da conversa
   */
  private static generateClinicalReport(session: ChatSession): string {
    const messages = session.messages;
    const doctorMessages = messages.filter(m => m.sender_id === session.doctor_id);
    const patientMessages = messages.filter(m => m.sender_id === session.patient_id);

    let report = `=== REGISTRO DE CONVERSA CLÍNICA ===\n\n`;
    report += `Data/Hora: ${new Date(session.start_time).toLocaleString('pt-BR')}\n`;
    report += `Duração: ${this.calculateDuration(session.start_time, session.end_time)}\n`;
    report += `Total de mensagens: ${messages.length}\n\n`;

    report += `--- CONVERSA ---\n\n`;
    report += this.formatConversation(messages);
    
    report += `\n\n--- RESUMO ---\n`;
    report += `Mensagens do profissional: ${doctorMessages.length}\n`;
    report += `Mensagens do paciente: ${patientMessages.length}\n`;

    return report;
  }

  /**
   * Calcula duração entre dois timestamps
   */
  private static calculateDuration(start: string, end: string): string {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMs = endTime - startTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} minutos`;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}min`;
  }

  /**
   * Salva mensagens individuais em lote quando a sessão termina
   * Útil para salvar automaticamente após um período de inatividade
   */
  static async saveSessionOnInactivity(
    roomId: string,
    patientId: string,
    doctorId: string,
    inactivityMinutes: number = 30
  ): Promise<void> {
    try {
      // Buscar mensagens da sala que ainda não foram salvas como evolução
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('id, room_id, sender_id, message, created_at')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error || !messages || messages.length === 0) {
        return;
      }

      // Verificar se há mensagens não salvas (mais de X minutos desde a última)
      const lastMessage = messages[messages.length - 1];
      const lastMessageTime = new Date(lastMessage.created_at).getTime();
      const now = Date.now();
      const minutesSinceLastMessage = (now - lastMessageTime) / 60000;

      if (minutesSinceLastMessage < inactivityMinutes) {
        return; // Ainda há atividade recente
      }

      // Buscar perfis dos remetentes para incluir nomes
      const senderIds = [...new Set(messages.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('users')
        .select('id, name')
        .in('id', senderIds);

      const profileMap = new Map(
        profiles?.map(p => [p.id, p.name || 'Usuário']) || []
      );

      const messagesWithNames: ChatMessage[] = messages.map(msg => ({
        ...msg,
        id: String(msg.id),
        sender_name: profileMap.get(msg.sender_id ?? '') || 'Usuário'
      }));

      // Criar sessão e salvar
      const session: ChatSession = {
        room_id: roomId,
        patient_id: patientId,
        doctor_id: doctorId,
        messages: messagesWithNames,
        start_time: messages[0].created_at,
        end_time: lastMessage.created_at
      };

      await this.saveChatAsEvolution(session, { autoSave: true });
    } catch (error) {
      console.error('Erro ao salvar sessão por inatividade:', error);
    }
  }

  /**
   * Verifica se uma mensagem deve ser salva como evolução
   * (filtra mensagens administrativas vs. clínicas)
   */
  static shouldSaveAsEvolution(message: string): boolean {
    // Mensagens muito curtas ou apenas administrativas podem não ser salvas
    const adminKeywords = ['ok', 'entendi', 'obrigado', 'obrigada', 'tchau', 'até'];
    const lowerMessage = message.toLowerCase().trim();
    
    // Se a mensagem é muito curta e contém apenas palavras administrativas, não salvar
    if (lowerMessage.length < 10 && adminKeywords.some(kw => lowerMessage.includes(kw))) {
      return false;
    }

    // Mensagens clínicas geralmente são mais longas e contêm termos médicos
    return true;
  }
}

