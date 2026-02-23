// Edge Function: Lembretes Automáticos de Videochamadas
// Envia notificações 30min, 10min e 1min antes da videochamada
// Data: 06/02/2026

// ✅ Usar Deno.serve() — API nativa do runtime (recomendado pela documentação Supabase)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ReminderPayload {
  schedule_id: string
  scheduled_at: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    })
  }

  try {
    const { schedule_id, scheduled_at } = await req.json() as ReminderPayload

    if (!schedule_id || !scheduled_at) {
      return new Response(
        JSON.stringify({ error: 'schedule_id e scheduled_at são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar agendamento
    const { data: schedule, error: scheduleError } = await supabaseClient
      .from('video_call_schedules')
      .select('*, professional:professional_id(id, name, email), patient:patient_id(id, name, email)')
      .eq('id', schedule_id)
      .single()

    if (scheduleError || !schedule) {
      return new Response(
        JSON.stringify({ error: 'Agendamento não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const scheduledTime = new Date(scheduled_at)
    const now = new Date()
    const timeUntilCall = scheduledTime.getTime() - now.getTime()

    // Calcular tempos de lembretes
    const reminder30min = scheduledTime.getTime() - (30 * 60 * 1000)
    const reminder10min = scheduledTime.getTime() - (10 * 60 * 1000)
    const reminder1min = scheduledTime.getTime() - (1 * 60 * 1000)

    const reminders = [
      {
        time: reminder30min,
        minutes: 30,
        sent: schedule.reminder_sent_30min
      },
      {
        time: reminder10min,
        minutes: 10,
        sent: schedule.reminder_sent_10min
      },
      {
        time: reminder1min,
        minutes: 1,
        sent: schedule.reminder_sent_1min
      }
    ]

    // Verificar se algum lembrete deve ser enviado agora
    for (const reminder of reminders) {
      const timeUntilReminder = reminder.time - now.getTime()
      
      // Se o lembrete deve ser enviado nos próximos 5 minutos e ainda não foi enviado
      if (timeUntilReminder > 0 && timeUntilReminder <= 5 * 60 * 1000 && !reminder.sent) {
        // Criar notificações para profissional e paciente
        const notificationMessage = `Lembrete: Videochamada em ${reminder.minutes} minuto${reminder.minutes > 1 ? 's' : ''} (${new Date(scheduledTime).toLocaleString('pt-BR')})`

        // Notificação para profissional
        await supabaseClient.from('notifications').insert({
          user_id: schedule.professional_id,
          type: 'video_call_scheduled',
          title: `Lembrete: Videochamada em ${reminder.minutes} min`,
          message: notificationMessage,
          is_read: false,
          metadata: {
            schedule_id: schedule_id,
            reminder_minutes: reminder.minutes
          }
        })

        // Notificação para paciente
        await supabaseClient.from('notifications').insert({
          user_id: schedule.patient_id,
          type: 'video_call_scheduled',
          title: `Lembrete: Videochamada em ${reminder.minutes} min`,
          message: notificationMessage,
          is_read: false,
          metadata: {
            schedule_id: schedule_id,
            reminder_minutes: reminder.minutes
          }
        })

        // Marcar como enviado no agendamento
        const updateField = `reminder_sent_${reminder.minutes}min`
        await supabaseClient
          .from('video_call_schedules')
          .update({ [updateField]: true })
          .eq('id', schedule_id)

        // TODO: Enviar email/WhatsApp aqui
        // Por enquanto, apenas notificações in-app
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lembretes agendados com sucesso',
        schedule_id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Erro ao processar lembretes:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
