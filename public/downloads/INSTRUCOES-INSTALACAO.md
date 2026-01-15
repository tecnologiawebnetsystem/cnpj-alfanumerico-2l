# Como Instalar o Worker Local

## Passo a Passo Super Simples

### 1. Baixar o Instalador
- Clique no botão verde "Baixar Instalador Automático"
- Salve o arquivo `INSTALAR-WORKER-AUTOMATICO.bat` na sua área de trabalho

### 2. Executar o Instalador
- Clique com o botão DIREITO no arquivo baixado
- Escolha **"Executar como administrador"**
- Clique em **"Sim"** quando o Windows perguntar

### 3. Aguardar a Instalação
O instalador vai fazer TUDO sozinho:
- ✅ Verificar se Node.js está instalado
- ✅ Criar pasta C:\WorkerLocal
- ✅ Criar pasta C:\Projetos
- ✅ Baixar todas as dependências
- ✅ Pedir as credenciais do Supabase

### 4. Configurar Credenciais
Quando o instalador pedir, você precisa fornecer 2 informações:

**SUPABASE_URL:**
\`\`\`
Encontre em: Dashboard → Configurações → Vars
Exemplo: https://xxxxx.supabase.co
\`\`\`

**SUPABASE_SERVICE_ROLE_KEY:**
\`\`\`
Encontre em: Dashboard → Configurações → Vars
Exemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### 5. Pronto!
Quando ver a mensagem "INSTALAÇÃO CONCLUÍDA COM SUCESSO!", o worker está pronto.

## Como Saber se Funcionou?

### ✅ Sinais de Sucesso:
1. Pasta `C:\WorkerLocal` foi criada
2. Pasta `C:\Projetos` foi criada
3. Arquivo `INICIAR-WORKER.bat` existe em C:\WorkerLocal
4. Indicador verde aparece no dashboard

### ❌ Se Deu Erro:
1. Verifique se o Node.js está instalado
2. Execute como administrador
3. Verifique as credenciais do Supabase
4. Veja o log em: `C:\WorkerLocal\logs\instalacao.log`

## Como Usar Depois de Instalado?

### Iniciar o Worker:
1. Vá em `C:\WorkerLocal`
2. Clique duas vezes em `INICIAR-WORKER.bat`
3. Deixe a janela aberta
4. O indicador no dashboard ficará verde

### Parar o Worker:
- Feche a janela do terminal

## Precisa de Ajuda?

Acesse no sistema:
- Menu → Wiki → Guia para Iniciantes
- Menu → Worker Status → Ver Detalhes
