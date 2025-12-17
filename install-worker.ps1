# Script de instalação automática do Worker Local
# Execute com: .\install-worker.ps1

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Worker Local - Instalação Automática" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$workerPath = "C:\Users\klebe\worker-local"

# Criar estrutura de pastas
Write-Host "Criando estrutura de pastas..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "$workerPath\src" | Out-Null
New-Item -ItemType Directory -Force -Path "C:\Projetos" | Out-Null

# Criar package.json
Write-Host "Criando package.json..." -ForegroundColor Yellow
@"
{
  "name": "worker-local-cnpj",
  "version": "1.0.0",
  "description": "Worker local para análise de repositórios",
  "main": "src/index.js",
  "type": "module",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "dotenv": "^16.3.1",
    "simple-git": "^3.21.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
"@ | Out-File -FilePath "$workerPath\package.json" -Encoding UTF8

# Criar .env.example
Write-Host "Criando .env.example..." -ForegroundColor Yellow
@"
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Worker Configuration
WORKER_ID=worker-1
WORKER_NAME=Worker Local Principal
BASE_PATH=C:\Projetos
POLL_INTERVAL=5000
MAX_CONCURRENT=5

# Azure DevOps (opcional)
AZURE_PAT=your_azure_pat_here
"@ | Out-File -FilePath "$workerPath\.env.example" -Encoding UTF8

# Criar index.js
Write-Host "Criando src/index.js..." -ForegroundColor Yellow
@"
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { CloneManager } from './cloner.js'
import { LocalAnalyzer } from './analyzer.js'
import { ResultUploader } from './uploader.js'
import { Logger } from './logger.js'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const logger = new Logger()
const cloner = new CloneManager(process.env.BASE_PATH || 'C:\\Projetos', logger)
const analyzer = new LocalAnalyzer(logger)
const uploader = new ResultUploader(supabase, logger)

const WORKER_ID = process.env.WORKER_ID || 'worker-1'
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL) || 5000

async function registerWorker() {
  const { error } = await supabase.from('workers').upsert({
    worker_id: WORKER_ID,
    worker_name: process.env.WORKER_NAME || 'Worker Local',
    status: 'online',
    last_heartbeat: new Date().toISOString(),
    capabilities: { max_concurrent: 5 }
  })
  
  if (error) logger.error('Erro ao registrar worker', error)
  else logger.success('Worker registrado com sucesso')
}

async function sendHeartbeat() {
  await supabase.from('workers').update({
    last_heartbeat: new Date().toISOString(),
    status: 'online'
  }).eq('worker_id', WORKER_ID)
}

