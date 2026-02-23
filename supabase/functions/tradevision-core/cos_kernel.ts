/**
 * 🧠 COS KERNEL v1.0 - PONTO DE ENTRADA CANÔNICO
 * 
 * Este arquivo é o ponto de entrada oficial para o Cognitive Operating System.
 * Ele re-exporta todas as interfaces e classes do cos_engine.ts para manter
 * compatibilidade com imports que usam "cos_kernel.ts".
 * 
 * Orquestrado por Pedro Henrique Passos Galluf
 * Co-criado por Noa Esperanza (Dr. Ricardo Valença)
 */

// Re-exporta TUDO do engine como a API pública do kernel
export { COS, type COS_Context, type COS_Decision, type COS_Mode } from "./cos_engine.ts";
