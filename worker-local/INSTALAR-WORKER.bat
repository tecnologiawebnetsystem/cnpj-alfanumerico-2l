@echo off
chcp 65001 >nul
color 0A
mode con: cols=100 lines=40
title Instalador do Worker Local - Análise de Repositórios

:: Logo ASCII
cls
echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                            ║
echo ║     ██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗███████╗██████╗                   ║
echo ║     ██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝██╔════╝██╔══██╗                  ║
echo ║     ██║ █╗ ██║██║   ██║██████╔╝█████╔╝ █████╗  ██████╔╝                  ║
echo ║     ██║███╗██║██║   ██║██╔══██╗██╔═██╗ ██╔══╝  ██╔══██╗                  ║
echo ║     ╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗███████╗██║  ██║                  ║
echo ║      ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝                  ║
echo ║                                                                            ║
echo ║            INSTALADOR DE ANÁLISE LOCAL DE REPOSITÓRIOS                    ║
echo ║                          Versão 1.0                                        ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.
echo.

:: Verificar privilégios de administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    color 0C
    echo ❌ ERRO: Este instalador precisa ser executado como Administrador
    echo.
    echo 👉 Clique com botão direito no arquivo e selecione "Executar como administrador"
    echo.
    pause
    exit /b 1
)

echo ✅ Privilégios de Administrador: OK
echo.
timeout /t 2 /nobreak >nul

:: Passo 1: Verificar Node.js
echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║ PASSO 1/6: Verificando Node.js                                            ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.

