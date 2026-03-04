import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createClient } from "@/lib/supabase/server"

const SYSTEM_HELP = `
SISTEMA DE ANALISE DE CNPJ ALFANUMERICO

O sistema foi desenvolvido para ajudar empresas na transicao do CNPJ numerico (14 digitos) para o novo formato alfanumerico.

FUNCIONALIDADES PRINCIPAIS:
1. Analise de Repositorios - Escaneia codigo fonte buscando campos que referenciam CNPJ
2. Deteccao Automatica - Identifica validacoes, mascaras e campos de banco de dados
3. Sugestoes de Correcao - IA sugere codigo corrigido para cada ocorrencia
4. Gestao de Tarefas - Cria tarefas automaticas para desenvolvedores
5. Relatorios - Gera relatorios analiticos e sinteticos
6. Integracao Azure/GitHub - Conecta com repositorios em nuvem ou on-premise

FLUXO DE TRABALHO:
1. Admin cadastra integracao (GitHub, GitLab, Azure DevOps)
2. Admin seleciona repositorios para analise
3. Sistema clona/baixa arquivos e analisa com IA
4. Findings sao convertidos em tarefas
5. Desenvolvedores corrigem e movem tarefas no Kanban
6. Admin acompanha progresso no dashboard

CONFIGURACOES:
- Termos CNPJ: campos personalizados para buscar (cnpj, nr_inscricao, etc)
- Extensoes: tipos de arquivo para analisar (.ts, .java, .cs, etc)
- IA: provider, modelo, temperatura
`

const CODE_EXAMPLES = {
  validation: `// Validacao de CNPJ Alfanumerico (novo formato)
function validateCNPJAlphanumeric(cnpj: string): boolean {
  // Remove caracteres especiais
  const cleaned = cnpj.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  
  // Novo CNPJ alfanumerico tem 14 caracteres
  if (cleaned.length !== 14) return false
  
  // Verifica se nao e sequencia repetida
  if (/^(.)\\1+$/.test(cleaned)) return false
  
  // Calculo do primeiro digito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) {
    const char = cleaned[i]
    const value = /[0-9]/.test(char) ? parseInt(char) : char.charCodeAt(0) - 55
    sum += value * weights1[i]
  }
  let digit1 = 11 - (sum % 11)
  if (digit1 >= 10) digit1 = 0
  
  // Calculo do segundo digito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  sum = 0
  for (let i = 0; i < 13; i++) {
    const char = i < 12 ? cleaned[i] : digit1.toString()
    const value = /[0-9]/.test(char) ? parseInt(char) : char.charCodeAt(0) - 55
    sum += value * weights2[i]
  }
  let digit2 = 11 - (sum % 11)
  if (digit2 >= 10) digit2 = 0
  
  // Verifica digitos
  const expectedDigits = cleaned.slice(12)
  return expectedDigits === digit1.toString() + digit2.toString()
}`,
  
  mask: `// Mascara para CNPJ Alfanumerico
function formatCNPJAlphanumeric(value: string): string {
  const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 5) return cleaned.slice(0, 2) + '.' + cleaned.slice(2)
  if (cleaned.length <= 8) return cleaned.slice(0, 2) + '.' + cleaned.slice(2, 5) + '.' + cleaned.slice(5)
  if (cleaned.length <= 12) return cleaned.slice(0, 2) + '.' + cleaned.slice(2, 5) + '.' + cleaned.slice(5, 8) + '/' + cleaned.slice(8)
  return cleaned.slice(0, 2) + '.' + cleaned.slice(2, 5) + '.' + cleaned.slice(5, 8) + '/' + cleaned.slice(8, 12) + '-' + cleaned.slice(12, 14)
}`,
  
  database: `-- Alteracao de coluna para suportar CNPJ alfanumerico
-- PostgreSQL
ALTER TABLE clientes 
ALTER COLUMN cnpj TYPE VARCHAR(14);

-- Adicionar constraint de validacao
ALTER TABLE clientes
ADD CONSTRAINT chk_cnpj_format 
CHECK (cnpj ~ '^[A-Z0-9]{14}$');

-- Criar indice para performance
CREATE INDEX idx_clientes_cnpj ON clientes(cnpj);`
}

