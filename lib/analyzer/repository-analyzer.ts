import { db } from "@/lib/db/sqlserver"
import { ZipProcessor } from "./zip-processor"
import { CNPJDetector } from "./cnpj-detector"
import { DatabaseDetector } from "./database-detector"

export async function analyzeRepository(
  analysisId: string,
  file: File | null,
  githubUrl: string | null,
  localFiles: Array<{ name: string; content: string; path: string; project?: string; repository?: string }> | null,
  type: string,
  cnpjFieldNames?: string[], // Optional array of CNPJ field names from client settings
  repositoryName?: string, // Add repositoryName parameter
  allowedExtensions?: string[], // Added allowedExtensions parameter
) {
  console.log(` [${analysisId}] ========== REPOSITORY ANALYZER CALLED ==========`)
  console.log(` [${analysisId}] Parameters:`, {
    type,
    hasFile: !!file,
    hasGithubUrl: !!githubUrl,
    localFilesCount: localFiles?.length || 0,
    cnpjFieldNames: cnpjFieldNames?.join(", ") || "NONE",
    repositoryName: repositoryName || "NONE",
    allowedExtensions: allowedExtensions?.join(", ") || "NONE",
  })

  const supabase = db

  const updateProgress = async (progress: number, step: string) => {
    const timestamp = new Date().toISOString()
    console.log(` [${analysisId}] [${timestamp}] Progress: ${progress}% - ${step}`)
    await supabase.from("analyses").update({ progress, current_step: step }).eq("id", analysisId)
  }

  try {
    console.log(` [${analysisId}] ========== REPOSITORY ANALYZER STARTED ==========`)
    console.log(` [${analysisId}] Type: ${type}`)
    console.log(` [${analysisId}] Local files provided: ${localFiles?.length || 0}`)
    console.log(` [${analysisId}] CNPJ fields: ${cnpjFieldNames?.join(", ") || "DEFAULT"}`)
    console.log(` [${analysisId}] Repository name: ${repositoryName || "UNKNOWN"}`)

    await updateProgress(5, "Preparando análise...")

    const { data: analysisData } = await supabase
      .from("analyses")
      .select("client_id, user_id")
      .eq("id", analysisId)
      .single()

    const clientId = analysisData?.client_id
    const userId = analysisData?.user_id

    const filesMap = new Map<string, { content: string; project?: string; repository?: string }>()

    await updateProgress(10, "Extraindo arquivos...")

    if (type === "zip" && file) {
      const zipProcessor = new ZipProcessor()
      const extractedFiles = await zipProcessor.extractFiles(file)
      // Convert simple map to map with metadata
      extractedFiles.forEach((content, path) => {
        filesMap.set(path, { content })
      })
      console.log(` [${analysisId}] Extracted files from ZIP:`, filesMap.size)
    } else if (type === "github" && githubUrl) {
      console.log(` [${analysisId}] GitHub analysis not yet implemented`)
      await supabase
        .from("analyses")
        .update({ status: "failed", error_message: "GitHub clone não implementado ainda", progress: 0 })
        .eq("id", analysisId)
      return
    } else if (type === "local" && localFiles) {
      localFiles.forEach((file) => {
        filesMap.set(file.path, {
          content: file.content,
          project: file.project,
          repository: file.repository,
        })
      })
      console.log(` [${analysisId}] Processed ${filesMap.size} files from local folder`)
      if (localFiles.length > 0 && localFiles[0].project) {
        console.log(` [${analysisId}] First file project: ${localFiles[0].project}`)
      }
    }

    if (filesMap.size === 0) {
      console.error(` [${analysisId}] No files to analyze!`)
      await supabase
        .from("analyses")
        .update({
          status: "failed",
          error_message: "Nenhum arquivo para analisar",
          progress: 0,
        })
        .eq("id", analysisId)
      return
    }

    await updateProgress(20, "Detectando linguagens...")

    console.log(` [${analysisId}] ========== INITIALIZING CNPJ DETECTOR ==========`)
    console.log(` [${analysisId}] Passing CNPJ fields to detector:`, cnpjFieldNames)
    const cnpjDetector = new CNPJDetector(cnpjFieldNames)
    console.log(` [${analysisId}] CNPJDetector initialized`)

    const databaseDetector = new DatabaseDetector()

    const allFindings: any[] = []
    const allDbFindings: any[] = []
    const languagesFound = new Set<string>()
    const languageFileCount: Record<string, number> = {}

    const totalFiles = filesMap.size
    let processedFiles = 0

    console.log(` [${analysisId}] ========== STARTING FILE ANALYSIS LOOP ==========`)
    console.log(` [${analysisId}] Total files to analyze: ${totalFiles}`)
    console.log(` [${analysisId}] Allowed extensions: ${allowedExtensions?.join(", ") || "ALL FILES"}`)
    await updateProgress(30, `Analisando ${totalFiles} arquivos...`)

    for (const [filePath, fileData] of filesMap.entries()) {
      if (allowedExtensions && allowedExtensions.length > 0) {
        const fileExtension = filePath.split(".").pop()?.toLowerCase()
        const isAllowed = allowedExtensions.some((ext) => ext.toLowerCase().replace(".", "") === fileExtension)

        if (!isAllowed) {
          console.log(` [${analysisId}] ⏭️  Skipping ${filePath} (extension .${fileExtension} not in allowed list)`)
          processedFiles++
          continue
        }
      }

      const fileName = filePath.split("/").pop() || filePath
      const fileProgress = 30 + Math.round((processedFiles / totalFiles) * 50)
      await updateProgress(fileProgress, `Analisando: ${fileName} (${processedFiles + 1}/${totalFiles})`)

      console.log(` [${analysisId}] 📄 Analyzing file ${processedFiles + 1}/${totalFiles}: ${filePath}`)
      console.log(` [${analysisId}]    Content length: ${fileData.content.length} bytes`)
      if (fileData.project) {
        console.log(` [${analysisId}]    Project: ${fileData.project}`)
      }
      if (fileData.repository) {
        console.log(` [${analysisId}]    Repository: ${fileData.repository}`)
      }

      const zipProcessor = new ZipProcessor()
      const language = zipProcessor.detectLanguage(filePath)
      console.log(` [${analysisId}]    Detected language: ${language}`)

      if (language !== "Unknown") {
        languagesFound.add(language)
        languageFileCount[language] = (languageFileCount[language] || 0) + 1
      }

      console.log(` [${analysisId}]    Calling CNPJDetector.analyzeFile...`)
      const findings = await cnpjDetector.analyzeFile(filePath, fileData.content, language)
      console.log(` [${analysisId}]    ✅ Found ${findings.length} CNPJ occurrences in ${fileName}`)

      if (findings.length > 0) {
        console.log(` [${analysisId}]    First finding:`, {
          line: findings[0].line,
          fieldName: findings[0].fieldName,
          type: findings[0].type,
          code: findings[0].code.substring(0, 50) + "...",
        })
      }

      findings.forEach((finding) => {
        allFindings.push({
          analysis_id: analysisId,
          client_id: clientId,
          project: fileData.project || null, // Azure DevOps project or GitHub org
          repository: fileData.repository || repositoryName || "Repositório Desconhecido",
          file_path: finding.file,
          line_number: finding.line,
          field_name: finding.fieldName,
          field_type: finding.type,
          context: finding.code,
          suggestion: finding.suggestion,
          file_type: language,
          is_validation: finding.type === "validation",
          is_input: finding.type === "input",
          is_database: finding.type === "database",
          is_output: finding.type === "output",
          supports_cpf: false,
        })
      })

      if (filePath.endsWith(".sql")) {
        const dbFindings = await databaseDetector.analyzeFile(filePath, fileData.content)
        dbFindings.forEach((finding) => {
          allDbFindings.push({
            analysis_id: analysisId,
            client_id: clientId,
            table_name: finding.table,
            column_name: finding.column,
            column_type: finding.type,
            column_length: finding.size,
            database_type: finding.database,
            suggestion: finding.suggestion,
          })
        })
      }

      processedFiles++
    }

    console.log(` [${analysisId}] ========== FILE ANALYSIS LOOP COMPLETE ==========`)
    console.log(` [${analysisId}] Processed: ${processedFiles} files`)
    console.log(` [${analysisId}] Total CNPJ findings: ${allFindings.length}`)
    console.log(` [${analysisId}] Total DB findings: ${allDbFindings.length}`)

    console.log(` [${analysisId}] ========== FINALIZING ANALYSIS ==========`)
    console.log(` [${analysisId}] 🔄 BEFORE updating progress to 95%...`)

    const estimatedMinutes = allFindings.length * 3 + allDbFindings.length * 6
    const estimatedHours = Math.round((estimatedMinutes / 60) * 10) / 10 // Round to 1 decimal place

    console.log(
      ` [${analysisId}] Estimated effort: ${estimatedHours}h (based on ${allFindings.length} code + ${allDbFindings.length} DB findings)`,
    )

    await supabase
      .from("analyses")
      .update({
        progress: 95,
        current_step: "Finalizando análise...",
      })
      .eq("id", analysisId)

    console.log(` [${analysisId}] ✅ AFTER updating progress to 95% - SUCCESS`)

    console.log(` [${analysisId}] 🔄 BEFORE inserting ${allFindings.length} findings...`)
    if (allFindings.length > 0) {
      const { error: findingsError } = await supabase.from("findings").insert(allFindings)

      if (findingsError) {
        console.error(` [${analysisId}] ❌ Error inserting findings:`, findingsError)
        throw findingsError
      }

      console.log(` [${analysisId}] ✅ Successfully inserted ${allFindings.length} findings`)
    }

    console.log(` [${analysisId}] 🔄 BEFORE inserting ${allDbFindings.length} database findings...`)
    if (allDbFindings.length > 0) {
      const { error: dbFindingsError } = await supabase.from("database_findings").insert(allDbFindings)

      if (dbFindingsError) {
        console.error(` [${analysisId}] ❌ Error inserting database findings:`, dbFindingsError)
        throw dbFindingsError
      }

      console.log(` [${analysisId}] ✅ Successfully inserted ${allDbFindings.length} database findings`)
    }

    console.log(` [${analysisId}] 🔄 BEFORE marking analysis as completed (100%)...`)

    const { error: completeError } = await supabase
      .from("analyses")
      .update({
        status: "completed",
        progress: 100,
        current_step: "Análise concluída",
        completed_at: new Date().toISOString(),
        total_findings: allFindings.length + allDbFindings.length,
        total_files: processedFiles,
        estimated_hours: estimatedHours,
        results: {
          summary: {
            total_files: totalFiles,
            files_analyzed: processedFiles,
            estimated_hours: estimatedHours,
            code_findings: allFindings.length,
            database_findings: allDbFindings.length,
          },
          language_breakdown: languageFileCount,
          primary_language:
            Object.keys(languageFileCount).sort((a, b) => languageFileCount[b] - languageFileCount[a])[0] || "Unknown",
          languages_used: Array.from(languagesFound).join(", ") || "Unknown",
          state: {
            current: "Campos CNPJ no formato atual (14 caracteres numéricos) em múltiplos repositórios",
            future: "Campos CNPJ atualizados para formato alfanumérico (18 caracteres) em todos os repositórios",
          },
        },
      })
      .eq("id", analysisId)

    console.log(` [${analysisId}] ✅✅✅ ANALYSIS COMPLETE - 100% ✅✅✅`)

    console.log(` [${analysisId}] 🔄 BEFORE creating tasks in background...`)
    createTasksFromAnalysis(supabase, analysisId, clientId, userId, allFindings, allDbFindings)
      .then(() => console.log(` [${analysisId}] ✅ Tasks created successfully`))
      .catch((err) => console.error(` [${analysisId}] ⚠️ Task creation failed:`, err))

    console.log(` [${analysisId}] ✅ AFTER dispatching task creation - returning from analyzeRepository`)
    console.log(` [${analysisId}] ========== ANALYSIS FUNCTION COMPLETE ==========`)
  } catch (error) {
    console.error(` [${analysisId}] ❌❌❌ FATAL ERROR IN ANALYZER ❌❌❌`)
    console.error(` [${analysisId}] Error:`, error)

    await supabase
      .from("analyses")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Erro desconhecido",
        progress: 0,
        current_step: "Análise falhou",
        completed_at: new Date().toISOString(),
      })
      .eq("id", analysisId)
    throw error
  }
}

