// Edge Function: Notificação de Solicitação de Videochamada
// Compatível com Supabase Edge Runtime (Deno)
// CORS: verify_jwt tem de ser false (config.toml ou --no-verify-jwt), senão o gateway responde 401 ao OPTIONS.
// Deploy: supabase functions deploy video-call-request-notification --no-verify-jwt

// ✅ Usar Deno.serve() — API nativa do runtime (recomendado pela documentação Supabase)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// =========================
// CORS (GLOBAL)
// =========================
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// =========================
// SERVER
// =========================
Deno.serve(async (req) => {
  // ✅ PRE-FLIGHT — primeira coisa; body 'ok' e 200 para o gateway aceitar CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    // =========================
    // ENV
    // =========================
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceKey) {
      throw new Error('Missing Supabase env vars')
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    // =========================
    // BODY
    // =========================
    const {
      requestId,
      requesterId,
      recipientId,
      callType = 'video',
      metadata = {},
    } = await req.json()

    if (!requestId || !requesterId || !recipientId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // =========================
    // USERS
    // =========================
    const { data: requester, error: reqErr } = await supabase
      .from('users')
      .select('id, name, email, phone, type')
      .eq('id', requesterId)
      .single()

    if (reqErr || !requester) throw reqErr

    const { data: recipient, error: recErr } = await supabase
      .from('users')
      .select('id, name, email, phone, type')
      .eq('id', recipientId)
      .single()

    if (recErr || !recipient) throw recErr

    const isProfessionalRequest =
      requester.type !== 'paciente' && requester.type !== 'patient'

    const callLabel = callType === 'audio' ? 'Chamada de Áudio' : 'Videochamada'

    // =========================
    // NOTIFICATION
    // =========================
    const { error: notificationError } = await supabase.from('notifications').insert({
      user_id: recipientId,
      type: 'video_call_request',
      title: isProfessionalRequest
        ? 'Profissional está chamando você'
        : 'Solicitação de Videochamada',
      message: isProfessionalRequest
        ? `${requester.name} está chamando você para uma ${callLabel.toLowerCase()}`
        : `${requester.name} solicitou uma ${callLabel.toLowerCase()}`,
      is_read: false,
      metadata: {
        request_id: requestId,
        requester_id: requesterId,
        call_type: callType,
        ...metadata,
      },
    })

    if (notificationError) {
      console.error('Erro ao criar notificação:', notificationError)
      // Não retornar erro aqui - o fallback no frontend vai criar a notificação
    }

    // =========================
    // WHATSAPP (LOG)
    // =========================
    if (recipient.phone) {
      console.log('📱 WhatsApp (mock)', {
        to: recipient.phone,
        message: `${requester.name} iniciou uma ${callLabel}`,
      })
    }

    // =========================
    // RESPONSE
    // =========================
    return new Response(
      JSON.stringify({ 
        success: true,
        notification_created: !notificationError
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    console.error('❌ Edge Function error:', err)

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
