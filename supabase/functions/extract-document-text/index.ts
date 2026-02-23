import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { document_id, process_all } = await req.json();

    // Modo 1: processar um documento específico
    // Modo 2: processar todos os documentos sem conteúdo extraído
    let documents: any[] = [];

    if (process_all) {
      const { data, error } = await supabase
        .from("documents")
        .select("id, title, file_url, file_type")
        .not("file_url", "is", null)
        .in("file_type", ["pdf", "docx", "doc", "txt"])
        .or("content.is.null,content.eq.");

      if (error) throw error;
      documents = data || [];

      // Também incluir documentos cujo content é apenas metadata (começa com "Documento:")
      const { data: metaOnly, error: metaErr } = await supabase
        .from("documents")
        .select("id, title, file_url, file_type")
        .not("file_url", "is", null)
        .in("file_type", ["pdf", "docx", "doc", "txt"])
        .like("content", "Documento:%");

      if (!metaErr && metaOnly) {
        const existingIds = new Set(documents.map((d: any) => d.id));
        for (const doc of metaOnly) {
          if (!existingIds.has(doc.id)) {
            documents.push(doc);
          }
        }
      }
    } else if (document_id) {
      const { data, error } = await supabase
        .from("documents")
        .select("id, title, file_url, file_type")
        .eq("id", document_id)
        .single();

      if (error) throw error;
      documents = data ? [data] : [];
    } else {
      return new Response(
        JSON.stringify({ error: "Informe document_id ou process_all: true" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`📄 Processando ${documents.length} documento(s)...`);

    const results: any[] = [];

    for (const doc of documents) {
      try {
        console.log(`📖 Extraindo: ${doc.title} (${doc.file_type})`);

        let fileUrl = doc.file_url;

        // Se a URL é signed e expirou, gerar nova URL pública
        if (fileUrl.includes("/object/sign/")) {
          // Extrair o path do storage
          const pathMatch = fileUrl.match(/\/object\/sign\/documents\/(.+?)(\?|$)/);
          if (pathMatch) {
            const storagePath = pathMatch[1];
            const { data: signedUrl, error: signErr } = await supabase.storage
              .from("documents")
              .createSignedUrl(storagePath, 3600); // 1 hora
            if (signErr) throw signErr;
            fileUrl = signedUrl.signedUrl;
          }
        } else if (fileUrl.includes("/object/public/")) {
          // URL pública, pode usar direto
        } else {
          // Tentar gerar signed URL a partir do nome do arquivo
          const fileName = doc.title;
          const { data: objectList } = await supabase.storage
            .from("documents")
            .list("", { search: fileName, limit: 1 });
          
          if (objectList && objectList.length > 0) {
            const { data: signedUrl } = await supabase.storage
              .from("documents")
              .createSignedUrl(objectList[0].name, 3600);
            if (signedUrl) fileUrl = signedUrl.signedUrl;
          }
        }

        // Baixar o arquivo
        const fileResponse = await fetch(fileUrl);
        if (!fileResponse.ok) {
          throw new Error(`Falha ao baixar: ${fileResponse.status}`);
        }

        const fileBuffer = await fileResponse.arrayBuffer();
        const fileBytes = new Uint8Array(fileBuffer);
        let extractedText = "";

        if (doc.file_type === "txt") {
          extractedText = new TextDecoder().decode(fileBytes);
        } else if (doc.file_type === "pdf") {
          extractedText = extractTextFromPDF(fileBytes);
        } else if (doc.file_type === "docx" || doc.file_type === "doc") {
          extractedText = await extractTextFromDOCX(fileBytes);
        }

        // Limpar e validar texto
        extractedText = extractedText.trim();

        if (extractedText.length < 20) {
          console.warn(`⚠️ Texto muito curto para ${doc.title}: ${extractedText.length} chars`);
          results.push({
            id: doc.id,
            title: doc.title,
            status: "warning",
            message: `Texto extraído muito curto (${extractedText.length} chars) - pode ser PDF escaneado/imagem`,
          });
          continue;
        }

        // Salvar no banco
        const { error: updateErr } = await supabase
          .from("documents")
          .update({ content: extractedText })
          .eq("id", doc.id);

        if (updateErr) throw updateErr;

        console.log(`✅ ${doc.title}: ${extractedText.length} chars extraídos`);
        results.push({
          id: doc.id,
          title: doc.title,
          status: "success",
          chars: extractedText.length,
        });
      } catch (docErr: any) {
        console.error(`❌ Erro em ${doc.title}:`, docErr.message);
        results.push({
          id: doc.id,
          title: doc.title,
          status: "error",
          message: docErr.message,
        });
      }
    }

    const summary = {
      total: documents.length,
      success: results.filter((r) => r.status === "success").length,
      warnings: results.filter((r) => r.status === "warning").length,
      errors: results.filter((r) => r.status === "error").length,
      results,
    };

    console.log(`📊 Resumo: ${summary.success}/${summary.total} extraídos com sucesso`);

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("❌ Erro geral:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Extrai texto de um PDF usando parsing direto dos streams de texto.
 * Abordagem leve sem dependências externas pesadas.
 */
function extractTextFromPDF(bytes: Uint8Array): string {
  const raw = new TextDecoder("latin1").decode(bytes);
  const textParts: string[] = [];

  // Método 1: Extrair texto entre BT...ET (text objects)
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;

  while ((match = btEtRegex.exec(raw)) !== null) {
    const block = match[1];

    // Extrair strings entre parênteses: Tj e TJ operators
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textParts.push(decodePDFString(tjMatch[1]));
    }

    // TJ arrays: [(string) num (string) ...]
    const tjArrayRegex = /\[([^\]]*)\]\s*TJ/gi;
    let arrMatch;
    while ((arrMatch = tjArrayRegex.exec(block)) !== null) {
      const arrContent = arrMatch[1];
      const strRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = strRegex.exec(arrContent)) !== null) {
        textParts.push(decodePDFString(strMatch[1]));
      }
    }
  }

  // Método 2: Se não achou texto via BT/ET, tentar extrair de streams decodificados
  if (textParts.length === 0) {
    // Tentar extrair qualquer texto legível do PDF
    const readableRegex = /[A-Za-zÀ-ÿ0-9\s.,;:!?()-]{20,}/g;
    let readableMatch;
    while ((readableMatch = readableRegex.exec(raw)) !== null) {
      const text = readableMatch[0].trim();
      if (text.length > 30 && !/^[0-9\s]+$/.test(text)) {
        textParts.push(text);
      }
    }
  }

  return textParts.join(" ").replace(/\s+/g, " ").trim();
}