export async function analyzeRepositoryCloud(
  files: Array<{ name: string; content: string; path: string; project?: string; repository?: string }>,
  cnpjFieldNames: string[],
  allowedExtensions: string[],
  repositoryName: string,
  onProgress?: (progress: { percent: number; filesProcessed: number; findingsCount: number }) => void,
): Promise<{
  findings: any[]
  summary: {
    total_files: number
    total_findings: number
    files_with_findings: number
    database_fields_found: string[]
  }
}> {
  console.log(` ========== CLOUD REPOSITORY ANALYZER CALLED ==========`)
  console.log(` Total files to analyze: ${files.length}`)
  console.log(` CNPJ field names: ${cnpjFieldNames.join(", ")}`)
  console.log(` Allowed extensions:`, allowedExtensions)
  console.log(` Repository name: ${repositoryName}`)

  const findings: any[] = []
  const detector = new CNPJDetector(cnpjFieldNames)
  const databaseFieldsSet = new Set<string>()
  let filesWithFindings = 0
  let totalFindingsCount = 0

  const filesToAnalyze = files.filter((file) => {
    if (!file.path) return false
    const ext = "." + file.path.split(".").pop()?.toLowerCase()
    const isAllowed = allowedExtensions.some((allowedExt) => allowedExt.toLowerCase() === ext)
    if (!isAllowed) {
      console.log(` ⏭️ Skipping ${file.path} (extension ${ext} not in ${allowedExtensions.join(", ")})`)
    }
    return isAllowed
  })

  console.log(` Files after extension filter: ${filesToAnalyze.length} (from ${files.length} total)`)

  for (let i = 0; i < filesToAnalyze.length; i++) {
    const file = filesToAnalyze[i]

    try {
      if (file.content) {
        const zipProcessor = new ZipProcessor()
        const language = zipProcessor.detectLanguage(file.path)

        const fileFindings = await detector.analyzeFile(file.path, file.content, language)

        if (fileFindings.length > 0) {
          filesWithFindings++
          totalFindingsCount += fileFindings.length

          fileFindings.forEach((finding) => {
            databaseFieldsSet.add(finding.fieldName)
            findings.push(finding)
          })
        }
      }

      if (i % 10 === 0 || i === filesToAnalyze.length - 1) {
        const progress = Math.min(30 + Math.round(((i + 1) / filesToAnalyze.length) * 65), 95) // Keep between 30-95%
        if (onProgress) {
          onProgress({
            percent: progress,
            filesProcessed: i + 1,
            findingsCount: totalFindingsCount,
          })
        }
      }
    } catch (error) {
      console.error(` Error analyzing file ${file.path}:`, error)
    }
  }

  const summary = {
    total_files: filesToAnalyze.length,
    total_findings: totalFindingsCount,
    files_with_findings: filesWithFindings,
    database_fields_found: Array.from(databaseFieldsSet),
  }

  console.log(` ========== CLOUD ANALYSIS COMPLETE ==========`)
  console.log(` Files analyzed: ${summary.total_files}`)
  console.log(` Total findings: ${summary.total_findings}`)
  console.log(` Files with findings: ${summary.files_with_findings}`)

  return { findings, summary }
}