export async function POST(req: NextRequest) {
  try {
    const { message, clientId, context, analysisId, type, history } = await req.json()

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar contexto baseado no tipo de pergunta
    let contextData = ""
    let responseType = "text"
    
    // Buscar dados do cliente se disponivel
    if (clientId) {
      const { data: client } = await supabase
        .from("clients")
        .select("name")
        .eq("id", clientId)
        .single()
      
      if (client) {
        contextData += `\nCLIENTE: ${client.name}`
      }
      
      // Buscar estatisticas de analises (usando batch_analyses que tem total_files)
      const { data: batchAnalyses } = await supabase
        .from("batch_analyses")
        .select("id, status, total_files, total_findings")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .limit(5)
      
      if (batchAnalyses?.length) {
        const totalFindings = batchAnalyses.reduce((sum, a) => sum + (a.total_findings || 0), 0)
        const totalFiles = batchAnalyses.reduce((sum, a) => sum + (a.total_files || 0), 0)
        contextData += `\nANALISES RECENTES: ${batchAnalyses.length}`
        contextData += `\nTOTAL DE ARQUIVOS: ${totalFiles}`
        contextData += `\nTOTAL DE FINDINGS: ${totalFindings}`
      }
      
      // Buscar tarefas
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, status, priority")
        .eq("client_id", clientId)
      
      if (tasks?.length) {
        const pending = tasks.filter(t => t.status === "todo" || t.status === "in_progress").length
        const critical = tasks.filter(t => t.priority === "critical").length
        contextData += `\nTAREFAS PENDENTES: ${pending}`
        contextData += `\nTAREFAS CRITICAS: ${critical}`
      }
    }

    // Buscar analise especifica se fornecida
    if (analysisId) {
      const { data: analysis } = await supabase
        .from("analyses")
        .select("*, findings(*)")
        .eq("id", analysisId)
        .single()
      
      if (analysis) {
        contextData += `\n\nANALISE ATUAL:`
        contextData += `\n- Repositorio: ${analysis.repository_name || "N/A"}`
        contextData += `\n- Status: ${analysis.status}`
        contextData += `\n- Arquivos: ${analysis.total_files || 0}`
        contextData += `\n- Findings: ${analysis.findings?.length || 0}`
      }
    }

    // Determinar tipo de resposta
    if (type === "code" || message.toLowerCase().includes("codigo") || message.toLowerCase().includes("gere")) {
      responseType = "code"
    } else if (type === "report" || message.toLowerCase().includes("relatorio")) {
      responseType = "report"
    } else if (type === "help" || message.toLowerCase().includes("ajuda") || message.toLowerCase().includes("como")) {
      contextData += `\n\nDOCUMENTACAO DO SISTEMA:\n${SYSTEM_HELP}`
    }

    // Adicionar exemplos de codigo se for pedido de codigo
    if (responseType === "code") {
      contextData += `\n\nEXEMPLOS DE CODIGO DISPONIVEIS:\n`
      contextData += `- Validacao: funcao completa para validar CNPJ alfanumerico\n`
      contextData += `- Mascara: funcao para formatar CNPJ e componente React\n`
      contextData += `- Database: scripts SQL para alterar colunas\n`
    }

    // Construir historico
    const historyText = history?.map((m: any) => `${m.role === "user" ? "Usuario" : "Assistente"}: ${m.content}`).join("\n") || ""

    const systemPrompt = `Voce e um assistente IA especializado em analise de CNPJ alfanumerico para o sistema WebNetSystem.

CONTEXTO:${contextData}

${historyText ? `HISTORICO DA CONVERSA:\n${historyText}\n` : ""}

INSTRUCOES:
${responseType === "code" ? `
- O usuario pediu CODIGO. Forneca codigo funcional e bem comentado.
- Use os exemplos de validacao, mascara ou database conforme apropriado.
- Explique brevemente o que o codigo faz.
- Se for para uma linguagem especifica, adapte o codigo.
EXEMPLOS DISPONIVEIS:
${CODE_EXAMPLES.validation}
${CODE_EXAMPLES.mask}
${CODE_EXAMPLES.database}
` : responseType === "report" ? `
- O usuario pediu um RELATORIO. Forneca um relatorio estruturado.
- Use markdown para formatacao.
- Inclua: resumo executivo, metricas, recomendacoes.
- Seja conciso mas informativo.
` : `
- Responda de forma clara e concisa.
- Use bullet points quando apropriado.
- Seja tecnico mas acessivel.
`}

Responda SEMPRE em PORTUGUES.`

    // Use generateText directly from AI SDK
    const result = await generateText({
      model: "google/gemini-2.0-flash" as any,
      prompt: `${systemPrompt}\n\nPERGUNTA: ${message}`,
      temperature: responseType === "code" ? 0.3 : 0.6,
      maxTokens: responseType === "code" ? 2000 : 1000,
    })

    return NextResponse.json({
      response: result.text,
      type: responseType,
      context: {
        clientId,
        analysisId,
      },
    })
  } catch (error: any) {
    console.error("AI Assistant error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
