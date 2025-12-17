@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ============================================
:: INSTALADOR AUTOMATICO DO WORKER LOCAL
:: Versao: 2.0 - Ultra Simplificado
:: ============================================

title Instalador Worker Local - Configuracao Automatica
color 0A

echo.
echo ============================================================
echo.
echo     INSTALADOR AUTOMATICO DO WORKER LOCAL v2.0
echo     Sistema de Analise de Repositorios
echo.
echo ============================================================
echo.
echo [INFO] Iniciando instalacao automatica...
echo.

:: ============================================
:: PASSO 1: Verificar Node.js
:: ============================================
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js primeiro:
    echo https://nodejs.org/
    echo.
    echo Apos instalar, execute este instalador novamente.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js instalado: %NODE_VERSION%
echo.

:: ============================================
:: PASSO 2: Criar estrutura de pastas
:: ============================================
echo [2/5] Criando estrutura de pastas...

set WORKER_DIR=C:\WorkerLocal
set PROJECTS_DIR=C:\Projetos

if not exist "%WORKER_DIR%" (
    mkdir "%WORKER_DIR%"
    echo [OK] Pasta criada: %WORKER_DIR%
) else (
    echo [OK] Pasta ja existe: %WORKER_DIR%
)

if not exist "%PROJECTS_DIR%" (
    mkdir "%PROJECTS_DIR%"
    echo [OK] Pasta criada: %PROJECTS_DIR%
) else (
    echo [OK] Pasta ja existe: %PROJECTS_DIR%
)
echo.

:: ============================================
:: PASSO 3: Criar arquivos do worker
:: ============================================
echo [3/5] Criando arquivos do worker...

cd /d "%WORKER_DIR%"

:: Criar package.json
echo [INFO] Criando package.json...
(
echo {
echo   "name": "worker-local-cnpj",
echo   "version": "2.0.0",
echo   "description": "Worker local para analise de repositorios",
echo   "main": "src/index.js",
echo   "type": "module",
echo   "scripts": {
echo     "start": "node src/index.js"
echo   },
echo   "dependencies": {
echo     "@supabase/supabase-js": "^2.39.0",
echo     "simple-git": "^3.22.0",
echo     "dotenv": "^16.3.1"
echo   }
echo }
) > package.json

:: Criar estrutura de pastas do codigo
if not exist src mkdir src
if not exist logs mkdir logs

:: Criar index.js
echo [INFO] Criando src/index.js...
(
echo import { createClient } from '@supabase/supabase-js'
echo import simpleGit from 'simple-git'
echo import dotenv from 'dotenv'
echo import fs from 'fs'
echo import path from 'path'
echo.
echo dotenv.config^(^)
echo.
echo const supabase = createClient^(
echo   process.env.SUPABASE_URL,
echo   process.env.SUPABASE_SERVICE_ROLE_KEY
echo ^)
echo.
echo console.log^('[Worker] Iniciando worker local...'^^)
echo console.log^('[Worker] Aguardando jobs...'^^)
echo.
echo setInterval^(async ^(^) =^> {
echo   console.log^('[Worker] Checando por novos jobs...'^^)
echo }, 5000^)
) > src\index.js

:: Criar arquivo .env vazio
echo [INFO] Criando arquivo .env...
if not exist .env (
    (
    echo # Configure suas credenciais aqui
    echo SUPABASE_URL=sua_url_aqui
    echo SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
    echo AZURE_DEVOPS_PAT=seu_token_aqui
    ) > .env
)

echo [OK] Arquivos criados com sucesso!
echo.

:: ============================================
:: PASSO 4: Instalar dependencias
:: ============================================
echo [4/5] Instalando dependencias do Node.js...
echo [INFO] Isso pode levar alguns minutos...
echo.

set LOG_FILE=%WORKER_DIR%\logs\instalacao.log
if not exist "%WORKER_DIR%\logs" mkdir "%WORKER_DIR%\logs"

echo [LOG] Iniciando instalacao em %date% %time% > "%LOG_FILE%"
echo [LOG] Node.js Version: %NODE_VERSION% >> "%LOG_FILE%"

call npm install --loglevel=error >> "%LOG_FILE%" 2>&1

if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias! >> "%LOG_FILE%"
    echo [ERRO] Falha ao instalar dependencias!
    echo [ERRO] Verifique o log em: %LOG_FILE%
    pause
    exit /b 1
)

echo [LOG] Instalacao concluida com sucesso >> "%LOG_FILE%"
echo [OK] Dependencias instaladas com sucesso!
echo.

:: ============================================
:: PASSO 5: Configuracao final
:: ============================================
echo [5/5] Configuracao final...

echo [INFO] Iniciando worker automaticamente...
start "Worker Local" cmd /k "cd /d %WORKER_DIR% && npm start"

echo.
echo ============================================================
echo.
echo     OK - INSTALACAO CONCLUIDA COM SUCESSO!
echo.
echo ============================================================
echo.
echo [INFO] Proximos passos:
echo.
echo 1. Configure o arquivo .env com suas credenciais
echo    Local: %WORKER_DIR%\.env
echo.
echo 2. Aguarde o indicador ficar verde no sistema
echo.
echo Obrigado por usar o Worker Local!
echo.
pause
