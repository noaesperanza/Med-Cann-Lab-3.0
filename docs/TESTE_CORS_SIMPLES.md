# 🧪 TESTE CORS: Scripts de Teste Simples

**Data:** 06/02/2026

---

## 1. Teste OPTIONS (Preflight) com cURL

```bash
curl -X OPTIONS \
  https://itdjkfubfzmvmuxxjoae.supabase.co/functions/v1/video-call-request-notification \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type, authorization" \
  -i
```

**Resultado esperado:**
```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
Access-Control-Max-Age: 86400
```

---

## 2. Teste POST com cURL

```bash
curl -X POST \
  https://itdjkfubfzmvmuxxjoae.supabase.co/functions/v1/video-call-request-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "apikey: SUA_ANON_KEY_AQUI" \
  -d '{
    "requestId": "test_123",
    "requesterId": "uuid-requester",
    "recipientId": "uuid-recipient",
    "callType": "video",
    "metadata": {}
  }' \
  -i
```

**Resultado esperado:**
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
Content-Type: application/json

{"success":true,"message":"Notificação enviada com sucesso","notification_created":true}
```

---

## 3. Teste no Browser Console

```javascript
// Cole no console do navegador (na página do app)
(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    console.error('❌ Não autenticado')
    return
  }
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/video-call-request-notification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey
        },
        body: JSON.stringify({
          requestId: `test_${Date.now()}`,
          requesterId: session.user.id,
          recipientId: 'UUID_DO_DESTINATARIO',
          callType: 'video',
          metadata: {}
        }),
        mode: 'cors'
      }
    )
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Sucesso!', data)
    } else {
      const error = await response.text()
      console.error('❌ Erro:', response.status, error)
    }
  } catch (error) {
    console.error('❌ Erro de CORS:', error)
  }
})()
```

---

## 4. Verificar Variáveis de Ambiente

```bash
# Via Supabase CLI
npx supabase functions secrets list --project-ref itdjkfubfzmvmuxxjoae

# Deve mostrar:
# SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY
```

---

## 5. Verificar Logs da Edge Function

1. Dashboard → Functions → `video-call-request-notification`
2. Clicar em "Logs"
3. Verificar se há erros ou mensagens de sucesso

---

**Documento criado por:** Sistema de Testes  
**Data:** 06/02/2026
