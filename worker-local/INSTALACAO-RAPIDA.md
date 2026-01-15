# Instalação Rápida do Worker Local

## Método 1: Script Automático (Recomendado)

1. Abra o PowerShell como Administrador
2. Navegue até onde baixou os arquivos
3. Execute:
\`\`\`powershell
.\install-worker.ps1
\`\`\`

## Método 2: Download do v0

1. No chat do v0, clique nos **3 pontinhos** (canto superior direito)
2. Clique em **"Download ZIP"**
3. Extraia o arquivo ZIP
4. Copie a pasta `worker-local` para `C:\Users\klebe\`
5. Continue com os passos abaixo

## Configuração Final

Depois de instalar por qualquer método:

\`\`\`powershell
# 1. Entre na pasta
cd C:\Users\klebe\worker-local

# 2. Configure o .env
copy .env.example .env
notepad .env

# 3. Adicione suas credenciais no .env:
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-aqui

# 4. Instale dependências
npm install

# 5. Inicie o worker
npm start
\`\`\`

## Onde encontrar as credenciais?

**Supabase:**
- Vá para o dashboard do projeto
- Settings → API
- Copie a URL e Service Role Key

**Azure PAT (opcional):**
- Azure DevOps → User Settings → Personal Access Tokens
- Create new token com permissões de "Code (Read)"

## Verificando se está funcionando

Você verá no console:
\`\`\`
[SUCCESS] Worker registrado com sucesso
[SUCCESS] Worker rodando! Aguardando jobs...
\`\`\`

E no dashboard web o indicador ficará verde: **Worker Online**
