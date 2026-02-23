#!/bin/bash
# Script para testar CORS da Edge Function
# Uso: bash scripts/test-edge-function-cors.sh

echo "🔍 Testando CORS da Edge Function..."
echo ""

# Testar OPTIONS (preflight)
echo "1️⃣ Testando OPTIONS (preflight request)..."
curl -X OPTIONS \
  https://itdjkfubfzmvmuxxjoae.supabase.co/functions/v1/video-call-request-notification \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v \
  -w "\n\nStatus Code: %{http_code}\n"

echo ""
echo "2️⃣ Testando POST (requisição real)..."
curl -X POST \
  https://itdjkfubfzmvmuxxjoae.supabase.co/functions/v1/video-call-request-notification \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "requestId": "test-123",
    "requesterId": "17345b36-50de-4112-bf78-d7c5d9342cdb",
    "recipientId": "f62c3f62-1d7e-44f1-bec9-6f3c40ece391",
    "callType": "video",
    "metadata": {}
  }' \
  -v \
  -w "\n\nStatus Code: %{http_code}\n"

echo ""
echo "✅ Teste concluído!"
