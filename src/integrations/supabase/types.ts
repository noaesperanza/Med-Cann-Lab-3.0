export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      abertura_exponencial: {
        Row: {
          contexto_emocional: string | null
          expectativas: string | null
          id: number
          identificacao: string | null
          motivo_consulta: string | null
          paciente_id: string | null
          queixa_principal: string | null
          queixas: Json | null
          timestamp: string | null
        }
        Insert: {
          contexto_emocional?: string | null
          expectativas?: string | null
          id?: number
          identificacao?: string | null
          motivo_consulta?: string | null
          paciente_id?: string | null
          queixa_principal?: string | null
          queixas?: Json | null
          timestamp?: string | null
        }
        Update: {
          contexto_emocional?: string | null
          expectativas?: string | null
          id?: number
          identificacao?: string | null
          motivo_consulta?: string | null
          paciente_id?: string | null
          queixa_principal?: string | null
          queixas?: Json | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abertura_exponencial_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abertura_exponencial_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_contexto_longitudinal"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "abertura_exponencial_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_interacoes_recentes"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "abertura_exponencial_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_paciente_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_assessment_scores: {
        Row: {
          assessment_id: string | null
          completed: boolean
          completion_time_seconds: number | null
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          patient_id: string | null
          phases_completed: number
          score: number
          simulation_id: string | null
          stuck_at_phase: string | null
          total_phases: number
        }
        Insert: {
          assessment_id?: string | null
          completed?: boolean
          completion_time_seconds?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          phases_completed?: number
          score?: number
          simulation_id?: string | null
          stuck_at_phase?: string | null
          total_phases?: number
        }
        Update: {
          assessment_id?: string | null
          completed?: boolean
          completion_time_seconds?: number | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          phases_completed?: number
          score?: number
          simulation_id?: string | null
          stuck_at_phase?: string | null
          total_phases?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_assessment_scores_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "clinical_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_assessment_scores_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "v_clinical_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_assessment_scores_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "v_prescriptions_queue"
            referencedColumns: ["report_id"]
          },
          {
            foreignKeyName: "ai_assessment_scores_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_assessment_scores_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_chat_history: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          model: string | null
          response: string | null
          role: string
          session_id: string | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          model?: string | null
          response?: string | null
          role: string
          session_id?: string | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          model?: string | null
          response?: string | null
          role?: string
          session_id?: string | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_chat_interactions: {
        Row: {
          ai_response: string
          confidence: number | null
          created_at: string | null
          id: string
          intent: string | null
          medical_record_id: string | null
          metadata: Json | null
          patient_id: string | null
          processing_time: number | null
          saved_to_medical_record: boolean | null
          session_id: string | null
          user_id: string
          user_message: string
        }
        Insert: {
          ai_response: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          intent?: string | null
          medical_record_id?: string | null
          metadata?: Json | null
          patient_id?: string | null
          processing_time?: number | null
          saved_to_medical_record?: boolean | null
          session_id?: string | null
          user_id: string
          user_message: string
        }
        Update: {
          ai_response?: string
          confidence?: number | null
          created_at?: string | null
          id?: string
          intent?: string | null
          medical_record_id?: string | null
          metadata?: Json | null
          patient_id?: string | null
          processing_time?: number | null
          saved_to_medical_record?: boolean | null
          session_id?: string | null
          user_id?: string
          user_message?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_interactions_medical_record_id_fkey"
            columns: ["medical_record_id"]
            isOneToOne: false
            referencedRelation: "patient_medical_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_interactions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_interactions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_chat_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_saved_documents: {
        Row: {
          content: string
          created_at: string | null
          document_type: string
          file_type: string | null
          file_url: string | null
          id: string
          is_shared_with_patient: boolean | null
          metadata: Json | null
          patient_id: string | null
          summary: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          document_type: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_shared_with_patient?: boolean | null
          metadata?: Json | null
          patient_id?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          document_type?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_shared_with_patient?: boolean | null
          metadata?: Json | null
          patient_id?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_saved_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_saved_documents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "ai_saved_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_saved_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ai_scheduling_predictions: {
        Row: {
          appointment_id: string | null
          expected_duration_minutes: number | null
          id: string
          model_version: string | null
          no_show_probability: number | null
          predicted_at: string | null
          recommended_action: string | null
        }
        Insert: {
          appointment_id?: string | null
          expected_duration_minutes?: number | null
          id?: string
          model_version?: string | null
          no_show_probability?: number | null
          predicted_at?: string | null
          recommended_action?: string | null
        }
        Update: {
          appointment_id?: string | null
          expected_duration_minutes?: number | null
          id?: string
          model_version?: string | null
          no_show_probability?: number | null
          predicted_at?: string | null
          recommended_action?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_scheduling_predictions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_scheduling_predictions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_appointments_json"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_scheduling_predictions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_appointments_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_scheduling_predictions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_next_appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          metric_name: string
          metric_type: string
          metric_unit: string | null
          metric_value: number | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          metric_name: string
          metric_type: string
          metric_unit?: string | null
          metric_value?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          metric_name?: string
          metric_type?: string
          metric_unit?: string | null
          metric_value?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string | null
          appointment_type: string | null
          created_at: string | null
          description: string | null
          doctor_id: string | null
          duration: number | null
          id: string
          is_remote: boolean | null
          location: string | null
          meeting_url: string | null
          notes: string | null
          patient_id: string | null
          professional_id: string | null
          professional_name: string | null
          specialty: string | null
          status: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          appointment_time?: string | null
          appointment_type?: string | null
          created_at?: string | null
          description?: string | null
          doctor_id?: string | null
          duration?: number | null
          id?: string
          is_remote?: boolean | null
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          patient_id?: string | null
          professional_id?: string | null
          professional_name?: string | null
          specialty?: string | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          appointment_time?: string | null
          appointment_type?: string | null
          created_at?: string | null
          description?: string | null
          doctor_id?: string | null
          duration?: number | null
          id?: string
          is_remote?: boolean | null
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          patient_id?: string | null
          professional_id?: string | null
          professional_name?: string | null
          specialty?: string | null
          status?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      assessment_sharing: {
        Row: {
          assessment_id: string | null
          consent_date: string | null
          consent_expiry_date: string | null
          created_at: string | null
          id: string
          notes: string | null
          patient_consent: boolean | null
          patient_id: string | null
          shared_at: string | null
          shared_by: string | null
          shared_with_eduardo_faveret: boolean | null
          shared_with_ricardo_valenca: boolean | null
          updated_at: string | null
        }
        Insert: {
          assessment_id?: string | null
          consent_date?: string | null
          consent_expiry_date?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_consent?: boolean | null
          patient_id?: string | null
          shared_at?: string | null
          shared_by?: string | null
          shared_with_eduardo_faveret?: boolean | null
          shared_with_ricardo_valenca?: boolean | null
          updated_at?: string | null
        }
        Update: {
          assessment_id?: string | null
          consent_date?: string | null
          consent_expiry_date?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_consent?: boolean | null
          patient_id?: string | null
          shared_at?: string | null
          shared_by?: string | null
          shared_with_eduardo_faveret?: boolean | null
          shared_with_ricardo_valenca?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_sharing_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "imre_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sharing_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "patient_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sharing_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sharing_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "assessment_sharing_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sharing_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      avaliacoes_renais: {
        Row: {
          acido_urico: number | null
          acr: number | null
          creatinina: number | null
          egfr: number | null
          eletrolitos: Json | null
          glicose: number | null
          id: number
          paciente_id: string | null
          risco_drc: string | null
          timestamp: string | null
          ultrassom_renal: string | null
          ureia: number | null
        }
        Insert: {
          acido_urico?: number | null
          acr?: number | null
          creatinina?: number | null
          egfr?: number | null
          eletrolitos?: Json | null
          glicose?: number | null
          id?: number
          paciente_id?: string | null
          risco_drc?: string | null
          timestamp?: string | null
          ultrassom_renal?: string | null
          ureia?: number | null
        }
        Update: {
          acido_urico?: number | null
          acr?: number | null
          creatinina?: number | null
          egfr?: number | null
          eletrolitos?: Json | null
          glicose?: number | null
          id?: number
          paciente_id?: string | null
          risco_drc?: string | null
          timestamp?: string | null
          ultrassom_renal?: string | null
          ureia?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_renais_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avaliacoes_renais_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_contexto_longitudinal"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "avaliacoes_renais_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_interacoes_recentes"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "avaliacoes_renais_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_paciente_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      base_conhecimento: {
        Row: {
          ativo: boolean | null
          autor: string
          categoria: string
          conteudo: string
          data_atualizacao: string | null
          id: string
          prioridade: string | null
          tags: Json | null
          titulo: string
          versao: string
        }
        Insert: {
          ativo?: boolean | null
          autor: string
          categoria: string
          conteudo: string
          data_atualizacao?: string | null
          id: string
          prioridade?: string | null
          tags?: Json | null
          titulo: string
          versao: string
        }
        Update: {
          ativo?: boolean | null
          autor?: string
          categoria?: string
          conteudo?: string
          data_atualizacao?: string | null
          id?: string
          prioridade?: string | null
          tags?: Json | null
          titulo?: string
          versao?: string
        }
        Relationships: []
      }
      benefit_usage_log: {
        Row: {
          benefit_type: string
          details: Json | null
          id: string
          used_at: string | null
          user_id: string
          value_monetary: number | null
        }
        Insert: {
          benefit_type: string
          details?: Json | null
          id?: string
          used_at?: string | null
          user_id: string
          value_monetary?: number | null
        }
        Update: {
          benefit_type?: string
          details?: Json | null
          id?: string
          used_at?: string | null
          user_id?: string
          value_monetary?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "benefit_usage_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_usage_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_compatible"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "benefit_usage_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_current_ranking_live"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cfm_prescriptions: {
        Row: {
          created_at: string | null
          digital_signature: string | null
          document_level: string | null
          email_sent_at: string | null
          expires_at: string | null
          id: string
          iti_qr_code: string | null
          iti_validation_code: string | null
          iti_validation_url: string | null
          medications: Json | null
          metadata: Json | null
          notes: string | null
          patient_cpf: string | null
          patient_email: string | null
          patient_id: string | null
          patient_name: string
          patient_phone: string | null
          prescription_type: string
          professional_crm: string | null
          professional_id: string
          professional_name: string
          professional_specialty: string | null
          sent_at: string | null
          sent_via_email: boolean | null
          sent_via_sms: boolean | null
          signature_certificate: string | null
          signature_timestamp: string | null
          sms_sent_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          digital_signature?: string | null
          document_level?: string | null
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          iti_qr_code?: string | null
          iti_validation_code?: string | null
          iti_validation_url?: string | null
          medications?: Json | null
          metadata?: Json | null
          notes?: string | null
          patient_cpf?: string | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name: string
          patient_phone?: string | null
          prescription_type: string
          professional_crm?: string | null
          professional_id: string
          professional_name: string
          professional_specialty?: string | null
          sent_at?: string | null
          sent_via_email?: boolean | null
          sent_via_sms?: boolean | null
          signature_certificate?: string | null
          signature_timestamp?: string | null
          sms_sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          digital_signature?: string | null
          document_level?: string | null
          email_sent_at?: string | null
          expires_at?: string | null
          id?: string
          iti_qr_code?: string | null
          iti_validation_code?: string | null
          iti_validation_url?: string | null
          medications?: Json | null
          metadata?: Json | null
          notes?: string | null
          patient_cpf?: string | null
          patient_email?: string | null
          patient_id?: string | null
          patient_name?: string
          patient_phone?: string | null
          prescription_type?: string
          professional_crm?: string | null
          professional_id?: string
          professional_name?: string
          professional_specialty?: string | null
          sent_at?: string | null
          sent_via_email?: boolean | null
          sent_via_sms?: boolean | null
          signature_certificate?: string | null
          signature_timestamp?: string | null
          sms_sent_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cfm_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cfm_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users_compatible"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cfm_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "view_current_ranking_live"
            referencedColumns: ["user_id"]
          },
        ]
      }
      channels: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          members_count: number | null
          name: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          members_count?: number | null
          name: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          members_count?: number | null
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          file_url: string | null
          id: number
          message: string | null
          message_type: string | null
          read_at: string | null
          room_id: string | null
          sender_id: string | null
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: number
          message?: string | null
          message_type?: string | null
          read_at?: string | null
          room_id?: string | null
          sender_id?: string | null
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: number
          message?: string | null
          message_type?: string | null
          read_at?: string | null
          room_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_chat_inbox"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey1"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey1"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chat_messages_legacy: {
        Row: {
          channel: string | null
          chat_id: string
          content: string
          created_at: string | null
          crm: string | null
          expires_at: string | null
          id: string
          is_deleted: boolean | null
          is_online: boolean | null
          is_pinned: boolean | null
          reactions: Json | null
          sender_email: string | null
          sender_id: string | null
          sender_name: string | null
          specialty: string | null
          type: string | null
          user_avatar: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          channel?: string | null
          chat_id: string
          content: string
          created_at?: string | null
          crm?: string | null
          expires_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_online?: boolean | null
          is_pinned?: boolean | null
          reactions?: Json | null
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string | null
          specialty?: string | null
          type?: string | null
          user_avatar?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          channel?: string | null
          chat_id?: string
          content?: string
          created_at?: string | null
          crm?: string | null
          expires_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_online?: boolean | null
          is_pinned?: boolean | null
          reactions?: Json | null
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string | null
          specialty?: string | null
          type?: string | null
          user_avatar?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          joined_at: string
          last_seen_at: string | null
          role: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          last_seen_at?: string | null
          role?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          last_seen_at?: string | null
          role?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_chat_inbox"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          context_docs: string[] | null
          created_at: string | null
          id: string
          messages: Json | null
          user_id: string | null
        }
        Insert: {
          context_docs?: string[] | null
          created_at?: string | null
          id?: string
          messages?: Json | null
          user_id?: string | null
        }
        Update: {
          context_docs?: string[] | null
          created_at?: string | null
          id?: string
          messages?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      clinical_assessments: {
        Row: {
          appointment_id: string | null
          assessment_type: string | null
          clinical_report: string | null
          created_at: string | null
          data: Json | null
          doctor_id: string | null
          id: string
          patient_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          assessment_type?: string | null
          clinical_report?: string | null
          created_at?: string | null
          data?: Json | null
          doctor_id?: string | null
          id?: string
          patient_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          assessment_type?: string | null
          clinical_report?: string | null
          created_at?: string | null
          data?: Json | null
          doctor_id?: string | null
          id?: string
          patient_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_assessments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_assessments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_appointments_json"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_assessments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_appointments_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_assessments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_next_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users_compatible"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_assessments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "view_current_ranking_live"
            referencedColumns: ["user_id"]
          },
        ]
      }
      clinical_integration: {
        Row: {
          assessment_id: string | null
          clinical_data: Json
          clinician_notes: string | null
          follow_up_plan: Json | null
          id: string
          integration_date: string | null
          risk_assessment: Json | null
          status: string | null
          therapeutic_recommendations: Json | null
          user_id: string | null
        }
        Insert: {
          assessment_id?: string | null
          clinical_data: Json
          clinician_notes?: string | null
          follow_up_plan?: Json | null
          id?: string
          integration_date?: string | null
          risk_assessment?: Json | null
          status?: string | null
          therapeutic_recommendations?: Json | null
          user_id?: string | null
        }
        Update: {
          assessment_id?: string | null
          clinical_data?: Json
          clinician_notes?: string | null
          follow_up_plan?: Json | null
          id?: string
          integration_date?: string | null
          risk_assessment?: Json | null
          status?: string | null
          therapeutic_recommendations?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_integration_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "imre_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_integration_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "patient_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_integration_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_integration_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      clinical_kpis: {
        Row: {
          assessment_date: string
          category: string
          created_at: string | null
          doctor_id: string | null
          id: string
          metric_name: string
          metric_unit: string | null
          metric_value: number
          patient_id: string | null
          professional_id: string | null
          updated_at: string | null
        }
        Insert: {
          assessment_date: string
          category: string
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          metric_name: string
          metric_unit?: string | null
          metric_value: number
          patient_id?: string | null
          professional_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assessment_date?: string
          category?: string
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number
          patient_id?: string | null
          professional_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_kpis_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_kpis_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "clinical_kpis_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_kpis_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "clinical_kpis_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_kpis_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      clinical_reports: {
        Row: {
          assessment_id: string | null
          content: Json
          created_at: string | null
          doctor_id: string | null
          generated_at: string
          generated_by: string
          id: string
          patient_id: string
          patient_name: string
          professional_id: string | null
          professional_name: string | null
          protocol: string
          report_type: string
          shared_at: string | null
          shared_by: string | null
          shared_with: string[] | null
          status: string
          updated_at: string | null
        }
        Insert: {
          assessment_id?: string | null
          content: Json
          created_at?: string | null
          doctor_id?: string | null
          generated_at?: string
          generated_by: string
          id?: string
          patient_id: string
          patient_name: string
          professional_id?: string | null
          professional_name?: string | null
          protocol?: string
          report_type?: string
          shared_at?: string | null
          shared_by?: string | null
          shared_with?: string[] | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          assessment_id?: string | null
          content?: Json
          created_at?: string | null
          doctor_id?: string | null
          generated_at?: string
          generated_by?: string
          id?: string
          patient_id?: string
          patient_name?: string
          professional_id?: string | null
          professional_name?: string | null
          protocol?: string
          report_type?: string
          shared_at?: string | null
          shared_by?: string | null
          shared_with?: string[] | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_reports_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "clinical_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_reports_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_reports_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "clinical_reports_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_reports_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      clinics: {
        Row: {
          created_at: string | null
          description: string | null
          doctor_id: string | null
          id: string
          is_active: boolean | null
          name: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          doctor_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          doctor_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinics_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: true
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinics_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: true
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cognitive_decisions: {
        Row: {
          alternatives: Json | null
          autonomy_level: number | null
          confidence: number | null
          created_at: string | null
          decision_type: string
          human_feedback: string | null
          human_notes: string | null
          id: string
          justification: string | null
          metadata: Json | null
          model_version: string | null
          policy_snapshot: Json | null
          recommendation: Json
          requires_human_confirmation: boolean | null
          updated_at: string | null
        }
        Insert: {
          alternatives?: Json | null
          autonomy_level?: number | null
          confidence?: number | null
          created_at?: string | null
          decision_type: string
          human_feedback?: string | null
          human_notes?: string | null
          id?: string
          justification?: string | null
          metadata?: Json | null
          model_version?: string | null
          policy_snapshot?: Json | null
          recommendation: Json
          requires_human_confirmation?: boolean | null
          updated_at?: string | null
        }
        Update: {
          alternatives?: Json | null
          autonomy_level?: number | null
          confidence?: number | null
          created_at?: string | null
          decision_type?: string
          human_feedback?: string | null
          human_notes?: string | null
          id?: string
          justification?: string | null
          metadata?: Json | null
          model_version?: string | null
          policy_snapshot?: Json | null
          recommendation?: Json
          requires_human_confirmation?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cognitive_events: {
        Row: {
          action: string
          created_at: string | null
          decision_result: string
          id: string
          intent: string
          metadata: Json | null
          source: string
        }
        Insert: {
          action: string
          created_at?: string | null
          decision_result: string
          id?: string
          intent: string
          metadata?: Json | null
          source: string
        }
        Update: {
          action?: string
          created_at?: string | null
          decision_result?: string
          id?: string
          intent?: string
          metadata?: Json | null
          source?: string
        }
        Relationships: []
      }
      cognitive_interaction_state: {
        Row: {
          created_at: string
          depth_level: number
          id: string
          last_shift_at: string | null
          traits: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          depth_level?: number
          id?: string
          last_shift_at?: string | null
          traits?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          depth_level?: number
          id?: string
          last_shift_at?: string | null
          traits?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cognitive_interaction_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cognitive_interaction_state_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cognitive_metabolism: {
        Row: {
          decision_count_today: number | null
          decision_limit_daily: number | null
          id: string
          last_reset_at: string | null
          professional_id: string
        }
        Insert: {
          decision_count_today?: number | null
          decision_limit_daily?: number | null
          id?: string
          last_reset_at?: string | null
          professional_id: string
        }
        Update: {
          decision_count_today?: number | null
          decision_limit_daily?: number | null
          id?: string
          last_reset_at?: string | null
          professional_id?: string
        }
        Relationships: []
      }
      cognitive_policies: {
        Row: {
          active: boolean | null
          autonomy_level: number | null
          created_at: string | null
          forbidden_actions: string[] | null
          id: string
          intent: string
          version: number | null
        }
        Insert: {
          active?: boolean | null
          autonomy_level?: number | null
          created_at?: string | null
          forbidden_actions?: string[] | null
          id?: string
          intent: string
          version?: number | null
        }
        Update: {
          active?: boolean | null
          autonomy_level?: number | null
          created_at?: string | null
          forbidden_actions?: string[] | null
          id?: string
          intent?: string
          version?: number | null
        }
        Relationships: []
      }
      contexto_longitudinal: {
        Row: {
          consultas_profissionais: Json | null
          evolucao_exames: Json | null
          evolucao_medicamentos: Json | null
          evolucao_sintomas: Json | null
          id: number
          paciente_id: string | null
          timestamp: string | null
        }
        Insert: {
          consultas_profissionais?: Json | null
          evolucao_exames?: Json | null
          evolucao_medicamentos?: Json | null
          evolucao_sintomas?: Json | null
          id?: number
          paciente_id?: string | null
          timestamp?: string | null
        }
        Update: {
          consultas_profissionais?: Json | null
          evolucao_exames?: Json | null
          evolucao_medicamentos?: Json | null
          evolucao_sintomas?: Json | null
          id?: number
          paciente_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contexto_longitudinal_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contexto_longitudinal_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_contexto_longitudinal"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "contexto_longitudinal_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_interacoes_recentes"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "contexto_longitudinal_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_paciente_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_ratings: {
        Row: {
          context: string
          created_at: string
          id: string
          patient_id: string
          professional_id: string | null
          rating: number
        }
        Insert: {
          context?: string
          created_at?: string
          id?: string
          patient_id: string
          professional_id?: string | null
          rating: number
        }
        Update: {
          context?: string
          created_at?: string
          id?: string
          patient_id?: string
          professional_id?: string | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversation_ratings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_ratings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "conversation_ratings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_ratings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string | null
          created_at: string | null
          enrolled_at: string | null
          id: string
          progress: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_modules: {
        Row: {
          content: string | null
          content_type: string | null
          content_url: string | null
          course_id: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          order_index: number
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          content_type?: string | null
          content_url?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          order_index: number
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          content_type?: string | null
          content_url?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          order_index?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_ratings: {
        Row: {
          comment: string | null
          course_id: string
          created_at: string | null
          id: string
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_ratings_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          duration: number | null
          duration_text: string | null
          id: string
          instructor: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_live: boolean | null
          is_published: boolean | null
          level: string | null
          next_class_date: string | null
          original_price: number | null
          price: number | null
          slug: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          duration?: number | null
          duration_text?: string | null
          id?: string
          instructor?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_live?: boolean | null
          is_published?: boolean | null
          level?: string | null
          next_class_date?: string | null
          original_price?: number | null
          price?: number | null
          slug?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          duration?: number | null
          duration_text?: string | null
          id?: string
          instructor?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_live?: boolean | null
          is_published?: boolean | null
          level?: string | null
          next_class_date?: string | null
          original_price?: number | null
          price?: number | null
          slug?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      dados_imre_coletados: {
        Row: {
          bloco_id: number
          id: number
          paciente_id: string | null
          pergunta: string
          resposta: string
          timestamp: string | null
        }
        Insert: {
          bloco_id: number
          id?: number
          paciente_id?: string | null
          pergunta: string
          resposta: string
          timestamp?: string | null
        }
        Update: {
          bloco_id?: number
          id?: number
          paciente_id?: string | null
          pergunta?: string
          resposta?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dados_imre_coletados_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dados_imre_coletados_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_contexto_longitudinal"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "dados_imre_coletados_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_interacoes_recentes"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "dados_imre_coletados_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_paciente_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      debates: {
        Row: {
          author_id: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_hot: boolean | null
          is_password_protected: boolean | null
          is_pinned: boolean | null
          participants_count: number | null
          password: string | null
          tags: string[] | null
          title: string
          views: number | null
          votes: Json | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_hot?: boolean | null
          is_password_protected?: boolean | null
          is_pinned?: boolean | null
          participants_count?: number | null
          password?: string | null
          tags?: string[] | null
          title: string
          views?: number | null
          votes?: Json | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_hot?: boolean | null
          is_password_protected?: boolean | null
          is_pinned?: boolean | null
          participants_count?: number | null
          password?: string | null
          tags?: string[] | null
          title?: string
          views?: number | null
          votes?: Json | null
        }
        Relationships: []
      }
      desenvolvimento_indiciario: {
        Row: {
          alergias_alimentos: Json | null
          alergias_medicamentos: Json | null
          alergias_outras: Json | null
          habitos_alimentacao: string | null
          habitos_contexto_social: string | null
          habitos_exercicios: string | null
          habitos_sono: string | null
          habitos_trabalho: string | null
          hda_caracteristicas: string | null
          hda_evolucao: string | null
          hda_fatores_moduladores: string | null
          hda_impacto_funcional: string | null
          hda_inicio: string | null
          hda_tratamentos_anteriores: Json | null
          historia_cirurgias: Json | null
          historia_doencas_previas: Json | null
          historia_familiar_doencas: Json | null
          historia_familiar_padroes: Json | null
          historia_hospitalizacoes: Json | null
          id: number
          medicamentos_anteriores: Json | null
          medicamentos_atuais: Json | null
          medicamentos_suplementos: Json | null
          paciente_id: string | null
          timestamp: string | null
        }
        Insert: {
          alergias_alimentos?: Json | null
          alergias_medicamentos?: Json | null
          alergias_outras?: Json | null
          habitos_alimentacao?: string | null
          habitos_contexto_social?: string | null
          habitos_exercicios?: string | null
          habitos_sono?: string | null
          habitos_trabalho?: string | null
          hda_caracteristicas?: string | null
          hda_evolucao?: string | null
          hda_fatores_moduladores?: string | null
          hda_impacto_funcional?: string | null
          hda_inicio?: string | null
          hda_tratamentos_anteriores?: Json | null
          historia_cirurgias?: Json | null
          historia_doencas_previas?: Json | null
          historia_familiar_doencas?: Json | null
          historia_familiar_padroes?: Json | null
          historia_hospitalizacoes?: Json | null
          id?: number
          medicamentos_anteriores?: Json | null
          medicamentos_atuais?: Json | null
          medicamentos_suplementos?: Json | null
          paciente_id?: string | null
          timestamp?: string | null
        }
        Update: {
          alergias_alimentos?: Json | null
          alergias_medicamentos?: Json | null
          alergias_outras?: Json | null
          habitos_alimentacao?: string | null
          habitos_contexto_social?: string | null
          habitos_exercicios?: string | null
          habitos_sono?: string | null
          habitos_trabalho?: string | null
          hda_caracteristicas?: string | null
          hda_evolucao?: string | null
          hda_fatores_moduladores?: string | null
          hda_impacto_funcional?: string | null
          hda_inicio?: string | null
          hda_tratamentos_anteriores?: Json | null
          historia_cirurgias?: Json | null
          historia_doencas_previas?: Json | null
          historia_familiar_doencas?: Json | null
          historia_familiar_padroes?: Json | null
          historia_hospitalizacoes?: Json | null
          id?: number
          medicamentos_anteriores?: Json | null
          medicamentos_atuais?: Json | null
          medicamentos_suplementos?: Json | null
          paciente_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "desenvolvimento_indiciario_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "desenvolvimento_indiciario_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_contexto_longitudinal"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "desenvolvimento_indiciario_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_interacoes_recentes"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "desenvolvimento_indiciario_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_paciente_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      dev_vivo_audit: {
        Row: {
          action: string
          change_id: string | null
          created_at: string | null
          data_type: string | null
          id: string
          ip_address: unknown
          request_body: Json | null
          response_status: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          change_id?: string | null
          created_at?: string | null
          data_type?: string | null
          id?: string
          ip_address?: unknown
          request_body?: Json | null
          response_status?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          change_id?: string | null
          created_at?: string | null
          data_type?: string | null
          id?: string
          ip_address?: unknown
          request_body?: Json | null
          response_status?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dev_vivo_audit_change_id_fkey"
            columns: ["change_id"]
            isOneToOne: false
            referencedRelation: "dev_vivo_changes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dev_vivo_audit_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dev_vivo_audit_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      dev_vivo_changes: {
        Row: {
          applied_at: string | null
          change_type: string
          created_at: string | null
          error_message: string | null
          file_path: string
          id: string
          new_content: string | null
          old_content: string | null
          reason: string | null
          rollback_reason: string | null
          rolled_back_at: string | null
          session_id: string
          signature: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          change_type: string
          created_at?: string | null
          error_message?: string | null
          file_path: string
          id?: string
          new_content?: string | null
          old_content?: string | null
          reason?: string | null
          rollback_reason?: string | null
          rolled_back_at?: string | null
          session_id: string
          signature?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          applied_at?: string | null
          change_type?: string
          created_at?: string | null
          error_message?: string | null
          file_path?: string
          id?: string
          new_content?: string | null
          old_content?: string | null
          reason?: string | null
          rollback_reason?: string | null
          rolled_back_at?: string | null
          session_id?: string
          signature?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dev_vivo_changes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dev_vivo_changes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      dev_vivo_diagnostics: {
        Row: {
          api_calls: Json | null
          component_props: Json | null
          component_state: Json | null
          created_at: string | null
          current_component: string | null
          current_route: string | null
          id: string
          memory_usage: number | null
          network_latency: number | null
          query_params: Json | null
          realtime_subscriptions: Json | null
          recent_errors: Json | null
          recent_warnings: Json | null
          render_time: number | null
          route_params: Json | null
          session_id: string
          supabase_connections: Json | null
        }
        Insert: {
          api_calls?: Json | null
          component_props?: Json | null
          component_state?: Json | null
          created_at?: string | null
          current_component?: string | null
          current_route?: string | null
          id?: string
          memory_usage?: number | null
          network_latency?: number | null
          query_params?: Json | null
          realtime_subscriptions?: Json | null
          recent_errors?: Json | null
          recent_warnings?: Json | null
          render_time?: number | null
          route_params?: Json | null
          session_id: string
          supabase_connections?: Json | null
        }
        Update: {
          api_calls?: Json | null
          component_props?: Json | null
          component_state?: Json | null
          created_at?: string | null
          current_component?: string | null
          current_route?: string | null
          id?: string
          memory_usage?: number | null
          network_latency?: number | null
          query_params?: Json | null
          realtime_subscriptions?: Json | null
          recent_errors?: Json | null
          recent_warnings?: Json | null
          render_time?: number | null
          route_params?: Json | null
          session_id?: string
          supabase_connections?: Json | null
        }
        Relationships: []
      }
      dev_vivo_sessions: {
        Row: {
          can_access_real_data: boolean | null
          can_modify_code: boolean | null
          can_modify_database: boolean | null
          created_at: string | null
          current_component: string | null
          current_route: string | null
          expires_at: string
          flag_admin: boolean | null
          id: string
          is_active: boolean | null
          supabase_token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_access_real_data?: boolean | null
          can_modify_code?: boolean | null
          can_modify_database?: boolean | null
          created_at?: string | null
          current_component?: string | null
          current_route?: string | null
          expires_at: string
          flag_admin?: boolean | null
          id: string
          is_active?: boolean | null
          supabase_token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_access_real_data?: boolean | null
          can_modify_code?: boolean | null
          can_modify_database?: boolean | null
          created_at?: string | null
          current_component?: string | null
          current_route?: string | null
          expires_at?: string
          flag_admin?: boolean | null
          id?: string
          is_active?: boolean | null
          supabase_token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dev_vivo_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dev_vivo_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      document_snapshots: {
        Row: {
          created_at: string | null
          document_id: string
          id: string
          is_final: boolean | null
          pdf_storage_path: string | null
          pdf_url: string | null
          snapshot_data: Json | null
          version_hash: string
        }
        Insert: {
          created_at?: string | null
          document_id: string
          id?: string
          is_final?: boolean | null
          pdf_storage_path?: string | null
          pdf_url?: string | null
          snapshot_data?: Json | null
          version_hash: string
        }
        Update: {
          created_at?: string | null
          document_id?: string
          id?: string
          is_final?: boolean | null
          pdf_storage_path?: string | null
          pdf_url?: string | null
          snapshot_data?: Json | null
          version_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_snapshots_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "cfm_prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          aiRelevance: number | null
          author: string | null
          category: string | null
          content: string | null
          created_at: string | null
          downloads: number
          embeddings: Json | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          isLinkedToAI: boolean | null
          keywords: string[] | null
          medical_terms: string[] | null
          summary: string | null
          tags: string[] | null
          target_audience: string[] | null
          title: string
          type: string | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          aiRelevance?: number | null
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          downloads?: number
          embeddings?: Json | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          isLinkedToAI?: boolean | null
          keywords?: string[] | null
          medical_terms?: string[] | null
          summary?: string | null
          tags?: string[] | null
          target_audience?: string[] | null
          title: string
          type?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          aiRelevance?: number | null
          author?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          downloads?: number
          embeddings?: Json | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          isLinkedToAI?: boolean | null
          keywords?: string[] | null
          medical_terms?: string[] | null
          summary?: string | null
          tags?: string[] | null
          target_audience?: string[] | null
          title?: string
          type?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      educational_resources: {
        Row: {
          allowed_axes: string[] | null
          allowed_roles: string[] | null
          audience: string | null
          axis_permissions: Json | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          published_at: string | null
          resource_type: string | null
          role_permissions: Json | null
          status: string | null
          summary: string | null
          title: string
          updated_at: string | null
          url: string | null
          visibility_scope: string | null
        }
        Insert: {
          allowed_axes?: string[] | null
          allowed_roles?: string[] | null
          audience?: string | null
          axis_permissions?: Json | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          published_at?: string | null
          resource_type?: string | null
          role_permissions?: Json | null
          status?: string | null
          summary?: string | null
          title: string
          updated_at?: string | null
          url?: string | null
          visibility_scope?: string | null
        }
        Update: {
          allowed_axes?: string[] | null
          allowed_roles?: string[] | null
          audience?: string | null
          axis_permissions?: Json | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          published_at?: string | null
          resource_type?: string | null
          role_permissions?: Json | null
          status?: string | null
          summary?: string | null
          title?: string
          updated_at?: string | null
          url?: string | null
          visibility_scope?: string | null
        }
        Relationships: []
      }
      epilepsy_events: {
        Row: {
          created_at: string | null
          duration: number | null
          event_date: string | null
          event_type: string
          id: string
          medications: string[] | null
          notes: string | null
          patient_id: string | null
          severity: string
          timestamp: string | null
          triggers: string[] | null
          wearable_data: Json | null
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          event_date?: string | null
          event_type: string
          id?: string
          medications?: string[] | null
          notes?: string | null
          patient_id?: string | null
          severity: string
          timestamp?: string | null
          triggers?: string[] | null
          wearable_data?: Json | null
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          event_date?: string | null
          event_type?: string
          id?: string
          medications?: string[] | null
          notes?: string | null
          patient_id?: string | null
          severity?: string
          timestamp?: string | null
          triggers?: string[] | null
          wearable_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "epilepsy_events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "epilepsy_events_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      exam_request_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_public: boolean | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_request_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_request_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          enabled: boolean
          flag: string
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          flag: string
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          flag?: string
          updated_at?: string
        }
        Relationships: []
      }
      fechamento_consensual: {
        Row: {
          complementacoes: Json | null
          exames_solicitados: Json | null
          id: number
          observacoes: string | null
          paciente_id: string | null
          proximos_passos: string | null
          revisao_narrativa: string | null
          timestamp: string | null
        }
        Insert: {
          complementacoes?: Json | null
          exames_solicitados?: Json | null
          id?: number
          observacoes?: string | null
          paciente_id?: string | null
          proximos_passos?: string | null
          revisao_narrativa?: string | null
          timestamp?: string | null
        }
        Update: {
          complementacoes?: Json | null
          exames_solicitados?: Json | null
          id?: number
          observacoes?: string | null
          paciente_id?: string | null
          proximos_passos?: string | null
          revisao_narrativa?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fechamento_consensual_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fechamento_consensual_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_contexto_longitudinal"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "fechamento_consensual_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_interacoes_recentes"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "fechamento_consensual_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_paciente_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users_compatible"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "view_current_ranking_live"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_compatible"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_current_ranking_live"
            referencedColumns: ["user_id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          allowed_roles: string[] | null
          author_id: string
          category: string | null
          content: string
          created_at: string | null
          current_participants: number | null
          description: string | null
          id: string
          is_active: boolean | null
          is_hot: boolean | null
          is_password_protected: boolean | null
          is_pinned: boolean | null
          max_participants: number | null
          password: string | null
          post_roles: string[] | null
          replies_count: number | null
          slug: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views: number | null
          votes_down: number | null
          votes_up: number | null
        }
        Insert: {
          allowed_roles?: string[] | null
          author_id: string
          category?: string | null
          content: string
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_hot?: boolean | null
          is_password_protected?: boolean | null
          is_pinned?: boolean | null
          max_participants?: number | null
          password?: string | null
          post_roles?: string[] | null
          replies_count?: number | null
          slug?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views?: number | null
          votes_down?: number | null
          votes_up?: number | null
        }
        Update: {
          allowed_roles?: string[] | null
          author_id?: string
          category?: string | null
          content?: string
          created_at?: string | null
          current_participants?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_hot?: boolean | null
          is_password_protected?: boolean | null
          is_pinned?: boolean | null
          max_participants?: number | null
          password?: string | null
          post_roles?: string[] | null
          replies_count?: number | null
          slug?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views?: number | null
          votes_down?: number | null
          votes_up?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      forum_views: {
        Row: {
          id: string
          post_id: string
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_views_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_compatible"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_current_ranking_live"
            referencedColumns: ["user_id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string | null
          created_at: string | null
          id: string
          requester_id: string | null
          status: string | null
        }
        Insert: {
          addressee_id?: string | null
          created_at?: string | null
          id?: string
          requester_id?: string | null
          status?: string | null
        }
        Update: {
          addressee_id?: string | null
          created_at?: string | null
          id?: string
          requester_id?: string | null
          status?: string | null
        }
        Relationships: []
      }
      gamification_points: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          points: number
          source: string
          source_id: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number
          source: string
          source_id?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          points?: number
          source?: string
          source_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamification_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gamification_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      global_chat_messages: {
        Row: {
          channel: string
          created_at: string | null
          crm: string | null
          id: string
          is_online: boolean | null
          is_pinned: boolean | null
          message: string
          reactions: Json | null
          specialty: string | null
          type: string | null
          user_avatar: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          channel?: string
          created_at?: string | null
          crm?: string | null
          id?: string
          is_online?: boolean | null
          is_pinned?: boolean | null
          message: string
          reactions?: Json | null
          specialty?: string | null
          type?: string | null
          user_avatar?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          channel?: string
          created_at?: string | null
          crm?: string | null
          id?: string
          is_online?: boolean | null
          is_pinned?: boolean | null
          message?: string
          reactions?: Json | null
          specialty?: string | null
          type?: string | null
          user_avatar?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      imre_assessments: {
        Row: {
          assessment_date: string | null
          assessment_type: string
          behavioral_markers: Json | null
          clinical_notes: string | null
          cognitive_patterns: Json | null
          completion_status: string | null
          created_at: string | null
          emotional_indicators: Json | null
          id: string
          patient_id: string | null
          risk_factors: Json | null
          semantic_context: Json
          session_duration: number | null
          therapeutic_goals: Json | null
          triaxial_data: Json
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assessment_date?: string | null
          assessment_type?: string
          behavioral_markers?: Json | null
          clinical_notes?: string | null
          cognitive_patterns?: Json | null
          completion_status?: string | null
          created_at?: string | null
          emotional_indicators?: Json | null
          id?: string
          patient_id?: string | null
          risk_factors?: Json | null
          semantic_context?: Json
          session_duration?: number | null
          therapeutic_goals?: Json | null
          triaxial_data?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assessment_date?: string | null
          assessment_type?: string
          behavioral_markers?: Json | null
          clinical_notes?: string | null
          cognitive_patterns?: Json | null
          completion_status?: string | null
          created_at?: string | null
          emotional_indicators?: Json | null
          id?: string
          patient_id?: string | null
          risk_factors?: Json | null
          semantic_context?: Json
          session_duration?: number | null
          therapeutic_goals?: Json | null
          triaxial_data?: Json
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imre_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imre_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      imre_semantic_blocks: {
        Row: {
          assessment_id: string | null
          behavioral_impact: number | null
          block_number: number
          block_type: string
          cognitive_complexity: number | null
          confidence_score: number | null
          emotional_weight: number | null
          id: string
          processing_time: number | null
          semantic_content: Json
          timestamp: string | null
        }
        Insert: {
          assessment_id?: string | null
          behavioral_impact?: number | null
          block_number: number
          block_type: string
          cognitive_complexity?: number | null
          confidence_score?: number | null
          emotional_weight?: number | null
          id?: string
          processing_time?: number | null
          semantic_content: Json
          timestamp?: string | null
        }
        Update: {
          assessment_id?: string | null
          behavioral_impact?: number | null
          block_number?: number
          block_type?: string
          cognitive_complexity?: number | null
          confidence_score?: number | null
          emotional_weight?: number | null
          id?: string
          processing_time?: number | null
          semantic_content?: Json
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imre_semantic_blocks_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "imre_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imre_semantic_blocks_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "patient_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      imre_semantic_context: {
        Row: {
          assessment_id: string | null
          behavioral_trends: Json | null
          cognitive_patterns: Json | null
          context_version: number | null
          created_at: string | null
          emotional_history: Json | null
          id: string
          last_updated: string | null
          semantic_memory: Json
          user_id: string | null
        }
        Insert: {
          assessment_id?: string | null
          behavioral_trends?: Json | null
          cognitive_patterns?: Json | null
          context_version?: number | null
          created_at?: string | null
          emotional_history?: Json | null
          id?: string
          last_updated?: string | null
          semantic_memory: Json
          user_id?: string | null
        }
        Update: {
          assessment_id?: string | null
          behavioral_trends?: Json | null
          cognitive_patterns?: Json | null
          context_version?: number | null
          created_at?: string | null
          emotional_history?: Json | null
          id?: string
          last_updated?: string | null
          semantic_memory?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imre_semantic_context_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "imre_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imre_semantic_context_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "patient_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imre_semantic_context_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imre_semantic_context_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      institutional_trauma_log: {
        Row: {
          affected_domain: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          reason: string | null
          recovery_estimated_at: string | null
          restricted_mode_active: boolean | null
          severity: string | null
        }
        Insert: {
          affected_domain?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          recovery_estimated_at?: string | null
          restricted_mode_active?: boolean | null
          severity?: string | null
        }
        Update: {
          affected_domain?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          reason?: string | null
          recovery_estimated_at?: string | null
          restricted_mode_active?: boolean | null
          severity?: string | null
        }
        Relationships: []
      }
      integrative_prescription_templates: {
        Row: {
          category: string | null
          contraindications: string[] | null
          created_at: string
          created_by: string | null
          default_dosage: string | null
          default_duration: string | null
          default_frequency: string | null
          default_instructions: string | null
          description: string | null
          id: string
          indications: string[] | null
          is_active: boolean
          metadata: Json | null
          monitoring: string[] | null
          name: string
          rationality: Database["public"]["Enums"]["prescription_rationality"]
          slug: string | null
          summary: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          contraindications?: string[] | null
          created_at?: string
          created_by?: string | null
          default_dosage?: string | null
          default_duration?: string | null
          default_frequency?: string | null
          default_instructions?: string | null
          description?: string | null
          id?: string
          indications?: string[] | null
          is_active?: boolean
          metadata?: Json | null
          monitoring?: string[] | null
          name: string
          rationality: Database["public"]["Enums"]["prescription_rationality"]
          slug?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          contraindications?: string[] | null
          created_at?: string
          created_by?: string | null
          default_dosage?: string | null
          default_duration?: string | null
          default_frequency?: string | null
          default_instructions?: string | null
          description?: string | null
          id?: string
          indications?: string[] | null
          is_active?: boolean
          metadata?: Json | null
          monitoring?: string[] | null
          name?: string
          rationality?: Database["public"]["Enums"]["prescription_rationality"]
          slug?: string | null
          summary?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrative_prescription_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integrative_prescription_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      interacoes_ia: {
        Row: {
          contexto_utilizado: string | null
          data: string | null
          id: number
          paciente_id: string | null
          pergunta: string
          resposta: string
          satisfacao: number | null
          timestamp: string | null
        }
        Insert: {
          contexto_utilizado?: string | null
          data?: string | null
          id?: number
          paciente_id?: string | null
          pergunta: string
          resposta: string
          satisfacao?: number | null
          timestamp?: string | null
        }
        Update: {
          contexto_utilizado?: string | null
          data?: string | null
          id?: number
          paciente_id?: string | null
          pergunta?: string
          resposta?: string
          satisfacao?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interacoes_ia_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interacoes_ia_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_contexto_longitudinal"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "interacoes_ia_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_interacoes_recentes"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "interacoes_ia_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_paciente_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_daily_snapshots: {
        Row: {
          active_wearables_count: number | null
          avg_engagement_score: number | null
          avg_sentiment_score: number | null
          date: string
          epilepsy_episodes_today: number | null
          symptom_improvement_rate: number | null
          total_active_patients: number | null
          total_protocols_completed: number | null
          treatment_adherence_rate: number | null
          updated_at: string | null
        }
        Insert: {
          active_wearables_count?: number | null
          avg_engagement_score?: number | null
          avg_sentiment_score?: number | null
          date?: string
          epilepsy_episodes_today?: number | null
          symptom_improvement_rate?: number | null
          total_active_patients?: number | null
          total_protocols_completed?: number | null
          treatment_adherence_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          active_wearables_count?: number | null
          avg_engagement_score?: number | null
          avg_sentiment_score?: number | null
          date?: string
          epilepsy_episodes_today?: number | null
          symptom_improvement_rate?: number | null
          total_active_patients?: number | null
          total_protocols_completed?: number | null
          treatment_adherence_rate?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lesson_content: {
        Row: {
          content: string
          content_type: string | null
          created_at: string | null
          created_by: string | null
          id: string
          lesson_id: string
          module_id: string
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content?: string
          content_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          lesson_id: string
          module_id: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content?: string
          content_type?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          lesson_id?: string
          module_id?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_content_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_content_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "lesson_content_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_content_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          is_locked: boolean | null
          is_published: boolean | null
          lesson_type: string | null
          module_id: string | null
          order_index: number | null
          points: number | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_locked?: boolean | null
          is_published?: boolean | null
          lesson_type?: string | null
          module_id?: string | null
          order_index?: number | null
          points?: number | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          is_locked?: boolean | null
          is_published?: boolean | null
          lesson_type?: string | null
          module_id?: string | null
          order_index?: number | null
          points?: number | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      medcannlab_audit_logs: {
        Row: {
          action: string
          created_at: string
          endpoint: string | null
          id: number
          ip: unknown
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          endpoint?: string | null
          id?: number
          ip?: unknown
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          endpoint?: string | null
          id?: number
          ip?: unknown
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      medical_certificates: {
        Row: {
          ac_provider: string
          certificate_serial_number: string | null
          certificate_subject: string | null
          certificate_thumbprint: string | null
          certificate_type: string
          created_at: string | null
          expires_at: string
          id: string
          is_active: boolean | null
          professional_id: string
          updated_at: string | null
        }
        Insert: {
          ac_provider: string
          certificate_serial_number?: string | null
          certificate_subject?: string | null
          certificate_thumbprint?: string | null
          certificate_type: string
          created_at?: string | null
          expires_at: string
          id?: string
          is_active?: boolean | null
          professional_id: string
          updated_at?: string | null
        }
        Update: {
          ac_provider?: string
          certificate_serial_number?: string | null
          certificate_subject?: string | null
          certificate_thumbprint?: string | null
          certificate_type?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean | null
          professional_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_certificates_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_certificates_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          channel_id: string | null
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          reactions: Json | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          reactions?: Json | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          reactions?: Json | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channels"
            referencedColumns: ["id"]
          },
        ]
      }
      modelos_receituario: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          descricao: string | null
          estrutura: Json
          id: string
          nome_modelo: string
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          descricao?: string | null
          estrutura: Json
          id?: string
          nome_modelo: string
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          descricao?: string | null
          estrutura?: Json
          id?: string
          nome_modelo?: string
        }
        Relationships: []
      }
      moderator_requests: {
        Row: {
          admin_response: string | null
          created_at: string | null
          id: string
          reason: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          created_at?: string | null
          id?: string
          reason: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          created_at?: string | null
          id?: string
          reason?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      modules: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          duration: string | null
          id: string
          is_published: boolean | null
          lesson_count: number | null
          order_index: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_published?: boolean | null
          lesson_count?: number | null
          order_index?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string
          is_published?: boolean | null
          lesson_count?: number | null
          order_index?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author: string | null
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          date: string | null
          id: string
          image_url: string | null
          impact: string | null
          published: boolean | null
          read_time: string | null
          source: string | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          author?: string | null
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          id?: string
          image_url?: string | null
          impact?: string | null
          published?: boolean | null
          read_time?: string | null
          source?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          author?: string | null
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          id?: string
          image_url?: string | null
          impact?: string | null
          published?: boolean | null
          read_time?: string | null
          source?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "news_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      news_items: {
        Row: {
          author: string
          category: string
          content: string | null
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          image_url: string | null
          impact: string | null
          published: boolean | null
          read_time: string | null
          source: string | null
          summary: string
          tags: string[] | null
          title: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          author: string
          category: string
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          id?: string
          image_url?: string | null
          impact?: string | null
          published?: boolean | null
          read_time?: string | null
          source?: string | null
          summary: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          author?: string
          category?: string
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          image_url?: string | null
          impact?: string | null
          published?: boolean | null
          read_time?: string | null
          source?: string | null
          summary?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      noa_articles: {
        Row: {
          author: string | null
          content: string
          created_at: string | null
          id: string
          keywords: string[] | null
          source: string
          summary: string | null
          teaching_points: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          author?: string | null
          content: string
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          source: string
          summary?: string | null
          teaching_points?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          author?: string | null
          content?: string
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          source?: string
          summary?: string | null
          teaching_points?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "noa_articles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noa_articles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      noa_clinical_cases: {
        Row: {
          chief_complaint: string
          created_at: string | null
          diagnosis: string | null
          discussion_points: string[] | null
          findings: string | null
          history: string
          id: string
          learning_points: string[] | null
          patient_initials: string
          treatment: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          chief_complaint: string
          created_at?: string | null
          diagnosis?: string | null
          discussion_points?: string[] | null
          findings?: string | null
          history: string
          id?: string
          learning_points?: string[] | null
          patient_initials: string
          treatment?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          chief_complaint?: string
          created_at?: string | null
          diagnosis?: string | null
          discussion_points?: string[] | null
          findings?: string | null
          history?: string
          id?: string
          learning_points?: string[] | null
          patient_initials?: string
          treatment?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "noa_clinical_cases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noa_clinical_cases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      noa_interaction_logs: {
        Row: {
          cognitive_insights: Json | null
          emotional_indicators: Json | null
          error_message: string | null
          id: string
          input_data: Json | null
          interaction_type: string
          output_data: Json | null
          processing_time: number | null
          semantic_analysis: Json | null
          session_id: string | null
          success: boolean | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          cognitive_insights?: Json | null
          emotional_indicators?: Json | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          interaction_type: string
          output_data?: Json | null
          processing_time?: number | null
          semantic_analysis?: Json | null
          session_id?: string | null
          success?: boolean | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          cognitive_insights?: Json | null
          emotional_indicators?: Json | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          interaction_type?: string
          output_data?: Json | null
          processing_time?: number | null
          semantic_analysis?: Json | null
          session_id?: string | null
          success?: boolean | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "noa_interaction_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noa_interaction_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      noa_lessons: {
        Row: {
          content: string
          course_title: string
          created_at: string | null
          id: string
          key_concepts: string[] | null
          lesson_title: string
          module_title: string
          objectives: string[] | null
          practical_applications: string[] | null
          updated_at: string | null
        }
        Insert: {
          content: string
          course_title: string
          created_at?: string | null
          id?: string
          key_concepts?: string[] | null
          lesson_title: string
          module_title: string
          objectives?: string[] | null
          practical_applications?: string[] | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          course_title?: string
          created_at?: string | null
          id?: string
          key_concepts?: string[] | null
          lesson_title?: string
          module_title?: string
          objectives?: string[] | null
          practical_applications?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      noa_memories: {
        Row: {
          content: string
          context: Json | null
          created_at: string | null
          id: string
          keywords: string[] | null
          summary: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          context?: Json | null
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          summary?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          context?: Json | null
          created_at?: string | null
          id?: string
          keywords?: string[] | null
          summary?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "noa_memories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noa_memories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      noa_pending_actions: {
        Row: {
          candidates: Json
          context: Json
          created_at: string
          expires_at: string
          id: string
          kind: string
          status: string
          user_id: string
        }
        Insert: {
          candidates?: Json
          context?: Json
          created_at?: string
          expires_at: string
          id?: string
          kind: string
          status?: string
          user_id: string
        }
        Update: {
          candidates?: Json
          context?: Json
          created_at?: string
          expires_at?: string
          id?: string
          kind?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "noa_pending_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noa_pending_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string | null
          user_type: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id?: string | null
          user_type?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          ativo: boolean | null
          contato: string | null
          data_cadastro: string | null
          genero: string
          id: string
          idade: number
          nome: string
          ultima_atualizacao: string | null
        }
        Insert: {
          ativo?: boolean | null
          contato?: string | null
          data_cadastro?: string | null
          genero: string
          id: string
          idade: number
          nome: string
          ultima_atualizacao?: string | null
        }
        Update: {
          ativo?: boolean | null
          contato?: string | null
          data_cadastro?: string | null
          genero?: string
          id?: string
          idade?: number
          nome?: string
          ultima_atualizacao?: string | null
        }
        Relationships: []
      }
      patient_conditions: {
        Row: {
          condition_name: string
          created_at: string
          created_by: string | null
          diagnosed_at: string | null
          icd_code: string | null
          id: string
          notes: string | null
          patient_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          condition_name: string
          created_at?: string
          created_by?: string | null
          diagnosed_at?: string | null
          icd_code?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          condition_name?: string
          created_at?: string
          created_by?: string | null
          diagnosed_at?: string | null
          icd_code?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_conditions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_conditions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "patient_conditions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_conditions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      patient_exam_requests: {
        Row: {
          content: string
          created_at: string | null
          id: string
          patient_id: string
          professional_id: string
          signature_token: string | null
          signed_at: string | null
          signed_pdf_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          patient_id: string
          professional_id: string
          signature_token?: string | null
          signed_at?: string | null
          signed_pdf_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          patient_id?: string
          professional_id?: string
          signature_token?: string | null
          signed_at?: string | null
          signed_pdf_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_exam_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_exam_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users_compatible"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_exam_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "view_current_ranking_live"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "patient_exam_requests_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_exam_requests_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      patient_insights: {
        Row: {
          created_at: string | null
          data: Json | null
          description: string
          generated_at: string | null
          id: string
          insight_type: string
          is_archived: boolean | null
          is_read: boolean | null
          patient_id: string
          priority: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          description: string
          generated_at?: string | null
          id?: string
          insight_type: string
          is_archived?: boolean | null
          is_read?: boolean | null
          patient_id: string
          priority?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          description?: string
          generated_at?: string | null
          id?: string
          insight_type?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          patient_id?: string
          priority?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_insights_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_insights_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      patient_lab_results: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_abnormal: boolean | null
          measured_at: string
          notes: string | null
          patient_id: string
          reference_range_max: number | null
          reference_range_min: number | null
          test_type: Database["public"]["Enums"]["lab_test_type"]
          unit: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_abnormal?: boolean | null
          measured_at?: string
          notes?: string | null
          patient_id: string
          reference_range_max?: number | null
          reference_range_min?: number | null
          test_type: Database["public"]["Enums"]["lab_test_type"]
          unit: string
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_abnormal?: boolean | null
          measured_at?: string
          notes?: string | null
          patient_id?: string
          reference_range_max?: number | null
          reference_range_min?: number | null
          test_type?: Database["public"]["Enums"]["lab_test_type"]
          unit?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "patient_lab_results_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_lab_results_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "patient_lab_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_lab_results_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      patient_medical_records: {
        Row: {
          created_at: string | null
          id: string
          nft_token_id: string | null
          patient_id: string | null
          record_data: Json
          record_type: string
          report_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nft_token_id?: string | null
          patient_id?: string | null
          record_data: Json
          record_type?: string
          report_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nft_token_id?: string | null
          patient_id?: string | null
          record_data?: Json
          record_type?: string
          report_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "patient_medical_records_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "clinical_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_medical_records_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "v_clinical_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_medical_records_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "v_prescriptions_queue"
            referencedColumns: ["report_id"]
          },
        ]
      }
      patient_prescriptions: {
        Row: {
          created_at: string
          dosage: string | null
          duration: string | null
          ends_at: string | null
          frequency: string | null
          id: string
          indications: string[] | null
          instructions: string | null
          issued_at: string
          last_reviewed_at: string | null
          metadata: Json | null
          notes: string | null
          patient_id: string
          plan_id: string | null
          professional_id: string | null
          rationality:
            | Database["public"]["Enums"]["prescription_rationality"]
            | null
          starts_at: string | null
          status: Database["public"]["Enums"]["patient_prescription_status"]
          summary: string | null
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          duration?: string | null
          ends_at?: string | null
          frequency?: string | null
          id?: string
          indications?: string[] | null
          instructions?: string | null
          issued_at?: string
          last_reviewed_at?: string | null
          metadata?: Json | null
          notes?: string | null
          patient_id: string
          plan_id?: string | null
          professional_id?: string | null
          rationality?:
            | Database["public"]["Enums"]["prescription_rationality"]
            | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["patient_prescription_status"]
          summary?: string | null
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage?: string | null
          duration?: string | null
          ends_at?: string | null
          frequency?: string | null
          id?: string
          indications?: string[] | null
          instructions?: string | null
          issued_at?: string
          last_reviewed_at?: string | null
          metadata?: Json | null
          notes?: string | null
          patient_id?: string
          plan_id?: string | null
          professional_id?: string | null
          rationality?:
            | Database["public"]["Enums"]["prescription_rationality"]
            | null
          starts_at?: string | null
          status?: Database["public"]["Enums"]["patient_prescription_status"]
          summary?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "patient_prescriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "patient_therapeutic_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_prescriptions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_prescriptions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "patient_prescriptions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "integrative_prescription_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_therapeutic_plans: {
        Row: {
          completed_at: string | null
          created_at: string
          goals: Json | null
          id: string
          metadata: Json | null
          notes: string | null
          patient_id: string
          professional_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["patient_plan_status"]
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          goals?: Json | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          patient_id: string
          professional_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["patient_plan_status"]
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          goals?: Json | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          patient_id?: string
          professional_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["patient_plan_status"]
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_therapeutic_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_therapeutic_plans_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "patient_therapeutic_plans_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_therapeutic_plans_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      permissoes_compartilhamento: {
        Row: {
          consultas: boolean | null
          dados_basicos: boolean | null
          evolucao: boolean | null
          exames: boolean | null
          id: number
          medicamentos: boolean | null
          paciente_id: string | null
          pesquisa: boolean | null
          sintomas: boolean | null
          timestamp: string | null
          validade: string | null
        }
        Insert: {
          consultas?: boolean | null
          dados_basicos?: boolean | null
          evolucao?: boolean | null
          exames?: boolean | null
          id?: number
          medicamentos?: boolean | null
          paciente_id?: string | null
          pesquisa?: boolean | null
          sintomas?: boolean | null
          timestamp?: string | null
          validade?: string | null
        }
        Update: {
          consultas?: boolean | null
          dados_basicos?: boolean | null
          evolucao?: boolean | null
          exames?: boolean | null
          id?: number
          medicamentos?: boolean | null
          paciente_id?: string | null
          pesquisa?: boolean | null
          sintomas?: boolean | null
          timestamp?: string | null
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permissoes_compartilhamento_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissoes_compartilhamento_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_contexto_longitudinal"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "permissoes_compartilhamento_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_interacoes_recentes"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "permissoes_compartilhamento_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_paciente_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      pki_transactions: {
        Row: {
          ac_provider: string | null
          certificate_thumbprint: string
          created_at: string | null
          document_id: string
          id: string
          signature_value: string
          signer_cpf: string
        }
        Insert: {
          ac_provider?: string | null
          certificate_thumbprint: string
          created_at?: string | null
          document_id: string
          id?: string
          signature_value: string
          signer_cpf: string
        }
        Update: {
          ac_provider?: string | null
          certificate_thumbprint?: string
          created_at?: string | null
          document_id?: string
          id?: string
          signature_value?: string
          signer_cpf?: string
        }
        Relationships: [
          {
            foreignKeyName: "pki_transactions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "cfm_prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_params: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      portal_entries: {
        Row: {
          created_at: string
          device_id: string
          email: string | null
          id: string
          metadata: Json
          portal_slug: string
          user_type: string | null
        }
        Insert: {
          created_at?: string
          device_id: string
          email?: string | null
          id?: string
          metadata?: Json
          portal_slug: string
          user_type?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string
          email?: string | null
          id?: string
          metadata?: Json
          portal_slug?: string
          user_type?: string | null
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          created_at: string | null
          dosage: string | null
          duration: string | null
          frequency: string | null
          id: string
          medication: string
          notes: string | null
          patient_id: string | null
          professional_id: string | null
        }
        Insert: {
          created_at?: string | null
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          medication: string
          notes?: string | null
          patient_id?: string | null
          professional_id?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          medication?: string
          notes?: string | null
          patient_id?: string | null
          professional_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "prescriptions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      private_chats: {
        Row: {
          created_at: string | null
          doctor_id: string | null
          id: string
          is_active: boolean | null
          patient_id: string | null
        }
        Insert: {
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          is_active?: boolean | null
          patient_id?: string | null
        }
        Update: {
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          is_active?: boolean | null
          patient_id?: string | null
        }
        Relationships: []
      }
      private_messages: {
        Row: {
          attachments: Json | null
          chat_id: string | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string | null
          type: string | null
        }
        Insert: {
          attachments?: Json | null
          chat_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
          type?: string | null
        }
        Update: {
          attachments?: Json | null
          chat_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "private_messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "private_chats"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          professional_id: string
          slot_duration: number | null
          slot_interval_minutes: number | null
          start_time: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          professional_id: string
          slot_duration?: number | null
          slot_interval_minutes?: number | null
          start_time: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          professional_id?: string
          slot_duration?: number | null
          slot_interval_minutes?: number | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_availability_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_availability_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          id: string
          location: string | null
          name: string | null
          phone: string | null
          slug: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          location?: string | null
          name?: string | null
          phone?: string | null
          slug?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          location?: string | null
          name?: string | null
          phone?: string | null
          slug?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ranking_history: {
        Row: {
          assessments_completed: number | null
          created_at: string | null
          global_rank_position: number | null
          id: string
          percentile: number | null
          reference_month: string
          referrals_active: number | null
          tier_label: string | null
          total_points_earned: number | null
          user_id: string
        }
        Insert: {
          assessments_completed?: number | null
          created_at?: string | null
          global_rank_position?: number | null
          id?: string
          percentile?: number | null
          reference_month: string
          referrals_active?: number | null
          tier_label?: string | null
          total_points_earned?: number | null
          user_id: string
        }
        Update: {
          assessments_completed?: number | null
          created_at?: string | null
          global_rank_position?: number | null
          id?: string
          percentile?: number | null
          reference_month?: string
          referrals_active?: number | null
          tier_label?: string | null
          total_points_earned?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_compatible"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ranking_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_current_ranking_live"
            referencedColumns: ["user_id"]
          },
        ]
      }
      referral_bonus_cycles: {
        Row: {
          appointment_id: string | null
          bonus_value: number
          created_at: string | null
          cycle_number: number | null
          doctor_id: string | null
          id: string
          metadata: Json | null
          patient_id: string | null
          reference_month: string
          status: string | null
          take_rate_generated: number
        }
        Insert: {
          appointment_id?: string | null
          bonus_value: number
          created_at?: string | null
          cycle_number?: number | null
          doctor_id?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          reference_month: string
          status?: string | null
          take_rate_generated: number
        }
        Update: {
          appointment_id?: string | null
          bonus_value?: number
          created_at?: string | null
          cycle_number?: number | null
          doctor_id?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string | null
          reference_month?: string
          status?: string | null
          take_rate_generated?: number
        }
        Relationships: [
          {
            foreignKeyName: "referral_bonus_cycles_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_bonus_cycles_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_appointments_json"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_bonus_cycles_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_appointments_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_bonus_cycles_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_next_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_bonus_cycles_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_bonus_cycles_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "users_compatible"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_bonus_cycles_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "view_current_ranking_live"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referral_bonus_cycles_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_bonus_cycles_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users_compatible"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_bonus_cycles_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "view_current_ranking_live"
            referencedColumns: ["user_id"]
          },
        ]
      }
      renal_exams: {
        Row: {
          ai_interpretation: string | null
          created_at: string
          created_by: string | null
          creatinine: number | null
          drc_stage: string | null
          egfr: number | null
          exam_date: string
          id: string
          patient_id: string
          proteinuria: number | null
          urea: number | null
        }
        Insert: {
          ai_interpretation?: string | null
          created_at?: string
          created_by?: string | null
          creatinine?: number | null
          drc_stage?: string | null
          egfr?: number | null
          exam_date?: string
          id?: string
          patient_id: string
          proteinuria?: number | null
          urea?: number | null
        }
        Update: {
          ai_interpretation?: string | null
          created_at?: string
          created_by?: string | null
          creatinine?: number | null
          drc_stage?: string | null
          egfr?: number | null
          exam_date?: string
          id?: string
          patient_id?: string
          proteinuria?: number | null
          urea?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "renal_exams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renal_exams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "renal_exams_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renal_exams_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      role_catalog: {
        Row: {
          role: string
        }
        Insert: {
          role: string
        }
        Update: {
          role?: string
        }
        Relationships: []
      }
      scheduling_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          attempt_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          professional_id: string | null
          request_hash: string | null
          start_time: string | null
          status: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          attempt_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          professional_id?: string | null
          request_hash?: string | null
          start_time?: string | null
          status: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          attempt_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          professional_id?: string | null
          request_hash?: string | null
          start_time?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduling_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduling_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      semantic_analysis: {
        Row: {
          biomedical_terms: string[] | null
          chat_id: string | null
          confidence: number | null
          created_at: string | null
          emotions: string | null
          id: string
          interpretations: string | null
          topics: string[] | null
        }
        Insert: {
          biomedical_terms?: string[] | null
          chat_id?: string | null
          confidence?: number | null
          created_at?: string | null
          emotions?: string | null
          id?: string
          interpretations?: string | null
          topics?: string[] | null
        }
        Update: {
          biomedical_terms?: string[] | null
          chat_id?: string | null
          confidence?: number | null
          created_at?: string | null
          emotions?: string | null
          id?: string
          interpretations?: string | null
          topics?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "semantic_analysis_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "user_interactions"
            referencedColumns: ["id"]
          },
        ]
      }
      signature_confirmations: {
        Row: {
          confirmation_timestamp: string | null
          created_at: string | null
          document_id: string
          document_version_hash: string
          id: string
          ip_address: string | null
          professional_id: string
          user_agent: string | null
          user_confirmed_signature: boolean | null
        }
        Insert: {
          confirmation_timestamp?: string | null
          created_at?: string | null
          document_id: string
          document_version_hash: string
          id?: string
          ip_address?: string | null
          professional_id: string
          user_agent?: string | null
          user_confirmed_signature?: boolean | null
        }
        Update: {
          confirmation_timestamp?: string | null
          created_at?: string | null
          document_id?: string
          document_version_hash?: string
          id?: string
          ip_address?: string | null
          professional_id?: string
          user_agent?: string | null
          user_confirmed_signature?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "signature_confirmations_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "cfm_prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_confirmations_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_confirmations_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      smart_slot_rules: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          parameters: Json
          priority: number | null
          professional_id: string | null
          rule_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          parameters?: Json
          priority?: number | null
          professional_id?: string | null
          rule_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          parameters?: Json
          priority?: number | null
          professional_id?: string | null
          rule_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_slot_rules_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_slot_rules_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          annual_price: number | null
          consultation_discount: number
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_remote_only: boolean | null
          monthly_price: number
          name: string
          updated_at: string | null
        }
        Insert: {
          annual_price?: number | null
          consultation_discount: number
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_remote_only?: boolean | null
          monthly_price: number
          name: string
          updated_at?: string | null
        }
        Update: {
          annual_price?: number | null
          consultation_discount?: number
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_remote_only?: boolean | null
          monthly_price?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_config: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      time_blocks: {
        Row: {
          created_at: string | null
          created_by: string | null
          end_at: string
          id: string
          professional_id: string
          reason: string | null
          start_at: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          end_at: string
          id?: string
          professional_id: string
          reason?: string | null
          start_at: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          end_at?: string
          id?: string
          professional_id?: string
          reason?: string | null
          start_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_blocks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "time_blocks_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_blocks_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          appointment_id: string | null
          course_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          discount_applied: number | null
          doctor_id: string | null
          gateway_response: Json | null
          id: string
          kind: string | null
          metadata: Json | null
          payment_id: string | null
          payment_method: string | null
          points: number | null
          refund_reason: string | null
          status: string | null
          subscription_plan_id: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          course_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_applied?: number | null
          doctor_id?: string | null
          gateway_response?: Json | null
          id?: string
          kind?: string | null
          metadata?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          points?: number | null
          refund_reason?: string | null
          status?: string | null
          subscription_plan_id?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          course_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          discount_applied?: number | null
          doctor_id?: string | null
          gateway_response?: Json | null
          id?: string
          kind?: string | null
          metadata?: Json | null
          payment_id?: string | null
          payment_method?: string | null
          points?: number | null
          refund_reason?: string | null
          status?: string | null
          subscription_plan_id?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_appointments_json"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_appointments_unified"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "v_next_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trl_competency_domains: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          dimension: string | null
          id: string
          name: string
          program_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          dimension?: string | null
          id?: string
          name: string
          program_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          dimension?: string | null
          id?: string
          name?: string
          program_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trl_competency_domains_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "trl_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      trl_events: {
        Row: {
          event_payload: Json
          event_type: string
          id: string
          lesson_id: string | null
          module_id: string | null
          occurred_at: string
          portal_entry_id: string | null
          program_id: string | null
          user_id: string | null
        }
        Insert: {
          event_payload?: Json
          event_type: string
          id?: string
          lesson_id?: string | null
          module_id?: string | null
          occurred_at?: string
          portal_entry_id?: string | null
          program_id?: string | null
          user_id?: string | null
        }
        Update: {
          event_payload?: Json
          event_type?: string
          id?: string
          lesson_id?: string | null
          module_id?: string | null
          occurred_at?: string
          portal_entry_id?: string | null
          program_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trl_events_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "trl_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trl_events_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "trl_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trl_events_portal_entry_id_fkey"
            columns: ["portal_entry_id"]
            isOneToOne: false
            referencedRelation: "portal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trl_events_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "trl_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trl_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trl_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trl_learning_evidence: {
        Row: {
          created_at: string
          description: string | null
          due_offset_days: number | null
          evidence_type: string
          id: string
          module_id: string
          resources: Json
          title: string
          total_points: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_offset_days?: number | null
          evidence_type: string
          id?: string
          module_id: string
          resources?: Json
          title: string
          total_points?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          due_offset_days?: number | null
          evidence_type?: string
          id?: string
          module_id?: string
          resources?: Json
          title?: string
          total_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trl_learning_evidence_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "trl_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      trl_lessons: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          format: string
          id: string
          is_required: boolean
          live_at: string | null
          module_id: string
          order_index: number
          release_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          format: string
          id?: string
          is_required?: boolean
          live_at?: string | null
          module_id: string
          order_index?: number
          release_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          format?: string
          id?: string
          is_required?: boolean
          live_at?: string | null
          module_id?: string
          order_index?: number
          release_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trl_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "trl_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      trl_module_competencies: {
        Row: {
          competency_id: string
          module_id: string
          notes: string | null
          weight: number
        }
        Insert: {
          competency_id: string
          module_id: string
          notes?: string | null
          weight?: number
        }
        Update: {
          competency_id?: string
          module_id?: string
          notes?: string | null
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "trl_module_competencies_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "trl_competency_domains"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trl_module_competencies_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "trl_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      trl_modules: {
        Row: {
          code: string
          created_at: string
          expected_hours: number | null
          id: string
          overview: string | null
          program_id: string
          published: boolean
          sequence: number
          title: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          expected_hours?: number | null
          id?: string
          overview?: string | null
          program_id: string
          published?: boolean
          sequence?: number
          title: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          expected_hours?: number | null
          id?: string
          overview?: string | null
          program_id?: string
          published?: boolean
          sequence?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trl_modules_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "trl_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      trl_programs: {
        Row: {
          coordinator_id: string
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          coordinator_id: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          coordinator_id?: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trl_programs_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trl_programs_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      trl_reflections: {
        Row: {
          id: string
          lesson_id: string
          prompt: string
          response: string
          submitted_at: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          id?: string
          lesson_id: string
          prompt: string
          response: string
          submitted_at?: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          prompt?: string
          response?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "trl_reflections_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "trl_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trl_reflections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trl_reflections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          category: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          max_progress: number | null
          points: number | null
          progress: number | null
          rarity: string | null
          title: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          max_progress?: number | null
          points?: number | null
          progress?: number | null
          rarity?: string | null
          title: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          max_progress?: number | null
          points?: number | null
          progress?: number | null
          rarity?: string | null
          title?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          activity_data: Json | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_benefits_status: {
        Row: {
          consecutive_months_top5: number | null
          current_discount_percent: number | null
          discount_updated_at: string | null
          free_consultations_balance: number | null
          is_eligible: boolean | null
          last_consultation_grant_date: string | null
          last_month_checked: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          consecutive_months_top5?: number | null
          current_discount_percent?: number | null
          discount_updated_at?: string | null
          free_consultations_balance?: number | null
          is_eligible?: boolean | null
          last_consultation_grant_date?: string | null
          last_month_checked?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          consecutive_months_top5?: number | null
          current_discount_percent?: number | null
          discount_updated_at?: string | null
          free_consultations_balance?: number | null
          is_eligible?: boolean | null
          last_consultation_grant_date?: string | null
          last_month_checked?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_benefits_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_benefits_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users_compatible"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_benefits_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "view_current_ranking_live"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_courses: {
        Row: {
          completed_at: string | null
          completed_lessons: number | null
          course_id: string | null
          created_at: string | null
          enrolled_at: string | null
          id: string
          progress: number | null
          status: string | null
          total_lessons: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_lessons?: number | null
          course_id?: string | null
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          total_lessons?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_lessons?: number | null
          course_id?: string | null
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          progress?: number | null
          status?: string | null
          total_lessons?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_interactions: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          text_raw: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          text_raw: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          text_raw?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_mutes: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          muted_by: string | null
          reason: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          muted_by?: string | null
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          muted_by?: string | null
          reason?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          achievements: string[] | null
          avatar: string | null
          avatar_url: string | null
          badges: string[] | null
          bio: string | null
          created_at: string | null
          crm: string | null
          cro: string | null
          email: string | null
          full_name: string | null
          id: string
          last_activity: string | null
          level: number | null
          name: string | null
          nft_soulbound: string | null
          points: number | null
          role: string | null
          specialty: string | null
          total_sessions: number | null
          total_time_spent: number | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          achievements?: string[] | null
          avatar?: string | null
          avatar_url?: string | null
          badges?: string[] | null
          bio?: string | null
          created_at?: string | null
          crm?: string | null
          cro?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_activity?: string | null
          level?: number | null
          name?: string | null
          nft_soulbound?: string | null
          points?: number | null
          role?: string | null
          specialty?: string | null
          total_sessions?: number | null
          total_time_spent?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          achievements?: string[] | null
          avatar?: string | null
          avatar_url?: string | null
          badges?: string[] | null
          bio?: string | null
          created_at?: string | null
          crm?: string | null
          cro?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_activity?: string | null
          level?: number | null
          name?: string | null
          nft_soulbound?: string | null
          points?: number | null
          role?: string | null
          specialty?: string | null
          total_sessions?: number | null
          total_time_spent?: number | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_profiles_role_catalog"
            columns: ["role"]
            isOneToOne: false
            referencedRelation: "role_catalog"
            referencedColumns: ["role"]
          },
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          created_at: string | null
          experience_points: number | null
          last_activity_at: string | null
          last_login_at: string | null
          last_streak_date: string | null
          level: number | null
          streak_days: number | null
          total_appointments: number | null
          total_assessments: number | null
          total_chat_messages: number | null
          total_documents_uploaded: number | null
          total_logins: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          experience_points?: number | null
          last_activity_at?: string | null
          last_login_at?: string | null
          last_streak_date?: string | null
          level?: number | null
          streak_days?: number | null
          total_appointments?: number | null
          total_assessments?: number | null
          total_chat_messages?: number | null
          total_documents_uploaded?: number | null
          total_logins?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          experience_points?: number | null
          last_activity_at?: string | null
          last_login_at?: string | null
          last_streak_date?: string | null
          level?: number | null
          streak_days?: number | null
          total_appointments?: number | null
          total_assessments?: number | null
          total_chat_messages?: number | null
          total_documents_uploaded?: number | null
          total_logins?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_statistics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_statistics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          auto_renew: boolean | null
          created_at: string | null
          expires_at: string | null
          id: string
          next_billing_at: string | null
          payment_method_id: string | null
          plan_id: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          next_billing_at?: string | null
          payment_method_id?: string | null
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          next_billing_at?: string | null
          payment_method_id?: string | null
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          allergies: string | null
          avatar: string | null
          avatar_url: string | null
          birth_date: string | null
          blood_type: string | null
          council_number: string | null
          council_state: string | null
          council_type: string | null
          cpf: string | null
          created_at: string | null
          crm: string | null
          cro: string | null
          email: string
          flag_admin: boolean
          gender: string | null
          id: string
          invited_by: string | null
          is_official: boolean | null
          medications: string | null
          metadata: Json | null
          name: string
          nft_soulbound: string | null
          owner_id: string | null
          payment_amount: number | null
          payment_status: string | null
          phone: string | null
          referral_code: string | null
          referral_first_completed_at: string | null
          role: string | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          avatar?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          blood_type?: string | null
          council_number?: string | null
          council_state?: string | null
          council_type?: string | null
          cpf?: string | null
          created_at?: string | null
          crm?: string | null
          cro?: string | null
          email: string
          flag_admin?: boolean
          gender?: string | null
          id?: string
          invited_by?: string | null
          is_official?: boolean | null
          medications?: string | null
          metadata?: Json | null
          name: string
          nft_soulbound?: string | null
          owner_id?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          phone?: string | null
          referral_code?: string | null
          referral_first_completed_at?: string | null
          role?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string | null
          avatar?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          blood_type?: string | null
          council_number?: string | null
          council_state?: string | null
          council_type?: string | null
          cpf?: string | null
          created_at?: string | null
          crm?: string | null
          cro?: string | null
          email?: string
          flag_admin?: boolean
          gender?: string | null
          id?: string
          invited_by?: string | null
          is_official?: boolean | null
          medications?: string | null
          metadata?: Json | null
          name?: string
          nft_soulbound?: string | null
          owner_id?: string | null
          payment_amount?: number | null
          payment_status?: string | null
          phone?: string | null
          referral_code?: string | null
          referral_first_completed_at?: string | null
          role?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users_compatible"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "view_current_ranking_live"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "users_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      usuarios: {
        Row: {
          api_key: string | null
          codigo: Json | null
          id: string
          nivel: string
          nome: string
          permissoes: Json | null
          timestamp: string | null
        }
        Insert: {
          api_key?: string | null
          codigo?: Json | null
          id: string
          nivel: string
          nome: string
          permissoes?: Json | null
          timestamp?: string | null
        }
        Update: {
          api_key?: string | null
          codigo?: Json | null
          id?: string
          nivel?: string
          nome?: string
          permissoes?: Json | null
          timestamp?: string | null
        }
        Relationships: []
      }
      video_call_requests: {
        Row: {
          accepted_at: string | null
          call_type: string
          cancelled_at: string | null
          created_at: string | null
          expires_at: string
          id: string
          metadata: Json | null
          recipient_id: string
          rejected_at: string | null
          request_id: string
          requester_id: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          call_type: string
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          metadata?: Json | null
          recipient_id: string
          rejected_at?: string | null
          request_id: string
          requester_id: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          call_type?: string
          cancelled_at?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          metadata?: Json | null
          recipient_id?: string
          rejected_at?: string | null
          request_id?: string
          requester_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_call_requests_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_call_requests_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_call_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_call_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      video_call_sessions: {
        Row: {
          call_type: string
          consent_snapshot: Json | null
          created_at: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          patient_id: string | null
          professional_id: string
          session_id: string
          started_at: string
        }
        Insert: {
          call_type: string
          consent_snapshot?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          patient_id?: string | null
          professional_id: string
          session_id: string
          started_at?: string
        }
        Update: {
          call_type?: string
          consent_snapshot?: Json | null
          created_at?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          patient_id?: string | null
          professional_id?: string
          session_id?: string
          started_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_call_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_call_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_call_sessions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_call_sessions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      video_clinical_snippets: {
        Row: {
          consent_snapshot: Json
          created_at: string | null
          duration_seconds: number
          ended_at: string | null
          id: string
          patient_id: string
          professional_id: string
          purpose: string
          retention_policy: string | null
          session_id: string
          started_at: string
          storage_path: string | null
        }
        Insert: {
          consent_snapshot: Json
          created_at?: string | null
          duration_seconds: number
          ended_at?: string | null
          id?: string
          patient_id: string
          professional_id: string
          purpose?: string
          retention_policy?: string | null
          session_id: string
          started_at?: string
          storage_path?: string | null
        }
        Update: {
          consent_snapshot?: Json
          created_at?: string | null
          duration_seconds?: number
          ended_at?: string | null
          id?: string
          patient_id?: string
          professional_id?: string
          purpose?: string
          retention_policy?: string | null
          session_id?: string
          started_at?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_clinical_snippets_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_clinical_snippets_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "video_clinical_snippets_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_clinical_snippets_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      wearable_data: {
        Row: {
          created_at: string | null
          data_type: string
          device_id: string | null
          id: string
          patient_id: string | null
          timestamp: string | null
          unit: string | null
          value: number | null
        }
        Insert: {
          created_at?: string | null
          data_type: string
          device_id?: string | null
          id?: string
          patient_id?: string | null
          timestamp?: string | null
          unit?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string | null
          data_type?: string
          device_id?: string | null
          id?: string
          patient_id?: string | null
          timestamp?: string | null
          unit?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wearable_data_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "wearable_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wearable_data_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wearable_data_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      wearable_devices: {
        Row: {
          battery_level: number | null
          brand: string | null
          connection_status: string | null
          created_at: string | null
          data_types: string[] | null
          device_type: string
          id: string
          last_sync: string | null
          model: string | null
          patient_id: string | null
          updated_at: string | null
        }
        Insert: {
          battery_level?: number | null
          brand?: string | null
          connection_status?: string | null
          created_at?: string | null
          data_types?: string[] | null
          device_type: string
          id?: string
          last_sync?: string | null
          model?: string | null
          patient_id?: string | null
          updated_at?: string | null
        }
        Update: {
          battery_level?: number | null
          brand?: string | null
          connection_status?: string | null
          created_at?: string | null
          data_types?: string[] | null
          device_type?: string
          id?: string
          last_sync?: string | null
          model?: string | null
          patient_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wearable_devices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wearable_devices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      active_subscriptions: {
        Row: {
          auto_renew: boolean | null
          consultation_discount: number | null
          expires_at: string | null
          id: string | null
          is_active: boolean | null
          monthly_price: number | null
          next_billing_at: string | null
          plan_name: string | null
          started_at: string | null
          status: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      eduardo_shared_assessments: {
        Row: {
          assessment_date: string | null
          assessment_id: string | null
          clinical_notes: string | null
          completion_status: string | null
          consent_date: string | null
          consent_expiry_date: string | null
          created_at: string | null
          id: string | null
          notes: string | null
          patient_consent: boolean | null
          patient_id: string | null
          shared_at: string | null
          shared_by: string | null
          shared_with_eduardo_faveret: boolean | null
          shared_with_ricardo_valenca: boolean | null
          triaxial_data: Json | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_sharing_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "imre_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sharing_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "patient_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sharing_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sharing_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "assessment_sharing_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sharing_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      patient_assessments: {
        Row: {
          assessment_date: string | null
          assessment_type: string | null
          behavioral_markers: Json | null
          clinical_notes: string | null
          cognitive_patterns: Json | null
          completion_status: string | null
          consent_date: string | null
          consent_expiry_date: string | null
          created_at: string | null
          emotional_indicators: Json | null
          id: string | null
          patient_consent: boolean | null
          patient_id: string | null
          risk_factors: Json | null
          semantic_context: Json | null
          session_duration: number | null
          shared_with_eduardo_faveret: boolean | null
          shared_with_ricardo_valenca: boolean | null
          therapeutic_goals: Json | null
          triaxial_data: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imre_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imre_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      ricardo_shared_assessments: {
        Row: {
          assessment_date: string | null
          assessment_id: string | null
          clinical_notes: string | null
          completion_status: string | null
          consent_date: string | null
          consent_expiry_date: string | null
          created_at: string | null
          id: string | null
          notes: string | null
          patient_consent: boolean | null
          patient_id: string | null
          shared_at: string | null
          shared_by: string | null
          shared_with_eduardo_faveret: boolean | null
          shared_with_ricardo_valenca: boolean | null
          triaxial_data: Json | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_sharing_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "imre_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sharing_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "patient_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sharing_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sharing_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "assessment_sharing_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sharing_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users_compatible: {
        Row: {
          address: string | null
          allergies: string | null
          avatar_url: string | null
          birth_date: string | null
          blood_type: string | null
          cpf: string | null
          created_at: string | null
          crm: string | null
          cro: string | null
          email: string | null
          gender: string | null
          id: string | null
          medications: string | null
          name: string | null
          phone: string | null
          type: string | null
          type_original: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          blood_type?: string | null
          cpf?: string | null
          created_at?: string | null
          crm?: string | null
          cro?: string | null
          email?: string | null
          gender?: string | null
          id?: string | null
          medications?: string | null
          name?: string | null
          phone?: string | null
          type?: never
          type_original?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          allergies?: string | null
          avatar_url?: string | null
          birth_date?: string | null
          blood_type?: string | null
          cpf?: string | null
          created_at?: string | null
          crm?: string | null
          cro?: string | null
          email?: string | null
          gender?: string | null
          id?: string | null
          medications?: string | null
          name?: string | null
          phone?: string | null
          type?: never
          type_original?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      v_ai_quality_metrics: {
        Row: {
          avg_score: number | null
          common_stuck_phases: string[] | null
          completed_assessments: number | null
          completion_rate: number | null
          date: string | null
          stuck_assessments: number | null
          total_assessments: number | null
          total_score: number | null
        }
        Relationships: []
      }
      v_appointments_json: {
        Row: {
          appointment_date: string | null
          created_at: string | null
          description: string | null
          doctor_id: string | null
          duration: number | null
          id: string | null
          is_remote: boolean | null
          location: string | null
          meeting_url: string | null
          notes: string | null
          patient_id: string | null
          professional_id: string | null
          row_json: Json | null
          status: string | null
          title: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_date?: string | null
          created_at?: string | null
          description?: string | null
          doctor_id?: string | null
          duration?: number | null
          id?: string | null
          is_remote?: boolean | null
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          patient_id?: string | null
          professional_id?: string | null
          row_json?: never
          status?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string | null
          created_at?: string | null
          description?: string | null
          doctor_id?: string | null
          duration?: number | null
          id?: string | null
          is_remote?: boolean | null
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          patient_id?: string | null
          professional_id?: string | null
          row_json?: never
          status?: string | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      v_appointments_unified: {
        Row: {
          appt_at: string | null
          id: string | null
          patient_id: string | null
          professional_id: string | null
          raw: Json | null
          status_norm: string | null
        }
        Insert: {
          appt_at?: never
          id?: string | null
          patient_id?: never
          professional_id?: never
          raw?: never
          status_norm?: never
        }
        Update: {
          appt_at?: never
          id?: string | null
          patient_id?: never
          professional_id?: never
          raw?: never
          status_norm?: never
        }
        Relationships: []
      }
      v_attendance_kpis_today: {
        Row: {
          completed_today: number | null
          confirmed_today: number | null
          next_24h: number | null
          total_today: number | null
          waiting_room_today: number | null
        }
        Relationships: []
      }
      v_auth_activity: {
        Row: {
          auth_events_7d: number | null
          created_at: string | null
          email: string | null
          id: string | null
          role_hint: string | null
        }
        Insert: {
          auth_events_7d?: never
          created_at?: string | null
          email?: string | null
          id?: string | null
          role_hint?: never
        }
        Update: {
          auth_events_7d?: never
          created_at?: string | null
          email?: string | null
          id?: string | null
          role_hint?: never
        }
        Relationships: []
      }
      v_chat_inbox: {
        Row: {
          created_at: string | null
          id: string | null
          last_message_at: string | null
          name: string | null
          type: string | null
          unread_count: number | null
        }
        Relationships: []
      }
      v_chat_user_profiles: {
        Row: {
          email: string | null
          name: string | null
          user_id: string | null
        }
        Insert: {
          email?: string | null
          name?: string | null
          user_id?: string | null
        }
        Update: {
          email?: string | null
          name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_checkout_with_points: {
        Row: {
          base_price: number | null
          discount_brl: number | null
          doctor_id: string | null
          final_price: number | null
          max_discount_points: number | null
          platform_fee: number | null
          points_balance: number | null
          user_id: string | null
        }
        Relationships: []
      }
      v_clinical_reports: {
        Row: {
          assessment_id: string | null
          content: Json | null
          created_at: string | null
          doctor_id: string | null
          generated_at: string | null
          generated_by: string | null
          id: string | null
          patient_id: string | null
          patient_name: string | null
          professional_id: string | null
          professional_name: string | null
          protocol: string | null
          report_type: string | null
          shared_at: string | null
          shared_by: string | null
          shared_with: string[] | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          assessment_id?: string | null
          content?: Json | null
          created_at?: string | null
          doctor_id?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string | null
          patient_id?: string | null
          patient_name?: string | null
          professional_id?: string | null
          professional_name?: string | null
          protocol?: string | null
          report_type?: string | null
          shared_at?: string | null
          shared_by?: string | null
          shared_with?: string[] | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          assessment_id?: string | null
          content?: Json | null
          created_at?: string | null
          doctor_id?: string | null
          generated_at?: string | null
          generated_by?: string | null
          id?: string | null
          patient_id?: string | null
          patient_name?: string | null
          professional_id?: string | null
          professional_name?: string | null
          protocol?: string | null
          report_type?: string | null
          shared_at?: string | null
          shared_by?: string | null
          shared_with?: string[] | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinical_reports_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "clinical_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_reports_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_reports_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "clinical_reports_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinical_reports_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_contexto_longitudinal: {
        Row: {
          consultas_profissionais: Json | null
          evolucao_exames: Json | null
          evolucao_medicamentos: Json | null
          evolucao_sintomas: Json | null
          nome: string | null
          paciente_id: string | null
          total_interacoes: number | null
          ultima_interacao: string | null
        }
        Relationships: []
      }
      v_dashboard_advanced_kpis: {
        Row: {
          active_wearables: number | null
          engagement_rate: number | null
          sentiment_score: number | null
          symptom_improvement_rate: number | null
          total_appointments: number | null
          total_protocols_completed: number | null
          total_users: number | null
          treatment_adherence: number | null
        }
        Relationships: []
      }
      v_doctor_dashboard_kpis: {
        Row: {
          completed_today: number | null
          confirmed_today: number | null
          next_24h: number | null
          total_today: number | null
          unread_messages: number | null
          upcoming: number | null
          waiting_room_today: number | null
        }
        Relationships: []
      }
      v_interacoes_recentes: {
        Row: {
          data: string | null
          nome: string | null
          paciente_id: string | null
          pergunta: string | null
          resposta: string | null
          satisfacao: number | null
        }
        Relationships: []
      }
      v_kpi_basic: {
        Row: {
          appointments_count: number | null
          reports_count: number | null
          week: string | null
        }
        Relationships: []
      }
      v_next_appointments: {
        Row: {
          appt_at: string | null
          description: string | null
          duration: number | null
          id: string | null
          is_remote: boolean | null
          location: string | null
          meeting_url: string | null
          patient_email: string | null
          patient_id: string | null
          patient_name: string | null
          professional_id: string | null
          professional_name: string | null
          status_norm: string | null
          title: string | null
          type: string | null
        }
        Relationships: []
      }
      v_paciente_completo: {
        Row: {
          alergias_medicamentos: Json | null
          ativo: boolean | null
          consultas: boolean | null
          contato: string | null
          data_cadastro: string | null
          evolucao: boolean | null
          exames: boolean | null
          exames_solicitados: Json | null
          expectativas: string | null
          genero: string | null
          hda_caracteristicas: string | null
          hda_evolucao: string | null
          hda_inicio: string | null
          id: string | null
          idade: number | null
          identificacao: string | null
          medicamentos: boolean | null
          medicamentos_atuais: Json | null
          motivo_consulta: string | null
          nome: string | null
          proximos_passos: string | null
          queixa_principal: string | null
          queixas: Json | null
          revisao_narrativa: string | null
          sintomas: boolean | null
          ultima_atualizacao: string | null
        }
        Relationships: []
      }
      v_patient_prescriptions: {
        Row: {
          created_at: string | null
          dosage: string | null
          duration: string | null
          ends_at: string | null
          frequency: string | null
          id: string | null
          indications: string[] | null
          instructions: string | null
          issued_at: string | null
          last_reviewed_at: string | null
          metadata: Json | null
          notes: string | null
          patient_id: string | null
          plan_id: string | null
          plan_status: Database["public"]["Enums"]["patient_plan_status"] | null
          plan_title: string | null
          professional_id: string | null
          rationality:
            | Database["public"]["Enums"]["prescription_rationality"]
            | null
          starts_at: string | null
          status:
            | Database["public"]["Enums"]["patient_prescription_status"]
            | null
          summary: string | null
          template_category: string | null
          template_id: string | null
          template_name: string | null
          template_rationality:
            | Database["public"]["Enums"]["prescription_rationality"]
            | null
          template_summary: string | null
          template_tags: string[] | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "patient_prescriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "patient_therapeutic_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_prescriptions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_prescriptions_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "patient_prescriptions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "integrative_prescription_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      v_patient_renal_profile: {
        Row: {
          full_name: string | null
          latest_acr: number | null
          latest_dia_bp: number | null
          latest_gfr: number | null
          latest_potassium: number | null
          latest_sys_bp: number | null
          patient_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_prescriptions_queue: {
        Row: {
          created_at: string | null
          doctor_id: string | null
          patient_id: string | null
          recency_bucket: string | null
          report_id: string | null
        }
        Relationships: []
      }
      v_renal_monitoring_kpis: {
        Row: {
          avg_acr_global: number | null
          avg_gfr_global: number | null
          bp_control_rate: number | null
          total_patients_monitored: number | null
        }
        Relationships: []
      }
      v_renal_trend: {
        Row: {
          creatinine: number | null
          drc_stage: string | null
          egfr: number | null
          exam_date: string | null
          id: string | null
          patient_id: string | null
          status_color: string | null
        }
        Insert: {
          creatinine?: number | null
          drc_stage?: string | null
          egfr?: number | null
          exam_date?: string | null
          id?: string | null
          patient_id?: string | null
          status_color?: never
        }
        Update: {
          creatinine?: number | null
          drc_stage?: string | null
          egfr?: number | null
          exam_date?: string | null
          id?: string | null
          patient_id?: string | null
          status_color?: never
        }
        Relationships: [
          {
            foreignKeyName: "renal_exams_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_auth_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "renal_exams_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "v_user_points_balance"
            referencedColumns: ["user_id"]
          },
        ]
      }
      v_scope_patients: {
        Row: {
          doctor_id: string | null
          patient_id: string | null
        }
        Relationships: []
      }
      v_unread_messages_kpi: {
        Row: {
          unread_total: number | null
        }
        Relationships: []
      }
      v_user_points_balance: {
        Row: {
          points_balance: number | null
          user_id: string | null
        }
        Relationships: []
      }
      view_current_ranking_live: {
        Row: {
          current_points: number | null
          level: number | null
          name: string | null
          percentile_rank: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _current_role: { Args: never; Returns: string }
      _normalize_appointment_status: { Args: { raw: string }; Returns: string }
      _now_br: { Args: never; Returns: string }
      _today_br: { Args: never; Returns: string }
      admin_get_users_status: {
        Args: never
        Returns: {
          created_at: string
          email: string
          is_online: boolean
          last_sign_in_at: string
          name: string
          owner_id: string
          payment_status: string
          status: string
          type: string
          user_id: string
        }[]
      }
      book_appointment_atomic: {
        Args: {
          p_appointment_type: string
          p_notes?: string
          p_patient_id: string
          p_professional_id: string
          p_slot_time: string
        }
        Returns: string
      }
      calculate_monthly_ranking: {
        Args: { ref_date?: string }
        Returns: undefined
      }
      calculate_subscription_discount: {
        Args: { p_consultation_amount: number; p_user_id: string }
        Returns: number
      }
      check_professional_patient_link: {
        Args: { target_patient_id: string }
        Returns: boolean
      }
      checkout_with_points: {
        Args: { p_base_price: number; p_doctor_id: string; p_user_id: string }
        Returns: {
          base_price: number
          discount_brl: number
          final_price: number
          max_discount_points: number
          platform_fee: number
          points_balance: number
        }[]
      }
      cleanup_duplicate_rooms: {
        Args: never
        Returns: {
          deleted_rooms_count: number
          merged_messages_count: number
        }[]
      }
      cleanup_old_chat_messages: { Args: never; Returns: undefined }
      clinic_can_access_assessment: {
        Args: { p_assessment_id: string; p_clinic_id: string }
        Returns: boolean
      }
      count_identified_correlations: { Args: never; Returns: number }
      count_multirational_analyses: { Args: never; Returns: number }
      count_preserved_narratives: { Args: never; Returns: number }
      count_primary_data_blocks: { Args: never; Returns: number }
      create_chat_room_for_patient: {
        Args: {
          p_patient_id: string
          p_patient_name: string
          p_professional_id: string
        }
        Returns: string
      }
      create_chat_room_for_patient_jsonb: {
        Args: { p_patient_id: string; p_provider_id: string }
        Returns: Json
      }
      create_chat_room_for_patient_uuid:
        | {
            Args: {
              p_patient_id: string
              p_patient_name: string
              p_professional_id: string
            }
            Returns: string
          }
        | {
            Args: { p_patient_id: string; p_professional_id: string }
            Returns: string
          }
      create_dev_vivo_session: {
        Args: {
          p_expires_in_minutes?: number
          p_supabase_token: string
          p_user_id: string
        }
        Returns: string
      }
      create_video_call_notification: {
        Args: {
          p_message: string
          p_metadata?: Json
          p_title: string
          p_user_id: string
        }
        Returns: string
      }
      criar_paciente_completo: {
        Args: {
          p_contato: string
          p_genero: string
          p_idade: number
          p_nome: string
        }
        Returns: string
      }
      current_user_email: { Args: never; Returns: string }
      current_user_role: { Args: never; Returns: string }
      ensure_user_profile: { Args: { target_user_id: string }; Returns: string }
      expire_video_call_requests: { Args: never; Returns: undefined }
      generate_change_signature: {
        Args: { p_content: string; p_timestamp: string; p_user_id: string }
        Returns: string
      }
      generate_forum_post_slug: { Args: { title: string }; Returns: string }
      generate_iti_validation_code: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      get_ac_dss_stats:
        | {
            Args: never
            Returns: {
              active_alerts: number
              stable_patients: number
              success_rate: number
              total_analyses: number
            }[]
          }
        | {
            Args: { p_domain?: string }
            Returns: {
              active_alerts: number
              stable_patients: number
              success_rate: number
              total_analyses: number
            }[]
          }
      get_active_certificate: {
        Args: { p_professional_id: string }
        Returns: {
          ac_provider: string
          certificate_thumbprint: string
          certificate_type: string
          expires_at: string
          id: string
        }[]
      }
      get_auth_email: { Args: { u_id: string }; Returns: string }
      get_authorized_professionals: {
        Args: never
        Returns: {
          email: string
          id: string
          name: string
          type: string
        }[]
      }
      get_available_slots_v3: {
        Args: {
          p_end_date: string
          p_professional_id: string
          p_start_date: string
        }
        Returns: {
          is_available: boolean
          rule_id: string
          slot_end: string
          slot_start: string
        }[]
      }
      get_chat_participants_for_room: {
        Args: { p_room_id: string }
        Returns: {
          role: string
          user_id: string
        }[]
      }
      get_chat_user_profiles: {
        Args: { p_user_ids: string[] }
        Returns: {
          email: string
          name: string
          user_id: string
        }[]
      }
      get_current_user_email: { Args: never; Returns: string }
      get_current_user_type: { Args: never; Returns: string }
      get_high_risk_patients_summary: {
        Args: never
        Returns: {
          days_since_exam: number
          id: string
          last_exam_date: string
          name: string
          risk_level: string
        }[]
      }
      get_leaderboard: {
        Args: { limit_count?: number }
        Returns: {
          avatar_url: string
          level: number
          name: string
          points: number
          rank: number
          user_id: string
        }[]
      }
      get_my_primary_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_my_rooms: {
        Args: never
        Returns: {
          id: string
          last_message_at: string
          name: string
          type: string
          unread_count: number
        }[]
      }
      get_patient_medical_history: {
        Args: { p_patient_id: string }
        Returns: Json
      }
      get_platform_statistics: { Args: never; Returns: Json }
      get_recent_audit_logs: {
        Args: { p_limit?: number }
        Returns: {
          ai_response: string
          created_at: string
          domain: string
          incident_flag: boolean
          patient_id: string
          patient_masked: string
          risk_level: string
          user_message: string
        }[]
      }
      get_shared_reports_for_doctor: {
        Args: { p_doctor_id: string }
        Returns: {
          content: Json
          generated_at: string
          id: string
          patient_id: string
          patient_name: string
          protocol: string
          report_type: string
          shared_at: string
          status: string
        }[]
      }
      get_unread_notifications_count: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_user_statistics: { Args: { p_user_id: string }; Returns: Json }
      get_user_type_compatible: { Args: { user_type: string }; Returns: string }
      grant_benefits_rewards: {
        Args: { ref_date?: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_document_download: {
        Args: { p_id: string }
        Returns: undefined
      }
      increment_metabolism: { Args: { p_id: string }; Returns: undefined }
      increment_user_points: {
        Args: { p_points: number; p_user_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_user: { Args: { _user_id?: string }; Returns: boolean }
      is_authorized_professional:
        | { Args: never; Returns: boolean }
        | { Args: { user_email: string }; Returns: boolean }
      is_chat_room_member: {
        Args: { _room_id: string; _user_id?: string }
        Returns: boolean
      }
      is_current_user_patient: { Args: never; Returns: boolean }
      is_professional_patient_link: {
        Args: { _patient_id: string; _professional_id?: string }
        Returns: boolean
      }
      issue_medcannlab_api_key: { Args: never; Returns: string }
      json_pick_text: { Args: { j: Json; keys: string[] }; Returns: string }
      json_pick_timestamptz: {
        Args: { j: Json; keys: string[] }
        Returns: string
      }
      json_pick_uuid: { Args: { j: Json; keys: string[] }; Returns: string }
      mark_room_read: { Args: { p_room_id: string }; Returns: undefined }
      obter_contexto_ia: {
        Args: { p_paciente_id: string }
        Returns: {
          alergias_medicamentos: Json
          consultas: boolean
          evolucao: boolean
          exames: boolean
          exames_solicitados: Json
          genero: string
          habitos_alimentacao: string
          habitos_contexto_social: string
          hda_caracteristicas: string
          hda_evolucao: string
          hda_inicio: string
          idade: number
          medicamentos: boolean
          medicamentos_atuais: Json
          motivo_consulta: string
          nome: string
          proximos_passos: string
          queixa_principal: string
          queixas: Json
          revisao_narrativa: string
          sintomas: boolean
        }[]
      }
      populate_initial_forum_posts: { Args: never; Returns: undefined }
      process_monthly_closing: { Args: never; Returns: string }
      register_dev_vivo_change: {
        Args: {
          p_change_type: string
          p_file_path: string
          p_new_content: string
          p_old_content: string
          p_reason: string
          p_session_id: string
        }
        Returns: string
      }
      resolve_professional_by_slug: {
        Args: { p_slug: string }
        Returns: string
      }
      rollback_dev_vivo_change: {
        Args: { p_change_id: string; p_rollback_reason: string }
        Returns: boolean
      }
      search_patient_by_name: {
        Args: { patient_name: string }
        Returns: {
          cpf: string
          email: string
          id: string
          name: string
          phone: string
        }[]
      }
      set_platform_param: { Args: { k: string; v: Json }; Returns: undefined }
      share_assessment_with_clinics: {
        Args: {
          p_assessment_id: string
          p_expiry_days?: number
          p_patient_consent?: boolean
          p_share_with_eduardo: boolean
          p_share_with_ricardo: boolean
        }
        Returns: string
      }
      share_report_with_doctors: {
        Args: {
          p_doctor_ids: string[]
          p_patient_id: string
          p_report_id: string
        }
        Returns: Json
      }
      unlock_achievement: {
        Args: { p_achievement_id: string; p_user_id: string }
        Returns: boolean
      }
      update_semantic_kpi: {
        Args: { score_engagement: number; score_sentiment: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "profissional" | "paciente" | "aluno"
      appointment_status_enum:
        | "scheduled"
        | "confirmed"
        | "completed"
        | "canceled"
        | "no_show"
        | "rescheduled"
      currency_enum: "BRL" | "POINTS"
      lab_test_type:
        | "creatinine"
        | "gfr_ckd_epi"
        | "albumin_creatinine_ratio"
        | "potassium"
        | "systolic_bp"
        | "diastolic_bp"
      patient_plan_status: "draft" | "active" | "completed" | "archived"
      patient_prescription_status:
        | "draft"
        | "active"
        | "completed"
        | "suspended"
        | "cancelled"
      prescription_rationality:
        | "biomedical"
        | "traditional_chinese"
        | "ayurvedic"
        | "homeopathic"
        | "integrative"
      transaction_kind_enum:
        | "PAYMENT"
        | "REFUND"
        | "POINTS_EARN"
        | "POINTS_SPEND"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "profissional", "paciente", "aluno"],
      appointment_status_enum: [
        "scheduled",
        "confirmed",
        "completed",
        "canceled",
        "no_show",
        "rescheduled",
      ],
      currency_enum: ["BRL", "POINTS"],
      lab_test_type: [
        "creatinine",
        "gfr_ckd_epi",
        "albumin_creatinine_ratio",
        "potassium",
        "systolic_bp",
        "diastolic_bp",
      ],
      patient_plan_status: ["draft", "active", "completed", "archived"],
      patient_prescription_status: [
        "draft",
        "active",
        "completed",
        "suspended",
        "cancelled",
      ],
      prescription_rationality: [
        "biomedical",
        "traditional_chinese",
        "ayurvedic",
        "homeopathic",
        "integrative",
      ],
      transaction_kind_enum: [
        "PAYMENT",
        "REFUND",
        "POINTS_EARN",
        "POINTS_SPEND",
      ],
    },
  },
} as const