function decodePDFString(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\\/g, "\\")
    .replace(/\\([()])/g, "$1");
}

/**
 * Extrai texto de um DOCX (ZIP contendo XML).
 */
async function extractTextFromDOCX(bytes: Uint8Array): Promise<string> {
  try {
    // DOCX é um ZIP - procurar o word/document.xml dentro dele
    const zipData = bytes;

    // Tentar stored primeiro, depois deflate
    let xmlContent = findFileInZipStored(zipData, "word/document.xml");
    if (!xmlContent) {
      xmlContent = await findFileInZipDeflate(zipData, "word/document.xml");
    }
    if (!xmlContent) {
      return "Não foi possível extrair o conteúdo do DOCX";
    }

    // Extrair texto dos tags XML <w:t>
    const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    const parts: string[] = [];
    let m;

    while ((m = textRegex.exec(xmlContent)) !== null) {
      parts.push(m[1]);
    }

    // Detectar parágrafos para adicionar quebras de linha
    let result = xmlContent;
    result = result.replace(/<\/w:p>/g, "\n");
    result = result.replace(/<[^>]+>/g, "");
    result = result.replace(/&amp;/g, "&");
    result = result.replace(/&lt;/g, "<");
    result = result.replace(/&gt;/g, ">");
    result = result.replace(/&quot;/g, '"');
    result = result.replace(/&apos;/g, "'");
    result = result.replace(/\n{3,}/g, "\n\n");

    return result.trim();
  } catch (e: any) {
    console.error("Erro ao processar DOCX:", e.message);
    return "";
  }
}