node --version >nul 2>&1
if %errorLevel% neq 0 (
    color 0E
    echo ⚠️  Node.js não encontrado!
    echo.
    echo 📥 INSTALAÇÃO NECESSÁRIA:
    echo    1. Acesse: https://nodejs.org/
    echo    2. Baixe a versão LTS (recomendada)
    echo    3. Execute o instalador
    echo    4. Reinicie este instalador
    echo.
    echo 💡 Deseja abrir o site do Node.js agora? (S/N)
    set /p opensite=
    if /i "%opensite%"=="S" start https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js instalado: %NODE_VERSION%
timeout /t 1 /nobreak >nul

:: Verificar npm
npm --version >nul 2>&1
if %errorLevel% neq 0 (
    color 0C
    echo ❌ npm não encontrado! Reinstale o Node.js.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm instalado: v%NPM_VERSION%
echo.
timeout /t 2 /nobreak >nul

:: Passo 2: Criar estrutura de pastas
echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║ PASSO 2/6: Criando estrutura de pastas                                    ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.

set "INSTALL_DIR=C:\WorkerLocal"
set "PROJECTS_DIR=C:\Projetos"

echo 📁 Criando diretórios...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
if not exist "%INSTALL_DIR%\src" mkdir "%INSTALL_DIR%\src"
if not exist "%PROJECTS_DIR%" mkdir "%PROJECTS_DIR%"
if not exist "%INSTALL_DIR%\logs" mkdir "%INSTALL_DIR%\logs"

echo ✅ Diretório de instalação: %INSTALL_DIR%
echo ✅ Diretório de projetos: %PROJECTS_DIR%
echo.
timeout /t 2 /nobreak >nul

:: Passo 3: Criar arquivos do worker
echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║ PASSO 3/6: Instalando arquivos do Worker                                  ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.

cd /d "%INSTALL_DIR%"

echo 📝 Criando package.json...
(
echo {
echo   "name": "worker-local-repositorios",
echo   "version": "1.0.0",
echo   "description": "Worker local para análise de repositórios",
echo   "main": "src/index.js",
echo   "scripts": {
echo     "start": "node src/index.js",
echo     "dev": "nodemon src/index.js"
echo   },
echo   "dependencies": {
echo     "@supabase/supabase-js": "^2.39.0",
echo     "simple-git": "^3.22.0",
echo     "dotenv": "^16.3.1",
echo     "chalk": "^4.1.2"
echo   },
echo   "devDependencies": {
echo     "nodemon": "^3.0.2"
echo   }
echo }
) > package.json

echo ✅ package.json criado
timeout /t 1 /nobreak >nul

echo 📝 Criando módulos do Worker...

:: Criar index.js
echo Criando src/index.js...
(
echo const { createClient } = require('@supabase/supabase-js'^);
echo const { cloneRepository } = require('./cloner'^);
echo const { analyzeRepository } = require('./analyzer'^);
echo const { uploadResults } = require('./uploader'^);
echo const { logger } = require('./logger'^);
echo require('dotenv'^).config(^);
echo.
echo const supabase = createClient(
echo   process.env.SUPABASE_URL,
echo   process.env.SUPABASE_SERVICE_ROLE_KEY
echo ^);
echo.
echo async function main(^) {
echo   logger.info('Worker Local iniciado'^);
echo   logger.info('Monitorando jobs...'^);
echo.  
echo   while (true^) {
echo     try {
echo       const { data: jobs } = await supabase
echo         .from('worker_jobs'^)
echo         .select('*'^)
echo         .eq('status', 'pending'^)
echo         .limit(1^);
echo.
echo       if (jobs ^&^& jobs.length ^> 0^) {
echo         const job = jobs[0];
echo         logger.info(`Processando job ${job.id}`^);
echo.
echo         await supabase
echo           .from('worker_jobs'^)
echo           .update({ status: 'processing', started_at: new Date(^).toISOString(^) }^)
echo           .eq('id', job.id^);
echo.
echo         const repoPath = await cloneRepository(job.repository_url, job.repository_name, job.project_name^);
echo         const findings = await analyzeRepository(repoPath, job.config^);
echo         await uploadResults(job.batch_analysis_id, findings^);
echo.
echo         await supabase
echo           .from('worker_jobs'^)
echo           .update({ status: 'completed', completed_at: new Date(^).toISOString(^) }^)
echo           .eq('id', job.id^);
echo.
echo         logger.success(`Job ${job.id} concluído`^);
echo       }
echo.
echo       await new Promise(resolve =^> setTimeout(resolve, 5000^)^);
echo     } catch (error^) {
echo       logger.error('Erro no worker:', error^);
echo       await new Promise(resolve =^> setTimeout(resolve, 10000^)^);
echo     }
echo   }
echo }
echo.
echo main(^).catch(console.error^);
) > src\index.js

echo ✅ src/index.js criado

:: Criar cloner.js
echo Criando src/cloner.js...
(
echo const simpleGit = require('simple-git'^);
echo const path = require('path'^);
echo const { logger } = require('./logger'^);
echo.
echo async function cloneRepository(repoUrl, repoName, projectName^) {
echo   const projectDir = path.join('C:\\Projetos', projectName^);
echo   const repoDir = path.join(projectDir, repoName^);
echo.
echo   logger.info(`Clonando ${repoName} em ${repoDir}`^);
echo.
echo   const git = simpleGit(^);
echo   await git.clone(repoUrl, repoDir^);
echo.
echo   logger.success(`Repositório clonado: ${repoDir}`^);
echo   return repoDir;
echo }
echo.
echo module.exports = { cloneRepository };
) > src\cloner.js

echo ✅ src/cloner.js criado

:: Criar analyzer.js, uploader.js, logger.js
echo Criando módulos restantes...

(
echo const fs = require('fs'^).promises;
echo const path = require('path'^);
echo const { logger } = require('./logger'^);
echo.
echo async function analyzeRepository(repoPath, config^) {
echo   const findings = [];
echo   const cnpjRegex = /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/g;
echo.
echo   async function scanDirectory(dir^) {
echo     const entries = await fs.readdir(dir, { withFileTypes: true }^);
echo.
echo     for (const entry of entries^) {
echo       const fullPath = path.join(dir, entry.name^);
echo.
echo       if (entry.isDirectory(^)^) {
echo         await scanDirectory(fullPath^);
echo       } else {
echo         const ext = path.extname(entry.name^);
echo         if (config.allowedExtensions.includes(ext^)^) {
echo           const content = await fs.readFile(fullPath, 'utf8'^);
echo           const matches = content.match(cnpjRegex^);
echo.
echo           if (matches^) {
echo             matches.forEach(cnpj =^> {
echo               findings.push({
echo                 file: fullPath.replace(repoPath, ''^^),
echo                 cnpj: cnpj,
echo                 line: content.substring(0, content.indexOf(cnpj^)^).split('\n'^).length
echo               }^);
echo             }^);
echo           }
echo         }
echo       }
echo     }
echo   }
echo.
echo   await scanDirectory(repoPath^);
echo   logger.info(`Análise concluída: ${findings.length} ocorrências`^);
echo   return findings;
echo }
echo.
echo module.exports = { analyzeRepository };
) > src\analyzer.js

echo ✅ src/analyzer.js criado

(
echo const { createClient } = require('@supabase/supabase-js'^);
echo const { logger } = require('./logger'^);
echo require('dotenv'^).config(^);
echo.
echo const supabase = createClient(
echo   process.env.SUPABASE_URL,
echo   process.env.SUPABASE_SERVICE_ROLE_KEY
echo ^);
echo.
echo async function uploadResults(batchAnalysisId, findings^) {
echo   logger.info(`Enviando ${findings.length} resultados para o banco`^);
echo.
echo   const { error } = await supabase
echo     .from('findings'^)
echo     .insert(findings.map(f =^> ({
echo       batch_analysis_id: batchAnalysisId,
echo       file_path: f.file,
echo       cnpj: f.cnpj,
echo       line_number: f.line
echo     }^)^)^);
echo.
echo   if (error^) throw error;
echo   logger.success('Resultados enviados com sucesso'^);
echo }
echo.
echo module.exports = { uploadResults };
) > src\uploader.js

echo ✅ src/uploader.js criado

(
echo const chalk = require('chalk'^);
echo const fs = require('fs'^);
echo const path = require('path'^);
echo.
echo const logFile = path.join(__dirname, '..', 'logs', 'worker.log'^);
echo.
echo function log(level, message, data^) {
echo   const timestamp = new Date(^).toISOString(^);
echo   const logEntry = `[${timestamp}] [${level}] ${message}`;
echo.
echo   fs.appendFileSync(logFile, logEntry + '\n'^);
echo.
echo   if (level === 'ERROR'^) console.log(chalk.red(logEntry^)^);
echo   else if (level === 'SUCCESS'^) console.log(chalk.green(logEntry^)^);
echo   else if (level === 'INFO'^) console.log(chalk.blue(logEntry^)^);
echo   else console.log(logEntry^);
echo }
echo.
echo module.exports = {
echo   logger: {
echo     info: (msg, data^) =^> log('INFO', msg, data^),
echo     error: (msg, data^) =^> log('ERROR', msg, data^),
echo     success: (msg, data^) =^> log('SUCCESS', msg, data^)
echo   }
echo };
) > src\logger.js

echo ✅ src/logger.js criado
echo.
timeout /t 2 /nobreak >nul

:: Passo 4: Instalar dependências
echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║ PASSO 4/6: Instalando dependências do Node.js                             ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.
echo ⏳ Isso pode levar alguns minutos... Por favor, aguarde.
echo.

call npm install

if %errorLevel% neq 0 (
    color 0C
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)

echo.
echo ✅ Todas as dependências instaladas com sucesso
echo.
timeout /t 2 /nobreak >nul

:: Passo 5: Configurar credenciais
echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║ PASSO 5/6: Configuração de Credenciais                                    ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.

if exist ".env" (
    echo ⚠️  Arquivo .env já existe.
    echo.
    echo Deseja reconfigurar as credenciais? (S/N^)
    set /p reconfig=
    if /i not "%reconfig%"=="S" goto :skip_config
)

echo 📝 Por favor, forneça as seguintes informações:
echo.
echo 🔗 1. SUPABASE_URL
echo    (Exemplo: https://xxxxx.supabase.co^)
set /p SUPABASE_URL="   Digite a URL: "
echo.

echo 🔑 2. SUPABASE_SERVICE_ROLE_KEY
echo    (Chave de serviço do Supabase^)
set /p SUPABASE_KEY="   Digite a chave: "
echo.

echo 🔐 3. AZURE_DEVOPS_PAT (opcional^)
set /p AZURE_PAT="   Digite o token: "
echo.

:: Criar arquivo .env
(
echo # Configuração do Worker Local
echo # Gerado automaticamente em %date% %time%
echo.
echo SUPABASE_URL=%SUPABASE_URL%
echo SUPABASE_SERVICE_ROLE_KEY=%SUPABASE_KEY%
echo AZURE_DEVOPS_PAT=%AZURE_PAT%
echo PROJECTS_DIR=C:\Projetos
echo LOG_LEVEL=info
) > .env

echo ✅ Credenciais salvas em .env
echo.

:skip_config
timeout /t 2 /nobreak >nul

:: Passo 6: Criar atalhos
echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║ PASSO 6/6: Criando atalhos e finalizando                                  ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.

:: Criar script de inicialização
echo Criando script de inicialização...
(
echo @echo off
echo title Worker Local - Análise de Repositórios
echo color 0A
echo cd /d "C:\WorkerLocal"
echo echo Iniciando Worker Local...
echo echo.
echo node src/index.js
echo pause
) > INICIAR-WORKER.bat

echo ✅ Script INICIAR-WORKER.bat criado
echo.

:: Criar atalho na área de trabalho
set "DESKTOP=%USERPROFILE%\Desktop"
echo Deseja criar atalho na Área de Trabalho? (S/N^)
set /p create_shortcut=
if /i "%create_shortcut%"=="S" (
    copy "INICIAR-WORKER.bat" "%DESKTOP%\Worker Local.bat" >nul
    echo ✅ Atalho criado na Área de Trabalho
)

echo.
timeout /t 2 /nobreak >nul

:: Conclusão
cls
color 0A
echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                            ║
echo ║                    ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO! ✅                 ║
echo ║                                                                            ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.
echo 📂 Localização: %INSTALL_DIR%
echo 📁 Projetos serão clonados em: %PROJECTS_DIR%
echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║ PRÓXIMOS PASSOS:                                                           ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.
echo 1️⃣  Para iniciar o Worker, execute:
echo    📌 Duplo clique em: Worker Local.bat (Área de Trabalho^)
echo    OU
echo    📌 Execute: C:\WorkerLocal\INICIAR-WORKER.bat
echo.
echo 2️⃣  No sistema web, selecione "Análise Local" ao criar nova análise
echo.
echo 3️⃣  Logs disponíveis em: %INSTALL_DIR%\logs\worker.log
echo.
echo ╔════════════════════════════════════════════════════════════════════════════╗
echo ║ SUPORTE:                                                                   ║
echo ╚════════════════════════════════════════════════════════════════════════════╝
echo.
echo 📖 Documentação: %INSTALL_DIR%\README.md
echo 💬 Em caso de problemas, verifique os logs
echo.
echo Deseja iniciar o Worker agora? (S/N^)
set /p start_now=
if /i "%start_now%"=="S" (
    start cmd /k "%INSTALL_DIR%\INICIAR-WORKER.bat"
)
echo.
echo Pressione qualquer tecla para finalizar...
pause >nul
exit /b 0
