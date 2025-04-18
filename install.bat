@echo off
echo Iniciando instalacao do ZapClick...

REM Verifica Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js nao encontrado. Por favor, instale o Node.js primeiro.
    exit /b 1
)

REM Verifica npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo npm nao encontrado. Por favor, instale o npm primeiro.
    exit /b 1
)

REM Verifica MongoDB
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo MongoDB nao encontrado. Por favor, instale o MongoDB primeiro.
    exit /b 1
)

echo Instalando dependencias...
call npm install

echo Configurando ambiente...
if not exist .env (
    copy .env.example .env
    echo Arquivo .env criado. Por favor, configure as variaveis de ambiente.
)

REM Cria diretórios necessários
echo Criando diretorios...
if not exist logs mkdir logs
if not exist .wwebjs_auth mkdir .wwebjs_auth
if not exist public\uploads mkdir public\uploads

echo Iniciando banco de dados...
start /B mongod

echo Instalacao concluida!
echo Para iniciar o servidor, execute: npm run dev
echo Acesse: http://localhost:3000
echo Leia o arquivo ENTREGA.md para mais informacoes.
pause 