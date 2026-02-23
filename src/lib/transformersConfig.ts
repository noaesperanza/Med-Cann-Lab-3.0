// Configuração para Transformers.js
import { env } from '@xenova/transformers'

// Configurar para usar modelos locais
env.allowRemoteModels = false
env.allowLocalModels = true

// Configurar cache local
env.useBrowserCache = true
env.useCustomCache = true

// Configurar para produção
env.backends.onnx.wasm.wasmPaths = '/models/'

export default env
