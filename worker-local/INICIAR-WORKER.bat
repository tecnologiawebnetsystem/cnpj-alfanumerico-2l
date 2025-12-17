@echo off
chcp 65001 >nul
title Worker CNPJ - Inicializando...
color 0A

echo.
echo ================================================
echo      WORKER LOCAL - ANALISE DE CNPJ
echo ================================================
echo.

echo [ETAPA 1/4] Verificando Node.js...
where node >nul 2>&1
if errorlevel 1 (
    color 0C
    echo ERRO: Node.js nao encontrado!
    echo.
    echo Instale em: https://nodejs.org
    pause
    exit /b 1
)
echo OK: Node.js encontrado!

echo.
echo [ETAPA 2/4] Criando pasta de projetos...
if not exist "C:\Projetos" mkdir "C:\Projetos"
echo OK: Pasta C:\Projetos criada!

echo.
echo [ETAPA 3/4] Instalando dependencias...
call npm install --silent
if errorlevel 1 (
    color 0C
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)
echo OK: Dependencias instaladas!

echo.
echo [ETAPA 4/4] Verificando configuracao...
if not exist ".env" (
    echo Criando arquivo .env...
    copy .env.example .env
    echo.
    echo ATENCAO: Configure as credenciais no arquivo .env
    echo.
    pause
    notepad .env
)

cls
color 0A
echo.
echo ================================================
echo      WORKER INICIADO COM SUCESSO!
echo ================================================
echo.
echo Status: ONLINE
echo Projetos: C:\Projetos
echo Aguardando analises...
echo.
echo NAO FECHE ESTA JANELA!
echo.

npm start
