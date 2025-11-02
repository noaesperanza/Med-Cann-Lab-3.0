# Configuração do Storage do Supabase

## Como criar os buckets necessários para o sistema de upload

### Opção 1: Usando a Interface do Supabase (Recomendado)

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto (itdjkfubfzmvmuxxjoae)
3. Vá para **Storage** no menu lateral
4. Clique em **"New bucket"**

#### Bucket 1: Avatar
- **Nome**: `avatar`
- **Public**: ✅ Sim (marcar como público)
- Clique em **"Create bucket"**
- **Políticas**: 
  - Criar política de SELECT para acesso público
  - Criar política de INSERT para usuários autenticados

#### Bucket 2: Documents
- **Nome**: `documents`
- **Public**: ❌ Não (privado)
- Clique em **"Create bucket"**
- **Políticas**:
  - Criar política de SELECT para usuários autenticados
  - Criar política de INSERT para usuários autenticados
  - Criar política de UPDATE para usuários autenticados
  - Criar política de DELETE para usuários autenticados

### Opção 2: Usando o SQL Editor

1. No Dashboard do Supabase, vá para **SQL Editor**
2. Clique em **"New query"**
3. Copie e cole o conteúdo do arquivo `create-storage-buckets.sql`
4. Clique em **"Run"**

### Políticas de Acesso (RLS)

Execute as seguintes políticas no SQL Editor:

```sql
-- Política para leitura pública do avatar
CREATE POLICY "Avatar is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatar');

-- Política para upload de avatar por usuários autenticados
CREATE POLICY "Authenticated users can upload avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatar' AND auth.role() = 'authenticated');

-- Políticas para o bucket de documentos
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
```

### Verificar se está funcionando

Após criar os buckets, você pode testar:

1. Acesse a aplicação
2. Vá para a Biblioteca
3. Clique em "Upload"
4. Selecione a categoria "Avatar IA Residente"
5. Faça upload de uma imagem
6. Verifique se o avatar é atualizado automaticamente

### Troubleshooting

Se encontrar erros:

1. Verifique se os buckets foram criados corretamente
2. Verifique as políticas de RLS (Row Level Security)
3. Verifique se o usuário está autenticado
4. Confira o console do navegador para mensagens de erro
