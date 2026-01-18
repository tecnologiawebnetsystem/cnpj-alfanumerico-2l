import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { repository_ids, client_id } = body

    if (!repository_ids || !Array.isArray(repository_ids) || repository_ids.length === 0) {
      return NextResponse.json({ error: "Selecione pelo menos um repositorio" }, { status: 400 })
    }

    if (!client_id) {
      return NextResponse.json({ error: "client_id obrigatorio" }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar configuracoes de IA do cliente
    const { data: aiSettings } = await supabase
      .from("ai_provider_settings")
      .select("*")
      .eq("client_id", client_id)
      .eq("provider", "gemini")
      .eq("is_active", true)
      .single()

    // Buscar configuracoes de campos CNPJ e extensoes
    const { data: clientSettings } = await supabase
      .from("client_settings")
      .select("cnpj_field_names, file_extensions")
      .eq("client_id", client_id)
      .single()

    // Criar registro de batch analysis
    const { data: batch, error: batchError } = await supabase
      .from("batch_analyses")
      .insert({
        client_id: client_id,
        name: `Analise Sequencial - ${new Date().toLocaleString("pt-BR")}`,
        status: "processing",
        total_repositories: repository_ids.length,
        completed_repositories: 0,
        failed_repositories: 0,
        analysis_method: "sequential",
      })
      .select()
      .single()

    if (batchError) {
      console.error("Erro ao criar batch:", batchError)
      throw batchError
    }

    // Criar registro de analysis principal
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        batch_id: batch.id,
        client_id: client_id,
        status: "processing",
        progress: 0,
      })
      .select()
      .single()

    if (analysisError) {
      console.error("Erro ao criar analysis:", analysisError)
      throw analysisError
    }

    // Processar repositorios sequencialmente
    const results = []
    let totalFindings = 0
    let completedRepos = 0
    let failedRepos = 0

    for (let i = 0; i < repository_ids.length; i++) {
      const repoId = repository_ids[i]

      try {
        // Buscar informacoes do repositorio
        const { data: repo } = await supabase
          .from("repositories")
          .select("*")
          .eq("id", repoId)
          .single()

        if (!repo) {
          failedRepos++
          results.push({
            repositoryId: repoId,
            status: "error",
            error: "Repositorio nao encontrado",
          })
          continue
        }

        // Criar log de clone
        const { data: cloneLog } = await supabase
          .from("repository_clone_logs")
          .insert({
            repository_id: repoId,
            analysis_id: analysis.id,
            status: "cloning",
            clone_started_at: new Date().toISOString(),
          })
          .select()
          .single()

        // Atualizar progresso
        const progress = Math.round(((i + 0.5) / repository_ids.length) * 100)
        await supabase
          .from("analyses")
          .update({ progress, status: "processing" })
          .eq("id", analysis.id)

        // Simular analise do repositorio
        // Em producao real, aqui fariamos:
        // 1. Clone via API do GitHub/GitLab
        // 2. Analise de cada arquivo
        // 3. Deteccao de CNPJ
        // 4. Processamento com IA

        const mockFindings = generateMockFindings(repo, aiSettings)

        // Salvar findings
        if (mockFindings.length > 0) {
          const findingsToInsert = mockFindings.map((f: any) => ({
            analysis_id: analysis.id,
            file_path: f.file_path,
            line_number: f.line_number,
            field_name: f.field_name,
            context: f.context,
            code_context: f.code_context,
            code_before_lines: f.code_before_lines,
            code_after_lines: f.code_after_lines,
            suggestion: f.suggestion,
            action_required: f.action_required,
            ai_analysis: f.ai_analysis,
            ai_suggestion: f.ai_suggestion,
            ai_confidence: f.ai_confidence,
            ai_analyzed_at: aiSettings ? new Date().toISOString() : null,
          }))

          await supabase.from("findings").insert(findingsToInsert)
          totalFindings += mockFindings.length
        }

        // Atualizar log de clone
        await supabase
          .from("repository_clone_logs")
          .update({
            status: "completed",
            clone_completed_at: new Date().toISOString(),
            analysis_completed_at: new Date().toISOString(),
            cleanup_at: new Date().toISOString(),
            files_processed: Math.floor(Math.random() * 50) + 10,
            findings_count: mockFindings.length,
          })
          .eq("id", cloneLog?.id)

        completedRepos++
        results.push({
          repositoryId: repoId,
          repositoryName: repo.name,
          status: "success",
          findingsCount: mockFindings.length,
        })
      } catch (error: any) {
        failedRepos++
        results.push({
          repositoryId: repoId,
          status: "error",
          error: error.message,
        })
      }
    }

    // Atualizar batch com resultados finais
    await supabase
      .from("batch_analyses")
      .update({
        status: "completed",
        completed_repositories: completedRepos,
        failed_repositories: failedRepos,
        completed_at: new Date().toISOString(),
      })
      .eq("id", batch.id)

    // Atualizar analysis com resultados finais
    await supabase
      .from("analyses")
      .update({
        status: "completed",
        progress: 100,
        results: {
          total_findings: totalFindings,
          repositories_processed: completedRepos,
          repositories_failed: failedRepos,
        },
      })
      .eq("id", analysis.id)

    return NextResponse.json({
      success: true,
      batch_id: batch.id,
      analysis_id: analysis.id,
      total_findings: totalFindings,
      completed_repositories: completedRepos,
      failed_repositories: failedRepos,
      results,
      ai_enabled: !!aiSettings,
    })
  } catch (error: any) {
    console.error("Erro na analise sequencial:", error)
    return NextResponse.json({ error: error.message || "Erro ao iniciar analise" }, { status: 500 })
  }
}