async function createTasksFromAnalysis(
  supabase: any,
  analysisId: string,
  clientId: string | null,
  userId: string | null,
  codeFindings: any[],
  dbFindings: any[],
) {
  try {
    console.log(` [${analysisId}] ========== CREATING TASKS ==========`)
    console.log(` [${analysisId}] Code findings: ${codeFindings.length}, DB findings: ${dbFindings.length}`)

    const tasks: any[] = []

    const findingsByFile: Record<string, any[]> = {}
    codeFindings.forEach((finding) => {
      if (!findingsByFile[finding.file_path]) {
        findingsByFile[finding.file_path] = []
      }
      findingsByFile[finding.file_path].push(finding)
    })

    Object.entries(findingsByFile).forEach(([filePath, findings]) => {
      const fileName = filePath.split("/").pop() || filePath

      tasks.push({
        client_id: clientId,
        analysis_id: analysisId,
        title: `Atualizar campos CNPJ em ${fileName}`,
        description: `Atualizar ${findings.length} campo(s) CNPJ para suportar formato alfanumérico de 18 caracteres.\n\nArquivo: ${filePath}\n\nCampos: ${findings.map((f) => f.field_name).join(", ")}`,
        status: "pendente",
        priority: findings.length > 5 ? "high" : findings.length > 2 ? "medium" : "low",
        assigned_to: null,
      })
    })

    const dbByTable: Record<string, any[]> = {}
    dbFindings.forEach((finding) => {
      if (!dbByTable[finding.table_name]) {
        dbByTable[finding.table_name] = []
      }
      dbByTable[finding.table_name].push(finding)
    })

    Object.entries(dbByTable).forEach(([tableName, findings]) => {
      tasks.push({
        client_id: clientId,
        analysis_id: analysisId,
        title: `Atualizar tabela ${tableName} no banco de dados`,
        description: `Atualizar ${findings.length} coluna(s) CNPJ na tabela ${tableName}.\n\nColunas: ${findings.map((f) => f.column_name).join(", ")}\n\nAção: ALTER TABLE para VARCHAR(18)`,
        status: "pendente",
        priority: "high",
        assigned_to: null,
      })
    })

    if (tasks.length > 0) {
      console.log(` [${analysisId}] Inserting ${tasks.length} tasks into database...`)
      const startTime = Date.now()
      const { error } = await supabase.from("tasks").insert(tasks)
      const duration = Date.now() - startTime

      if (error) {
        console.error(` [${analysisId}] ❌ Error inserting tasks (took ${duration}ms):`, error.message)
        console.error(` [${analysisId}] Error details:`, JSON.stringify(error, null, 2))
        throw error
      } else {
        console.log(` [${analysisId}] ✅ Successfully created ${tasks.length} tasks in ${duration}ms`)
      }
    } else {
      console.log(` [${analysisId}] No tasks to create (no findings)`)
    }
  } catch (error) {
    console.error(` [${analysisId}] ❌ FATAL ERROR in createTasksFromAnalysis:`, error)
    console.error(` [${analysisId}] Error type:`, error instanceof Error ? error.constructor.name : typeof error)
    console.error(` [${analysisId}] Error message:`, error instanceof Error ? error.message : String(error))
    throw error
  }
}

function calculateEffort(codeFindings: any[], dbFindings: any[]): number {
  let hours = 0
  hours += codeFindings.length * 0.5
  hours += dbFindings.length * 1
  hours = hours * 1.3
  return Math.round(hours * 10) / 10
}