/**
 * Encontra arquivo stored (sem compressão) dentro de um ZIP.
 */
function findFileInZipStored(zipBytes: Uint8Array, targetPath: string): string | null {
  for (let i = 0; i < zipBytes.length - 30; i++) {
    if (
      zipBytes[i] === 0x50 &&
      zipBytes[i + 1] === 0x4b &&
      zipBytes[i + 2] === 0x03 &&
      zipBytes[i + 3] === 0x04
    ) {
      const compressionMethod = zipBytes[i + 8] | (zipBytes[i + 9] << 8);
      const compressedSize =
        zipBytes[i + 18] | (zipBytes[i + 19] << 8) | (zipBytes[i + 20] << 16) | (zipBytes[i + 21] << 24);
      const uncompressedSize =
        zipBytes[i + 22] | (zipBytes[i + 23] << 8) | (zipBytes[i + 24] << 16) | (zipBytes[i + 25] << 24);
      const fileNameLength = zipBytes[i + 26] | (zipBytes[i + 27] << 8);
      const extraFieldLength = zipBytes[i + 28] | (zipBytes[i + 29] << 8);
      const fileNameStart = i + 30;
      const fileName = new TextDecoder().decode(zipBytes.slice(fileNameStart, fileNameStart + fileNameLength));

      if (fileName === targetPath && compressionMethod === 0) {
        const dataStart = fileNameStart + fileNameLength + extraFieldLength;
        const size = compressedSize > 0 ? compressedSize : uncompressedSize;
        return new TextDecoder("utf-8").decode(zipBytes.slice(dataStart, dataStart + size));
      }
    }
  }
  return null;
}

/**
 * Encontra arquivo deflate (comprimido) dentro de um ZIP usando DecompressionStream.
 */
async function findFileInZipDeflate(zipBytes: Uint8Array, targetPath: string): Promise<string | null> {
  for (let i = 0; i < zipBytes.length - 30; i++) {
    if (
      zipBytes[i] === 0x50 &&
      zipBytes[i + 1] === 0x4b &&
      zipBytes[i + 2] === 0x03 &&
      zipBytes[i + 3] === 0x04
    ) {
      const compressionMethod = zipBytes[i + 8] | (zipBytes[i + 9] << 8);
      const compressedSize =
        zipBytes[i + 18] | (zipBytes[i + 19] << 8) | (zipBytes[i + 20] << 16) | (zipBytes[i + 21] << 24);
      const fileNameLength = zipBytes[i + 26] | (zipBytes[i + 27] << 8);
      const extraFieldLength = zipBytes[i + 28] | (zipBytes[i + 29] << 8);
      const fileNameStart = i + 30;
      const fileName = new TextDecoder().decode(zipBytes.slice(fileNameStart, fileNameStart + fileNameLength));

      if (fileName === targetPath && compressionMethod === 8) {
        const dataStart = fileNameStart + fileNameLength + extraFieldLength;
        const compressed = zipBytes.slice(dataStart, dataStart + compressedSize);

        try {
          const ds = new DecompressionStream("raw");
          const writer = ds.writable.getWriter();
          writer.write(compressed);
          writer.close();

          const reader = ds.readable.getReader();
          const chunks: Uint8Array[] = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
          }

          const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
          const result = new Uint8Array(totalLength);
          let offset = 0;
          for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
          }

          return new TextDecoder("utf-8").decode(result);
        } catch (e) {
          console.error("Deflate error:", e);
          return null;
        }
      }
    }
  }
  return null;
}