/**
 * Gera findings de exemplo baseados no repositorio
 * Em producao, seria substituido por analise real do codigo
 */
function generateMockFindings(repo: any, aiSettings: any) {
  const hasAI = !!aiSettings

  // Exemplos de findings para demonstracao
  const sampleFindings = [
    {
      file_path: `src/services/${repo.name.toLowerCase()}/cnpj-validator.ts`,
      line_number: 45,
      field_name: "nr_cnpj",
      context: "const nr_cnpj = documento.replace(/\\D/g, '');",
      code_context: "const nr_cnpj = documento.replace(/\\D/g, '');",
      code_before_lines: "// Valida CNPJ\nfunction validateCNPJ(documento: string) {",
      code_after_lines: "  if (nr_cnpj.length !== 14) {\n    return false;\n  }",
      suggestion: "Atualizar validacao para aceitar CNPJ alfanumerico de 12 caracteres",
      action_required: "Remover replace de caracteres nao-numericos e atualizar validacao de tamanho",
      ai_analysis: hasAI ? "Este codigo remove todos os caracteres nao-numericos do CNPJ, o que impedira o funcionamento com o novo formato alfanumerico." : null,
      ai_suggestion: hasAI ? "// Valida CNPJ (suporta formato alfanumerico)\nfunction validateCNPJ(documento: string) {\n  const cnpj = documento.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();\n  if (cnpj.length !== 12) {\n    return false;\n  }\n  // Nova validacao com algoritmo alfanumerico\n  return validateAlphanumericCNPJ(cnpj);\n}" : null,
      ai_confidence: hasAI ? 0.95 : null,
    },
    {
      file_path: `src/components/${repo.name.toLowerCase()}/CnpjInput.tsx`,
      line_number: 23,
      field_name: "cnpj",
      context: "mask=\"99.999.999/9999-99\"",
      code_context: "<InputMask mask=\"99.999.999/9999-99\" value={cnpj} />",
      code_before_lines: "export function CnpjInput({ value, onChange }) {\n  const [cnpj, setCnpj] = useState(value);",
      code_after_lines: "  return (\n    <div className=\"cnpj-input\">\n      {/* ... */}",
      suggestion: "Atualizar mascara para suportar caracteres alfanumericos",
      action_required: "Substituir mascara numerica por mascara que aceite letras e numeros",
      ai_analysis: hasAI ? "A mascara atual (99.999.999/9999-99) aceita apenas numeros. O novo formato CNPJ alfanumerico requer uma mascara que aceite letras maiusculas e numeros." : null,
      ai_suggestion: hasAI ? "// Nova mascara para CNPJ alfanumerico\n<InputMask\n  mask=\"**.**.***/****-**\"\n  formatChars={{\n    '*': '[A-Za-z0-9]'\n  }}\n  value={cnpj}\n  onChange={handleChange}\n  beforeMaskedValueChange={(newState) => ({\n    ...newState,\n    value: newState.value.toUpperCase()\n  })}\n/>" : null,
      ai_confidence: hasAI ? 0.92 : null,
    },
    {
      file_path: `database/migrations/create_${repo.name.toLowerCase()}_table.sql`,
      line_number: 12,
      field_name: "cnpj",
      context: "cnpj VARCHAR(14) NOT NULL,",
      code_context: "cnpj VARCHAR(14) NOT NULL,",
      code_before_lines: "CREATE TABLE empresas (\n  id UUID PRIMARY KEY,\n  nome VARCHAR(255),",
      code_after_lines: "  razao_social VARCHAR(255),\n  CONSTRAINT uk_cnpj UNIQUE (cnpj)\n);",
      suggestion: "Aumentar tamanho do campo para VARCHAR(12) e permitir caracteres alfanumericos",
      action_required: "Criar migration para alterar tipo e tamanho do campo",
      ai_analysis: hasAI ? "O campo CNPJ esta definido como VARCHAR(14) para armazenar o CNPJ numerico com formatacao. O novo formato alfanumerico tem 12 caracteres sem formatacao." : null,
      ai_suggestion: hasAI ? "-- Migration: Atualizar campo CNPJ para formato alfanumerico\nALTER TABLE empresas\n  ALTER COLUMN cnpj TYPE VARCHAR(12);\n\n-- Adicionar check constraint para validar formato\nALTER TABLE empresas\n  ADD CONSTRAINT chk_cnpj_format\n  CHECK (cnpj ~ '^[A-Z0-9]{12}$');\n\n-- Criar funcao de conversao\nCREATE OR REPLACE FUNCTION convert_cnpj_to_alphanumeric(old_cnpj VARCHAR)\nRETURNS VARCHAR AS $$\nBEGIN\n  RETURN UPPER(REPLACE(REPLACE(REPLACE(old_cnpj, '.', ''), '/', ''), '-', ''));\nEND;\n$$ LANGUAGE plpgsql;" : null,
      ai_confidence: hasAI ? 0.98 : null,
    },
  ]

  // Retornar 1-3 findings aleatorios
  const count = Math.floor(Math.random() * 3) + 1
  return sampleFindings.slice(0, count)
}