async function processJob(job) {
  logger.info(\`Processando job \${job.job_id}\`)
  
  try {
    await supabase.from('worker_jobs').update({
      status: 'processing',
      started_at: new Date().toISOString(),
      worker_id: WORKER_ID
    }).eq('job_id', job.job_id)

    const repoPath = await cloner.cloneRepository(
      job.repository_url,
      job.project_name,
      job.repository_name,
      job.access_token
    )

    const findings = await analyzer.analyzeRepository(
      repoPath,
      job.custom_fields || [],
      job.file_extensions || ['.sql', '.java', '.ts', '.py']
    )

    await uploader.uploadFindings(
      job.batch_id,
      findings,
      job.project_name,
      job.repository_name
    )

    await supabase.from('worker_jobs').update({
      status: 'completed',
      completed_at: new Date().toISOString()
    }).eq('job_id', job.job_id)

    logger.success(\`Job \${job.job_id} concluído\`)
  } catch (error) {
    logger.error(\`Erro no job \${job.job_id}\`, error)
    
    await supabase.from('worker_jobs').update({
      status: 'failed',
      error_message: error.message,
      completed_at: new Date().toISOString()
    }).eq('job_id', job.job_id)
  }
}

async function pollJobs() {
  const { data: jobs } = await supabase
    .from('worker_jobs')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(5)

  if (jobs && jobs.length > 0) {
    logger.info(\`Encontrados \${jobs.length} jobs pendentes\`)
    for (const job of jobs) {
      await processJob(job)
    }
  }
}

async function main() {
  logger.info('Worker Local iniciando...')
  
  await registerWorker()
  
  setInterval(sendHeartbeat, 30000)
  
  logger.success('Worker rodando! Aguardando jobs...')
  
  setInterval(pollJobs, POLL_INTERVAL)
}

main().catch((error) => {
  logger.error('Erro fatal', error)
  process.exit(1)
})
"@ | Out-File -FilePath "$workerPath\src\index.js" -Encoding UTF8

# Criar outros arquivos necessários
Write-Host "Criando módulos auxiliares..." -ForegroundColor Yellow

# cloner.js
@"
import simpleGit from 'simple-git'
import path from 'path'
import fs from 'fs'

export class CloneManager {
  constructor(basePath, logger) {
    this.basePath = basePath
    this.logger = logger
    
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true })
    }
  }

  async cloneRepository(repoUrl, projectName, repoName, token) {
    const projectPath = path.join(this.basePath, projectName)
    const repoPath = path.join(projectPath, repoName)

    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true })
    }

    if (fs.existsSync(repoPath)) {
      this.logger.info(\`Repositório já existe: \${repoPath}\`)
      const git = simpleGit(repoPath)
      await git.pull()
      return repoPath
    }

    this.logger.info(\`Clonando \${repoName} em \${repoPath}\`)
    
    const urlWithToken = repoUrl.replace('https://', \`https://:\${token}@\`)
    await simpleGit().clone(urlWithToken, repoPath)
    
    return repoPath
  }
}
"@ | Out-File -FilePath "$workerPath\src\cloner.js" -Encoding UTF8

# analyzer.js
@"
import fs from 'fs'
import path from 'path'

export class LocalAnalyzer {
  constructor(logger) {
    this.logger = logger
  }

  async analyzeRepository(repoPath, customFields, extensions) {
    const findings = []
    const files = this.getAllFiles(repoPath, extensions)

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8')
      const fileFindings = this.detectCNPJ(content, file, repoPath, customFields)
      findings.push(...fileFindings)
    }

    return findings
  }

  getAllFiles(dir, extensions, fileList = []) {
    const files = fs.readdirSync(dir)

    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        this.getAllFiles(filePath, extensions, fileList)
      } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
        fileList.push(filePath)
      }
    })

    return fileList
  }

  detectCNPJ(content, filePath, repoPath, customFields) {
    const findings = []
    const lines = content.split('\\n')
    const cnpjRegex = /\\d{2}\\.?\\d{3}\\.?\\d{3}\\/\\d{4}-?\\d{2}/g

    lines.forEach((line, index) => {
      const matches = line.match(cnpjRegex)
      if (matches) {
        matches.forEach(cnpj => {
          findings.push({
            file_path: path.relative(repoPath, filePath),
            line_number: index + 1,
            line_content: line.trim(),
            cnpj_value: cnpj,
            context: this.getContext(lines, index)
          })
        })
      }
    })

    return findings
  }

  getContext(lines, index, range = 2) {
    const start = Math.max(0, index - range)
    const end = Math.min(lines.length, index + range + 1)
    return lines.slice(start, end).join('\\n')
  }
}
"@ | Out-File -FilePath "$workerPath\src\analyzer.js" -Encoding UTF8

# uploader.js
@"
export class ResultUploader {
  constructor(supabase, logger) {
    this.supabase = supabase
    this.logger = logger
  }

  async uploadFindings(batchId, findings, projectName, repoName) {
    if (findings.length === 0) {
      this.logger.info('Nenhum finding encontrado')
      return
    }

    const records = findings.map(f => ({
      batch_id: batchId,
      project: projectName,
      repository: repoName,
      file_path: f.file_path,
      line_number: f.line_number,
      line_content: f.line_content,
      cnpj_value: f.cnpj_value,
      context: f.context
    }))

    const { error } = await this.supabase.from('findings_compressed').insert(records)
    
    if (error) {
      this.logger.error('Erro ao enviar findings', error)
      throw error
    }

    this.logger.success(\`\${findings.length} findings enviados\`)
  }
}
"@ | Out-File -FilePath "$workerPath\src\uploader.js" -Encoding UTF8

# logger.js
@"
export class Logger {
  info(message, data) {
    console.log(\`[INFO] \${message}\`, data || '')
  }

  success(message) {
    console.log(\`[SUCCESS] \${message}\`)
  }

  error(message, error) {
    console.error(\`[ERROR] \${message}\`, error || '')
  }

  warn(message) {
    console.warn(\`[WARN] \${message}\`)
  }
}
"@ | Out-File -FilePath "$workerPath\src\logger.js" -Encoding UTF8

# Criar README
Write-Host "Criando README..." -ForegroundColor Yellow
@"
# Worker Local - Análise de Repositórios

## Instalação Completa

1. Configure o .env:
   - Copie .env.example para .env
   - Adicione suas credenciais do Supabase
   - Adicione seu Azure PAT

2. Instale as dependências:
   npm install

3. Inicie o worker:
   npm start

O worker estará rodando e aguardando jobs!
"@ | Out-File -FilePath "$workerPath\README.md" -Encoding UTF8

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "  Instalação Concluída!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. cd $workerPath" -ForegroundColor White
Write-Host "2. Copie .env.example para .env e configure" -ForegroundColor White
Write-Host "3. npm install" -ForegroundColor White
Write-Host "4. npm start" -ForegroundColor White
Write-Host ""
