@echo off
echo ==================================================
echo   IMPLANTACAO DO TRADEVISION CORE (NOA ESPERANCA)
echo ==================================================
echo.
echo Iniciando deploy da Edge Function com as novas regras (System Prompt Reforçado)...
echo Este processo vai atualizar a IA para parar de falar sobre assuntos aleatorios
echo e permitir testes de avaliacao por administradores.
echo.
echo Executando: npx supabase functions deploy tradevision-core --no-verify-jwt
echo.
call npx supabase functions deploy tradevision-core --no-verify-jwt
echo.
if %errorlevel% neq 0 (
    echo [ERRO] O deploy falhou. 
    echo Verifique se voce esta logado no Supabase CLI.
    echo Se nao estiver, rode: npx supabase login
    echo E depois execute este arquivo novamente.
) else (
    echo [SUCESSO] Nôa Esperança (TradeVision Core) atualizada com sucesso na nuvem!
    echo Agora a IA deve respeitar as novas regras de conduta.
)
echo.
pause
