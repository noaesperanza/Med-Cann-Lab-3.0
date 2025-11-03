import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import * as pdfjsLib from 'pdfjs-dist'
import { 
  BookOpen, 
  Clock,
  CheckCircle, 
  Star,
  Users,
  Award,
  FileText,
  Video,
  MessageCircle,
  User,
  Heart,
  Target,
  Stethoscope
} from 'lucide-react'

// Configurar worker do pdfjs usando CDN (mais confiável)
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

interface Module {
  id: string
  title: string
  description: string
  duration: string
  lessonCount: number
  isCompleted: boolean
  progress: number
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  type: 'video' | 'reading' | 'quiz' | 'assignment'
  duration: string
  isCompleted: boolean
  isLocked: boolean
  points: number
  liveDate?: string
  releaseDate?: string
}

interface Assignment {
  id: string
  title: string
  description: string
  dueDate: Date
  points: number
  isSubmitted: boolean
  grade?: number
  feedback?: string
}

interface CurriculumData {
  title?: string
  summary?: string
  content?: string
  keywords?: string[]
  tags?: string[]
  file_url?: string
  // Dados extraídos estruturados
  formacao?: string[]
  experiencia?: string[]
  publicacoes?: string[]
  areas?: string[]
}

const ArteEntrevistaClinica: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [showAssignments, setShowAssignments] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [curriculumData, setCurriculumData] = useState<CurriculumData | null>(null)
  const [loadingCurriculum, setLoadingCurriculum] = useState(false)

  // Função para calcular datas do curso (começa em janeiro de 2026)
  const getCourseDate = (month: number, day: number) => {
    const date = new Date(2026, month - 1, day)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
  }

  // Buscar currículo Lattes quando o modal for aberto
  useEffect(() => {
    if (showProfileModal && !curriculumData) {
      loadCurriculumData()
    }
  }, [showProfileModal])

  // Função para extrair texto de PDF
  const extractTextFromPDF = async (pdfUrlOrPath: string): Promise<string> => {
    try {
      let arrayBuffer: ArrayBuffer

      // Se for uma URL completa, usar fetch
      if (pdfUrlOrPath.startsWith('http://') || pdfUrlOrPath.startsWith('https://')) {
        try {
          const response = await fetch(pdfUrlOrPath, {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache'
            }
          })
          if (!response.ok) {
            // Se falhar com URL pública do Supabase Storage, tentar criar signed URL
            if (pdfUrlOrPath.includes('supabase.co/storage')) {
              console.warn('URL pública falhou, tentando signed URL...')
              // Extrair path do arquivo da URL
              const pathMatch = pdfUrlOrPath.match(/\/storage\/v1\/object\/[^\/]+\/(.+)$/)
              if (pathMatch) {
                const filePath = decodeURIComponent(pathMatch[1])
                const { data: signedData, error: signedError } = await supabase.storage
                  .from('documents')
                  .createSignedUrl(filePath, 3600)
                
                if (!signedError && signedData) {
                  const signedResponse = await fetch(signedData.signedUrl)
                  if (signedResponse.ok) {
                    arrayBuffer = await signedResponse.arrayBuffer()
                  } else {
                    throw new Error(`Erro ao baixar com signed URL: ${signedResponse.status}`)
                  }
                } else {
                  throw new Error(`Erro ao criar signed URL: ${JSON.stringify(signedError)}`)
                }
              } else {
                throw new Error(`Erro ao baixar PDF: ${response.status} ${response.statusText}`)
              }
            } else {
              throw new Error(`Erro ao baixar PDF: ${response.status} ${response.statusText}`)
            }
          } else {
            arrayBuffer = await response.arrayBuffer()
          }
        } catch (fetchError) {
          throw fetchError
        }
      } else {
        // Se for um path do Supabase Storage, baixar diretamente
        const { data, error } = await supabase.storage
          .from('documents')
          .download(pdfUrlOrPath)

        if (error) {
          // Tentar criar signed URL como fallback
          console.warn('Download direto falhou, tentando signed URL...', error)
          const { data: signedData, error: signedError } = await supabase.storage
            .from('documents')
            .createSignedUrl(pdfUrlOrPath, 3600)
          
          if (!signedError && signedData) {
            const signedResponse = await fetch(signedData.signedUrl)
            if (signedResponse.ok) {
              arrayBuffer = await signedResponse.arrayBuffer()
            } else {
              throw new Error(`Erro ao baixar com signed URL: ${signedResponse.status}`)
            }
          } else {
            throw new Error(`Erro ao baixar do Storage: ${JSON.stringify(error || signedError)}`)
          }
        } else if (!data) {
          throw new Error('Arquivo não encontrado no Storage')
        } else {
          arrayBuffer = await data.arrayBuffer()
        }
      }

      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error('Arquivo PDF está vazio ou inválido')
      }

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      let fullText = ''
      
      // Extrair texto de todas as páginas
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        fullText += pageText + '\n'
      }
      
      return fullText
    } catch (error) {
      console.error('Erro ao extrair texto do PDF:', error)
      throw error
    }
  }

  // Função para parsear informações do currículo Lattes REAL (sem dados mockados)
  const parseCurriculumData = (text: string): CurriculumData => {
    const formacao: string[] = []
    const experiencia: string[] = []
    const publicacoes: string[] = []
    const areas: string[] = []
    
    // Preservar estrutura original do texto para melhor parsing
    const originalText = text
    
    // Extrair formação acadêmica - buscar seções do Lattes
    const formacaoSection = originalText.match(/FORMAÇÃO\s*ACADÊMICA[\s\S]*?(?=FORMAÇÃO\s*COMPLEMENTAR|ATUAÇÃO|PRODUÇÃO|$)/i)
    if (formacaoSection) {
      const formacaoText = formacaoSection[0]
      // Buscar todas as formações (Graduação, Mestrado, Doutorado, etc.)
      const formacoes = formacaoText.split(/(?=Graduação|Mestrado|Doutorado|Especialização|Pós-Graduação|Residência|Livre-Docência)/i)
      formacoes.forEach((form, idx) => {
        if (idx > 0 && form.trim().length > 20) {
          // Limpar e formatar
          const cleaned = form.replace(/\s+/g, ' ').trim().substring(0, 300)
          if (cleaned.length > 20 && !formacao.includes(cleaned)) {
            formacao.push(cleaned)
          }
        }
      })
    }
    
    // Extrair experiência profissional - buscar seção de ATUAÇÃO PROFISSIONAL
    let experienciaSection = originalText.match(/ATUAÇÃO\s*PROFISSIONAL[\s\S]*?(?=PRODUÇÃO|PUBLICAÇÕES|ORIENTAÇÕES|$)/i)
    if (!experienciaSection) {
      // Tentar outras variações
      const expAlt = originalText.match(/EXPERIÊNCIA[\s\S]*?(?=PRODUÇÃO|PUBLICAÇÕES|ORIENTAÇÕES|$)/i)
      if (expAlt) {
        experienciaSection = expAlt
      }
    }
    
    if (experienciaSection && experienciaSection[0]) {
      const expText = experienciaSection[0]
      // Buscar todas as experiências (separadas por linhas ou períodos)
      const experiencias = expText.split(/\n\n|\n(?=[A-Z][a-z]+)/).filter(exp => exp.trim().length > 30)
      experiencias.forEach(exp => {
        const cleaned = exp.replace(/\s+/g, ' ').trim().substring(0, 250)
        if (cleaned.length > 30 && !experiencia.includes(cleaned)) {
          experiencia.push(cleaned)
        }
      })
    }
    
    // Extrair áreas de atuação - buscar seção específica ou palavras-chave
    const areasSection = originalText.match(/ÁREA\s*DE\s*ATUAÇÃO[\s\S]*?(?=\n\n|PRODUÇÃO|PUBLICAÇÕES|$)/i)
    if (areasSection) {
      const areasText = areasSection[0]
      // Extrair áreas mencionadas
      const areasMatches = areasText.match(/\b(Semiologia|Medicina|Ensino|Pesquisa|Cannabis|Epilepsia|Neurologia|Nefrologia|Clínica|Integrativa|Comunicação|AEC|Arte da Entrevista)\b/gi)
      if (areasMatches) {
        areas.push(...Array.from(new Set(areasMatches.map(a => a.trim()))))
      }
    }
    
    // Extrair publicações - buscar seção de PRODUÇÃO BIBLIOGRÁFICA
    const publicacoesSection = originalText.match(/PRODUÇÃO\s*BIBLIOGRÁFICA[\s\S]*?(?=ORIENTAÇÕES|FORMAÇÃO|ATUAÇÃO|$)/i)
    if (publicacoesSection) {
      const pubText = publicacoesSection[0]
      // Buscar títulos de artigos, livros, etc. (normalmente terminam com ponto)
      const publicacoesList = pubText.match(/[A-Z][^\.]{20,150}\./g)
      if (publicacoesList) {
        publicacoesList.slice(0, 5).forEach(pub => {
          const cleaned = pub.trim()
          if (cleaned.length > 30 && !publicacoes.includes(cleaned)) {
            publicacoes.push(cleaned)
          }
        })
      }
    }
    
    // Se não encontrou seções específicas, tentar extrair do texto completo de forma mais genérica
    if (formacao.length === 0 && experiencia.length === 0) {
      // Tentar extrair qualquer informação estruturada
      const lines = originalText.split('\n').filter(line => line.trim().length > 20)
      lines.forEach(line => {
        const lowerLine = line.toLowerCase()
        // Formação
        if ((lowerLine.includes('graduação') || lowerLine.includes('mestrado') || 
             lowerLine.includes('doutorado') || lowerLine.includes('especialização')) &&
            !formacao.includes(line.trim())) {
          formacao.push(line.trim().substring(0, 250))
        }
        // Experiência
        if ((lowerLine.includes('professor') || lowerLine.includes('médico') || 
             lowerLine.includes('coordenador') || lowerLine.includes('diretor')) &&
            !experiencia.includes(line.trim()) && line.trim().length > 40) {
          experiencia.push(line.trim().substring(0, 250))
        }
      })
    }
    
    return {
      content: text.substring(0, 5000), // Limitar para exibição
      formacao: formacao.length > 0 ? formacao.slice(0, 8) : undefined,
      experiencia: experiencia.length > 0 ? experiencia.slice(0, 8) : undefined,
      publicacoes: publicacoes.length > 0 ? publicacoes.slice(0, 5) : undefined,
      areas: areas.length > 0 ? areas.slice(0, 10) : undefined
    }
  }

  const loadCurriculumData = async () => {
    try {
      setLoadingCurriculum(true)
      // Buscar documento do currículo Lattes - busca mais ampla
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .or('title.ilike.%Currículo Lattes Ricardo Valença%,title.ilike.%Lattes Ricardo%,title.ilike.%Currículo Ricardo%,title.ilike.%Ricardo Valença%')
        .order('created_at', { ascending: false })
        .limit(1)

      let doc = null

      if (error) {
        console.error('Erro na busca:', error)
        // Tentar busca mais simples
        const { data: simpleData, error: simpleError } = await supabase
          .from('documents')
          .select('*')
          .ilike('title', '%Lattes%')
          .order('created_at', { ascending: false })
          .limit(1)

        if (!simpleError && simpleData && simpleData.length > 0) {
          doc = simpleData[0]
        }
      } else if (data && data.length > 0) {
        doc = data[0]
      } else {
        // Se não encontrou, tentar buscar na categoria ai-documents sem filtro de título
        const { data: aiDocs } = await supabase
          .from('documents')
          .select('*')
          .eq('category', 'ai-documents')
          .order('created_at', { ascending: false })
          .limit(10)

        if (aiDocs) {
          doc = aiDocs.find(d => 
            d.title?.toLowerCase().includes('lattes') || 
            d.title?.toLowerCase().includes('ricardo') ||
            d.title?.toLowerCase().includes('currículo')
          )
        }
      }

      if (doc) {
        let content = doc.content || ''
        
        // Verificar se o conteúdo é apenas metadata (não é conteúdo real extraído)
        const isMetadataOnly = content.includes('Documento:') && 
                               content.includes('Tipo:') && 
                               content.includes('Tamanho:')
        
        // Se for apenas metadata ou não tiver conteúdo, extrair do PDF
        if ((!content || isMetadataOnly) && doc.file_type === 'pdf') {
          try {
            console.log('📄 Extraindo conteúdo real do PDF...')
            
            let extractedContent = ''
            
            // Estratégia 1: Tentar usar file_url se existir e for válido
            if (doc.file_url && !doc.file_url.includes('Bucket not found') && !doc.file_url.includes('404')) {
              try {
                extractedContent = await extractTextFromPDF(doc.file_url)
                console.log('✅ Extraído via file_url')
              } catch (urlError) {
                console.warn('Erro ao extrair da URL, tentando buscar arquivo no Storage...', urlError)
              }
            }
            
            // Estratégia 2: Se falhou, tentar listar arquivos no Storage e encontrar pelo nome
            if (!extractedContent || extractedContent.length < 100) {
              try {
                // Listar arquivos no bucket 'documents'
                const { data: files, error: listError } = await supabase.storage
                  .from('documents')
                  .list('', {
                    limit: 100,
                    sortBy: { column: 'created_at', order: 'desc' }
                  })
                
                if (!listError && files && files.length > 0) {
                  console.log('📁 Arquivos encontrados no Storage:', files.length, 'Arquivos:', files.map(f => f.name))
                  
                  // Procurar arquivo que contenha "lattes" ou "ricardo" no nome
                  const lattesFile = files.find(file => {
                    const name = file.name.toLowerCase()
                    return name.includes('lattes') ||
                           name.includes('ricardo') ||
                           name.includes('currículo') ||
                           name.includes('curriculo') ||
                           name.includes('valença') ||
                           name.includes('valenca') ||
                           (name.includes('curriculo') && name.includes('pdf')) ||
                           (name.includes('ricardo') && name.includes('pdf'))
                  })
                  
                  if (lattesFile) {
                    console.log('📁 Arquivo encontrado no Storage:', lattesFile.name)
                    try {
                      // Primeiro tentar download direto
                      extractedContent = await extractTextFromPDF(lattesFile.name)
                      console.log('✅ Extraído via busca no Storage, tamanho:', extractedContent.length)
                      
                      // Atualizar file_url no documento usando signed URL (válida por 24 horas)
                      const { data: signedUrlData, error: signedError } = await supabase.storage
                        .from('documents')
                        .createSignedUrl(lattesFile.name, 86400) // 24 horas
                      
                      if (!signedError && signedUrlData) {
                        await supabase
                          .from('documents')
                          .update({ file_url: signedUrlData.signedUrl })
                          .eq('id', doc.id)
                        console.log('✅ URL do documento atualizada com signed URL')
                      } else {
                        console.warn('⚠️ Erro ao criar signed URL:', signedError)
                      }
                    } catch (extractError) {
                      console.error('Erro ao extrair arquivo encontrado:', extractError)
                      // Tentar criar signed URL e usar para extrair
                      try {
                        const { data: signedData } = await supabase.storage
                          .from('documents')
                          .createSignedUrl(lattesFile.name, 3600)
                        
                        if (signedData) {
                          extractedContent = await extractTextFromPDF(signedData.signedUrl)
                          console.log('✅ Extraído usando signed URL, tamanho:', extractedContent.length)
                        }
                      } catch (signedExtractError) {
                        console.error('Erro ao extrair com signed URL:', signedExtractError)
                      }
                    }
                  } else {
                    console.warn('⚠️ Arquivo Lattes não encontrado na lista. Arquivos disponíveis:', files.map(f => f.name).slice(0, 10))
                  }
                } else if (listError) {
                  console.error('Erro ao listar arquivos:', listError)
                } else {
                  console.warn('⚠️ Nenhum arquivo encontrado no Storage')
                }
              } catch (storageError) {
                console.error('Erro ao buscar no Storage:', storageError)
              }
            }
            
            // Se ainda não conseguiu, tentar buscar pelo título (assumindo formato de nome)
            if (!extractedContent || extractedContent.length < 100) {
              try {
                // Listar todos os arquivos e tentar encontrar
                const { data: allFiles } = await supabase.storage
                  .from('documents')
                  .list('', { limit: 200 })
                
                if (allFiles && allFiles.length > 0) {
                  // Procurar arquivo mais similar ao título
                  const similarFile = allFiles.find(f => {
                    const fileName = f.name.toLowerCase()
                    const docTitle = doc.title.toLowerCase()
                    return fileName.includes('lattes') || 
                           fileName.includes('ricardo') ||
                           fileName.includes('curriculo') ||
                           fileName.includes('currículo') ||
                           docTitle.includes(fileName.split('.')[0]) ||
                           fileName.includes(docTitle.split('.')[0])
                  })
                  
                  if (similarFile) {
                    console.log('📁 Tentando extrair arquivo similar encontrado:', similarFile.name)
                    try {
                      // Tentar criar signed URL primeiro
                      const { data: signedData } = await supabase.storage
                        .from('documents')
                        .createSignedUrl(similarFile.name, 3600)
                      
                      if (signedData) {
                        extractedContent = await extractTextFromPDF(signedData.signedUrl)
                        console.log('✅ Extraído via arquivo similar com signed URL, tamanho:', extractedContent.length)
                      } else {
                        extractedContent = await extractTextFromPDF(similarFile.name)
                        console.log('✅ Extraído via arquivo similar, tamanho:', extractedContent.length)
                      }
                    } catch (extractError) {
                      console.error('Erro ao extrair arquivo similar:', extractError)
                    }
                  }
                }
              } catch (error) {
                console.error('Erro ao tentar buscar arquivos similares:', error)
              }
            }
            
            if (extractedContent && extractedContent.length > 100) {
              content = extractedContent
              console.log('✅ Texto extraído com sucesso!', {
                tamanho: content.length,
                preview: content.substring(0, 200),
                primeirasLinhas: content.split('\n').slice(0, 5)
              })
              
              // Parsear informações antes de salvar
              const parsedData = parseCurriculumData(content)
              console.log('📊 Dados parseados:', {
                formacao: parsedData.formacao?.length || 0,
                experiencia: parsedData.experiencia?.length || 0,
                publicacoes: parsedData.publicacoes?.length || 0,
                areas: parsedData.areas?.length || 0
              })
              
              // Atualizar documento no banco com conteúdo extraído
              const { error: updateError } = await supabase
                .from('documents')
                .update({ 
                  content: content,
                  summary: `Currículo Lattes de ${doc.author || 'Dr. Ricardo Valença'}`,
                  keywords: parsedData.areas || doc.keywords || [],
                  tags: [...(doc.tags || []), ...(parsedData.areas?.map(a => a.toLowerCase()) || [])]
                })
                .eq('id', doc.id)
              
              if (updateError) {
                console.error('Erro ao atualizar documento:', updateError)
              } else {
                console.log('✅ Documento atualizado com conteúdo extraído')
              }
            } else {
              console.warn('⚠️ Não foi possível extrair conteúdo do PDF. Conteúdo extraído:', extractedContent?.length || 0)
            }
          } catch (error) {
            console.error('Erro ao extrair PDF:', error)
          }
        }

        // Se tiver conteúdo real (não apenas metadata), parsear informações
        if (content && !isMetadataOnly && content.length > 100) {
          console.log('📄 Conteúdo disponível para parsing, tamanho:', content.length)
          const parsedData = parseCurriculumData(content)
          
          console.log('📊 Resultado do parsing:', {
            formacao: parsedData.formacao?.length || 0,
            experiencia: parsedData.experiencia?.length || 0,
            publicacoes: parsedData.publicacoes?.length || 0,
            areas: parsedData.areas?.length || 0,
            temFormacao: !!parsedData.formacao?.length,
            temExperiencia: !!parsedData.experiencia?.length,
            temPublicacoes: !!parsedData.publicacoes?.length,
            temAreas: !!parsedData.areas?.length
          })
          
          // Mesmo se não conseguiu parsear bem, mostrar o conteúdo extraído
          setCurriculumData({
            title: doc.title,
            summary: `Currículo Lattes de ${doc.author || 'Dr. Ricardo Valença'}`,
            keywords: doc.keywords || parsedData.areas || [],
            tags: doc.tags || [],
            content: content.substring(0, 10000), // Manter conteúdo completo para exibição
            ...parsedData // Incluir dados parseados (pode estar vazio)
          })
          
          console.log('✅ CurriculumData definido:', {
            title: doc.title,
            formacao: parsedData.formacao?.length || 0,
            experiencia: parsedData.experiencia?.length || 0,
            areas: parsedData.areas?.length || 0
          })
        } else {
          // Não definir dados mockados - deixar vazio ou mostrar mensagem de erro
          console.warn('⚠️ Não foi possível extrair conteúdo do PDF. Content length:', content?.length || 0, 'isMetadataOnly:', isMetadataOnly)
          setCurriculumData({
            title: doc.title,
            summary: 'Erro ao extrair conteúdo do currículo Lattes. O arquivo pode estar corrompido ou protegido.',
            content: content || ''
          })
        }
      }
    } catch (error) {
      console.error('Erro ao carregar currículo Lattes:', error)
    } finally {
      setLoadingCurriculum(false)
    }
  }

  const courseInfo = {
    title: 'Arte da Entrevista Clínica',
    instructor: 'Dr. Ricardo Valença',
    duration: '40 horas',
    students: 856,
    rating: 5.0,
    level: 'Intermediário',
    language: 'Português',
    certificate: true,
    price: 'R$ 599',
    originalPrice: 'R$ 899',
    startDate: 'Janeiro de 2026',
    schedule: 'Quartas-feiras, às 20h (ZOOM)'
  }

  const modules: Module[] = [
    {
      id: '1',
      title: 'Aspectos de Comunicação em Saúde',
      description: 'Semiose Infinita, Heterogeneidade Enunciativa e Economia Política do Significante. Como e por que registramos os relatos com as palavras do paciente',
      duration: '8h',
      lessonCount: 2,
      isCompleted: false,
      progress: 0,
      lessons: [
        {
          id: '1-1',
          title: 'Semiose Infinita, Heterogeneidade Enunciativa',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '7 de janeiro de 2026',
          releaseDate: '14 de janeiro de 2026'
        },
        {
          id: '1-2',
          title: 'Análise Crítica do Roteiro Tradicional de Anamnese',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '14 de janeiro de 2026',
          releaseDate: '21 de janeiro de 2026'
        }
      ]
    },
    {
      id: '2',
      title: 'O Método A Arte da Entrevista Clínica',
      description: 'Introdução às três etapas do exame clínico: anamnese, exame físico e análise de exames complementares',
      duration: '12h',
      lessonCount: 3,
      isCompleted: false,
      progress: 0,
      lessons: [
        {
          id: '2-1',
          title: 'Raciocínio Clínico Espiral',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '21 de janeiro de 2026',
          releaseDate: '28 de janeiro de 2026'
        },
        {
          id: '2-2',
          title: 'Planejamento de Consultas',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '28 de janeiro de 2026',
          releaseDate: '4 de fevereiro de 2026'
        },
        {
          id: '2-3',
          title: 'Anamnese Triaxial',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '4 de fevereiro de 2026',
          releaseDate: '11 de fevereiro de 2026'
        }
      ]
    },
    {
      id: '3',
      title: 'Planejamento de Consultas',
      description: 'Técnicas de planejamento de consultas de acordo com o tempo disponível e características dos pacientes',
      duration: '8h',
      lessonCount: 3,
      isCompleted: false,
      progress: 0,
      lessons: [
        {
          id: '3-1',
          title: 'Tempo de Consulta',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '11 de fevereiro de 2026',
          releaseDate: '18 de fevereiro de 2026'
        },
        {
          id: '3-2',
          title: 'Tipos de Consultas: Avaliação Inicial e Retorno',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '18 de fevereiro de 2026',
          releaseDate: '25 de fevereiro de 2026'
        },
        {
          id: '3-3',
          title: 'Características dos Pacientes',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '25 de fevereiro de 2026',
          releaseDate: '4 de março de 2026'
        }
      ]
    },
    {
      id: '4',
      title: 'Anamnese Triaxial: Aberturas Exponenciais',
      description: 'Técnicas para identificação empática e formação da lista indiciária. Desenvolvimento de perguntas exponenciais',
      duration: '10h',
      lessonCount: 3,
      isCompleted: false,
      progress: 0,
      lessons: [
        {
          id: '4-1',
          title: 'Identificação Empática',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '4 de março de 2026',
          releaseDate: '11 de março de 2026'
        },
        {
          id: '4-2',
          title: 'Lista Indiciária',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '11 de março de 2026',
          releaseDate: '18 de março de 2026'
        },
        {
          id: '4-3',
          title: 'Paletas de Aberturas e Perguntas Exponenciais',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '18 de março de 2026',
          releaseDate: '25 de março de 2026'
        }
      ]
    },
    {
      id: '5',
      title: 'Anamnese Triaxial: Desenvolvimento Indiciário e Fechamento Consensual',
      description: 'Estratégias para estimular o relato espontâneo e conduzi-lo de maneira eficiente. Revisão de hipóteses e planejamento do exame físico',
      duration: '10h',
      lessonCount: 6,
      isCompleted: false,
      progress: 0,
      lessons: [
        {
          id: '5-1',
          title: 'O Relato Espontâneo',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '25 de março de 2026',
          releaseDate: '1 de abril de 2026'
        },
        {
          id: '5-2',
          title: 'Estratégias de Estímulo do Relato Espontâneo',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '1 de abril de 2026',
          releaseDate: '8 de abril de 2026'
        },
        {
          id: '5-3',
          title: 'Paleta de Perguntas Cercadoras',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '8 de abril de 2026',
          releaseDate: '15 de abril de 2026'
        },
        {
          id: '5-4',
          title: 'Revisão Indiciária e Apresentação do Entendimento',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '15 de abril de 2026',
          releaseDate: '22 de abril de 2026'
        },
        {
          id: '5-5',
          title: 'Elaboração de Hipóteses Sindrômicas Indiciárias',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '22 de abril de 2026',
          releaseDate: '29 de abril de 2026'
        },
        {
          id: '5-6',
          title: 'Planejamento do Exame Físico',
          type: 'video',
          duration: '90min',
          isCompleted: false,
          isLocked: false,
          points: 90,
          liveDate: '29 de abril de 2026',
          releaseDate: '6 de maio de 2026'
        }
      ]
    }
  ]

  const assignments: Assignment[] = [
    {
      id: '1',
      title: 'Simulação de Entrevista Clínica Completa',
      description: 'Realize uma entrevista clínica completa utilizando a metodologia AEC',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      points: 150,
      isSubmitted: false
    },
    {
      id: '2',
      title: 'Análise de Caso Clínico com Anamnese Triaxial',
      description: 'Analise um caso clínico aplicando a metodologia de Anamnese Triaxial',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      points: 200,
      isSubmitted: false
    },
    {
      id: '3',
      title: 'Desenvolvimento de Hipóteses Sindrômicas',
      description: 'Desenvolva hipóteses sindrômicas indiciárias a partir de um caso clínico',
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      points: 150,
      isSubmitted: false
    }
  ]

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />
      case 'reading':
        return <FileText className="w-4 h-4" />
      case 'quiz':
        return <Award className="w-4 h-4" />
      case 'assignment':
        return <Award className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const getLessonColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'text-blue-600'
      case 'reading':
        return 'text-green-600'
      case 'quiz':
        return 'text-purple-600'
      case 'assignment':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const totalProgress = modules.reduce((acc, module) => acc + module.progress, 0) / modules.length

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="bg-slate-800 rounded-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <div className="flex items-center space-x-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm rounded-full">
                  {courseInfo.level}
                </span>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm rounded-full">
                  Certificado
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                {courseInfo.title}
          </h1>
              <p className="text-gray-300 mb-6">
                Curso cuidadosamente elaborado pelo Dr. Ricardo Valença, médico e professor de semiologia médica, 
                para aprimorar habilidades de comunicação e entrevista clínica, fundamentais para uma prática médica 
                eficaz e humanizada. Destinado a estudantes de medicina e médicos recém-formados.
              </p>
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-200">
                  <strong>Início:</strong> {courseInfo.startDate} • <strong>Horário:</strong> {courseInfo.schedule}
                </p>
                <p className="text-xs text-blue-300 mt-2">
                  Cada módulo é composto por duas aulas teóricas e duas sessões práticas, com demonstrações do que pode ser desenvolvido nas mentorias do LABPEC.
                </p>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{courseInfo.instructor}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{courseInfo.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{courseInfo.students} alunos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{courseInfo.rating}</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/3">
              <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Progresso do Curso
                </h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Progresso Geral</span>
                    <span>{Math.round(totalProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${totalProgress}%` }}
            />
          </div>
                </div>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Módulos Concluídos:</span>
                    <span>{modules.filter(m => m.isCompleted).length}/{modules.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pontos Ganhos:</span>
                    <span>380</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certificado:</span>
                    <span className="text-green-400">Disponível</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Modules List */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Módulos do Curso
                </h2>
                <button
                  onClick={() => setShowAssignments(!showAssignments)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm transition-colors"
                >
                  {showAssignments ? 'Ver Módulos' : 'Ver Atividades'}
                </button>
              </div>

              {!showAssignments ? (
                <div className="space-y-4">
                  {modules.map((module) => (
                    <div
                      key={module.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors duration-200 ${
                        activeModule === module.id
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                      onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">
                          {module.title}
              </h3>
                        <div className="flex items-center space-x-2">
                          {module.isCompleted && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          <span className="text-sm text-gray-400">
                            {module.duration}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        {module.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{module.lessonCount} aulas</span>
                          <span>{module.lessons.filter(l => l.isCompleted).length} concluídas</span>
                        </div>
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${module.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Module Lessons */}
                      {activeModule === module.id && (
                        <div className="mt-4 pt-4 border-t border-slate-700">
                          <div className="space-y-2">
                            {module.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className={`flex items-center justify-between p-3 rounded-lg ${
                                  lesson.isCompleted
                                    ? 'bg-green-900/20'
                                    : lesson.isLocked
                                    ? 'bg-slate-700 opacity-60'
                                    : 'bg-slate-700 hover:bg-slate-600'
                                }`}
                              >
                                <div className="flex items-center space-x-3 flex-1">
                                  <div className={getLessonColor(lesson.type)}>
                                    {getLessonIcon(lesson.type)}
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium text-white">
                                      {lesson.title}
                                    </h4>
                                    <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                                      <span>{lesson.duration} • {lesson.points} pontos</span>
                                      {lesson.liveDate && (
                                        <span className="text-blue-400">
                                          Ao vivo: {lesson.liveDate}
                                        </span>
                                      )}
                                      {lesson.releaseDate && (
                                        <span className="text-green-400">
                                          Liberação: {lesson.releaseDate}
                                        </span>
                                      )}
                      </div>
                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {lesson.isCompleted && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  )}
                                  {lesson.isLocked && (
                                    <span className="text-xs text-gray-400">Bloqueado</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Atividades e Atribuições
                  </h3>
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="p-4 border border-slate-700 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-white">
                          {assignment.title}
                        </h4>
                        <span className="text-sm text-gray-400">
                          {assignment.points} pontos
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        {assignment.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>Prazo: {formatDate(assignment.dueDate)}</span>
                          <span className={assignment.isSubmitted ? 'text-green-400' : 'text-orange-400'}>
                            {assignment.isSubmitted ? 'Entregue' : 'Pendente'}
                          </span>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors">
                          {assignment.isSubmitted ? 'Ver Feedback' : 'Entregar'}
                  </button>
                      </div>
                    </div>
                ))}
              </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Stats */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Estatísticas
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Tempo Estudado:</span>
                  <span className="text-sm font-medium text-white">12h 45min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Aulas Concluídas:</span>
                  <span className="text-sm font-medium text-white">0/17</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Pontos Ganhos:</span>
                  <span className="text-sm font-medium text-white">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-300">Ranking:</span>
                  <span className="text-sm font-medium text-white">#--</span>
                </div>
              </div>
                </div>
                
            {/* Resources */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recursos
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-slate-700 rounded-lg transition-colors duration-200">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-white">Material Didático</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-slate-700 rounded-lg transition-colors duration-200">
                  <Video className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-white">Aulas Gravadas</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-slate-700 rounded-lg transition-colors duration-200">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-white">Canal do Telegram</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-slate-700 rounded-lg transition-colors duration-200">
                  <Award className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-white">Certificado</span>
                </button>
              </div>
              </div>

            {/* Instructor */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Instrutor
                </h3>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-white">
                    {courseInfo.instructor}
                  </h4>
                  <p className="text-sm text-gray-300">
                    Médico e Professor de Semiologia
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Criador da metodologia Arte da Entrevista Clínica (AEC), especialista em 
                comunicação empática e entrevista clínica humanizada.
              </p>
              <button 
                onClick={() => setShowProfileModal(true)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm transition-colors"
              >
                Ver Perfil
              </button>
            </div>

            {/* Informações Adicionais */}
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Informações Importantes
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <p>
                  <strong className="text-white">Aulas ao vivo:</strong> Quartas-feiras, às 20h via ZOOM
                </p>
                <p>
                  <strong className="text-white">Suporte:</strong> artedaentrevista@gmail.com
                </p>
                <p>
                  <strong className="text-white">Recomendação:</strong> Leia o texto "O que se diz do que se vê" disponível na aula 1
                </p>
                        </div>
                      </div>
                    </div>
                </div>
              </div>

      {/* Modal de Perfil do Dr. Ricardo Valença */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Dr. Ricardo Valença</h2>
                  <p className="text-blue-400 font-medium">Médico e Professor de Semiologia</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {loadingCurriculum ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-400">Carregando informações do currículo...</span>
                </div>
              ) : (
                <>
                  {/* Formação */}
                      <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-400" />
                      Formação e Credenciais
                    </h3>
                    <div className="bg-slate-700 rounded-lg p-4 space-y-2 text-sm text-gray-300">
                      {curriculumData?.formacao && curriculumData.formacao.length > 0 ? (
                        <div className="space-y-3">
                          {curriculumData.formacao.map((formacao, idx) => (
                            <div key={idx} className="pb-2 border-b border-slate-600 last:border-b-0">
                              <p className="text-sm leading-relaxed text-gray-300">{formacao}</p>
                      </div>
                          ))}
                        </div>
                      ) : curriculumData?.content && curriculumData.content.length > 100 && !curriculumData.content.includes('Documento:') ? (
                        <div className="space-y-2">
                          <p className="text-xs text-slate-400 mb-2">Conteúdo extraído do currículo:</p>
                          <p className="text-xs leading-relaxed text-gray-300 whitespace-pre-line">
                            {curriculumData.content.substring(0, 1000)}
                            {curriculumData.content.length > 1000 && '...'}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            {curriculumData.content.length > 1000 ? `(${Math.floor(curriculumData.content.length / 1000)}k caracteres extraídos)` : ''}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-400">Extraindo informações do currículo Lattes...</p>
                          <p className="text-xs text-gray-500 mt-2">Aguarde enquanto processamos o documento</p>
                          {loadingCurriculum && (
                            <div className="mt-3 flex justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                          )}
                        </div>
                      )}
                      {curriculumData?.experiencia && curriculumData.experiencia.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-600">
                          <p className="text-sm text-slate-400 mb-3 font-semibold">Experiência Profissional:</p>
                          <div className="space-y-3">
                            {curriculumData.experiencia.map((exp, idx) => (
                              <div key={idx} className="pb-2 border-b border-slate-600 last:border-b-0">
                                <p className="text-sm leading-relaxed text-gray-300">{exp}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                      </div>
                    </>
                  )}
                  
              {/* Especialização */}
                      <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  Especialização
                </h3>
                <div className="bg-slate-700 rounded-lg p-4 space-y-3 text-sm text-gray-300">
                  {curriculumData?.areas && curriculumData.areas.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400 mb-3 font-semibold">Áreas de Atuação:</p>
                      <div className="flex flex-wrap gap-2">
                        {curriculumData.areas.map((area, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded text-sm">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : curriculumData?.keywords && curriculumData.keywords.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-400 mb-3 font-semibold">Palavras-chave:</p>
                      <div className="flex flex-wrap gap-2">
                        {curriculumData.keywords.slice(0, 10).map((keyword, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded text-sm">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-400">Extraindo áreas de atuação do currículo...</p>
                      {loadingCurriculum && (
                        <div className="mt-3 flex justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Metodologia AEC - Removido dados mockados. Será preenchido apenas com dados reais do currículo Lattes */}
              {curriculumData?.experiencia && curriculumData.experiencia.some(exp => 
                exp.toLowerCase().includes('aec') || 
                exp.toLowerCase().includes('entrevista clínica') ||
                exp.toLowerCase().includes('metodologia')
              ) && (
                      <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Metodologia Arte da Entrevista Clínica (AEC)
                  </h3>
                  <div className="bg-slate-700 rounded-lg p-4 space-y-2 text-sm text-gray-300">
                    {curriculumData.experiencia
                      .filter(exp => 
                        exp.toLowerCase().includes('aec') || 
                        exp.toLowerCase().includes('entrevista clínica') ||
                        exp.toLowerCase().includes('metodologia') ||
                        exp.toLowerCase().includes('anamnese')
                      )
                      .map((exp, idx) => (
                        <p key={idx} className="text-sm">• {exp.substring(0, 200)}</p>
                      ))}
                      </div>
                </div>
              )}

              {/* Contribuições */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  Contribuições e Realizações
                </h3>
                <div className="bg-slate-700 rounded-lg p-4 space-y-2 text-sm text-gray-300">
                  {curriculumData?.publicacoes && curriculumData.publicacoes.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-400 mb-3 font-semibold">Publicações Relevantes:</p>
                      {curriculumData.publicacoes.map((pub, idx) => (
                        <div key={idx} className="pb-2 border-b border-slate-600 last:border-b-0">
                          <p className="text-sm leading-relaxed text-gray-300">{pub}</p>
                      </div>
                      ))}
                      </div>
                  ) : curriculumData?.content && curriculumData.content.length > 100 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-400 mb-2">Conteúdo extraído do currículo:</p>
                      <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-line">
                        {curriculumData.content.substring(0, 1000)}
                        {curriculumData.content.length > 1000 && '...'}
                      </p>
                      </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-400">Processando contribuições do currículo Lattes...</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Área de Atuação - Removido dados mockados. Será preenchido apenas com dados reais do currículo Lattes */}
              {curriculumData?.areas && curriculumData.areas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-indigo-400" />
                    Área de Atuação
                  </h3>
                  <div className="bg-slate-700 rounded-lg p-4 space-y-2 text-sm text-gray-300">
                    <div className="flex flex-wrap gap-2">
                      {curriculumData.areas.map((area, idx) => (
                        <span key={idx} className="px-3 py-1 bg-indigo-600/20 text-indigo-300 rounded text-sm">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
                <button
                onClick={() => setShowProfileModal(false)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                Fechar
                </button>
              </div>
            </div>
          </div>
      )}
    </div>
  )
}

export default ArteEntrevistaClinica
